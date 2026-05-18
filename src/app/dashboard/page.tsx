import Link from "next/link";
import { format } from "date-fns";
import { getWorkoutsForDate } from "@/data/workouts";
import WorkoutCalendar from "./WorkoutCalendar";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const dateString = dateParam ?? new Date().toISOString().split("T")[0];
  const selectedDate = new Date(`${dateString}T00:00:00`);
  selectedDate.setHours(0, 0, 0, 0);

  const workouts = await getWorkoutsForDate(selectedDate);

  return (
    <main className="flex flex-col gap-6 py-8 px-[20%]">
      <h1 className="text-2xl font-semibold">Workout Dashboard</h1>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">
          Workouts for {format(selectedDate, "do MMM yyyy")}
        </h2>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/workout/new"
            className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Log New Workout
          </Link>
          <WorkoutCalendar selected={dateString} />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        {workouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No workouts logged for this date.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {workouts.map((workout) => {
              const durationMins =
                workout.startedAt && workout.completedAt
                  ? Math.round(
                      (workout.completedAt.getTime() - workout.startedAt.getTime()) / 60000
                    )
                  : null;
              const durationLabel =
                durationMins !== null
                  ? durationMins >= 60
                    ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
                    : `${durationMins}m`
                  : null;
              const inProgress = !!workout.startedAt && !workout.completedAt;

              return (
                <li key={workout.id}>
                  <Link
                    href={`/dashboard/workout/${workout.id}`}
                    className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{workout.name ?? "Untitled Workout"}</span>
                      {workout.startedAt && (
                        <span className="text-sm text-muted-foreground">
                          {format(workout.startedAt, "h:mm a")}
                        </span>
                      )}
                    </div>
                    {inProgress ? (
                      <div className="text-sm text-yellow-500 font-medium">In Progress</div>
                    ) : durationLabel && (
                      <div className="text-sm text-muted-foreground">
                        <span className="mr-1">Duration</span>
                        {durationLabel}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
