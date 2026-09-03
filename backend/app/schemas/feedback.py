from pydantic import BaseModel, Field


class FeedbackCreate(BaseModel):
    message: str = Field(min_length=5, max_length=2000)
    email: str | None = None


class FeedbackResponse(BaseModel):
    id: int
