import { LoadingSpinner } from "./LoadingSpinner";

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay = ({ message = "Loading..." }: LoadingOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-4 rounded-lg">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};