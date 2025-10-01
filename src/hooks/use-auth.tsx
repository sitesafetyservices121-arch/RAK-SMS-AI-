"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  UserCredential,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase-client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      // Transform Firebase errors into user-friendly messages
      let message = "Failed to sign in";
      
      switch (error.code) {
        case "auth/invalid-email":
          message = "Invalid email address";
          break;
        case "auth/user-disabled":
          message = "This account has been disabled";
          break;
        case "auth/user-not-found":
          message = "No account found with this email";
          break;
        case "auth/wrong-password":
          message = "Incorrect password";
          break;
        case "auth/invalid-credential":
          message = "Invalid email or password";
          break;
        case "auth/too-many-requests":
          message = "Too many failed attempts. Please try again later";
          break;
        default:
          message = error.message || "An error occurred during sign in";
      }
      
      throw new Error(message);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign out");
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      let message = "Failed to send reset email";
      
      switch (error.code) {
        case "auth/invalid-email":
          message = "Invalid email address";
          break;
        case "auth/user-not-found":
          message = "No account found with this email";
          break;
        default:
          message = error.message || "An error occurred";
      }
      
      throw new Error(message);
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string): Promise<void> => {
    if (!user) {
      throw new Error("No user is currently signed in");
    }

    try {
      await updateProfile(user, {
        displayName,
        ...(photoURL && { photoURL }),
      });
      // Trigger a refresh of the user object
      await user.reload();
      setUser(auth.currentUser);
    } catch (error: any) {
      throw new Error(error.message || "Failed to update profile");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    resetPassword,
    updateUserProfile,
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