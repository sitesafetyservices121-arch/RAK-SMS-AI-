"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck } from "lucide-react";

import { AppLogo } from "@/components/app-logo";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingDots from "@/components/ui/loading-dots";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const destination = user.role === "admin" ? "/admin" : "/dashboard";
      router.replace(destination);
    }
  }, [loading, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : "Unable to sign in. Please verify your credentials.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = loading || isSubmitting;

  const credentialHints = useMemo(
    () => [
      {
        label: "Admin",
        email: "ruan@sitesafety.services",
        password: "Admin@123",
      },
      {
        label: "Client",
        email: "client@example.com",
        password: "Client@123",
      },
      {
        label: "Consultant",
        email: "consultant@example.com",
        password: "Consult@123",
      },
    ],
    []
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center">
            <AppLogo />
          </div>
          <CardTitle>Welcome to RAK-SMS</CardTitle>
          <CardDescription>
            Sign in with your organisation credentials to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isBusy}
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isBusy}
              />
            </div>
            {errorMessage ? (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}
            <Button type="submit" className="w-full" disabled={isBusy}>
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingDots />
                  <span>Signing in...</span>
                </span>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </>
              )}
            </Button>
          </form>
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Test credentials</p>
            <ul className="space-y-1 text-left">
              {credentialHints.map((item) => (
                <li key={item.label}>
                  <span className="font-semibold text-foreground">{item.label}:</span>{" "}
                  {item.email} / {item.password}
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-center gap-2 text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              Microsoft Word uploads are restricted to administrators only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
