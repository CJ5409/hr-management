const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const fs = require('fs/promises');
const path = require('path');
const MESSAGES_FILE = path.join(__dirname, '../server/data/messages.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const CLOCK_RECORDS_FILE = path.join(__dirname, '../server/data/clockRecords.json');

async function readMessages() {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}
async function writeMessages(messages) {
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

async function readClockRecords() {
  try {
    const data = await fs.readFile(CLOCK_RECORDS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}
async function writeClockRecords(records) {
  await fs.writeFile(CLOCK_RECORDS_FILE, JSON.stringify(records, null, 2));
}

// JWT middleware for protected routes
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);
app.use(cors());
app.use(express.json());
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/uploads', express.static(__dirname + '/uploads'));

// Add new /api/users endpoint that reads from users.json
app.get('/api/users', async (req, res) => {
  try {
    const usersPath = path.join(__dirname, '../server/data/users.json');
    const data = await fs.readFile(usersPath, 'utf-8');
    const users = JSON.parse(data);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read users' });
  }
});

// Add user registration endpoint for jobseekers only
app.post('/api/users', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  try {
    const usersPath = path.join(__dirname, '../server/data/users.json');
    const data = await fs.readFile(usersPath, 'utf-8');
    const users = JSON.parse(data);
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const nextId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
    const user = {
      id: nextId,
      email,
      password, // In production, hash this!
      role: 'jobseeker',
      department: null,
      position: null,
      name: name || null
    };
    users.push(user);
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
    res.status(201).json({ success: true, user: { ...user, password: undefined } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Auth: Register (jobseeker)
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  try {
    const usersPath = path.join(__dirname, '../server/data/users.json');
    const data = await fs.readFile(usersPath, 'utf-8');
    const users = JSON.parse(data);
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const nextId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
    const user = {
      id: nextId,
      email,
      password: hashedPassword,
      role: 'jobseeker',
      department: null,
      position: null,
      name: name || null
    };
    users.push(user);
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  try {
    const usersPath = path.join(__dirname, '../server/data/users.json');
    const data = await fs.readFile(usersPath, 'utf-8');
    const users = JSON.parse(data);
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    // Issue JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name, department: user.department, position: user.position } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Department management endpoints
const departmentsPath = path.join(__dirname, '../server/data/departments.json');
app.get('/api/departments', async (req, res) => {
  try {
    const data = await fs.readFile(departmentsPath, 'utf-8');
    const departments = JSON.parse(data);
    res.json(departments);
  } catch {
    res.status(500).json([]);
  }
});
app.post('/api/departments', async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Invalid department name' });
  try {
    const data = await fs.readFile(departmentsPath, 'utf-8');
    let departments = JSON.parse(data);
    if (!departments.includes(name)) {
      departments.push(name);
      await fs.writeFile(departmentsPath, JSON.stringify(departments, null, 2));
    }
    res.json(departments);
  } catch {
    res.status(500).json([]);
  }
});

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

// GET /api/performance - return mock performance data
app.get('/api/performance', (req, res) => {
  res.json([
    { email: 'alice.lee@example.com', name: 'Alice Lee', department: 'Sales', onTimeRate: 98, hoursWorked: 160 },
    { email: 'carol.wong@example.com', name: 'Carol Wong', department: 'HR', onTimeRate: 95, hoursWorked: 155 },
    { email: 'bob.chan@example.com', name: 'Bob Chan', department: 'Sales', onTimeRate: 92, hoursWorked: 150 },
    { email: 'js@js.com', name: 'Testguy', department: 'HR', onTimeRate: 90, hoursWorked: 140 },
    { email: 'js1@js.com', name: 'Testguy2', department: 'HR', onTimeRate: 85, hoursWorked: 130 }
  ]);
});

// GET /api/performance/employees - mock employee metrics
app.get('/api/performance/employees', (req, res) => {
  res.json([
    { name: 'Alice Lee', email: 'alice.lee@example.com', department: 'Sales', onTimeRate: 98, hoursWorked: 160, sales: 120000 },
    { name: 'Carol Wong', email: 'carol.wong@example.com', department: 'HR', onTimeRate: 95, hoursWorked: 155, sales: 0 },
    { name: 'Bob Chan', email: 'bob.chan@example.com', department: 'Sales', onTimeRate: 92, hoursWorked: 150, sales: 90000 },
    { name: 'Testguy', email: 'js@js.com', department: 'HR', onTimeRate: 90, hoursWorked: 140, sales: 0 },
    { name: 'Testguy2', email: 'js1@js.com', department: 'HR', onTimeRate: 85, hoursWorked: 130, sales: 0 }
  ]);
});

// GET /api/performance/departments - mock department reports
app.get('/api/performance/departments', (req, res) => {
  res.json([
    { department: 'Sales', avgOnTimeRate: 95, totalHours: 310, totalSales: 210000 },
    { department: 'HR', avgOnTimeRate: 90, totalHours: 425, totalSales: 0 }
  ]);
});

// GET /api/performance/goals - mock goal tracking
app.get('/api/performance/goals', (req, res) => {
  res.json([
    { name: 'Alice Lee', goal: '120,000 sales', progress: 120000, target: 120000, status: 'Achieved' },
    { name: 'Bob Chan', goal: '100,000 sales', progress: 90000, target: 100000, status: 'In Progress' },
    { name: 'Carol Wong', goal: 'Complete onboarding for 5 employees', progress: 5, target: 5, status: 'Achieved' },
    { name: 'Testguy', goal: 'Complete 10 HR reviews', progress: 7, target: 10, status: 'In Progress' }
  ]);
});

// POST /api/clock-records (from mobile)
app.post('/api/clock-records', async (req, res) => {
  const { email, name, type, time, location, address } = req.body;
  if (!email || !type || !time) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const records = await readClockRecords();
    const nextId = records.length > 0 ? Math.max(...records.map(r => r.id || 0)) + 1 : 1;
    const record = { id: nextId, email, name, type, time, location, address };
    records.push(record);
    await writeClockRecords(records);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save record' });
  }
});

// GET /api/clock-records (for HR)
app.get('/api/clock-records', async (req, res) => {
  try {
    const records = await readClockRecords();
    res.json(records);
  } catch {
    res.status(500).json([]);
  }
});

// PUT /api/clock-records/:id (edit)
app.put('/api/clock-records/:id', async (req, res) => {
  try {
    const records = await readClockRecords();
    const idx = records.findIndex(r => String(r.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Record not found' });
    records[idx] = { ...records[idx], ...req.body };
    await writeClockRecords(records);
    res.json(records[idx]);
  } catch {
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// In-memory appeals log for demo
const appeals = [];

// POST /api/appeals - candidate submits an appeal
app.post('/api/appeals', (req, res) => {
  const { email, applicationId, reason } = req.body;
  if (!email || !applicationId || !reason) return res.status(400).json({ error: 'Missing fields' });
  appeals.push({ email, applicationId, reason, time: new Date().toISOString(), status: 'pending' });
  res.json({ success: true });
});

// GET /api/appeals - HR fetches all appeals
app.get('/api/appeals', (req, res) => {
  res.json(appeals);
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', async (roleOrEmail) => {
    socket.join(roleOrEmail);
    // Optionally, send all previous messages to the user
    if (roleOrEmail.includes('@')) {
      const messages = await readMessages();
      const userMessages = messages.filter(m => m.to === roleOrEmail);
      userMessages.forEach(msg => {
        socket.emit('receiveMessage', msg);
      });
    }
  });

  socket.on('sendMessage', async ({ sender, recipientRole, message }) => {
    io.to(recipientRole).emit('receiveMessage', { sender, message, timestamp: new Date().toLocaleString() });
    // Persist the message for all users in the recipientRole room
    // For demo, just store for each user in the room
    // In production, you may want to store per user or per conversation
    const messages = await readMessages();
    // Here, we don't know all emails in the room, so just store as to: recipientRole
    messages.push({ to: recipientRole, from: sender, message, timestamp: new Date().toISOString() });
    await writeMessages(messages);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5001, () => {
  console.log('Server running on port 5001');
});