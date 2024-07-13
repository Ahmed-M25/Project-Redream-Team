import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Received data:', { username, email, password });
  try {
    const user = new User({ username, email, password });
    await user.save();
    console.log('User saved successfully');
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(201).json({ message: 'User created', token });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: 'Error creating user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Received data:', { email, password }); 
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    console.log('Login successful');
    res.json({ token, username: user.username });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', async (req, res) => {
  const { Authorization } = req.header;
  const { school, techStack, desiredRoles, contact } = req.body;
  console.log('Received data:', { school, techStack, desiredRoles, contact }); 

  if (!Authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = Authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const userId = decoded.id;
    const user = await User.findById(userId);

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    user.hackerStats.school = school;
    user.hackerStats.techStack = techStack;
    user.hackerStats.desiredRoles = desiredRoles;
    user.hackerStats.contact = contact;
    await user.save();

    res.status(200).json({ message: 'Profile updated successful' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
