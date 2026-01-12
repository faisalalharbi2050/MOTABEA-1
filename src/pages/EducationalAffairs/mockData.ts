
import { PreparationRecord, FieldVisitRecord } from '../../types/educational-affairs';

export const mockTeachers = [
  { id: '1', name: 'أحمد محمد السعد', subject: 'الرياضيات', lastVisit: '2025-12-10', visitCount: 3 },
  { id: '2', name: 'فاطمة علي الأحمد', subject: 'اللغة العربية', lastVisit: '2025-12-18', visitCount: 5 },
  { id: '3', name: 'خالد محمد العمر', subject: 'العلوم', lastVisit: '2025-12-25', visitCount: 2 },
  { id: '4', name: 'سارة أحمد الزهراني', subject: 'الإنجليزية', lastVisit: undefined, visitCount: 0 }, // Never visited
  { id: '5', name: 'محمد عبدالله العمري', subject: 'التربية الإسلامية', lastVisit: '2025-11-15', visitCount: 1 }, // Overdue
];

export const mockPreparationLogs: Record<string, 'PREPARED' | 'NOT_PREPARED'> = {
  '1': 'PREPARED',
  '2': 'NOT_PREPARED',
  '3': 'PREPARED',
};

export const mockHistoryVisits: FieldVisitRecord[] = [
  {
    id: 'v1',
    teacherId: '1',
    teacherName: 'أحمد محمد السعد',
    date: '2023-12-10',
    visitType: 'STUDENT_BOOKS',
    executionStatus: 'FULL',
    noteType: 'DISTINCTION',
    note: 'الطلاب مهتمون جداً والواجبات مصححة أولاً بأول',
    createdAt: '2023-12-10T10:00:00Z'
  }
];
