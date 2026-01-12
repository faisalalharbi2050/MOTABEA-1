import { useState, useEffect } from 'react';
import { 
  UserX, 
  Search, 
  Link as LinkIcon, 
  Clock, 
  AlertCircle,
  Printer,
  Send,
  Calendar,
  Users,
  TrendingDown,
  CheckCircle,
  XCircle,
  FileText,
  ChevronDown,
  Plus,
  Save,
  Edit,
  ArrowRight,
  X,
  Download,
  AlertTriangle,
  Bell,
  MessageCircle,
  Copy,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateAccessToken, calculateLinkExpiry } from '../../utils/studentAffairsUtils';
import GuidanceReferralForm from '../../components/student-affairs/GuidanceReferralForm';
import ParentSummonForm from '../../components/student-affairs/ParentSummonForm';
import EducationOfficeNotification from '../../components/student-affairs/EducationOfficeNotification';
import SendMessageModal from '../../components/student-affairs/SendMessageModal';
import GenerateTeacherLinkModal from '../../components/student-affairs/GenerateTeacherLinkModal';

interface Student {
  id: string;
  name: string;
  studentId: string;
  classRoom: string;
  grade: string;
  phone: string;
  guardianPhone: string;
  status: 'present' | 'absent' | 'not-checked';
}

interface AbsenceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classRoom: string;
  date: string;
  period: string;
  recordedBy: string;
  notificationSent: boolean;
  createdAt: Date;
}

const AbsenceTracking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('2'); // الحصة الثانية افتراضياً
  const [searchTerm, setSearchTerm] = useState('');
  const [absenceRecords, setAbsenceRecords] = useState<AbsenceRecord[]>([]);
  const [generatedLinks, setGeneratedLinks] = useState<{ [key: string]: { link: string; expiry: Date } }>({});
  const [recordingMode, setRecordingMode] = useState<'manual' | 'smart'>('manual');
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  
  // States for new absence tracking modal
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [modalGrade, setModalGrade] = useState('');
  const [modalClass, setModalClass] = useState('');
  const [modalStudentId, setModalStudentId] = useState('');
  const [modalShowAllStudents, setModalShowAllStudents] = useState(false);
  const [searchMode, setSearchMode] = useState<'class' | 'name'>('class');
  const [studentNameSearch, setStudentNameSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'class' | 'student'>('all');
  
  // States for alerts and forms
  const [showGuidanceForm, setShowGuidanceForm] = useState(false);
  const [showParentSummonForm, setShowParentSummonForm] = useState(false);
  const [showEducationNotification, setShowEducationNotification] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [messageType, setMessageType] = useState<'3days' | '5days' | '10days'>('3days');
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<Student | null>(null);
  
  // States for new link modals
  const [showGenerateTeacherLinkModal, setShowGenerateTeacherLinkModal] = useState(false);
  
  // States for simple absence link
  const [generatedAbsenceLink, setGeneratedAbsenceLink] = useState('');
  const [absenceLinkExpiry, setAbsenceLinkExpiry] = useState<Date | null>(null);
  
  // States for absence message sending system
  const [showSendAbsenceModal, setShowSendAbsenceModal] = useState(false);
  const [messagePeriod, setMessagePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [scheduleSending, setScheduleSending] = useState(false);
  const [sendingTime, setSendingTime] = useState('');
  const [attachPdfReport, setAttachPdfReport] = useState(false);
  const [selectedStudentsForMessage, setSelectedStudentsForMessage] = useState<string[]>([]);
  
  // Student absence tracking - بيانات تجريبية
  const [studentAbsenceData, setStudentAbsenceData] = useState<Record<string, { totalDays: number; dates: Array<{ date: string; day: string }> }>>({});

  // بيانات تجريبية
  const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const classes = ['أ', 'ب', 'ج'];
  
  // دالة لتوليد الفصول بصيغة أرقام
  const getClassesForGrade = (grade: string) => {
    if (!grade) return [];
    const gradeNumber = grades.indexOf(grade) + 1;
    return classes.map((_, index) => `${index + 1}-${gradeNumber}`);
  };
  const periods = [
    { value: '1', label: 'الحصة الأولى' },
    { value: '2', label: 'الحصة الثانية' },
    { value: '3', label: 'الحصة الثالثة' },
    { value: '4', label: 'الحصة الرابعة' },
    { value: '5', label: 'الحصة الخامسة' },
    { value: '6', label: 'الحصة السادسة' },
  ];

  // بيانات تجريبية للطلاب
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'أحمد محمد علي',
      studentId: '2024001',
      classRoom: 'الأول أ',
      grade: 'الأول',
      phone: '0501234567',
      guardianPhone: '0501234568',
      status: 'present'
    },
    {
      id: '2',
      name: 'محمد عبدالله',
      studentId: '2024002',
      classRoom: 'الأول أ',
      grade: 'الأول',
      phone: '0501234569',
      guardianPhone: '0501234570',
      status: 'present'
    },
    {
      id: '3',
      name: 'عبدالعزيز سعد',
      studentId: '2024003',
      classRoom: 'الثاني ب',
      grade: 'الثاني',
      phone: '0501234571',
      guardianPhone: '0501234572',
      status: 'present'
    },
    {
      id: '4',
      name: 'فيصل خالد',
      studentId: '2024004',
      classRoom: 'الثاني ب',
      grade: 'الثاني',
      phone: '0501234573',
      guardianPhone: '0501234574',
      status: 'present'
    }
  ]);

  // تعيين القالب الافتراضي عند فتح نافذة إرسال الرسائل
  useEffect(() => {
    if (showSendAbsenceModal && !messageTemplate) {
      setMessageTemplate(`المكرم ولي أمر الطالب [اسم الطالب] بالصف [الصف] والفصل [الفصل] نشعركم بغياب ابنكم هذا اليوم الموافق [التاريخ]، نأمل الحرص على الحضور وعدم الغياب، نحن وأنتم شركاء في النجاح فكونوا عوناً لنا في تحقيق الانضباط.`);
    }
  }, [showSendAbsenceModal]);

  // تسجيل غياب طالب
  const recordAbsence = (student: Student) => {
    const newRecord: AbsenceRecord = {
      id: Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      classRoom: student.classRoom,
      date: selectedDate,
      period: periods.find(p => p.value === selectedPeriod)?.label || '',
      recordedBy: 'الإداري',
      notificationSent: false,
      createdAt: new Date()
    };

    setAbsenceRecords(prev => [...prev, newRecord]);
    
    // تحديث حالة الطالب
    setStudents(prev => prev.map(s => 
      s.id === student.id ? { ...s, status: 'absent' } : s
    ));

    // إرسال إشعار لولي الأمر
    sendGuardianNotification(student);
    
    // التحقق من التنبيهات
    checkAbsenceAlerts(student.id);
  };

  // تسجيل حضور (إلغاء الغياب)
  const recordPresence = (student: Student) => {
    // إزالة سجل الغياب
    setAbsenceRecords(prev => prev.filter(r => 
      !(r.studentId === student.id && r.date === selectedDate)
    ));
    
    // تحديث حالة الطالب
    setStudents(prev => prev.map(s => 
      s.id === student.id ? { ...s, status: 'present' } : s
    ));
  };

  // إرسال إشعار لولي الأمر
  const sendGuardianNotification = async (student: Student) => {
    const message = `
عزيزي ولي الأمر،

نحيطكم علماً بأن نجلكم/نجلتكم ${student.name} غائب اليوم.

📅 التاريخ: ${new Date(selectedDate).toLocaleDateString('ar-SA')}
🕐 الحصة: ${periods.find(p => p.value === selectedPeriod)?.label}

يرجى التواصل مع إدارة المدرسة في حال وجود عذر.

شكراً لتعاونكم
إدارة المدرسة
    `;

    console.log('إرسال إشعار لولي أمر:', student.name);
    console.log(message);
  };

  // التحقق من تنبيهات الغياب
  const checkAbsenceAlerts = (studentId: string) => {
    const studentRecords = absenceRecords.filter(r => r.studentId === studentId);
    const totalAbsenceDays = studentRecords.length + 1; // +1 للسجل الجديد

    // التنبيهات: 3 متصلة، 5، 10، 15، 20
    const thresholds = [3, 5, 10, 15, 20];
    
    if (thresholds.includes(totalAbsenceDays)) {
      sendVicePrincipalAlert(studentId, totalAbsenceDays);
    }
  };

  // إرسال تنبيه للوكيل
  const sendVicePrincipalAlert = (studentId: string, absenceDays: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    console.log(`🔔 تنبيه للوكيل: الطالب ${student.name} غاب ${absenceDays} أيام`);
  };

  // توليد رابط للمعلم
  const generateTeacherLink = () => {
    setShowGenerateTeacherLinkModal(true);
  };

  // نسخ الرابط
  const copyLinkToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('تم نسخ الرابط للحافظة');
  };

  // طباعة التقرير اليومي
  const printDailyReport = () => {
    window.print();
  };

  // تقارير الغياب
  const generateDailyReport = () => {
    navigate('/dashboard/student-affairs/absence-daily-report');
    setShowReportsMenu(false);
  };

  const generateWeeklyReport = () => {
    navigate('/dashboard/student-affairs/absence-weekly-report');
    setShowReportsMenu(false);
  };

  const generateMonthlyReport = () => {
    navigate('/dashboard/student-affairs/absence-monthly-report');
    setShowReportsMenu(false);
  };

  // طباعة نموذج التحويل للموجه
  const printGuidanceReferral = (student: Student) => {
    console.log('طباعة نموذج التحويل للموجه:', student.name);
    // سيتم تنفيذها لاحقاً
  };

  // طباعة خطاب تعهد الغياب
  const printAbsenceCommitment = (student: Student) => {
    console.log('طباعة خطاب تعهد الغياب:', student.name);
    // سيتم تنفيذها لاحقاً
  };

  // دوال نافذة رصد الغياب
  const handleAbsenceModalSubmit = () => {
    if (selectedStudentIds.size === 0) {
      alert('الرجاء تحديد طلاب لتسجيل غيابهم');
      return;
    }

    selectedStudentIds.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        const newRecord: AbsenceRecord = {
          id: Date.now().toString() + studentId,
          studentId: student.id,
          studentName: student.name,
          classRoom: student.classRoom,
          date: selectedDate,
          period: periods.find(p => p.value === selectedPeriod)?.label || '',
          recordedBy: 'الإداري',
          notificationSent: false,
          createdAt: new Date()
        };

        setAbsenceRecords(prev => [...prev, newRecord]);
        setStudents(prev => prev.map(s => 
          s.id === student.id ? { ...s, status: 'absent' } : s
        ));
        sendGuardianNotification(student);
        checkAbsenceAlerts(student.id);
      }
    });

    // Reset modal
    setShowAbsenceModal(false);
    setModalGrade('');
    setModalClass('');
    setModalStudentId('');
    setModalShowAllStudents(false);
    setSelectedStudentIds(new Set());
    setStudentNameSearch('');
    alert('تم تسجيل الغياب بنجاح');
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudentIds(newSet);
  };

  // تصدير الغياب إلى XML
  const exportAbsenceToXML = () => {
    const todayAbsent = filteredStudents.filter(s => s.status === 'absent');
    
    if (todayAbsent.length === 0) {
      alert('لا يوجد طلاب غائبين لتصديرهم');
      return;
    }

    // إنشاء محتوى XML
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += '<AbsenceData>\n';
    xmlContent += `  <Date>${selectedDate}</Date>\n`;
    xmlContent += '  <Students>\n';
    
    todayAbsent.forEach(student => {
      const record = absenceRecords.find(r => r.studentId === student.id && r.date === selectedDate);
      xmlContent += '    <Student>\n';
      xmlContent += `      <StudentID>${student.studentId}</StudentID>\n`;
      xmlContent += `      <Name>${student.name}</Name>\n`;
      xmlContent += `      <Grade>${student.grade}</Grade>\n`;
      xmlContent += `      <ClassRoom>${student.classRoom}</ClassRoom>\n`;
      xmlContent += '    </Student>\n';
    });
    
    xmlContent += '  </Students>\n';
    xmlContent += '</AbsenceData>';

    // تنزيل الملف
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `absence_${selectedDate}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('تم تصدير الغياب إلى XML');
  };

  // دالة لحساب أيام الغياب لطالب معين
  const getStudentAbsenceDays = (studentId: string) => {
    return studentAbsenceData[studentId] || { totalDays: 0, dates: [] };
  };

  // دالة لتنسيق التاريخ واليوم
  const formatDateWithDay = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = days[date.getDay()];
    const formattedDate = date.toLocaleDateString('ar-SA');
    return `${dayName} - ${formattedDate}`;
  };

  // دالة لحذف غياب طالب مع التأكيد
  const deleteAbsenceRecord = (recordId: string, studentName: string) => {
    const confirmDelete = window.confirm(
      `هل أنت متأكد من حذف غياب الطالب "${studentName}"؟\n\nسيتم حذف السجل بشكل نهائي.`
    );
    
    if (confirmDelete) {
      // حذف السجل من absenceRecords
      const recordToDelete = absenceRecords.find(r => r.id === recordId);
      
      if (recordToDelete) {
        setAbsenceRecords(prev => prev.filter(r => r.id !== recordId));
        
        // تحديث حالة الطالب إلى حاضر إذا لم يكن له سجلات غياب أخرى في نفس اليوم
        const otherRecordsOnSameDay = absenceRecords.filter(
          r => r.studentId === recordToDelete.studentId && 
          r.date === recordToDelete.date && 
          r.id !== recordId
        );
        
        if (otherRecordsOnSameDay.length === 0) {
          setStudents(prev => prev.map(s => 
            s.id === recordToDelete.studentId ? { ...s, status: 'present' } : s
          ));
        }
        
        alert('✅ تم حذف غياب الطالب بنجاح!');
      }
    }
  };

  // دالة لفتح نموذج التحويل للموجه (3 أيام)
  const openGuidanceForm = (student: Student) => {
    setSelectedStudentForAction(student);
    setShowGuidanceForm(true);
  };

  // دالة لفتح نموذج استدعاء ولي الأمر (5 أيام)
  const openParentSummonForm = (student: Student) => {
    setSelectedStudentForAction(student);
    setShowParentSummonForm(true);
  };

  // دالة لفتح نموذج إشعار إدارة التعليم (10 أيام)
  const openEducationNotification = (student: Student) => {
    setSelectedStudentForAction(student);
    setShowEducationNotification(true);
  };

  // دالة لفتح نافذة إرسال الرسالة
  const openSendMessage = (student: Student, type: '3days' | '5days' | '10days') => {
    setSelectedStudentForAction(student);
    setMessageType(type);
    setShowSendMessageModal(true);
  };

  // دالة للحصول على أيقونة التنبيه حسب عدد أيام الغياب
  const getAlertIcon = (absenceDays: number) => {
    if (absenceDays >= 10) {
      return <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />;
    } else if (absenceDays >= 5) {
      return <AlertCircle className="h-5 w-5 text-orange-500 animate-pulse" />;
    } else if (absenceDays >= 3) {
      return <Bell className="h-5 w-5 text-yellow-500 animate-pulse" />;
    }
    return null;
  };

  // دالة توليد رابط الغياب البسيطة
  const generateAbsenceLinkDirect = () => {
    const token = generateAccessToken();
    const link = `${window.location.origin}/absence-link/${token}`;
    const expiry = calculateLinkExpiry();
    setGeneratedAbsenceLink(link);
    setAbsenceLinkExpiry(expiry);
    console.log('تم توليد رابط الغياب:', link);
  };

  // تحديث بيانات الغياب التجريبية عند تحميل الصفحة
  useState(() => {
    // بيانات تجريبية لبعض الطلاب
    setStudentAbsenceData({
      '1': { 
        totalDays: 3, 
        dates: [
          { date: '2025-12-24', day: 'الثلاثاء' },
          { date: '2025-12-23', day: 'الاثنين' },
          { date: '2025-12-22', day: 'الأحد' }
        ]
      },
      '3': { 
        totalDays: 5, 
        dates: [
          { date: '2025-12-24', day: 'الثلاثاء' },
          { date: '2025-12-23', day: 'الاثنين' },
          { date: '2025-12-22', day: 'الأحد' },
          { date: '2025-12-21', day: 'السبت' },
          { date: '2025-12-19', day: 'الخميس' }
        ]
      },
      '5': { 
        totalDays: 10, 
        dates: [
          { date: '2025-12-24', day: 'الثلاثاء' },
          { date: '2025-12-23', day: 'الاثنين' },
          { date: '2025-12-22', day: 'الأحد' },
          { date: '2025-12-21', day: 'السبت' },
          { date: '2025-12-19', day: 'الخميس' },
          { date: '2025-12-18', day: 'الأربعاء' },
          { date: '2025-12-17', day: 'الثلاثاء' },
          { date: '2025-12-16', day: 'الاثنين' },
          { date: '2025-12-15', day: 'الأحد' },
          { date: '2025-12-14', day: 'السبت' }
        ]
      },
      '7': { 
        totalDays: 12, 
        dates: [
          { date: '2025-12-24', day: 'الثلاثاء' },
          { date: '2025-12-23', day: 'الاثنين' },
          { date: '2025-12-22', day: 'الأحد' },
          { date: '2025-12-21', day: 'السبت' },
          { date: '2025-12-19', day: 'الخميس' },
          { date: '2025-12-18', day: 'الأربعاء' },
          { date: '2025-12-17', day: 'الثلاثاء' },
          { date: '2025-12-16', day: 'الاثنين' },
          { date: '2025-12-15', day: 'الأحد' },
          { date: '2025-12-14', day: 'السبت' },
          { date: '2025-12-12', day: 'الخميس' },
          { date: '2025-12-11', day: 'الأربعاء' }
        ]
      }
    });
  });

  // فلترة الطلاب في النافذة المنبثقة
  const getModalFilteredStudents = () => {
    if (searchMode === 'name') {
      return students.filter(s => 
        s.name.includes(studentNameSearch) || s.studentId.includes(studentNameSearch)
      );
    } else {
      if (!modalGrade || !modalClass) return [];
      return students.filter(s => 
        s.grade === modalGrade && s.classRoom.includes(modalClass)
      );
    }
  };

  // فلترة الطلاب
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm) || student.studentId.includes(searchTerm);
    const matchesGrade = !selectedGrade || student.grade === selectedGrade;
    const matchesClass = !selectedClass || student.classRoom.includes(selectedClass);
    const matchesStudent = !selectedStudentId || student.id === selectedStudentId;
    
    return matchesSearch && matchesGrade && matchesClass && matchesStudent;
  });

  // إحصائيات الغياب اليومي - مع الأخذ بعين الاعتبار الطالب المحدد
  const todayAbsenceRecords = absenceRecords.filter(record => {
    if (record.date !== selectedDate) return false;
    if (selectedStudentId && record.studentId !== selectedStudentId) return false;
    if (selectedGrade) {
      const student = students.find(s => s.id === record.studentId);
      if (!student || student.grade !== selectedGrade) return false;
      if (selectedClass && !student.classRoom.includes(selectedClass)) return false;
    }
    return true;
  });
  const absentCount = filteredStudents.filter(s => s.status === 'absent').length;
  const presentCount = filteredStudents.filter(s => s.status === 'present').length;
  const absencePercentage = filteredStudents.length > 0 
    ? Math.round((absentCount / filteredStudents.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 font-kufi" style={{ direction: 'rtl' }}>
      {/* شريط العنوان منفصل */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
            <UserX className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">رصد الغياب اليومي</h1>
          </div>
        </div>
      </div>



      {/* شريط الأزرار منفصل */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="pt-6 pb-6 px-6">
          <div className="grid grid-cols-6 gap-2">
            {/* 1. زر رصد الغياب اليومي */}
            <button
              onClick={() => setShowAbsenceModal(true)}
              className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-4 rounded-md transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">رصد الغياب اليومي</span>
            </button>

            {/* 2. زر توليد رابط الغياب */}
            <button
              onClick={generateAbsenceLinkDirect}
              className="bg-gradient-to-r from-[#818cf8] to-[#6366f1] hover:from-[#6366f1] hover:to-[#4f46e5] text-white shadow-md h-auto py-4 rounded-md transition-all flex items-center justify-center gap-1.5"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">توليد رابط الغياب</span>
            </button>

            {/* 3. زر رابط المعلم */}
            <button
              onClick={generateTeacherLink}
              className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] hover:from-[#4f46e5] hover:to-[#6366f1] text-white shadow-md h-auto py-4 rounded-md transition-all flex items-center justify-center gap-1.5"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">رابط المعلم</span>
            </button>

            {/* 4. زر إرسال رسائل الغياب */}
            <button
              onClick={() => setShowSendAbsenceModal(true)}
              className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-4 rounded-md transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">إرسال</span>
            </button>

            {/* 5. زر التقارير مع قائمة منسدلة */}
            <div className="relative">
              <button
                onClick={() => setShowReportsMenu(!showReportsMenu)}
                className="w-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-4 rounded-md transition-all flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">التقارير</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showReportsMenu ? 'rotate-180' : ''}`} />
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
                      <TrendingDown className="h-4 w-4 text-[#4f46e5]" />
                      <span className="font-medium">تقرير شهري</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 6. زر تصدير الغياب XML */}
            <button
              onClick={exportAbsenceToXML}
              className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-4 rounded-md transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">تصدير XML</span>
            </button>
          </div>
        </div>
      </div>

      {/* رابط الغياب المُولد */}
      {generatedAbsenceLink && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-[#6366f1] rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="bg-[#6366f1] p-3 rounded-lg">
                <LinkIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#4f46e5] mb-1">رابط الغياب</h3>
                <p className="text-sm text-gray-600">شارك هذا الرابط لرصد الغياب</p>
              </div>
            </div>
            <button
              onClick={() => setGeneratedAbsenceLink('')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">
              <input
                type="text"
                value={generatedAbsenceLink}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 font-mono outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedAbsenceLink);
                  alert('تم نسخ الرابط!');
                }}
                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                نسخ
              </button>
            </div>

            {absenceLinkExpiry && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>صالح حتى: {absenceLinkExpiry.toLocaleTimeString('ar-SA')}</span>
              </div>
            )}

            <button
              onClick={() => {
                const message = `رابط رصد الغياب:\n${generatedAbsenceLink}`;
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <MessageSquare className="h-5 w-5" />
              إرسال عبر واتساب
            </button>
          </div>
        </div>
      )}

      {/* رابط المعلم المُولد */}
      {Object.keys(generatedLinks).length > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <LinkIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-3">روابط المعلمين</h3>
              {Object.entries(generatedLinks).map(([key, data]) => (
                <div key={key} className="mb-3 last:mb-0">
                  <p className="text-sm text-green-800 mb-2 font-medium">{key}</p>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
                    <input
                      type="text"
                      value={data.link}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-gray-700 font-mono outline-none"
                    />
                    <button
                      onClick={() => copyLinkToClipboard(data.link)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      نسخ
                    </button>
                  </div>
                  <p className="text-xs text-green-700 mt-2 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    صالح حتى: {data.expiry.toLocaleTimeString('ar-SA')}
                  </p>
                </div>
              ))}
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
                  {formatDateWithDay(selectedDate)}
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
                {selectedGrade && getClassesForGrade(selectedGrade).map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
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
                      const gradeNumber = grades.indexOf(selectedGrade) + 1;
                      return student.classRoom.includes(`-${gradeNumber}`) || student.classRoom === `${selectedGrade} أ` || student.classRoom === `${selectedGrade} ب` || student.classRoom === `${selectedGrade} ج`;
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
                // منطق البحث يتم تلقائياً عبر filteredStudents
                console.log('البحث عن:', { selectedDate, selectedGrade, selectedClass, selectedStudentId });
              }}
              className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white px-12 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              بحث
            </button>
          </div>
        </div>
      </div>

      {/* بطاقة الطلاب الغائبون */}
      <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-[#4f46e5] to-[#6366f1]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <UserX className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">الطلاب الغائبون</h2>
                <p className="text-white/80 text-sm mt-1">سجل الغياب ليوم {formatDateWithDay(selectedDate)}</p>
              </div>
            </div>
            {todayAbsenceRecords.length > 0 && (
              <div className="bg-white/20 px-6 py-3 rounded-xl">
                <p className="text-white text-3xl font-bold">{todayAbsenceRecords.length}</p>
                <p className="text-white/80 text-xs">طالب غائب</p>
              </div>
            )}
          </div>
        </div>

        {todayAbsenceRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-800">اسم الطالب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-800">الصف</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-800">الفصل</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-800">يوم الغياب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-800">تاريخ الغياب</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-800">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {todayAbsenceRecords.map((record) => {
                  const student = students.find(s => s.id === record.studentId);
                  if (!student) return null;

                  const recordDate = new Date(record.date);
                  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                  const dayName = days[recordDate.getDay()];

                  return (
                    <tr key={record.id} className="hover:bg-red-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 p-2 rounded-lg">
                            <UserX className="h-5 w-5 text-red-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-900">{record.studentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {student.grade}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {student.classRoom}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-sm font-medium">
                          <Calendar className="h-4 w-4 ml-1" />
                          {dayName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {new Date(record.date).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => deleteAbsenceRecord(record.id, record.studentName)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all font-bold text-sm shadow-md flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            حذف
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
          <div className="p-16 text-center">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">لم يتم رصد الغياب لهذا اليوم</h3>
            <p className="text-gray-500 text-sm">جميع الطلاب حاضرون أو لم يتم رصد الغياب بعد</p>
          </div>
        )}
      </div>

      {/* نافذة رصد الغياب اليومي */}
      {showAbsenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* رأس النافذة */}
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">رصد الغياب اليومي</h2>
                </div>
                <button
                  onClick={() => {
                    setShowAbsenceModal(false);
                    setModalGrade('');
                    setModalClass('');
                    setModalStudentId('');
                    setModalShowAllStudents(false);
                    setSelectedStudentIds(new Set());
                    setStudentNameSearch('');
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* محتوى النافذة */}
            <div className="p-6 space-y-6">
              {/* اختيار طريقة البحث */}
              <div className="flex gap-3 bg-gray-100 p-2 rounded-lg">
                <button
                  onClick={() => setSearchMode('class')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    searchMode === 'class'
                      ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  البحث بالصف والفصل
                </button>
                <button
                  onClick={() => setSearchMode('name')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    searchMode === 'name'
                      ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  البحث بالاسم
                </button>
              </div>

              {/* البحث بالصف والفصل */}
              {searchMode === 'class' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الصف</label>
                      <select
                        value={modalGrade}
                        onChange={(e) => setModalGrade(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
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
                        onChange={(e) => setModalClass(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
                      >
                        <option value="">اختر الفصل</option>
                        {classes.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showAllStudents"
                      checked={modalShowAllStudents}
                      onChange={(e) => setModalShowAllStudents(e.target.checked)}
                      className="w-5 h-5 text-[#4f46e5] rounded focus:ring-[#4f46e5]"
                    />
                    <label htmlFor="showAllStudents" className="text-sm font-medium text-gray-700">
                      عرض جميع طلاب الفصل
                    </label>
                  </div>
                </div>
              )}

              {/* البحث بالاسم */}
              {searchMode === 'name' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="inline h-4 w-4 ml-1" />
                    البحث باسم الطالب أو رقمه
                  </label>
                  <input
                    type="text"
                    placeholder="اكتب اسم الطالب أو رقمه للبحث"
                    value={studentNameSearch}
                    onChange={(e) => setStudentNameSearch(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
                  />
                </div>
              )}

              {/* قائمة الطلاب */}
              {((searchMode === 'class' && modalGrade && modalClass && modalShowAllStudents) || 
                (searchMode === 'name' && studentNameSearch)) && (
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b-2 border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">قائمة الطلاب</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {getModalFilteredStudents().map(student => (
                      <div
                        key={student.id}
                        className={`p-4 border-b border-gray-200 transition-all ${
                          selectedStudentIds.has(student.id) ? 'bg-red-50' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* معلومات الطالب */}
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.classRoom} | {student.studentId}</p>
                          </div>
                          
                          {/* زر الحالة */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleStudentSelection(student.id)}
                              className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-md ${
                                selectedStudentIds.has(student.id)
                                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                              }`}
                            >
                              {selectedStudentIds.has(student.id) ? 'غائب' : 'حاضر'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* معلومات إضافية */}
              {selectedStudentIds.size > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">
                    تم اختيار {selectedStudentIds.size} طالب لرصد الغياب
                  </p>
                </div>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="bg-gray-50 p-6 rounded-b-2xl border-t-2 border-gray-200 flex gap-3 sticky bottom-0">
              <button
                onClick={handleAbsenceModalSubmit}
                disabled={selectedStudentIds.size === 0}
                className={`flex-1 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  selectedStudentIds.size === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] shadow-md'
                }`}
              >
                <Save className="w-5 h-5" />
                حفظ الغياب
              </button>
              <button
                onClick={() => {
                  setShowAbsenceModal(false);
                  setModalGrade('');
                  setModalClass('');
                  setModalStudentId('');
                  setModalShowAllStudents(false);
                  setSelectedStudentIds(new Set());
                  setStudentNameSearch('');
                }}
                className="flex-1 py-3 bg-white border-2 border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                رجوع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نماذج الإجراءات */}
      {showGuidanceForm && selectedStudentForAction && (
        <GuidanceReferralForm
          student={selectedStudentForAction}
          absenceDays={getStudentAbsenceDays(selectedStudentForAction.id).dates}
          totalAbsenceDays={getStudentAbsenceDays(selectedStudentForAction.id).totalDays}
          onClose={() => {
            setShowGuidanceForm(false);
            setSelectedStudentForAction(null);
          }}
        />
      )}

      {showParentSummonForm && selectedStudentForAction && (
        <ParentSummonForm
          student={selectedStudentForAction}
          absenceDays={getStudentAbsenceDays(selectedStudentForAction.id).dates}
          totalAbsenceDays={getStudentAbsenceDays(selectedStudentForAction.id).totalDays}
          onClose={() => {
            setShowParentSummonForm(false);
            setSelectedStudentForAction(null);
          }}
        />
      )}

      {showEducationNotification && selectedStudentForAction && (
        <EducationOfficeNotification
          student={selectedStudentForAction}
          absenceDays={getStudentAbsenceDays(selectedStudentForAction.id).dates}
          totalAbsenceDays={getStudentAbsenceDays(selectedStudentForAction.id).totalDays}
          onClose={() => {
            setShowEducationNotification(false);
            setSelectedStudentForAction(null);
          }}
        />
      )}

      {showSendMessageModal && selectedStudentForAction && (
        <SendMessageModal
          student={selectedStudentForAction}
          absenceDays={getStudentAbsenceDays(selectedStudentForAction.id).dates}
          totalAbsenceDays={getStudentAbsenceDays(selectedStudentForAction.id).totalDays}
          messageType={messageType}
          onClose={() => {
            setShowSendMessageModal(false);
            setSelectedStudentForAction(null);
          }}
        />
      )}

      {/* نافذة رابط المعلم */}
      {showGenerateTeacherLinkModal && (
        <GenerateTeacherLinkModal
          onClose={() => setShowGenerateTeacherLinkModal(false)}
        />
      )}

      {/* نافذة إرسال رسائل الغياب */}
      {showSendAbsenceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">إرسال رسائل الغياب</h2>
                    <p className="text-white/80 text-sm mt-1">إشعار أولياء الأمور بغياب أبنائهم</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSendAbsenceModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* نوع الرسالة */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">نوع الرسالة</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setMessagePeriod('daily');
                      setMessageTemplate(`المكرم ولي أمر الطالب [اسم الطالب] بالصف [الصف] والفصل [الفصل] نشعركم بغياب ابنكم هذا اليوم الموافق [التاريخ]، نأمل الحرص على الحضور وعدم الغياب، نحن وأنتم شركاء في النجاح فكونوا عوناً لنا في تحقيق الانضباط.`);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      messagePeriod === 'daily'
                        ? 'border-[#4f46e5] bg-[#4f46e5]/5'
                        : 'border-gray-200 hover:border-[#818cf8]'
                    }`}
                  >
                    <Calendar className={`h-6 w-6 mx-auto mb-2 ${
                      messagePeriod === 'daily' ? 'text-[#4f46e5]' : 'text-gray-400'
                    }`} />
                    <p className={`font-bold ${
                      messagePeriod === 'daily' ? 'text-[#4f46e5]' : 'text-gray-600'
                    }`}>رسالة يومية</p>
                  </button>

                  <button
                    onClick={() => {
                      setMessagePeriod('weekly');
                      setMessageTemplate(`المكرم ولي أمر الطالب [اسم الطالب] بالصف [الصف] والفصل [الفصل] نشعركم بغياب ابنكم لهذا الأسبوع [عدد مرات الغياب] مرات، نأمل الحرص على الحضور وعدم الغياب، نحن وأنتم شركاء في النجاح فكونوا عوناً لنا في تحقيق الانضباط.`);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      messagePeriod === 'weekly'
                        ? 'border-[#6366f1] bg-[#6366f1]/5'
                        : 'border-gray-200 hover:border-[#818cf8]'
                    }`}
                  >
                    <Calendar className={`h-6 w-6 mx-auto mb-2 ${
                      messagePeriod === 'weekly' ? 'text-[#6366f1]' : 'text-gray-400'
                    }`} />
                    <p className={`font-bold ${
                      messagePeriod === 'weekly' ? 'text-[#6366f1]' : 'text-gray-600'
                    }`}>رسالة أسبوعية</p>
                  </button>

                  <button
                    onClick={() => {
                      setMessagePeriod('monthly');
                      setMessageTemplate(`المكرم ولي أمر الطالب [اسم الطالب] بالصف [الصف] والفصل [الفصل] نشعركم بغياب ابنكم لهذا الشهر [عدد مرات الغياب] مرات، نأمل الحرص على الحضور وعدم الغياب، نحن وأنتم شركاء في النجاح فكونوا عوناً لنا في تحقيق الانضباط.`);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      messagePeriod === 'monthly'
                        ? 'border-[#818cf8] bg-[#818cf8]/5'
                        : 'border-gray-200 hover:border-[#818cf8]'
                    }`}
                  >
                    <Calendar className={`h-6 w-6 mx-auto mb-2 ${
                      messagePeriod === 'monthly' ? 'text-[#818cf8]' : 'text-gray-400'
                    }`} />
                    <p className={`font-bold ${
                      messagePeriod === 'monthly' ? 'text-[#818cf8]' : 'text-gray-600'
                    }`}>رسالة شهرية</p>
                  </button>
                </div>
              </div>

              {/* قالب الرسالة */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">قالب الرسالة</label>
                <textarea
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all min-h-[150px] font-arabic"
                  placeholder="اكتب قالب الرسالة هنا..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  * يمكنك استخدام: [اسم الطالب]، [الصف]، [الفصل]، [التاريخ]، [عدد مرات الغياب]
                </p>
              </div>

              {/* اختيار الطلاب */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">تحديد الطلاب</label>
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="allAbsentStudents"
                        onChange={(e) => {
                          if (e.target.checked) {
                            const absentIds = absenceRecords
                              .filter(r => r.date === selectedDate)
                              .map(r => r.studentId);
                            setSelectedStudentsForMessage(absentIds);
                          } else {
                            setSelectedStudentsForMessage([]);
                          }
                        }}
                        className="w-4 h-4 text-[#4f46e5] rounded"
                      />
                      <label htmlFor="allAbsentStudents" className="text-sm font-bold text-gray-700">
                        تحديد جميع الطلاب الغائبين اليوم
                      </label>
                    </div>

                    {absenceRecords.filter(r => r.date === selectedDate).length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {absenceRecords
                          .filter(r => r.date === selectedDate)
                          .map((record) => (
                            <div
                              key={record.id}
                              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                            >
                              <input
                                type="checkbox"
                                checked={selectedStudentsForMessage.includes(record.studentId)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudentsForMessage(prev => [...prev, record.studentId]);
                                  } else {
                                    setSelectedStudentsForMessage(prev =>
                                      prev.filter(id => id !== record.studentId)
                                    );
                                  }
                                }}
                                className="w-4 h-4 text-[#4f46e5] rounded"
                              />
                              <div className="flex-1">
                                <p className="font-bold text-gray-800">{record.studentName}</p>
                                <p className="text-xs text-gray-500">{record.classRoom}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>لا يوجد طلاب غائبين اليوم</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* خيارات الإرسال */}
              <div className="grid grid-cols-2 gap-4">
                {/* جدولة الإرسال */}
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="scheduleSending"
                      checked={scheduleSending}
                      onChange={(e) => setScheduleSending(e.target.checked)}
                      className="w-4 h-4 text-[#4f46e5] rounded"
                    />
                    <label htmlFor="scheduleSending" className="text-sm font-bold text-gray-700">
                      جدولة الإرسال
                    </label>
                  </div>
                  {scheduleSending && (
                    <input
                      type="time"
                      value={sendingTime}
                      onChange={(e) => setSendingTime(e.target.value)}
                      className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                    />
                  )}
                </div>

                {/* إرفاق تقرير PDF */}
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="attachPdf"
                      checked={attachPdfReport}
                      onChange={(e) => setAttachPdfReport(e.target.checked)}
                      className="w-4 h-4 text-[#4f46e5] rounded"
                    />
                    <label htmlFor="attachPdf" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#6366f1]" />
                      إرفاق تقرير PDF
                    </label>
                  </div>
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#4f46e5] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-bold mb-1">ملاحظات:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>سيتم إرسال الرسالة عبر WhatsApp و SMS لأولياء الأمور</li>
                      <li>في حالة الجدولة، سيتم الإرسال تلقائياً في الوقت المحدد</li>
                      <li>يمكن إرفاق تقرير PDF يحتوي على تفاصيل الغياب</li>
                      <li>سيتم استبدال المتغيرات تلقائياً ببيانات كل طالب</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-200 p-6 flex items-center justify-between bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowSendAbsenceModal(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-all"
              >
                إلغاء
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <p className="text-xs text-gray-500">عدد الرسائل</p>
                  <p className="text-lg font-bold text-[#4f46e5]">
                    {selectedStudentsForMessage.length}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (selectedStudentsForMessage.length === 0) {
                      alert('الرجاء تحديد طلاب للإرسال');
                      return;
                    }
                    if (!messageTemplate.trim()) {
                      alert('الرجاء كتابة قالب الرسالة');
                      return;
                    }
                    
                    // محاكاة الإرسال
                    const action = scheduleSending ? 'جدولة' : 'إرسال';
                    alert(`تم ${action} ${selectedStudentsForMessage.length} رسالة بنجاح!`);
                    
                    // إعادة تعيين النموذج
                    setShowSendAbsenceModal(false);
                    setSelectedStudentsForMessage([]);
                    setScheduleSending(false);
                    setSendingTime('');
                    setAttachPdfReport(false);
                  }}
                  className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  {scheduleSending ? 'جدولة الإرسال' : 'إرسال الآن'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsenceTracking;
