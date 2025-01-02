import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface AddGoalSubgoalsProps {
  subgoals: string[];
  onSubgoalsChange: (subgoals: string[]) => void;
}

export const AddGoalSubgoals = ({ subgoals, onSubgoalsChange }: AddGoalSubgoalsProps) => {
  const [newSubgoal, setNewSubgoal] = useState("");

  const handleAddSubgoal = () => {
    if (newSubgoal.trim()) {
      onSubgoalsChange([...subgoals, newSubgoal.trim()]);
      setNewSubgoal("");
    }
  };

  const handleRemoveSubgoal = (index: number) => {
    onSubgoalsChange(subgoals.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>Subgoals (Optional)</Label>
      <div className="flex gap-2">
        <Input
          value={newSubgoal}
          onChange={(e) => setNewSubgoal(e.target.value)}
          placeholder="Add a subgoal"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSubgoal();
            }
          }}
        />
        <Button 
          type="button" 
          variant="secondary"
          onClick={handleAddSubgoal}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {subgoals.length > 0 && (
        <div className="mt-2 space-y-2">
          {subgoals.map((subgoal, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 bg-secondary/20 rounded-md"
            >
              <span>{subgoal}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveSubgoal(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};