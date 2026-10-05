import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Plus, Trash2, CheckCircle, Circle, Image as ImageIcon, X, CheckSquare, Square } from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [subtasksInput, setSubtasksInput] = useState([]);
  const [currentSubtask, setCurrentSubtask] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const API_BASE = 'https://taskflow-backend-x9ux.onrender.com/api';
  useEffect(() => {
    if (user?.id) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${user.id}`);
      const data = await res.json();
      if (res.ok) setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAddSubtaskInput = () => {
    if (!currentSubtask.trim()) return;
    setSubtasksInput([...subtasksInput, { title: currentSubtask.trim(), completed: false }]);
    setCurrentSubtask('');
  };

  const handleRemoveSubtaskInput = (index) => {
    setSubtasksInput(subtasksInput.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !user?.id) return;

    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('title', title.trim());
      formData.append('subtasks', JSON.stringify(subtasksInput));
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        body: formData
      });

      const newTask = await res.json();
      if (res.ok) {
        setTasks([newTask, ...tasks]);
        setTitle('');
        setSubtasksInput([]);
        clearImage();
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const toggleMainTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'PUT' });
      const updated = await res.json();
      if (res.ok) setTasks(tasks.map(t => t._id === id ? updated : t));
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/subtask/${subtaskId}`, { method: 'PUT' });
      const updated = await res.json();
      if (res.ok) setTasks(tasks.map(t => t._id === taskId ? updated : t));
    } catch (err) {
      console.error('Error toggling subtask:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const calculateProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    const completedCount = task.subtasks.filter(s => s.completed).length;
    return Math.round((completedCount / task.subtasks.length) * 100);
  };

  return (
    <div style={styles.container}>
      <Navbar user={user} onLogout={onLogout} />

      <main style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Task Dashboard</h1>
          <p style={styles.subtitle}>Track projects, subtasks, and completion progress.</p>
        </div>

        {/* Create Task Box */}
        <form onSubmit={handleCreateTask} style={styles.createCard}>
          <input
            type="text"
            placeholder="Main task title (e.g., Redesign Website)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.mainInput}
          />

          {/* Subtask Adder */}
          <div style={styles.subtaskInputRow}>
            <input
              type="text"
              placeholder="Add subtask..."
              value={currentSubtask}
              onChange={(e) => setCurrentSubtask(e.target.value)}
              style={styles.subInput}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtaskInput(); } }}
            />
            <button type="button" onClick={handleAddSubtaskInput} style={styles.addSubBtn}>
              + Subtask
            </button>
          </div>

          {/* Subtask Chips */}
          {subtasksInput.length > 0 && (
            <div style={styles.chipContainer}>
              {subtasksInput.map((sub, idx) => (
                <span key={idx} style={styles.chip}>
                  {sub.title}
                  <X size={14} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => handleRemoveSubtaskInput(idx)} />
                </span>
              ))}
            </div>
          )}

          {/* Bottom Bar: Image Picker & Create Button */}
          <div style={styles.actionRow}>
            <label htmlFor="img-upload" style={styles.uploadLabel}>
              <ImageIcon size={18} color="#64748B" />
              <span style={{ fontSize: '13px', color: '#64748B' }}>Attach Image</span>
              <input id="img-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>

            <button type="submit" style={styles.submitBtn}>
              <Plus size={18} /> Create Task
            </button>
          </div>

          {imagePreview && (
            <div style={styles.previewBox}>
              <img src={imagePreview} alt="Preview" style={styles.previewImg} />
              <button type="button" onClick={clearImage} style={styles.removeImgBtn}><X size={14} color="#FFF" /></button>
            </div>
          )}
        </form>

        {/* Task List */}
        <div style={styles.taskList}>
          {tasks.length === 0 ? (
            <div style={styles.emptyState}>No tasks created yet.</div>
          ) : (
            tasks.map(task => {
              const progress = calculateProgress(task);
              return (
                <div key={task._id} style={styles.taskCard}>
                  {/* Task Header */}
                  <div style={styles.cardHeader}>
                    <button onClick={() => toggleMainTask(task._id)} style={styles.iconBtn}>
                      {task.completed ? <CheckCircle color="#16A34A" size={22} /> : <Circle color="#94A3B8" size={22} />}
                    </button>
                    <span style={{
                      ...styles.taskTitleText,
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? '#94A3B8' : '#0F172A'
                    }}>
                      {task.title}
                    </span>
                    <button onClick={() => deleteTask(task._id)} style={styles.iconBtn}>
                      <Trash2 size={18} color="#EF4444" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div style={styles.progressSection}>
                    <div style={styles.progressHeader}>
                      <span style={styles.progressLabel}>Progress</span>
                      <span style={styles.progressPercent}>{progress}%</span>
                    </div>
                    <div style={styles.progressBarTrack}>
                      <div style={{
                        ...styles.progressBarFill,
                        width: `${progress}%`,
                        backgroundColor: progress === 100 ? '#16A34A' : '#2563EB'
                      }} />
                    </div>
                  </div>

                  {/* Subtasks List */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div style={styles.subtaskList}>
                      {task.subtasks.map(sub => (
                        <div key={sub._id} onClick={() => toggleSubtask(task._id, sub._id)} style={styles.subtaskItem}>
                          {sub.completed ? <CheckSquare size={16} color="#16A34A" /> : <Square size={16} color="#94A3B8" />}
                          <span style={{
                            fontSize: '13px',
                            textDecoration: sub.completed ? 'line-through' : 'none',
                            color: sub.completed ? '#94A3B8' : '#334155'
                          }}>
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Attached Image */}
{task.image && (
  <img src={task.image.startsWith('data:') ? task.image : `https://taskflow-backend-x9ux.onrender.com${task.image}`} alt="Task attachment" style={styles.taskImage} />
)}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'system-ui, sans-serif' },
  content: { maxWidth: '680px', margin: '40px auto', padding: '0 20px' },
  header: { marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' },
  subtitle: { fontSize: '14px', color: '#64748B', margin: 0 },
  createCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '12px' },
  mainInput: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  subtaskInputRow: { display: 'flex', gap: '8px' },
  subInput: { flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' },
  addSubBtn: { padding: '8px 14px', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  chipContainer: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  chip: { display: 'inline-flex', alignItems: 'center', backgroundColor: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '500' },
  actionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  uploadLabel: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: '#F8FAFC' },
  submitBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  previewBox: { position: 'relative', width: '70px', height: '70px' },
  previewImg: { width: '70px', height: '70px', borderRadius: '6px', objectFit: 'cover' },
  removeImgBtn: { position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#EF4444', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer', display: 'flex' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  taskCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '14px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' },
  taskTitleText: { flex: 1, fontSize: '16px', fontWeight: '600' },
  progressSection: { display: 'flex', flexDirection: 'column', gap: '6px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', fontWeight: '600' },
  progressLabel: { textTransform: 'uppercase', letterSpacing: '0.5px' },
  progressPercent: { color: '#0F172A' },
  progressBarTrack: { width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' },
  progressBarFill: { height: '100%', transition: 'width 0.3s ease' },
  subtaskList: { display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px', borderLeft: '2px solid #F1F5F9' },
  subtaskItem: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' },
  taskImage: { width: '100%', maxHeight: '240px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0' },
  emptyState: { textAlign: 'center', color: '#94A3B8', padding: '40px 0', fontSize: '14px' }
};