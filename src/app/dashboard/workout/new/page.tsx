import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewWorkoutForm from "./NewWorkoutForm";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const defaultDate = date ?? new Date().toISOString().split("T")[0];

  return (
    <div className="container mx-auto max-w-lg py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>New Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <NewWorkoutForm defaultDate={defaultDate} />
        </CardContent>
      </Card>
    </div>
  );
}
