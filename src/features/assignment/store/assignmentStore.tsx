/**
 * مخزن إدارة حالة نظام إسناد المواد
 * Assignment System State Store
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { 
  AssignmentState, 
  AssignmentAction, 
  ID, 
  Teacher, 
  Subject, 
  Classroom, 
  Assignment 
} from './types';

// الحالة الأولية للمخزن
const initialState: AssignmentState = {
  // البيانات الأساسية
  teachers: [],
  subjects: [],
  classrooms: [],
  assignments: [],
  
  // حالة التحميل
  loading: {
    teachers: false,
    subjects: false,
    classrooms: false,
    assignments: false,
    saving: false,
  },
  
  // الأخطاء
  errors: {},
  
  // الفلاتر والبحث
  filters: {
    searchTerm: '',
  },
  
  // الواجهة
  ui: {
    selectedItems: [],
    selectedTeacherIds: new Set<string>(),
    viewMode: 'matrix',
    sidebarOpen: true,
    exportMenuOpen: false,
    whatsappMenuOpen: false,
  },
  
  // التراجع والإعادة
  history: {
    past: [],
    future: [],
    canUndo: false,
    canRedo: false,
  } as any,
  
  // الإعدادات
  settings: {
    academicYear: '2024-2025',
    defaultSemester: 'first',
    maxHoursPerTeacher: 24,
    minHoursPerSubject: 2,
    autoSave: true,
    rtlMode: true,
  },
};

// مخفض الحالة (Reducer)
function assignmentReducer(state: AssignmentState, action: AssignmentAction): AssignmentState {
  switch (action.type) {
    // إجراءات المعلمين
    case 'SET_TEACHERS':
      return {
        ...state,
        teachers: action.payload,
        loading: { ...state.loading, teachers: false },
        errors: { ...state.errors, teachers: undefined },
      };
      
    case 'ADD_TEACHER':
      return {
        ...state,
        teachers: [...state.teachers, action.payload],
      };
      
    case 'UPDATE_TEACHER':
      return {
        ...state,
        teachers: state.teachers.map(teacher =>
          teacher.id === action.payload.id
            ? { ...teacher, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : teacher
        ),
      };
      
    case 'DELETE_TEACHER':
      return {
        ...state,
        teachers: state.teachers.filter(teacher => teacher.id !== action.payload),
        assignments: state.assignments.filter(assignment => assignment.teacherId !== action.payload),
      };

    // إجراءات المواد
    case 'SET_SUBJECTS':
      return {
        ...state,
        subjects: action.payload,
        loading: { ...state.loading, subjects: false },
        errors: { ...state.errors, subjects: undefined },
      };
      
    case 'ADD_SUBJECT':
      return {
        ...state,
        subjects: [...state.subjects, action.payload],
      };
      
    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map(subject =>
          subject.id === action.payload.id
            ? { ...subject, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : subject
        ),
      };
      
    case 'DELETE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.filter(subject => subject.id !== action.payload),
        assignments: state.assignments.filter(assignment => assignment.subjectId !== action.payload),
      };

    // إجراءات الفصول
    case 'SET_CLASSROOMS':
      return {
        ...state,
        classrooms: action.payload,
        loading: { ...state.loading, classrooms: false },
        errors: { ...state.errors, classrooms: undefined },
      };
      
    case 'ADD_CLASSROOM':
      return {
        ...state,
        classrooms: [...state.classrooms, action.payload],
      };
      
    case 'UPDATE_CLASSROOM':
      return {
        ...state,
        classrooms: state.classrooms.map(classroom =>
          classroom.id === action.payload.id
            ? { ...classroom, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : classroom
        ),
      };
      
    case 'DELETE_CLASSROOM':
      return {
        ...state,
        classrooms: state.classrooms.filter(classroom => classroom.id !== action.payload),
        assignments: state.assignments.filter(assignment => assignment.classroomId !== action.payload),
      };

    // إجراءات الإسنادات
    case 'SET_ASSIGNMENTS':
      return {
        ...state,
        assignments: action.payload,
        loading: { ...state.loading, assignments: false },
        errors: { ...state.errors, assignments: undefined },
      };
      
    case 'ADD_ASSIGNMENT':
      return {
        ...state,
        assignments: [...state.assignments, action.payload],
      };
      
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(assignment =>
          assignment.id === action.payload.id
            ? { ...assignment, ...action.payload.updates }
            : assignment
        ),
      };
      
    case 'DELETE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.filter(assignment => assignment.id !== action.payload),
      };
      
    case 'BULK_DELETE_ASSIGNMENTS':
      return {
        ...state,
        assignments: state.assignments.filter(assignment => 
          !action.payload.includes(assignment.id)
        ),
      };

    // إجراءات التحميل والأخطاء
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error,
        },
      };
      
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
      };

    // إجراءات الفلاتر
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };
      
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          searchTerm: '',
        },
      };
      
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        filters: {
          ...state.filters,
          searchTerm: action.payload,
        },
      };

    // إجراءات الواجهة
    case 'SELECT_ITEMS':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedItems: action.payload,
        },
      };
      
    case 'TOGGLE_ITEM_SELECTION':
      const isSelected = state.ui.selectedItems.includes(action.payload);
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedItems: isSelected
            ? state.ui.selectedItems.filter(id => id !== action.payload)
            : [...state.ui.selectedItems, action.payload],
        },
      };
      
    case 'CLEAR_SELECTION':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedItems: [],
        },
      };

    // إجراءات تحديد المعلمين
    case 'SELECT_TEACHER':
      const newSelectedTeacherIds = new Set(state.ui.selectedTeacherIds);
      if (newSelectedTeacherIds.has(action.payload)) {
        newSelectedTeacherIds.delete(action.payload);
      } else {
        newSelectedTeacherIds.add(action.payload);
      }
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTeacherIds: newSelectedTeacherIds,
        },
      };

    case 'SELECT_TEACHERS':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTeacherIds: new Set(action.payload),
        },
      };

    case 'SELECT_ALL_FILTERED_TEACHERS':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTeacherIds: new Set(action.payload),
        },
      };

    case 'CLEAR_TEACHER_SELECTION':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTeacherIds: new Set<string>(),
        },
      };
      
    case 'SET_VIEW_MODE':
      return {
        ...state,
        ui: {
          ...state.ui,
          viewMode: action.payload,
        },
      };
      
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen,
        },
      };
      
    case 'SHOW_TEACHER_DETAILS':
      return {
        ...state,
        ui: {
          ...state.ui,
          showTeacherDetails: action.payload,
        },
      };
      
    case 'TOGGLE_EXPORT_MENU':
      return {
        ...state,
        ui: {
          ...state.ui,
          exportMenuOpen: !state.ui.exportMenuOpen,
          whatsappMenuOpen: false, // إغلاق القوائم الأخرى
        },
      };
      
    case 'TOGGLE_WHATSAPP_MENU':
      return {
        ...state,
        ui: {
          ...state.ui,
          whatsappMenuOpen: !state.ui.whatsappMenuOpen,
          exportMenuOpen: false, // إغلاق القوائم الأخرى
        },
      };

    // إجراءات التراجع والإعادة
    case 'SAVE_STATE_TO_HISTORY':
      return {
        ...state,
        history: {
          past: [...state.history.past.slice(-9), state], // الاحتفاظ بـ 10 حالات فقط
          future: [],
          canUndo: true,
          canRedo: false,
        } as any,
      };
      
    case 'UNDO':
      if (state.history.past.length === 0) return state;
      
      const previousStateItem = state.history.past[state.history.past.length - 1] as any;
      const newPast = state.history.past.slice(0, -1);
      
      return {
        ...previousStateItem.state,
        history: {
          past: newPast,
          future: [state, ...state.history.future],
          canUndo: newPast.length > 0,
          canRedo: true,
        } as any,
      };
      
    case 'REDO':
      if (state.history.future.length === 0) return state;
      
      const nextStateItem = state.history.future[0] as any;
      const newFuture = state.history.future.slice(1);
      
      return {
        ...nextStateItem.state,
        history: {
          past: [...state.history.past, state],
          future: newFuture,
          canUndo: true,
          canRedo: newFuture.length > 0,
        } as any,
      };
      
    case 'CLEAR_HISTORY':
      return {
        ...state,
        history: {
          past: [],
          future: [],
          canUndo: false,
          canRedo: false,
        } as any,
      };

    // إجراءات الإعدادات
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    default:
      return state;
  }
}

// سياق المخزن
interface AssignmentContextType {
  state: AssignmentState;
  dispatch: React.Dispatch<AssignmentAction>;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

// موفر السياق
interface AssignmentProviderProps {
  children: ReactNode;
  initialData?: Partial<AssignmentState>;
}

export const AssignmentProvider: React.FC<AssignmentProviderProps> = ({ children, initialData }) => {
  const [state, dispatch] = useReducer(
    assignmentReducer,
    initialData ? { ...initialState, ...initialData } : initialState
  );

  return (
    <AssignmentContext.Provider value={{ state, dispatch }}>
      {children}
    </AssignmentContext.Provider>
  );
};

// خطاف استخدام المخزن
export function useAssignment() {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error('useAssignment يجب أن يُستخدم داخل AssignmentProvider');
  }
  return context;
}

// خطاطيف مساعدة للعمليات الشائعة
export function useAssignmentActions() {
  const { dispatch } = useAssignment();

  return {
    // عمليات البيانات
    setTeachers: useCallback((teachers: Teacher[]) => 
      dispatch({ type: 'SET_TEACHERS', payload: teachers }), [dispatch]),
    
    addTeacher: useCallback((teacher: Teacher) => 
      dispatch({ type: 'ADD_TEACHER', payload: teacher }), [dispatch]),
    
    updateTeacher: useCallback((id: ID, updates: Partial<Teacher>) => 
      dispatch({ type: 'UPDATE_TEACHER', payload: { id, updates } }), [dispatch]),
    
    deleteTeacher: useCallback((id: ID) => 
      dispatch({ type: 'DELETE_TEACHER', payload: id }), [dispatch]),

    setSubjects: useCallback((subjects: Subject[]) => 
      dispatch({ type: 'SET_SUBJECTS', payload: subjects }), [dispatch]),
    
    addSubject: useCallback((subject: Subject) => 
      dispatch({ type: 'ADD_SUBJECT', payload: subject }), [dispatch]),
    
    updateSubject: useCallback((id: ID, updates: Partial<Subject>) => 
      dispatch({ type: 'UPDATE_SUBJECT', payload: { id, updates } }), [dispatch]),
    
    deleteSubject: useCallback((id: ID) => 
      dispatch({ type: 'DELETE_SUBJECT', payload: id }), [dispatch]),

    setClassrooms: useCallback((classrooms: Classroom[]) => 
      dispatch({ type: 'SET_CLASSROOMS', payload: classrooms }), [dispatch]),
    
    addClassroom: useCallback((classroom: Classroom) => 
      dispatch({ type: 'ADD_CLASSROOM', payload: classroom }), [dispatch]),
    
    updateClassroom: useCallback((id: ID, updates: Partial<Classroom>) => 
      dispatch({ type: 'UPDATE_CLASSROOM', payload: { id, updates } }), [dispatch]),
    
    deleteClassroom: useCallback((id: ID) => 
      dispatch({ type: 'DELETE_CLASSROOM', payload: id }), [dispatch]),

    setAssignments: useCallback((assignments: Assignment[]) => 
      dispatch({ type: 'SET_ASSIGNMENTS', payload: assignments }), [dispatch]),
    
    addAssignment: useCallback((assignment: Assignment) => 
      dispatch({ type: 'ADD_ASSIGNMENT', payload: assignment }), [dispatch]),
    
    updateAssignment: useCallback((id: ID, updates: Partial<Assignment>) => 
      dispatch({ type: 'UPDATE_ASSIGNMENT', payload: { id, updates } }), [dispatch]),
    
    deleteAssignment: useCallback((id: ID) => 
      dispatch({ type: 'DELETE_ASSIGNMENT', payload: id }), [dispatch]),
    
    bulkDeleteAssignments: useCallback((ids: ID[]) => 
      dispatch({ type: 'BULK_DELETE_ASSIGNMENTS', payload: ids }), [dispatch]),

    // عمليات الحالة
    setLoading: useCallback((key: keyof AssignmentState['loading'], value: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: { key, value } }), [dispatch]),
    
    setError: useCallback((key: keyof AssignmentState['errors'], error?: string) => 
      dispatch({ type: 'SET_ERROR', payload: { key, error } }), [dispatch]),
    
    clearErrors: useCallback(() => 
      dispatch({ type: 'CLEAR_ERRORS' }), [dispatch]),

    // عمليات الفلاتر
    setFilter: useCallback((key: keyof AssignmentState['filters'], value: any) => 
      dispatch({ type: 'SET_FILTER', payload: { key, value } }), [dispatch]),
    
    clearFilters: useCallback(() => 
      dispatch({ type: 'CLEAR_FILTERS' }), [dispatch]),
    
    setSearchTerm: useCallback((term: string) => 
      dispatch({ type: 'SET_SEARCH_TERM', payload: term }), [dispatch]),

    // عمليات الواجهة
    selectItems: useCallback((ids: ID[]) => 
      dispatch({ type: 'SELECT_ITEMS', payload: ids }), [dispatch]),
    
    toggleItemSelection: useCallback((id: ID) => 
      dispatch({ type: 'TOGGLE_ITEM_SELECTION', payload: id }), [dispatch]),
    
    clearSelection: useCallback(() => 
      dispatch({ type: 'CLEAR_SELECTION' }), [dispatch]),

    // إجراءات تحديد المعلمين
    selectTeacher: useCallback((teacherId: string) =>
      dispatch({ type: 'SELECT_TEACHER', payload: teacherId }), [dispatch]),

    selectTeachers: useCallback((teacherIds: string[]) =>
      dispatch({ type: 'SELECT_TEACHERS', payload: teacherIds }), [dispatch]),

    selectAllFilteredTeachers: useCallback((teacherIds: string[]) =>
      dispatch({ type: 'SELECT_ALL_FILTERED_TEACHERS', payload: teacherIds }), [dispatch]),

    clearTeacherSelection: useCallback(() =>
      dispatch({ type: 'CLEAR_TEACHER_SELECTION' }), [dispatch]),
    
    setViewMode: useCallback((mode: 'grid' | 'list' | 'matrix') => 
      dispatch({ type: 'SET_VIEW_MODE', payload: mode }), [dispatch]),
    
    toggleSidebar: useCallback(() => 
      dispatch({ type: 'TOGGLE_SIDEBAR' }), [dispatch]),
    
    showTeacherDetails: useCallback((id?: ID) => 
      dispatch({ type: 'SHOW_TEACHER_DETAILS', payload: id }), [dispatch]),
    
    toggleExportMenu: useCallback(() => 
      dispatch({ type: 'TOGGLE_EXPORT_MENU' }), [dispatch]),
    
    toggleWhatsAppMenu: useCallback(() => 
      dispatch({ type: 'TOGGLE_WHATSAPP_MENU' }), [dispatch]),

    // عمليات التراجع والإعادة
    undo: useCallback(() => 
      dispatch({ type: 'UNDO' }), [dispatch]),
    
    redo: useCallback(() => 
      dispatch({ type: 'REDO' }), [dispatch]),
    
    saveStateToHistory: useCallback(() => 
      dispatch({ type: 'SAVE_STATE_TO_HISTORY' }), [dispatch]),
    
    clearHistory: useCallback(() => 
      dispatch({ type: 'CLEAR_HISTORY' }), [dispatch]),

    // عمليات الإعدادات
    updateSettings: useCallback((settings: Partial<AssignmentState['settings']>) => 
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings }), [dispatch]),
  };
}