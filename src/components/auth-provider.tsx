"use client";

import { useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";

// This function is now only used to DELETE the cookie on logout.
async function manageAuthCookie(user: User | null) {
  if (user) {
    // The login page now handles setting the cookie.
    // This function can be expanded if session refresh is needed later.
  } else {
    // If the user is null, it means they logged out. Delete the cookie.
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
      // This listener now primarily handles the LOGOUT case.
      // When a user logs out, Firebase detects it, user becomes null.
      await manageAuthCookie(user);
      
      const isAuthPage = pathname.startsWith('/login');

      // If the user is null (logged out) and they are not on the login page,
      // redirect them to the login page.
      if (!user && !isAuthPage) {
        router.push('/login');
      }
      
      // The login page now handles the redirect AFTER successful login,
      // so we no longer need to handle that case here. This avoids the race condition.
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [router, pathname]);

  return <>{children}</>;
}
