import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SiteResourceTrackerPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Site & Resource Layout Tracker</CardTitle>
        <CardDescription>
          Visualize site layouts and resource allocation (coming soon).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
          <p className="text-muted-foreground">
            Site layout and resource map will be displayed here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
