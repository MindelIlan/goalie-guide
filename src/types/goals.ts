export interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
  user_id: string;
  created_at: string;
  folder_id: number | null;
}

export interface SuggestedGoal {
  title: string;
  description: string;
  target_date: string;
  tags: string[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedGoals?: SuggestedGoal[];
}