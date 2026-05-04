# Data Mutations

## Rule: All Database Mutations via `/data` Helpers

Never write database mutation queries inline in a server action, component, or page. All inserts, updates, and deletes must live in helper functions under the `/data` directory and must use **Drizzle ORM** — never raw SQL.

```
src/
  data/
    workouts.ts   ← Drizzle queries AND mutations for workouts
    exercises.ts  ← Drizzle queries AND mutations for exercises
    sets.ts       ← Drizzle queries AND mutations for sets
```

```ts
// CORRECT — Drizzle ORM mutation in a /data helper
// src/data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/schema";
import { auth } from "@/lib/auth";

export async function createWorkout(name: string, date: Date) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  return db.insert(workouts).values({ name, date, userId: session.user.id });
}
```

```ts
// WRONG — mutation written inline in a server action
"use server";
export async function createWorkoutAction(name: string) {
  await db.insert(workouts).values({ name }); // ❌ — must go through /data helper
}
```

## Rule: Mutations Must Be Done via Server Actions

All data mutations must be triggered through **Next.js Server Actions**. No mutation may be performed via route handlers (`app/api/...`) or client-side fetch calls.

Server actions must live in **colocated `actions.ts` files** — one per route segment, placed next to the page or component that uses them.

```
src/app/
  workouts/
    page.tsx
    actions.ts   ← server actions for this route
    new/
      page.tsx
      actions.ts ← server actions for this sub-route
```

```ts
// CORRECT — colocated actions.ts
// src/app/workouts/new/actions.ts
"use server";

export async function createWorkoutAction(...) { ... }
```

```ts
// WRONG — server action defined inside a page or component file
// src/app/workouts/new/page.tsx
async function createWorkout() {  // ❌ — must be in actions.ts
  "use server";
  ...
}
```

## Rule: Typed Parameters — No FormData

All server action parameters must be **explicitly typed**. The `FormData` type is forbidden as a parameter type.

Extract and validate individual values before passing them to a server action. Never pass a raw `FormData` object.

```ts
// CORRECT — explicit typed parameters
export async function createWorkoutAction(name: string, date: Date) { ... }
```

```ts
// WRONG — FormData parameter
export async function createWorkoutAction(data: FormData) { // ❌
  const name = data.get("name");
  ...
}
```

## Rule: Validate All Arguments with Zod

Every server action **must** validate its arguments with **Zod** before doing anything else. Never trust the caller to pass well-formed data.

Define a Zod schema at the top of the action and parse the incoming arguments through it. Throw or return an error if validation fails.

```ts
// CORRECT — Zod validation at the top of every server action
// src/app/workouts/new/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

export async function createWorkoutAction(name: string, date: Date) {
  const parsed = createWorkoutSchema.parse({ name, date });
  await createWorkout(parsed.name, parsed.date);
}
```

```ts
// WRONG — no validation before calling the /data helper
export async function createWorkoutAction(name: string, date: Date) {
  await createWorkout(name, date); // ❌ — arguments never validated
}
```
