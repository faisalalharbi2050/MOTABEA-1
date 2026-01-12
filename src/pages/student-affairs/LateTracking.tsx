import { useState } from 'react';
import { 
  ClockAlert, 
  Search, 
  Link as LinkIcon, 
  Clock, 
  AlertCircle,
  Printer,
  Send,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  ChevronDown,
  Plus,
  Save,
  Edit,
  ArrowRight,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LateDailyReportPrint from '../../components/student-affairs/LateDailyReportPrint';
import {
  calculateLateMinutes,
  generateGuardianMessage,
  generateAccessToken,
  calculateLinkExpiry,
  type LateRecord
} from '../../utils/studentAffairsUtils';

interface Student {
  id: string;
  name: string;
  studentId: string;
  classRoom: string;
  grade: string;
  phone: string;
  guardianPhone: string;
}

const LateTracking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [lateRecords, setLateRecords] = useState<LateRecord[]>([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkExpiry, setLinkExpiry] = useState<Date | null>(null);
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const [showLateTrackingModal, setShowLateTrackingModal] = useState(false);
  const [modalGrade, setModalGrade] = useState('');
  const [modalClass, setModalClass] = useState('');
  const [modalStudentId, setModalStudentId] = useState('');
  const [modalShowAllStudents, setModalShowAllStudents] = useState(true);
  const [modalArrivalTimes, setModalArrivalTimes] = useState<Record<string, string>>({});
  const [searchMode, setSearchMode] = useState<'class' | 'name'>('class');
  const [studentNameSearch, setStudentNameSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [showSendMessagesModal, setShowSendMessagesModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'class' | 'student'>('all');

  // بيانات تجريبية للفصول
  const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const classes = ['أ', 'ب', 'ج'];
  
  // دالة لتوليد رقم الفصل (مثال: الأول أ -> 1-1)
  const getClassNumber = (grade: string, className: string) => {
    const gradeNumber = grades.indexOf(grade) + 1;
    const classIndex = classes.indexOf(className) + 1;
    return `${classIndex}-${gradeNumber}`;
  };
  
  // دالة للحصول على اسم اليوم بالعربية
  const getArabicDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  // بيانات تجريبية للطلاب
  const students: Student[] = [
    {
      id: '1',
      name: 'أحمد محمد علي',
      studentId: '2024001',
      classRoom: 'الأول أ',
      grade: 'الأول',
      phone: '0501234567',
      guardianPhone: '0501234568'
    },
    {
      id: '2',
      name: 'محمد عبدالله',
      studentId: '2024002',
      classRoom: 'الأول أ',
      grade: 'الأول',
      phone: '0501234569',
      guardianPhone: '0501234570'
    },
    {
      id: '3',
      name: 'عبدالعزيز سعد',
      studentId: '2024003',
      classRoom: 'الثاني ب',
      grade: 'الثاني',
      phone: '0501234571',
      guardianPhone: '0501234572'
    }
  ];

  // حساب وقت البداية المفترض (7:00 صباحاً)
  const expectedArrivalTime = '07:00';

  // تسجيل تأخر طالب
  const recordLateStudent = (student: Student, arrivalTime: string) => {
    const lateMinutes = calculateLateMinutes(arrivalTime, expectedArrivalTime);
    
    if (lateMinutes > 0) {
      const newRecord: LateRecord = {
        id: Date.now().toString(),
        studentId: student.id,
        studentName: student.name,
        classRoom: student.classRoom,
        arrivalTime,
        lateMinutes,
        date: selectedDate,
        status: 'pending'
      };
      
      setLateRecords(prev => [...prev, newRecord]);
      
      // إرسال إشعار لولي الأمر
      sendGuardianNotification(student, arrivalTime, lateMinutes);
    }
  };

  // إرسال إشعار لولي الأمر
  const sendGuardianNotification = async (student: Student, arrivalTime: string, lateMinutes: number) => {
    const message = generateGuardianMessage(student.name, arrivalTime, lateMinutes, selectedDate);
    // هنا يتم الاتصال بـ API لإرسال رسالة واتساب/SMS
    console.log(`إرسال إشعار لولي أمر ${student.name}`);
    console.log(message);
  };

  // توليد رابط وصول سريع
  const generateQuickAccessLink = () => {
    const token = generateAccessToken();
    const link = `${window.location.origin}/quick-late-tracking/${token}`;
    const expiry = calculateLinkExpiry();
    
    setGeneratedLink(link);
    setLinkExpiry(expiry);
    
    // حفظ الرابط في قاعدة البيانات مع وقت انتهاء الصلاحية
    console.log('تم توليد رابط الوصول السريع:', link);
  };

  // نسخ الرابط للحافظة
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('تم نسخ الرابط للحافظة');
  };

  // طباعة إحصائية التأخر اليومية
  const printDailyReport = () => {
    window.print();
  };

  // تقارير التأخر
  const generateDailyReport = () => {
    navigate('/dashboard/student-affairs/daily-late-report');
    setShowReportsMenu(false);
  };

  const generateWeeklyReport = () => {
    navigate('/dashboard/student-affairs/weekly-late-report');
    setShowReportsMenu(false);
  };

  const generateMonthlyReport = () => {
    navigate('/dashboard/student-affairs/monthly-late-report');
    setShowReportsMenu(false);
  };

  // دوال نافذة رصد التأخر
  const handleRecordLateClick = (studentId: string) => {
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setModalArrivalTimes(prev => ({
      ...prev,
      [studentId]: currentTime
    }));
  };

  const handleSaveLateRecords = () => {
    const filteredModalStudents = getFilteredModalStudents();
    filteredModalStudents.forEach(student => {
      const arrivalTime = modalArrivalTimes[student.id];
      if (arrivalTime) {
        recordLateStudent(student, arrivalTime);
      }
    });
    // إعادة تعيين وإغلاق النافذة
    setModalArrivalTimes({});
    setShowLateTrackingModal(false);
    setModalGrade('');
    setModalClass('');
    setModalStudentId('');
    setModalShowAllStudents(true);
    setSearchMode('class');
    setStudentNameSearch('');
    setSelectedStudentIds(new Set());
  };

  const handleEditArrivalTime = (studentId: string, newTime: string) => {
    setModalArrivalTimes(prev => ({
      ...prev,
      [studentId]: newTime
    }));
  };

  const getFilteredModalStudents = () => {
    if (searchMode === 'name') {
      // البحث بالاسم
      if (!studentNameSearch.trim()) {
        return [];
      }
      const searchResults = students.filter(student => 
        student.name.includes(studentNameSearch.trim())
      );
      // إذا تم تحديد طلاب معينين، أظهر المحددين فقط
      if (selectedStudentIds.size > 0) {
        return searchResults.filter(s => selectedStudentIds.has(s.id));
      }
      return searchResults;
    } else {
      // البحث بالصف والفصل
      return students.filter(student => {
        const matchesGrade = !modalGrade || student.grade === modalGrade;
        const matchesClass = !modalClass || student.classRoom.includes(modalClass);
        const matchesStudent = modalShowAllStudents || student.id === modalStudentId;
        return matchesGrade && matchesClass && matchesStudent;
      });
    }
  };

  // دوال نافذة إرسال الرسائل
  const [sendMessageType, setSendMessageType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dailyMessage, setDailyMessage] = useState('');
  const [weeklyMessage, setWeeklyMessage] = useState('');
  const [monthlyMessage, setMonthlyMessage] = useState('');
  const [sendImmediately, setSendImmediately] = useState(true);
  const [scheduledTime, setScheduledTime] = useState('');
  const [attachPDF, setAttachPDF] = useState(false);

  const generateDailyMessage = (studentName: string, classRoom: string, date: string) => {
    return `المكرم ولي أمر الطالب ${studentName} بالصف والفصل ${classRoom} نشعركم بتأخر ابنكم هذا اليوم الموافق ${date}، نأمل الحرص على الحضور المبكر`;
  };

  const generateWeeklyMessage = (studentName: string, classRoom: string, lateCount: number) => {
    return `المكرم ولي أمر الطالب ${studentName} بالصف والفصل ${classRoom} نشعركم بمقدار تأخر ابنكم هذا الأسبوع لـ ${lateCount} مرات، نأمل عنايتكم واهتمامكم`;
  };

  const generateMonthlyMessage = (studentName: string, classRoom: string, lateCount: number) => {
    return `المكرم ولي أمر الطالب ${studentName} بالصف والفصل ${classRoom} نشعركم بمقدار تأخر ابنكم هذا الشهر ${lateCount} مرات، نأمل عنايتكم واهتمامكم`;
  };

  const handleSendMessages = () => {
    if (sendImmediately) {
      // إرسال فوري
      alert('تم إرسال الرسائل بنجاح لأولياء أمور الطلاب المتأخرين');
    } else {
      // جدولة الإرسال
      alert(`تم جدولة الإرسال في الوقت: ${scheduledTime}`);
    }
    setShowSendMessagesModal(false);
  };

  // دوال حذف وتعديل سجلات التأخر
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [recordToEdit, setRecordToEdit] = useState<LateRecord | null>(null);
  const [editedTime, setEditedTime] = useState('');

  const handleDeleteRecord = (recordId: string) => {
    setRecordToDelete(recordId);
  };

  const confirmDeleteRecord = () => {
    if (recordToDelete) {
      setLateRecords(prev => prev.filter(record => record.id !== recordToDelete));
      setRecordToDelete(null);
      alert('تم حذف السجل بنجاح');
    }
  };

  const handleEditRecord = (record: LateRecord) => {
    setRecordToEdit(record);
    setEditedTime(record.arrivalTime);
  };

  const saveEditedRecord = () => {
    if (recordToEdit && editedTime) {
      const lateMinutes = calculateLateMinutes(editedTime, expectedArrivalTime);
      setLateRecords(prev => prev.map(record => 
        record.id === recordToEdit.id 
          ? { ...record, arrivalTime: editedTime, lateMinutes }
          : record
      ));
      setRecordToEdit(null);
      setEditedTime('');
      alert('تم تعديل السجل بنجاح');
    }
  };

  // فلترة الطلاب حسب البحث والفصل
  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || student.name.includes(searchTerm);
    const matchesGrade = !selectedGrade || student.grade === selectedGrade;
    const matchesClass = !selectedClass || student.classRoom.includes(selectedClass);
    
    return matchesSearch && matchesGrade && matchesClass;
  });

  // إحصائيات التأخر اليومي - مع الأخذ بعين الاعتبار الطالب المحدد
  const todayLateRecords = lateRecords.filter(record => {
    if (record.date !== selectedDate) return false;
    if (selectedStudentId && record.studentId !== selectedStudentId) return false;
    if (selectedGrade) {
      const student = students.find(s => s.id === record.studentId);
      if (!student || student.grade !== selectedGrade) return false;
      if (selectedClass && !student.classRoom.includes(selectedClass)) return false;
    }
    return true;
  });
  const averageLateMinutes = todayLateRecords.length > 0
    ? Math.round(todayLateRecords.reduce((sum, record) => sum + record.lateMinutes, 0) / todayLateRecords.length)
    : 0;

  return (
    <div className="space-y-6 font-kufi" style={{ direction: 'rtl' }}>
      {/* شريط العنوان منفصل */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
            <ClockAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">رصد التأخر اليومي</h1>
          </div>
        </div>
      </div>

      {/* شريط الأزرار منفصل */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="pt-6 pb-6 px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {/* زر رصد التأخر */}
            <button
              onClick={() => setShowLateTrackingModal(true)}
              className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">رصد التأخر</span>
            </button>

            {/* زر التقارير مع قائمة منسدلة */}
            <div className="relative">
              <button
                onClick={() => setShowReportsMenu(!showReportsMenu)}
                className="w-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">التقارير</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showReportsMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showReportsMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-200">
                  <div className="py-2">
                    <button
                      onClick={generateDailyReport}
                      className="w-full px-4 py-3 text-right text-gray-700 hover:bg-blue-50 transition-all flex items-center gap-3"
                    >
                      <FileText className="h-4 w-4 text-[#4f46e5]" />
                      <span className="font-medium">تقرير يومي</span>
                    </button>
                    <button
                      onClick={generateWeeklyReport}
                      className="w-full px-4 py-3 text-right text-gray-700 hover:bg-blue-50 transition-all flex items-center gap-3"
                    >
                      <Calendar className="h-4 w-4 text-[#4f46e5]" />
                      <span className="font-medium">تقرير أسبوعي</span>
                    </button>
                    <button
                      onClick={generateMonthlyReport}
                      className="w-full px-4 py-3 text-right text-gray-700 hover:bg-blue-50 transition-all flex items-center gap-3"
                    >
                      <TrendingUp className="h-4 w-4 text-[#4f46e5]" />
                      <span className="font-medium">تقرير شهري</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* زر توليد رابط التأخر */}
            <button
              onClick={generateQuickAccessLink}
              className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] hover:from-[#4f46e5] hover:to-[#6366f1] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              <span className="text-sm">توليد رابط التأخر</span>
            </button>

            {/* زر الإرسال */}
            <button
              onClick={() => setShowSendMessagesModal(true)}
              className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="text-sm">إرسال</span>
            </button>
          </div>
        </div>
      </div>

      {/* رابط الوصول السريع */}
      {generatedLink && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-[#6366f1] rounded-xl p-6 shadow-lg relative">
          {/* زر الإغلاق */}
          <button
            onClick={() => {
              setGeneratedLink('');
              setLinkExpiry(null);
            }}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 hover:bg-white hover:bg-opacity-50 p-2 rounded-lg transition-all"
            title="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] p-3 rounded-lg shadow-md">
              <LinkIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#4f46e5] mb-2">رابط التأخر السريع</h3>
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-700 font-mono outline-none"
                />
                <button
                  onClick={copyLinkToClipboard}
                  className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-md"
                >
                  نسخ
                </button>
              </div>
              {linkExpiry && (
                <p className="text-sm text-[#6366f1] mt-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  صالح حتى: {linkExpiry.toLocaleTimeString('ar-SA')}
                </p>
              )}
              
              {/* زر إرسال الرابط */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    // إرسال الرابط عبر الواتساب
                    const message = `رابط رصد التأخر اليومي:\n${generatedLink}\nصالح حتى: ${linkExpiry?.toLocaleTimeString('ar-SA')}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md"
                >
                  <Send className="h-4 w-4" />
                  إرسال عبر الواتساب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* أدوات البحث والفلترة */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-md">
            <Search className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">البحث</h3>
        </div>

        <div className="space-y-4">
          {/* حقول البحث */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* اليوم والتاريخ */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#4f46e5]" />
                اليوم والتاريخ
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all shadow-sm hover:border-[#6366f1]"
              />
              {selectedDate && (
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  {getArabicDayName(selectedDate)} - {new Date(selectedDate).toLocaleDateString('ar-SA')}
                </p>
              )}
            </div>

            {/* الصف */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الصف</label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedClass('');
                  setSelectedStudentId('');
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all shadow-sm hover:border-[#6366f1] appearance-none bg-white"
              >
                <option value="">جميع الصفوف</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* الفصل */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الفصل</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedStudentId('');
                }}
                disabled={!selectedGrade}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all shadow-sm hover:border-[#6366f1] appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">جميع الفصول</option>
                {classes.map(cls => {
                  const classNumber = selectedGrade ? getClassNumber(selectedGrade, cls) : cls;
                  return (
                    <option key={cls} value={cls}>{classNumber}</option>
                  );
                })}
              </select>
            </div>

            {/* اختيار الطالب */}
            <div className="col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-[#4f46e5]" />
                الطالب
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                disabled={!selectedGrade || !selectedClass}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all shadow-sm hover:border-[#6366f1] appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">جميع طلاب الفصل</option>
                {students
                  .filter(student => {
                    if (!selectedGrade) return false;
                    if (student.grade !== selectedGrade) return false;
                    if (selectedClass) {
                      const classNumber = getClassNumber(selectedGrade, selectedClass);
                      return student.classRoom.includes(classNumber) || student.classRoom === `${selectedGrade} ${selectedClass}`;
                    }
                    return true;
                  })
                  .map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.studentId})
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {selectedStudentId ? 'سيتم عرض بيانات الطالب المحدد' : selectedClass ? 'سيتم عرض جميع طلاب الفصل' : selectedGrade ? 'سيتم عرض جميع طلاب الصف' : 'حدد الصف أولاً'}
              </p>
            </div>
          </div>

          {/* زر البحث */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                // تطبيق الفلترة
                console.log('تطبيق البحث:', { selectedDate, selectedGrade, selectedClass, selectedStudentId });
              }}
              className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white px-12 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              بحث
            </button>
          </div>
        </div>
      </div>

      {/* بطاقة الطلاب المتأخرين */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border-b-2 border-red-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-red-800 flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              الطلاب المتأخرين
            </h2>
            {todayLateRecords.length > 0 && (
              <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                {todayLateRecords.length} طالب
              </span>
            )}
          </div>
        </div>

        {todayLateRecords.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gray-100 p-6 rounded-full">
                <ClockAlert className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-xl font-bold text-gray-600">لم يتم رصد التأخر لهذا اليوم</p>
              <p className="text-sm text-gray-500">استخدم زر "رصد التأخر" لإضافة الطلاب المتأخرين</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1]">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">اسم الطالب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">الصف</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">الفصل</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">مقدار التأخر</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {todayLateRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Users className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{record.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800">
                        {students.find(s => s.name === record.studentName)?.grade || 'غير محدد'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-800">
                        {record.classRoom}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-600" />
                        <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-red-100 text-red-800 border-2 border-red-200">
                          {record.lateMinutes} دقيقة
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="flex items-center gap-1 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm"
                          title="تعديل"
                        >
                          <Edit className="h-3 w-3" />
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm"
                          title="حذف"
                        >
                          <X className="h-3 w-3" />
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* مكون الطباعة */}
      <LateDailyReportPrint 
        records={todayLateRecords} 
        date={selectedDate}
      />

      {/* نافذة رصد التأخر */}
      {showLateTrackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ direction: 'rtl' }}>
            {/* رأس النافذة */}
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <ClockAlert className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">رصد التأخر</h2>
                </div>
                <button
                  onClick={() => setShowLateTrackingModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* محتوى النافذة */}
            <div className="p-6 space-y-6">
              {/* اختيار طريقة البحث */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-[#6366f1] rounded-xl p-4">
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  <Search className="inline h-5 w-5 ml-1 text-[#4f46e5]" />
                  اختر طريقة البحث
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSearchMode('class');
                      setStudentNameSearch('');
                      setSelectedStudentIds(new Set());
                    }}
                    className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      searchMode === 'class'
                        ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    <span>البحث بالصف والفصل</span>
                  </button>
                  <button
                    onClick={() => {
                      setSearchMode('name');
                      setModalGrade('');
                      setModalClass('');
                      setModalStudentId('');
                    }}
                    className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      searchMode === 'name'
                        ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <Search className="h-5 w-5" />
                    <span>البحث بالاسم</span>
                  </button>
                </div>
              </div>

              {/* البحث بالاسم */}
              {searchMode === 'name' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Search className="inline h-4 w-4 ml-1" />
                      ابحث عن الطالب بالاسم
                    </label>
                    <input
                      type="text"
                      value={studentNameSearch}
                      onChange={(e) => setStudentNameSearch(e.target.value)}
                      placeholder="اكتب اسم الطالب..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
                    />
                  </div>
                  {studentNameSearch.trim() && (
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-bold text-[#4f46e5]">{getFilteredModalStudents().length}</span> طالب يتطابق مع البحث
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {getFilteredModalStudents().map(student => (
                          <label
                            key={student.id}
                            className="flex items-center gap-3 bg-white p-3 rounded-lg cursor-pointer hover:bg-blue-50 transition-all"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.has(student.id) || selectedStudentIds.size === 0}
                              onChange={(e) => {
                                const newSet = new Set(selectedStudentIds);
                                if (e.target.checked) {
                                  newSet.add(student.id);
                                } else {
                                  newSet.delete(student.id);
                                }
                                setSelectedStudentIds(newSet);
                              }}
                              className="w-5 h-5 text-[#4f46e5] border-gray-300 rounded focus:ring-[#4f46e5]"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.classRoom} - {student.studentId}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      {getFilteredModalStudents().length > 0 && (
                        <button
                          onClick={() => {
                            const allIds = new Set(getFilteredModalStudents().map(s => s.id));
                            setSelectedStudentIds(selectedStudentIds.size === allIds.size ? new Set() : allIds);
                          }}
                          className="mt-3 text-sm text-[#4f46e5] hover:text-[#4338ca] font-medium"
                        >
                          {selectedStudentIds.size === getFilteredModalStudents().length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* اختيار الصف والفصل */}
              {searchMode === 'class' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الصف</label>
                  <select
                    value={modalGrade}
                    onChange={(e) => {
                      setModalGrade(e.target.value);
                      setModalClass('');
                      setModalStudentId('');
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
                  >
                    <option value="">اختر الصف</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الفصل</label>
                  <select
                    value={modalClass}
                    onChange={(e) => {
                      setModalClass(e.target.value);
                      setModalStudentId('');
                    }}
                    disabled={!modalGrade}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all disabled:bg-gray-100"
                  >
                    <option value="">اختر الفصل</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>
              )}

              {/* اختيار نوع العرض */}
              {searchMode === 'class' && modalGrade && modalClass && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">طريقة الرصد</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setModalShowAllStudents(true);
                        setModalStudentId('');
                      }}
                      className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                        modalShowAllStudents
                          ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Users className="inline h-5 w-5 ml-2" />
                      عرض كل الطلاب
                    </button>
                    <button
                      onClick={() => setModalShowAllStudents(false)}
                      className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                        !modalShowAllStudents
                          ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Search className="inline h-5 w-5 ml-2" />
                      اختيار طالب محدد
                    </button>
                  </div>
                </div>
              )}

              {/* قائمة منسدلة لاختيار طالب محدد */}
              {searchMode === 'class' && modalGrade && modalClass && !modalShowAllStudents && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الطالب</label>
                  <select
                    value={modalStudentId}
                    onChange={(e) => setModalStudentId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
                  >
                    <option value="">اختر الطالب</option>
                    {students
                      .filter(s => s.grade === modalGrade && s.classRoom.includes(modalClass))
                      .map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name} - {student.studentId}
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}

              {/* جدول الطلاب */}
              {((searchMode === 'class' && modalGrade && modalClass && (modalShowAllStudents || modalStudentId)) || 
                (searchMode === 'name' && studentNameSearch.trim() && (selectedStudentIds.size > 0 || getFilteredModalStudents().length > 0))) && (
                <div className="bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">اسم الطالب</th>
                          <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">رقم الطالب</th>
                          <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">وقت الحضور</th>
                          <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {getFilteredModalStudents().map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.studentId}</td>
                            <td className="px-4 py-3">
                              <input
                                type="time"
                                value={modalArrivalTimes[student.id] || ''}
                                onChange={(e) => handleEditArrivalTime(student.id, e.target.value)}
                                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent text-sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleRecordLateClick(student.id)}
                                className="flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#6366f1] hover:to-[#818cf8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                              >
                                <Clock className="h-4 w-4" />
                                رصد التأخر
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* أزرار النافذة */}
            <div className="bg-gray-50 p-6 rounded-b-2xl border-t-2 border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowLateTrackingModal(false)}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all"
              >
                <ArrowRight className="h-5 w-5" />
                رجوع
              </button>
              <button
                onClick={handleSaveLateRecords}
                disabled={Object.keys(modalArrivalTimes).length === 0}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إرسال الرسائل */}
      {showSendMessagesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ direction: 'rtl' }}>
            {/* رأس النافذة */}
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">إرسال رسائل التأخر</h2>
                </div>
                <button
                  onClick={() => setShowSendMessagesModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* محتوى النافذة */}
            <div className="p-6 space-y-6">
              {/* نوع التقرير */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">نوع الرسالة</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSendMessageType('daily')}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      sendMessageType === 'daily'
                        ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    يومي
                  </button>
                  <button
                    onClick={() => setSendMessageType('weekly')}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      sendMessageType === 'weekly'
                        ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    أسبوعي
                  </button>
                  <button
                    onClick={() => setSendMessageType('monthly')}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      sendMessageType === 'monthly'
                        ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    شهري
                  </button>
                </div>
              </div>

              {/* قالب الرسالة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">قالب الرسالة</label>
                {sendMessageType === 'daily' && (
                  <div className="space-y-2">
                    <textarea
                      value={dailyMessage || generateDailyMessage('[اسم الطالب]', '[الصف والفصل]', '[التاريخ]')}
                      onChange={(e) => setDailyMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent resize-none"
                      placeholder="اكتب الرسالة هنا..."
                    />
                    <p className="text-xs text-gray-500">
                      * سيتم استبدال [اسم الطالب]، [الصف والفصل]، [التاريخ] تلقائياً لكل طالب
                    </p>
                  </div>
                )}
                {sendMessageType === 'weekly' && (
                  <div className="space-y-2">
                    <textarea
                      value={weeklyMessage || generateWeeklyMessage('[اسم الطالب]', '[الصف والفصل]', 0)}
                      onChange={(e) => setWeeklyMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent resize-none"
                      placeholder="اكتب الرسالة هنا..."
                    />
                    <p className="text-xs text-gray-500">
                      * سيتم استبدال [اسم الطالب]، [الصف والفصل]، [عدد مرات التأخر] تلقائياً لكل طالب
                    </p>
                  </div>
                )}
                {sendMessageType === 'monthly' && (
                  <div className="space-y-2">
                    <textarea
                      value={monthlyMessage || generateMonthlyMessage('[اسم الطالب]', '[الصف والفصل]', 0)}
                      onChange={(e) => setMonthlyMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent resize-none"
                      placeholder="اكتب الرسالة هنا..."
                    />
                    <p className="text-xs text-gray-500">
                      * سيتم استبدال [اسم الطالب]، [الصف والفصل]، [عدد مرات التأخر] تلقائياً لكل طالب
                    </p>
                  </div>
                )}
              </div>

              {/* خيارات الإرسال */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sendImmediately"
                    checked={sendImmediately}
                    onChange={(e) => setSendImmediately(e.target.checked)}
                    className="w-5 h-5 text-[#4f46e5] border-gray-300 rounded focus:ring-[#4f46e5]"
                  />
                  <label htmlFor="sendImmediately" className="text-sm font-medium text-gray-700">
                    إرسال فوري لأولياء أمور الطلاب المتأخرين
                  </label>
                </div>

                {!sendImmediately && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 ml-1" />
                      جدولة الإرسال
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="attachPDF"
                    checked={attachPDF}
                    onChange={(e) => setAttachPDF(e.target.checked)}
                    className="w-5 h-5 text-[#4f46e5] border-gray-300 rounded focus:ring-[#4f46e5]"
                  />
                  <label htmlFor="attachPDF" className="text-sm font-medium text-gray-700">
                    إرفاق تقرير تأخر الطالب بصيغة PDF
                  </label>
                </div>
              </div>

              {/* معاينة الطلاب المتأخرين */}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-[#4f46e5]" />
                  <h3 className="text-sm font-bold text-[#4f46e5]">الطلاب المتأخرين</h3>
                </div>
                <p className="text-sm text-gray-700">
                  عدد الطلاب: <span className="font-bold text-[#4f46e5]">{todayLateRecords.length}</span> طالب
                </p>
                {todayLateRecords.length > 0 && (
                  <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                    {todayLateRecords.slice(0, 5).map((record) => (
                      <div key={record.id} className="text-xs text-gray-600 bg-white rounded px-2 py-1">
                        • {record.studentName} - {record.classRoom}
                      </div>
                    ))}
                    {todayLateRecords.length > 5 && (
                      <p className="text-xs text-gray-500 italic">و {todayLateRecords.length - 5} طالب آخرين...</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* أزرار النافذة */}
            <div className="bg-gray-50 p-6 rounded-b-2xl border-t-2 border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowSendMessagesModal(false)}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all"
              >
                <X className="h-5 w-5" />
                إلغاء
              </button>
              <button
                onClick={handleSendMessages}
                disabled={todayLateRecords.length === 0}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Send className="h-5 w-5" />
                إرسال ({todayLateRecords.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف */}
      {recordToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" style={{ direction: 'rtl' }}>
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">تأكيد الحذف</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-lg mb-2">هل أنت متأكد من حذف سجل التأخر؟</p>
              <p className="text-gray-500 text-sm">لا يمكن التراجع عن هذا الإجراء</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-b-2xl border-t-2 border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setRecordToDelete(null)}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteRecord}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md"
              >
                <X className="h-5 w-5" />
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل الوقت */}
      {recordToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" style={{ direction: 'rtl' }}>
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">تعديل وقت الحضور</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم الطالب</label>
                <input
                  type="text"
                  value={recordToEdit.studentName}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 ml-1" />
                  وقت الحضور الجديد
                </label>
                <input
                  type="time"
                  value={editedTime}
                  onChange={(e) => setEditedTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all"
                />
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-b-2xl border-t-2 border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRecordToEdit(null);
                  setEditedTime('');
                }}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={saveEditedRecord}
                disabled={!editedTime}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Save className="h-5 w-5" />
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LateTracking;