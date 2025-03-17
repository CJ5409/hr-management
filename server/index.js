const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/User');


require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.listen(5000, () => console.log('Server running on port 5000'));


app.post('/login', async (req, res) => {
    const { email, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, role, department: 'Unassigned' });
      await user.save();
    }
    res.json({ token: 'fake-token', role: user.role, email: user.email });
  });