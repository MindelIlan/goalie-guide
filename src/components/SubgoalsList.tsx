import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ListPlus, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface Subgoal {
  id: number;
  title: string;
  completed: boolean;
}

interface SubgoalsListProps {
  goalId: number;
  onProgressUpdate: (progress: number) => void;
}

export const SubgoalsList = ({ goalId, onProgressUpdate }: SubgoalsListProps) => {
  const [subgoals, setSubgoals] = useState<Subgoal[]>([]);
  const [newSubgoal, setNewSubgoal] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const fetchSubgoals = async () => {
    const { data, error } = await supabase
      .from("subgoals")
      .select("*")
      .eq("goal_id", goalId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subgoals",
        variant: "destructive",
      });
    } else {
      setSubgoals(data || []);
      updateProgress(data || []);
      // Automatically expand if there are subgoals
      if ((data || []).length > 0) {
        setIsExpanded(true);
      }
    }
  };

  const updateProgress = (currentSubgoals: Subgoal[]) => {
    if (currentSubgoals.length === 0) {
      onProgressUpdate(0);
      return;
    }
    const completedCount = currentSubgoals.filter(sg => sg.completed).length;
    const progress = Math.round((completedCount / currentSubgoals.length) * 100);
    onProgressUpdate(progress);
  };

  const addSubgoal = async () => {
    if (!newSubgoal.trim()) return;

    const { data, error } = await supabase
      .from("subgoals")
      .insert([{ goal_id: goalId, title: newSubgoal }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add subgoal",
        variant: "destructive",
      });
    } else {
      const updatedSubgoals = [...subgoals, data];
      setSubgoals(updatedSubgoals);
      setNewSubgoal("");
      updateProgress(updatedSubgoals);
      setIsExpanded(true);
    }
  };

  const toggleSubgoal = async (subgoalId: number, completed: boolean) => {
    const updatedSubgoals = subgoals.map(sg =>
      sg.id === subgoalId ? { ...sg, completed } : sg
    );
    setSubgoals(updatedSubgoals);
    updateProgress(updatedSubgoals);

    const { error } = await supabase
      .from("subgoals")
      .update({ completed })
      .eq("id", subgoalId);

    if (error) {
      const originalSubgoals = subgoals;
      setSubgoals(originalSubgoals);
      updateProgress(originalSubgoals);
      
      toast({
        title: "Error",
        description: "Failed to update subgoal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSubgoals();
  }, [goalId]);

  if (!isExpanded && subgoals.length === 0) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className="w-full mt-2 text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
      >
        <ListPlus className="h-4 w-4" />
        Add Subgoals
      </Button>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in-50">
      <div className="flex gap-2">
        <Input
          value={newSubgoal}
          onChange={(e) => setNewSubgoal(e.target.value)}
          placeholder="Add a new subgoal..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addSubgoal();
            }
          }}
        />
        <Button onClick={addSubgoal} size="icon" variant="secondary">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {subgoals.length > 0 && (
        <div className="space-y-2">
          {subgoals.map((subgoal) => (
            <div
              key={subgoal.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent group"
            >
              <Checkbox
                checked={subgoal.completed}
                onCheckedChange={(checked) => toggleSubgoal(subgoal.id, checked as boolean)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span
                className={`flex-1 transition-colors ${
                  subgoal.completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {subgoal.title}
              </span>
              {subgoal.completed && (
                <Check className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          ))}
        </div>
      )}

      {subgoals.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="w-full text-muted-foreground hover:text-primary"
        >
          Hide Subgoals
        </Button>
      )}
    </div>
  );
};