/**
 * تصدير مكونات نظام إسناد المواد
 * Assignment System Exports
 */

// الصفحة الرئيسية
export { default as UpdatedAssignmentPage } from './UpdatedAssignmentPage';

// المخزن والأنواع
export * from './store/types';
export * from './store/assignmentStore';
export * from './store/selectors';
export * from './store/teacherSelectors';
export * from './store/validators';
export * from './store/undoRedo';

// أدوات المهام الجديدة
export * from './utils/textBuilders';
export * from './utils/enhancedWhatsApp';

// المكونات المطورة الجديدة - النظام المحدث
export { default as EnhancedActionBar } from './components/EnhancedActionBar';
export { default as TeacherColumn } from './components/TeacherColumn';
export { default as ClassroomSubjectColumn } from './components/ClassroomSubjectColumn';
export { default as AssignmentDetailsCard } from './components/AssignmentDetailsCard';
export { default as ReportsDialog } from './components/ReportsDialog';

// المكونات المطورة السابقة - المهام 0-3
export { default as NewActionBar } from './components/NewActionBar';
export { default as NewSelectionBar } from './components/NewSelectionBar';

// المكونات الاحترافية
export { default as AssignmentPageHeader } from './components/AssignmentPageHeader';
export { default as ClassroomFilter } from './components/ClassroomFilter';
export { default as TeacherFilter } from './components/TeacherFilter';
export { default as NewTeacherRail } from './components/NewTeacherRail';
export { default as TeacherDetailsPanel } from './components/TeacherDetailsPanel';

// المكونات الأساسية
export { default as ActionBar } from './components/ActionBar';
export { default as SelectionBar } from './components/SelectionBar';
export { default as TeacherRail } from './components/TeacherRail';
export { default as SubjectMatrix } from './components/SubjectMatrix';
// export { default as WhatsAppMenu } from './components/WhatsAppMenu';
// export { default as PdfMenu } from './components/PdfMenu';
// export { default as HtmlExportAllMenu } from './components/HtmlExportAllMenu';
// export { default as Snackbar } from './components/Snackbar';
// export { default as LoadBar } from './components/LoadBar';
// export { default as Legend } from './components/Legend';

// التقارير
export { default as TeacherReportView } from './reports/TeacherReportView';
export { default as PlanReportView } from './reports/PlanReportView';

// التصدير
export * from './export';

// الأدوات المساعدة
export * from './utils';