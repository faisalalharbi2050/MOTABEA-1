/**
 * محددات للحصول على البيانات من مخزن إسناد المواد
 * Assignment System Selectors
 */

import type { 
  AssignmentState, 
  ID, 
  Teacher, 
  Subject, 
  Classroom, 
  Assignment,
  Statistics 
} from './types';

// محددات البيانات الأساسية
export const selectTeachers = (state: AssignmentState): Teacher[] => state.teachers;
export const selectSubjects = (state: AssignmentState): Subject[] => state.subjects;
export const selectClassrooms = (state: AssignmentState): Classroom[] => state.classrooms;
export const selectAssignments = (state: AssignmentState): Assignment[] => state.assignments;

// محدد البيانات النشطة فقط
export const selectActiveTeachers = (state: AssignmentState): Teacher[] => 
  state.teachers.filter(teacher => teacher.isActive);

export const selectActiveSubjects = (state: AssignmentState): Subject[] => 
  state.subjects.filter(subject => subject.isActive);

export const selectActiveClassrooms = (state: AssignmentState): Classroom[] => 
  state.classrooms.filter(classroom => classroom.isActive);

export const selectActiveAssignments = (state: AssignmentState): Assignment[] => 
  state.assignments.filter(assignment => assignment.status === 'active');

// محددات البيانات حسب المعرف
export const selectTeacherById = (state: AssignmentState, id: ID): Teacher | undefined =>
  state.teachers.find(teacher => teacher.id === id);

export const selectSubjectById = (state: AssignmentState, id: ID): Subject | undefined =>
  state.subjects.find(subject => subject.id === id);

export const selectClassroomById = (state: AssignmentState, id: ID): Classroom | undefined =>
  state.classrooms.find(classroom => classroom.id === id);

export const selectAssignmentById = (state: AssignmentState, id: ID): Assignment | undefined =>
  state.assignments.find(assignment => assignment.id === id);

// محددات الإسنادات حسب المعلم
export const selectAssignmentsByTeacher = (state: AssignmentState, teacherId: ID): Assignment[] =>
  state.assignments.filter(assignment => assignment.teacherId === teacherId);

export const selectTeacherWorkload = (state: AssignmentState, teacherId: ID): number => {
  const assignments = selectAssignmentsByTeacher(state, teacherId);
  return assignments.reduce((total, assignment) => total + assignment.hoursPerWeek, 0);
};

export const selectTeacherSubjects = (state: AssignmentState, teacherId: ID): Subject[] => {
  const assignments = selectAssignmentsByTeacher(state, teacherId);
  const subjectIds = assignments.map(assignment => assignment.subjectId);
  return state.subjects.filter(subject => subjectIds.includes(subject.id));
};

export const selectTeacherClassrooms = (state: AssignmentState, teacherId: ID): Classroom[] => {
  const assignments = selectAssignmentsByTeacher(state, teacherId);
  const classroomIds = assignments.map(assignment => assignment.classroomId);
  return state.classrooms.filter(classroom => classroomIds.includes(classroom.id));
};

// محددات الإسنادات حسب المادة
export const selectAssignmentsBySubject = (state: AssignmentState, subjectId: ID): Assignment[] =>
  state.assignments.filter(assignment => assignment.subjectId === subjectId);

export const selectSubjectTeachers = (state: AssignmentState, subjectId: ID): Teacher[] => {
  const assignments = selectAssignmentsBySubject(state, subjectId);
  const teacherIds = assignments.map(assignment => assignment.teacherId);
  return state.teachers.filter(teacher => teacherIds.includes(teacher.id));
};

export const selectSubjectClassrooms = (state: AssignmentState, subjectId: ID): Classroom[] => {
  const assignments = selectAssignmentsBySubject(state, subjectId);
  const classroomIds = assignments.map(assignment => assignment.classroomId);
  return state.classrooms.filter(classroom => classroomIds.includes(classroom.id));
};

export const selectSubjectTotalHours = (state: AssignmentState, subjectId: ID): number => {
  const assignments = selectAssignmentsBySubject(state, subjectId);
  return assignments.reduce((total, assignment) => total + assignment.hoursPerWeek, 0);
};

// محددات الإسنادات حسب الفصل
export const selectAssignmentsByClassroom = (state: AssignmentState, classroomId: ID): Assignment[] =>
  state.assignments.filter(assignment => assignment.classroomId === classroomId);

export const selectClassroomTeachers = (state: AssignmentState, classroomId: ID): Teacher[] => {
  const assignments = selectAssignmentsByClassroom(state, classroomId);
  const teacherIds = assignments.map(assignment => assignment.teacherId);
  return state.teachers.filter(teacher => teacherIds.includes(teacher.id));
};

export const selectClassroomSubjects = (state: AssignmentState, classroomId: ID): Subject[] => {
  const assignments = selectAssignmentsByClassroom(state, classroomId);
  const subjectIds = assignments.map(assignment => assignment.subjectId);
  return state.subjects.filter(subject => subjectIds.includes(subject.id));
};

// محددات البحث والتصفية
export const selectFilteredTeachers = (state: AssignmentState): Teacher[] => {
  let teachers = selectActiveTeachers(state);

  if (state.filters.searchTerm) {
    const searchTerm = state.filters.searchTerm.toLowerCase();
    teachers = teachers.filter(teacher => 
      teacher.name.toLowerCase().includes(searchTerm) ||
      teacher.specialization.toLowerCase().includes(searchTerm) ||
      teacher.email?.toLowerCase().includes(searchTerm)
    );
  }

  if (state.filters.selectedSubjectId) {
    const assignedTeacherIds = selectAssignmentsBySubject(state, state.filters.selectedSubjectId)
      .map(assignment => assignment.teacherId);
    teachers = teachers.filter(teacher => assignedTeacherIds.includes(teacher.id));
  }

  return teachers;
};

export const selectFilteredSubjects = (state: AssignmentState): Subject[] => {
  let subjects = selectActiveSubjects(state);

  if (state.filters.searchTerm) {
    const searchTerm = state.filters.searchTerm.toLowerCase();
    subjects = subjects.filter(subject => 
      subject.name.toLowerCase().includes(searchTerm) ||
      subject.code.toLowerCase().includes(searchTerm) ||
      subject.description?.toLowerCase().includes(searchTerm)
    );
  }

  if (state.filters.level) {
    subjects = subjects.filter(subject => subject.level === state.filters.level);
  }

  if (state.filters.selectedTeacherId) {
    const assignedSubjectIds = selectAssignmentsByTeacher(state, state.filters.selectedTeacherId)
      .map(assignment => assignment.subjectId);
    subjects = subjects.filter(subject => assignedSubjectIds.includes(subject.id));
  }

  return subjects;
};

export const selectFilteredClassrooms = (state: AssignmentState): Classroom[] => {
  let classrooms = selectActiveClassrooms(state);

  if (state.filters.searchTerm) {
    const searchTerm = state.filters.searchTerm.toLowerCase();
    classrooms = classrooms.filter(classroom => 
      classroom.name.toLowerCase().includes(searchTerm) ||
      classroom.grade.toLowerCase().includes(searchTerm) ||
      classroom.section.toLowerCase().includes(searchTerm)
    );
  }

  if (state.filters.level) {
    classrooms = classrooms.filter(classroom => classroom.level === state.filters.level);
  }

  return classrooms;
};

// محددات الإحصائيات
export const selectStatistics = (state: AssignmentState): Statistics => {
  const activeTeachers = selectActiveTeachers(state);
  const activeSubjects = selectActiveSubjects(state);
  const activeClassrooms = selectActiveClassrooms(state);
  const activeAssignments = selectActiveAssignments(state);

  // إحصائيات أحمال المعلمين
  const teacherLoad = activeTeachers.map(teacher => {
    const currentLoad = selectTeacherWorkload(state, teacher.id);
    const percentage = teacher.maxLoad > 0 ? (currentLoad / teacher.maxLoad) * 100 : 0;
    
    return {
      teacherId: teacher.id,
      teacherName: teacher.name,
      currentLoad,
      maxLoad: teacher.maxLoad,
      percentage: Math.round(percentage * 100) / 100,
    };
  });

  // إحصائيات تغطية المواد
  const subjectCoverage = activeSubjects.map(subject => {
    const assignedHours = selectSubjectTotalHours(state, subject.id);
    const coverage = subject.requiredHours > 0 ? (assignedHours / subject.requiredHours) * 100 : 0;
    
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      assignedHours,
      requiredHours: subject.requiredHours,
      coverage: Math.round(coverage * 100) / 100,
    };
  });

  // إحصائيات إسناد الفصول
  const classroomAssignments = activeClassrooms.map(classroom => {
    const assignedSubjects = selectAssignmentsByClassroom(state, classroom.id).length;
    const totalSubjects = activeSubjects.filter(subject => subject.level === classroom.level).length;
    const coverage = totalSubjects > 0 ? (assignedSubjects / totalSubjects) * 100 : 0;
    
    return {
      classroomId: classroom.id,
      classroomName: classroom.name,
      assignedSubjects,
      totalSubjects,
      coverage: Math.round(coverage * 100) / 100,
    };
  });

  return {
    teacherLoad,
    subjectCoverage,
    classroomAssignments,
  };
};

// محددات المعلومات العامة
export const selectTotalCounts = (state: AssignmentState) => ({
  teachers: state.teachers.length,
  activeTeachers: selectActiveTeachers(state).length,
  subjects: state.subjects.length,
  activeSubjects: selectActiveSubjects(state).length,
  classrooms: state.classrooms.length,
  activeClassrooms: selectActiveClassrooms(state).length,
  assignments: state.assignments.length,
  activeAssignments: selectActiveAssignments(state).length,
});

// محدد المعلمين غير المكتملين (تحت الحد الأدنى)
export const selectUnderloadedTeachers = (state: AssignmentState): Teacher[] => {
  const minHours = state.settings.minHoursPerSubject;
  return selectActiveTeachers(state).filter(teacher => {
    const currentLoad = selectTeacherWorkload(state, teacher.id);
    return currentLoad < minHours;
  });
};

// محدد المعلمين المحملين فوق الطاقة
export const selectOverloadedTeachers = (state: AssignmentState): Teacher[] => {
  return selectActiveTeachers(state).filter(teacher => {
    const currentLoad = selectTeacherWorkload(state, teacher.id);
    return currentLoad > teacher.maxLoad;
  });
};

// محدد المواد غير المسندة
export const selectUnassignedSubjects = (state: AssignmentState): Subject[] => {
  const assignedSubjectIds = state.assignments.map(assignment => assignment.subjectId);
  return selectActiveSubjects(state).filter(subject => 
    !assignedSubjectIds.includes(subject.id)
  );
};

// محدد الفصول غير المكتملة (بدون جميع المواد المطلوبة)
export const selectIncompleteClassrooms = (state: AssignmentState): Classroom[] => {
  return selectActiveClassrooms(state).filter(classroom => {
    const assignedSubjects = selectAssignmentsByClassroom(state, classroom.id).length;
    const requiredSubjects = selectActiveSubjects(state)
      .filter(subject => subject.level === classroom.level).length;
    return assignedSubjects < requiredSubjects;
  });
};

// محدد التعارضات (معلم مسند لأكثر من فصل في نفس الوقت)
export const selectConflicts = (state: AssignmentState) => {
  // هذا يحتاج لبيانات الجدولة الزمنية التي لم يتم تطبيقها بعد
  // سيتم تطويره لاحقاً عند إضافة نظام الجدولة
  return [];
};

// محددات واجهة المستخدم
export const selectSelectedItems = (state: AssignmentState): string[] => state.ui.selectedItems;
export const selectViewMode = (state: AssignmentState) => state.ui.viewMode;
export const selectSidebarOpen = (state: AssignmentState): boolean => state.ui.sidebarOpen;
export const selectShowTeacherDetails = (state: AssignmentState): string | undefined => 
  state.ui.showTeacherDetails;

// محددات حالة التحميل والأخطاء
export const selectIsLoading = (state: AssignmentState): boolean => 
  Object.values(state.loading).some(loading => loading);

export const selectHasErrors = (state: AssignmentState): boolean => 
  Object.values(state.errors).some(error => error !== undefined);

export const selectCurrentErrors = (state: AssignmentState): string[] => 
  Object.values(state.errors).filter((error): error is string => error !== undefined);

// محددات الفلاتر النشطة
export const selectActiveFilters = (state: AssignmentState) => {
  const activeFilters: Array<{ key: string; value: any; label: string }> = [];

  if (state.filters.selectedTeacherId) {
    const teacher = selectTeacherById(state, state.filters.selectedTeacherId);
    activeFilters.push({
      key: 'selectedTeacherId',
      value: state.filters.selectedTeacherId,
      label: `المعلم: ${teacher?.name || 'غير معروف'}`,
    });
  }

  if (state.filters.selectedSubjectId) {
    const subject = selectSubjectById(state, state.filters.selectedSubjectId);
    activeFilters.push({
      key: 'selectedSubjectId',
      value: state.filters.selectedSubjectId,
      label: `المادة: ${subject?.name || 'غير معروفة'}`,
    });
  }

  if (state.filters.selectedClassroomId) {
    const classroom = selectClassroomById(state, state.filters.selectedClassroomId);
    activeFilters.push({
      key: 'selectedClassroomId',
      value: state.filters.selectedClassroomId,
      label: `الفصل: ${classroom?.name || 'غير معروف'}`,
    });
  }

  if (state.filters.level) {
    const levelLabels = {
      primary: 'ابتدائي',
      middle: 'متوسط',
      high: 'ثانوي',
    };
    activeFilters.push({
      key: 'level',
      value: state.filters.level,
      label: `المرحلة: ${levelLabels[state.filters.level]}`,
    });
  }

  if (state.filters.semester) {
    const semesterLabels = {
      first: 'الفصل الأول',
      second: 'الفصل الثاني',
      full: 'العام الكامل',
    };
    activeFilters.push({
      key: 'semester',
      value: state.filters.semester,
      label: `الفصل: ${semesterLabels[state.filters.semester]}`,
    });
  }

  if (state.filters.searchTerm) {
    activeFilters.push({
      key: 'searchTerm',
      value: state.filters.searchTerm,
      label: `البحث: ${state.filters.searchTerm}`,
    });
  }

  return activeFilters;
};