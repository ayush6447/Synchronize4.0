# PRGI Title Verification System — Technical Documentation

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Validation Pipeline](#2-validation-pipeline)
3. [API Reference](#3-api-reference)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Blockchain Integration](#6-blockchain-integration)
7. [Enterprise Governance](#7-enterprise-governance)
8. [Running the System](#8-running-the-system)
9. [Testing & Accuracy](#9-testing--accuracy)
10. [Known Configurations & Tuning](#10-known-configurations--tuning)

---

## 1. System Overview

The PRGI Title Verification System is an AI-powered compliance engine that validates new publication title applications against the Government of India's Registrar of Newspapers (PRGI) database.

### Core Requirements Implemented

1. **Probability Formula:** `Verification Probability = 100% - S_max%`  
   Where `S_max` is the highest similarity score found across all pipeline stages.

2. **Multi-Stage Rejection:** Rejects titles that are too similar to existing ones, contain disallowed words, combine existing titles, or share similar meanings in other languages.

3. **Application Tracking:** Newly approved titles are immediately added to the in-memory registry — subsequent identical or near-identical submissions by other users are automatically rejected.

---

## 2. Validation Pipeline

### Stage A — Hard Rule Compliance (`checker.py → check_stage_a_hard_rules`)

A deterministic rule engine. If any rule is violated, the title is **immediately rejected with 0% probability**.

| Rule | Description | Example |
|---|---|---|
| Disallowed Words | Words prohibited by PRGI regulation | `Police`, `Crime`, `CBI`, `CID`, `Army`, `Corruption` |
| Periodicity Manipulation | Stripping periodicity suffixes reveals an existing title | `Jan Jagran Times Daily` → strips `Daily` → matches `Jan Jagran Times` |
| Combination Check | Title is a concatenation of two existing titles | `"India News" + "Times Daily"` |
| Prefix/Suffix Manipulation | Adding/removing a common prefix to an existing title | `"The Jan Jagran Times"` → strips `The` → matches `Jan Jagran Times` |

### Stage B — Lexical & Phonetic Check (`checker.py → check_stage_b_lexical_phonetic`)

Uses `rapidfuzz` (C++ optimized Levenshtein) to detect string-level similarity.

- **Exact Match:** Instant rejection with 0% probability.
- **Fuzzy Ratio:** Checks if the submitted title is >75% similar to any existing title (character-level). Catches typos and minor spelling variations like `Namascar` vs `Namaskar`.

### Stage C — AI Semantic Check (`checker.py → check_stage_c_semantic`)

Uses a multilingual sentence transformer + FAISS vector index for conceptual similarity.

- **Model:** `paraphrase-multilingual-MiniLM-L12-v2` (Hugging Face)
- **Encoding:** Title is encoded into a 384-dimensional dense vector.
- **Search:** FAISS performs an approximate nearest-neighbor cosine similarity search across all 160k+ pre-indexed title vectors.
- **Scoring:** Returns the top-5 most conceptually similar titles with scores.
- **Non-linear Penalty:** Raw cosine scores are scaled to account for MiniLM's high-density vector space:
  - Raw score ≤ 65% → multiplied by **0.5** (heavy penalty for weak clusters)
  - Raw score ≤ 80% → multiplied by **0.8** (moderate penalty)
  - Raw score > 80% → kept as-is (true strong match)

### Stage D — Final Scoring (`checker.py → verify`)

```
S_max = max(lexical_score, semantic_score)
Probability = max(0, 100 - S_max)

if Probability <= 25:   → High Risk (Rejected)
if Probability <= 40:   → Needs Review (Rejected)
if Probability > 40:    → Likely Acceptable (Approved ✅)
```

---

## 3. API Reference

### `POST /verify`

**Request:**
```json
{
  "title": "string (required)",
  "hindi_title": "string (optional, default: '')"
}
```

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| `approved` | bool | `true` if passed, `false` if rejected |
| `probability` | float | Uniqueness score 0–100 |
| `confidence_bucket` | string | `"High Risk"` / `"Needs Review"` / `"Likely Acceptable"` |
| `reason` | string | Primary human-readable decision reason |
| `stages.A` | string | Hard rule check result |
| `stages.B` | string | Lexical similarity result with score |
| `stages.C` | string | Semantic similarity result with score |
| `s_max` | float | Max similarity score found (debugging) |
| `top_k_matches` | array | Top 5 similar existing titles |
| `tags` | array | Auto-assigned concept categories |
| `suggestions` | array | AI-generated safe alternative titles (only on rejection) |
| `inference_time_seconds` | float | Backend processing time |
| `model_version` | string | Transformer model name |
| `ruleset_version` | string | Rule version identifier |
| `index_timestamp` | string | FAISS index build timestamp |

**Error Responses:**
- `400 Bad Request` — Empty title provided
- `429 Too Many Requests` — Rate limit exceeded (5 requests per 10 seconds)

### `GET /`

Health check. Returns engine status and number of indexed titles.

---

## 4. Backend Architecture

### `main.py` — FastAPI Server
- Loads `TitleChecker` on startup (pre-loads FAISS index into memory).
- IP-based rate limiting: tracks request timestamps per IP in `RATE_LIMIT_STORE`.
- Appends audit lineage metadata (`model_version`, `ruleset_version`, `index_timestamp`) to every response.

### `checker.py` — Core Engine
- `TitleChecker.__init__`: Loads FAISS index, metadata pickle, title sets, and transformer model.
- `check_stage_a_hard_rules(title)` → `(bool, str)`
- `check_stage_b_lexical_phonetic(title)` → `(float, str)`
- `check_stage_c_semantic(title, hindi_title)` → `(float, str, list)`
- `verify(title, hindi_title)` → full result dict
- `assign_concept_tags(title)` → category list
- `generate_smart_suggestions(title)` → safe alternative title list

### `build_index.py` — Index Builder (run once)
Reads `aggregated_dataset_hindi.csv`, encodes all titles with the transformer model, and saves the FAISS index + metadata pickle to `backend/index/`.

---

## 5. Frontend Architecture

- **Framework:** React + Vite
- **Styling:** Tailwind CSS v4 (uses `@import "tailwindcss"` syntax, requires `@tailwindcss/vite` plugin)
- **HTTP Client:** `axios`
- **Blockchain:** `ethers.js v6`

### Key State Variables

```javascript
title, hindiTitle        // Form inputs
loading, error, result   // API status
walletConnected, walletAddress, isConnectingWallet, walletError
txHash, txLoading        // Blockchain transaction status
lookupHash, lookupResult // Public ledger verification
```

---

## 6. Blockchain Integration

### Smart Contract — `TitleRegistry.sol`
```solidity
function registerTitle(bytes32 _titleHash) public
function isRegistered(bytes32 _titleHash) public view returns (bool)
```

**Live Deployment:**
- Network: Ethereum Sepolia Testnet
- Address: `0x60Ceaa19201e1C6C19b5828b4Dd5C450E6148DF9`

### Hash Generation (Frontend)
```javascript
const hash = ethers.keccak256(ethers.toUtf8Bytes(title.toLowerCase().trim()));
await contract.registerTitle(hash);
```

The same deterministic hash can be used by any auditor to independently verify that a specific title was approved and registered on-chain.

---

## 7. Enterprise Governance

| Feature | Location | Details |
|---|---|---|
| Rate Limiting | `main.py` | 5 requests / 10 seconds per IP. Returns HTTP 429. |
| Concept Tagging | `checker.py → assign_concept_tags` | Categories: Daily News, Regional, Business, Evening/Morning, Journalism |
| Model Lineage | `main.py` | `model_version`, `ruleset_version`, `index_timestamp` in every response |
| Application Tracking | `checker.py → verify` | Approved titles added to `self.existing_titles_set` at runtime |
| Public Verification | `App.jsx → handleHashLookup` | Calls `contract.isRegistered(hash)` on-chain without requiring a wallet |

---

## 8. Running the System

### Prerequisites
- Python 3.9+
- Node.js 18+
- MetaMask browser extension (for blockchain features only)
- Free Sepolia ETH from [faucet.sepolia.dev](https://faucet.sepolia.dev/)

### Backend Setup
```powershell
cd l:\Synchronize4.0\backend
pip install fastapi uvicorn sentence-transformers faiss-cpu rapidfuzz jellyfish thefuzz pydantic
python build_index.py       # First-time only — builds FAISS index (~2–5 min)
python -m uvicorn main:app --reload
```

### Frontend Setup
```powershell
cd l:\Synchronize4.0\frontend
npm install
npm run dev
```

---

## 9. Testing & Accuracy

### Manual Tests — `test_api.py`
Fires specific edge case titles at the API and prints results.

### Automated Accuracy Evaluation — `test_accuracy.py`
Runs 3 test suites against the live API:

1. **Exact Match Rejection** — 10 real titles from the dataset → all must be rejected
2. **Typo/Lexical Manipulation** — 10 mutated titles → must be caught by Stage B
3. **Hard Rule Enforcement** — 5 disallowed-word titles → all must return `stages.A` violation

Overall accuracy reported as a % out of 25 total test cases.

```powershell
cd l:\Synchronize4.0\backend
python test_accuracy.py
```

---

## 10. Known Configurations & Tuning

| Parameter | Location | Default | Effect |
|---|---|---|---|
| `RATE_LIMIT_MAX_REQUESTS` | `main.py` | `5
