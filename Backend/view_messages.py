"""
Smart-Agro - Contact Messages Viewer CLI
Usage: python Backend/view_messages.py
"""
import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, ".env"))

mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    print("❌ Error: MONGO_URI not found in Backend/.env")
    sys.exit(1)

try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=8000)
    db = client["smart_agro"]
    messages_col = db["messages"]
    
    total = messages_col.count_documents({})
    print("=" * 60)
    print(f"🌾 SMART-AGRO CONTACT MESSAGES (Total: {total})")
    print("=" * 60)

    if total == 0:
        print("No messages found in 'smart_agro.messages' collection.")
    else:
        for idx, doc in enumerate(messages_col.find().sort("createdAt", -1), 1):
            created_at = doc.get("createdAt")
            if isinstance(created_at, datetime):
                time_str = created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
            else:
                time_str = str(created_at)
            
            print(f"\n[#{idx}] Date: {time_str}")
            print(f"👤 Name   : {doc.get('name', 'N/A')}")
            print(f"📧 Email  : {doc.get('email', 'N/A')}")
            print(f"💬 Message: {doc.get('message', 'N/A')}")
            print("-" * 60)

except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
