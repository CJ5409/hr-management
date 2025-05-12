import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  TextField,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Modal,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import GaugeChart from 'react-gauge-chart';
import { io, Socket } from 'socket.io-client';
import axios, { AxiosError } from 'axios';
import { Highlight as HighlightIcon, Close as CloseIcon } from '@mui/icons-material';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, TimeScale);

interface ClockRecord {
  _id?: string;
  clockIn: string;
  clockOut: string | null;
}

interface CVSubmission {
  _id?: string;
  userEmail: string;
  fileUrl: string;
  extractedText?: string;
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

interface Employee {
  email: string;
  department: string;
}

interface LoginTrail {
  userEmail: string;
  role: string;
  timestamp: string;
  success: boolean;
  ipAddress?: string;
}

interface DashboardProps {
  userData: UserData;
  onLogout: () => void;
  updateDepartment: (newDepartment: string) => void;
  searchQuery: string;
}

interface ErrorResponse {
  errors: { msg: string }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function Dashboard({ userData, updateDepartment, searchQuery }: DashboardProps) {
  const [clockRecords, setClockRecords] = useState<ClockRecord[]>([]);
  const [cvSubmissions, setCVSubmissions] = useState<CVSubmission[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [loginTrails, setLoginTrails] = useState<LoginTrail[]>([]);
  const [recentActivity, setRecentActivity] = useState<ClockRecord[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [previewFileUrl, setPreviewFileUrl] = useState('');
  const [highlightKeywords, setHighlightKeywords] = useState<string[]>(['highest education', 'highest position', 'work experience']);

  const socket: Socket = io('http://localhost:5001');

  const token = localStorage.getItem('token');
  const axiosWithAuth = axios.create({
    baseURL: 'http://localhost:5001',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const emailToFetch = userData.role === 'manager' && selectedEmployee ? selectedEmployee : userData.email;
    axiosWithAuth.get(`/clock-records/${emailToFetch}`)
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
      axiosWithAuth.get('/employee-count')
        .then(res => setEmployeeCount(res.data.count))
        .catch((err: AxiosError) => console.error('Error fetching employee count:', err.message));
      axiosWithAuth.get('/login-trail')
        .then(res => setLoginTrails(res.data))
        .catch((err: AxiosError) => console.error('Error fetching login trails:', err.message));
    }

    if (userData.role === 'manager') {
      axiosWithAuth.get('/employees-in-department')
        .then(res => {
          setEmployees(res.data);
          if (res.data.length > 0) {
            setSelectedEmployee(res.data[0].email);
          }
        })
        .catch((err: AxiosError) => console.error('Error fetching employees:', err.message));
    }

    socket.on('dataUpdate', data => {
      const emailToMatch = userData.role === 'manager' && selectedEmployee ? selectedEmployee : userData.email;
      if (data.email === emailToMatch) {
        setClockRecords(data.clockRecords);
      }
      setRecentActivity(prev => [data.clockRecords[0], ...prev].slice(0, 5)); // Keep last 5 activities
    });

    return () => {
      socket.off('dataUpdate');
    };
  }, [userData.email, userData.role, selectedEmployee]);

  const handleClockIn = async () => {
    setErrorMessages([]);
    try {
      await axiosWithAuth.post('/clock-in', {});
      axiosWithAuth.get(`/clock-records/${userData.email}`)
        .then(res => setClockRecords(res.data));
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.errors) {
        setErrorMessages(axiosError.response.data.errors.map(err => err.msg));
      } else {
        setErrorMessages(['Clock-in failed']);
      }
    }
  };

  const handleClockOut = async () => {
    setErrorMessages([]);
    try {
      await axiosWithAuth.post('/clock-out', {});
      axiosWithAuth.get(`/clock-records/${userData.email}`)
        .then(res => setClockRecords(res.data));
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.errors) {
        setErrorMessages(axiosError.response.data.errors.map(err => err.msg));
      } else {
        setErrorMessages(['Clock-out failed']);
      }
    }
  };

  const handleCVSubmit = async () => {
    setErrorMessages([]);
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        await axiosWithAuth.post('/submit-cv', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setFile(null);
        if (userData.role === 'hr') {
          axiosWithAuth.get(`/cv-submissions/${userData.email}`)
            .then(res => setCVSubmissions(res.data));
        }
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data?.errors) {
          setErrorMessages(axiosError.response.data.errors.map(err => err.msg));
        } else {
          setErrorMessages(['CV submission failed']);
        }
      }
    } else {
      setErrorMessages(['Please select a file to upload']);
    }
  };

  const handleUpdateClock = async (id: string, clockIn: string) => {
    setErrorMessages([]);
    try {
      await axiosWithAuth.put(`/clock-record/${id}`, { clockIn });
      const emailToFetch = userData.role === 'manager' && selectedEmployee ? selectedEmployee : userData.email;
      axiosWithAuth.get(`/clock-records/${emailToFetch}`)
        .then(res => setClockRecords(res.data));
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.errors) {
        setErrorMessages(axiosError.response.data.errors.map(err => err.msg));
      } else {
        setErrorMessages(['Clock record update failed']);
      }
    }
  };

  const handleUpdateDepartment = async (email: string, dept: string) => {
    setErrorMessages([]);
    try {
      await axiosWithAuth.put(`/employee/${email}/department`, { department: dept });
      const res = await axiosWithAuth.get(`/employee/${userData.email}`);
      updateDepartment(res.data.department);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.errors) {
        setErrorMessages(axiosError.response.data.errors.map(err => err.msg));
      } else {
        setErrorMessages(['Department update failed']);
      }
    }
  };

  const handlePreviewCV = (cv: CVSubmission) => {
    setPreviewText(cv.extractedText || 'No text extracted');
    setPreviewFileUrl(cv.fileUrl);
    setPreviewOpen(true);
  };

  const highlightText = (text: string, keywords: string[]) => {
    let highlighted = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlighted = highlighted.replace(regex, '<span style="background-color: yellow">$1</span>');
    });
    return highlighted;
  };

  // Mock CV data for visualization
  const cvData = cvSubmissions.map(cv => ({
    userEmail: cv.userEmail, // Add userEmail to cvData
    education: cv.extractedText?.includes('PhD') ? 'PhD' :
               cv.extractedText?.includes('Master') ? 'Master' :
               cv.extractedText?.includes('Bachelor') ? 'Bachelor' : 'Other',
    experience: (cv.extractedText?.match(/(\d+)\s*years/i) || [0, '0'])[1],
    position: cv.extractedText?.includes('Manager') ? 'Manager' :
              cv.extractedText?.includes('Engineer') ? 'Engineer' : 'Other'
  }));

  const educationData = [
    { name: 'Bachelor', value: cvData.filter(cv => cv.education === 'Bachelor').length },
    { name: 'Master', value: cvData.filter(cv => cv.education === 'Master').length },
    { name: 'PhD', value: cvData.filter(cv => cv.education === 'PhD').length },
    { name: 'Other', value: cvData.filter(cv => cv.education === 'Other').length },
  ].filter(item => item.value > 0);

  const experienceData = cvData.map(cv => ({
    email: cv.userEmail, // Use userEmail directly from cvData
    years: parseInt(cv.experience) || 0
  })).filter(item => item.years > 0);

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

  const loginTrailChartData = {
    labels: loginTrails.map(t => new Date(t.timestamp).toLocaleString()),
    datasets: [
      {
        label: 'Login Attempts',
        data: loginTrails.map(t => t.success ? 1 : 0),
        borderColor: '#00C49F',
        fill: false,
      },
    ],
  };

  const filteredEmployees = employees.filter(emp =>
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const employeeColumns: GridColDef[] = [
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'department', headerName: 'Department', width: 150 },
  ];

  return (
    <Box>
      {errorMessages.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {errorMessages.map((msg, index) => (
            <Alert key={index} severity="error" sx={{ mb: 1 }}>
              {msg}
            </Alert>
          ))}
        </Box>
      )}
      <Grid container spacing={3}>
        {/* KPI Cards */}
        {(userData.role === 'hr' || userData.role === 'manager') && (
          <>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#1976d2', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">Total Employees</Typography>
                  <Typography variant="h4">{employeeCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#00C49F', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">Avg Hours Worked</Typography>
                  <Typography variant="h4">
                    {performance ? (performance.hoursWorked / clockRecords.length || 0).toFixed(2) : 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#FFBB28', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">On-Time Rate</Typography>
                  <Typography variant="h4">{performance?.onTimeRate || 0}%</Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Clock History or Employee Selection */}
        {userData.role === 'employee' && (
          <Grid item xs={12} md={6}>
            <Card id="clock-records">
              <CardContent>
                <Typography variant="h6">Clock History</Typography>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
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
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {userData.role === 'employee' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Submit CV</Typography>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
                <Button variant="contained" onClick={handleCVSubmit} sx={{ mt: 2 }}>
                  Submit CV
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {userData.role === 'employee' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Clock Actions</Typography>
                <Button variant="contained" onClick={handleClockIn} sx={{ mr: 2 }}>
                  Clock In
                </Button>
                <Button variant="contained" onClick={handleClockOut}>
                  Clock Out
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {userData.role === 'manager' && (
          <Grid item xs={12} md={6}>
            <Card id="employees">
              <CardContent>
                <Typography variant="h6">Employees in Your Department</Typography>
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={filteredEmployees}
                    columns={employeeColumns}
                    getRowId={row => row.email}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Real-Time Activity Feed */}
        {(userData.role === 'hr' || userData.role === 'manager') && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Recent Activity (Real-Time)</Typography>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {recentActivity.map((activity, index) => (
                    <Typography key={index}>
                      {activity.clockIn} - {activity.clockOut || 'Active'}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* CV Submissions with Preview */}
        {userData.role === 'hr' && cvSubmissions.length > 0 && (
          <Grid item xs={12} id="cv-submissions">
            <Card>
              <CardContent>
                <Typography variant="h6">CV Submissions</Typography>
                <TextField
                  label="Highlight Keywords (comma-separated)"
                  value={highlightKeywords.join(', ')}
                  onChange={e => setHighlightKeywords(e.target.value.split(',').map(k => k.trim()))}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User Email</TableCell>
                        <TableCell>Submitted At</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cvSubmissions.map(cv => (
                        <TableRow key={cv._id}>
                          <TableCell>{cv.userEmail}</TableCell>
                          <TableCell>{new Date(cv.submittedAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handlePreviewCV(cv)}>
                              <HighlightIcon />
                            </IconButton>
                            <Button href={cv.fileUrl} download>Download</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* CV Preview Modal */}
        <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            width: '80%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">CV Preview</Typography>
              <IconButton onClick={() => setPreviewOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <div dangerouslySetInnerHTML={{ __html: highlightText(previewText, highlightKeywords) }} />
            <Button href={previewFileUrl} download sx={{ mt: 2 }}>Download PDF</Button>
          </Box>
        </Modal>

        {/* Data Visualizations */}
        {userData.role === 'hr' && cvData.length > 0 && (
          <>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Education Distribution</Typography>
                  <PieChart width={400} height={300}>
                  <Pie
                        data={educationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {educationData.map((_, index) => ( // Remove 'entry' parameter
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Years of Experience</Typography>
                  <BarChart width={500} height={300} data={experienceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="email" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="years" fill="#8884d8" />
                  </BarChart>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {(userData.role === 'hr' || userData.role === 'manager') && clockRecords.length > 0 && (
          <Grid item xs={12}>
            <Card id="clock-records">
              <CardContent>
                <Typography variant="h6">Hours Worked Over Time</Typography>
                <Line data={chartData} />
              </CardContent>
            </Card>
          </Grid>
        )}

        {(userData.role === 'hr' || userData.role === 'manager') && performance && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Performance Metrics</Typography>
                <GaugeChart id="on-time-gauge" nrOfLevels={20} percent={performance.onTimeRate / 100} />
                <Typography>On-Time Rate: {performance.onTimeRate}%</Typography>
                <Typography>Hours Worked: {performance.hoursWorked}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {(userData.role === 'hr' || userData.role === 'manager') && loginTrails.length > 0 && (
          <Grid item xs={12} id="login-trail">
            <Card>
              <CardContent>
                <Typography variant="h6">Login Trail</Typography>
                <Line data={loginTrailChartData} options={{ scales: { x: { type: 'time' } } }} />
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>IP Address</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loginTrails.map(trail => (
                        <TableRow key={trail.timestamp}>
                          <TableCell>{trail.userEmail}</TableCell>
                          <TableCell>{trail.role}</TableCell>
                          <TableCell>{new Date(trail.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{trail.success ? 'Success' : 'Failed'}</TableCell>
                          <TableCell>{trail.ipAddress || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {userData.role === 'manager' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Select Employee to Manage</Typography>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Select Employee</InputLabel>
                  <Select
                    value={selectedEmployee}
                    onChange={e => setSelectedEmployee(e.target.value as string)}
                  >
                    {filteredEmployees.map(emp => (
                      <MenuItem key={emp.email} value={emp.email}>
                        {emp.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
        )}

        {userData.role === 'manager' && clockRecords.length > 0 && selectedEmployee && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Manage Clock Records for {selectedEmployee}</Typography>
                {clockRecords.map(r => (
                  <Box key={r._id} sx={{ mb: 2 }}>
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
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Update Department</Typography>
                <TextField label="Employee Email" id="dept-email" />
                <TextField label="New Department" id="dept-name" sx={{ ml: 2 }} />
                <Button
                  variant="contained"
                  onClick={() => {
                    const email = (document.getElementById('dept-email') as HTMLInputElement)?.value;
                    const dept = (document.getElementById('dept-name') as HTMLInputElement)?.value;
                    handleUpdateDepartment(email, dept);
                  }}
                  sx={{ mt: 2 }}
                >
                  Update Department
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default Dashboard;