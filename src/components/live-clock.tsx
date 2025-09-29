"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="hidden items-center gap-2 md:flex">
      <span className="text-sm font-medium text-muted-foreground">
        {format(time, "EEE, MMM d")}
      </span>
      <span className="text-sm font-bold">{format(time, "h:mm:ss a")}</span>
    </div>
  );
}
