const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/User');
const ClockRecord = require('./models/ClockRecord');


require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.listen(5001, () => console.log('Server running on port 5001'));


const CVSubmission = require('./models/CVSubmission');
app.post('/submit-cv', async (req, res) => {
  const { email, file } = req.body;
  const submission = new CVSubmission({ userEmail: email, fileUrl: 'mock-url.pdf' });
  await submission.save();
  res.status(201).send('CV submitted');
});


app.post('/login', async (req, res) => {
    const { email, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, role, department: 'Unassigned' });
      await user.save();
    }
    res.json({ token: 'fake-token', role: user.role, email: user.email });
  });

app.get('/employee/:email', async (req, res) => {
    const user = await User.findOne({ email: req.params.email });
    res.json(user || { error: 'Employee not found' });
  });

app.post('/clock-in', async (req, res) => {
    const { email } = req.body;
    const record = new ClockRecord({ userEmail: email, clockIn: new Date() });
    await record.save();
    res.status(201).send('Clocked in');
  });

app.post('/clock-out', async (req, res) => {
    const { email } = req.body;
    const record = await ClockRecord.findOne({ userEmail: email, clockOut: null });
    if (record) {
      record.clockOut = new Date();
      await record.save();
      res.send('Clocked out');
    } else {
      res.status(404).send('No active clock-in');
    }
  });

app.get('/clock-records/:email', async (req, res) => {
    const records = await ClockRecord.find({ userEmail: req.params.email });
    res.json(records);
  });