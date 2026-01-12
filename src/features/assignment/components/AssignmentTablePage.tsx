/**
 * صفحة جدول الإسناد - الصفحة الداخلية الاحترافية
 * Assignment Table Page - Professional Internal Page
 * 
 * الارتباط المباشر:
 * - مرتبطة مباشرة مع assignmentStore (نفس المصدر للصفحة الرئيسية)
 * - أي تغيير في الإسناد، التعديل، أو الحذف يظهر فوراً
 * - نصاب الحصص: محسوب من الإسنادات الفعلية (state.assignments)
 * - نصاب الانتظار: محسوب من teacher.maxLoad (صفحة إدارة المعلمين)
 * - التحديث تلقائي عند أي تغيير في البيانات
 */

import React, { useState } from 'react';
import { 
  Printer, 
  FileSpreadsheet, 
  Code, 
  Send,
  Trash2,
  AlertTriangle,
  X,
  ArrowRight,
  BookOpen,
  Users,
  Clock,
  Timer,
  CalendarClock
} from 'lucide-react';
import { useAssignment, useAssignmentActions } from '../store/assignmentStore';
import { generateAssignmentPDF, generateAssignmentExcel, generateAssignmentHTML } from '../utils/exportFunctions';
import toast from 'react-hot-toast';

interface AssignmentTableRow {
  id: string;
  teacherId: string;
  teacherName: string;
  specialization: string;
  subjectName: string;
  classroomName: string;
  grade: string;
  section: string;
  hoursPerWeek: number;
  waitingHours: number;
  assignmentId: string;
}

interface AssignmentTablePageProps {
  onClose: () => void;
}

const AssignmentTablePage: React.FC<AssignmentTablePageProps> = ({ onClose }) => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [showWhatsAppSelection, setShowWhatsAppSelection] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());

  // بناء صفوف الجدول - مع تحديث تلقائي عند تغيير البيانات
  const buildTableRows = (): AssignmentTableRow[] => {
    const rows: AssignmentTableRow[] = [];
    
    // حساب نصاب الحصص الفعلي لكل معلم من الإسنادات النشطة
    const teacherHoursMap = new Map<string, number>();
    state.assignments
      .filter(a => a.status === 'active')
      .forEach(assignment => {
        const currentHours = teacherHoursMap.get(assignment.teacherId) || 0;
        teacherHoursMap.set(assignment.teacherId, currentHours + assignment.hoursPerWeek);
      });
    
    state.assignments
      .filter(a => a.status === 'active')
      .forEach(assignment => {
        const teacher = state.teachers.find(t => t.id === assignment.teacherId);
        const subject = state.subjects.find(s => s.id === assignment.subjectId);
        const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
        
        if (!teacher || !subject || !classroom) return;
        
        // حساب نصاب الحصص الفعلي من الإسنادات (مرتبط بالصفحة الرئيسية)
        const teacherTotalHours = teacherHoursMap.get(teacher.id) || 0;
        
        // حساب نصاب الانتظار من بيانات المعلم (مرتبط بصفحة إدارة المعلمين)
        // نصاب الانتظار = الحد الأقصى للمعلم - نصاب الحصص الفعلي
        const teacherWaitingHours = Math.max(0, teacher.maxLoad - teacherTotalHours);
        
        rows.push({
          id: `${assignment.id}-${Date.now()}`,
          teacherId: teacher.id,
          teacherName: teacher.name,
          specialization: teacher.specialization || 'غير محدد',
          subjectName: subject.name,
          classroomName: classroom.name,
          grade: classroom.grade,
          section: classroom.section,
          hoursPerWeek: assignment.hoursPerWeek, // عدد حصص هذه المادة المحددة
          waitingHours: teacherWaitingHours, // مباشر من teacher.maxLoad
          assignmentId: assignment.id
        });
      });
    
    return rows;
  };

  // إعادة بناء الجدول عند أي تغيير في state
  const tableRows = buildTableRows();

  // تحديد/إلغاء تحديد معلم
  const toggleTeacherSelection = (teacherId: string) => {
    setSelectedTeachers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  // تحديد الكل
  const selectAllTeachers = () => {
    const allTeacherIds = new Set(tableRows.map(row => row.teacherId));
    setSelectedTeachers(allTeacherIds);
  };

  // إلغاء تحديد الكل
  const deselectAllTeachers = () => {
    setSelectedTeachers(new Set());
  };

  // إحصائيات
  const uniqueTeachers = new Map<string, { teachingHours: number; waitingHours: number }>();
  tableRows.forEach(row => {
    if (!uniqueTeachers.has(row.teacherId)) {
      uniqueTeachers.set(row.teacherId, {
        teachingHours: 0,
        waitingHours: row.waitingHours
      });
    }
    const teacher = uniqueTeachers.get(row.teacherId)!;
    teacher.teachingHours += row.hoursPerWeek;
  });

  const stats = {
    totalTeachers: uniqueTeachers.size,
    totalTeachingHours: Array.from(uniqueTeachers.values()).reduce((sum, t) => sum + t.teachingHours, 0),
    totalWaitingHours: Array.from(uniqueTeachers.values()).reduce((sum, t) => sum + t.waitingHours, 0),
    totalAllHours: Array.from(uniqueTeachers.values()).reduce((sum, t) => sum + t.teachingHours + t.waitingHours, 0),
  };

  // معالجة الطباعة PDF
  const handlePrintPDF = async () => {
    try {
      toast.loading('جاري إنشاء ملف PDF...', { id: 'pdf-table' });
      await generateAssignmentPDF(state);
      toast.success('تم إنشاء ملف PDF بنجاح', { id: 'pdf-table' });
    } catch (error) {
      console.error('خطأ في طباعة PDF:', error);
      toast.error('حدث خطأ أثناء إنشاء ملف PDF', { id: 'pdf-table' });
    }
  };

  // معالجة تصدير Excel
  const handleExportExcel = async () => {
    try {
      toast.loading('جاري إنشاء ملف Excel...', { id: 'excel-table' });
      await generateAssignmentExcel(state);
      toast.success('تم إنشاء ملف Excel بنجاح', { id: 'excel-table' });
    } catch (error) {
      console.error('خطأ في تصدير Excel:', error);
      toast.error('حدث خطأ أثناء إنشاء ملف Excel', { id: 'excel-table' });
    }
  };

  // معالجة تصدير HTML
  const handleExportHTML = async () => {
    try {
      toast.loading('جاري إنشاء ملف HTML...', { id: 'html-table' });
      await generateAssignmentHTML(state);
      toast.success('تم إنشاء ملف HTML بنجاح', { id: 'html-table' });
    } catch (error) {
      console.error('خطأ في تصدير HTML:', error);
      toast.error('حدث خطأ أثناء إنشاء ملف HTML', { id: 'html-table' });
    }
  };

  // معالجة إرسال واتساب
  const handleSendWhatsApp = () => {
    if (!showWhatsAppSelection) {
      // فتح وضع التحديد
      setShowWhatsAppSelection(true);
      toast.success('اختر المعلمين المراد إرسال الإسناد لهم', { icon: '✅' });
      return;
    }

    if (selectedTeachers.size === 0) {
      toast.error('الرجاء تحديد معلم واحد على الأقل', { icon: '⚠️' });
      return;
    }

    if (tableRows.length === 0) {
      toast.error('لا توجد إسنادات لإرسالها', { icon: '📭' });
      return;
    }

    // بناء رسالة واتساب شاملة
    let message = `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📚 *جدول الإسناد الشامل*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📊 *الإحصائيات:*\n`;
    message += `👨‍🏫 عدد المعلمين: ${stats.totalTeachers}\n`;
    message += `📖 عدد الحصص المسندة: ${stats.totalTeachingHours}\n`;
    message += `⏰ عدد حصص الانتظار: ${stats.totalWaitingHours}\n`;
    message += `\n━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*تفاصيل الإسناد:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // تجميع الإسنادات حسب المعلم المحدد
    const teacherGroups: { [key: string]: AssignmentTableRow[] } = {};
    tableRows.forEach(row => {
      // فقط المعلمين المحددين
      if (selectedTeachers.has(row.teacherId)) {
        if (!teacherGroups[row.teacherName]) {
          teacherGroups[row.teacherName] = [];
        }
        teacherGroups[row.teacherName].push(row);
      }
    });

    // إضافة تفاصيل كل معلم
    let teacherIndex = 1;
    Object.entries(teacherGroups).forEach(([teacherName, assignments]) => {
      const totalTeacherHours = assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
      const specialization = assignments[0].specialization;
      const waitingHours = assignments[0].waitingHours;

      message += `${teacherIndex}. 👤 *${teacherName}*\n`;
      message += `   🎓 التخصص: ${specialization}\n`;
      message += `   ⏰ نصاب الحصص: ${totalTeacherHours}\n`;
      message += `   ⌛ نصاب الانتظار: ${waitingHours}\n`;
      message += `   📚 المواد:\n`;
      
      assignments.forEach((assignment, idx) => {
        message += `      ${idx + 1}. ${assignment.subjectName} - ${assignment.grade}/${assignment.section}\n`;
      });
      
      message += `\n`;
      teacherIndex++;
    });

    message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📅 *التاريخ:* ${new Date().toLocaleDateString('ar-SA')}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `_تم إنشاء هذا التقرير تلقائياً من نظام MOTABEA_`;

    // فتح واتساب
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('تم فتح واتساب بنجاح', { icon: '✅' });
    
    // إغلاق وضع التحديد
    setShowWhatsAppSelection(false);
    setSelectedTeachers(new Set());
  };

  // معالجة حذف إسناد - مرتبطة مباشرة مع store
  const handleDeleteAssignment = (assignmentId: string, teacherName: string, subjectName: string) => {
    setSelectedAssignmentId(assignmentId);
    setShowDeleteDialog(true);
  };

  // تأكيد الحذف - يؤثر فوراً على الصفحة الرئيسية والجدول
  const confirmDelete = () => {
    if (selectedAssignmentId) {
      // الحذف من store المشترك - سينعكس تلقائياً على جميع الصفحات
      actions.deleteAssignment(selectedAssignmentId);
      toast.success('تم حذف الإسناد بنجاح', { icon: '🗑️' });
      setShowDeleteDialog(false);
      setSelectedAssignmentId(null);
      // الجدول سيتحدث تلقائياً لأن buildTableRows() يعتمد على state
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1920px] mx-auto flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* الرأس */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">جدول الإسناد</h1>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold transition-all"
                style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
              >
                <ArrowRight className="h-5 w-5" />
                <span>رجوع</span>
              </button>
            </div>
          </div>
        </div>

        {/* شريط الإحصائيات */}
        <div className="px-6 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>عدد المعلمين</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
              <div className="bg-green-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>عدد الحصص المسندة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTeachingHours}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Timer className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>عدد حصص الانتظار</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWaitingHours}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
              <div className="bg-purple-100 p-3 rounded-lg">
                <CalendarClock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>مجموع الحصص والانتظار</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAllHours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* شريط الأزرار */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 mb-4">
          {showWhatsAppSelection && (
            <div className="mb-3 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-blue-800 font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                اختر المعلمين:
              </span>
              <button
                onClick={selectAllTeachers}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all"
                style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
              >
                تحديد الكل
              </button>
              <button
                onClick={deselectAllTeachers}
                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-bold transition-all"
                style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
              >
                إلغاء التحديد
              </button>
              <button
                onClick={() => {
                  setShowWhatsAppSelection(false);
                  setSelectedTeachers(new Set());
                }}
                className="mr-auto px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-all"
                style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
              >
                إلغاء
              </button>
            </div>
          )}
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={handlePrintPDF}
              className="flex items-center justify-center px-4 py-3 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ 
                fontFamily: "'Noto Kufi Arabic', sans-serif",
                background: '#6366f1'
              }}
            >
              <Printer className="h-5 w-5 ml-2" />
              <span>طباعة PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center justify-center px-4 py-3 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ 
                fontFamily: "'Noto Kufi Arabic', sans-serif",
                background: '#6366f1'
              }}
            >
              <FileSpreadsheet className="h-5 w-5 ml-2" />
              <span>تصدير Excel</span>
            </button>

            <button
              onClick={handleExportHTML}
              className="flex items-center justify-center px-4 py-3 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ 
                fontFamily: "'Noto Kufi Arabic', sans-serif",
                background: '#6366f1'
              }}
            >
              <Code className="h-5 w-5 ml-2" />
              <span>تصدير HTML</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="flex items-center justify-center px-4 py-3 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ 
                fontFamily: "'Noto Kufi Arabic', sans-serif",
                background: showWhatsAppSelection ? '#10b981' : '#6366f1'
              }}
            >
              <Send className="h-5 w-5 ml-2" />
              <span>{showWhatsAppSelection ? 'إرسال للمحددين' : 'إرسال واتساب'}</span>
            </button>
          </div>
        </div>

        {/* الجدول */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {tableRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <BookOpen className="h-16 w-16 mb-4" />
              <p className="text-xl font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                لا توجد إسنادات حالياً
              </p>
              <p className="text-sm mt-2">قم بإضافة إسنادات من الصفحة الرئيسية</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr 
                    className="text-white"
                    style={{ background: '#818cf8' }}
                  >
                    {showWhatsAppSelection && (
                      <th className="px-4 py-4 text-center text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                        <input
                          type="checkbox"
                          checked={selectedTeachers.size === new Set(tableRows.map(r => r.teacherId)).size && tableRows.length > 0}
                          onChange={(e) => e.target.checked ? selectAllTeachers() : deselectAllTeachers()}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="px-4 py-4 text-center text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>التسلسل</th>
                    <th className="px-4 py-4 text-center text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>اسم المعلم</th>
                    <th className="px-4 py-4 text-center text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>التخصص</th>
                    <th className="px-4 py-4 text-center text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>المادة المسندة</th>
                    <th className="px-4 py-4 text-center text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>الصف/الفصل</th>
                    <th className="px-4 py-4 text-center text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>نصاب الحصص</th>
                    <th className="px-4 py-4 text-center text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>نصاب الانتظار</th>
                    <th className="px-4 py-4 text-center text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>المجموع</th>
                    <th className="px-4 py-4 text-center text-sm font-bold" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, index) => {
                    // حساب نصاب الحصص الإجمالي للمعلم
                    const teacherRows = tableRows.filter(r => r.teacherId === row.teacherId);
                    const teacherTotalTeachingHours = teacherRows.reduce((sum, r) => sum + r.hoursPerWeek, 0);
                    const teacherWaitingHours = row.waitingHours;
                    const totalHours = teacherTotalTeachingHours + teacherWaitingHours;
                    const isOverLimit = totalHours > 24;
                    return (
                    <tr 
                      key={row.id}
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      {showWhatsAppSelection && (
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedTeachers.has(row.teacherId)}
                            onChange={() => toggleTeacherSelection(row.teacherId)}
                            className="w-5 h-5 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                          {row.teacherName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {row.specialization}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                          {row.subjectName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {row.grade}/{row.section}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-blue-600">{row.hoursPerWeek}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-green-600">{row.waitingHours}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${
                          isOverLimit ? 'text-red-700 bg-red-100 px-2 py-1 rounded' : 'text-gray-900'
                        }`}>
                          {totalHours}
                          {isOverLimit && ' ⚠️'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteAssignment(row.assignmentId, row.teacherName, row.subjectName)}
                          className="inline-flex items-center justify-center p-2 hover:bg-gray-100 text-red-600 rounded-lg transition-all"
                          title="حذف الإسناد"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* الذيل */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200"
          style={{ 
            borderBottomLeftRadius: '1rem',
            borderBottomRightRadius: '1rem'
          }}
        >
          <p className="text-sm text-gray-600" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            إجمالي المعلمين: <span className="font-bold text-blue-600">{stats.totalTeachers}</span>
          </p>
        </div>
      </div>

      {/* مربع حوار الحذف الاحترافي */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div 
              className="px-6 py-5 border-b border-gray-200"
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    تأكيد حذف الإسناد
                  </h3>
                  <p className="text-white/90 text-sm mt-1">هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                <p className="text-red-800 font-bold flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>هل أنت متأكد من حذف هذا الإسناد؟</span>
                </p>
                <p className="text-red-600 text-sm mt-2">
                  سيتم حذف الإسناد بشكل نهائي من النظام
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  style={{ 
                    fontFamily: "'Noto Kufi Arabic', sans-serif",
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    <span>نعم، احذف الإسناد</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setSelectedAssignmentId(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-all"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <X className="w-5 h-5" />
                    <span>إلغاء</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentTablePage;
