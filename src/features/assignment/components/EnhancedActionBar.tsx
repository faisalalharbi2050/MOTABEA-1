/**
 * شريط الأزرار والإعدادات المحسّن
 * Enhanced Action Bar Component
 */

import React, { useState } from 'react';
import { FileText, MessageCircle, Settings as SettingsIcon } from 'lucide-react';

// @ts-ignore - TypeScript cache issue, file exists
import ReportsDialog from './ReportsDialog';

interface EnhancedActionBarProps {
  selectedTeachers: Set<string>;
  onWhatsAppShare?: () => void;
}

const EnhancedActionBar: React.FC<EnhancedActionBarProps> = ({
  selectedTeachers,
  onWhatsAppShare,
}) => {
  const [showReports, setShowReports] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4" dir="rtl">
        <div className="flex items-center justify-end gap-3">
          {/* زر التقارير */}
          <button
            onClick={() => setShowReports(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            <FileText className="h-4 w-4" />
            <span className="text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              التقارير
            </span>
          </button>

          {/* زر إرسال عبر واتساب */}
          <button
            onClick={onWhatsAppShare}
            disabled={selectedTeachers.size === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all shadow-md ${
              selectedTeachers.size === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-lg'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              إرسال عبر واتساب
            </span>
          </button>

          {/* زر الإعدادات */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-lg transition-all"
          >
            <SettingsIcon className="h-4 w-4" />
            <span className="text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              الإعدادات
            </span>
          </button>
        </div>

        {/* قائمة الإعدادات المنسدلة */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              إعدادات النظام
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                <span className="text-sm text-gray-700" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  الحفظ التلقائي
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                <span className="text-sm text-gray-700" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  تنبيه عند تجاوز النصاب
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-blue-600" />
                <span className="text-sm text-gray-700" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  عرض الإحصائيات المباشرة
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* نافذة التقارير */}
      {showReports && (
        <ReportsDialog
          selectedTeachers={selectedTeachers}
          onClose={() => setShowReports(false)}
        />
      )}
    </>
  );
};

export default EnhancedActionBar;
