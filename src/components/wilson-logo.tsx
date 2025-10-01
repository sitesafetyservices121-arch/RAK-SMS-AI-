import { cn } from "@/lib/utils";
import React from "react";

export function WilsonLogo({
  className,
  ...props
}: React.HTMLAttributes<SVGElement>) {
  const idRed = React.useId();
  const idBlue = React.useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("wilson-logo", className)}
      {...props}
    >
      <defs>
        <filter id={idRed} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={idBlue} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer hexagon */}
      <path
        d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
        stroke="#FF3333"
        strokeWidth="1"
        filter={`url(#${idRed})`}
      />

      {/* Cross beams */}
      <path
        d="M2 7L12 12L22 7"
        stroke="#3366FF"
        strokeWidth="1"
        filter={`url(#${idBlue})`}
      />
      <path
        d="M12 22V12"
        stroke="#3366FF"
        strokeWidth="1"
        filter={`url(#${idBlue})`}
      />

      {/* Subtle secondary strokes with theme vars */}
      <path
        d="M22 7L12 12L2 7"
        stroke="hsl(var(--primary))"
        strokeOpacity="0.3"
        strokeWidth="2.5"
      />
      <path
        d="M12 12L12 22"
        stroke="hsl(var(--accent))"
        strokeOpacity="0.3"
        strokeWidth="2.5"
      />

      <style jsx>{`
        .dark .wilson-logo {
          filter: drop-shadow(0 0 2px #FF3333)
            drop-shadow(0 0 2px #3366FF);
        }
      `}</style>
    </svg>
  );
}
