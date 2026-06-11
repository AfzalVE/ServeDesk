# import sqlite3

# DATABASE_PATH = "users.db"  # Change this to your SQLite database path


# def add_column():
#     conn = sqlite3.connect(DATABASE_PATH)
#     cursor = conn.cursor()

#     try:
#         cursor.execute("""
#             ALTER TABLE support_tickets
#             ADD COLUMN accepted_at DATETIME
#         """)

#         conn.commit()
#         print("✅ accepted_at column added successfully.")

#     except sqlite3.OperationalError as e:
#         if "duplicate column name" in str(e).lower():
#             print("ℹ️ accepted_at column already exists.")
#         else:
#             print(f"❌ Error: {e}")

#     finally:
#         conn.close()


# if __name__ == "__main__":
#     add_column()

import sqlite3

DB_PATH = "users.db"  # change if needed

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

try:
    cursor.execute("""
        ALTER TABLE orders
        ADD COLUMN reject_reason TEXT
    """)

    conn.commit()
    print(
        "✅ reject_reason column added successfully."
    )

except Exception as e:
    print(
        "❌ Error:",
        e
    )

finally:
    conn.close()