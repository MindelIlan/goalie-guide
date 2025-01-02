import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Auth } from "@/components/Auth";
import { supabase } from "@/lib/supabase";
import { NotificationsProvider } from "@/components/notifications/NotificationsProvider";
import { Header } from "@/components/header/Header";
import { User } from "@supabase/supabase-js";
import { GoalsContainer } from "@/components/goals/GoalsContainer";
import { AIAssistant } from "@/components/AIAssistant";

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
  user_id: string;
  created_at: string;
}

const Index = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchGoals(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchGoals(session.user.id);
      } else {
        setGoals([]);
      }
    });

    // Listen for goals-updated events
    const handleGoalsUpdated = () => {
      if (user) {
        fetchGoals(user.id);
      }
    };
    window.addEventListener('goals-updated', handleGoalsUpdated);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('goals-updated', handleGoalsUpdated);
    };
  }, [user]);

  const fetchGoals = async (userId: string) => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch goals",
        variant: "destructive",
      });
    } else {
      setGoals(data || []);
    }
  };

  const handleAddGoal = async (newGoal: Omit<Goal, "id" | "progress" | "user_id" | "created_at">) => {
    if (!user) return;

    const goal = {
      title: newGoal.title,
      description: newGoal.description,
      target_date: newGoal.target_date,
      tags: newGoal.tags,
      progress: 0,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('goals')
      .insert([goal])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive",
      });
    } else {
      const updatedGoals = [...goals, data];
      setGoals(updatedGoals);
      await checkForDuplicateGoals(data, goals);
      toast({
        title: "Success",
        description: "Goal added successfully!",
      });
    }
  };

  const checkForDuplicateGoals = async (newGoal: Goal, existingGoals: Goal[]) => {
    const duplicates = existingGoals.filter(goal => 
      goal.title.toLowerCase() === newGoal.title.toLowerCase() &&
      goal.description.toLowerCase() === newGoal.description.toLowerCase()
    );

    if (duplicates.length > 0) {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: user?.id,
          type: 'duplicate_goal',
          title: 'Duplicate Goal Detected',
          message: `You have a similar goal: "${newGoal.title}". Click to manage duplicates.`,
          read: false,
          metadata: {
            originalGoalId: duplicates[0].id,
            newGoalId: newGoal.id
          }
        }]);

      if (error) {
        console.error('Error creating duplicate goal notification:', error);
      }
    }
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="container max-w-4xl px-4">
          <Header user={user} />
          
          <GoalsContainer
            userId={user.id}
            goals={goals}
            setGoals={setGoals}
            onAddGoal={handleAddGoal}
          />
        </div>

        <AIAssistant />
      </div>
    </NotificationsProvider>
  );
};

export default Index;