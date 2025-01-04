import { Goal } from "@/types/goals";
import { GoalGridItem } from "./GoalGridItem";
import { EmptyGoalsList } from "./EmptyGoalsList";

interface GoalsListContentProps {
  goals: Goal[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  duplicateGoals?: Set<number>;
  selectedGoals: Set<number>;
  onSelect: (id: number, ctrlKey: boolean) => void;
  folderName?: string | null;
}

export const GoalsListContent = ({
  goals,
  onDelete,
  onEdit,
  duplicateGoals = new Set(),
  selectedGoals,
  onSelect,
  folderName,
}: GoalsListContentProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {goals.map((goal, index) => (
        <GoalGridItem
          key={goal.id}
          goal={goal}
          index={index}
          onDelete={onDelete}
          onEdit={onEdit}
          duplicateGoals={duplicateGoals}
          selectedGoals={selectedGoals}
          onSelect={onSelect}
        />
      ))}
      {goals.length === 0 && <EmptyGoalsList folderName={folderName} />}
    </div>
  );
};