
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function LiveClock() {
  const [time, setTime] = useState<Date | null>(null); // Initialize with null

  useEffect(() => {
    // Set the initial time once the component mounts on the client
    setTime(new Date());

    // Then, set up the interval to update it
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!time) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  const formattedDate = format(time, "EEE, MMM d");
  const formattedTime = format(time, "h:mm:ss a");

  return (
    <div className="hidden items-center gap-2 md:flex">
      <time
        dateTime={time.toISOString()}
        className="text-sm font-medium text-muted-foreground"
      >
        {formattedDate}
      </time>
      <span className="text-sm font-bold">{formattedTime}</span>
    </div>
  );
}
