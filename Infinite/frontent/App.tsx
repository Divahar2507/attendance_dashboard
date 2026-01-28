
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User, UserRole, AuthState } from './types';
import Login from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import AllTickets from './components/AllTickets';
import TeamManagement from './components/TeamManagement';
import ProjectBoards from './components/ProjectBoards';
import SystemSettings from './components/SystemSettings';
import {
  LogOut,
  Ticket as TicketIcon,
  Users,
  LayoutDashboard,
  Briefcase,
  Layers,
  Settings
} from 'lucide-react';

const SidebarLink: React.FC<{ to: string, icon: any, label: string }> = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to || (to === '/dashboard' && location.pathname === '/');

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('tms_auth');
    return saved ? JSON.parse(saved) : { user: null, token: null, refreshToken: null };
  });

  const handleLogin = (user: User, token: string, refreshToken: string) => {
    const newState = { user, token, refreshToken };
    setAuth(newState);
    localStorage.setItem('tms_auth', JSON.stringify(newState));
  };

  const handleLogout = async () => {
    if (auth.token) {
      try {
        await fetch('http://localhost:5000/api/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${auth.token}` }
        });
      } catch (err) {
        console.error("Logout error", err);
      }
    }
    setAuth({ user: null, token: null, refreshToken: null });
    localStorage.removeItem('tms_auth');
  };

  // Periodic Refresh Logic
  React.useEffect(() => {
    if (!auth.refreshToken) return;

    const refresh = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: auth.refreshToken })
        });

        if (response.ok) {
          const data = await response.json();
          const newState = { ...auth, token: data.token };
          setAuth(newState);
          localStorage.setItem('tms_auth', JSON.stringify(newState));
        } else {
          handleLogout();
        }
      } catch (err) {
        console.error("Refresh error", err);
      }
    };

    // Refresh every 14 minutes (token expires in 15m)
    const interval = setInterval(refresh, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, [auth.refreshToken, auth.token]); // Dependency on token to ensure logic runs after manual token updates if any


  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex">
        {auth.user && (
          <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 shadow-sm z-40">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
                  <TicketIcon className="text-white w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Infinite<span className="text-indigo-600">TMS</span>
                </h1>
              </div>

              <nav className="space-y-1">
                <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Overview" />
                <SidebarLink to="/tickets" icon={Layers} label="All Tickets" />
                {(auth.user.role === UserRole.ADMIN || auth.user.role === UserRole.TEAM_LEAD) && (
                  <SidebarLink to="/users" icon={Users} label="Team Management" />
                )}
                <SidebarLink to="/projects" icon={Briefcase} label="Project Boards" />
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <SidebarLink to="/settings" icon={Settings} label="System Settings" />
                </div>
              </nav>
            </div>

            <div className="mt-auto p-6 border-t border-slate-100 bg-slate-50/30">
              <div className="flex items-center gap-3 px-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                  {auth.user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">{auth.user.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{auth.user.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium text-sm border border-transparent hover:border-red-100"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route
              path="/login"
              element={auth.user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/dashboard"
              element={
                auth.user ? (
                  (auth.user.role === UserRole.ADMIN || auth.user.role === UserRole.TEAM_LEAD) ? <AdminDashboard /> : <UserDashboard user={auth.user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/tickets"
              element={auth.user ? <AllTickets /> : <Navigate to="/login" />}
            />
            <Route
              path="/users"
              element={auth.user && (auth.user.role === UserRole.ADMIN || auth.user.role === UserRole.TEAM_LEAD) ? <TeamManagement /> : <Navigate to="/login" />}
            />
            <Route
              path="/projects"
              element={auth.user ? <ProjectBoards /> : <Navigate to="/login" />}
            />
            <Route
              path="/settings"
              element={auth.user ? <SystemSettings /> : <Navigate to="/login" />}
            />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
