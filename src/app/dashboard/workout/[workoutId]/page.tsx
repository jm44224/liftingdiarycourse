import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkoutById } from "@/data/workouts";
import EditWorkoutForm from "./EditWorkoutForm";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(workoutId);

  if (!workout) notFound();

  const startedAt = workout.startedAt ?? new Date();
  const defaultDate = startedAt.toISOString().split("T")[0];
  const defaultTime = `${String(startedAt.getHours()).padStart(2, "0")}:${String(startedAt.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="container mx-auto max-w-lg py-10 px-4">
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
          />
        </CardContent>
      </Card>
    </div>
  );
}
