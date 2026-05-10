// task.service.ts

import { Task } from "./task.model";
import { ITask } from "./task.interface";

const createTask = async (payload: ITask) => {
  const result = await Task.create(payload);
  return result;
};

const getAllTasks = async () => {
  const result = await Task.find().sort({ createdAt: -1 });
  return result;
};

const getSingleUserTasks = async (assignedTo: string) => {
  const result = await Task.find({
    assignedTo,
  }).sort({ createdAt: -1 });

  return result;
};

const getSingleTask = async (id: string) => {
  const result = await Task.findById(id);
  return result;
};

const updateTask = async (
  id: string,
  payload: Partial<ITask>
) => {
  const result = await Task.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
    }
  );

  return result;
};

const deleteTask = async (id: string) => {
  const result = await Task.findByIdAndDelete(id);
  return result;
};

const addComment = async (
  id: string,
  comment: {
    author: string;
    content: string;
  }
) => {
  const result = await Task.findByIdAndUpdate(
    id,
    {
      $push: {
        comments: {
          ...comment,
          createdAt: new Date().toISOString(),
        },
      },
    },
    { new: true }
  );

  return result;
};

export const TaskService = {
  createTask,
  getAllTasks,
  getSingleUserTasks,
  getSingleTask,
  updateTask,
  deleteTask,
  addComment,
};