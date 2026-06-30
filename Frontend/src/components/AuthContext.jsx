import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../services/api";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authApi.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(credentials);
      setUser(authApi.getUser());
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.register(formData);
      setUser(authApi.getUser());
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, isLoggedIn, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
