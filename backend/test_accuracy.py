import pandas as pd
import requests
import random
import time
import json
import warnings
warnings.filterwarnings('ignore')

URL = 'http://127.0.0.1:8000/verify'
DATASET_PATH = r'l:\Synchronize4.0\dataset\aggregated_dataset_hindi.csv'

print("Loading dataset for evaluation...")
df = pd.read_csv(DATASET_PATH, encoding='utf-8-sig')
df = df[df['Title Name'].notnull()]
all_titles = df['Title Name'].tolist()
random.seed(42)

def evaluate_model():
    print("=========================================")
    print(" AUTOMATED DATASET ACCURACY EVALUATION")
    print("=========================================\n")
    
    # 1. Test Exact Match Rejection
    # We take 20 random titles that actually exist in the DB.
    # The system MUST reject them with 0% probability.
    exact_samples = random.sample(all_titles, 10)
    print("--- 1. Testing EXACT Matches (Expected: 100% Rejected) ---")
    exact_passed = 0
    
    for t in exact_samples:
        resp = requests.post(URL, json={'title': str(t)})
        data = resp.json()
        if not data['approved']:
            exact_passed += 1
        else:
            print(f"FAILED: {t} was somehow approved!")
            
    print(f"Result: {exact_passed}/10 Correctly Rejected.\n")
    
    # 2. Test Typo / Lexical Variation Rejection
    # We take 10 random titles, change 1 or 2 characters, and verify they get caught by Lexical Matching.
    print("--- 2. Testing TYPO/LEXICAL Manipulations (Expected: 100% Rejected) ---")
    lex_samples = random.sample(all_titles, 10)
    lex_passed = 0
    
    for t in lex_samples:
        t = str(t)
        if len(t) < 4: continue
        
        # Introduce a typo (swap a character)
        idx = len(t) // 2
        char = 'a' if t[idx].lower() != 'a' else 'e'
        mutated = t[:idx] + char + t[idx+1:]
        
        resp = requests.post(URL, json={'title': mutated})
        data = resp.json()
        
        # Should be rejected because it's too similar
        if not data['approved']:
            lex_passed += 1
        else:
            print(f"FAILED: Typo '{mutated}' (from '{t}') was approved! Score: {data['probability']}%")
            
    print(f"Result: {lex_passed}/10 Correctly Caught by Lexical/Semantic engine.\n")
    
    
    # 3. Test Disallowed Words
    print("--- 3. Testing HARD RULES (Disallowed Words - Expected: 100% Rejected) ---")
    disallowed = ["Crime Report India", "CBI Times", "Police Daily News", "Army Chronicle", "Corruption Express"]
    hard_passed = 0
    for t in disallowed:
        resp = requests.post(URL, json={'title': t})
        data = resp.json()
        if not data['approved'] and "Contains disallowed word(s)" in data['reason']:
            hard_passed += 1
        else:
            print(f"FAILED: {t} slipped through hard rules!")
            
    print(f"Result: {hard_passed}/5 Correctly Caught by Hard Rules.\n")
    
    print("=========================================")
    total_tests = 10 + 10 + 5
    total_passed = exact_passed + lex_passed + hard_passed
    accuracy = (total_passed / total_tests) * 100
    print(f" OVERALL ACCURACY ON DATASET SAMPLE: {accuracy:.1f}%")
    print("=========================================")
    
if __name__ == "__main__":
    evaluate_model()
