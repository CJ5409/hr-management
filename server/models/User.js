const express = require('express');
const router = express.Router();
const users = [
  { id: 1, email: 'employee1@example.com', password: 'password1', role: 'employee', department: 'Sales', position: 'Sales Associate' },
  { id: 2, email: 'admin@example.com', password: 'password2', role: 'admin', department: 'IT', position: 'System Administrator' },
  { id: 3, email: 'hr@example.com', password: 'password3', role: 'hr', department: 'HR', position: 'HR Manager' },
  { id: 4, email: 'manager@example.com', password: 'password4', role: 'manager', department: 'Sales', position: 'Sales Manager' },
  { id: 5, email: 'shipping@example.com', password: 'password5', role: 'shipping', department: 'Shipping', position: 'Logistics Coordinator' },
  { id: 6, email: 'accounting@example.com', password: 'password6', role: 'accounting', department: 'Accounting', position: 'Accountant' },
  { id: 7, email: 'salesman1@example.com', password: 'password7', role: 'salesman', department: 'Sales', position: 'Sales Associate' },
  { id: 8, email: 'salesman2@example.com', password: 'password8', role: 'salesman', department: 'Sales', position: 'Sales Associate' },
];

router.get('/', (req, res) => {
  res.json(users);
});

router.get('/:id', (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

router.get('/notifications/:role', (req, res) => {
  const role = req.params.role;
  const notifications = [
    { id: 1, message: 'Pending CV approval', role: 'admin' },
    { id: 2, message: 'Reminder: Clock in', role: 'employee' },
    { id: 3, message: 'New sales order: Laptop', role: 'shipping' },
    { id: 4, message: 'Calculate commission for Laptop', role: 'accounting' },
    { id: 5, message: 'Team meeting scheduled', role: 'manager' },
    { id: 6, message: 'Sales target updated', role: 'salesman' },
  ].filter((n) => n.role === role);
  res.json(notifications);
});

module.exports = router;