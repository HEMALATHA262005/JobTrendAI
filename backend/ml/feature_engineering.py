import pandas as pd
from pathlib import Path
import re


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"


# ============================================================
# SKILLS USED BY JOBTREND AI
# ============================================================

SKILLS = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C++",
    "C#",
    "SQL",
    "HTML",
    "CSS",
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Express",
    "REST APIs",
    "Pandas",
    "NumPy",
    "Statistics",
    "Data Analysis",
    "Data Visualization",
    "Power BI",
    "Tableau",
    "Excel",
    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "Generative AI",
    "NLP",
    "LLM",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "OpenCV",
    "LangChain",
    "MLOps",
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
    "MongoDB",
    "MySQL",
    "PostgreSQL",
    "Redis",
    "Data Structures",
    "Algorithms",
    "Agile",
    "Scrum",
    "Communication",
    "Leadership",
    "Problem Solving",
    "Cybersecurity",
    "Network Security",
    "Cloud Security",
    "Ethical Hacking",
    "Penetration Testing",
    "SIEM",
    "Incident Response",
]


# ============================================================
# TEXT CLEANING
# ============================================================

def normalize_text(text):
    """
    Convert text into a normalized form for skill detection.
    """

    if pd.isna(text):
        return ""

    text = str(text).lower()

    # Replace punctuation with spaces
    text = re.sub(r"[^a-zA-Z0-9+#./-]", " ", text)

    # Remove repeated spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ============================================================
# SKILL EXTRACTION
# ============================================================

def extract_skills(text):
    """
    Detect known JobTrend AI skills in job description text.
    """

    normalized = normalize_text(text)

    detected = []

    for skill in SKILLS:

        skill_normalized = normalize_text(skill)

        # Escape special regex characters
        pattern = re.escape(skill_normalized)

        if re.search(r"(?<!\w)" + pattern + r"(?!\w)", normalized):

            detected.append(skill)

    return detected


# ============================================================
# PROCESS JOB DESCRIPTIONS
# ============================================================

def create_job_description_features():

    input_file = (
        PROCESSED_DIR /
        "processed_job_descriptions.csv"
    )

    output_file = (
        PROCESSED_DIR /
        "job_description_features.csv"
    )

    print("\n" + "=" * 70)
    print("FEATURE ENGINEERING - JOB DESCRIPTIONS")
    print("=" * 70)

    if not input_file.exists():

        print(f"ERROR: File not found: {input_file}")

        return None

    df = pd.read_csv(input_file)

    print(f"Input rows: {len(df):,}")

    # --------------------------------------------------------
    # Combine available text
    # --------------------------------------------------------

    description = (
        df["Description"]
        if "Description" in df.columns
        else ""
    )

    requirements = (
        df["combined_requirements"]
        if "combined_requirements" in df.columns
        else ""
    )

    df["nlp_text"] = (
        description.fillna("").astype(str)
        + " "
        + requirements.fillna("").astype(str)
    )

    # --------------------------------------------------------
    # Text length features
    # --------------------------------------------------------

    df["text_length"] = (
        df["nlp_text"]
        .str.len()
    )

    df["word_count"] = (
        df["nlp_text"]
        .str.split()
        .str.len()
    )

    # --------------------------------------------------------
    # Skill extraction
    # --------------------------------------------------------

    df["detected_skills"] = (
        df["nlp_text"]
        .apply(extract_skills)
    )

    df["skill_count"] = (
        df["detected_skills"]
        .apply(len)
    )

    # Store skills as a readable string for CSV
    df["detected_skills"] = (
        df["detected_skills"]
        .apply(lambda skills: ", ".join(skills))
    )

    # --------------------------------------------------------
    # Individual skill features
    # --------------------------------------------------------

    for skill in SKILLS:

        column_name = (
            "skill_"
            + re.sub(
                r"[^a-zA-Z0-9]+",
                "_",
                skill.lower()
            ).strip("_")
        )

        skill_normalized = normalize_text(skill)

        df[column_name] = (
            df["nlp_text"]
            .apply(
                lambda text:
                int(
                    re.search(
                        r"(?<!\w)"
                        + re.escape(skill_normalized)
                        + r"(?!\w)",
                        normalize_text(text)
                    )
                    is not None
                )
            )
        )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    df.to_csv(
        output_file,
        index=False
    )

    print(f"Output rows: {len(df):,}")

    print(
        f"Features created: {len(df.columns)} columns"
    )

    print(
        f"Saved to: {output_file}"
    )

    # --------------------------------------------------------
    # Show most common skills
    # --------------------------------------------------------

    print("\nMost frequently detected skills:")

    skill_counts = {}

    for skills_text in df["detected_skills"]:

        if not skills_text:
            continue

        for skill in skills_text.split(", "):

            skill_counts[skill] = (
                skill_counts.get(skill, 0) + 1
            )

    top_skills = sorted(
        skill_counts.items(),
        key=lambda item: item[1],
        reverse=True
    )[:20]

    for skill, count in top_skills:

        print(
            f"  {skill}: {count} jobs"
        )

    return df


# ============================================================
# PROCESS JOB POSTINGS
# ============================================================

def create_job_posting_features():

    input_file = (
        PROCESSED_DIR /
        "processed_job_postings.csv"
    )

    output_file = (
        PROCESSED_DIR /
        "job_posting_features.csv"
    )

    print("\n" + "=" * 70)
    print("FEATURE ENGINEERING - JOB POSTINGS")
    print("=" * 70)

    if not input_file.exists():

        print(f"ERROR: File not found: {input_file}")

        return None

    df = pd.read_csv(input_file)

    print(f"Input rows: {len(df):,}")

    # --------------------------------------------------------
    # Category features
    # --------------------------------------------------------

    df["category_length"] = (
        df["Category"]
        .fillna("")
        .str.len()
    )

    # --------------------------------------------------------
    # Location features
    # --------------------------------------------------------

    df["location_length"] = (
        df["Location"]
        .fillna("")
        .str.len()
    )

    # --------------------------------------------------------
    # Workplace features
    # --------------------------------------------------------

    df["is_remote"] = (
        df["Workplace"]
        .fillna("")
        .str.lower()
        .str.contains("remote")
        .astype(int)
    )

    df["is_hybrid"] = (
        df["Workplace"]
        .fillna("")
        .str.lower()
        .str.contains("hybrid")
        .astype(int)
    )

    df["is_onsite"] = (
        df["Workplace"]
        .fillna("")
        .str.lower()
        .str.contains("on-site|onsite")
        .astype(int)
    )

    # --------------------------------------------------------
    # Job type features
    # --------------------------------------------------------

    df["is_full_time"] = (
        df["Type"]
        .fillna("")
        .str.lower()
        .str.contains("full")
        .astype(int)
    )

    df["is_part_time"] = (
        df["Type"]
        .fillna("")
        .str.lower()
        .str.contains("part")
        .astype(int)
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    df.to_csv(
        output_file,
        index=False
    )

    print(
        f"Output rows: {len(df):,}"
    )

    print(
        f"Features created: {len(df.columns)} columns"
    )

    print(
        f"Saved to: {output_file}"
    )

    return df


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print("\n")
    print("=" * 70)
    print("JOBTREND AI - FEATURE ENGINEERING")
    print("=" * 70)

    descriptions = (
        create_job_description_features()
    )

    postings = (
        create_job_posting_features()
    )

    print("\n" + "=" * 70)
    print("FEATURE ENGINEERING COMPLETE")
    print("=" * 70)

    if descriptions is not None:

        print(
            f"Job description features: "
            f"{len(descriptions):,} rows"
        )

    if postings is not None:

        print(
            f"Job posting features: "
            f"{len(postings):,} rows"
        )