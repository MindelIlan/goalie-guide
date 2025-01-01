import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AIDisclaimer = () => {
  return (
    <Alert variant="default" className="mb-4 bg-yellow-50 border-yellow-200">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-sm text-yellow-700">
        AI responses are for guidance only. Please verify before taking action.
      </AlertDescription>
    </Alert>
  );
};