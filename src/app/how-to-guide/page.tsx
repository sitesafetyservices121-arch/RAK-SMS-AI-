import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const guides = [
  {
    question: "How do I generate a SHE Plan?",
    answer:
      "Navigate to the 'SHE Plan Generator' from the dashboard. Fill in the project description form with as much detail as possible and click 'Generate SHE Plan'. The AI will create a comprehensive plan for you.",
  },
  {
    question: "How does the LTIR Trend Analysis work?",
    answer:
      "Go to the 'LTIR Trend Analysis' tool. Paste your historical Lost Time Injury Rate data into the text area. The data should ideally be in a structured format like CSV. The AI will analyze the data for trends, identify areas for improvement, and provide actionable recommendations.",
  },
  {
    question: "What is Wilson, the OHS Consultant?",
    answer:
      "Wilson is your AI-powered expert on South African Occupational Health and Safety legislation. You can ask it questions about the OHS Act, COID Act, and other relevant regulations. You can also upload documents for context-specific questions.",
  },
  {
    question: "How do I add a new document to the Document Library?",
    answer:
      "Go to the 'Admin' section and select 'Document Upload'. From there, you can select a file from your computer, assign it to a category, give it a sub-category name, and upload it to the central library.",
  },
  {
    question: "Can I train Wilson with my own documents?",
    answer:
      "Yes. In the 'Admin' section, go to 'AI Training'. You can upload PDF or JSON files containing specific acts, internal policies, or regulations. Wilson will use these documents as its primary knowledge base to answer your questions.",
  },
];

export default function HowToGuidePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How-to Guide</CardTitle>
        <CardDescription>
          Frequently asked questions about using the RAK-SMS platform and its AI
          tools.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {guides.map((guide) => (
            <AccordionItem
              value={guide.question}
              key={guide.question}
            >
              <AccordionTrigger>{guide.question}</AccordionTrigger>
              <AccordionContent>{guide.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
