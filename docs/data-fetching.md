# Data Fetching

## Rule: Server Components Only

ALL data fetching must be done in **React Server Components**. No exceptions.

- **DO NOT** fetch data in client components (`"use client"`)
- **DO NOT** fetch data in route handlers (`app/api/...`)
- **DO NOT** use `useEffect` + `fetch` patterns
- **DO NOT** use SWR, React Query, or any client-side fetching library

Fetch data at the page or layout level in a server component, then pass it down as props to client components that need interactivity.

```tsx
// CORRECT — server component fetches, client component receives props
// app/workouts/page.tsx (server component)
import { getWorkoutsForUser } from "@/data/workouts";

export default async function WorkoutsPage() {
  const workouts = await getWorkoutsForUser(userId);
  return <WorkoutList workouts={workouts} />;
}
```

```tsx
// WRONG — never fetch in a client component
"use client";
export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => {
    fetch("/api/workouts").then(...); // ❌
  }, []);
}
```

## Rule: All Database Queries via `/data` Helpers

Never write database queries inline in a component or page. All queries must live in helper functions under the `/data` directory and must use **Drizzle ORM** — never raw SQL.

```
src/
  data/
    workouts.ts   ← Drizzle queries for workouts
    exercises.ts  ← Drizzle queries for exercises
    sets.ts       ← Drizzle queries for sets
```

```ts
// CORRECT — Drizzle ORM in a /data helper
// src/data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```ts
// WRONG — raw SQL
export async function getWorkoutsForUser(userId: string) {
  return db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`); // ❌
}
```

## Rule: Always Scope Queries to the Authenticated User

Every `/data` helper that returns user data **must** filter by the authenticated user's ID. A user must never be able to access another user's data — even if they manipulate a URL parameter or request payload.

Always resolve the current user inside the helper (or accept `userId` from the server component that resolved it from the session), and always include a `where ... userId = currentUserId` clause.

```ts
// src/data/workouts.ts
import { auth } from "@/lib/auth";

export async function getWorkoutsForUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, session.user.id)); // scoped to the logged-in user
}
```

Never trust a `userId` that arrives from the client (URL params, request body, query strings). Always derive it from the server-side session.
