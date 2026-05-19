import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sets, workoutExercises, workouts } from "@/db/schema";
import { eq, and, max } from "drizzle-orm";

export async function addSet(workoutExerciseId: string, reps: number, weight: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [row] = await db
    .select()
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(workoutExercises.id, workoutExerciseId), eq(workouts.userId, userId)));

  if (!row) throw new Error("Not found");

  const [{ value: maxSetNumber }] = await db
    .select({ value: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  const setNumber = (maxSetNumber ?? 0) + 1;

  const [set] = await db
    .insert(sets)
    .values({ workoutExerciseId, reps, weight, setNumber })
    .returning();
  return set;
}

export async function updateSet(setId: string, reps: number, weight: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [row] = await db
    .select()
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)));

  if (!row) throw new Error("Not found");

  const [updated] = await db
    .update(sets)
    .set({ reps, weight })
    .where(eq(sets.id, setId))
    .returning();
  return updated;
}

export async function deleteSet(setId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [row] = await db
    .select()
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)));

  if (!row) throw new Error("Not found");

  await db.delete(sets).where(eq(sets.id, setId));
}
