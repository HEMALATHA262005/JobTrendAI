import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Brain,
  Sparkles,
  Send,
  Loader2,
  Target,
  TrendingUp,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
} from "lucide-react";


const API_BASE = "http://127.0.0.1:5000";


export default function MLPredictor() {

  const navigate = useNavigate();


  const [jobDescription, setJobDescription] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  /* ==========================================================
     PREDICT ROLE
  ========================================================== */

  const predictRole = async () => {

    setError("");

    if (!jobDescription.trim()) {

      setError(
        "Please enter a job description first."
      );

      return;
    }


    if (jobDescription.trim().length < 30) {

      setError(
        "Please enter a more detailed job description for a better prediction."
      );

      return;
    }


    setLoading(true);
    setResult(null);


    try {

      const response = await fetch(
        `${API_BASE}/api/ml/predict-role`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            job_description:
              jobDescription,
          }),
        }
      );


      const data =
        await response.json();


      if (
        !response.ok ||
        data.status !== "success"
      ) {

        throw new Error(
          data.message ||
            "Role prediction failed."
        );

      }


      setResult(data.data);


      /* ======================================================
         SAVE ML RESULT
      ====================================================== */

      localStorage.setItem(
        "latestMLPrediction",
        JSON.stringify(data.data)
      );


      localStorage.setItem(
        "latestMLPredictionTime",
        new Date().toISOString()
      );


      /* Save the original description too */

      localStorage.setItem(
        "latestMLJobDescription",
        jobDescription
      );


    } catch (err) {

      console.error(
        "ML prediction error:",
        err
      );


      setError(
        err.message ||
          "Unable to connect to the ML prediction service."
      );

    } finally {

      setLoading(false);

    }

  };


  /* ==========================================================
     RESET
  ========================================================== */

  const resetPrediction = () => {

    setJobDescription("");

    setResult(null);

    setError("");


    localStorage.removeItem(
      "latestMLPrediction"
    );

    localStorage.removeItem(
      "latestMLPredictionTime"
    );

    localStorage.removeItem(
      "latestMLJobDescription"
    );

  };


  /* ==========================================================
     EXPLORE CAREER
  ========================================================== */

  const exploreCareer = () => {

    if (!result?.predicted_role) {
      return;
    }


    /* Save the predicted role */

    localStorage.setItem(
      "mlPredictedRole",
      result.predicted_role
    );


    /* Navigate to Career Recommendations */

    navigate(
      `/career-recommendations?role=${encodeURIComponent(
        result.predicted_role
      )}`
    );

  };


  return (

    <div className="min-h-screen bg-[#050816] text-white px-6 py-8">

      <div className="max-w-7xl mx-auto">


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-3 mb-3">

            <div
              className="
                p-3
                rounded-xl
                bg-cyan-500/10
                border
                border-cyan-400/20
              "
            >

              <Brain
                size={28}
                className="text-cyan-400"
              />

            </div>


            <div>

              <h1
                className="
                  text-3xl
                  md:text-4xl
                  font-bold
                "
              >
                AI Career Role Predictor
              </h1>


              <p className="text-slate-400 mt-1">

                Use machine learning to identify
                the most suitable career role from
                a job description.

              </p>

            </div>

          </div>


          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              text-cyan-300
            "
          >

            <Sparkles size={16} />

            <span>
              Powered by JobTrend AI NLP + Machine Learning
            </span>

          </div>

        </div>



        {/* ====================================================
            INPUT
        ==================================================== */}

        <div
          className="
            bg-[#0b1224]
            border
            border-slate-800
            rounded-2xl
            p-6
            mb-8
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-4
            "
          >

            <div>

              <h2 className="text-xl font-semibold">
                Enter Job Description
              </h2>


              <p className="text-sm text-slate-400 mt-1">

                Paste the job description you want
                the AI to analyze.

              </p>

            </div>


            {jobDescription && (

              <button
                onClick={resetPrediction}
                className="
                  flex
                  items-center
                  gap-2
                  px-3
                  py-2
                  rounded-lg
                  bg-slate-800
                  hover:bg-slate-700
                  text-slate-300
                  text-sm
                  transition
                "
              >

                <RotateCcw size={15} />

                Reset

              </button>

            )}

          </div>



          <textarea
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(
                e.target.value
              )
            }
            placeholder={`Example:

We are looking for a professional with strong Python programming skills, experience with machine learning, pandas, NumPy, SQL, data analysis and deep learning. The candidate should be comfortable working with datasets, building predictive models and creating data-driven solutions.`}
            className="
              w-full
              min-h-[260px]
              resize-y
              rounded-xl
              bg-[#060b18]
              border
              border-slate-700
              text-white
              placeholder-slate-600
              p-4
              outline-none
              focus:border-cyan-400
              transition
            "
          />



          <div
            className="
              flex
              items-center
              justify-between
              mt-4
            "
          >

            <span className="text-xs text-slate-500">

              {jobDescription.length} characters

            </span>


            <button
              onClick={predictRole}
              disabled={loading}
              className="
                flex
                items-center
                gap-2
                px-6
                py-3
                rounded-xl
                bg-cyan-500
                hover:bg-cyan-400
                disabled:opacity-50
                disabled:cursor-not-allowed
                text-black
                font-semibold
                transition
              "
            >

              {loading ? (

                <>

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Analyzing...

                </>

              ) : (

                <>

                  <Send size={18} />

                  Predict Career Role

                </>

              )}

            </button>

          </div>

        </div>



        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (

          <div
            className="
              mb-8
              p-4
              rounded-xl
              bg-red-500/10
              border
              border-red-500/30
              text-red-300
              flex
              items-start
              gap-3
            "
          >

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />


            <div>

              <p className="font-medium">
                Prediction Error
              </p>


              <p
                className="
                  text-sm
                  mt-1
                  text-red-300/80
                "
              >
                {error}
              </p>

            </div>

          </div>

        )}



        {/* ====================================================
            RESULTS
        ==================================================== */}

        {result && (

          <div className="space-y-8">


            {/* =================================================
                MAIN RESULT
            ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                lg:grid-cols-3
                gap-6
              "
            >


              {/* Predicted Role */}

              <div
                className="
                  lg:col-span-2
                  bg-[#0b1224]
                  border
                  border-cyan-400/20
                  rounded-2xl
                  p-6
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-slate-400
                    mb-4
                  "
                >

                  <Target
                    size={17}
                    className="text-cyan-400"
                  />

                  AI Predicted Career Role

                </div>


                <h2
                  className="
                    text-3xl
                    md:text-4xl
                    font-bold
                    text-cyan-400
                  "
                >

                  {result.predicted_role}

                </h2>


                <p
                  className="
                    text-slate-400
                    mt-3
                  "
                >

                  Based on the skills, keywords and
                  language patterns detected in the
                  job description.

                </p>


                {/* Explore Career Button */}

                <button
                  onClick={exploreCareer}
                  className="
                    mt-6
                    flex
                    items-center
                    gap-2
                    px-5
                    py-3
                    rounded-xl
                    bg-cyan-500
                    hover:bg-cyan-400
                    text-black
                    font-semibold
                    transition
                  "
                >

                  <BriefcaseBusiness size={18} />

                  Explore This Career

                  <ArrowRight size={18} />

                </button>

              </div>



              {/* Confidence */}

              <div
                className="
                  bg-[#0b1224]
                  border
                  border-purple-400/20
                  rounded-2xl
                  p-6
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-slate-400
                    mb-4
                  "
                >

                  <TrendingUp
                    size={17}
                    className="text-purple-400"
                  />

                  Prediction Confidence

                </div>


                <div
                  className="
                    text-4xl
                    font-bold
                    text-purple-400
                  "
                >

                  {result.confidence}%

                </div>


                <div
                  className="
                    mt-5
                    h-2
                    bg-slate-800
                    rounded-full
                    overflow-hidden
                  "
                >

                  <div
                    className="
                      h-full
                      bg-purple-400
                      rounded-full
                      transition-all
                    "
                    style={{
                      width: `${Math.min(
                        Number(
                          result.confidence
                        ) || 0,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>



            {/* =================================================
                TOP PREDICTIONS
            ================================================= */}

            <div
              className="
                bg-[#0b1224]
                border
                border-slate-800
                rounded-2xl
                p-6
              "
            >

              <div className="mb-6">

                <h2 className="text-xl font-semibold">

                  Top Career Predictions

                </h2>


                <p
                  className="
                    text-sm
                    text-slate-400
                    mt-1
                  "
                >

                  Other roles considered by the
                  machine-learning classifier.

                </p>

              </div>


              {Array.isArray(
                result.top_predictions
              ) &&
              result.top_predictions.length > 0 ? (

                <div className="space-y-4">

                  {result.top_predictions.map(
                    (prediction, index) => {

                      const confidence =
                        Number(
                          prediction.confidence
                        ) || 0;


                      return (

                        <div
                          key={`${prediction.role}-${index}`}
                          className="
                            p-4
                            rounded-xl
                            bg-[#060b18]
                            border
                            border-slate-800
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              mb-2
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >

                              <span
                                className="
                                  w-8
                                  h-8
                                  flex
                                  items-center
                                  justify-center
                                  rounded-lg
                                  bg-cyan-500/10
                                  text-cyan-400
                                  text-sm
                                  font-bold
                                "
                              >

                                {index + 1}

                              </span>


                              <span className="font-medium">

                                {prediction.role}

                              </span>

                            </div>


                            <span
                              className="
                                text-sm
                                text-slate-300
                              "
                            >

                              {confidence}%

                            </span>

                          </div>


                          <div
                            className="
                              h-2
                              bg-slate-800
                              rounded-full
                              overflow-hidden
                            "
                          >

                            <div
                              className="
                                h-full
                                bg-cyan-400
                                rounded-full
                              "
                              style={{
                                width: `${Math.min(
                                  confidence,
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              ) : (

                <div
                  className="
                    p-5
                    rounded-xl
                    bg-slate-900/50
                    text-slate-400
                  "
                >

                  No additional predictions were
                  returned by the model.

                </div>

              )}

            </div>



            {/* =================================================
                HOW IT WORKS
            ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-5
              "
            >

              <div
                className="
                  bg-[#0b1224]
                  border
                  border-slate-800
                  rounded-xl
                  p-5
                "
              >

                <div
                  className="
                    text-cyan-400
                    font-bold
                    text-lg
                    mb-2
                  "
                >

                  01

                </div>


                <h3 className="font-semibold mb-1">

                  Text Analysis

                </h3>


                <p className="text-sm text-slate-400">

                  The job description is processed and
                  converted into numerical text features
                  using TF-IDF.

                </p>

              </div>



              <div
                className="
                  bg-[#0b1224]
                  border
                  border-slate-800
                  rounded-xl
                  p-5
                "
              >

                <div
                  className="
                    text-purple-400
                    font-bold
                    text-lg
                    mb-2
                  "
                >

                  02

                </div>


                <h3 className="font-semibold mb-1">

                  ML Classification

                </h3>


                <p className="text-sm text-slate-400">

                  A trained Logistic Regression classifier
                  analyzes the language patterns in the
                  job description.

                </p>

              </div>



              <div
                className="
                  bg-[#0b1224]
                  border
                  border-slate-800
                  rounded-xl
                  p-5
                "
              >

                <div
                  className="
                    text-emerald-400
                    font-bold
                    text-lg
                    mb-2
                  "
                >

                  03

                </div>


                <h3 className="font-semibold mb-1">

                  Career Prediction

                </h3>


                <p className="text-sm text-slate-400">

                  The system returns the most likely
                  career role together with prediction
                  confidence.

                </p>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );
}