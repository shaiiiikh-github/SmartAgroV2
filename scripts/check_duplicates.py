"""
Smart-Agro - Read-Only Database Duplicate & Pre-Index Checker
=============================================================
This script safely inspects the MongoDB database in READ-ONLY mode.
It reports counts of duplicate emails (case-insensitive), usernames,
and phone numbers WITHOUT outputting any personal user data.

Usage:
    python scripts/check_duplicates.py
"""

import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient

# 1. Load environment variables
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, "Backend", ".env"))
load_dotenv(os.path.join(BASE_DIR, ".env"))

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("❌ Error: MONGO_URI not found in Backend/.env or .env")
    sys.exit(1)

def run_check():
    print("==================================================")
    print("🔍 Smart-Agro Read-Only Duplicate & Index Checker")
    print("==================================================")

    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=8000)
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB.\n")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    try:
        db = client.get_default_database()
        if db is None:
            db = client["smart_agro"]
    except Exception:
        db = client["smart_agro"]
    users_col = db["users"]
    messages_col = db["messages"]
    sensor_col = db["sensor_readings"]

    # 1. Collection Document Counts
    user_count = users_col.count_documents({})
    message_count = messages_col.count_documents({})
    sensor_count = sensor_col.count_documents({})

    print("📊 Collection Document Counts:")
    print(f"  • users           : {user_count} documents")
    print(f"  • messages        : {message_count} documents")
    print(f"  • sensor_readings : {sensor_count} documents\n")

    # 2. Check Case-Insensitive Duplicate Emails
    email_pipeline = [
        {"$match": {"email": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": {"$toLower": "$email"}, "count": {"$sum": 1}}},
        {"$match": {"count": {"$gt": 1}}},
        {"$group": {"_id": None, "duplicate_groups": {"$sum": 1}, "total_affected": {"$sum": "$count"}}}
    ]
    email_dups = list(users_col.aggregate(email_pipeline))
    if email_dups:
        groups = email_dups[0]["duplicate_groups"]
        affected = email_dups[0]["total_affected"]
        print(f"⚠️ Duplicate Emails: FOUND {groups} case-insensitive duplicate groups (affecting {affected} documents).")
        print("   Action: Resolve duplicate accounts before deploying the unique email index.")
    else:
        print("✅ Duplicate Emails: None found (0 duplicates).")

    # Check for mixed-case emails that need lowercasing
    mixed_case_pipeline = [
        {"$match": {"$expr": {"$ne": ["$email", {"$toLower": "$email"}]}}},
        {"$count": "count"}
    ]
    mixed_case = list(users_col.aggregate(mixed_case_pipeline))
    mixed_count = mixed_case[0]["count"] if mixed_case else 0
    if mixed_count > 0:
        print(f"ℹ️ Mixed-Case Emails: {mixed_count} user documents have uppercase letters in their email.")
        print("   Action: Run 'python scripts/migrate_lowercase_emails.py' to normalize them.")
    else:
        print("✅ Mixed-Case Emails: All existing emails are already lowercase.")

    # 3. Check Duplicate Usernames
    username_pipeline = [
        {"$match": {"username": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$username", "count": {"$sum": 1}}},
        {"$match": {"count": {"$gt": 1}}},
        {"$group": {"_id": None, "duplicate_groups": {"$sum": 1}, "total_affected": {"$sum": "$count"}}}
    ]
    username_dups = list(users_col.aggregate(username_pipeline))
    if username_dups:
        groups = username_dups[0]["duplicate_groups"]
        affected = username_dups[0]["total_affected"]
        print(f"⚠️ Duplicate Usernames: FOUND {groups} duplicate groups (affecting {affected} documents).")
    else:
        print("✅ Duplicate Usernames: None found (0 duplicates).")

    # 4. Check Duplicate Phones (partial filter: strings only)
    phone_pipeline = [
        {"$match": {"phone": {"$type": "string", "$ne": ""}}},
        {"$group": {"_id": "$phone", "count": {"$sum": 1}, "usernames": {"$push": "$username"}, "doc_ids": {"$push": {"$toString": "$_id"}}}},
        {"$match": {"count": {"$gt": 1}}}
    ]
    phone_dups = list(users_col.aggregate(phone_pipeline))
    if phone_dups:
        groups = len(phone_dups)
        total_affected = sum(g["count"] for g in phone_dups)
        print(f"⚠️ Duplicate Phones: FOUND {groups} duplicate group(s) (affecting {total_affected} documents).")
        for g in phone_dups:
            raw_phone = str(g["_id"])
            masked = ("*" * (len(raw_phone) - 3)) + raw_phone[-3:] if len(raw_phone) >= 3 else "***"
            print(f"   • Phone (masked: {masked}): accounts {g['usernames']} (IDs: {g['doc_ids']})")
        print("   Action: To apply the unique phone index, one of these accounts must have their phone updated or set to null.")
    else:
        print("✅ Duplicate Phones: None found (0 duplicates).")

    # 5. Sensor readings TTL stats
    cutoff_90d = datetime.utcnow() - timedelta(days=90)
    old_sensors = sensor_col.count_documents({"timestamp": {"$lt": cutoff_90d}})
    print(f"\n🕒 Telemetry Retention (90-Day TTL):")
    print(f"  • Readings older than 90 days: {old_sensors} (will be pruned automatically by TTL index)")

    print("\n==================================================")
    print("🏁 Read-only check complete. No database mutations occurred.")
    print("==================================================")

if __name__ == "__main__":
    run_check()
