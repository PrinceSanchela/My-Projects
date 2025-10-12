export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}
