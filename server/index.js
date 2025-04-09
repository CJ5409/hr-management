const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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
  const { email, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, role, department: 'Unassigned' });
      await user.save();
    }
    res.json({ token: 'fake-token', role: user.role, email: user.email });
  } catch (error) {
    console.error('Login endpoint error:', error.message);
    res.status(500).send('Server error');
  }
});

app.get('/employee/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  res.json(user || { error: 'Employee not found' });
});

app.post('/clock-in', async (req, res) => {
  const { email } = req.body;
  const record = new ClockRecord({ userEmail: email, clockIn: new Date() });
  await record.save();
  io.emit('dataUpdate', { email, clockRecords: await ClockRecord.find({ userEmail: email }) });
  res.status(201).send('Clocked in');
});

app.post('/clock-out', async (req, res) => {
  const { email } = req.body;
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

app.get('/clock-records/:email', async (req, res) => {
  const records = await ClockRecord.find({ userEmail: req.params.email });
  res.json(records);
});

app.post('/submit-cv', async (req, res) => {
  const { email, file } = req.body;
  const submission = new CVSubmission({ userEmail: email, fileUrl: 'mock-url.pdf' });
  await submission.save();
  exec(`python3 ../ai/parse_cv.py mock-cv.pdf`, (err, stdout) => {
    if (!err) {
      submission.aiReport = stdout;
      submission.save();
    }
  });
  res.status(201).send('CV submitted');
});

app.get('/cv-submissions/:email', async (req, res) => {
  const submissions = await CVSubmission.find({ userEmail: req.params.email });
  res.json(submissions);
});

app.get('/performance/:email', async (req, res) => {
  const records = await ClockRecord.find({ userEmail: req.params.email });
  const hoursWorked = records.reduce((acc, r) => acc + (r.clockOut ? (new Date(r.clockOut) - new Date(r.clockIn)) / 3600000 : 0), 0);
  const onTimeRate = records.length ? (records.filter(r => new Date(r.clockIn).getHours() < 9).length / records.length) * 100 : 0;
  let perf = await Performance.findOne({ userEmail: req.params.email });
  if (!perf) perf = new Performance({ userEmail: req.params.email, onTimeRate, hoursWorked });
  else { perf.onTimeRate = onTimeRate; perf.hoursWorked = hoursWorked; }
  await perf.save();
  res.json(perf);
});

app.get('/employee-count', async (req, res) => {
  try {
    const count = await User.countDocuments({ role: 'employee' });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching employee count:', error.message);
    res.status(500).send('Server error');
  }
});

app.put('/clock-record/:id', async (req, res) => {
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

app.put('/employee/:email/department', async (req, res) => {
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

server.listen(5001, () => console.log('Server running on port 5001'));