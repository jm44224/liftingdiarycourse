import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function createWorkout(name: string, startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning();
  return workout;
}

export async function getWorkoutsForDate(date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay),
        lt(workouts.startedAt, endOfDay)
      )
    );
}
