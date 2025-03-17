import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
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
            </Grid>
          )}
        </Box>
      );
    }

export default Dashboard;