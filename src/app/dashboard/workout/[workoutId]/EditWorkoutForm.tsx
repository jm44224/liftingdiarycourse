"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { updateWorkoutAction } from "./actions";

type Props = {
  workoutId: string;
  defaultName: string;
  defaultDate: string;
  defaultTime: string;
  defaultEndDate: string;
  defaultEndTime: string;
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export default function EditWorkoutForm({
  workoutId,
  defaultName,
  defaultDate,
  defaultTime,
  defaultEndDate,
  defaultEndTime,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [endDate, setEndDate] = useState(defaultEndDate || defaultDate);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const duration = useMemo(() => {
    if (!date || !time) return null;
    if (!endDate || !endTime) return "In Progress";
    const start = new Date(`${date}T${time}`);
    const end = new Date(`${endDate}T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return "In Progress";
    return formatDuration(Math.round(diffMs / 60000));
  }, [date, time, endDate, endTime]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Workout name is required.");
      return;
    }
    const completedAt = endDate && endTime ? `${endDate}T${endTime}` : "";
    startTransition(async () => {
      try {
        await updateWorkoutAction(workoutId, name.trim(), `${date}T${time}`, completedAt);
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setError("Failed to update workout. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workout Name</Label>
        <Input
          id="name"
          placeholder="e.g. Morning Push Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Start</p>
        <div className="flex gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 flex-1">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">End</p>
        <div className="flex gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="endDate">Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="endTime">Time</Label>
              {endTime && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setEndTime("")}
                >
                  Clear
                </button>
              )}
            </div>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      {duration && (
        <div className="space-y-2">
          <Label>Duration</Label>
          <Input value={duration} readOnly className="bg-muted text-muted-foreground cursor-default" />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
