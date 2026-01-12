export interface Schedule {
  id: string;
  name: string;
  type: 'weekly' | 'daily' | 'exam' | 'special';
  school_year: string;
  semester: string;
  status: 'draft' | 'active' | 'archived';
  periods: SchedulePeriod[];
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface SchedulePeriod {
  id: string;
  schedule_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  period_number: number;
  start_time: string;
  end_time: string;
  subject: string;
  teacher_id: string;
  class_name: string;
  room?: string;
  notes?: string;
}

export interface Substitution {
  id: string;
  original_teacher_id: string;
  substitute_teacher_id: string;
  date: Date;
  period_number: number;
  class_name: string;
  subject: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_by: string;
  created_at: Date;
}

export interface DailySupervision {
  id: string;
  supervisor_id: string;
  date: Date;
  type: 'break' | 'prayer' | 'general' | 'entrance' | 'dismissal';
  location: string;
  start_time: string;
  end_time: string;
  notes?: string;
  incidents?: SupervisionIncident[];
  status: 'scheduled' | 'completed' | 'missed';
}

export interface SupervisionIncident {
  id: string;
  supervision_id: string;
  type: 'behavioral' | 'safety' | 'medical' | 'other';
  description: string;
  students_involved?: string[];
  action_taken: string;
  severity: 'low' | 'medium' | 'high';
  follow_up_required: boolean;
  resolved: boolean;
  timestamp: Date;
}

export interface ClassroomVisit {
  id: string;
  visitor_id: string; // supervisor/admin
  teacher_id: string;
  class_name: string;
  subject: string;
  visit_date: Date;
  visit_time: string;
  duration: number; // minutes
  type: 'scheduled' | 'unscheduled' | 'mutual';
  purpose: string;
  observation_areas: ObservationArea[];
  strengths: string[];
  improvement_areas: string[];
  recommendations: string[];
  overall_rating: number; // 1-5
  follow_up_required: boolean;
  follow_up_date?: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface ObservationArea {
  area: string;
  rating: number; // 1-5
  notes: string;
}

export interface SchoolMeeting {
  id: string;
  title: string;
  type: 'department' | 'general' | 'parent_teacher' | 'administrative';
  date: Date;
  start_time: string;
  end_time: string;
  location: string;
  organizer_id: string;
  attendees: MeetingAttendee[];
  agenda: string[];
  minutes?: string;
  action_items: ActionItem[];
  status: 'scheduled' | 'completed' | 'cancelled';
  recurring: boolean;
  recurring_pattern?: any;
}

export interface MeetingAttendee {
  user_id: string;
  name: string;
  role: string;
  attendance_status: 'required' | 'optional' | 'tentative';
  actual_attendance?: 'present' | 'absent' | 'late';
  excuse?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assigned_to: string;
  due_date: Date;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}
