from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import os
import jwt

from dotenv import load_dotenv
from pymongo import MongoClient


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# BLUEPRINT
# ============================================================

roadmap_progress = Blueprint(
    "roadmap_progress",
    __name__
)


# ============================================================
# MONGODB
# ============================================================

MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET")

if not MONGO_URI:
    raise RuntimeError(
        "MONGO_URI is not configured in .env"
    )

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not configured in .env"
    )


client = MongoClient(MONGO_URI)

db = client["JobTrendAI"]

roadmap_progress_collection = db[
    "roadmap_progress"
]


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user():

    auth_header = request.headers.get(
        "Authorization",
        ""
    )

    if not auth_header.startswith(
        "Bearer "
    ):
        return None

    token = auth_header.split(
        " ",
        1
    )[1]

    try:

        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        return payload

    except jwt.ExpiredSignatureError:

        print(
            "ROADMAP AUTH ERROR: Token expired"
        )

        return None

    except jwt.InvalidTokenError as error:

        print(
            "ROADMAP AUTH ERROR:",
            error
        )

        return None


# ============================================================
# GET USER ID
# ============================================================

def get_user_id():

    user = get_current_user()

    if not user:
        return None

    user_id = user.get(
        "user_id"
    )

    if not user_id:
        return None

    return str(
        user_id
    )


# ============================================================
# GET ROADMAP PROGRESS
# ============================================================

@roadmap_progress.route(
    "/",
    methods=["GET"]
)
def get_progress():

    try:

        # ----------------------------------------
        # Role
        # ----------------------------------------

        role = request.args.get(
            "role",
            ""
        ).strip()

        if not role:

            return jsonify({
                "status": "error",
                "message": "Role is required."
            }), 400


        # ----------------------------------------
        # User
        # ----------------------------------------

        user_id = get_user_id()

        if not user_id:

            return jsonify({
                "status": "error",
                "message": "Authentication required."
            }), 401


        print(
            "========================================"
        )

        print(
            "ROADMAP GET REQUEST"
        )

        print(
            "User ID:",
            user_id
        )

        print(
            "Role:",
            role
        )


        # ----------------------------------------
        # Find progress
        # ----------------------------------------

        progress = roadmap_progress_collection.find_one(
            {
                "user_id": user_id,
                "role": role
            },
            {
                "_id": 0
            }
        )


        print(
            "MongoDB result:",
            progress
        )


        # ----------------------------------------
        # No progress yet
        # ----------------------------------------

        if not progress:

            print(
                "No roadmap progress found."
            )

            print(
                "========================================"
            )

            return jsonify({
                "status": "success",
                "data": {
                    "role": role,
                    "completed_items": []
                }
            }), 200


        # ----------------------------------------
        # Completed items
        # ----------------------------------------

        completed_items = progress.get(
            "completed_items",
            []
        )

        if not isinstance(
            completed_items,
            list
        ):
            completed_items = []


        completed_items = [
            str(item).strip()
            for item in completed_items
            if str(item).strip()
        ]


        print(
            "Returning completed items:",
            completed_items
        )

        print(
            "========================================"
        )


        return jsonify({
            "status": "success",
            "data": {
                "role": role,
                "completed_items": completed_items
            }
        }), 200


    except Exception as error:

        print(
            "ROADMAP GET ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": "Could not load roadmap progress."
        }), 500


# ============================================================
# SAVE ROADMAP PROGRESS
# ============================================================

@roadmap_progress.route(
    "/",
    methods=["PUT"]
)
def save_progress():

    try:

        # ----------------------------------------
        # User
        # ----------------------------------------

        user_id = get_user_id()

        if not user_id:

            return jsonify({
                "status": "error",
                "message": "Authentication required."
            }), 401


        # ----------------------------------------
        # Request data
        # ----------------------------------------

        data = request.get_json(
            silent=True
        ) or {}


        role = str(
            data.get(
                "role",
                ""
            )
        ).strip()


        completed_items = data.get(
            "completed_items",
            []
        )


        # ----------------------------------------
        # Validate role
        # ----------------------------------------

        if not role:

            return jsonify({
                "status": "error",
                "message": "Role is required."
            }), 400


        # ----------------------------------------
        # Validate completed items
        # ----------------------------------------

        if not isinstance(
            completed_items,
            list
        ):
            completed_items = []


        completed_items = [
            str(item).strip()
            for item in completed_items
            if str(item).strip()
        ]


        # Remove duplicates
        completed_items = list(
            dict.fromkeys(
                completed_items
            )
        )


        now = datetime.now(
            timezone.utc
        )


        # ----------------------------------------
        # Save / update
        # ----------------------------------------

        result = roadmap_progress_collection.update_one(
            {
                "user_id": user_id,
                "role": role
            },
            {
                "$set": {
                    "completed_items":
                        completed_items,
                    "updated_at":
                        now
                },
                "$setOnInsert": {
                    "created_at":
                        now
                }
            },
            upsert=True
        )


        print(
            "========================================"
        )

        print(
            "ROADMAP SAVE"
        )

        print(
            "User ID:",
            user_id
        )

        print(
            "Role:",
            role
        )

        print(
            "Completed:",
            completed_items
        )

        print(
            "Matched:",
            result.matched_count
        )

        print(
            "Modified:",
            result.modified_count
        )

        print(
            "Upserted:",
            result.upserted_id
        )

        print(
            "========================================"
        )


        return jsonify({
            "status": "success",
            "message": "Roadmap progress saved.",
            "data": {
                "role": role,
                "completed_items":
                    completed_items
            }
        }), 200


    except Exception as error:

        print(
            "ROADMAP SAVE ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": "Could not save roadmap progress."
        }), 500


# ============================================================
# RESET ROADMAP PROGRESS
# ============================================================

@roadmap_progress.route(
    "/reset",
    methods=["DELETE"]
)
def reset_progress():

    try:

        # ----------------------------------------
        # User
        # ----------------------------------------

        user_id = get_user_id()

        if not user_id:

            return jsonify({
                "status": "error",
                "message": "Authentication required."
            }), 401


        # ----------------------------------------
        # Role
        # ----------------------------------------

        role = request.args.get(
            "role",
            ""
        ).strip()


        if not role:

            return jsonify({
                "status": "error",
                "message": "Role is required."
            }), 400


        # ----------------------------------------
        # Delete
        # ----------------------------------------

        result = roadmap_progress_collection.delete_one(
            {
                "user_id": user_id,
                "role": role
            }
        )


        print(
            "ROADMAP RESET"
        )

        print(
            "User ID:",
            user_id
        )

        print(
            "Role:",
            role
        )

        print(
            "Deleted:",
            result.deleted_count
        )


        return jsonify({
            "status": "success",
            "message": "Roadmap progress reset.",
            "data": {
                "role": role,
                "completed_items": []
            }
        }), 200


    except Exception as error:

        print(
            "ROADMAP RESET ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": "Could not reset roadmap progress."
        }), 500