import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_session
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    SendOtpResponse,
    TokenResponse,
    UserResponse,
    VerifyOtpRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])

OTP_TTL_SECONDS = 300


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        city=payload.city,
        phone=payload.phone,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/phone/send-otp", response_model=SendOtpResponse)
def send_phone_otp(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not current_user.phone:
        raise HTTPException(status_code=400, detail="No phone number on file")

    code = f"{random.randint(0, 999999):06d}"
    current_user.otp_code = code
    # naive UTC to match the TIMESTAMP WITHOUT TIME ZONE column (Postgres strips tzinfo on write,
    # and returns naive datetimes on read, so comparisons must stay naive too)
    current_user.otp_expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(
        seconds=OTP_TTL_SECONDS
    )
    session.add(current_user)
    session.commit()

    return SendOtpResponse(code=code, expires_in_seconds=OTP_TTL_SECONDS)


@router.post("/phone/verify-otp", response_model=UserResponse)
def verify_phone_otp(
    payload: VerifyOtpRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not current_user.otp_code or not current_user.otp_expires_at:
        raise HTTPException(status_code=400, detail="No verification code was requested")
    if datetime.now(timezone.utc).replace(tzinfo=None) > current_user.otp_expires_at:
        raise HTTPException(status_code=400, detail="Code has expired, request a new one")
    if payload.code != current_user.otp_code:
        raise HTTPException(status_code=400, detail="Incorrect code")

    current_user.phone_verified = True
    current_user.otp_code = None
    current_user.otp_expires_at = None
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user
