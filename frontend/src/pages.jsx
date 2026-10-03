import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Layers3,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
  WandSparkles
} from "lucide-react";

import { api } from "./api";
import { useAuth } from "./auth";
import {
  Empty,
  ErrorBox,
  Loader,
  PageTitle,
  Shell,
  StatCard
} from "./components";

export function Protected({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />;
  }

  return children;
}

export function Landing() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const demoEnabled = String(import.meta.env.VITE_ENABLE_DEMO ?? "true") === "true";

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />;
  }

  async function finish(userResult) {
    navigate(userResult.role === "admin" ? "/admin" : "/student");
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result =
        mode === "login"
          ? await login(form.email, form.password)
          : await register(form);
      await finish(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function demoLogin(role) {
    setBusy(true);
    setError("");

    try {
      const credentials =
        role === "admin"
          ? ["admin@studybuddy.demo", "Admin@123"]
          : ["student@studybuddy.demo", "Student@123"];

      const result = await login(...credentials);
      await finish(result);
    } catch (err) {
      setError(`${err.message}. Run "npm run seed:demo" in backend first.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="loginPage referenceLogin">
      <header className="publicTopbar">
        <div className="loginBrand publicBrand">
          <span className="logoMark"><BookOpen size={19} /></span>
          <span>AI StudyBuddy</span>
          <small>Smart Learning Assistant</small>
        </div>

        <div className="publicNavHint">
          <span><BrainCircuit size={15} /> AI Tools</span>
          <span><Search size={15} /> Semantic Search</span>
          <span><ShieldCheck size={15} /> Secure Access</span>
        </div>
      </header>

      <main className="loginCanvas">
        <section className="loginWelcome">
          <span className="heroPill lightPill">
            <Sparkles size={14} /> Gemini-powered study workspace
          </span>
          <h1>Learn smarter with <em>AI StudyBuddy</em></h1>
          <p>Study materials, summaries, flashcards, quizzes, planning and a context-aware AI assistant in one workspace.</p>
        </section>

        <section className="loginCard loginCardCentered">
          <span className="loginIcon"><GraduationCap size={24} /></span>
          <h2>{mode === "login" ? "Welcome Back" : "Create Student Account"}</h2>
          <p>
            {mode === "login"
              ? "Sign in to continue to your StudyBuddy workspace."
              : "Create your account to start learning smarter."}
          </p>

          <ErrorBox message={error} />

          <form onSubmit={submit}>
            {mode === "register" && (
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                minLength="8"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </label>

            <button className="primaryButton full" disabled={busy}>
              {busy
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
              <ArrowRight size={17} />
            </button>
          </form>

          {mode === "login" && demoEnabled && (
            <>
              <div className="divider"><span>Instant demo credentials</span></div>
              <div className="demoButtons">
                <button
                  className="demoButton"
                  type="button"
                  onClick={() => demoLogin("student")}
                  disabled={busy}
                >
                  <span className="demoIcon"><GraduationCap size={18} /></span>
                  <span><strong>Demo Student</strong><small>Student workspace</small></span>
                </button>

                <button
                  className="demoButton admin"
                  type="button"
                  onClick={() => demoLogin("admin")}
                  disabled={busy}
                >
                  <span className="demoIcon"><ShieldCheck size={18} /></span>
                  <span><strong>Demo Admin</strong><small>Admin console</small></span>
                </button>
              </div>
            </>
          )}

          <button
            className="switchButton"
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login"
              ? "New user? Create a student account"
              : "Already registered? Sign in"}
          </button>
        </section>
      </main>
    </div>
  );
}

export function StudentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/student/dashboard").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <Shell role="student">
      <PageTitle
        eyebrow="Student Dashboard"
        title="Your learning overview"
        text="Continue from where you left off and use AI only when it helps your study goal."
      />

      <ErrorBox message={error} />

      {!data ? (
        <Loader />
      ) : (
        <>
          <div className="statsGrid">
            <StatCard
              label="Study Materials"
              value={data.stats.materials}
              detail="Saved resources"
              icon={FileText}
            />
            <StatCard
              label="AI Generations"
              value={data.stats.aiGenerations}
              detail="Summary / cards / quiz"
              icon={Sparkles}
            />
            <StatCard
              label="Study Plans"
              value={data.stats.studyPlans}
              detail="Personal schedules"
              icon={CalendarDays}
            />
            <StatCard
              label="Assistant Chats"
              value={data.stats.chatSessions}
              detail="RAG conversations"
              icon={Bot}
            />
          </div>

          <div className="dashboardGrid">
            <section className="card wide">
              <div className="cardHeader">
                <div>
                  <span className="eyebrow">Recent Activity</span>
                  <h2>My Materials</h2>
                </div>
              </div>

              {data.recentMaterials.length ? (
                <div className="resourceList">
                  {data.recentMaterials.map((item) => (
                    <div className="resourceRow" key={item._id}>
                      <span className="resourceIcon"><FileText size={18} /></span>
                      <div>
                        <strong>{item.title}</strong>
                        <small>{item.subject}</small>
                      </div>
                      <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  title="No study material yet"
                  text="Upload your first notes or PDF to start."
                />
              )}
            </section>

            <section className="card assistantPromo">
              <span className="eyebrow light">Study Assistant</span>
              <h2>Ask from your own notes</h2>
              <p>
                Vector search retrieves relevant study context before Gemini answers.
              </p>
              <a className="primaryButton" href="/student/assistant">
                Open Assistant <ArrowRight size={17} />
              </a>
            </section>
          </div>
        </>
      )}
    </Shell>
  );
}

export function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    content: "",
    file: null
  });

  async function load() {
    try {
      const data = await api("/materials");
      setMaterials(data.materials);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const body = new FormData();
      body.append("title", form.title);
      body.append("subject", form.subject);
      if (form.content) body.append("content", form.content);
      if (form.file) body.append("file", form.file);

      await api("/materials", { method: "POST", body });
      setForm({ title: "", subject: "", content: "", file: null });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this study material?")) return;
    try {
      await api(`/materials/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Shell role="student">
      <PageTitle
        eyebrow="Library"
        title="Study Materials"
        text="Upload notes once, then reuse them across all AI study features."
      />

      <div className="twoColumns">
        <section className="card">
          <h2>Saved materials</h2>
          <ErrorBox message={error} />

          {materials.length ? (
            <div className="resourceList">
              {materials.map((item) => (
                <div className="resourceRow" key={item._id}>
                  <span className="resourceIcon"><FileText size={18} /></span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.subject}</small>
                  </div>
                  <button className="dangerIcon" onClick={() => remove(item._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Library is empty" text="Add your first study material." />
          )}
        </section>

        <section className="card">
          <span className="eyebrow">Add Resource</span>
          <h2>Upload study material</h2>

          <form className="stackForm" onSubmit={submit}>
            <label>
              Title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>

            <label>
              Subject
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </label>

            <label>
              Paste notes
              <textarea
                rows="7"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Paste study text here, or choose a supported file below..."
              />
            </label>

            <label className="filePicker">
              <UploadCloud size={20} />
              <span>{form.file?.name || "Choose TXT, MD or PDF"}</span>
              <input
                type="file"
                accept=".txt,.md,.pdf"
                onChange={(e) =>
                  setForm({ ...form, file: e.target.files?.[0] || null })
                }
              />
            </label>

            <button className="primaryButton" disabled={busy}>
              <Plus size={17} />
              {busy ? "Uploading..." : "Add Material"}
            </button>
          </form>
        </section>
      </div>
    </Shell>
  );
}

export function AIToolsPage() {
  const [materials, setMaterials] = useState([]);
  const [selected, setSelected] = useState("");
  const [output, setOutput] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    api("/materials")
      .then((data) => {
        setMaterials(data.materials);
        if (data.materials[0]) setSelected(data.materials[0]._id);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function run(type) {
    if (!selected) {
      setError("Select a study material first");
      return;
    }

    setBusy(type);
    setError("");
    setOutput(null);

    try {
      let data;

      if (type === "summary") {
        data = await api(`/materials/${selected}/summarize`, { method: "POST" });
      }

      if (type === "flashcards") {
        data = await api("/ai/flashcards", {
          method: "POST",
          body: JSON.stringify({ materialId: selected, count: 10 })
        });
      }

      if (type === "quiz") {
        data = await api("/ai/quiz", {
          method: "POST",
          body: JSON.stringify({ materialId: selected, count: 5 })
        });
      }

      setOutput({ type, data });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <Shell role="student">
      <PageTitle
        eyebrow="Gemini Learning Tools"
        title="Generate study resources"
        text="Use one saved material to create summaries, active-recall flashcards and quizzes."
      />

      <section className="card">
        <ErrorBox message={error} />

        <label className="selectLabel">
          Study material
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Select material</option>
            {materials.map((item) => (
              <option key={item._id} value={item._id}>
                {item.title} — {item.subject}
              </option>
            ))}
          </select>
        </label>

        <div className="toolGrid">
          <button className="toolCard" onClick={() => run("summary")}>
            <span className="toolIcon"><WandSparkles size={20} /></span>
            <strong>AI Summary</strong>
            <span>{busy === "summary" ? "Generating..." : "Concise exam revision notes"}</span>
          </button>

          <button className="toolCard" onClick={() => run("flashcards")}>
            <span className="toolIcon"><Layers3 size={20} /></span>
            <strong>Flashcards</strong>
            <span>{busy === "flashcards" ? "Generating..." : "Question and answer cards"}</span>
          </button>

          <button className="toolCard" onClick={() => run("quiz")}>
            <span className="toolIcon"><ClipboardCheck size={20} /></span>
            <strong>Quiz</strong>
            <span>{busy === "quiz" ? "Generating..." : "Multiple-choice self assessment"}</span>
          </button>
        </div>
      </section>

      {output && (
        <section className="card resultCard">
          <span className="eyebrow">Generated Result</span>
          <h2>{output.type}</h2>

          {output.type === "summary" && (
            <pre className="aiText">{output.data.summary}</pre>
          )}

          {output.type === "flashcards" && (
            <div className="flashGrid">
              {output.data.flashcards?.map((item, index) => (
                <article className="flashCard" key={index}>
                  <small>Card {index + 1}</small>
                  <strong>{item.question}</strong>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          )}

          {output.type === "quiz" && (
            <div className="quizList">
              {output.data.quiz?.map((item, index) => (
                <article className="quizCard" key={index}>
                  <strong>{index + 1}. {item.question}</strong>
                  {item.options?.map((option) => (
                    <span key={option}>{option}</span>
                  ))}
                  <small>Answer: {item.answer}</small>
                  {item.explanation && <p>{item.explanation}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </Shell>
  );
}

export function SearchPage() {
  const [mode, setMode] = useState("semantic");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function search(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const data =
        mode === "semantic"
          ? await api("/search/semantic", {
              method: "POST",
              body: JSON.stringify({ query })
            })
          : await api(`/search?q=${encodeURIComponent(query)}`);

      setResults(data.results || []);
      if (data.warning) setNotice(data.warning);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell role="student">
      <PageTitle
        eyebrow="MongoDB Atlas"
        title="Search your knowledge"
        text="Use semantic vector search or keyword Atlas Search across your own notes."
      />

      <section className="card searchCard">
        <div className="segmented">
          <button
            className={mode === "semantic" ? "active" : ""}
            onClick={() => setMode("semantic")}
          >
            Semantic
          </button>
          <button
            className={mode === "keyword" ? "active" : ""}
            onClick={() => setMode("keyword")}
          >
            Keyword
          </button>
        </div>

        <form className="searchBar" onSubmit={search}>
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a concept or ask a study question..."
            required
          />
          <button>{busy ? "Searching..." : "Search"}</button>
        </form>

        {notice && <div className="notice">{notice}</div>}
        <ErrorBox message={error} />
      </section>

      <section className="card">
        <h2>Search results</h2>

        {results.length ? (
          <div className="searchResults">
            {results.map((item, index) => (
              <article key={index}>
                <strong>{item.title || `Context ${index + 1}`}</strong>
                <p>{item.subject || item.text}</p>
                {item.score !== undefined && (
                  <small>Score: {Number(item.score).toFixed(3)}</small>
                )}
              </article>
            ))}
          </div>
        ) : (
          <Empty title="No results yet" text="Run a search to view matches." />
        )}
      </section>
    </Shell>
  );
}

export function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I’m your AI StudyBuddy. Choose a quick question below or ask anything from your saved study materials."
    }
  ]);

  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const suggestions = [
    ["Summarize my latest study material", WandSparkles],
    ["Create a quick quiz from my notes", ClipboardCheck],
    ["Explain the most important concepts", BrainCircuit],
    ["What should I study today?", CalendarDays]
  ];

  function friendlyAssistantError(message = "") {
    if (/denied access|permission_denied|403/i.test(message)) {
      return "Gemini is currently unavailable for this project. Update the Gemini API key/project access and try again.";
    }
    if (/failed to fetch|network/i.test(message)) {
      return "Unable to reach the StudyBuddy API. Make sure the backend is running and try again.";
    }
    return message || "The assistant could not complete that request. Please try again.";
  }

  async function sendMessage(text) {
    const cleanText = text.trim();
    if (!cleanText || busy) return;

    setInput("");
    setMessages((items) => [...items, { role: "user", content: cleanText }]);
    setBusy(true);
    setError("");

    try {
      const data = await api("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message: cleanText, sessionId })
      });

      setSessionId(data.sessionId);
      setMessages((items) => [
        ...items,
        { role: "assistant", content: data.answer }
      ]);
    } catch (err) {
      setError(friendlyAssistantError(err.message));
    } finally {
      setBusy(false);
    }
  }

  async function send(event) {
    event.preventDefault();
    await sendMessage(input);
  }

  return (
    <Shell role="student">
      <PageTitle
        eyebrow="Gemini + RAG"
        title="Study Assistant"
        text="Ask questions from your uploaded study materials."
      />

      <section className="chatCard">
        <div className="chatHeader">
          <span className="assistantAvatar"><Bot size={21} /></span>
          <div>
            <strong>AI StudyBuddy Assistant</strong>
            <small>Context-aware learning assistant</small>
          </div>
          <span className="onlineBadge">AI Ready</span>
        </div>

        <div className="messages">
          {messages.map((message, index) => (
            <div className={`message ${message.role}`} key={index}>
              <span>{message.content}</span>
            </div>
          ))}

          {messages.length === 1 && !busy && (
            <div className="suggestionArea">
              <small className="suggestionLabel">Try a quick question</small>
              <div className="suggestionGrid">
                {suggestions.map(([question, Icon]) => (
                  <button
                    type="button"
                    className="suggestionCard"
                    key={question}
                    onClick={() => sendMessage(question)}
                  >
                    <span className="suggestionIcon"><Icon size={18} /></span>
                    <span>{question}</span>
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {busy && (
            <div className="message assistant thinkingMessage">
              <span><i className="thinkingDot" />Searching your notes and thinking...</span>
            </div>
          )}
        </div>

        <ErrorBox message={error} />

        <form className="chatInput" onSubmit={send}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask StudyBuddy anything..."
            disabled={busy}
          />
          <button disabled={busy || !input.trim()} aria-label="Send message">
            <Send size={18} />
          </button>
        </form>
      </section>
    </Shell>
  );
}

export function StudyPlanPage() {
  const [form, setForm] = useState({
    goal: "Prepare for semester exams",
    subjects: "DBMS, Software Engineering",
    examDate: "",
    hoursPerDay: 2
  });

  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const data = await api("/ai/study-plan", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          subjects: form.subjects
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        })
      });

      setPlan(data.studyPlan);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell role="student">
      <PageTitle
        eyebrow="Personal Planning"
        title="AI Study Plan"
        text="Build a realistic study schedule around your subjects, time and exam date."
      />

      <div className="twoColumns">
        <section className="card">
          <ErrorBox message={error} />

          <form className="stackForm" onSubmit={submit}>
            <label>
              Goal
              <input
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                required
              />
            </label>

            <label>
              Subjects
              <input
                value={form.subjects}
                onChange={(e) => setForm({ ...form, subjects: e.target.value })}
              />
            </label>

            <label>
              Exam date
              <input
                type="date"
                value={form.examDate}
                onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              />
            </label>

            <label>
              Hours per day
              <input
                type="number"
                min="1"
                max="12"
                value={form.hoursPerDay}
                onChange={(e) =>
                  setForm({ ...form, hoursPerDay: Number(e.target.value) })
                }
              />
            </label>

            <button className="primaryButton" disabled={busy}>
              <Sparkles size={17} />
              {busy ? "Generating..." : "Generate Plan"}
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Your generated schedule</h2>
          {plan ? (
            <pre className="aiText">{plan.plan}</pre>
          ) : (
            <Empty title="No plan generated" text="Enter details and create your plan." />
          )}
        </section>
      </div>
    </Shell>
  );
}

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/dashboard").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <Shell role="admin">
      <PageTitle
        eyebrow="Administration"
        title="Admin Dashboard"
        text="Monitor platform usage, users, resources and operational health."
      />

      <ErrorBox message={error} />

      {!data ? (
        <Loader />
      ) : (
        <div className="statsGrid">
          <StatCard
            label="Total Users"
            value={data.stats.users}
            detail={`${data.stats.activeUsers} active`}
            icon={Users}
          />
          <StatCard
            label="Students"
            value={data.stats.students}
            detail="Registered learners"
            icon={GraduationCap}
          />
          <StatCard
            label="Materials"
            value={data.stats.materials}
            detail="Uploaded resources"
            icon={FileText}
          />
          <StatCard
            label="Chat Sessions"
            value={data.stats.chatSessions}
            detail="Assistant sessions"
            icon={Bot}
          />
        </div>
      )}

      <section className="card adminHero">
        <span className="eyebrow light">Operations</span>
        <h2>AI StudyBuddy Control Center</h2>
        <p>
          Review accounts, monitor learning resources, inspect AI usage reports
          and verify system health.
        </p>
      </section>
    </Shell>
  );
}

function AdminTable({ type }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setData(await api(`/admin/${type}`));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [type]);

  async function toggle(id) {
    try {
      await api(`/admin/users/${id}/toggle-active`, { method: "PATCH" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const rows = data?.[type] || [];

  return (
    <Shell role="admin">
      <PageTitle
        eyebrow="Administration"
        title={type === "users" ? "User Management" : "Material Monitoring"}
        text={
          type === "users"
            ? "Review and enable or disable user accounts."
            : "Read-only monitoring of uploaded learning materials."
        }
      />

      <section className="card">
        <ErrorBox message={error} />

        {!data ? (
          <Loader />
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  {type === "users" ? (
                    <>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </>
                  ) : (
                    <>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>User</th>
                      <th>AI Usage</th>
                      <th>Updated</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {rows.map((row) =>
                  type === "users" ? (
                    <tr key={row._id}>
                      <td>{row.name}</td>
                      <td>{row.email}</td>
                      <td><span className="tag">{row.role}</span></td>
                      <td>{row.active ? "Active" : "Disabled"}</td>
                      <td>
                        <button className="smallButton" onClick={() => toggle(row._id)}>
                          {row.active ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={row._id}>
                      <td>{row.title}</td>
                      <td>{row.subject}</td>
                      <td>{row.user?.email}</td>
                      <td>{row.aiUsageCount}</td>
                      <td>{new Date(row.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Shell>
  );
}

export const AdminUsers = () => <AdminTable type="users" />;
export const AdminMaterials = () => <AdminTable type="materials" />;

export function AdminReports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/reports").then(setData).catch((err) => setError(err.message));
  }, []);

  const max = Math.max(
    ...(data?.aiUsageBySubject?.map((item) => item.aiUsage) || [1]),
    1
  );

  return (
    <Shell role="admin">
      <PageTitle
        eyebrow="Analytics"
        title="Reports & Analytics"
        text="Usage visibility without changing student-generated learning resources."
      />

      <section className="card">
        <h2>AI usage by subject</h2>
        <ErrorBox message={error} />

        {!data ? (
          <Loader />
        ) : data.aiUsageBySubject.length ? (
          <div className="barList">
            {data.aiUsageBySubject.map((item, index) => (
              <div className="barRow" key={index}>
                <div>
                  <strong>{item._id || "Uncategorized"}</strong>
                  <small>
                    {item.materials} materials · {item.aiUsage} AI generations
                  </small>
                </div>
                <span className="barTrack">
                  <span style={{ width: `${(item.aiUsage / max) * 100}%` }} />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty title="No usage data yet" text="AI usage will appear here." />
        )}
      </section>
    </Shell>
  );
}

export function AdminHealth() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setData(await api("/admin/system-health"));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <Shell role="admin">
      <PageTitle
        eyebrow="Operations"
        title="System Health"
        text="Runtime visibility for database, Gemini configuration and stored resources."
        action={<button className="smallButton" onClick={load}>Refresh</button>}
      />

      <ErrorBox message={error} />

      {!data ? (
        <Loader />
      ) : (
        <div className="healthGrid">
          <div><small>Overall</small><strong className={data.status === "healthy" ? "good" : "bad"}>{data.status}</strong></div>
          <div><small>MongoDB</small><strong>{data.database}</strong></div>
          <div><small>Gemini</small><strong>{data.geminiConfigured ? "Configured" : "Missing key"}</strong></div>
          <div><small>Uptime</small><strong>{data.uptimeSeconds}s</strong></div>
          <div><small>Users</small><strong>{data.counts.users}</strong></div>
          <div><small>Vector Chunks</small><strong>{data.counts.chunks}</strong></div>
        </div>
      )}
    </Shell>
  );
}
