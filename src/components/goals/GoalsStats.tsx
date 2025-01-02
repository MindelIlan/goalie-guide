import { Progress } from "@/components/ui/progress";

interface GoalsStatsProps {
  totalGoals: number;
  completedGoals: number;
  averageProgress: number;
}

export const GoalsStats = ({ totalGoals, completedGoals, averageProgress }: GoalsStatsProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border mb-8 animate-fade-in">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{totalGoals}</p>
          <p className="text-sm text-gray-600">Total Goals</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary">{completedGoals}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-500">{averageProgress}%</p>
          <p className="text-sm text-gray-600">Average Progress</p>
        </div>
      </div>
      <Progress value={averageProgress} className="h-2" />
    </div>
  );
};