import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClockRecords from './components/ClockRecords';
import Preferences from './components/Preferences';
import ManageCVs from './components/ManageCVs';
import Login from './components/Login';
import { User, Message } from './models/User';

const socket = io('http://localhost:5000', { autoConnect: false });

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5000/api/users/1') // Adjust ID or fetch based on token
        .then((response) => {
          setUserData(response.data);
          setIsAuthenticated(true);
          socket.connect();
          socket.emit('join', response.data.role);
        })
        .catch(() => {
          setIsAuthenticated(false);
        });
    }

    socket.on('receiveMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.disconnect();
    };
  }, []);

  const handleLogin = (email: string, password: string) => {
    axios.get('http://localhost:5000/api/users')
      .then((response) => {
        const user = response.data.find((u: any) => u.email === email && u.password === password);
        if (user) {
          setUserData(user);
          setIsAuthenticated(true);
          localStorage.setItem('token', 'dummy-token');
          socket.connect();
          socket.emit('join', user.role);
        } else {
          alert('Invalid credentials');
        }
      })
      .catch(() => {
        alert('Error logging in');
      });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    localStorage.removeItem('token');
    socket.disconnect();
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Layout userData={userData!} onLogout={handleLogout} onSearch={handleSearch} socket={socket} messages={messages}>
                <Dashboard userData={userData!} />
              </Layout>
            ) : (
              <Navigate to="/" />
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
      </Routes>
    </Router>
  );
};

export default App;