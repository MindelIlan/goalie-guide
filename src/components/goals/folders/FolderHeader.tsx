import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FolderHeaderProps {
  onAddFolder: () => void;
}

export const FolderHeader = ({ onAddFolder }: FolderHeaderProps) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold">Folders</h2>
    <Button
      variant="ghost"
      size="sm"
      onClick={onAddFolder}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Folder
    </Button>
  </div>
);