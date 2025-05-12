import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { ClockRecord } from '../models/ClockRecord';

const ClockRecords = () => {
  // Mock data (replace with API call in production)
  const records: ClockRecord[] = [
    { id: 1, employeeEmail: 'employee1@example.com', clockIn: '2025-05-12 09:00', clockOut: '2025-05-12 17:00' },
    { id: 2, employeeEmail: 'employee1@example.com', clockIn: '2025-05-13 08:30', clockOut: null },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Clock Records
      </Typography>
      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee Email</TableCell>
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.employeeEmail}</TableCell>
                  <TableCell>{record.clockIn}</TableCell>
                  <TableCell>{record.clockOut || 'Still Working'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ClockRecords;