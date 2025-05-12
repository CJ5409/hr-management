import { Box, Typography } from '@mui/material';

const Preferences = () => {
  // Preferences rendering is handled in Layout.tsx at /preferences
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Preferences
      </Typography>
      {/* Preferences form is rendered by Layout.tsx */}
    </Box>
  );
};

export default Preferences;