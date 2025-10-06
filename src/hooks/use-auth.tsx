
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

type UserRole = "user" | "admin" | "consultant";

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
}

type LoginCredentials = {
  email: string;
  password: string;
};

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<MockUser>;
  signOut: () => void;
}

type InternalUser = MockUser & { password: string };

const HARDCODED_USERS: InternalUser[] = [
  {
    uid: "admin-user",
    email: "ruan@sitesafety.services",
    displayName: "Ruan Admin",
    role: "admin",
    password: "Admin@123",
    photoURL: `https://i.pravatar.cc/150?u=admin`,
  },
  {
    uid: "client-user",
    email: "client@example.com",
    displayName: "Client User",
    role: "user",
    password: "Client@123",
    photoURL: `https://i.pravatar.cc/150?u=client`,
  },
  {
    uid: "consultant-user",
    email: "consultant@example.com",
    displayName: "Wilson Consultant",
    role: "consultant",
    password: "Consult@123",
    photoURL: `https://i.pravatar.cc/150?u=consultant`,
  },
];

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
        const parsedUser = JSON.parse(storedUser) as MockUser;
        if (parsedUser?.email && parsedUser?.role) {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    setLoading(true);

    try {
      const normalisedEmail = email.trim().toLowerCase();
      const matchingUser = HARDCODED_USERS.find(
        (account) => account.email.toLowerCase() === normalisedEmail
      );

      if (!matchingUser || matchingUser.password !== password) {
        throw new Error("Invalid email or password. Please try again.");
      }

      const { password: _password, ...rest } = matchingUser;
      const safeUser: MockUser = rest;
      localStorage.setItem("user", JSON.stringify(safeUser));
      setUser(safeUser);

      return safeUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router]);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      loading,
      login,
      signOut,
    }),
    [user, loading, login, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
