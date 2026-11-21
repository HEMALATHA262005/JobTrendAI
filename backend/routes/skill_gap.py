from flask import Blueprint, request, jsonify
from pypdf import PdfReader

from routes.skill_engine import (
    extract_skills,
    display_skills,
    compare_skills,
    calculate_match_percentage,
    build_priority_results
)


skill_gap = Blueprint(
    "skill_gap",
    __name__
)


# ==========================================
# EXTRACT PDF TEXT
# ==========================================

def extract_pdf_text(pdf_file):

    reader = PdfReader(
        pdf_file
    )

    text_parts = []

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text_parts.append(
                page_text
            )

    return "\n".join(
        text_parts
    )


# ==========================================
# ANALYZE SKILL GAP
# ==========================================

@skill_gap.route(
    "/",
    methods=["POST"]
)
def analyze_skill_gap():

    try:

        # ----------------------------------
        # GET RESUME
        # ----------------------------------

        resume = request.files.get(
            "resume"
        )

        # ----------------------------------
        # GET JOB DESCRIPTION
        # ----------------------------------

        job_description = request.form.get(
            "job_description",
            ""
        ).strip()

        # ----------------------------------
        # VALIDATE RESUME
        # ----------------------------------

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

        # ----------------------------------
        # VALIDATE JD
        # ----------------------------------

        if not job_description:

            return jsonify({
                "status": "error",
                "message": "Job description is required"
            }), 400

        # ----------------------------------
        # EXTRACT RESUME TEXT
        # ----------------------------------

        resume_text = extract_pdf_text(
            resume
        )

        if not resume_text.strip():

            return jsonify({
                "status": "error",
                "message": "Could not extract text from the resume PDF"
            }), 400

        # ----------------------------------
        # EXTRACT SKILLS
        # ----------------------------------

        resume_skill_keys = extract_skills(
            resume_text
        )

        required_skill_keys = extract_skills(
            job_description
        )

        # ----------------------------------
        # COMPARE
        # ----------------------------------

        (
            matched_skill_keys,
            missing_skill_keys
        ) = compare_skills(
            resume_skill_keys,
            required_skill_keys
        )

        # ----------------------------------
        # MATCH %
        # ----------------------------------

        skill_match = calculate_match_percentage(
            matched_skill_keys,
            required_skill_keys
        )

        # ----------------------------------
        # PRIORITY
        # ----------------------------------

        priority_results = build_priority_results(
            missing_skill_keys,
            job_description
        )

        # ----------------------------------
        # RESPONSE
        # ----------------------------------

        return jsonify({

            "status": "success",

            "message": "Skill gap analysis completed",

            "data": {

                "skill_match": skill_match,

                "resume_skills": display_skills(
                    resume_skill_keys
                ),

                "required_skills": display_skills(
                    required_skill_keys
                ),

                "matched_skills": display_skills(
                    matched_skill_keys
                ),

                "missing_skills": display_skills(
                    missing_skill_keys
                ),

                "skill_priorities": priority_results,

                "resume_text_length": len(
                    resume_text
                ),

                "job_description_length": len(
                    job_description
                )
            }

        }), 200

    except Exception as error:

        print(
            "SKILL GAP ERROR:",
            error
        )

        return jsonify({

            "status": "error",

            "message": "Could not analyze skill gap"

        }), 500