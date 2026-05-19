import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkoutById } from "@/data/workouts";
import { getWorkoutWithExercisesAndSets } from "@/data/workoutExercises";
import { getAllExercises } from "@/data/exercises";
import EditWorkoutForm from "./EditWorkoutForm";
import ExerciseLogger from "./ExerciseLogger";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;

  const [workout, exerciseEntries, allExercises] = await Promise.all([
    getWorkoutById(workoutId),
    getWorkoutWithExercisesAndSets(workoutId),
    getAllExercises(),
  ]);

  if (!workout) notFound();

  const startedAt = workout.startedAt ?? new Date();
  const defaultDate = startedAt.toISOString().split("T")[0];
  const defaultTime = `${String(startedAt.getHours()).padStart(2, "0")}:${String(startedAt.getMinutes()).padStart(2, "0")}`;

  const completedAt = workout.completedAt;
  const defaultEndDate = completedAt ? completedAt.toISOString().split("T")[0] : "";
  const defaultEndTime = completedAt
    ? `${String(completedAt.getHours()).padStart(2, "0")}:${String(completedAt.getMinutes()).padStart(2, "0")}`
    : "";

  return (
    <div className="container mx-auto max-w-lg py-10 px-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <EditWorkoutForm
            workoutId={workout.id}
            defaultName={workout.name ?? ""}
            defaultDate={defaultDate}
            defaultTime={defaultTime}
            defaultEndDate={defaultEndDate}
            defaultEndTime={defaultEndTime}
          />
        </CardContent>
      </Card>

      <ExerciseLogger
        workoutId={workoutId}
        entries={exerciseEntries ?? []}
        allExercises={allExercises}
      />
    </div>
  );
}
