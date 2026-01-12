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

interface WeeklyLateRecord {
  id: string;
  studentName: string;
  grade: string;
  classRoom: string;
  lateCount: number;
  lateDays: string[];
  totalLateMinutes: number;
  latePercentage: number;
}

const WeeklyLateReport = () => {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [supervisorNames, setSupervisorNames] = useState('أحمد محمد، خالد علي');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  // قائمة الصفوف والفصول
  const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const classes = ['أ', 'ب', 'ج', 'د'];

  // بيانات تجريبية
  const lateRecords: WeeklyLateRecord[] = [
    {
      id: '1',
      studentName: 'أحمد محمد علي',
      grade: 'الأول',
      classRoom: 'الأول أ',
      lateCount: 3,
      lateDays: ['الأحد 2024-12-22', 'الثلاثاء 2024-12-24', 'الأربعاء 2024-12-25'],
      totalLateMinutes: 45,
      latePercentage: 60
    },
    {
      id: '2',
      studentName: 'محمد عبدالله',
      grade: 'الأول',
      classRoom: 'الأول أ',
      lateCount: 2,
      lateDays: ['الاثنين 2024-12-23', 'الخميس 2024-12-26'],
      totalLateMinutes: 30,
      latePercentage: 40
    },
    {
      id: '3',
      studentName: 'عبدالعزيز سعد',
      grade: 'الثاني',
      classRoom: 'الثاني ب',
      lateCount: 1,
      lateDays: ['الأحد 2024-12-22'],
      totalLateMinutes: 10,
      latePercentage: 20
    }
  ];

  const filteredRecords = lateRecords.filter(record => {
    const matchesSearch = record.studentName.includes(searchTerm);
    const matchesGrade = !selectedGrade || record.grade === selectedGrade;
    const matchesClass = !selectedClass || record.classRoom.includes(selectedClass);
    return matchesSearch && matchesGrade && matchesClass;
  });

  const totalLateStudents = filteredRecords.length;
  const totalStudents = 150;
  const latePercentage = ((totalLateStudents / totalStudents) * 100).toFixed(1);

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handlePrint = () => {
    // منطق الطباعة الذكي
    if (selectedStudents.length > 0) {
      console.log('طباعة تقرير للطلاب المحددين:', selectedStudents);
    } else {
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
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">التقرير الأسبوعي للتأخر</h1>
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
          <h2 className="text-lg font-bold text-gray-900 mb-4">إحصائية التأخر الأسبوعي</h2>
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

        {/* اختيار الأسبوع والموظفين والتصفية */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">خيارات التقرير</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 ml-1" />
                الأسبوع الدراسي
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              >
                <option value="1">الأسبوع الأول</option>
                <option value="2">الأسبوع الثاني</option>
                <option value="3">الأسبوع الثالث</option>
                <option value="4">الأسبوع الرابع</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 ml-1" />
                الموظفون المسؤولون
              </label>
              <input
                type="text"
                value={supervisorNames}
                onChange={(e) => setSupervisorNames(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              />
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
                  setSelectedClass('');
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
            <h2 className="text-lg font-bold text-gray-800">تفاصيل التأخر الأسبوعي</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1]">
                <tr>
                  <th className="px-4 py-4 text-right text-sm font-bold text-white">
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
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">اسم الطالب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">الصف والفصل</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">عدد التأخر</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">أيام التأخر</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">مقدار التأخر</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">نسبة التأخر</th>
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
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        {record.lateCount} مرات
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        {record.lateDays.map((day, index) => (
                          <div key={index} className="text-xs">{day}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        {record.totalLateMinutes} دقيقة
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {record.latePercentage}%
                      </span>
                    </td>
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
    </div>
  );
};

export default WeeklyLateReport;
