import os
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ImageStatus
from app.schemas import ImageStatusResponse


router = APIRouter()

UPLOAD_DIRECTORY = Path(os.getenv("UPLOAD_DIRECTORY", "uploads"))
IMAGE_FILENAME = "latest-image.jpg"
IMAGE_PATH = UPLOAD_DIRECTORY / IMAGE_FILENAME
STATUS_RECORD_ID = 1


def get_status_record(db: Session) -> ImageStatus:
    record = db.get(ImageStatus, STATUS_RECORD_ID)
    if record is None:
        record = ImageStatus(id=STATUS_RECORD_ID, image_uploaded=False)
        db.add(record)
        db.commit()
        db.refresh(record)
    return record


def set_image_uploaded(db: Session, value: bool) -> ImageStatus:
    record = get_status_record(db)
    record.image_uploaded = value
    db.commit()
    db.refresh(record)
    return record


@router.post("/upload", response_model=ImageStatusResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> ImageStatusResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image uploads are supported.",
        )

    UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

    try:
        with IMAGE_PATH.open("wb") as target:
            while chunk := await file.read(1024 * 1024):
                target.write(chunk)
    finally:
        await file.close()

    record = set_image_uploaded(db, True)
    return ImageStatusResponse(image_uploaded=record.image_uploaded)


@router.get("/status", response_model=ImageStatusResponse)
def read_status(db: Session = Depends(get_db)) -> ImageStatusResponse:
    record = get_status_record(db)
    return ImageStatusResponse(image_uploaded=record.image_uploaded)


@router.get("/image")
def read_image(db: Session = Depends(get_db)) -> FileResponse:
    record = get_status_record(db)
    if not record.image_uploaded or not IMAGE_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No image uploaded.",
        )

    return FileResponse(
        IMAGE_PATH,
        media_type="image/jpeg",
        filename=IMAGE_FILENAME,
        headers={"Cache-Control": "no-store"},
    )


@router.delete("/image", response_model=ImageStatusResponse)
def delete_image(db: Session = Depends(get_db)) -> ImageStatusResponse:
    if IMAGE_PATH.exists():
        IMAGE_PATH.unlink()

    record = set_image_uploaded(db, False)
    return ImageStatusResponse(image_uploaded=record.image_uploaded)
