import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type GoalPayload = {
  id: number;
  user_id: string;
  folder_id: number | null;
  [key: string]: any;
};

export type RealtimeGoalPayload = RealtimePostgresChangesPayload<{
  old: GoalPayload | null;
  new: GoalPayload | null;
}>;