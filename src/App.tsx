import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Tree from "./pages/Tree";
import CalendarPage from "./pages/Calendar";
import Settings from "./pages/Settings";
import AuthPage from "./pages/Auth";
import Announcements from "./pages/Announcements";
import DeathAnniversaries from "./pages/DeathAnniversaries";
import Archives from "./pages/Archives";

// Simple Auth Context mock
export const AuthContext = React.createContext<{
  user: { role: "admin" | "member" } | null;
  login: (role: "admin" | "member") => void;
  logout: () => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
});

function App() {
  const [user, setUser] = useState<{ role: "admin" | "member" } | null>(null);

  const login = (role: "admin" | "member") => setUser({ role });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route
            path="/"
            element={user ? <AppLayout /> : <Navigate to="/auth" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="tree" element={<Tree />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="death-anniversaries" element={<DeathAnniversaries />} />
            <Route path="archives" element={<Archives />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <Toaster position="top-right" expand={true} richColors />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;