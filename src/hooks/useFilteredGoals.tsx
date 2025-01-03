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
    return goals.filter(goal => {
      const matchesFolder = selectedFolderId === null || goal.folder_id === selectedFolderId;
      const matchesSearch = !searchQuery || 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFolder && matchesSearch;
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