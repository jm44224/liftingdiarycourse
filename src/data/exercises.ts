import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function getAllExercises() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return db.select().from(exercises).orderBy(asc(exercises.name));
}

export async function createExercise(name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [exercise] = await db.insert(exercises).values({ name }).returning();
  return exercise;
}
