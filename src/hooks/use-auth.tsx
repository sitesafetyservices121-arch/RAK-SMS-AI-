
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserRole = "user" | "admin" | "consultant";

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  loginAsAdmin: () => void;
  loginAsClient: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for a logged-in user from localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  const loginAsAdmin = () => {
    setLoading(true);
    const adminUser: MockUser = {
      uid: "admin-user",
      email: "ruan@sitesafety.services",
      displayName: "Ruan Admin",
      role: "admin",
      photoURL: `https://i.pravatar.cc/150?u=admin`,
    };
    localStorage.setItem("user", JSON.stringify(adminUser));
    setUser(adminUser);
    setLoading(false);
    router.push("/admin");
  };

  const loginAsClient = () => {
    setLoading(true);
    const clientUser: MockUser = {
      uid: "client-user",
      email: "client@example.com",
      displayName: "Client User",
      role: "user",
      photoURL: `https://i.pravatar.cc/150?u=client`,
    };
    localStorage.setItem("user", JSON.stringify(clientUser));
    setUser(clientUser);
    setLoading(false);
    router.push("/dashboard");
  };

  const signOut = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const value: AuthContextType = {
    user,
    loading,
    loginAsAdmin,
    loginAsClient,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
