import requests


def send_push_notification(
    token: str,
    title: str,
    body: str
):
    if not token:
        return

    requests.post(
        "https://exp.host/--/api/v2/push/send",
        json={
            "to": token,
            "title": title,
            "body": body,
            "sound": "default",
            "priority": "high"
        }
    )