import os
import json
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
)
import joblib


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "job_description_features.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml",
    "models"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "role_classifier.pkl"
)

METRICS_PATH = os.path.join(
    MODEL_DIR,
    "role_classifier_metrics.json"
)


# ============================================================
# CREATE MODEL DIRECTORY
# ============================================================

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 60)
print("JOBTREND AI - ROLE CLASSIFIER")
print("=" * 60)

print("\nLoading dataset...")

df = pd.read_csv(
    DATA_PATH
)

print(
    f"Dataset loaded: {len(df)} rows"
)


# ============================================================
# CHECK REQUIRED COLUMNS
# ============================================================

required_columns = [
    "Category",
    "nlp_text",
]

missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing_columns:

    raise ValueError(
        "Missing required columns: "
        + ", ".join(missing_columns)
    )


# ============================================================
# CLEAN DATA
# ============================================================

df = df[
    ["Category", "nlp_text"]
].copy()

df["Category"] = (
    df["Category"]
    .fillna("")
    .astype(str)
    .str.strip()
)

df["nlp_text"] = (
    df["nlp_text"]
    .fillna("")
    .astype(str)
    .str.strip()
)

df = df[
    (df["Category"] != "") &
    (df["nlp_text"] != "")
]

print(
    f"Rows after cleaning: {len(df)}"
)


# ============================================================
# REMOVE VERY RARE CATEGORIES
# ============================================================

category_counts = (
    df["Category"]
    .value_counts()
)

valid_categories = (
    category_counts[
        category_counts >= 2
    ].index
)

df = df[
    df["Category"].isin(
        valid_categories
    )
].copy()

print(
    f"Categories used: {df['Category'].nunique()}"
)


# ============================================================
# DISPLAY CATEGORY DISTRIBUTION
# ============================================================

print("\nCategory distribution:")

print(
    df["Category"]
    .value_counts()
    .head(20)
)


# ============================================================
# FEATURES AND TARGET
# ============================================================

X = df["nlp_text"]

y = df["Category"]


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

print("\nCreating train/test split...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

print(
    f"Training samples: {len(X_train)}"
)

print(
    f"Testing samples: {len(X_test)}"
)


# ============================================================
# MACHINE LEARNING PIPELINE
# ============================================================

print("\nBuilding TF-IDF + Logistic Regression model...")

model = Pipeline(
    steps=[
        (
            "tfidf",
            TfidfVectorizer(
                lowercase=True,
                stop_words="english",
                ngram_range=(1, 2),
                min_df=1,
                max_df=0.95,
                sublinear_tf=True,
                max_features=20000,
            ),
        ),

        (
            "classifier",
            LogisticRegression(
                max_iter=2000,
                class_weight="balanced",
                random_state=42,
            ),
        ),
    ]
)


# ============================================================
# TRAIN
# ============================================================

print("\nTraining model...")

model.fit(
    X_train,
    y_train
)

print(
    "Training completed."
)


# ============================================================
# PREDICTION
# ============================================================

print("\nEvaluating model...")

y_pred = model.predict(
    X_test
)


# ============================================================
# METRICS
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

macro_f1 = f1_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0,
)

weighted_f1 = f1_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0,
)

report = classification_report(
    y_test,
    y_pred,
    output_dict=True,
    zero_division=0,
)


# ============================================================
# PRINT RESULTS
# ============================================================

print("\n" + "=" * 60)
print("MODEL RESULTS")
print("=" * 60)

print(
    f"\nAccuracy : {accuracy:.4f}"
)

print(
    f"Macro F1 : {macro_f1:.4f}"
)

print(
    f"Weighted F1 : {weighted_f1:.4f}"
)

print("\nClassification Report:\n")

print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0,
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(
    model,
    MODEL_PATH
)

print(
    f"\nModel saved to:"
)

print(
    MODEL_PATH
)


# ============================================================
# SAVE METRICS
# ============================================================

metrics = {

    "model": (
        "TF-IDF + Logistic Regression"
    ),

    "dataset_rows":
        int(len(df)),

    "categories":
        int(df["Category"].nunique()),

    "training_samples":
        int(len(X_train)),

    "testing_samples":
        int(len(X_test)),

    "accuracy":
        round(float(accuracy), 4),

    "macro_f1":
        round(float(macro_f1), 4),

    "weighted_f1":
        round(float(weighted_f1), 4),

    "classification_report":
        report,
}


with open(
    METRICS_PATH,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        metrics,
        file,
        indent=4
    )


print(
    f"Metrics saved to:"
)

print(
    METRICS_PATH
)


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 60)
print("ROLE CLASSIFIER TRAINING COMPLETE")
print("=" * 60)