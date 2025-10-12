import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { toast } from "sonner";

export const useTasksDB = (userId: string | undefined) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchTasks();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchTasks = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load tasks");
      console.error('Error fetching tasks:', error);
    } else {
      // Transform database format to Task type
      const transformedTasks: Task[] = (data || []).map(dbTask => ({
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description || undefined,
        priority: dbTask.priority as Task['priority'],
        category: dbTask.category || undefined,
        completed: dbTask.completed,
        createdAt: dbTask.created_at,
      }));
      setTasks(transformedTasks);
    }
    setLoading(false);
  };

  const addTask = async (task: Omit<Task, "id">) => {
    if (!userId) return;

    const { error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: userId }]);

    if (error) {
      toast.error("Failed to add task");
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    if (!userId) return;

    const { error } = await supabase
      .from('tasks')
      .update({
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        category: updatedTask.category,
        completed: updatedTask.completed,
      })
      .eq('id', updatedTask.id)
      .eq('user_id', userId);

    if (error) {
      toast.error("Failed to update task");
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      toast.error("Failed to delete task");
      console.error('Error deleting task:', error);
    }
  };

  const toggleTask = async (id: string) => {
    if (!userId) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      toast.error("Failed to update task");
      console.error('Error toggling task:', error);
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
};
