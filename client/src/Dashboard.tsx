import { Card, CardContent, Typography, Grid, Box, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import axios, {isCancel, AxiosError} from 'axios';
import React from 'react';


function Dashboard({ userData }: { userData: any }) {
    const [clockRecords, setClockRecords] = useState<any[]>([]);
  useEffect(() => {
    axios.get(`http://localhost:5001/clock-records/${userData.email}`).then(res => setClockRecords(res.data));
  }, [userData.email]);
    
    const handleClockIn = async () => { await axios.post('http://localhost:5001/clock-in', { email: userData.email }); };
    const handleClockOut = async () => { await axios.post('http://localhost:5001/clock-out', { email: userData.email }); };

    const [file, setFile] = useState<File | null>(null);
const handleCVSubmit = async () => {
  if (file) {
    await axios.post('http://localhost:5001/submit-cv', { email: userData.email, file: file.name });
    setFile(null);
  }

  const [cvSubmissions, setCVSubmissions] = useState<any[]>([]);
  useEffect(() => {
    axios.get(`http://localhost:5001/cv-submissions/${userData.email}`).then(res => setCVSubmissions(res.data));
  }, [userData.email]);
  // ... in return ...
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

  const [performance, setPerformance] = useState<any>(null);
useEffect(() => {
  axios.get(`http://localhost:5001/performance/${userData.email}`).then(res => setPerformance(res.data));
}, [userData.email]);
// ... in return ...
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

};




    return (
        <Box sx={{ p: 4 }}>
          <Typography variant="h4">Welcome, {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</Typography>
          <Grid container spacing={2} mt={2}>
            <Grid item>
              <Card>
                <CardContent>
                  <Typography variant="h6">Department</Typography>
                  <Typography variant="h4">{userData.department || 'Unassigned'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item>
              <Card>
                <CardContent>
                  <Typography variant="h6">Clock History</Typography>
                  {clockRecords.map((r, i) => (
                    <Typography key={i}>{r.clockIn} - {r.clockOut || 'Active'}</Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      );
    }

export default Dashboard;