from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine
from app.models import ImageStatus
from app.routes.image import STATUS_RECORD_ID, router as image_router

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def initialize_database() -> None:
    # LOCAL POSTGRES -> AWS RDS PostgreSQL
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        record = db.get(ImageStatus, STATUS_RECORD_ID)
        if record is None:
            db.add(ImageStatus(id=STATUS_RECORD_ID, image_uploaded=False))
            db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="AWS Learning Image App",
    description="Local React + FastAPI application prepared for future AWS migration.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(image_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
