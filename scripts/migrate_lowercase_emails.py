"""
Smart-Agro - Email Lowercase Normalization Migration
===================================================
This migration script finds user documents whose email address contains
uppercase letters and updates them to lowercase in MongoDB.

Usage:
    python scripts/migrate_lowercase_emails.py
"""

import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, "Backend", ".env"))
load_dotenv(os.path.join(BASE_DIR, ".env"))

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("❌ Error: MONGO_URI not found.")
    sys.exit(1)

def migrate():
    print("==================================================")
    print("🔄 Smart-Agro Email Lowercase Migration")
    print("==================================================")

    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=8000)
    try:
        db = client.get_default_database()
        if db is None:
            db = client["smart_agro"]
    except Exception:
        db = client["smart_agro"]
    users_col = db["users"]

    # Find users where email has uppercase characters
    query = {"$expr": {"$ne": ["$email", {"$toLower": "$email"}]}}
    cursor = users_col.find(query)
    count = users_col.count_documents(query)

    if count == 0:
        print("✅ No mixed-case emails found. All emails are already lowercase.")
        return

    print(f"Found {count} accounts with mixed-case emails.")
    confirmation = input("Proceed with lowercasing these emails? (yes/no): ").strip().lower()
    if confirmation != "yes":
        print("Migration aborted by user.")
        return

    updated = 0
    for doc in cursor:
        original = doc.get("email")
        if original:
            lowered = original.strip().lower()
            users_col.update_one({"_id": doc["_id"]}, {"$set": {"email": lowered}})
            updated += 1

    print(f"✅ Successfully normalized {updated} email addresses to lowercase.")

if __name__ == "__main__":
    migrate()
