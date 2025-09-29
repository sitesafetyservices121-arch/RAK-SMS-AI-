import { cn } from "@/lib/utils";

const LoadingDots = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <span className="sr-only">Loading...</span>
      <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-current"></div>
    </div>
  );
};

export const ThinkingAnimation = () => {
  return (
    <div className="flex items-center justify-center space-x-1">
      <span className="sr-only">Thinking...</span>
      <div className="h-5 w-1 animate-glow rounded-full bg-primary/60 [animation-delay:-0.3s]"></div>
      <div className="h-5 w-1 animate-glow rounded-full bg-primary/60 [animation-delay:-0.15s]"></div>
      <div className="h-5 w-1 animate-glow rounded-full bg-primary/60"></div>
    </div>
  )
}

export default LoadingDots;
