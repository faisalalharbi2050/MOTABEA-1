/**
 * مكون تصدير HTML الكامل مع خيارات متقدمة
 * HTML Export All Menu Component
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Download, 
  Copy, 
  Eye, 
  Settings, 
  FileText, 
  Calendar,
  School,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { TeacherSummary } from '../export/htmlAllBuilder';
import { 
  createPlanHtmlExporter,
  generateFilenameWithDate
} from '../export/htmlAllDownload';

interface HtmlExportAllMenuProps {
  /** بيانات المعلمين للتصدير */
  summaries: TeacherSummary[];
  /** حالة التحميل */
  isLoading?: boolean;
  /** دالة استدعاء عند إغلاق القائمة */
  onClose?: () => void;
  /** إظهار القائمة */
  isVisible?: boolean;
  /** فئات CSS إضافية */
  className?: string;
}

interface ExportSettings {
  /** اسم المدرسة */
  schoolName: string;
  /** عنوان التقرير */
  title: string;
  /** تضمين التاريخ */
  includeDate: boolean;
  /** اسم الملف المخصص */
  customFilename: string;
}

interface ExportStatus {
  type: 'success' | 'error' | 'info' | null;
  message: string;
}

const HtmlExportAllMenu: React.FC<HtmlExportAllMenuProps> = ({
  summaries,
  isLoading = false,
  onClose,
  isVisible = false,
  className = ''
}) => {
  // إعدادات التصدير
  const [settings, setSettings] = useState<ExportSettings>({
    schoolName: '',
    title: 'خطة إسناد المواد الكاملة',
    includeDate: true,
    customFilename: ''
  });

  // حالة العملية
  const [exportStatus, setExportStatus] = useState<ExportStatus>({ 
    type: null, 
    message: '' 
  });

  // حالة التحميل
  const [isProcessing, setIsProcessing] = useState(false);

  // إنشاء المُصدِر
  const exporter = useMemo(() => {
    if (!summaries || summaries.length === 0) return null;
    
    return createPlanHtmlExporter(summaries, {
      title: settings.title,
      schoolName: settings.schoolName || undefined,
      includeDate: settings.includeDate
    });
  }, [summaries, settings]);

  // اسم الملف النهائي
  const finalFilename = useMemo(() => {
    if (settings.customFilename.trim()) {
      return settings.customFilename.trim().endsWith('.html') 
        ? settings.customFilename.trim()
        : `${settings.customFilename.trim()}.html`;
    }
    
    return generateFilenameWithDate('Assignment_Plan_All');
  }, [settings.customFilename]);

  // حجم الملف المتوقع
  const estimatedSize = useMemo(() => {
    if (!exporter) return '0 KB';
    
    const bytes = exporter.getSize();
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, [exporter]);

  // تحديث الإعدادات
  const updateSetting = useCallback(<K extends keyof ExportSettings>(
    key: K, 
    value: ExportSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setExportStatus({ type: null, message: '' });
  }, []);

  // إظهار حالة العملية
  const showStatus = useCallback((type: ExportStatus['type'], message: string) => {
    setExportStatus({ type, message });
    if (type === 'success') {
      setTimeout(() => setExportStatus({ type: null, message: '' }), 3000);
    }
  }, []);

  // تنزيل الملف
  const handleDownload = useCallback(async () => {
    if (!exporter) return;
    
    setIsProcessing(true);
    try {
      exporter.download();
      showStatus('success', 'تم تنزيل الملف بنجاح');
    } catch (error) {
      console.error('خطأ في التنزيل:', error);
      showStatus('error', 'فشل في تنزيل الملف');
    } finally {
      setIsProcessing(false);
    }
  }, [exporter, showStatus]);

  // نسخ إلى الحافظة
  const handleCopy = useCallback(async () => {
    if (!exporter) return;
    
    setIsProcessing(true);
    try {
      await exporter.copy();
      showStatus('success', 'تم نسخ المحتوى إلى الحافظة');
    } catch (error) {
      console.error('خطأ في النسخ:', error);
      showStatus('error', 'فشل في نسخ المحتوى');
    } finally {
      setIsProcessing(false);
    }
  }, [exporter, showStatus]);

  // فتح المعاينة
  const handlePreview = useCallback(async () => {
    if (!exporter) return;
    
    setIsProcessing(true);
    try {
      exporter.preview();
      showStatus('success', 'تم فتح المعاينة في نافذة جديدة');
    } catch (error) {
      console.error('خطأ في المعاينة:', error);
      showStatus('error', 'فشل في فتح المعاينة');
    } finally {
      setIsProcessing(false);
    }
  }, [exporter, showStatus]);

  // التحقق من صحة JSON
  const isJsonValid = useMemo(() => {
    return exporter?.validateJson() || false;
  }, [exporter]);

  if (!isVisible) return null;

  return (
    <div className={`
      fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4
      ${className}
    `}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* رأس القائمة */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-bold">تصدير HTML (الخطة الكاملة)</h2>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="mt-2 text-blue-100">
            إنتاج ملف HTML ذاتي الاكتفاء مع JSON مدمج لإضافة كروم/مدرستي
          </div>
        </div>

        {/* محتوى القائمة */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* الإحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-600">المعلمين</div>
              <div className="text-lg font-bold text-gray-800">
                {summaries?.length || 0}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-600">الإسنادات</div>
              <div className="text-lg font-bold text-gray-800">
                {summaries?.reduce((sum, t) => sum + t.assignments.length, 0) || 0}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-600">حجم الملف</div>
              <div className="text-lg font-bold text-gray-800">{estimatedSize}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-600">JSON</div>
              <div className="flex items-center justify-center">
                {isJsonValid ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
          </div>

          {/* الإعدادات */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              إعدادات التصدير
            </h3>

            {/* اسم المدرسة */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <School className="w-4 h-4" />
                اسم المدرسة (اختياري)
              </label>
              <input
                type="text"
                value={settings.schoolName}
                onChange={(e) => updateSetting('schoolName', e.target.value)}
                placeholder="اسم المدرسة..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              />
            </div>

            {/* عنوان التقرير */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4" />
                عنوان التقرير
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => updateSetting('title', e.target.value)}
                placeholder="عنوان التقرير..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              />
            </div>

            {/* اسم الملف المخصص */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                اسم الملف المخصص (اختياري)
              </label>
              <input
                type="text"
                value={settings.customFilename}
                onChange={(e) => updateSetting('customFilename', e.target.value)}
                placeholder={finalFilename}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              />
              <div className="text-xs text-gray-500">
                اسم الملف النهائي: {finalFilename}
              </div>
            </div>

            {/* خيارات إضافية */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                خيارات إضافية
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeDate}
                  onChange={(e) => updateSetting('includeDate', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isProcessing}
                />
                <span className="text-sm text-gray-700">تضمين التاريخ في التقرير</span>
              </label>
            </div>
          </div>

          {/* حالة العملية */}
          {exportStatus.type && (
            <div className={`
              mt-4 p-3 rounded-lg border flex items-center gap-2
              ${exportStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
              ${exportStatus.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
              ${exportStatus.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
            `}>
              {exportStatus.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {exportStatus.type === 'error' && <AlertCircle className="w-4 h-4" />}
              {exportStatus.type === 'info' && <AlertCircle className="w-4 h-4" />}
              <span className="text-sm">{exportStatus.message}</span>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-3 justify-end">
          <button
            onClick={handleCopy}
            disabled={isProcessing || isLoading || !exporter}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Copy className="w-4 h-4" />
            نسخ HTML
          </button>

          <button
            onClick={handlePreview}
            disabled={isProcessing || isLoading || !exporter}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Eye className="w-4 h-4" />
            معاينة
          </button>

          <button
            onClick={handleDownload}
            disabled={isProcessing || isLoading || !exporter}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            {isProcessing ? 'جاري التنزيل...' : 'تنزيل HTML'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HtmlExportAllMenu;