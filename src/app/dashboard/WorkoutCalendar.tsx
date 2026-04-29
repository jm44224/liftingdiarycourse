"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

export default function WorkoutCalendar({ selected }: { selected: Date }) {
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
    params.set("date", d.toISOString().split("T")[0]);
    router.push(`?${params.toString()}`);
  }

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={handleSelect}
      className="rounded-lg border border-gray-200 bg-white"
    />
  );
}
