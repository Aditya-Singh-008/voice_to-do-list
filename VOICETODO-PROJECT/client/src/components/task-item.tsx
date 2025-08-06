import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CheckCircle2, Circle, Play, Clock, AlertTriangle, MoreVertical, Trash2 } from "lucide-react";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import type { Task } from "@shared/schema";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVoiceNote = () => {
    if (!task.voiceNoteData) return;

    try {
      // Convert base64 to audio blob and play
      const audio = new Audio(task.voiceNoteData);
      setIsPlaying(true);
      audio.play();
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
    } catch (error) {
      console.error("Failed to play voice note:", error);
      setIsPlaying(false);
    }
  };

  const formatReminderTime = (reminderDate: Date | null) => {
    if (!reminderDate) return null;

    const date = typeof reminderDate === "string" ? parseISO(reminderDate) : reminderDate;
    
    if (isToday(date)) {
      return `Today ${format(date, "h:mm a")}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  const isUrgent = task.reminderDate && isPast(typeof task.reminderDate === "string" ? parseISO(task.reminderDate) : task.reminderDate);
  const reminderText = formatReminderTime(task.reminderDate);

  const priorityColors = {
    low: "border-l-green-500",
    normal: "",
    high: "border-l-red-500",
  };

  return (
    <div className={`task-item bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-material-1 border border-gray-100 dark:border-gray-700 ${task.priority === "high" ? priorityColors.high : task.priority === "low" ? priorityColors.low : ""} ${task.completed ? "opacity-60" : ""}`}>
      <div className="flex items-start space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(task.id)}
          className={`w-6 h-6 p-0 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors ${
            task.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 dark:border-gray-600 hover:border-primary-500"
          }`}
        >
          {task.completed ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4 opacity-0" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <p className={`font-medium ${
            task.completed 
              ? "text-gray-500 dark:text-gray-400 line-through" 
              : "text-gray-900 dark:text-white"
          }`}>
            {task.title}
          </p>

          <div className="flex items-center space-x-2 mt-2">
            {reminderText && (
              <div className={`flex items-center space-x-1 text-xs ${
                isUrgent 
                  ? "text-red-600 dark:text-red-400" 
                  : task.completed
                    ? "text-gray-400"
                    : "text-gray-500 dark:text-gray-400"
              }`}>
                {isUrgent ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                <span>{reminderText}</span>
              </div>
            )}

            {task.voiceNoteData && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayVoiceNote}
                  className="p-1.5 bg-secondary-100 dark:bg-secondary-900 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-800"
                  disabled={isPlaying}
                >
                  <Play className="text-secondary-600 dark:text-secondary-400 w-3 h-3" />
                </Button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {task.voiceNoteDuration || "0:00"}
                </span>
              </div>
            )}

            {task.completed && (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}