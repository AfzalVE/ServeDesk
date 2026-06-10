from sqlalchemy.orm import Session

from app.models.support_ticket import SupportTicket


def raise_ticket(
    db: Session,
    customer_id: int,
    message: str
):

    ticket = SupportTicket(
        customer_id=customer_id,
        message=message,
        status="OPEN"
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


def get_all_tickets(
    db: Session
):

    return db.query(SupportTicket).all()


def assign_ticket(
    db: Session,
    ticket_id: int,
    employee_id: int
):

    ticket = db.query(SupportTicket).filter(
        SupportTicket.id == ticket_id
    ).first()

    if not ticket:
        return None

    ticket.employee_id = employee_id
    ticket.status = "ASSIGNED"

    db.commit()
    db.refresh(ticket)

    return ticket


def close_ticket(
    db: Session,
    ticket_id: int
):

    ticket = db.query(SupportTicket).filter(
        SupportTicket.id == ticket_id
    ).first()

    if not ticket:
        return None

    ticket.status = "CLOSED"

    db.commit()
    db.refresh(ticket)

    return ticket