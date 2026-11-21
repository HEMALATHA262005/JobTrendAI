import pandas as pd
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"


# ============================================================
# LOAD FEATURE DATA
# ============================================================

def load_skill_data():

    file_path = (
        PROCESSED_DIR /
        "job_description_features.csv"
    )

    if not file_path.exists():

        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    return pd.read_csv(file_path)


# ============================================================
# CALCULATE SKILL TRENDS
# ============================================================

def calculate_skill_trends(df):

    total_jobs = len(df)

    skill_columns = [
        column
        for column in df.columns
        if column.startswith("skill_")
        and column != "skill_count"
    ]

    results = []

    for column in skill_columns:

        count = int(df[column].sum())

        percentage = (
            (count / total_jobs) * 100
            if total_jobs > 0
            else 0
        )

        skill_name = (
            column
            .replace("skill_", "")
            .replace("_", " ")
            .title()
        )

        results.append({
            "skill": skill_name,
            "job_count": count,
            "demand_percentage": round(
                percentage,
                2
            )
        })

    result_df = pd.DataFrame(results)

    # Remove skills that were not found
    result_df = result_df[
        result_df["job_count"] > 0
    ]

    # Sort by demand
    result_df = result_df.sort_values(
        by="job_count",
        ascending=False
    ).reset_index(drop=True)

    # Add ranking
    result_df["rank"] = (
        result_df.index + 1
    )

    return result_df


# ============================================================
# ADD TREND LEVEL
# ============================================================

def add_trend_level(df):

    def get_level(percentage):

        if percentage >= 30:
            return "Very High"

        elif percentage >= 20:
            return "High"

        elif percentage >= 10:
            return "Growing"

        elif percentage >= 5:
            return "Moderate"

        return "Emerging"

    df["trend_level"] = (
        df["demand_percentage"]
        .apply(get_level)
    )

    return df


# ============================================================
# SAVE RESULTS
# ============================================================

def save_results(df):

    output_file = (
        PROCESSED_DIR /
        "skill_trends.csv"
    )

    df.to_csv(
        output_file,
        index=False
    )

    print(
        f"\nSkill trend data saved to:"
    )

    print(output_file)

    return output_file


# ============================================================
# DISPLAY RESULTS
# ============================================================

def display_top_skills(df):

    print("\n" + "=" * 70)
    print("TOP TRENDING SKILLS")
    print("=" * 70)

    top = df.head(20)

    for _, row in top.iterrows():

        print(
            f"{int(row['rank']):>2}. "
            f"{row['skill']:<25} "
            f"{int(row['job_count']):>3} jobs | "
            f"{row['demand_percentage']:>6.2f}% | "
            f"{row['trend_level']}"
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print("\n")
    print("=" * 70)
    print("JOBTREND AI - TRENDING SKILLS ANALYZER")
    print("=" * 70)

    # Load data
    df = load_skill_data()

    print(
        f"\nAnalyzing {len(df):,} job descriptions..."
    )

    # Calculate trends
    trends = calculate_skill_trends(df)

    # Add trend classification
    trends = add_trend_level(trends)

    # Save
    save_results(trends)

    # Display
    display_top_skills(trends)

    print("\n" + "=" * 70)
    print("SKILL TREND ANALYSIS COMPLETE")
    print("=" * 70)

    print(
        f"\nTotal skills detected: "
        f"{len(trends)}"
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()