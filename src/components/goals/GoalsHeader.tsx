import { Button } from "@/components/ui/button";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";

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
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update search when debounced value changes
  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search goals..."
            className="pl-10 w-full"
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onCheckDuplicates}
          >
            Check Duplicates
          </Button>
          <AddGoalDialog
            onAddGoal={onAddGoal}
            folders={folders}
            open={showAddGoal}
            onOpenChange={setShowAddGoal}
          />
        </div>
      </div>
    </div>
  );
};