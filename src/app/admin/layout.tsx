"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingDots from "@/components/ui/loading-dots";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
            <LoadingDots />
            <p className="mt-4 text-sm text-muted-foreground">Verifying access...</p>
        </div>
    );
  }

  return <>{children}</>;
}
