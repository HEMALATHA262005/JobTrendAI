import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Flame,
  GraduationCap,
  PlayCircle,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Youtube,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:5000";

// =========================================================
// HELPERS
// =========================================================

function formatViews(value) {
  if (!value && value !== 0) return "—";

  const number = Number(value);

  if (Number.isNaN(number)) return "—";

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return number.toString();
}

function formatPublishedDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString();
}

// =========================================================
// YOUTUBE VIDEO CARD
// =========================================================

function VideoCard({ video, type }) {
  const isHiddenGem = type === "hidden";

  return (
    <div className="group overflow-hidden rounded-2xl border border-[#26364A] bg-[#0D1828] shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-cyan-500/10">
      <div className="relative aspect-video overflow-hidden bg-[#081321]">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title || "YouTube video"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            <Youtube size={42} />
          </div>
        )}

        <div
          className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${
            isHiddenGem
              ? "border-purple-400/30 bg-purple-500/20 text-purple-200"
              : "border-orange-400/30 bg-orange-500/20 text-orange-200"
          }`}
        >
          {isHiddenGem ? "💎 Hidden Gem" : "🔥 Popular"}
        </div>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-6 text-white">
          {video.title || "Untitled Video"}
        </h3>

        <p className="mt-2 text-sm font-medium text-slate-400">
          {video.channel || "YouTube"}
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
          <span className="rounded-full border border-[#26364A] bg-[#111A2E] px-2.5 py-1">
            👁 {formatViews(video.views)} views
          </span>

          {video.likes !== undefined && (
            <span className="rounded-full border border-[#26364A] bg-[#111A2E] px-2.5 py-1">
              👍 {formatViews(video.likes)}
            </span>
          )}

          {video.published_at && (
            <span className="rounded-full border border-[#26364A] bg-[#111A2E] px-2.5 py-1">
              {formatPublishedDate(video.published_at)}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {video.relevance_score !== undefined && (
            <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-3">
              <p className="text-slate-400">Relevance</p>

              <p className="mt-1 font-bold text-cyan-300">
                {Number(video.relevance_score).toFixed(0)}
              </p>
            </div>
          )}

          {isHiddenGem && video.hidden_gem_score !== undefined && (
            <div className="rounded-xl border border-purple-400/10 bg-purple-400/5 p-3">
              <p className="text-slate-400">Hidden Gem</p>

              <p className="mt-1 font-bold text-purple-300">
                {Number(video.hidden_gem_score).toFixed(0)}
              </p>
            </div>
          )}

          {!isHiddenGem && video.popularity_score !== undefined && (
            <div className="rounded-xl border border-orange-400/10 bg-orange-400/5 p-3">
              <p className="text-slate-400">Popularity</p>

              <p className="mt-1 font-bold text-orange-300">
                {Number(video.popularity_score).toFixed(0)}
              </p>
            </div>
          )}
        </div>

        {video.url && (
          <a
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20 hover:text-cyan-200"
          >
            <PlayCircle size={17} />

            Watch Video

            <ExternalLink size={15} />
          </a>
        )}
      </div>
    </div>
  );
}

// =========================================================
// FALLBACK RESOURCE CARD
// =========================================================

function ResourceCard({ resource }) {
  return (
    <div className="rounded-2xl border border-[#26364A] bg-[#0D1828] p-5 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-cyan-500/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          <BookOpen size={21} />
        </div>

        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          {resource.type || "Resource"}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-bold text-white">
        {resource.title}
      </h3>

      <p className="mt-1 text-sm font-semibold text-cyan-300">
        {resource.platform}
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {resource.description}
      </p>

      {resource.level && (
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <GraduationCap size={15} className="text-purple-300" />

          {resource.level}
        </div>
      )}

      <a
        href={resource.url}
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#26364A] bg-[#111A2E] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300"
      >
        Open Resource

        <ExternalLink size={15} />
      </a>
    </div>
  );
}

// =========================================================
// SECTION
// =========================================================

function Section({ title, icon, children }) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#26364A] bg-[#0D1828] text-cyan-300 shadow-sm">
          {icon}
        </div>

        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>

      {children}
    </section>
  );
}

// =========================================================
// MAIN LEARNING HUB
// =========================================================

export default function LearningHub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleFromUrl = searchParams.get("role");

  const [skillGap, setSkillGap] = useState(null);

  const [recommendations, setRecommendations] = useState({});

  const [fallbackResources, setFallbackResources] = useState({});

  const [loading, setLoading] = useState(false);

  const [loadingFallback, setLoadingFallback] = useState(false);

  const [error, setError] = useState("");

  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedSkill, setSelectedSkill] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  // =======================================================
  // LOAD SAVED SKILL GAP
  // =======================================================

  useEffect(() => {
    const savedAnalysis = localStorage.getItem("latestSkillGap");

    if (!savedAnalysis) {
      return;
    }

    try {
      const parsed = JSON.parse(savedAnalysis);

      setSkillGap(parsed);

      const missing = parsed?.missing_skills || [];

      if (missing.length > 0) {
        setSelectedSkill(missing[0]);
      }
    } catch (error) {
      console.error("Failed to load saved skill gap:", error);

      setError(
        "Could not load your previous Skill Gap Analysis."
      );
    }
  }, []);

  // =======================================================
  // MISSING SKILLS
  // =======================================================

  const missingSkills = useMemo(() => {
    return skillGap?.missing_skills || [];
  }, [skillGap]);

  // =======================================================
  // FILTER SKILLS
  // =======================================================

  const filteredSkills = useMemo(() => {
    return missingSkills.filter((skill) =>
      skill.toLowerCase().includes(search.toLowerCase())
    );
  }, [missingSkills, search]);

  // =======================================================
  // CURRENT DATA
  // =======================================================

  const currentData = recommendations[selectedSkill] || {
    popular: [],
    underrated: [],
  };

  const currentFallbackResources =
    fallbackResources[selectedSkill] || [];

  // =======================================================
  // LOAD YOUTUBE + FALLBACK RESOURCES
  // =======================================================

  async function loadRecommendations() {
    if (!missingSkills.length) {
      return;
    }

    setLoading(true);
    setLoadingFallback(true);
    setError("");
    setQuotaExceeded(false);

    const youtubeResults = {};
    const fallbackResults = {};

    let youtubeQuotaHit = false;

    // =====================================================
    // YOUTUBE
    // =====================================================

    for (const skill of missingSkills) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/youtube/recommendations?skill=${encodeURIComponent(
            skill
          )}`
        );

        if (!response.ok) {
          console.error(
            `YouTube API returned HTTP ${response.status} for ${skill}`
          );
          continue;
        }

        const data = await response.json();

        // =================================================
        // IMPORTANT FIX
        // Backend response is:
        //
        // {
        //   status: "success",
        //   data: {
        //      popular: [],
        //      underrated: []
        //   }
        // }
        //
        // So we need data.data
        // =================================================

        const result = data.data || data;

        if (data.status === "success") {
          youtubeResults[skill] = {
            popular: result.popular || [],
            underrated: result.underrated || [],
          };
        } else if (data.status === "quota_exceeded") {
          youtubeQuotaHit = true;
        }
      } catch (requestError) {
        console.error(
          `YouTube request failed for ${skill}:`,
          requestError
        );
      }
    }

    setRecommendations(youtubeResults);

    if (youtubeQuotaHit) {
      setQuotaExceeded(true);
    }

    // =====================================================
    // FALLBACK RESOURCES
    // =====================================================

    for (const skill of missingSkills) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/learning/resources?skill=${encodeURIComponent(
            skill
          )}`
        );

        if (!response.ok) {
          console.error(
            `Learning API returned HTTP ${response.status} for ${skill}`
          );
          continue;
        }

        const data = await response.json();

        const result = data.data || data;

        if (data.status === "success") {
          fallbackResults[skill] =
            result.resources || data.resources || [];
        }
      } catch (requestError) {
        console.error(
          `Fallback resource request failed for ${skill}:`,
          requestError
        );
      }
    }

    setFallbackResources(fallbackResults);

    setLoadingFallback(false);
    setLoading(false);

    const hasYoutubeResults = Object.values(
      youtubeResults
    ).some(
      (item) =>
        item.popular.length > 0 ||
        item.underrated.length > 0
    );

    const hasFallbackResults = Object.values(
      fallbackResults
    ).some((items) => items.length > 0);

    if (!hasYoutubeResults && !hasFallbackResults) {
      setError(
        "No learning resources could be loaded for the missing skills."
      );
    }
  }

  // =======================================================
  // LOAD WHEN SKILLS ARE READY
  // =======================================================

  useEffect(() => {
    if (missingSkills.length > 0) {
      loadRecommendations();
    }
  }, [missingSkills.length, refreshKey]);

  // =======================================================
  // NO SKILL GAP
  // =======================================================

  if (!skillGap) {
    return (
      <div className="min-h-screen bg-[#06111F] p-6 text-white">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate("/skill-gap")}
            className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-cyan-300"
          >
            <ArrowLeft size={18} />

            Back to Skill Gap
          </button>

          <div className="rounded-3xl border border-[#26364A] bg-[#0D1828] p-10 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <BookOpen size={30} />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-white">
              Learning Hub
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Run a Skill Gap Analysis first. We’ll use your
              missing skills to recommend videos, courses,
              documentation, and practical learning resources.
            </p>

            <button
              onClick={() => navigate("/skill-gap")}
              className="mt-7 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
            >
              Run Skill Gap Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // MAIN PAGE
  // =======================================================

  return (
    <div className="min-h-screen bg-[#06111F] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute right-0 top-80 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <button
              onClick={() =>
                navigate(
                  roleFromUrl
                    ? "/career-recommendations"
                    : "/skill-gap"
                )
              }
              className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-cyan-300"
            >
              <ArrowLeft size={17} />

              Back
            </button>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-500/10">
                <BookOpen size={27} />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Learning Hub
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Personalized learning resources based on
                  your skill gaps.
                </p>
              </div>
            </div>

            {skillGap.target_role && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                <Sparkles size={16} />

                Target Career: {skillGap.target_role}
              </div>
            )}
          </div>

          <button
            onClick={() =>
              setRefreshKey((value) => value + 1)
            }
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#26364A] bg-[#0D1828] px-5 py-3 text-sm font-semibold text-slate-200 shadow-lg shadow-black/10 transition hover:border-cyan-400/30 hover:bg-[#111A2E] hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            Refresh Recommendations
          </button>
        </div>

        {/* SUMMARY */}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#26364A] bg-[#0D1828] p-5 shadow-lg shadow-black/20">
            <p className="text-sm text-slate-400">
              Missing Skills
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {missingSkills.length}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-[#0D1828] p-5 shadow-lg shadow-cyan-500/5">
            <p className="text-sm text-slate-400">
              Selected Skill
            </p>

            <p className="mt-2 truncate text-xl font-bold text-cyan-300">
              {selectedSkill || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-purple-400/20 bg-[#0D1828] p-5 shadow-lg shadow-purple-500/5">
            <p className="text-sm text-slate-400">
              Available Resources
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {currentData.popular.length +
                currentData.underrated.length +
                currentFallbackResources.length}
            </p>
          </div>
        </div>

        {/* QUOTA MESSAGE */}

        {quotaExceeded && (
          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                <Youtube size={21} />
              </div>

              <div>
                <h2 className="font-bold text-amber-200">
                  YouTube recommendations are temporarily
                  unavailable
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-100/70">
                  The YouTube API daily search quota has been
                  reached. Your Skill Gap Analysis is still
                  safe, and the Learning Hub is working normally.
                </p>

                <p className="mt-2 text-sm leading-6 text-amber-100/70">
                  Previously cached recommendations will
                  continue to work when available. New
                  YouTube searches can resume after the API
                  quota resets.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SKILLS + CONTENT */}

        <div className="mt-8 grid gap-5 lg:grid-cols-[320px_1fr]">
          {/* SIDEBAR */}

          <aside className="h-fit rounded-2xl border border-[#26364A] bg-[#0D1828] p-5 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3 rounded-xl border border-[#26364A] bg-[#081321] px-4 py-3">
              <Search
                size={18}
                className="shrink-0 text-slate-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search skills..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="mt-5 space-y-2">
              {filteredSkills.length === 0 ? (
                <p className="rounded-xl p-3 text-sm text-slate-500">
                  No matching skills.
                </p>
              ) : (
                filteredSkills.map((skill) => {
                  const active = skill === selectedSkill;

                  return (
                    <button
                      key={skill}
                      onClick={() =>
                        setSelectedSkill(skill)
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        active
                          ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-500/5"
                          : "border-transparent bg-[#111A2E] text-slate-300 hover:border-[#26364A] hover:bg-[#172338] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{skill}</span>

                        {active && (
                          <Star
                            size={15}
                            className="fill-cyan-300 text-cyan-300"
                          />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* RIGHT CONTENT */}

          <main>
            {error && !quotaExceeded && (
              <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm font-medium text-red-300">
                {error}
              </div>
            )}

            {loading || loadingFallback ? (
              <div className="rounded-2xl border border-[#26364A] bg-[#0D1828] p-12 text-center shadow-xl shadow-black/20">
                <RefreshCw
                  size={30}
                  className="mx-auto animate-spin text-cyan-300"
                />

                <h2 className="mt-4 text-lg font-bold text-white">
                  Finding the best resources...
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Checking videos, courses, documentation,
                  and learning resources for your missing skills.
                </p>
              </div>
            ) : (
              <>
                {/* CURRENTLY LEARNING */}

                <div className="rounded-2xl border border-[#26364A] bg-[#0D1828] p-6 shadow-xl shadow-black/20">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <p className="text-sm font-semibold text-cyan-300">
                        Currently learning
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-white">
                        {selectedSkill}
                      </h2>

                      <p className="mt-2 text-sm text-slate-400">
                        Start with the recommended resources
                        below and build a practical project as
                        you learn.
                      </p>
                    </div>

                    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-3 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400">
                        Resources
                      </p>

                      <p className="mt-1 text-2xl font-bold text-cyan-300">
                        {currentData.popular.length +
                          currentData.underrated.length +
                          currentFallbackResources.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* POPULAR VIDEOS */}

                {currentData.popular.length > 0 && (
                  <Section
                    title="Popular Videos"
                    icon={
                      <Flame
                        size={20}
                        className="text-orange-300"
                      />
                    }
                  >
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {currentData.popular.map(
                        (video, index) => (
                          <VideoCard
                            key={
                              video.video_id || index
                            }
                            video={video}
                            type="popular"
                          />
                        )
                      )}
                    </div>
                  </Section>
                )}

                {/* HIDDEN GEMS */}

                {currentData.underrated.length > 0 && (
                  <Section
                    title="Underrated / Hidden Gems"
                    icon={
                      <Sparkles
                        size={20}
                        className="text-purple-300"
                      />
                    }
                  >
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {currentData.underrated.map(
                        (video, index) => (
                          <VideoCard
                            key={
                              video.video_id || index
                            }
                            video={video}
                            type="hidden"
                          />
                        )
                      )}
                    </div>
                  </Section>
                )}

                {/* FALLBACK RESOURCES */}

                {currentFallbackResources.length > 0 && (
                  <Section
                    title="Recommended Learning Resources"
                    icon={
                      <GraduationCap
                        size={20}
                        className="text-cyan-300"
                      />
                    }
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      {currentFallbackResources.map(
                        (resource, index) => (
                          <ResourceCard
                            key={`${resource.title}-${index}`}
                            resource={resource}
                          />
                        )
                      )}
                    </div>
                  </Section>
                )}

                {/* NO RESOURCES */}

                {currentData.popular.length === 0 &&
                  currentData.underrated.length === 0 &&
                  currentFallbackResources.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-[#26364A] bg-[#0D1828] p-10 text-center shadow-xl shadow-black/20">
                      <BookOpen
                        size={32}
                        className="mx-auto text-slate-500"
                      />

                      <h2 className="mt-4 text-lg font-bold text-white">
                        No resources found for this skill yet
                      </h2>

                      <p className="mt-2 text-sm text-slate-400">
                        Try another missing skill or refresh
                        the recommendations later.
                      </p>
                    </div>
                  )}
              </>
            )}
          </main>
        </div>

        {/* BOTTOM NAVIGATION */}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() =>
              navigate(
                roleFromUrl
                  ? `/career-roadmap?role=${encodeURIComponent(
                      roleFromUrl
                    )}`
                  : "/career-roadmap"
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-[#26364A] bg-[#0D1828] px-5 py-3 text-sm font-semibold text-slate-300 shadow-lg shadow-black/10 transition hover:border-cyan-400/20 hover:bg-[#111A2E] hover:text-cyan-300"
          >
            <ArrowLeft size={17} />

            View Career Roadmap
          </button>

          <button
            onClick={() =>
              navigate(
                roleFromUrl
                  ? `/skill-gap?role=${encodeURIComponent(
                      roleFromUrl
                    )}`
                  : "/skill-gap"
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
          >
            <Sparkles size={17} />

            Recheck Skill Gap
          </button>
        </div>
      </div>
    </div>
  );
}