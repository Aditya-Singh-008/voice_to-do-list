import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, MicOff, Play, Trash2, X, Square, MessageSquare } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecording } from "@/hooks/use-voice-recording";
import { useVoiceToText } from "@/hooks/use-voice-to-text";
import { apiRequest } from "@/lib/queryClient";
import type { InsertTask } from "@shared/schema";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Priority = "low" | "normal" | "high";

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [isSaving, setIsSaving] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Voice recording for audio notes
  const {
    isRecording,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    playRecording,
    clearRecording,
    formatDuration,
  } = useVoiceRecording();

  // Voice-to-text for task creation
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  } = useVoiceToText();

  // Update title when voice-to-text provides transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setTitle(transcript);
    }
  }, [transcript, isListening]);

  const handleClose = () => {
    setTitle("");
    setReminderDate("");
    setReminderTime("");
    setPriority("normal");
    clearRecording();
    clearTranscript();
    onClose();
  };

  const handleVoiceToText = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a task title.",
      });
      return;
    }

    setIsSaving(true);

    try {
      let voiceNoteData = null;
      let voiceNoteDuration = null;

      if (audioBlob) {
        // Convert audio blob to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });
        voiceNoteData = await base64Promise;
        voiceNoteDuration = formatDuration(duration);
      }

      let reminderDateTime = null;
      if (reminderDate && reminderTime) {
        reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
      }

      const taskData: InsertTask = {
        title: title.trim(),
        priority,
        reminderDate: reminderDateTime,
        voiceNoteData,
        voiceNoteDuration,
      };

      await apiRequest("POST", "/api/tasks", taskData);
      
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      toast({
        title: "Task created",
        description: "Your task has been successfully created.",
      });
      
      handleClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create task.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const priorityOptions = [
    { value: "low" as Priority, label: "Low", color: "bg-green-500" },
    { value: "normal" as Priority, label: "Normal", color: "bg-blue-500" },
    { value: "high" as Priority, label: "High", color: "bg-red-500" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden slide-in">
        <DialogHeader className="flex flex-row items-center justify-between p-0">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Task
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto">
          {/* Task Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Task</Label>
              {isSupported && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceToText}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening 
                      ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  disabled={isSaving}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 mr-1" />
                      <span className="text-xs">Listening...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      <span className="text-xs">Voice to Text</span>
                    </>
                  )}
                </Button>
              )}
            </div>
            <Textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isListening ? "Speak your task..." : "What do you need to do?"}
              rows={3}
              className={`mt-2 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                isListening ? "border-red-300 dark:border-red-600" : ""
              }`}
            />
            {isListening && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 recording-pulse"></div>
                Listening for your task description...
              </p>
            )}
          </div>

          {/* Voice Recording Section */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Voice Note (Optional)
              </Label>
              {isRecording && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full recording-pulse"></div>
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {formatDuration(duration)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <Button
                type="button"
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full shadow-material-2 hover:shadow-material-3 transition-all duration-200 ${
                  isRecording 
                    ? "bg-gray-500 hover:bg-gray-600" 
                    : "bg-red-500 hover:bg-red-600"
                } text-white`}
              >
                {isRecording ? <Square size={24} /> : <Mic size={24} />}
              </Button>

              {audioBlob && (
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    onClick={playRecording}
                    className="w-10 h-10 bg-secondary-500 hover:bg-secondary-600 text-white rounded-full"
                  >
                    <Play size={16} />
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDuration(duration)}
                  </span>
                  <Button
                    type="button"
                    onClick={clearRecording}
                    className="w-10 h-10 bg-gray-400 hover:bg-gray-500 text-white rounded-full"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              Tap to record • Hold for long recording
            </p>
          </div>

          {/* Reminder Section */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Reminder (Optional)
            </Label>
            <div className="grid grid-cols-1 gap-3">
              <Input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Select date"
              />
              <TimePicker
                value={reminderTime}
                onChange={setReminderTime}
                className="w-full"
              />
            </div>
          </div>

          {/* Priority Section */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Priority
            </Label>
            <div className="flex space-x-3">
              {priorityOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  onClick={() => setPriority(option.value)}
                  className={`flex-1 p-3 rounded-xl text-center transition-colors ${
                    priority === option.value
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                      : "border-gray-200 dark:border-gray-600 hover:border-primary-500"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className={`w-3 h-3 ${option.color} rounded-full`} />
                    <span className="text-sm">{option.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-material-2"
          >
            {isSaving ? "Saving..." : "Save Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}