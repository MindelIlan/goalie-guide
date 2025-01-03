import { useMemo } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { Goal } from '@/types/goals';

export const useFilteredGoals = (
  selectedFolderId: number | null,
  searchQuery: string
): {
  goals: Goal[];
  stats: {
    totalGoals: number;
    completedGoals: number;
    averageProgress: number;
  };
} => {
  const { goals } = useGoals();

  const filteredGoals = useMemo(() => {
    // First filter goals based on existing criteria
    const filtered = goals.filter(goal => {
      const matchesFolder = selectedFolderId === null || goal.folder_id === selectedFolderId;
      const matchesSearch = !searchQuery || 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFolder && matchesSearch;
    });

    // Then sort goals: goals with folders first, then unorganized goals
    // Within each group, sort by creation date (newest first)
    return filtered.sort((a, b) => {
      // If both goals have folders or both don't have folders, sort by creation date
      if ((a.folder_id && b.folder_id) || (!a.folder_id && !b.folder_id)) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // If only one goal has a folder, put the goal with folder first
      return a.folder_id ? -1 : 1;
    });
  }, [goals, selectedFolderId, searchQuery]);

  const stats = useMemo(() => ({
    totalGoals: filteredGoals.length,
    completedGoals: filteredGoals.filter(goal => goal.progress === 100).length,
    averageProgress: filteredGoals.length > 0
      ? Math.round(filteredGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / filteredGoals.length)
      : 0
  }), [filteredGoals]);

  return { goals: filteredGoals, stats };
};