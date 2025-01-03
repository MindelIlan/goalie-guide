import { motion } from "framer-motion";
import { GoalCard } from "@/components/GoalCard";
import { Goal } from "@/types/goals";

interface GoalGridItemProps {
  goal: Goal;
  index: number;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  duplicateGoals?: Set<number>;
  selectedGoals: Set<number>;
  onSelect: (id: number, ctrlKey: boolean) => void;
}

export const GoalGridItem = ({
  goal,
  index,
  onDelete,
  onEdit,
  duplicateGoals = new Set(),
  selectedGoals,
  onSelect,
}: GoalGridItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
  >
    <GoalCard
      goal={goal}
      onDelete={onDelete}
      onEdit={onEdit}
      isDuplicate={duplicateGoals.has(goal.id)}
      isSelected={selectedGoals.has(goal.id)}
      onSelect={(ctrlKey) => onSelect(goal.id, ctrlKey)}
    />
  </motion.div>
);