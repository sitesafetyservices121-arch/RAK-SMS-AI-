"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = "ruan@sitesafety.services";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loginWithEmailPassword, loading, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const errorMessage = useMemo(() => localError || authError, [localError, authError]);

  const resetErrors = useCallback(() => {
    setLocalError(null);
    if (authError) {
      clearAuthError();
    }
  }, [authError, clearAuthError]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setLocalError("Please enter both an email address and password.");
      return;
    }

    resetErrors();
    setSubmitting(true);

    try {
      const authUser = await loginWithEmailPassword(email.trim(), password);
      toast({
        title: "Welcome back",
        description: `Signed in as ${authUser.email}`,
      });
      router.push(authUser.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in.";
      setLocalError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-fit">
            <AppLogo />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">Welcome to RAK-SMS</CardTitle>
            <CardDescription>Sign in with your company email to access your workspace.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  resetErrors();
                }}
                required
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  resetErrors();
                }}
                required
                placeholder="Enter your password"
              />
            </div>

            {errorMessage ? (
              <Alert variant="destructive">
                <AlertTitle>Unable to sign in</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || submitting}
            >
              {loading || submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
