import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useAuthActions = () => {
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      // First clear local state and storage
      localStorage.removeItem('supabase.auth.token');
      
      // Clear all Supabase-related items from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });

      // Attempt to sign out from Supabase
      await supabase.auth.signOut();
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });

      // Force reload the page to clear any remaining state
      window.location.reload();
    } catch (error) {
      console.error("Sign out error:", error);
      
      // Ensure user is signed out locally even if there's an error
      toast({
        title: "Signed out",
        description: "You have been signed out locally",
      });
      
      // Force reload the page to clear any remaining state
      window.location.reload();
    }
  };

  return { handleSignOut };
};