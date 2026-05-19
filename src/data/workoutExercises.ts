import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function getWorkoutWithExercisesAndSets(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const workout = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  if (!workout[0]) return null;

  const rows = await db
    .select()
    .from(workoutExercises)
    .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(workoutExercises.order, sets.setNumber);

  // Group sets by workoutExercise
  const map = new Map<string, { workoutExercise: typeof rows[0]["workout_exercises"]; exercise: typeof rows[0]["exercises"]; sets: typeof rows[0]["sets"][] }>();
  for (const row of rows) {
    const key = row.workout_exercises.id;
    if (!map.has(key)) {
      map.set(key, { workoutExercise: row.workout_exercises, exercise: row.exercises, sets: [] });
    }
    if (row.sets) {
      map.get(key)!.sets.push(row.sets);
    }
  }

  return Array.from(map.values());
}

export async function addExerciseToWorkout(workoutId: string, exerciseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  if (!workout) throw new Error("Workout not found");

  const [{ value: currentCount }] = await db
    .select({ value: count() })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order: currentCount + 1 })
    .returning();
  return workoutExercise;
}

export async function removeExerciseFromWorkout(workoutExerciseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  // Scope check: ensure this workoutExercise belongs to a workout owned by this user
  const [row] = await db
    .select()
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(workoutExercises.id, workoutExerciseId), eq(workouts.userId, userId)));

  if (!row) throw new Error("Not found");

  await db.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId));
}
