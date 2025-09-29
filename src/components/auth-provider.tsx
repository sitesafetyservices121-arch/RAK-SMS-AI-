"use client";

import { useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";

async function setAuthCookie(user: User | null) {
  if (user) {
    const idToken = await user.getIdToken();
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });
  } else {
    await fetch('/api/auth/login', {
      method: 'DELETE',
    });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await setAuthCookie(user);
      
      const isAuthPage = pathname.startsWith('/login');

      if (user) {
        if (isAuthPage) {
          router.push('/dashboard');
        }
      } else {
        if (!isAuthPage) {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return <>{children}</>;
}
