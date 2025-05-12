import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { Socket } from 'socket.io-client';

interface ChatProps {
  socket: Socket;
  userData: { email: string; role: string };
  messages: { sender: string; message: string; timestamp: string }[];
}

const Chat = ({ socket, userData, messages }: ChatProps) => {
  const [message, setMessage] = useState('');
  const [recipientRole, setRecipientRole] = useState('employee');

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('sendMessage', {
        sender: userData.email,
        recipientRole,
        message,
      });
      setMessage('');
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 3, backgroundColor: '#fff' }}>
      <Typography variant="h6" gutterBottom>
        Instant Messaging
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Send to:</Typography>
        <select value={recipientRole} onChange={(e) => setRecipientRole(e.target.value)}>
          <option value="employee">Employees</option>
          <option value="hr">HR</option>
          <option value="manager">Managers</option>
          <option value="admin">Admins</option>
          <option value="shipping">Shipping</option>
          <option value="accounting">Accounting</option>
          <option value="salesman">Salesmen</option>
        </select>
      </Box>
      <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
        {messages.map((msg, index) => (
          <Typography key={index}>
            [{msg.timestamp}] {msg.sender}: {msg.message}
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          variant="outlined"
          size="small"
        />
        <Button variant="contained" onClick={sendMessage}>
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default Chat;