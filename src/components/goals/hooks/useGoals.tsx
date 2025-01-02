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

export const useGoals = (selectedFolderId: number | null, searchQuery: string) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const filteredGoals = selectedFolderId
    ? goals.filter(goal => goal.folder_id === selectedFolderId)
    : goals;

  const searchedGoals = searchQuery.trim()
    ? filteredGoals.filter(goal => {
        const query = searchQuery.toLowerCase();
        return (
          goal.title.toLowerCase().includes(query) ||
          goal.description?.toLowerCase().includes(query) ||
          goal.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      })
    : filteredGoals;

  const stats = {
    totalGoals: goals.length,
    completedGoals: goals.filter(goal => goal.progress === 100).length,
    averageProgress: goals.length > 0
      ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length)
      : 0
  };

  return {
    goals: searchedGoals,
    setGoals,
    isLoading,
    stats
  };
};