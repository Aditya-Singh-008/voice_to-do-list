import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Moon, Sun, LogOut, Mic, Bell } from "lucide-react";
import { useAuth, useLogout } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";
import TaskItem from "@/components/task-item";
import AddTaskModal from "@/components/add-task-modal";
import type { Task } from "@shared/schema";

type FilterType = "all" | "active" | "completed";

export default function Home() {
  const { user } = useAuth();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { initNotifications } = useNotifications();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  useEffect(() => {
    initNotifications();
  }, [initNotifications]);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout. Please try again.",
      });
    }
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case "active":
        return !task.completed;
      case "completed":
        return task.completed;
      default:
        return true;
    }
  });

  const taskCounts = {
    all: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };

  const handleTaskToggle = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed: !task.completed }),
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task.",
      });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Task has been successfully deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-material-1 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <Mic className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">VoiceTodo</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Welcome, {user?.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4">
          <div className="flex space-x-1">
            {(["all", "active", "completed"] as FilterType[]).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === filterType
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}{" "}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  filter === filterType
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}>
                  {taskCounts[filterType]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <main className="flex-1 px-4 py-6 pb-24">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-400 text-2xl" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {filter === "all" ? "Add your first task to get started" : `You have no ${filter} tasks`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleTaskToggle}
                onDelete={handleTaskDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-30">
        <Button
          onClick={() => setShowAddModal(true)}
          className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-material-4 hover:shadow-material-5 transition-all duration-200"
        >
          <Plus size={20} />
        </Button>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
