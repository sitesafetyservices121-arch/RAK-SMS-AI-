"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, getMonth } from "date-fns";

const allTopics: string[][][] = [
  // Month 1
  [
    ["Working at Heights", "Scaffold Safety", "Fall Protection", "Ladder Safety", "Lifting Operations"],
    ["PPE: Head Protection", "PPE: Hand Protection", "PPE: Foot Protection", "PPE: Eye Protection", "Hearing Protection"],
    ["Fire Safety & Extinguishers", "Emergency Exits & Assembly Points", "First Aid Basics", "Incident Reporting", "Spill Control & Housekeeping"],
    ["Hazard Communication (HazCom)", "SDS/MSDS Understanding", "Chemical Handling & Storage", "Electrical Safety Basics", "Lockout/Tagout (LOTO)"],
  ],
  // Month 2 … (rest unchanged)
  // keep your other months here exactly as you had them
];

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function ToolboxTalksPage() {
  const [currentTopics, setCurrentTopics] = useState<string[][]>([]);
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    const today = new Date();
    const monthIndex = getMonth(today); // 0 = January
    const topicsForMonth = allTopics[monthIndex % allTopics.length] || [];
    setCurrentTopics(topicsForMonth);
    setCurrentMonth(format(today, "MMMM yyyy"));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Toolbox Talks Schedule</CardTitle>
        <CardDescription>
          Monthly rotating schedule of daily toolbox talks for {currentMonth}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {currentTopics.map((weekTopics, weekIndex) => (
            <div key={`week-${weekIndex}`}>
              <h3 className="text-lg font-semibold mb-2">Week {weekIndex + 1}</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {weekdays.map((day) => (
                        <TableHead key={day}>{day}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {weekdays.map((_, dayIndex) => (
                        <TableCell key={`day-${dayIndex}`} className="align-top">
                          {weekTopics[dayIndex] || "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
