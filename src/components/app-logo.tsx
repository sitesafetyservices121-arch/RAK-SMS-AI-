// /components/app-logo.tsx
import { Shield, Cog } from "lucide-react";

export function AppLogo() {
  return (
    <div className="flex items-center gap-2" aria-label="RAK-SMS - Site Safety Services">
      {/* Icon part: gear + shield overlay */}
      <div className="relative flex items-center justify-center">
        <Cog className="h-8 w-8 text-primary animate-spin-slow" /> 
        <Shield className="h-4 w-4 text-primary absolute" />
      </div>

      {/* Text part */}
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight">RAK-SMS</span>
        <span className="text-xs text-muted-foreground">
          SITE SAFETY SERVICES
        </span>
      </div>
    </div>
  );
}
