import os
import bcrypt
import jwt

from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv


# Load environment variables
load_dotenv()


# Create authentication blueprint
auth = Blueprint("auth", __name__)


# Get environment variables
MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET")


# Validate configuration
if not MONGO_URI:
    raise RuntimeError(
        "MONGO_URI is not set in the .env file"
    )

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not set in the .env file"
    )


# MongoDB connection
client = MongoClient(MONGO_URI)

db = client["JobTrendAI"]

users_collection = db["users"]


# ============================================================
# REGISTER
# ============================================================

@auth.route("/register", methods=["POST"])
def register():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Request body is required"
            }), 400


        name = data.get("name")
        email = data.get("email")
        password = data.get("password")


        # Validate input

        if not name or not email or not password:

            return jsonify({
                "status": "error",
                "message": "Name, email and password are required"
            }), 400


        name = str(name).strip()
        email = str(email).strip().lower()
        password = str(password)


        # Password validation

        if len(password) < 8:

            return jsonify({
                "status": "error",
                "message": "Password must contain at least 8 characters"
            }), 400


        # Check existing user

        existing_user = users_collection.find_one({
            "email": email
        })


        if existing_user:

            return jsonify({
                "status": "error",
                "message": "User already exists"
            }), 409


        # Hash password

        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        )


        # Create user

        user = {
            "name": name,
            "email": email,
            "password": password_hash.decode("utf-8"),

            "skills": [],

            "target_role": None,

            "experience": None,

            "education": None,

            "created_at": datetime.now(timezone.utc)
        }


        result = users_collection.insert_one(user)


        return jsonify({

            "status": "success",

            "message": "User registered successfully",

            "user_id": str(result.inserted_id)

        }), 201


    except Exception as error:

        print("REGISTER ERROR:", error)

        return jsonify({

            "status": "error",

            "message": "Registration failed"

        }), 500


# ============================================================
# LOGIN
# ============================================================

@auth.route("/login", methods=["POST"])
def login():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "status": "error",
                "message": "Request body is required"
            }), 400


        email = data.get("email")
        password = data.get("password")


        if not email or not password:

            return jsonify({
                "status": "error",
                "message": "Email and password are required"
            }), 400


        email = str(email).strip().lower()
        password = str(password)


        # Find user

        user = users_collection.find_one({
            "email": email
        })


        if not user:

            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401


        stored_password = user.get("password")


        if not stored_password:

            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401


        # Check password

        password_is_valid = bcrypt.checkpw(

            password.encode("utf-8"),

            str(stored_password).encode("utf-8")

        )


        if not password_is_valid:

            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401


        # Create JWT

        payload = {

            "user_id": str(user["_id"]),

            "email": email,

            "exp": datetime.now(timezone.utc) + timedelta(days=7)

        }


        token = jwt.encode(

            payload,

            str(JWT_SECRET),

            algorithm="HS256"

        )


        return jsonify({

            "status": "success",

            "message": "Login successful",

            "token": token,

            "user": {

                "id": str(user["_id"]),

                "name": str(user.get("name", "")),

                "email": email

            }

        }), 200


    except Exception as error:

        print("LOGIN ERROR:", error)

        return jsonify({

            "status": "error",

            "message": "Login failed"

        }), 500


# ============================================================
# PROFILE AUTHENTICATION HELPER
# ============================================================

def get_current_user():

    auth_header = request.headers.get("Authorization")


    if not auth_header:

        return None


    if not auth_header.startswith("Bearer "):

        return None


    token = auth_header.split(" ", 1)[1]


    try:

        payload = jwt.decode(

            token,

            str(JWT_SECRET),

            algorithms=["HS256"]

        )

        return payload


    except jwt.ExpiredSignatureError:

        return None


    except jwt.InvalidTokenError:

        return None


# ============================================================
# UPDATE PROFILE
# ============================================================

@auth.route("/profile", methods=["PUT"])
def update_profile():

    try:

        payload = get_current_user()


        if not payload:

            return jsonify({

                "status": "error",

                "message": "Unauthorized"

            }), 401


        data = request.get_json()


        if not data:

            return jsonify({

                "status": "error",

                "message": "Request body is required"

            }), 400


        user_id = payload.get("user_id")


        name = str(data.get("name", "")).strip()

        target_role = data.get("target_role")

        experience = data.get("experience")

        education = data.get("education")

        skills = data.get("skills", [])


        # Make sure skills is a list

        if not isinstance(skills, list):

            skills = []


        # Clean skills

        cleaned_skills = [

            str(skill).strip()

            for skill in skills

            if str(skill).strip()

        ]


        # Update MongoDB

        from bson import ObjectId


        result = users_collection.update_one(

            {
                "_id": ObjectId(user_id)
            },

            {
                "$set": {

                    "name": name,

                    "target_role": target_role,

                    "experience": experience,

                    "education": education,

                    "skills": cleaned_skills,

                    "updated_at": datetime.now(timezone.utc)

                }

            }

        )


        if result.matched_count == 0:

            return jsonify({

                "status": "error",

                "message": "User not found"

            }), 404


        # Update returned user data

        updated_user = users_collection.find_one({

            "_id": ObjectId(user_id)

        })


        return jsonify({

            "status": "success",

            "message": "Profile updated successfully",

            "user": {

                "id": str(updated_user["_id"]),

                "name": str(updated_user.get("name", "")),

                "email": str(updated_user.get("email", "")),

                "target_role": updated_user.get("target_role"),

                "experience": updated_user.get("experience"),

                "education": updated_user.get("education"),

                "skills": updated_user.get("skills", [])

            }

        }), 200


    except Exception as error:

        print("PROFILE UPDATE ERROR:", error)

        return jsonify({

            "status": "error",

            "message": "Profile update failed"

        }), 500


# ============================================================
# GET PROFILE
# ============================================================

@auth.route("/profile", methods=["GET"])
def get_profile():

    try:

        payload = get_current_user()


        if not payload:

            return jsonify({

                "status": "error",

                "message": "Unauthorized"

            }), 401


        from bson import ObjectId


        user = users_collection.find_one({

            "_id": ObjectId(payload["user_id"])

        })


        if not user:

            return jsonify({

                "status": "error",

                "message": "User not found"

            }), 404


        return jsonify({

            "status": "success",

            "user": {

                "id": str(user["_id"]),

                "name": str(user.get("name", "")),

                "email": str(user.get("email", "")),

                "target_role": user.get("target_role"),

                "experience": user.get("experience"),

                "education": user.get("education"),

                "skills": user.get("skills", [])

            }

        }), 200


    except Exception as error:

        print("PROFILE FETCH ERROR:", error)

        return jsonify({

            "status": "error",

            "message": "Could not fetch profile"

        }), 500