import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";

interface UnorganizedFolderProps {
  isSelected: boolean;
  stats: {
    totalGoals: number;
    averageProgress: number;
  };
  onSelect: () => void;
}

export const UnorganizedFolder = forwardRef<HTMLDivElement, UnorganizedFolderProps>(
  ({ isSelected, stats, onSelect }, ref) => (
    <div 
      ref={ref}
      className={`
        aspect-square p-4 rounded-lg transition-all duration-200
        ${isSelected ? 'bg-secondary/10' : 'bg-background hover:bg-secondary/5'}
        border border-border
      `}
    >
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className="w-full h-full flex flex-col justify-between p-4"
        onClick={onSelect}
      >
        <div className="flex items-center justify-center space-x-2">
          <Shuffle className="h-8 w-8 text-muted-foreground animate-[wiggle_4s_ease-in-out_infinite]" />
          <span>Unorganized Goals</span>
        </div>
        <div className="w-full space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span>{stats.totalGoals} goals</span>
            <span>{stats.averageProgress}%</span>
          </div>
        </div>
      </Button>
    </div>
  )
);

UnorganizedFolder.displayName = "UnorganizedFolder";