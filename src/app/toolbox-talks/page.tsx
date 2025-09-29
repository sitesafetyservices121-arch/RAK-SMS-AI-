
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
    ["PPE: Head Protection", "PPE: Hand Protection", "PPE: Foot Protection", "PPE: Eye Protection", "Hearing Protection"],
    ["Fire Safety & Extinguishers", "Emergency Exits & Assembly Points", "First Aid Basics", "Incident Reporting", "Spill Control & Housekeeping"],
    ["Hazard Communication (HazCom)", "SDS/MSDS Understanding", "Chemical Handling & Storage", "Electrical Safety Basics", "Lockout/Tagout (LOTO)"],
  ],
  // Month 2
  [
    ["Confined Space Entry", "Atmospheric Testing", "Rescue Procedures", "Ventilation Requirements", "Permit to Work Systems"],
    ["Vehicle & Fleet Safety", "Defensive Driving", "Loading & Unloading", "Site Traffic Management", "Mobile Equipment Safety"],
    ["Housekeeping Best Practices", "Slips, Trips, and Falls Prevention", "Material Storage & Stacking", "Waste Management & Disposal", "Site Security & Access Control"],
    ["Occupational Health & Hygiene", "Heat Stress & Dehydration", "Cold Stress & Hypothermia", "Fatigue Management", "Mental Health & Wellbeing"],
  ],
  // Month 3
  [
    ["Excavation & Trenching Safety", "Shoring & Sloping", "Underground Service Alert", "Access & Egress in Trenches", "Soil Classification"],
    ["Hand Tool Safety", "Power Tool Safety (General)", "Grinder & Abrasive Wheel Safety", "Pneumatic Tool Safety", "Hydraulic Tool Safety"],
    ["Public Safety & Site Boundaries", "Barricading & Signage", "Overhead Powerline Awareness", "Protection of Pedestrians", "Noise Control"],
    ["Manual Handling Techniques", "Back Injury Prevention", "Team Lifting", "Using Mechanical Aids", "Ergonomics at Work"],
  ],
  // Month 4
  [
    ["Welding, Cutting & Brazing", "Hot Work Permits", "Fire Watch Duties", "Gas Cylinder Safety", "Fume Control"],
    ["Forklift & Powered Industrial Truck Safety", "Pre-use Inspections", "Load Stability", "Pedestrian Interaction", "Battery Charging/Refueling"],
    ["Environmental Awareness", "Spill Prevention & Control", "Dust Control", "Water Pollution Prevention", "Protecting Flora & Fauna"],
    ["Task-Specific Risk Assessment Review", "Job Safety Analysis (JSA)", "Dynamic Risk Assessment", "Hierarchy of Controls", "Stop Work Authority"],
  ],
  // Month 5
  [
    ["Scaffold User Training Review", "Scaffold Tagging Systems", "Inspecting Scaffolds", "Safe Erection/Dismantling (Awareness)", "Mobile Scaffold Safety"],
    ["Advanced Electrical Safety", "Temporary Electrical Installations", "Working Near Live Equipment", "GFCI Protection", "Identifying Damaged Cords/Tools"],
    ["Health Risks: Asbestos Awareness", "Health Risks: Lead Awareness", "Health Risks: Silica Dust", "Health Risks: Noise-Induced Hearing Loss", "Health Risks: Vibration (HAVS)"],
    ["Safety Culture & Behavior", "Proactive vs. Reactive Safety", "Peer-to-Peer Observations", "Reporting Unsafe Acts/Conditions", "Celebrating Safety Successes"],
  ],
  // Month 6
  [
    ["Crane & Rigging Safety", "Lift Plan Awareness", "Signaling & Communication", "Inspection of Rigging Gear", "Safe Landing of Loads"],
    ["Demolition Safety", "Structural Stability Assessment", "Hazardous Materials Survey", "Controlled Collapse Techniques", "Debris Removal & Handling"],
    ["Working with Concrete", "Cement Burns & Skin Care", "Formwork & Shuttering Safety", "Concrete Pumping Operations", "Curing Compound Hazards"],
    ["Fire Prevention Plan Review", "Flammable Liquid Storage", "Oily Rag & Combustible Waste", "Hot Work Area Preparation", "Access for Emergency Services"],
  ],
  // Month 7
  [
    ["Review of Fall Protection Plans", "Anchor Point Selection", "Harness & Lanyard Inspection", "Suspension Trauma", "Rescue from Height Plan"],
    ["Site-Specific Emergency Procedures", "Medical Emergency Response", "Environmental Incident Response", "Security Incident Response", "Utility Strike Response"],
    ["Lone Working Procedures", "Communication & Check-in Systems", "Risk Assessment for Lone Workers", "Personal Alarms & Devices", "Emergency Procedures for Lone Workers"],
    ["Seasonal Safety: Summer", "Sun Protection & UV Awareness", "Working in High Winds", "Storm & Lightning Procedures", "Insect & Snake Bite Prevention"],
  ],
  // Month 8
  [
    ["Driver & Operator Fitness for Duty", "Effects of Medication", "Alcohol & Drug Policy Review", "Journey Management", "Vehicle Emergency Kit Checks"],
    ["Storage & Use of Explosives/Blasting", "Exclusion Zones", "Misfire Procedures", "Fly Rock Prevention", "Vibration & Air Blast Control"],
    ["Roof Work Safety", "Edge Protection Systems", "Skylight & Fragile Surface Protection", "Weather Conditions for Roof Work", "Accessing Roofs Safely"],
    ["Safety Data Sheet (SDS) Deep Dive", "Understanding Pictograms", "First Aid Measures from SDS", "Exposure Controls from SDS", "Spill Response from SDS"],
  ],
    // Month 9
  [
    ["Permit to Work System Review", "Isolation & Permitting", "Confined Space Permits", "Hot Work Permits", "Excavation Permits"],
    ["Site-Specific Environmental Plan", "Silt Fences & Runoff Control", "Refueling Procedures", "Concrete Washout Areas", "Waste Segregation Review"],
    ["Equipment & Vehicle Maintenance", "Daily Checks vs. Formal Inspection", "Reporting Defects", "Tire Safety & Inflation", "Hydraulic Hose Safety"],
    ["Human Factors in Safety", "Complacency & Rushing", "Distractions (e.g., Mobile Phones)", "Stress & Pressure", "Situational Awareness"],
  ],
  // Month 10
  [
    ["Management of Change (MOC)", "Identifying Changes (Process, People, Equipment)", "Risk Assessing Changes", "Communicating Changes", "Updating Documents after Change"],
    ["Lifting Equipment Inspection (LOLER)", "Chain Slings & Web Slings", "Shackles & Eyebolts", "Crane Inspection Awareness", "Documenting Inspections"],
    ["Personal Protective Equipment (PPE) Review", "Is the PPE adequate for the task?", "PPE Maintenance & Cleaning", "Proper Fit & Donning", "Limitations of PPE"],
    ["Emergency Drill Learnings", "Review of Last Drill (Fire, Spill, etc.)", "What Went Well?", "Areas for Improvement", "Updating Plans based on Learnings"],
  ],
  // Month 11
  [
    ["Workplace Transport Safety", "Segregation of Vehicles & Pedestrians", "Reversing Vehicle Dangers", "Visibility & Blind Spots", "Banksman/Spotter Responsibilities"],
    ["Working Over or Near Water", "Life Jackets & Buoyancy Aids", "Water Rescue Plan", "Edge Protection & Barriers", "Boat & Pontoon Safety"],
    ["Access & Egress on Site", "Clear Walkways & Corridors", "Stairways & Ramps", "Emergency Access Routes", "Lighting for Access Routes"],
    ["Seasonal Safety: Winter", "Cold Weather PPE", "Icy Surfaces Management", "Wind Chill Factor", "Vehicle Preparation for Winter"],
  ],
  // Month 12
  [
    ["Annual Safety Performance Review", "Review of LTIR & Other Metrics", "Successes & Challenges of the Year", "Goals for Next Year", "Employee Feedback Session"],
    ["Holiday Season Safety", "Increased Traffic & Rushing", "Site Shutdown Procedures", "Mental Health During Holidays", "Safe Travel To & From Site"],
    ["Planning for the New Year", "Upcoming Projects & Associated Hazards", "Review of Training Matrix for Next Year", "Budgeting for New Safety Equipment", "Suggestions for SHE Plan Improvements"],
    ["General Safety Refresher", "Top 5 'Golden Rules' of Our Site", "Review of Stop Work Authority", "Importance of Near-Miss Reporting", "Open Forum: Your Safety Concerns"],
  ],
];

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function ToolboxTalksPage() {
  const [currentTopics, setCurrentTopics] = useState<string[][]>([]);
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    const today = new Date();
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
