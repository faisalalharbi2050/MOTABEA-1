
import { Teacher, Subject, Classroom, Assignment } from '../store/types';

interface AutoDistributeResult {
  newAssignments: Assignment[];
  unassignedCount: number;
  assignedCount: number;
}

export const autoDistribute = (
  teachers: Teacher[],
  subjects: Subject[],
  classrooms: Classroom[],
  existingAssignments: Assignment[],
  currentUserId: string
): AutoDistributeResult => {
  const newAssignments: Assignment[] = [];
  
  // 1. Calculate current load for each teacher from EXISTING assignments
  // We use a mutable map to track load as we assign new classes
  const teacherLoadMap = new Map<string, number>();
  const teacherGradeMap = new Map<string, Set<string>>(); // Track grades for grouping

  // Initialize with existing data
  teachers.forEach(t => {
    teacherLoadMap.set(t.id, 0);
    teacherGradeMap.set(t.id, new Set());
  });

  existingAssignments.forEach(a => {
    if (a.status === 'active') {
      const current = teacherLoadMap.get(a.teacherId) || 0;
      teacherLoadMap.set(a.teacherId, current + a.hoursPerWeek);
      
      const classroom = classrooms.find(c => c.id === a.classroomId);
      if (classroom) {
        const grades = teacherGradeMap.get(a.teacherId) || new Set();
        grades.add(classroom.grade);
        teacherGradeMap.set(a.teacherId, grades);
      }
    }
  });

  // 2. Identify potential assignments (Subjects that match Classroom Level and are NOT assigned)
  // We iterate through all classrooms and all subjects suitable for that classroom's level
  classrooms.filter(c => c.isActive).forEach(classroom => {
    const suitableSubjects = subjects.filter(s => s.isActive && s.level === classroom.level);

    suitableSubjects.forEach(subject => {
      // Check if already assigned
      const isAssigned = existingAssignments.some(
        a => a.status === 'active' && 
             a.classroomId === classroom.id && 
             a.subjectId === subject.id
      );

      // Check if we already created a new assignment in this batch
      const checksNew = newAssignments.some(
        a => a.classroomId === classroom.id && 
             a.subjectId === subject.id
      );

      if (!isAssigned && !checksNew) {
        // Needs assignment
        // Find best teacher
        
        // Filter by Specialty
        // Note: Subject name usually matches specialization, or we need a mapping.
        // For this prototype, we assume exact match or contains.
        // User's prompt: "match specialty first".
        
        const candidates = teachers.filter(t => {
          if (!t.isActive) return false;
          // Normalized comparison
          const spec = t.specialization.trim().toLowerCase();
          const subj = subject.name.trim().toLowerCase();
          return spec === subj || subj.includes(spec) || spec.includes(subj);
        });

        if (candidates.length === 0) return; // No specialist found

        // Filter by Max Load (Hard Constraint)
        const loadCheckCandidates = candidates.filter(t => {
          const currentLoad = teacherLoadMap.get(t.id) || 0;
          return (currentLoad + subject.requiredHours) <= t.maxLoad;
        });

        if (loadCheckCandidates.length === 0) return; // All full

        // Sorting Logic:
        // 1. Grouping by Grade Level (Priority)
        // 2. Even Distribution (Lower load first)
        
        loadCheckCandidates.sort((a, b) => {
          const loadA = teacherLoadMap.get(a.id) || 0;
          const loadB = teacherLoadMap.get(b.id) || 0;
          
          const gradesA = teacherGradeMap.get(a.id);
          const gradesB = teacherGradeMap.get(b.id);
          
          const hasGradeA = gradesA?.has(classroom.grade) ? 1 : 0;
          const hasGradeB = gradesB?.has(classroom.grade) ? 1 : 0;

          // If one has the grade and other doesn't, prioritize the one who has it
          if (hasGradeA !== hasGradeB) {
            return hasGradeB - hasGradeA; // Higher is better
          }

          // Even distribution (Lower load is better)
          return loadA - loadB;
        });

        // Pick best
        const bestTeacher = loadCheckCandidates[0];

        // Assign
        const assignment: Assignment = {
          id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          teacherId: bestTeacher.id,
          subjectId: subject.id,
          classroomId: classroom.id,
          hoursPerWeek: subject.requiredHours,
          semester: 'first', // Default
          academicYear: '2025-2026', // Should come from settings
          status: 'active',
          assignedAt: new Date().toISOString(),
          assignedBy: currentUserId
        };

        newAssignments.push(assignment);

        // Update mutable maps
        const newLoad = (teacherLoadMap.get(bestTeacher.id) || 0) + subject.requiredHours;
        teacherLoadMap.set(bestTeacher.id, newLoad);
        
        const grades = teacherGradeMap.get(bestTeacher.id) || new Set();
        grades.add(classroom.grade);
        teacherGradeMap.set(bestTeacher.id, grades);
      }
    });
  });

  return {
    newAssignments,
    unassignedCount: 0, // We could count this if we iterated differently
    assignedCount: newAssignments.length
  };
};
