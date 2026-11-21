import { useEffect, useState } from "react";

import {
  TrendingUp,
  Search,
  BriefcaseBusiness,
  MapPin,
  BarChart3,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";


const API_BASE = "http://127.0.0.1:5000";


/* ==========================================================
   FALLBACK ROLES
========================================================== */

const fallbackRoles = [
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


/* ==========================================================
   SAFE ARRAY HELPER
========================================================== */

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};


/* ==========================================================
   SAFE STRING HELPER
========================================================== */

const safeString = (value, fallback = "") => {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
};


/* ==========================================================
   SAFE NUMBER HELPER
========================================================== */

const safeNumber = (value, fallback = 0) => {

  const number = Number(value);

  if (Number.isFinite(number)) {
    return number;
  }

  return fallback;
};


/* ==========================================================
   NORMALIZE SKILL DATA
========================================================== */

const normalizeSkill = (item, index) => {

  /*
    The backend normally returns something like:

    {
      skill: "Python",
      job_count: 63,
      demand_percentage: 29.86,
      trend_level: "High"
    }

    But this function protects the frontend if
    the API sends a different shape.
  */

  if (typeof item === "string") {

    return {
      skill: item,
      job_count: 0,
      demand_percentage: 0,
      trend_level: "Trending",
      id: `skill-${index}`,
    };
  }


  if (!item || typeof item !== "object") {

    return {
      skill: "Unknown Skill",
      job_count: 0,
      demand_percentage: 0,
      trend_level: "Trending",
      id: `skill-${index}`,
    };
  }


  const skillName =
    item.skill ||
    item.name ||
    item.Skill ||
    item.skill_name ||
    item.skillName ||
    "Unknown Skill";


  const jobCount =
    item.job_count ??
    item.count ??
    item.frequency ??
    item.jobCount ??
    item.jobs ??
    0;


  const demandPercentage =
    item.demand_percentage ??
    item.percentage ??
    item.demandPercent ??
    item.demand_percentage_value ??
    0;


  const trendLevel =
    item.trend_level ||
    item.trend ||
    item.level ||
    "Trending";


  return {

    skill: safeString(
      skillName,
      "Unknown Skill"
    ),

    job_count: safeNumber(
      jobCount,
      0
    ),

    demand_percentage: safeNumber(
      demandPercentage,
      0
    ),

    trend_level: safeString(
      trendLevel,
      "Trending"
    ),

    id:
      item._id ||
      item.id ||
      `skill-${index}`,
  };
};


/* ==========================================================
   NORMALIZE JOB TREND
========================================================== */

const normalizeJobData = (data) => {

  if (
    !data ||
    typeof data !== "object"
  ) {
    return null;
  }


  return {

    role:
      safeString(
        data.role,
        "Unknown Role"
      ),

    demand:
      safeString(
        data.demand,
        "Unknown"
      ),

    demand_score:
      safeNumber(
        data.demand_score,
        0
      ),

    demand_growth:
      safeString(
        data.demand_growth,
        "0%"
      ),

    salary:
      safeString(
        data.salary,
        "N/A"
      ),

    salary_growth:
      safeString(
        data.salary_growth,
        "0%"
      ),

    openings:
      safeString(
        data.openings,
        "N/A"
      ),

    openings_growth:
      safeString(
        data.openings_growth,
        "0%"
      ),

    trend:
      safeString(
        data.trend,
        "Stable"
      ),

    skills:
      safeArray(
        data.skills
      ),

    companies:
      safeArray(
        data.companies
      ),

    locations:
      safeArray(
        data.locations
      ),

    chart:
      safeArray(
        data.chart
      ).map(
        (item, index) => {

          if (
            !item ||
            typeof item !== "object"
          ) {
            return {
              year: String(
                2021 + index
              ),
              jobs: 0,
            };
          }

          return {

            year:
              item.year ??
              String(
                2021 + index
              ),

            jobs:
              safeNumber(
                item.jobs,
                0
              ),
          };
        }
      ),
  };
};


/* ==========================================================
   JOB TRENDS PAGE
========================================================== */

function JobTrends() {

  const [roles, setRoles] = useState([]);

  const [selectedRole, setSelectedRole] =
    useState("Data Scientist");

  const [jobData, setJobData] =
    useState(null);

  const [skills, setSkills] =
    useState([]);

  const [loadingRole, setLoadingRole] =
    useState(false);

  const [loadingSkills, setLoadingSkills] =
    useState(false);

  const [error, setError] =
    useState("");

  const [skillsError, setSkillsError] =
    useState("");


  /* ========================================================
     LOAD ROLES
  ======================================================== */

  const loadRoles = async () => {

    try {

      const response = await fetch(
        `${API_BASE}/api/job-trends/roles`
      );


      if (!response.ok) {

        throw new Error(
          `Roles request failed: ${response.status}`
        );
      }


      const data =
        await response.json();


      if (
        data &&
        data.status === "success" &&
        Array.isArray(data.roles) &&
        data.roles.length > 0
      ) {

        setRoles(
          data.roles
            .filter(Boolean)
            .map(
              (role) =>
                String(role)
            )
        );

      } else {

        setRoles(
          fallbackRoles
        );
      }

    } catch (err) {

      console.error(
        "Role loading error:",
        err
      );

      setRoles(
        fallbackRoles
      );
    }
  };


  /* ========================================================
     LOAD SELECTED ROLE
  ======================================================== */

  const loadRole = async (role) => {

    if (!role) {
      return;
    }


    setLoadingRole(true);

    setError("");


    try {

      const response =
        await fetch(
          `${API_BASE}/api/job-trends/?role=${encodeURIComponent(
            role
          )}`
        );


      if (!response.ok) {

        throw new Error(
          `Job trend request failed: ${response.status}`
        );
      }


      const data =
        await response.json();


      if (
        !data ||
        data.status !== "success" ||
        !data.data
      ) {

        throw new Error(
          data?.message ||
          "Could not load job trend"
        );
      }


      const normalized =
        normalizeJobData(
          data.data
        );


      if (!normalized) {

        throw new Error(
          "Invalid job trend data"
        );
      }


      setJobData(
        normalized
      );


    } catch (err) {

      console.error(
        "Job trend error:",
        err
      );


      setError(
        "Could not load job trend information."
      );


      setJobData(null);

    } finally {

      setLoadingRole(false);
    }
  };


  /* ========================================================
     LOAD SKILLS
  ======================================================== */

  const loadSkills = async () => {

    setLoadingSkills(true);

    setSkillsError("");


    try {

      const response =
        await fetch(
          `${API_BASE}/api/job-trends/skills?limit=20`
        );


      if (!response.ok) {

        throw new Error(
          `Skill trend request failed: ${response.status}`
        );
      }


      const data =
        await response.json();


      if (
        !data ||
        data.status !== "success"
      ) {

        throw new Error(
          data?.message ||
          "Could not load skill trends"
        );
      }


      const rawSkills =
        Array.isArray(data.data)
          ? data.data
          : [];


      const normalizedSkills =
        rawSkills
          .map(
            (
              item,
              index
            ) =>
              normalizeSkill(
                item,
                index
              )
          )
          .filter(
            (item) =>
              item &&
              item.skill
          );


      setSkills(
        normalizedSkills
      );


    } catch (err) {

      console.error(
        "Skill trend error:",
        err
      );


      setSkills([]);

      setSkillsError(
        "Could not load skill trend data."
      );

    } finally {

      setLoadingSkills(false);
    }
  };


  /* ========================================================
     INITIAL LOAD
  ======================================================== */

  useEffect(() => {

    loadRoles();

    loadSkills();

  }, []);


  /* ========================================================
     LOAD DEFAULT / SELECTED ROLE
  ======================================================== */

  useEffect(() => {

    if (selectedRole) {

      loadRole(
        selectedRole
      );
    }

  }, [selectedRole]);


  /* ========================================================
     REFRESH
  ======================================================== */

  const handleRefresh = () => {

    loadRole(
      selectedRole
    );

    loadSkills();

    loadRoles();
  };


  /* ========================================================
     RENDER
  ======================================================== */

  return (

    <div className="min-h-screen bg-[#07111f] text-white px-4 py-8 md:px-8">

      <div className="mx-auto max-w-7xl">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-cyan-400">

              <TrendingUp size={22} />

              <span className="text-sm font-semibold uppercase tracking-wider">
                JobTrend AI
              </span>

            </div>


            <h1 className="text-3xl font-bold md:text-4xl">
              Job Market Trends
            </h1>


            <p className="mt-2 max-w-2xl text-slate-400">
              Explore job demand, market distribution,
              and the skills appearing most frequently
              in our analyzed job descriptions.
            </p>

          </div>


          <button
            onClick={handleRefresh}
            className="flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium transition hover:border-cyan-500 hover:text-cyan-400"
          >

            <RefreshCw size={17} />

            Refresh Data

          </button>

        </div>


        {/* ==================================================
            ROLE SELECTOR
        ================================================== */}

        <div className="mb-8 rounded-2xl border border-slate-800 bg-[#0b1728] p-5">

          <div className="mb-3 flex items-center gap-2 text-slate-300">

            <Search size={18} />

            <span className="font-semibold">
              Select Career Role
            </span>

          </div>


          <select
            value={selectedRole}
            onChange={(event) => {

              const nextRole =
                event.target.value;

              setSelectedRole(
                nextRole
              );

            }}
            className="w-full rounded-xl border border-slate-700 bg-[#07111f] px-4 py-3 text-white outline-none transition focus:border-cyan-500 md:max-w-xl"
          >

            {(
              roles.length > 0
                ? roles
                : fallbackRoles
            ).map(
              (role) => (

                <option
                  key={role}
                  value={role}
                >
                  {role}
                </option>

              )
            )}

          </select>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (

          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>

              <p className="font-medium">
                {error}
              </p>

              <p className="mt-1 text-sm text-red-300/70">
                Check that the Flask backend is running
                on port 5000.
              </p>

            </div>

          </div>

        )}


        {/* ==================================================
            ROLE DATA
        ================================================== */}

        {loadingRole ? (

          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex items-center gap-3 text-cyan-400">

              <Loader2
                size={24}
                className="animate-spin"
              />

              Loading job trend...

            </div>

          </div>

        ) : jobData ? (

          <>

            {/* ==============================================
                STAT CARDS
            ============================================== */}

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


              <StatCard
                icon={
                  <BriefcaseBusiness
                    size={21}
                  />
                }
                title="Demand"
                value={
                  jobData.demand
                }
                subtitle={`Score ${jobData.demand_score}/100`}
              />


              <StatCard
                icon={
                  <TrendingUp
                    size={21}
                  />
                }
                title="Demand Growth"
                value={
                  jobData.demand_growth
                }
                subtitle={
                  jobData.trend
                }
              />


              <StatCard
                icon={
                  <BriefcaseBusiness
                    size={21}
                  />
                }
                title="Openings"
                value={
                  jobData.openings
                }
                subtitle={
                  jobData.openings_growth
                }
              />


              <StatCard
                icon={
                  <ArrowUpRight
                    size={21}
                  />
                }
                title="Salary"
                value={
                  jobData.salary
                }
                subtitle={
                  jobData.salary_growth
                }
              />

            </div>


            {/* ==============================================
                CHART + ROLE SKILLS
            ============================================== */}

            <div className="grid gap-6 lg:grid-cols-3">


              {/* JOB GROWTH CHART */}

              <div className="rounded-2xl border border-slate-800 bg-[#0b1728] p-6 lg:col-span-2">

                <div className="mb-6">

                  <div className="flex items-center gap-2 text-cyan-400">

                    <BarChart3 size={20} />

                    <h2 className="text-lg font-semibold text-white">
                      Job Demand Trend
                    </h2>

                  </div>


                  <p className="mt-1 text-sm text-slate-400">
                    Historical trend for{" "}
                    {jobData.role}
                  </p>

                </div>


                <div className="h-[320px]">

                  {jobData.chart.length > 0 ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <BarChart
                        data={
                          jobData.chart
                        }
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#243244"
                        />

                        <XAxis
                          dataKey="year"
                          stroke="#94a3b8"
                        />

                        <YAxis
                          stroke="#94a3b8"
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              "#0f1c2e",
                            border:
                              "1px solid #334155",
                            borderRadius:
                              "12px",
                            color:
                              "#fff",
                          }}
                        />

                        <Bar
                          dataKey="jobs"
                          fill="#22d3ee"
                          radius={[
                            6,
                            6,
                            0,
                            0,
                          ]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  ) : (

                    <div className="flex h-full items-center justify-center text-slate-500">
                      No chart data available.
                    </div>

                  )}

                </div>

              </div>


              {/* ROLE SKILLS */}

              <div className="rounded-2xl border border-slate-800 bg-[#0b1728] p-6">

                <h2 className="text-lg font-semibold">
                  Recommended Skills
                </h2>


                <p className="mt-1 text-sm text-slate-400">
                  Important skills for this role
                </p>


                {jobData.skills.length > 0 ? (

                  <div className="mt-5 flex flex-wrap gap-2">

                    {jobData.skills.map(
                      (
                        skill,
                        index
                      ) => (

                        <span
                          key={`${String(
                            skill
                          )}-${index}`}
                          className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300"
                        >

                          {safeString(
                            skill,
                            "Unknown Skill"
                          )}

                        </span>

                      )
                    )}

                  </div>

                ) : (

                  <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-500">
                    No recommended skills available.
                  </div>

                )}

              </div>

            </div>


            {/* ==============================================
                LOCATIONS + COMPANIES
            ============================================== */}

            <div className="mt-6 grid gap-6 md:grid-cols-2">


              <InfoList
                title="Top Locations"
                icon={
                  <MapPin size={20} />
                }
                items={
                  jobData.locations
                }
              />


              <InfoList
                title="Hiring Companies"
                icon={
                  <BriefcaseBusiness
                    size={20}
                  />
                }
                items={
                  jobData.companies
                }
              />

            </div>

          </>

        ) : (

          <div className="rounded-2xl border border-slate-800 bg-[#0b1728] p-10 text-center text-slate-500">

            No job trend information available.

          </div>

        )}


        {/* ==================================================
            DATA-DRIVEN TRENDING SKILLS
        ================================================== */}

        <div className="mt-10 rounded-2xl border border-cyan-500/20 bg-[#0b1728] p-6">


          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="flex items-center gap-2 text-cyan-400">

                <TrendingUp size={21} />

                <h2 className="text-xl font-bold text-white">
                  Trending Skills
                </h2>

              </div>


              <p className="mt-1 text-sm text-slate-400">
                Skills detected from the processed
                job-market dataset.
              </p>

            </div>


            <span className="text-xs text-slate-500">
              Data-driven analysis
            </span>

          </div>


          {loadingSkills ? (

            <div className="flex items-center justify-center py-16">

              <Loader2
                size={25}
                className="animate-spin text-cyan-400"
              />

            </div>

          ) : skillsError ? (

            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">

              <AlertCircle
                size={20}
              />

              {skillsError}

            </div>

          ) : skills.length === 0 ? (

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-slate-400">

              No skill trend data available.

            </div>

          ) : (

            <div className="grid gap-3 md:grid-cols-2">

              {skills.map(
                (
                  item,
                  index
                ) => {

                  /*
                    IMPORTANT:
                    Everything below is already normalized.
                    We never call .length on an unknown API value.
                  */

                  const skillName =
                    safeString(
                      item?.skill,
                      "Unknown Skill"
                    );

                  const jobCount =
                    safeNumber(
                      item?.job_count,
                      0
                    );

                  const percentage =
                    Math.max(
                      0,
                      Math.min(
                        safeNumber(
                          item?.demand_percentage,
                          0
                        ),
                        100
                      )
                    );

                  const trendLevel =
                    safeString(
                      item?.trend_level,
                      "Trending"
                    );


                  return (

                    <div
                      key={
                        item?.id ||
                        `skill-${index}`
                      }
                      className="rounded-xl border border-slate-800 bg-[#07111f] p-4 transition hover:border-cyan-500/40"
                    >

                      <div className="flex items-center justify-between gap-4">


                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-sm font-bold text-cyan-400">

                            {index + 1}

                          </div>


                          <div className="min-w-0">

                            <h3 className="truncate font-semibold">

                              {skillName}

                            </h3>


                            <p className="text-xs text-slate-500">

                              {jobCount} job descriptions

                            </p>

                          </div>

                        </div>


                        <div className="shrink-0 text-right">

                          <p className="font-bold text-cyan-400">

                            {percentage.toFixed(2)}%

                          </p>


                          <p className="text-xs text-slate-500">

                            {trendLevel}

                          </p>

                        </div>

                      </div>


                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                        <div
                          className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  title,
  value,
  subtitle,
}) {

  return (

    <div className="rounded-2xl border border-slate-800 bg-[#0b1728] p-5">

      <div className="mb-4 flex items-center gap-3">

        <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">

          {icon}

        </div>


        <span className="text-sm text-slate-400">
          {title}
        </span>

      </div>


      <div className="text-2xl font-bold">
        {value}
      </div>


      <div className="mt-1 text-xs text-slate-500">
        {subtitle}
      </div>

    </div>
  );
}


/* ============================================================
   INFO LIST
============================================================ */

function InfoList({
  title,
  icon,
  items,
}) {

  const safeItems =
    safeArray(items);


  return (

    <div className="rounded-2xl border border-slate-800 bg-[#0b1728] p-6">

      <div className="flex items-center gap-2">

        <div className="text-cyan-400">
          {icon}
        </div>


        <h2 className="text-lg font-semibold">
          {title}
        </h2>

      </div>


      {safeItems.length > 0 ? (

        <div className="mt-5 space-y-2">

          {safeItems.map(
            (
              item,
              index
            ) => (

              <div
                key={`${String(
                  item
                )}-${index}`}
                className="rounded-lg border border-slate-800 bg-[#07111f] px-4 py-3 text-sm text-slate-300"
              >

                {safeString(
                  item,
                  "Unknown"
                )}

              </div>

            )
          )}

        </div>

      ) : (

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-500">

          No data available.

        </div>

      )}

    </div>
  );
}


export default JobTrends;