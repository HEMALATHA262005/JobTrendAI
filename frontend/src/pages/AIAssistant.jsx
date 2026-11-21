import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Send,
  User,
  Trash2,
  Sparkles,
  Target,
  BookOpen,
  FileText,
  TrendingUp,
  Map,
} from "lucide-react";

function AIAssistant() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Hey! 👋 I'm your JobTrend AI Career Assistant. Ask me about your skills, resume, career path, learning plan, or job trends.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // GET SAVED JOBTREND AI CONTEXT
  // ============================================================

  const getStoredContext = () => {
    let skillGap = null;
    let resumeAnalysis = null;

    // ----------------------------------------------------------
    // Skill Gap
    // ----------------------------------------------------------

    try {
      const savedSkillGap =
        localStorage.getItem("latestSkillGap");

      if (savedSkillGap) {
        skillGap = JSON.parse(savedSkillGap);
      }
    } catch (error) {
      console.error(
        "Could not read Skill Gap data:",
        error
      );
    }

    // ----------------------------------------------------------
    // Resume AI
    // ----------------------------------------------------------

    try {
      const savedResume =
        localStorage.getItem("latestResumeAnalysis");

      if (savedResume) {
        resumeAnalysis = JSON.parse(savedResume);
      }
    } catch (error) {
      console.error(
        "Could not read Resume AI data:",
        error
      );
    }

    return {
      skillGap,
      resumeAnalysis,
    };
  };

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const sendMessage = async (customMessage = null) => {
    const message = (
      customMessage !== null
        ? customMessage
        : input
    ).trim();

    if (!message || loading) {
      return;
    }

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: message,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      // --------------------------------------------------------
      // Get user
      // --------------------------------------------------------

      let user = null;

      try {
        user = JSON.parse(
          localStorage.getItem("user") || "null"
        );
      } catch (error) {
        console.error(
          "Could not read user data:",
          error
        );
      }

      // --------------------------------------------------------
      // Get saved context
      // --------------------------------------------------------

      const context = getStoredContext();

      // --------------------------------------------------------
      // Backend request
      // --------------------------------------------------------

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your login session has expired. Please log in again.");
      }

      const response = await fetch(
        "http://127.0.0.1:5000/api/ai-assistant/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            message: message,

            email: user?.email || "",

            context: context,
          }),
        }
      );

      // --------------------------------------------------------
      // Parse response
      // --------------------------------------------------------

      let data = null;

      try {
        data = await response.json();
      } catch (error) {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      // --------------------------------------------------------
      // Check response
      // --------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Server returned status ${response.status}`
        );
      }

      // --------------------------------------------------------
      // Assistant message
      // --------------------------------------------------------

      const assistantMessage =
        data?.data?.message ||
        data?.message ||
        "I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: assistantMessage,
        },
      ]);
    } catch (error) {
      console.error(
        "AI Assistant error:",
        error
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            `AI Assistant error: ${
              error?.message ||
              "Unknown error"
            }`,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORM SUBMIT
  // ============================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    sendMessage();
  };

  // ============================================================
  // KEYBOARD
  // ============================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  // ============================================================
  // CLEAR CHAT
  // ============================================================

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        text:
          "Chat cleared. 👋 What would you like to work on?",
      },
    ]);
  };

  // ============================================================
  // QUICK ACTIONS
  // ============================================================

  const quickActions = [
    {
      text: "Which career is best for me?",
      icon: Target,
    },
    {
      text: "What skills am I missing?",
      icon: Sparkles,
    },
    {
      text: "How can I improve my resume?",
      icon: FileText,
    },
    {
      text: "What should I learn next?",
      icon: BookOpen,
    },
    {
      text: "Tell me about job trends.",
      icon: TrendingUp,
    },
    {
      text: "What should I do next?",
      icon: Map,
    },
  ];

  // ============================================================
  // MODULES
  // ============================================================

  const modules = [
    {
      title: "Skill Gap",
      description: "Find missing skills",
      icon: Target,
      path: "/skill-gap",
    },
    {
      title: "Learning Hub",
      description: "Find learning resources",
      icon: BookOpen,
      path: "/learning-hub",
    },
    {
      title: "Resume AI",
      description: "Improve your resume",
      icon: FileText,
      path: "/resume-ai",
    },
    {
      title: "Job Trends",
      description: "Explore market demand",
      icon: TrendingUp,
      path: "/job-trends",
    },
    {
      title: "Career Roadmap",
      description: "Plan your career",
      icon: Map,
      path: "/career-roadmap",
    },
  ];

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#06111F] text-white relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Main */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between mb-6">

          <div>
            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                <Bot
                  size={23}
                  className="text-cyan-400"
                />
              </div>

              <div>

                <h1 className="text-2xl font-bold">
                  AI Career Assistant
                </h1>

                <p className="text-sm text-slate-400">
                  Your personal JobTrend AI career guide
                </p>

              </div>

            </div>
          </div>

          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-[#0D1828] text-slate-300 hover:text-white hover:border-slate-500 transition"
          >
            <Trash2 size={16} />

            Clear
          </button>

        </div>

        {/* ======================================================
            LAYOUT
        ====================================================== */}

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">

          {/* ====================================================
              CHAT
          ==================================================== */}

          <div className="rounded-2xl border border-[#26364A] bg-[#0D1828] overflow-hidden">

            {/* Chat header */}
            <div className="px-5 py-4 border-b border-[#26364A] flex items-center gap-3">

              <div className="relative">

                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">

                  <Bot
                    size={20}
                    className="text-cyan-400"
                  />

                </div>

                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0D1828]" />

              </div>

              <div>

                <p className="font-semibold">
                  JobTrend AI
                </p>

                <p className="text-xs text-emerald-400">
                  Online
                </p>

              </div>

            </div>

            {/* Messages */}
            <div className="h-[520px] overflow-y-auto p-5 space-y-5">

              {messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    {/* Assistant icon */}
                    {message.role ===
                      "assistant" && (

                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">

                        <Bot
                          size={17}
                          className="text-cyan-400"
                        />

                      </div>

                    )}

                    {/* Message */}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm leading-6 ${
                        message.role ===
                        "user"
                          ? "bg-cyan-500 text-slate-950 rounded-br-md"
                          : message.error
                          ? "bg-red-500/10 border border-red-500/30 text-red-300 rounded-bl-md"
                          : "bg-[#111A2E] border border-[#26364A] text-slate-200 rounded-bl-md"
                      }`}
                    >
                      {message.text}
                    </div>

                    {/* User icon */}
                    {message.role ===
                      "user" && (

                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-500/10 border border-purple-400/20 flex items-center justify-center">

                        <User
                          size={17}
                          className="text-purple-400"
                        />

                      </div>

                    )}

                  </div>

                )
              )}

              {/* Loading */}
              {loading && (

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">

                    <Bot
                      size={17}
                      className="text-cyan-400"
                    />

                  </div>

                  <div className="bg-[#111A2E] border border-[#26364A] px-4 py-3 rounded-2xl">

                    <div className="flex gap-1">

                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />

                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />

                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />

                    </div>

                  </div>

                </div>

              )}

            </div>

            {/* ==================================================
                QUICK ACTIONS
            ================================================== */}

            <div className="px-5 pb-4">

              <p className="text-xs text-slate-500 mb-3">
                Quick questions
              </p>

              <div className="flex flex-wrap gap-2">

                {quickActions.map(
                  (action, index) => {

                    const Icon =
                      action.icon;

                    return (
                      <button
                        key={index}
                        onClick={() =>
                          sendMessage(
                            action.text
                          )
                        }
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111A2E] border border-[#26364A] text-xs text-slate-300 hover:text-white hover:border-cyan-400/40 transition disabled:opacity-50"
                      >

                        <Icon size={14} />

                        {action.text}

                      </button>
                    );
                  }
                )}

              </div>

            </div>

            {/* ==================================================
                INPUT
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-[#26364A]"
            >

              <div className="flex items-end gap-3">

                <textarea
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value
                    )
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your career..."
                  rows={2}
                  className="flex-1 resize-none rounded-xl bg-[#081321] border border-[#26364A] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/50 transition"
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !input.trim()
                  }
                  className="w-12 h-12 flex-shrink-0 rounded-xl bg-cyan-400 text-slate-950 flex items-center justify-center hover:bg-cyan-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >

                  <Send size={18} />

                </button>

              </div>

              <p className="text-[11px] text-slate-600 mt-2">
                Press Enter to send • Shift + Enter for a new line
              </p>

            </form>

          </div>

          {/* ====================================================
              SIDEBAR
          ==================================================== */}

          <div className="space-y-5">

            {/* Personalization */}
            <div className="rounded-2xl border border-[#26364A] bg-[#0D1828] p-5">

              <div className="flex items-center gap-2 mb-4">

                <Sparkles
                  size={18}
                  className="text-purple-400"
                />

                <h2 className="font-semibold">
                  Personalized AI
                </h2>

              </div>

              <p className="text-sm text-slate-400 leading-6">
                The assistant can use your profile,
                Skill Gap analysis and Resume AI analysis
                to provide more relevant career guidance.
              </p>

            </div>

            {/* Tools */}
            <div className="rounded-2xl border border-[#26364A] bg-[#0D1828] p-5">

              <h2 className="font-semibold mb-4">
                JobTrend AI Tools
              </h2>

              <div className="space-y-2">

                {modules.map(
                  (module, index) => {

                    const Icon =
                      module.icon;

                    return (
                      <button
                        key={index}
                        onClick={() =>
                          navigate(
                            module.path
                          )
                        }
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#111A2E] border border-[#26364A] hover:border-cyan-400/30 transition text-left"
                      >

                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">

                          <Icon
                            size={16}
                            className="text-cyan-400"
                          />

                        </div>

                        <div>

                          <p className="text-sm font-medium">
                            {module.title}
                          </p>

                          <p className="text-xs text-slate-500">
                            {module.description}
                          </p>

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AIAssistant;