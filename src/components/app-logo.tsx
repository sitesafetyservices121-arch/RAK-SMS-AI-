import { ShieldHalf } from 'lucide-react';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <ShieldHalf className="h-6 w-6 text-primary" />
      <span className="text-lg font-semibold">RAK-SMS</span>
    </div>
  );
}
