"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function WorkoutCalendar({ selected }: { selected: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

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
    setOpen(false);
  }

  // Parse in local timezone so the highlighted day matches the URL date string exactly
  const selectedDate = new Date(`${selected}T00:00:00`);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarIcon className="size-4" />
          {format(selectedDate, "do MMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          className="rounded-lg"
        />
      </PopoverContent>
    </Popover>
  );
}
