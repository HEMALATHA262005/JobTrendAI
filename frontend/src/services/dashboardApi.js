const API_BASE_URL = "http://localhost:5000";

// ==========================================
// AUTH TOKEN
// ==========================================

const getToken = () => {
  return localStorage.getItem("token");
};

// ==========================================
// GENERIC API REQUEST
// ==========================================

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,

    headers: {
      ...(options.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
};

// ==========================================
// PROFILE
// ==========================================

export const getProfile = async () => {
  const data = await apiRequest("/api/auth/profile");

  return data.user || data.data || {};
};

// ==========================================
// SINGLE JOB TREND
// ==========================================

export const getJobTrends = async (role = "") => {
  const endpoint = role
    ? `/api/job-trends/?role=${encodeURIComponent(role)}`
    : "/api/job-trends/";

  return apiRequest(endpoint);
};

// ==========================================
// ALL JOB ROLES + TREND DATA
// ==========================================

export const getAllJobTrends = async () => {
  try {
    // First get all available roles
    const rolesResponse = await apiRequest("/api/job-trends/roles");

    const roles =
      rolesResponse?.roles ||
      rolesResponse?.data ||
      [];

    if (!Array.isArray(roles) || roles.length === 0) {
      return [];
    }

    // Fetch complete trend data for every role
    const results = await Promise.all(
      roles.map(async (role) => {
        try {
          const response = await getJobTrends(role);

          return response?.data || null;
        } catch (error) {
          console.error(
            `Failed to load job trend for ${role}:`,
            error
          );

          return null;
        }
      })
    );

    // Remove failed/null results
    return results.filter(Boolean);
  } catch (error) {
    console.error("Failed to load all job trends:", error);

    return [];
  }
};

// ==========================================
// MARKET INSIGHTS
// ==========================================

export const getMarketInsights = async () => {
  return apiRequest("/api/job-trends/market-insights");
};

// ==========================================
// TRENDING SKILLS
// ==========================================

export const getTrendingSkills = async (limit = 10) => {
  return apiRequest(
    `/api/job-trends/skills?limit=${limit}`
  );
};

// ==========================================
// ROADMAP PROGRESS
// ==========================================

export const getRoadmapProgress = async (role) => {
  if (!role) {
    return [];
  }

  const data = await apiRequest(
    `/api/roadmap-progress/?role=${encodeURIComponent(role)}`
  );

  return (
    data?.data?.completed_items ||
    data?.completed_items ||
    data?.data?.data?.completed_items ||
    []
  );
};

// ==========================================
// CAREER RECOMMENDATIONS
// ==========================================

export const getCareerRecommendations = async (
  skills = []
) => {
  const data = await apiRequest(
    "/api/career-recommendations/",
    {
      method: "POST",
      body: JSON.stringify({
        skills,
      }),
    }
  );

  return (
    data?.recommendations ||
    data?.results ||
    data?.data?.recommendations ||
    data?.data?.results ||
    (Array.isArray(data?.data)
      ? data.data
      : []) ||
    []
  );
};

// ==========================================
// EXPORT API BASE URL
// ==========================================

export { API_BASE_URL };