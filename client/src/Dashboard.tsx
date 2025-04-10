import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, Button, TextField } from '@mui/material';
import axios, { AxiosError } from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
import GaugeChart from 'react-gauge-chart';
import { io, Socket } from 'socket.io-client';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale);

// Define interfaces for TypeScript
interface ClockRecord {
  _id?: string;
  clockIn: string;
  clockOut: string | null;
}

interface CVSubmission {
  _id?: string;
  userEmail: string;
  fileUrl: string;
  aiReport: string;
  submittedAt: string;
}

interface Performance {
  userEmail: string;
  onTimeRate: number;
  hoursWorked: number;
}

interface UserData {
  email: string;
  role: string;
  department: string;
  departmentHistory?: { department: string; startDate: string; endDate?: string }[];
}

interface DashboardProps {
  userData: UserData;
  onLogout: () => void; // Add onLogout prop
}

function Dashboard({ userData, onLogout }: DashboardProps) {
  const [clockRecords, setClockRecords] = useState<ClockRecord[]>([]);
  const [cvSubmissions, setCVSubmissions] = useState<CVSubmission[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [employeeCount, setEmployeeCount] = useState<number>(0);

  const socket: Socket = io('http://localhost:5001');

  const token = localStorage.getItem('token');
  const axiosWithAuth = axios.create({
    baseURL: 'http://localhost:5001',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    axiosWithAuth.get(`/clock-records/${userData.email}`)
      .then(res => setClockRecords(res.data))
      .catch((err: AxiosError) => console.error('Error fetching clock records:', err.message));

    if (userData.role === 'hr') {
      axiosWithAuth.get(`/cv-submissions/${userData.email}`)
        .then(res => setCVSubmissions(res.data))
        .catch((err: AxiosError) => console.error('Error fetching CV submissions:', err.message));
    }

    if (userData.role === 'hr' || userData.role === 'manager') {
      axiosWithAuth.get(`/performance/${userData.email}`)
        .then(res => setPerformance(res.data))
        .catch((err: AxiosError) => console.error('Error fetching performance:', err.message));
    }

    if (userData.role === 'hr' || userData.role === 'manager') {
      axiosWithAuth.get('/employee-count')
        .then(res => setEmployeeCount(res.data.count))
        .catch((err: AxiosError) => console.error('Error fetching employee count:', err.message));
    }

    socket.on('dataUpdate', data => {
      if (data.email === userData.email) {
        setClockRecords(data.clockRecords);
      }
    });

    return () => {
      socket.off('dataUpdate');
    };
  }, [userData.email]);

  const handleClockIn = async () => {
    try {
      await axiosWithAuth.post('/clock-in', {});
      axiosWithAuth.get(`/clock-records/${userData.email}`)
        .then(res => setClockRecords(res.data));
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Clock-in failed:', axiosError.message);
    }
  };

  const handleClockOut = async () => {
    try {
      await axiosWithAuth.post('/clock-out', {});
      axiosWithAuth.get(`/clock-records/${userData.email}`)
        .then(res => setClockRecords(res.data));
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Clock-out failed:', axiosError.message);
    }
  };

  const handleCVSubmit = async () => {
    if (file) {
      try {
        await axiosWithAuth.post('/submit-cv', { file: file.name });
        setFile(null);
        if (userData.role === 'hr') {
          axiosWithAuth.get(`/cv-submissions/${userData.email}`)
            .then(res => setCVSubmissions(res.data));
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('CV submission failed:', axiosError.message);
      }
    }
  };

  const handleUpdateClock = async (id: string, clockIn: string) => {
    try {
      await axiosWithAuth.put(`/clock-record/${id}`, { clockIn });
      axiosWithAuth.get(`/clock-records/${userData.email}`)
        .then(res => setClockRecords(res.data));
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Clock record update failed:', axiosError.message);
    }
  };

  const handleUpdateDepartment = async (email: string, dept: string) => {
    try {
      await axiosWithAuth.put(`/employee/${email}/department`, { department: dept });
      axiosWithAuth.get(`/employee/${userData.email}`)
        .then(res => userData.department = res.data.department);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Department update failed:', axiosError.message);
    }
  };

  const chartData = {
    labels: clockRecords.map(r => new Date(r.clockIn).toLocaleDateString()),
    datasets: [
      {
        label: 'Hours Worked',
        data: clockRecords.map(r => {
          const clockInDate = new Date(r.clockIn);
          const clockOutDate = r.clockOut ? new Date(r.clockOut) : null;
          return clockOutDate ? (clockOutDate.getTime() - clockInDate.getTime()) / 3600000 : 0;
        }),
        borderColor: '#3f51b5',
      },
    ],
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Welcome, {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
        </Typography>
        <Button variant="contained" color="secondary" onClick={onLogout}>
          Logout
        </Button>
      </Box>
      <Grid container spacing={2} mt={2}>
        <Grid item>
          <Card>
            <CardContent>
              <Typography variant="h6">Department</Typography>
              <Typography variant="h4">{userData.department || 'Unassigned'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {userData.role === 'employee' && (
          <Grid item>
            <Button variant="contained" onClick={handleClockIn}>Clock In</Button>
            <Button variant="contained" onClick={handleClockOut} sx={{ ml: 2 }}>Clock Out</Button>
          </Grid>
        )}

        {userData.role === 'employee' && (
          <Grid item>
            <Card>
              <CardContent>
                <Typography variant="h6">Clock History</Typography>
                {clockRecords.map((r, i) => {
                  const clockInDate = new Date(r.clockIn);
                  const clockOutDate = r.clockOut ? new Date(r.clockOut) : null;
                  const hoursWorked: number = clockOutDate ? (clockOutDate.getTime() - clockInDate.getTime()) / 3600000 : 0;
                  return (
                    <Typography key={i}>
                      {clockInDate.toLocaleString()} - {clockOutDate ? clockOutDate.toLocaleString() : 'Active'} ({hoursWorked.toFixed(2)} hours)
                    </Typography>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>
        )}

        {userData.role === 'employee' && (
          <Grid item>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            <Button variant="contained" onClick={handleCVSubmit}>Submit CV</Button>
          </Grid>
        )}

        {userData.role === 'hr' && cvSubmissions.length > 0 && (
          <Grid item>
            <Card>
              <CardContent>
                <Typography variant="h6">Latest CV Report</Typography>
                <Typography>{cvSubmissions[0].aiReport || 'Processing...'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {(userData.role === 'hr' || userData.role === 'manager') && performance && (
          <Grid item>
            <Card>
              <CardContent>
                <Typography variant="h6">Performance</Typography>
                <Typography>On-Time Rate: {performance.onTimeRate}%</Typography>
                <Typography>Hours Worked: {performance.hoursWorked}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {(userData.role === 'hr' || userData.role === 'manager') && clockRecords.length > 0 && (
          <Grid item>
            <Line data={chartData} />
          </Grid>
        )}

        {(userData.role === 'hr' || userData.role === 'manager') && performance && (
          <Grid item>
            <GaugeChart id="on-time-gauge" nrOfLevels={20} percent={performance.onTimeRate / 100} />
          </Grid>
        )}

        {userData.role === 'manager' && clockRecords.length > 0 && (
          <Grid item>
            <Card>
              <CardContent>
                <Typography variant="h6">Manage Clock Records</Typography>
                {clockRecords.map(r => (
                  <Box key={r._id}>
                    <Typography>{r.clockIn} - {r.clockOut || 'Active'}</Typography>
                    <TextField
                      defaultValue={r.clockIn}
                      onBlur={e => handleUpdateClock(r._id!, e.target.value)}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}

        {userData.role === 'manager' && (
          <Grid item>
            <TextField label="Employee Email" id="dept-email" />
            <TextField label="New Department" id="dept-name" />
            <Button
              onClick={() => {
                const email = (document.getElementById('dept-email') as HTMLInputElement)?.value;
                const dept = (document.getElementById('dept-name') as HTMLInputElement)?.value;
                handleUpdateDepartment(email, dept);
              }}
            >
              Update Department
            </Button>
          </Grid>
        )}

        {(userData.role === 'hr' || userData.role === 'manager') && (
          <Grid item>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Employees</Typography>
                <Typography variant="h4">{employeeCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default Dashboard;