from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from checker import TitleChecker
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI(title="PRGI Title Verification System")

# In-memory store for simplified rate-limiting / abuse detection
# Dictionary format: { "IP_ADDRESS": [timestamp1, timestamp2, ...] }
RATE_LIMIT_STORE = {}
RATE_LIMIT_MAX_REQUESTS = 5
RATE_LIMIT_WINDOW_SECONDS = 10

# Allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    client_ip = request.client.host
    current_time = time.time()
    
    if client_ip not in RATE_LIMIT_STORE:
        RATE_LIMIT_STORE[client_ip] = []
        
    # Filter out requests older than the window
    RATE_LIMIT_STORE[client_ip] = [t for t in RATE_LIMIT_STORE[client_ip] if current_time - t < RATE_LIMIT_WINDOW_SECONDS]
    
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
