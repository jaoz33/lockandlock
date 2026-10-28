import { getTasks, getTask, createTask, updateTask, deleteTask } from './supabase.js';

export async function listTasks() {
  return getTasks();
}

export async function readTask(id) {
  return getTask(id);
}

export async function addTask(task) {
  return createTask(task);
}

export async function saveTask(id, updates) {
  return updateTask(id, updates);
}

export async function removeTask(id) {
  return deleteTask(id);
}
