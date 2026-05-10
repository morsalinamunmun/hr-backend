// task.model.ts

import { Schema, model } from "mongoose";
import { ITask } from "./task.interface";

const commentSchema = new Schema(
  {
    author: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  { _id: true }
);

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"],
      default: "todo",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    category: {
      type: String,
      default: "Other",
    },

    assignedTo: {
      type: String,
      required: true,
    },

    dueDate: {
      type: String,
      required: true,
    },

    createdBy: {
      type: String,
      required: true,
    },

    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

export const Task = model<ITask>("Task", taskSchema);