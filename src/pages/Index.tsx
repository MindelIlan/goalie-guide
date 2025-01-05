import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Auth } from "@/components/Auth";
import { supabase } from "@/lib/supabase";
import { NotificationsProvider } from "@/components/notifications/NotificationsProvider";
import { Header } from "@/components/header/Header";
import { User } from "@supabase/supabase-js";
import { GoalsContainer } from "@/components/goals/GoalsContainer";
import { AIAssistant } from "@/components/AIAssistant";
import { GoalsProvider } from "@/contexts/GoalsContext";
import { WelcomeTour } from "@/components/tour/WelcomeTour";
import { Profile } from "@/components/Profile";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAddGoal = async (newGoal: {
    title: string;
    description: string;
    target_date: string;
    tags: string[];
    folder_id?: number | null;
  }) => {
    if (!user) return;

    const goal = {
      ...newGoal,
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
      return undefined;
    }

    toast({
      title: "Success",
      description: "Goal added successfully!",
    });
    return data.id;
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <NotificationsProvider>
      <GoalsProvider>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
          <div className="container max-w-4xl px-4">
            <div className="header-section">
              <Header user={user} />
            </div>
            
            <div className="profile-section mb-8">
              <Profile userId={user.id} />
            </div>

            <div className="goals-container">
              <GoalsContainer
                userId={user.id}
                onAddGoal={handleAddGoal}
              />
            </div>
          </div>

          <AIAssistant />
          <WelcomeTour />
        </div>
      </GoalsProvider>
    </NotificationsProvider>
  );
};

export default Index;