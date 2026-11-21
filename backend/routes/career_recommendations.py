import os
from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

career_recommendations = Blueprint(
    "career_recommendations",
    __name__
)

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["JobTrendAI"]

job_trends_collection = db["job_trends"]


# --------------------------------------------------
# Skill normalization
# --------------------------------------------------

SKILL_ALIASES = {
    "python": "Python",
    "java": "Java",
    "javascript": "JavaScript",
    "java script": "JavaScript",
    "js": "JavaScript",

    "typescript": "TypeScript",
    "ts": "TypeScript",

    "c++": "C++",
    "cpp": "C++",

    "c#": "C#",
    "csharp": "C#",

    "sql": "SQL",

    "html": "HTML",
    "css": "CSS",

    "react": "React",
    "reactjs": "React",

    "angular": "Angular",
    "vue": "Vue",

    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",

    "express": "Express",
    "expressjs": "Express",

    "rest": "REST APIs",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",

    "pandas": "Pandas",
    "numpy": "NumPy",

    "statistics": "Statistics",
    "data analysis": "Data Analysis",
    "data visualization": "Data Visualization",

    "power bi": "Power BI",
    "tableau": "Tableau",
    "excel": "Excel",

    "machine learning": "Machine Learning",
    "ml": "Machine Learning",

    "deep learning": "Deep Learning",

    "artificial intelligence": "AI",
    "ai": "AI",

    "generative ai": "Generative AI",
    "gen ai": "Generative AI",

    "nlp": "NLP",
    "natural language processing": "NLP",

    "llm": "LLMs",
    "llms": "LLMs",
    "large language models": "LLMs",

    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "scikit learn": "Scikit-learn",
    "scikit-learn": "Scikit-learn",

    "opencv": "OpenCV",
    "langchain": "LangChain",
    "mlops": "MLOps",

    "aws": "AWS",
    "azure": "Azure",
    "google cloud": "Google Cloud",
    "gcp": "Google Cloud",

    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "terraform": "Terraform",

    "linux": "Linux",

    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",

    "ci/cd": "CI/CD",
    "jenkins": "Jenkins",

    "network security": "Network Security",
    "cybersecurity": "Cybersecurity",
    "cloud security": "Cloud Security",
    "ethical hacking": "Ethical Hacking",
    "penetration testing": "Penetration Testing",
    "pentesting": "Penetration Testing",

    "siem": "SIEM",
    "incident response": "Incident Response",

    "mongodb": "MongoDB",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "redis": "Redis",

    "data structures": "Data Structures",
    "algorithms": "Algorithms",

    "agile": "Agile",
    "scrum": "Scrum",

    "communication": "Communication",
    "leadership": "Leadership",
    "problem solving": "Problem Solving",
}


def normalize_skill(skill):
    """
    Convert different versions of a skill into one standard name.
    """

    if not skill:
        return ""

    cleaned = str(skill).strip().lower()

    return SKILL_ALIASES.get(
        cleaned,
        str(skill).strip()
    )


def normalize_skill_list(skills):
    """
    Normalize and remove duplicate skills.
    """

    normalized = []

    for skill in skills:
        value = normalize_skill(skill)

        if value and value.lower() not in {
            item.lower() for item in normalized
        }:
            normalized.append(value)

    return normalized


# --------------------------------------------------
# Career requirements
# --------------------------------------------------

ROLE_REQUIREMENTS = {

    "Software Engineer": [
        "Python",
        "Java",
        "JavaScript",
        "SQL",
        "Data Structures",
        "Algorithms",
        "Git",
        "REST APIs",
    ],

    "Data Scientist": [
        "Python",
        "SQL",
        "Pandas",
        "NumPy",
        "Statistics",
        "Data Analysis",
        "Machine Learning",
        "Data Visualization",
    ],

    "Data Analyst": [
        "SQL",
        "Excel",
        "Python",
        "Pandas",
        "Data Analysis",
        "Statistics",
        "Power BI",
        "Data Visualization",
    ],

    "Machine Learning Engineer": [
        "Python",
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch",
        "Scikit-learn",
        "SQL",
        "Git",
    ],

    "AI Engineer": [
        "Python",
        "Machine Learning",
        "Deep Learning",
        "AI",
        "Generative AI",
        "NLP",
        "LLMs",
        "TensorFlow",
        "PyTorch",
        "Git",
    ],

    "Web Developer": [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Node.js",
        "REST APIs",
        "Git",
    ],

    "Cloud Engineer": [
        "AWS",
        "Azure",
        "Google Cloud",
        "Linux",
        "Docker",
        "Kubernetes",
        "Terraform",
        "Git",
    ],

    "Cybersecurity Analyst": [
        "Cybersecurity",
        "Network Security",
        "Cloud Security",
        "SIEM",
        "Incident Response",
        "Linux",
    ],

    "DevOps Engineer": [
        "Linux",
        "Docker",
        "Kubernetes",
        "Terraform",
        "AWS",
        "CI/CD",
        "Jenkins",
        "Git",
    ],

    "Product Manager": [
        "Agile",
        "Scrum",
        "Communication",
        "Leadership",
        "Problem Solving",
        "Data Analysis",
    ],
}


# --------------------------------------------------
# Fallback job-trend information
# --------------------------------------------------

ROLE_MARKET_DATA = {

    "Software Engineer": {
        "demand_score": 92,
        "growth": 18,
    },

    "Data Scientist": {
        "demand_score": 88,
        "growth": 20,
    },

    "Data Analyst": {
        "demand_score": 86,
        "growth": 16,
    },

    "Machine Learning Engineer": {
        "demand_score": 95,
        "growth": 28,
    },

    "AI Engineer": {
        "demand_score": 98,
        "growth": 35,
    },

    "Web Developer": {
        "demand_score": 84,
        "growth": 14,
    },

    "Cloud Engineer": {
        "demand_score": 94,
        "growth": 24,
    },

    "Cybersecurity Analyst": {
        "demand_score": 93,
        "growth": 25,
    },

    "DevOps Engineer": {
        "demand_score": 91,
        "growth": 22,
    },

    "Product Manager": {
        "demand_score": 82,
        "growth": 12,
    },
}


# --------------------------------------------------
# Get market information
# --------------------------------------------------

def get_market_data(role):

    fallback = ROLE_MARKET_DATA.get(
        role,
        {
            "demand_score": 70,
            "growth": 10
        }
    )

    try:

        data = job_trends_collection.find_one(
            {"role": role},
            {"_id": 0}
        )

        if data:

            demand_score = data.get(
                "demand_score",
                fallback["demand_score"]
            )

            growth = data.get(
                "growth",
                fallback["growth"]
            )

            return {
                "demand_score": float(demand_score),
                "growth": float(growth),
            }

    except Exception as error:

        print(
            "JOB TREND LOOKUP ERROR:",
            error
        )

    return fallback


# --------------------------------------------------
# Recommendation calculation
# --------------------------------------------------

def calculate_recommendation(
    user_skills,
    role
):

    required_skills = ROLE_REQUIREMENTS[role]

    normalized_user_skills = {
        normalize_skill(skill).lower()
        for skill in user_skills
    }

    normalized_required = [
        normalize_skill(skill)
        for skill in required_skills
    ]

    matched_skills = []

    missing_skills = []

    for skill in normalized_required:

        if skill.lower() in normalized_user_skills:

            matched_skills.append(skill)

        else:

            missing_skills.append(skill)

    total_required = len(normalized_required)

    if total_required == 0:

        skill_match = 0

    else:

        skill_match = round(
            (
                len(matched_skills)
                / total_required
            ) * 100,
            1
        )

    market = get_market_data(role)

    demand_score = market["demand_score"]

    growth = market["growth"]

    # Growth contribution is capped at 100.
    growth_score = min(
        growth * 2,
        100
    )

    # Overall career recommendation score.
    recommendation_score = round(
        (
            skill_match * 0.70
            +
            demand_score * 0.15
            +
            growth_score * 0.15
        ),
        1
    )

    return {
        "role": role,

        "score": recommendation_score,

        "skill_match": skill_match,

        "matched_skills": matched_skills,

        "missing_skills": missing_skills,

        "required_skills": normalized_required,

        "demand_score": demand_score,

        "growth": growth,

        "demand": (
            "Very High"
            if demand_score >= 90
            else
            "High"
            if demand_score >= 80
            else
            "Medium"
        ),
    }


# --------------------------------------------------
# Main recommendation API
# --------------------------------------------------

@career_recommendations.route(
    "/",
    methods=["POST"]
)
def get_career_recommendations():

    try:

        data = request.get_json(
            silent=True
        ) or {}

        skills = data.get(
            "skills",
            []
        )

        if not isinstance(skills, list):

            return jsonify({
                "status": "error",
                "message": "Skills must be an array."
            }), 400

        # Remove empty values.
        skills = [
            str(skill).strip()
            for skill in skills
            if str(skill).strip()
        ]

        if not skills:

            return jsonify({
                "status": "error",
                "message": "Please provide at least one skill."
            }), 400

        normalized_skills = normalize_skill_list(
            skills
        )

        print(
            "CAREER RECOMMENDATION INPUT:",
            normalized_skills
        )

        recommendations = []

        for role in ROLE_REQUIREMENTS:

            result = calculate_recommendation(
                normalized_skills,
                role
            )

            recommendations.append(
                result
            )

        # --------------------------------------------------
        # IMPORTANT:
        # Do NOT remove low-match roles.
        # The frontend should always have useful results.
        # --------------------------------------------------

        recommendations.sort(
            key=lambda item: item["score"],
            reverse=True
        )

        # Keep top 5 careers.
        recommendations = recommendations[:5]

        # Add ranking number.
        for index, recommendation in enumerate(
            recommendations,
            start=1
        ):

            recommendation["rank"] = index

        print(
            "CAREER RECOMMENDATIONS:",
            [
                (
                    item["rank"],
                    item["role"],
                    item["skill_match"],
                    item["score"]
                )
                for item in recommendations
            ]
        )

        return jsonify({
            "status": "success",

            "skills_used": normalized_skills,

            "recommendations": recommendations,

            "count": len(recommendations)
        })

    except Exception as error:

        print(
            "CAREER RECOMMENDATION ERROR:",
            error
        )

        return jsonify({
            "status": "error",
            "message": "Unable to generate career recommendations.",
            "error": str(error)
        }), 500