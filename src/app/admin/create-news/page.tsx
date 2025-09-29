
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
import React from "react";
import { FilePlus } from "lucide-react";

export default function CreateNewsPage() {
    const { toast } = useToast();

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // In a real app, this would send the data to a server.
        toast({
            title: "News Article Published",
            description: "The new article has been added to the news feed.",
        });
        // Here you would typically reset the form
    };

  return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create News Article</CardTitle>
          <CardDescription>
            Write and publish a new article for the company news feed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Article Title</Label>
              <Input id="title" placeholder="Enter the article title" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
               <Select>
                <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Company News">Company News</SelectItem>
                    <SelectItem value="Legal Update">Legal Update</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Safety Alert">Safety Alert</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" placeholder="Write the full content of the article here..." rows={10} />
            </div>
            <Button type="submit" className="w-full">
                <FilePlus className="mr-2 h-4 w-4" />
              Publish Article
            </Button>
          </form>
        </CardContent>
      </Card>
  );
}
