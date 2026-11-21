
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from secrets import randbelow

app = FastAPI(title="Devil AI Pro Demo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Demo API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/demo/sample")
def demo_sample():
    return {"value": randbelow(10), "mode": "demo"}
