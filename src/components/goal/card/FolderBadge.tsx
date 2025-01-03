import { Folder } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";

interface FolderBadgeProps {
  folderId: number | null | undefined;
}

export const FolderBadge = ({ folderId }: FolderBadgeProps) => {
  const [folderName, setFolderName] = useState<string | null>(null);

  useEffect(() => {
    const fetchFolderName = async () => {
      if (folderId) {
        const { data, error } = await supabase
          .from('goal_folders')
          .select('name')
          .eq('id', folderId)
          .single();
        
        if (!error && data) {
          setFolderName(data.name);
        }
      } else {
        setFolderName(null);
      }
    };

    fetchFolderName();
  }, [folderId]);

  if (!folderName) return null;

  return (
    <div className="absolute top-2 left-2 flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
      <Folder className="h-3 w-3" />
      <span>{folderName}</span>
    </div>
  );
};