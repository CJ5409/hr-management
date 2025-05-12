import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Alert, TextField, Button, Typography } from '@mui/material';
import axios, { AxiosError } from 'axios';
import Dashboard from './Dashboard';
import Layout from './Layout';

interface UserData {
  token: string;
  role: string;
  email: string;
  department: string;
}

interface ErrorResponse {
  errors: { msg: string }[];
}

function App() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = async (email: string, password: string, role: string) => {
    setErrorMessages([]);
    try {
      const res = await axios.post('http://localhost:5001/login', { email, password, role });
      localStorage.setItem('token', res.data.token);
      setUserData(res.data);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.errors) {
        setErrorMessages(axiosError.response.data.errors.map(err => err.msg));
      } else {
        setErrorMessages(['Login failed']);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserData(null);
  };

  const updateDepartment = (newDepartment: string) => {
    if (userData) {
      setUserData({ ...userData, department: newDepartment });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (!userData) {
    return <LoginForm onLogin={handleLogin} errorMessages={errorMessages} />;
  }

  return (
    <Router>
      <Layout userData={userData} onLogout={handleLogout} onSearch={handleSearch}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <Dashboard
                userData={userData}
                onLogout={handleLogout}
                updateDepartment={updateDepartment}
                searchQuery={searchQuery}
              />
            }
          />
          <Route
            path="/clock-records"
            element={
              <Dashboard
                userData={userData}
                onLogout={handleLogout}
                updateDepartment={updateDepartment}
                searchQuery={searchQuery}
              />
            }
          />
          <Route path="/preferences" element={<Box />} /> {/* Placeholder for preferences route */}
          <Route
            path="/"
            element={
              <Dashboard
                userData={userData}
                onLogout={handleLogout}
                updateDepartment={updateDepartment}
                searchQuery={searchQuery}
              />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

interface LoginFormProps {
  onLogin: (email: string, password: string, role: string) => void;
  errorMessages: string[];
}

function LoginForm({ onLogin, errorMessages }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = () => {
    onLogin(email, password, role);
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center', maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>HR Management Login</Typography>
      {errorMessages.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {errorMessages.map((msg, index) => (
            <Alert key={index} severity="error" sx={{ mb: 1 }}>
              {msg}
            </Alert>
          ))}
        </Box>
      )}
      <TextField
        label="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        fullWidth
        sx={{ mt: 2 }}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        fullWidth
        sx={{ mt: 2 }}
      />
      <TextField
        label="Role (employee/hr/manager)"
        value={role}
        onChange={e => setRole(e.target.value)}
        fullWidth
        sx={{ mt: 2 }}
      />
      <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }} fullWidth>
        Login
      </Button>
    </Box>
  );
}

export default App;