import React, { useState } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';

const App = () => {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
  };

  // Route based on role
  if (user.role === 'ADMIN') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  } else {
    return <EmployeeDashboard user={user} onLogout={handleLogout} />;
  }
};

export default App;
