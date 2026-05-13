"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  startedAt: z.string().transform((s) => new Date(s)),
});

export async function updateWorkoutAction(workoutId: string, name: string, startedAt: string) {
  const parsed = updateWorkoutSchema.parse({ workoutId, name, startedAt });
  await updateWorkout(parsed.workoutId, parsed.name, parsed.startedAt);
  redirect(`/dashboard?date=${parsed.startedAt.toISOString().split("T")[0]}`);
}
