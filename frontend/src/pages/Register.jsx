import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(
        "Account created successfully! Redirecting..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* LEFT SIDE */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">

        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-slate-950 to-cyan-500/10" />

        <div className="relative max-w-lg">

          <div className="flex items-center gap-3 mb-8">

            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <Sparkles size={25} />
            </div>

            <span className="text-2xl font-bold">
              JobTrend AI
            </span>

          </div>

          <h1 className="text-5xl font-bold leading-tight">

            Your next career move

            <span className="text-indigo-400">
              {" "}starts here.
            </span>

          </h1>

          <p className="mt-6 text-slate-400 text-lg leading-relaxed">

            Create your account and let AI help you understand
            job trends, discover skill gaps, improve your resume,
            and build a smarter career roadmap.

          </p>

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


      {/* RIGHT SIDE */}

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
              Create your account 🚀
            </h2>

            <p className="text-slate-400 mt-2">
              Start building your smarter career path.
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div className="mb-5 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </div>
          )}


          {/* FORM */}

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* NAME */}

            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>

              <div className="relative">

                <User
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-500 transition"
                />

              </div>

            </div>


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
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  minLength={8}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-12 pr-12 outline-none focus:border-indigo-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
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


            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl py-3.5 font-semibold transition"
            >

              {loading
                ? "Creating account..."
                : "Create Account"}

            </button>

          </form>


          {/* LOGIN LINK */}

          <p className="text-center text-slate-400 mt-7">

            Already have an account?{" "}

            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Sign in
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;