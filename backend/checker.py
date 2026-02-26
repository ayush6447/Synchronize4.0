import re
import jellyfish
from thefuzz import fuzz
import faiss
import pickle
import numpy as np
import os
from sentence_transformers import SentenceTransformer

INDEX_DIR = r"l:\Synchronize4.0\backend\index"

class TitleChecker:
    def __init__(self):
        # Load FAISS index
        faiss_path = os.path.join(INDEX_DIR, "titles.index")
        if os.path.exists(faiss_path):
            self.index = faiss.read_index(faiss_path)
        else:
            self.index = None
            print("WARNING: FAISS index not found. Run build_index.py first.")
            
        # Load Metadata
        meta_path = os.path.join(INDEX_DIR, "metadata.pkl")
        if os.path.exists(meta_path):
            with open(meta_path, 'rb') as f:
                self.metadata = pickle.load(f)
        else:
            self.metadata = []
            
        # Extract purely sets for ultra-fast lookup
        self.existing_titles_set = {str(m['Title Name']).lower() for m in self.metadata}
        self.existing_hindi_set = {str(m['Hindi Title']) for m in self.metadata if m['Hindi Title']}
        
        # Load Transformer model for online inference
        self.model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
        
        # Hard rules definitions
        self.disallowed_words = {"police", "crime", "corruption", "cbi", "cid", "army"}
        self.periodicity_words = {"daily", "weekly", "monthly", "fortnightly", "annual"}
        self.common_prefixes = {"the", "india", "samachar", "news", "times", "journal"}

    def check_stage_a_hard_rules(self, title: str):
        """
        Stage A: Hard Rule Validation
        Return format: (passed: bool, reason: str)
        """
        title_words = set(re.findall(r'\b\w+\b', title.lower()))
        
        # 1. Disallowed words
        intersection = self.disallowed_words.intersection(title_words)
        if intersection:
            return False, f"Contains disallowed word(s): {', '.join(intersection)}"
            
        # 2. Periodicity manipulation
        # Example check: if title minus periodicity word is an existing title
        title_stripped = title.lower()
        for p in self.periodicity_words:
            title_stripped = re.sub(rf'\b{p}\b', '', title_stripped).strip()
        
        # Collapse multiple spaces
        title_stripped = re.sub(r'\s+', ' ', title_stripped)
        if title_stripped != title.lower() and title_stripped in self.existing_titles_set:
            return False, f"Periodicity manipulation detected on existing title '{title_stripped}'"
            
        # 3. Combination of two existing titles
        # Very simple check: does title exactly match "ExistingA ExistingB"?
        # This is a heuristic. A robust implementation would use dynamic programming/trie, 
        # but for demonstration we check if it can be split into two existing titles.
        tokens = title.lower().split()
        if len(tokens) >= 2:
            for i in range(1, len(tokens)):
                left = " ".join(tokens[:i])
                right = " ".join(tokens[i:])
                if left in self.existing_titles_set and right in self.existing_titles_set:
                    return False, f"Combination of two existing titles '{left}' and '{right}'"

        # 4. Prefix / Suffix manipulation
        base_name = title.lower()
        for prefix in self.common_prefixes:
            if base_name.startswith(f"{prefix} "):
                base_name = base_name[len(prefix)+1:].strip()
            if base_name.endswith(f" {prefix}"):
                base_name = base_name[:-len(prefix)-1].strip()
        if base_name != title.lower() and base_name in self.existing_titles_set:
            return False, f"Prefix/Suffix manipulation on existing base name '{base_name}'"

        return True, "Passed Hard Rules"

    def check_stage_b_lexical_phonetic(self, title: str):
        """
        Stage B: Lexical & Phonetic Similarity
        Returns max score (0-100) and reason
        """
        from rapidfuzz import process, fuzz as rfuzz
        title_lower = title.lower()
        
        # Exact match
        if title_lower in self.existing_titles_set:
            return 100, "Exact match found"
            
        # Very fast Levenshtein comparison across all existing titles
        # process.extractOne uses heavily optimized C++ under the hood.
        best_match = process.extractOne(
            title_lower, 
            self.existing_titles_set, 
            scorer=rfuzz.ratio,
            score_cutoff=75  # Tuned up from 60: must be highly lexically similar to flag
        )
        
        if best_match:
            match_str, score, _ = best_match
            reason = f"Lexically very similar to '{match_str.title()}'"
            return round(score, 2), reason
            
        return 0, "No strong lexical matches"

    def check_stage_c_semantic(self, title: str, hindi_title: str = ""):
        """
        Stage C: Semantic & Conceptual Similarity
        Uses FAISS for ultra-fast cosine similarity lookups.
        Returns max score (0-100), reason, and Top-K matches list.
        """
        if self.index is None:
            return 0, "FAISS index unavailable", []
            
        combined_query = f"{title} | {hindi_title}".strip(" |")
        
        # Encode and normalize for cosine similarity
        embedding = self.model.encode([combined_query], convert_to_numpy=True)
        faiss.normalize_L2(embedding)
        
        # Search top 5
        k = 5
        distances, indices = self.index.search(embedding, k)
        
        top_score = 0
        top_reason = ""
        top_k_matches = []
        
        for i in range(k):
            idx = indices[0][i]
            raw_score = float(distances[0][i]) * 100  # Raw Cosine similarity to percentage
            
            # Non-linear tuning for MiniLM density:
            # MiniLM naturally clusters even unrelated text around 40-50%. 
            # A raw 60% is actually weak. A raw 85%+ is strong.
            # We apply a penalty to drastically lower weak matches so novel titles can pass.
            if raw_score <= 65:
                score = raw_score * 0.5  # Heavy penalty for weak clusters
            elif raw_score <= 80:
                score = raw_score * 0.8  # Moderate penalty
            else:
                score = raw_score        # Keep high matches intact
                
            if idx != -1:
                match_meta = self.metadata[idx]
                top_k_matches.append({
                    "title": match_meta['Title Name'],
                    "score": round(score, 2),
                    "stage": "Semantic FAISS"
                })
                if score > top_score:
                    top_score = score
                    top_reason = f"Conceptually similar to '{match_meta['Title Name']}'"
                
        return top_score, top_reason or "No semantic matches found", top_k_matches

    def verify(self, title: str, hindi_title: str = ""):
        """
        Overall Verification Logic (Stage D)
        """
        # A: Hard Rules
        hard_pass, hard_reason = self.check_stage_a_hard_rules(title)
        if not hard_pass:
            return {
                "probability": 0, 
                "confidence_bucket": "High Risk",
                "approved": False, 
                "reason": hard_reason, 
                "stages": {"A": hard_reason},
                "top_k_matches": [],
                "suggestions": self.generate_smart_suggestions(title)
            }
            
        # B: Lexical / Phonetic
        lex_score, lex_reason = self.check_stage_b_lexical_phonetic(title)
        if lex_score == 100:
            return {
                "probability": 0, 
                "confidence_bucket": "High Risk",
                "approved": False, 
                "reason": lex_reason, 
                "stages": {"B": lex_reason},
                "top_k_matches": [{"title": title, "score": 100, "stage": "Exact Match"}],
                "suggestions": self.generate_smart_suggestions(title)
            }
            
        # C: Semantic
        sem_score, sem_reason, top_k_matches = self.check_stage_c_semantic(title, hindi_title)
        
        # D: Final Scoring
        # S_max = highest similarity (0 to 100)
        s_max = max(lex_score, sem_score)
        
        # Determine approval threshold
        # We need the probability of being unique/safe.
        probability = max(0, 100 - s_max)
        
        # Tuned logic for real-world PRGI registry data (high noise floor of generic English/Hindi journalism words)
        # Therefore, we only want to reject titles that are > 75% conceptually identical
        if probability <= 25:
            confidence_bucket = "High Risk"
            approved = False
        elif probability <= 40:
            confidence_bucket = "Needs Review"
            approved = False # Require manual review for 26-40
        else:
            confidence_bucket = "Likely Acceptable"
            approved = True
        
        primary_reason = "Title appears unique and compliant."
        if not approved:
             if lex_score > sem_score:
                  primary_reason = lex_reason
             else:
                  primary_reason = sem_reason
                  
        # If Lexical hit high, inject it into top_K
        if lex_score > 60:
             # Extract the name from reason (e.g. Lexically very similar to 'Name')
             import re
             m = re.search(r"'(.*?)'", lex_reason)
             if m:
                 top_k_matches.insert(0, {"title": m.group(1), "score": lex_score, "stage": "Lexical Proxy"})

        # Determine Concept Tags
        tags = self.assign_concept_tags(title)

        return {
            "probability": round(probability, 2),
            "confidence_bucket": confidence_bucket,
            "approved": approved,
            "reason": primary_reason,
            "stages": {
                "A": hard_reason,
                "B": f"{lex_reason} (Score: {lex_score}%)",
                "C": f"{sem_reason} (Score: {sem_score:.2f}%)"
            },
            "s_max": round(s_max, 2),
            "top_k_matches": top_k_matches[:5], # limit to 5
            "tags": tags,
            "suggestions": self.generate_smart_suggestions(title) if not approved else []
        }

    def assign_concept_tags(self, title: str):
        """
        Enterprise Governance: Automatically categorize the title based on domain keywords.
        """
        title_lower = title.lower()
        tags = set()
        
        categories = {
            "Daily News": ["daily", "today", "aaj", "roj", "din"],
            "Regional": ["state", "district", "city", "nadu", "pradesh", "desam"],
            "Business": ["business", "finance", "trade", "vyapar", "market"],
            "Evening/Morning": ["evening", "morning", "dawn", "sandhya", "prabhat"],
            "Journalism": ["news", "samachar", "khabar", "times", "chronicle", "journal", "gazette", "post", "bulletin", "express", "observer", "tribune"]
        }
        
        for category, keywords in categories.items():
            if any(re.search(rf'\b{kw}\b', title_lower) for kw in keywords):
                tags.add(category)
                
        if not tags:
            tags.add("General Public")
            
        return list(tags)

    def generate_smart_suggestions(self, title: str):
        import re, random
        suggestions = []
        safe_suffixes = ["Times", "Chronicle", "Daily", "Voice", "Journal", "Tribune", "Observer", "Post", "Bulletin", "Express", "News"]
        
        base_title = title.title()
        # Remove any hardcoded disallowed words from base
        for dw in self.disallowed_words:
            base_title = re.compile(r'\b' + re.escape(dw) + r'\b', re.IGNORECASE).sub("", base_title).strip()
            
        if not base_title: 
            return ["National Gazette", "The Civic Tribune", "India Journal"]
            
        for suf in random.sample(safe_suffixes, len(safe_suffixes)):
            cand = f"{base_title} {suf}".strip()
            # Double spaces cleanup
            cand = re.sub(r'\s+', ' ', cand)
            if cand.lower() not in self.existing_titles_set:
                suggestions.append(cand)
                if len(suggestions) >= 3:
                     break
        return suggestions
