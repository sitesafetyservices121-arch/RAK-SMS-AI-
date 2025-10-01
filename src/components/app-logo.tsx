import { Shield, Cog } from "lucide-react";

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Icon part: gear + shield */}
      <div className="relative flex items-center justify-center">
        <Cog className="h-8 w-8 text-primary" />
        <Shield className="h-4 w-4 text-primary absolute" />
      </div>

      {/* Text part */}
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight">RAK-SSS</span>
        <span className="text-xs text-muted-foreground">
          SITE SAFETY SERVICES
        </span>
      </div>
    </div>
  );
}
