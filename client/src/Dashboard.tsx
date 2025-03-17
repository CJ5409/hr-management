import { Card, CardContent, Typography, Grid, Box } from '@mui/material';

function Dashboard({ userData }: { userData: any }) {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Welcome, {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</Typography>
      <Grid container spacing={2} mt={2}>
        <Grid item><Card><CardContent><Typography variant="h6">Department</Typography><Typography variant="h4">{userData.department}</Typography></CardContent></Card></Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;