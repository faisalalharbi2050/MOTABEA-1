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

interface WeeklyAbsenceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classRoom: string;
  grade: string;
  absenceDays: Array<{
    date: string;
    day: string;
    absenceType: 'excused' | 'unexcused' | 'none';
    recordedBy: string;
  }>;
  totalAbsenceDays: number;
  absenceRate: number;
}

const AbsenceWeeklyReport = () => {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // بيانات تجريبية
  const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const classes = ['أ', 'ب', 'ج', 'جميع الفصول'];
  const weeks = Array.from({ length: 18 }, (_, i) => ({ value: `${i + 1}`, label: `الأسبوع ${i + 1}` }));
  const totalStudents = 450;
  const schoolDaysInWeek = 5;

  // سجلات الغياب الأسبوعية التجريبية
  const weeklyRecords: WeeklyAbsenceRecord[] = [
    {
      id: '1',
      studentId: '2024001',
      studentName: 'أحمد محمد علي',
      classRoom: 'الأول أ',
      grade: 'الأول',
      absenceDays: [
        { date: '2024-01-01', day: 'الأحد', absenceType: 'excused', recordedBy: 'أحمد المحمدي' },
        { date: '2024-01-03', day: 'الثلاثاء', absenceType: 'excused', recordedBy: 'أحمد المحمدي' }
      ],
      totalAbsenceDays: 2,
      absenceRate: 40
    },
    {
      id: '2',
      studentId: '2024015',
      studentName: 'محمد عبدالله سعد',
      classRoom: 'الثاني ب',
      grade: 'الثاني',
      absenceDays: [
        { date: '2024-01-02', day: 'الاثنين', absenceType: 'unexcused', recordedBy: 'أحمد المحمدي' }
      ],
      totalAbsenceDays: 1,
      absenceRate: 20
    },
    {
      id: '3',
      studentId: '2024032',
      studentName: 'عبدالعزيز خالد',
      classRoom: 'الثالث أ',
      grade: 'الثالث',
      absenceDays: [
        { date: '2024-01-01', day: 'الأحد', absenceType: 'none', recordedBy: 'أحمد المحمدي' },
        { date: '2024-01-02', day: 'الاثنين', absenceType: 'unexcused', recordedBy: 'محمد السعيد' },
        { date: '2024-01-04', day: 'الأربعاء', absenceType: 'excused', recordedBy: 'أحمد المحمدي' }
      ],
      totalAbsenceDays: 3,
      absenceRate: 60
    },
    {
      id: '4',
      studentId: '2024045',
      studentName: 'فيصل سعود',
      classRoom: 'الأول ب',
      grade: 'الأول',
      absenceDays: [
        { date: '2024-01-03', day: 'الثلاثاء', absenceType: 'excused', recordedBy: 'أحمد المحمدي' },
        { date: '2024-01-04', day: 'الأربعاء', absenceType: 'excused', recordedBy: 'أحمد المحمدي' },
        { date: '2024-01-05', day: 'الخميس', absenceType: 'excused', recordedBy: 'محمد السعيد' }
      ],
      totalAbsenceDays: 3,
      absenceRate: 60
    }
  ];

  // فلترة السجلات
  const filteredRecords = weeklyRecords.filter(record => {
    const matchesGrade = !selectedGrade || record.grade === selectedGrade;
    const matchesClass = !selectedClass || selectedClass === 'جميع الفصول' || record.classRoom.includes(selectedClass);
    const matchesSearch = !searchTerm || 
      record.studentName.includes(searchTerm) || 
      record.studentId.includes(searchTerm);
    
    return matchesGrade && matchesClass && matchesSearch;
  });

  // الإحصائيات
  const totalAbsent = filteredRecords.length;
  const absentWithExcuse = filteredRecords.reduce((sum, record) => {
    return sum + record.absenceDays.filter(d => d.absenceType === 'excused').length;
  }, 0);
  const absentWithoutExcuse = filteredRecords.reduce((sum, record) => {
    return sum + record.absenceDays.filter(d => d.absenceType === 'unexcused').length;
  }, 0);
  const totalAbsenceDays = filteredRecords.reduce((sum, record) => sum + record.totalAbsenceDays, 0);
  const absenceRate = totalStudents > 0 ? ((totalAbsenceDays / (totalStudents * schoolDaysInWeek)) * 100).toFixed(1) : '0';

  // الحصول على جميع الموظفين المسؤولين
  const getRecordedByStaff = () => {
    const staffSet = new Set<string>();
    filteredRecords.forEach(record => {
      record.absenceDays.forEach(day => {
        staffSet.add(day.recordedBy);
      });
    });
    return Array.from(staffSet).join(' - ');
  };

  // تحديد/إلغاء تحديد طالب
  const toggleStudentSelection = (studentId: string) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudents(newSet);
  };

  // طباعة التقرير
  const handlePrint = () => {
    if (selectedStudents.size > 0) {
      // طباعة الطلاب المحددين فقط
      console.log('طباعة تقرير للطلاب المحددين:', Array.from(selectedStudents));
    }
    window.print();
  };

  // إرسال التقرير
  const handleSendReport = () => {
    alert('سيتم تطوير ميزة الإرسال عبر واتساب قريباً');
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
              <h1 className="text-2xl font-bold text-gray-900">التقرير الأسبوعي للغياب</h1>
              <p className="text-sm text-gray-600">
                {weeks.find(w => w.value === selectedWeek)?.label}
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
        <h2 className="text-lg font-bold text-gray-800 mb-4">إحصائية الغياب الأسبوعي</h2>
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
                <p className="text-orange-700 text-sm font-medium">إجمالي الأيام</p>
                <p className="text-3xl font-bold text-orange-900">{totalAbsenceDays}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* معلومات الموظفين */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-[#6366f1] rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700">
          <span className="text-[#4f46e5] font-bold">الموظفون المسؤولون عن الرصد:</span> {getRecordedByStaff()}
        </p>
      </div>

      {/* أدوات البحث والفلترة */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">البحث والتصفية</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 ml-1" />
              الأسبوع
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
            >
              {weeks.map(week => (
                <option key={week.value} value={week.value}>{week.label}</option>
              ))}
            </select>
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
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md"
          >
            <Printer className="h-5 w-5" />
            {selectedStudents.size > 0 ? `طباعة (${selectedStudents.size} طلاب)` : 'طباعة التقرير'}
          </button>
          
          <button
            onClick={handleSendReport}
            className="flex items-center gap-2 bg-gradient-to-r from-[#6366f1] to-[#818cf8] hover:from-[#4f46e5] hover:to-[#6366f1] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md"
          >
            <Send className="h-5 w-5" />
            إرسال عبر واتساب
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md"
          >
            <Download className="h-5 w-5" />
            تصدير PDF
          </button>

          {selectedStudents.size > 0 && (
            <button
              onClick={() => setSelectedStudents(new Set())}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all"
            >
              إلغاء التحديد
            </button>
          )}
        </div>
      </div>

      {/* جدول الغائبين */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">قائمة الطلاب الغائبين خلال الأسبوع</h2>
          <p className="text-sm text-gray-600">عدد السجلات: {filteredRecords.length}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === filteredRecords.length && filteredRecords.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents(new Set(filteredRecords.map(r => r.id)));
                      } else {
                        setSelectedStudents(new Set());
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold">رقم الطالب</th>
                <th className="px-6 py-4 text-right text-sm font-bold">اسم الطالب</th>
                <th className="px-6 py-4 text-right text-sm font-bold">الصف والفصل</th>
                <th className="px-6 py-4 text-right text-sm font-bold">عدد أيام الغياب</th>
                <th className="px-6 py-4 text-right text-sm font-bold">يوم وتاريخ الغياب</th>
                <th className="px-6 py-4 text-right text-sm font-bold">نوع الغياب</th>
                <th className="px-6 py-4 text-right text-sm font-bold">نسبة الغياب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(record.id)}
                        onChange={() => toggleStudentSelection(record.id)}
                        className="w-4 h-4 text-[#4f46e5] rounded focus:ring-[#4f46e5]"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{record.studentId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-bold">{record.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{record.classRoom}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                        {record.totalAbsenceDays} {record.totalAbsenceDays === 1 ? 'يوم' : 'أيام'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="space-y-1">
                        {record.absenceDays.map((day, idx) => (
                          <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                            {day.day} - {new Date(day.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        {record.absenceDays.map((day, idx) => (
                          <div key={idx}>
                            {day.absenceType === 'excused' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                بعذر
                              </span>
                            )}
                            {day.absenceType === 'unexcused' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                بدون عذر
                              </span>
                            )}
                            {day.absenceType === 'none' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                غير محدد
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800">
                        {record.absenceRate}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-16 w-16 text-gray-300" />
                      <p className="text-xl font-bold text-gray-400">لا توجد سجلات غياب لهذا الأسبوع</p>
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

export default AbsenceWeeklyReport;
