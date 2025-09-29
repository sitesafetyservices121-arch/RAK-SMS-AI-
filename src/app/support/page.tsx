import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Phone } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
        <p className="text-muted-foreground">
          Get help with RAK-SMS. We're here to assist you.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" /> Live Chat &amp; Instant Messaging
            </CardTitle>
            <CardDescription>
              For immediate assistance, reach out via live chat or WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => (window as any).$tawk?.toggle()}>
                Start Live Chat (Tawk.to)
            </Button>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="font-mono">Business WhatsApp: 079 461 3898</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" /> Email Support
            </CardTitle>
            <CardDescription>
              Send us an email and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             <div>
                <p className="font-semibold">Technical Inquiries</p>
                <a href="mailto:ruan@sitesafety.services" className="text-primary hover:underline">
                ruan@sitesafety.services
                </a>
            </div>
             <div>
                <p className="font-semibold">General Information</p>
                <a href="mailto:info@sitesafety.services" className="text-primary hover:underline">
                info@sitesafety.services
                </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
