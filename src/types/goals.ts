export interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
  created_at: string;
  folder_id?: number | null;
}

export interface Folder {
  id: number;
  name: string;
  description: string | null;
}