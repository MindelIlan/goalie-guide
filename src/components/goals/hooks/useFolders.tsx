import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Folder } from "@/types/goals";

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.log('No active session found');
        return;
      }

      const { data, error } = await supabase
        .from('goal_folders')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching folders:', error);
        toast({
          title: "Error",
          description: "Failed to fetch folders",
          variant: "destructive",
        });
      } else {
        // Ensure all required fields are present
        const validFolders = data?.map(folder => ({
          id: folder.id,
          name: folder.name,
          description: folder.description,
          created_at: folder.created_at,
        })) || [];
        
        setFolders(validFolders);
      }
    } catch (err) {
      console.error('Unexpected error fetching folders:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching folders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  return { folders, setFolders, isLoading };
};