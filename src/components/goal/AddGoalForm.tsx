import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/TagInput";
import { AddGoalSubgoals } from "./AddGoalSubgoals";

interface Folder {
  id: number;
  name: string;
  description: string | null;
}

interface AddGoalFormProps {
  title: string;
  description: string;
  target_date: string;
  tags: string[];
  subgoals: string[];
  selectedFolderId: number | null;
  folders: Folder[];
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTargetDateChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSubgoalsChange: (subgoals: string[]) => void;
  onFolderChange: (folderId: number | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddGoalForm = ({
  title,
  description,
  target_date,
  tags,
  subgoals,
  selectedFolderId,
  folders,
  onTitleChange,
  onDescriptionChange,
  onTargetDateChange,
  onTagsChange,
  onSubgoalsChange,
  onFolderChange,
  onSubmit,
}: AddGoalFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Goal Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter your goal"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe your goal"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="folder">Folder (Optional)</Label>
        <select
          id="folder"
          value={selectedFolderId || ""}
          onChange={(e) => onFolderChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="">No Folder</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="target_date">Target Date</Label>
        <Input
          id="target_date"
          type="date"
          value={target_date}
          onChange={(e) => onTargetDateChange(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Tags</Label>
        <TagInput tags={tags} setTags={onTagsChange} />
      </div>
      
      <AddGoalSubgoals 
        subgoals={subgoals}
        onSubgoalsChange={onSubgoalsChange}
      />

      <Button type="submit" className="w-full">Add Goal</Button>
    </form>
  );
};