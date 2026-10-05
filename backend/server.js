const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

// Import Mongoose Models
const User = require('./models/User');
const Task = require('./models/Task');

const app = express();

// 1. MIDDLEWARE (Must come before routes)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Multer storage in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// 2. MONGODB CONNECTION
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 3. HEALTH CHECK
app.get('/', (req, res) => {
  res.send('TaskFlow Backend Server is Running Live!');
});

// 4. MOUNT AUTH ROUTES
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Google OAuth Handler
app.post('/api/auth/google', async (req, res) => {
  const { name, email, picture } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required from Google' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: name || email.split('@')[0],
        email,
        picture: picture || ''
      });
      await user.save();
    }

    res.json({
      token: 'google-auth-token',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    });
  } catch (err) {
    console.error('Google Auth Server Error:', err);
    res.status(500).json({ message: 'Server error processing Google login', error: err.message });
  }
});

// 5. TASK ROUTES

// Get User Tasks (supports both /api/tasks?userId=... and /api/tasks/:userId)
app.get('/api/tasks', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId query parameter is required' });

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task with Base64 image
app.post('/api/tasks', upload.single('image'), async (req, res) => {
  const { userId, title, subtasks } = req.body;

  let base64Image = '';
  if (req.file) {
    base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  }

  const parsedSubtasks = subtasks ? JSON.parse(subtasks) : [];

  try {
    const newTask = new Task({
      userId,
      title,
      image: base64Image,
      subtasks: parsedSubtasks
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle main task completed
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle subtask status
app.put('/api/tasks/:taskId/subtask/:subtaskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (subtask) subtask.completed = !subtask.completed;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));