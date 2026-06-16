from sqlalchemy.orm import Session
import datetime

from app.models.support_ticket import SupportTicket
from app.models.user import User
from datetime import datetime, timedelta
from sqlalchemy import and_, or_
from app.websocket_manager import ticket_manager
import asyncio


# ===================================
# CREATE TICKET
# ===================================
def raise_ticket(
    db: Session,
    customer_id: int,
    employee_id: int,
    message: str
):

    customer = (
        db.query(User)
        .filter(User.id == customer_id)
        .first()
    )

    employee = (
        db.query(User)
        .filter(User.id == employee_id)
        .first()
    )

    if not customer:
        return None

    ticket = SupportTicket(
        customer_id=customer.id,
        customer_name=customer.full_name,

        requested_employee_id=employee.id if employee else None,
        requested_employee_name=employee.full_name if employee else None,

        message=message,
        status="OPEN"
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    asyncio.create_task( 
        ticket_manager.broadcast( 
            { 
                "event": "ticket_created", 
                "ticket": { 
                    "id": ticket.id, 
                    "customer_id": ticket.customer_id, 
                    "customer_name": ticket.customer_name, 
                    "requested_employee_id": ticket.requested_employee_id, 
                    "requested_employee_name": ticket.requested_employee_name, 
                    "message": ticket.message, 
                    "status": ticket.status,
                    } 
            }
        ) 
    )


    return ticket


# ===================================
# GET ALL TICKETS
# ===================================
def get_all_tickets(
    db: Session
):

    return (
        db.query(SupportTicket)
        .order_by(
            SupportTicket.created_at.desc()
        )
        .all()
    )



def get_customer_active_tickets(
    db: Session,
    customer_id: int
):
    expiry_time = datetime.utcnow() - timedelta(minutes=5)

    return (
        db.query(SupportTicket)
        .filter(
            SupportTicket.customer_id == customer_id,
            or_(
                SupportTicket.status == "OPEN",
                and_(
                    SupportTicket.status == "ACCEPTED",
                    SupportTicket.accepted_at != None,
                    SupportTicket.accepted_at >= expiry_time
                )
            )
        )
        .order_by(
            SupportTicket.created_at.desc()
        )
        .all()
    )

def get_active_tickets(db: Session):
    ten_minutes_ago = datetime.utcnow() - timedelta(minutes=10)

    return (
        db.query(SupportTicket)
        .filter(
            or_(
                # Still waiting for an employee
                SupportTicket.status == "OPEN",

                # Accepted within last 10 minutes
                and_(
                    SupportTicket.status == "ACCEPTED",
                    SupportTicket.accepted_at != None,
                    SupportTicket.accepted_at >= ten_minutes_ago,
                )
            )
        )
        .order_by(SupportTicket.created_at.desc())
        .all()
    )
# ===================================
# ACCEPT TICKET
# ===================================
def accept_ticket(
    db: Session,
    ticket_id: int,
    employee_id: int
):

    ticket = (
        db.query(SupportTicket)
        .filter(
            SupportTicket.id == ticket_id
        )
        .first()
    )

    if not ticket:
        return None

    employee = (
        db.query(User)
        .filter(
            User.id == employee_id
        )
        .first()
    )

    if not employee:
        return None

    ticket.accepted_employee_id = employee.id
    ticket.accepted_employee_name = employee.full_name
    ticket.accepted_at = datetime.utcnow()

    ticket.status = "ACCEPTED"

    db.commit()
    asyncio.create_task( ticket_manager.broadcast( { "event": "ticket_accepted", "ticket_id": ticket.id } ) )
    db.refresh(ticket)

    return ticket


# ===================================
# REJECT TICKET
# ===================================
def reject_ticket(
    db: Session,
    ticket_id: int,
    employee_id: int,
    reason: str
):

    ticket = (
        db.query(SupportTicket)
        .filter(
            SupportTicket.id == ticket_id
        )
        .first()
    )

    if not ticket:
        return None

    employee = (
        db.query(User)
        .filter(
            User.id == employee_id
        )
        .first()
    )

    if not employee:
        return None

    ticket.rejected_employee_id = employee.id
    ticket.rejected_employee_name = employee.full_name
    ticket.reject_reason = reason

    # Available for other employees
    ticket.status = "OPEN"

    db.commit()
    asyncio.create_task( ticket_manager.broadcast( { "event": "ticket_rejected", "ticket_id": ticket.id } ) )
    db.refresh(ticket)

    return ticket


# ===================================
# CANCEL TICKET
# ===================================
def cancel_ticket(
    db: Session,
    ticket_id: int
):

    ticket = (
        db.query(SupportTicket)
        .filter(
            SupportTicket.id == ticket_id
        )
        .first()
    )

    if not ticket:
        return None

    ticket.status = "CANCELLED"

    db.commit()
    asyncio.create_task( ticket_manager.broadcast( { "event": "ticket_cancelled", "ticket_id": ticket.id } ) )
    db.refresh(ticket)

    return ticket


# ===================================
# CLOSE TICKET
# ===================================
def close_ticket(
    db: Session,
    ticket_id: int
):

    ticket = (
        db.query(SupportTicket)
        .filter(
            SupportTicket.id == ticket_id
        )
        .first()
    )

    if not ticket:
        return None

    ticket.status = "CLOSED"

    db.commit()
    db.refresh(ticket)

    return ticket