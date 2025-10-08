
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { FilePlus, LinkIcon } from "lucide-react";

export default function CreateNewsPage() {
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
    link: "", // Add new field for the external link
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title || !form.category) {
      toast({
        title: "Validation Error",
        description: "Title and Category are required.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would send the data to a server.
    toast({
      title: "News Article Created",
      description: `Title: ${form.title}`,
    });

    // Reset form
    setForm({ title: "", category: "", content: "", link: "" });
  };

  const isLinkValid = form.link.startsWith("http");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create News</CardTitle>
          <CardDescription>
            Publish announcements or articles for users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter news title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value: string) =>
                  setForm({ ...form, category: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updates">Updates</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="announcements">Announcements</SelectItem>
                  <SelectItem value="external">External Article</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">External Link (Optional)</Label>
              <Input
                id="link"
                placeholder="https://example.com/news-article"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />
            </div>

            {isLinkValid && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm font-semibold text-muted-foreground">Link Preview</p>
                <a href={form.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline line-clamp-1">
                  {form.link}
                </a>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write a summary or the full news content..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>

            <Button type="submit" className="flex items-center gap-2">
              <FilePlus className="h-4 w-4" /> Publish
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
