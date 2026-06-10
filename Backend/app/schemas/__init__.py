# ==========================
# AUTH
# ==========================
from .auth import (
    SignUpSchema,
    SignInSchema,
)

# ==========================
# USER
# ==========================
from .user import UserResponse

# ==========================
# PRODUCT
# ==========================
from .product import (
    ProductCreate as ProductCreateSchema,
    ProductUpdate,
    ProductResponse,
)

# ==========================
# ORDER
# ==========================
from .order import (
    OrderCreate as OrderCreateSchema,
    OrderItemCreate,
    OrderResponse,
)

# ==========================
# TICKET
# ==========================
from .support_ticket import (
    TicketCreate as TicketCreateSchema,
    TicketAssign,
    TicketResponse,
)

# ==========================
# ANNOUNCEMENT (optional but included)
# ==========================
from .announcement import (
    AnnouncementCreate,
    AnnouncementResponse,
)

# ==========================
# EXPORTS
# ==========================
__all__ = [
    # auth
    "SignUpSchema",
    "SignInSchema",

    # user
    "UserResponse",

    # product
    "ProductCreateSchema",
    "ProductUpdate",
    "ProductResponse",

    # order
    "OrderCreateSchema",
    "OrderItemCreate",
    "OrderResponse",

    # ticket
    "TicketCreateSchema",
    "TicketAssign",
    "TicketResponse",

    # announcement
    "AnnouncementCreate",
    "AnnouncementResponse",
]