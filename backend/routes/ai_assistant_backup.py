from flask import Blueprint, request, jsonify


from datetime import datetime, timezone


import os


import jwt


from dotenv import load_dotenv


from pymongo import MongoClient


load_dotenv()


ai_assistant = Blueprint(


    "ai_assistant",


    __name__


)


MONGO_URI = os.getenv("MONGO_URI")


JWT_SECRET = os.getenv("JWT_SECRET")


client = MongoClient(


    MONGO_URI


)


db = client["JobTrendAI"]


users_collection = db["users"]


job_trends_collection = db["job_trends"]


roadmap_progress_collection = db["roadmap_progress"]


# ============================================================


# SUPPORTED ROLES


# ============================================================


SUPPORTED_ROLES = [


    "Software Engineer",


    "Data Scientist",


    "Data Analyst",


    "Machine Learning Engineer",


    "AI Engineer",


    "Web Developer",


    "Cloud Engineer",


    "Cybersecurity Analyst",


    "DevOps Engineer",


    "Product Manager",


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


        return None


    except jwt.InvalidTokenError:


        return None


# ============================================================


# GET USER PROFILE


# ============================================================


def get_user_profile():


    user = get_current_user()


    if not user:


        return None


    user_id = user.get(


        "user_id"


    )


    if user_id:


        profile = users_collection.find_one(


            {


                "_id": user_id


            },


            {


                "_id": 0,


                "password": 0


            }


        )


        if profile:


            return profile


    email = user.get(


        "email"


    )


    if email:


        profile = users_collection.find_one(


            {


                "email": email


            },


            {


                "_id": 0,


                "password": 0


            }


        )


        if profile:


            return profile


    return None


# ============================================================


# NORMALIZE SKILLS


# ============================================================


def normalize_skills(skills):


    if not skills:


        return []


    if isinstance(


        skills,


        str


    ):


        skills = [


            skill.strip()


            for skill in skills.split(",")


            if skill.strip()


        ]


    if not isinstance(


        skills,


        list


    ):


        return []


    return [


        str(skill).strip()


        for skill in skills


        if str(skill).strip()


    ]


# ============================================================


# BUILD USER CONTEXT


# ============================================================


def build_user_context(


    frontend_context=None


):


    profile = get_user_profile()


    if profile:


        context = {


            "profile_available": True,


            "name": profile.get(


                "name",


                ""


            ),


            "target_role": profile.get(


                "target_role",


                ""


            ),


            "skills": normalize_skills(


                profile.get(


                    "skills",


                    []


                )


            ),


            "experience": profile.get(


                "experience",


                ""


            ),


            "education": profile.get(


                "education",


                ""


            ),


            "skill_gap": None,


            "resume_analysis": None,


        }


    else:


        context = {


            "profile_available": False,


            "name": "",


            "target_role": "",


            "skills": [],


            "experience": "",


            "education": "",


            "skill_gap": None,


            "resume_analysis": None,


        }


    # ========================================================


    # FRONTEND CONTEXT


    # ========================================================


    if isinstance(


        frontend_context,


        dict


    ):


        # ----------------------------------------------------


        # Skill Gap


        # ----------------------------------------------------


        skill_gap = frontend_context.get(


            "skillGap"


        )


        if skill_gap:


            context["skill_gap"] = skill_gap


        # ----------------------------------------------------


        # Resume AI


        # ----------------------------------------------------


        resume_analysis = frontend_context.get(


            "resumeAnalysis"


        )


        if resume_analysis:


            context["resume_analysis"] = (


                resume_analysis


            )


    return context


# ============================================================


# ROLE MARKET DATA


# ============================================================


def get_role_market_data(role):


    if not role:


        return None


    return job_trends_collection.find_one(


        {


            "role": role


        },


        {


            "_id": 0


        }


    )


# ============================================================


# ROADMAP PROGRESS


# ============================================================


def get_roadmap_progress(role):


    if not role:


        return None


    user = get_current_user()


    if not user:


        return None


    user_id = user.get(


        "user_id"


    )


    if not user_id:


        return None


    return roadmap_progress_collection.find_one(


        {


            "user_id": user_id,


            "role": role,


        },


        {


            "_id": 0


        }


    )


# ============================================================


# INTENT DETECTION


# ============================================================


def detect_intent(message):


    text = message.lower().strip()


    # Career recommendation


    if any(keyword in text for keyword in [


        "best career",


        "which career",


        "career for me",


        "career recommendation",


        "recommend a career",


        "what career",


    ]):


        return "career_recommendation"


    # Skill gap


    if any(keyword in text for keyword in [


        "skill gap",


        "missing skill",


        "missing skills",


        "skills am i missing",


        "skills do i need",


        "skills should i learn",


        "what skills am i missing",


        "what am i missing",


    ]):


        return "skill_gap"


    # Resume


    if any(keyword in text for keyword in [


        "resume",


        "cv",


        "ats",


        "resume score",


        "improve my resume",


        "resume improvement",


        "resume weak",


        "resume weakness",


        "resume strengths",


    ]):


        return "resume"


    # Learning


    if any(keyword in text for keyword in [


        "learn",


        "learning",


        "course",


        "courses",


        "tutorial",


        "youtube",


        "study",


        "how should i learn",


    ]):


        return "learning"


    # Roadmap


    if any(keyword in text for keyword in [


        "roadmap",


        "career path",


        "career plan",


        "what should i do next",


        "next step",


        "next steps",


    ]):


        return "roadmap"


    # Job trends


    if any(keyword in text for keyword in [


        "job trend",


        "job trends",


        "job market",


        "market demand",


        "job demand",


        "salary",


        "openings",


        "growth",


    ]):


        return "job_trends"


    # Profile


    if any(keyword in text for keyword in [


        "my profile",


        "my skills",


        "my target",


        "my career",


        "about me",


    ]):


        return "profile"


    # Greeting


    if text in [


        "hi",


        "hello",


        "hey",


        "hii",


        "helo",


        "good morning",


        "good afternoon",


        "good evening",


    ]:


        return "greeting"


    # Thanks


    if any(keyword in text for keyword in [


        "thank you",


        "thanks",


        "thank u",


    ]):


        return "thanks"


    return "general"


# ============================================================


# GREETING


# ============================================================


def greeting_response(context):


    name = context.get(


        "name",


        ""


    )


    target_role = context.get(


        "target_role",


        ""


    )


    if name and target_role:


        return (


            f"Hey {name}! 👋 You're currently working "


            f"toward becoming a {target_role}. I can help "


            "you with your skills, resume, job trends, "


            "learning plan and career roadmap."


        )


    if name:


        return (


            f"Hey {name}! 👋 I'm your JobTrend AI Career "


            "Assistant. I can help you explore careers, "


            "skills, resumes, learning and job trends."


        )


    return (


        "Hey! 👋 I'm your JobTrend AI Career Assistant. "


        "I can help you with careers, skills, resumes, "


        "learning, job trends and career roadmaps."


    )


# ============================================================


# PROFILE RESPONSE


# ============================================================


def profile_response(context):


    if not context.get(


        "profile_available"


    ):


        return (


            "I don't have your profile information yet. "


            "Open My Profile and add your target role, "


            "skills, experience and education."


        )


    name = context.get(


        "name",


        "User"


    )


    role = context.get(


        "target_role",


        "Not selected"


    )


    skills = context.get(


        "skills",


        []


    )


    experience = context.get(


        "experience",


        "Not specified"


    )


    education = context.get(


        "education",


        "Not specified"


    )


    skills_text = (


        ", ".join(skills)


        if skills


        else "No skills added yet"


    )


    return (


        f"Here's your current JobTrend AI profile, {name}:\n\n"


        f"🎯 Target role: {role}\n"


        f"🧠 Skills: {skills_text}\n"


        f"💼 Experience: {experience}\n"


        f"🎓 Education: {education}\n\n"


        "You can update these details from My Profile."


    )


# ============================================================


# CAREER RECOMMENDATION


# ============================================================


def career_recommendation_response(context):


    skills = context.get(


        "skills",


        []


    )


    target_role = context.get(


        "target_role",


        ""


    )


    if not skills:


        return (


            "I need some information about your current skills "


            "before I can give you a useful career direction. "


            "Add your skills in My Profile, then use Career "


            "Recommendations."


        )


    skills_lower = {


        skill.lower()


        for skill in skills


    }


    role_requirements = {


        "AI Engineer": [


            "Python",


            "Machine Learning",


            "Deep Learning",


            "Generative AI",


            "NLP",


        ],


        "Machine Learning Engineer": [


            "Python",


            "Machine Learning",


            "Deep Learning",


            "Scikit-learn",


            "TensorFlow",


            "PyTorch",


        ],


        "Data Scientist": [


            "Python",


            "Machine Learning",


            "Statistics",


            "Data Analysis",


            "SQL",


            "Pandas",


        ],


        "Data Analyst": [


            "SQL",


            "Excel",


            "Data Analysis",


            "Statistics",


            "Power BI",


            "Tableau",


        ],


        "Software Engineer": [


            "Python",


            "Java",


            "JavaScript",


            "SQL",


            "Git",


            "Data Structures",


            "Algorithms",


        ],


        "Web Developer": [


            "HTML",


            "CSS",


            "JavaScript",


            "React",


            "Node.js",


        ],


        "Cloud Engineer": [


            "AWS",


            "Azure",


            "Linux",


            "Docker",


            "Kubernetes",


        ],


        "DevOps Engineer": [


            "Linux",


            "Docker",


            "Kubernetes",


            "Git",


            "CI/CD",


            "AWS",


        ],


        "Cybersecurity Analyst": [


            "Cybersecurity",


            "Network Security",


            "Linux",


            "SIEM",


            "Incident Response",


        ],


        "Product Manager": [


            "Agile",


            "Scrum",


            "Communication",


            "Leadership",


            "Problem Solving",


        ],


    }


    role_scores = []


    for role, requirements in role_requirements.items():


        matched = []


        for skill in requirements:


            if skill.lower() in skills_lower:


                matched.append(


                    skill


                )


        score = round(


            (


                len(matched)


                /


                len(requirements)


            ) * 100


        )


        role_scores.append({


            "role": role,


            "score": score,


            "matched": matched,


        })


    role_scores.sort(


        key=lambda item: item["score"],


        reverse=True


    )


    top_roles = role_scores[:3]


    lines = [


        "Based on the skills in your profile, "


        "these career paths currently look strongest:\n"


    ]


    for index, role_data in enumerate(


        top_roles,


        start=1


    ):


        matched_text = (


            ", ".join(


                role_data["matched"]


            )


            if role_data["matched"]


            else "No direct matches yet"


        )


        lines.append(


            f"{index}. {role_data['role']} — "


            f"{role_data['score']}% skill match"


        )


        lines.append(


            f"   Matched: {matched_text}"


        )


    if target_role:


        lines.append(


            f"\nYour current target is {target_role}. "


            "Use Career Recommendations for the full "


            "market-based ranking."


        )


    return "\n".join(


        lines


    )


# ============================================================


# SKILL GAP RESPONSE


# ============================================================


def skill_gap_response(context):


    saved_skill_gap = context.get(


        "skill_gap"


    )


    # --------------------------------------------------------


    # Use actual Skill Gap analysis if available


    # --------------------------------------------------------


    if saved_skill_gap:


        data = saved_skill_gap


        if isinstance(


            saved_skill_gap,


            dict


        ):


            if isinstance(


                saved_skill_gap.get("data"),


                dict


            ):


                data = saved_skill_gap.get(


                    "data"


                )


        matched = (


            data.get(


                "matched_skills",


                []


            )


            or data.get(


                "matched",


                []


            )


        )


        missing = (


            data.get(


                "missing_skills",


                []


            )


            or data.get(


                "missing",


                []


            )


        )


        percentage = data.get(


            "skill_match_percentage"


        )


        if percentage is None:


            percentage = data.get(


                "match_percentage"


            )


        if percentage is None:


            percentage = data.get(


                "skill_match"


            )


        role = data.get(


            "role",


            context.get(


                "target_role",


                "your target role"


            )


        )


        response = (


            f"Based on your latest Skill Gap analysis "


            f"for {role}:\n\n"


        )


        if percentage is not None:


            response += (


                f"📊 Skill match: {percentage}%\n\n"


            )


        if matched:


            response += (


                "✅ Skills you already have:\n"


            )


            response += "\n".join(


                f"• {skill}"


                for skill in matched


            )


            response += "\n\n"


        if missing:


            response += (


                "🎯 Skills you should focus on next:\n"


            )


            response += "\n".join(


                f"• {skill}"


                for skill in missing


            )


            response += "\n\n"


        response += (


            "I'd recommend focusing on the missing skills "


            "one at a time, starting with the highest-priority "


            "skills in your Skill Gap results."


        )


        return response


    # --------------------------------------------------------


    # Fallback using profile


    # --------------------------------------------------------


    role = context.get(


        "target_role",


        ""


    )


    skills = context.get(


        "skills",


        []


    )


    if not role:


        return (


            "You haven't selected a target role yet. "


            "Go to My Profile and choose a target career, "


            "then use Skill Gap Predictor with a job description."


        )


    if not skills:


        return (


            f"Your target role is {role}, but I don't have "


            "your current skills yet. Add your skills in "


            "My Profile, then run Skill Gap Predictor."


        )


    return (


        f"Your target role is {role}. "


        "For the most accurate missing-skill analysis, "


        "run Skill Gap Predictor with your resume and "


        "a real job description."


    )


# ============================================================


# RESUME RESPONSE


# ============================================================


def resume_response(context):


    resume_analysis = context.get(


        "resume_analysis"


    )


    # --------------------------------------------------------


    # Use actual Resume AI analysis


    # --------------------------------------------------------


    if resume_analysis:


        data = resume_analysis


        if isinstance(


            resume_analysis,


            dict


        ):


            if isinstance(


                resume_analysis.get("data"),


                dict


            ):


                data = resume_analysis.get(


                    "data"


                )


        score = (


            data.get(


                "ats_score"


            )


            if data.get(


                "ats_score"


            ) is not None


            else data.get(


                "score"


            )


        )


        skills = (


            data.get(


                "skills",


                []


            )


            or data.get(


                "detected_skills",


                []


            )


        )


        strengths = data.get(


            "strengths",


            []


        )


        weaknesses = data.get(


            "weaknesses",


            []


        )


        suggestions = data.get(


            "suggestions",


            []


        )


        response = (


            "Here is what I found from your latest "


            "Resume AI analysis:\n\n"


        )


        if score is not None:


            response += (


                f"📊 ATS-style score: {score}\n\n"


            )


        if skills:


            response += (


                "🧠 Detected skills:\n"


            )


            response += "\n".join(


                f"• {skill}"


                for skill in skills[:15]


            )


            response += "\n\n"


        if strengths:


            response += (


                "✅ Strengths:\n"


            )


            response += "\n".join(


                f"• {item}"


                for item in strengths[:5]


            )


            response += "\n\n"


        if weaknesses:


            response += (


                "⚠️ Areas to improve:\n"


            )


            response += "\n".join(


                f"• {item}"


                for item in weaknesses[:5]


            )


            response += "\n\n"


        if suggestions:


            response += (


                "💡 Suggestions:\n"


            )


            response += "\n".join(


                f"• {item}"


                for item in suggestions[:5]


            )


        if (


            not score


            and not skills


            and not strengths


            and not weaknesses


            and not suggestions


        ):


            response += (


                "I received your Resume AI result, "


                "but the saved analysis doesn't contain "


                "enough details to summarize it."


            )


        return response


    # --------------------------------------------------------


    # No saved resume


    # --------------------------------------------------------


    return (


        "I don't have a recent Resume AI analysis available. "


        "Go to Resume AI, upload your PDF resume and click "


        "Analyze Resume. Then come back here and ask me "


        "about your resume."


    )


# ============================================================


# LEARNING RESPONSE


# ============================================================


def learning_response(context):


    skill_gap = context.get(


        "skill_gap"


    )


    if skill_gap:


        data = skill_gap


        if isinstance(


            skill_gap,


            dict


        ):


            if isinstance(


                skill_gap.get("data"),


                dict


            ):


                data = skill_gap.get(


                    "data"


                )


        missing = (


            data.get(


                "missing_skills",


                []


            )


            or data.get(


                "missing",


                []


            )


        )


        if missing:


            return (


                "Based on your latest Skill Gap analysis, "


                "these are the skills I'd prioritize learning:\n\n"


                + "\n".join(


                    f"• {skill}"


                    for skill in missing


                )


                + "\n\n"


                "Open Learning Hub to find tutorials and "


                "courses for these skills."


            )


    role = context.get(


        "target_role",


        ""


    )


    if role:


        return (


            f"Since you're targeting {role}, I recommend "


            "learning the skills required for that role in "


            "a structured order.\n\n"


            "Start with your biggest Skill Gap, then use the "


            "Learning Hub to find both popular tutorials and "


            "underrated hidden-gem resources."


        )


    return (


        "Start by choosing a target role in My Profile. "


        "Then use Skill Gap Predictor to identify missing "


        "skills and Learning Hub to find tutorials for them."


    )


# ============================================================


# ROADMAP RESPONSE


# ============================================================


def roadmap_response(context):


    role = context.get(


        "target_role",


        ""


    )


    if not role:


        return (


            "Choose a target career in My Profile first. "


            "Then Career Roadmap can provide a structured "


            "learning path for that role."


        )


    progress = get_roadmap_progress(


        role


    )


    if not progress:


        return (


            f"Your current target is {role}. "


            "Your Career Roadmap is ready to help you progress "


            "from foundational skills toward job readiness. "


            "Open Career Roadmap to begin."


        )


    completed_items = progress.get(


        "completed_items",


        []


    )


    completed_count = len(


        completed_items


    )


    return (


        f"You're working toward {role}. "


        f"You currently have {completed_count} roadmap "


        "item(s) marked as completed.\n\n"


        "Keep completing the roadmap step by step and use "


        "Learning Hub whenever you need resources for a skill."


    )


# ============================================================


# JOB TREND RESPONSE


# ============================================================


def job_trend_response(context):


    role = context.get(


        "target_role",


        ""


    )


    if role:


        role_data = get_role_market_data(


            role


        )


        if role_data:


            demand = role_data.get(


                "demand",


                "Not available"


            )


            growth = role_data.get(


                "growth",


                "Not available"


            )


            salary = role_data.get(


                "salary",


                "Not available"


            )


            openings = role_data.get(


                "openings",


                "Not available"


            )


            return (


                f"Here's the current JobTrend AI snapshot "


                f"for {role}:\n\n"


                f"📈 Demand: {demand}\n"


                f"🚀 Growth: {growth}\n"


                f"💰 Salary: {salary}\n"


                f"💼 Openings: {openings}\n\n"


                "Open Job Trends for the full chart and "


                "market breakdown."


            )


    return (


        "Job Trends lets you compare demand, growth, salary, "


        "openings and required skills across supported technology "


        "roles. Choose a target role in your profile for a more "


        "personalized market summary."


    )


# ============================================================


# GENERAL RESPONSE


# ============================================================


def general_response(context):


    role = context.get(


        "target_role",


        ""


    )


    if role:


        return (


            f"I can help you with your {role} career journey. "


            "You can ask me about your skill gap, resume, "


            "learning plan, roadmap, job trends or career options.\n\n"


            "For example:\n"


            "• What skills am I missing?\n"


            "• What is wrong with my resume?\n"


            "• How can I improve my ATS score?\n"


            "• What should I learn next?\n"


            "• How is the job market for my role?\n"


            "• What should I do next?"


        )


    return (


        "I can help with your career journey. Try asking:\n\n"


        "• Which career is best for me?\n"


        "• What skills am I missing?\n"


        "• What is wrong with my resume?\n"


        "• How can I improve my ATS score?\n"


        "• What should I learn?\n"


        "• How do I build my career roadmap?\n"


        "• Tell me about job trends."


    )


# ============================================================


# ============================================================

# FREE CAREER ASSISTANT - NO EXTERNAL AI API REQUIRED

# ============================================================


def free_career_response(message, context):
    """Provide structured, role-aware career guidance using local templates."""
    import re

    text = str(message or "").lower().strip()
    context = context or {}
    role = str(context.get("target_role") or "").strip()

    if not role:
        if "data scientist" in text or "data science" in text:
            role = "Data Scientist"
        elif "data analyst" in text or "data analytics" in text:
            role = "Data Analyst"
        elif "machine learning" in text or "ml engineer" in text:
            role = "Machine Learning Engineer"
        elif "web developer" in text or "web development" in text:
            role = "Web Developer"
        elif "python developer" in text:
            role = "Python Developer"
        else:
            role = "your target career"

    skills = normalize_skills(context.get("skills"))
    skill_list = ", ".join(skills) if skills else "not listed in your profile"

    asks_for_plan = any(term in text for term in (
        "learning plan", "study plan", "learning path", "learn next",
        "what should i learn", "how do i start", "beginner",
        "30-day", "30 day", "30 days", "daily tasks", "each day",
        "every day", "day-by-day", "day by day", "study schedule",
        "daily schedule", "daily task",
    ))

    if asks_for_plan:
        if "data scientist" in role.lower() or "data science" in role.lower():
            topics = [
                ("Python basics", "Practise variables, data types, conditions, and loops."),
                ("Python functions", "Write functions and practise lists, dictionaries, and error handling."),
                ("NumPy", "Create arrays and practise indexing, filtering, and calculations."),
                ("Pandas", "Load a CSV file and practise selecting, filtering, and sorting data."),
                ("Data cleaning", "Handle missing values, duplicates, and incorrect data types."),
                ("Exploratory analysis", "Calculate summary statistics and inspect distributions."),
                ("Matplotlib", "Create a bar chart, line chart, and histogram."),
                ("Data storytelling", "Write five observations from a dataset and support them with charts."),
                ("SQL basics", "Practise SELECT, WHERE, ORDER BY, and LIMIT."),
                ("SQL aggregation", "Practise GROUP BY, COUNT, SUM, AVG, and HAVING."),
                ("SQL joins", "Join two related tables and explain the result."),
                ("Statistics", "Review mean, median, variance, standard deviation, and percentiles."),
                ("Probability", "Practise basic probability and conditional probability."),
                ("Hypothesis testing", "Learn null hypotheses and p-values, including interpretation limits."),
                ("Feature relationships", "Explore correlation and explain why correlation is not causation."),
                ("Scikit-learn", "Create a train/test split and fit a simple model."),
                ("Regression", "Train a linear regression model and evaluate predictions."),
                ("Classification", "Train a classification model and inspect its predictions."),
                ("Model evaluation", "Practise accuracy, precision, recall, and F1 score."),
                ("Data leakage", "Learn how leakage happens and keep test data separate."),
                ("Project 1 planning", "Choose a public dataset and define one question to investigate."),
                ("Project 1 cleaning", "Clean the dataset and document your decisions."),
                ("Project 1 analysis", "Perform exploratory analysis and create at least three charts."),
                ("Project 1 conclusions", "Write a short report with findings and limitations."),
                ("Project 2 planning", "Choose a prediction problem and define the target variable."),
                ("Project 2 modelling", "Build a baseline model using Scikit-learn."),
                ("Project 2 evaluation", "Evaluate the model with a suitable metric and explain the result."),
                ("Project 2 improvement", "Try one improvement and compare it with the baseline."),
                ("Portfolio", "Create GitHub repositories with README files, setup steps, and screenshots."),
                ("Review and interview practice", "Review weak topics and explain both projects aloud."),
            ]
        elif "data analyst" in role.lower():
            topics = [
                ("Spreadsheet basics", "Practise sorting, filtering, formulas, and data types."),
                ("Spreadsheet formulas", "Use IF, SUMIF, COUNTIF, and lookup functions."),
                ("Data cleaning", "Fix missing values, duplicates, and inconsistent categories."),
                ("Pivot tables", "Summarize a dataset with pivot tables."),
                ("Charts", "Create clear charts and label them correctly."),
                ("SQL SELECT", "Practise SELECT, WHERE, ORDER BY, and LIMIT."),
                ("SQL aggregation", "Practise GROUP BY, COUNT, SUM, and AVG."),
                ("SQL joins", "Join two tables and verify row counts."),
                ("SQL subqueries", "Write a subquery to answer a business question."),
                ("SQL practice", "Solve five beginner SQL questions."),
                ("Statistics", "Review mean, median, percentages, and distributions."),
                ("Business metrics", "Calculate growth, conversion rate, and retention."),
                ("Dashboard planning", "Choose a dataset and define the dashboard audience."),
                ("Dashboard charts", "Build charts that answer specific business questions."),
                ("Dashboard filters", "Add useful filters and verify interactions."),
                ("Data storytelling", "Write three findings supported by data."),
                ("Project 1 planning", "Choose a sales or public business dataset."),
                ("Project 1 cleaning", "Clean and document the dataset."),
                ("Project 1 analysis", "Answer five questions using SQL or spreadsheets."),
                ("Project 1 presentation", "Create charts and summarize recommendations."),
                ("Project 2 planning", "Choose a second dataset and define key metrics."),
                ("Project 2 dashboard", "Build a dashboard around the key metrics."),
                ("Project 2 validation", "Check calculations and investigate anomalies."),
                ("Project 2 storytelling", "Write a concise executive summary."),
                ("Portfolio setup", "Create a GitHub repository and project README."),
                ("SQL interview practice", "Solve five SQL questions without looking at solutions."),
                ("Metrics interview practice", "Explain how you would measure a product or business change."),
                ("Dashboard review", "Ask someone to review your dashboard and improve clarity."),
                ("Resume", "Describe your projects, tools, and findings accurately."),
                ("Final review", "Present both projects and review topics that still feel difficult."),
            ]
        else:
            topics = [
                ("Role research", f"Read job descriptions for {role} and list recurring requirements."),
                ("Foundations", "Study core concepts and terminology for your target role."),
                ("Environment setup", "Set up the tools and development environment used in your field."),
                ("Core practice", "Complete a beginner exercise using one core skill."),
                ("Review", "Summarize what you learned and identify confusing concepts."),
                ("Skill practice", "Complete a small task using a frequently requested skill."),
                ("Documentation", "Read official documentation for one tool you need."),
                ("Mini exercise", "Build a small example that demonstrates the tool."),
                ("Problem solving", "Solve three beginner problems in your target field."),
                ("Review", "Review your notes and repeat difficult exercises."),
                ("Project planning", "Choose a beginner project that solves a clear problem."),
                ("Project setup", "Create the project folder and write a short plan."),
                ("Project implementation", "Build the first working feature."),
                ("Project implementation", "Add a second useful feature."),
                ("Testing", "Test common inputs and handle errors."),
                ("Project review", "Fix problems and document what you learned."),
                ("Second project", "Choose a practical project related to a real job requirement."),
                ("Second project", "Build its basic functionality."),
                ("Second project", "Add validation and test important cases."),
                ("Second project", "Document setup instructions and limitations."),
                ("Portfolio", "Organize both projects and prepare screenshots or a demo."),
                ("Git and GitHub", "Publish your work and write clear README files."),
                ("Role skills", "Practise another frequently requested skill from job descriptions."),
                ("Problem solving", "Complete an exercise that combines two skills."),
                ("Resume", "Describe your projects and contributions accurately."),
                ("Interview practice", "Practise common technical questions for your target role."),
                ("Project explanation", "Explain the problem, approach, results, and trade-offs of each project."),
                ("Mock interview", "Answer practice questions aloud and note weak areas."),
                ("Gap review", "Review remaining gaps and choose the next learning priority."),
                ("Final review", "Summarize progress and plan the next month of learning."),
            ]

        match = re.search(r"\b(7|14|21|30)\s*[- ]?\s*days?\b", text)
        duration = int(match.group(1)) if match else 30
        duration = min(duration, 30)

        lines = [
            f"{duration}-DAY LEARNING PLAN: {role}",
            "",
            "Suggested daily commitment: 1–2 hours; adjust to your schedule.",
            "",
        ]
        for day, (topic, task) in enumerate(topics[:duration], start=1):
            lines.extend([f"Day {day} — {topic}", f"Task: {task}", ""])

        if "data scientist" in role.lower() or "data science" in role.lower():
            lines.extend([
                "PROJECTS TO BUILD",
                "1. Exploratory Data Analysis: clean a public dataset, create visualizations, and explain five findings.",
                "2. Prediction Model: train a beginner Scikit-learn model, evaluate it, and document its limitations.",
                "",
            ])
        elif "data analyst" in role.lower():
            lines.extend([
                "PROJECTS TO BUILD",
                "1. Business Analysis: analyse a public sales dataset with SQL or spreadsheets and explain your findings.",
                "2. Dashboard Project: build a dashboard with key metrics, charts, filters, and recommendations.",
                "",
            ])
        else:
            lines.extend([
                "PROJECTS TO BUILD",
                "1. Beginner project: build a small tool that solves one clear problem.",
                "2. Portfolio project: build and document a more complete solution using skills from your plan.",
                "",
            ])

        lines.extend([
            "SKILLS LISTED IN YOUR PROFILE",
            skill_list,
            "",
            "NEXT STEPS",
            "Use Skill Gap Predictor to compare your skills with a real job description, then use Learning Hub to find resources for the gaps.",
        ])
        return "\n".join(lines)

    if any(term in text for term in ("project", "projects", "portfolio", "what can i build")):
        if "data scientist" in role.lower() or "data science" in role.lower():
            return (
                "PROJECT IDEAS FOR DATA SCIENCE\n\n"
                "1. Exploratory Data Analysis: clean a public dataset, create visualizations, and explain five findings.\n"
                "2. Prediction Model: train a beginner Scikit-learn model, compare it with a baseline, and report evaluation metrics.\n"
                "3. Portfolio extension: document methodology, results, limitations, and next steps.\n\n"
                "Publish your code on GitHub with a README, setup instructions, and screenshots."
            )
        return (
            f"PROJECT IDEAS FOR {role}\n\n"
            "1. Beginner project: build a small tool that solves one clear problem.\n"
            "2. Practical project: analyse a public dataset or automate a repetitive task.\n"
            "3. Portfolio project: build a complete solution with testing and documentation.\n\n"
            "Publish your work on GitHub with a README, setup instructions, and screenshots."
        )

    if any(term in text for term in ("interview", "interviews", "prepare for interview")):
        return (
            f"INTERVIEW PREPARATION — {role}\n\n"
            "1. Review core concepts from relevant job descriptions.\n"
            "2. Practise technical questions in short daily sessions.\n"
            "3. Prepare two projects you can explain from problem to solution.\n"
            "4. Practise behavioural questions using the STAR method.\n"
            "5. Complete a mock interview and review weak areas.\n\n"
            "Focus on explaining your reasoning clearly, not just memorizing answers."
        )

    if any(term in text for term in ("skill", "skills", "missing", "improve", "weakness")):
        return (
            f"SKILL DEVELOPMENT — {role}\n\n"
            f"Skills listed in your profile: {skill_list}.\n\n"
            "1. Review real job descriptions for your target role.\n"
            "2. List frequently requested skills.\n"
            "3. Compare those requirements with your current skills.\n"
            "4. Choose one important gap and practise it with a small project.\n"
            "5. Use Skill Gap Predictor for a resume/job-description comparison.\n"
            "6. Use Learning Hub to find resources for missing skills."
        )

    if any(term in text for term in ("career", "which role", "career path", "career choice")):
        return (
            "To explore career options, start with tasks you enjoy, current skills, and preferred work. "
            "JobTrend AI supports " + ", ".join(SUPPORTED_ROLES) + ". "
            "Add your skills in My Profile and use Career Recommendations to compare possible roles."
        )

    return (
        f"I can help you plan your career toward {role}.\n\n"
        "Try asking for a learning plan, portfolio projects, interview preparation, skill development, "
        "or help reviewing your profile, resume, roadmap, or job trends.\n\n"
        "For a personalized skills comparison, use Skill Gap Predictor with a real job description."
    )

def generate_response(message, context):

    intent = detect_intent(message)

    text = str(message or "").lower().strip()


    complex_question = (

        len(text) > 100

        or any(phrase in text for phrase in (

            "learning plan", "30-day", "30 day",

            "recommend three projects", "three projects",

            "prepare for interviews", "what should i learn next",

            "personalized plan", "study plan",

        ))

    )


    if complex_question:

        return free_career_response(message, context)


    if intent == "greeting":

        return greeting_response(context)

    if intent == "thanks":

        return (

            "You're welcome! 😊 Keep moving forward one skill at a time. "

            "I'm here whenever you need career guidance."

        )

    if intent == "profile":

        return profile_response(context)

    if intent == "career_recommendation":

        return career_recommendation_response(context)

    if intent == "skill_gap":

        return skill_gap_response(context)

    if intent == "resume":

        return resume_response(context)

    if intent == "learning":

        return learning_response(context)

    if intent == "roadmap":

        return roadmap_response(context)

    if intent == "job_trends":

        return job_trend_response(context)


    return free_career_response(message, context)


# CHAT ENDPOINT


# ============================================================


@ai_assistant.route(


    "/",


    methods=["POST"]


)


def chat():


    try:


        data = request.get_json(


            silent=True


        ) or {}


        message = str(


            data.get(


                "message",


                ""


            )


        ).strip()


        if not message:


            return jsonify({


                "status": "error",


                "message":


                    "Message is required."


            }), 400


        # Frontend context


        frontend_context = data.get(


            "context",


            {}


        )


        # Build personalized context


        context = build_user_context(


            frontend_context


        )


        # Generate response


        response = generate_response(


            message,


            context


        )


        return jsonify({


            "status": "success",


            "data": {


                "message": response,


                "intent":


                    detect_intent(


                        message


                    ),


                "context": {


                    "profile_available":


                        context[


                            "profile_available"


                        ],


                    "target_role":


                        context[


                            "target_role"


                        ],


                    "skill_gap_available":


                        bool(


                            context.get(


                                "skill_gap"


                            )


                        ),


                    "resume_analysis_available":


                        bool(


                            context.get(


                                "resume_analysis"


                            )


                        ),


                },


                "timestamp":


                    datetime.now(


                        timezone.utc


                    ).isoformat(),


                "assistant":


                    "JobTrend AI Career Assistant",


            }


        }), 200


    except Exception as error:


        print(


            "AI ASSISTANT ERROR:",


            error


        )


        return jsonify({


            "status": "error",


            "message":


                "Could not process your message."


        }), 500
