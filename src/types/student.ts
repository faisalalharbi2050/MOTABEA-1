export interface Student {
  id: string;
  student_id: string;
  name: string;
  class_id?: string;
  school_id?: string;
  class_name: string;
  grade_level: number;
  section?: string;
  birth_date: Date;
  gender: 'male' | 'female';
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  mother_name?: string;
  mother_phone?: string;
  emergency_contact: string;
  address: string;
  national_id?: string;
  enrollment_date: Date;
  status: 'active' | 'transferred' | 'graduated' | 'dropped' | 'suspended';
  medical_conditions?: string[];
  behavioral_notes?: string;
  academic_level: 'excellent' | 'good' | 'average' | 'needs_improvement';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface StudentBehavior {
  id: string;
  student_id: string;
  date: Date;
  type: 'positive' | 'negative' | 'neutral';
  category: string;
  description: string;
  teacher_id: string;
  action_taken?: string;
  parent_notified: boolean;
  follow_up_required: boolean;
  resolved: boolean;
}

export interface StudentAttendance {
  id: string;
  student_id: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  period?: number;
  subject?: string;
  notes?: string;
  parent_notified: boolean;
}

export interface ParentVisit {
  id: string;
  student_id: string;
  parent_name: string;
  visit_date: Date;
  purpose: string;
  teacher_met: string;
  discussion_points: string[];
  action_items: string[];
  follow_up_date?: Date;
  status: 'completed' | 'scheduled' | 'cancelled';
}

export interface StudentStats {
  total_students: number;
  by_grade: Record<number, number>;
  by_class: Record<string, number>;
  attendance_rate: number;
  behavioral_incidents: number;
}

// إضافة أنواع جديدة لاستيراد الطلاب
export interface StudentExcelRow {
  name: string;
  grade_level: number;
  section: string;
  parent_phone: string;
}

export interface StudentImportData extends StudentExcelRow {
  student_number?: string;
  row_number?: number;
  class_id?: string;
  school_id: string;
}

export interface ImportValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface StudentImportResult {
  success: boolean;
  imported_count: number;
  failed_count: number;
  errors: ImportValidationError[];
  needs_review: StudentImportData[];
}
