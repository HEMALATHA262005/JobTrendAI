import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import JobTrends from "./pages/JobTrends";
import SkillGap from "./pages/SkillGap";
import LearningHub from "./pages/LearningHub";
import ResumeAI from "./pages/ResumeAI";
import CareerRoadmap from "./pages/CareerRoadmap";
import CareerRecommendations from "./pages/CareerRecommendations";
import AIAssistant from "./pages/AIAssistant";
import MLPredictor from "./pages/MLPredictor";


/* ============================================================
   PROTECTED ROUTE
============================================================ */

function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token");

  if (!token) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }

  return children;
}


/* ============================================================
   APP
============================================================ */

export default function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* ====================================================
            PUBLIC ROUTES
        ==================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ====================================================
            DASHBOARD
        ==================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            PROFILE
        ==================================================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            JOB TRENDS
        ==================================================== */}

        <Route
          path="/job-trends"
          element={
            <ProtectedRoute>
              <JobTrends />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            SKILL GAP
        ==================================================== */}

        <Route
          path="/skill-gap"
          element={
            <ProtectedRoute>
              <SkillGap />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            LEARNING HUB
        ==================================================== */}

        <Route
          path="/learning-hub"
          element={
            <ProtectedRoute>
              <LearningHub />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            RESUME AI
        ==================================================== */}

        <Route
          path="/resume-ai"
          element={
            <ProtectedRoute>
              <ResumeAI />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            CAREER ROADMAP
        ==================================================== */}

        <Route
          path="/career-roadmap"
          element={
            <ProtectedRoute>
              <CareerRoadmap />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            CAREER RECOMMENDATIONS
        ==================================================== */}

        <Route
          path="/career-recommendations"
          element={
            <ProtectedRoute>
              <CareerRecommendations />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            AI ASSISTANT
        ==================================================== */}

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AIAssistant />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            ML CAREER ROLE PREDICTOR
        ==================================================== */}

        <Route
          path="/ml-predictor"
          element={
            <ProtectedRoute>
              <MLPredictor />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            DEFAULT ROUTE
        ==================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* ====================================================
            UNKNOWN ROUTES
        ==================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


      </Routes>

    </BrowserRouter>

  );
}