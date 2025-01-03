import { useDroppable } from '@dnd-kit/core';
import { Button } from "@/components/ui/button";
import { Folder, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FolderStats {
  totalGoals: number;
  averageProgress: number;
}

interface DroppableFolderProps {
  folder: {
    id: number;
    name: string;
  };
  isSelected: boolean;
  stats: FolderStats;
  onSelect: () => void;
  isOver?: boolean;
}

export const DroppableFolder = ({ 
  folder, 
  isSelected, 
  stats, 
  onSelect,
  isOver 
}: DroppableFolderProps) => {
  const { setNodeRef } = useDroppable({
    id: `folder-${folder.id}`,
    data: folder,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`
        aspect-square p-4 rounded-lg transition-all duration-200
        ${isSelected ? 'bg-secondary/10' : 'bg-background hover:bg-secondary/5'}
        ${isOver ? 'ring-2 ring-primary ring-offset-2' : 'border border-border'}
      `}
    >
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className="w-full h-full flex flex-col justify-between p-4 group"
        onClick={onSelect}
      >
        <div className="flex items-center justify-between w-full">
          <span className="flex items-center">
            <Folder className="h-6 w-6 mr-2" />
            {folder.name}
          </span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>

        <div className="w-full space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span>{stats.totalGoals} goals</span>
            <span>{stats.averageProgress}%</span>
          </div>
          <Progress value={stats.averageProgress} className="h-1.5" />
        </div>
      </Button>
    </div>
  );
};