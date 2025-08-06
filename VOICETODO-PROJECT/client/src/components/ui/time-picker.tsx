import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hours, setHours] = React.useState(value ? parseInt(value.split(':')[0]) : 12);
  const [minutes, setMinutes] = React.useState(value ? parseInt(value.split(':')[1]) : 0);
  const [period, setPeriod] = React.useState(
    value ? (parseInt(value.split(':')[0]) >= 12 ? 'PM' : 'AM') : 'AM'
  );

  const formatTime = (h: number, m: number, p: string) => {
    const hour24 = p === 'PM' && h !== 12 ? h + 12 : p === 'AM' && h === 12 ? 0 : h;
    return `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const displayTime = (h: number, m: number, p: string) => {
    return `${h}:${m.toString().padStart(2, '0')} ${p}`;
  };

  const handleTimeChange = (newHours: number, newMinutes: number, newPeriod: string) => {
    setHours(newHours);
    setMinutes(newMinutes);
    setPeriod(newPeriod);
    const timeString = formatTime(newHours, newMinutes, newPeriod);
    onChange?.(timeString);
  };

  const handleHourChange = (delta: number) => {
    const newHours = ((hours + delta - 1 + 12) % 12) + 1;
    handleTimeChange(newHours, minutes, period);
  };

  const handleMinuteChange = (delta: number) => {
    const newMinutes = (minutes + delta + 60) % 60;
    handleTimeChange(hours, newMinutes, period);
  };

  const togglePeriod = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM';
    handleTimeChange(hours, minutes, newPeriod);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal px-4 py-3 rounded-xl",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? displayTime(hours, minutes, period) : "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex items-center space-x-2">
          {/* Hours */}
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleHourChange(1)}
              className="h-8 w-8 p-0"
            >
              ▲
            </Button>
            <div className="w-12 h-10 flex items-center justify-center border rounded text-lg font-semibold">
              {hours}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleHourChange(-1)}
              className="h-8 w-8 p-0"
            >
              ▼
            </Button>
          </div>

          <div className="text-2xl font-bold">:</div>

          {/* Minutes */}
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMinuteChange(5)}
              className="h-8 w-8 p-0"
            >
              ▲
            </Button>
            <div className="w-12 h-10 flex items-center justify-center border rounded text-lg font-semibold">
              {minutes.toString().padStart(2, '0')}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMinuteChange(-5)}
              className="h-8 w-8 p-0"
            >
              ▼
            </Button>
          </div>

          {/* AM/PM */}
          <div className="flex flex-col items-center ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePeriod}
              className="h-16 w-12 flex flex-col text-sm font-semibold"
            >
              <span className={period === 'AM' ? 'text-primary' : 'text-muted-foreground'}>AM</span>
              <span className={period === 'PM' ? 'text-primary' : 'text-muted-foreground'}>PM</span>
            </Button>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}