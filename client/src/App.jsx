import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import api from "./api";

function AuthPage({ mode }) {
  const navigate = useNavigate();
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [uploading, setUploading] = useState(false);


  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand">✓ TaskFlow</div>
        <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="muted">
          {isLogin ? "Sign in to manage your tasks." : "Start organizing your day."}
        </p>

        <form onSubmit={submit} className="form">
          {!isLogin && (
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              minLength="6"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
              required
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button className="primary full" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="switch">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <button className="link-button" onClick={() => navigate(isLogin ? "/register" : "/login")}>
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </p>
      </section>
    </main>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", dueDate: "" });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadTodos() {
    try {
      const { data } = await api.get("/todos");
      setTodos(data);
    } catch {
      localStorage.clear();
      navigate("/login");
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function saveTodo(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, dueDate: form.dueDate || null };
      if (editing) {
        const { data } = await api.put(`/todos/${editing._id}`, payload);
        setTodos((items) => items.map((t) => (t._id === data._id ? data : t)));
      } else {
        const { data } = await api.post("/todos", payload);
        setTodos((items) => [data, ...items]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save task");
    }
  }


  async function uploadImage() {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    try {
      setUploading(true);
      setError("");

      const { data } = await api.post("/upload", formData);

      setUploadedImage(data.imageUrl);
    } catch (err) {
      setError(
        err.response?.data?.message || "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  function resetForm() {
    setForm({ title: "", description: "", priority: "medium", dueDate: "" });
    setEditing(null);
  }

  function editTodo(todo) {
    setEditing(todo);
    setForm({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
      dueDate: todo.dueDate ? todo.dueDate.slice(0, 10) : ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function toggleTodo(todo) {
    const { data } = await api.put(`/todos/${todo._id}`, { completed: !todo.completed });
    setTodos((items) => items.map((t) => (t._id === data._id ? data : t)));
  }

  async function removeTodo(id) {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/todos/${id}`);
    setTodos((items) => items.filter((t) => t._id !== id));
  }



  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  const visible = useMemo(() => {
    return todos.filter((todo) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !todo.completed) ||
        (filter === "completed" && todo.completed);
      const q = search.toLowerCase();
      return matchesFilter && (`${todo.title} ${todo.description}`.toLowerCase().includes(q));
    });
  }, [todos, filter, search]);

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <div className="brand">✓ TaskFlow</div>
          <div className="hello">Hi, {user.name || "there"} 👋</div>
        </div>
        <button className="ghost" onClick={logout}>Log out</button>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">YOUR DAY</p>
          <h1>Get things done.</h1>
          <p className="muted">{remaining} task{remaining === 1 ? "" : "s"} left to finish.</p>
        </div>
        <div className="stat">
          <strong>{todos.length}</strong>
          <span>Total tasks</span>
        </div>
      </section>

      <section className="composer card">
        <h2>{editing ? "Edit task" : "Add a new task"}</h2>
        <form onSubmit={saveTodo}>
          <div className="form-grid">
            <input
              className="title-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs to be done?"
              required
            />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Add a description (optional)"
            rows="3"
          />
          {error && <div className="error">{error}</div>}
          <div className="actions">
            <button className="primary">{editing ? "Save changes" : "Add task"}</button>
            {editing && <button type="button" className="ghost" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="toolbar">
        <div className="filters">
          {["all", "active", "completed"].map((name) => (
            <button key={name} className={filter === name ? "filter active" : "filter"} onClick={() => setFilter(name)}>
              {name[0].toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
        <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." />
      </section>

      <section className="todo-list">
        {visible.length === 0 ? (
          <div className="empty card">
            <div className="empty-icon">✓</div>
            <h3>No tasks here</h3>
            <p className="muted">Add a task above and make some progress.</p>
          </div>
        ) : (
          visible.map((todo) => (
            <article className={`todo card ${todo.completed ? "done" : ""}`} key={todo._id}>
              <button className="check" onClick={() => toggleTodo(todo)} aria-label="Toggle task">
                {todo.completed ? "✓" : ""}
              </button>
              <div className="todo-main">
                <div className="todo-heading">
                  <h3>{todo.title}</h3>
                  <span className={`priority ${todo.priority}`}>{todo.priority}</span>
                </div>
                {todo.description && <p>{todo.description}</p>}
                {todo.dueDate && <small>Due {new Date(todo.dueDate).toLocaleDateString()}</small>}
              </div>
              <div className="todo-actions">
                <button className="icon-btn" onClick={() => editTodo(todo)}>Edit</button>
                <button className="icon-btn danger" onClick={() => removeTodo(todo._id)}>Delete</button>
              </div>
            </article>
          ))
        )}
      </section>
      <div className="image-upload">
        <label className="image-upload-label">
          Task Image
        </label>

        <label className="upload-box">
          <div className="upload-icon">📷</div>

          <h4>Select an image</h4>

          <p>PNG, JPG, JPEG — maximum 5MB</p>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Selected preview" />

            <button
              type="button"
              className="remove-image"
              onClick={() => {
                setImage(null);
                setPreview("");
              }}
            >
              ×
            </button>
          </div>
        )}

      {image && (
        <button
          type="button"
          className="primary"
          onClick={uploadImage}
          disabled={uploading}
          style={{ marginTop: "12px" }}
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      )}

      {uploadedImage && (
        <div className="image-preview">
        <img
          src={`http://localhost:5000${uploadedImage}`}
          alt="Uploaded"
        />  
      </div>
     )}
    </div>
  </main>
  );
}

function Protected({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
