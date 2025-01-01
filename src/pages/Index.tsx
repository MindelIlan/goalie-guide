import { useState, useEffect } from "react";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { GoalCard } from "@/components/GoalCard";
import { Profile } from "@/components/Profile";
import { useToast } from "@/components/ui/use-toast";
import { Auth } from "@/components/Auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { EditGoalDialog } from "@/components/EditGoalDialog";

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target_date: string;
  user_id: string;
}

const Index = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [user, setUser] = useState(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchGoals(session.user.id);
      }
    });

    // Listen for auth changes
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
    }
  };

  const handleAddGoal = async (newGoal: Omit<Goal, "id" | "progress" | "user_id">) => {
    if (!user) return;

    const goal = {
      title: newGoal.title,
      description: newGoal.description,
      target_date: newGoal.target_date,
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
      setGoals([...goals, data]);
      toast({
        title: "Success",
        description: "Goal added successfully!",
      });
    }
  };

  const handleDeleteGoal = async (id: number) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    } else {
      setGoals(goals.filter((goal) => goal.id !== id));
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
    }
  };

  const handleEditGoal = async (id: number, updatedGoal: Omit<Goal, "id" | "progress" | "user_id">) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('goals')
      .update({
        title: updatedGoal.title,
        description: updatedGoal.description,
        target_date: updatedGoal.target_date
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    } else {
      setGoals(goals.map(goal => goal.id === id ? { ...goal, ...data } : goal));
      toast({
        title: "Success",
        description: "Goal updated successfully!",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=64&h=64&fit=crop"
              alt="Goal Tracker Logo"
              className="w-16 h-16 rounded-full shadow-lg animate-fade-in"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My 2024 Goals</h1>
              <p className="text-gray-600">Welcome, {user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Profile userId={user.id} />

        <div className="mb-8 text-center">
          <AddGoalDialog onAddGoal={handleAddGoal} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={handleDeleteGoal}
              onEdit={() => setEditingGoal(goal)}
            />
          ))}
          {goals.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No goals yet. Add your first goal to get started!</p>
            </div>
          )}
        </div>

        {editingGoal && (
          <EditGoalDialog
            goal={editingGoal}
            open={!!editingGoal}
            onOpenChange={(open) => !open && setEditingGoal(null)}
            onEditGoal={handleEditGoal}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
