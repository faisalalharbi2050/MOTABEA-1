/**
 * وحدة تنظيف وتعقيم البيانات
 * Data Sanitization and Cleaning Module
 */

/**
 * هروب HTML لمنع XSS والمشاكل الأمنية
 * @param text النص المراد هروبه
 * @returns النص مع هروب الأحرف الخاصة
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return text.replace(/[&<>"'`=\/]/g, (match) => htmlEscapes[match] || match);
}

/**
 * إزالة الأحرف التحكمية والمشكوك فيها
 * @param text النص المراد تنظيفه
 * @returns النص منظف من الأحرف التحكمية
 */
export function stripControlChars(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  // إزالة الأحرف التحكمية باستثناء السطر الجديد والتبويب
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
}

/**
 * تنظيف النص للاستخدام في HTML
 * @param text النص المراد تنظيفه
 * @param options خيارات التنظيف
 * @returns النص منظف وجاهز للاستخدام في HTML
 */
export function sanitizeForHtml(
  text: string,
  options: {
    escapeHtml?: boolean;
    stripControlChars?: boolean;
    trimWhitespace?: boolean;
    maxLength?: number;
  } = {}
): string {
  if (typeof text !== 'string') {
    text = String(text);
  }

  const {
    escapeHtml: shouldEscape = true,
    stripControlChars: shouldStrip = true,
    trimWhitespace = true,
    maxLength
  } = options;

  let result = text;

  // إزالة الأحرف التحكمية
  if (shouldStrip) {
    result = stripControlChars(result);
  }

  // تقليم المسافات
  if (trimWhitespace) {
    result = result.trim();
  }

  // قطع النص إذا كان أطول من الحد المسموح
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength).trim();
  }

  // هروب HTML
  if (shouldEscape) {
    result = escapeHtml(result);
  }

  return result;
}

/**
 * تنظيف النص للاستخدام في JSON
 * @param text النص المراد تنظيفه
 * @returns النص منظف وجاهز للاستخدام في JSON
 */
export function sanitizeForJson(text: string): string {
  if (typeof text !== 'string') {
    text = String(text);
  }

  // إزالة الأحرف التحكمية
  let result = stripControlChars(text);

  // هروب الأحرف الخاصة في JSON
  result = result
    .replace(/\\/g, '\\\\')  // هروب الباك سلاش
    .replace(/"/g, '\\"')    // هروب علامة التنصيص
    .replace(/\n/g, '\\n')   // هروب السطر الجديد
    .replace(/\r/g, '\\r')   // هروب العودة
    .replace(/\t/g, '\\t');  // هروب التبويب

  return result;
}

/**
 * تنظيف اسم الملف ليكون آمناً
 * @param filename اسم الملف
 * @returns اسم ملف آمن
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    filename = String(filename);
  }

  // إزالة الأحرف غير المسموحة في أسماء الملفات
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .trim();
}

/**
 * التحقق من أن النص آمن للاستخدام
 * @param text النص المراد فحصه
 * @returns true إذا كان النص آمناً
 */
export function isSafeText(text: string): boolean {
  if (typeof text !== 'string') {
    return false;
  }

  // فحص وجود أحرف تحكمية أو أكواد ضارة
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/
  ];

  return !dangerousPatterns.some(pattern => pattern.test(text));
}

/**
 * تنظيف شامل للنص قبل الاستخدام في التقارير
 * @param text النص المراد تنظيفه
 * @returns النص منظف بالكامل
 */
export function sanitizeReportText(text: string): string {
  return sanitizeForHtml(text, {
    escapeHtml: true,
    stripControlChars: true,
    trimWhitespace: true,
    maxLength: 10000 // حد أقصى 10 آلاف حرف
  });
}

/**
 * تنظيف البيانات الرقمية والتأكد من صحتها
 * @param value القيمة الرقمية
 * @param defaultValue القيمة الافتراضية
 * @returns القيمة منظفة وآمنة
 */
export function sanitizeNumeric(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return Math.max(0, Math.round(value * 100) / 100); // تقريب لرقمين عشريين
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (!isNaN(parsed) && isFinite(parsed)) {
      return Math.max(0, Math.round(parsed * 100) / 100);
    }
  }

  return defaultValue;
}

/**
 * تنظيف مصفوفة من النصوص
 * @param texts مصفوفة النصوص
 * @returns مصفوفة النصوص منظفة
 */
export function sanitizeTextArray(texts: any[]): string[] {
  if (!Array.isArray(texts)) {
    return [];
  }

  return texts
    .filter(text => text != null && text !== '')
    .map(text => sanitizeReportText(String(text)))
    .filter(text => text.length > 0);
}