import { Profile } from "@/components/Profile";
import { GoalsList } from "@/components/GoalsList";
import { GoalsHeader } from "./GoalsHeader";
import { DuplicateGoalsDialog } from "./DuplicateGoalsDialog";
import { FoldersList } from "./FoldersList";
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

  const filteredGoals = selectedFolderId
    ? goals.filter(goal => goal.folder_id === selectedFolderId)
    : goals;

  const checkForDuplicates = (goalsList: Goal[] = goals) => {
    console.log('Checking for duplicates among', goalsList.length, 'goals');
    const duplicates: Goal[] = [];
    const duplicateIds = new Set<number>();
    const seen = new Map<string, Goal>();

    goalsList.forEach(goal => {
      const key = `${goal.title.toLowerCase()}-${goal.description?.toLowerCase() || ''}`;
      console.log('Checking goal:', goal.title, 'with key:', key);
      
      if (seen.has(key)) {
        if (!duplicates.includes(seen.get(key)!)) {
          duplicates.push(seen.get(key)!);
          duplicateIds.add(seen.get(key)!.id);
        }
        duplicates.push(goal);
        duplicateIds.add(goal.id);
      } else {
        seen.set(key, goal);
      }
    });

    console.log('Found duplicate goals:', duplicates.length);
    console.log('Duplicate IDs:', Array.from(duplicateIds));

    setDuplicateGoals(duplicates);
    setDuplicateGoalIds(duplicateIds);
    
    if (duplicates.length > 0) {
      setShowDuplicatesDialog(true);
      toast({
        title: "Duplicates Found",
        description: `Found ${duplicates.length} duplicate goals. Please review them in the dialog.`,
      });
    } else {
      toast({
        title: "No Duplicates",
        description: "No duplicate goals were found.",
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 animate-fade-in">
        <Profile userId={userId} />
      </div>

      <FoldersList
        folders={folders}
        onFoldersChange={setFolders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
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
