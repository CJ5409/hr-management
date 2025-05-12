const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);

// Mock sales data
app.get('/api/sales/department', (req, res) => {
  const salesData = [
    { month: 'Jan', sales: 10000 },
    { month: 'Feb', sales: 12000 },
    { month: 'Mar', sales: 9000 },
    { month: 'Apr', sales: 14000 },
    { month: 'May', sales: 11000 },
  ];
  res.json(salesData);
});

app.get('/api/sales/salesmen', (req, res) => {
  const salesmenData = [
    {
      id: 7,
      email: 'salesman1@example.com',
      sales: [
        { month: 'Jan', sales: 5000 },
        { month: 'Feb', sales: 6000 },
        { month: 'Mar', sales: 4500 },
        { month: 'Apr', sales: 7000 },
        { month: 'May', sales: 5500 },
      ],
    },
    {
      id: 8,
      email: 'salesman2@example.com',
      sales: [
        { month: 'Jan', sales: 4000 },
        { month: 'Feb', sales: 5000 },
        { month: 'Mar', sales: 3500 },
        { month: 'Apr', sales: 6000 },
        { month: 'May', sales: 4500 },
      ],
    },
  ];
  res.json(salesmenData);
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (role) => {
    socket.join(role);
  });

  socket.on('sendMessage', ({ sender, recipientRole, message }) => {
    io.to(recipientRole).emit('receiveMessage', { sender, message, timestamp: new Date().toLocaleString() });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});