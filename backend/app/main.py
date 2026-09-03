from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, feedback, search, uploads, vehicles
from app.core.config import settings
from app.core.embeddings import get_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_model()  # warm up the embedding model so the first search isn't slow
    yield


app = FastAPI(title="Elite Auto API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(uploads.router)
app.include_router(search.router)
app.include_router(feedback.router)


@app.get("/health")
def health():
    return {"status": "ok"}
