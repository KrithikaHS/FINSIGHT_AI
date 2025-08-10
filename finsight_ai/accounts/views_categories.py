import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from bson import ObjectId
from .auth_utils import jwt_required
from .mongo_connection import categories_collection

# Seed predefined categories if they don't exist yet
PREDEFINED_CATEGORIES = [
    "Food", "Rent", "Travel", "Utilities", "Entertainment", "Health"
]

def seed_predefined_categories():
    for cat in PREDEFINED_CATEGORIES:
        if not categories_collection.find_one({"name": cat, "user_id": None}):
            categories_collection.insert_one({"name": cat, "user_id": None})

seed_predefined_categories()


@csrf_exempt
@jwt_required
@require_http_methods(["GET", "POST"])
def list_categories(request):
    try:
        user_id = ObjectId(request.user["_id"])
    except Exception:
        return JsonResponse({"error": "Invalid user ID"}, status=400)

    if request.method == "GET":
        try:
            cats = list(categories_collection.find({
                "$or": [
                    {"user_id": None},        # Predefined categories
                    {"user_id": user_id}      # User categories
                ]
            }))
            for c in cats:
                c["_id"] = str(c["_id"])
                c["user_id"] = str(c["user_id"]) if c.get("user_id") else None
            return JsonResponse({"categories": cats})
        except Exception as e:
            return JsonResponse({"error": "Failed to fetch categories", "detail": str(e)}, status=400)

    elif request.method == "POST":
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        name = data.get("name", "").strip()
        if not name:
            return JsonResponse({"error": "Category name required"}, status=400)

        # Check if category already exists (predefined or user)
        existing = categories_collection.find_one({
            "name": name,
            "$or": [
                {"user_id": None},
                {"user_id": user_id}
            ]
        })
        if existing:
            return JsonResponse({"error": "Category already exists"}, status=400)

        cat_doc = {
            "name": name,
            "user_id": user_id
        }
        res = categories_collection.insert_one(cat_doc)
        cat_doc["_id"] = str(res.inserted_id)
        cat_doc["user_id"] = str(user_id)

        return JsonResponse({"message": "Category added", "category": cat_doc}, status=201)
