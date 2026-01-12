export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'urgent' | 'project';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  assigned_to: string; // user_id
  assigned_by: string; // user_id
  due_date: Date;
  start_date?: Date;
  completion_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;
  department: string;
  category: string;
  tags: string[];
  attachments?: TaskAttachment[];
  comments: TaskComment[];
  subtasks: SubTask[];
  dependencies: string[]; // task_ids
  completion_percentage: number;
  recurring: boolean;
  recurring_pattern?: RecurringPattern;
  created_at: Date;
  updated_at: Date;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  due_date?: Date;
  assigned_to?: string;
}

export interface TaskComment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: Date;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_by: string;
  uploaded_at: Date;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every X days/weeks/months
  days_of_week?: number[]; // for weekly: 0=Sunday, 1=Monday, etc.
  day_of_month?: number; // for monthly
  end_date?: Date;
  occurrences?: number;
}

export interface TaskLog {
  id: string;
  task_id: string;
  user_id: string;
  action: 'created' | 'updated' | 'completed' | 'cancelled' | 'assigned' | 'commented';
  old_value?: any;
  new_value?: any;
  description: string;
  timestamp: Date;
}

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  by_priority: Record<string, number>;
  by_status: Record<string, number>;
  by_department: Record<string, number>;
  completion_rate: number;
}

export interface TaskFilter {
  status?: string[];
  priority?: string[];
  type?: string[];
  assigned_to?: string[];
  department?: string[];
  date_range?: {
    start: Date;
    end: Date;
  };
  search?: string;
}
