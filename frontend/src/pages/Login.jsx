import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log("LOGIN STATUS:", response.status);
      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Login failed with status ${response.status}`
        );
      }

      /*
       * -------------------------------------------------------
       * Validate token
       * -------------------------------------------------------
       */

      if (!data.token) {
        throw new Error(
          "Login succeeded, but the server did not return a token."
        );
      }

      /*
       * -------------------------------------------------------
       * Save authentication information
       * -------------------------------------------------------
       */

      localStorage.setItem(
        "token",
        data.token
      );

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        if (data.user.name) {
          localStorage.setItem(
            "userName",
            data.user.name
          );

          localStorage.setItem(
            "name",
            data.user.name
          );
        }

        if (data.user.target_role) {
          localStorage.setItem(
            "targetRole",
            data.user.target_role
          );
        }
      }

      /*
       * -------------------------------------------------------
       * Go to dashboard
       * -------------------------------------------------------
       */

      navigate("/dashboard");

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to login. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">

        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-slate-950 to-cyan-500/10" />

        <div className="relative max-w-lg">

          {/* LOGO */}

          <div className="flex items-center gap-3 mb-8">

            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <Sparkles size={25} />
            </div>

            <span className="text-2xl font-bold">
              JobTrend AI
            </span>

          </div>


          {/* TITLE */}

          <h1 className="text-5xl font-bold leading-tight">

            Build the career

            <span className="text-indigo-400">
              {" "}you're ready for.
            </span>

          </h1>


          {/* DESCRIPTION */}

          <p className="mt-6 text-slate-400 text-lg leading-relaxed">

            Discover job trends, identify your skill gaps,
            improve your resume and find the right learning
            resources with AI-powered career intelligence.

          </p>


          {/* FEATURES */}

          <div className="mt-10 grid grid-cols-2 gap-4">

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">

              <p className="text-3xl font-bold">
                AI
              </p>

              <p className="text-sm text-slate-400 mt-1">
                Career Intelligence
              </p>

            </div>


            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">

              <p className="text-3xl font-bold">
                360°
              </p>

              <p className="text-sm text-slate-400 mt-1">
                Career Analysis
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">

        <div className="w-full max-w-md">


          {/* MOBILE LOGO */}

          <div className="lg:hidden flex items-center gap-3 mb-10">

            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Sparkles size={22} />
            </div>

            <span className="text-xl font-bold">
              JobTrend AI
            </span>

          </div>


          {/* HEADING */}

          <div className="mb-8">

            <h2 className="text-3xl font-bold">
              Welcome back 👋
            </h2>

            <p className="text-slate-400 mt-2">
              Sign in to continue your career journey.
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm leading-6">

              {error}

            </div>
          )}


          {/* LOGIN FORM */}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >


            {/* EMAIL */}

            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                  autoComplete="email"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-500 transition"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  autoComplete="current-password"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-12 pr-12 outline-none focus:border-indigo-500 transition"
                />


                {/* SHOW PASSWORD */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >

                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}

                </button>

              </div>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3.5 font-semibold transition"
            >

              {loading
                ? "Signing in..."
                : "Sign In"}

            </button>

          </form>


          {/* REGISTER LINK */}

          <p className="text-center text-slate-400 mt-7">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Create account
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;