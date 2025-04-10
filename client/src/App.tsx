import { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import axios, { AxiosError } from 'axios';
import Dashboard from './Dashboard';

interface UserData {
  token: string;
  role: string;
  email: string;
  department: string; // Add department
}

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5001/login', { email, password, role });
      localStorage.setItem('token', res.data.token);
      setUserData(res.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      console.error('Login failed:', axiosError.response?.data || axiosError.message);
      alert(axiosError.response?.data?.error || 'Login failed');
      setUserData(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserData(null);
  };

  if (!userData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4">HR Management Login</Typography>
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

  return <Dashboard userData={userData} onLogout={handleLogout} />;
}

export default App;