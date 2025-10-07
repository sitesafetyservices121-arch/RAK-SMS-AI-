// /app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-toggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap", // ensures text is visible during font load
});

export const metadata: Metadata = {
  title: "RAK-SMS: AI-Powered Safety Management System",
  description: "AI-powered tools for safety management.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "RAK-SMS",
    description: "AI-powered tools for safety management.",
    url: "https://raksms.services",
    siteName: "RAK-SMS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RAK-SMS",
    description: "AI-powered tools for safety management.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
