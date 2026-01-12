import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  TrendingDown,
  Printer,
  Send,
  Search,
  ArrowRight,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AbsenceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classRoom: string;
  grade: string;
  date: string;
  absenceType: 'excused' | 'unexcused' | 'none';
  recordedBy: string;
}

const AbsenceDailyReport = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // بيانات تجريبية
  const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const classes = ['أ', 'ب', 'ج', 'جميع الفصول'];
  const totalStudents = 450;
  const recordedBy = 'أحمد المحمدي';

  // سجلات الغياب التجريبية - نستخدم تاريخ اليوم الحالي
  const today = new Date().toISOString().split('T')[0];
  
  const absenceRecords: AbsenceRecord[] = [
    {
      id: '1',
      studentId: '2024001',
      studentName: 'أحمد محمد علي',
      classRoom: 'الأول أ',
      grade: 'الأول',
      date: today,
      absenceType: 'excused',
      recordedBy: 'أحمد المحمدي'
    },
    {
      id: '2',
      studentId: '2024015',
      studentName: 'محمد عبدالله سعد',
      classRoom: 'الثاني ب',
      grade: 'الثاني',
      date: today,
      absenceType: 'unexcused',
      recordedBy: 'أحمد المحمدي'
    },
    {
      id: '3',
      studentId: '2024032',
      studentName: 'عبدالعزيز خالد',
      classRoom: 'الثالث أ',
      grade: 'الثالث',
      date: today,
      absenceType: 'none',
      recordedBy: 'أحمد المحمدي'
    },
    {
      id: '4',
      studentId: '2024045',
      studentName: 'فيصل سعود',
      classRoom: 'الأول ب',
      grade: 'الأول',
      date: today,
      absenceType: 'excused',
      recordedBy: 'أحمد المحمدي'
    },
    {
      id: '5',
      studentId: '2024058',
      studentName: 'سلطان عبدالرحمن',
      classRoom: 'الثاني أ',
      grade: 'الثاني',
      date: today,
      absenceType: 'unexcused',
      recordedBy: 'أحمد المحمدي'
    },
    {
      id: '6',
      studentId: '2024067',
      studentName: 'عبدالله فهد',
      classRoom: 'الثالث ب',
      grade: 'الثالث',
      date: today,
      absenceType: 'excused',
      recordedBy: 'أحمد المحمدي'
    },
    {
      id: '7',
      studentId: '2024089',
      studentName: 'خالد ماجد',
      classRoom: 'الرابع أ',
      grade: 'الرابع',
      date: today,
      absenceType: 'unexcused',
      recordedBy: 'أحمد المحمدي'
    },
    {
      id: '8',
      studentId: '2024102',
      studentName: 'سعد إبراهيم',
      classRoom: 'الخامس أ',
      grade: 'الخامس',
      date: today,
      absenceType: 'none',
      recordedBy: 'أحمد المحمدي'
    }
  ];

  // الحصول على اسم اليوم بالعربية
  const getArabicDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  // فلترة السجلات
  const filteredRecords = absenceRecords.filter(record => {
    const matchesDate = record.date === selectedDate;
    const matchesGrade = !selectedGrade || record.grade === selectedGrade;
    const matchesClass = !selectedClass || selectedClass === 'جميع الفصول' || record.classRoom.includes(selectedClass);
    const matchesSearch = !searchTerm || 
      record.studentName.includes(searchTerm) || 
      record.studentId.includes(searchTerm);
    
    return matchesDate && matchesGrade && matchesClass && matchesSearch;
  });

  // الإحصائيات
  const absentWithExcuse = filteredRecords.filter(r => r.absenceType === 'excused').length;
  const absentWithoutExcuse = filteredRecords.filter(r => r.absenceType === 'unexcused').length;
  const absentUnspecified = filteredRecords.filter(r => r.absenceType === 'none').length;
  const totalAbsent = filteredRecords.length;
  const absenceRate = totalStudents > 0 ? ((totalAbsent / totalStudents) * 100).toFixed(1) : '0';

  // طباعة التقرير
  const handlePrint = () => {
    window.print();
  };

  // إرسال التقرير عبر واتساب
  const handleSendReport = () => {
    alert('سيتم تطوير ميزة الإرسال عبر واتساب قريباً');
  };

  // تصدير PDF
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-kufi" style={{ direction: 'rtl' }}>
      {/* شريط العنوان */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">التقرير اليومي للغياب</h1>
              <p className="text-sm text-gray-600">
                {getArabicDayName(selectedDate)} - {new Date(selectedDate).toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/student-affairs/absence-tracking')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
          >
            <ArrowRight className="h-5 w-5" />
            <span>رجوع</span>
          </button>
        </div>
      </div>

      {/* شريط الإحصائيات */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">إحصائية الغياب اليومي</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-blue-700 text-sm font-medium">عدد الطلاب</p>
                <p className="text-3xl font-bold text-blue-900">{totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl shadow-md">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-green-700 text-sm font-medium">غائب بعذر</p>
                <p className="text-3xl font-bold text-green-900">{absentWithExcuse}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border-2 border-red-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl shadow-md">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-red-700 text-sm font-medium">غائب بدون عذر</p>
                <p className="text-3xl font-bold text-red-900">{absentWithoutExcuse}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl shadow-md">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-purple-700 text-sm font-medium">نسبة الغياب</p>
                <p className="text-3xl font-bold text-purple-900">{absenceRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-orange-700 text-sm font-medium">إجمالي الغائبين</p>
                <p className="text-3xl font-bold text-orange-900">{totalAbsent}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* معلومات الموظف */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-[#6366f1] rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700">
          <span className="text-[#4f46e5] font-bold">الموظف المسؤول عن الرصد:</span> {recordedBy}
        </p>
      </div>

      {/* أدوات البحث والفلترة */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">البحث والتصفية</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 ml-1" />
              التاريخ
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الصف</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
            >
              <option value="">جميع الصفوف</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الفصل</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
            >
              <option value="">اختر الفصل</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="inline h-4 w-4 ml-1" />
              بحث
            </label>
            <input
              type="text"
              placeholder="اسم الطالب أو الرقم"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* أزرار الإجراءات */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md"
          >
            <Printer className="h-5 w-5" />
            طباعة التقرير
          </button>
          
          <button
            onClick={handleSendReport}
            className="flex items-center gap-2 bg-gradient-to-r from-[#6366f1] to-[#818cf8] hover:from-[#4f46e5] hover:to-[#6366f1] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md"
          >
            <Send className="h-5 w-5" />
            إرسال عبر واتساب
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md"
          >
            <Download className="h-5 w-5" />
            تصدير PDF
          </button>
        </div>
      </div>

      {/* جدول الغائبين */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">قائمة الطلاب الغائبين</h2>
          <p className="text-sm text-gray-600">عدد السجلات: {filteredRecords.length}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold">#</th>
                <th className="px-6 py-4 text-right text-sm font-bold">رقم الطالب</th>
                <th className="px-6 py-4 text-right text-sm font-bold">اسم الطالب</th>
                <th className="px-6 py-4 text-right text-sm font-bold">الصف والفصل</th>
                <th className="px-6 py-4 text-right text-sm font-bold">يوم الغياب</th>
                <th className="px-6 py-4 text-right text-sm font-bold">نوع الغياب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{record.studentId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-bold">{record.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{record.classRoom}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {getArabicDayName(record.date)} - {new Date(record.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {record.absenceType === 'excused' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 ml-1" />
                          بعذر
                        </span>
                      )}
                      {record.absenceType === 'unexcused' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <XCircle className="h-4 w-4 ml-1" />
                          بدون عذر
                        </span>
                      )}
                      {record.absenceType === 'none' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          <FileText className="h-4 w-4 ml-1" />
                          غير محدد
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-16 w-16 text-gray-300" />
                      <p className="text-xl font-bold text-gray-400">لا توجد سجلات غياب لهذا اليوم</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AbsenceDailyReport;
