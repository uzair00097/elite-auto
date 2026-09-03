from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class Feedback(SQLModel, table=True):
    __tablename__ = "feedback"

    id: int | None = Field(default=None, primary_key=True)
    message: str
    email: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
