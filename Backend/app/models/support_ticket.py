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

    # Customer
    customer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    customer_name = Column(
        String,
        nullable=False
    )

    # Employee initially selected
    requested_employee_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    requested_employee_name = Column(
        String,
        nullable=True
    )

    # Employee who accepted
    accepted_employee_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    accepted_employee_name = Column(
        String,
        nullable=True
    )
    accepted_at = Column(
    DateTime,
    nullable=True
    )

    # Employee who rejected
    rejected_employee_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    rejected_employee_name = Column(
        String,
        nullable=True
    )

    reject_reason = Column(
        String,
        nullable=True
    )

    message = Column(
        String,
        default="Customer requested assistance."
    )

    status = Column(
        String,
        default="OPEN"
    )

    """
    OPEN
    ACCEPTED
    REJECTED
    CANCELLED
    CLOSED
    """

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )