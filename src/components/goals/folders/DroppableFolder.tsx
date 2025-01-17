import { useDroppable } from '@dnd-kit/core';
import { Button } from "@/components/ui/button";
import { 
  Folder, 
  ChevronDown,
  Target, 
  Briefcase, 
  Star, 
  Heart, 
  Trophy,
  BookOpen,
  Rocket,
  Gem,
  Music,
  Palette,
  Code,
  Dumbbell,
  Brain,
  GraduationCap,
  Trash2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

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
  onDelete: () => void;
  isOver?: boolean;
}

const getFolderIcon = (name: string) => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('work')) return Briefcase;
  if (lowercaseName.includes('study') || lowercaseName.includes('education')) return GraduationCap;
  if (lowercaseName.includes('health') || lowercaseName.includes('fitness')) return Dumbbell;
  if (lowercaseName.includes('personal')) return Heart;
  if (lowercaseName.includes('important')) return Star;
  if (lowercaseName.includes('achievement')) return Trophy;
  if (lowercaseName.includes('learning')) return BookOpen;
  if (lowercaseName.includes('project')) return Rocket;
  if (lowercaseName.includes('finance')) return Gem;
  if (lowercaseName.includes('music')) return Music;
  if (lowercaseName.includes('art')) return Palette;
  if (lowercaseName.includes('tech')) return Code;
  if (lowercaseName.includes('mind')) return Brain;
  if (lowercaseName.includes('target')) return Target;
  return Folder;
};

export const DroppableFolder = ({ 
  folder, 
  isSelected, 
  stats, 
  onSelect,
  onDelete,
  isOver 
}: DroppableFolderProps) => {
  const { setNodeRef } = useDroppable({
    id: `folder-${folder.id}`,
    data: folder,
  });
  const [isOpen, setIsOpen] = useState(false);

  const FolderIcon = getFolderIcon(folder.name);

  const handleFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <motion.div 
      ref={setNodeRef}
      initial={{ scale: 1 }}
      animate={{ 
        scale: isOver ? 1.05 : 1,
        borderColor: isOver ? 'rgb(var(--primary))' : undefined
      }}
      transition={{ duration: 0.2 }}
      className={`
        group
        p-4 rounded-lg transition-all duration-200
        ${isSelected ? 'bg-secondary/10' : 'bg-background hover:bg-secondary/5'}
        ${isOver ? 'ring-2 ring-primary ring-offset-2 shadow-lg' : 'border border-border'}
        relative cursor-pointer
      `}
      onClick={handleFolderClick}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <FolderIcon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isOver ? 'text-primary animate-bounce' : ''}`} />
            <span>{folder.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-background/80 hover:bg-destructive hover:text-destructive-foreground h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 p-0 hover:bg-secondary/10"
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent className="space-y-4">
          <div className="w-full space-y-2 mt-4 relative z-10 px-4">
            <div className="flex justify-between text-sm">
              <span>{stats.totalGoals} goals</span>
              <span>{stats.averageProgress}%</span>
            </div>
            <Progress 
              value={stats.averageProgress} 
              className="h-1.5"
            />
          </div>
          
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Click to view goals in this folder
          </div>
        </CollapsibleContent>
      </Collapsible>

      {isOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-primary rounded-lg"
        />
      )}
    </motion.div>
  );
};
