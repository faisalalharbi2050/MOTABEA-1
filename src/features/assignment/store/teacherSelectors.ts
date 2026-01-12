/**
 * محددات خاصة باختيارات المعلمين وملخصات الإسناد
 * Teacher Selection and Assignment Summary Selectors
 */

import type { AssignmentState, TeacherAssignmentSummary, PlanSummary } from './types';

/**
 * حساب ملخص إسناد معلم محدد
 */
export const selectAssignmentSummaryByTeacher = (
  state: AssignmentState, 
  teacherId: string
): TeacherAssignmentSummary | null => {
  const teacher = state.teachers.find(t => t.id === teacherId);
  if (!teacher) return null;

  const teacherAssignments = state.assignments.filter(
    a => a.teacherId === teacherId && a.status === 'active'
  );

  const assignments = teacherAssignments.map(assignment => {
    const subject = state.subjects.find(s => s.id === assignment.subjectId);
    const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
    
    return {
      subjectId: assignment.subjectId,
      subjectName: subject?.name || 'مادة غير معروفة',
      classroomId: assignment.classroomId,
      classroomName: classroom?.name || 'فصل غير معروف',
      hoursPerWeek: assignment.hoursPerWeek,
      semester: assignment.semester,
    };
  });

  const totalHours = assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
  const loadPercentage = teacher.maxLoad > 0 ? (totalHours / teacher.maxLoad) * 100 : 0;

  return {
    teacherId: teacher.id,
    teacherName: teacher.name,
    specialization: teacher.specialization,
    totalAssignments: assignments.length,
    totalHours,
    maxLoad: teacher.maxLoad,
    loadPercentage: Math.round(loadPercentage * 100) / 100,
    assignments,
  };
};

/**
 * حساب ملخصات خطة المواد للمعلمين المحددين أو المفلترين
 */
export const selectPlanSummaries = (
  state: AssignmentState,
  filteredTeacherIds?: string[]
): PlanSummary => {
  // تحديد المعلمين المراد تلخيصهم
  let targetTeacherIds: string[];
  
  if (filteredTeacherIds && filteredTeacherIds.length > 0) {
    // استخدام المعلمين المُمررين (مفلترين)
    targetTeacherIds = filteredTeacherIds;
  } else if (state.ui.selectedTeacherIds.size > 0) {
    // استخدام المعلمين المحددين
    targetTeacherIds = Array.from(state.ui.selectedTeacherIds);
  } else {
    // استخدام جميع المعلمين النشطين
    targetTeacherIds = state.teachers.filter(t => t.isActive).map(t => t.id);
  }

  // إنشاء ملخصات للمعلمين
  const teacherSummaries: TeacherAssignmentSummary[] = targetTeacherIds
    .map(teacherId => selectAssignmentSummaryByTeacher(state, teacherId))
    .filter((summary): summary is TeacherAssignmentSummary => summary !== null)
    .sort((a, b) => a.teacherName.localeCompare(b.teacherName, 'ar')); // فرز أبجدي عربي

  // حساب الإحصائيات الإجمالية
  const teacherCount = teacherSummaries.length;
  const totalHours = teacherSummaries.reduce((sum, t) => sum + t.totalHours, 0);
  const averageLoad = teacherCount > 0 ? totalHours / teacherCount : 0;

  return {
    teacherCount,
    totalHours,
    averageLoad: Math.round(averageLoad * 100) / 100,
    teacherSummaries,
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * حساب المعلمين المفلترين المتاحين للاختيار
 */
export const selectFilterableTeachers = (state: AssignmentState): string[] => {
  const { filters } = state;
  
  let filteredTeachers = state.teachers.filter(teacher => teacher.isActive);

  // تطبيق فلتر البحث
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filteredTeachers = filteredTeachers.filter(teacher =>
      teacher.name.toLowerCase().includes(searchLower) ||
      teacher.specialization.toLowerCase().includes(searchLower)
    );
  }

  // تطبيق فلاتر أخرى (يمكن إضافة المزيد حسب الحاجة)
  if (filters.level) {
    const teacherIdsInLevel = state.assignments
      .filter(a => a.status === 'active')
      .map(a => a.classroomId)
      .map(classroomId => state.classrooms.find(c => c.id === classroomId))
      .filter(classroom => classroom?.level === filters.level)
      .map(classroom => state.assignments.find(a => a.classroomId === classroom!.id)?.teacherId)
      .filter((id): id is string => id !== undefined);

    filteredTeachers = filteredTeachers.filter(teacher =>
      teacherIdsInLevel.includes(teacher.id)
    );
  }

  return filteredTeachers
    .map(t => t.id)
    .sort((a, b) => {
      const teacherA = state.teachers.find(t => t.id === a);
      const teacherB = state.teachers.find(t => t.id === b);
      return (teacherA?.name || '').localeCompare(teacherB?.name || '', 'ar');
    });
};

/**
 * فحص ما إذا كان جميع المعلمين المفلترين محددين
 */
export const selectAllFilteredTeachersSelected = (state: AssignmentState): boolean => {
  const filteredTeacherIds = selectFilterableTeachers(state);
  return filteredTeacherIds.length > 0 && 
         filteredTeacherIds.every(id => state.ui.selectedTeacherIds.has(id));
};

/**
 * حساب عدد المعلمين المحددين من المفلترين
 */
export const selectSelectedFilteredTeachersCount = (state: AssignmentState): number => {
  const filteredTeacherIds = selectFilterableTeachers(state);
  return filteredTeacherIds.filter(id => state.ui.selectedTeacherIds.has(id)).length;
};