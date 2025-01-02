import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Folder {
  id: number;
  name: string;
  description: string | null;
}

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoading(true);
      try {
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
          setFolders(data || []);
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

    fetchFolders();
  }, [toast]);

  return { folders, setFolders, isLoading };
};