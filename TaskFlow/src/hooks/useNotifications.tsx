import { useEffect, useState } from "react";
import { Task } from "@/types/task";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return "denied";
  };

  const showNotification = (task: Task) => {
    if (permission === "granted" && "Notification" in window) {
      const notification = new Notification("Task Reminder", {
        body: `"${task.title}" is due soon!`,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: task.id,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Play a sound
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiY4PTOYDQHCEY3vqGk2j4");
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    }
  };

  return {
    permission,
    requestPermission,
    showNotification,
  };
};
