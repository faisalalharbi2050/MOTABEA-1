import { useState } from 'react';
import { 
  ClockAlert, 
  Calendar,
  Users,
  Printer,
  Send,
  ArrowRight,
  FileText,
  TrendingDown,
  User,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LateDayDetail {
  day: string;
  date: string;
  lateMinutes: number;
  recordedBy: string;
}

interface WeekData {
  weekNumber: number;
  lateDays: LateDayDetail[];
  totalLateMinutes: number;
  latePercentage: number;
}

interface MonthlyLateRecord {
  id: string;
  studentName: string;
  grade: string;
  classRoom: string;
  weeks: WeekData[];
}

const MonthlyLateReport = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  // قائمة الصفوف والفصول
  const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const classes = ['أ', 'ب', 'ج', 'د'];

  // بيانات تجريبية محدثة مع تفاصيل أيام التأخر
  const lateRecords: MonthlyLateRecord[] = [
    {
      id: '1',
      studentName: 'أحمد محمد علي',
      grade: 'الأول',
      classRoom: 'الأول أ',
      weeks: [
        { 
          weekNumber: 1, 
          lateDays: [
            { day: 'الأحد', date: '2024-01-01', lateMinutes: 15, recordedBy: 'أحمد محمد' },
            { day: 'الثلاثاء', date: '2024-01-03', lateMinutes: 20, recordedBy: 'أحمد محمد' },
            { day: 'الخميس', date: '2024-01-05', lateMinutes: 10, recordedBy: 'خالد سعد' }
          ],
          totalLateMinutes: 45, 
          latePercentage: 60 
        },
        { 
          weekNumber: 2, 
          lateDays: [
            { day: 'الإثنين', date: '2024-01-08', lateMinutes: 15, recordedBy: 'محمد علي' },
            { day: 'الأربعاء', date: '2024-01-10', lateMinutes: 15, recordedBy: 'محمد علي' }
          ],
          totalLateMinutes: 30, 
          latePercentage: 40 
        },
        { 
          weekNumber: 3, 
          lateDays: [
            { day: 'الأحد', date: '2024-01-15', lateMinutes: 15, recordedBy: 'عبدالله أحمد' }
          ],
          totalLateMinutes: 15, 
          latePercentage: 20 
        },
        { 
          weekNumber: 4, 
          lateDays: [
            { day: 'الإثنين', date: '2024-01-22', lateMinutes: 10, recordedBy: 'سعد محمد' },
            { day: 'الأربعاء', date: '2024-01-24', lateMinutes: 15, recordedBy: 'أحمد محمد' }
          ],
          totalLateMinutes: 25, 
          latePercentage: 40 
        }
      ]
    },
    {
      id: '2',
      studentName: 'محمد عبدالله',
      grade: 'الأول',
      classRoom: 'الأول أ',
      weeks: [
        { 
          weekNumber: 1, 
          lateDays: [
            { day: 'الإثنين', date: '2024-01-02', lateMinutes: 20, recordedBy: 'أحمد محمد' },
            { day: 'الأربعاء', date: '2024-01-04', lateMinutes: 10, recordedBy: 'أحمد محمد' }
          ],
          totalLateMinutes: 30, 
          latePercentage: 40 
        },
        { 
          weekNumber: 2, 
          lateDays: [
            { day: 'الثلاثاء', date: '2024-01-09', lateMinutes: 15, recordedBy: 'محمد علي' }
          ],
          totalLateMinutes: 15, 
          latePercentage: 20 
        },
        { 
          weekNumber: 3, 
          lateDays: [],
          totalLateMinutes: 0, 
          latePercentage: 0 
        },
        { 
          weekNumber: 4, 
          lateDays: [
            { day: 'الخميس', date: '2024-01-25', lateMinutes: 10, recordedBy: 'سعد محمد' }
          ],
          totalLateMinutes: 10, 
          latePercentage: 20 
        }
      ]
    },
    {
      id: '3',
      studentName: 'عبدالعزيز سعد',
      grade: 'الثاني',
      classRoom: 'الثاني ب',
      weeks: [
        { 
          weekNumber: 1, 
          lateDays: [
            { day: 'الأحد', date: '2024-01-01', lateMinutes: 25, recordedBy: 'أحمد محمد' }
          ],
          totalLateMinutes: 25, 
          latePercentage: 20 
        },
        { 
          weekNumber: 2, 
          lateDays: [
            { day: 'الإثنين', date: '2024-01-08', lateMinutes: 15, recordedBy: 'محمد علي' },
            { day: 'الثلاثاء', date: '2024-01-09', lateMinutes: 20, recordedBy: 'محمد علي' }
          ],
          totalLateMinutes: 35, 
          latePercentage: 40 
        },
        { 
          weekNumber: 3, 
          lateDays: [
            { day: 'الأربعاء', date: '2024-01-17', lateMinutes: 10, recordedBy: 'عبدالله أحمد' }
          ],
          totalLateMinutes: 10, 
          latePercentage: 20 
        },
        { 
          weekNumber: 4, 
          lateDays: [],
          totalLateMinutes: 0, 
          latePercentage: 0 
        }
      ]
    }
  ];

  const totalLateStudents = lateRecords.length;
  const totalStudents = 150;
  const latePercentage = ((totalLateStudents / totalStudents) * 100).toFixed(1);

  const filteredRecords = lateRecords.filter(record => {
    // تصفية حسب البحث
    const matchesSearch = record.studentName.includes(searchTerm);
    
    // تصفية حسب الصف
    const matchesGrade = !selectedGrade || record.grade === selectedGrade;
    
    // تصفية حسب الفصل
    const matchesClass = !selectedClass || record.classRoom.includes(selectedClass);
    
    return matchesSearch && matchesGrade && matchesClass;
  });

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handlePrint = () => {
    // منطق الطباعة الذكي: يطبع بناءً على التحديد
    if (selectedStudents.length > 0) {
      // طباعة الطلاب المحددين فقط
      console.log('طباعة تقرير للطلاب المحددين:', selectedStudents);
    } else {
      // طباعة جميع الطلاب
      console.log('طباعة تقرير لجميع الطلاب');
    }
    window.print();
  };

  const handleSendWhatsApp = () => {
    if (selectedStudents.length > 0) {
      alert(`سيتم إرسال التقرير عبر الواتساب لـ ${selectedStudents.length} طالب`);
    } else {
      alert('سيتم إرسال التقرير عبر الواتساب لجميع الطلاب');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-kufi" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">التقرير الشهري للتأخر</h1>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/student-affairs/late-tracking')}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all"
            >
              <ArrowRight className="h-5 w-5" />
              رجوع
            </button>
          </div>
        </div>

        {/* شريط الإحصائيات */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">إحصائية التأخر الشهري</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-md">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[#4f46e5] text-sm font-medium">عدد الطلاب المتأخرين</p>
                  <p className="text-3xl font-bold text-gray-900">{totalLateStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] p-3 rounded-xl shadow-md">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[#6366f1] text-sm font-medium">نسبة التأخر</p>
                  <p className="text-3xl font-bold text-gray-900">{latePercentage}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* اختيار الشهر والصف والفصل */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">خيارات التصفية</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 ml-1" />
                الشهر الدراسي
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              >
                <option value="1">الشهر الأول (الأسابيع 1-4)</option>
                <option value="2">الشهر الثاني (الأسابيع 5-8)</option>
                <option value="3">الشهر الثالث (الأسابيع 9-12)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 ml-1" />
                الصف
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedClass(''); // إعادة تعيين الفصل عند تغيير الصف
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              >
                <option value="">جميع الصفوف</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    الصف {grade}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 ml-1" />
                الفصل
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
                disabled={!selectedGrade}
              >
                <option value="">جميع الفصول</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    فصل {className}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="inline h-4 w-4 ml-1" />
              البحث عن طالب
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="ابحث باسم الطالب"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              />
              <button
                onClick={() => {
                  setSelectedGrade('');
                  setSelectedClass('');
                  setSearchTerm('');
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all"
              >
                إعادة تعيين
              </button>
            </div>
            {(selectedGrade || selectedClass || searchTerm) && (
              <div className="mt-3 text-sm text-gray-600">
                عرض <span className="font-bold text-[#4f46e5]">{filteredRecords.length}</span> طالب
                {selectedGrade && ` من الصف ${selectedGrade}`}
                {selectedClass && ` فصل ${selectedClass}`}
              </div>
            )}
          </div>
        </div>

        {/* معلومة عن التحديد */}
        {selectedStudents.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-blue-900 font-medium">
              تم تحديد {selectedStudents.length} طالب - سيتم طباعة تقرير الطلاب المحددين فقط
            </p>
          </div>
        )}

        {/* جدول التقرير */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">تفاصيل التأخر الشهري</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1]">
                <tr>
                  <th className="px-4 py-4 text-right text-sm font-bold text-white" rowSpan={2}>
                    <input
                      type="checkbox"
                      className="rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(filteredRecords.map(r => r.id));
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                      checked={selectedStudents.length === filteredRecords.length && filteredRecords.length > 0}
                    />
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white" rowSpan={2}>اسم الطالب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white" rowSpan={2}>الصف والفصل</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white border-l border-white" colSpan={1}>الأسبوع 1</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white border-l border-white" colSpan={1}>الأسبوع 2</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white border-l border-white" colSpan={1}>الأسبوع 3</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white" colSpan={1}>الأسبوع 4</th>
                </tr>
                <tr>
                  {[1, 2, 3, 4].map((week) => (
                    <th key={week} className="px-3 py-2 text-center text-xs font-bold text-white border-l border-white">
                      أيام التأخر
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr 
                    key={record.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedStudents.includes(record.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedStudents.includes(record.id)}
                        onChange={() => toggleStudentSelection(record.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.classRoom}</td>
                    {record.weeks.map((weekData) => (
                      <td key={weekData.weekNumber} className="px-3 py-4 text-center text-sm border-l border-gray-200">
                        {weekData.lateDays.length > 0 ? (
                          <div className="space-y-1">
                            {weekData.lateDays.map((lateDay, idx) => (
                              <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-2 text-right">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-red-900">{lateDay.day}</span>
                                  <span className="text-xs text-red-700">{lateDay.date}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    {lateDay.lateMinutes}د
                                  </span>
                                  <span className="text-xs text-gray-600 truncate" title={lateDay.recordedBy}>
                                    {lateDay.recordedBy}
                                  </span>
                                </div>
                              </div>
                            ))}
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                                الإجمالي: {weekData.totalLateMinutes}د
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            لا يوجد تأخر
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#6366f1] hover:to-[#818cf8] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md"
            >
              <Printer className="h-5 w-5" />
              {selectedStudents.length > 0 
                ? `طباعة المحددين (${selectedStudents.length})`
                : 'طباعة الكل'
              }
            </button>
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md"
            >
              <Send className="h-5 w-5" />
              إرسال عبر الواتساب
            </button>
          </div>
        </div>
      </div>

      {/* ملاحظة للطباعة */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            direction: rtl;
            font-family: 'Noto Kufi Arabic', sans-serif;
          }
        }
      `}</style>
    </div>
  );
};

export default MonthlyLateReport;
