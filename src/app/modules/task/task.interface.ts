// task.interface.ts

export interface IComment {
  id?: string;
  author: string;
  content: string;
  createdAt?: string;
}

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "review"
  | "done";

export type TaskPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export interface ITask {
  title: string;
  project: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  assignedTo: string;
  dueDate: string;
  createdBy: string;
  comments?: IComment[];
}