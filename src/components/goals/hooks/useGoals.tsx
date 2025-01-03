import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, checkSupabaseHealth } from "@/lib/supabase";
import { Goal } from "@/types/goals";
import { RealtimeGoalPayload } from "@/types/realtime";

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
  const baseDelay = 2000;

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

  const fetchGoals = useCallback(async (signal?: AbortSignal) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!sessionData?.session) {
        console.log('No active session found');
        return;
      }

      const isHealthy = await checkSupabaseHealth();
      if (!isHealthy) throw new Error('Supabase connection is not healthy');

      let query = supabase
        .from('goals')
        .select('*')
        .eq('user_id', sessionData.session.user.id);

      if (selectedFolderId !== null) {
        query = query.eq('folder_id', selectedFolderId);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setGoals(data || []);
      setError(null);
      retryCountRef.current = 0;
      setIsReconnecting(false);

    } catch (err) {
      if (signal?.aborted) return;
      
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
          description: "Unable to connect to the server. Please check your internet connection and refresh the page.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  }, [selectedFolderId, searchQuery, toast]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

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

    const goalsSubscription = supabase
      .channel('goals_channel')
      .on(
        'postgres_changes' as const,
        { 
          event: '*', 
          schema: 'public', 
          table: 'goals',
        },
        (payload: RealtimeGoalPayload) => {
          console.log('Goal update received:', payload);
          // Only fetch if the change affects our current view
          if (
            !selectedFolderId || 
            (payload.new && payload.new.folder_id === selectedFolderId)
          ) {
            fetchGoals(signal);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up goals hook...');
      isMounted = false;
      cleanup();
      goalsSubscription.unsubscribe();
    };
  }, [fetchGoals]);

  const stats = {
    totalGoals: goals.length,
    completedGoals: goals.filter(goal => goal.progress === 100).length,
    averageProgress: goals.length > 0
      ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length)
      : 0
  };

  return {
    goals,
    setGoals,
    isLoading,
    error,
    stats,
    isReconnecting
  };
};