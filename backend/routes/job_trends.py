import os

import pandas as pd

from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv


# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()


# ==========================================
# BLUEPRINT
# ==========================================

job_trends = Blueprint(
    "job_trends",
    __name__
)


# ==========================================
# MONGODB CONNECTION
# ==========================================

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError(
        "MONGO_URI is not set in the .env file"
    )


client = MongoClient(MONGO_URI)

db = client["JobTrendAI"]

job_trends_collection = db["job_trends"]


# ==========================================
# JOB TREND DATA
# ==========================================

JOB_TREND_DATA = [

    {
        "role": "Software Engineer",

        "demand": "High",
        "demand_score": 86,
        "demand_growth": "+18%",

        "salary": "₹8.5L",
        "salary_min": 500000,
        "salary_max": 1500000,
        "salary_growth": "+12%",

        "openings": "42K+",
        "openings_count": 42000,
        "openings_growth": "+24%",

        "trend": "Strong",

        "skills": [
            "Python",
            "JavaScript",
            "React",
            "SQL",
            "Git",
            "REST APIs",
            "Data Structures"
        ],

        "companies": [
            "TCS",
            "Infosys",
            "Wipro",
            "Accenture",
            "Microsoft"
        ],

        "locations": [
            "Bangalore",
            "Hyderabad",
            "Pune",
            "Mumbai",
            "Chennai"
        ],

        "chart": [
            {"year": "2021", "jobs": 52},
            {"year": "2022", "jobs": 61},
            {"year": "2023", "jobs": 68},
            {"year": "2024", "jobs": 78},
            {"year": "2025", "jobs": 91},
            {"year": "2026", "jobs": 105}
        ]
    },


    {
        "role": "Data Scientist",

        "demand": "Very High",
        "demand_score": 94,
        "demand_growth": "+27%",

        "salary": "₹11.2L",
        "salary_min": 700000,
        "salary_max": 1800000,
        "salary_growth": "+15%",

        "openings": "18K+",
        "openings_count": 18000,
        "openings_growth": "+31%",

        "trend": "Rapidly Rising",

        "skills": [
            "Python",
            "SQL",
            "Machine Learning",
            "Statistics",
            "Pandas",
            "NumPy",
            "Power BI"
        ],

        "companies": [
            "Amazon",
            "Microsoft",
            "Google",
            "Walmart",
            "IBM"
        ],

        "locations": [
            "Bangalore",
            "Hyderabad",
            "Pune",
            "Delhi",
            "Mumbai"
        ],

        "chart": [
            {"year": "2021", "jobs": 35},
            {"year": "2022", "jobs": 44},
            {"year": "2023", "jobs": 57},
            {"year": "2024", "jobs": 69},
            {"year": "2025", "jobs": 86},
            {"year": "2026", "jobs": 112}
        ]
    },


    {
        "role": "Data Analyst",

        "demand": "High",
        "demand_score": 82,
        "demand_growth": "+16%",

        "salary": "₹6.8L",
        "salary_min": 400000,
        "salary_max": 1100000,
        "salary_growth": "+10%",

        "openings": "29K+",
        "openings_count": 29000,
        "openings_growth": "+19%",

        "trend": "Rising",

        "skills": [
            "SQL",
            "Excel",
            "Python",
            "Power BI",
            "Tableau",
            "Statistics",
            "Data Visualization"
        ],

        "companies": [
            "Deloitte",
            "Accenture",
            "EY",
            "KPMG",
            "Amazon"
        ],

        "locations": [
            "Bangalore",
            "Pune",
            "Hyderabad",
            "Mumbai",
            "Gurgaon"
        ],

        "chart": [
            {"year": "2021", "jobs": 48},
            {"year": "2022", "jobs": 55},
            {"year": "2023", "jobs": 63},
            {"year": "2024", "jobs": 71},
            {"year": "2025", "jobs": 79},
            {"year": "2026", "jobs": 91}
        ]
    },


    {
        "role": "Machine Learning Engineer",

        "demand": "Very High",
        "demand_score": 96,
        "demand_growth": "+34%",

        "salary": "₹12.5L",
        "salary_min": 800000,
        "salary_max": 2000000,
        "salary_growth": "+18%",

        "openings": "14K+",
        "openings_count": 14000,
        "openings_growth": "+38%",

        "trend": "Rapidly Rising",

        "skills": [
            "Python",
            "Machine Learning",
            "Deep Learning",
            "TensorFlow",
            "PyTorch",
            "Scikit-learn",
            "MLOps"
        ],

        "companies": [
            "Google",
            "Microsoft",
            "Amazon",
            "NVIDIA",
            "Adobe"
        ],

        "locations": [
            "Bangalore",
            "Hyderabad",
            "Pune",
            "Chennai",
            "Delhi"
        ],

        "chart": [
            {"year": "2021", "jobs": 28},
            {"year": "2022", "jobs": 39},
            {"year": "2023", "jobs": 51},
            {"year": "2024", "jobs": 68},
            {"year": "2025", "jobs": 89},
            {"year": "2026", "jobs": 121}
        ]
    },


    {
        "role": "AI Engineer",

        "demand": "Very High",
        "demand_score": 98,
        "demand_growth": "+42%",

        "salary": "₹13.8L",
        "salary_min": 900000,
        "salary_max": 2200000,
        "salary_growth": "+22%",

        "openings": "11K+",
        "openings_count": 11000,
        "openings_growth": "+45%",

        "trend": "Explosive Growth",

        "skills": [
            "Python",
            "Machine Learning",
            "Deep Learning",
            "Generative AI",
            "LLMs",
            "NLP",
            "LangChain"
        ],

        "companies": [
            "Microsoft",
            "Google",
            "Amazon",
            "OpenAI",
            "NVIDIA"
        ],

        "locations": [
            "Bangalore",
            "Hyderabad",
            "Pune",
            "Mumbai",
            "Delhi"
        ],

        "chart": [
            {"year": "2021", "jobs": 18},
            {"year": "2022", "jobs": 27},
            {"year": "2023", "jobs": 41},
            {"year": "2024", "jobs": 59},
            {"year": "2025", "jobs": 83},
            {"year": "2026", "jobs": 128}
        ]
    },


    {
        "role": "Web Developer",

        "demand": "High",
        "demand_score": 78,
        "demand_growth": "+13%",

        "salary": "₹6.2L",
        "salary_min": 350000,
        "salary_max": 1000000,
        "salary_growth": "+8%",

        "openings": "36K+",
        "openings_count": 36000,
        "openings_growth": "+15%",

        "trend": "Steady Growth",

        "skills": [
            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "Node.js",
            "Git",
            "REST APIs"
        ],

        "companies": [
            "TCS",
            "Infosys",
            "Wipro",
            "Accenture",
            "Cognizant"
        ],

        "locations": [
            "Bangalore",
            "Pune",
            "Hyderabad",
            "Chennai",
            "Mumbai"
        ],

        "chart": [
            {"year": "2021", "jobs": 55},
            {"year": "2022", "jobs": 59},
            {"year": "2023", "jobs": 65},
            {"year": "2024", "jobs": 70},
            {"year": "2025", "jobs": 76},
            {"year": "2026", "jobs": 83}
        ]
    },


    {
        "role": "Cloud Engineer",

        "demand": "Very High",
        "demand_score": 91,
        "demand_growth": "+29%",

        "salary": "₹10.8L",
        "salary_min": 650000,
        "salary_max": 1700000,
        "salary_growth": "+16%",

        "openings": "21K+",
        "openings_count": 21000,
        "openings_growth": "+27%",

        "trend": "Strong",

        "skills": [
            "AWS",
            "Azure",
            "Docker",
            "Kubernetes",
            "Linux",
            "Terraform",
            "Networking"
        ],

        "companies": [
            "Amazon",
            "Microsoft",
            "Google",
            "Accenture",
            "Deloitte"
        ],

        "locations": [
            "Bangalore",
            "Hyderabad",
            "Pune",
            "Mumbai",
            "Gurgaon"
        ],

        "chart": [
            {"year": "2021", "jobs": 31},
            {"year": "2022", "jobs": 40},
            {"year": "2023", "jobs": 52},
            {"year": "2024", "jobs": 66},
            {"year": "2025", "jobs": 82},
            {"year": "2026", "jobs": 103}
        ]
    },


    {
        "role": "Cybersecurity Analyst",

        "demand": "Very High",
        "demand_score": 89,
        "demand_growth": "+25%",

        "salary": "₹9.4L",
        "salary_min": 550000,
        "salary_max": 1500000,
        "salary_growth": "+14%",

        "openings": "16K+",
        "openings_count": 16000,
        "openings_growth": "+28%",

        "trend": "Rising",

        "skills": [
            "Network Security",
            "Linux",
            "Python",
            "SIEM",
            "Ethical Hacking",
            "Cloud Security",
            "Incident Response"
        ],

        "companies": [
            "IBM",
            "Deloitte",
            "Accenture",
            "Cisco",
            "Microsoft"
        ],

        "locations": [
            "Bangalore",
            "Hyderabad",
            "Pune",
            "Mumbai",
            "Delhi"
        ],

        "chart": [
            {"year": "2021", "jobs": 34},
            {"year": "2022", "jobs": 42},
            {"year": "2023", "jobs": 50},
            {"year": "2024", "jobs": 62},
            {"year": "2025", "jobs": 76},
            {"year": "2026", "jobs": 95}
        ]
    },


    {
        "role": "DevOps Engineer",

        "demand": "Very High",
        "demand_score": 92,
        "demand_growth": "+26%",

        "salary": "₹10.2L",
        "salary_min": 600000,
        "salary_max": 1600000,
        "salary_growth": "+15%",

        "openings": "19K+",
        "openings_count": 19000,
        "openings_growth": "+25%",

        "trend": "Strong",

        "skills": [
            "Linux",
            "Docker",
            "Kubernetes",
            "AWS",
            "CI/CD",
            "Jenkins",
            "Terraform"
        ],

        "companies": [
            "Amazon",
            "Microsoft",
            "Google",
            "Accenture",
            "Infosys"
        ],

        "locations": [
            "Bangalore",
            "Hyderabad",
            "Pune",
            "Chennai",
            "Gurgaon"
        ],

        "chart": [
            {"year": "2021", "jobs": 37},
            {"year": "2022", "jobs": 45},
            {"year": "2023", "jobs": 55},
            {"year": "2024", "jobs": 67},
            {"year": "2025", "jobs": 81},
            {"year": "2026", "jobs": 98}
        ]
    },


    {
        "role": "Product Manager",

        "demand": "High",
        "demand_score": 84,
        "demand_growth": "+15%",

        "salary": "₹14.1L",
        "salary_min": 900000,
        "salary_max": 2500000,
        "salary_growth": "+11%",

        "openings": "12K+",
        "openings_count": 12000,
        "openings_growth": "+18%",

        "trend": "Growing",

        "skills": [
            "Product Strategy",
            "Market Research",
            "Analytics",
            "Communication",
            "Agile",
            "User Research",
            "Leadership"
        ],

        "companies": [
            "Google",
            "Microsoft",
            "Amazon",
            "Flipkart",
            "Swiggy"
        ],

        "locations": [
            "Bangalore",
            "Mumbai",
            "Delhi",
            "Hyderabad",
            "Pune"
        ],

        "chart": [
            {"year": "2021", "jobs": 42},
            {"year": "2022", "jobs": 48},
            {"year": "2023", "jobs": 55},
            {"year": "2024", "jobs": 63},
            {"year": "2025", "jobs": 72},
            {"year": "2026", "jobs": 83}
        ]
    }

]


# ==========================================
# SEED DATA INTO MONGODB
# ==========================================

def seed_job_trends():

    try:

        for job in JOB_TREND_DATA:

            job_trends_collection.update_one(
                {
                    "role": job["role"]
                },
                {
                    "$set": job
                },
                upsert=True
            )

        print(
            "Job trend data is ready in MongoDB."
        )

    except Exception as error:

        print(
            "JOB TREND SEED ERROR:",
            error
        )


# ==========================================
# GET ALL ROLES
# ==========================================

@job_trends.route(
    "/roles",
    methods=["GET"]
)
def get_job_roles():

    try:

        roles = job_trends_collection.find(
            {},
            {
                "_id": 0,
                "role": 1
            }
        ).sort(
            "role",
            1
        )

        role_list = [
            item["role"]
            for item in roles
        ]

        return jsonify({
            "status": "success",
            "roles": role_list
        }), 200

    except Exception as error:

        print(
            "JOB ROLES ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": "Could not fetch job roles",
            "details": str(error)
        }), 500


# ==========================================
# GET SINGLE JOB TREND
# ==========================================

@job_trends.route(
    "/",
    methods=["GET"]
)
def get_job_trend():

    try:

        role = request.args.get(
            "role",
            "Software Engineer"
        )

        role = role.strip()

        job = job_trends_collection.find_one(
            {
                "role": role
            },
            {
                "_id": 0
            }
        )

        if not job:

            return jsonify({
                "status": "error",
                "message": "Job role not found",
                "role": role
            }), 404

        return jsonify({
            "status": "success",
            "data": job
        }), 200

    except Exception as error:

        print(
            "JOB TREND ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": "Could not fetch job trend",
            "details": str(error)
        }), 500


# ==========================================
# GET DATA-DRIVEN SKILL TRENDS
# ==========================================

@job_trends.route(
    "/skills",
    methods=["GET"]
)
def get_skill_trends():

    try:

        file_path = os.path.join(
            os.path.dirname(
                os.path.dirname(__file__)
            ),
            "data",
            "processed",
            "skill_trends.csv"
        )

        if not os.path.exists(file_path):

            return jsonify({
                "status": "error",
                "message": (
                    "Skill trend data not found. "
                    "Run skill_trends.py first."
                )
            }), 404

        df = pd.read_csv(file_path)

        df = df.fillna("")

        skills = df.to_dict(
            orient="records"
        )

        limit = request.args.get(
            "limit",
            default=20,
            type=int
        )

        if limit < 1:
            limit = 20

        skills = skills[:limit]

        return jsonify({
            "status": "success",
            "count": len(skills),
            "data": skills,
            "source": (
                "JobTrend AI processed "
                "job descriptions"
            )
        }), 200

    except Exception as error:

        print(
            "SKILL TREND ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": (
                "Could not fetch skill trend data"
            ),
            "details": str(error)
        }), 500


# ==========================================
# MARKET INSIGHTS
# ==========================================

@job_trends.route(
    "/market-insights",
    methods=["GET"]
)
def get_market_insights():

    try:

        # --------------------------------------
        # Locate processed job-posting dataset
        # --------------------------------------

        file_path = os.path.join(
            os.path.dirname(
                os.path.dirname(__file__)
            ),
            "data",
            "processed",
            "processed_job_postings.csv"
        )

        if not os.path.exists(file_path):

            return jsonify({
                "status": "error",
                "message": (
                    "Processed job-posting dataset "
                    "not found."
                )
            }), 404

        # --------------------------------------
        # Load dataset
        # --------------------------------------

        df = pd.read_csv(file_path)

        df = df.fillna("")

        # --------------------------------------
        # Total jobs
        # --------------------------------------

        total_jobs = len(df)

        # --------------------------------------
        # Find useful columns safely
        # --------------------------------------

        def find_column(possible_names):

            for name in possible_names:

                if name in df.columns:
                    return name

            return None

        category_column = find_column([
            "Category",
            "category",
            "Job Category",
            "job_category"
        ])

        location_column = find_column([
            "Location",
            "location",
            "Job Location",
            "job_location"
        ])

        workplace_column = find_column([
            "Workplace",
            "workplace",
            "Work Type",
            "work_type",
            "Workplace Type"
        ])

        employment_column = find_column([
            "Employment Type",
            "employment_type",
            "Employment",
            "employment"
        ])

        # --------------------------------------
        # Top categories
        # --------------------------------------

        top_categories = []

        if category_column:

            category_counts = (
                df[category_column]
                .astype(str)
                .str.strip()
                .replace("", pd.NA)
                .dropna()
                .value_counts()
                .head(10)
            )

            top_categories = [
                {
                    "name": str(index),
                    "count": int(value)
                }
                for index, value
                in category_counts.items()
            ]

        # --------------------------------------
        # Top locations
        # --------------------------------------

        top_locations = []

        if location_column:

            location_counts = (
                df[location_column]
                .astype(str)
                .str.strip()
                .replace("", pd.NA)
                .dropna()
                .value_counts()
                .head(10)
            )

            top_locations = [
                {
                    "name": str(index),
                    "count": int(value)
                }
                for index, value
                in location_counts.items()
            ]

        # --------------------------------------
        # Workplace distribution
        # --------------------------------------

        workplace = {}

        if workplace_column:

            workplace_counts = (
                df[workplace_column]
                .astype(str)
                .str.strip()
                .replace("", pd.NA)
                .dropna()
                .value_counts()
            )

            workplace = {
                str(index): int(value)
                for index, value
                in workplace_counts.items()
            }

        # --------------------------------------
        # Employment type distribution
        # --------------------------------------

        employment_type = {}

        if employment_column:

            employment_counts = (
                df[employment_column]
                .astype(str)
                .str.strip()
                .replace("", pd.NA)
                .dropna()
                .value_counts()
            )

            employment_type = {
                str(index): int(value)
                for index, value
                in employment_counts.items()
            }

        # --------------------------------------
        # Return result
        # --------------------------------------

        return jsonify({

            "status": "success",

            "data": {

                "total_jobs": total_jobs,

                "top_categories":
                    top_categories,

                "top_locations":
                    top_locations,

                "workplace":
                    workplace,

                "employment_type":
                    employment_type,

                "source":
                    "JobTrend AI processed "
                    "job-posting dataset"
            }

        }), 200

    except Exception as error:

        print(
            "MARKET INSIGHTS ERROR:",
            error
        )

        return jsonify({

            "status": "error",

            "message":
                "Could not load market insights",

            "details":
                str(error)

        }), 500


# ==========================================
# INITIALIZE / SEED JOB TREND DATA
# ==========================================

seed_job_trends()