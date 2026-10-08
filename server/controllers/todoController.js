import mongoose from "mongoose";
import Todo from "../models/Todo.js";

function ownerQuery(req, id) {
  return { _id: id, user: req.user._id };
}

export async function listTodos(req, res) {
  const todos = await Todo.find({ user: req.user._id }).sort({ completed: 1, createdAt: -1 });
  res.json(todos);
}

export async function getTodo(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Todo not found" });
  }

  const todo = await Todo.findOne(ownerQuery(req, req.params.id));
  if (!todo) return res.status(404).json({ message: "Todo not found" });

  res.json(todo);
}

export async function createTodo(req, res) {
  const { title, description = "", priority = "medium", dueDate = null } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  const todo = await Todo.create({
    title: title.trim(),
    description,
    priority,
    dueDate: dueDate || null,
    user: req.user._id
  });

  res.status(201).json(todo);
}

export async function updateTodo(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Todo not found" });
  }

  const allowed = ["title", "description", "completed", "priority", "dueDate"];
  const updates = {};

  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }

  if ("title" in updates && !updates.title?.trim()) {
    return res.status(400).json({ message: "Title cannot be empty" });
  }

  const todo = await Todo.findOneAndUpdate(
    ownerQuery(req, req.params.id),
    updates,
    { new: true, runValidators: true }
  );

  if (!todo) return res.status(404).json({ message: "Todo not found" });

  res.json(todo);
}

export async function deleteTodo(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Todo not found" });
  }

  const todo = await Todo.findOneAndDelete(ownerQuery(req, req.params.id));
  if (!todo) return res.status(404).json({ message: "Todo not found" });

  res.json({ message: "Todo deleted" });
}
