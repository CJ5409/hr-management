import { useState, useEffect, SetStateAction } from 'react';
import { Card, CardContent, Typography, Grid, Box, Button, TextField } from '@mui/material';
import axios from 'axios'; // Removed unused imports: isCancel, AxiosError
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

function Dashboard({ userData }: { userData: UserData }) {
  // State for clock records, CV submissions, performance, and file uploads
  const [clockRecords, setClockRecords] = useState<ClockRecord[]>([]);
  const [cvSubmissions, setCVSubmissions] = useState<CVSubmission[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [employeeCount, setEmployeeCount] = useState<number>(0);

  // WebSocket setup for real-time updates
  const socket: Socket = io('http://localhost:5001');

  // Fetch initial data
  useEffect(() => {
    // Fetch clock records
    axios.get(`http://localhost:5001/clock-records/${userData.email}`)
      .then(res => setClockRecords(res.data))
      .catch(err => console.error('Error fetching clock records:', err));

    // Fetch CV submissions (for HR)
    if (userData.role === 'hr') {
      axios.get(`http://localhost:5001/cv-submissions/${userData.email}`)
        .then(res => setCVSubmissions(res.data))
        .catch(err => console.error('Error fetching CV submissions:', err));
    }

    // Fetch performance data (for HR/Manager)
    if (userData.role === 'hr' || userData.role === 'manager') {
      axios.get(`http://localhost:5001/performance/${userData.email}`)
        .then(res => setPerformance(res.data))
        .catch(err => console.error('Error fetching performance:', err));
    }

    // Fetch employee count (for HR/Manager)
    if (userData.role === 'hr' || userData.role === 'manager') {
      axios.get('http://localhost:5001/employee-count')
        .then(res => setEmployeeCount(res.data.count))
        .catch(err => console.error('Error fetching employee count:', err));
    }

    // WebSocket listener for real-time updates
    socket.on('dataUpdate', (data: { email: string; clockRecords: SetStateAction<ClockRecord[]>; }) => {
      if (data.email === userData.email) {
        setClockRecords(data.clockRecords);
      }
    });

    // Cleanup WebSocket listener on unmount
    return () => {
      socket.off('dataUpdate');
    };
  }, [userData.email]);

  // Clock-in/out handlers
  const handleClockIn = async () => {
    try {
      await axios.post('http://localhost:5001/clock-in', { email: userData.email });
      axios.get(`http://localhost:5001/clock-records/${userData.email}`)
        .then(res => setClockRecords(res.data));
    } catch (error) {
      console.error('Clock-in failed:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await axios.post('http://localhost:5001/clock-out', { email: userData.email });
      axios.get(`http://localhost:5001/clock-records/${userData.email}`)
        .then(res => setClockRecords(res.data));
    } catch (error) {
      console.error('Clock-out failed:', error);
    }
  };

  // CV submission handler
  const handleCVSubmit = async () => {
    if (file) {
      try {
        await axios.post('http://localhost:5001/submit-cv', { email: userData.email, file: file.name });
        setFile(null);
        if (userData.role === 'hr') {
          axios.get(`http://localhost:5001/cv-submissions/${userData.email}`)
            .then(res => setCVSubmissions(res.data));
        }
      } catch (error) {
        console.error('CV submission failed:', error);
      }
    }
  };

  // Manager: Update clock record
  const handleUpdateClock = async (id: string, clockIn: string) => {
    try {
      await axios.put(`http://localhost:5001/clock-record/${id}`, { clockIn });
      axios.get(`http://localhost:5001/clock-records/${userData.email}`)
        .then(res => setClockRecords(res.data));
    } catch (error) {
      console.error('Clock record update failed:', error);
    }
  };

  // Manager: Update department
  const handleUpdateDepartment = async (email: string, dept: string) => {
    try {
      await axios.put(`http://localhost:5001/employee/${email}/department`, { department: dept });
      axios.get(`http://localhost:5001/employee/${userData.email}`)
        .then(res => userData.department = res.data.department);
    } catch (error) {
      console.error('Department update failed:', error);
    }
  };

  // Line chart data for hours worked (Fixed TypeScript error with .getTime())
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
      <Typography variant="h4">
        Welcome, {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
      </Typography>
      <Grid container spacing={2} mt={2}>
        {/* Department Card */}
        <Grid item>
          <Card>
            <CardContent>
              <Typography variant="h6">Department</Typography>
              <Typography variant="h4">{userData.department || 'Unassigned'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Clock-In/Out Buttons (Employee) */}
        {userData.role === 'employee' && (
          <Grid item>
            <Button variant="contained" onClick={handleClockIn}>Clock In</Button>
            <Button variant="contained" onClick={handleClockOut} sx={{ ml: 2 }}>Clock Out</Button>
          </Grid>
        )}

        {/* Clock History (Employee) */}
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

        {/* CV Submission (Employee) */}
        {userData.role === 'employee' && (
          <Grid item>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            <Button variant="contained" onClick={handleCVSubmit}>Submit CV</Button>
          </Grid>
        )}

        {/* CV Report (HR) */}
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

        {/* Performance Stats (HR/Manager) */}
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

        {/* Line Chart for Hours Worked (HR/Manager) */}
        {(userData.role === 'hr' || userData.role === 'manager') && clockRecords.length > 0 && (
          <Grid item>
            <Line data={chartData} />
          </Grid>
        )}

        {/* On-Time Rate Gauge (HR/Manager) */}
        {(userData.role === 'hr' || userData.role === 'manager') && performance && (
          <Grid item>
            <GaugeChart id="on-time-gauge" nrOfLevels={20} percent={performance.onTimeRate / 100} />
          </Grid>
        )}

        {/* Manage Clock Records (Manager) */}
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

        {/* Update Department (Manager) */}
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

        {/* Dynamic Employee Count Card (HR/Manager) */}
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