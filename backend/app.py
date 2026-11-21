import os

from flask import Flask, jsonify
from flask_cors import CORS

from dotenv import load_dotenv

from pymongo import MongoClient


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# CREATE FLASK APP
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# IMPORT ROUTES
# ============================================================

from routes.auth import auth

from routes.job_trends import (
    job_trends,
    seed_job_trends,
)

from routes.skill_gap import skill_gap

from routes.learning import learning

from routes.youtube import youtube

from routes.resume_ai import resume_ai

from routes.career_roadmap import career_roadmap

from routes.career_recommendations import (
    career_recommendations,
)

from routes.roadmap_progress import (
    roadmap_progress,
)

# AI Assistant
from routes.ai_assistant import (
    ai_assistant,
)

# ML Role Prediction
from routes.ml_prediction import (
    ml_prediction,
)


# ============================================================
# MONGODB CONNECTION
# ============================================================

MONGO_URI = os.getenv(
    "MONGO_URI"
)


if not MONGO_URI:

    raise RuntimeError(
        "MONGO_URI is not set in the .env file"
    )


client = MongoClient(
    MONGO_URI
)


db = client["JobTrendAI"]


# ============================================================
# REGISTER BLUEPRINTS
# ============================================================

app.register_blueprint(
    auth,
    url_prefix="/api/auth"
)


app.register_blueprint(
    job_trends,
    url_prefix="/api/job-trends"
)


app.register_blueprint(
    skill_gap,
    url_prefix="/api/skill-gap"
)


app.register_blueprint(
    learning,
    url_prefix="/api/learning"
)


app.register_blueprint(
    youtube,
    url_prefix="/api/youtube"
)


app.register_blueprint(
    resume_ai,
    url_prefix="/api/resume-ai"
)


app.register_blueprint(
    career_roadmap,
    url_prefix="/api/career-roadmap"
)


app.register_blueprint(
    career_recommendations,
    url_prefix="/api/career-recommendations"
)


app.register_blueprint(
    roadmap_progress,
    url_prefix="/api/roadmap-progress"
)


# ============================================================
# AI ASSISTANT
# ============================================================

app.register_blueprint(
    ai_assistant,
    url_prefix="/api/ai-assistant"
)


# ============================================================
# ML ROLE PREDICTION
# ============================================================

app.register_blueprint(
    ml_prediction,
    url_prefix="/api/ml"
)


# ============================================================
# INITIALIZE JOB TREND DATA
# ============================================================

try:

    seed_job_trends()

    print(
        "Job trend data initialized successfully."
    )

except Exception as error:

    print(
        "JOB TREND SEED ERROR:",
        error
    )


# ============================================================
# HOME ROUTE
# ============================================================

@app.route("/")
def home():

    return jsonify({

        "status": "success",

        "message":
            "JobTrend AI Backend is running!",

        "version": "1.0.0"

    })


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/api/health")
def health():

    return jsonify({

        "status": "success",

        "message":
            "Backend is healthy"

    })


# ============================================================
# DATABASE TEST
# ============================================================

@app.route("/api/database-test")
def database_test():

    try:

        client.admin.command(
            "ping"
        )


        return jsonify({

            "status": "success",

            "message":
                "MongoDB connection successful!"

        })


    except Exception as error:

        print(
            "DATABASE ERROR:",
            error
        )


        return jsonify({

            "status": "error",

            "message":
                "MongoDB connection failed"

        }), 500


# ============================================================
# API INFORMATION
# ============================================================

@app.route("/api")
def api_info():

    return jsonify({

        "status": "success",

        "message":
            "JobTrend AI API",

        "available_routes": [

            # ------------------------------------------------
            # Health
            # ------------------------------------------------

            "/api/health",

            "/api/database-test",


            # ------------------------------------------------
            # Authentication
            # ------------------------------------------------

            "/api/auth/register",

            "/api/auth/login",

            "/api/auth/profile",


            # ------------------------------------------------
            # Job Trends
            # ------------------------------------------------

            "/api/job-trends/",

            "/api/job-trends/roles",

            "/api/job-trends/skills",

            "/api/job-trends/market-insights",


            # ------------------------------------------------
            # Skill Gap
            # ------------------------------------------------

            "/api/skill-gap/",


            # ------------------------------------------------
            # Learning
            # ------------------------------------------------

            "/api/learning/resources",

            "/api/learning/recommendations",


            # ------------------------------------------------
            # YouTube
            # ------------------------------------------------

            "/api/youtube/recommendations",


            # ------------------------------------------------
            # Resume AI
            # ------------------------------------------------

            "/api/resume-ai/analyze",


            # ------------------------------------------------
            # Career Roadmap
            # ------------------------------------------------

            "/api/career-roadmap/",

            "/api/career-roadmap/personalized",


            # ------------------------------------------------
            # Roadmap Progress
            # ------------------------------------------------

            "/api/roadmap-progress/",

            "/api/roadmap-progress/reset",


            # ------------------------------------------------
            # Career Recommendations
            # ------------------------------------------------

            "/api/career-recommendations/",


            # ------------------------------------------------
            # AI Assistant
            # ------------------------------------------------

            "/api/ai-assistant/",


            # ------------------------------------------------
            # ML Role Prediction
            # ------------------------------------------------

            "/api/ml/predict-role"

        ]

    })


# ============================================================
# ERROR HANDLER
# ============================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({

        "status": "error",

        "message":
            "API route not found."

    }), 404


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )