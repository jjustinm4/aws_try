from sqlalchemy import Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ImageStatus(Base):
    __tablename__ = "image_status"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    image_uploaded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
