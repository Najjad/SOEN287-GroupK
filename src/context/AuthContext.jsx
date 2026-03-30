import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) return false;

      setUser({ email: data.email, role: data.role, userId: data.userId });
      localStorage.setItem("user", JSON.stringify(data));

      return true;

    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (!res.ok) return false;

      setUser({ email: data.email || userData.email, role: data.role || userData.role, userId: data.userId });
      localStorage.setItem("user", JSON.stringify(data));

      return true;

    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}