
"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { generateHiraAction } from "./actions";
import LoadingDots from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Download, PlusCircle, Trash2, Wand2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { HiraOutput } from "@/ai/flows/ai-hira-generator";
import { AppLogo } from "@/components/app-logo";

const hazardSchema = z.object({
  hazard: z.string().min(1, "Hazard description is required."),
  employeesExposed: z.coerce.number().min(1, "At least one employee must be exposed."),
  existingControls: z.string().min(1, "Existing controls are required."),
  severityBefore: z.coerce.number().min(1).max(5),
  likelihoodBefore: z.coerce.number().min(1).max(5),
  additionalControls: z.string().optional(),
  severityAfter: z.coerce.number().min(1).max(5).optional(),
  likelihoodAfter: z.coerce.number().min(1).max(5).optional(),
});

const activitySchema = z.object({
  activity: z.string().min(1, "Activity description is required."),
  hazards: z.array(hazardSchema).min(1, "At least one hazard is required for each activity."),
});

const formSchema = z.object({
  projectName: z.string().min(1, "Project Name is required."),
  clientName: z.string().min(1, "Client Name is required."),
  location: z.string().min(1, "Location is required."),
  activities: z.array(activitySchema).min(1, "At least one activity is required."),
});

type FormValues = z.infer<typeof formSchema>;
type Hazard = z.infer<typeof hazardSchema>;

const riskMatrix: { [key: number]: { label: string; color: string, textColor: string } } = {
    1: { label: "Low", color: "bg-green-600", textColor: "text-white" },
    2: { label: "Low", color: "bg-green-600", textColor: "text-white" },
    3: { label: "Low", color: "bg-green-600", textColor: "text-white" },
    4: { label: "Low", color: "bg-green-600", textColor: "text-white" },
    5: { label: "Medium", color: "bg-yellow-500", textColor: "text-black" },
    6: { label: "Medium", color: "bg-yellow-500", textColor: "text-black" },
    8: { label: "Medium", color: "bg-yellow-500", textColor: "text-black" },
    9: { label: "Medium", color: "bg-yellow-500", textColor: "text-black" },
    10: { label: "High", color: "bg-orange-600", textColor: "text-white" },
    12: { label: "High", color: "bg-orange-600", textColor: "text-white" },
    15: { label: "High", color: "bg-orange-600", textColor: "text-white" },
    16: { label: "Extreme", color: "bg-red-700", textColor: "text-white" },
    20: { label: "Extreme", color: "bg-red-700", textColor: "text-white" },
    25: { label: "Extreme", color: "bg-red-700", textColor: "text-white" },
};

const getRiskRating = (severity?: number, likelihood?: number) => {
    if (!severity || !likelihood) return { score: 0, label: "N/A", color: "bg-gray-400", textColor: "text-white" };
    const score = severity * likelihood;
    const ratingKey = Object.keys(riskMatrix).reverse().find(key => score >= parseInt(key));
    return { score, ...(riskMatrix[ratingKey as any] || { label: "Low", color: "bg-green-600", textColor: "text-white" }) };
};

function HazardItem({ activityIndex, hazardIndex, control, removeHazard, generateControls }: { activityIndex: number; hazardIndex: number; control: Control<FormValues>; removeHazard: (index: number) => void; generateControls: (activityIndex: number, hazardIndex: number) => void; }) {
    const hazard = useWatch({
        control,
        name: `activities.${activityIndex}.hazards.${hazardIndex}`,
    });

    const riskBefore = getRiskRating(hazard.severityBefore, hazard.likelihoodBefore);
    const riskAfter = getRiskRating(hazard.severityAfter, hazard.likelihoodAfter);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateClick = async () => {
        setIsLoading(true);
        await generateControls(activityIndex, hazardIndex);
        setIsLoading(false);
    }

    return (
        <Card className="bg-muted/50 p-4 space-y-4">
            <div className="flex justify-between items-start">
                <FormField
                    control={control}
                    name={`activities.${activityIndex}.hazards.${hazardIndex}.hazard`}
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                            <FormLabel>Hazard Description</FormLabel>
                            <FormControl><Input placeholder="e.g., Working on an unguarded roof edge" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button variant="ghost" size="icon" onClick={() => removeHazard(hazardIndex)} className="ml-2 mt-8 shrink-0">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={control} name={`activities.${activityIndex}.hazards.${hazardIndex}.employeesExposed`} render={({ field }) => (
                    <FormItem><FormLabel>No. Employees Exposed</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name={`activities.${activityIndex}.hazards.${hazardIndex}.existingControls`} render={({ field }) => (
                    <FormItem><FormLabel>Existing Controls</FormLabel><FormControl><Textarea placeholder="e.g., Safety induction completed" {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            {/* Before Controls */}
            <div className="space-y-2 p-2 border rounded-md">
                <p className="text-sm font-medium">Risk Before Controls (Inherent)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={control} name={`activities.${activityIndex}.hazards.${hazardIndex}.severityBefore`} render={({ field }) => (
                        <FormItem><FormLabel>Severity (1-5)</FormLabel><Select onValueChange={field.onChange} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{[1,2,3,4,5].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`activities.${activityIndex}.hazards.${hazardIndex}.likelihoodBefore`} render={({ field }) => (
                        <FormItem><FormLabel>Likelihood (1-5)</FormLabel><Select onValueChange={field.onChange} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{[1,2,3,4,5].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                     <FormItem><FormLabel>Risk Rating</FormLabel><Badge className={`text-base w-full justify-center ${riskBefore.color} ${riskBefore.textColor}`}>{riskBefore.score} - {riskBefore.label}</Badge></FormItem>
                </div>
            </div>

             {/* AI Recommendations */}
             <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <FormLabel>Additional Controls (AI Recommended)</FormLabel>
                    <Button type="button" size="sm" variant="ghost" onClick={handleGenerateClick} disabled={isLoading}>
                       {isLoading ? <LoadingDots /> : <Wand2 className="mr-2 h-4 w-4" />}
                       Suggest Controls
                    </Button>
                 </div>
                <FormField control={control} name={`activities.${activityIndex}.hazards.${hazardIndex}.additionalControls`} render={({ field }) => (
                    <FormControl><Textarea placeholder="AI suggestions will appear here..." {...field} rows={3} /></FormControl>
                )} />
            </div>

            {/* After Controls */}
             <div className="space-y-2 p-2 border rounded-md">
                <p className="text-sm font-medium">Risk After Controls (Residual)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={control} name={`activities.${activityIndex}.hazards.${hazardIndex}.severityAfter`} render={({ field }) => (
                        <FormItem><FormLabel>Severity (1-5)</FormLabel><Select onValueChange={field.onChange} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{[1,2,3,4,5].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`activities.${activityIndex}.hazards.${hazardIndex}.likelihoodAfter`} render={({ field }) => (
                        <FormItem><FormLabel>Likelihood (1-5)</FormLabel><Select onValueChange={field.onChange} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{[1,2,3,4,5].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                     <FormItem><FormLabel>Risk Rating</FormLabel><Badge className={`text-base w-full justify-center ${riskAfter.color} ${riskAfter.textColor}`}>{riskAfter.score} - {riskAfter.label}</Badge></FormItem>
                </div>
            </div>
        </Card>
    );
}


export default function HiraGeneratorPage() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      clientName: "",
      location: "",
      activities: [{ activity: "", hazards: [{
        hazard: "", employeesExposed: 1, existingControls: "",
        severityBefore: 1, likelihoodBefore: 1,
        severityAfter: 1, likelihoodAfter: 1,
        additionalControls: ""
      }] }],
    },
  });

  const { fields: activityFields, append: appendActivity, remove: removeActivity } = useFieldArray({
    control: form.control,
    name: "activities",
  });

  const generateAIControls = async (activityIndex: number, hazardIndex: number) => {
    const activity = form.getValues(`activities.${activityIndex}`);
    const hazard = activity.hazards[hazardIndex];

    const prompt = `
        Project Details: A project named "${form.getValues('projectName')}" for client "${form.getValues('clientName')}" at "${form.getValues('location')}".
        Activity: ${activity.activity}
        Identified Hazard: ${hazard.hazard}
        Existing Controls: ${hazard.existingControls}
        Based on the South African OHS Act & Construction Regulations, suggest additional control measures to mitigate this hazard.
    `;
    
    try {
        const response = await generateHiraAction({ 
            projectDetails: prompt,
            regulatoryRequirements: "OHS Act 85 of 1993, Construction Regulations 2014" 
        });

        if (response.success && response.data) {
            form.setValue(`activities.${activityIndex}.hazards.${hazardIndex}.additionalControls`, response.data.controlMeasures);
            toast({ title: "AI suggestions generated." });
        } else {
            throw new Error(response.error);
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "AI Error", description: error.message });
    }
  };

  const handleDownloadPdf = (values: FormValues) => {
    setIsGeneratingPdf(true);
    const doc = new jsPDF({ orientation: "landscape" });

    // Cover Page
    doc.setFontSize(22);
    doc.text("Hazard Identification and Risk Assessment (HIRA)", doc.internal.pageSize.getWidth() / 2, 100, { align: "center" });
    doc.setFontSize(16);
    doc.text(`Project: ${values.projectName}`, doc.internal.pageSize.getWidth() / 2, 120, { align: "center" });
    doc.text(`Client: ${values.clientName}`, doc.internal.pageSize.getWidth() / 2, 130, { align: "center" });
    doc.text(`Location: ${values.location}`, doc.internal.pageSize.getWidth() / 2, 140, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date Generated: ${format(new Date(), "PPP")}`, doc.internal.pageSize.getWidth() / 2, 160, { align: "center" });
    
    // Add company branding
    doc.setFontSize(10);
    doc.text("Generated by RAK-SMS", doc.internal.pageSize.getWidth() / 2, 180, { align: "center" });


    // HIRA Table Page
    doc.addPage({ orientation: "landscape" });

    const head = [
        ["Activity", "Hazard", "People Exposed", "Existing Controls", "Sev (B)", "Like (B)", "Risk (B)", "Additional Controls", "Sev (A)", "Like (A)", "Risk (A)"],
    ];
    
    const body = values.activities.flatMap(activity => 
        activity.hazards.map(hazard => {
            const riskBefore = getRiskRating(hazard.severityBefore, hazard.likelihoodBefore);
            const riskAfter = getRiskRating(hazard.severityAfter, hazard.likelihoodAfter);
            return [
                activity.activity,
                hazard.hazard,
                hazard.employeesExposed,
                hazard.existingControls,
                hazard.severityBefore,
                hazard.likelihoodBefore,
                `${riskBefore.score} - ${riskBefore.label}`,
                hazard.additionalControls,
                hazard.severityAfter || 'N/A',
                hazard.likelihoodAfter || 'N/A',
                riskAfter.score > 0 ? `${riskAfter.score} - ${riskAfter.label}`: 'N/A',
            ]
        })
    );

    (doc as any).autoTable({
        head: head,
        body: body,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 41, 47] },
        didParseCell: function(data: any) {
            const riskLabel = data.cell.text[0];
            if(data.column.index === 6 || data.column.index === 10) {
                if (riskLabel.includes("Extreme")) data.cell.styles.fillColor = '#b91c1c';
                if (riskLabel.includes("High")) data.cell.styles.fillColor = '#c2410c';
                if (riskLabel.includes("Medium")) data.cell.styles.fillColor = '#a16207';
                if (riskLabel.includes("Low")) data.cell.styles.fillColor = '#166534';
            }
        },
        willDrawPage: (data: any) => {
             doc.setFontSize(12);
             doc.text("HIRA Report", 14, 15);
        }
    });

    doc.save(`HIRA-${values.projectName.replace(/ /g, '_')}.pdf`);
    setIsGeneratingPdf(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>HIRA Generator</CardTitle>
        <CardDescription>
            Build a detailed Hazard Identification and Risk Assessment. Add activities and their associated hazards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleDownloadPdf)} className="space-y-8">
            {/* Project Details */}
            <Card className="bg-card">
              <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField control={form.control} name="projectName" render={({ field }) => (<FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="clientName" render={({ field }) => (<FormItem><FormLabel>Client Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
              </CardContent>
            </Card>

            {/* Activities */}
            <div className="space-y-4">
                {activityFields.map((activityItem, activityIndex) => (
                     <Card key={activityItem.id} className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Activity {activityIndex + 1}</CardTitle>
                            </div>
                            <Button variant="destructive" size="icon" onClick={() => removeActivity(activityIndex)}><Trash2 className="h-4 w-4" /></Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <FormField
                                control={form.control}
                                name={`activities.${activityIndex}.activity`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Activity Description</FormLabel>
                                        <FormControl><Textarea placeholder="e.g., Working at Heights" {...field} rows={2} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Hazards</h3>
                                <FieldArrayHazards activityIndex={activityIndex} control={form.control} generateControls={generateAIControls} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => appendActivity({ activity: "", hazards: [{ hazard: "", employeesExposed: 1, existingControls: "", severityBefore: 1, likelihoodBefore: 1, severityAfter: 1, likelihoodAfter: 1 }]})}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Activity
                </Button>
            </div>
            
            <CardFooter className="px-0">
                <Button type="submit" disabled={isGeneratingPdf} className="w-full lg:w-auto">
                    {isGeneratingPdf ? <LoadingDots /> : <Download className="mr-2 h-4 w-4" />}
                    Download HIRA as PDF
                </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


function FieldArrayHazards({ activityIndex, control, generateControls }: { activityIndex: number, control: Control<FormValues>, generateControls: (activityIndex: number, hazardIndex: number) => void; }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `activities.${activityIndex}.hazards`,
  });

  return (
    <div className="space-y-4">
      {fields.map((item, hazardIndex) => (
        <HazardItem key={item.id} activityIndex={activityIndex} hazardIndex={hazardIndex} control={control} removeHazard={remove} generateControls={generateControls} />
      ))}
       <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({
            hazard: "", employeesExposed: 1, existingControls: "",
            severityBefore: 1, likelihoodBefore: 1,
            severityAfter: 1, likelihoodAfter: 1,
            additionalControls: ""
        })}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Hazard
      </Button>
    </div>
  );
}

    