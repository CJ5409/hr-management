import { Card, CardContent, Typography, Grid, Box } from '@mui/material';

function Dashboard({ userData }: { userData: any }) {
    const handleClockIn = async () => { await axios.post('http://localhost:5000/clock-in', { email: userData.email }); };
    const handleClockOut = async () => { await axios.post('http://localhost:5000/clock-out', { email: userData.email }); };
    return (
      <Box sx={{ p: 4 }}>
        {/* Existing content */}
        {userData.role === 'employee' && (
          <Grid item>
            <Button variant="contained" onClick={handleClockIn}>Clock In</Button>
            <Button variant="contained" onClick={handleClockOut} sx={{ ml: 2 }}>Clock Out</Button>
          </Grid>
        )}
      </Box>
    );
  }

export default Dashboard;