import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env")

engine = create_engine(
DATABASE_URL,
pool_pre_ping=True
)

print("=" * 60)
print("PostgreSQL / Neon SQL Console")
print("Type SQL queries and press Enter")
print("Type 'exit' to quit")
print("=" * 60)

while True:
    try:
        query = input("\nSQL> ").strip()
        if query.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break

        if not query:
            continue

        with engine.connect() as conn:
            result = conn.execute(text(query))

        if result.returns_rows:
            rows = result.fetchall()

            if not rows:
                print("No rows returned.")
                continue

            columns = result.keys()

            print("\nColumns:")
            print(" | ".join(columns))

            print("-" * 80)

            for row in rows:
                print(" | ".join(str(x) for x in row))
        else:
            conn.commit()
            print("Query executed successfully.")

    except Exception as e:
        print(f"\nError: {e}")
