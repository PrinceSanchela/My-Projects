export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category?: string;
  completed: boolean;
  createdAt: string;
}
