import { useState, useEffect } from "react";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { Profile } from "@/components/Profile";
import { useToast } from "@/hooks/use-toast";
import { Auth } from "@/components/Auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { GoalsList } from "@/components/GoalsList";
import { AIAssistant } from "@/components/AIAssistant";
import { NotificationsProvider } from "@/components/notifications/NotificationsProvider";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";

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
  const [user, setUser] = useState(null);
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
      setGoals([...goals, data]);
      toast({
        title: "Success",
        description: "Goal added successfully!",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      // First clear any local session data
      setUser(null);
      setGoals([]);
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }

      // Clear any remaining session data from localStorage
      localStorage.removeItem('supabase.auth.token');
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if there's an error, we want to clear the local state
      setUser(null);
      setGoals([]);
      toast({
        title: "Signed out",
        description: "You have been signed out locally",
      });
    }
  };

  const handleShare = () => {
    window.open('https://github.com/new', '_blank');
    toast({
      title: "Share Project",
      description: "Create a new repository and import your project to share it!",
    });
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="container max-w-4xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=64&h=64&fit=crop"
                alt="Goal Tracker Logo"
                className="w-16 h-16 rounded-full shadow-lg animate-fade-in"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">My 2025 Goals</h1>
                <p className="text-gray-600 mt-1">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsPopover />
              <Button 
                variant="destructive"
                onClick={handleSignOut} 
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 animate-fade-in">
            <Profile userId={user.id} />
          </div>

          <div className="mb-8 text-center">
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
      </div>
    </NotificationsProvider>
  );
};

export default Index;