from flask import Blueprint, request, jsonify


career_roadmap = Blueprint(
    "career_roadmap",
    __name__
)


# ============================================================
# ROADMAP DATA
# ============================================================

ROADMAP_DATA = {

    "Software Engineer": {

        "foundation": [
            "Programming fundamentals",
            "Object-Oriented Programming",
            "Data Structures",
            "Algorithms",
            "Git and GitHub"
        ],

        "core_skills": [
            "Python or Java",
            "SQL",
            "REST APIs",
            "Database fundamentals",
            "Software development practices"
        ],

        "advanced_skills": [
            "System Design",
            "Cloud Computing",
            "Docker",
            "Testing",
            "CI/CD"
        ],

        "projects": [
            "Build a full-stack web application",
            "Build a REST API",
            "Build an authentication system",
            "Build a cloud-deployed application"
        ],

        "certifications": [
            "AWS Cloud Practitioner",
            "Microsoft Azure Fundamentals",
            "GitHub Foundations"
        ],

        "interview": [
            "Data Structures and Algorithms",
            "Object-Oriented Design",
            "System Design basics",
            "SQL interview questions",
            "Behavioral interview preparation"
        ]
    },


    "Data Scientist": {

        "foundation": [
            "Python",
            "Statistics",
            "Probability",
            "SQL",
            "Data Analysis"
        ],

        "core_skills": [
            "Pandas",
            "NumPy",
            "Data Visualization",
            "Scikit-learn",
            "Exploratory Data Analysis"
        ],

        "advanced_skills": [
            "Machine Learning",
            "Deep Learning",
            "NLP",
            "Feature Engineering",
            "Model Evaluation"
        ],

        "projects": [
            "Exploratory data analysis project",
            "Customer churn prediction",
            "House price prediction",
            "End-to-end machine learning project"
        ],

        "certifications": [
            "Google Data Analytics",
            "IBM Data Science",
            "Microsoft Power BI"
        ],

        "interview": [
            "Statistics questions",
            "Machine learning fundamentals",
            "Python coding",
            "SQL problems",
            "Case study interviews"
        ]
    },


    "Data Analyst": {

        "foundation": [
            "Excel",
            "SQL",
            "Statistics",
            "Data Cleaning"
        ],

        "core_skills": [
            "Python",
            "Pandas",
            "Data Visualization",
            "Power BI",
            "Tableau"
        ],

        "advanced_skills": [
            "Advanced SQL",
            "Business Intelligence",
            "Dashboard Design",
            "Predictive Analytics"
        ],

        "projects": [
            "Sales dashboard",
            "Customer analytics project",
            "Business KPI dashboard",
            "End-to-end data analysis project"
        ],

        "certifications": [
            "Google Data Analytics",
            "Microsoft Power BI",
            "Tableau certification"
        ],

        "interview": [
            "SQL queries",
            "Excel problems",
            "Statistics",
            "Data interpretation",
            "Business case studies"
        ]
    },


    "Machine Learning Engineer": {

        "foundation": [
            "Python",
            "Linear Algebra",
            "Statistics",
            "Data Structures",
            "SQL"
        ],

        "core_skills": [
            "NumPy",
            "Pandas",
            "Scikit-learn",
            "Machine Learning",
            "Data Preprocessing"
        ],

        "advanced_skills": [
            "Deep Learning",
            "TensorFlow or PyTorch",
            "MLOps",
            "Docker",
            "Cloud Computing"
        ],

        "projects": [
            "Machine learning prediction system",
            "Recommendation system",
            "Image classification system",
            "End-to-end ML deployment"
        ],

        "certifications": [
            "AWS Machine Learning",
            "Google Professional ML Engineer",
            "TensorFlow Developer"
        ],

        "interview": [
            "Machine learning theory",
            "Python coding",
            "Model evaluation",
            "ML system design",
            "Probability and statistics"
        ]
    },


    "AI Engineer": {

        "foundation": [
            "Python",
            "Programming fundamentals",
            "Statistics",
            "Linear Algebra",
            "Git and GitHub"
        ],

        "core_skills": [
            "Machine Learning",
            "Deep Learning",
            "NLP",
            "SQL",
            "REST APIs",
            "NumPy",
            "Pandas",
            "Scikit-learn"
        ],

        "advanced_skills": [
            "Generative AI",
            "LLMs",
            "LangChain",
            "RAG",
            "Vector Databases",
            "MLOps",
            "Cloud Computing"
        ],

        "projects": [
            "AI chatbot",
            "RAG-based document assistant",
            "Recommendation system",
            "Computer vision application",
            "LLM-powered career assistant"
        ],

        "certifications": [
            "AWS AI Practitioner",
            "Google Cloud AI",
            "Microsoft Azure AI Fundamentals"
        ],

        "interview": [
            "Python coding",
            "Machine learning",
            "Deep learning",
            "LLM fundamentals",
            "RAG architecture",
            "AI system design"
        ]
    },


    "Web Developer": {

        "foundation": [
            "HTML",
            "CSS",
            "JavaScript",
            "Git"
        ],

        "core_skills": [
            "React",
            "Node.js",
            "REST APIs",
            "SQL",
            "MongoDB"
        ],

        "advanced_skills": [
            "TypeScript",
            "Next.js",
            "Docker",
            "Cloud deployment",
            "CI/CD"
        ],

        "projects": [
            "Portfolio website",
            "E-commerce application",
            "Full-stack social application",
            "Real-time web application"
        ],

        "certifications": [
            "Meta Front-End Developer",
            "AWS Cloud Practitioner",
            "GitHub Foundations"
        ],

        "interview": [
            "JavaScript",
            "React",
            "HTML/CSS",
            "REST APIs",
            "Frontend system design"
        ]
    },


    "Cloud Engineer": {

        "foundation": [
            "Linux",
            "Networking",
            "Git",
            "Cloud fundamentals"
        ],

        "core_skills": [
            "AWS",
            "Azure",
            "Docker",
            "Linux",
            "Networking"
        ],

        "advanced_skills": [
            "Kubernetes",
            "Terraform",
            "CI/CD",
            "Cloud Security",
            "Infrastructure as Code"
        ],

        "projects": [
            "Deploy a web application",
            "Build cloud infrastructure",
            "Dockerize an application",
            "Kubernetes deployment"
        ],

        "certifications": [
            "AWS Solutions Architect",
            "Azure Administrator",
            "Google Cloud Associate"
        ],

        "interview": [
            "Cloud architecture",
            "Networking",
            "Linux",
            "Docker",
            "Kubernetes"
        ]
    },


    "Cybersecurity Analyst": {

        "foundation": [
            "Networking",
            "Linux",
            "Operating Systems",
            "Cybersecurity fundamentals"
        ],

        "core_skills": [
            "Network Security",
            "SIEM",
            "Incident Response",
            "Security Monitoring",
            "Linux"
        ],

        "advanced_skills": [
            "Ethical Hacking",
            "Penetration Testing",
            "Cloud Security",
            "Threat Intelligence",
            "Security Automation"
        ],

        "projects": [
            "Security monitoring dashboard",
            "Network security lab",
            "SIEM project",
            "Vulnerability assessment"
        ],

        "certifications": [
            "CompTIA Security+",
            "Google Cybersecurity",
            "Certified Ethical Hacker"
        ],

        "interview": [
            "Networking",
            "Security fundamentals",
            "Incident response",
            "Linux",
            "Security scenarios"
        ]
    },


    "DevOps Engineer": {

        "foundation": [
            "Linux",
            "Git",
            "Networking",
            "Scripting"
        ],

        "core_skills": [
            "Docker",
            "CI/CD",
            "Jenkins",
            "Cloud Computing",
            "GitHub"
        ],

        "advanced_skills": [
            "Kubernetes",
            "Terraform",
            "Infrastructure as Code",
            "Cloud Security",
            "Monitoring"
        ],

        "projects": [
            "CI/CD pipeline",
            "Dockerized application",
            "Kubernetes deployment",
            "Cloud infrastructure project"
        ],

        "certifications": [
            "AWS DevOps Engineer",
            "Docker certification",
            "Kubernetes certification"
        ],

        "interview": [
            "Linux",
            "Docker",
            "Kubernetes",
            "CI/CD",
            "Cloud architecture"
        ]
    },


    "Product Manager": {

        "foundation": [
            "Product fundamentals",
            "Market research",
            "Communication",
            "Problem Solving"
        ],

        "core_skills": [
            "Agile",
            "Scrum",
            "Product Strategy",
            "User Research",
            "Data Analysis"
        ],

        "advanced_skills": [
            "Product Analytics",
            "Roadmapping",
            "Experimentation",
            "Growth Strategy",
            "Stakeholder Management"
        ],

        "projects": [
            "Create a product case study",
            "Build a product roadmap",
            "Conduct user research",
            "Analyze product metrics"
        ],

        "certifications": [
            "Certified Scrum Product Owner",
            "Google Project Management",
            "Product Management certification"
        ],

        "interview": [
            "Product sense",
            "Product strategy",
            "Case studies",
            "Analytics",
            "Behavioral questions"
        ]
    }
}


# ============================================================
# GET ROADMAP
# ============================================================

@career_roadmap.route(
    "/",
    methods=["GET"]
)
def get_roadmap():

    role = request.args.get(
        "role",
        "AI Engineer"
    ).strip()

    roadmap = ROADMAP_DATA.get(
        role
    )

    if not roadmap:

        return jsonify({
            "status": "error",
            "message": "Roadmap not available for this role"
        }), 404

    return jsonify({
        "status": "success",
        "role": role,
        "data": roadmap
    }), 200


# ============================================================
# PERSONALIZED ROADMAP
# ============================================================

@career_roadmap.route(
    "/personalized",
    methods=["POST"]
)
def personalized_roadmap():

    data = request.get_json(
        silent=True
    ) or {}

    role = data.get(
        "target_role",
        "AI Engineer"
    ).strip()

    current_skills = data.get(
        "current_skills",
        []
    )

    roadmap = ROADMAP_DATA.get(
        role
    )

    if not roadmap:

        return jsonify({
            "status": "error",
            "message": "Roadmap not available for this role"
        }), 404


    current_skills_lower = {
        skill.lower()
        for skill in current_skills
    }


    personalized = {}


    for stage, skills in roadmap.items():

        if stage == "projects" or stage == "certifications" or stage == "interview":

            personalized[stage] = skills

            continue


        personalized[stage] = {

            "completed": [],

            "to_learn": []

        }


        for skill in skills:

            if skill.lower() in current_skills_lower:

                personalized[stage][
                    "completed"
                ].append(skill)

            else:

                personalized[stage][
                    "to_learn"
                ].append(skill)


    return jsonify({

        "status": "success",

        "message": "Personalized roadmap generated",

        "role": role,

        "data": personalized

    }), 200