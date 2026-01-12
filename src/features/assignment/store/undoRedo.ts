/**
 * نظام التراجع والإعادة لمخزن إسناد المواد
 * Assignment Store Undo/Redo System
 */

import type { AssignmentState, ID } from './types';

// أنواع العمليات القابلة للتراجع
export type UndoableAction = 
  | 'ADD_TEACHER' | 'UPDATE_TEACHER' | 'DELETE_TEACHER'
  | 'ADD_SUBJECT' | 'UPDATE_SUBJECT' | 'DELETE_SUBJECT'
  | 'ADD_CLASSROOM' | 'UPDATE_CLASSROOM' | 'DELETE_CLASSROOM'
  | 'ADD_ASSIGNMENT' | 'UPDATE_ASSIGNMENT' | 'DELETE_ASSIGNMENT' | 'BULK_DELETE_ASSIGNMENTS';

// وصف العملية للعرض
interface ActionDescription {
  type: UndoableAction;
  description: string;
  timestamp: number;
  entityId?: ID;
  entityName?: string;
}

// حالة التاريخ المحسنة
export interface EnhancedHistoryState {
  past: Array<{
    state: AssignmentState;
    action: ActionDescription;
  }>;
  future: Array<{
    state: AssignmentState;
    action: ActionDescription;
  }>;
  canUndo: boolean;
  canRedo: boolean;
  maxHistorySize: number;
}

// إنشاء وصف للعملية
export function createActionDescription(
  type: UndoableAction,
  entityId?: ID,
  entityName?: string,
  additionalInfo?: string
): ActionDescription {
  const actionLabels: Record<UndoableAction, string> = {
    ADD_TEACHER: 'إضافة معلم',
    UPDATE_TEACHER: 'تحديث معلم',
    DELETE_TEACHER: 'حذف معلم',
    ADD_SUBJECT: 'إضافة مادة',
    UPDATE_SUBJECT: 'تحديث مادة',
    DELETE_SUBJECT: 'حذف مادة',
    ADD_CLASSROOM: 'إضافة فصل',
    UPDATE_CLASSROOM: 'تحديث فصل',
    DELETE_CLASSROOM: 'حذف فصل',
    ADD_ASSIGNMENT: 'إضافة إسناد',
    UPDATE_ASSIGNMENT: 'تحديث إسناد',
    DELETE_ASSIGNMENT: 'حذف إسناد',
    BULK_DELETE_ASSIGNMENTS: 'حذف عدة إسنادات',
  };

  let description = actionLabels[type];
  
  if (entityName) {
    description += `: ${entityName}`;
  }
  
  if (additionalInfo) {
    description += ` (${additionalInfo})`;
  }

  return {
    type,
    description,
    timestamp: Date.now(),
    entityId,
    entityName,
  };
}

// حفظ الحالة في التاريخ
export function saveStateToHistory(
  currentState: AssignmentState,
  action: ActionDescription,
  maxSize = 20
): AssignmentState {
  const currentHistory = currentState.history;
  
  // إنشاء نسخة عميقة من الحالة الحالية (بدون التاريخ لتجنب التداخل)
  const stateToSave: AssignmentState = {
    ...currentState,
    history: {
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    },
  };

  // إضافة الحالة الجديدة للتاريخ
  const newPast = [
    ...currentHistory.past.slice(-(maxSize - 1)), // الاحتفاظ بالحد المسموح
    { state: stateToSave, action }
  ] as any;

  return {
    ...currentState,
    history: {
      past: newPast,
      future: [], // مسح المستقبل عند حفظ حالة جديدة
      canUndo: true,
      canRedo: false,
    } as any,
  };
}

// التراجع عن العملية
export function undoLastAction(currentState: AssignmentState): AssignmentState {
  const { past, future } = currentState.history;
  
  if (past.length === 0) {
    return currentState; // لا يوجد ما يمكن التراجع عنه
  }

  // الحصول على الحالة السابقة
  const { state: previousState, action } = past[past.length - 1];
  const newPast = past.slice(0, -1);

  // حفظ الحالة الحالية في المستقبل
  const currentStateForFuture: AssignmentState = {
    ...currentState,
    history: {
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    },
  };

  const newFuture = [
    { state: currentStateForFuture, action },
    ...future
  ];

  return {
    ...previousState,
    history: {
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: true,
    } as any,
  };
}

// الإعادة
export function redoLastAction(currentState: AssignmentState): AssignmentState {
  const { past, future } = currentState.history;
  
  if (future.length === 0) {
    return currentState; // لا يوجد ما يمكن إعادته
  }

  // الحصول على الحالة التالية
  const { state: nextState, action } = future[0];
  const newFuture = future.slice(1);

  // حفظ الحالة الحالية في الماضي
  const currentStateForPast: AssignmentState = {
    ...currentState,
    history: {
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    },
  };

  const newPast = [
    ...past,
    { state: currentStateForPast, action }
  ];

  return {
    ...nextState,
    history: {
      past: newPast,
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    } as any,
  };
}

// مسح التاريخ
export function clearHistory(currentState: AssignmentState): AssignmentState {
  return {
    ...currentState,
    history: {
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    },
  };
}

// الحصول على قائمة العمليات القابلة للتراجع
export function getUndoableActions(state: AssignmentState): ActionDescription[] {
  return state.history.past.map(item => item.action).reverse() as any;
}

// الحصول على قائمة العمليات القابلة للإعادة
export function getRedoableActions(state: AssignmentState): ActionDescription[] {
  return state.history.future.map(item => item.action) as any;
}

// التراجع إلى حالة محددة
export function undoToState(
  currentState: AssignmentState,
  targetActionIndex: number
): AssignmentState {
  const { past } = currentState.history;
  
  if (targetActionIndex < 0 || targetActionIndex >= past.length) {
    return currentState;
  }

  // الحصول على الحالة المطلوبة
  const targetStateItem = past[targetActionIndex];
  const newPast = past.slice(0, targetActionIndex);

  // حفظ جميع الحالات اللاحقة في المستقبل
  const statesToMoveToFuture = past.slice(targetActionIndex);
  
  // إضافة الحالة الحالية أيضاً
  const currentStateForFuture: AssignmentState = {
    ...currentState,
    history: {
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    },
  };

  const newFuture = [
    ...statesToMoveToFuture.slice(1), // تخطي الحالة المطلوبة
    { 
      state: currentStateForFuture, 
      action: createActionDescription('ADD_TEACHER', undefined, 'حالة حالية') 
    },
    ...currentState.history.future
  ];

  return {
    ...targetStateItem.state,
    history: {
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: true,
    } as any,
  };
}

// إنشاء نقطة حفظ
export function createCheckpoint(
  currentState: AssignmentState,
  checkpointName: string
): AssignmentState {
  const checkpointAction = createActionDescription(
    'ADD_TEACHER', // نوع وهمي للنقطة المرجعية
    undefined,
    `نقطة حفظ: ${checkpointName}`
  );

  return saveStateToHistory(currentState, checkpointAction);
}

// ضغط التاريخ (إزالة العمليات القديمة)
export function compressHistory(
  currentState: AssignmentState,
  maxSize: number
): AssignmentState {
  const { past, future } = currentState.history;
  
  if (past.length <= maxSize) {
    return currentState;
  }

  const compressedPast = past.slice(-maxSize);
  
  return {
    ...currentState,
    history: {
      ...currentState.history,
      past: compressedPast,
      canUndo: compressedPast.length > 0,
    },
  };
}

// تصدير تاريخ العمليات
export function exportHistory(state: AssignmentState): string {
  const history = {
    past: state.history.past.map(item => ({
      action: item.action,
      timestamp: item.action.timestamp,
    })),
    future: state.history.future.map(item => ({
      action: item.action,
      timestamp: item.action.timestamp,
    })),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(history, null, 2);
}

// إحصائيات التاريخ
export function getHistoryStats(state: AssignmentState) {
  const { past, future } = state.history;
  
  // تجميع العمليات حسب النوع
  const actionCounts: Record<string, number> = {};
  [...past, ...future].forEach(item => {
    actionCounts[item.action.type] = (actionCounts[item.action.type] || 0) + 1;
  });

  // حساب الوقت المستغرق
  const timestamps = [...past, ...future].map(item => item.action.timestamp);
  const oldestTimestamp = Math.min(...timestamps);
  const newestTimestamp = Math.max(...timestamps);
  const timeSpanMinutes = (newestTimestamp - oldestTimestamp) / (1000 * 60);

  return {
    totalActions: past.length + future.length,
    pastActions: past.length,
    futureActions: future.length,
    actionTypes: Object.keys(actionCounts).length,
    actionCounts,
    timeSpanMinutes: Math.round(timeSpanMinutes * 100) / 100,
    averageActionsPerMinute: timeSpanMinutes > 0 
      ? Math.round(((past.length + future.length) / timeSpanMinutes) * 100) / 100 
      : 0,
  };
}

// التحقق من إمكانية التراجع/الإعادة
export function canPerformUndo(state: AssignmentState): boolean {
  return state.history.past.length > 0;
}

export function canPerformRedo(state: AssignmentState): boolean {
  return state.history.future.length > 0;
}

// اختصارات لوحة المفاتيح
export function handleKeyboardShortcuts(
  event: KeyboardEvent,
  undoCallback: () => void,
  redoCallback: () => void
): boolean {
  // Ctrl+Z للتراجع
  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault();
    undoCallback();
    return true;
  }
  
  // Ctrl+Y أو Ctrl+Shift+Z للإعادة
  if (
    (event.ctrlKey && event.key === 'y') ||
    (event.ctrlKey && event.shiftKey && event.key === 'Z')
  ) {
    event.preventDefault();
    redoCallback();
    return true;
  }

  return false;
}