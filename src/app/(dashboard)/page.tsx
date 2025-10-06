"use client";

import AuthProtected from "./_components/auth-protected";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  return (
    <AuthProtected>
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 p-8">
        <h1 className="text-3xl font-bold text-center">
          Welcome, {user?.displayName || user?.email}
        </h1>
        <p className="text-muted-foreground text-lg">
          You’re logged in as a {user?.role || "user"}.
        </p>

        <div className="mt-8">
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>
    </AuthProtected>
  );
}
