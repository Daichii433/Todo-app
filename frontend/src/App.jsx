import React, { useEffect, useState } from 'react';
import './App.css';

const PRIORITIES = ['High', 'Medium', 'Low'];
const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };
const API_URL = import.meta.env.VITE_API_URL;

function categorizeTodos(todos) {
  return {
    upcoming: todos
      .filter(t => !t.completed)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    completed: todos.filter(t => t.completed),
  };
}

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState({ title: '', dueDate: '', priority: 'Medium' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/todos`).then(r => r.json()).then(setTodos);
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title) return;
    if (editingId) {
      fetch(`${API_URL}/api/todos/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then(r => r.json())
        .then(updated => {
          setTodos(todos => todos.map(t => (t.id === updated.id ? updated : t)));
          setEditingId(null);
          setForm({ title: '', dueDate: '', priority: 'Medium' });
        });
    } else {
      fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then(r => r.json())
        .then(newTodo => {
          setTodos(todos => [...todos, newTodo]);
          setForm({ title: '', dueDate: '', priority: 'Medium' });
        });
    }
  };

  const handleEdit = todo => {
    setEditingId(todo.id);
    setForm({ title: todo.title, dueDate: todo.dueDate || '', priority: todo.priority || 'Medium' });
  };

  const handleDelete = id => {
    fetch(`${API_URL}/api/todos/${id}`, { method: 'DELETE' })
      .then(() => setTodos(todos => todos.filter(t => t.id !== id)));
  };

  const handleToggle = todo => {
    fetch(`${API_URL}/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed }),
    })
      .then(r => r.json())
      .then(updated => setTodos(todos => todos.map(t => (t.id === updated.id ? updated : t))));
  };

  const { upcoming, completed } = categorizeTodos(todos);

  return (
    <div className="app-container">
      <h1>Todo App</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Task title"
          required
        />
        <input
          name="dueDate"
          type="datetime-local"
          value={form.dueDate}
          onChange={handleChange}
        />
        <select name="priority" value={form.priority} onChange={handleChange}>
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ title: '', dueDate: '', priority: 'Medium' }); }}>Cancel</button>}
      </form>
      <div className="section">
        <h2>Upcoming</h2>
        <TaskList todos={upcoming} onEdit={handleEdit} onDelete={handleDelete} onToggle={handleToggle} />
      </div>
      <div className="section">
        <h2>Completed</h2>
        <TaskList todos={completed} onEdit={handleEdit} onDelete={handleDelete} onToggle={handleToggle} />
      </div>
    </div>
  );
}

function TaskList({ todos, onEdit, onDelete, onToggle }) {
  if (!todos.length) return <p className="empty">No tasks</p>;
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} className={`task-item${todo.completed ? ' completed' : ''}`}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo)}
            title="Mark as completed"
          />
          <span className="task-title">{todo.title}</span>
          {todo.dueDate && <span className="task-date">{new Date(todo.dueDate).toLocaleString()}</span>}
          <span className={`task-priority ${todo.priority.toLowerCase()}`}>{todo.priority}</span>
          <span className="task-actions">
            <button onClick={() => onEdit(todo)}>Edit</button>
            <button onClick={() => onDelete(todo.id)}>Delete</button>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default TodoApp;
