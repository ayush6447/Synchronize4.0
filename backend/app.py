from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from checker import TitleChecker
from fastapi.middleware.cors import CORSMiddleware
import time
import threading
import os

app = FastAPI(title="PRGI Title Verification System")

# In-memory store for simplified rate-limiting / abuse detection
# Dictionary format: { "IP_ADDRESS": [timestamp1, timestamp2, ...] }
# Protected by a lock to prevent race conditions under concurrent requests.
RATE_LIMIT_STORE: dict[str, list[float]] = {}
RATE_LIMIT_MAX_REQUESTS = 5
RATE_LIMIT_WINDOW_SECONDS = 10
_rate_limit_lock = threading.Lock()

# CORS: do NOT combine allow_origins=["*"] with allow_credentials=True — browsers reject it.
# Specify explicit allowed origins via the ALLOWED_ORIGINS env var (comma-separated).
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the core validation engine on startup (In-memory precomputed FAISS index)
# This handles the offline/online separation requirement.
print("Loading core TitleChecker Engine...")
t0 = time.time()
engine = TitleChecker()
print(f"Engine loaded in {time.time() - t0:.2f}s")

class VerificationRequest(BaseModel):
    title: str
    hindi_title: str = ""

@app.get("/")
def health_check():
    return {"status": "ok", "message": "PRGI Verification Engine Online", "index_size": len(engine.metadata)}

@app.post("/verify")
def verify_title(req: VerificationRequest, request: Request):
    # Abuse Detection (Rate Limiting)
    # request.client may be None when running behind certain reverse proxies.
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()

    with _rate_limit_lock:
        if client_ip not in RATE_LIMIT_STORE:
            RATE_LIMIT_STORE[client_ip] = []

        # Evict timestamps outside the window (prevents unbounded memory growth)
        RATE_LIMIT_STORE[client_ip] = [
            t for t in RATE_LIMIT_STORE[client_ip]
            if current_time - t < RATE_LIMIT_WINDOW_SECONDS
        ]

        if len(RATE_LIMIT_STORE[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
            raise HTTPException(
                status_code=429,
                detail="Too many requests detected. Please wait 10 seconds. (Anti-Abuse Engine)"
            )

        RATE_LIMIT_STORE[client_ip].append(current_time)

    if not req.title:
        raise HTTPException(status_code=400, detail="Title Name must be provided.")
        
    start_time = time.time()
    
    # Run the validation pipeline
    result = engine.verify(req.title.strip(), req.hindi_title.strip())
    
    elapsed = time.time() - start_time
    result["inference_time_seconds"] = round(elapsed, 4)
    
    # Audit Lineage Metadata
    result["model_version"] = "paraphrase-multilingual-MiniLM-L12-v2"
    result["ruleset_version"] = "v1.4.0 (PRGI Guidelines)"
    result["index_timestamp"] = "2026-02-26T00:00:00Z"
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
