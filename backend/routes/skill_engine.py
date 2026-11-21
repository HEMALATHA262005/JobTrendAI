import re
from rapidfuzz import fuzz


# ==========================================
# SKILL ALIASES
# ==========================================

SKILL_ALIASES = {

    "python": [
        "python"
    ],

    "java": [
        "java"
    ],

    "javascript": [
        "javascript",
        "js"
    ],

    "typescript": [
        "typescript",
        "ts"
    ],

    "c++": [
        "c++",
        "cpp"
    ],

    "c#": [
        "c#",
        "c sharp"
    ],

    "sql": [
        "sql"
    ],

    "html": [
        "html",
        "html5"
    ],

    "css": [
        "css",
        "css3"
    ],

    "react": [
        "react",
        "react.js",
        "reactjs"
    ],

    "angular": [
        "angular"
    ],

    "vue": [
        "vue",
        "vue.js",
        "vuejs"
    ],

    "node.js": [
        "node.js",
        "nodejs",
        "node js"
    ],

    "express.js": [
        "express.js",
        "expressjs",
        "express js"
    ],

    "rest api": [
        "rest api",
        "rest apis",
        "restful api",
        "restful apis"
    ],

    "pandas": [
        "pandas"
    ],

    "numpy": [
        "numpy"
    ],

    "statistics": [
        "statistics",
        "statistical analysis"
    ],

    "data analysis": [
        "data analysis",
        "data analytics"
    ],

    "data visualization": [
        "data visualization",
        "data visualisation"
    ],

    "power bi": [
        "power bi",
        "powerbi"
    ],

    "tableau": [
        "tableau"
    ],

    "excel": [
        "excel",
        "microsoft excel"
    ],

    "machine learning": [
        "machine learning",
        "machine-learning",
        "ml"
    ],

    "deep learning": [
        "deep learning",
        "deep-learning"
    ],

    "artificial intelligence": [
        "artificial intelligence",
        "artificial intelligence",
        "ai"
    ],

    "generative ai": [
        "generative ai",
        "generative artificial intelligence",
        "gen ai"
    ],

    "nlp": [
        "nlp",
        "natural language processing"
    ],

    "llms": [
        "llm",
        "llms",
        "large language model",
        "large language models"
    ],

    "tensorflow": [
        "tensorflow"
    ],

    "pytorch": [
        "pytorch",
        "py torch"
    ],

    "scikit-learn": [
        "scikit-learn",
        "scikit learn",
        "sklearn"
    ],

    "opencv": [
        "opencv",
        "open cv"
    ],

    "langchain": [
        "langchain"
    ],

    "mlops": [
        "mlops",
        "ml ops"
    ],

    "aws": [
        "aws",
        "amazon web services"
    ],

    "azure": [
        "azure",
        "microsoft azure"
    ],

    "google cloud": [
        "google cloud",
        "gcp",
        "google cloud platform"
    ],

    "docker": [
        "docker"
    ],

    "kubernetes": [
        "kubernetes",
        "k8s"
    ],

    "terraform": [
        "terraform"
    ],

    "linux": [
        "linux"
    ],

    "git": [
        "git"
    ],

    "github": [
        "github",
        "git hub"
    ],

    "gitlab": [
        "gitlab",
        "git lab"
    ],

    "ci/cd": [
        "ci/cd",
        "ci cd",
        "continuous integration",
        "continuous deployment"
    ],

    "jenkins": [
        "jenkins"
    ],

    "network security": [
        "network security"
    ],

    "cybersecurity": [
        "cybersecurity",
        "cyber security"
    ],

    "cloud security": [
        "cloud security"
    ],

    "ethical hacking": [
        "ethical hacking"
    ],

    "penetration testing": [
        "penetration testing"
    ],

    "siem": [
        "siem"
    ],

    "incident response": [
        "incident response"
    ],

    "mongodb": [
        "mongodb",
        "mongo db"
    ],

    "mysql": [
        "mysql",
        "my sql"
    ],

    "postgresql": [
        "postgresql",
        "postgres"
    ],

    "redis": [
        "redis"
    ],

    "data structures": [
        "data structures",
        "data structure"
    ],

    "algorithms": [
        "algorithms",
        "algorithm"
    ],

    "agile": [
        "agile"
    ],

    "scrum": [
        "scrum"
    ],

    "communication": [
        "communication",
        "communication skills"
    ],

    "leadership": [
        "leadership",
        "leadership skills"
    ],

    "problem solving": [
        "problem solving",
        "problem-solving"
    ]
}


# ==========================================
# DISPLAY NAMES
# ==========================================

DISPLAY_NAMES = {
    "python": "Python",
    "java": "Java",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "c++": "C++",
    "c#": "C#",
    "sql": "SQL",
    "html": "HTML",
    "css": "CSS",
    "react": "React",
    "angular": "Angular",
    "vue": "Vue",
    "node.js": "Node.js",
    "express.js": "Express.js",
    "rest api": "REST APIs",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "statistics": "Statistics",
    "data analysis": "Data Analysis",
    "data visualization": "Data Visualization",
    "power bi": "Power BI",
    "tableau": "Tableau",
    "excel": "Excel",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "artificial intelligence": "Artificial Intelligence",
    "generative ai": "Generative AI",
    "nlp": "NLP",
    "llms": "LLMs",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "scikit-learn": "Scikit-learn",
    "opencv": "OpenCV",
    "langchain": "LangChain",
    "mlops": "MLOps",
    "aws": "AWS",
    "azure": "Azure",
    "google cloud": "Google Cloud",
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
    "siem": "SIEM",
    "incident response": "Incident Response",
    "mongodb": "MongoDB",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "redis": "Redis",
    "data structures": "Data Structures",
    "algorithms": "Algorithms",
    "agile": "Agile",
    "scrum": "Scrum",
    "communication": "Communication",
    "leadership": "Leadership",
    "problem solving": "Problem Solving"
}


# ==========================================
# NORMALIZE TEXT
# ==========================================

def normalize_text(text):

    text = text.lower()

    text = text.replace(
        "\u2013",
        "-"
    )

    text = text.replace(
        "\u2014",
        "-"
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# ==========================================
# FIND SKILLS
# ==========================================

def extract_skills(text):

    normalized_text = normalize_text(text)

    found = []

    for skill, aliases in SKILL_ALIASES.items():

        for alias in aliases:

            alias = normalize_text(alias)

            pattern = (
                r"(?<![a-z0-9+#])"
                + re.escape(alias)
                + r"(?![a-z0-9+#])"
            )

            if re.search(
                pattern,
                normalized_text
            ):

                found.append(skill)

                break

    return list(
        dict.fromkeys(found)
    )


# ==========================================
# DISPLAY SKILLS
# ==========================================

def display_skills(skills):

    return [
        DISPLAY_NAMES.get(
            skill,
            skill.title()
        )
        for skill in skills
    ]


# ==========================================
# FIND SKILL OCCURRENCES
# ==========================================

def count_skill_occurrences(
    text,
    skill
):

    normalized_text = normalize_text(
        text
    )

    aliases = SKILL_ALIASES.get(
        skill,
        []
    )

    count = 0

    for alias in aliases:

        alias = normalize_text(alias)

        pattern = (
            r"(?<![a-z0-9+#])"
            + re.escape(alias)
            + r"(?![a-z0-9+#])"
        )

        matches = re.findall(
            pattern,
            normalized_text
        )

        count += len(matches)

    return count


# ==========================================
# FIND PRIORITY
# ==========================================

def get_skill_priority(
    job_description,
    skill
):

    normalized_text = normalize_text(
        job_description
    )

    aliases = SKILL_ALIASES.get(
        skill,
        []
    )

    # --------------------------------------
    # Find where the skill appears
    # --------------------------------------

    positions = []

    for alias in aliases:

        alias = normalize_text(alias)

        position = normalized_text.find(
            alias
        )

        if position != -1:
            positions.append(position)

    if not positions:
        return "Low"

    first_position = min(
        positions
    )

    # --------------------------------------
    # Get surrounding text
    # --------------------------------------

    start = max(
        0,
        first_position - 180
    )

    end = min(
        len(normalized_text),
        first_position + 180
    )

    context = normalized_text[
        start:end
    ]

    # --------------------------------------
    # Mandatory keywords
    # --------------------------------------

    mandatory_keywords = [
        "required",
        "must have",
        "must-have",
        "mandatory",
        "essential",
        "strong experience",
        "strong knowledge",
        "required skills",
        "requirements",
        "you will need"
    ]

    preferred_keywords = [
        "preferred",
        "nice to have",
        "nice-to-have",
        "bonus",
        "plus",
        "preferred skills",
        "good to have"
    ]

    # --------------------------------------
    # HIGH PRIORITY
    # --------------------------------------

    for keyword in mandatory_keywords:

        if keyword in context:

            return "High"

    # --------------------------------------
    # LOW PRIORITY
    # --------------------------------------

    for keyword in preferred_keywords:

        if keyword in context:

            return "Low"

    # --------------------------------------
    # Frequency based scoring
    # --------------------------------------

    occurrences = count_skill_occurrences(
        normalized_text,
        skill
    )

    if occurrences >= 3:
        return "High"

    if occurrences >= 2:
        return "Medium"

    return "Medium"


# ==========================================
# FUZZY SKILL SIMILARITY
# ==========================================

def skills_are_similar(
    skill_one,
    skill_two
):

    a = normalize_text(
        skill_one
    )

    b = normalize_text(
        skill_two
    )

    if a == b:
        return True

    score = fuzz.ratio(
        a,
        b
    )

    return score >= 92


# ==========================================
# COMPARE SKILLS
# ==========================================

def compare_skills(
    resume_skills,
    required_skills
):

    matched = []
    missing = []

    for required in required_skills:

        is_matched = False

        for resume_skill in resume_skills:

            if skills_are_similar(
                required,
                resume_skill
            ):

                is_matched = True
                break

        if is_matched:
            matched.append(required)

        else:
            missing.append(required)

    return (
        matched,
        missing
    )


# ==========================================
# CALCULATE MATCH %
# ==========================================

def calculate_match_percentage(
    matched_skills,
    required_skills
):

    if not required_skills:
        return 0

    percentage = (
        len(matched_skills)
        /
        len(required_skills)
    ) * 100

    return round(
        percentage
    )


# ==========================================
# BUILD PRIORITY RESULTS
# ==========================================

def build_priority_results(
    missing_skills,
    job_description
):

    priority_order = {
        "High": 1,
        "Medium": 2,
        "Low": 3
    }

    results = []

    for skill in missing_skills:

        priority = get_skill_priority(
            job_description,
            skill
        )

        occurrences = count_skill_occurrences(
            job_description,
            skill
        )

        results.append({
            "skill": DISPLAY_NAMES.get(
                skill,
                skill.title()
            ),
            "priority": priority,
            "mentions": occurrences
        })

    results.sort(
        key=lambda item: (
            priority_order[
                item["priority"]
            ],
            -item["mentions"]
        )
    )

    return results