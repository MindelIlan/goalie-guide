import { useDraggable } from '@dnd-kit/core';
import { Card } from "@/components/ui/card";

interface GoalCardWrapperProps {
  goalId: number;
  goalData: any;
  isCompleted: boolean;
  isDuplicate?: boolean;
  isHovered: boolean;
  children: React.ReactNode;
  onHoverChange: (isHovered: boolean) => void;
}

export const GoalCardWrapper = ({
  goalId,
  goalData,
  isCompleted,
  isDuplicate = false,
  isHovered,
  children,
  onHoverChange,
}: GoalCardWrapperProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `goal-${goalId}`,
    data: goalData,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-6 transition-all duration-300 hover:shadow-lg animate-fade-in relative cursor-move ${
        isCompleted 
          ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-emerald-200'
          : isDuplicate
          ? 'bg-[#E5DEFF] border-purple-200 hover:border-purple-300'
          : 'bg-white border-gray-200 hover:border-primary/20'
      }`}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {children}
    </Card>
  );
};