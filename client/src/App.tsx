import { useState } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import axios, { AxiosError } from 'axios';
import Dashboard from './Dashboard';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const handleLogin = async () => {
    setErrorMessages([]); // Clear previous errors
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

  if (!userData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4">HR Management Login</Typography>
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
          sx={{ mt: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          sx={{ mt: 2, ml: 2 }}
        />
        <TextField
          label="Role (employee/hr/manager)"
          value={role}
          onChange={e => setRole(e.target.value)}
          sx={{ mt: 2, ml: 2 }}
        />
        <Button variant="contained" onClick={handleLogin} sx={{ mt: 2, ml: 2 }}>
          Login
        </Button>
      </Box>
    );
  }

  return <Dashboard userData={userData} onLogout={handleLogout} updateDepartment={updateDepartment} />;
}

export default App;