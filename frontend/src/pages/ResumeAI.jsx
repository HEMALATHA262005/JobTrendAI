import { useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Brain,
  BarChart3,
  RefreshCw,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:5000";


// ============================================================
// SCORE CIRCLE
// ============================================================

function ScoreCircle({ score }) {
  const safeScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">

      <div className="absolute inset-0 rounded-full border-[10px] border-white/10" />

      <div
        className="absolute inset-0 rounded-full border-[10px] border-cyan-400"
        style={{
          clipPath: `inset(${100 - safeScore}% 0 0 0)`,
        }}
      />

      <div className="text-center">
        <p className="text-4xl font-black text-white">
          {safeScore}
        </p>

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          ATS Score
        </p>
      </div>

    </div>
  );
}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
          {icon}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-black text-white">
            {value}
          </p>
        </div>

      </div>

    </div>
  );
}


// ============================================================
// RESULT LIST
// ============================================================

function ResultList({
  items,
  icon,
  iconClass,
}) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-slate-500">
        Nothing significant detected.
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {items.map((item, index) => (

        <div
          key={`${item}-${index}`}
          className="flex gap-3 rounded-xl border border-white/10 bg-black/10 p-4"
        >

          <div className={`mt-0.5 shrink-0 ${iconClass}`}>
            {icon}
          </div>

          <p className="text-sm leading-6 text-slate-300">
            {item}
          </p>

        </div>

      ))}

    </div>
  );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ResumeAI() {

  const [file, setFile] = useState(null);

  const [dragActive, setDragActive] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);


  // ============================================================
  // FILE VALIDATION
  // ============================================================

  function validateFile(selectedFile) {

    if (!selectedFile) {
      return false;
    }

    if (
      !selectedFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {

      setError(
        "Please upload a PDF resume."
      );

      return false;
    }

    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {

      setError(
        "Resume file must be smaller than 10 MB."
      );

      return false;
    }

    setError("");

    return true;
  }


  // ============================================================
  // FILE SELECT
  // ============================================================

  function handleFileChange(event) {

    const selectedFile =
      event.target.files?.[0];

    if (
      selectedFile &&
      validateFile(selectedFile)
    ) {

      setFile(selectedFile);

      setResult(null);
    }
  }


  // ============================================================
  // DRAG OVER
  // ============================================================

  function handleDragOver(event) {

    event.preventDefault();

    setDragActive(true);
  }


  // ============================================================
  // DRAG LEAVE
  // ============================================================

  function handleDragLeave(event) {

    event.preventDefault();

    setDragActive(false);
  }


  // ============================================================
  // DROP
  // ============================================================

  function handleDrop(event) {

    event.preventDefault();

    setDragActive(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    if (
      droppedFile &&
      validateFile(droppedFile)
    ) {

      setFile(droppedFile);

      setResult(null);
    }
  }


  // ============================================================
  // ANALYZE RESUME
  // ============================================================

  async function analyzeResume() {

    if (!file) {

      setError(
        "Please upload your resume PDF first."
      );

      return;
    }

    setLoading(true);

    setError("");

    setResult(null);

    try {

      // --------------------------------------------------------
      // Create form data
      // --------------------------------------------------------

      const formData =
        new FormData();

      formData.append(
        "resume",
        file
      );


      // --------------------------------------------------------
      // Send to Flask backend
      // --------------------------------------------------------

      const response =
        await fetch(
          `${API_BASE_URL}/api/resume-ai/analyze`,
          {
            method: "POST",
            body: formData,
          }
        );


      // --------------------------------------------------------
      // Parse backend response
      // --------------------------------------------------------

      const data =
        await response.json();


      // --------------------------------------------------------
      // Check HTTP response
      // --------------------------------------------------------

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Resume analysis failed."
        );
      }


      // --------------------------------------------------------
      // Check application response
      // --------------------------------------------------------

      if (
        data.status !== "success"
      ) {

        throw new Error(
          data.message ||
          "Resume analysis failed."
        );
      }


      // --------------------------------------------------------
      // Get actual analysis result
      // --------------------------------------------------------

      const analysisResult =
        data.data;


      // --------------------------------------------------------
      // IMPORTANT:
      //
      // Save Resume AI analysis to localStorage.
      //
      // AI Assistant reads this later.
      // --------------------------------------------------------

      localStorage.setItem(
        "latestResumeAnalysis",
        JSON.stringify(
          analysisResult
        )
      );


      // --------------------------------------------------------
      // Also save timestamp
      // --------------------------------------------------------

      localStorage.setItem(
        "latestResumeAnalysisTime",
        new Date().toISOString()
      );


      // --------------------------------------------------------
      // Show result on page
      // --------------------------------------------------------

      setResult(
        analysisResult
      );


      console.log(
        "Resume AI analysis saved:",
        analysisResult
      );


    } catch (analysisError) {

      console.error(
        "Resume AI error:",
        analysisError
      );

      setError(
        analysisError.message ||
        "Could not analyze your resume."
      );

    } finally {

      setLoading(false);
    }
  }


  // ============================================================
  // RESET
  // ============================================================

  function resetAnalysis() {

    setFile(null);

    setResult(null);

    setError("");

    // Remove old Resume AI context
    localStorage.removeItem(
      "latestResumeAnalysis"
    );

    localStorage.removeItem(
      "latestResumeAnalysisTime"
    );
  }


  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#070b14] px-4 py-8 text-white sm:px-6">

      <div className="mx-auto max-w-7xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">

            <Sparkles size={17} />

            AI Career Intelligence

          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Resume AI
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Upload your resume and get an instant ATS-style
            analysis with strengths, weaknesses and actionable
            improvement suggestions.
          </p>

        </div>


        {/* ====================================================
            UPLOAD AREA
        ==================================================== */}

        {!result && (

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
                dragActive
                  ? "border-cyan-400 bg-cyan-400/5"
                  : "border-white/10 bg-black/10"
              }`}
            >

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10">

                <Upload
                  size={30}
                  className="text-cyan-300"
                />

              </div>


              <h2 className="mt-5 text-xl font-bold">
                Upload your resume
              </h2>


              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Drop your PDF here or choose a file from
                your computer. Maximum file size: 10 MB.
              </p>


              <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-200">

                <FileText size={17} />

                Choose PDF Resume

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

              </label>


              {file && (

                <div className="mx-auto mt-6 flex max-w-xl items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-400/10">

                      <FileText
                        size={20}
                        className="text-red-300"
                      />

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-white">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={resetAnalysis}
                    className="ml-4 shrink-0 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Remove
                  </button>

                </div>

              )}

            </div>


            {/* =================================================
                ANALYZE BUTTON
            ================================================= */}

            <div className="mt-6 flex justify-center">

              <button
                onClick={analyzeResume}
                disabled={
                  !file || loading
                }
                className="flex min-w-[220px] items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >

                {loading ? (
                  <>
                    <RefreshCw
                      size={18}
                      className="animate-spin"
                    />

                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Brain size={18} />

                    Analyze Resume
                  </>
                )}

              </button>

            </div>

          </div>

        )}


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-4">

            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>

              <p className="font-semibold text-red-300">
                Analysis Error
              </p>

              <p className="mt-1 text-sm text-red-200/70">
                {error}
              </p>

            </div>

          </div>

        )}


        {/* ====================================================
            RESULTS
        ==================================================== */}

        {result && (

          <div>

            {/* =================================================
                TOP RESULT BAR
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">

                  <CheckCircle2
                    size={22}
                    className="text-cyan-300"
                  />

                </div>

                <div>

                  <p className="font-bold text-white">
                    Resume analysis complete
                  </p>

                  <p className="text-sm text-slate-500">
                    {file?.name}
                  </p>

                </div>

              </div>


              <button
                onClick={resetAnalysis}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              >

                <RefreshCw size={16} />

                Analyze Another Resume

              </button>

            </div>


            {/* =================================================
                SCORE + STATS
            ================================================= */}

            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">

              <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-8">

                <ScoreCircle
                  score={result.ats_score}
                />

                <p className="mt-5 text-center text-sm leading-6 text-slate-400">
                  Your resume's ATS-style score based on
                  structure, skills, action language,
                  readability and content coverage.
                </p>

              </div>


              <div className="grid gap-4 sm:grid-cols-2">

                <StatCard
                  icon={
                    <FileText
                      size={19}
                      className="text-cyan-300"
                    />
                  }
                  label="Words"
                  value={result.word_count}
                />

                <StatCard
                  icon={
                    <Brain
                      size={19}
                      className="text-purple-300"
                    />
                  }
                  label="Skills Detected"
                  value={result.skills_count}
                />

                <StatCard
                  icon={
                    <BarChart3
                      size={19}
                      className="text-green-300"
                    />
                  }
                  label="Bullet Points"
                  value={result.bullet_points}
                />

                <StatCard
                  icon={
                    <Sparkles
                      size={19}
                      className="text-yellow-300"
                    />
                  }
                  label="Action Verbs"
                  value={
                    result.action_verbs?.length || 0
                  }
                />

              </div>

            </div>


            {/* =================================================
                SKILLS
            ================================================= */}

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">

              <div className="flex items-center gap-3">

                <Brain
                  size={21}
                  className="text-cyan-300"
                />

                <h2 className="text-xl font-bold">
                  Detected Skills
                </h2>

              </div>


              <div className="mt-5 flex flex-wrap gap-2">

                {result.skills?.length > 0 ? (

                  result.skills.map(
                    (skill) => (

                      <span
                        key={skill}
                        className="rounded-full border border-cyan-300/10 bg-cyan-300/5 px-3 py-1.5 text-sm font-semibold text-cyan-200"
                      >
                        {skill}
                      </span>

                    )
                  )

                ) : (

                  <p className="text-sm text-slate-500">
                    No recognized skills were detected.
                  </p>

                )}

              </div>

            </div>


            {/* =================================================
                STRENGTHS + WEAKNESSES
            ================================================= */}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">

                <div className="flex items-center gap-3">

                  <CheckCircle2
                    size={21}
                    className="text-green-400"
                  />

                  <h2 className="text-xl font-bold">
                    Strengths
                  </h2>

                </div>

                <div className="mt-5">

                  <ResultList
                    items={result.strengths}
                    icon={
                      <CheckCircle2
                        size={18}
                      />
                    }
                    iconClass="text-green-400"
                  />

                </div>

              </div>


              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">

                <div className="flex items-center gap-3">

                  <AlertTriangle
                    size={21}
                    className="text-orange-400"
                  />

                  <h2 className="text-xl font-bold">
                    Areas to Improve
                  </h2>

                </div>

                <div className="mt-5">

                  <ResultList
                    items={result.weaknesses}
                    icon={
                      <AlertTriangle
                        size={18}
                      />
                    }
                    iconClass="text-orange-400"
                  />

                </div>

              </div>

            </div>


            {/* =================================================
                SUGGESTIONS
            ================================================= */}

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">

              <div className="flex items-center gap-3">

                <Lightbulb
                  size={21}
                  className="text-yellow-300"
                />

                <h2 className="text-xl font-bold">
                  AI Improvement Suggestions
                </h2>

              </div>

              <p className="mt-2 text-sm text-slate-500">
                Practical changes you can make before
                submitting your resume.
              </p>

              <div className="mt-5">

                <ResultList
                  items={result.suggestions}
                  icon={
                    <Lightbulb
                      size={18}
                    />
                  }
                  iconClass="text-yellow-300"
                />

              </div>

            </div>


            {/* =================================================
                RESUME STRUCTURE
            ================================================= */}

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">

              <h2 className="text-xl font-bold">
                Resume Structure
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {Object.entries(
                  result.sections || {}
                ).map(
                  ([section, present]) => (

                    <div
                      key={section}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3"
                    >

                      <span className="text-sm font-semibold capitalize text-slate-300">
                        {section}
                      </span>

                      {present ? (

                        <CheckCircle2
                          size={18}
                          className="text-green-400"
                        />

                      ) : (

                        <AlertTriangle
                          size={18}
                          className="text-orange-400"
                        />

                      )}

                    </div>

                  )
                )}

              </div>

            </div>


            {/* =================================================
                CONTACT DETECTION
            ================================================= */}

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">

              <h2 className="text-xl font-bold">
                Contact Information
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                <div className="rounded-xl border border-white/10 bg-black/10 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email
                  </p>

                  <p className="mt-2 text-sm font-semibold text-white">
                    {result.contact?.email_detected
                      ? "Detected"
                      : "Not detected"}
                  </p>

                </div>


                <div className="rounded-xl border border-white/10 bg-black/10 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Phone
                  </p>

                  <p className="mt-2 text-sm font-semibold text-white">
                    {result.contact?.phone_detected
                      ? "Detected"
                      : "Not detected"}
                  </p>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}