import { useDroppable } from '@dnd-kit/core';
import { Button } from "@/components/ui/button";
import { 
  Folder, 
  ChevronRight, 
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
  GraduationCap
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

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
  isOver 
}: DroppableFolderProps) => {
  const { setNodeRef } = useDroppable({
    id: `folder-${folder.id}`,
    data: folder,
  });

  const FolderIcon = getFolderIcon(folder.name);

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
        aspect-square p-4 rounded-lg transition-all duration-200
        ${isSelected ? 'bg-secondary/10' : 'bg-background hover:bg-secondary/5'}
        ${isOver ? 'ring-2 ring-primary ring-offset-2 shadow-lg' : 'border border-border'}
      `}
    >
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className="w-full h-full flex flex-col justify-between p-4 group relative overflow-hidden"
        onClick={onSelect}
      >
        <div className="flex items-center justify-between w-full relative z-10">
          <span className="flex items-center">
            <FolderIcon className={`h-6 w-6 mr-2 transition-transform group-hover:scale-110 ${isOver ? 'text-primary animate-bounce' : ''}`} />
            {folder.name}
          </span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>

        <div className="w-full space-y-2 mt-4 relative z-10">
          <div className="flex justify-between text-sm">
            <span>{stats.totalGoals} goals</span>
            <span>{stats.averageProgress}%</span>
          </div>
          <Progress 
            value={stats.averageProgress} 
            className="h-1.5"
          />
        </div>

        {isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-primary"
          />
        )}
      </Button>
    </motion.div>
  );
};