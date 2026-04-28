"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

const mockWorkouts = [
  {
    id: 1,
    name: "Morning Push",
    startTime: new Date(2026, 3, 28, 6, 30),
    endTime: new Date(2026, 3, 28, 7, 15),
    tags: ["chest", "shoulders", "triceps"],
  },
  {
    id: 2,
    name: "Leg Day",
    startTime: new Date(2026, 3, 28, 12, 0),
    endTime: new Date(2026, 3, 28, 13, 10),
    tags: ["quads", "hamstrings", "glutes"],
  },
  {
    id: 3,
    name: "Evening Pull",
    startTime: new Date(2026, 3, 28, 18, 45),
    endTime: new Date(2026, 3, 28, 19, 30),
    tags: ["back", "biceps"],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setDate(new Date());
  }, []);

  return (
    <main className="flex flex-col gap-6 px-6 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Workout Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Select Date</h2>
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={(d) => d && setDate(d)}
            className="rounded-lg border border-gray-200 bg-white"
          />
        </div>

        <section className="flex flex-col gap-3 flex-1 w-full">
          <h2 className="text-lg font-medium">
            Workouts for {date ? format(date, "do MMM yyyy") : "—"}
          </h2>

          {mockWorkouts.length === 0 ? (
            <p className="text-sm text-gray-500">No workouts logged for this date.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {mockWorkouts.map((workout) => {
                const durationMins = Math.round(
                  (workout.endTime.getTime() - workout.startTime.getTime()) / 60000
                );
                const hours = Math.floor(durationMins / 60);
                const mins = durationMins % 60;
                const durationLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                return (
                  <li
                    key={workout.id}
                    className="flex flex-col gap-2 rounded-lg border border-gray-200 px-4 py-3 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{workout.name}</span>
                      <span className="text-sm text-gray-500">
                        {format(workout.startTime, "h:mm a")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {workout.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="text-gray-400 mr-1">Duration</span>
                      {durationLabel}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
