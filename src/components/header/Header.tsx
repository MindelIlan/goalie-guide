import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useAuthActions } from "@/components/auth/AuthActions";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface HeaderProps {
  user: User;
}

export const Header = ({ user }: HeaderProps) => {
  const { handleSignOut } = useAuthActions();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setUsername(data.username);
      }
    };

    fetchProfile();
  }, [user.id]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div className="flex items-center gap-4">
        <img
          src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=64&h=64&fit=crop"
          alt="Goal Tracker Logo"
          className="w-16 h-16 rounded-full shadow-lg animate-fade-in"
        />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">My 2025 Goals</h1>
          <p className="text-gray-600 mt-1">{username || user.email}</p>
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
  );
};