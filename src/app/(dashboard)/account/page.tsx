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
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  // In a real app, you would fetch more detailed user profile data here.
  const currentUser = {
    firstName: user?.displayName?.split(" ")[0] || "",
    surname: user?.displayName?.split(" ").slice(1).join(" ") || "",
    position: "System Administrator", // This would come from a profile store
    email: user?.email || "",
    phone: user?.phoneNumber || "+27 82 123 4567", // This would come from a profile store
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you would typically send the updated data to your backend.
    toast({
      title: "Settings Saved",
      description: "Your account details have been updated.",
    });
  };

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div className="grid gap-2" key={i}>
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account details and contact information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue={currentUser.firstName} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="surname">Surname</Label>
              <Input id="surname" defaultValue={currentUser.surname} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="position">Position</Label>
            <Input id="position" defaultValue={currentUser.position} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue={currentUser.email} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" defaultValue={currentUser.phone} />
          </div>
          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
