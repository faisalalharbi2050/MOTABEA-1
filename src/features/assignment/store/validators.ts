/**
 * وظائف التحقق من صحة البيانات لنظام إسناد المواد
 * Assignment System Validation Functions
 */

import type { 
  Teacher, 
  Subject, 
  Classroom, 
  Assignment, 
  AssignmentState, 
  ValidationResult, 
  ID 
} from './types';

// التحقق من صحة بيانات المعلم
export function validateTeacher(teacher: Partial<Teacher>, existingTeachers?: Teacher[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // التحقق من الحقول المطلوبة
  if (!teacher.name || teacher.name.trim().length === 0) {
    errors.push('اسم المعلم مطلوب');
  } else if (teacher.name.trim().length < 2) {
    errors.push('اسم المعلم يجب أن يكون على الأقل حرفين');
  } else if (teacher.name.trim().length > 100) {
    errors.push('اسم المعلم طويل جداً (الحد الأقصى 100 حرف)');
  }

  if (!teacher.specialization || teacher.specialization.trim().length === 0) {
    errors.push('تخصص المعلم مطلوب');
  }

  if (teacher.maxLoad === undefined || teacher.maxLoad === null) {
    errors.push('الحد الأقصى للحصص مطلوب');
  } else if (teacher.maxLoad < 1) {
    errors.push('الحد الأقصى للحصص يجب أن يكون أكبر من صفر');
  } else if (teacher.maxLoad > 40) {
    warnings.push('الحد الأقصى للحصص مرتفع جداً (أكثر من 40 حصة)');
  }

  // التحقق من صحة البريد الإلكتروني
  if (teacher.email && teacher.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacher.email)) {
      errors.push('صيغة البريد الإلكتروني غير صحيحة');
    }
  }

  // التحقق من رقم الهاتف
  if (teacher.phone && teacher.phone.trim().length > 0) {
    const phoneRegex = /^(\+966|0)?[5-9]\d{8}$/;
    if (!phoneRegex.test(teacher.phone.replace(/\s|-/g, ''))) {
      errors.push('صيغة رقم الهاتف غير صحيحة (يجب أن يكون رقم سعودي)');
    }
  }

  // التحقق من التكرار
  if (existingTeachers && teacher.name) {
    const duplicate = existingTeachers.find(existing => 
      existing.id !== teacher.id && 
      existing.name.trim().toLowerCase() === teacher.name!.trim().toLowerCase()
    );
    if (duplicate) {
      errors.push('يوجد معلم آخر بنفس الاسم');
    }
  }

  // التحقق من البريد المكرر
  if (existingTeachers && teacher.email) {
    const duplicate = existingTeachers.find(existing => 
      existing.id !== teacher.id && 
      existing.email?.toLowerCase() === teacher.email!.toLowerCase()
    );
    if (duplicate) {
      errors.push('يوجد معلم آخر بنفس البريد الإلكتروني');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// التحقق من صحة بيانات المادة
export function validateSubject(subject: Partial<Subject>, existingSubjects?: Subject[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // التحقق من الحقول المطلوبة
  if (!subject.name || subject.name.trim().length === 0) {
    errors.push('اسم المادة مطلوب');
  } else if (subject.name.trim().length < 2) {
    errors.push('اسم المادة يجب أن يكون على الأقل حرفين');
  } else if (subject.name.trim().length > 100) {
    errors.push('اسم المادة طويل جداً (الحد الأقصى 100 حرف)');
  }

  if (!subject.code || subject.code.trim().length === 0) {
    errors.push('رمز المادة مطلوب');
  } else if (subject.code.trim().length < 2) {
    errors.push('رمز المادة يجب أن يكون على الأقل حرفين');
  } else if (subject.code.trim().length > 20) {
    errors.push('رمز المادة طويل جداً (الحد الأقصى 20 حرف)');
  }

  if (subject.requiredHours === undefined || subject.requiredHours === null) {
    errors.push('عدد الحصص المطلوبة مطلوب');
  } else if (subject.requiredHours < 1) {
    errors.push('عدد الحصص المطلوبة يجب أن يكون أكبر من صفر');
  } else if (subject.requiredHours > 20) {
    warnings.push('عدد الحصص المطلوبة مرتفع جداً (أكثر من 20 حصة)');
  }

  if (!subject.level) {
    errors.push('مرحلة المادة مطلوبة');
  }

  // التحقق من التكرار
  if (existingSubjects && subject.name) {
    const duplicate = existingSubjects.find(existing => 
      existing.id !== subject.id && 
      existing.name.trim().toLowerCase() === subject.name!.trim().toLowerCase() &&
      existing.level === subject.level
    );
    if (duplicate) {
      errors.push('يوجد مادة أخرى بنفس الاسم في نفس المرحلة');
    }
  }

  // التحقق من رمز المادة المكرر
  if (existingSubjects && subject.code) {
    const duplicate = existingSubjects.find(existing => 
      existing.id !== subject.id && 
      existing.code.trim().toLowerCase() === subject.code!.trim().toLowerCase()
    );
    if (duplicate) {
      errors.push('يوجد مادة أخرى بنفس الرمز');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// التحقق من صحة بيانات الفصل
export function validateClassroom(classroom: Partial<Classroom>, existingClassrooms?: Classroom[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // التحقق من الحقول المطلوبة
  if (!classroom.name || classroom.name.trim().length === 0) {
    errors.push('اسم الفصل مطلوب');
  } else if (classroom.name.trim().length < 2) {
    errors.push('اسم الفصل يجب أن يكون على الأقل حرفين');
  } else if (classroom.name.trim().length > 50) {
    errors.push('اسم الفصل طويل جداً (الحد الأقصى 50 حرف)');
  }

  if (!classroom.grade || classroom.grade.trim().length === 0) {
    errors.push('الصف مطلوب');
  }

  if (!classroom.section || classroom.section.trim().length === 0) {
    errors.push('الشعبة مطلوبة');
  }

  if (classroom.capacity === undefined || classroom.capacity === null) {
    errors.push('السعة القصوى مطلوبة');
  } else if (classroom.capacity < 1) {
    errors.push('السعة القصوى يجب أن تكون أكبر من صفر');
  } else if (classroom.capacity > 50) {
    warnings.push('السعة القصوى مرتفعة جداً (أكثر من 50 طالب)');
  }

  if (classroom.currentStudents !== undefined && classroom.currentStudents !== null) {
    if (classroom.currentStudents < 0) {
      errors.push('عدد الطلاب الحاليين لا يمكن أن يكون سالباً');
    } else if (classroom.capacity && classroom.currentStudents > classroom.capacity) {
      errors.push('عدد الطلاب الحاليين يتجاوز السعة القصوى');
    }
  }

  if (!classroom.level) {
    errors.push('مرحلة الفصل مطلوبة');
  }

  // التحقق من التكرار
  if (existingClassrooms && classroom.grade && classroom.section) {
    const duplicate = existingClassrooms.find(existing => 
      existing.id !== classroom.id && 
      existing.grade === classroom.grade &&
      existing.section === classroom.section &&
      existing.level === classroom.level
    );
    if (duplicate) {
      errors.push('يوجد فصل آخر بنفس الصف والشعبة في نفس المرحلة');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// التحقق من صحة بيانات الإسناد
export function validateAssignment(
  assignment: Partial<Assignment>,
  state: AssignmentState,
  existingAssignments?: Assignment[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // التحقق من الحقول المطلوبة
  if (!assignment.teacherId) {
    errors.push('المعلم مطلوب');
  }

  if (!assignment.subjectId) {
    errors.push('المادة مطلوبة');
  }

  if (!assignment.classroomId) {
    errors.push('الفصل مطلوب');
  }

  if (assignment.hoursPerWeek === undefined || assignment.hoursPerWeek === null) {
    errors.push('عدد الحصص الأسبوعية مطلوب');
  } else if (assignment.hoursPerWeek < 1) {
    errors.push('عدد الحصص الأسبوعية يجب أن يكون أكبر من صفر');
  } else if (assignment.hoursPerWeek > 10) {
    warnings.push('عدد الحصص الأسبوعية مرتفع جداً (أكثر من 10 حصص)');
  }

  if (!assignment.semester) {
    errors.push('الفصل الدراسي مطلوب');
  }

  if (!assignment.academicYear) {
    errors.push('السنة الدراسية مطلوبة');
  }

  // التحقق من وجود البيانات المرجعية
  if (assignment.teacherId) {
    const teacher = state.teachers.find(t => t.id === assignment.teacherId);
    if (!teacher) {
      errors.push('المعلم المحدد غير موجود');
    } else if (!teacher.isActive) {
      warnings.push('المعلم المحدد غير نشط');
    }
  }

  if (assignment.subjectId) {
    const subject = state.subjects.find(s => s.id === assignment.subjectId);
    if (!subject) {
      errors.push('المادة المحددة غير موجودة');
    } else if (!subject.isActive) {
      warnings.push('المادة المحددة غير نشطة');
    }
  }

  if (assignment.classroomId) {
    const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
    if (!classroom) {
      errors.push('الفصل المحدد غير موجود');
    } else if (!classroom.isActive) {
      warnings.push('الفصل المحدد غير نشط');
    }
  }

  // التحقق من التكرار
  if (existingAssignments && assignment.teacherId && assignment.subjectId && assignment.classroomId) {
    const duplicate = existingAssignments.find(existing => 
      existing.id !== assignment.id &&
      existing.teacherId === assignment.teacherId &&
      existing.subjectId === assignment.subjectId &&
      existing.classroomId === assignment.classroomId &&
      existing.semester === assignment.semester &&
      existing.academicYear === assignment.academicYear
    );
    if (duplicate) {
      errors.push('يوجد إسناد مماثل لنفس المعلم والمادة والفصل');
    }
  }

  // التحقق من حمولة المعلم
  if (assignment.teacherId && assignment.hoursPerWeek) {
    const teacher = state.teachers.find(t => t.id === assignment.teacherId);
    if (teacher) {
      const currentLoad = state.assignments
        .filter(a => 
          a.id !== assignment.id &&
          a.teacherId === assignment.teacherId &&
          a.semester === assignment.semester &&
          a.academicYear === assignment.academicYear
        )
        .reduce((total, a) => total + a.hoursPerWeek, 0);
      
      const newTotal = currentLoad + assignment.hoursPerWeek;
      
      if (newTotal > teacher.maxLoad) {
        errors.push(`سيتجاوز هذا الإسناد الحد الأقصى للمعلم (${newTotal}/${teacher.maxLoad})`);
      } else if (newTotal > teacher.maxLoad * 0.9) {
        warnings.push(`سيقارب هذا الإسناد الحد الأقصى للمعلم (${newTotal}/${teacher.maxLoad})`);
      }
    }
  }

  // التحقق من متطلبات المادة
  if (assignment.subjectId && assignment.hoursPerWeek) {
    const subject = state.subjects.find(s => s.id === assignment.subjectId);
    if (subject && assignment.hoursPerWeek > subject.requiredHours) {
      warnings.push(`عدد الحصص أكثر من المطلوب للمادة (${assignment.hoursPerWeek}/${subject.requiredHours})`);
    }
  }

  // التحقق من توافق المرحلة
  if (assignment.subjectId && assignment.classroomId) {
    const subject = state.subjects.find(s => s.id === assignment.subjectId);
    const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
    
    if (subject && classroom && subject.level !== classroom.level) {
      errors.push('مرحلة المادة لا تتوافق مع مرحلة الفصل');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// التحقق من صحة مجموعة إسنادات
export function validateAssignmentBatch(
  assignments: Assignment[],
  state: AssignmentState
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // التحقق من كل إسناد منفرداً
  assignments.forEach((assignment, index) => {
    const result = validateAssignment(assignment, state, assignments);
    result.errors.forEach(error => errors.push(`الإسناد ${index + 1}: ${error}`));
    result.warnings.forEach(warning => warnings.push(`الإسناد ${index + 1}: ${warning}`));
  });

  // التحقق من التعارضات في المجموعة
  const teacherHours = new Map<string, number>();
  assignments.forEach(assignment => {
    const current = teacherHours.get(assignment.teacherId) || 0;
    teacherHours.set(assignment.teacherId, current + assignment.hoursPerWeek);
  });

  teacherHours.forEach((hours, teacherId) => {
    const teacher = state.teachers.find(t => t.id === teacherId);
    if (teacher && hours > teacher.maxLoad) {
      errors.push(`المعلم ${teacher.name} سيتجاوز الحد الأقصى (${hours}/${teacher.maxLoad})`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// التحقق من اكتمال النظام
export function validateSystemCompleteness(state: AssignmentState): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // التحقق من وجود بيانات أساسية
  if (state.teachers.length === 0) {
    errors.push('لا يوجد معلمون في النظام');
  }

  if (state.subjects.length === 0) {
    errors.push('لا يوجد مواد في النظام');
  }

  if (state.classrooms.length === 0) {
    errors.push('لا يوجد فصول في النظام');
  }

  // التحقق من المواد غير المسندة
  const assignedSubjectIds = new Set(state.assignments.map(a => a.subjectId));
  const unassignedSubjects = state.subjects.filter(s => 
    s.isActive && !assignedSubjectIds.has(s.id)
  );
  
  if (unassignedSubjects.length > 0) {
    warnings.push(`${unassignedSubjects.length} مواد غير مسندة`);
  }

  // التحقق من المعلمين غير المحملين
  const underloadedTeachers = state.teachers.filter(teacher => {
    if (!teacher.isActive) return false;
    
    const currentLoad = state.assignments
      .filter(a => a.teacherId === teacher.id)
      .reduce((total, a) => total + a.hoursPerWeek, 0);
    
    return currentLoad < state.settings.minHoursPerSubject;
  });

  if (underloadedTeachers.length > 0) {
    warnings.push(`${underloadedTeachers.length} معلمون تحت الحمل الأدنى`);
  }

  // التحقق من الفصول غير المكتملة
  const incompleteClassrooms = state.classrooms.filter(classroom => {
    if (!classroom.isActive) return false;
    
    const assignedSubjects = state.assignments
      .filter(a => a.classroomId === classroom.id).length;
    
    const requiredSubjects = state.subjects
      .filter(s => s.isActive && s.level === classroom.level).length;
    
    return assignedSubjects < requiredSubjects;
  });

  if (incompleteClassrooms.length > 0) {
    warnings.push(`${incompleteClassrooms.length} فصول غير مكتملة الإسناد`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// مساعدات للتحقق السريع
export const isValidTeacher = (teacher: Partial<Teacher>) => 
  validateTeacher(teacher).isValid;

export const isValidSubject = (subject: Partial<Subject>) => 
  validateSubject(subject).isValid;

export const isValidClassroom = (classroom: Partial<Classroom>) => 
  validateClassroom(classroom).isValid;

export const isValidAssignment = (assignment: Partial<Assignment>, state: AssignmentState) => 
  validateAssignment(assignment, state).isValid;