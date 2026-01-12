/**
 * شريط العنوان الاحترافي لصفحة إسناد المواد
 * Professional Title Header for Assignment Page
 */

import React from 'react';
import { FileText } from 'lucide-react';

const AssignmentPageHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-4" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            إسناد المواد
          </h1>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPageHeader;