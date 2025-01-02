import { Button } from "@/components/ui/button";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Folder {
  id: number;
  name: string;
  description: string | null;
}

interface GoalsHeaderProps {
  onAddGoal: (goal: {
    title: string;
    description: string;
    target_date: string;
    tags: string[];
    folder_id?: number | null;
  }) => Promise<number | undefined>;
  onCheckDuplicates: () => void;
  onSearch: (query: string) => void;
  folders: Folder[];
}

export const GoalsHeader = ({ 
  onAddGoal, 
  onCheckDuplicates, 
  onSearch,
  folders 
}: GoalsHeaderProps) => {
  const [showAddGoal, setShowAddGoal] = useState(false);

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search goals..."
            className="pl-10 w-full"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onCheckDuplicates}
          >
            Check Duplicates
          </Button>
          <Button
            onClick={() => setShowAddGoal(true)}
          >
            Add Goal
          </Button>
        </div>
      </div>

      <AddGoalDialog
        open={showAddGoal}
        onOpenChange={setShowAddGoal}
        onAddGoal={onAddGoal}
        folders={folders}
      />
    </div>
  );
};