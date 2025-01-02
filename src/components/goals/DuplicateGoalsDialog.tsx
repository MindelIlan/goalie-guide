import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
  created_at: string;
}

interface DuplicateGoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicateGoals: Goal[];
  onDuplicateDeleted: () => void;
}

export const DuplicateGoalsDialog = ({
  open,
  onOpenChange,
  duplicateGoals,
  onDuplicateDeleted,
}: DuplicateGoalsDialogProps) => {
  const { toast } = useToast();

  const handleDeleteDuplicate = async (goalId: number) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete duplicate goal",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Duplicate goal deleted successfully",
      });
      onDuplicateDeleted();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Duplicate Goals Found</AlertDialogTitle>
          <AlertDialogDescription>
            The following goals appear to be duplicates:
            {duplicateGoals.map((goal) => (
              <div key={goal.id} className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{goal.title}</p>
                <p className="text-sm text-gray-600">{goal.description}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteDuplicate(goal.id)}
                  className="mt-2"
                >
                  Delete this duplicate
                </Button>
              </div>
            ))}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Keep All
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};