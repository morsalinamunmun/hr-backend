/* eslint-disable @typescript-eslint/no-explicit-any */
// task.controller.ts

import { Request, Response } from "express";
import { TaskService } from "./task.service";

// create task
const createTask = async (req: Request, res: Response) => {
  try {
    const result = await TaskService.createTask(req.body);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get all tasks
const getAllTasks = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await TaskService.getAllTasks();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get user tasks
const getSingleUserTasks = async (
  req: Request,
  res: Response
) => {
  try {
    const { assignedTo } = req.params;

    const result =
      await TaskService.getSingleUserTasks(
        assignedTo
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get single task
const getSingleTask = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result =
      await TaskService.getSingleTask(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update task
const updateTask = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result =
      await TaskService.updateTask(
        id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete task
const deleteTask = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    await TaskService.deleteTask(id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// add comment
const addComment = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result =
      await TaskService.addComment(
        id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const TaskController = {
  createTask,
  getAllTasks,
  getSingleUserTasks,
  getSingleTask,
  updateTask,
  deleteTask,
  addComment,
};