const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { check } = require('express-validator'); // Add express-validator
require('dotenv').config();

const auth = require('./middleware/auth');
const validate = require('./middleware/validate'); // Add validate middleware

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
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

// /login: Validate email, password, and role
app.post(
  '/login',
  [
    check('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    check('role')
      .isIn(['employee', 'hr', 'manager'])
      .withMessage('Role must be one of: employee, hr, manager'),
    validate
  ],
  async (req, res) => {
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
          return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
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
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

app.get('/employee/:email', auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'Employee not found' }] });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching employee:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

app.post('/clock-in', auth, async (req, res) => {
  try {
    const { email } = req.user;
    const record = new ClockRecord({ userEmail: email, clockIn: new Date() });
    await record.save();
    io.emit('dataUpdate', { email, clockRecords: await ClockRecord.find({ userEmail: email }) });
    res.status(201).json({ message: 'Clocked in successfully' });
  } catch (error) {
    console.error('Clock-in error:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

app.post('/clock-out', auth, async (req, res) => {
  try {
    const { email } = req.user;
    const record = await ClockRecord.findOne({ userEmail: email, clockOut: null });
    if (record) {
      record.clockOut = new Date();
      await record.save();
      io.emit('dataUpdate', { email, clockRecords: await ClockRecord.find({ userEmail: email }) });
      res.json({ message: 'Clocked out successfully' });
    } else {
      res.status(404).json({ errors: [{ msg: 'No active clock-in found' }] });
    }
  } catch (error) {
    console.error('Clock-out error:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

app.get('/clock-records/:email', auth, async (req, res) => {
  try {
    const { role, email: loggedInEmail } = req.user;
    const targetEmail = req.params.email;

    if (role === 'manager' && loggedInEmail !== targetEmail) {
      // Managers can fetch records for employees in their department
      const manager = await User.findOne({ email: loggedInEmail });
      const employee = await User.findOne({ email: targetEmail });
      if (!employee || employee.department !== manager.department) {
        return res.status(403).json({ errors: [{ msg: 'Access denied: Employee not in your department' }] });
      }
    } else if (loggedInEmail !== targetEmail) {
      // Non-managers can only fetch their own records
      return res.status(403).json({ errors: [{ msg: 'Access denied: Can only fetch your own records' }] });
    }

    const records = await ClockRecord.find({ userEmail: targetEmail });
    res.json(records);
  } catch (error) {
    console.error('Error fetching clock records:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});
app.post('/submit-cv', auth, upload.single('file'), async (req, res) => {
  try {
    const { email } = req.user;
    if (!req.file) {
      return res.status(400).json({ errors: [{ msg: 'No file uploaded or invalid file type' }] });
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
    res.status(201).json({ message: 'CV submitted successfully', fileUrl: filePath });
  } catch (error) {
    console.error('CV submission error:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

app.get('/cv-submissions/:email', auth, async (req, res) => {
  try {
    const { email, role } = req.user;
    let submissions;
    if (role === 'hr') {
      submissions = await CVSubmission.find();
    } else {
      submissions = await CVSubmission.find({ userEmail: req.params.email });
    }
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching CV submissions:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

app.get('/performance/:email', auth, async (req, res) => {
  try {
    const records = await ClockRecord.find({ userEmail: req.params.email });
    const hoursWorked = records.reduce((acc, r) => acc + (r.clockOut ? (new Date(r.clockOut) - new Date(r.clockIn)) / 3600000 : 0), 0);
    const onTimeRate = records.length ? (records.filter(r => new Date(r.clockIn).getHours() < 9).length / records.length) * 100 : 0;
    let perf = await Performance.findOne({ userEmail: req.params.email });
    if (!perf) perf = new Performance({ userEmail: req.params.email, onTimeRate, hoursWorked });
    else { perf.onTimeRate = onTimeRate; perf.hoursWorked = hoursWorked; }
    await perf.save();
    res.json(perf);
  } catch (error) {
    console.error('Error fetching performance:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// /clock-record/:id: Validate clockIn date format
app.put(
  '/clock-record/:id',
  auth,
  [
    check('clockIn')
      .isISO8601()
      .withMessage('clockIn must be a valid ISO 8601 date (e.g., 2023-10-01T09:00:00Z)'),
    validate
  ],
  async (req, res) => {
    try {
      const { role, email: loggedInEmail } = req.user;
      const record = await ClockRecord.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ errors: [{ msg: 'Clock record not found' }] });
      }

      if (role === 'manager') {
        const manager = await User.findOne({ email: loggedInEmail });
        const employee = await User.findOne({ email: record.userEmail });
        if (!employee || employee.department !== manager.department) {
          return res.status(403).json({ errors: [{ msg: 'Access denied: Employee not in your department' }] });
        }
      } else {
        return res.status(403).json({ errors: [{ msg: 'Access denied: Managers only' }] });
      }

      const { clockIn } = req.body;
      record.clockIn = clockIn || record.clockIn;
      await record.save();
      io.emit('dataUpdate', { email: record.userEmail, clockRecords: await ClockRecord.find({ userEmail: record.userEmail }) });
      res.json({ message: 'Clock record updated successfully' });
    } catch (error) {
      console.error('Error updating clock record:', error.message);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// /employee/:email/department: Validate department
app.put(
  '/employee/:email/department',
  auth,
  [
    check('department')
      .notEmpty()
      .withMessage('Department is required')
      .isLength({ max: 50 })
      .withMessage('Department name must be less than 50 characters'),
    validate
  ],
  async (req, res) => {
    try {
      const { department } = req.body;
      const user = await User.findOne({ email: req.params.email });
      if (user) {
        const lastEntry = user.departmentHistory[user.departmentHistory.length - 1];
        if (lastEntry) lastEntry.endDate = new Date();
        user.departmentHistory.push({ department, startDate: new Date() });
        user.department = department;
        await user.save();
        res.json({ message: 'Department updated successfully' });
      } else {
        res.status(404).json({ errors: [{ msg: 'User not found' }] });
      }
    } catch (error) {
      console.error('Error updating department:', error.message);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

app.get('/employee-count', auth, async (req, res) => {
  try {
    const count = await User.countDocuments({ role: 'employee' });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching employee count:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

app.get('/employees-in-department', auth, async (req, res) => {
  try {
    const { role, email } = req.user;
    if (role !== 'manager') {
      return res.status(403).json({ errors: [{ msg: 'Access denied: Managers only' }] });
    }

    const manager = await User.findOne({ email });
    if (!manager) {
      return res.status(404).json({ errors: [{ msg: 'Manager not found' }] });
    }

    const employees = await User.find({
      role: 'employee',
      department: manager.department
    }).select('email department');
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees in department:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

server.listen(5001, () => console.log('Server running on port 5001'));