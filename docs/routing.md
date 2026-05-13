# Routing Standards

## Rule: All App Routes Live Under `/dashboard`

Every page in this application must be nested under the `/dashboard` route segment. There are no top-level app pages outside of auth pages (`/sign-in`, `/sign-up`) and the marketing/landing root (`/`).

```
src/app/
  page.tsx                          ← landing / marketing (public)
  sign-in/[[...sign-in]]/page.tsx   ← Clerk sign-in (public)
  sign-up/[[...sign-up]]/page.tsx   ← Clerk sign-up (public)
  dashboard/
    page.tsx                        ← main dashboard (protected)
    workout/
      new/page.tsx                  ← create workout (protected)
      [workoutId]/page.tsx          ← edit workout (protected)
```

## Rule: Route Protection via Middleware Only

All `/dashboard` routes must be protected at the **middleware level** using Clerk's `clerkMiddleware`. Do not add per-page auth guards (e.g. redirecting inside a page component) as a substitute for middleware protection.

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

Any new route added under `/dashboard` is automatically protected — no additional code required.

## Rule: Do Not Protect Pages Individually

Never call `auth.protect()`, redirect to sign-in, or check `userId` inside a page component as a route guard. Middleware is the single enforcement point.

```tsx
// WRONG — per-page auth check
export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in"); // ❌ — middleware handles this
}
```

```tsx
// CORRECT — page trusts middleware; only uses auth() to scope data queries
export default async function DashboardPage() {
  const workouts = await getWorkoutsForUser(); // auth() called inside data helper
  return <WorkoutList workouts={workouts} />;
}
```
