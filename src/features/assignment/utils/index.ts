/**
 * فهرس أدوات نظام الإسناد
 * Assignment System Utils Index
 */

// أدوات التصدير
export * from './csv';
export * from './PdfClient';
export * from './exportFunctions';

// أدوات الواتساب والمشاركة
export * from './whatsapp';

// أدوات HTML (سيتم إنشاؤها لاحقاً في المهمة 4)
// export * from './htmlAllBuilder';
// export * from './htmlAllDownload';

// أدوات إضافية يمكن إضافتها لاحقاً
// export * from './excel';
// export * from './print';
// export * from './validation';
// export * from './formatting';

/**
 * نوع عام لأدوات التصدير
 */
export type ExportFormat = 'csv' | 'pdf' | 'html' | 'excel';

/**
 * نوع عام لأدوات الطباعة
 */
export type PrintFormat = 'pdf' | 'html';

/**
 * واجهة موحدة لأدوات التصدير
 */
export interface ExportUtility {
  export: (format: ExportFormat, data: any, options?: any) => void;
  print: (format: PrintFormat, data: any, options?: any) => void;
}

/**
 * إعدادات التصدير الافتراضية
 */
export const DEFAULT_EXPORT_SETTINGS = {
  csv: {
    encoding: 'utf-8',
    separator: ',',
    header: true,
    dateFormat: 'YYYY-MM-DD'
  },
  pdf: {
    orientation: 'portrait' as 'portrait' | 'landscape',
    format: 'a4' as 'a4',
    language: 'ar',
    rtl: true
  },
  html: {
    standalone: true,
    rtl: true,
    css: 'embedded',
    javascript: 'inline'
  },
  excel: {
    format: 'xlsx',
    workbook: true,
    rtl: true
  }
};

/**
 * إعدادات الطباعة الافتراضية  
 */
export const DEFAULT_PRINT_SETTINGS = {
  margins: '20mm',
  orientation: 'portrait' as 'portrait' | 'landscape',
  format: 'A4',
  header: true,
  footer: true,
  pageNumbers: true
};