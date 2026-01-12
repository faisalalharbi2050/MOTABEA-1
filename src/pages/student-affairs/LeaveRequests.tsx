import { useState, useRef, useEffect } from 'react';
import { 
  LogOut, 
  Search, 
  Clock, 
  AlertCircle,
  Printer,
  Send,
  Calendar,
  Users,
  CheckCircle,
  FileText,
  MapPin,
  User,
  ChevronDown,
  Plus,
  X,
  Trash2,
  Download,
  MessageSquare
} from 'lucide-react';
// @ts-ignore
import LeaveLetterPrint from '../../components/student-affairs/LeaveLetterPrint';
// @ts-ignore
import ExitCardPrint from '../../components/student-affairs/ExitCardPrint';

interface Student {
  id: string;
  name: string;
  studentId: string;
  classRoom: string;
  grade: string;
  guardianPhone: string;
  currentPeriod?: string;
  teacherName?: string;
}

interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  classRoom: string;
  date: string;
  time: string;
  destination: string;
  reason: string;
  guardianName: string;
  guardianPhone: string;
  currentPeriod: string;
  teacherName: string;
  status: 'pending' | 'approved' | 'completed';
  createdAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
}

const LeaveRequests = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedRequestForSend, setSelectedRequestForSend] = useState<LeaveRequest | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [requestToPrint, setRequestToPrint] = useState<LeaveRequest | null>(null);
  const [printType, setPrintType] = useState<'letter' | 'card' | 'both'>('both');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [currentPrintRequest, setCurrentPrintRequest] = useState<LeaveRequest | null>(null);
  const [currentPrintType, setCurrentPrintType] = useState<'letter' | 'card' | 'both'>('both');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // بيانات تجريبية
  const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const classes = ['أ', 'ب', 'ج'];
  
  const leaveReasons = [
    'مراجعة الجهات الرسمية',
    'موعد طبي',
    'ظرف عائلي طارئ',
    'أخرى'
  ];

  const students: Student[] = [
    {
      id: '1',
      name: 'أحمد محمد علي',
      studentId: '2024001',
      classRoom: 'الأول أ',
      grade: 'الأول',
      guardianPhone: '0501234567',
      currentPeriod: 'الحصة الثالثة',
      teacherName: 'أ. محمد العلي'
    },
    {
      id: '2',
      name: 'محمد عبدالله',
      studentId: '2024002',
      classRoom: 'الأول أ',
      grade: 'الأول',
      guardianPhone: '0501234569',
      currentPeriod: 'الحصة الثالثة',
      teacherName: 'أ. محمد العلي'
    },
    {
      id: '3',
      name: 'عبدالعزيز سعد',
      studentId: '2024003',
      classRoom: 'الثاني ب',
      grade: 'الثاني',
      guardianPhone: '0501234571',
      currentPeriod: 'الحصة الرابعة',
      teacherName: 'أ. خالد أحمد'
    }
  ];

  // فلترة الطلاب
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm) || student.studentId.includes(searchTerm);
    const matchesGrade = !selectedGrade || student.grade === selectedGrade;
    const matchesClass = !selectedClass || student.classRoom.includes(selectedClass);
    
    return matchesSearch && matchesGrade && matchesClass;
  });

  // فتح نموذج الاستئذان
  const openLeaveForm = (student: Student) => {
    setSelectedStudent(student);
    setShowLeaveForm(true);
  };

  // حفظ طلب الاستئذان
  const saveLeaveRequest = (formData: any) => {
    const { student, leaveDate, leaveTime, reason, guardianName, guardianPhone, shouldPrint, shouldSend, printType, recipient, customRecipient, message, isPreview, previewRequest } = formData;
    
    // إذا كانت معاينة فقط
    if (isPreview && previewRequest) {
      setCurrentPrintRequest(previewRequest);
      setCurrentPrintType(printType);
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          setCurrentPrintRequest(null);
        }, 2000);
      }, 500);
      return; // لا نحفظ في المعاينة
    }
    
    if (!student) return;

    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      studentNumber: student.studentId,
      classRoom: student.classRoom,
      date: leaveDate,
      time: leaveTime,
      destination: '', // لم يعد مطلوباً
      reason: reason,
      guardianName: guardianName,
      guardianPhone: guardianPhone,
      currentPeriod: student.currentPeriod || '',
      teacherName: student.teacherName || '',
      status: 'approved',
      createdAt: new Date(),
      approvedAt: new Date()
    };

    setLeaveRequests(prev => [...prev, newRequest]);
    setShowLeaveForm(false);
    setSelectedStudent(null);
    
    // الطباعة/التصدير إذا تم اختيارها
    if (shouldPrint) {
      setCurrentPrintRequest(newRequest);
      setCurrentPrintType(printType);
      
      // انتظار قليلاً لتحميل المكونات
      setTimeout(() => {
        // فتح نافذة الطباعة (يمكن حفظ كـ PDF من النافذة)
        window.print();
        
        // إخفاء المكونات بعد الطباعة
        setTimeout(() => {
          setCurrentPrintRequest(null);
        }, 2000);
      }, 500);
    }
    
    // الإرسال إذا تم اختياره
    if (shouldSend && message) {
      setTimeout(() => {
        const whatsappMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${recipient === 'ولي الأمر' ? guardianPhone : ''}?text=${whatsappMessage}`, '_blank');
      }, shouldPrint ? 2500 : 500);
    }
  };

  // طباعة المستندات
  const printLeaveDocuments = (request: LeaveRequest, type: 'letter' | 'card' | 'both') => {
    setCurrentPrintRequest(request);
    setCurrentPrintType(type);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setCurrentPrintRequest(null);
      }, 2000);
    }, 500);
  };

  // حذف استئذان
  const confirmDeleteRequest = () => {
    if (requestToDelete) {
      setLeaveRequests(prev => prev.filter(r => r.id !== requestToDelete));
      setRequestToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  // تقارير الاستئذان
  const generateDailyReport = () => {
    setReportType('daily');
    setShowReportModal(true);
    setShowReportsMenu(false);
  };

  const generateWeeklyReport = () => {
    setReportType('weekly');
    setShowReportModal(true);
    setShowReportsMenu(false);
  };

  const generateMonthlyReport = () => {
    setReportType('monthly');
    setShowReportModal(true);
    setShowReportsMenu(false);
  };

  // طباعة التقرير
  const handlePrintReport = () => {
    window.print();
  };

  // تصدير PDF
  const handleExportPDF = () => {
    alert('سيتم تصدير التقرير إلى PDF');
  };

  // إرسال التقرير
  const handleSendReport = () => {
    alert('سيتم إرسال التقرير عبر الواتساب');
  };

  // إحصائيات الاستئذان
  const todayLeaves = leaveRequests.filter(r => r.date === selectedDate);
  
  // حساب استئذان الأسبوع
  const getWeekLeaves = () => {
    const today = new Date(selectedDate);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return leaveRequests.filter(r => {
      const reqDate = new Date(r.date);
      return reqDate >= weekStart && reqDate <= today;
    }).length;
  };
  
  // حساب استئذان الشهر
  const getMonthLeaves = () => {
    const today = new Date(selectedDate);
    return leaveRequests.filter(r => {
      const reqDate = new Date(r.date);
      return reqDate.getMonth() === today.getMonth() && reqDate.getFullYear() === today.getFullYear();
    }).length;
  };

  return (
    <div className="space-y-6 font-kufi" style={{ direction: 'rtl' }}>
      {/* شريط العنوان منفصل */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
            <LogOut className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">استئذان الطلاب</h1>
          </div>
        </div>
      </div>

      {/* شريط الإحصائيات منفصل */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-[#4f46e5] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-md">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[#4f46e5] text-sm font-medium">استئذان اليوم</p>
                <p className="text-3xl font-bold text-gray-900">{todayLeaves.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border-2 border-[#6366f1] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] p-3 rounded-xl shadow-md">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[#6366f1] text-sm font-medium">استئذان الأسبوع</p>
                <p className="text-3xl font-bold text-gray-900">{getWeekLeaves()}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-[#818cf8] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#818cf8] to-[#a5b4fc] p-3 rounded-xl shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[#818cf8] text-sm font-medium">استئذان الشهر</p>
                <p className="text-3xl font-bold text-gray-900">{getMonthLeaves()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* شريط الأزرار منفصل */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-wrap gap-3">
          {/* زر إضافة استئذان */}
          <button
            onClick={() => setShowLeaveForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md"
          >
            <Plus className="h-5 w-5" />
            إضافة استئذان
          </button>

          {/* زر التقارير مع قائمة منسدلة */}
          <div className="relative">
            <button
              onClick={() => setShowReportsMenu(!showReportsMenu)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md"
            >
              <FileText className="h-5 w-5" />
              التقارير
              <ChevronDown className={`h-4 w-4 transition-transform ${showReportsMenu ? 'rotate-180' : ''}`} />
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
                    <Users className="h-4 w-4 text-[#4f46e5]" />
                    <span className="font-medium">تقرير شهري</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* أدوات البحث */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-md">
            <Search className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">البحث</h3>
        </div>

        <div className="space-y-4">
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
            </div>

            {/* الصف */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الصف</label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedClass('');
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
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedGrade}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all shadow-sm hover:border-[#6366f1] appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">جميع الفصول</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* اسم الطالب */}
            <div className="col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-[#4f46e5]" />
                اسم الطالب
              </label>
              <input
                type="text"
                placeholder="ابحث بالاسم أو رقم الطالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all shadow-sm hover:border-[#6366f1]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* بطاقة الطلاب المستأذنون */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] border-b-2 border-[#4f46e5]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            الطلاب المستأذنون ({todayLeaves.length})
          </h2>
        </div>
        {todayLeaves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">اسم الطالب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الصف</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الفصل</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">يوم الاستئذان</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">تاريخ الاستئذان</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">وقت الاستئذان</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">سبب الاستئذان</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {todayLeaves.map((request) => {
                  const requestDate = new Date(request.date);
                  const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                  const dayName = arabicDays[requestDate.getDay()];
                  const [gradeText, classText] = request.classRoom.split(' ');
                  
                  return (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.studentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{gradeText || request.classRoom}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{classText || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dayName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{requestDate.toLocaleDateString('ar-SA')}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{request.time}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {request.reason || 'لم يحدد'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* قائمة الطباعة */}
                          <div className="relative group">
                            <button
                              className="text-[#4f46e5] hover:text-[#4338ca] font-medium text-xs flex items-center gap-1 bg-blue-50 px-2 py-1 rounded transition-all hover:bg-blue-100"
                              title="طباعة"
                            >
                              <Printer className="h-4 w-4" />
                              <ChevronDown className="h-3 w-3" />
                            </button>
                            {/* قائمة منسدلة للطباعة */}
                            <div className="hidden group-hover:block absolute left-0 top-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 min-w-[160px]">
                              <button
                                onClick={() => printLeaveDocuments(request, 'letter')}
                                className="w-full px-3 py-2 text-right text-sm text-gray-700 hover:bg-blue-50 transition-all flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4 text-[#4f46e5]" />
                                نموذج الاستئذان
                              </button>
                              <button
                                onClick={() => printLeaveDocuments(request, 'card')}
                                className="w-full px-3 py-2 text-right text-sm text-gray-700 hover:bg-blue-50 transition-all flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4 text-[#4f46e5]" />
                                بطاقة الخروج
                              </button>
                              <button
                                onClick={() => printLeaveDocuments(request, 'both')}
                                className="w-full px-3 py-2 text-right text-sm text-gray-700 hover:bg-blue-50 transition-all flex items-center gap-2 border-t border-gray-200"
                              >
                                <FileText className="h-4 w-4 text-[#4f46e5]" />
                                كلاهما معاً
                              </button>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              setSelectedRequestForSend(request);
                              setShowSendModal(true);
                            }}
                            className="text-green-600 hover:text-green-700 font-medium text-xs flex items-center gap-1 bg-green-50 px-2 py-1 rounded transition-all hover:bg-green-100"
                            title="إرسال"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setRequestToDelete(request.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-700 font-medium text-xs flex items-center gap-1 bg-red-50 px-2 py-1 rounded transition-all hover:bg-red-100"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 p-4 rounded-full">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <p className="text-gray-500 text-lg font-medium">لا توجد استئذانات في هذا اليوم</p>
            <p className="text-gray-400 text-sm mt-2">يمكنك إضافة استئذان جديد من خلال زر "إضافة استئذان"</p>
          </div>
        )}
      </div>

      {/* نموذج الاستئذان */}
      {showLeaveForm && (
        <LeaveForm
          students={filteredStudents}
          leaveReasons={leaveReasons}
          onSave={saveLeaveRequest}
          onCancel={() => {
            setShowLeaveForm(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* نافذة تأكيد الحذف */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">تأكيد الحذف</h3>
            </div>
            <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذا الاستئذان؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteRequest}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                حذف
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRequestToDelete(null);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإرسال */}
      {showSendModal && selectedRequestForSend && (
        <SendMessageModal
          request={selectedRequestForSend}
          onClose={() => {
            setShowSendModal(false);
            setSelectedRequestForSend(null);
          }}
        />
      )}

      {/* نافذة التقارير */}
      {showReportModal && (
        <ReportModal
          reportType={reportType}
          leaveRequests={leaveRequests}
          selectedDate={selectedDate}
          onClose={() => setShowReportModal(false)}
          onPrint={handlePrintReport}
          onExport={handleExportPDF}
          onSend={handleSendReport}
        />
      )}

      {/* مكونات الطباعة (تظهر فقط عند الحاجة للطباعة) */}
      {currentPrintRequest && (
        <>
          {(currentPrintType === 'letter' || currentPrintType === 'both') && (
            <LeaveLetterPrint
              student={{
                name: currentPrintRequest.studentName,
                studentId: currentPrintRequest.studentNumber,
                classRoom: currentPrintRequest.classRoom
              }}
              guardian={{
                name: currentPrintRequest.guardianName,
                phone: currentPrintRequest.guardianPhone
              }}
              destination={currentPrintRequest.destination || ''}
              reason={currentPrintRequest.reason}
              date={currentPrintRequest.date}
              time={currentPrintRequest.time}
            />
          )}
          {(currentPrintType === 'card' || currentPrintType === 'both') && (
            <ExitCardPrint
              student={{
                name: currentPrintRequest.studentName,
                studentId: currentPrintRequest.studentNumber,
                classRoom: currentPrintRequest.classRoom
              }}
              destination={currentPrintRequest.destination || ''}
              date={currentPrintRequest.date}
              time={currentPrintRequest.time}
            />
          )}
        </>
      )}
    </div>
  );
};

// مكون نموذج الاستئذان
interface LeaveFormProps {
  students: Student[];
  leaveReasons: string[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const LeaveForm = ({ students, leaveReasons, onSave, onCancel }: LeaveFormProps) => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveTime, setLeaveTime] = useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  
  // خيارات الطباعة والإرسال
  const [shouldPrint, setShouldPrint] = useState(false);
  const [printType, setPrintType] = useState<'letter' | 'card' | 'both'>('both');
  const [shouldSend, setShouldSend] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');

  const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const classes = ['أ', 'ب', 'ج'];
  const recipients = [
    'ولي الأمر',
    'المدير',
    'وكيل المدرسة',
    'الموجه الطلابي',
    'مشرف الدور',
    'معلم الفصل',
    'الحارس',
    'أخرى (تحديد يدوي)'
  ];

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // تحديث بيانات ولي الأمر تلقائياً
  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    const student = students.find(s => s.id === studentId);
    if (student) {
      // جلب اسم ولي الأمر من اسم الطالب (اسم العائلة)
      const nameParts = student.name.split(' ');
      const fatherName = nameParts.length >= 2 ? nameParts[nameParts.length - 2] : '';
      const familyName = nameParts[nameParts.length - 1] || '';
      setGuardianName(`${fatherName} ${familyName}`.trim() || 'ولي الأمر');
      setGuardianPhone(student.guardianPhone);
    }
  };

  // الحصول على اليوم بالعربي
  const getArabicDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  // رسالة الإرسال الافتراضية تتغير حسب المستلم
  const getDefaultMessage = () => {
    if (!selectedStudent) return '';
    if (recipient === 'ولي الأمر') {
      return `السلام عليكم ورحمة الله وبركاته\nنفيدكم بأن نجلكم ${selectedStudent.name} قد غادر المدرسة بتاريخ ${new Date(leaveDate).toLocaleDateString('ar-SA')} الساعة ${leaveTime}\nللاستفسار: التواصل مع إدارة المدرسة`;
    }
    return `نشعركم باستئذان الطالب ${selectedStudent.name} من الصف ${selectedStudent.classRoom}\nالتاريخ: ${new Date(leaveDate).toLocaleDateString('ar-SA')}\nالوقت: ${leaveTime}\nالسبب: ${reason || customReason || 'غير محدد'}\nيرجى التكرم بالموافقة`;
  };
  
  const [message, setMessage] = useState('');
  
  // تحديث الرسالة عند تغيير المستلم أو بيانات الطالب
  useEffect(() => {
    if (shouldSend && selectedStudent) {
      setMessage(getDefaultMessage());
    }
  }, [recipient, selectedStudent, leaveDate, leaveTime, reason, customReason, shouldSend]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('يرجى اختيار الطالب');
      return;
    }
    
    const finalReason = reason === 'أخرى' ? customReason : (reason || customReason);
    const finalRecipient = recipient === 'أخرى (تحديد يدوي)' ? customRecipient : recipient;
    
    onSave({ 
      student: selectedStudent,
      leaveDate, 
      leaveTime,
      reason: finalReason, 
      guardianName, 
      guardianPhone,
      shouldPrint,
      printType,
      shouldSend,
      recipient: finalRecipient,
      customRecipient,
      message
    });
  };

  // معاينة وطباعة قبل الحفظ
  const handlePreviewAndPrint = () => {
    if (!selectedStudent) {
      alert('يرجى اختيار الطالب أولاً');
      return;
    }
    
    const finalReason = reason === 'أخرى' ? customReason : (reason || customReason);
    
    // إنشاء بيانات مؤقتة للمعاينة
    const tempRequest: LeaveRequest = {
      id: 'preview-' + Date.now(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentNumber: selectedStudent.studentId,
      classRoom: selectedStudent.classRoom,
      date: leaveDate,
      time: leaveTime,
      destination: '',
      reason: finalReason,
      guardianName: guardianName,
      guardianPhone: guardianPhone,
      currentPeriod: selectedStudent.currentPeriod || '',
      teacherName: selectedStudent.teacherName || '',
      status: 'approved',
      createdAt: new Date(),
      approvedAt: new Date()
    };
    
    // عرض المعاينة والطباعة
    onSave({
      student: selectedStudent,
      leaveDate,
      leaveTime,
      reason: finalReason,
      guardianName,
      guardianPhone,
      shouldPrint: true,
      printType: printType,
      shouldSend: false,
      recipient: '',
      customRecipient: '',
      message: '',
      isPreview: true,
      previewRequest: tempRequest
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">إضافة استئذان</h2>
              <p className="text-white/80 mt-1">املأ البيانات التالية لتسجيل استئذان الطالب</p>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* اختيار الطالب */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-[#4f46e5] rounded-xl p-5">
            <h3 className="text-lg font-bold text-[#4f46e5] mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              بيانات الطالب
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الصف</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setSelectedClass('');
                    setSelectedStudentId('');
                  }}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
                >
                  <option value="">اختر الصف</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الفصل</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedStudentId('');
                  }}
                  disabled={!selectedGrade}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all disabled:bg-gray-100"
                >
                  <option value="">اختر الفصل</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم الطالب</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  disabled={!selectedClass}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all disabled:bg-gray-100"
                >
                  <option value="">اختر الطالب</option>
                  {students
                    .filter(s => s.grade === selectedGrade && s.classRoom.includes(selectedClass))
                    .map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.studentId})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* بيانات الاستئذان */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* يوم وتاريخ الاستئذان */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 ml-1 text-[#4f46e5]" />
                يوم وتاريخ الاستئذان
              </label>
              <input
                type="date"
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              />
              {leaveDate && (
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  {getArabicDayName(leaveDate)} - {new Date(leaveDate).toLocaleDateString('ar-SA')}
                </p>
              )}
            </div>

            {/* وقت الاستئذان */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 ml-1 text-[#4f46e5]" />
                وقت الاستئذان
              </label>
              <input
                type="time"
                value={leaveTime}
                onChange={(e) => setLeaveTime(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* سبب الاستئذان */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 ml-1 text-[#4f46e5]" />
              سبب الاستئذان
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
            >
              <option value="">اختر السبب أو اترك فارغاً للكتابة اليدوية</option>
              {leaveReasons.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            
            {reason === 'أخرى' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="اكتب السبب..."
                rows={3}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all resize-none mt-3"
              />
            )}
            
            {!reason && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="اكتب سبب الاستئذان يدوياً..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all resize-none mt-3"
              />
            )}
          </div>

          {/* بيانات ولي الأمر */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <User className="inline h-4 w-4 ml-1 text-[#4f46e5]" />
                اسم ولي الأمر
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                required
                placeholder="اسم ولي الأمر"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Send className="inline h-4 w-4 ml-1 text-[#4f46e5]" />
                جوال ولي الأمر
              </label>
              <input
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                required
                placeholder="05xxxxxxxx"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">يُجلب تلقائياً من بيانات الطالب</p>
            </div>
          </div>

          {/* ملاحظة */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">ملاحظة هامة:</p>
                <p>سيتم حفظ الاستئذان وإضافته للسجل. يمكنك اختيار طباعة النموذج أو إرسال إشعار أدناه.</p>
              </div>
            </div>
          </div>

          {/* خيارات الطباعة */}
          <div className="border-2 border-[#4f46e5] rounded-xl p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="shouldPrint"
                checked={shouldPrint}
                onChange={(e) => setShouldPrint(e.target.checked)}
                className="w-5 h-5 text-[#4f46e5] rounded focus:ring-2 focus:ring-[#4f46e5] cursor-pointer"
              />
              <label htmlFor="shouldPrint" className="text-lg font-bold text-[#4f46e5] flex items-center gap-2 cursor-pointer">
                <Printer className="h-6 w-6" />
                طباعة / تصدير PDF
              </label>
            </div>

            {shouldPrint && (
              <div className="space-y-3 animate-fadeIn">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-bold mb-1">💡 نصيحة:</p>
                      <p>عند فتح نافذة الطباعة، اختر "حفظ كـ PDF" من قائمة الطابعات لتصدير المستند بصيغة PDF</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-3 mr-8">اختر نوع المستند:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className={`flex flex-col items-center gap-2 p-4 border-3 rounded-xl cursor-pointer transition-all ${
                    printType === 'letter' 
                      ? 'border-[#4f46e5] bg-white shadow-lg scale-105' 
                      : 'border-gray-200 bg-white hover:border-[#4f46e5] hover:shadow-md'
                  }`}>
                    <input
                      type="radio"
                      name="printType"
                      value="letter"
                      checked={printType === 'letter'}
                      onChange={(e) => setPrintType(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="text-4xl">📄</div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">نموذج الاستئذان</p>
                      <p className="text-xs text-gray-600 mt-1">صفحة واحدة A4</p>
                    </div>
                    {printType === 'letter' && (
                      <CheckCircle className="h-5 w-5 text-[#4f46e5] absolute top-2 right-2" />
                    )}
                  </label>

                  <label className={`flex flex-col items-center gap-2 p-4 border-3 rounded-xl cursor-pointer transition-all ${
                    printType === 'card' 
                      ? 'border-[#4f46e5] bg-white shadow-lg scale-105' 
                      : 'border-gray-200 bg-white hover:border-[#4f46e5] hover:shadow-md'
                  }`}>
                    <input
                      type="radio"
                      name="printType"
                      value="card"
                      checked={printType === 'card'}
                      onChange={(e) => setPrintType(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="text-4xl">🎫</div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">بطاقة الخروج</p>
                      <p className="text-xs text-gray-600 mt-1">صفحة واحدة A5</p>
                    </div>
                    {printType === 'card' && (
                      <CheckCircle className="h-5 w-5 text-[#4f46e5] absolute top-2 right-2" />
                    )}
                  </label>

                  <label className={`flex flex-col items-center gap-2 p-4 border-3 rounded-xl cursor-pointer transition-all ${
                    printType === 'both' 
                      ? 'border-[#4f46e5] bg-white shadow-lg scale-105' 
                      : 'border-gray-200 bg-white hover:border-[#4f46e5] hover:shadow-md'
                  }`}>
                    <input
                      type="radio"
                      name="printType"
                      value="both"
                      checked={printType === 'both'}
                      onChange={(e) => setPrintType(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="text-4xl">📋</div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">كلاهما معاً</p>
                      <p className="text-xs text-gray-600 mt-1">صفحتان متتاليتان</p>
                    </div>
                    {printType === 'both' && (
                      <CheckCircle className="h-5 w-5 text-[#4f46e5] absolute top-2 right-2" />
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* خيارات الإرسال */}
          <div className="border-2 border-green-500 rounded-xl p-5 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="shouldSend"
                checked={shouldSend}
                onChange={(e) => setShouldSend(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
              />
              <label htmlFor="shouldSend" className="text-lg font-bold text-green-700 flex items-center gap-2 cursor-pointer">
                <MessageSquare className="h-6 w-6" />
                إرسال إشعار واتساب
              </label>
            </div>

            {shouldSend && (
              <div className="space-y-4 animate-fadeIn">
                {/* اختيار المستلم */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    إرسال الإشعار إلى:
                  </label>
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white font-medium"
                  >
                    <option value="">اختر المستلم</option>
                    {recipients.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {recipient === 'أخرى (تحديد يدوي)' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تحديد المستلم:</label>
                    <input
                      type="text"
                      value={customRecipient}
                      onChange={(e) => setCustomRecipient(e.target.value)}
                      placeholder="مثال: معلم الرياضيات، مرشد الطلاب، إلخ"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                    />
                  </div>
                )}

                {recipient && (
                  <div className="bg-white border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <label className="block text-sm font-bold text-gray-700">نص الرسالة (قابل للتعديل):</label>
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      placeholder="سيتم إنشاء رسالة تلقائية حسب المستلم المختار..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none font-medium text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      سيتم فتح واتساب تلقائياً بعد حفظ الاستئذان
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* الأزرار */}
          <div className="flex gap-3">
            {/* زر المعاينة والطباعة */}
            {shouldPrint && selectedStudent && (
              <button
                type="button"
                onClick={handlePreviewAndPrint}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Printer className="h-5 w-5" />
                معاينة وطباعة
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              حفظ الاستئذان
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// مكون نافذة الإرسال
interface SendMessageModalProps {
  request: LeaveRequest;
  onClose: () => void;
}

const SendMessageModal = ({ request, onClose }: SendMessageModalProps) => {
  const [recipient, setRecipient] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [message, setMessage] = useState(
    `نشعركم باستئذان ولي الأمر للطالب ${request.studentName}، بالصف والفصل ${request.classRoom} يرجى التكرم بالسماح له بالخروج.`
  );

  const recipients = [
    'المدير',
    'وكيل المدرسة',
    'الموجه الطلابي',
    'مشرف الدور',
    'الحارس',
    'معلم (تحديد يدوي)',
  ];

  const handleSend = () => {
    const finalRecipient = recipient === 'معلم (تحديد يدوي)' ? customRecipient : recipient;
    
    if (!finalRecipient) {
      alert('يرجى اختيار المستلم');
      return;
    }

    // إرسال الرسالة عبر الواتساب
    const whatsappMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank');
    
    alert(`تم إرسال الرسالة إلى: ${finalRecipient}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              إرسال إشعار استئذان
            </h2>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* معلومات الطالب */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 font-bold mb-2">معلومات الطالب:</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-blue-700">
              <p><strong>الاسم:</strong> {request.studentName}</p>
              <p><strong>الفصل:</strong> {request.classRoom}</p>
              <p><strong>التاريخ:</strong> {new Date(request.date).toLocaleDateString('ar-SA')}</p>
              <p><strong>الوقت:</strong> {request.time}</p>
            </div>
          </div>

          {/* اختيار المستلم */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">إرسال إلى:</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            >
              <option value="">اختر المستلم</option>
              {recipients.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {recipient === 'معلم (تحديد يدوي)' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">اسم المعلم:</label>
              <input
                type="text"
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
                placeholder="أدخل اسم المعلم"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {/* نص الرسالة */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">نص الرسالة (قابل للتعديل):</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* معلومة */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">ملاحظة:</p>
                <p>سيتم فتح تطبيق الواتساب لإرسال الرسالة. يمكنك تعديل الرسالة قبل الإرسال.</p>
              </div>
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSend}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="h-5 w-5" />
              إرسال عبر الواتساب
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// مكون نافذة التقارير
interface ReportModalProps {
  reportType: 'daily' | 'weekly' | 'monthly';
  leaveRequests: LeaveRequest[];
  selectedDate: string;
  onClose: () => void;
  onPrint: () => void;
  onExport: () => void;
  onSend: () => void;
}

const ReportModal = ({ reportType, leaveRequests, selectedDate, onClose, onPrint, onExport, onSend }: ReportModalProps) => {
  const getReportTitle = () => {
    switch (reportType) {
      case 'daily': return 'تقرير الاستئذان اليومي';
      case 'weekly': return 'تقرير الاستئذان الأسبوعي';
      case 'monthly': return 'تقرير الاستئذان الشهري';
    }
  };

  const getReportData = () => {
    const today = new Date(selectedDate);
    
    switch (reportType) {
      case 'daily':
        return leaveRequests.filter(r => r.date === selectedDate);
      
      case 'weekly':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return leaveRequests.filter(r => {
          const reqDate = new Date(r.date);
          return reqDate >= weekStart && reqDate <= today;
        });
      
      case 'monthly':
        return leaveRequests.filter(r => {
          const reqDate = new Date(r.date);
          return reqDate.getMonth() === today.getMonth() && reqDate.getFullYear() === today.getFullYear();
        });
    }
  };

  const reportData = getReportData();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {getReportTitle()}
            </h2>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* معلومات التقرير */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-[#4f46e5] rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">إجمالي الاستئذانات</p>
                <p className="text-3xl font-bold text-[#4f46e5]">{reportData.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">تاريخ التقرير</p>
                <p className="text-lg font-bold text-gray-900">{new Date(selectedDate).toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">نوع التقرير</p>
                <p className="text-lg font-bold text-gray-900">{getReportTitle().replace('تقرير الاستئذان ', '')}</p>
              </div>
            </div>
          </div>

          {/* جدول البيانات */}
          {reportData.length > 0 ? (
            <div className="overflow-x-auto border-2 border-gray-200 rounded-xl">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">#</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">اسم الطالب</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الفصل</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">التاريخ</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الوقت</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">السبب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.map((request, index) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{request.studentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{request.classRoom}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(request.date).toLocaleDateString('ar-SA')}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{request.time}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{request.reason || 'لم يحدد'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 p-4 rounded-full">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-500 text-lg font-medium">لا توجد بيانات لهذه الفترة</p>
            </div>
          )}

          {/* الأزرار */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onPrint}
              className="flex-1 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Printer className="h-5 w-5" />
              طباعة
            </button>
            <button
              onClick={onExport}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              تصدير PDF
            </button>
            <button
              onClick={onSend}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="h-5 w-5" />
              إرسال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequests;
