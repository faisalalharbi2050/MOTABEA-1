import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Calendar, Users, Send, FileText, BarChart3, AlertTriangle, CheckCircle, Clock, Bell, X, Eye, EyeOff, TrendingUp, CalendarDays, User, ArrowRight, UserPlus, Trash2 } from 'lucide-react';
import { AbsentTeacher, WaitingAssignment, TeacherSchedulePeriod, SubstituteTeacher, StaffMember } from '@/types/dailyWait';
import UnifiedSubstituteSelection from '@/components/DailyWaiting/UnifiedSubstituteSelection';
import EnhancedNotificationSystem from '@/components/DailyWaiting/EnhancedNotificationSystem';
import ReportsSystem from '@/components/DailyWaiting/ReportsSystem';
import NotificationHistoryPage from './NotificationHistoryPage';
// @ts-ignore - Import issue will resolve on rebuild
import PDFGenerator from '@/components/DailyWaiting/PDFGenerator';
import '@/styles/daily-waiting.css';
import '@/styles/daily-waiting-rtl.css';

const DailyWaitingManagementPage: React.FC = () => {
  // إدارة الحالة
  const [absentTeachers, setAbsentTeachers] = useState<AbsentTeacher[]>([]);
  const [waitingAssignments, setWaitingAssignments] = useState<WaitingAssignment[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<SubstituteTeacher[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [absenceType, setAbsenceType] = useState<'full_day' | 'specific_periods' | ''>('');
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [currentTeacherSchedule, setCurrentTeacherSchedule] = useState<TeacherSchedulePeriod[]>([]);
  const [autoAssignmentEnabled, setAutoAssignmentEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('main');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState<boolean>(false);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [isSendNotificationDialogOpen, setIsSendNotificationDialogOpen] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [showNotificationHistory, setShowNotificationHistory] = useState<boolean>(false);
  const [selectedTeachersForNotification, setSelectedTeachersForNotification] = useState<string[]>([]);
  const [customMessages, setCustomMessages] = useState<{[teacherId: string]: string}>({});
  const [selectedStaffForPDF, setSelectedStaffForPDF] = useState<string[]>([]);
  const [pdfStaffSearchTerm, setPdfStaffSearchTerm] = useState<string>('');
  const [showPDFSection, setShowPDFSection] = useState<boolean>(false);
  
  // حالات جديدة لإدارة الموظفين المخصصين
  const [customStaff, setCustomStaff] = useState<any[]>([]);
  const [showAddStaffDialog, setShowAddStaffDialog] = useState<boolean>(false);
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffPosition, setNewStaffPosition] = useState<string>('');
  const [newStaffPhone, setNewStaffPhone] = useState<string>('');
  const [newStaffType, setNewStaffType] = useState<'teacher' | 'admin'>('teacher');

  // إحصائيات الانتظار
  const [waitingStats, setWaitingStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0
  });

  // بيانات وهمية للمعلمين والموظفين
  const mockTeachers = [
    { id: '1', name: 'أحمد محمد علي', subject: 'الرياضيات', position: 'معلم', phone: '0501234567', type: 'teacher' },
    { id: '2', name: 'فاطمة أحمد السلمي', subject: 'اللغة العربية', position: 'معلمة', phone: '0501234568', type: 'teacher' },
    { id: '3', name: 'محمد سالم القحطاني', subject: 'العلوم', position: 'معلم', phone: '0501234569', type: 'teacher' },
    { id: '4', name: 'نورا عبدالله المطيري', subject: 'اللغة الإنجليزية', position: 'معلمة', phone: '0501234570', type: 'teacher' },
    { id: '5', name: 'خالد سعد الغامدي', subject: 'التربية البدنية', position: 'معلم', phone: '0501234571', type: 'teacher' },
    { id: '6', name: 'سارة عبدالرحمن الدوسري', subject: 'التاريخ', position: 'معلمة', phone: '0501234572', type: 'teacher' },
    { id: '7', name: 'عبدالعزيز ناصر الشهري', subject: 'الجغرافيا', position: 'معلم', phone: '0501234573', type: 'teacher' },
    { id: '8', name: 'منى سليمان العتيبي', subject: 'الحاسب الآلي', position: 'معلمة', phone: '0501234574', type: 'teacher' }
  ];

  // بيانات وهمية للإداريين
  const mockAdminStaff = [
    { id: 'admin1', name: 'عبدالله محمد السلمي', position: 'مدير', phone: '0501111111', type: 'admin' },
    { id: 'admin2', name: 'أحمد سالم القحطاني', position: 'وكيل', phone: '0501111112', type: 'admin' },
    { id: 'admin3', name: 'فهد عبدالعزيز المطيري', position: 'مرشد طلابي', phone: '0501111113', type: 'admin' },
    { id: 'admin4', name: 'خالد حسن الغامدي', position: 'رائد نشاط', phone: '0501111114', type: 'admin' },
    { id: 'admin5', name: 'سعد عبدالرحمن الدوسري', position: 'محضر مختبر', phone: '0501111115', type: 'admin' }
  ];

  // دمج جميع الموظفين (معلمين + إداريين + موظفين مخصصين)
  const allStaff = [...mockTeachers, ...mockAdminStaff, ...customStaff];
  
  // دمج المعلمين مع الموظفين المخصصين من نوع معلم
  const allTeachers = [...mockTeachers, ...customStaff.filter(s => s.type === 'teacher')];

  // بيانات وهمية للجدول المدرسي
  const mockScheduleData: { [key: string]: TeacherSchedulePeriod[] } = {
    '1': [
      { periodNumber: 1, className: '1/1', subject: 'الرياضيات', isAssigned: false, isWarning: true },
      { periodNumber: 3, className: '2/2', subject: 'الرياضيات', isAssigned: false, isWarning: true },
      { periodNumber: 5, className: '3/1', subject: 'الرياضيات', isAssigned: false, isWarning: true }
    ],
    '2': [
      { periodNumber: 2, className: '1/1', subject: 'اللغة العربية', isAssigned: false, isWarning: true },
      { periodNumber: 4, className: '2/1', subject: 'اللغة العربية', isAssigned: false, isWarning: true },
      { periodNumber: 6, className: '3/2', subject: 'اللغة العربية', isAssigned: false, isWarning: true }
    ]
  };

  // تحديث الإحصائيات عند التحميل
  useEffect(() => {
    calculateWaitingStats();
  }, [waitingAssignments, selectedDate]);

  // تحديث الرسالة الافتراضية عند فتح مربع الإرسال
  useEffect(() => {
    if (isSendNotificationDialogOpen) {
      const pendingAssignments = waitingAssignments.filter(a => !a.isNotificationSent);
      
      // تجميع الإسنادات حسب المعلم
      const teacherAssignments = new Map<string, WaitingAssignment[]>();
      pendingAssignments.forEach(assignment => {
        const teacherId = assignment.substituteTeacherId;
        if (!teacherAssignments.has(teacherId)) {
          teacherAssignments.set(teacherId, []);
        }
        teacherAssignments.get(teacherId)!.push(assignment);
      });

      // إنشاء رسالة مخصصة لكل معلم
      const messages: {[teacherId: string]: string} = {};
      const selectedIds: string[] = [];
      
      teacherAssignments.forEach((assignments, teacherId) => {
        selectedIds.push(teacherId);
        const teacherName = assignments[0].substituteTeacherName;
        const dayName = getDayName(selectedDate);
        
        let message = `المعلم ${teacherName}، لديك `;
        
        if (assignments.length === 1) {
          const assignment = assignments[0];
          message += `حصة انتظار هذا ${dayName}، الموافق ${selectedDate}، الحصة ${assignment.periodNumber} في فصل ${assignment.className} بدلاً من المعلم ${assignment.absentTeacherName}.`;
        } else {
          message += `${assignments.length} حصص انتظار هذا ${dayName}، الموافق ${selectedDate}:\n`;
          assignments.forEach((assignment, index) => {
            message += `\n${index + 1}. الحصة ${assignment.periodNumber} في فصل ${assignment.className} بدلاً من المعلم ${assignment.absentTeacherName}`;
          });
          message += '\n';
        }
        
        message += `\n\nالرجاء تأكيد العلم والاطلاع عبر الرابط التالي:\n${window.location.origin}/confirm/${teacherId}/${selectedDate}\n\nشاكرين تعاونكم.`;
        
        messages[teacherId] = message;
      });
      
      setCustomMessages(messages);
      setSelectedTeachersForNotification(selectedIds);
    }
  }, [isSendNotificationDialogOpen, waitingAssignments, selectedDate]);

  // دالة للحصول على اسم اليوم
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  // حساب إحصائيات الانتظار
  const calculateWaitingStats = () => {
    const today = new Date(selectedDate);
    const currentDate = new Date();
    
    // حساب اليومي
    const dailyCount = waitingAssignments.filter(a => a.date === selectedDate).length;
    
    // حساب الأسبوعي
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weeklyCount = waitingAssignments.filter(a => {
      const assignmentDate = new Date(a.date);
      return assignmentDate >= weekStart && assignmentDate <= weekEnd;
    }).length;
    
    // حساب الشهري
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const monthlyCount = waitingAssignments.filter(a => {
      const assignmentDate = new Date(a.date);
      return assignmentDate >= monthStart && assignmentDate <= monthEnd;
    }).length;
    
    setWaitingStats({
      daily: dailyCount,
      weekly: weeklyCount,
      monthly: monthlyCount
    });
  };

  // تحويل التاريخ للهجري (مبسط)
  const convertToHijri = (gregorianDate: string): string => {
    const date = new Date(gregorianDate);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() - 579}هـ`;
  };

  // معالج تسجيل غياب المعلمين
  const handleTeacherAbsence = () => {
    if (selectedTeachers.length === 0) {
      return;
    }

    if (!absenceType) {
      alert('الرجاء تحديد نوع الغياب (يوم كامل أو حصص محددة)');
      return;
    }

    if (absenceType === 'specific_periods' && selectedPeriods.length === 0) {
      return;
    }

    // إظهار مربع الحوار للتأكيد
    setShowConfirmDialog(true);
  };
  
  // معالج إضافة موظف جديد
  const handleAddCustomStaff = () => {
    if (!newStaffName.trim()) {
      alert('الرجاء إدخال اسم الموظف');
      return;
    }
    
    if (!newStaffPosition.trim()) {
      alert('الرجاء إدخال الصفة الوظيفية');
      return;
    }
    
    const newStaff = {
      id: `custom_${Date.now()}`,
      name: newStaffName.trim(),
      position: newStaffPosition.trim(),
      subject: newStaffType === 'teacher' ? newStaffPosition.trim() : '',
      phone: newStaffPhone.trim() || '0500000000',
      type: newStaffType,
      isCustom: true
    };
    
    setCustomStaff(prev => [...prev, newStaff]);
    
    // إعادة تعيين النموذج
    setNewStaffName('');
    setNewStaffPosition('');
    setNewStaffPhone('');
    setNewStaffType('teacher');
    setShowAddStaffDialog(false);
    
    alert(`تم إضافة ${newStaff.name} بنجاح`);
  };
  
  // معالج حذف موظف مخصص
  const handleDeleteCustomStaff = (staffId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      setCustomStaff(prev => prev.filter(s => s.id !== staffId));
    }
  };

  // معالج تأكيد الغياب
  const confirmTeacherAbsence = () => {
    if (!absenceType) {
      alert('الرجاء تحديد نوع الغياب');
      return;
    }
    
    const newAbsences: AbsentTeacher[] = [];
    let allSchedules: TeacherSchedulePeriod[] = [];

    selectedTeachers.forEach(teacherId => {
      const teacher = allTeachers.find(t => t.id === teacherId);
      if (!teacher) return;

      const newAbsence: AbsentTeacher = {
        id: Date.now().toString() + Math.random(),
        teacherId: teacherId,
        teacherName: teacher.name,
        date: selectedDate,
        hijriDate: convertToHijri(selectedDate),
        absenceType: absenceType as 'full_day' | 'specific_periods',
        periods: absenceType === 'full_day' ? [1, 2, 3, 4, 5, 6, 7] : selectedPeriods,
        isConfirmed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      newAbsences.push(newAbsence);

      // جلب جدول المعلم
      const schedule = mockScheduleData[teacherId] || [];
      const filteredSchedule = schedule.filter(period => 
        newAbsence.periods.includes(period.periodNumber)
      );
      allSchedules = [...allSchedules, ...filteredSchedule];
    });

    setAbsentTeachers(prev => [...prev, ...newAbsences]);
    setCurrentTeacherSchedule(allSchedules);

    // إعادة تعيين النموذج
    setSelectedTeachers([]);
    setSelectedPeriods([]);
    setAbsenceType('');
    setTeacherSearchTerm('');
    
    // إغلاق Dialogs
    setShowConfirmDialog(false);
    setIsDialogOpen(false);
  };

  // معالج تأكيد الإسناد من المكون الفرعي
  const handleAssignmentComplete = (assignments: WaitingAssignment[]) => {
    setWaitingAssignments(prev => [...prev, ...assignments]);
    setCurrentTeacherSchedule([]);
  };

  // معالج تحديث الإشعارات
  const handleNotificationSent = (assignmentIds: string[]) => {
    setWaitingAssignments(prev => prev.map(assignment => 
      assignmentIds.includes(assignment.id) 
        ? { ...assignment, isNotificationSent: true }
        : assignment
    ));
  };

  // معالج تعطيل/تفعيل حصة في الجدول
  const toggleAssignmentVisibility = (assignmentId: string) => {
    setWaitingAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, isHidden: !assignment.isHidden }
        : assignment
    ));
  };

  // تصفية المعلمين حسب البحث
  const filteredTeachers = mockTeachers.filter(teacher =>
    teacher.name.toLowerCase().includes(teacherSearchTerm.toLowerCase())
  );

  // بيانات المدرسة
  const schoolInfo = {
    name: 'مدرسة الإمام محمد بن سعود الابتدائية',
    principalName: 'عبدالله محمد السلمي',
    vicePrincipalName: 'أحمد سالم القحطاني'
  };

  // عدد الإشعارات غير المقروءة
  const unreadNotificationsCount = waitingAssignments.filter(a => !a.isNotificationSent).length;

  // إذا كانت صفحة سجل الإشعارات مفتوحة
  if (showNotificationHistory) {
    return (
      <NotificationHistoryPage
        assignments={waitingAssignments}
        onBack={() => setShowNotificationHistory(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* عنوان الصفحة */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">الانتظار اليومي</h1>
          </div>
        </div>
        
        {/* البطاقات الإحصائية - تظهر دائماً في الواجهة الرئيسية */}
        {activeSection === 'main' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6" dir="rtl">
            {/* الصف الأول */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* بطاقة الغائبون اليوم */}
              <div 
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                onClick={() => {
                  // الانتقال لقسم الغائبين
                  const element = document.getElementById('absent-teachers-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div className="text-right flex-1">
                  <p className="text-red-600 text-sm font-bold mb-0.5">الغائبون اليوم</p>
                  <p className="text-2xl font-bold text-red-700">{absentTeachers.filter(t => t.date === selectedDate).length}</p>
                </div>
              </div>

              {/* بطاقة الانتظارات القادمة */}
              <div 
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                onClick={() => {
                  // يمكن إضافة وظيفة لعرض الانتظارات القادمة
                  alert('سيتم عرض المعلمين الغائبين في الأيام التالية قريباً');
                }}
              >
                <CalendarDays className="w-8 h-8 text-yellow-500" />
                <div className="text-right flex-1">
                  <p className="text-yellow-600 text-sm font-bold mb-0.5">الانتظارات القادمة</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {absentTeachers.filter(t => new Date(t.date) > new Date(selectedDate)).length}
                  </p>
                </div>
              </div>

              {/* بطاقة حصص غير مسندة */}
              <div 
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                onClick={() => {
                  const element = document.getElementById('unassigned-periods-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Clock className="w-8 h-8 text-yellow-500" />
                <div className="text-right flex-1">
                  <p className="text-yellow-600 text-sm font-bold mb-0.5">حصص غير مسندة</p>
                  <p className="text-2xl font-bold text-yellow-700">{currentTeacherSchedule.filter(p => !p.isAssigned).length}</p>
                </div>
              </div>

              {/* بطاقة الحصص المسندة */}
              <div 
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                onClick={() => {
                  const element = document.getElementById('assigned-periods-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="text-right flex-1">
                  <p className="text-green-600 text-sm font-bold mb-0.5">الحصص المسندة</p>
                  <p className="text-2xl font-bold text-green-700">{waitingAssignments.length}</p>
                </div>
              </div>
            </div>

            {/* الصف الثاني - بطاقات بلون أزرق فاتح جداً موحد */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* بطاقة إشعارات مرسلة - أزرق فاتح جداً */}
              <div 
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                onClick={() => setIsNotificationSheetOpen(true)}
              >
                <Send className="w-8 h-8 text-blue-500" />
                <div className="text-right flex-1">
                  <p className="text-blue-600 text-sm font-bold mb-0.5">إشعارات مرسلة</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {waitingAssignments.filter(a => a.isNotificationSent).length}
                  </p>
                </div>
              </div>

              {/* بطاقة انتظار اليوم - أزرق فاتح جداً */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <Calendar className="w-8 h-8 text-blue-500" />
                <div className="text-right flex-1">
                  <p className="text-blue-600 text-sm font-bold mb-0.5">انتظار اليوم</p>
                  <p className="text-2xl font-bold text-blue-700">{waitingStats.daily}</p>
                </div>
              </div>

              {/* بطاقة انتظار الأسبوع - أزرق فاتح جداً */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <TrendingUp className="w-8 h-8 text-blue-500" />
                <div className="text-right flex-1">
                  <p className="text-blue-600 text-sm font-bold mb-0.5">انتظار الأسبوع</p>
                  <p className="text-2xl font-bold text-blue-700">{waitingStats.weekly}</p>
                </div>
              </div>

              {/* بطاقة انتظار الشهر - أزرق فاتح جداً */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <BarChart3 className="w-8 h-8 text-blue-500" />
                <div className="text-right flex-1">
                  <p className="text-blue-600 text-sm font-bold mb-0.5">انتظار الشهر</p>
                  <p className="text-2xl font-bold text-blue-700">{waitingStats.monthly}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* شريط الأزرار الرئيسية */}
        {activeSection === 'main' && (
          <div className="max-w-7xl mx-auto mb-4">
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="pt-6 pb-6 px-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
                  {/* زر تسجيل غياب معلم */}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">تسجيل غياب معلم</span>
                      </button>
                    </DialogTrigger>
              <DialogContent 
                className="max-w-4xl max-h-[90vh] overflow-y-auto" 
                dir="rtl"
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-right text-gray-800">تسجيل غياب معلم</DialogTitle>
                </DialogHeader>
                <TeacherAbsenceForm 
                  teachers={allTeachers}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTeachers={selectedTeachers}
                  setSelectedTeachers={setSelectedTeachers}
                  absenceType={absenceType}
                  setAbsenceType={setAbsenceType}
                  selectedPeriods={selectedPeriods}
                  setSelectedPeriods={setSelectedPeriods}
                  onSubmit={handleTeacherAbsence}
                  teacherSearchTerm={teacherSearchTerm}
                  setTeacherSearchTerm={setTeacherSearchTerm}
                  filteredTeachers={allTeachers.filter(teacher =>
                    teacher.name.toLowerCase().includes(teacherSearchTerm.toLowerCase())
                  )}
                  showConfirmDialog={showConfirmDialog}
                  setShowConfirmDialog={setShowConfirmDialog}
                  onConfirm={confirmTeacherAbsence}
                  customStaff={customStaff}
                  onDeleteStaff={handleDeleteCustomStaff}
                  showAddStaffDialog={showAddStaffDialog}
                  setShowAddStaffDialog={setShowAddStaffDialog}
                  newStaffName={newStaffName}
                  setNewStaffName={setNewStaffName}
                  newStaffPosition={newStaffPosition}
                  setNewStaffPosition={setNewStaffPosition}
                  newStaffPhone={newStaffPhone}
                  setNewStaffPhone={setNewStaffPhone}
                  newStaffType={newStaffType}
                  setNewStaffType={setNewStaffType}
                  onAddStaff={handleAddCustomStaff}
                />
                <div className="flex justify-center pt-4 border-t-2 border-gray-200">
                  <Button
                    onClick={() => setIsDialogOpen(false)}
                    variant="outline"
                    className="w-48 border-2 border-gray-400 hover:bg-gray-100 text-lg py-3"
                  >
                    <X className="w-5 h-5 ml-2" />
                    إغلاق
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* زر إرسال الانتظار */}
            <Dialog open={isSendNotificationDialogOpen} onOpenChange={setIsSendNotificationDialogOpen}>
              <DialogTrigger asChild>
                <button 
                  onClick={() => {
                    // التحقق من وجود إسنادات
                    if (waitingAssignments.length === 0) {
                      alert('لا توجد إسنادات لإرسالها');
                      return;
                    }
                    const pendingAssignments = waitingAssignments.filter(a => !a.isNotificationSent);
                    if (pendingAssignments.length === 0) {
                      alert('تم إرسال جميع الإشعارات بالفعل');
                      return;
                    }
                    setIsSendNotificationDialogOpen(true);
                  }}
                  className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
                  disabled={waitingAssignments.length === 0}
                >
                  <Send className="w-4 h-4" />
                  <span className="text-sm">إرسال الانتظار</span>
                  {waitingAssignments.filter(a => !a.isNotificationSent).length > 0 && (
                    <span className="mr-2 bg-white text-blue-600 text-xs font-bold rounded-full px-2 py-0.5">
                      {waitingAssignments.filter(a => !a.isNotificationSent).length}
                    </span>
                  )}
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-right text-blue-800 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Send className="w-6 h-6 text-blue-600" />
                    </div>
                    إرسال الانتظار
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 p-4">
                  {/* معلومات الإرسال */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700 font-semibold">التاريخ:</span>
                        <span className="text-blue-800 font-bold">{getDayName(selectedDate)} {selectedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700 font-semibold">المعلمين المحددين:</span>
                        <span className="text-blue-800 font-bold">{selectedTeachersForNotification.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700 font-semibold">إجمالي الحصص:</span>
                        <span className="text-blue-800 font-bold">
                          {waitingAssignments.filter(a => !a.isNotificationSent).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* أزرار التحكم في الاختيار */}
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => {
                        const allTeacherIds = Array.from(new Set(waitingAssignments.filter(a => !a.isNotificationSent).map(a => a.substituteTeacherId)));
                        setSelectedTeachersForNotification(allTeacherIds);
                      }}
                      variant="outline"
                      className="border-2 border-green-400 text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      اختيار الكل
                    </Button>
                    <Button
                      onClick={() => setSelectedTeachersForNotification([])}
                      variant="outline"
                      className="border-2 border-red-400 text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 ml-2" />
                      إلغاء الكل
                    </Button>
                  </div>

                  {/* قائمة المعلمين مع رسائلهم المخصصة */}
                  <div className="space-y-3">
                    <Label className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      المعلمين والرسائل المخصصة ({Object.keys(customMessages).length})
                    </Label>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                      {Object.entries(customMessages).map(([teacherId, message]) => {
                        const assignment = waitingAssignments.find(a => a.substituteTeacherId === teacherId);
                        const teacherAssignments = waitingAssignments.filter(a => a.substituteTeacherId === teacherId && !a.isNotificationSent);
                        const isSelected = selectedTeachersForNotification.includes(teacherId);
                        
                        return (
                          <div key={teacherId} className={`border-2 rounded-lg p-4 transition-all ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                            {/* رأس المعلم */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedTeachersForNotification(prev => [...prev, teacherId]);
                                    } else {
                                      setSelectedTeachersForNotification(prev => prev.filter(id => id !== teacherId));
                                    }
                                  }}
                                  className="w-6 h-6"
                                />
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800 text-lg">{assignment?.substituteTeacherName}</p>
                                  <p className="text-sm text-gray-600">{teacherAssignments.length} حصة انتظار</p>
                                </div>
                              </div>
                              <Badge className={isSelected ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'}>
                                {isSelected ? 'محدد للإرسال' : 'مستثنى'}
                              </Badge>
                            </div>

                            {/* الرسالة المخصصة */}
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                نص الرسالة (قابل للتعديل)
                              </Label>
                              <textarea
                                value={message}
                                onChange={(e) => {
                                  setCustomMessages(prev => ({
                                    ...prev,
                                    [teacherId]: e.target.value
                                  }));
                                }}
                                rows={6}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg text-right focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none font-medium text-sm leading-relaxed bg-white"
                                disabled={!isSelected}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* أزرار التحكم النهائية */}
                  <div className="space-y-3">
                    {/* زر فتح قسم إرسال PDF */}
                    <div className="border-t-2 border-gray-200 pt-4">
                      <Button
                        onClick={() => setShowPDFSection(!showPDFSection)}
                        variant="outline"
                        className="w-full bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-2 border-blue-300 text-blue-700 font-bold py-4 text-lg"
                      >
                        <FileText className="w-5 h-5 ml-2" />
                        {showPDFSection ? 'إخفاء' : 'إظهار'} قسم إرسال جدول الانتظار PDF
                        {showPDFSection ? (
                          <X className="w-5 h-5 mr-2" />
                        ) : (
                          <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                      </Button>
                    </div>

                    {/* قسم إرسال PDF - يظهر عند الطلب */}
                    {showPDFSection && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-lg border-2 border-blue-300 animate-in slide-in-from-top">
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-lg font-bold text-blue-800 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            إرسال جدول الانتظار بصيغة PDF عبر الواتساب
                          </Label>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-400">
                            {selectedStaffForPDF.length} محدد
                          </Badge>
                        </div>

                        {/* أزرار تحديد سريع */}
                        <div className="flex gap-2 mb-3 flex-wrap">
                          <Button
                            onClick={() => setSelectedStaffForPDF(allStaff.map(s => s.id))}
                            variant="outline"
                            size="sm"
                            className="border-2 border-blue-400 text-blue-700 hover:bg-blue-100"
                          >
                            <CheckCircle className="w-4 h-4 ml-1" />
                            اختيار الكل
                          </Button>
                          <Button
                            onClick={() => setSelectedStaffForPDF(mockTeachers.map(t => t.id))}
                            variant="outline"
                            size="sm"
                            className="border-2 border-cyan-400 text-cyan-700 hover:bg-cyan-100"
                          >
                            المعلمين فقط
                          </Button>
                          <Button
                            onClick={() => setSelectedStaffForPDF(mockAdminStaff.map(a => a.id))}
                            variant="outline"
                            size="sm"
                            className="border-2 border-teal-400 text-teal-700 hover:bg-teal-100"
                          >
                            الإداريين فقط
                          </Button>
                          <Button
                            onClick={() => setSelectedStaffForPDF([])}
                            variant="outline"
                            size="sm"
                            className="border-2 border-red-400 text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 ml-1" />
                            إلغاء الكل
                          </Button>
                        </div>

                        {/* شريط البحث */}
                        <div className="relative mb-3">
                          <Input
                            type="text"
                            placeholder="ابحث عن موظف بالاسم..."
                            value={pdfStaffSearchTerm}
                            onChange={(e) => setPdfStaffSearchTerm(e.target.value)}
                            className="pr-10 text-right border-2 border-blue-300 focus:border-blue-500 bg-white"
                          />
                          <Users className="w-5 h-5 text-blue-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                        </div>

                        {/* قائمة الموظفين */}
                        <div className="border-2 border-blue-300 rounded-lg max-h-64 overflow-y-auto bg-white">
                          {/* المعلمين */}
                          <div className="p-3 bg-cyan-50 border-b-2 border-blue-200">
                            <p className="font-bold text-cyan-800 text-sm flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              المعلمين ({mockTeachers.filter(t => t.name.toLowerCase().includes(pdfStaffSearchTerm.toLowerCase())).length})
                            </p>
                          </div>
                          {mockTeachers
                            .filter(teacher => teacher.name.toLowerCase().includes(pdfStaffSearchTerm.toLowerCase()))
                            .map((teacher) => {
                              const isSelected = selectedStaffForPDF.includes(teacher.id);
                              return (
                                <div
                                  key={teacher.id}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedStaffForPDF(prev => prev.filter(id => id !== teacher.id));
                                    } else {
                                      setSelectedStaffForPDF(prev => [...prev, teacher.id]);
                                    }
                                  }}
                                  className={`p-3 cursor-pointer transition-all border-b border-blue-100 last:border-b-0 hover:bg-blue-50 ${
                                    isSelected ? 'bg-blue-100 border-r-4 border-r-blue-500' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                      isSelected ? 'bg-blue-500 border-blue-500' : 'border-blue-300'
                                    }`}>
                                      {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-800 text-sm">{teacher.name}</p>
                                      <p className="text-xs text-gray-600">{teacher.position} - {teacher.phone}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                          {/* الإداريين */}
                          <div className="p-3 bg-teal-50 border-b-2 border-blue-200 border-t-2">
                            <p className="font-bold text-teal-800 text-sm flex items-center gap-2">
                              <User className="w-4 h-4" />
                              الإداريين ({mockAdminStaff.filter(a => a.name.toLowerCase().includes(pdfStaffSearchTerm.toLowerCase())).length})
                            </p>
                          </div>
                          {mockAdminStaff
                            .filter(admin => admin.name.toLowerCase().includes(pdfStaffSearchTerm.toLowerCase()))
                            .map((admin) => {
                              const isSelected = selectedStaffForPDF.includes(admin.id);
                              return (
                                <div
                                  key={admin.id}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedStaffForPDF(prev => prev.filter(id => id !== admin.id));
                                    } else {
                                      setSelectedStaffForPDF(prev => [...prev, admin.id]);
                                    }
                                  }}
                                  className={`p-3 cursor-pointer transition-all border-b border-blue-100 last:border-b-0 hover:bg-blue-50 ${
                                    isSelected ? 'bg-blue-100 border-r-4 border-r-blue-500' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                      isSelected ? 'bg-blue-500 border-blue-500' : 'border-blue-300'
                                    }`}>
                                      {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-800 text-sm">{admin.name}</p>
                                      <p className="text-xs text-gray-600">{admin.position} - {admin.phone}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>

                        {/* زر الإرسال */}
                        <div className="mt-4">
                          <Button
                            onClick={() => {
                              if (selectedStaffForPDF.length === 0) {
                                alert('الرجاء اختيار موظف واحد على الأقل');
                                return;
                              }
                              const selectedStaffData = allStaff.filter(s => selectedStaffForPDF.includes(s.id));
                              const phones = selectedStaffData.map(s => s.phone).join(', ');
                              alert(`سيتم إرسال PDF لـ ${selectedStaffForPDF.length} موظف:\n${selectedStaffData.map(s => s.name).join('\n')}\n\nالأرقام: ${phones}`);
                              setShowPDFSection(false); // إغلاق القسم بعد الإرسال
                            }}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 shadow-lg"
                            disabled={selectedStaffForPDF.length === 0}
                          >
                            <Send className="w-5 h-5 ml-2" />
                            إرسال PDF عبر الواتساب ({selectedStaffForPDF.length})
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
                      <Button
                        onClick={() => {
                          // تنفيذ إرسال الإشعارات للمعلمين المحددين فقط
                          const selectedAssignments = waitingAssignments.filter(a => 
                            !a.isNotificationSent && selectedTeachersForNotification.includes(a.substituteTeacherId)
                          );
                          const assignmentIds = selectedAssignments.map(a => a.id);
                          handleNotificationSent(assignmentIds);
                          setIsSendNotificationDialogOpen(false);
                          alert(`تم إرسال ${selectedAssignments.length} إشعار لـ ${selectedTeachersForNotification.length} معلم بنجاح!`);
                        }}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={selectedTeachersForNotification.length === 0}
                      >
                        <Send className="w-5 h-5 ml-2" />
                        إرسال للمعلمين المحددين ({selectedTeachersForNotification.length})
                      </Button>
                      <Button
                        onClick={() => setIsSendNotificationDialogOpen(false)}
                        variant="outline"
                        className="flex-1 border-2 border-gray-400 hover:bg-gray-100 text-lg py-6"
                      >
                        <X className="w-5 h-5 ml-2" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Sheet open={isNotificationSheetOpen} onOpenChange={setIsNotificationSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  onClick={() => setShowNotificationHistory(true)}
                  className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2 relative"
                >
                  <Bell className="w-5 h-5 ml-2" />
                  سجل الإشعارات
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[700px] overflow-y-auto" dir="rtl">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold text-right">نظام الإشعارات والأرشيف</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <EnhancedNotificationSystem
                    assignments={waitingAssignments}
                    onNotificationSent={handleNotificationSent}
                    schoolInfo={schoolInfo}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* زر الطباعة */}
            <button 
              onClick={() => {
                console.log('عدد الإسنادات:', waitingAssignments.length);
                console.log('الإسنادات:', waitingAssignments);
                if (waitingAssignments.length === 0) {
                  alert('⚠️ لا توجد إسنادات انتظار!\n\nيرجى إسناد الحصص أولاً من قسم "حصص المعلم الغائب" ثم النقر على "تأكيد الإسناد النهائي لجميع الحصص"');
                  return;
                }
                setActiveSection('pdf');
              }}
              className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">طباعة</span>
            </button>

            {/* زر التقارير */}
            <button 
              onClick={() => setActiveSection('reports')}
              className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">تقارير الانتظار</span>
            </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* محتوى القسم النشط */}
        {activeSection === 'main' && (
          <div className="space-y-6">
            {/* قسم المعلمين الغائبين */}
            <div id="absent-teachers-section"></div>
            <div id="unassigned-periods-section"></div>
            
            {/* عرض نظام التوزيع الموحد */}
            {absentTeachers.length > 0 && currentTeacherSchedule.length > 0 && (
              <UnifiedSubstituteSelection
                absentTeachers={absentTeachers}
                allTeacherPeriods={absentTeachers.flatMap(teacher => {
                  const schedule = currentTeacherSchedule.filter(
                    period => mockScheduleData[teacher.teacherId]?.some(
                      p => p.periodNumber === period.periodNumber
                    )
                  );
                  return schedule.map(period => ({
                    absentTeacherId: teacher.teacherId,
                    absentTeacherName: teacher.teacherName,
                    periodNumber: period.periodNumber,
                    className: period.className,
                    subject: period.subject
                  }));
                })}
                onAssignmentComplete={handleAssignmentComplete}
                selectedDate={selectedDate}
              />
            )}

            {/* جداول الإسنادات الحالية - منفصلة لكل معلم غائب */}
            <div id="assigned-periods-section"></div>
            {waitingAssignments.length > 0 && (
              <>
                {/* تجميع الإسنادات حسب المعلم الغائب */}
                {Array.from(new Set(waitingAssignments.map(a => a.absentTeacherId))).map(absentTeacherId => {
                  const teacherAssignments = waitingAssignments.filter(a => a.absentTeacherId === absentTeacherId);
                  const absentTeacherName = teacherAssignments[0]?.absentTeacherName || '';
                  
                  return (
                    <Card key={absentTeacherId} className="shadow-lg border-blue-200">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <CardTitle className="flex items-center justify-between text-right text-gray-800">
                          <div className="flex items-center gap-2">
                            <Users className="w-6 h-6 text-blue-600" />
                            <span>إسنادات المعلم الغائب: {absentTeacherName}</span>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                            {teacherAssignments.length} حصة
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse rounded-lg overflow-hidden">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                              <tr>
                                <th className="border border-gray-300 p-3 text-right font-semibold text-gray-700">الحصة</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold text-gray-700">الفصل</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold text-gray-700">المادة</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold text-gray-700">المعلم المنتظر</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold text-gray-700">حالة الإشعار</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold text-gray-700">التوقيع</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold text-gray-700">الإجراءات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teacherAssignments.map((assignment) => (
                                <tr key={assignment.id} className={`hover:bg-blue-50 transition-colors ${assignment.isHidden ? 'opacity-50' : ''}`}>
                                  <td className="border border-gray-300 p-3 text-center font-medium">{assignment.periodNumber}</td>
                                  <td className="border border-gray-300 p-3">{assignment.className}</td>
                                  <td className="border border-gray-300 p-3">{assignment.subject}</td>
                                  <td className="border border-gray-300 p-3">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-blue-600" />
                                      <span className="font-medium text-gray-800">{assignment.substituteTeacherName}</span>
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 p-3">
                                    {assignment.isNotificationSent ? (
                                      <Badge className="bg-green-100 text-green-800 border-green-300">
                                        <CheckCircle className="w-3 h-3 ml-1" />
                                        تم الإرسال
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                                        <Clock className="w-3 h-3 ml-1" />
                                        في الانتظار
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="border border-gray-300 p-3">
                                    {assignment.isConfirmedBySubstitute ? (
                                      <div className="flex items-center gap-2 justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="text-green-700 font-semibold text-sm">تم التوقيع بالعلم والاطلاع</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 justify-center">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-500 text-sm">في انتظار التوقيع</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="border border-gray-300 p-3">
                                    <div className="flex gap-2 justify-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleAssignmentVisibility(assignment.id)}
                                        className="hover:bg-gray-100"
                                        title={assignment.isHidden ? "إظهار في الطباعة" : "إخفاء من الطباعة"}
                                      >
                                        {assignment.isHidden ? (
                                          <Eye className="w-4 h-4 text-gray-600" />
                                        ) : (
                                          <EyeOff className="w-4 h-4 text-gray-400" />
                                        )}
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* إحصائيات هذا المعلم */}
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-gray-700">
                                <strong className="text-blue-700">{teacherAssignments.length}</strong> حصة إجمالي
                              </span>
                              <span className="text-gray-400">|</span>
                              <span className="text-green-700">
                                <strong>{teacherAssignments.filter(a => a.isConfirmedBySubstitute).length}</strong> تم التوقيع
                              </span>
                              <span className="text-gray-400">|</span>
                              <span className="text-orange-600">
                                <strong>{teacherAssignments.filter(a => !a.isConfirmedBySubstitute).length}</strong> في الانتظار
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}

            {/* رسالة عدم وجود بيانات */}
            {absentTeachers.length === 0 && waitingAssignments.length === 0 && (
              <Card className="text-center py-16 shadow-lg">
                <CardContent>
                  <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-600 mb-2">لا توجد بيانات انتظار اليوم</h3>
                  <p className="text-gray-500 mb-6">ابدأ بتسجيل غياب موظف لإدارة الحصص البديلة</p>
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md"
                  >
                    <Users className="w-5 h-5 ml-2" />
                    تسجيل غياب معلم
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeSection === 'pdf' && (
          <div className="space-y-4">
            {/* زر العودة */}
            <Button
              onClick={() => setActiveSection('main')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-lg font-semibold"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              عودة
            </Button>
            
            <PDFGenerator
              assignments={waitingAssignments.filter(a => !a.isHidden)}
              selectedDate={selectedDate}
              schoolInfo={schoolInfo}
            />
          </div>
        )}

        {activeSection === 'reports' && (
          <div className="space-y-4">
            {/* زر العودة */}
            <Button
              onClick={() => setActiveSection('main')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-lg font-semibold"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              عودة
            </Button>
            
            <ReportsSystem assignments={waitingAssignments} />
          </div>
        )}
      </div>
    </div>
  );
};

// مكون نموذج تسجيل غياب الموظف المحسّن
interface TeacherAbsenceFormProps {
  teachers: any[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTeachers: string[];
  setSelectedTeachers: (teachers: string[]) => void;
  absenceType: 'full_day' | 'specific_periods' | '';
  setAbsenceType: (type: 'full_day' | 'specific_periods' | '') => void;
  selectedPeriods: number[];
  setSelectedPeriods: (periods: number[]) => void;
  onSubmit: () => void;
  teacherSearchTerm: string;
  setTeacherSearchTerm: (term: string) => void;
  filteredTeachers: any[];
  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;
  onConfirm: () => void;
  customStaff: any[];
  onDeleteStaff: (id: string) => void;
  showAddStaffDialog: boolean;
  setShowAddStaffDialog: (show: boolean) => void;
  newStaffName: string;
  setNewStaffName: (name: string) => void;
  newStaffPosition: string;
  setNewStaffPosition: (position: string) => void;
  newStaffPhone: string;
  setNewStaffPhone: (phone: string) => void;
  newStaffType: 'teacher' | 'admin';
  setNewStaffType: (type: 'teacher' | 'admin') => void;
  onAddStaff: () => void;
}

const TeacherAbsenceForm: React.FC<TeacherAbsenceFormProps> = ({
  teachers,
  selectedDate,
  setSelectedDate,
  selectedTeachers,
  setSelectedTeachers,
  absenceType,
  setAbsenceType,
  selectedPeriods,
  setSelectedPeriods,
  onSubmit,
  teacherSearchTerm,
  setTeacherSearchTerm,
  filteredTeachers,
  showConfirmDialog,
  setShowConfirmDialog,
  onConfirm,
  customStaff,
  onDeleteStaff,
  showAddStaffDialog,
  setShowAddStaffDialog,
  newStaffName,
  setNewStaffName,
  newStaffPosition,
  setNewStaffPosition,
  newStaffPhone,
  setNewStaffPhone,
  newStaffType,
  setNewStaffType,
  onAddStaff
}) => {
  const periods = [1, 2, 3, 4, 5, 6, 7];

  const handlePeriodToggle = (period: number) => {
    const newPeriods = selectedPeriods.includes(period) 
      ? selectedPeriods.filter(p => p !== period)
      : [...selectedPeriods, period];
    setSelectedPeriods(newPeriods);
  };

  const handleTeacherToggle = (teacherId: string) => {
    const newTeachers = selectedTeachers.includes(teacherId)
      ? selectedTeachers.filter(id => id !== teacherId)
      : [...selectedTeachers, teacherId];
    setSelectedTeachers(newTeachers);
  };

  const selectAllPeriods = () => {
    setSelectedPeriods(periods);
  };

  const clearAllPeriods = () => {
    setSelectedPeriods([]);
  };

  // دالة لتنسيق التاريخ مع اليوم
  const formatDateWithDay = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = days[date.getDay()];
    const formattedDate = date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
    return `${dayName}، ${formattedDate}`;
  };

  return (
    <div className="space-y-6 p-2" dir="rtl">
      {/* اختيار التاريخ */}
      <div className="space-y-3 text-right">
        <Label htmlFor="date-select" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          اليوم والتاريخ
        </Label>
        
        {/* حقل إدخال التاريخ */}
        <Input
          type="date"
          id="date-select"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-right text-lg p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold cursor-pointer hover:border-blue-400 transition-colors"
        />
        
        {/* عرض التاريخ المنسق */}
        {selectedDate && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 justify-center">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <p className="text-lg font-bold text-blue-900">
                {formatDateWithDay(selectedDate)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* اختيار الموظفين */}
      <div className="space-y-3 text-right">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            اختيار الموظفين ({selectedTeachers.length})
          </Label>
          <Button
            type="button"
            onClick={() => setShowAddStaffDialog(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2"
            size="sm"
          >
            <UserPlus className="w-4 h-4 ml-2" />
            إضافة موظف يدوياً
          </Button>
        </div>
        
        {/* شريط البحث */}
        <div className="relative">
          <Input
            type="text"
            placeholder="ابحث عن موظف بالاسم..."
            value={teacherSearchTerm}
            onChange={(e) => setTeacherSearchTerm(e.target.value)}
            className="text-right pr-10 text-base p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
          />
          <Users className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
        </div>

        {/* قائمة الموظفين */}
        <div className="border-2 border-gray-300 rounded-lg max-h-72 overflow-y-auto bg-white">
          {filteredTeachers.length > 0 ? (
            filteredTeachers.map(teacher => (
              <div
                key={teacher.id}
                className={`p-3 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 ${
                  selectedTeachers.includes(teacher.id) ? 'bg-blue-100 border-r-4 border-r-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => handleTeacherToggle(teacher.id)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      selectedTeachers.includes(teacher.id) 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedTeachers.includes(teacher.id) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1" onClick={() => handleTeacherToggle(teacher.id)}>
                    <p className="font-semibold text-gray-800 text-base">{teacher.name}</p>
                    <p className="text-xs text-gray-600">
                      {teacher.position}
                      {teacher.isCustom && <span className="mr-2 text-green-600">(مضاف يدوياً)</span>}
                    </p>
                  </div>
                  {teacher.isCustom && (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteStaff(teacher.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>لا توجد نتائج</p>
            </div>
          )}
        </div>

        {selectedTeachers.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-blue-700">
                تم اختيار {selectedTeachers.length} موظف
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* مربع حوار إضافة موظف */}
      <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-gray-800">إضافة موظف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label>نوع الموظف</Label>
              <Select value={newStaffType} onValueChange={(value: 'teacher' | 'admin') => setNewStaffType(value)}>
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">معلم</SelectItem>
                  <SelectItem value="admin">إداري</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>اسم الموظف *</Label>
              <Input
                type="text"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="أدخل اسم الموظف"
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <Label>{newStaffType === 'teacher' ? 'التخصص/المادة *' : 'الصفة الوظيفية *'}</Label>
              <Input
                type="text"
                value={newStaffPosition}
                onChange={(e) => setNewStaffPosition(e.target.value)}
                placeholder={newStaffType === 'teacher' ? 'مثال: الرياضيات' : 'مثال: وكيل المدرسة'}
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <Label>رقم الجوال (اختياري)</Label>
              <Input
                type="tel"
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="text-right"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={onAddStaff}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <CheckCircle className="w-4 h-4 ml-2" />
                إضافة
              </Button>
              <Button
                onClick={() => setShowAddStaffDialog(false)}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* نوع الغياب */}
      <div className="space-y-4 text-right">
        <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${absenceType === '' ? 'text-orange-500' : 'text-blue-500'}`} />
          نوع الغياب
          {absenceType === '' && <span className="text-orange-600 text-sm font-bold">(مطلوب)</span>}
        </Label>
        
        {absenceType === '' && (
          <div className="p-3 bg-orange-50 border-2 border-orange-300 rounded-lg">
            <p className="text-orange-700 text-sm font-semibold text-center">
              ⚠️ الرجاء تحديد نوع الغياب لإكمال التسجيل
            </p>
          </div>
        )}
        
        <div className="flex gap-4 justify-start">
          <Button
            type="button"
            variant={absenceType === 'full_day' ? 'default' : 'outline'}
            onClick={() => {
              setAbsenceType('full_day');
              // تحديد كل الحصص عند اختيار اليوم كامل
              selectAllPeriods();
            }}
            className={`flex-1 py-6 text-lg transition-all ${
              absenceType === 'full_day' 
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
                : 'border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            <Calendar className="w-5 h-5 ml-2" />
            اليوم كامل
          </Button>
          <Button
            type="button"
            variant={absenceType === 'specific_periods' ? 'default' : 'outline'}
            onClick={() => setAbsenceType('specific_periods')}
            className={`flex-1 py-6 text-lg transition-all ${
              absenceType === 'specific_periods' 
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
                : 'border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            <Clock className="w-5 h-5 ml-2" />
            حصص محددة
          </Button>
        </div>
      </div>

      {/* اختيار الحصص */}
      {absenceType === 'specific_periods' && (
        <div className="space-y-4 text-right">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              اختيار الحصص
            </Label>
            <div className="flex gap-2">
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={selectAllPeriods}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm"
              >
                <CheckCircle className="w-4 h-4 ml-1" />
                تحديد الكل
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={clearAllPeriods}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
              >
                <X className="w-4 h-4 ml-1" />
                إلغاء الكل
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {periods.map(period => (
              <button
                key={period}
                type="button"
                onClick={() => handlePeriodToggle(period)}
                className={`relative py-3 px-2 text-base font-semibold rounded-lg border-2 transition-all ${
                  selectedPeriods.includes(period)
                    ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                    : 'border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {period}
                {selectedPeriods.includes(period) && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          {selectedPeriods.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-700">
                  تم اختيار {selectedPeriods.length} حصة
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* أزرار التحكم */}
      <div className="flex gap-4 pt-6 justify-start border-t-2 border-gray-200">
        <Button 
          onClick={onSubmit}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selectedTeachers.length === 0 || absenceType === '' || (absenceType === 'specific_periods' && selectedPeriods.length === 0)}
        >
          <CheckCircle className="w-5 h-5 ml-2" />
          تأكيد الغياب وإنشاء الإسناد
        </Button>
      </div>
      
      {/* رسالة تحذيرية إذا لم يتم استيفاء الشروط */}
      {(selectedTeachers.length === 0 || absenceType === '' || (absenceType === 'specific_periods' && selectedPeriods.length === 0)) && (
        <div className="p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <p className="text-yellow-800 text-sm font-semibold text-center">
            ℹ️ الرجاء {selectedTeachers.length === 0 ? 'اختيار موظف واحد على الأقل' : absenceType === '' ? 'تحديد نوع الغياب' : 'اختيار الحصص المحددة'}
          </p>
        </div>
      )}

      {/* مربع حوار التأكيد الاحترافي */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800 mb-2">
              تأكيد تسجيل الغياب
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-orange-100 rounded-full">
                <AlertTriangle className="w-12 h-12 text-orange-600" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-gray-700 font-semibold">
                هل أنت متأكد من تسجيل غياب {selectedTeachers.length} موظف؟
              </p>
              <p className="text-sm text-gray-600">
                نوع الغياب: {absenceType === 'full_day' ? 'اليوم كامل' : absenceType === 'specific_periods' ? `${selectedPeriods.length} حصة` : 'غير محدد'}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={onConfirm}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <CheckCircle className="w-4 h-4 ml-2" />
                تأكيد
              </Button>
              <Button
                onClick={() => setShowConfirmDialog(false)}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
              >
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyWaitingManagementPage;
