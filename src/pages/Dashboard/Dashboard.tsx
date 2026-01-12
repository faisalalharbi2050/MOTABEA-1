import { useState, useEffect } from 'react';
import CalendarWidget from '../../components/Dashboard/CalendarWidget';
import DayScheduleWidget from '../../components/Dashboard/DayScheduleWidget';
import LatestMessages from '../../components/Dashboard/LatestMessages';
import WeeklyPerformanceWidget from '../../components/Dashboard/WeeklyPerformanceWidget';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  MessageSquare,
  FileText,
  Award,
  UserPlus,
  UserCog,
  UserCheck,
  School,
  Shield,
  Eye,
  LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const TeacherScheduleIcon = (props: any) => (
  <div className="relative w-5 h-5">
    <Calendar className="w-4 h-4 absolute top-0 left-0" strokeWidth={1.5} />
    <Users className="w-3 h-3 absolute bottom-0 right-0 bg-white rounded-full text-[#7768e5]" fill="currentColor" strokeWidth={0} />
    <Users className="w-3 h-3 absolute bottom-0 right-0 text-[#7768e5]" strokeWidth={2} />
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // ... rest of component

  const { addNotification } = useNotifications();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // إضافة إشعارات تجريبية عند تحميل الصفحة (لمرة واحدة)
  useEffect(() => {
    const hasAddedSampleNotifications = sessionStorage.getItem('sample_notifications_added');
    
    if (!hasAddedSampleNotifications) {
      // إضافة إشعارات تجريبية
      setTimeout(() => {
        addNotification({
          type: 'create',
          title: 'إضافة معلم جديد',
          message: 'تم إضافة المعلم أحمد محمد إلى قاعدة البيانات',
          source: user?.name || 'الإدارة',
          module: 'المعلمين',
        });
      }, 1000);

      setTimeout(() => {
        addNotification({
          type: 'update',
          title: 'تحديث جدول دراسي',
          message: 'تم تحديث جدول الصف الثالث الابتدائي',
          source: 'وكيل المدرسة',
          module: 'الجداول الدراسية',
        });
      }, 2000);

      setTimeout(() => {
        addNotification({
          type: 'system',
          title: 'تقرير شهري',
          message: 'تم إنشاء التقرير الشهري للحضور والغياب',
          source: 'النظام',
          module: 'التقارير',
        });
      }, 3000);

      sessionStorage.setItem('sample_notifications_added', 'true');
    }
  }, [addNotification, user]);

  // Sample data - in real app, this would come from API
  // بيانات المعلمين - يجب أن تأتي من API لصفحة إدارة المعلمين
  const teachersCount = 60; // TODO: جلب من API
  
  // بيانات الطلاب - يجب أن تأتي من API لصفحة إدارة الطلاب
  const studentsCount = 750; // TODO: جلب من API
  
  // بيانات الإداريين - يجب أن تأتي من API لصفحة إدارة الإداريين
  const administratorsCount = 10; // TODO: جلب من API
  
  // بيانات الفصول - يجب أن تأتي من API لصفحة إدارة الفصول
  const classroomsCount = 24; // TODO: جلب من API
  
  // بيانات الانتظار اليومي - يجب أن تأتي من API لصفحة الانتظار اليومي
  const todayWaitingCount = 5; // TODO: جلب من API (عدد المعلمين الغائبين المؤمن حصصهم)
  
  // بيانات المشرفين اليوم - يجب أن تأتي من API لجدول الإشراف اليومي
  const todaySupervisors = [
    'أحمد محمد العلي',
    'خالد عبدالله السعيد',
    'محمد سعد الغامدي'
  ]; // TODO: جلب من API حسب اليوم الحالي
  
  // بيانات المناوبين اليوم - يجب أن تأتي من API لجدول المناوبة اليومي
  const todayDutyStaff = [
    'فهد أحمد الزهراني',
    'سعد محمد القحطاني'
  ]; // TODO: جلب من API حسب اليوم الحالي

  // بيانات المعلمين الغائبين اليوم
  const todayAbsentTeachers = [
    { name: 'عبدالله السالم', subject: 'فيزياء', periods: 4 },
    { name: 'يوسف الهذلول', subject: 'رياضيات', periods: 3 },
  ];

  // بيانات المشرفين لليوم التالي - يجب أن تأتي من API
  const tomorrowSupervisors = [
    'علي حسن الشهري',
    'عمر يوسف العتيبي',
    'ناصر سليمان المطيري'
  ]; // TODO: جلب من API لليوم التالي
  
  // بيانات المناوبين لليوم التالي - يجب أن تأتي من API
  const tomorrowDutyStaff = [
    'إبراهيم خالد الدوسري',
    'مشعل فيصل الحربي'
  ]; // TODO: جلب من API لليوم التالي
  
  // بيانات الانتظارات القادمة (الغائبين المسجلين لليوم التالي)
  const upcomingAbsentTeachers = [
    { name: 'محمد العمري', subject: 'رياضيات', periods: 5 },
    { name: 'سارة الأحمد', subject: 'لغة عربية', periods: 4 },
    { name: 'خالد المنصور', subject: 'علوم', periods: 3 }
  ]; // TODO: جلب من API لصفحة الانتظار اليومي

  // بيانات آخر الرسائل - يجب أن تأتي من API
  const recentMessages = [
    { 
      id: '1', 
      content: 'اجتماع المعلمين الطارئ', 
      body: 'المكرمون المعلمون، نأمل منكم الحضور لقاعة الاجتماعات بشكل عاجل في تمام الساعة 10 صباحاً للأهمية.',
      to: 'المعلمين', 
      from: 'المدير', 
      time: '10:30 ص' 
    },
    { 
      id: '2', 
      content: 'تذكير برصد الدرجات', 
      body: 'المكرمون معلمو الرياضيات، نأمل منكم الانتهاء من رصد درجات الاختبار الفصلي الأول وتسليم الكشوف قبل نهاية دوام يوم الخميس.',
      to: 'معلمي الرياضيات', 
      from: 'الوكيل', 
      time: '09:15 ص' 
    },
    { 
      id: '3', 
      content: 'غياب الطالب محمد علي', 
      body: 'المكرم ولي أمر الطالب محمد علي، نفيدكم بتغيب ابنكم عن الحضور للمدرسة هذا اليوم الأحد، نأمل التواصل معنا لتوضيح سبب الغياب.',
      to: 'ولي الأمر', 
      from: 'الموجه الطلابي', 
      time: '08:00 ص' 
    },
    { 
      id: '4', 
      content: 'خطة النشاط المدرسي', 
      body: 'المكرم رائد النشاط، نأمل تزويد الإدارة بالخطة التفصيلية للأنشطة اللاصفية للفصل الدراسي الثاني في موعد أقصاه الأسبوع القادم.',
      to: 'رائد النشاط', 
      from: 'المدير', 
      time: 'أمس' 
    },
  ];

  // الحصول على اسم اليوم التالي
  const getTomorrowDayName = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(tomorrow);
  };

  const stats = [
    {
      id: 'teachers',
      title: 'إجمالي المعلمين',
      value: teachersCount.toString(),
      icon: Users,
      color: '#8779fb',
      expandable: false,
    },
    {
      id: 'students',
      title: 'إجمالي الطلاب',
      value: studentsCount.toLocaleString('ar-SA'),
      icon: GraduationCap,
      color: '#8779fb',
      expandable: false,
    },
    {
      id: 'administrators',
      title: 'إجمالي الإداريين',
      value: administratorsCount.toString(),
      icon: UserCheck,
      color: '#8779fb',
      expandable: false,
    },
    {
      id: 'classrooms',
      title: 'إجمالي الفصول',
      value: classroomsCount.toString(),
      icon: School,
      color: '#8779fb',
      expandable: false,
    },
    {
      id: 'waiting',
      title: 'انتظار اليوم',
      value: todayWaitingCount.toString(),
      icon: ClipboardList,
      color: '#8779fb',
      expandable: false,
    },
    {
      id: 'supervisors',
      title: 'المشرف اليوم',
      value: todaySupervisors.length.toString(),
      icon: Shield,
      color: '#8779fb',
      expandable: true,
      details: todaySupervisors,
    },
    {
      id: 'duty',
      title: 'المناوب اليوم',
      value: todayDutyStaff.length.toString(),
      icon: Eye,
      color: '#8779fb',
      expandable: true,
      details: todayDutyStaff,
    },
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'مساءً' : 'صباحاً';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${period}`;
  };

  return (
    <div className="space-y-6 pl-2">


      {/* Stats Grid - Compact & Unified */}
      <div className="mb-8">
        <div className="section-header mb-4">
          <i className="fa-solid fa-chart-pie text-[#655ac1]"></i> الإحصائيات العامة
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Teachers */}
          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#8779fb]/50 group cursor-default relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#e5e1fe]/20 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110"></div>
            <div className="w-12 h-12 rounded-2xl bg-[#e5e1fe] text-[#655ac1] flex items-center justify-center mb-3 text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div className="flex items-center gap-2 relative z-10">
               <div className="text-2xl font-bold text-gray-700">{teachersCount}</div>
               <div className="text-sm text-gray-500 font-medium">معلم</div>
            </div>
          </div>
          
          {/* Students */}
          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#8779fb]/50 group cursor-default relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#e5e1fe]/20 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110"></div>
             <div className="w-12 h-12 rounded-2xl bg-[#e5e1fe] text-[#655ac1] flex items-center justify-center mb-3 text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div className="flex items-center gap-2 relative z-10">
               <div className="text-2xl font-bold text-gray-700">{studentsCount.toLocaleString('ar-SA')}</div>
               <div className="text-sm text-gray-500 font-medium">طالب</div>
            </div>
          </div>

          {/* Administrators */}
          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#8779fb]/50 group cursor-default relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#e5e1fe]/20 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110"></div>
            <div className="w-12 h-12 rounded-2xl bg-[#e5e1fe] text-[#655ac1] flex items-center justify-center mb-3 text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <div className="flex items-center gap-2 relative z-10">
               <div className="text-2xl font-bold text-gray-700">{administratorsCount}</div>
               <div className="text-sm text-gray-500 font-medium">إداري</div>
            </div>
          </div>

          {/* Classrooms */}
          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#8779fb]/50 group cursor-default relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#e5e1fe]/20 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110"></div>
            <div className="w-12 h-12 rounded-2xl bg-[#e5e1fe] text-[#655ac1] flex items-center justify-center mb-3 text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
              <i className="fa-solid fa-school"></i>
            </div>
            <div className="flex items-center gap-2 relative z-10">
               <div className="text-2xl font-bold text-gray-700">{classroomsCount}</div>
               <div className="text-sm text-gray-500 font-medium">فصل</div>
            </div>
          </div>
        </div>
      </div>


      {/* Row 1: Quick Actions (Right) & Calendar (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Row 1: Quick Actions (Right - 1/3) */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-[#e5e1fe] flex items-center justify-center">
                <i className="fa-solid fa-bolt text-[#655ac1] text-sm"></i>
             </div>
             الإجراءات السريعة
          </h2>
          <div className="grid grid-cols-2 gap-3">
             {[
                { icon: MessageSquare, label: 'إرسال رسالة', path: '/dashboard/messages' },
                { icon: ClipboardList, label: 'إضافة انتظار', path: '/dashboard/daily-waiting' },
                { icon: Users, label: 'المعلمون', path: '/dashboard/initial-settings/teachers' },
                { icon: GraduationCap, label: 'الطلاب', path: '/dashboard/initial-settings/students' },
                { icon: TeacherScheduleIcon, label: 'جدول معلم', path: '/dashboard/schedule/tables', state: { viewMode: 'teachers' } },
                { icon: LayoutGrid, label: 'جدول فصل', path: '/dashboard/schedule/tables', state: { viewMode: 'classes' } },
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path, { state: action.state })}
                  className="flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-[#e5e1fe] hover:bg-[#fcfbff] hover:shadow-md transition-all duration-200 group text-center h-28 justify-center bg-gray-50/50"
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform bg-[#e5e1fe] text-[#7768e5] shadow-sm">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 leading-tight">
                    {action.label}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Row 1: Calendar (Left - 2/3) */}
        <div className="lg:col-span-2 h-full">
            <CalendarWidget />
        </div>
      </div>

      {/* Row 2: Today Schedule (Right) & Messages (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-[450px]">
        {/* Row 2: Current Day Schedule (Right - 2/3) */}
        <div className="lg:col-span-2 h-full">
            <DayScheduleWidget 
              title="جدول اليوم الحالي"
              absentTeachers={todayAbsentTeachers}
              supervisors={todaySupervisors}
              dutyStaff={todayDutyStaff}
            />
        </div>

        {/* Row 2: Latest Messages (Left - 1/3) */}
        <div className="lg:col-span-1 h-full">
            <LatestMessages messages={recentMessages} />
        </div>
      </div>
      
      {/* Row 3: Next Day Schedule (Right) & Empty/Future Widget (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-[450px]">
        {/* Row 3: Next Day Schedule (Right - 2/3) */}
        <div className="lg:col-span-2 h-full">
             <DayScheduleWidget 
              title={`جدول يوم ${getTomorrowDayName()}`}
              icon={<Clock className="h-5 w-5 text-[#655ac1]" />}
              absentTeachers={upcomingAbsentTeachers}
              supervisors={tomorrowSupervisors}
              dutyStaff={tomorrowDutyStaff}
            />
        </div>
        
        {/* Row 3: Spacer or Summary (Left - 1/3) */}
         <div className="lg:col-span-1 h-full">
            <WeeklyPerformanceWidget />
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
