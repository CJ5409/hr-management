import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { CVSubmission } from '../models/CVSubmission';

const ManageCVs = () => {
  // Mock data (replace with API call in production)
  const cvs: CVSubmission[] = [
    { id: 1, candidateName: 'John Doe', submittedAt: '2025-05-10 14:00', status: 'Pending' },
    { id: 2, candidateName: 'Jane Smith', submittedAt: '2025-05-11 09:30', status: 'Approved' },
  ];

  const handleApprove = (id: number) => {
    console.log(`Approve CV with ID: ${id}`);
    // Add API call to update CV status
  };

  const handleReject = (id: number) => {
    console.log(`Reject CV with ID: ${id}`);
    // Add API call to update CV status
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage CVs
      </Typography>
      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate Name</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cvs.map((cv) => (
                <TableRow key={cv.id}>
                  <TableCell>{cv.candidateName}</TableCell>
                  <TableCell>{cv.submittedAt}</TableCell>
                  <TableCell>{cv.status}</TableCell>
                  <TableCell>
                    {cv.status === 'Pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleApprove(cv.id)}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleReject(cv.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ManageCVs;