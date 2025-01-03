import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { Goal } from "./goals";

export type GoalPayload = {
  id: number;
  user_id: string;
  folder_id: number | null;
  [key: string]: any;
};

export type RealtimeGoalPayload = RealtimePostgresChangesPayload<{
  old: GoalPayload;
  new: GoalPayload;
}>;