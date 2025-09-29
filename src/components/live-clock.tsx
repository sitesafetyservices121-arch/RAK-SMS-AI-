
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Skeleton } from "./ui/skeleton";

export function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set the initial time on the client
    setTime(new Date());

    // Update the time every second
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Clear the interval on component unmount
    return () => clearInterval(timerId);
  }, []);
  
  if (!time) {
      return (
          <div className="hidden items-center gap-2 md:flex">
             <Skeleton className="h-4 w-20" />
             <Skeleton className="h-4 w-20" />
          </div>
      )
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <span className="text-sm font-medium text-muted-foreground">
        {format(time, "EEE, MMM d")}
      </span>
      <span className="text-sm font-bold">{format(time, "h:mm:ss a")}</span>
    </div>
  );
}
