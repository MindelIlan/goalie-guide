import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, checkSupabaseHealth } from "@/lib/supabase";

interface Goal {
  id: bigint;
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
  const [isReconnecting, setIsReconnecting] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;
  const baseDelay = 2000; // 2 seconds

  // Cleanup function
  const cleanup = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  // Enhanced fetchGoals with better error handling and reconnection logic
  const fetchGoals = useCallback(async (signal?: AbortSignal) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        console.log('No active session found, waiting for session...');
        return;
      }

      // Check Supabase health before proceeding
      const isHealthy = await checkSupabaseHealth();
      if (!isHealthy) {
        throw new Error('Supabase connection is not healthy');
      }

      const query = supabase
        .from('goals')
        .select('id, title, description, progress, target_date, tags, created_at, folder_id')
        .eq('user_id', sessionData.session.user.id);

      if (selectedFolderId !== null) {
        query.eq('folder_id', selectedFolderId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching goals:', fetchError);
        throw fetchError;
      }

      setGoals(data || []);
      setError(null);
      retryCountRef.current = 0; // Reset retry count on successful fetch
      setIsReconnecting(false);

    } catch (err) {
      if (signal?.aborted) {
        console.log('Fetch aborted');
        return;
      }

      console.error('Error in fetchGoals:', err);
      setError(err as Error);

      if (retryCountRef.current < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCountRef.current);
        console.log(`Retrying in ${delay}ms (attempt ${retryCountRef.current + 1}/${maxRetries})`);
        
        setIsReconnecting(true);
        reconnectTimeoutRef.current = setTimeout(() => {
          retryCountRef.current++;
          fetchGoals(signal);
        }, delay);

        // Show reconnecting toast only on first retry
        if (retryCountRef.current === 0) {
          toast({
            title: "Connection issue detected",
            description: "Attempting to reconnect...",
            duration: 3000,
          });
        }
      } else {
        setIsReconnecting(false);
        toast({
          title: "Connection Error",
          description: "Please refresh the page to try again",
          variant: "destructive",
        });
      }
    }
  }, [selectedFolderId, toast]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Create new AbortController for this effect instance
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const initFetch = async () => {
      if (!isMounted) return;
      await fetchGoals(signal);
      if (isMounted) {
        setIsLoading(false);
      }
    };

    initFetch();

    // Set up real-time subscription for goals table
    const goalsSubscription = supabase
      .channel('goals_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'goals' },
        (payload) => {
          console.log('Real-time update received:', payload);
          if (isMounted) {
            fetchGoals(signal);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Cleanup function
    return () => {
      console.log('Cleaning up goals hook...');
      isMounted = false;
      cleanup();
      goalsSubscription.unsubscribe();
    };
  }, [fetchGoals]);

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
    stats,
    isReconnecting
  };
};