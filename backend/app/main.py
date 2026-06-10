from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import init_db
from app.routes import analytics, analyze, auth, research, scans


app = FastAPI(
    title="SafeGuard AI API",
    description="Human-centered suspicious message and URL analysis API.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Unexpected server error. Please try again or check the backend logs."},
    )


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(analyze.router)
app.include_router(scans.router)
app.include_router(analytics.router)
app.include_router(research.router)
