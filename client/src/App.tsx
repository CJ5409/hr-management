import { useState } from 'react';
import { Button, TextField, MenuItem, Select, Box } from '@mui/material';
import axios from 'axios';
import Dashboard from './Dashboard';
import React from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const handleLogin = async () => {
    try {
      const { data } = await axios.post('http://localhost:5001/login', { email, role });
      const employeeResponse = await axios.get(`http://localhost:5001/employee/${data.email}`);
      setUserData({ ...data, ...employeeResponse.data });
      setLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Check server and try again.');
    }
  };

  if (loggedIn) return <Dashboard userData={userData} />;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, margin: 'auto', mt: 10 }}>
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Select value={role} onChange={(e) => setRole(e.target.value)}>
        <MenuItem value="employee">Employee</MenuItem>
        <MenuItem value="hr">HR</MenuItem>
        <MenuItem value="manager">Manager</MenuItem>
      </Select>
      <Button variant="contained" onClick={handleLogin}>Login</Button>
    </Box>
  );
}

export default App;