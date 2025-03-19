import { Card, CardContent, Typography, Grid, Box, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import axios, {isCancel, AxiosError} from 'axios';
import React from 'react';


function Dashboard({ userData }: { userData: any }) {

    const handleClockIn = async () => { await axios.post('http://localhost:5001/clock-in', { email: userData.email }); };
    const handleClockOut = async () => { await axios.post('http://localhost:5001/clock-out', { email: userData.email }); };
    
    const [clockRecords, setClockRecords] = useState<any[]>([]);
    useEffect(() => {
      axios.get(`http://localhost:5001/clock-records/${userData.email}`).then(res => setClockRecords(res.data));
    }, [userData.email]);

    const [file, setFile] = useState<File | null>(null);
    const handleCVSubmit = async () => {
      if (file) {
        await axios.post('http://localhost:5001/submit-cv', { email: userData.email, file: file.name });
        setFile(null);
      }
    };


    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4">Welcome, {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</Typography>
        <Grid container spacing={2} mt={2}>
          <Grid item><Card><CardContent><Typography variant="h6">Department</Typography><Typography variant="h4">{userData.department}</Typography></CardContent></Card></Grid>
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
              {clockRecords.map((r, i) => (
                <Typography key={i}>{r.clockIn} - {r.clockOut || 'Active'}</Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
      )}
      </Box>
    );
  }

export default Dashboard;