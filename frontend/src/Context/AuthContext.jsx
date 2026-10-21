import { useCallback, useEffect, useState } from "react";
import { getCurrentUser, logout as logoutRequest } from "../services/authApi";
import AuthContext from "./authContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshUser = useCallback(async () => {
    try {
      setError("");
      const response = await getCurrentUser();
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      if (err.response?.status === 401) setUser(null);
      else setError(err.response?.data?.message || "Unable to load dashboard");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refreshUser);
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
      setUser(null);
      setError("");
      return true;
    } catch {
      setError("Unable to logout");
      return false;
    }
  }, []);

  const connectGitHub = useCallback(() => {
    window.location.href = "/api/v1/auth/github";
  }, []);

  return <AuthContext.Provider value={{ user, loading, error, setError, refreshUser, logout, connectGitHub }}>{children}</AuthContext.Provider>;
}
