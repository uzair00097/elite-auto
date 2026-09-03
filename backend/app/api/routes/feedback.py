from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackResponse

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackResponse, status_code=201)
def submit_feedback(payload: FeedbackCreate, session: Session = Depends(get_session)):
    feedback = Feedback(message=payload.message, email=payload.email or None)
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    return FeedbackResponse(id=feedback.id)
