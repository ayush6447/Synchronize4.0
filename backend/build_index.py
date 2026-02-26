import pandas as pd
import numpy as np
import faiss
import pickle
import os
import time
import jellyfish
from sentence_transformers import SentenceTransformer

# Paths — can be overridden via environment variables for portability
DATASET_PATH = os.environ.get(
    "DATASET_PATH",
    os.path.join(os.path.dirname(__file__), "..", "dataset", "aggregated_dataset_hindi.csv")
)
INDEX_DIR = os.environ.get("INDEX_DIR", os.path.join(os.path.dirname(__file__), "index"))
MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"

def compute_phonetic(text):
    if pd.isna(text): return ""
    return jellyfish.metaphone(str(text))

def build_index():
    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH, encoding='utf-8-sig')

    # Validate required columns before processing
    required_cols = {'Title Name', 'Hindi Title', 'Periodity'}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Dataset is missing required column(s): {missing}")

    # Cleaning
    print(f"Initial rows: {len(df)}")
    df['Title Name'] = df['Title Name'].fillna('').astype(str).str.strip().str.lower()
    df['Hindi Title'] = df['Hindi Title'].fillna('').astype(str).str.strip()
    
    # We drop empty English titles
    df = df[df['Title Name'] != ""]
    df = df.reset_index(drop=True)
    print(f"Cleaned rows: {len(df)}")
    
    print("Pre-computing Phonetic representations (Metaphone)...")
    df['Phonetic_English'] = df['Title Name'].apply(compute_phonetic)
    
    print(f"Loading SentenceTransformer model: {MODEL_NAME} ...")
    model = SentenceTransformer(MODEL_NAME)
    
    # We embed a combination of English and Hindi for maximum semantic overlap
    print("Encoding texts...")
    t0 = time.time()
    # "title | hindi_title" provides context to the multilingual model
    combined_texts = df['Title Name'] + " | " + df['Hindi Title']
    embeddings = model.encode(combined_texts.tolist(), show_progress_bar=True, convert_to_numpy=True)
    print(f"Encoded {len(embeddings)} titles in {time.time() - t0:.2f} seconds.")
    
    print("Building FAISS index...")
    dimension = embeddings.shape[1]
    
    # Use L2 normalized + Inner Product (Cosine Similarity)
    faiss.normalize_L2(embeddings)
    index = faiss.IndexFlatIP(dimension) 
    index.add(embeddings)
    
    os.makedirs(INDEX_DIR, exist_ok=True)
    
    faiss_path = os.path.join(INDEX_DIR, "titles.index")
    faiss.write_index(index, faiss_path)
    print(f"Saved FAISS index to {faiss_path}")
    
    # Save the metadata so when we get index 'i', we know the title
    metadata = df[['Title Name', 'Hindi Title', 'Phonetic_English', 'Periodity']].to_dict(orient='records')
    meta_path = os.path.join(INDEX_DIR, "metadata.pkl")
    with open(meta_path, 'wb') as f:
        pickle.dump(metadata, f)
    print(f"Saved metadata to {meta_path}")
    
    print("Index build complete!")

if __name__ == "__main__":
    build_index()
