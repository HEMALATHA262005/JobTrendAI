import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

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

const STAGES = [
  {
    key: "foundation",
    title: "Foundation",
    description:
      "Build the fundamentals needed for your target role.",
  },
  {
    key: "core_skills",
    title: "Core Skills",
    description:
      "Develop the essential technical and professional skills.",
  },
  {
    key: "advanced_skills",
    title: "Advanced Skills",
    description:
      "Move into advanced concepts and industry-level knowledge.",
  },
  {
    key: "projects",
    title: "Projects",
    description:
      "Build practical projects to demonstrate your abilities.",
  },
  {
    key: "certifications",
    title: "Certifications",
    description:
      "Strengthen your profile with relevant certifications.",
  },
  {
    key: "interview",
    title: "Interview Preparation",
    description:
      "Prepare for technical and behavioral interviews.",
  },
];

function StageCard({
  stage,
  items,
  completedItems,
  onToggle,
}) {
  const [open, setOpen] = useState(true);

  const completedCount = items.filter((item) =>
    completedItems.includes(item)
  ).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.03] transition"
      >
        <div className="text-left">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">
              {stage.title}
            </h3>

            <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-gray-300">
              {completedCount}/{items.length}
            </span>
          </div>

          <p className="text-sm text-gray-400 mt-1">
            {stage.description}
          </p>
        </div>

        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3">
          {items.map((item, index) => {
            const completed = completedItems.includes(item);

            return (
              <button
                key={`${stage.key}-${index}`}
                type="button"
                onClick={() => onToggle(item)}
                className={`w-full flex items-center gap-3 rounded-xl p-4 text-left transition border ${
                  completed
                    ? "border-green-400/20 bg-green-400/10"
                    : "border-white/5 bg-black/10 hover:bg-white/[0.05]"
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-500 shrink-0" />
                )}

                <span
                  className={`text-sm ${
                    completed
                      ? "text-green-300 line-through"
                      : "text-gray-200"
                  }`}
                >
                  {item}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ progress }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400">
          Overall Progress
        </span>

        <span className="text-white font-semibold">
          {progress}%
        </span>
      </div>

      <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-green-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function CareerRoadmap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleFromUrl = searchParams.get("role");

  const [selectedRole, setSelectedRole] = useState(() => {
    if (roleFromUrl && ROLES.includes(roleFromUrl)) {
      return roleFromUrl;
    }

    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        if (
          user?.target_role &&
          ROLES.includes(user.target_role)
        ) {
          return user.target_role;
        }
      }
    } catch (err) {
      console.error("INITIAL USER PROFILE READ ERROR:", err);
    }

    return "AI Engineer";
  });

  const [roadmap, setRoadmap] = useState(null);

  const [completedItems, setCompletedItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadingProgress, setLoadingProgress] =
    useState(true);

  const [savingProgress, setSavingProgress] =
    useState(false);

  const [error, setError] = useState("");

  const [saveMessage, setSaveMessage] = useState("");

  /*
   * Each role load gets a unique request id.
   * If an older request finishes after a newer role was selected,
   * its response is ignored instead of overwriting the current UI.
   */
  const roadmapRequestId = useRef(0);

  /*
   * ---------------------------------------------------------
   * Get token
   * ---------------------------------------------------------
   */
  const getToken = () => {
    return localStorage.getItem("token");
  };

  /*
   * ---------------------------------------------------------
   * Load roadmap + saved progress
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   * The roadmap and progress requests can finish in any order.
   * We protect both with the same request id so an old role
   * can never clear or overwrite the progress of the new role.
   */
  const loadRoleData = async (role, requestId) => {
    setLoading(true);
    setLoadingProgress(true);
    setError("");
    setSaveMessage("");

    try {
      const token = getToken();

      const roadmapPromise = fetch(
        `${API_BASE_URL}/api/career-roadmap/?role=${encodeURIComponent(role)}`
      );

      const progressPromise = token
        ? fetch(
            `${API_BASE_URL}/api/roadmap-progress/?role=${encodeURIComponent(
              role
            )}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
        : Promise.resolve(null);

      const [roadmapResponse, progressResponse] = await Promise.all([
        roadmapPromise,
        progressPromise,
      ]);

      const roadmapData = await roadmapResponse.json();

      if (!roadmapResponse.ok) {
        throw new Error(
          roadmapData.message || "Failed to load career roadmap."
        );
      }

      let savedItems = [];

      if (progressResponse) {
        const progressData = await progressResponse.json();

        console.log("ROADMAP PROGRESS RESPONSE:", progressData);

        if (!progressResponse.ok) {
          throw new Error(
            progressData.message ||
              "Failed to load roadmap progress."
          );
        }

        savedItems =
          progressData?.data?.completed_items ||
          progressData?.completed_items ||
          progressData?.data?.data?.completed_items ||
          [];

        if (!Array.isArray(savedItems)) {
          savedItems = [];
        }

        // Keep a browser backup for this exact role.
        localStorage.setItem(
          `roadmapProgress_${role}`,
          JSON.stringify(savedItems)
        );
      } else {
        const localSaved = localStorage.getItem(
          `roadmapProgress_${role}`
        );

        if (localSaved) {
          try {
            const parsedItems = JSON.parse(localSaved);

            if (Array.isArray(parsedItems)) {
              savedItems = parsedItems;
            }
          } catch (localError) {
            console.error(
              "LOCAL PROGRESS PARSE ERROR:",
              localError
            );
          }
        }
      }

      /*
       * Ignore this response if another role load started while
       * these requests were running.
       */
      if (requestId !== roadmapRequestId.current) {
        console.log(
          `Ignoring stale roadmap response for ${role}.`
        );
        return;
      }

      console.log(
        `Applying roadmap + progress for ${role}:`,
        savedItems
      );

      setRoadmap(
        roadmapData.data ||
          roadmapData.roadmap ||
          null
      );

      setCompletedItems(savedItems);
    } catch (err) {
      console.error("ROADMAP DATA LOAD ERROR:", err);

      /*
       * Never let an old request modify the current role.
       */
      if (requestId !== roadmapRequestId.current) {
        return;
      }

      /*
       * If MongoDB/API temporarily fails, restore the browser
       * backup for the CURRENT role only.
       */
      try {
        const localSaved = localStorage.getItem(
          `roadmapProgress_${role}`
        );

        if (localSaved) {
          const parsedItems = JSON.parse(localSaved);

          if (Array.isArray(parsedItems)) {
            setCompletedItems(parsedItems);
            setSaveMessage("Saved progress restored.");
          } else {
            setCompletedItems([]);
          }
        } else {
          setCompletedItems([]);
        }
      } catch (localError) {
        console.error(
          "LOCAL PROGRESS RESTORE ERROR:",
          localError
        );
        setCompletedItems([]);
      }

      setError(
        err.message || "Unable to load career roadmap."
      );
      setRoadmap(null);
    } finally {
      if (requestId === roadmapRequestId.current) {
        setLoading(false);
        setLoadingProgress(false);
      }
    }
  };

  /*
   * ---------------------------------------------------------
   * Save progress
   *
   * Saves to:
   * 1. localStorage immediately
   * 2. MongoDB
   * ---------------------------------------------------------
   */
  const saveProgress = async (items) => {
    try {
      setSavingProgress(true);
      setSaveMessage("");

      const token = getToken();

      /*
       * Save local backup first.
       */
      localStorage.setItem(
        `roadmapProgress_${selectedRole}`,
        JSON.stringify(items)
      );

      if (!token) {
        setSaveMessage(
          "Progress saved locally. Please log in again to sync with the server."
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/roadmap-progress/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: selectedRole,
            completed_items: items,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "ROADMAP PROGRESS SAVE RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save progress."
        );
      }

      console.log(
        `Roadmap progress saved for ${selectedRole}:`,
        items
      );

      setSaveMessage(
        "Progress saved ✓"
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 2000);
    } catch (err) {
      console.error(
        "PROGRESS SAVE ERROR:",
        err
      );

      /*
       * Local backup has already been saved.
       */
      setSaveMessage(
        "Progress saved locally. Server sync failed."
      );
    } finally {
      setSavingProgress(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Toggle roadmap item
   * ---------------------------------------------------------
   *
   * We calculate the new array first.
   * Then update React state.
   * Then save that exact array.
   * ---------------------------------------------------------
   */
  const toggleCompleted = (item) => {
    let updatedItems;

    if (completedItems.includes(item)) {
      updatedItems =
        completedItems.filter(
          (completedItem) =>
            completedItem !== item
        );
    } else {
      updatedItems = [
        ...completedItems,
        item,
      ];
    }

    setCompletedItems(updatedItems);

    saveProgress(updatedItems);
  };

  /*
   * ---------------------------------------------------------
   * Reset progress
   * ---------------------------------------------------------
   */
  const resetProgress = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to reset your ${selectedRole} roadmap progress?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setSavingProgress(true);
      setSaveMessage("");

      const token = getToken();

      /*
       * Clear local backup immediately.
       */
      localStorage.removeItem(
        `roadmapProgress_${selectedRole}`
      );

      if (!token) {
        setCompletedItems([]);

        setSaveMessage(
          "Progress reset locally. Please log in again to sync with the server."
        );

        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/roadmap-progress/reset?role=${encodeURIComponent(
          selectedRole
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "ROADMAP PROGRESS RESET RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reset progress."
        );
      }

      setCompletedItems([]);

      setSaveMessage(
        "Progress reset successfully."
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 2000);
    } catch (err) {
      console.error(
        "RESET ERROR:",
        err
      );

      /*
       * Even if server reset fails,
       * clear the UI.
       */
      setCompletedItems([]);

      setSaveMessage(
        "Progress reset locally. Server reset failed."
      );
    } finally {
      setSavingProgress(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Keep selected role synchronized with an explicit URL role.
   * The initial state already handles the URL/profile fallback.
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (
      roleFromUrl &&
      ROLES.includes(roleFromUrl) &&
      roleFromUrl !== selectedRole
    ) {
      setSelectedRole(roleFromUrl);
    }
  }, [roleFromUrl, selectedRole]);

  /*
   * ---------------------------------------------------------
   * Load roadmap + progress whenever the role changes.
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!selectedRole) {
      return;
    }

    const requestId = ++roadmapRequestId.current;

    // Clear only while the NEW role is loading.
    setRoadmap(null);
    setCompletedItems([]);
    setLoading(true);
    setLoadingProgress(true);

    loadRoleData(selectedRole, requestId);

    return () => {
      /*
       * Incrementing the id makes every in-flight old request stale.
       * Its result can no longer overwrite the new role.
       */
      roadmapRequestId.current += 1;
    };
  }, [selectedRole]);

  /*
   * ---------------------------------------------------------
   * Calculate total roadmap items
   * ---------------------------------------------------------
   */
  const totalItems = useMemo(() => {
    if (!roadmap) {
      return 0;
    }

    return STAGES.reduce(
      (total, stage) => {
        const stageItems =
          roadmap[stage.key] || [];

        return (
          total +
          stageItems.length
        );
      },
      0
    );
  }, [roadmap]);

  /*
   * ---------------------------------------------------------
   * Completed item count
   * ---------------------------------------------------------
   */
  const completedCount = useMemo(() => {
    if (!roadmap) {
      return 0;
    }

    /*
     * Only count items that actually exist
     * in the current roadmap.
     */
    return completedItems.filter(
      (item) => {
        return STAGES.some(
          (stage) =>
            (
              roadmap[stage.key] || []
            ).includes(item)
        );
      }
    ).length;
  }, [completedItems, roadmap]);

  /*
   * ---------------------------------------------------------
   * Calculate progress percentage
   * ---------------------------------------------------------
   */
  const progress = useMemo(() => {
    if (totalItems === 0) {
      return 0;
    }

    return Math.round(
      (completedCount /
        totalItems) *
        100
    );
  }, [
    completedCount,
    totalItems,
  ]);

  /*
   * ---------------------------------------------------------
   * Change role
   * ---------------------------------------------------------
   */
  const handleRoleChange = (
    event
  ) => {
    const newRole =
      event.target.value;

    /*
     * Clear current role data
     * while the new role loads.
     */
    // Invalidate any request belonging to the previous role.
    roadmapRequestId.current += 1;

    setCompletedItems([]);
    setRoadmap(null);
    setSaveMessage("");
    setError("");

    setSelectedRole(newRole);

    navigate(
      `/career-roadmap?role=${encodeURIComponent(
        newRole
      )}`,
      {
        replace: true,
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-white/10 bg-[#0a0f1c]">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3 transition"
              >
                <ArrowLeft className="w-4 h-4" />

                Back to Dashboard
              </button>

              <h1 className="text-3xl font-bold">
                Career Roadmap
              </h1>

              <p className="text-gray-400 mt-1">
                Follow a structured path
                toward your target career.
              </p>
            </div>

            {/* =================================================
                ROLE SELECTOR
            ================================================== */}

            <div>
              <label className="block text-xs text-gray-400 mb-2">
                Target Role
              </label>

              <select
                value={selectedRole}
                onChange={
                  handleRoleChange
                }
                className="bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none min-w-[260px]"
              >
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
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* ===================================================
            ROLE NOTICE
        ==================================================== */}

        {roleFromUrl && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-400/10 px-4 py-3">
            <AlertCircle className="w-5 h-5 text-blue-400" />

            <p className="text-sm text-blue-200">
              Roadmap opened for{" "}
              <strong>
                {selectedRole}
              </strong>
              .
            </p>
          </div>
        )}

        {/* ===================================================
            PROGRESS CARD
        ==================================================== */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">
                {selectedRole} Roadmap
              </h2>

              <ProgressBar
                progress={progress}
              />

              <p className="text-xs text-gray-500 mt-3">
                {completedCount} completed
                item
                {completedCount !==
                1
                  ? "s"
                  : ""}{" "}
                out of {totalItems}
              </p>
            </div>

            {/* =================================================
                SAVE / RESET CONTROLS
            ================================================== */}

            <div className="flex items-center gap-3">
              {savingProgress && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />

                  Saving...
                </div>
              )}

              {saveMessage &&
                !savingProgress && (
                  <span className="text-sm text-green-400">
                    {saveMessage}
                  </span>
                )}

              <button
                type="button"
                onClick={() =>
                  saveProgress(
                    completedItems
                  )
                }
                disabled={
                  savingProgress ||
                  loadingProgress
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 transition"
              >
                <Save className="w-4 h-4" />

                Save
              </button>

              <button
                type="button"
                onClick={
                  resetProgress
                }
                disabled={
                  savingProgress
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-400/10 text-red-300 hover:bg-red-400/20 disabled:opacity-50 transition"
              >
                <RotateCcw className="w-4 h-4" />

                Reset
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading ||
        loadingProgress ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />

            <p className="text-gray-400">
              Loading your roadmap and
              saved progress...
            </p>
          </div>
        ) : null}

        {/* ===================================================
            ERROR
        ==================================================== */}

        {!loading &&
          error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />

                <div>
                  <h3 className="font-semibold text-red-300">
                    Unable to load roadmap
                  </h3>

                  <p className="text-sm text-red-200/80 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* ===================================================
            ROADMAP STAGES
        ==================================================== */}

        {!loading &&
          !loadingProgress &&
          !error &&
          roadmap && (
            <div className="space-y-5">
              {STAGES.map(
                (stage) => {
                  const items =
                    roadmap[
                      stage.key
                    ] || [];

                  if (
                    items.length ===
                    0
                  ) {
                    return null;
                  }

                  return (
                    <StageCard
                      key={
                        stage.key
                      }
                      stage={stage}
                      items={items}
                      completedItems={
                        completedItems
                      }
                      onToggle={
                        toggleCompleted
                      }
                    />
                  );
                }
              )}
            </div>
          )}

        {/* ===================================================
            EMPTY STATE
        ==================================================== */}

        {!loading &&
          !loadingProgress &&
          !error &&
          !roadmap && (
            <div className="text-center py-20 text-gray-400">
              No roadmap data available.
            </div>
          )}
      </main>
    </div>
  );
}