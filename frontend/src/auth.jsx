import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("studybuddy_user"));
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(Boolean(localStorage.getItem("studybuddy_token")));

  useEffect(() => {
    const token = localStorage.getItem("studybuddy_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api("/auth/me")
      .then((data) => {
        setUser(data.user);
        localStorage.setItem("studybuddy_user", JSON.stringify(data.user));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    localStorage.setItem("studybuddy_token", data.token);
    localStorage.setItem("studybuddy_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    localStorage.setItem("studybuddy_token", data.token);
    localStorage.setItem("studybuddy_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("studybuddy_token");
    localStorage.removeItem("studybuddy_user");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
