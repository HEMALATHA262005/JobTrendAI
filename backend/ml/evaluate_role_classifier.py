
import os
import json
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
)
import matplotlib.pyplot as plt


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATA_PATH = os.path.join(
    BASE_DIR, "data", "processed",
    "job_description_features.csv"
)

MODEL_PATH = os.path.join(
    BASE_DIR, "ml", "models",
    "role_classifier.pkl"
)

OUTPUT_DIR = os.path.join(
    BASE_DIR, "ml", "models"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)


def main():
    print("=" * 60)
    print("JOBTREND AI - CLASSIFIER EVALUATION")
    print("=" * 60)

    df = pd.read_csv(DATA_PATH)

    required = ["Category", "nlp_text"]
    missing = [col for col in required if col not in df.columns]

    if missing:
        raise ValueError(f"Missing dataset columns: {missing}")

    df = df[required].copy()
    df["Category"] = df["Category"].fillna("").astype(str).str.strip()
    df["nlp_text"] = df["nlp_text"].fillna("").astype(str).str.strip()
    df = df[(df["Category"] != "") & (df["nlp_text"] != "")]

    counts = df["Category"].value_counts()
    valid_categories = counts[counts >= 2].index
    df = df[df["Category"].isin(valid_categories)].copy()

    X = df["nlp_text"]
    y = df["Category"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    model = joblib.load(MODEL_PATH)

    # Evaluate the saved model on the same held-out split.
    y_pred = model.predict(X_test)

    labels = sorted(y.unique())

    print(f"\nDataset rows: {len(df)}")
    print(f"Test examples: {len(y_test)}")
    print(f"Categories: {len(labels)}")
    print(f"\nAccuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(
        "Macro precision: "
        f"{precision_score(y_test, y_pred, average='macro', zero_division=0):.4f}"
    )
    print(
        "Macro recall: "
        f"{recall_score(y_test, y_pred, average='macro', zero_division=0):.4f}"
    )
    print(
        "Macro F1: "
        f"{f1_score(y_test, y_pred, average='macro', zero_division=0):.4f}"
    )
    print("\nClassification report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    cm = confusion_matrix(y_test, y_pred, labels=labels)
    print("Confusion matrix (rows = actual, columns = predicted):")
    print(pd.DataFrame(cm, index=labels, columns=labels))

    report = classification_report(
        y_test,
        y_pred,
        output_dict=True,
        zero_division=0,
    )

    results = {
        "model": "TF-IDF + Logistic Regression",
        "test_samples": int(len(y_test)),
        "categories": labels,
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "macro_precision": float(
            precision_score(y_test, y_pred, average="macro", zero_division=0)
        ),
        "macro_recall": float(
            recall_score(y_test, y_pred, average="macro", zero_division=0)
        ),
        "macro_f1": float(
            f1_score(y_test, y_pred, average="macro", zero_division=0)
        ),
        "classification_report": report,
        "confusion_matrix": cm.tolist(),
    }

    json_path = os.path.join(OUTPUT_DIR, "role_classifier_evaluation.json")
    with open(json_path, "w", encoding="utf-8") as file:
        json.dump(results, file, indent=4)

    image_path = os.path.join(OUTPUT_DIR, "role_classifier_confusion_matrix.png")
    display = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=labels,
    )
    display.plot(xticks_rotation=45, cmap="Blues", values_format="d")
    plt.title("JobTrend AI - Role Classifier Confusion Matrix")
    plt.tight_layout()
    plt.savefig(image_path, dpi=150)
    plt.close()

    print(f"\nEvaluation JSON saved: {json_path}")
    print(f"Confusion matrix image saved: {image_path}")
    print("\nEvaluation complete.")


if __name__ == "__main__":
    main()
