import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { PlatformShareForm } from "./share/PlatformShareForm";
import { EmailShareForm } from "./share/EmailShareForm";

interface ShareGoalDialogProps {
  goalId: number;
  goalTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareGoalDialog = ({ goalId, goalTitle, open, onOpenChange }: ShareGoalDialogProps) => {
  const handleSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Goal: {goalTitle}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="platform" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="platform">Share with User</TabsTrigger>
            <TabsTrigger value="email">Invite by Email</TabsTrigger>
          </TabsList>

          <TabsContent value="platform">
            <PlatformShareForm
              goalId={goalId}
              goalTitle={goalTitle}
              onSuccess={() => handleSuccess("Goal shared successfully!")}
            />
          </TabsContent>

          <TabsContent value="email">
            <EmailShareForm
              goalId={goalId}
              goalTitle={goalTitle}
              onSuccess={() => handleSuccess("Invitation email sent successfully!")}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};