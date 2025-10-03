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
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
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
        case "auth/invalid-credential":
          message = "Invalid email or password";
          break;
        case "auth/too-many-requests":
          message =
            "Too many failed attempts. Please wait before trying again.";
          break;
        default:
          message = error.message || "An error occurred during sign in";
      }
      throw new Error(message);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<UserCredential> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName });

      await setDoc(
        doc(db, "users", newUser.uid),
        {
          displayName,
          email: newUser.email,
        },
        { merge: true }
      );

      setUser(newUser);
      return userCredential;
    } catch (error: any) {
      let message = "Failed to sign up";
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already in use.";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          message = "Password is too weak.";
          break;
        default:
          message = error.message || "An error occurred during sign up.";
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

  const updateUserProfile = async (
    displayName: string,
    photoURL?: string
  ): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in");
    }

    try {
      await updateProfile(auth.currentUser, {
        displayName,
        ...(photoURL && { photoURL }),
      });
      await auth.currentUser.reload();
      setUser(auth.currentUser);
    } catch (error: any) {
      throw new Error(error.message || "Failed to update profile");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
