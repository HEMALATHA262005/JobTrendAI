import pandas as pd
import numpy as np
from pathlib import Path
import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODEL_DIR = BASE_DIR / "ml" / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# LOAD DATA
# ============================================================

def load_data():

    file_path = (
        PROCESSED_DIR /
        "job_posting_features.csv"
    )

    if not file_path.exists():

        raise FileNotFoundError(
            f"Dataset not found: {file_path}"
        )

    df = pd.read_csv(file_path)

    return df


# ============================================================
# PREPARE FEATURES
# ============================================================

def prepare_features(df):

    # --------------------------------------------------------
    # Create demand count for each category
    # --------------------------------------------------------

    category_counts = (
        df["Category"]
        .value_counts()
    )

    df["demand_count"] = (
        df["Category"]
        .map(category_counts)
    )

    # --------------------------------------------------------
    # Feature columns
    # --------------------------------------------------------

    feature_columns = [
        "category_length",
        "location_length",
        "is_remote",
        "is_hybrid",
        "is_onsite",
        "is_full_time",
        "is_part_time"
    ]

    X = df[feature_columns].fillna(0)

    y = df["demand_count"].fillna(0)

    return X, y, feature_columns


# ============================================================
# TRAIN MODEL
# ============================================================

def train_model():

    print("\n" + "=" * 70)
    print("JOBTREND AI - JOB DEMAND MODEL")
    print("=" * 70)

    # --------------------------------------------------------
    # Load dataset
    # --------------------------------------------------------

    df = load_data()

    print(f"\nDataset rows: {len(df):,}")

    print(
        f"Unique job categories: "
        f"{df['Category'].nunique()}"
    )

    # --------------------------------------------------------
    # Prepare features
    # --------------------------------------------------------

    X, y, feature_columns = prepare_features(df)

    print(
        f"Features used: "
        f"{len(feature_columns)}"
    )

    print("\nFeatures:")

    for feature in feature_columns:

        print(f"  - {feature}")

    # --------------------------------------------------------
    # Train/test split
    # --------------------------------------------------------

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42
        )
    )

    print(
        f"\nTraining samples: "
        f"{len(X_train):,}"
    )

    print(
        f"Testing samples: "
        f"{len(X_test):,}"
    )

    # --------------------------------------------------------
    # Create model
    # --------------------------------------------------------

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        max_depth=10
    )

    # --------------------------------------------------------
    # Train
    # --------------------------------------------------------

    print("\nTraining model...")

    model.fit(
        X_train,
        y_train
    )

    print("Model training completed.")

    # --------------------------------------------------------
    # Predictions
    # --------------------------------------------------------

    predictions = model.predict(X_test)

    # --------------------------------------------------------
    # Evaluation
    # --------------------------------------------------------

    mae = mean_absolute_error(
        y_test,
        predictions
    )

    r2 = r2_score(
        y_test,
        predictions
    )

    print("\n" + "-" * 70)
    print("MODEL EVALUATION")
    print("-" * 70)

    print(
        f"Mean Absolute Error: "
        f"{mae:.4f}"
    )

    print(
        f"R² Score: "
        f"{r2:.4f}"
    )

    # --------------------------------------------------------
    # Feature importance
    # --------------------------------------------------------

    print("\nFeature Importance:")

    importance = model.feature_importances_

    feature_importance = sorted(
        zip(
            feature_columns,
            importance
        ),
        key=lambda item: item[1],
        reverse=True
    )

    for feature, score in feature_importance:

        print(
            f"  {feature}: "
            f"{score:.4f}"
        )

    # --------------------------------------------------------
    # Save model
    # --------------------------------------------------------

    model_path = (
        MODEL_DIR /
        "job_demand_model.pkl"
    )

    metadata_path = (
        MODEL_DIR /
        "job_demand_features.pkl"
    )

    joblib.dump(
        model,
        model_path
    )

    joblib.dump(
        feature_columns,
        metadata_path
    )

    print("\n" + "-" * 70)

    print(
        f"Model saved to:\n"
        f"{model_path}"
    )

    print(
        f"Feature metadata saved to:\n"
        f"{metadata_path}"
    )

    # --------------------------------------------------------
    # Show category demand
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("JOB CATEGORY DEMAND")
    print("=" * 70)

    demand = (
        df.groupby("Category")
        .size()
        .sort_values(
            ascending=False
        )
    )

    for category, count in demand.items():

        print(
            f"{category:<35} "
            f"{count:>4} postings"
        )

    print("\n" + "=" * 70)
    print("MODEL TRAINING COMPLETE")
    print("=" * 70)

    return model


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    train_model()