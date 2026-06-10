from pydantic import BaseModel
from datetime import datetime


class UserResponse(BaseModel):
    id: int
    full_name: str
    employee_id: str | None
    email: str
    user_type: str
    created_at: datetime

    class Config:
        from_attributes = True

