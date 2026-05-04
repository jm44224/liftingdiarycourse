"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(name: string, startedAt: Date) {
  const parsed = createWorkoutSchema.parse({ name, startedAt });
  const workout = await createWorkout(parsed.name, parsed.startedAt);
  redirect(`/dashboard?date=${parsed.startedAt.toISOString().split("T")[0]}`);
}
