// task.route.ts

import express from "express";
import { TaskController } from "./task.controller";

const router = express.Router();

router.post("/", TaskController.createTask);

router.get("/", TaskController.getAllTasks);

router.get(
  "/user/:assignedTo",
  TaskController.getSingleUserTasks
);

router.get("/:id", TaskController.getSingleTask);

router.patch("/:id", TaskController.updateTask);

router.delete("/:id", TaskController.deleteTask);

router.patch(
  "/comment/:id",
  TaskController.addComment
);

export const TaskRoutes = router;