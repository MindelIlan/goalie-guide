export interface GoalPayload {
  id: number;
  title: string;
  description: string | null;
  progress: number;
  target_date: string | null;
  user_id: string;
  folder_id: number | null;
  created_at: string;
  tags: string[];
}

export interface RealtimeGoalPayload {
  old?: GoalPayload;
  new?: GoalPayload;
}