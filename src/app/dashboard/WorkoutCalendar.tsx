"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

export default function WorkoutCalendar({ selected }: { selected: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams.get("date")) {
      const today = new Date();
      const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", localDate);
      router.replace(`?${params.toString()}`);
    }
  }, []);

  function handleSelect(d: Date | undefined) {
    if (!d) return;
    const params = new URLSearchParams(searchParams.toString());
    const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    params.set("date", localDate);
    router.push(`?${params.toString()}`);
  }

  // Parse in local timezone so the highlighted day matches the URL date string exactly
  const selectedDate = new Date(`${selected}T00:00:00`);

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleSelect}
      className="rounded-lg border border-gray-200 bg-gray-50"
    />
  );
}
