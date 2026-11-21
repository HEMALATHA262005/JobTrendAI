import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  BrainCircuit,
  BookOpen,
  FileText,
  Map,
  Compass,
  MessageCircle,
  UserCircle,
  Settings,
  LogOut,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Sparkles,
  Target,
  Award,
  ChevronRight,
  RefreshCw,
  Loader2,
  CheckCircle2,
  CircleAlert,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  getJobTrends,
  getAllJobTrends,
  getRoadmapProgress,
} from "../services/dashboardApi";

const TOTAL_ROADMAP_ITEMS = 30;

const clampPercentage = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(100, Math.max(0, Math.round(number)));
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const readStoredSkillGap = () => {
  try {
    const raw = localStorage.getItem("latestSkillGap");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Could not read saved skill-gap result:", error);
    return null;
  }
};

const extractSkillMatch = (result) => {
  if (!result || typeof result !== "object") return 0;
  const candidates = [
    result.skill_match_percentage,
    result.skill_match,
    result.match_percentage,
    result.matchPercentage,
    result.percentage,
    result.data?.skill_match_percentage,
    result.data?.skill_match,
    result.data?.match_percentage,
    result.data?.matchPercentage,
    result.data?.percentage,
  ];
  const value = candidates.find(
    (item) => item !== undefined && item !== null && item !== "" && Number.isFinite(Number(item))
  );
  return value === undefined ? 0 : clampPercentage(value);
};

const unwrapTrend = (response) => {
  if (!response || typeof response !== "object") return null;
  if (response.data && !Array.isArray(response.data)) return response.data;
  return response;
};

const numericValue = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(String(value).replace("%", "").replace("+", "").trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const getTrendGrowth = (trend) => {
  if (!trend || typeof trend !== "object") return null;
  const candidates = [
    trend.growth,
    trend.growth_percentage,
    trend.growthPercentage,
    trend.change,
    trend.change_percentage,
    trend.percentage_change,
    trend.trend_percentage,
    trend.demand_growth,
  ];
  for (const candidate of candidates) {
    const value = numericValue(candidate);
    if (value !== null) return value;
  }
  return null;
};

const getTrendDemand = (trend) => {
  const label =
    trend?.demand ??
    trend?.demand_level ??
    trend?.demandLevel ??
    trend?.market_demand ??
    trend?.level;
  if (label !== undefined && label !== null && String(label).trim()) return String(label);

  const score = numericValue(
    trend?.demand_score ?? trend?.demandScore ?? trend?.score ?? trend?.openings_count
  );
  if (score === null) return "Unknown";
  if (score >= 70) return "Very High";
  if (score >= 45) return "High";
  if (score >= 20) return "Medium";
  return "Low";
};

const normalizeTrend = (trend, fallbackRole = "") => {
  if (!trend || typeof trend !== "object") return null;
  const role =
    trend.role || trend.title || trend.job_title || trend.position || fallbackRole;
  if (!role) return null;

  const growth = getTrendGrowth(trend);
  const score = numericValue(
    trend.demand_score ?? trend.demandScore ?? trend.score
  );

  return {
    role: String(role),
    demand: getTrendDemand(trend),
    growth: growth ?? 0,
    demandScore: score ?? 0,
    openings: trend.openings ?? trend.openings_count ?? "N/A",
    openingsGrowth: trend.openings_growth ?? "",
    trend: trend.trend ?? "",
    salary: trend.salary ?? "",
  };
};

const getRoleFromStorage = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return (
      user?.target_role ||
      localStorage.getItem("targetRole") ||
      localStorage.getItem("mlPredictedRole") ||
      ""
    );
  } catch {
    return localStorage.getItem("targetRole") || localStorage.getItem("mlPredictedRole") || "";
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [loadingDashboardData, setLoadingDashboardData] = useState(true);
  const [dashboardDataError, setDashboardDataError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    jobDemand: null,
    skillMatch: 0,
    learningProgress: 0,
    careerReadiness: 0,
  });
  const [jobTrends, setJobTrends] = useState([]);

  const userName =
    profile?.name ||
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    "User";
  const targetRole =
    profile?.target_role || getRoleFromStorage() || "Not selected";
  const userSkills = safeArray(profile?.skills);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError("");
    try {
      const result = await getProfile();
      const safeProfile = result && typeof result === "object" ? result : {};
      setProfile(safeProfile);
      localStorage.setItem("user", JSON.stringify(safeProfile));
      if (safeProfile.name) localStorage.setItem("userName", safeProfile.name);
      if (safeProfile.target_role) {
        localStorage.setItem("targetRole", safeProfile.target_role);
      }
    } catch (error) {
      console.error("Dashboard profile load failed:", error);
      setProfileError(error?.message || "Unable to load your profile.");
      try {
        const cached = JSON.parse(localStorage.getItem("user") || "null");
        if (cached && typeof cached === "object") setProfile(cached);
      } catch {
        // Ignore malformed cached profile.
      }
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoadingDashboardData(true);
      setDashboardDataError("");

      try {
        const role = profile?.target_role || getRoleFromStorage();
        const skillMatch = extractSkillMatch(readStoredSkillGap());

        let completedItems = [];
        if (role) {
          try {
            completedItems = await getRoadmapProgress(role);
          } catch (error) {
            console.warn("Could not load roadmap progress:", error);
          }
        }

        const learningProgress = clampPercentage(
          (safeArray(completedItems).length / TOTAL_ROADMAP_ITEMS) * 100
        );

        let roleTrend = null;
        if (role) {
          try {
            roleTrend = unwrapTrend(await getJobTrends(role));
          } catch (error) {
            console.warn("Could not load target-role trend:", error);
          }
        }

        const roleGrowth = getTrendGrowth(roleTrend);
        const roleScore = numericValue(
          roleTrend?.demand_score ?? roleTrend?.demandScore ?? roleTrend?.score
        );
        const jobDemand = roleGrowth ?? roleScore;

        let allTrends = [];
        try {
          const response = await getAllJobTrends();
          allTrends = safeArray(response);
        } catch (error) {
          console.warn("Could not load all job trends:", error);
        }

        let normalized = allTrends
          .map((item) => normalizeTrend(item))
          .filter(Boolean);

        normalized.sort((a, b) => b.demandScore - a.demandScore);
        let finalTrends = normalized.slice(0, 5);

        if (role) {
          const matchIndex = finalTrends.findIndex(
            (item) => item.role.toLowerCase() === role.toLowerCase()
          );
          if (matchIndex > 0) {
            const [matched] = finalTrends.splice(matchIndex, 1);
            finalTrends = [matched, ...finalTrends];
          } else if (matchIndex === -1 && roleTrend) {
            const target = normalizeTrend({ ...roleTrend, role });
            if (target) finalTrends = [target, ...finalTrends].slice(0, 5);
          }
        }

        if (!finalTrends.length) {
          finalTrends = [
            { role: "AI Engineer", demand: "Very High", growth: 42, demandScore: 98, openings: "11K+", trend: "Explosive Growth" },
            { role: "Machine Learning Engineer", demand: "Very High", growth: 34, demandScore: 96, openings: "14K+", trend: "Rapidly Rising" },
            { role: "Data Scientist", demand: "Very High", growth: 27, demandScore: 94, openings: "18K+", trend: "Rapidly Rising" },
            { role: "DevOps Engineer", demand: "Very High", growth: 26, demandScore: 92, openings: "19K+", trend: "Strong" },
            { role: "Cloud Engineer", demand: "Very High", growth: 29, demandScore: 91, openings: "21K+", trend: "Strong" },
          ];
        }

        const careerReadiness = clampPercentage(skillMatch * 0.7 + learningProgress * 0.3);
        if (!cancelled) {
          setStats({
            jobDemand: jobDemand !== null && Number.isFinite(jobDemand) ? jobDemand : null,
            skillMatch,
            learningProgress,
            careerReadiness,
          });
          setJobTrends(finalTrends);
        }
      } catch (error) {
        console.error("Dashboard data load failed:", error);
        if (!cancelled) {
          setDashboardDataError(error?.message || "Some dashboard data could not be loaded.");
        }
      } finally {
        if (!cancelled) setLoadingDashboardData(false);
      }
    };

    if (!loadingProfile || profile) loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [profile, loadingProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProfile();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    [
      "token", "user", "userName", "name", "targetRole",
      "latestSkillGap", "latestSkillGapTime", "skillGapRole",
      "latestMLPrediction", "latestMLPredictionTime",
      "latestMLJobDescription", "mlPredictedRole",
    ].forEach((key) => localStorage.removeItem(key));
    navigate("/login");
  };

  const menuItems = useMemo(
    () => [
      { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
      { label: "Job Trends", icon: BriefcaseBusiness, path: "/job-trends" },
      { label: "Skill Gap", icon: BrainCircuit, path: "/skill-gap" },
      { label: "Learning Hub", icon: BookOpen, path: "/learning-hub" },
      { label: "Resume AI", icon: FileText, path: "/resume-ai" },
      { label: "Career Roadmap", icon: Map, path: "/career-roadmap" },
      { label: "Career Recommendations", icon: Compass, path: "/career-recommendations" },
      { label: "AI Assistant", icon: MessageCircle, path: "/ai-assistant" },
      { label: "ML Predictor", icon: BrainCircuit, path: "/ml-predictor" },
    ],
    []
  );

  const careerDescription =
    targetRole === "Not selected"
      ? "Set a target role in your profile to personalize your career journey."
      : `Your personalized career path is based on your profile, skills, job demand, and ${targetRole} requirements.`;

  const go = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[#081321] transition-transform duration-200 lg:static lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
            <button type="button" onClick={() => go("/dashboard")} className="flex items-center gap-3 text-left">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
                <Sparkles className="h-6 w-6 text-white" />
              </span>
              <span>
                <span className="block text-lg font-bold">JobTrend AI</span>
                <span className="block text-xs text-slate-500">Career Intelligence</span>
              </span>
            </button>
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 lg:hidden" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Workspace</p>
            <nav className="space-y-1">
              {menuItems.map(({ label, icon: Icon, path }) => {
                const active = path === "/dashboard";
                return (
                  <button
                    type="button"
                    key={label}
                    onClick={() => go(path)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                      active ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="flex-1 text-left">{label}</span>
                    {label === "Learning Hub" && <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-300">NEW</span>}
                  </button>
                );
              })}
            </nav>
            <div className="my-6 border-t border-white/10" />
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Account</p>
            <nav className="space-y-1">
              {[
                { label: "My Profile", icon: UserCircle, path: "/profile" },
                { label: "Settings", icon: Settings, path: "/profile" },
              ].map(({ label, icon: Icon, path }) => (
                <button type="button" key={label} onClick={() => go(path)} className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="flex-1 text-left">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="border-t border-white/10 p-4">
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300">
              <LogOut className="h-[18px] w-[18px]" /> Logout
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07111f]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation" className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 lg:hidden">
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-sm text-slate-500">Career Dashboard</p>
                  <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Welcome back, {userName} 👋</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={handleRefresh} disabled={refreshing} title="Refresh dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50">
                  {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => go("/profile")} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-2 py-2 transition hover:bg-white/10 sm:px-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600"><UserCircle className="h-5 w-5" /></span>
                  <span className="hidden text-left sm:block"><span className="block text-sm font-medium">{userName}</span><span className="block text-xs text-slate-500">My Profile</span></span>
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-7 md:px-6 lg:px-8">
            {profileError && <Notice tone="red" message={profileError} />}
            {dashboardDataError && <Notice tone="yellow" message={dashboardDataError} />}

            <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-white/[0.03] to-purple-500/10">
              <div className="relative p-7 md:p-9">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="relative max-w-3xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300"><Sparkles className="h-3.5 w-3.5" /> AI Career Intelligence</div>
                  <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">Build the career you want with <span className="text-cyan-300">data-driven insights.</span></h2>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">Track job market trends, discover your skill gaps, find the right learning resources, and build a personalized path toward your target career.</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <PrimaryButton onClick={() => go("/job-trends")}>Explore Job Trends <ArrowUpRight className="h-4 w-4" /></PrimaryButton>
                    <SecondaryButton onClick={() => go(targetRole !== "Not selected" ? `/skill-gap?role=${encodeURIComponent(targetRole)}` : "/skill-gap")}>Analyze Skill Gap <BrainCircuit className="h-4 w-4" /></SecondaryButton>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={TrendingUp} title="Job Demand" value={loadingDashboardData ? "..." : stats.jobDemand === null ? "N/A" : `${stats.jobDemand > 0 ? "+" : ""}${stats.jobDemand}%`} subtitle={stats.jobDemand === null ? "Trend data unavailable" : "Growth for your target role"} positive={stats.jobDemand !== null && stats.jobDemand >= 0} />
              <StatCard icon={Target} title="Skill Match" value={loadingDashboardData ? "..." : `${stats.skillMatch}%`} subtitle={stats.skillMatch > 0 ? "Based on latest skill-gap analysis" : "Run Skill Gap analysis"} positive={stats.skillMatch >= 50} />
              <StatCard icon={BookOpen} title="Learning Progress" value={loadingDashboardData ? "..." : `${stats.learningProgress}%`} subtitle="Career roadmap progress" positive={stats.learningProgress > 0} />
              <StatCard icon={Award} title="Career Readiness" value={loadingDashboardData ? "..." : `${stats.careerReadiness}%`} subtitle="Skill match + roadmap progress" positive={stats.careerReadiness >= 50} />
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 xl:col-span-2">
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div><div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-cyan-300" /><h3 className="font-semibold">Job Market Snapshot</h3></div><p className="mt-1 text-sm text-slate-500">Current demand across popular technology roles.</p></div>
                  <button type="button" onClick={() => go("/job-trends")} className="flex shrink-0 items-center gap-1 text-sm font-medium text-cyan-300 hover:text-cyan-200">View all <ChevronRight className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  {loadingDashboardData ? Array.from({ length: 5 }, (_, index) => <TrendSkeleton key={index} />) : jobTrends.length ? jobTrends.slice(0, 5).map((trend, index) => <TrendRow key={`${trend.role}-${index}`} {...trend} />) : <EmptyState onClick={() => go("/job-trends")} />}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <div className="mb-6"><div className="flex items-center gap-2"><Target className="h-5 w-5 text-purple-300" /><h3 className="font-semibold">Career Goal</h3></div><p className="mt-1 text-sm text-slate-500">Your current target.</p></div>
                <div className="rounded-2xl border border-purple-400/10 bg-purple-500/10 p-5">
                  <p className="text-xs uppercase tracking-wider text-purple-300">Target Role</p>
                  <h4 className="mt-2 text-xl font-bold">{loadingProfile ? "Loading..." : targetRole}</h4>
                  <p className="mt-2 text-sm leading-5 text-slate-400">{careerDescription}</p>
                </div>
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-sm"><span className="text-slate-400">Career readiness</span><span className="font-semibold">{loadingDashboardData ? "..." : `${stats.careerReadiness}%`}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400 transition-all duration-700" style={{ width: `${stats.careerReadiness}%` }} /></div>
                </div>
                <SecondaryButton className="mt-6 w-full justify-center" onClick={() => go(targetRole !== "Not selected" ? `/skill-gap?role=${encodeURIComponent(targetRole)}` : "/skill-gap")}>Improve Skill Match <ArrowUpRight className="h-4 w-4" /></SecondaryButton>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-5"><h3 className="text-lg font-semibold">Quick Actions</h3><p className="mt-1 text-sm text-slate-500">Jump into the tools that can move your career forward.</p></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <ActionCard icon={BriefcaseBusiness} title="Explore Job Trends" description="See which roles are growing fastest." onClick={() => go("/job-trends")} />
                <ActionCard icon={BrainCircuit} title="Analyze Skill Gap" description="Compare your skills with a target job." onClick={() => go(targetRole !== "Not selected" ? `/skill-gap?role=${encodeURIComponent(targetRole)}` : "/skill-gap")} />
                <ActionCard icon={BookOpen} title="Learning Hub" description="Find popular tutorials and hidden gems." badge="NEW" onClick={() => go(targetRole !== "Not selected" ? `/learning-hub?role=${encodeURIComponent(targetRole)}` : "/learning-hub")} />
                <ActionCard icon={FileText} title="Resume AI" description="Improve your resume for your target role." onClick={() => go("/resume-ai")} />
              </div>
            </section>

            <section className="mt-8 grid gap-6 md:grid-cols-2">
              <FeatureCard icon={Compass} title="Career Recommendations" description="Discover technology careers that match your current skills, job demand, and growth potential." accent="cyan" actionText="Find your best career match" onClick={() => go("/career-recommendations")} />
              <FeatureCard icon={Map} title="Career Roadmap" description="Follow a structured path from foundation skills to advanced preparation for your target career." accent="purple" actionText={stats.learningProgress > 0 ? `${stats.learningProgress}% completed` : "Open your roadmap"} onClick={() => go(targetRole !== "Not selected" ? `/career-roadmap?role=${encodeURIComponent(targetRole)}` : "/career-roadmap")} />
            </section>

            <section className="mt-8 overflow-hidden rounded-2xl border border-purple-400/10 bg-gradient-to-r from-purple-500/10 via-white/[0.03] to-cyan-500/10">
              <div className="flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center md:p-7">
                <div><div className="mb-2 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15"><Sparkles className="h-4 w-4 text-purple-300" /></span><span className="text-xs font-semibold uppercase tracking-wider text-purple-300">Learning Hub</span></div><h3 className="text-xl font-bold">Discover learning resources beyond the obvious.</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Get popular tutorials plus underrated hidden gems selected for practical value and relevance to your missing skills.</p></div>
                <SecondaryButton onClick={() => go(targetRole !== "Not selected" ? `/learning-hub?role=${encodeURIComponent(targetRole)}` : "/learning-hub")}>Open Learning Hub <ArrowUpRight className="h-4 w-4" /></SecondaryButton>
              </div>
            </section>

            {userSkills.length > 0 && (
              <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h3 className="font-semibold">Your Skills</h3><p className="mt-1 text-sm text-slate-500">Skills currently saved in your profile.</p></div><button type="button" onClick={() => go("/profile")} className="flex items-center gap-1 text-sm font-medium text-cyan-300 hover:text-cyan-200">Edit profile <ChevronRight className="h-4 w-4" /></button></div>
                <div className="mt-5 flex flex-wrap gap-2">{userSkills.slice(0, 15).map((skill, index) => <span key={`${String(skill)}-${index}`} className="rounded-full border border-cyan-400/10 bg-cyan-400/5 px-3 py-1.5 text-xs font-medium text-cyan-200">{String(skill)}</span>)}</div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Notice({ tone, message }) {
  const classes = tone === "red"
    ? "border-red-400/20 bg-red-500/10 text-red-300"
    : "border-yellow-400/20 bg-yellow-500/10 text-yellow-300";
  return <div className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${classes}`}><CircleAlert className="h-4 w-4 shrink-0" /><span>{message}</span></div>;
}

function PrimaryButton({ children, onClick, className = "" }) {
  return <button type="button" onClick={onClick} className={`flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 ${className}`}>{children}</button>;
}

function SecondaryButton({ children, onClick, className = "" }) {
  return <button type="button" onClick={onClick} className={`flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 ${className}`}>{children}</button>;
}

function StatCard({ icon: Icon, title, value, subtitle, positive = false }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/15 hover:bg-white/[0.05]"><div className="mb-5 flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10"><Icon className="h-5 w-5 text-cyan-300" /></div>{positive ? <TrendingUp className="h-4 w-4 text-emerald-300" /> : <Target className="h-4 w-4 text-slate-500" />}</div><p className="text-sm text-slate-500">{title}</p><p className="mt-1 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>;
}

function TrendRow({ role, demand, growth, openings, trend, positive }) {
  const isPositive = Number(growth) >= 0;
  const growthLabel = `${Number(growth) > 0 ? "+" : ""}${growth}%`;
  return <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-4 py-3 transition hover:bg-white/[0.05]"><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{role}</p><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500"><span>Demand: {demand || "Unknown"}</span>{openings && openings !== "N/A" && <span>Openings: {openings}</span>}{trend && <span className="hidden sm:inline">{trend}</span>}</div></div><div className="ml-2 flex shrink-0 items-center gap-2">{isPositive ? <TrendingUp className="h-4 w-4 text-emerald-300" /> : <TrendingDown className="h-4 w-4 text-red-300" />}<span className={`text-sm font-semibold ${isPositive ? "text-emerald-300" : "text-red-300"}`}>{growthLabel}</span></div></div>;
}

function TrendSkeleton() {
  return <div className="animate-pulse rounded-xl border border-white/5 bg-white/[0.025] px-4 py-4"><div className="flex items-center justify-between"><div className="space-y-2"><div className="h-3 w-36 rounded bg-white/10" /><div className="h-2.5 w-24 rounded bg-white/5" /></div><div className="h-3 w-12 rounded bg-white/10" /></div></div>;
}

function ActionCard({ icon: Icon, title, description, onClick, badge }) {
  return <button type="button" onClick={onClick} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"><div className="mb-5 flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10"><Icon className="h-5 w-5 text-cyan-300" /></div>{badge && <span className="rounded-full bg-purple-500/15 px-2.5 py-1 text-[10px] font-semibold text-purple-300">{badge}</span>}</div><h4 className="font-semibold text-white">{title}</h4><p className="mt-2 text-sm leading-5 text-slate-500">{description}</p><div className="mt-5 flex items-center gap-1 text-xs font-medium text-cyan-300 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">Open <ArrowUpRight className="h-3.5 w-3.5" /></div></button>;
}

function FeatureCard({ icon: Icon, title, description, accent, actionText, onClick }) {
  const styles = accent === "purple"
    ? "from-purple-500/10 hover:border-purple-400/20 text-purple-300 bg-purple-400/10"
    : "from-cyan-500/10 hover:border-cyan-400/20 text-cyan-300 bg-cyan-400/10";
  return <button type="button" onClick={onClick} className={`group rounded-2xl border border-white/10 bg-gradient-to-br ${styles.split(" ")[0]} to-white/[0.03] p-6 text-left transition hover:-translate-y-1 ${styles.split(" ")[1]}`}><div className="flex items-start justify-between"><div className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles.split(" ").slice(2).join(" ")}`}><Icon className="h-6 w-6" /></div><ArrowUpRight className="h-5 w-5 text-slate-600 transition group-hover:text-white" /></div><h3 className="mt-5 text-lg font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><div className={`mt-5 text-xs font-medium ${accent === "purple" ? "text-purple-300" : "text-cyan-300"}`}>{actionText} →</div></button>;
}

function EmptyState({ onClick }) {
  return <div className="rounded-xl border border-white/5 bg-white/[0.025] px-4 py-8 text-center"><p className="text-sm text-slate-400">No job trend data available yet.</p><button type="button" onClick={onClick} className="mt-3 text-sm font-medium text-cyan-300 hover:text-cyan-200">Explore Job Trends</button></div>;
}
