import { Profile } from "@/components/Profile";
import { GoalsList } from "@/components/GoalsList";
import { GoalsHeader } from "./GoalsHeader";
import { DuplicateGoalsDialog } from "./DuplicateGoalsDialog";
import { FoldersList } from "./FoldersList";
import { GoalsStats } from "./GoalsStats";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
  created_at: string;
  folder_id: number | null;
}

interface Folder {
  id: number;
  name: string;
  description: string | null;
}

interface GoalsContainerProps {
  userId: string;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  onAddGoal: (goal: {
    title: string;
    description: string;
    target_date: string;
    tags: string[];
    folder_id?: number | null;
  }) => Promise<number | undefined>;
}

export const GoalsContainer = ({ userId, goals, setGoals, onAddGoal }: GoalsContainerProps) => {
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [duplicateGoals, setDuplicateGoals] = useState<Goal[]>([]);
  const [duplicateGoalIds, setDuplicateGoalIds] = useState<Set<number>>(new Set());
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    const { data, error } = await supabase
      .from('goal_folders')
      .select('*')
      .order('name');
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch folders",
        variant: "destructive",
      });
    } else {
      setFolders(data || []);
    }
  };

  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.progress === 100).length;
  const averageProgress = totalGoals > 0
    ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / totalGoals)
    : 0;

  const filteredGoals = selectedFolderId
    ? goals.filter(goal => goal.folder_id === selectedFolderId)
    : goals;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 animate-fade-in">
        <Profile userId={userId} />
      </div>

      <GoalsStats
        totalGoals={totalGoals}
        completedGoals={completedGoals}
        averageProgress={averageProgress}
      />

      <FoldersList
        folders={folders}
        onFoldersChange={setFolders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        goals={goals}
      />

      <GoalsHeader 
        onAddGoal={onAddGoal}
        onCheckDuplicates={() => checkForDuplicates()}
        folders={folders}
      />
      
      <GoalsList 
        goals={filteredGoals} 
        setGoals={setGoals} 
        duplicateGoals={duplicateGoalIds}
      />

      <DuplicateGoalsDialog
        open={showDuplicatesDialog}
        onOpenChange={setShowDuplicatesDialog}
        duplicateGoals={duplicateGoals}
        onDuplicateDeleted={() => {
          setShowDuplicatesDialog(false);
          setDuplicateGoalIds(new Set());
          const event = new CustomEvent('goals-updated');
          window.dispatchEvent(event);
        }}
      />
    </>
  );
};
