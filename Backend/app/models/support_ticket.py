from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from datetime import datetime

from app.database import Base


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    customer_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    employee_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    status = Column(
        String,
        default="OPEN"
    )
    # OPEN
    # ACCEPTED
    # CLOSED

    message = Column(
        String,
        default="Customer requested assistance."
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
