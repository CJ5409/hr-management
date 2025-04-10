const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const auth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to uploads/ directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true); // Accept only PDF files
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:3000' } });
io.on('connection', () => console.log('Client connected'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err.message));

const User = require('./models/User');
const ClockRecord = require('./models/ClockRecord');
const CVSubmission = require('./models/CVSubmission');
const Performance = require('./models/Performance');

app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ email, password: hashedPassword, role, department: 'Unassigned' });
      await user.save();
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role, email: user.email, department: user.department });
  } catch (error) {
    console.error('Login endpoint error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protect routes with auth middleware
app.get('/employee/:email', auth, async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  res.json(user || { error: 'Employee not found' });
});

app.post('/clock-in', auth, async (req, res) => {
  const { email } = req.user; // Extract email from JWT
  const record = new ClockRecord({ userEmail: email, clockIn: new Date() });
  await record.save();
  io.emit('dataUpdate', { email, clockRecords: await ClockRecord.find({ userEmail: email }) });
  res.status(201).send('Clocked in');
});

app.post('/clock-out', auth, async (req, res) => {
  const { email } = req.user;
  const record = await ClockRecord.findOne({ userEmail: email, clockOut: null });
  if (record) {
    record.clockOut = new Date();
    await record.save();
    io.emit('dataUpdate', { email, clockRecords: await ClockRecord.find({ userEmail: email }) });
    res.send('Clocked out');
  } else {
    res.status(404).send('No active clock-in');
  }
});

app.get('/clock-records/:email', auth, async (req, res) => {
  const records = await ClockRecord.find({ userEmail: req.params.email });
  res.json(records);
});

const util = require('util');
const execPromise = util.promisify(exec); // Promisify exec

app.post('/submit-cv', auth, upload.single('file'), async (req, res) => {
  const { email } = req.user;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type' });
  }

  const filePath = req.file.path;
  const submission = new CVSubmission({ userEmail: email, fileUrl: filePath });
  await submission.save();

  try {
    const { stdout, stderr } = await execPromise(`python3 ../ai/parse_cv.py "${filePath}"`);
    if (stderr) {
      console.error('Error running parse_cv.py:', stderr);
      submission.aiReport = 'Error processing CV';
    } else {
      submission.aiReport = stdout;
    }
  } catch (err) {
    console.error('Error running parse_cv.py:', err.message);
    submission.aiReport = 'Error processing CV';
  }

  await submission.save();
  res.status(201).json({ message: 'CV submitted', fileUrl: filePath });
});

app.get('/cv-submissions/:email', auth, async (req, res) => {
  const { email, role } = req.user;
  let submissions;
  if (role === 'hr') {
    submissions = await CVSubmission.find(); // HR can see all CV submissions
  } else {
    submissions = await CVSubmission.find({ userEmail: req.params.email });
  }
  res.json(submissions);
});

app.get('/performance/:email', auth, async (req, res) => {
  const records = await ClockRecord.find({ userEmail: req.params.email });
  const hoursWorked = records.reduce((acc, r) => acc + (r.clockOut ? (new Date(r.clockOut) - new Date(r.clockIn)) / 3600000 : 0), 0);
  const onTimeRate = records.length ? (records.filter(r => new Date(r.clockIn).getHours() < 9).length / records.length) * 100 : 0;
  let perf = await Performance.findOne({ userEmail: req.params.email });
  if (!perf) perf = new Performance({ userEmail: req.params.email, onTimeRate, hoursWorked });
  else { perf.onTimeRate = onTimeRate; perf.hoursWorked = hoursWorked; }
  await perf.save();
  res.json(perf);
});

app.put('/clock-record/:id', auth, async (req, res) => {
  const { clockIn } = req.body;
  const record = await ClockRecord.findById(req.params.id);
  if (record) {
    record.clockIn = clockIn || record.clockIn;
    await record.save();
    io.emit('dataUpdate', { email: record.userEmail, clockRecords: await ClockRecord.find({ userEmail: record.userEmail }) });
    res.send('Record updated');
  } else {
    res.status(404).send('Record not found');
  }
});

app.put('/employee/:email/department', auth, async (req, res) => {
  const { department } = req.body;
  const user = await User.findOne({ email: req.params.email });
  if (user) {
    const lastEntry = user.departmentHistory[user.departmentHistory.length - 1];
    if (lastEntry) lastEntry.endDate = new Date();
    user.departmentHistory.push({ department, startDate: new Date() });
    user.department = department;
    await user.save();
    res.send('Department updated');
  } else {
    res.status(404).send('User not found');
  }
});

app.get('/employee-count', auth, async (req, res) => {
  try {
    const count = await User.countDocuments({ role: 'employee' });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching employee count:', error.message);
    res.status(500).send('Server error');
  }
});

server.listen(5001, () => console.log('Server running on port 5001'));