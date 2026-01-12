export interface Teacher {
  id: string;
  employee_id: string;
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  classes: string[];
  weekly_quota: number; // نصاب الحصص الأسبوعي
  current_quota: number; // الحصص الحالية
  hire_date: Date;
  status: 'active' | 'inactive' | 'on_leave';
  specialization: string;
  qualifications: string[];
  experience_years: number;
  emergency_contact?: string;
  address?: string;
  national_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TeacherSchedule {
  teacher_id: string;
  day: string;
  periods: SchedulePeriod[];
}

export interface SchedulePeriod {
  period_number: number;
  subject: string;
  class_name: string;
  room?: string;
  start_time: string;
  end_time: string;
}

export interface TeacherStats {
  total_teachers: number;
  active_teachers: number;
  on_leave: number;
  by_subject: Record<string, number>;
  by_experience: Record<string, number>;
}
