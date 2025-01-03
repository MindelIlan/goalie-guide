import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Share2, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface GoalHeaderProps {
  title: string;
  description: string;
  tags: string[];
  isHovered: boolean;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const GoalHeader = ({
  title,
  description,
  tags,
  isHovered,
  onShare,
  onEdit,
  onDelete,
}: GoalHeaderProps) => {
  const handleAction = async (
    e: React.MouseEvent,
    action: () => void | Promise<void>,
    actionName: string
  ) => {
    try {
      e.stopPropagation(); // Prevent event bubbling
      await action();
    } catch (error) {
      console.error(`Error during ${actionName}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionName.toLowerCase()} goal. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 tracking-tight">{title}</h3>
        <p className="text-gray-600 mt-1 line-clamp-2">{description}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags?.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className={`flex gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-gray-100"
          onClick={(e) => handleAction(e, onShare, 'Share')}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-gray-100"
          onClick={(e) => handleAction(e, onEdit, 'Edit')}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-gray-100 hover:text-red-500"
          onClick={(e) => handleAction(e, onDelete, 'Delete')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};