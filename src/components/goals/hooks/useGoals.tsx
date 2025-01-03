import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, checkSupabaseHealth } from "@/lib/supabase";

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
    const baseDelay = 1000; // 1 second

    const fetchGoals = async () => {
      if (!isMounted) return;
      
      try {
        // First check if we have an active session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          console.log('No active session found');
          setGoals([]);
          return;
        }

        // Check Supabase health before proceeding
        const isHealthy = await checkSupabaseHealth();
        if (!isHealthy) {
          throw new Error('Supabase connection is not healthy');
        }

        // Construct the query
        let query = supabase
          .from('goals')
          .select('*')
          .eq('user_id', sessionData.session.user.id);

        // Add folder filter if selected
        if (selectedFolderId !== null) {
          query = query.eq('folder_id', selectedFolderId);
        }

        const { data, error } = await query;

        if (!isMounted) return;

        if (error) {
          console.error('Error fetching goals:', error);
          throw error;
        }

        setGoals(data || []);
        setError(null);
        retryCount = 0;

      } catch (err) {
        if (!isMounted) return;
        console.error('Error in fetchGoals:', err);
        setError(err as Error);

        if (retryCount < maxRetries) {
          retryCount++;
          const delay = baseDelay * Math.pow(2, retryCount - 1); // Exponential backoff
          console.log(`Retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
          
          setTimeout(() => {
            if (isMounted) {
              fetchGoals();
            }
          }, delay);
        } else {
          toast({
            title: "Error",
            description: "Could not load goals. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    fetchGoals();

    return () => {
      isMounted = false;
    };
  }, [selectedFolderId, toast]);

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