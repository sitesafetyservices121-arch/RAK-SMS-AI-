
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkIcon } from "lucide-react";
import Link from "next/link";

const newsArticles = [
  {
    title: "Updated Construction Regulations (2024) Now in Effect",
    author: "Admin",
    date: "2024-07-28",
    category: "Legal Update",
    content:
      "The amended Construction Regulations have been officially gazetted and are now in effect. Key changes include stricter requirements for risk assessments and the appointment of competent persons. All site managers are required to review the updated documents in the Document Library.",
    link: "https://www.gov.za/documents/construction-regulations-2014",
  },
  {
    title: "Q3 Safety Target: 10% Reduction in LTIR",
    author: "Admin",
    date: "2024-07-15",
    category: "Company News",
    content:
      "For the third quarter of 2024, our company-wide goal is to achieve a 10% reduction in the Lost Time Injury Rate (LTIR). We encourage all teams to enhance their focus on proactive safety measures and toolbox talks.",
  },
  {
    title: "New PPE Supplier for High-Visibility Vests",
    author: "Admin",
    date: "2024-07-10",
    category: "Equipment",
    content:
      "We have partnered with a new supplier for high-visibility vests to improve quality and comfort. The new vests are available from the central storeroom. Please ensure all old vests are returned for proper disposal.",
  },
];

export default function NewsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">News & Updates</h1>
        <p className="text-muted-foreground">
          Stay informed with the latest company news and safety updates.
        </p>
      </div>

      <div className="grid gap-6">
        {newsArticles.map((article) => {
          const formattedDate = new Date(article.date).toLocaleDateString(
            "en-GB",
            { year: "numeric", month: "long", day: "numeric" }
          );

          return (
            <Card key={article.title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  {article.link ? (
                    <Link
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      <CardTitle className="flex items-center gap-2">
                        {article.title}
                        <LinkIcon className="h-4 w-4 text-primary" />
                      </CardTitle>
                    </Link>
                  ) : (
                    <CardTitle>{article.title}</CardTitle>
                  )}
                  <Badge
                    variant={
                      article.category === "Legal Update"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {article.category}
                  </Badge>
                </div>
                <CardDescription>
                  Posted by {article.author} on {formattedDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {article.content}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
