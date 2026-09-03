import time

import cloudinary
import cloudinary.utils
from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/uploads", tags=["uploads"])

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
)


@router.post("/signature")
def get_upload_signature(current_user: User = Depends(get_current_user)):
    """Returns a signed payload the frontend uses to upload directly to Cloudinary."""
    timestamp = int(time.time())
    params_to_sign = {"timestamp": timestamp, "folder": "elite-auto"}
    signature = cloudinary.utils.api_sign_request(params_to_sign, settings.cloudinary_api_secret)
    return {
        "timestamp": timestamp,
        "signature": signature,
        "api_key": settings.cloudinary_api_key,
        "cloud_name": settings.cloudinary_cloud_name,
        "folder": "elite-auto",
    }
