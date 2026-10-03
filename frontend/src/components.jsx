import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  Files,
  Sparkles,
  Search,
  Bot,
  CalendarDays,
  Users,
  BarChart3,
  Activity,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "./auth";

const studentLinks = [
  ["/student", "Dashboard", LayoutDashboard],
  ["/student/materials", "Materials", Files],
  ["/student/ai-tools", "AI Tools", Sparkles],
  ["/student/search", "Search", Search],
  ["/student/study-plan", "Study Plan", CalendarDays]
];

const adminLinks = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/users", "Users", Users],
  ["/admin/materials", "Materials", Files],
  ["/admin/reports", "Reports", BarChart3],
  ["/admin/health", "System Health", Activity]
];

export function Shell({ role, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <div className="app">
      <header className="topnav">
        <NavLink to={role === "admin" ? "/admin" : "/student"} className="logo">
          <span className="logoMark"><BookOpen size={17} /></span>
          <span>AI StudyBuddy</span>
        </NavLink>

        <nav className="navlinks">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === "/student" || to === "/admin"}>
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="navUser">
          <div className="avatar">{user?.name?.[0] || "U"}</div>
          <div className="navUserText">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <button
            className="iconButton"
            title="Sign out"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="content">{children}</main>

      {role === "student" && (
        <button
          className="floatingAssistant"
          onClick={() => navigate("/student/assistant")}
          title="Open Study Assistant"
        >
          <Bot size={22} />
        </button>
      )}
    </div>
  );
}

export function PageTitle({ eyebrow, title, text, action }) {
  return (
    <div className="pageTitle">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="statCard">
      <span className="statIcon" aria-hidden="true">
        {Icon && (
          <Icon
            size={22}
            strokeWidth={2.1}
            absoluteStrokeWidth
          />
        )}
      </span>

      <div className="statContent">
        <small>{label}</small>
        <strong>{value ?? 0}</strong>
        <span>{detail}</span>
      </div>
    </div>
  );
}

export function Empty({ title, text }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export function ErrorBox({ message }) {
  return message ? <div className="errorBox">{message}</div> : null;
}

export function Loader() {
  return (
    <div className="loaderWrap">
      <span className="loader" />
      Loading...
    </div>
  );
}

export function RoleBadge({ role }) {
  return (
    <span className="roleBadge">
      <ShieldCheck size={13} />
      {role}
    </span>
  );
}
