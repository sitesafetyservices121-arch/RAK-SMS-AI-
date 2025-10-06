"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { AppLogo } from "@/components/app-logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const { loginAsAdmin, loginAsClient } = useAuth();
  const router = useRouter();

  const handleAdminLogin = () => {
    loginAsAdmin();
    router.push("/admin");
  };

  const handleClientLogin = () => {
    loginAsClient();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AppLogo />
          </div>
          <CardTitle>Welcome to RAK-SMS</CardTitle>
          <CardDescription>
            Select a role to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleAdminLogin} className="w-full">
            <LogIn className="mr-2 h-4 w-4" /> Log In as Admin
          </Button>
          <Button onClick={handleClientLogin} variant="secondary" className="w-full">
            <LogIn className="mr-2 h-4 w-4" /> Log In as Client
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
