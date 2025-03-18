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
};


    return (
        <Box sx={{ p: 4 }}>
          {/* Existing content */}
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

            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            <Button variant="contained" onClick={handleCVSubmit}>Submit CV</Button>
            </Grid>
          )}
        </Box>
      );
    }

export default Dashboard;