import re

from pydantic import BaseModel, EmailStr, field_validator

PHONE_PATTERN = re.compile(r"^03\d{9}$")


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    city: str | None = None
    phone: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not PHONE_PATTERN.match(v):
            raise ValueError("Phone must be a Pakistani mobile number in the format 03XXXXXXXXX")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    city: str | None
    phone: str | None
    phone_verified: bool
    is_seller: bool


class SendOtpResponse(BaseModel):
    demo_mode: bool = True
    code: str
    expires_in_seconds: int
    note: str = "Demo mode: no SMS provider is configured, so the code is returned directly instead of sent."


class VerifyOtpRequest(BaseModel):
    code: str
