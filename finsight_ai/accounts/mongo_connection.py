# mongo_connection.py

from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

db = client["expense_tracker_db"]

users_collection = db["users"]
expenses_collection = db["expenses"]
income_collection = db["income"]

# Add this line
categories_collection = db["categories"]

print("✅ MongoDB connected & collections created!")
