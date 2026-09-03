from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    city: str | None = None
    phone: str | None = Field(default=None, index=True)
    phone_verified: bool = Field(default=False)
    otp_code: str | None = Field(default=None)
    otp_expires_at: datetime | None = Field(default=None)
    is_seller: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
