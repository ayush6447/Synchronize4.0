# Synchronize 4.0 — PRGI Title Verification System

> An enterprise-grade AI pipeline to verify new publication title registrations against the Registrar of Newspapers for India (PRGI) database of 160,000+ existing titles.

## 🚀 Quick Start

### 1. Start the Backend
```powershell
cd l:\Synchronize4.0\backend
python -m uvicorn main:app --reload
```
API will be available at `http://127.0.0.1:8000`

### 2. Start the Frontend
```powershell
cd l:\Synchronize4.0\frontend
npm install
npm run dev
```
Open `http://localhost:5174` in your browser.

---

## 🧠 How It Works

When a user submits a proposed title, it passes through a **4-stage validation pipeline**:

| Stage | Type | What It Checks |
|---|---|---|
| **A** | Hard Rules | Disallowed words, periodicity tricks, title combinations, prefix/suffix abuse |
| **B** | Lexical/Phonetic | Exact match, Levenshtein fuzzy matching (typo detection) |
| **C** | AI Semantic | Cross-language conceptual similarity via FAISS + sentence-transformers |
| **D** | Scoring | Final probability score: `Probability = 100 - S_max` |

**Verification Probability buckets:**
- `> 60%` → **Likely Acceptable** (Approved ✅)
- `41–60%` → **Needs Review** (Rejected ⚠️)
- `0–40%` → **High Risk** (Rejected ❌)

---

## 📁 Project Structure

```
Synchronize4.0/
├── backend/
│   ├── main.py           # FastAPI server, rate limiting, API endpoints
│   ├── checker.py        # Core AI validation engine (all 4 stages)
│   ├── build_index.py    # One-time script to build FAISS vector index
│   ├── test_api.py       # Manual API test cases
│   └── test_accuracy.py  # Automated accuracy evaluation suite
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main React application
│   │   └── index.css     # Tailwind CSS v4 styles
│   ├── package.json
│   └── vite.config.js
│
├── blockchain/
│   └── TitleRegistry.sol  # Solidity smart contract for immutable registry
│
├── dataset/
│   └── aggregated_dataset_hindi.csv  # 160k+ PRGI title records
│
└── model/                # Precomputed FAISS index (built by build_index.py)
```

---

## 🔗 API Reference

**`POST /verify`**

```json
Request:  { "title": "Your Title", "hindi_title": "" }

Response: {
  "approved": true,
  "probability": 67.5,
  "confidence_bucket": "Likely Acceptable",
  "reason": "Title appears unique and compliant.",
  "stages": { "A": "...", "B": "...", "C": "..." },
  "top_k_matches": [ { "title": "...", "score": 28.6, "stage": "..." } ],
  "tags": ["Journalism"],
  "suggestions": ["Safe Title Times"],
  "inference_time_seconds": 0.029
}
```

**`GET /`** — Health check

---

## ⛓️ Blockchain Integration

Approved titles are logged onto the **Ethereum Sepolia Testnet** as immutable cryptographic hashes.

- **Contract Address:** `0x60Ceaa19201e1C6C19b5828b4Dd5C450E6148DF9`
- **Network:** Sepolia Testnet
- **Hash Algorithm:** `keccak256(title.toLowerCase().trim())`
- **Explorer:** [Sepolia Etherscan](https://sepolia.etherscan.io/)

Requires [MetaMask](https://metamask.io/) browser extension with free Sepolia ETH from a [faucet](https://faucet.sepolia.dev/).

---

## 🛡️ Enterprise Governance Features

| Feature | Implementation |
|---|---|
| **Rate Limiting** | In-memory IP-based abuse detection (5 req/10s) — `main.py` |
| **Concept Tagging** | Auto-categorizes titles (News, Business, Regional, etc.) — `checker.py` |
| **Model Lineage** | Every API response includes model version, ruleset version, index timestamp |
| **Application Tracking** | Approved titles are added to in-memory registry — blocks re-submission |
| **Public Verification Portal** | Anyone can verify a keccak256 hash against the on-chain registry |

---

## 🧪 Running Tests

```powershell
# Manual edge-case tests
cd l:\Synchronize4.0\backend
python test_api.py

# Automated accuracy evaluation against dataset
python test_accuracy.py
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python) |
| AI/Semantic Engine | `sentence-transformers` + FAISS |
| Lexical Engine | `rapidfuzz` (C++ optimized) |
| Frontend | React + Vite + Tailwind CSS v4 |
| Blockchain | Solidity + `ethers.js` + Sepolia Testnet |
| Dataset | 160,000+ PRGI registered newspaper titles |

---

## 📄 Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for the full technical reference, including detailed stage descriptions, scoring formula, and API field documentation.

For frontend-specific integration (building a new UI), see `frontend_requirements.md` in the project artifacts.