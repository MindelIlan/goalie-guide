import { Button } from "@/components/ui/button";
import { Trash2, FolderOpen } from "lucide-react";

interface BulkActionsProps {
  selectedGoals: Set<number>;
  onBulkDelete: () => void;
  onBulkMove: () => void;
}

export const BulkActions = ({ selectedGoals, onBulkDelete, onBulkMove }: BulkActionsProps) => {
  if (selectedGoals.size === 0) return null;

  return (
    <div className="flex gap-2 mb-4 p-2 bg-secondary/10 rounded-lg">
      <Button
        variant="destructive"
        size="sm"
        onClick={onBulkDelete}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Delete {selectedGoals.size} goals
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onBulkMove}
        className="flex items-center gap-2"
      >
        <FolderOpen className="h-4 w-4" />
        Move to Unorganized
      </Button>
    </div>
  );
};