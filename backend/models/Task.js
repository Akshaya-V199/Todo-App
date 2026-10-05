const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  image: { type: String, default: '' }, // Stores Base64 string directly in MongoDB
  subtasks: [subtaskSchema]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);