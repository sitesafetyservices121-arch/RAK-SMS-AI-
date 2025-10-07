"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase-client";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

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
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || "";
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<MockUser> => {
    // Check if user is admin based on UID
    const isAdmin = firebaseUser.uid === ADMIN_UID || firebaseUser.email === ADMIN_EMAIL;

    try {
      // Try to fetch role from Firestore users collection
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || userData.displayName || "User",
          role: isAdmin ? "admin" : (userData.role as UserRole || "user"),
          photoURL: firebaseUser.photoURL || userData.photoURL,
        };
      }
    } catch (error) {
      console.error("Error fetching user data from Firestore:", error);
    }

    // Fallback if Firestore document doesn't exist
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || "User",
      role: isAdmin ? "admin" : "user",
      photoURL: firebaseUser.photoURL || undefined,
    };
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(userCredential.user);
      setUser(userData);

      // Redirect based on role
      if (userData.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    loginWithEmail,
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
