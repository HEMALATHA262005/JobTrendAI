import { useEffect, useState } from "react";

import {
  User,
  Mail,
  BriefcaseBusiness,
  GraduationCap,
  Target,
  Save,
  ArrowLeft,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:5000";

const ROLES = [
  "Software Engineer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "AI Engineer",
  "Web Developer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "DevOps Engineer",
  "Product Manager",
];

function Profile() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [name, setName] = useState(
    storedUser.name || ""
  );

  const [email] = useState(
    storedUser.email || ""
  );

  const [targetRole, setTargetRole] = useState(
    storedUser.target_role || ""
  );

  const [experience, setExperience] = useState(
    storedUser.experience || ""
  );

  const [education, setEducation] = useState(
    storedUser.education || ""
  );

  const [skills, setSkills] = useState(
    Array.isArray(storedUser.skills)
      ? storedUser.skills.join(", ")
      : ""
  );

  const [loading, setLoading] = useState(false);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  /*
   * ========================================================
   * LOAD PROFILE FROM DATABASE
   * ========================================================
   */

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/profile`,
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
              "Could not load profile"
          );
        }

        const user = data.user;

        setName(user.name || "");

        setTargetRole(
          user.target_role || ""
        );

        setExperience(
          user.experience || ""
        );

        setEducation(
          user.education || ""
        );

        setSkills(
          Array.isArray(user.skills)
            ? user.skills.join(", ")
            : ""
        );

        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      } catch (error) {
        console.error(
          "PROFILE LOAD ERROR:",
          error
        );

        setError(error.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [navigate]);

  /*
   * ========================================================
   * SAVE PROFILE
   * ========================================================
   */

  const handleSave = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      /*
       * Convert comma-separated skills
       * into a clean array.
       *
       * Example:
       *
       * Python, JavaScript, React
       *
       * becomes:
       *
       * ["Python", "JavaScript", "React"]
       */

      const skillList = [
        ...new Set(
          skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(
              (skill) => skill.length > 0
            )
        ),
      ];

      /*
       * Validate target role
       */

      if (
        targetRole &&
        !ROLES.includes(targetRole)
      ) {
        throw new Error(
          "Please select a valid target role."
        );
      }

      /*
       * Save to backend
       */

      const response = await fetch(
        `${API_BASE_URL}/api/auth/profile`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name,
            target_role: targetRole,
            experience,
            education,
            skills: skillList,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Profile update failed"
        );
      }

      /*
       * Save latest profile locally
       */

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      /*
       * Show success message briefly
       */

      setMessage(
        "Profile saved successfully! 🎉"
      );

      /*
       * ====================================================
       * IMPORTANT:
       *
       * After saving the profile, go to
       * Career Recommendations.
       *
       * The recommendation page will load the
       * saved profile skills from the backend.
       * ====================================================
       */

      setTimeout(() => {
        navigate("/career-recommendations");
      }, 700);
    } catch (error) {
      console.error(
        "PROFILE SAVE ERROR:",
        error
      );

      setError(
        error.message ||
          "Profile update failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ========================================================
   * LOADING SCREEN
   * ========================================================
   */

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-4">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ========================================================
   * PAGE
   * ========================================================
   */

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-4">
          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <p className="text-sm text-slate-500">
              JobTrend AI
            </p>

            <h1 className="text-xl font-semibold">
              My Profile
            </h1>
          </div>
        </div>
      </header>

      {/* ====================================================
          CONTENT
      ==================================================== */}

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* INTRO */}

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
              <User
                size={24}
                className="text-indigo-400"
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Career Profile
              </h2>

              <p className="text-slate-500 mt-1">
                Tell JobTrend AI about your
                background and career goals.
              </p>
            </div>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <div className="flex items-center gap-3">
              <Sparkles size={18} />

              <span>{message}</span>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* ==================================================
            BASIC INFORMATION
        ================================================== */}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <User
              size={20}
              className="text-indigo-400"
            />

            <div>
              <h3 className="text-lg font-semibold">
                Basic Information
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Your personal information.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* NAME */}

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Your name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* EMAIL */}

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-500 cursor-not-allowed"
                />
              </div>

              <p className="text-xs text-slate-600 mt-2">
                Email cannot be changed here.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================
            CAREER INFORMATION
        ================================================== */}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <BriefcaseBusiness
              size={20}
              className="text-cyan-400"
            />

            <div>
              <h3 className="text-lg font-semibold">
                Career Information
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Tell us where you want to go.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* TARGET ROLE */}

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Target Career Role
              </label>

              <select
                value={targetRole}
                onChange={(e) =>
                  setTargetRole(e.target.value)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition"
              >
                <option value="">
                  Select a career role
                </option>

                {ROLES.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* EXPERIENCE */}

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Experience
              </label>

              <select
                value={experience}
                onChange={(e) =>
                  setExperience(e.target.value)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition"
              >
                <option value="">
                  Select experience
                </option>

                <option value="Fresher">
                  Fresher
                </option>

                <option value="0-1 years">
                  0–1 years
                </option>

                <option value="1-3 years">
                  1–3 years
                </option>

                <option value="3-5 years">
                  3–5 years
                </option>

                <option value="5+ years">
                  5+ years
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* ==================================================
            EDUCATION
        ================================================== */}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap
              size={20}
              className="text-purple-400"
            />

            <div>
              <h3 className="text-lg font-semibold">
                Education
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Your highest/current education level.
              </p>
            </div>
          </div>

          <select
            value={education}
            onChange={(e) =>
              setEducation(e.target.value)
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition"
          >
            <option value="">
              Select education
            </option>

            <option value="Diploma">
              Diploma
            </option>

            <option value="Bachelor's Degree">
              Bachelor's Degree
            </option>

            <option value="Master's Degree">
              Master's Degree
            </option>

            <option value="PhD">
              PhD
            </option>
          </select>
        </section>

        {/* ==================================================
            SKILLS
        ================================================== */}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-3">
            <Target
              size={20}
              className="text-emerald-400"
            />

            <div>
              <h3 className="text-lg font-semibold">
                Current Skills
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Separate your skills with commas.
              </p>
            </div>
          </div>

          <textarea
            value={skills}
            onChange={(e) =>
              setSkills(e.target.value)
            }
            placeholder="Python, JavaScript, React, SQL, Machine Learning..."
            rows={4}
            className="w-full mt-6 bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:border-indigo-500 transition resize-none"
          />

          <p className="text-xs text-slate-600 mt-3">
            Example: Python, SQL, React,
            Machine Learning, Git
          </p>
        </section>

        {/* ==================================================
            SAVE + ANALYZE
        ================================================== */}

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 px-6 py-3 rounded-xl font-semibold transition"
          >
            <ArrowLeft size={18} />

            Dashboard
          </button>

          {/* SAVE PROFILE */}

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-indigo-600/20"
          >
            <Save size={18} />

            {loading
              ? "Saving..."
              : "Save Profile"}

            {!loading && (
              <ArrowRight size={17} />
            )}
          </button>
        </div>

        {/* INFO */}

        <div className="mt-6 rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-5">
          <div className="flex items-start gap-3">
            <Sparkles
              size={19}
              className="text-indigo-400 mt-0.5 shrink-0"
            />

            <div>
              <h4 className="font-semibold text-sm">
                What happens after you save?
              </h4>

              <p className="text-sm text-slate-500 mt-1 leading-6">
                JobTrend AI will take you to Career
                Recommendations, where you can analyze
                your saved skills and discover the careers
                that best match your profile.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;