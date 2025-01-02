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
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const fetchGoals = async () => {
      if (!isMounted) return;
      
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          console.log('No active session found');
          setGoals([]);
          return;
        }

        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', session.session.user.id);

        if (!isMounted) return;

        if (error) {
          console.error('Error fetching goals:', error);
          setError(error);
          
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(() => {
              console.log(`Retrying fetch (${retryCount}/${maxRetries})...`);
              fetchGoals();
            }, retryDelay * retryCount); // Exponential backoff
          } else {
            toast({
              title: "Error",
              description: "Failed to fetch goals after multiple attempts",
              variant: "destructive",
            });
          }
        } else {
          setGoals(data || []);
          setError(null);
          retryCount = 0;
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Unexpected error fetching goals:', err);
        setError(err as Error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    fetchGoals();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [selectedFolderId]); // Only re-fetch when folder changes

  // Filter goals based on search query
  const filteredGoals = goals.filter(goal => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      goal.title.toLowerCase().includes(query) ||
      goal.description?.toLowerCase().includes(query) ||
      goal.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const stats = {
    totalGoals: goals.length,
    completedGoals: goals.filter(goal => goal.progress === 100).length,
    averageProgress: goals.length > 0
      ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length)
      : 0
  };

  return {
    goals: filteredGoals,
    setGoals,
    isLoading,
    error,
    stats
  };
};