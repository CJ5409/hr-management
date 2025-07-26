import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SalesDashboard from './components/SalesDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import ClockRecords from './components/ClockRecords';
import Preferences from './components/Preferences';
import ManageCVs from './components/ManageCVs';
import LoginRegister from './components/LoginRegister';
import JobBoard from './components/JobBoard';
import JobDetail from './components/JobDetail';
import JobApplication from './components/JobApplication';
import JobseekerDashboard from './components/JobseekerDashboard';
import { User, Message } from './models/User';

const socket = io('http://localhost:5001', { autoConnect: false });

const getDashboardRoute = (role: string) => {
  const lowerRole = role.toLowerCase();
  if (lowerRole === 'jobseeker') return '/jobseeker-dashboard';
  return `/${lowerRole}-dashboard`;
};

const AppRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);
  const [roleChangeNotification, setRoleChangeNotification] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Only check for existing authentication, do NOT clear it
    const token = localStorage.getItem('token');
    const savedUserData = localStorage.getItem('userData');
    if (token && savedUserData) {
      try {
        const user = JSON.parse(savedUserData);
        setUserData(user);
        setIsAuthenticated(true);
        socket.connect();
        socket.emit('join', user.role);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
    socket.on('receiveMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });
    socket.on('roleChanged', ({ newRole }) => {
      setRoleChangeNotification(`Your account has been upgraded. You are now onboarded as ${newRole}. Redirecting to your new dashboard...`);
      setTimeout(() => {
        setRoleChangeNotification(null);
        setUserData((prev) => prev ? { ...prev, role: newRole } : prev);
        navigate(getDashboardRoute(newRole));
      }, 2000);
    });
    return () => {
      socket.off('receiveMessage');
      socket.off('roleChanged');
      socket.disconnect();
    };
  }, []); // Only run once on mount

  // Update handleLogin to accept (user, token)
  const handleLogin = (user: any, token: string) => {
    setUserData(user);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(user));
    socket.connect();
    socket.emit('join', user.role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    socket.disconnect();
    setShouldRedirectToLogin(true);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  // Add navigation effect after state update
  // TEMPORARILY DISABLED FOR DEMO - prevents redirect loop
  /*
  useEffect(() => {
    if (isAuthenticated && userData && !hasInitialRedirect) {
      setHasInitialRedirect(true);
      navigate(getDashboardRoute(userData.role));
    }
  }, [isAuthenticated, userData, navigate, hasInitialRedirect]);
  */

  return (
    <>
      {roleChangeNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {roleChangeNotification}
        </div>
      )}
      {shouldRedirectToLogin && <Navigate to="/" replace />}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <LoginRegister onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated && userData ? (
              <Navigate to={getDashboardRoute(userData.role)} replace />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/jobseeker-dashboard"
          element={
            isAuthenticated && userData?.role.toLowerCase() === 'jobseeker' ? (
              <JobseekerDashboard userData={userData} messages={messages} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/hr-dashboard"
          element={
            isAuthenticated && userData?.role.toLowerCase() === 'hr' ? (
              <Dashboard userData={userData} onLogout={handleLogout} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/sales-dashboard"
          element={
            isAuthenticated && userData?.role.toLowerCase() === 'sales' ? (
              <SalesDashboard userData={userData} onLogout={handleLogout} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/manager-dashboard"
          element={
            isAuthenticated && userData?.role.toLowerCase() === 'manager' ? (
              <ManagerDashboard userData={userData} onLogout={handleLogout} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated && userData?.role.toLowerCase() === 'admin' ? (
              <AdminDashboard userData={userData} onLogout={handleLogout} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/clock-records"
          element={
            isAuthenticated ? (
              <Layout userData={userData!} onLogout={handleLogout} onSearch={handleSearch} socket={socket} messages={messages}>
                <ClockRecords />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/preferences"
          element={
            isAuthenticated ? (
              <Layout userData={userData!} onLogout={handleLogout} onSearch={handleSearch} socket={socket} messages={messages}>
                <Preferences />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/manage-cvs"
          element={
            isAuthenticated ? (
              <Layout userData={userData!} onLogout={handleLogout} onSearch={handleSearch} socket={socket} messages={messages}>
                <ManageCVs />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/jobs" element={<JobBoard />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/apply/:jobId" element={<JobApplication />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes; 