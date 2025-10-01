// ==============================
// Utility Functions
// ==============================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge and conditionally apply Tailwind CSS class names.
 *
 * - Uses `clsx` for conditional class logic
 * - Uses `tailwind-merge` to resolve conflicting Tailwind classes
 *
 * Example:
 * ```ts
 * cn("px-2", condition && "bg-red-500", "text-sm");
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}
