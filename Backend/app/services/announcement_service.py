from sqlalchemy.orm import Session

from app.models.announcement import Announcement
from app.schemas.announcement import (
    AnnouncementCreate,
)
from datetime import datetime
from sqlalchemy import func

# ==========================
# CREATE
# ==========================
def create_announcement(
    db: Session,
    announcement: AnnouncementCreate,
):
    new_announcement = Announcement(
        title=announcement.title,
        message=announcement.message,
    )

    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)

    return new_announcement


# ==========================
# GET ALL
# ==========================
def get_all_announcements(
    db: Session,
):
    return (
        db.query(Announcement)
        .order_by(Announcement.id.desc())
        .all()
    )

# ==========================
# GET TODAY ANNOUNCEMENTS
# ==========================
def get_today_announcements(
    db: Session,
):
    today = datetime.utcnow().date()

    return (
        db.query(Announcement)
        .filter(
            func.date(
                Announcement.created_at
            ) == today
        )
        .order_by(
            Announcement.created_at.desc()
        )
        .all()
    )
# ==========================
# GET ONE
# ==========================
def get_announcement(
    db: Session,
    announcement_id: int,
):
    return (
        db.query(Announcement)
        .filter(
            Announcement.id
            == announcement_id
        )
        .first()
    )


# ==========================
# UPDATE
# ==========================
def update_announcement(
    db: Session,
    announcement_id: int,
    announcement: AnnouncementCreate,
):
    existing = (
        db.query(Announcement)
        .filter(
            Announcement.id
            == announcement_id
        )
        .first()
    )

    if not existing:
        return None

    existing.title = (
        announcement.title
    )

    existing.message = (
        announcement.message
    )

    db.commit()
    db.refresh(existing)

    return existing


# ==========================
# DELETE
# ==========================
def delete_announcement(
    db: Session,
    announcement_id: int,
):
    announcement = (
        db.query(Announcement)
        .filter(
            Announcement.id
            == announcement_id
        )
        .first()
    )

    if not announcement:
        return False

    db.delete(announcement)
    db.commit()

    return True