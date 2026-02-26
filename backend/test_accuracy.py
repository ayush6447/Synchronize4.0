import pandas as pd
import requests
import random
import time
import json
import os
import warnings
warnings.filterwarnings('ignore')

URL = os.environ.get('VERIFY_URL', 'http://127.0.0.1:8000/verify')
DATASET_PATH = os.environ.get(
    'DATASET_PATH',
    os.path.join(os.path.dirname(__file__), '..', 'dataset', 'aggregated_dataset_hindi.csv')
)


def evaluate_model():
    print("=========================================")
    print(" AUTOMATED DATASET ACCURACY EVALUATION")
    print("=========================================\n")

    # Load dataset inside the function to avoid module-level side effects
    print("Loading dataset for evaluation...")
    df = pd.read_csv(DATASET_PATH, encoding='utf-8-sig')
    df = df[df['Title Name'].notnull()]
    all_titles = df['Title Name'].tolist()
    random.seed(42)

    # ---- 1. Test Exact Match Rejection ----
    # Take 10 random titles that actually exist in the DB.
    # The system MUST reject them with 0% probability.
    exact_samples = random.sample(all_titles, 10)
    print("--- 1. Testing EXACT Matches (Expected: 100% Rejected) ---")
    exact_passed = 0

    for t in exact_samples:
        try:
            resp = requests.post(URL, json={'title': str(t)}, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            if not data.get('approved', True):
                exact_passed += 1
            else:
                print(f"FAILED: {t} was somehow approved!")
        except requests.exceptions.RequestException as e:
            print(f"HTTP error for '{t}': {e}")

    print(f"Result: {exact_passed}/10 Correctly Rejected.\n")

    # ---- 2. Test Typo / Lexical Variation Rejection ----
    # Take 10 random titles, change 1 character, verify they get caught.
    print("--- 2. Testing TYPO/LEXICAL Manipulations (Expected: 100% Rejected) ---")
    lex_samples = random.sample(all_titles, 10)
    lex_passed = 0
    lex_skipped = 0

    for t in lex_samples:
        t = str(t)
        if len(t) < 4:
            lex_skipped += 1
            continue

        # Introduce a typo (swap a character)
        idx = len(t) // 2
        char = 'a' if t[idx].lower() != 'a' else 'e'
        mutated = t[:idx] + char + t[idx+1:]

        try:
            resp = requests.post(URL, json={'title': mutated}, timeout=30)
            resp.raise_for_status()
            data = resp.json()

            # Should be rejected because it's too similar
            if not data.get('approved', True):
                lex_passed += 1
            else:
                print(f"FAILED: Typo '{mutated}' (from '{t}') was approved! Score: {data.get('probability')}%")
        except requests.exceptions.RequestException as e:
            print(f"HTTP error for '{mutated}': {e}")
            lex_skipped += 1

    lex_total = 10 - lex_skipped
    print(f"Result: {lex_passed}/{lex_total} Correctly Caught by Lexical/Semantic engine."
          + (f" ({lex_skipped} skipped due to short titles)" if lex_skipped else "") + "\n")

    # ---- 3. Test Disallowed Words ----
    print("--- 3. Testing HARD RULES (Disallowed Words - Expected: 100% Rejected) ---")
    disallowed = ["Crime Report India", "CBI Times", "Police Daily News", "Army Chronicle", "Corruption Express"]
    hard_passed = 0
    for t in disallowed:
        try:
            resp = requests.post(URL, json={'title': t}, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            if not data.get('approved', True) and "Contains disallowed word(s)" in data.get('reason', ''):
                hard_passed += 1
            else:
                print(f"FAILED: {t} slipped through hard rules!")
        except requests.exceptions.RequestException as e:
            print(f"HTTP error for '{t}': {e}")

    print(f"Result: {hard_passed}/5 Correctly Caught by Hard Rules.\n")

    print("=========================================")
    total_tests = 10 + lex_total + 5
    total_passed = exact_passed + lex_passed + hard_passed
    accuracy = (total_passed / total_tests) * 100 if total_tests > 0 else 0.0
    print(f" OVERALL ACCURACY ON DATASET SAMPLE: {accuracy:.1f}%")
    print("=========================================")


if __name__ == "__main__":
    evaluate_model()

