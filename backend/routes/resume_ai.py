from flask import Blueprint, request, jsonify
from pypdf import PdfReader
import re


resume_ai = Blueprint("resume_ai", __name__)


# ============================================================
# PDF TEXT EXTRACTION
# ============================================================

def extract_pdf_text(pdf_file):
    reader = PdfReader(pdf_file)

    text_parts = []

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text_parts.append(page_text)

    return "\n".join(text_parts)


# ============================================================
# TEXT CLEANING
# ============================================================

def clean_text(text):
    text = text.lower()

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# ============================================================
# SKILL DATABASE
# ============================================================

SKILLS = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C++",
    "C#",

    "HTML",
    "CSS",
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Express",
    "REST APIs",

    "SQL",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",

    "Pandas",
    "NumPy",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",

    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "Generative AI",
    "NLP",
    "LLMs",
    "Computer Vision",

    "Data Analysis",
    "Data Visualization",
    "Statistics",
    "Power BI",
    "Tableau",
    "Excel",

    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "Terraform",

    "Linux",
    "Git",
    "GitHub",
    "GitLab",
    "CI/CD",
    "Jenkins",

    "Cybersecurity",
    "Network Security",
    "Cloud Security",
    "Ethical Hacking",
    "Penetration Testing",
    "SIEM",

    "Agile",
    "Scrum",

    "Communication",
    "Leadership",
    "Problem Solving",
    "Teamwork"
]


# ============================================================
# FIND SKILLS
# ============================================================

def find_skills(text):

    cleaned = clean_text(text)

    found_skills = []

    for skill in SKILLS:

        skill_clean = clean_text(skill)

        if skill_clean in cleaned:

            found_skills.append(skill)

    return found_skills


# ============================================================
# CONTACT INFORMATION
# ============================================================

def detect_email(text):

    pattern = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"

    match = re.search(
        pattern,
        text
    )

    if match:
        return match.group(0)

    return None


def detect_phone(text):

    pattern = (
        r"(?:\+?\d{1,3}[\s-]?)?"
        r"(?:\d{10}|\d{3}[\s-]\d{3}[\s-]\d{4})"
    )

    match = re.search(
        pattern,
        text
    )

    if match:
        return match.group(0)

    return None


# ============================================================
# SECTION DETECTION
# ============================================================

def detect_sections(text):

    cleaned = clean_text(text)

    sections = {

        "summary": False,

        "education": False,

        "experience": False,

        "skills": False,

        "projects": False,

        "certifications": False,

        "achievements": False

    }

    section_keywords = {

        "summary": [
            "summary",
            "profile",
            "objective"
        ],

        "education": [
            "education",
            "academic"
        ],

        "experience": [
            "experience",
            "work experience",
            "employment"
        ],

        "skills": [
            "skills",
            "technical skills"
        ],

        "projects": [
            "projects",
            "academic projects"
        ],

        "certifications": [
            "certifications",
            "certificates"
        ],

        "achievements": [
            "achievements",
            "accomplishments"
        ]

    }

    for section, keywords in section_keywords.items():

        for keyword in keywords:

            if keyword in cleaned:

                sections[section] = True

                break

    return sections


# ============================================================
# BULLET POINT ANALYSIS
# ============================================================

def analyze_bullet_points(text):

    lines = text.splitlines()

    bullet_lines = []

    for line in lines:

        stripped = line.strip()

        if (
            stripped.startswith("-")
            or stripped.startswith("•")
            or stripped.startswith("*")
        ):

            bullet_lines.append(
                stripped
            )

    return bullet_lines


# ============================================================
# ACTION VERBS
# ============================================================

ACTION_VERBS = [
    "developed",
    "designed",
    "implemented",
    "created",
    "built",
    "managed",
    "led",
    "improved",
    "optimized",
    "analyzed",
    "developed",
    "automated",
    "deployed",
    "tested",
    "integrated",
    "engineered"
]


def analyze_action_verbs(text):

    cleaned = clean_text(text)

    found = []

    for verb in ACTION_VERBS:

        if verb in cleaned:

            found.append(
                verb
            )

    return found


# ============================================================
# ATS SCORE
# ============================================================

def calculate_ats_score(
    text,
    skills,
    sections,
    bullets,
    action_verbs
):

    score = 0

    # ----------------------------------------
    # Resume length
    # ----------------------------------------

    word_count = len(
        text.split()
    )

    if 300 <= word_count <= 900:

        score += 20

    elif 200 <= word_count < 300:

        score += 12

    elif 900 < word_count <= 1200:

        score += 15

    else:

        score += 7


    # ----------------------------------------
    # Skills
    # ----------------------------------------

    if len(skills) >= 12:

        score += 20

    elif len(skills) >= 8:

        score += 16

    elif len(skills) >= 5:

        score += 12

    else:

        score += 6


    # ----------------------------------------
    # Important sections
    # ----------------------------------------

    important_sections = [
        "summary",
        "education",
        "experience",
        "skills",
        "projects"
    ]

    section_count = sum(
        1
        for section in important_sections
        if sections.get(section)
    )

    score += (
        section_count * 5
    )


    # ----------------------------------------
    # Bullet points
    # ----------------------------------------

    if len(bullets) >= 8:

        score += 15

    elif len(bullets) >= 4:

        score += 10

    elif len(bullets) > 0:

        score += 5


    # ----------------------------------------
    # Action verbs
    # ----------------------------------------

    if len(action_verbs) >= 8:

        score += 15

    elif len(action_verbs) >= 5:

        score += 10

    elif len(action_verbs) > 0:

        score += 5


    return min(
        score,
        100
    )


# ============================================================
# GENERATE STRENGTHS
# ============================================================

def generate_strengths(
    skills,
    sections,
    bullets,
    action_verbs,
    word_count
):

    strengths = []

    if len(skills) >= 8:

        strengths.append(
            "Good technical skill coverage"
        )

    if sections.get("projects"):

        strengths.append(
            "Projects section is present"
        )

    if sections.get("experience"):

        strengths.append(
            "Work experience section is present"
        )

    if sections.get("education"):

        strengths.append(
            "Education section is clearly included"
        )

    if len(bullets) >= 4:

        strengths.append(
            "Uses bullet points to organize information"
        )

    if len(action_verbs) >= 5:

        strengths.append(
            "Uses strong action-oriented language"
        )

    if 300 <= word_count <= 900:

        strengths.append(
            "Resume length is within a reasonable range"
        )

    if not strengths:

        strengths.append(
            "Resume contains usable career information"
        )

    return strengths


# ============================================================
# GENERATE WEAKNESSES
# ============================================================

def generate_weaknesses(
    skills,
    sections,
    bullets,
    action_verbs,
    word_count
):

    weaknesses = []

    if len(skills) < 5:

        weaknesses.append(
            "Add more relevant technical skills"
        )

    if not sections.get("summary"):

        weaknesses.append(
            "Consider adding a concise professional summary"
        )

    if not sections.get("projects"):

        weaknesses.append(
            "Add relevant projects with measurable outcomes"
        )

    if not sections.get("experience"):

        weaknesses.append(
            "Add internship, work, or practical experience where applicable"
        )

    if len(bullets) < 4:

        weaknesses.append(
            "Use more bullet points to improve readability"
        )

    if len(action_verbs) < 3:

        weaknesses.append(
            "Use stronger action verbs such as Developed, Built, Implemented, and Optimized"
        )

    if word_count < 200:

        weaknesses.append(
            "Resume appears too short and may need more relevant detail"
        )

    if word_count > 1200:

        weaknesses.append(
            "Resume may be too long; remove less relevant information"
        )

    return weaknesses


# ============================================================
# GENERATE SUGGESTIONS
# ============================================================

def generate_suggestions(
    skills,
    sections,
    bullets,
    action_verbs
):

    suggestions = []

    if not sections.get("summary"):

        suggestions.append(
            "Add a 2–4 line professional summary tailored to your target role."
        )

    if not sections.get("projects"):

        suggestions.append(
            "Add 2–4 strong projects and explain your technology stack and results."
        )

    if len(skills) < 8:

        suggestions.append(
            "Add relevant technical skills that genuinely match your experience."
        )

    if len(bullets) < 5:

        suggestions.append(
            "Convert long paragraphs into concise achievement-focused bullet points."
        )

    if len(action_verbs) < 5:

        suggestions.append(
            "Start achievement bullets with strong action verbs."
        )

    suggestions.append(
        "Add measurable results where possible, such as percentages, time saved, users served, or performance improvements."
    )

    suggestions.append(
        "Tailor important keywords to the job description before applying."
    )

    suggestions.append(
        "Keep formatting simple and ATS-friendly with clear section headings."
    )

    return suggestions


# ============================================================
# RESUME AI ANALYSIS API
# ============================================================

@resume_ai.route(
    "/analyze",
    methods=["POST"]
)
def analyze_resume():

    try:

        resume = request.files.get(
            "resume"
        )

        if not resume:

            return jsonify({
                "status": "error",
                "message": "Resume PDF is required"
            }), 400


        if not resume.filename:

            return jsonify({
                "status": "error",
                "message": "Resume filename is missing"
            }), 400


        if not resume.filename.lower().endswith(
            ".pdf"
        ):

            return jsonify({
                "status": "error",
                "message": "Only PDF resumes are supported"
            }), 400


        resume_text = extract_pdf_text(
            resume
        )


        if not resume_text.strip():

            return jsonify({
                "status": "error",
                "message": "Could not extract text from the resume PDF"
            }), 400


        # ----------------------------------------
        # Analyze
        # ----------------------------------------

        word_count = len(
            resume_text.split()
        )

        skills = find_skills(
            resume_text
        )

        sections = detect_sections(
            resume_text
        )

        bullets = analyze_bullet_points(
            resume_text
        )

        action_verbs = analyze_action_verbs(
            resume_text
        )

        email = detect_email(
            resume_text
        )

        phone = detect_phone(
            resume_text
        )


        ats_score = calculate_ats_score(
            resume_text,
            skills,
            sections,
            bullets,
            action_verbs
        )


        strengths = generate_strengths(
            skills,
            sections,
            bullets,
            action_verbs,
            word_count
        )


        weaknesses = generate_weaknesses(
            skills,
            sections,
            bullets,
            action_verbs,
            word_count
        )


        suggestions = generate_suggestions(
            skills,
            sections,
            bullets,
            action_verbs
        )


        return jsonify({

            "status": "success",

            "message": "Resume analyzed successfully",

            "data": {

                "ats_score": ats_score,

                "word_count": word_count,

                "skills": skills,

                "skills_count": len(skills),

                "sections": sections,

                "bullet_points": len(bullets),

                "action_verbs": action_verbs,

                "contact": {

                    "email_detected": bool(email),

                    "phone_detected": bool(phone)

                },

                "strengths": strengths,

                "weaknesses": weaknesses,

                "suggestions": suggestions

            }

        }), 200


    except Exception as error:

        print(
            "RESUME AI ERROR:",
            error
        )

        return jsonify({

            "status": "error",

            "message": "Could not analyze resume"

        }), 500