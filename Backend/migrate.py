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

# import sqlite3

# DB_PATH = "users.db"  # change if needed

# conn = sqlite3.connect(DB_PATH)
# cursor = conn.cursor()

# try:
#     cursor.execute("""
#         ALTER TABLE orders
#         ADD COLUMN reject_reason TEXT
#     """)

#     conn.commit()
#     print(
#         "✅ reject_reason column added successfully."
#     )

# except Exception as e:
#     print(
#         "❌ Error:",
#         e
#     )

# finally:
#     conn.close()

# import sqlite3

# DATABASE = "users.db"  # change to your database file

# conn = sqlite3.connect(DATABASE)
# cursor = conn.cursor()

# try:
#     cursor.execute("""
#         ALTER TABLE announcements
#         ADD COLUMN created_at TIMESTAMP
#     """)

#     cursor.execute("""
#         UPDATE announcements
#         SET created_at = CURRENT_TIMESTAMP
#         WHERE created_at IS NULL
#     """)

#     conn.commit()
#     print("created_at column added successfully.")

# except Exception as e:
#     print(e)

# finally:
#     conn.close()

# import sqlite3

# DATABASE = "users.db"  # change if needed

# conn = sqlite3.connect(DATABASE)
# cursor = conn.cursor()

# try:
#     # Add is_active column
#     cursor.execute("""
#         ALTER TABLE users
#         ADD COLUMN is_active BOOLEAN DEFAULT 0
#     """)

#     print("Added users.is_active")

# except Exception as e:
#     print("is_active:", e)

# try:
#     # Add last_login column
#     cursor.execute("""
#         ALTER TABLE users
#         ADD COLUMN last_login TIMESTAMP
#     """)

#     print("Added users.last_login")

# except Exception as e:
#     print("last_login:", e)

# try:
#     # Create user_sessions table
#     cursor.execute("""
#         CREATE TABLE IF NOT EXISTS user_sessions (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             user_id INTEGER NOT NULL,
#             token TEXT UNIQUE NOT NULL,
#             login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#             logout_time TIMESTAMP,
#             is_active BOOLEAN DEFAULT 1,
#             FOREIGN KEY(user_id) REFERENCES users(id)
#         )
#     """)

#     print("Created user_sessions table")

# except Exception as e:
#     print("user_sessions:", e)

# conn.commit()
# conn.close()

# print("Migration completed.")

from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql+psycopg://neondb_owner:npg_NlZ4FHvLJ2fg@ep-divine-glitter-apdpo021.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"

engine = create_engine(DATABASE_URL)

with engine.begin() as conn:

    try:
        conn.execute(text("""
            ALTER TABLE users
            ADD COLUMN is_active BOOLEAN DEFAULT FALSE
        """))
        print("Added users.is_active")
    except Exception as e:
        print("is_active:", e)

    try:
        conn.execute(text("""
            ALTER TABLE users
            ADD COLUMN last_login TIMESTAMP
        """))
        print("Added users.last_login")
    except Exception as e:
        print("last_login:", e)

    try:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                token TEXT UNIQUE NOT NULL,
                login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                logout_time TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )
        """))
        print("Created user_sessions table")
    except Exception as e:
        print("user_sessions:", e)

print("Migration completed.")