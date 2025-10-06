// /home/user/studio/src/app/support/page.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Phone } from "lucide-react";

declare global {
  interface Window {
    $tawk?: {
      toggle: () => void;
    };
  }
}

export default function SupportPage() {
  const handleLiveChat = () => {
    if (typeof window !== "undefined" && window.$tawk) {
      window.$tawk.toggle();
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
        <p className="text-muted-foreground">
          Get help with RAK-SMS. We&apos;re here to assist you.
        </p>
      </div>

      {/* Support Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Live Chat & WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" aria-hidden="true" />
              Live Chat &amp; Instant Messaging
            </CardTitle>
            <CardDescription>
              For immediate assistance, reach out via live chat or WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              aria-label="Start live chat"
              onClick={handleLiveChat}
            >
              Start Live Chat (Tawk.to)
            </Button>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <a
                href="https://wa.me/27794613898"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono hover:underline"
                aria-label="Chat on WhatsApp"
              >
                Business WhatsApp: 079 461 3898
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Email Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
              Email Support
            </CardTitle>
            <CardDescription>
              Send us an email and we&apos;ll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">Technical Inquiries</p>
              <a
                href="mailto:ruan@sitesafety.services"
                className="text-primary hover:underline"
                aria-label="Email technical support"
              >
                ruan@sitesafety.services
              </a>
            </div>
            <div>
              <p className="font-semibold">General Information</p>
              <a
                href="mailto:info@sitesafety.services"
                className="text-primary hover:underline"
                aria-label="Email general information"
              >
                info@sitesafety.services
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
