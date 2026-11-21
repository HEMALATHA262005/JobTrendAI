import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  Upload,
  FileText,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Brain,
  BookOpen,
  Map,
  Sparkles,
  BriefcaseBusiness,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:5000";

export default function SkillGap() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  /* ==========================================================
     ROLE
  ========================================================== */

  const roleFromUrl = searchParams.get("role") || "";

  const predictedRole =
    localStorage.getItem("mlPredictedRole") || "";

  const selectedRole =
    roleFromUrl ||
    predictedRole ||
    "";

  /* ==========================================================
     STATE
  ========================================================== */

  const [resumeFile, setResumeFile] = useState(null);

  const [jobDescription, setJobDescription] = useState(
    localStorage.getItem("latestMLJobDescription") || ""
  );

  const [dragActive, setDragActive] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [result, setResult] = useState(() => {
    try {
      const saved =
        localStorage.getItem("latestSkillGap");

      return saved
        ? JSON.parse(saved)
        : null;
    } catch {
      return null;
    }
  });

  /* ==========================================================
     HANDLE FILE
  ========================================================== */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    setError("");

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError(
        "Please upload your resume as a PDF file."
      );

      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Resume file must be smaller than 10 MB."
      );

      return;
    }

    setResumeFile(file);
  };

  /* ==========================================================
     DRAG & DROP
  ========================================================== */

  const handleDragOver = (event) => {
    event.preventDefault();

    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();

    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragActive(false);

    const file =
      event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    validateAndSetFile(file);
  };

  /* ==========================================================
     SUBMIT SKILL GAP
  ========================================================== */

  const analyzeSkillGap = async (event) => {
    event.preventDefault();

    setError("");

    if (!resumeFile) {
      setError(
        "Please upload your resume PDF first."
      );

      return;
    }

    if (!jobDescription.trim()) {
      setError(
        "Please enter the job description."
      );

      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      /*
        Send the predicted/selected role
        to the backend.
      */

      formData.append(
        "role",
        selectedRole
      );

      formData.append(
        "resume",
        resumeFile
      );

      formData.append(
        "job_description",
        jobDescription
      );

      const response = await fetch(
        `${API_BASE}/api/skill-gap/`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        data.status !== "success"
      ) {
        throw new Error(
          data.message ||
            "Unable to analyze skill gap."
        );
      }

      const analysis =
        data.data || data;

      setResult(analysis);

      /* ======================================================
         SAVE RESULT
      ====================================================== */

      localStorage.setItem(
        "latestSkillGap",
        JSON.stringify(analysis)
      );

      localStorage.setItem(
        "latestSkillGapTime",
        new Date().toISOString()
      );

      localStorage.setItem(
        "skillGapRole",
        selectedRole
      );

    } catch (err) {
      console.error(
        "Skill gap error:",
        err
      );

      setError(
        err.message ||
          "Unable to analyze skill gap."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     CLEAR RESULT
  ========================================================== */

  const startNewAnalysis = () => {
    setResult(null);
    setError("");
    setResumeFile(null);
  };

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const openLearning = () => {
    const missing =
      result?.missing_skills ||
      result?.missing ||
      [];

    if (
      Array.isArray(missing) &&
      missing.length > 0
    ) {
      navigate(
        `/learning-hub?role=${encodeURIComponent(
          selectedRole
        )}&skills=${encodeURIComponent(
          missing.join(",")
        )}`
      );
    } else {
      navigate(
        `/learning-hub?role=${encodeURIComponent(
          selectedRole
        )}`
      );
    }
  };

  const openRoadmap = () => {
    navigate(
      `/career-roadmap?role=${encodeURIComponent(
        selectedRole
      )}`
    );
  };

  const openCareerRecommendations = () => {
    navigate(
      `/career-recommendations?role=${encodeURIComponent(
        selectedRole
      )}`
    );
  };

  /* ==========================================================
     HELPER
  ========================================================== */

  const getNumber = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        const number = Number(value);

        if (!Number.isNaN(number)) {
          return number;
        }
      }
    }

    return 0;
  };

  const matchScore = getNumber(
    result?.skill_match,
    result?.skill_match_percentage,
    result?.match_score,
    result?.score,
    result?.match
  );

  const matchedSkills =
    result?.matched_skills ||
    result?.matched ||
    [];

  const missingSkills =
    result?.missing_skills ||
    result?.missing ||
    [];

  const priority =
    result?.priority ||
    result?.priority_level ||
    "";

  /* ==========================================================
     MAIN UI
  ========================================================== */

  return (
    <div
      className="
        min-h-screen
        bg-[#050816]
        text-white
        px-6
        py-8
      "
    >
      <div
        className="
          max-w-6xl
          mx-auto
        "
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-8">

          <div
            className="
              flex
              items-center
              gap-3
              mb-3
            "
          >

            <div
              className="
                p-3
                rounded-xl
                bg-cyan-500/10
                border
                border-cyan-400/20
              "
            >
              <Target
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
                Skill Gap Analyzer
              </h1>

            </div>

          </div>

          <p
            className="
              text-slate-400
              max-w-3xl
            "
          >
            Compare your current skills with the
            requirements of your target career and
            discover exactly what you need to learn.
          </p>

        </div>

        {/* ====================================================
            AI ROLE BANNER
        ==================================================== */}

        {selectedRole && (
          <div
            className="
              mb-8
              rounded-2xl
              border
              border-purple-400/20
              bg-gradient-to-r
              from-purple-500/10
              to-cyan-500/10
              p-6
            "
          >

            <div
              className="
                flex
                flex-col
                md:flex-row
                md:items-center
                md:justify-between
                gap-5
              "
            >

              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-purple-300
                    text-sm
                    mb-2
                  "
                >
                  <Brain size={17} />

                  AI Career Role
                </div>

                <h2
                  className="
                    text-2xl
                    font-bold
                  "
                >
                  Target Role:

                  <span
                    className="
                      text-cyan-400
                      ml-2
                    "
                  >
                    {selectedRole}
                  </span>
                </h2>

                <p
                  className="
                    text-sm
                    text-slate-400
                    mt-2
                  "
                >
                  This role was selected from your
                  JobTrend AI career analysis.
                </p>

              </div>

              <button
                onClick={
                  openCareerRecommendations
                }
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  rounded-xl
                  bg-purple-500/10
                  border
                  border-purple-400/20
                  text-purple-300
                  hover:bg-purple-500/20
                  transition
                "
              >
                <BriefcaseBusiness size={17} />

                Career Matches

                <ArrowRight
                  size={17}
                />
              </button>

            </div>

          </div>
        )}

        {/* ====================================================
            INPUT SECTION
        ==================================================== */}

        {!result && (
          <form
            onSubmit={analyzeSkillGap}
            className="space-y-6"
          >

            {/* =================================================
                RESUME UPLOAD
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

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mb-4
                "
              >

                <FileText
                  size={20}
                  className="text-cyan-400"
                />

                <h2
                  className="
                    text-xl
                    font-semibold
                  "
                >
                  Upload Your Resume
                </h2>

              </div>

              <div
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={
                  handleDrop
                }
                className={`
                  relative
                  rounded-2xl
                  border-2
                  border-dashed
                  p-10
                  text-center
                  transition
                  ${
                    dragActive
                      ? "border-cyan-400 bg-cyan-500/10"
                      : "border-slate-700 hover:border-slate-500"
                  }
                `}
              >

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={
                    handleFileChange
                  }
                  className="
                    absolute
                    inset-0
                    w-full
                    h-full
                    opacity-0
                    cursor-pointer
                  "
                />

                <Upload
                  size={40}
                  className="
                    mx-auto
                    mb-4
                    text-cyan-400
                  "
                />

                {resumeFile ? (
                  <>
                    <p
                      className="
                        font-semibold
                        text-cyan-300
                      "
                    >
                      {resumeFile.name}
                    </p>

                    <p
                      className="
                        text-sm
                        text-slate-500
                        mt-2
                      "
                    >
                      Click or drag another PDF
                      to replace it.
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className="
                        text-lg
                        font-semibold
                      "
                    >
                      Drop your resume here
                    </p>

                    <p
                      className="
                        text-sm
                        text-slate-500
                        mt-2
                      "
                    >
                      or click to browse
                    </p>

                    <p
                      className="
                        text-xs
                        text-slate-600
                        mt-3
                      "
                    >
                      PDF only • Maximum 10 MB
                    </p>
                  </>
                )}

              </div>

            </div>

            {/* =================================================
                JOB DESCRIPTION
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

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mb-4
                "
              >

                <FileText
                  size={20}
                  className="text-purple-400"
                />

                <h2
                  className="
                    text-xl
                    font-semibold
                  "
                >
                  Job Description
                </h2>

              </div>

              <textarea
                value={
                  jobDescription
                }
                onChange={(event) =>
                  setJobDescription(
                    event.target.value
                  )
                }
                placeholder="
Paste the job description here...

Example:
We are looking for a Data Scientist with
Python, SQL, Pandas, NumPy, Machine Learning,
Statistics and Data Visualization experience.
                "
                rows={12}
                className="
                  w-full
                  bg-[#060b18]
                  border
                  border-slate-800
                  rounded-xl
                  px-4
                  py-4
                  text-slate-200
                  placeholder:text-slate-600
                  outline-none
                  focus:border-cyan-400/40
                  resize-y
                "
              />

              {localStorage.getItem(
                "latestMLJobDescription"
              ) && (
                <p
                  className="
                    text-xs
                    text-cyan-400
                    mt-3
                  "
                >
                  ✨ Job description loaded from
                  your ML Role Prediction.
                </p>
              )}

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="
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
                  className="shrink-0 mt-0.5"
                />

                <div>

                  <p className="font-medium">
                    Analysis Error
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

            {/* =================================================
                ANALYZE BUTTON
            ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                flex
                items-center
                justify-center
                gap-2
                px-6
                py-4
                rounded-xl
                bg-cyan-500
                hover:bg-cyan-400
                disabled:opacity-50
                disabled:cursor-not-allowed
                text-black
                font-bold
                text-lg
                transition
              "
            >

              {loading ? (
                <>
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />

                  Analyzing Your Skills...
                </>
              ) : (
                <>
                  <Sparkles
                    size={22}
                  />

                  Analyze Skill Gap

                  <ArrowRight
                    size={20}
                  />
                </>
              )}

            </button>

          </form>
        )}

        {/* ====================================================
            RESULTS
        ==================================================== */}

        {result && (
          <div className="space-y-6">

            {/* =================================================
                RESULT HEADER
            ================================================= */}

            <div
              className="
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
                  flex-col
                  md:flex-row
                  md:items-center
                  md:justify-between
                  gap-5
                "
              >

                <div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-cyan-300
                      text-sm
                      mb-2
                    "
                  >

                    <Sparkles
                      size={17}
                    />

                    Skill Gap Analysis Complete

                  </div>

                  <h2
                    className="
                      text-3xl
                      font-bold
                    "
                  >
                    {selectedRole ||
                      result.role ||
                      "Career Analysis"}
                  </h2>

                  <p
                    className="
                      text-slate-400
                      mt-2
                    "
                  >
                    Here is how your current profile
                    compares with the target role.
                  </p>

                </div>

                <button
                  onClick={
                    startNewAnalysis
                  }
                  className="
                    px-5
                    py-3
                    rounded-xl
                    bg-slate-800
                    hover:bg-slate-700
                    text-slate-200
                    transition
                  "
                >
                  New Analysis
                </button>

              </div>

            </div>

            {/* =================================================
                SCORE CARDS
            ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-4
              "
            >

              <div
                className="
                  bg-[#0b1224]
                  border
                  border-cyan-400/20
                  rounded-2xl
                  p-6
                "
              >

                <p
                  className="
                    text-sm
                    text-slate-500
                    mb-2
                  "
                >
                  Skill Match
                </p>

                <p
                  className="
                    text-4xl
                    font-bold
                    text-cyan-400
                  "
                >
                  {Math.round(
                    matchScore
                  )}%
                </p>

                <div
                  className="
                    mt-4
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
                        Math.max(
                          matchScore,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

              <div
                className="
                  bg-[#0b1224]
                  border
                  border-emerald-400/20
                  rounded-2xl
                  p-6
                "
              >

                <p
                  className="
                    text-sm
                    text-slate-500
                    mb-2
                  "
                >
                  Matched Skills
                </p>

                <p
                  className="
                    text-4xl
                    font-bold
                    text-emerald-400
                  "
                >
                  {matchedSkills.length}
                </p>

                <p
                  className="
                    text-sm
                    text-slate-500
                    mt-2
                  "
                >
                  skills already detected
                </p>

              </div>

              <div
                className="
                  bg-[#0b1224]
                  border
                  border-orange-400/20
                  rounded-2xl
                  p-6
                "
              >

                <p
                  className="
                    text-sm
                    text-slate-500
                    mb-2
                  "
                >
                  Skills To Develop
                </p>

                <p
                  className="
                    text-4xl
                    font-bold
                    text-orange-400
                  "
                >
                  {missingSkills.length}
                </p>

                <p
                  className="
                    text-sm
                    text-slate-500
                    mt-2
                  "
                >
                  skills recommended
                </p>

              </div>

            </div>

            {/* =================================================
                PRIORITY
            ================================================= */}

            {priority && (
              <div
                className="
                  p-4
                  rounded-xl
                  bg-purple-500/10
                  border
                  border-purple-400/20
                  text-purple-300
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <Target
                    size={18}
                  />

                  <span
                    className="
                      font-semibold
                    "
                  >
                    Priority:
                  </span>

                  <span>
                    {priority}
                  </span>

                </div>

              </div>
            )}

            {/* =================================================
                MATCHED SKILLS
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

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mb-5
                "
              >

                <CheckCircle2
                  size={21}
                  className="text-emerald-400"
                />

                <h2
                  className="
                    text-xl
                    font-semibold
                  "
                >
                  Skills You Already Have
                </h2>

              </div>

              {matchedSkills.length > 0 ? (
                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  {matchedSkills.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="
                          px-3
                          py-2
                          rounded-lg
                          bg-emerald-500/10
                          border
                          border-emerald-400/20
                          text-emerald-300
                          text-sm
                        "
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <p
                  className="
                    text-slate-500
                  "
                >
                  No matching skills detected yet.
                </p>
              )}

            </div>

            {/* =================================================
                MISSING SKILLS
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

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mb-5
                "
              >

                <XCircle
                  size={21}
                  className="text-orange-400"
                />

                <h2
                  className="
                    text-xl
                    font-semibold
                  "
                >
                  Skills You Need To Develop
                </h2>

              </div>

              {missingSkills.length > 0 ? (
                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  {missingSkills.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="
                          px-3
                          py-2
                          rounded-lg
                          bg-orange-500/10
                          border
                          border-orange-400/20
                          text-orange-300
                          text-sm
                        "
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-emerald-400
                  "
                >

                  <CheckCircle2
                    size={20}
                  />

                  <span>
                    Great! No major missing skills
                    were detected.
                  </span>

                </div>
              )}

            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-4
              "
            >

              <button
                onClick={
                  openLearning
                }
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-4
                  rounded-xl
                  bg-purple-500/10
                  border
                  border-purple-400/20
                  text-purple-300
                  hover:bg-purple-500/20
                  transition
                "
              >

                <BookOpen
                  size={20}
                />

                Learn Missing Skills

                <ArrowRight
                  size={17}
                />

              </button>

              <button
                onClick={
                  openRoadmap
                }
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-4
                  rounded-xl
                  bg-cyan-500/10
                  border
                  border-cyan-400/20
                  text-cyan-300
                  hover:bg-cyan-500/20
                  transition
                "
              >

                <Map
                  size={20}
                />

                View Career Roadmap

                <ArrowRight
                  size={17}
                />

              </button>

              <button
                onClick={
                  openCareerRecommendations
                }
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-4
                  rounded-xl
                  bg-slate-800
                  hover:bg-slate-700
                  text-slate-200
                  transition
                "
              >

                <BriefcaseBusiness
                  size={17}
                />

                Career Recommendations

                <ArrowRight
                  size={17}
                />

              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}