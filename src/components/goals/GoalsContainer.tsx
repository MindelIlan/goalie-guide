import { Profile } from "@/components/Profile";
import { GoalsList } from "@/components/GoalsList";
import { GoalsHeader } from "./GoalsHeader";
import { DuplicateGoalsDialog } from "./DuplicateGoalsDialog";
import { FoldersList } from "./FoldersList";
import { GoalsStats } from "./GoalsStats";
import { useState, useEffect, useMemo } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('goal_folders')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching folders:', error);
        toast({
          title: "Error",
          description: "Failed to fetch folders",
          variant: "destructive",
        });
      } else {
        setFolders(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching folders:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching folders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkForDuplicates = () => {
    const duplicates: Goal[] = [];
    const duplicateIds = new Set<number>();
    
    const goalMap = new Map<string, Goal[]>();
    
    goals.forEach(goal => {
      const key = `${goal.title.toLowerCase()}-${goal.description?.toLowerCase() || ''}`;
      if (!goalMap.has(key)) {
        goalMap.set(key, [goal]);
      } else {
        const existingGoals = goalMap.get(key) || [];
        existingGoals.push(goal);
        goalMap.set(key, existingGoals);
        
        if (existingGoals.length === 2) {
          duplicates.push(existingGoals[0]);
          duplicateIds.add(existingGoals[0].id);
        }
        duplicates.push(goal);
        duplicateIds.add(goal.id);
      }
    });

    if (duplicates.length > 0) {
      setDuplicateGoals(duplicates);
      setDuplicateGoalIds(duplicateIds);
      setShowDuplicatesDialog(true);
    } else {
      toast({
        title: "No duplicates found",
        description: "All your goals are unique!",
      });
    }
  };

  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.progress === 100).length;
  const averageProgress = totalGoals > 0
    ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / totalGoals)
    : 0;

  const filteredGoals = useMemo(() => {
    let filtered = selectedFolderId
      ? goals.filter(goal => goal.folder_id === selectedFolderId)
      : goals;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(query) ||
        goal.description?.toLowerCase().includes(query) ||
        goal.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [goals, selectedFolderId, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-[#accbee] to-[#e7f0fd] dark:from-[#2a3f54] dark:to-[#517fa4] rounded-xl shadow-sm border p-6 mb-8 animate-fade-in">
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
        onCheckDuplicates={checkForDuplicates}
        onSearch={setSearchQuery}
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