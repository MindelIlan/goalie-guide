import { useState, useEffect } from "react";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { Profile } from "@/components/Profile";
import { useToast } from "@/hooks/use-toast";
import { Auth } from "@/components/Auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GoalsList } from "@/components/GoalsList";
import { AIAssistant } from "@/components/AIAssistant";
import { NotificationsProvider } from "@/components/notifications/NotificationsProvider";
import { Header } from "@/components/header/Header";
import { User } from "@supabase/supabase-js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [duplicateGoals, setDuplicateGoals] = useState<Goal[]>([]);

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

    return () => subscription.unsubscribe();
  }, []);

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
      checkForDuplicates(data || []);
    }
  };

  const checkForDuplicates = (goalsList: Goal[]) => {
    const duplicates: Goal[] = [];
    const seen = new Map<string, Goal>();

    goalsList.forEach(goal => {
      // Create a key based on title and description (case-insensitive)
      const key = `${goal.title.toLowerCase()}-${goal.description?.toLowerCase() || ''}`;
      
      if (seen.has(key)) {
        // If we've seen this combination before, it's a duplicate
        if (!duplicates.includes(seen.get(key)!)) {
          duplicates.push(seen.get(key)!);
        }
        duplicates.push(goal);
      } else {
        seen.set(key, goal);
      }
    });

    if (duplicates.length > 0) {
      setDuplicateGoals(duplicates);
      setShowDuplicatesDialog(true);
    }
  };

  const handleDeleteDuplicate = async (goalId: number) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete duplicate goal",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Duplicate goal deleted successfully",
      });
      fetchGoals(user!.id);
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

  if (!user) {
    return <Auth />;
  }

  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="container max-w-4xl px-4">
          <Header user={user} />

          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 animate-fade-in">
            <Profile userId={user.id} />
          </div>

          <div className="mb-8 text-center">
            <Button 
              onClick={() => checkForDuplicates(goals)}
              variant="outline"
              className="mr-4"
            >
              Check for Duplicates
            </Button>
            <AddGoalDialog onAddGoal={handleAddGoal}>
              <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <Plus className="h-5 w-5" />
                Add New Goal
              </Button>
            </AddGoalDialog>
          </div>
          
          <GoalsList goals={goals} setGoals={setGoals} />
        </div>

        <AIAssistant />

        <AlertDialog open={showDuplicatesDialog} onOpenChange={setShowDuplicatesDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Duplicate Goals Found</AlertDialogTitle>
              <AlertDialogDescription>
                The following goals appear to be duplicates:
                {duplicateGoals.map((goal, index) => (
                  <div key={goal.id} className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteDuplicate(goal.id)}
                      className="mt-2"
                    >
                      Delete this duplicate
                    </Button>
                  </div>
                ))}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDuplicatesDialog(false)}>Keep All</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </NotificationsProvider>
  );
};

export default Index;
