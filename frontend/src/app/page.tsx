"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Task = {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">("pending");
  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const API_URL = "http://localhost:5000/api/tasks";

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL, {
        params: { keyword, status: filterStatus },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [keyword, filterStatus]);

  // Create or Update task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.put(`${API_URL}/${editingTask._id}`, { title, description, status });
        setEditingTask(null);
      } else {
        await axios.post(API_URL, { title, description, status });
      }
      setTitle("");
      setDescription("");
      setStatus("pending");
      fetchTasks();
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  // Edit task
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
  };

  // Delete task
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center mb-6">📝 Task Manager</h1>

        {/* Task Form */}
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-3">
            {editingTask ? "✏️ Edit Task" : "➕ Add New Task"}
          </h2>Create Task Title:
          <input
            type="text"
            placeholder="..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded mb-3"
            required
          />Enter Task Description:
          <textarea
            placeholder="..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          />Select Task Status:
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Task["status"])}
            className="w-full border p-2 rounded mb-3"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            {editingTask ? "Update Task" : "Add Task"}
          </button>
        </form>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white p-4 rounded-2xl shadow flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-bold">{task.title}</h3>
                <p className="text-gray-600">{task.description}</p>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    task.status === "pending"
                      ? "bg-yellow-200 text-yellow-700"
                      : task.status === "in-progress"
                      ? "bg-blue-200 text-blue-700"
                      : "bg-green-200 text-green-700"
                  }`}
                >
                  {task.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <p className="text-center text-gray-500">No tasks found.</p>
          )}
        </div>
      </div>
    </main>
  );
}
