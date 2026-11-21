import pandas as pd
from pathlib import Path
import re


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def clean_text(value):
    """
    Clean text fields while keeping the important information.
    """

    if pd.isna(value):
        return ""

    value = str(value)

    # Replace newlines and tabs with spaces
    value = re.sub(r"[\r\n\t]+", " ", value)

    # Remove repeated spaces
    value = re.sub(r"\s+", " ", value)

    return value.strip()


def clean_category(value):
    """
    Clean job category names.
    """

    if pd.isna(value):
        return "Unknown"

    value = str(value).strip()

    if not value:
        return "Unknown"

    return value


# ============================================================
# PROCESS JOB POSTINGS
# ============================================================

def process_job_postings():

    input_file = RAW_DIR / "job_posting.csv"
    output_file = PROCESSED_DIR / "processed_job_postings.csv"

    print("\n" + "=" * 70)
    print("PROCESSING JOB POSTINGS")
    print("=" * 70)

    if not input_file.exists():
        print(f"ERROR: File not found: {input_file}")
        return None

    df = pd.read_csv(input_file)

    print(f"Original rows: {len(df):,}")
    print(f"Original columns: {len(df.columns)}")

    # Remove unnecessary index column
    if "Unnamed: 0" in df.columns:
        df = df.drop(columns=["Unnamed: 0"])

    # Clean columns
    df["Category"] = df["Category"].apply(clean_category)

    for column in ["Workplace", "Location", "Department", "Type"]:
        if column in df.columns:
            df[column] = df[column].apply(clean_text)

            # Replace empty values
            df[column] = df[column].replace("", "Unknown")

    # Remove completely duplicated rows
    before = len(df)

    df = df.drop_duplicates()

    removed = before - len(df)

    print(f"Duplicate rows removed: {removed:,}")

    # Create lowercase helper columns for ML processing
    df["category_clean"] = df["Category"].str.lower()
    df["workplace_clean"] = df["Workplace"].str.lower()
    df["location_clean"] = df["Location"].str.lower()
    df["department_clean"] = df["Department"].str.lower()
    df["type_clean"] = df["Type"].str.lower()

    # Save
    df.to_csv(output_file, index=False)

    print(f"Final rows: {len(df):,}")
    print(f"Saved to: {output_file}")

    return df


# ============================================================
# PROCESS JOB DESCRIPTIONS
# ============================================================

def process_job_descriptions():

    input_file = RAW_DIR / "job_description.csv"
    output_file = PROCESSED_DIR / "processed_job_descriptions.csv"

    print("\n" + "=" * 70)
    print("PROCESSING JOB DESCRIPTIONS")
    print("=" * 70)

    if not input_file.exists():
        print(f"ERROR: File not found: {input_file}")
        return None

    df = pd.read_csv(input_file)

    print(f"Original rows: {len(df):,}")
    print(f"Original columns: {len(df.columns)}")

    # Remove unnecessary index column
    if "Unnamed: 0" in df.columns:
        df = df.drop(columns=["Unnamed: 0"])

    # Clean category
    df["Category"] = df["Category"].apply(clean_category)

    # Clean text fields
    text_columns = [
        "Description",
        "Benefits",
        "Requirement",
        "Requirements"
    ]

    for column in text_columns:

        if column in df.columns:

            df[column] = df[column].apply(clean_text)

    # Combine requirement columns where both exist
    if "Requirement" in df.columns and "Requirements" in df.columns:

        df["combined_requirements"] = (
            df["Requirement"].fillna("")
            + " "
            + df["Requirements"].fillna("")
        )

    elif "Requirements" in df.columns:

        df["combined_requirements"] = df["Requirements"]

    elif "Requirement" in df.columns:

        df["combined_requirements"] = df["Requirement"]

    else:

        df["combined_requirements"] = ""

    # Create combined NLP text
    df["combined_text"] = (
        df["Category"].fillna("")
        + " "
        + df["Description"].fillna("")
        + " "
        + df["combined_requirements"].fillna("")
    )

    # Remove duplicate descriptions
    before = len(df)

    df = df.drop_duplicates(
        subset=["Category", "combined_text"]
    )

    removed = before - len(df)

    print(f"Duplicate descriptions removed: {removed:,}")

    # Lowercase helper column
    df["category_clean"] = df["Category"].str.lower()

    # Save
    df.to_csv(output_file, index=False)

    print(f"Final rows: {len(df):,}")
    print(f"Saved to: {output_file}")

    return df


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print("\n")
    print("=" * 70)
    print("JOBTREND AI - DATA PREPROCESSING")
    print("=" * 70)

    postings = process_job_postings()

    descriptions = process_job_descriptions()

    print("\n" + "=" * 70)
    print("PREPROCESSING COMPLETE")
    print("=" * 70)

    if postings is not None:
        print(
            f"Job postings dataset: "
            f"{len(postings):,} rows"
        )

    if descriptions is not None:
        print(
            f"Job descriptions dataset: "
            f"{len(descriptions):,} rows"
        )

    print("\nProcessed files are located in:")
    print(PROCESSED_DIR)