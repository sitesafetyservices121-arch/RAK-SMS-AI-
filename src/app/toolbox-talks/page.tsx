
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

const allTopics = [
  // Month 1
  [
    ["Working at Heights", "Scaffold Safety", "Fall Protection", "Ladder Safety", "Lifting Operations"],
    ["PPE Usage", "Hand Tool Safety", "Power Tool Safety", "Ergonomics", "Hearing Protection"],
    ["Fire Safety", "Emergency Exits", "First Aid Basics", "Incident Reporting", "Spill Control"],
    ["Hazard Communication", "SDS Sheets", "Chemical Handling", "Electrical Safety", "Lockout/Tagout"],
  ],
  // Month 2
  [
    ["Confined Space Entry", "Atmospheric Testing", "Rescue Procedures", "Ventilation", "Permit to Work"],
    ["Vehicle Safety", "Defensive Driving", "Loading/Unloading", "Traffic Management", "Mobile Equipment"],
    ["Housekeeping", "Slips, Trips, and Falls", "Material Storage", "Waste Management", "Site Security"],
    ["Health & Hygiene", "Heat Stress", "Cold Stress", "Fatigue Management", "Mental Health Awareness"],
  ],
  // ... add more months as needed
];

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function ToolboxTalksPage() {
  const [currentTopics, setCurrentTopics] = useState<string[][]>([]);
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    const today = new Date();
    // Use getMonth() which is 0-indexed (0 for January)
    const monthIndex = getMonth(today); 
    const topicsForMonth = allTopics[monthIndex % allTopics.length] || allTopics[0];
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
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {weekdays.map(day => (
                        <TableHead key={day}>{day}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {weekTopics.map((topic, dayIndex) => (
                        <TableCell key={`day-${dayIndex}`} className="align-top">
                          {topic}
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
