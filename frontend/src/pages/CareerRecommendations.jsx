import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  BriefcaseBusiness,
  Target,
  TrendingUp,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Brain,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Map,
  BookOpen,
  FileSearch,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:5000";

export default function CareerRecommendations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [skills, setSkills] = useState([]);

  const [recommendations, setRecommendations] = useState([]);

  const [predictedRole, setPredictedRole] = useState("");

  const [predictionConfidence, setPredictionConfidence] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoadingProfile(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "Please log in to use Career Recommendations."
        );

        return;
      }

      const response = await fetch(
        `${API_BASE}/api/auth/profile`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load your profile."
        );
      }

      const profile =
        data.data ||
        data.user ||
        {};

      let profileSkills =
        profile.skills || [];

      // Handle comma-separated skills
      if (
        typeof profileSkills === "string"
      ) {
        profileSkills =
          profileSkills
            .split(",")
            .map((skill) =>
              skill.trim()
            )
            .filter(Boolean);
      }

      if (
        Array.isArray(profileSkills)
      ) {
        setSkills(profileSkills);
      }
    } catch (err) {
      console.error(
        "PROFILE LOAD ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  // =========================================================
  // LOAD ML PREDICTED ROLE
  // =========================================================

  useEffect(() => {
    const roleFromUrl =
      searchParams.get("role");

    const roleFromStorage =
      localStorage.getItem(
        "mlPredictedRole"
      );

    const storedPrediction =
      localStorage.getItem(
        "latestMLPrediction"
      );

    const role =
      roleFromUrl ||
      roleFromStorage ||
      "";

    if (role) {
      setPredictedRole(role);
    }

    if (storedPrediction) {
      try {
        const prediction =
          JSON.parse(
            storedPrediction
          );

        if (
          prediction &&
          prediction.confidence !==
            undefined
        ) {
          setPredictionConfidence(
            prediction.confidence
          );
        }
      } catch (err) {
        console.error(
          "ML PREDICTION STORAGE ERROR:",
          err
        );
      }
    }
  }, [searchParams]);

  // =========================================================
  // FETCH RECOMMENDATIONS AFTER PROFILE LOAD
  // =========================================================

  useEffect(() => {
    if (
      !loadingProfile &&
      skills.length > 0
    ) {
      fetchRecommendations(skills);
    }
  }, [
    loadingProfile,
    predictedRole,
  ]);

  // =========================================================
  // EXTRACT RECOMMENDATIONS
  // =========================================================
  //
  // This is the important fix.
  //
  // The backend may return:
  //
  // data.recommendations
  // data.data
  // data.data.recommendations
  // data.results
  //
  // We support all of them.
  // =========================================================

  const extractRecommendations = (
    responseData
  ) => {
    if (
      Array.isArray(
        responseData?.recommendations
      )
    ) {
      return responseData.recommendations;
    }

    if (
      Array.isArray(
        responseData?.results
      )
    ) {
      return responseData.results;
    }

    if (
      Array.isArray(
        responseData?.data
      )
    ) {
      return responseData.data;
    }

    if (
      Array.isArray(
        responseData?.data?.recommendations
      )
    ) {
      return responseData.data.recommendations;
    }

    if (
      Array.isArray(
        responseData?.data?.results
      )
    ) {
      return responseData.data.results;
    }

    return [];
  };

  // =========================================================
  // FETCH RECOMMENDATIONS
  // =========================================================

  const fetchRecommendations =
    async (currentSkills) => {
      if (
        !Array.isArray(currentSkills) ||
        currentSkills.length === 0
      ) {
        setRecommendations([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_BASE}/api/career-recommendations/`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                ...(token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {}),
              },

              body: JSON.stringify({
                skills: currentSkills,
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          "CAREER RECOMMENDATION API RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load career recommendations."
          );
        }

        if (
          data.status &&
          data.status !== "success"
        ) {
          throw new Error(
            data.message ||
              "Career recommendation request failed."
          );
        }

        let results =
          extractRecommendations(
            data
          );

        // ===================================================
        // PRIORITIZE ML PREDICTED ROLE
        // ===================================================

        if (
          predictedRole &&
          Array.isArray(results)
        ) {
          const normalizedPredictedRole =
            predictedRole
              .toLowerCase()
              .trim();

          results = [
            ...results,
          ].sort((a, b) => {
            const aRole =
              String(
                a?.role ||
                  a?.title ||
                  ""
              )
                .toLowerCase()
                .trim();

            const bRole =
              String(
                b?.role ||
                  b?.title ||
                  ""
              )
                .toLowerCase()
                .trim();

            const aMatch =
              aRole ===
              normalizedPredictedRole;

            const bMatch =
              bRole ===
              normalizedPredictedRole;

            if (
              aMatch &&
              !bMatch
            ) {
              return -1;
            }

            if (
              !aMatch &&
              bMatch
            ) {
              return 1;
            }

            return 0;
          });
        }

        setRecommendations(
          results
        );

        // ===================================================
        // SAVE RESULTS
        // ===================================================

        localStorage.setItem(
          "latestCareerRecommendations",
          JSON.stringify(results)
        );

        localStorage.setItem(
          "latestCareerRecommendationsTime",
          new Date().toISOString()
        );

        localStorage.setItem(
          "careerRecommendationSkills",
          JSON.stringify(
            currentSkills
          )
        );

        if (
          results.length === 0
        ) {
          setError(
            "No career recommendations were returned. Try adding more skills to your profile."
          );
        }
      } catch (err) {
        console.error(
          "CAREER RECOMMENDATION ERROR:",
          err
        );

        setRecommendations([]);

        setError(
          err.message ||
            "Unable to load career recommendations."
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================================================
  // REFRESH
  // =========================================================

  const refreshRecommendations =
    () => {
      if (
        skills.length === 0
      ) {
        setError(
          "Add some skills to your profile first."
        );

        return;
      }

      fetchRecommendations(
        skills
      );
    };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const openSkillGap =
    (recommendation) => {
      const role =
        recommendation?.role ||
        recommendation?.title ||
        predictedRole ||
        "";

      navigate(
        `/skill-gap?role=${encodeURIComponent(
          role
        )}`
      );
    };

  const openRoadmap =
    (recommendation) => {
      const role =
        recommendation?.role ||
        recommendation?.title ||
        predictedRole ||
        "";

      navigate(
        `/career-roadmap?role=${encodeURIComponent(
          role
        )}`
      );
    };

  const openLearningHub =
    (recommendation) => {
      const role =
        recommendation?.role ||
        recommendation?.title ||
        predictedRole ||
        "";

      const missing =
        getArray(
          recommendation,
          [
            "missing_skills",
            "missing",
          ]
        );

      if (
        missing.length > 0
      ) {
        navigate(
          `/learning-hub?role=${encodeURIComponent(
            role
          )}&skills=${encodeURIComponent(
            missing.join(",")
          )}`
        );
      } else {
        navigate(
          `/learning-hub?role=${encodeURIComponent(
            role
          )}`
        );
      }
    };

  const openMLPredictor =
    () => {
      navigate(
        "/ml-predictor"
      );
    };

  // =========================================================
  // HELPERS
  // =========================================================

  const getNumber =
    (...values) => {
      for (
        const value of values
      ) {
        if (
          value !==
            undefined &&
          value !== null &&
          value !== ""
        ) {
          const number =
            Number(value);

          if (
            !Number.isNaN(number)
          ) {
            return number;
          }
        }
      }

      return 0;
    };

  const getArray = (
    object,
    keys
  ) => {
    for (
      const key of keys
    ) {
      if (
        Array.isArray(
          object?.[key]
        )
      ) {
        return object[key];
      }
    }

    return [];
  };

  const getRole =
    (recommendation) => {
      return (
        recommendation?.role ||
        recommendation?.title ||
        "Career Role"
      );
    };

  const getMatch =
    (recommendation) => {
      return getNumber(
        recommendation?.skill_match,
        recommendation?.skill_match_percentage,
        recommendation?.match_score,
        recommendation?.score,
        recommendation?.match
      );
    };

  const getScore =
    (recommendation) => {
      return getNumber(
        recommendation?.score,
        recommendation?.overall_score,
        recommendation?.recommendation_score
      );
    };

  const getDemand =
    (recommendation) => {
      return (
        recommendation?.demand ||
        recommendation?.demand_level ||
        "Not available"
      );
    };

  const getGrowth =
    (recommendation) => {
      return (
        recommendation?.growth ||
        recommendation?.demand_growth ||
        recommendation?.growth_rate ||
        "Not available"
      );
    };

  const getSalary =
    (recommendation) => {
      return (
        recommendation?.salary ||
        "Not available"
      );
    };

  const getOpenings =
    (recommendation) => {
      return (
        recommendation?.openings ||
        recommendation?.opening_count ||
        "Not available"
      );
    };

  const getMatchedSkills =
    (recommendation) => {
      return getArray(
        recommendation,
        [
          "matched_skills",
          "matched",
        ]
      );
    };

  const getMissingSkills =
    (recommendation) => {
      return getArray(
        recommendation,
        [
          "missing_skills",
          "missing",
        ]
      );
    };

  const getMatchTextColor =
    (percentage) => {
      if (
        percentage >= 80
      ) {
        return "text-emerald-400";
      }

      if (
        percentage >= 60
      ) {
        return "text-cyan-400";
      }

      if (
        percentage >= 40
      ) {
        return "text-yellow-400";
      }

      return "text-red-400";
    };

  const getProgressColor =
    (percentage) => {
      if (
        percentage >= 80
      ) {
        return "bg-emerald-400";
      }

      if (
        percentage >= 60
      ) {
        return "bg-cyan-400";
      }

      if (
        percentage >= 40
      ) {
        return "bg-yellow-400";
      }

      return "bg-red-400";
    };

  // =========================================================
  // LOADING PROFILE
  // =========================================================

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-4"
          />

          <p className="text-slate-400">
            Loading your career profile...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // EMPTY SKILLS
  // =========================================================

  if (
    !loadingProfile &&
    skills.length === 0
  ) {
    return (
      <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="mb-8 text-sm text-slate-400 hover:text-white transition"
          >
            ← Back to Dashboard
          </button>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1224] p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10">
              <Target className="h-8 w-8 text-cyan-400" />
            </div>

            <h1 className="text-2xl font-bold mb-3">
              Add Your Skills First
            </h1>

            <p className="mx-auto mb-7 max-w-xl text-slate-400">
              Add your current skills to
              your profile so JobTrend AI
              can recommend suitable
              career paths.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/profile")
              }
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#050816] text-white relative overflow-hidden">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative z-10 border-b border-white/10 bg-[#07111f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className="mb-3 text-sm text-slate-400 transition hover:text-white"
            >
              ← Back to Dashboard
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10">
                <BriefcaseBusiness className="h-6 w-6 text-cyan-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  Career Recommendations
                </h1>

                <p className="text-sm text-slate-500">
                  AI-powered career matching
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={
              refreshRecommendations
            }
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            Refresh
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">

        {/* ===================================================
            ML PREDICTION
        =================================================== */}

        {predictedRole && (
          <section className="mb-8 rounded-2xl border border-purple-400/20 bg-gradient-to-r from-purple-500/10 via-cyan-500/5 to-transparent p-6">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-purple-300">
                  <Brain className="h-4 w-4" />

                  ML Job Description Prediction
                </div>

                <h2 className="text-2xl font-bold">
                  Predicted Role:

                  <span className="ml-2 text-cyan-400">
                    {predictedRole}
                  </span>
                </h2>

                {predictionConfidence !==
                  null && (
                  <p className="mt-2 text-sm text-purple-300">
                    Model confidence:{" "}
                    <span className="font-semibold">
                      {predictionConfidence}%
                    </span>
                  </p>
                )}

                <p className="mt-2 text-sm text-slate-400">
                  This career was identified
                  by the JobTrend AI machine
                  learning classifier.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  openMLPredictor
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-purple-400/20 bg-purple-500/10 px-5 py-3 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20"
              >
                <Brain className="h-4 w-4" />

                View Prediction

                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {/* ===================================================
            YOUR SKILLS
        =================================================== */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-[#0b1224] p-6">

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10">
              <Target className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                Your Current Skills
              </h2>

              <p className="text-sm text-slate-500">
                Skills used for career matching
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map(
              (skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300"
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </section>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-medium">
                Something needs attention
              </p>

              <p className="mt-1 text-sm text-red-300/80">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="mb-8 rounded-2xl border border-slate-800 bg-[#0b1224] p-10 text-center">
            <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-cyan-400" />

            <h3 className="text-lg font-semibold">
              Analyzing your skills...
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Finding the best career matches
              for you.
            </p>
          </div>
        )}

        {/* ===================================================
            RESULTS HEADER
        =================================================== */}

        {!loading &&
          recommendations.length >
            0 && (
            <div className="mb-6 flex items-end justify-between">

              <div>
                <div className="mb-2 flex items-center gap-2 text-cyan-400">
                  <Sparkles className="h-5 w-5" />

                  <span className="text-sm font-semibold uppercase tracking-wider">
                    AI Analysis
                  </span>
                </div>

                <h2 className="text-2xl font-bold md:text-3xl">
                  Your Best Career Matches
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Ranked using your skills and
                  available market data.
                </p>
              </div>

              <div className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400 md:block">
                {recommendations.length}{" "}
                matches
              </div>
            </div>
          )}

        {/* ===================================================
            RECOMMENDATION CARDS
        =================================================== */}

        {!loading &&
          recommendations.length >
            0 && (
            <div className="space-y-6">

              {recommendations.map(
                (
                  recommendation,
                  index
                ) => {
                  const role =
                    getRole(
                      recommendation
                    );

                  const match =
                    Math.min(
                      100,
                      Math.max(
                        0,
                        getMatch(
                          recommendation
                        )
                      )
                    );

                  const score =
                    getScore(
                      recommendation
                    );

                  const demand =
                    getDemand(
                      recommendation
                    );

                  const growth =
                    getGrowth(
                      recommendation
                    );

                  const salary =
                    getSalary(
                      recommendation
                    );

                  const openings =
                    getOpenings(
                      recommendation
                    );

                  const matchedSkills =
                    getMatchedSkills(
                      recommendation
                    );

                  const missingSkills =
                    getMissingSkills(
                      recommendation
                    );

                  const isMLRole =
                    predictedRole &&
                    role
                      .toLowerCase()
                      .trim() ===
                      predictedRole
                        .toLowerCase()
                        .trim();

                  return (
                    <article
                      key={`${role}-${index}`}
                      className={`overflow-hidden rounded-2xl border bg-[#0b1224] transition hover:-translate-y-0.5 ${
                        isMLRole
                          ? "border-purple-400/30 shadow-lg shadow-purple-500/5"
                          : "border-slate-800"
                      }`}
                    >

                      {/* CARD HEADER */}

                      <div className="p-6">

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                          <div className="flex items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10">
                              <BriefcaseBusiness className="h-6 w-6 text-cyan-400" />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">

                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                  #{index + 1}
                                </span>

                                {isMLRole && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/20 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-300">
                                    <Brain className="h-3 w-3" />

                                    ML Predicted
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-1 text-2xl font-bold">
                                {role}
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                Based on your current
                                skill profile and
                                market data.
                              </p>
                            </div>
                          </div>

                          {/* MATCH SCORE */}

                          <div className="min-w-[150px] rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-center">
                            <p className="text-xs uppercase tracking-wider text-slate-500">
                              Skill Match
                            </p>

                            <p
                              className={`mt-1 text-3xl font-bold ${getMatchTextColor(
                                match
                              )}`}
                            >
                              {Math.round(
                                match
                              )}
                              %
                            </p>
                          </div>
                        </div>

                        {/* PROGRESS */}

                        <div className="mt-6">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                              Skill compatibility
                            </span>

                            <span className="text-slate-400">
                              {Math.round(
                                match
                              )}
                              / 100
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white/5">
                            <div
                              className={`h-full rounded-full transition-all ${getProgressColor(
                                match
                              )}`}
                              style={{
                                width: `${match}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* MARKET STATS */}

                        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">

                          <div className="rounded-xl border border-white/5 bg-black/10 p-4">
                            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                              <TrendingUp className="h-4 w-4" />

                              Demand
                            </div>

                            <p className="font-semibold text-white">
                              {demand}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/5 bg-black/10 p-4">
                            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                              <TrendingUp className="h-4 w-4" />

                              Growth
                            </div>

                            <p className="font-semibold text-emerald-300">
                              {growth}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/5 bg-black/10 p-4">
                            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                              <BriefcaseBusiness className="h-4 w-4" />

                              Salary
                            </div>

                            <p className="font-semibold text-white">
                              {salary}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/5 bg-black/10 p-4">
                            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                              <Target className="h-4 w-4" />

                              Openings
                            </div>

                            <p className="font-semibold text-white">
                              {openings}
                            </p>
                          </div>
                        </div>

                        {/* SCORE */}

                        {score > 0 && (
                          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-purple-400/20 bg-purple-500/5 px-3 py-2 text-sm">
                            <Sparkles className="h-4 w-4 text-purple-300" />

                            <span className="text-slate-400">
                              Recommendation Score:
                            </span>

                            <span className="font-semibold text-purple-300">
                              {Math.round(
                                score
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* DETAILS */}

                      <div className="border-t border-white/10 p-6">

                        <div className="grid gap-6 lg:grid-cols-2">

                          {/* MATCHED */}

                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-emerald-400" />

                              <h4 className="font-semibold">
                                Matched Skills
                              </h4>
                            </div>

                            {matchedSkills.length >
                            0 ? (
                              <div className="flex flex-wrap gap-2">
                                {matchedSkills.map(
                                  (
                                    skill,
                                    skillIndex
                                  ) => (
                                    <span
                                      key={`${skill}-${skillIndex}`}
                                      className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500">
                                No direct skill
                                matches detected.
                              </p>
                            )}
                          </div>

                          {/* MISSING */}

                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <XCircle className="h-5 w-5 text-red-400" />

                              <h4 className="font-semibold">
                                Skills to Develop
                              </h4>
                            </div>

                            {missingSkills.length >
                            0 ? (
                              <div className="flex flex-wrap gap-2">
                                {missingSkills.map(
                                  (
                                    skill,
                                    skillIndex
                                  ) => (
                                    <span
                                      key={`${skill}-${skillIndex}`}
                                      className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-emerald-300">
                                Great! No major
                                missing skills
                                detected.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="mt-7 grid gap-3 sm:grid-cols-3">

                          <button
                            type="button"
                            onClick={() =>
                              openSkillGap(
                                recommendation
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                          >
                            <FileSearch className="h-4 w-4" />

                            Skill Gap

                            <ArrowRight className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openLearningHub(
                                recommendation
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-purple-400/20 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20"
                          >
                            <BookOpen className="h-4 w-4" />

                            Learning Hub

                            <ArrowRight className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openRoadmap(
                                recommendation
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                          >
                            <Map className="h-4 w-4" />

                            Career Roadmap

                            <ArrowRight className="h-4 w-4" />
                          </button>

                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}

        {/* ===================================================
            EMPTY RESULT
        =================================================== */}

        {!loading &&
          recommendations.length ===
            0 &&
          !error && (
            <div className="rounded-2xl border border-slate-800 bg-[#0b1224] p-10 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10">
                <Sparkles className="h-8 w-8 text-purple-300" />
              </div>

              <h2 className="text-xl font-semibold">
                No recommendations yet
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
                Click Refresh to generate
                career recommendations from
                your current skills.
              </p>

              <button
                type="button"
                onClick={
                  refreshRecommendations
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:bg-cyan-400"
              >
                <RefreshCw className="h-4 w-4" />

                Generate Recommendations
              </button>
            </div>
          )}

        {/* ===================================================
            BOTTOM CTA
        =================================================== */}

        <section className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 p-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <h3 className="text-lg font-semibold">
                Want a more accurate match?
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Use the ML Predictor with a
                real job description to identify
                the most relevant career role.
              </p>
            </div>

            <button
              type="button"
              onClick={
                openMLPredictor
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-purple-400/20 bg-purple-500/10 px-5 py-3 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20"
            >
              <Brain className="h-4 w-4" />

              Open ML Predictor

              <ArrowRight className="h-4 w-4" />
            </button>

          </div>
        </section>

      </main>
    </div>
  );
}