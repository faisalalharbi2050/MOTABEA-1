/**
 * نافذة التقارير الاحترافية
 * Professional Reports Dialog Component
 */

import React, { useState, useMemo } from 'react';
import { X, Printer, Download, FileText, Mail, Share2 } from 'lucide-react';
import { useAssignment } from '../store/assignmentStore';
import { 
  generateTeachersPDF,
  generateTeacherPDF,
  generatePlanPDF
} from '../utils/PdfClient';
import { 
  exportPlanCSV,
  exportTeacherReportCSV,
  exportTeachersCSV
} from '../utils/csv';
import {
  sendTeacherReport,
  sendSummaryReport
} from '../utils/whatsapp';

interface ReportsDialogProps {
  selectedTeachers: Set<string>;
  onClose: () => void;
}

const ReportsDialog: React.FC<ReportsDialogProps> = ({
  selectedTeachers,
  onClose,
}) => {
  const { state } = useAssignment();
  const [reportType, setReportType] = useState<'teacher' | 'classroom' | 'all'>('all');
  const [selectedTeacherForReport, setSelectedTeacherForReport] = useState<string>('');
  const [selectedClassroomForReport, setSelectedClassroomForReport] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // الحصول على المعلمين والفصول
  const teachers = useMemo(() => state.teachers.filter(t => t.isActive), [state.teachers]);
  const classrooms = useMemo(() => state.classrooms.filter(c => c.isActive), [state.classrooms]);

  // معالجة الطباعة
  const handlePrint = () => {
    window.print();
  };

  // معالجة تنزيل PDF
  const handleDownloadPDF = async () => {
    setIsProcessing(true);
    try {
      if (reportType === 'teacher') {
        if (selectedTeacherForReport) {
          await generateTeacherPDF(state, selectedTeacherForReport);
        } else if (selectedTeachers.size === 1) {
          const teacherId = Array.from(selectedTeachers)[0];
          await generateTeacherPDF(state, teacherId);
        } else {
          await generateTeachersPDF(state);
        }
      } else {
        await generatePlanPDF(state);
      }
    } catch (error) {
      console.error('خطأ في تنزيل PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // معالجة تنزيل CSV
  const handleDownloadCSV = () => {
    setIsProcessing(true);
    try {
      if (reportType === 'teacher') {
        if (selectedTeacherForReport) {
          exportTeacherReportCSV(state, selectedTeacherForReport);
        } else if (selectedTeachers.size === 1) {
          const teacherId = Array.from(selectedTeachers)[0];
          exportTeacherReportCSV(state, teacherId);
        } else {
          exportTeachersCSV(state);
        }
      } else {
        exportPlanCSV(state);
      }
    } catch (error) {
      console.error('خطأ في تنزيل CSV:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // معالجة إرسال واتساب
  const handleWhatsAppShare = () => {
    setIsProcessing(true);
    try {
      if (reportType === 'teacher' && selectedTeacherForReport) {
        sendTeacherReport(state, selectedTeacherForReport, '', { format: 'detailed' });
      } else if (selectedTeachers.size === 1) {
        const teacherId = Array.from(selectedTeachers)[0];
        sendTeacherReport(state, teacherId, '', { format: 'detailed' });
      } else {
        sendSummaryReport(state, '', { format: 'detailed' });
      }
    } catch (error) {
      console.error('خطأ في مشاركة واتساب:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // معالجة تصدير HTML
  const handleExportHTML = () => {
    setIsProcessing(true);
    try {
      // سيتم التنفيذ لاحقاً
      alert('سيتم إضافة هذه الميزة قريباً');
    } catch (error) {
      console.error('خطأ في تصدير HTML:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* رأس النافذة */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                التقارير
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* محتوى النافذة */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* اختيار نوع التقرير */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              نوع التقرير
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setReportType('teacher')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  reportType === 'teacher'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <FileText className={`h-6 w-6 mx-auto mb-2 ${reportType === 'teacher' ? 'text-blue-600' : 'text-gray-600'}`} />
                  <span className="text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    تقرير معلم
                  </span>
                </div>
              </button>
              <button
                onClick={() => setReportType('classroom')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  reportType === 'classroom'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <FileText className={`h-6 w-6 mx-auto mb-2 ${reportType === 'classroom' ? 'text-blue-600' : 'text-gray-600'}`} />
                  <span className="text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    تقرير فصل
                  </span>
                </div>
              </button>
              <button
                onClick={() => setReportType('all')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  reportType === 'all'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <FileText className={`h-6 w-6 mx-auto mb-2 ${reportType === 'all' ? 'text-blue-600' : 'text-gray-600'}`} />
                  <span className="text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    تقرير شامل
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* خيارات التقرير */}
          {reportType === 'teacher' && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                اختر المعلم
              </h3>
              <select
                value={selectedTeacherForReport}
                onChange={(e) => setSelectedTeacherForReport(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
              >
                <option value="">-- جميع المعلمين --</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.specialization}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'classroom' && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                اختر الفصل
              </h3>
              <select
                value={selectedClassroomForReport}
                onChange={(e) => setSelectedClassroomForReport(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
              >
                <option value="">-- جميع الفصول --</option>
                {classrooms.map(classroom => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} - {classroom.grade}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* خيارات التصدير */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              خيارات التصدير والمشاركة
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePrint}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all disabled:opacity-50"
              >
                <Printer className="h-5 w-5" />
                <span className="text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  طباعة
                </span>
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-500 hover:bg-red-50 hover:text-red-700 transition-all disabled:opacity-50"
              >
                <Download className="h-5 w-5" />
                <span className="text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  تنزيل PDF
                </span>
              </button>
              <button
                onClick={handleDownloadCSV}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all disabled:opacity-50"
              >
                <Download className="h-5 w-5" />
                <span className="text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  تنزيل CSV
                </span>
              </button>
              <button
                onClick={handleExportHTML}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 transition-all disabled:opacity-50"
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  تصدير HTML
                </span>
              </button>
              <button
                onClick={handleWhatsAppShare}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 col-span-2"
              >
                <Share2 className="h-5 w-5" />
                <span className="text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  إرسال عبر واتساب
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* تذييل النافذة */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsDialog;
