"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { updateWorkout } from "@/data/workouts";
import { addExerciseToWorkout, removeExerciseFromWorkout } from "@/data/workoutExercises";
import { createExercise } from "@/data/exercises";
import { addSet, updateSet, deleteSet } from "@/data/sets";

const updateWorkoutSchema = z.object({
  workoutId: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  startedAt: z.string().transform((s) => new Date(s)),
  completedAt: z.string().optional().transform((s) => (s ? new Date(s) : null)),
});

export async function updateWorkoutAction(workoutId: string, name: string, startedAt: string, completedAt: string) {
  const parsed = updateWorkoutSchema.parse({ workoutId, name, startedAt, completedAt });
  await updateWorkout(parsed.workoutId, parsed.name, parsed.startedAt, parsed.completedAt);
  redirect(`/dashboard?date=${parsed.startedAt.toISOString().split("T")[0]}`);
}

const addExerciseSchema = z.object({
  workoutId: z.string().min(1),
  exerciseId: z.string().min(1),
});

export async function addExerciseToWorkoutAction(workoutId: string, exerciseId: string) {
  const parsed = addExerciseSchema.parse({ workoutId, exerciseId });
  await addExerciseToWorkout(parsed.workoutId, parsed.exerciseId);
  refresh();
}

const removeExerciseSchema = z.object({
  workoutExerciseId: z.string().min(1),
  workoutId: z.string().min(1),
});

export async function removeExerciseFromWorkoutAction(workoutExerciseId: string, workoutId: string) {
  const parsed = removeExerciseSchema.parse({ workoutExerciseId, workoutId });
  await removeExerciseFromWorkout(parsed.workoutExerciseId);
  refresh();
}

const addSetSchema = z.object({
  workoutExerciseId: z.string().min(1),
  reps: z.number().int().positive(),
  weight: z.number().nonnegative(),
  workoutId: z.string().min(1),
});

export async function addSetAction(workoutExerciseId: string, reps: number, weight: number, workoutId: string) {
  const parsed = addSetSchema.parse({ workoutExerciseId, reps, weight, workoutId });
  await addSet(parsed.workoutExerciseId, parsed.reps, parsed.weight);
  refresh();
}

const updateSetSchema = z.object({
  setId: z.string().min(1),
  reps: z.number().int().positive(),
  weight: z.number().nonnegative(),
  workoutId: z.string().min(1),
});

export async function updateSetAction(setId: string, reps: number, weight: number, workoutId: string) {
  const parsed = updateSetSchema.parse({ setId, reps, weight, workoutId });
  await updateSet(parsed.setId, parsed.reps, parsed.weight);
  refresh();
}

const deleteSetSchema = z.object({
  setId: z.string().min(1),
  workoutId: z.string().min(1),
});

export async function deleteSetAction(setId: string, workoutId: string) {
  const parsed = deleteSetSchema.parse({ setId, workoutId });
  await deleteSet(parsed.setId);
  refresh();
}

const createAndAddExerciseSchema = z.object({
  workoutId: z.string().min(1),
  name: z.string().min(1),
});

export async function createAndAddExerciseAction(workoutId: string, name: string) {
  const parsed = createAndAddExerciseSchema.parse({ workoutId, name });
  const exercise = await createExercise(parsed.name);
  await addExerciseToWorkout(parsed.workoutId, exercise.id);
  refresh();
}
