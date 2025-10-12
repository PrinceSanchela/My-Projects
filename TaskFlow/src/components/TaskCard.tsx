import { Task } from "@/types/task";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard = ({ task, onToggleComplete, onDelete, onEdit }: TaskCardProps) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed;

  const priorityColors = {
    low: "bg-blue-100 text-blue-700 border-blue-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <Card
      className={cn(
        "p-4 transition-all hover:shadow-md",
        task.is_completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.is_completed}
          onCheckedChange={(checked) => onToggleComplete(task.id, checked as boolean)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={cn(
                  "font-medium text-lg",
                  task.is_completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            {task.due_date && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-md border",
                  isOverdue
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due_date), "MMM d, yyyy")}
                <Clock className="h-3 w-3 ml-1" />
                {format(new Date(task.due_date), "h:mm a")}
              </div>
            )}
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-md border font-medium",
                priorityColors[task.priority]
              )}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
