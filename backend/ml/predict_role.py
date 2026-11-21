import os

import joblib


# ============================================================
# PATH
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "models",
    "role_classifier.pkl"
)


# ============================================================
# LOAD MODEL
# ============================================================

_model = None


def load_model():

    global _model

    if _model is None:

        if not os.path.exists(MODEL_PATH):

            raise FileNotFoundError(
                "Role classifier model not found. "
                "Run train_role_classifier.py first."
            )

        _model = joblib.load(
            MODEL_PATH
        )

    return _model


# ============================================================
# PREDICT ROLE
# ============================================================

def predict_role(text):

    if not text or not str(text).strip():

        raise ValueError(
            "Job description text is required."
        )

    model = load_model()

    text = str(text).strip()

    # --------------------------------------------
    # PREDICT
    # --------------------------------------------

    prediction = model.predict(
        [text]
    )[0]

    # --------------------------------------------
    # CONFIDENCE
    # --------------------------------------------

    confidence = None

    try:

        probabilities = (
            model.predict_proba(
                [text]
            )[0]
        )

        confidence = float(
            max(probabilities)
        )

    except Exception:

        confidence = None

    # --------------------------------------------
    # TOP PREDICTIONS
    # --------------------------------------------

    top_predictions = []

    try:

        probabilities = (
            model.predict_proba(
                [text]
            )[0]
        )

        classifier = (
            model.named_steps[
                "classifier"
            ]
        )

        classes = (
            classifier.classes_
        )

        ranked_indexes = sorted(
            range(
                len(probabilities)
            ),
            key=lambda i:
                probabilities[i],
            reverse=True
        )

        for index in ranked_indexes[:5]:

            top_predictions.append({

                "role":
                    str(classes[index]),

                "confidence":
                    round(
                        float(
                            probabilities[index]
                        ) * 100,
                        2
                    )
            })

    except Exception:

        top_predictions = []


    # --------------------------------------------
    # RESULT
    # --------------------------------------------

    return {

        "predicted_role":
            str(prediction),

        "confidence":
            round(
                confidence * 100,
                2
            )
            if confidence is not None
            else None,

        "top_predictions":
            top_predictions
    }