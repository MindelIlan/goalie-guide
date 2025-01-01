import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
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
    }
  };

  const toggleSubgoal = async (subgoalId: number, completed: boolean) => {
    // Optimistically update the UI
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
      // Revert the optimistic update if there's an error
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newSubgoal}
          onChange={(e) => setNewSubgoal(e.target.value)}
          placeholder="Add a new subgoal..."
          className="flex-1"
        />
        <Button onClick={addSubgoal} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {subgoals.map((subgoal) => (
          <div key={subgoal.id} className="flex items-center gap-2">
            <Checkbox
              checked={subgoal.completed}
              onCheckedChange={(checked) => toggleSubgoal(subgoal.id, checked as boolean)}
            />
            <span className={subgoal.completed ? "line-through text-gray-500" : ""}>
              {subgoal.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};