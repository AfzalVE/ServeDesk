# ==========================
# AUTH SERVICE
# ==========================
from .auth_service import (
    create_user,
    authenticate_user,
)

# ==========================
# PRODUCT SERVICE
# ==========================
from .product_service import (
    create_product,
    get_all_products,
    get_available_products,
    delete_product,
    update_product_status,
)

# ==========================
# ORDER SERVICE
# ==========================
from .order_service import (
    create_order,
    get_all_orders,
    get_customer_orders,
    assign_employee,
    update_order_status,
)

# ==========================
# TICKET SERVICE
# ==========================
from .ticket_service import (
    raise_ticket,
    get_all_tickets,
    get_customer_active_tickets,
    accept_ticket,
    reject_ticket,
    cancel_ticket,
    close_ticket,
)

# ==========================
# EMPLOYEE SERVICE
# ==========================
from .employee_service import (
    get_all_employees,
    get_employee_by_id,
    get_all_customers,
    get_admins,
)

# ==========================
# EXPLICIT EXPORTS
# ==========================
__all__ = [
    # auth
    "create_user",
    "authenticate_user",

    # product
    "create_product",
    "get_all_products",
    "get_available_products",
    "delete_product",
    "update_product_status",
    

    # order
    "create_order",
    "get_all_orders",
    "get_customer_orders",
    "assign_employee",
    "update_order_status",

    # ticket
    "raise_ticket",
    "get_all_tickets",
    "accept_ticket",
    "reject_ticket",
    "cancel_ticket",
    "close_ticket",
    

    # employee
    "get_all_employees",
    "get_employee_by_id",
    "get_all_customers",
    "get_admins",
]