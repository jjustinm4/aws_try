from pydantic import BaseModel


class ImageStatusResponse(BaseModel):
    image_uploaded: bool
