/**
 * أداة تنزيل ملفات HTML مكتفية ذاتياً
 * Self-contained HTML Download Utility
 */

import { AssignmentState } from '../store/types';
import HtmlAllBuilder, { TeacherSummary, buildPlanAllHtml } from './htmlAllBuilder';
import { sanitizeFilename } from './sanitize';

/**
 * نوع التقرير للتصدير
 */
export type ReportType = 'teachers' | 'assignments' | 'teacher' | 'plan' | 'complete';

/**
 * خيارات التنزيل
 */
export interface DownloadOptions {
  filename?: string;
  openInNewWindow?: boolean;
  autoDownload?: boolean;
  compressionLevel?: 'none' | 'light' | 'heavy';
}

/**
 * واجهة بيانات التقرير المولد
 */
export interface GeneratedReport {
  html: string;
  size: number;
  filename: string;
  generatedAt: Date;
  type: ReportType;
}

/**
 * فئة تنزيل HTML
 */
export class HtmlAllDownload {
  private builder: HtmlAllBuilder;

  constructor() {
    this.builder = new HtmlAllBuilder({
      standalone: true,
      includeStyles: true,
      includeScripts: true,
      rtl: true,
      printOptimized: true
    });
  }

  /**
   * ضغط HTML (إزالة المسافات الزائدة والتعليقات)
   */
  private compressHtml(html: string, level: 'none' | 'light' | 'heavy' = 'light'): string {
    if (level === 'none') return html;

    let compressed = html;

    if (level === 'light') {
      // ضغط خفيف - إزالة المسافات والأسطر الفارغة
      compressed = compressed
        .replace(/\n\s+/g, '\n')
        .replace(/\n+/g, '\n')
        .replace(/>\s+</g, '><')
        .trim();
    } else if (level === 'heavy') {
      // ضغط مكثف - إزالة جميع المسافات غير الضرورية
      compressed = compressed
        .replace(/<!--[\s\S]*?-->/g, '') // إزالة التعليقات
        .replace(/\s+/g, ' ') // تقليل المسافات المتعددة إلى مسافة واحدة
        .replace(/>\s+</g, '><') // إزالة المسافات بين العلامات
        .replace(/\s+>/g, '>') // إزالة المسافات قبل إغلاق العلامات
        .replace(/<\s+/g, '<') // إزالة المسافات بعد فتح العلامات
        .trim();
    }

    return compressed;
  }

  /**
   * إنشاء اسم ملف فريد
   */
  private generateFilename(type: ReportType, teacherName?: string): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');

    const typeNames = {
      teachers: 'المعلمين',
      assignments: 'الإسناد', 
      teacher: teacherName ? `المعلم_${teacherName.replace(/\s+/g, '_')}` : 'معلم',
      plan: 'خطة_الإسناد',
      complete: 'التقرير_الشامل'
    };

    return `تقرير_${typeNames[type]}_${dateStr}_${timeStr}.html`;
  }

  /**
   * إنشاء تقرير وتحضيره للتنزيل
   */
  private generateReport(
    state: AssignmentState, 
    type: ReportType, 
    teacherId?: string,
    options: DownloadOptions = {}
  ): GeneratedReport {
    let html = '';
    let filename = options.filename || this.generateFilename(type);

    switch (type) {
      case 'teachers':
        html = this.builder.buildTeachersReport(state);
        break;
      case 'assignments':
        html = this.builder.buildAssignmentsReport(state);
        break;
      case 'teacher':
        if (!teacherId) throw new Error('معرف المعلم مطلوب لتقرير المعلم');
        const teacher = state.teachers.find(t => t.id === teacherId);
        filename = options.filename || this.generateFilename(type, teacher?.name);
        html = this.builder.buildTeacherReport(state, teacherId);
        break;
      case 'plan':
        html = this.builder.buildCompleteReport(state);
        break;
      case 'complete':
        html = this.builder.buildCompleteReport(state);
        break;
      default:
        throw new Error(`نوع التقرير غير مدعوم: ${type}`);
    }

    // ضغط HTML إذا كان مطلوباً
    const compressed = this.compressHtml(html, options.compressionLevel);
    
    return {
      html: compressed,
      size: new Blob([compressed]).size,
      filename,
      generatedAt: new Date(),
      type
    };
  }

  /**
   * تنزيل ملف HTML
   */
  private downloadFile(content: string, filename: string): void {
    // إضافة BOM للدعم الأفضل للنصوص العربية
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { 
      type: 'text/html;charset=utf-8' 
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    
    // إضافة الرابط للصفحة مؤقتاً وتفعيله
    document.body.appendChild(link);
    link.click();
    
    // تنظيف الموارد
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  /**
   * فتح HTML في نافذة جديدة
   */
  private openInNewWindow(html: string, title: string = 'تقرير'): Window | null {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.title = title;
      newWindow.document.close();
    }
    return newWindow;
  }

  /**
   * تصدير تقرير المعلمين
   */
  async exportTeachersReport(
    state: AssignmentState, 
    options: DownloadOptions = {}
  ): Promise<GeneratedReport> {
    const report = this.generateReport(state, 'teachers', undefined, options);

    if (options.openInNewWindow) {
      this.openInNewWindow(report.html, 'تقرير المعلمين');
    }

    if (options.autoDownload !== false) {
      this.downloadFile(report.html, report.filename);
    }

    return report;
  }

  /**
   * تصدير تقرير الإسناد
   */
  async exportAssignmentsReport(
    state: AssignmentState, 
    options: DownloadOptions = {}
  ): Promise<GeneratedReport> {
    const report = this.generateReport(state, 'assignments', undefined, options);

    if (options.openInNewWindow) {
      this.openInNewWindow(report.html, 'تقرير الإسناد');
    }

    if (options.autoDownload !== false) {
      this.downloadFile(report.html, report.filename);
    }

    return report;
  }

  /**
   * تصدير تقرير معلم محدد
   */
  async exportTeacherReport(
    state: AssignmentState, 
    teacherId: string,
    options: DownloadOptions = {}
  ): Promise<GeneratedReport> {
    const teacher = state.teachers.find(t => t.id === teacherId);
    if (!teacher) {
      throw new Error('المعلم المحدد غير موجود');
    }

    const report = this.generateReport(state, 'teacher', teacherId, options);

    if (options.openInNewWindow) {
      this.openInNewWindow(report.html, `تقرير المعلم: ${teacher.name}`);
    }

    if (options.autoDownload !== false) {
      this.downloadFile(report.html, report.filename);
    }

    return report;
  }

  /**
   * تصدير خطة الإسناد الشاملة
   */
  async exportPlanReport(
    state: AssignmentState, 
    options: DownloadOptions = {}
  ): Promise<GeneratedReport> {
    const report = this.generateReport(state, 'plan', undefined, options);

    if (options.openInNewWindow) {
      this.openInNewWindow(report.html, 'خطة الإسناد الشاملة');
    }

    if (options.autoDownload !== false) {
      this.downloadFile(report.html, report.filename);
    }

    return report;
  }

  /**
   * تصدير التقرير الشامل
   */
  async exportCompleteReport(
    state: AssignmentState, 
    options: DownloadOptions = {}
  ): Promise<GeneratedReport> {
    const report = this.generateReport(state, 'complete', undefined, options);

    if (options.openInNewWindow) {
      this.openInNewWindow(report.html, 'التقرير الشامل');
    }

    if (options.autoDownload !== false) {
      this.downloadFile(report.html, report.filename);
    }

    return report;
  }

  /**
   * تصدير متعدد - جميع التقارير دفعة واحدة
   */
  async exportAllReports(
    state: AssignmentState,
    options: DownloadOptions = {}
  ): Promise<GeneratedReport[]> {
    const reports: GeneratedReport[] = [];
    
    try {
      // تقرير المعلمين
      const teachersReport = this.generateReport(state, 'teachers', undefined, {
        ...options,
        filename: options.filename ? `${options.filename}_المعلمين.html` : undefined
      });
      reports.push(teachersReport);

      // تقرير الإسناد
      const assignmentsReport = this.generateReport(state, 'assignments', undefined, {
        ...options,
        filename: options.filename ? `${options.filename}_الإسناد.html` : undefined
      });
      reports.push(assignmentsReport);

      // خطة الإسناد
      const planReport = this.generateReport(state, 'plan', undefined, {
        ...options,
        filename: options.filename ? `${options.filename}_الخطة.html` : undefined
      });
      reports.push(planReport);

      // التقرير الشامل
      const completeReport = this.generateReport(state, 'complete', undefined, {
        ...options,
        filename: options.filename ? `${options.filename}_الشامل.html` : undefined
      });
      reports.push(completeReport);

      // تنزيل جميع التقارير إذا كان مطلوباً
      if (options.autoDownload !== false) {
        for (const report of reports) {
          this.downloadFile(report.html, report.filename);
          // تأخير قصير بين التنزيلات لتجنب حظر المتصفح
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      return reports;
    } catch (error) {
      console.error('خطأ في تصدير التقارير:', error);
      throw error;
    }
  }

  /**
   * إنشاء أرشيف مضغوط للتقارير (محاكاة - للاستخدام المستقبلي)
   */
  async createReportsArchive(
    state: AssignmentState,
    options: DownloadOptions = {}
  ): Promise<{ reports: GeneratedReport[]; totalSize: number }> {
    const reports = await this.exportAllReports(state, {
      ...options,
      autoDownload: false // لا ننزل الملفات الفردية
    });

    const totalSize = reports.reduce((sum, report) => sum + report.size, 0);

    return {
      reports,
      totalSize
    };
  }

  /**
   * الحصول على معلومات التقرير بدون إنشائه
   */
  getReportInfo(state: AssignmentState, type: ReportType, teacherId?: string): {
    estimatedSize: number;
    filename: string;
    recordCount: number;
  } {
    let recordCount = 0;
    let filename = '';

    switch (type) {
      case 'teachers':
        recordCount = state.teachers.length;
        filename = this.generateFilename(type);
        break;
      case 'assignments':
        recordCount = state.assignments.length;
        filename = this.generateFilename(type);
        break;
      case 'teacher':
        if (teacherId) {
          recordCount = state.assignments.filter(a => a.teacherId === teacherId).length;
          const teacher = state.teachers.find(t => t.id === teacherId);
          filename = this.generateFilename(type, teacher?.name);
        }
        break;
      case 'plan':
      case 'complete':
        recordCount = state.assignments.length + state.teachers.length + state.subjects.length + state.classrooms.length;
        filename = this.generateFilename(type);
        break;
    }

    // تقدير تقريبي لحجم الملف (بايت)
    const estimatedSize = Math.max(5000, recordCount * 150 + 8000);

    return {
      estimatedSize,
      filename,
      recordCount
    };
  }
}

// واجهات مبسطة للاستخدام السريع
const htmlDownloader = new HtmlAllDownload();

/**
 * تصدير تقرير المعلمين كـ HTML
 */
export async function exportTeachersHTML(
  state: AssignmentState, 
  options?: DownloadOptions
): Promise<GeneratedReport> {
  return htmlDownloader.exportTeachersReport(state, options);
}

/**
 * تصدير تقرير الإسناد كـ HTML
 */
export async function exportAssignmentsHTML(
  state: AssignmentState, 
  options?: DownloadOptions
): Promise<GeneratedReport> {
  return htmlDownloader.exportAssignmentsReport(state, options);
}

/**
 * تصدير تقرير معلم محدد كـ HTML
 */
export async function exportTeacherHTML(
  state: AssignmentState, 
  teacherId: string,
  options?: DownloadOptions
): Promise<GeneratedReport> {
  return htmlDownloader.exportTeacherReport(state, teacherId, options);
}

/**
 * تصدير خطة الإسناد كـ HTML
 */
export async function exportPlanHTML(
  state: AssignmentState, 
  options?: DownloadOptions
): Promise<GeneratedReport> {
  return htmlDownloader.exportPlanReport(state, options);
}

/**
 * تصدير جميع التقارير كـ HTML
 */
export async function exportAllHTML(
  state: AssignmentState, 
  options?: DownloadOptions
): Promise<GeneratedReport[]> {
  return htmlDownloader.exportAllReports(state, options);
}

/**
 * تنزيل خطة HTML كاملة
 * @param filename اسم الملف
 * @param html محتوى HTML
 */
export function downloadPlanHtml(filename: string, html: string): void {
  try {
    // تنظيف اسم الملف
    const cleanFilename = sanitizeFilename(filename);
    
    // إنشاء Blob مع HTML
    const blob = new Blob([html], { 
      type: 'text/html;charset=utf-8' 
    });
    
    // إنشاء رابط التنزيل
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = cleanFilename.endsWith('.html') ? cleanFilename : `${cleanFilename}.html`;
    link.style.display = 'none';
    
    // إضافة الرابط للصفحة وتفعيله
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('خطأ في تنزيل ملف HTML:', error);
    throw new Error('فشل في تنزيل الملف');
  }
}

/**
 * نسخ HTML إلى الحافظة
 * @param html محتوى HTML
 * @returns Promise للتأكد من اكتمال النسخ
 */
export async function copyPlanHtmlToClipboard(html: string): Promise<void> {
  try {
    // التحقق من دعم Clipboard API
    if (!navigator.clipboard) {
      throw new Error('Clipboard API غير مدعوم');
    }

    // إنشاء ClipboardItem مع HTML
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([html], { type: 'text/plain' });
    
    const clipboardItem = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob
    });

    // نسخ إلى الحافظة
    await navigator.clipboard.write([clipboardItem]);
    
  } catch (error) {
    console.error('خطأ في نسخ HTML:', error);
    
    // Fallback للنسخ كنص عادي
    try {
      await navigator.clipboard.writeText(html);
    } catch (fallbackError) {
      console.error('خطأ في النسخ الاحتياطي:', fallbackError);
      throw new Error('فشل في نسخ المحتوى إلى الحافظة');
    }
  }
}

/**
 * فتح معاينة HTML في نافذة جديدة
 * @param html محتوى HTML
 * @param title عنوان النافذة
 */
export function openPlanHtmlPreview(html: string, title: string = 'معاينة التقرير'): void {
  try {
    // فتح نافذة جديدة
    const previewWindow = window.open('', '_blank', 
      'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );
    
    if (!previewWindow) {
      throw new Error('تم حظر النوافذ المنبثقة');
    }
    
    // كتابة HTML في النافذة الجديدة
    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();
    
    // تعيين عنوان النافذة
    previewWindow.document.title = title;
    
    // التركيز على النافذة الجديدة
    previewWindow.focus();
    
  } catch (error) {
    console.error('خطأ في فتح معاينة HTML:', error);
    
    // Fallback: إنشاء URL للمحتوى وفتحه
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const fallbackWindow = window.open(url, '_blank');
      
      if (!fallbackWindow) {
        throw new Error('فشل في فتح النافذة');
      }
      
      // تنظيف URL بعد فترة قصيرة
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
    } catch (fallbackError) {
      console.error('خطأ في المعاينة الاحتياطية:', fallbackError);
      throw new Error('فشل في فتح معاينة التقرير');
    }
  }
}

/**
 * إنشاء اسم ملف مع التاريخ الحالي
 * @param prefix البادئة
 * @param extension الامتداد
 * @returns اسم ملف بالتاريخ
 */
export function generateFilenameWithDate(prefix: string = 'Assignment_Plan_All', extension: string = 'html'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const dateStr = `${year}-${month}-${day}`;
  return sanitizeFilename(`${prefix}_${dateStr}.${extension}`);
}

/**
 * تصدير خطة HTML كاملة بالدوال الثلاث المطلوبة
 * @param summaries بيانات المعلمين
 * @param meta البيانات الوصفية
 * @returns كائن يحتوي على دوال التصدير
 */
export function createPlanHtmlExporter(summaries: TeacherSummary[], meta?: {
  title?: string;
  schoolName?: string;
  includeDate?: boolean;
}) {
  const html = buildPlanAllHtml(summaries, meta);
  const filename = generateFilenameWithDate('Assignment_Plan_All');
  
  return {
    html,
    filename,
    
    /**
     * تنزيل الملف
     */
    download: () => downloadPlanHtml(filename, html),
    
    /**
     * نسخ إلى الحافظة
     */
    copy: () => copyPlanHtmlToClipboard(html),
    
    /**
     * فتح معاينة
     */
    preview: () => openPlanHtmlPreview(html, meta?.title || 'خطة إسناد المواد'),
    
    /**
     * الحصول على حجم الملف المتوقع
     */
    getSize: () => new Blob([html]).size,
    
    /**
     * التحقق من صحة JSON المدمج
     */
    validateJson: () => {
      try {
        // محاكاة استخراج JSON من HTML
        const jsonMatch = html.match(/<script type="application\/json" id="mutaaba-plan">([\s\S]*?)<\/script>/);
        if (jsonMatch && jsonMatch[1]) {
          JSON.parse(jsonMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }
  };
}