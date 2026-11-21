from flask import Blueprint, jsonify, request

from ml.predict_role import predict_role


# ============================================================
# BLUEPRINT
# ============================================================

ml_prediction = Blueprint(
    "ml_prediction",
    __name__
)


# ============================================================
# PREDICT CAREER ROLE
# ============================================================

@ml_prediction.route(
    "/predict-role",
    methods=["POST"]
)
def predict_career_role():

    try:

        data = request.get_json(
            silent=True
        ) or {}

        text = data.get(
            "job_description",
            ""
        )

        if not text.strip():

            return jsonify({

                "status": "error",

                "message":
                    "Job description is required."

            }), 400


        result = predict_role(
            text
        )


        return jsonify({

            "status": "success",

            "data": result,

            "source":
                "JobTrend AI ML Role Classifier"

        }), 200


    except FileNotFoundError as error:

        return jsonify({

            "status": "error",

            "message": str(error)

        }), 500


    except ValueError as error:

        return jsonify({

            "status": "error",

            "message": str(error)

        }), 400


    except Exception as error:

        print(
            "ML PREDICTION ERROR:",
            error
        )

        return jsonify({

            "status": "error",

            "message":
                "Could not predict career role."

        }), 500