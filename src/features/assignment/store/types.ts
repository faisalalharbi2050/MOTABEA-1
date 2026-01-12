/**
 * أنواع بيانات نظام إسناد المواد
 * Subject Assignment System Types
 */

// معرف فريد لكل كيان
export type ID = string;

// بيانات المعلم
export interface Teacher {
  id: ID;
  name: string;
  email?: string;
  phone?: string;
  specialization: string;
  maxLoad: number; // الحد الأقصى للحصص
  currentLoad: number; // الحصص الحالية
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// بيانات المادة
export interface Subject {
  id: ID;
  name: string;
  code: string;
  description?: string;
  requiredHours: number; // عدد الحصص المطلوبة أسبوعياً
  level: 'primary' | 'middle' | 'high';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// بيانات الفصل
export interface Classroom {
  id: ID;
  name: string;
  grade: string;
  section: string;
  capacity: number;
  currentStudents: number;
  level: 'primary' | 'middle' | 'high';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// إسناد مادة لمعلم في فصل
export interface Assignment {
  id: ID;
  teacherId: ID;
  subjectId: ID;
  classroomId: ID;
  hoursPerWeek: number;
  semester: 'first' | 'second' | 'full';
  academicYear: string;
  status: 'active' | 'pending' | 'cancelled';
  notes?: string;
  assignedAt: string;
  assignedBy: ID; // معرف المستخدم الذي قام بالإسناد
}

// حالة المخزن الرئيسية
export interface AssignmentState {
  // البيانات الأساسية
  teachers: Teacher[];
  subjects: Subject[];
  classrooms: Classroom[];
  assignments: Assignment[];
  
  // حالة التحميل
  loading: {
    teachers: boolean;
    subjects: boolean;
    classrooms: boolean;
    assignments: boolean;
    saving: boolean;
  };
  
  // الأخطاء
  errors: {
    teachers?: string;
    subjects?: string;
    classrooms?: string;
    assignments?: string;
    general?: string;
  };
  
  // الفلاتر والبحث
  filters: {
    selectedTeacherId?: ID;
    selectedSubjectId?: ID;
    selectedClassroomId?: ID;
    level?: 'primary' | 'middle' | 'high';
    semester?: 'first' | 'second' | 'full';
    status?: 'active' | 'pending' | 'cancelled';
    searchTerm: string;
  };
  
  // الواجهة
  ui: {
    selectedItems: ID[]; // العناصر المختارة للعمليات الجماعية
    selectedTeacherIds: Set<string>; // المعلمون المحددون للتقارير والملخصات
    showTeacherDetails?: ID;
    viewMode: 'grid' | 'list' | 'matrix';
    sidebarOpen: boolean;
    exportMenuOpen: boolean;
    whatsappMenuOpen: boolean;
  };
  
  // التراجع والإعادة
  history: {
    past: Array<{
      state: AssignmentState;
      action: {
        type: string;
        description: string;
        timestamp: number;
        entityId?: string;
        entityName?: string;
      };
    }>;
    future: Array<{
      state: AssignmentState;
      action: {
        type: string;
        description: string;
        timestamp: number;
        entityId?: string;
        entityName?: string;
      };
    }>;
    canUndo: boolean;
    canRedo: boolean;
  };
  
  // الإعدادات
  settings: {
    academicYear: string;
    schoolName?: string;
    defaultSemester: 'first' | 'second' | 'full';
    maxHoursPerTeacher: number;
    minHoursPerSubject: number;
    autoSave: boolean;
    rtlMode: boolean;
  };
}

// أنواع الإجراءات
export type AssignmentAction =
  // إجراءات البيانات
  | { type: 'SET_TEACHERS'; payload: Teacher[] }
  | { type: 'ADD_TEACHER'; payload: Teacher }
  | { type: 'UPDATE_TEACHER'; payload: { id: ID; updates: Partial<Teacher> } }
  | { type: 'DELETE_TEACHER'; payload: ID }
  
  | { type: 'SET_SUBJECTS'; payload: Subject[] }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'UPDATE_SUBJECT'; payload: { id: ID; updates: Partial<Subject> } }
  | { type: 'DELETE_SUBJECT'; payload: ID }
  
  | { type: 'SET_CLASSROOMS'; payload: Classroom[] }
  | { type: 'ADD_CLASSROOM'; payload: Classroom }
  | { type: 'UPDATE_CLASSROOM'; payload: { id: ID; updates: Partial<Classroom> } }
  | { type: 'DELETE_CLASSROOM'; payload: ID }
  
  | { type: 'SET_ASSIGNMENTS'; payload: Assignment[] }
  | { type: 'ADD_ASSIGNMENT'; payload: Assignment }
  | { type: 'UPDATE_ASSIGNMENT'; payload: { id: ID; updates: Partial<Assignment> } }
  | { type: 'DELETE_ASSIGNMENT'; payload: ID }
  | { type: 'BULK_DELETE_ASSIGNMENTS'; payload: ID[] }
  
  // إجراءات التحميل والأخطاء
  | { type: 'SET_LOADING'; payload: { key: keyof AssignmentState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof AssignmentState['errors']; error?: string } }
  | { type: 'CLEAR_ERRORS' }
  
  // إجراءات الفلاتر
  | { type: 'SET_FILTER'; payload: { key: keyof AssignmentState['filters']; value: any } }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  
  // إجراءات الواجهة
  | { type: 'SELECT_ITEMS'; payload: ID[] }
  | { type: 'TOGGLE_ITEM_SELECTION'; payload: ID }
  | { type: 'CLEAR_SELECTION' }
  // إجراءات تحديد المعلمين
  | { type: 'SELECT_TEACHER'; payload: string }
  | { type: 'SELECT_TEACHERS'; payload: string[] }
  | { type: 'SELECT_ALL_FILTERED_TEACHERS'; payload: string[] }
  | { type: 'CLEAR_TEACHER_SELECTION' }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' | 'matrix' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SHOW_TEACHER_DETAILS'; payload?: ID }
  | { type: 'TOGGLE_EXPORT_MENU' }
  | { type: 'TOGGLE_WHATSAPP_MENU' }
  
  // إجراءات التراجع والإعادة
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_STATE_TO_HISTORY' }
  | { type: 'CLEAR_HISTORY' }
  
  // إجراءات الإعدادات
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AssignmentState['settings']> };

// ملخص إسناد معلم
export interface TeacherAssignmentSummary {
  teacherId: ID;
  teacherName: string;
  specialization: string;
  totalAssignments: number;
  totalHours: number;
  maxLoad: number;
  loadPercentage: number;
  assignments: Array<{
    subjectId: ID;
    subjectName: string;
    classroomId: ID;
    classroomName: string;
    hoursPerWeek: number;
    semester: 'first' | 'second' | 'full';
  }>;
}

// ملخص خطة المواد
export interface PlanSummary {
  teacherCount: number;
  totalHours: number;
  averageLoad: number;
  teacherSummaries: TeacherAssignmentSummary[];
  lastUpdated: string;
}

// أنواع التصدير
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'html' | 'csv';
  includeDetails: boolean;
  includeStatistics: boolean;
  groupBy?: 'teacher' | 'subject' | 'classroom';
  customTitle?: string;
  logoUrl?: string;
}

// بيانات التقرير
export interface ReportData {
  title: string;
  subtitle?: string;
  generatedAt: string;
  generatedBy: string;
  academicYear: string;
  semester: string;
  assignments: Assignment[];
  teachers: Teacher[];
  subjects: Subject[];
  classrooms: Classroom[];
  statistics: {
    totalAssignments: number;
    totalTeachers: number;
    totalSubjects: number;
    totalClassrooms: number;
    averageLoad: number;
    unassignedSubjects: number;
  };
}

// أنواع الرسائل والإشعارات
export interface Notification {
  id: ID;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// أنواع خيارات WhatsApp
export interface WhatsAppOptions {
  mode: 'individual' | 'group';
  recipients: ID[]; // معرفات المعلمين
  template: 'assignment' | 'schedule' | 'custom';
  customMessage?: string;
  includeAttachment: boolean;
  attachmentFormat?: 'pdf' | 'image';
}

// أنواع التحقق من الصحة
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// أنواع البحث والتصفية
export interface SearchResult {
  teachers: Teacher[];
  subjects: Subject[];
  classrooms: Classroom[];
  assignments: Assignment[];
  total: number;
}

// أنواع الإحصائيات
export interface Statistics {
  teacherLoad: Array<{
    teacherId: ID;
    teacherName: string;
    currentLoad: number;
    maxLoad: number;
    percentage: number;
  }>;
  subjectCoverage: Array<{
    subjectId: ID;
    subjectName: string;
    assignedHours: number;
    requiredHours: number;
    coverage: number;
  }>;
  classroomAssignments: Array<{
    classroomId: ID;
    classroomName: string;
    assignedSubjects: number;
    totalSubjects: number;
    coverage: number;
  }>;
}