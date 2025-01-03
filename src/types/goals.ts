export interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
  created_at: string;
  folder_id: number | null;
  user_id: string;
}

export interface Folder {
  id: number;
  name: string;
  description: string | null;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedGoals?: Goal[];
}