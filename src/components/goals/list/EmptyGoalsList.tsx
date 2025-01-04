interface EmptyGoalsListProps {
  folderName?: string | null;
}

export const EmptyGoalsList = ({ folderName }: EmptyGoalsListProps) => (
  <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
    <p className="text-gray-500">
      {folderName 
        ? `No goals yet in "${folderName}". Add your first goal to get started!`
        : "No goals yet. Add your first goal to get started!"}
    </p>
  </div>
);