// أنواع البيانات لصفحة إدارة الفصول

export interface Stage {
  id: string;
  name: string;
  grades: number[];
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
  active: boolean;
}

export interface Grade {
  id: string;
  number: number;
  name: string;
  stageId: string;
  departmentId: string;
}

export interface Classroom {
  id: string;
  name: string;
  gradeId: string;
  stageId: string;
  departmentId: string;
  section?: string;
  capacity: number;
  currentStudents: number;
  roomNumber?: string;
  classTeacherId?: string;
  academicYear: string;
  semester: string;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassroomFormData {
  name: string;
  gradeId: string;
  capacity: number;
  roomNumber?: string;
}

export interface StageWithGrades extends Omit<Stage, 'grades'> {
  grades: Grade[];
}

export interface ClassroomsByGrade {
  grade: Grade;
  classrooms: Classroom[];
}

export interface ClassroomManagementState {
  stages: Stage[];
  departments: Department[];
  selectedStageId: string | null;
  selectedDepartmentId: string | null;
  grades: Grade[];
  classrooms: Classroom[];
  loading: boolean;
  error: string | null;
}

export interface CreateClassroomsRequest {
  gradeId: string;
  count: number;
  namePrefix?: string;
}

export interface UpdateClassroomRequest {
  id: string;
  name?: string;
  capacity?: number;
  roomNumber?: string;
  notes?: string;
}

export interface DeleteClassroomRequest {
  id: string;
}

export interface BulkCreateClassroomsRequest {
  requests: CreateClassroomsRequest[];
}

export interface ClassroomSubjectAssignment {
  classroomId: string;
  subjectId: string;
  weeklyHours: number;
  teacherId?: string;
}

export interface ClassroomStats {
  totalClassrooms: number;
  totalCapacity: number;
  totalStudents: number;
  utilizationRate: number;
  classroomsByStage: Record<string, number>;
  classroomsByGrade: Record<string, number>;
}