import { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  token: string | null;
  user: any | null;
  isAdmin: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>(null as any);

const checkIsAdmin = (user: any): boolean => {
  if (!user || !user.email) return false;
  return user.email === "admin@example.com" || user.email.endsWith("@admin.com");
};

export const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<any | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const storedUser = localStorage.getItem("user");
    const u = storedUser ? JSON.parse(storedUser) : null;
    return checkIsAdmin(u);
  });

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setIsAdmin(checkIsAdmin(user));
    } else {
      localStorage.removeItem("user");
      setIsAdmin(false);
    }
  }, [user]);

  const login = (token: string, userFromBackend: any) => {
    setToken(token);
    setUser(userFromBackend);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);