"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { createWorkoutAction } from "./actions";

function defaultTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function NewWorkoutForm({ defaultDate }: { defaultDate: string }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Workout name is required.");
      return;
    }
    startTransition(async () => {
      try {
        await createWorkoutAction(name.trim(), `${date}T${time}`);
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setError("Failed to create workout. Please try again.");
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
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Workout"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
