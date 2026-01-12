/**
 * فهرس أدوات التصدير
 * Export Utilities Index
 */

// أداة بناء HTML
export { default as HtmlAllBuilder, buildPlanAllHtml } from './htmlAllBuilder';
export type { TeacherSummary, PlanAllData } from './htmlAllBuilder';

// أدوات التنظيف
export * from './sanitize';

// أداة تنزيل HTML
export {
  HtmlAllDownload,
  exportTeachersHTML,
  exportAssignmentsHTML,
  exportTeacherHTML,
  exportPlanHTML,
  exportAllHTML,
  downloadPlanHtml,
  copyPlanHtmlToClipboard,
  openPlanHtmlPreview,
  createPlanHtmlExporter,
  generateFilenameWithDate
} from './htmlAllDownload';

// أنواع البيانات
export type {
  ReportType,
  DownloadOptions,
  GeneratedReport
} from './htmlAllDownload';

// إعادة تصدير النوع للاستخدام المحلي
import type { ReportType } from './htmlAllDownload';

// أدوات إضافية يمكن إضافتها مستقبلاً
// export * from './sanitize';
// export * from './compression';
// export * from './validation';

/**
 * إعدادات التصدير الافتراضية
 */
export const DEFAULT_EXPORT_OPTIONS = {
  autoDownload: true,
  openInNewWindow: false,
  compressionLevel: 'light' as const
};

/**
 * أنواع التقارير المتاحة
 */
export const AVAILABLE_REPORT_TYPES = [
  'teachers',
  'assignments', 
  'teacher',
  'plan',
  'complete'
] as const;

/**
 * أحجام الملفات التقديرية (بايت)
 */
export const ESTIMATED_FILE_SIZES = {
  teachers: 15000,
  assignments: 20000,
  teacher: 8000,
  plan: 25000,
  complete: 30000
};

/**
 * واجهة موحدة للتصدير
 */
export interface ExportManager {
  exportHTML: (type: ReportType, data: any, options?: any) => Promise<any>;
  getEstimatedSize: (type: ReportType, recordCount: number) => number;
  validateData: (data: any) => boolean;
}