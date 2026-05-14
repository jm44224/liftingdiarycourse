# Authentication

## Provider: Clerk

This app uses **Clerk** for all authentication. Do not implement custom auth, session handling, or JWT logic.

- Do not use NextAuth, Auth.js, or any other auth library.
- Do not manage sessions manually.
- All auth state is provided by Clerk.

## Getting the Current User

Always use Clerk's server-side helpers to resolve the authenticated user in server components and data helpers. Never trust a user ID from the client.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) throw new Error("Unauthenticated");
```

## Protecting Pages

Protect pages at the middleware level using Clerk's `clerkMiddleware`. Do not add per-page auth checks as a substitute for middleware protection.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

## Sign-in / Sign-up Pages

Use Clerk's hosted or embedded components — do not build custom sign-in or sign-up forms.

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

## Accessing the User in Data Helpers

All `/data` helpers that touch user data must resolve the user from Clerk on the server side:

```ts
// src/data/workouts.ts
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workouts } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

Never accept a `userId` as a parameter from a client component or URL. Always derive it from `auth()`.

## User Identity in the Database

Store Clerk's `userId` string (e.g. `user_2abc...`) as the foreign key on all user-owned records. Do not create a separate users table unless additional profile data must be stored beyond what Clerk provides.
