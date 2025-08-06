import { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

export function useNotifications() {
  const { toast } = useToast();
  
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const requestPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }, []);

  const scheduleNotification = useCallback((task: Task) => {
    if (!task.reminderDate || task.completed) return;

    const reminderTime = new Date(task.reminderDate).getTime();
    const now = Date.now();
    const delay = reminderTime - now;

    if (delay > 0) {
      setTimeout(() => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("VoiceTodo Reminder", {
            body: task.title,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: task.id,
          });
        }

        // Also show in-app toast
        toast({
          title: "Task Reminder",
          description: task.title,
        });
      }, delay);
    }
  }, [toast]);

  const initNotifications = useCallback(async () => {
    const hasPermission = await requestPermission();
    
    if (hasPermission) {
      // Schedule notifications for all tasks with reminders
      tasks.forEach(task => {
        if (task.reminderDate && !task.completed) {
          scheduleNotification(task);
        }
      });
    }
  }, [tasks, requestPermission, scheduleNotification]);

  useEffect(() => {
    // Check for due tasks every minute
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.reminderDate && !task.completed) {
          const reminderTime = new Date(task.reminderDate);
          const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
          
          // If within 1 minute of reminder time
          if (timeDiff < 60000) {
            toast({
              title: "Task Reminder",
              description: task.title,
            });
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks, toast]);

  return {
    initNotifications,
    scheduleNotification,
  };
}
