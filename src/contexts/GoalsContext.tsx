import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Goal } from '@/types/goals';
import { useToast } from '@/hooks/use-toast';
import { checkSupabaseHealth } from '@/lib/supabase';

interface GoalsContextType {
  goals: Goal[];
  isLoading: boolean;
  error: Error | null;
  stats: {
    totalGoals: number;
    completedGoals: number;
    averageProgress: number;
  };
  isReconnecting: boolean;
  refreshGoals: () => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider = ({ children }: { children: React.ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const { toast } = useToast();

  const fetchGoals = async (signal?: AbortSignal) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!sessionData?.session) {
        console.log('No active session found');
        return;
      }

      const isHealthy = await checkSupabaseHealth();
      if (!isHealthy) throw new Error('Supabase connection is not healthy');

      const { data, error: fetchError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', sessionData.session.user.id);

      if (fetchError) throw fetchError;

      setGoals(data || []);
      setError(null);
      setIsReconnecting(false);

    } catch (err) {
      if (signal?.aborted) return;
      
      console.error('Error in fetchGoals:', err);
      setError(err as Error);
      
      toast({
        title: "Error fetching goals",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Initial fetch on mount and auth state change
  useEffect(() => {
    const abortController = new AbortController();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoading(true);
        fetchGoals(abortController.signal).finally(() => setIsLoading(false));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLoading(true);
        fetchGoals(abortController.signal).finally(() => setIsLoading(false));
      } else {
        setGoals([]);
      }
    });

    return () => {
      abortController.abort();
      subscription.unsubscribe();
    };
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    const goalsSubscription = supabase
      .channel('goals_channel')
      .on(
        'postgres_changes' as const,
        { 
          event: '*', 
          schema: 'public', 
          table: 'goals',
        },
        async (payload) => {
          console.log('Goal update received:', payload);
          // Only fetch if the change affects our current user's goals
          const session = await supabase.auth.getSession();
          const userId = session.data.session?.user.id;
          
          if (userId && (
            payload.new?.user_id === userId || 
            payload.old?.user_id === userId
          )) {
            fetchGoals();
          }
        }
      )
      .subscribe();

    return () => {
      goalsSubscription.unsubscribe();
    };
  }, []);

  const stats = {
    totalGoals: goals.length,
    completedGoals: goals.filter(goal => goal.progress === 100).length,
    averageProgress: goals.length > 0
      ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length)
      : 0
  };

  return (
    <GoalsContext.Provider 
      value={{ 
        goals, 
        isLoading, 
        error, 
        stats,
        isReconnecting,
        refreshGoals: fetchGoals
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};