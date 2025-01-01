export interface Goal {
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
  user_id?: string;
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