const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
require('dotenv').config(); // Loads backend/.env variables
const app = express();
// Middleware
app.use(express.json());

// Import Auth Routes
const authRoutes = require('./routes/authRoutes');

// Mount Auth Routes
app.use('/api/auth', authRoutes);

// ... rest of your server setup (taskRoutes, db connection, app.listen)
// Environment Variables (Loaded from .env locally or Render in production)
const MONGO_URL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;


app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Store uploaded files in memory buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Add this right before your AUTH ROUTES
app.get('/', (req, res) => {
  res.send('TaskFlow Backend Server is Running Live!');
});

// --- AUTH ROUTES ---
// backend/server.js
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
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role
    });
  } catch (err) {
    console.error('Google Auth Server Error:', err);
    res.status(500).json({ message: 'Server error processing Google login', error: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { name, email, picture } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, picture });
      await user.save();
    }
    res.json({ id: user._id, name: user.name, email: user.email, picture: user.picture, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TASK ROUTES ---

// Get User Tasks
app.get('/api/tasks/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task with Base64 image stored directly in DB
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
      image: base64Image, // Base64 string saved directly into MongoDB
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));