"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize immediately
    setTime(new Date());

    // Update every second
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  if (!time) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <span className="text-sm font-medium text-muted-foreground">
        {format(time, "EEE, MMM d")}
      </span>
      <span className="text-sm font-bold">
        {format(time, "h:mm:ss a")}
      </span>
    </div>
  );
}
