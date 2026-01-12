/**
 * صفحة إعدادات جدول الحصص
 * تتيح هذه الصفحة إدارة قيود الجدول المدرسي وتفريغ المعلمين وإعدادات الحصص
 * 
 * نظام التوزيع المطور (V2):
 * - التوزيع التلقائي: مفعل دائماً كأساس للنظام
 * - القواعد المخصصة: تضاف كطبقة إضافية للتحكم الدقيق
 * - لا يوجد تضارب بين النوعين، بل تكامل وتعاون
 * 
 * الخواص البرمجية الآلية المضمنة:
 * 1. منع تكرار المواد ذات ≤ 5 حصص يوميًا
 * 2. السماح بتكرار المواد ذات > 5 حصص مرتين فقط باليوم
 * 3. توزيع الحصص بشكل متوازن حسب نصاب كل معلم
 * 4. عند تفريغ يوم لمعلم، يتم توزيع حصصه على الأيام المتبقية
 * 5. توزيع الحصص الأولى والأخيرة بالتساوي بين المعلمين، مع مراعاة الاستثناءات
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Home, 
  Book, 
  User, 
  Save, 
  FileText, 
  Calendar, 
  Check, 
  X, 
  Clock, 
  Pencil, 
  AlertCircle, 
  Info, 
  RotateCcw,
  Settings,
  BookOpen,
  Edit,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  ChevronDown,
  Plus,
  ArrowLeft,
  Trash2,
  CalendarDays,
  Users,
  Download
} from 'lucide-react';

// مكونات shadcn-ui الأساسية
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// مكونات shadcn-ui المتقدمة التي ثبت أنها تعمل
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// إضافة مكونات Toast للإشعارات
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// المكونات المفقودة - تنفيذ بديل
const ScrollArea = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`overflow-auto ${className || ''}`} style={style}>
    {children}
  </div>
);

const DropdownMenuSeparator = ({ className }: { className?: string }) => (
  <div className={`h-px bg-gray-200 my-1 ${className || ''}`} />
);

const ToastProvider = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const ToastViewport = ({ className }: { className?: string }) => <div className={className} />;

// أيام الأسبوع الجديدة - للتوافق مع التحديثات
const WEEK_DAYS_NEW = [
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الاثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' }
];

// البيانات المؤقتة
const MOCK_TEACHERS = [
  { id: 1, name: 'أحمد محمد', subject: 'الرياضيات' },
  { id: 2, name: 'عبدالله العمري', subject: 'العلوم' },
  { id: 3, name: 'محمد السيد', subject: 'اللغة العربية' },
  { id: 4, name: 'خالد عبدالرحمن', subject: 'اللغة الإنجليزية' },
  { id: 5, name: 'سعد المالكي', subject: 'الدراسات الإسلامية' },
  { id: 6, name: 'فهد السعيد', subject: 'الاجتماعيات' },
  { id: 7, name: 'علي المهندس', subject: 'الحاسب الآلي' },
  { id: 8, name: 'ياسر الدوسري', subject: 'التربية البدنية' },
  { id: 9, name: 'سعود الحربي', subject: 'المهارات الرقمية' },
  { id: 10, name: 'عمر الجهني', subject: 'الفنية' },
];

// بيانات الفصول الدراسية
const MOCK_CLASSES = [
  { id: 1, name: 'الصف الأول أ', shortName: '1/1', grade: 'الأول' },
  { id: 2, name: 'الصف الأول ب', shortName: '1/2', grade: 'الأول' },
  { id: 3, name: 'الصف الأول ج', shortName: '1/3', grade: 'الأول' },
  { id: 4, name: 'الصف الثاني أ', shortName: '2/1', grade: 'الثاني' },
  { id: 5, name: 'الصف الثاني ب', shortName: '2/2', grade: 'الثاني' },
  { id: 6, name: 'الصف الثاني ج', shortName: '2/3', grade: 'الثاني' },
  { id: 7, name: 'الصف الثالث أ', shortName: '3/1', grade: 'الثالث' },
  { id: 8, name: 'الصف الثالث ب', shortName: '3/2', grade: 'الثالث' },
  { id: 9, name: 'الصف الثالث ج', shortName: '3/3', grade: 'الثالث' },
  { id: 10, name: 'الصف الرابع أ', shortName: '4/1', grade: 'الرابع' },
  { id: 11, name: 'الصف الرابع ب', shortName: '4/2', grade: 'الرابع' },
  { id: 12, name: 'الصف الرابع ج', shortName: '4/3', grade: 'الرابع' },
  { id: 13, name: 'الصف الخامس أ', shortName: '5/1', grade: 'الخامس' },
  { id: 14, name: 'الصف الخامس ب', shortName: '5/2', grade: 'الخامس' },
  { id: 15, name: 'الصف الخامس ج', shortName: '5/3', grade: 'الخامس' },
  { id: 16, name: 'الصف السادس أ', shortName: '6/1', grade: 'السادس' },
  { id: 17, name: 'الصف السادس ب', shortName: '6/2', grade: 'السادس' },
  { id: 18, name: 'الصف السادس ج', shortName: '6/3', grade: 'السادس' },
];

const SUBJECTS = [
  { id: 1, name: 'الرياضيات', periodsPerWeek: 5 },
  { id: 2, name: 'العلوم', periodsPerWeek: 4 },
  { id: 3, name: 'اللغة العربية', periodsPerWeek: 6 },
  { id: 4, name: 'اللغة الإنجليزية', periodsPerWeek: 3 },
  { id: 5, name: 'الدراسات الإسلامية', periodsPerWeek: 4 },
  { id: 6, name: 'الاجتماعيات', periodsPerWeek: 2 },
  { id: 7, name: 'الحاسب الآلي', periodsPerWeek: 2 },
  { id: 8, name: 'التربية البدنية', periodsPerWeek: 2 },
  { id: 9, name: 'المهارات الرقمية', periodsPerWeek: 2 },
  { id: 10, name: 'الفنية', periodsPerWeek: 1 },
];

const WEEK_DAYS = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'
];

const PERIODS = [
  'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة'
];

// الأنواع
type AvailabilityStatus = 'available' | 'unavailable';

type TeacherAvailability = {
  [teacherId: number]: AvailabilityStatus[][];
};

type ClassAvailability = {
  [classId: number]: boolean[][];
};

// أنواع الاجتماعات التخصصية
interface MeetingSession {
  id: string;
  name: string;
  day_index: number;
  period_index: number;
  allow_global_clash: boolean;
  participants: number[];
  created_at?: string;
}

interface MeetingConflict {
  type: 'teacher' | 'subject';
  message: string;
  conflictingMeetings?: string[];
}

// تعريف مكون مخصص للقائمة المنسدلة للمعلمين
const TeacherSelector = ({ 
  selectedTeachers, 
  onTeacherSelect, 
  onMultipleTeachersSelection,
  btnLabel = "اختيار المعلمين",
  id = "teacher-selector"
}: { 
  selectedTeachers: number[]; 
  onTeacherSelect: (id: number) => void;
  onMultipleTeachersSelection: (ids: number[]) => void;
  btnLabel?: string;
  id?: string;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button 
        id={id}
        variant="outline" 
        className="w-full justify-between bg-white rounded-lg border-gray-300 text-right shadow-sm hover:bg-gray-50 relative overflow-hidden transition-all duration-200" 
        style={{
          background: 'linear-gradient(to left, rgba(255,255,255,1), rgba(249,250,251,0.5))'
        }}
        dir="rtl"
      >
        <span className="flex items-center">
          <span className="bg-indigo-50 text-indigo-600 rounded-full h-5 w-5 flex items-center justify-center text-xs font-semibold ml-2">
            {selectedTeachers.length}
          </span>
          <span className="text-[#1F2937] font-medium">{btnLabel}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-indigo-400" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent 
      align="start" 
      className="min-w-[300px] bg-white rounded-lg shadow-lg border-gray-200 text-right z-50"
    >
      <div className="p-3 bg-gradient-to-l from-indigo-600 to-purple-600 text-white rounded-t-lg">
        <div className="font-medium text-[15px] flex items-center">
          <User className="h-4 w-4 ml-2" />
          قائمة المعلمين
        </div>
      </div>
      <DropdownMenuSeparator className="border-gray-100" />
      <ScrollArea className="h-[300px]">
        <div className="p-1">
          <div
            className="flex justify-between items-center font-bold bg-indigo-50 py-3 px-3 rounded cursor-pointer mb-2 hover:bg-indigo-100 transition-colors duration-200"
            onClick={() => {
              if (selectedTeachers.length === MOCK_TEACHERS.length) {
                onMultipleTeachersSelection([]);
              } else {
                onMultipleTeachersSelection(MOCK_TEACHERS.map(teacher => teacher.id));
              }
            }}
          >
            <div className={`h-5 w-5 rounded-md flex items-center justify-center ${
              selectedTeachers.length === MOCK_TEACHERS.length 
                ? "bg-indigo-600 text-white" 
                : "bg-white border border-indigo-300"
            }`}>
              {selectedTeachers.length === MOCK_TEACHERS.length && <Check className="h-3.5 w-3.5" />}
            </div>
            <span className="text-indigo-700 text-[15px]">تحديد الكل</span>
          </div>
          <div className="h-1 my-1 bg-gray-100"></div>
          {MOCK_TEACHERS.map((teacher) => (
            <div
              key={teacher.id}
              className="flex justify-between items-center py-3 px-3 rounded hover:bg-gray-50 cursor-pointer transition-colors duration-200 mb-1"
              onClick={() => onTeacherSelect(teacher.id)}
            >
              <div className={`h-5 w-5 rounded-md flex items-center justify-center ${
                selectedTeachers.includes(teacher.id) 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white border border-gray-300"
              }`}>
                {selectedTeachers.includes(teacher.id) && <Check className="h-3.5 w-3.5" />}
              </div>
              <span className="text-[#1F2937] text-[15px]">{teacher.name}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </DropdownMenuContent>
  </DropdownMenu>
);

// كود الصفحة الرئيسي
const ScheduleSettingsFinal = () => {
  // خطافات التوجيه
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // حالات التبويبات والمعلمين
  const [activeTab, setActiveTab] = useState("teachers");
  
  // التحقق من وجود tab في query params وفتحه
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['teachers', 'subjects', 'waiting'].includes(tabParam)) {
      setActiveTab(tabParam);
      
      // إذا كان التبويب هو حصص الانتظار، افتح بطاقة إعداد المنتظرين تلقائياً
      if (tabParam === 'waiting') {
        setIsTeachersSetupOpen(true);
      }
    }
  }, [searchParams]);
  
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [selectedConsecutiveTeachers, setSelectedConsecutiveTeachers] = useState<number[]>([]);
  const [consecutiveTeacherSearch, setConsecutiveTeacherSearch] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [showAvailabilityGrid, setShowAvailabilityGrid] = useState<boolean>(false);
  
  // حالة توفر المعلمين
  const [teacherAvailability, setTeacherAvailability] = useState<TeacherAvailability>({});
  
  // حالة توفر الفصول
  const [classAvailability, setClassAvailability] = useState<ClassAvailability>({});
  
  // إضافة state لإدارة القائمة المنسدلة
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  
  // إعدادات عدد الحصص والتتابع
  const [maxPeriodsPerDay, setMaxPeriodsPerDay] = useState<number>(5);
  const [maxConsecutivePeriods, setMaxConsecutivePeriods] = useState<number>(1); // تغيير القيمة الافتراضية إلى 1
  const [spreadFirstLastPeriods, setSpreadFirstLastPeriods] = useState<boolean>(true);
  
  // إعدادات تتابع حصص المواد - النظام الجديد
  const [subjectConsecutiveEnabled, setSubjectConsecutiveEnabled] = useState<boolean>(false); // افتراضياً غير مفعل
  const [selectedConsecutiveSubjects, setSelectedConsecutiveSubjects] = useState<number[]>([]); // تعدد المواد
  const [selectedConsecutiveClasses, setSelectedConsecutiveClasses] = useState<number[]>([]); // الفصول المختارة للتتابع
  
  // للتوافق مع النظام القديم - سيتم إزالته تدريجياً
  const [artClassesConsecutive, setArtClassesConsecutive] = useState<boolean>(true);
  // إضافة حالة أيام التتابع المختارة
  const [selectedConsecutiveDays, setSelectedConsecutiveDays] = useState<string[]>(WEEK_DAYS);

  // استثناءات المعلمين والمواد للفترات
  const [excludedPeriods, setExcludedPeriods] = useState<{[key: string]: number[]}>({});
  const [excludedSubjects, setExcludedSubjects] = useState<{[key: number]: number[]}>({});
  
  // جدول الاستثناءات المحفوظة (للبطاقة الجديدة) - صف واحد لكل مادة
  const [savedExceptions, setSavedExceptions] = useState<{
    id: string;
    subjectId: number;
    subjectName: string;
    periodIndexes: number[]; // مصفوفة من الحصص
    periodNames: string[]; // أسماء الحصص
    createdAt: Date;
  }[]>([]);
  
  // إعدادات تحديد مواد في حصص معينة (البطاقة الجديدة)
  const [selectedSubjectsForPeriods, setSelectedSubjectsForPeriods] = useState<number | null>(null); // مادة واحدة فقط
  const [selectedPeriodsForSubjects, setSelectedPeriodsForSubjects] = useState<number[]>([]);
  const [savedSubjectPeriodAssignments, setSavedSubjectPeriodAssignments] = useState<{
    id: string;
    subjectId: number;
    subjectName: string;
    periodIndexes: number[]; // مصفوفة من الحصص
    periodNames: string[]; // أسماء الحصص
    createdAt: Date;
  }[]>([]);
  
  // مصفوفة توفر قديمة - سيتم إزالتها في الإصدار النهائي
  const [availabilityGrid, setAvailabilityGrid] = useState<boolean[][]>(
    Array(WEEK_DAYS.length).fill(Array(PERIODS.length).fill(true))
  );
  
  // إضافة حالة الإشعارات
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // حالة مربع حوار حذف بيانات التتابع
  const [showDeleteConsecutiveDialog, setShowDeleteConsecutiveDialog] = useState(false);

  // حالة إشعار النجاح المحلي
  const [showLocalSuccessMessage, setShowLocalSuccessMessage] = useState(false);

  // حالة إشعار حذف الاستثناءات
  const [showDeleteExceptionsMessage, setShowDeleteExceptionsMessage] = useState(false);

  // حالة شريط البحث عن المعلمين
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");

  // حالة شريط البحث في قائمة توزيع الحصص
  const [distributionTeacherSearch, setDistributionTeacherSearch] = useState("");

  // حالات مربعات الحوار الاحترافية
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    showCancel?: boolean;
  }>({ open: false, title: "", message: "", onConfirm: () => {}, confirmText: "تأكيد", showCancel: true });

  // ===================== إعدادات تبويب حصص الانتظار =====================
  // حالة إعدادات الانتظار
  const [waitingSettings, setWaitingSettings] = useState({
    distributionMode: 'balanced' as 'balanced' | 'coverage_target',
    coverageTargetPerSlot: 5,
    maxDailyWaiting: 2,
    ensureEarlyMidLate: true,
    fairWeeklyDistribution: true,
    sundaySlots: 7,
    mondaySlots: 7,
    tuesdaySlots: 7,
    wednesdaySlots: 7,
    thursdaySlots: 7
  });

  // حالة التحقق من القابلية
  const [coverageFeasibility, setCoverageFeasibility] = useState<{
    isFeasible: boolean;
    totalQuota: number;
    totalAssigned: number;
    totalRemaining: number;
    totalWeeklySlots: number;
    requiredSlots: number;
    maxAchievableTarget: number;
    message: string;
  } | null>(null);

  // حالة تحميل بيانات الانتظار
  const [loadingWaitingData, setLoadingWaitingData] = useState(false);

  // حالة فتح/إغلاق جدول المعلمين (مفتوح افتراضياً)
  const [isTeachersTableOpen, setIsTeachersTableOpen] = useState(true);

  // حالة فتح/إغلاق جدول المنتظرين في البطاقة الثانية (مفتوح افتراضياً)
  const [isWaitersTableOpen, setIsWaitersTableOpen] = useState(true);

  // حالات فتح/إغلاق البطاقات (مغلقة افتراضياً)
  const [isTeacherAssignmentOpen, setIsTeacherAssignmentOpen] = useState(false);
  const [isTeacherConsecutiveOpen, setIsTeacherConsecutiveOpen] = useState(false);
  const [isDistributionRulesOpen, setIsDistributionRulesOpen] = useState(false);
  const [isDepartmentMeetingsOpen, setIsDepartmentMeetingsOpen] = useState(false);
  const [isSubjectConsecutiveOpen, setIsSubjectConsecutiveOpen] = useState(false);
  const [isExceptionsOpen, setIsExceptionsOpen] = useState(false);
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
  
  // حالات فتح/إغلاق بطاقات حصص الانتظار
  const [isDemandMatrixOpen, setIsDemandMatrixOpen] = useState(false);
  const [isDistributionStrategyOpen, setIsDistributionStrategyOpen] = useState(false);
  const [isTeachersSetupOpen, setIsTeachersSetupOpen] = useState(false);

  // حالات للتحكم في الإشعارات الاحترافية ومنع الازدواجية
  const [currentEditingTeacher, setCurrentEditingTeacher] = useState<number | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingTeacherSelection, setPendingTeacherSelection] = useState<number | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  
  // إشعارات بطاقات المواد
  const [showSubjectsNotification, setShowSubjectsNotification] = useState(false);
  const [subjectsNotificationMessage, setSubjectsNotificationMessage] = useState("");

  // ============= حالات الاجتماعات التخصصية =============
  const [departmentMeetings, setDepartmentMeetings] = useState<MeetingSession[]>([]);
  const [selectedMeetingTeachers, setSelectedMeetingTeachers] = useState<number[]>([]);
  const [meetingName, setMeetingName] = useState<string>('');
  const [selectedMeetingDay, setSelectedMeetingDay] = useState<number>(-1);
  const [selectedMeetingPeriod, setSelectedMeetingPeriod] = useState<number>(-1);
  const [allowGlobalClash, setAllowGlobalClash] = useState<boolean>(false);
  const [meetingConflict, setMeetingConflict] = useState<MeetingConflict | null>(null);
  const [meetingSearchQuery, setMeetingSearchQuery] = useState<string>('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('');
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  // ============= نهاية حالات الاجتماعات =============

  // حالة نصاب الانتظار لكل معلم
  const [teachersWaitingQuota, setTeachersWaitingQuota] = useState<{[key: number]: number}>({});

  // حالة جدول المنتظرين للبطاقة الثانية (تحديد عدد المنتظرين لكل حصة)
  const [waitersTableData, setWaitersTableData] = useState<{
    [teacherId: number]: {
      dailyWaiting: number;
      surplusWaiting: number;
    }
  }>({});

  // حالة إضافة منتظر يدوياً للبطاقة الأولى (التوزيع المتوازن)
  const [showAddWaiterDialog, setShowAddWaiterDialog] = useState(false);
  const [newWaiterData, setNewWaiterData] = useState({
    name: '',
    waitingQuota: 0
  });

  // حالة إضافة منتظر يدوياً للبطاقة الثانية (تحديد عدد المنتظرين)
  const [showAddWaiterDialogSecond, setShowAddWaiterDialogSecond] = useState(false);
  const [customWaiters, setCustomWaiters] = useState<{
    id: number;
    name: string;
    waitingQuota: number;
  }[]>([]);
  const [nextCustomId, setNextCustomId] = useState(1000); // بدء من 1000 لتجنب تداخل مع IDs المعلمين

  // حالة نافذة حظر الحصص
  const [showBlockPeriodsDialog, setShowBlockPeriodsDialog] = useState(false);
  const [selectedTeacherForBlocking, setSelectedTeacherForBlocking] = useState<number | null>(null);
  const [blockedPeriods, setBlockedPeriods] = useState<{
    [teacherId: number]: {
      day: number;
      period: number;
    }[];
  }>({});

  // حالة الحد الأقصى اليومي لكل معلم - نظام ذكي
  const [teachersDailyMaxWaiting, setTeachersDailyMaxWaiting] = useState<{[key: number]: number}>({});
  
  // حالة تطبيق القيود على مجموعة معلمين
  const [showBulkConstraintsDialog, setShowBulkConstraintsDialog] = useState(false);
  const [selectedTeachersForBulk, setSelectedTeachersForBulk] = useState<number[]>([]);

  // دالة لحساب عدد الانتظار في اليوم
  const calculateDailyWaiting = (waitingQuota: number) => {
    const daysCount = 5;
    const perDay = Math.floor(waitingQuota / daysCount);
    const extraDays = waitingQuota % daysCount;
    
    if (waitingQuota === 0) {
      return '—';
    }
    
    if (extraDays === 0) {
      return `${perDay}`;
    }
    
    // عرض مبسط: من الأكبر إلى الأصغر (يمين إلى يسار)
    return `${perDay + 1} - ${perDay}`;
  };

  // دالة لتحديث نصاب الانتظار لمعلم معين
  const updateTeacherQuota = (teacherId: number, newQuota: number) => {
    setTeachersWaitingQuota(prev => ({
      ...prev,
      [teacherId]: newQuota
    }));
    
    // تحديث بيانات جدول المنتظرين للبطاقة الثانية
    updateWaitersTableData();
  };

  // دالة تصفية المعلمين حسب البحث
  const filteredTeachers = MOCK_TEACHERS.filter(teacher =>
    teacher.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(teacherSearchQuery.toLowerCase())
  );

  // دالة لحساب وتحديث بيانات جدول المنتظرين للبطاقة الثانية
  const updateWaitersTableData = () => {
    const newTableData: { [teacherId: number]: { dailyWaiting: number; surplusWaiting: number; } } = {};
    
    // تجميع جميع المعلمين (الأساسيين + المخصصين)
    const allTeachers = [
      ...MOCK_TEACHERS,
      ...customWaiters
    ];
    
    allTeachers.forEach(teacher => {
      const originalQuota = teachersWaitingQuota[teacher.id] ?? 6;
      const targetPerSlot = waitingSettings.coverageTargetPerSlot;
      const totalWeeklySlots = waitingSettings.sundaySlots + waitingSettings.mondaySlots + waitingSettings.tuesdaySlots + waitingSettings.wednesdaySlots + waitingSettings.thursdaySlots;
      
      // حساب المطلوب من هذا المعلم حسب التوزيع المتساوي
      const requiredFromTeacher = Math.floor(totalWeeklySlots * targetPerSlot / allTeachers.length);
      const actualAssigned = Math.min(originalQuota, requiredFromTeacher);
      
      // حساب عدد الانتظار في اليوم
      const dailyWaitingCount = Math.ceil(actualAssigned / 5);
      
      // حساب الفائض
      const surplus = Math.max(0, originalQuota - actualAssigned);
      
      newTableData[teacher.id] = {
        dailyWaiting: dailyWaitingCount,
        surplusWaiting: surplus
      };
    });
    
    setWaitersTableData(newTableData);
  };

  // دالة لإضافة منتظر يدوياً (للبطاقة الأولى)
  const handleAddWaiter = () => {
    // التحقق من البيانات
    if (!newWaiterData.name.trim()) {
      toast({
        title: "⚠️ تنبيه",
        // @ts-ignore
        description: (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>يرجى إدخال اسم المنتظر</span>
          </div>
        ),
        className: "bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400",
        duration: 3000,
      });
      return;
    }

    if (newWaiterData.waitingQuota <= 0) {
      toast({
        title: "⚠️ تنبيه",
        // @ts-ignore
        description: (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>يرجى تحديد نصاب الانتظار</span>
          </div>
        ),
        className: "bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400",
        duration: 3000,
      });
      return;
    }

    if (newWaiterData.waitingQuota > 24) {
      toast({
        title: "⚠️ تحذير",
        // @ts-ignore
        description: (
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium">تجاوز الحد الأقصى</span>
            </div>
            <span className="text-xs text-gray-600">الحد الأقصى المسموح: 24 حصة أسبوعياً</span>
          </div>
        ),
        className: "bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400",
        duration: 4000,
      });
      return;
    }

    // إضافة المعلم إلى قائمة المعلمين المخصصين
    const newTeacher = {
      id: nextCustomId,
      name: newWaiterData.name.trim(),
      subject: 'منتظر'
    };
    
    // تحديث نصاب الانتظار
    setTeachersWaitingQuota(prev => ({
      ...prev,
      [nextCustomId]: newWaiterData.waitingQuota
    }));
    
    // إضافة إلى القائمة المخصصة
    setCustomWaiters(prev => [...prev, {
      id: nextCustomId,
      name: newWaiterData.name.trim(),
      waitingQuota: newWaiterData.waitingQuota
    }]);
    
    // تحديث العداد
    setNextCustomId(prev => prev + 1);
    
    // إعادة تعيين النموذج
    const addedName = newWaiterData.name.trim();
    const addedQuota = newWaiterData.waitingQuota;
    setNewWaiterData({ name: '', waitingQuota: 0 });
    setShowAddWaiterDialog(false);
    
    toast({
      title: "✅ تمت الإضافة بنجاح",
      // @ts-ignore
      description: (
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-bold text-gray-900">{addedName}</span>
          </div>
          <div className="text-gray-600 text-xs">
            نصاب الانتظار: <span className="font-bold text-[#4f46e5]">{addedQuota}</span> حصة أسبوعياً
          </div>
        </div>
      ),
      className: "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400",
      duration: 4000,
    });
  };

  // دالة لإضافة منتظر يدوياً (للبطاقة الثانية)
  const handleAddWaiterSecond = () => {
    if (newWaiterData.name.trim()) {
      const newWaiter = {
        id: nextCustomId,
        name: newWaiterData.name.trim(),
        waitingQuota: newWaiterData.waitingQuota
      };
      
      setCustomWaiters(prev => [...prev, newWaiter]);
      setTeachersWaitingQuota(prev => ({
        ...prev,
        [nextCustomId]: newWaiterData.waitingQuota
      }));
      
      const addedName = newWaiterData.name.trim();
      const addedQuota = newWaiterData.waitingQuota;
      setNextCustomId(prev => prev + 1);
      setNewWaiterData({ name: '', waitingQuota: 0 });
      setShowAddWaiterDialogSecond(false);
      
      // تحديث بيانات الجدول
      updateWaitersTableData();
      
      toast({
        title: "✅ تمت الإضافة بنجاح",
        // @ts-ignore
        description: (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-bold text-gray-900">{addedName}</span>
            </div>
            <div className="text-gray-600 text-xs">
              نصاب الانتظار: <span className="font-bold text-[#4f46e5]">{addedQuota}</span> حصة
            </div>
          </div>
        ),
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400",
        duration: 4000,
      });
    }
  };

  // دالة لحذف منتظر مخصص
  const handleDeleteCustomWaiter = (waiterId: number) => {
    const waiterToDelete = customWaiters.find(w => w.id === waiterId);
    setCustomWaiters(prev => prev.filter(w => w.id !== waiterId));
    setTeachersWaitingQuota(prev => {
      const newQuota = { ...prev };
      delete newQuota[waiterId];
      return newQuota;
    });
    updateWaitersTableData();
    
    toast({
      title: "🗑️ تم الحذف",
      // @ts-ignore
      description: (
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-gray-700">تم حذف المنتظر</span>
          {waiterToDelete && (
            <span className="font-bold text-gray-900">{waiterToDelete.name}</span>
          )}
        </div>
      ),
      className: "bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300",
      duration: 3000,
    });
  };

  // تحديث جدول المنتظرين عند تغيير إعدادات التغطية
  useEffect(() => {
    if (waitingSettings.distributionMode === 'coverage_target') {
      updateWaitersTableData();
    }
  }, [waitingSettings.coverageTargetPerSlot, waitingSettings.distributionMode, teachersWaitingQuota, customWaiters]);

  // دالة للحصول على توضيح مفصل للتوزيع
  const getDailyWaitingTooltip = (waitingQuota: number) => {
    const daysCount = 5;
    const perDay = Math.floor(waitingQuota / daysCount);
    const extraDays = waitingQuota % daysCount;
    
    if (waitingQuota === 0) {
      return 'لا يوجد نصاب انتظار';
    }
    
    if (extraDays === 0) {
      return `${perDay} حصة في كل يوم`;
    }
    
    return `${extraDays} ${extraDays === 1 ? 'يوم' : 'أيام'}: ${perDay + 1} حصة | ${daysCount - extraDays} ${daysCount - extraDays === 1 ? 'يوم' : 'أيام'}: ${perDay} حصة`;
  };

  // ===================== إعدادات تبويب الحصص الجديد =====================
  // حالة نوع التوزيع (تلقائي أو مخصص)
  const [distributionType, setDistributionType] = useState<'automatic' | 'custom'>('automatic');
  
  // حالة قواعد التوزيع المخصص
  const [distributionRules, setDistributionRules] = useState<{
    id: string;
    period: string;
    periods: string[];
    teachers: number[];
    days: string[];
    minAssignments: number;
    maxAssignments: number;
    createdAt: Date;
  }[]>([]);
  
  // حالة نافذة إنشاء قاعدة جديدة
  const [showCreateRuleDialog, setShowCreateRuleDialog] = useState(false);
  
  // حالة بيانات القاعدة الجديدة
  const [newRule, setNewRule] = useState({
    period: '',
    periods: [] as string[], // دعم اختيار أكثر من حصة
    teachers: [] as number[],
    days: [] as string[], // دعم اختيار الأيام
    minAssignments: 1,
    maxAssignments: 1
  });
  
  // حالة القاعدة المحررة
  const [editingRule, setEditingRule] = useState<string | null>(null);
  
  // حالة أيام العمل - سيتم ربطها مع إعدادات إدارة التوقيت
  const [workingDays, setWorkingDays] = useState<string[]>(['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']);
  
  // حالة التحقق من التعارضات
  const [conflictWarnings, setConflictWarnings] = useState<string[]>([]);
  
  // حالة رسائل التحقق
  const [validationMessages, setValidationMessages] = useState<string[]>([]);

  // حالة معاينة القاعدة
  const [showRulePreview, setShowRulePreview] = useState(false);
  const [previewingRule, setPreviewingRule] = useState<string | null>(null);

  // ===================== وظائف إدارة قواعد التوزيع =====================
  
  // وظيفة فتح نافذة إنشاء قاعدة جديدة
  const handleOpenCreateRuleDialog = () => {
    // إعادة تعيين النموذج مع القيم الافتراضية
    setNewRule({
      period: '',
      periods: [],
      teachers: [],
      days: [...workingDays], // تعيين أيام العمل كافتراضي
      minAssignments: 1,
      maxAssignments: 1
    });
    
    // إعادة تعيين الحالات الأخرى
    setEditingRule(null);
    setValidationMessages([]);
    setConflictWarnings([]);
    
    // فتح النافذة
    setShowCreateRuleDialog(true);
  };
  // تم إلغاء خاصية الخروج المبكر

  // دالة حذف بيانات التتابع
  const handleDeleteConsecutiveData = () => {
    setMaxConsecutivePeriods(1);
    setSelectedConsecutiveDays([]);
    setShowDeleteConsecutiveDialog(false);
    setHasUnsavedChanges(true);

    // إظهار إشعار النجاح المحلي فقط (مرئي للمستخدم)
    setShowLocalSuccessMessage(true);

    // إخفاء الإشعار المحلي بعد 5 ثوان
    setTimeout(() => {
      setShowLocalSuccessMessage(false);
    }, 5000);
  };

  useEffect(() => {
    console.log('ScheduleSettingsFinal mounted successfully');
    console.log('Components imported:');
    console.log('- Badge:', typeof Badge);
    console.log('- DropdownMenu:', typeof DropdownMenu);
    console.log('- ScrollArea:', typeof ScrollArea);
    
    // تحميل إعدادات التتابع المحفوظة
    const savedConsecutiveSettings = localStorage.getItem('scheduleConsecutiveSettings');
    if (savedConsecutiveSettings) {
      try {
        const settings = JSON.parse(savedConsecutiveSettings);
        if (settings.subjects) {
          setSelectedConsecutiveSubjects(settings.subjects);
        }
        if (settings.classes) {
          setSelectedConsecutiveClasses(settings.classes);
        }
      } catch (error) {
        console.error('خطأ في تحميل إعدادات التتابع:', error);
      }
    }
  }, []);
  
  // وظائف لإدارة الحالة
  const toggleTeacher = (id: number) => {
    // التحقق من وجود تغييرات غير محفوظة للمعلم الحالي
    if (currentEditingTeacher && currentEditingTeacher !== id && hasUnsavedChanges) {
      setPendingTeacherSelection(id);
      setShowUnsavedWarning(true);
      
      // إشعار احترافي بدون حاجة للتأكيد
      setNotificationMessage(`⚠️ يرجى حفظ التغييرات للمعلم الحالي قبل الانتقال لمعلم آخر`);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 4000);
      return;
    }
    
    // إذا كان المعلم محدداً حالياً، قم بإلغاء التحديد
    if (selectedTeachers.includes(id)) {
      setSelectedTeachers([]);
      setCurrentEditingTeacher(null);
    } else {
      // تحديد معلم واحد فقط (منع الازدواجية)
      setSelectedTeachers([id]);
      setCurrentEditingTeacher(id);
      
      // إشعار احترافي
      const teacherName = MOCK_TEACHERS.find(t => t.id === id)?.name;
      setNotificationMessage(`✓ تم اختيار المعلم: ${teacherName}`);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    }
  };
  
  const toggleConsecutiveTeacher = (id: number) => {
    setSelectedConsecutiveTeachers(prev => 
      prev.includes(id) 
        ? prev.filter(teacherId => teacherId !== id) 
        : [...prev, id]
    );
  };
  
  // تحديد عدة معلمين دفعة واحدة
  const handleMultipleTeachersSelection = (teacherIds: number[]) => {
    setSelectedTeachers(teacherIds);
  };
  
  const handleMultipleConsecutiveTeachersSelection = (teacherIds: number[]) => {
    setSelectedConsecutiveTeachers(teacherIds);
  };
  
  // الوظائف الخاصة بالمواد
  const toggleSubject = (id: number) => {
    setSelectedSubjects(prev => 
      prev.includes(id) 
        ? prev.filter(subjectId => subjectId !== id) 
        : [...prev, id]
    );
  };
  
  // وظائف الفصول
  const toggleClass = (id: number) => {
    setSelectedClasses(prev => 
      prev.includes(id) 
        ? prev.filter(classId => classId !== id) 
        : [...prev, id]
    );
  };
  
  const handleMultipleClassesSelection = (classIds: number[]) => {
    setSelectedClasses(classIds);
  };
  
  // منطق توفر الفصول
  const toggleClassAvailability = (classId: number, dayIndex: number, periodIndex: number) => {
    setClassAvailability(prev => {
      const classState = {...prev};
      
      // إنشاء مصفوفة الحالة للفصل إذا لم تكن موجودة
      if (!classState[classId]) {
        classState[classId] = Array(WEEK_DAYS.length)
          .fill(null)
          .map(() => Array(PERIODS.length).fill(true));
      }
      
      // تبديل الحالة (true = متاح، false = مغلق)
      classState[classId][dayIndex][periodIndex] = !classState[classId][dayIndex][periodIndex];
      
      return classState;
    });
  };

  // منطق توفر المعلمين
  const toggleAvailabilityStatus = (teacherId: number, dayIndex: number, periodIndex: number) => {
    setTeacherAvailability(prev => {
      const teacherState = {...prev};
      
      // إنشاء مصفوفة الحالة للمعلم إذا لم تكن موجودة
      if (!teacherState[teacherId]) {
        teacherState[teacherId] = Array(WEEK_DAYS.length)
          .fill(null)
          .map(() => Array(PERIODS.length).fill("available"));
      }
      
      // تبديل الحالة بين متاح وغير متاح
      const currentStatus = teacherState[teacherId][dayIndex][periodIndex] || "available";
      const newStatus: AvailabilityStatus = currentStatus === "available" ? "unavailable" : "available";
      
      // إنشاء نسخة جديدة من المصفوفة لتجنب التعديل المباشر
      const newDayRow = [...teacherState[teacherId][dayIndex]];
      newDayRow[periodIndex] = newStatus;
      
      const newTeacherRows = [...teacherState[teacherId]];
      newTeacherRows[dayIndex] = newDayRow;
      
      teacherState[teacherId] = newTeacherRows;
      
      // إشعار احترافي بدون الحاجة للتأكيد
      const day = WEEK_DAYS[dayIndex];
      const period = PERIODS[periodIndex];
      const statusText = newStatus === "unavailable" ? "مغلقة" : "مفتوحة";
      setNotificationMessage(`${statusText === "مغلقة" ? "🔒" : "✓"} ${day} - ${period}: ${statusText}`);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 2000);
      
      setHasUnsavedChanges(true);
      
      return teacherState;
    });
  };

  const togglePeriodStatus = (status: AvailabilityStatus): AvailabilityStatus => {
    return status === "available" ? "unavailable" : "available";
  };

  const togglePeriodAvailability = (teacherId: number, periodIndex: number) => {
    if (!teacherId || teacherId <= 0) return;
    
    setTeacherAvailability(prev => {
      const teacherState = {...prev};
      
      if (!teacherState[teacherId]) {
        teacherState[teacherId] = Array(WEEK_DAYS.length)
          .fill(null)
          .map(() => Array(PERIODS.length).fill("available"));
      }
      
      // تحديد الحالة الحالية للعمود
      const currentStatus = teacherState[teacherId][0][periodIndex] || "available";
      const newStatus = togglePeriodStatus(currentStatus);
      
      // تطبيق الحالة الجديدة على جميع الأيام لهذه الحصة
      WEEK_DAYS.forEach((_, dayIndex) => {
        teacherState[teacherId][dayIndex][periodIndex] = newStatus;
      });
      
      setHasUnsavedChanges(true);
      toast({
        title: "تم التعديل",
        description: `تم تغيير حالة الحصة ${PERIODS[periodIndex]} لجميع الأيام`,
        variant: "default",
      });
      
      return teacherState;
    });
  };

  const toggleDayAvailability = (teacherId: number, dayIndex: number) => {
    if (!teacherId || teacherId <= 0) return;
    
    setTeacherAvailability(prev => {
      const teacherState = {...prev};
      
      if (!teacherState[teacherId]) {
        teacherState[teacherId] = Array(WEEK_DAYS.length)
          .fill(null)
          .map(() => Array(PERIODS.length).fill("available"));
      }
      
      // تحديد الحالة الحالية لليوم
      const currentStatus = teacherState[teacherId][dayIndex][0] || "available";
      const newStatus = togglePeriodStatus(currentStatus);
      
      // تطبيق الحالة الجديدة على جميع الحصص في هذا اليوم
      teacherState[teacherId][dayIndex] = Array(PERIODS.length).fill(newStatus);
      
      setHasUnsavedChanges(true);
      toast({
        title: "تم التعديل",
        description: `تم تغيير حالة جميع حصص يوم ${WEEK_DAYS[dayIndex]}`,
        variant: "default",
      });
      
      return teacherState;
    });
  };

  // إضافة مستمع لإغلاق القوائم المنسدلة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // القوائم المنسدلة في تبويب المعلمين
      const dropdown1 = document.getElementById('consecutive-teachers-dropdown');
      const button1 = document.getElementById('consecutive-teacher-selector');
      
      const dropdown2 = document.getElementById('teachers-dropdown');
      const button2 = document.getElementById('teacher-grid-selector');
      
      // القوائم المنسدلة في تبويب المواد
      const dropdown3 = document.getElementById('subjects-dropdown');
      const button3 = document.getElementById('subject-selector');
      
      const dropdown4 = document.getElementById('periods-dropdown');
      const button4 = document.getElementById('periods-selector');
      
      const dropdown5 = document.getElementById('classes-dropdown');
      const button5 = document.getElementById('classes-selector');
      
      // إغلاق القوائم المنسدلة عند النقر خارجها
      if (dropdown1 && !dropdown1.contains(event.target as Node) && 
          button1 && !button1.contains(event.target as Node)) {
        dropdown1.classList.add('hidden');
      }
      
      if (dropdown2 && !dropdown2.contains(event.target as Node) && 
          button2 && !button2.contains(event.target as Node)) {
        dropdown2.classList.add('hidden');
      }
      
      if (dropdown3 && !dropdown3.contains(event.target as Node) && 
          button3 && !button3.contains(event.target as Node)) {
        dropdown3.classList.add('hidden');
      }
      
      if (dropdown4 && !dropdown4.contains(event.target as Node) && 
          button4 && !button4.contains(event.target as Node)) {
        dropdown4.classList.add('hidden');
      }
      
      if (dropdown5 && !dropdown5.contains(event.target as Node) && 
          button5 && !button5.contains(event.target as Node)) {
        dropdown5.classList.add('hidden');
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // إضافة handler للتعامل مع النقر على رأس العمود للفصول
  const handleClassColumnHeaderClick = (periodIndex: number) => {
    if (!selectedClasses.length) {
      toast({
        title: "تنبيه",
        description: "الرجاء اختيار فصل أولاً",
        variant: "default",
      });
      return;
    }

    selectedClasses.forEach(classId => {
      setClassAvailability(prev => {
        const classState = {...prev};
        if (!classState[classId]) {
          classState[classId] = Array(WEEK_DAYS.length)
            .fill(null)
            .map(() => Array(PERIODS.length).fill(true));
        }

        // تحديد الحالة الحالية للعمود
        const currentStatus = classState[classId][0][periodIndex];
        const newStatus = !currentStatus;

        // تطبيق الحالة الجديدة على جميع الأيام لهذه الحصة
        WEEK_DAYS.forEach((_, dayIndex) => {
          classState[classId][dayIndex][periodIndex] = newStatus;
        });

        return classState;
      });
    });

    setHasUnsavedChanges(true);
    toast({
      title: "تم التعديل",
      description: `تم تغيير حالة الحصة ${PERIODS[periodIndex]} لجميع الأيام`,
      variant: "default",
    });
  };

  // إضافة handler للتعامل مع النقر على رأس العمود
  const handleColumnHeaderClick = (periodIndex: number) => {
    if (!selectedTeachers.length) {
      toast({
        title: "تنبيه",
        description: "الرجاء اختيار معلم أولاً",
        variant: "default",
      });
      return;
    }

    selectedTeachers.forEach(teacherId => {
      const currentStatus = teacherAvailability[teacherId]?.[0]?.[periodIndex] || "available";
      const newStatus = currentStatus === "available" ? "unavailable" : "available";

      setTeacherAvailability(prev => {
        const teacherState = {...prev};
        if (!teacherState[teacherId]) {
          teacherState[teacherId] = Array(WEEK_DAYS.length)
            .fill(null)
            .map(() => Array(PERIODS.length).fill("available"));
        }

        // تطبيق الحالة الجديدة على كل الأيام لهذه الحصة
        WEEK_DAYS.forEach((_, dayIndex) => {
          teacherState[teacherId][dayIndex][periodIndex] = newStatus;
        });

        return teacherState;
      });
    });

    setHasUnsavedChanges(true);
    toast({
      title: "تم التعديل",
      description: `تم تغيير حالة الحصة ${PERIODS[periodIndex]} لجميع الأيام`,
      variant: "default",
    });
  };

  // إضافة handler للتعامل مع النقر على رأس الصف للفصول
  const handleClassRowHeaderClick = (dayIndex: number) => {
    if (!selectedClasses.length) {
      toast({
        title: "تنبيه",
        description: "الرجاء اختيار فصل أولاً",
        variant: "default",
      });
      return;
    }

    selectedClasses.forEach(classId => {
      setClassAvailability(prev => {
        const classState = {...prev};
        if (!classState[classId]) {
          classState[classId] = Array(WEEK_DAYS.length)
            .fill(null)
            .map(() => Array(PERIODS.length).fill(true));
        }

        // تحديد الحالة الحالية لليوم
        const currentStatus = classState[classId][dayIndex][0];
        const newStatus = !currentStatus;

        // تطبيق الحالة الجديدة على جميع الحصص في هذا اليوم
        classState[classId][dayIndex] = Array(PERIODS.length).fill(newStatus);

        return classState;
      });
    });

    setHasUnsavedChanges(true);
    toast({
      title: "تم التعديل",
      description: `تم تغيير حالة جميع حصص يوم ${WEEK_DAYS[dayIndex]}`,
      variant: "default",
    });
  };

  // إضافة handler للتعامل مع النقر على رأس الصف
  const handleRowHeaderClick = (dayIndex: number) => {
    if (!selectedTeachers.length) {
      toast({
        title: "تنبيه",
        description: "الرجاء اختيار معلم أولاً",
        variant: "default",
      });
      return;
    }

    selectedTeachers.forEach(teacherId => {
      const currentStatus = teacherAvailability[teacherId]?.[dayIndex]?.[0] || "available";
      const newStatus = currentStatus === "available" ? "unavailable" : "available";

      setTeacherAvailability(prev => {
        const teacherState = {...prev};
        if (!teacherState[teacherId]) {
          teacherState[teacherId] = Array(WEEK_DAYS.length)
            .fill(null)
            .map(() => Array(PERIODS.length).fill("available"));
        }

        // تطبيق الحالة الجديدة على كل الحصص لهذا اليوم
        teacherState[teacherId][dayIndex] = Array(PERIODS.length).fill(newStatus);

        return teacherState;
      });
    });

    setHasUnsavedChanges(true);
    toast({
      title: "تم التعديل",
      description: `تم تغيير حالة جميع حصص يوم ${WEEK_DAYS[dayIndex]}`,
      variant: "default",
    });
  };
  
  // إضافة أو إزالة فترة مستثناة
  const toggleExcludedPeriod = (key: string, periodIndex: number) => {
    setExcludedPeriods(prev => {
      const newExcluded = {...prev};
      if (!newExcluded[key]) {
        newExcluded[key] = [periodIndex];
      } else if (newExcluded[key].includes(periodIndex)) {
        newExcluded[key] = newExcluded[key].filter(p => p !== periodIndex);
      } else {
        newExcluded[key] = [...newExcluded[key], periodIndex];
      }
      return newExcluded;
    });
  };
  
  // إدارة استثناء المواد من حصص معينة
  const toggleSubjectExclusion = (subjectId: number, periodIndex: number) => {
    setExcludedSubjects(prev => {
      const newExcludedSubjects = {...prev};
      const currentExclusions = prev[subjectId] || [];
      
      if (currentExclusions.includes(periodIndex)) {
        newExcludedSubjects[subjectId] = currentExclusions.filter(p => p !== periodIndex);
      } else {
        newExcludedSubjects[subjectId] = [...currentExclusions, periodIndex];
      }
      
      return newExcludedSubjects;
    });
  };

  // ========== دوال بطاقة الاستثناءات الجديدة ==========
  // إضافة استثناء جديد (مادة واحدة فقط - صف واحد)
  const addException = () => {
    if (selectedSubjects.length === 1 && excludedPeriods["selected"]?.length > 0) {
      const subject = SUBJECTS.find(s => s.id === selectedSubjects[0]);
      const periodIndexes = excludedPeriods["selected"];
      const periodNames = periodIndexes.map(idx => PERIODS_NAMES[idx]);
      
      // صف واحد يحتوي على كل الحصص
      const newException = {
        id: `exc-${Date.now()}`,
        subjectId: selectedSubjects[0],
        subjectName: subject?.name || '',
        periodIndexes,
        periodNames,
        createdAt: new Date()
      };
      
      setSavedExceptions(prev => [...prev, newException]);
      setSelectedSubjects([]);
      setExcludedPeriods({});
      setHasUnsavedChanges(true);
      
      // إشعار احترافي
      setSubjectsNotificationMessage(`✅ تم إضافة استثناء لمادة ${subject?.name} في ${periodIndexes.length} حصة`);
      setShowSubjectsNotification(true);
      setTimeout(() => setShowSubjectsNotification(false), 3000);
    }
  };

  // حذف استثناء واحد
  const deleteException = (id: string) => {
    setSavedExceptions(prev => prev.filter(exc => exc.id !== id));
    setHasUnsavedChanges(true);
    
    // إشعار احترافي
    setSubjectsNotificationMessage('✅ تم حذف الاستثناء بنجاح');
    setShowSubjectsNotification(true);
    setTimeout(() => setShowSubjectsNotification(false), 3000);
  };

  // حذف جميع الاستثناءات
  const deleteAllExceptions = () => {
    setSavedExceptions([]);
    setSelectedSubjects([]);
    setExcludedPeriods({});
    setHasUnsavedChanges(true);
  };

  // ========== دوال بطاقة تحديد المواد في حصص معينة ==========
  // إضافة تفضيل جديد (مادة واحدة فقط - صف واحد)
  const addSubjectPeriodAssignment = () => {
    if (selectedSubjectsForPeriods !== null && selectedPeriodsForSubjects.length > 0) {
      const subject = SUBJECTS.find(s => s.id === selectedSubjectsForPeriods);
      const periodIndexes = selectedPeriodsForSubjects;
      const periodNames = periodIndexes.map(idx => PERIODS_NAMES[idx]);
      
      // صف واحد يحتوي على كل الحصص
      const newAssignment = {
        id: `assign-${Date.now()}`,
        subjectId: selectedSubjectsForPeriods,
        subjectName: subject?.name || '',
        periodIndexes,
        periodNames,
        createdAt: new Date()
      };
      
      setSavedSubjectPeriodAssignments(prev => [...prev, newAssignment]);
      setSelectedSubjectsForPeriods(null);
      setSelectedPeriodsForSubjects([]);
      setHasUnsavedChanges(true);
      
      // إشعار احترافي
      setSubjectsNotificationMessage(`✅ تم إضافة تفضيل لمادة ${subject?.name} في ${periodIndexes.length} حصة`);
      setShowSubjectsNotification(true);
      setTimeout(() => setShowSubjectsNotification(false), 3000);
    }
  };

  // حذف تفضيل واحد
  const deleteAssignment = (id: string) => {
    setSavedSubjectPeriodAssignments(prev => prev.filter(assign => assign.id !== id));
    setHasUnsavedChanges(true);
    
    // إشعار احترافي
    setSubjectsNotificationMessage('✅ تم حذف التفضيل بنجاح');
    setShowSubjectsNotification(true);
    setTimeout(() => setShowSubjectsNotification(false), 3000);
  };

  // حذف جميع التفضيلات
  const deleteAllAssignments = () => {
    setSavedSubjectPeriodAssignments([]);
    setSelectedSubjectsForPeriods(null);
    setSelectedPeriodsForSubjects([]);
    setHasUnsavedChanges(true);
  };

  // ============= دوال الاجتماعات التخصصية =============
  
  // جلب الاجتماعات من الخادم
  const fetchMeetings = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/meetings');
      const data = await response.json();
      if (data.success) {
        setDepartmentMeetings(data.meetings);
        console.log('✅ تم جلب', data.meetings.length, 'اجتماع بنجاح');
      }
    } catch (error) {
      console.error('❌ خطأ في جلب الاجتماعات:', error);
      setNotificationMessage('❌ فشل في الاتصال بالخادم');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 4000);
    }
  };

  // التحقق من توفر الحصة
  const checkMeetingAvailability = async (dayIndex: number, periodIndex: number, excludeId?: string) => {
    try {
      const params = new URLSearchParams({
        day_index: dayIndex.toString(),
        period_index: periodIndex.toString(),
      });
      
      if (excludeId) {
        params.append('exclude_id', excludeId);
      }

      const response = await fetch(`http://localhost:5001/api/meetings/check-availability?${params}`);
      const data = await response.json();
      
      if (data.success && !data.available) {
        setMeetingConflict({
          type: 'subject',
          message: `هذه الحصة مشغولة باجتماع: ${data.conflictingMeetings.map((m: any) => m.name).join(', ')}`,
          conflictingMeetings: data.conflictingMeetings.map((m: any) => m.name)
        });
        return false;
      }
      
      setMeetingConflict(null);
      return true;
    } catch (error) {
      console.error('خطأ في التحقق من التوفر:', error);
      return false;
    }
  };

  // إضافة أو تحديث اجتماع
  const saveMeeting = async () => {
    // التحقق من البيانات
    if (!meetingName.trim()) {
      setNotificationMessage('⚠️ يرجى إدخال اسم الاجتماع');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
      return;
    }

    if (selectedMeetingDay === -1 || selectedMeetingPeriod === -1) {
      setNotificationMessage('⚠️ يرجى اختيار اليوم والحصة');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
      return;
    }

    if (selectedMeetingTeachers.length === 0) {
      setNotificationMessage('⚠️ يرجى اختيار معلم واحد على الأقل');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
      return;
    }

    // التحقق من التعارضات
    const isAvailable = await checkMeetingAvailability(
      selectedMeetingDay, 
      selectedMeetingPeriod, 
      editingMeetingId || undefined
    );

    if (!isAvailable && !allowGlobalClash) {
      // إظهار خيار السماح بالاستثناء
      return;
    }

    try {
      const meetingData = {
        name: meetingName,
        day_index: selectedMeetingDay,
        period_index: selectedMeetingPeriod,
        allow_global_clash: allowGlobalClash,
        teacher_ids: selectedMeetingTeachers
      };

      let response;
      if (editingMeetingId) {
        // تحديث
        response = await fetch(`http://localhost:5001/api/meetings/${editingMeetingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(meetingData)
        });
      } else {
        // إضافة جديد
        response = await fetch('http://localhost:5001/api/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(meetingData)
        });
      }

      const data = await response.json();
      
      if (data.success) {
        setNotificationMessage(`✅ ${editingMeetingId ? 'تم تحديث الاجتماع بنجاح' : 'تم إضافة الاجتماع بنجاح'}`);
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
        
        // إعادة جلب البيانات
        await fetchMeetings();
        
        // إعادة تعيين النموذج
        resetMeetingForm();
        setHasUnsavedChanges(true);
      } else if (data.requireException) {
        // عرض رسالة التعارض
        setMeetingConflict({
          type: 'subject',
          message: data.error,
          conflictingMeetings: data.conflictingMeetings
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الاجتماع:', error);
      setNotificationMessage(`❌ ${error.message || 'فشل في حفظ الاجتماع'}`);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 4000);
    }
  };

  // حذف اجتماع
  const deleteMeeting = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/meetings/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setNotificationMessage('✅ تم حذف الاجتماع بنجاح');
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
        
        await fetchMeetings();
        setHasUnsavedChanges(true);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('❌ خطأ في حذف الاجتماع:', error);
      setNotificationMessage(`❌ ${error.message || 'فشل في حذف الاجتماع'}`);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 4000);
    }
  };

  // تعديل اجتماع
  const editMeeting = (meeting: MeetingSession) => {
    setEditingMeetingId(meeting.id);
    setMeetingName(meeting.name);
    setSelectedMeetingDay(meeting.day_index);
    setSelectedMeetingPeriod(meeting.period_index);
    setAllowGlobalClash(meeting.allow_global_clash);
    setSelectedMeetingTeachers(meeting.participants);
    setMeetingConflict(null);
  };

  // إعادة تعيين النموذج
  const resetMeetingForm = () => {
    setEditingMeetingId(null);
    setMeetingName('');
    setSelectedMeetingDay(-1);
    setSelectedMeetingPeriod(-1);
    setAllowGlobalClash(false);
    setSelectedMeetingTeachers([]);
    setMeetingConflict(null);
  };

  // تصفية المعلمين حسب التخصص
  const getFilteredMeetingTeachers = () => {
    try {
      let filtered = MOCK_TEACHERS || [];
      
      // تصفية حسب البحث
      if (meetingSearchQuery) {
        filtered = filtered.filter(t => 
          t.name?.includes(meetingSearchQuery) || 
          // @ts-ignore
          t.subject?.includes(meetingSearchQuery)
        );
      }
      
      // تصفية حسب التخصص
      if (selectedSubjectFilter) {
        // @ts-ignore
        filtered = filtered.filter(t => t.subject === selectedSubjectFilter);
      }
      
      return filtered;
    } catch (error) {
      console.error('خطأ في تصفية المعلمين:', error);
      return [];
    }
  };

  // الحصول على قائمة التخصصات الفريدة
  const getUniqueSubjects = () => {
    try {
      if (!MOCK_TEACHERS || MOCK_TEACHERS.length === 0) {
        return [];
      }
      // @ts-ignore
      const subjects = MOCK_TEACHERS.map(t => t.subject).filter(Boolean);
      return [...new Set(subjects)];
    } catch (error) {
      console.error('خطأ في جلب التخصصات:', error);
      return [];
    }
  };

  // تبديل اختيار معلم
  const toggleMeetingTeacher = (teacherId: number) => {
    setSelectedMeetingTeachers(prev => 
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  // تحديد/إلغاء تحديد الكل
  const toggleAllMeetingTeachers = () => {
    const filteredTeachers = getFilteredMeetingTeachers();
    const allSelected = filteredTeachers.every(t => selectedMeetingTeachers.includes(t.id));
    
    if (allSelected) {
      setSelectedMeetingTeachers(prev => 
        prev.filter(id => !filteredTeachers.find(t => t.id === id))
      );
    } else {
      const newIds = filteredTeachers.map(t => t.id);
      setSelectedMeetingTeachers(prev => [...new Set([...prev, ...newIds])]);
    }
  };

  // جلب الاجتماعات عند تحميل المكون
  useEffect(() => {
    if (activeTab === 'teachers' && isDepartmentMeetingsOpen) {
      console.log('🔄 جاري جلب الاجتماعات التخصصية...');
      fetchMeetings();
    }
  }, [activeTab, isDepartmentMeetingsOpen]);

  // ============= نهاية دوال الاجتماعات =============

  // وظيفة حفظ التغييرات
  const saveChanges = () => {
    // حفظ إعدادات التتابع للمواد
    const consecutiveSettings = {
      subjects: selectedConsecutiveSubjects,
      classes: selectedConsecutiveClasses,
      enabled: selectedConsecutiveSubjects.length > 0
    };
    
    localStorage.setItem('scheduleConsecutiveSettings', JSON.stringify(consecutiveSettings));
    
    // إشعار احترافي بنجاح الحفظ
    const teacherName = currentEditingTeacher 
      ? MOCK_TEACHERS.find(t => t.id === currentEditingTeacher)?.name 
      : "الإعدادات";
    
    setNotificationMessage(`✓ تم حفظ ${teacherName} بنجاح`);
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
    
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم حفظ إعدادات الجدول بنجاح",
      variant: "default",
    });
    
    setHasUnsavedChanges(false);
    setCurrentEditingTeacher(null);
  };
  
  // وظيفة التعديل
  const handleEdit = () => {
    toast({
      title: "وضع التعديل",
      description: "يمكنك الآن تعديل الإعدادات",
      variant: "default",
    });
    setHasUnsavedChanges(true);
  };
  
  // التحقق من مغادرة الصفحة دون حفظ التغييرات
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = "لديك تغييرات غير محفوظة. هل تريد المغادرة بالفعل؟";
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // إضافة مصادر بيانات للحصص بالأسماء العربية فقط
  const PERIODS_NAMES = [
    'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة'
  ];

  // قائمة الحصص المتاحة للتوزيع
  const AVAILABLE_PERIODS = [
    { id: 'period1', name: 'الحصة الأولى', description: 'الحصة الأولى' },
    { id: 'period2', name: 'الحصة الثانية', description: 'الحصة الثانية' },
    { id: 'period3', name: 'الحصة الثالثة', description: 'الحصة الثالثة' },
    { id: 'period4', name: 'الحصة الرابعة', description: 'الحصة الرابعة' },
    { id: 'period5', name: 'الحصة الخامسة', description: 'الحصة الخامسة' },
    { id: 'period6', name: 'الحصة السادسة', description: 'الحصة السادسة' },
    { id: 'period7', name: 'الحصة السابعة', description: 'الحصة السابعة' }
  ];

  // ===================== وظائف إدارة قواعد التوزيع =====================
  
  // وظائف إدارة الأيام والحصص المتعددة
  const toggleDayInNewRule = (day: string) => {
    setNewRule(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const togglePeriodInNewRule = (periodName: string) => {
    setNewRule(prev => ({
      ...prev,
      periods: prev.periods.includes(periodName)
        ? prev.periods.filter(p => p !== periodName)
        : [...prev.periods, periodName]
    }));
  };

  // دالة التحقق من التعارضات
  const checkRuleConflicts = (rule: typeof newRule): string[] => {
    const conflicts: string[] = [];
    
    // التحقق من التعارض مع القواعد الموجودة
    distributionRules.forEach(existingRule => {
      // التحقق من تداخل الحصص والمعلمين
      const periodsOverlap = rule.periods.some(p => 
        existingRule.periods?.includes(p) || existingRule.period === p
      );
      const teachersOverlap = rule.teachers.some(t => existingRule.teachers.includes(t));
      
      if (periodsOverlap && teachersOverlap) {
        const overlappingPeriods = rule.periods.filter(p => 
          existingRule.periods?.includes(p) || existingRule.period === p
        );
        const overlappingTeachers = rule.teachers.filter(t => 
          existingRule.teachers.includes(t)
        );
        
        conflicts.push(
          `تعارض مع قاعدة موجودة: ${overlappingPeriods.join(', ')} للمعلمين ${
            overlappingTeachers.map(id => MOCK_TEACHERS.find(t => t.id === id)?.name || 'غير معروف')
              .join(', ')
          }`
        );
      }
    });

    // التحقق من منطقية النطاق (الحد الأدنى = الحد الأقصى = 1 يعني ضمان الحصول على الحصة)
    if (rule.minAssignments === 1 && rule.maxAssignments === 1) {
      const totalRequiredSlots = rule.teachers.length * rule.periods.length;
      const availableSlots = rule.days.length * MOCK_CLASSES.length;
      
      if (totalRequiredSlots > availableSlots) {
        conflicts.push(
          `مع الحد الأدنى والأقصى = 1، يحتاج ${totalRequiredSlots} موضع لكن متوفر ${availableSlots} فقط`
        );
      }
    }

    return conflicts;
  };

  // وظيفة إنشاء قاعدة جديدة محدثة
  const handleCreateRule = () => {
    const errors: string[] = [];
    
    // التحقق من الحقول المطلوبة
    if (newRule.periods.length === 0) {
      errors.push("يجب اختيار حصة واحدة على الأقل");
    }
    
    if (newRule.teachers.length === 0) {
      errors.push("يجب اختيار معلم واحد على الأقل");
    }
    
    if (newRule.days.length === 0) {
      errors.push("يجب اختيار يوم واحد على الأقل");
    }
    
    if (newRule.minAssignments > newRule.maxAssignments) {
      errors.push("الحد الأدنى لا يمكن أن يكون أكبر من الحد الأقصى");
    }

    // التحقق من التعارضات
    const conflicts = checkRuleConflicts(newRule);
    errors.push(...conflicts);

    setValidationMessages(errors);
    setConflictWarnings(conflicts);

    if (errors.length === 0) {
      const ruleId = editingRule || Date.now().toString();
      const rule = {
        id: ruleId,
        period: newRule.periods[0] || '', // للتوافق مع النظام القديم
        periods: [...newRule.periods],
        teachers: [...newRule.teachers],
        days: [...newRule.days],
        minAssignments: newRule.minAssignments,
        maxAssignments: newRule.maxAssignments,
        createdAt: new Date()
      };

      if (editingRule) {
        setDistributionRules(prev => 
          prev.map(r => r.id === editingRule ? rule : r)
        );
        toast({
          title: "تم تحديث القاعدة بنجاح",
          description: `تم تحديث قاعدة ${newRule.periods.join(', ')}`,
          variant: "default",
        });
      } else {
        setDistributionRules(prev => [...prev, rule]);
        toast({
          title: "تم إنشاء القاعدة بنجاح",
          description: `تم إنشاء قاعدة للحصص ${newRule.periods.join(', ')}`,
          variant: "default",
        });
      }

      handleCancelCreateRule();
      setHasUnsavedChanges(true);
    }
  };

  // وظيفة إلغاء إنشاء القاعدة
  const handleCancelCreateRule = () => {
    setNewRule({
      period: '',
      periods: [],
      teachers: [],
      days: [...workingDays], // إعادة تعيين إلى أيام العمل الافتراضية
      minAssignments: 1,
      maxAssignments: 3
    });
    
    setEditingRule(null);
    setShowCreateRuleDialog(false);
    setValidationMessages([]);
    setConflictWarnings([]);
  };

  // وظيفة تبديل اختيار المعلم في القاعدة الجديدة
  const toggleTeacherInNewRule = (teacherId: number) => {
    setNewRule(prev => ({
      ...prev,
      teachers: prev.teachers.includes(teacherId)
        ? prev.teachers.filter(id => id !== teacherId)
        : [...prev.teachers, teacherId]
    }));
  };

  // التحقق من الجدوى المنطقية للقواعد
  const validateRulesFeasibility = () => {
    const messages: string[] = [];
    const totalClassrooms = MOCK_CLASSES.length;
    const periodsPerWeek = totalClassrooms * 5; // افتراض 5 أيام دراسية

    // التحقق من كل حصة
    AVAILABLE_PERIODS.forEach(period => {
      const rulesForPeriod = distributionRules.filter(r => r.period === period.name);
      const totalMinRequirements = rulesForPeriod.reduce((sum, rule) => 
        sum + (rule.minAssignments * rule.teachers.length), 0
      );
      
      if (totalMinRequirements > periodsPerWeek) {
        messages.push(
          `مجموع الحدود الدنيا لـ${period.name} (${totalMinRequirements}) يتجاوز عدد الحصص المتاحة (${periodsPerWeek})`
        );
      }
    });

    setValidationMessages(messages);
    return messages.length === 0;
  };

  // تم إلغاء وظائف الخروج المبكر
  
  // تم إلغاء وظائف الخروج المبكر

  useEffect(() => {
    if (distributionRules.length > 0) {
      validateRulesFeasibility();
    }
  }, [distributionRules]);

  // حفظ وتحميل إعدادات التوزيع من localStorage
  useEffect(() => {
    const savedDistributionType = localStorage.getItem('scheduleDistributionType');
    const savedDistributionRules = localStorage.getItem('scheduleDistributionRules');
    
    if (savedDistributionType) {
      setDistributionType(savedDistributionType as 'automatic' | 'custom');
    }
    
    if (savedDistributionRules) {
      try {
        setDistributionRules(JSON.parse(savedDistributionRules));
      } catch (error) {
        console.error('خطأ في تحميل قواعد التوزيع:', error);
      }
    }
  }, []);

  // حفظ الإعدادات عند التغيير
  useEffect(() => {
    localStorage.setItem('scheduleDistributionType', distributionType);
  }, [distributionType]);

  useEffect(() => {
    localStorage.setItem('scheduleDistributionRules', JSON.stringify(distributionRules));
  }, [distributionRules]);

  // مكون زر العودة للرئيسية مع التحقق من وجود تغييرات غير محفوظة
  const BackToHomeButton = () => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    
    const handleBackClick = () => {
      if (hasUnsavedChanges) {
        setShowConfirmDialog(true);
      } else {
        // الانتقال للرئيسية مباشرة
        window.location.href = '/dashboard';
      }
    };
    
  return (
    <>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 5000px;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 1;
            max-height: 5000px;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
        }
      `}</style>
      
      <button
        onClick={handleBackClick}
        className="inline-flex items-center text-white transition-colors bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-2 px-4 rounded-lg shadow-sm"
      >
        <Home className="h-4 w-4 ml-1" />
        <span>العودة للرئيسية</span>
      </button>        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-bold text-red-600 mb-2">تنبيه!</h3>
              <p className="text-gray-700 mb-4">لديك تغييرات غير محفوظة. هل تريد المغادرة بدون حفظ؟</p>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmDialog(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    window.location.href = '/dashboard';
                  }}
                >
                  مغادرة بدون حفظ
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }}>
      <ToastProvider>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* عنوان الصفحة */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">إعدادات الجدول</h1>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="teachers" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            {/* التبويبات التسلسلية الرقمية - تصميم شريط احترافي */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 max-w-5xl mx-auto" dir="rtl">
                {/* الخطوة الأولى - المعلمون */}
                <div
                  onClick={() => setActiveTab("teachers")}
                  className={`cursor-pointer flex items-center gap-3 px-8 py-3 rounded-lg border-2 transition-all duration-300 flex-1 ${
                    activeTab === "teachers"
                      ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-lg"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#4f46e5] hover:bg-indigo-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    activeTab === "teachers"
                      ? "bg-white text-[#4f46e5]"
                      : "bg-indigo-100 text-[#4f46e5]"
                  }`}>
                    ١
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">الخطوة الأولى</div>
                    <div className="text-xs mt-0.5">المعلمون</div>
                  </div>
                </div>

                {/* السهم الأول */}
                <div className="px-2">
                  <div className={`w-6 h-6 ${activeTab !== "teachers" ? "text-gray-400" : "text-[#4f46e5]"} transform rotate-180`}>
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </div>
                </div>

                {/* الخطوة الثانية - المواد */}
                <div
                  onClick={() => setActiveTab("subjects")}
                  className={`cursor-pointer flex items-center gap-3 px-8 py-3 rounded-lg border-2 transition-all duration-300 flex-1 ${
                    activeTab === "subjects"
                      ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-lg"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#4f46e5] hover:bg-indigo-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    activeTab === "subjects"
                      ? "bg-white text-[#4f46e5]"
                      : "bg-indigo-100 text-[#4f46e5]"
                  }`}>
                    ٢
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">الخطوة الثانية</div>
                    <div className="text-xs mt-0.5">المواد</div>
                  </div>
                </div>

                {/* السهم الثاني */}
                <div className="px-2">
                  <div className={`w-6 h-6 ${activeTab !== "subjects" && activeTab !== "waiting" ? "text-gray-400" : "text-[#4f46e5]"} transform rotate-180`}>
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </div>
                </div>

                {/* الخطوة الثالثة - حصص الانتظار */}
                <div
                  onClick={() => setActiveTab("waiting")}
                  className={`cursor-pointer flex items-center gap-3 px-8 py-3 rounded-lg border-2 transition-all duration-300 flex-1 ${
                    activeTab === "waiting"
                      ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-lg"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#4f46e5] hover:bg-indigo-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    activeTab === "waiting"
                      ? "bg-white text-[#4f46e5]"
                      : "bg-indigo-100 text-[#4f46e5]"
                  }`}>
                    ٣
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">الخطوة الثالثة</div>
                    <div className="text-xs mt-0.5">حصص الانتظار</div>
                  </div>
                </div>
              </div>
            </div>
            
            <TabsContent value="teachers" className="space-y-6" dir="rtl">
              <Card>
                <CardContent className="space-y-4">
                  <div className="mt-2">
                    <Card className="border rounded-xl shadow-sm">
                      <CardHeader 
                        className="pb-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition-all duration-200"
                        onClick={() => setIsTeacherAssignmentOpen(!isTeacherAssignmentOpen)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-[#4f46e5] font-bold flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-[#4f46e5] text-white rounded-full text-base font-bold">1</span>
                            استثناء الحصص
                          </CardTitle>
                          <ChevronDown 
                            className={`h-6 w-6 text-[#4f46e5] transition-transform duration-300 ${
                              isTeacherAssignmentOpen ? 'transform rotate-180' : ''
                            }`}
                          />
                        </div>
                      </CardHeader>
                      {isTeacherAssignmentOpen && (
                      <CardContent className="pt-6"
                        style={{
                          animation: isTeacherAssignmentOpen ? 'slideDown 0.3s ease-out' : 'slideUp 0.3s ease-out'
                        }}
                      >
                        {/* إشعار احترافي بدون تأكيد */}
                        {showSuccessNotification && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl flex items-center gap-3 shadow-lg animate-in slide-in-from-top-2 duration-300">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <Info className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-blue-800 font-semibold">{notificationMessage}</p>
                            </div>
                            <button
                              onClick={() => setShowSuccessNotification(false)}
                              className="flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                        
                        {/* Layout جديد: قائمة يمنى + جدول يساري */}
                        <div className="grid grid-cols-12 gap-6">
                          {/* القائمة اليمنى للمعلمين */}
                          <div className="col-span-4">
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                              <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] p-4">
                                <h3 className="text-white font-bold text-base flex items-center mb-3">
                                  <Users className="h-5 w-5 ml-2" />
                                  قائمة المعلمين
                                </h3>
                                {/* شريط البحث */}
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="ابحث عن معلم..."
                                    value={teacherSearchQuery}
                                    onChange={(e) => setTeacherSearchQuery(e.target.value)}
                                    className="w-full px-3 py-2 pr-10 rounded-lg border border-indigo-300 bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-sm"
                                  />
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                </div>
                              </div>
                              {/* عداد المعلمين المختارين */}
                              {selectedTeachers.length > 0 && (
                                <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100">
                                  <span className="text-xs text-indigo-700 font-medium">
                                    تم اختيار {selectedTeachers.length} من {MOCK_TEACHERS.length} معلم
                                  </span>
                                </div>
                              )}
                              <ScrollArea className="h-[470px]">
                                <div className="p-2">
                                  {filteredTeachers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                      <User className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                      <p className="text-sm">لا توجد نتائج</p>
                                    </div>
                                  ) : (
                                    filteredTeachers.map((teacher) => (
                                    <div
                                      key={teacher.id}
                                      className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                                        selectedTeachers.includes(teacher.id)
                                          ? "bg-[#6366f1] text-white border-[#6366f1] shadow-md"
                                          : "bg-white text-gray-700 border-gray-200 hover:border-[#6366f1] hover:bg-indigo-50"
                                      }`}
                                      onClick={() => toggleTeacher(teacher.id)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${
                                            selectedTeachers.includes(teacher.id)
                                              ? "bg-white"
                                              : "bg-[#6366f1]"
                                          }`}></div>
                                          <span className="font-medium text-sm">{teacher.name}</span>
                                        </div>
                                        {selectedTeachers.includes(teacher.id) && (
                                          <Check className="h-4 w-4" />
                                        )}
                                      </div>
                                      <div className={`text-xs mt-1 mr-4 ${
                                        selectedTeachers.includes(teacher.id)
                                          ? "text-indigo-100"
                                          : "text-gray-500"
                                      }`}>
                                        {teacher.subject}
                                      </div>
                                    </div>
                                  ))
                                  )}
                                </div>
                              </ScrollArea>
                            </div>
                          </div>

                          {/* الجدول الشبكي في الجهة اليسرى */}
                          <div className="col-span-8">
                            <div className="rounded-xl overflow-hidden border border-gray-200">
                              <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] p-3">
                                <h3 className="text-white font-bold text-base">جدول تخصيص الحصص</h3>
                              </div>
                              <div className="p-4 bg-white">
                                <ScrollArea className="h-[380px]">
                                  <div className="grid grid-cols-[auto,repeat(7,1fr)] gap-1 rounded-lg overflow-hidden border border-gray-200" dir="rtl">
                                    <div className="bg-gray-100 p-2 text-center font-medium"></div>
                                    {PERIODS.map((period, i) => (
                                      <div 
                                        key={i} 
                                        className="bg-[#818cf8] p-2 text-center font-semibold text-white cursor-pointer hover:bg-[#6366f1] transition-all duration-200 hover:shadow-md"
                                        onClick={() => handleColumnHeaderClick(i)}
                                        title={`انقر لتغيير حالة الحصة ${period} لجميع الأيام`}
                                      >
                                        <div className="text-sm font-semibold">{period}</div>
                                        <div className="text-xs opacity-90">الحصة {i+1}</div>
                                      </div>
                                    ))}
                                    
                                    {WEEK_DAYS.map((day, dayIndex) => (
                                      <React.Fragment key={dayIndex}>
                                        <div 
                                          className="bg-[#818cf8] p-2 text-center font-semibold text-white cursor-pointer hover:bg-[#6366f1] transition-all duration-200 hover:shadow-md"
                                          onClick={() => handleRowHeaderClick(dayIndex)}
                                          title={`انقر لتغيير حالة جميع حصص يوم ${day}`}
                                        >
                                          {day}
                                        </div>
                                        {PERIODS.map((_, periodIndex) => {
                                          const status = teacherAvailability[selectedTeachers[0]]?.[dayIndex]?.[periodIndex] || "available";
                                          return (
                                            <div 
                                              key={periodIndex} 
                                              className="p-3 text-center border-r border-b hover:bg-[#F3F4F6] cursor-pointer transition-all duration-200 flex items-center justify-center"
                                              onClick={() => toggleAvailabilityStatus(selectedTeachers[0], dayIndex, periodIndex)}
                                              title={status === "available" ? "حصة مفعلة" : "حصة مغلقة"}
                                            >
                                              {status === "available" && (
                                                <CheckCircle className="w-7 h-7 p-1.5 text-[#10B981] bg-[#D1FAE5] rounded-full shadow-sm transition-all hover:shadow-md hover:bg-green-100" />
                                              )}
                                              {status === "unavailable" && (
                                                <XCircle className="w-7 h-7 p-1.5 text-[#EF4444] bg-[#FEE2E2] rounded-full shadow-sm transition-all hover:shadow-md hover:bg-rose-100" />
                                              )}
                                            </div>
                                          );
                                        })}
                                      </React.Fragment>
                                    ))}
                                  </div>
                                </ScrollArea>
                                
                                {/* دليل الاستخدام والتنبيهات داخل بطاقة الجدول */}
                                <div className="mt-2 space-y-1.5">
                                  {/* دليل الاستخدام */}
                                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-200">
                                    <div className="flex items-center gap-4 text-xs">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-[#10B981] bg-[#D1FAE5] rounded-full p-0.5" />
                                        <span className="text-gray-700">متاحة</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-[#EF4444] bg-[#FEE2E2] rounded-full p-0.5" />
                                        <span className="text-gray-700">مغلقة</span>
                                      </div>
                                      <div className="h-4 w-px bg-indigo-300"></div>
                                      <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-[#6366f1]" />
                                        <span className="text-gray-600">انقر على رأس اليوم/الحصة للتحكم السريع</span>
                                      </div>
                                    </div>
                                  </div>
                                  {/* تنبيه */}
                                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-300">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                      <span className="text-amber-800 text-xs font-medium">كثرة إغلاق الحصص قد يتعذر بسببها إنشاء الجدول</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* أزرار الحفظ والتعديل */}
                        <div className="flex justify-start gap-3 mt-6 pt-4 border-t border-gray-200">
                          <Button 
                            className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#4f46e5] hover:to-[#6366f1] text-white shadow-md hover:shadow-lg transition-all duration-200 px-6" 
                            onClick={saveChanges}
                          >
                            <Save className="h-4 w-4 ml-2" />
                            حفظ
                          </Button>
                          <Button 
                            variant="outline" 
                            className="hover:bg-blue-50 border-[#6366f1] text-[#6366f1] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-all duration-200 px-6" 
                            onClick={handleEdit}
                          >
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </Button>
                          <Button 
                            className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 px-6"
                            onClick={() => {
                              setConfirmDialog({
                                open: true,
                                title: "تأكيد الحذف",
                                message: "هل أنت متأكد من حذف جميع التخصيصات التي تم إنشاؤها لكل المعلمين؟",
                                onConfirm: () => {
                                  // حذف جميع التخصيصات
                                  setTeacherAvailability({});
                                  setSelectedTeachers([]);
                                  setTeacherSearchQuery('');
                                  setHasUnsavedChanges(true);
                                  setConfirmDialog({ ...confirmDialog, open: false });
                                }
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف التخصيص
                          </Button>
                        </div>
                      </CardContent>
                      )}
                    </Card>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <Card className="border rounded-xl shadow-sm">
                      <CardHeader 
                        className="pb-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition-all duration-200"
                        onClick={() => setIsTeacherConsecutiveOpen(!isTeacherConsecutiveOpen)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-[#4f46e5] font-bold flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-[#4f46e5] text-white rounded-full text-base font-bold">2</span>
                            تتابع الحصص
                          </CardTitle>
                          <ChevronDown 
                            className={`h-6 w-6 text-[#4f46e5] transition-transform duration-300 ${
                              isTeacherConsecutiveOpen ? 'transform rotate-180' : ''
                            }`}
                          />
                        </div>
                      </CardHeader>
                      {isTeacherConsecutiveOpen && (
                      <CardContent className="pt-6">
                        {/* Layout جديد: قائمة يمنى + إعدادات يسارية */}
                        <div className="grid grid-cols-12 gap-6">
                          {/* القائمة اليمنى للمعلمين */}
                          <div className="col-span-4">
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                              <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] p-4">
                                <h3 className="text-white font-bold text-base flex items-center mb-3">
                                  <Users className="h-5 w-5 ml-2" />
                                  قائمة المعلمين
                                </h3>
                                {/* شريط البحث */}
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="ابحث عن معلم..."
                                    value={consecutiveTeacherSearch}
                                    onChange={(e) => setConsecutiveTeacherSearch(e.target.value)}
                                    className="w-full px-3 py-2 pr-10 rounded-lg border border-indigo-300 bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-sm"
                                  />
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                </div>
                              </div>
                              {/* زر تحديد الكل */}
                              <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100">
                                <button
                                  onClick={() => {
                                    if (selectedConsecutiveTeachers.length === MOCK_TEACHERS.length) {
                                      handleMultipleConsecutiveTeachersSelection([]);
                                    } else {
                                      handleMultipleConsecutiveTeachersSelection(MOCK_TEACHERS.map(t => t.id));
                                    }
                                  }}
                                  className="w-full flex items-center justify-between bg-white hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors border border-indigo-200"
                                >
                                  <span className="text-sm font-medium text-indigo-700">
                                    {selectedConsecutiveTeachers.length === MOCK_TEACHERS.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
                                  </span>
                                  <div className={`h-5 w-5 rounded-md flex items-center justify-center ${
                                    selectedConsecutiveTeachers.length === MOCK_TEACHERS.length
                                      ? "bg-[#6366f1] text-white"
                                      : "bg-white border-2 border-indigo-300"
                                  }`}>
                                    {selectedConsecutiveTeachers.length === MOCK_TEACHERS.length && <Check className="h-3.5 w-3.5" />}
                                  </div>
                                </button>
                              </div>
                              {/* عداد المعلمين المختارين */}
                              {selectedConsecutiveTeachers.length > 0 && (
                                <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100">
                                  <span className="text-xs text-indigo-700 font-medium">
                                    تم اختيار {selectedConsecutiveTeachers.length} من {MOCK_TEACHERS.length} معلم
                                  </span>
                                </div>
                              )}
                              <ScrollArea className="h-[370px]">
                                <div className="p-2">
                                  {MOCK_TEACHERS.filter(teacher => 
                                    teacher.name.toLowerCase().includes(consecutiveTeacherSearch.toLowerCase())
                                  ).map((teacher) => (
                                    <div
                                      key={teacher.id}
                                      className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                                        selectedConsecutiveTeachers.includes(teacher.id)
                                          ? "bg-[#6366f1] text-white border-[#6366f1] shadow-md"
                                          : "bg-white text-gray-700 border-gray-200 hover:border-[#6366f1] hover:bg-indigo-50"
                                      }`}
                                      onClick={() => toggleConsecutiveTeacher(teacher.id)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${
                                            selectedConsecutiveTeachers.includes(teacher.id)
                                              ? "bg-white"
                                              : "bg-[#6366f1]"
                                          }`}></div>
                                          <span className="font-medium text-sm">{teacher.name}</span>
                                        </div>
                                        {selectedConsecutiveTeachers.includes(teacher.id) && (
                                          <Check className="h-4 w-4" />
                                        )}
                                      </div>
                                      <div className={`text-xs mt-1 mr-4 ${
                                        selectedConsecutiveTeachers.includes(teacher.id)
                                          ? "text-indigo-100"
                                          : "text-gray-500"
                                      }`}>
                                        {/* @ts-ignore */}
                                        {teacher.subject}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          </div>

                          {/* القائمة اليسرى: إعدادات التتابع */}
                          <div className="col-span-8">
                            <div className="rounded-xl overflow-hidden border border-gray-200">
                              <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] p-4">
                                <h3 className="text-white font-bold text-lg">إعدادات التتابع</h3>
                              </div>
                              <div className="p-4 bg-white space-y-4">
                        
                              {/* عدد الحصص المتتابعة */}
                              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-[#6366f1] rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="bg-[#6366f1] p-2 rounded-lg">
                                    <BookOpen className="h-4 w-4 text-white" />
                                  </div>
                                  <label className="font-bold text-gray-800 text-[15px]">عدد الحصص المتتابعة:</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={7}
                                    value={maxConsecutivePeriods}
                                    onChange={e => setMaxConsecutivePeriods(Math.min(7, Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="h-10 w-16 px-3 rounded-lg border-2 border-[#6366f1] text-center text-base font-bold text-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] bg-white shadow-sm"
                                    placeholder="1"
                                  />
                                </div>

                                <h4 className="font-bold mb-3 text-gray-800 text-[15px] flex items-center">
                                  <span className="bg-[#6366f1] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs ml-2">💡</span>
                                  مثال على تتابع الحصص:
                                </h4>
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 bg-white p-3 rounded-lg border border-gray-200">
                                  {Array.from({ length: maxConsecutivePeriods }).map((_, i) => (
                                    <div 
                                      key={i} 
                                      className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br border-2 rounded-lg flex items-center justify-center shadow-sm transition-all hover:scale-105 ${
                                        i >= 4 
                                          ? "from-red-100 to-rose-100 border-red-300" 
                                          : "from-indigo-100 to-purple-100 border-[#6366f1]"
                                      }`}
                                    >
                                      <div className="text-center">
                                        <div className={`text-lg font-bold ${i >= 4 ? "text-red-600" : "text-[#6366f1]"}`}>{i + 1}</div>
                                      </div>
                                    </div>
                                  ))}
                                  <div 
                                    className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center shadow-sm"
                                    title="راحة"
                                  >
                                    <span className="text-gray-500 text-lg">⏸️</span>
                                  </div>
                                </div>
                                
                                {maxConsecutivePeriods >= 4 && (
                                  <div className="mt-3 flex items-center p-3 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 ml-2" />
                                    <span className="text-amber-800 text-xs font-medium">
                                      ⚠️ يُفضل ألا يتجاوز عدد الحصص المتتابعة 3 حفاظًا على راحة المعلم وجودة العمل.
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* الأيام المسموح فيها بالتتابع */}
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-[#6366f1] rounded-xl p-4">
                                <div className="flex items-center mb-3">
                                  <div className="bg-[#6366f1] p-2 rounded-lg ml-2">
                                    <CalendarDays className="h-4 w-4 text-white" />
                                  </div>
                                  <h4 className="font-bold text-gray-800 text-[15px] flex-grow">الأيام المسموح فيها بالتتابع:</h4>
                                  <button
                                    type="button"
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-sm transition-all duration-200"
                                    onClick={() => {
                                      if (selectedConsecutiveDays.length === WEEK_DAYS.length) {
                                        setSelectedConsecutiveDays([]);
                                      } else {
                                        setSelectedConsecutiveDays([...WEEK_DAYS]);
                                      }
                                      setHasUnsavedChanges(true);
                                    }}
                                    title={selectedConsecutiveDays.length === WEEK_DAYS.length ? "إلغاء تحديد جميع الأيام" : "اختيار كل الأيام"}
                                  >
                                    {selectedConsecutiveDays.length === WEEK_DAYS.length ? (
                                      <X className="h-4 w-4" />
                                    ) : (
                                      <RotateCcw className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                  {WEEK_DAYS.map((day, index) => (
                                    <div
                                      key={index}
                                      className={`px-3 py-1.5 rounded-lg flex items-center cursor-pointer border transition-all shadow-sm ${
                                        selectedConsecutiveDays.includes(day) 
                                          ? "bg-[#818cf8] border-[#818cf8] text-white font-medium" 
                                          : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                                      }`}
                                      onClick={() => {
                                        if(selectedConsecutiveDays.includes(day)) {
                                          setSelectedConsecutiveDays(prev => prev.filter(d => d !== day));
                                        } else {
                                          setSelectedConsecutiveDays(prev => [...prev, day]);
                                        }
                                      }}
                                    >
                                      <div className="ml-2 flex-shrink-0">
                                        <div className={`h-3.5 w-3.5 rounded-sm flex items-center justify-center border ${
                                          selectedConsecutiveDays.includes(day) 
                                            ? "bg-white border-white" 
                                            : "border-gray-400 bg-white"
                                        }`}>
                                          {selectedConsecutiveDays.includes(day) && (
                                            <Check className="h-2.5 w-2.5 text-[#818cf8]" />
                                          )}
                                        </div>
                                      </div>
                                      <span className="text-sm flex-1 text-center">{day}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* الشرح التوضيحي الاحترافي - أسفل بطاقة الأيام */}
                              <div className="mt-4 space-y-2">
                                {/* الوضع التلقائي للتتابع */}
                                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-200">
                                  <div className="flex items-center gap-2">
                                    <Info className="h-5 w-5 text-[#6366f1] flex-shrink-0" />
                                    <span className="text-gray-800 text-sm"><strong className="text-[#6366f1]">الوضع التلقائي:</strong> حصة واحدة ثم حصة راحة وتعتمد على نصاب المعلم والإعدادات التي تم إنشاءها.</span>
                                  </div>
                                </div>
                                {/* تخصيص التتابع */}
                                <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                                  <div className="flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-purple-600 flex-shrink-0" />
                                    <span className="text-gray-800 text-sm"><strong className="text-purple-600">تخصيص التتابع:</strong> يمكن تخصيص تتابع الحصص بعدد حصص معينة وفي أيام معينة لمعلم أو للكل.</span>
                                  </div>
                                </div>
                                {/* تحذير الاستثناءات */}
                                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-300">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                    <span className="text-gray-800 text-sm">تؤثر كثرة الاستثناءات على الوضع التلقائي للتتابع.</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        </div>
                        
                        {/* شريط الأزرار - تم نقلها لليمين مع الألوان الجديدة */}
                        <div className="flex justify-start gap-3 mt-6 pt-5 border-t-2 border-gray-200">
                          <Button 
                            className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5 font-bold" 
                            onClick={saveChanges}
                          >
                            <Save className="h-5 w-5 ml-2" />
                            حفظ
                          </Button>
                          <Button 
                            variant="outline"
                            className="hover:bg-blue-50 border-[#6366f1] text-[#6366f1] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-all duration-200 px-6 py-2.5 font-bold"
                            onClick={handleEdit}
                          >
                            <Edit className="h-5 w-5 ml-2" />
                            تعديل
                          </Button>
                          <Button
                            className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5 font-bold"
                            onClick={() => setShowDeleteConsecutiveDialog(true)}
                          >
                            <Trash2 className="h-5 w-5 ml-2" />
                            حذف التتابع
                          </Button>
                        </div>

                          {/* إشعار النجاح المحلي */}
                          {showLocalSuccessMessage && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl flex items-center gap-3 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
                              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-green-800 font-bold text-lg">تم الحذف بنجاح!</h4>
                                <p className="text-green-700 text-sm mt-1">تم حذف جميع بيانات التتابع وإعادة تعيين الإعدادات</p>
                              </div>
                              <button
                                onClick={() => setShowLocalSuccessMessage(false)}
                                className="flex-shrink-0 text-green-600 hover:text-green-800 transition-colors"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                      </CardContent>
                      )}
                    </Card>
                  </div>

                  {/* قسم تخصيص توزيع الحصص على المعلمين */}
                  <div className="mt-6 pt-4 border-t">
                    <Card>
                      <CardHeader 
                        className="pb-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition-all duration-200"
                        onClick={() => setIsDistributionRulesOpen(!isDistributionRulesOpen)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-[#4f46e5] font-bold flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-[#4f46e5] text-white rounded-full text-base font-bold">3</span>
                            تخصيص توزيع الحصص
                          </CardTitle>
                          <ChevronDown 
                            className={`h-6 w-6 text-[#4f46e5] transition-transform duration-300 ${
                              isDistributionRulesOpen ? 'transform rotate-180' : ''
                            }`}
                          />
                        </div>
                      </CardHeader>
                      {isDistributionRulesOpen && (
                      <CardContent className="pt-6">
                  {/* Layout جديد: قائمة يمنى للمعلمين + قائمة يسرى للإعداد المتقدم */}
                  <div className="grid grid-cols-12 gap-6">
                    {/* القائمة اليمنى للمعلمين */}
                    <div className="col-span-4">
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] p-4">
                          <h3 className="text-white font-bold text-base flex items-center mb-3">
                            <Users className="h-5 w-5 ml-2" />
                            قائمة المعلمين
                          </h3>
                          {/* شريط البحث */}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="ابحث عن معلم..."
                              value={distributionTeacherSearch}
                              onChange={(e) => setDistributionTeacherSearch(e.target.value)}
                              className="w-full px-3 py-2 pr-10 rounded-lg border border-indigo-300 bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-sm"
                            />
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          </div>
                        </div>
                        {/* زر تحديد الكل */}
                        <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100">
                          <button
                            onClick={() => {
                              if (selectedTeachers.length === MOCK_TEACHERS.length) {
                                setSelectedTeachers([]);
                              } else {
                                setSelectedTeachers(MOCK_TEACHERS.map(t => t.id));
                              }
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full flex items-center justify-between bg-white hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors border border-indigo-200"
                          >
                            <span className="text-sm font-medium text-indigo-700">
                              {selectedTeachers.length === MOCK_TEACHERS.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
                            </span>
                            <div className={`h-5 w-5 rounded-md flex items-center justify-center ${
                              selectedTeachers.length === MOCK_TEACHERS.length
                                ? "bg-[#6366f1] text-white"
                                : "bg-white border-2 border-indigo-300"
                            }`}>
                              {selectedTeachers.length === MOCK_TEACHERS.length && <Check className="h-3.5 w-3.5" />}
                            </div>
                          </button>
                        </div>
                        {/* عداد المعلمين المختارين */}
                        {selectedTeachers.length > 0 && (
                          <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100">
                            <span className="text-xs text-indigo-700 font-medium">
                              تم اختيار {selectedTeachers.length} من {MOCK_TEACHERS.length} معلم
                            </span>
                          </div>
                        )}
                        <ScrollArea className="h-[470px]">
                          <div className="p-2">
                            {MOCK_TEACHERS.filter(teacher => 
                              teacher.name.toLowerCase().includes(distributionTeacherSearch.toLowerCase()) ||
                              // @ts-ignore
                              teacher.subject.toLowerCase().includes(distributionTeacherSearch.toLowerCase())
                            ).map((teacher) => (
                              <div
                                key={teacher.id}
                                className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                                  selectedTeachers.includes(teacher.id)
                                    ? "bg-[#6366f1] text-white border-[#6366f1] shadow-md"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-[#6366f1] hover:bg-indigo-50"
                                }`}
                                onClick={() => {
                                  if (selectedTeachers.includes(teacher.id)) {
                                    setSelectedTeachers(prev => prev.filter(id => id !== teacher.id));
                                  } else {
                                    setSelectedTeachers(prev => [...prev, teacher.id]);
                                  }
                                  setHasUnsavedChanges(true);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      selectedTeachers.includes(teacher.id)
                                        ? "bg-white"
                                        : "bg-[#6366f1]"
                                    }`}></div>
                                    <span className="font-medium text-sm">{teacher.name}</span>
                                  </div>
                                  {selectedTeachers.includes(teacher.id) && (
                                    <Check className="h-4 w-4" />
                                  )}
                                </div>
                                <div className={`text-xs mt-1 mr-4 ${
                                  selectedTeachers.includes(teacher.id)
                                    ? "text-indigo-100"
                                    : "text-gray-500"
                                }`}>
                                  {teacher.subject}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>

                    {/* القائمة اليسرى: إعداد متقدم */}
                    <div className="col-span-8">
                      <div className="rounded-xl overflow-hidden border border-gray-200">
                        <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] p-4">
                          <h3 className="text-white font-bold text-lg">إعداد متقدم</h3>
                        </div>
                        <div className="p-4 bg-white">
                          <ScrollArea className="h-[540px]">
                            <div className="space-y-5 pr-4">
                              {/* الشرح التوضيحي */}
                              <div className="bg-indigo-50 rounded-lg border border-[#818cf8] p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Settings className="h-5 w-5 text-[#4f46e5]" />
                                  <h4 className="text-[#4f46e5] font-bold text-base">نظام التوزيع المتقدم</h4>
                                </div>
                                
                                <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                  <strong className="text-[#4f46e5]">الهدف:</strong> تخصيص توزيع الحصص على المعلمين مع إمكانية تحديد الحد الأدنى والأقصى لحصة معينة لمعلم معين أو مجموعة من المعلمين.
                                </p>

                                <div className="space-y-2 mt-4">
                                  {/* المثال الأول */}
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-start gap-3">
                                      <div className="bg-[#6366f1] text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          <span className="font-bold text-[#4f46e5]">مثال:</span> معلم التربية البدنية تود أن تكون حصصه في كل الأيام من الحصة الأولى إلى الخامسة ولأجل التطبيق بشكل صحيح : <strong>حدد الأيام ثم اختر الحصص من الأولى إلى الخامسة ثم ضع (الحد الأدنى: 1، الحد الأقصى: 1)</strong>، وعليه سيكون جدول المعلم من الأولى إلى الخامسة لكل يوم.
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* المثال الثاني */}
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-start gap-3">
                                      <div className="bg-[#6366f1] text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          <span className="font-bold text-[#4f46e5]">مثال:</span> إذا أردت توزيع الحصة الأخيرة بين المعلمين ولأجل التطبيق بشكل صحيح <strong>ضع النطاق في الحصة السابعة فقط لكل المعلمين (الحد الأدنى: 1، الحد الأقصى: 3)</strong>، وعليه سيحصل كل معلم على 1-3 حصص أخيرة أسبوعياً، وقس عليها الحصة الأولى.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* تحذير كثرة الاشتراطات */}
                                <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-400">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                    <span className="text-amber-900 text-sm font-semibold">كثرة الاشتراطات والاستثناءات قد تؤثر على إنشاء الجدول</span>
                                  </div>
                                </div>
                              </div>

                              {/* أولاً: اختيار المعلمين */}
                              <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Users className="h-5 w-5 text-[#4f46e5]" />
                                  <h4 className="font-bold text-gray-800 text-base">الخطوة الأولى: اختيار المعلمين</h4>
                                </div>
                                <p className="text-sm text-gray-600">اختر معلم أو مجموعة معلمين من القائمة اليمنى</p>
                              </div>

                              {/* ثانياً: تحديد الأيام */}
                              <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-[#4f46e5]" />
                                    <h4 className="font-bold text-gray-800 text-base">الخطوة الثانية: تحديد الأيام</h4>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg text-xs px-3 py-1 h-7"
                                    onClick={() => {
                                      if (newRule.days.length === workingDays.length) {
                                        setNewRule(prev => ({ ...prev, days: [] }));
                                      } else {
                                        setNewRule(prev => ({ ...prev, days: [...workingDays] }));
                                      }
                                    }}
                                  >
                                    {newRule.days.length === workingDays.length ? 'إلغاء الكل' : 'تحديد كل الأيام'}
                                  </Button>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                  {workingDays.map((day) => (
                                    <div
                                      key={day}
                                      className={`p-2.5 rounded-lg cursor-pointer transition-all border text-center ${
                                        newRule.days.includes(day)
                                          ? 'bg-[#6366f1] border-[#6366f1] text-white'
                                          : 'bg-white border-gray-300 text-gray-600 hover:border-[#818cf8]'
                                      }`}
                                      onClick={() => toggleDayInNewRule(day)}
                                    >
                                      <div className="font-medium text-sm">{day}</div>
                                    </div>
                                  ))}
                                </div>
                                {newRule.days.length > 0 && (
                                  <div className="mt-3 text-xs text-gray-600 text-center">
                                    تم اختيار {newRule.days.length} من {workingDays.length} أيام
                                  </div>
                                )}
                              </div>

                              {/* ثالثاً: تحديد الحصص */}
                              <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-[#4f46e5]" />
                                    <h4 className="font-bold text-gray-800 text-base">الخطوة الثالثة: تحديد الحصص</h4>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg text-xs px-3 py-1 h-7"
                                    onClick={() => {
                                      if (newRule.periods.length === AVAILABLE_PERIODS.length) {
                                        setNewRule(prev => ({ ...prev, periods: [] }));
                                      } else {
                                        setNewRule(prev => ({ ...prev, periods: AVAILABLE_PERIODS.map(p => p.name) }));
                                      }
                                    }}
                                  >
                                    {newRule.periods.length === AVAILABLE_PERIODS.length ? 'إلغاء الكل' : 'تحديد الكل'}
                                  </Button>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {AVAILABLE_PERIODS.map((period) => (
                                    <div
                                      key={period.id}
                                      className={`p-2.5 rounded-lg cursor-pointer transition-all border text-center ${
                                        newRule.periods.includes(period.name)
                                          ? 'bg-[#6366f1] border-[#6366f1] text-white'
                                          : 'bg-white border-gray-300 text-gray-600 hover:border-[#818cf8]'
                                      }`}
                                      onClick={() => togglePeriodInNewRule(period.name)}
                                    >
                                      <div className="font-medium text-sm">{period.name}</div>
                                    </div>
                                  ))}
                                </div>
                                {newRule.periods.length > 0 && (
                                  <div className="mt-3 text-xs text-gray-600 text-center">
                                    تم اختيار {newRule.periods.length} من {AVAILABLE_PERIODS.length} حصص
                                  </div>
                                )}
                              </div>

                              {/* رابعاً: نطاق التوزيع */}
                              <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <RotateCcw className="h-5 w-5 text-[#4f46e5]" />
                                  <h4 className="font-bold text-gray-800 text-base">الخطوة الرابعة: نطاق التوزيع</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">حدد عدد الحصص المطلوب إسنادها أسبوعياً</p>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">الحد الأدنى</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={5}
                                      value={newRule.minAssignments}
                                      onChange={(e) => setNewRule(prev => ({ 
                                        ...prev, 
                                        minAssignments: Math.min(5, Math.max(0, parseInt(e.target.value) || 1))
                                      }))}
                                      className="text-center text-lg font-bold border-[#818cf8] focus:border-[#4f46e5] h-11"
                                      placeholder="1"
                                    />
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">الحد الأقصى</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={5}
                                      value={newRule.maxAssignments}
                                      onChange={(e) => setNewRule(prev => ({ 
                                        ...prev, 
                                        maxAssignments: Math.min(5, Math.max(0, parseInt(e.target.value) || 1))
                                      }))}
                                      className="text-center text-lg font-bold border-[#818cf8] focus:border-[#4f46e5] h-11"
                                      placeholder="1"
                                    />
                                  </div>
                                </div>

                                {/* ملاحظة للحد المتساوي */}
                                {newRule.minAssignments === newRule.maxAssignments && newRule.minAssignments > 0 && (
                                  <div className="mt-3 p-3 bg-indigo-50 border border-[#818cf8] rounded-lg">
                                    <p className="text-sm text-gray-700">
                                      <strong className="text-[#4f46e5]">ملاحظة:</strong> سيحصل على {newRule.minAssignments} {newRule.minAssignments === 1 ? 'حصة' : 'حصص'} بالضبط في الأسبوع
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* زر الإضافة */}
                              <div className="flex justify-center pt-2">
                                <Button 
                                  onClick={() => {
                                    // التحقق من البيانات
                                    const errors: string[] = [];
                                    if (newRule.days.length === 0) errors.push("يجب اختيار يوم واحد على الأقل");
                                    if (newRule.periods.length === 0) errors.push("يجب اختيار حصة واحدة على الأقل");
                                    if (selectedTeachers.length === 0) errors.push("يجب اختيار معلم واحد على الأقل من القائمة اليمنى");
                                    
                                    if (errors.length > 0) {
                                      setConfirmDialog({
                                        open: true,
                                        title: "خطأ في البيانات",
                                        message: errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n'),
                                        onConfirm: () => {
                                          setConfirmDialog({ ...confirmDialog, open: false });
                                        },
                                        confirmText: "حسناً",
                                        showCancel: false
                                      });
                                      return;
                                    }

                                    // إضافة القاعدة
                                    const newRuleData = {
                                      id: Date.now().toString(),
                                      period: newRule.periods.join(', '),
                                      periods: newRule.periods,
                                      teachers: selectedTeachers,
                                      days: newRule.days,
                                      minAssignments: newRule.minAssignments,
                                      maxAssignments: newRule.maxAssignments,
                                      createdAt: new Date()
                                    };

                                    setDistributionRules(prev => [...prev, newRuleData]);
                                    setHasUnsavedChanges(true);
                                    
                                    // إعادة تعيين النموذج والاختيارات بالكامل
                                    setNewRule({
                                      period: '',
                                      periods: [],
                                      teachers: [],
                                      days: [...workingDays],
                                      minAssignments: 1,
                                      maxAssignments: 1
                                    });
                                    
                                    // إعادة ضبط المعلمين المختارين
                                    setSelectedTeachers([]);
                                    
                                    // إعادة ضبط شريط البحث
                                    setDistributionTeacherSearch('');

                                    // عرض رسالة نجاح
                                    setConfirmDialog({
                                      open: true,
                                      title: "تم الإضافة بنجاح",
                                      message: "تمت إضافة الإعداد بنجاح، يمكنك إضافة إعداد جديد",
                                      onConfirm: () => {
                                        setConfirmDialog({ ...confirmDialog, open: false });
                                      },
                                      confirmText: "حسناً",
                                      showCancel: false
                                    });
                                  }}
                                  className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg shadow-md px-8 py-2.5 font-bold"
                                >
                                  <Plus className="h-5 w-5 ml-2" />
                                  إضافة الإعداد
                                </Button>
                              </div>

                              {/* عرض القواعد المضافة */}
                              {distributionRules.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-gray-800 text-base">الإعداد المتقدم المضاف ({distributionRules.length})</h4>
                                  </div>

                                  {/* جدول القواعد */}
                                  <div className="bg-white rounded-lg border overflow-hidden">
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-3 py-2 text-right font-medium text-gray-700">الحصص</th>
                                            <th className="px-3 py-2 text-right font-medium text-gray-700">النطاق</th>
                                            <th className="px-3 py-2 text-right font-medium text-gray-700">المعلمون</th>
                                            <th className="px-3 py-2 text-right font-medium text-gray-700">الأيام</th>
                                            <th className="px-3 py-2 text-right font-medium text-gray-700">إجراءات</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {distributionRules.map((rule) => (
                                            <tr key={rule.id} className="border-b hover:bg-gray-50">
                                              <td className="px-3 py-2">
                                                <span className="font-medium text-[#4f46e5]">{rule.period}</span>
                                              </td>
                                              <td className="px-3 py-2">
                                                <span className="text-gray-800 font-medium">{rule.minAssignments} - {rule.maxAssignments}</span>
                                              </td>
                                              <td className="px-3 py-2">
                                                {rule.teachers.length > 0 ? (
                                                  rule.teachers.length === MOCK_TEACHERS.length ? (
                                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300 font-semibold">
                                                      اختيار الكل ({MOCK_TEACHERS.length})
                                                    </Badge>
                                                  ) : (
                                                    <div className="flex flex-wrap gap-1">
                                                      {rule.teachers.map(teacherId => {
                                                        const teacher = MOCK_TEACHERS.find(t => t.id === teacherId);
                                                        return teacher ? (
                                                          <Badge key={teacherId} variant="outline" className="text-xs">
                                                            {teacher.name}
                                                          </Badge>
                                                        ) : null;
                                                      })}
                                                    </div>
                                                  )
                                                ) : (
                                                  <span className="text-gray-400 text-xs">غير محدد</span>
                                                )}
                                              </td>
                                              <td className="px-3 py-2">
                                                <span className="text-xs text-gray-600">{rule.days.length} {rule.days.length === 1 ? 'يوم' : 'أيام'}</span>
                                              </td>
                                              <td className="px-3 py-2">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmDialog({
                                                      open: true,
                                                      title: "تأكيد الحذف",
                                                      message: "هل أنت متأكد من حذف هذه القاعدة؟",
                                                      onConfirm: () => {
                                                        setDistributionRules(prev => prev.filter(r => r.id !== rule.id));
                                                        setHasUnsavedChanges(true);
                                                        
                                                        // إعادة ضبط جميع الاختيارات بعد الحذف
                                                        setNewRule({
                                                          period: '',
                                                          periods: [],
                                                          teachers: [],
                                                          days: [...workingDays],
                                                          minAssignments: 1,
                                                          maxAssignments: 1
                                                        });
                                                        setSelectedTeachers([]);
                                                        setDistributionTeacherSearch('');
                                                        
                                                        setConfirmDialog({ ...confirmDialog, open: false });
                                                      }
                                                    });
                                                  }}
                                                  className="h-7 px-2 text-red-600 border-red-300 hover:bg-red-50"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* شريط الأزرار */}
                  <div className="flex justify-start gap-3 mt-6 pt-5 border-t-2 border-gray-200">
                    <Button 
                      className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5 font-bold" 
                      onClick={saveChanges}
                    >
                      <Save className="h-5 w-5 ml-2" />
                      حفظ
                    </Button>
                    <Button 
                      variant="outline"
                      className="hover:bg-blue-50 border-[#6366f1] text-[#6366f1] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-all duration-200 px-6 py-2.5 font-bold"
                      onClick={handleEdit}
                    >
                      <Edit className="h-5 w-5 ml-2" />
                      تعديل
                    </Button>
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5 font-bold"
                      onClick={() => {
                        setConfirmDialog({
                          open: true,
                          title: "تأكيد الحذف",
                          message: "هل أنت متأكد من حذف جميع الإعدادات المتقدمة التي تم إنشاؤها لكل المعلمين؟",
                          onConfirm: () => {
                            setDistributionRules([]);
                            setHasUnsavedChanges(true);
                            
                            // إعادة ضبط جميع الاختيارات بعد حذف الكل
                            setNewRule({
                              period: '',
                              periods: [],
                              teachers: [],
                              days: [...workingDays],
                              minAssignments: 1,
                              maxAssignments: 1
                            });
                            setSelectedTeachers([]);
                            setDistributionTeacherSearch('');
                            
                            setConfirmDialog({ ...confirmDialog, open: false });
                          }
                        });
                      }}
                    >
                      <Trash2 className="h-5 w-5 ml-2" />
                      حذف الإعداد المتقدم
                    </Button>
                  </div>
                </CardContent>
                )}
                    </Card>
                  </div>

                  {/* البطاقة الرابعة: الاجتماعات التخصصية */}
                  <div className="mt-6 pt-4 border-t">
                    <Card className="border rounded-xl shadow-sm">
                      <CardHeader 
                        className="pb-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition-all duration-200"
                        onClick={() => setIsDepartmentMeetingsOpen(!isDepartmentMeetingsOpen)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-[#4f46e5] font-bold flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-[#4f46e5] text-white rounded-full text-base font-bold">4</span>
                            الاجتماعات التخصصية
                          </CardTitle>
                          <ChevronDown 
                            className={`h-6 w-6 text-[#4f46e5] transition-transform duration-300 ${
                              isDepartmentMeetingsOpen ? 'transform rotate-180' : ''
                            }`}
                          />
                        </div>
                      </CardHeader>
                      {isDepartmentMeetingsOpen && (
                      <CardContent className="pt-6">
                        {/* شرح توضيحي */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-200">
                          <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-[#4f46e5] flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-bold text-[#4f46e5] mb-2">عن الاجتماعات التخصصية</h4>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                يمكنك جدولة اجتماعات تخصصية ثابتة للمعلمين. عند إنشاء الجدول، سيتم حجز هذه الحصص تلقائياً ولن يتم إسناد أي حصص تدريسية أو انتظار للمعلمين المشاركين في نفس التوقيت.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Layout: قسمين */}
                        <div className="grid grid-cols-12 gap-6">
                          {/* القسم أ: اختيار المعلمين (اليمين) */}
                          <div className="col-span-5">
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                              <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] p-4">
                                <h3 className="text-white font-bold text-base flex items-center mb-3">
                                  <Users className="h-5 w-5 ml-2" />
                                  اختيار المعلمين
                                </h3>
                                
                                {/* شريط البحث */}
                                <div className="relative mb-3">
                                  <input
                                    type="text"
                                    placeholder="ابحث عن معلم..."
                                    value={meetingSearchQuery}
                                    onChange={(e) => setMeetingSearchQuery(e.target.value)}
                                    className="w-full px-3 py-2 pr-10 rounded-lg border border-indigo-300 bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-sm"
                                  />
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                </div>

                                {/* فرز حسب التخصص */}
                                <div className="relative">
                                  <select
                                    value={selectedSubjectFilter}
                                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-indigo-300 bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-sm"
                                  >
                                    <option value="">جميع التخصصات</option>
                                    {getUniqueSubjects().map((subject) => (
                                      <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* زر تحديد الكل */}
                              <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100">
                                <button
                                  onClick={toggleAllMeetingTeachers}
                                  className="w-full flex items-center justify-between bg-white hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors border border-indigo-200"
                                >
                                  <span className="text-sm font-medium text-indigo-700">
                                    {getFilteredMeetingTeachers().every(t => selectedMeetingTeachers.includes(t.id)) 
                                      ? "إلغاء تحديد الكل" 
                                      : "تحديد الكل"}
                                  </span>
                                  <div className={`h-5 w-5 rounded-md flex items-center justify-center ${
                                    getFilteredMeetingTeachers().every(t => selectedMeetingTeachers.includes(t.id))
                                      ? "bg-[#6366f1] text-white"
                                      : "bg-white border-2 border-indigo-300"
                                  }`}>
                                    {getFilteredMeetingTeachers().every(t => selectedMeetingTeachers.includes(t.id)) && 
                                      <Check className="h-3.5 w-3.5" />}
                                  </div>
                                </button>
                              </div>

                              {/* عداد المعلمين */}
                              {selectedMeetingTeachers.length > 0 && (
                                <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100">
                                  <span className="text-xs text-indigo-700 font-medium">
                                    تم اختيار {selectedMeetingTeachers.length} معلم
                                  </span>
                                </div>
                              )}

                              {/* قائمة المعلمين */}
                              <ScrollArea className="h-[400px]">
                                <div className="p-2">
                                  {(() => {
                                    const filteredTeachers = getFilteredMeetingTeachers();
                                    console.log('📋 عدد المعلمين المفلترين:', filteredTeachers.length);
                                    
                                    if (filteredTeachers.length === 0) {
                                      return (
                                        <div className="text-center py-8 text-gray-500">
                                          <User className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                          <p className="text-sm">لا توجد نتائج</p>
                                        </div>
                                      );
                                    }
                                    
                                    return filteredTeachers.map((teacher) => {
                                      // تحقق من وجود المعلم في اجتماع آخر في نفس التوقيت
                                      const hasConflict = selectedMeetingDay !== -1 && selectedMeetingPeriod !== -1 && 
                                        departmentMeetings.some(m => 
                                          m.id !== editingMeetingId &&
                                          m.day_index === selectedMeetingDay && 
                                          m.period_index === selectedMeetingPeriod &&
                                          m.participants.includes(teacher.id)
                                        );

                                      return (
                                        <div
                                          key={teacher.id}
                                          className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                                            hasConflict
                                              ? "bg-red-50 text-red-700 border-red-300 cursor-not-allowed opacity-60"
                                              : selectedMeetingTeachers.includes(teacher.id)
                                                ? "bg-[#6366f1] text-white border-[#6366f1] shadow-md"
                                                : "bg-white text-gray-700 border-gray-200 hover:border-[#6366f1] hover:bg-indigo-50"
                                          }`}
                                          onClick={() => !hasConflict && toggleMeetingTeacher(teacher.id)}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <div className={`w-2 h-2 rounded-full ${
                                                hasConflict
                                                  ? "bg-red-500"
                                                  : selectedMeetingTeachers.includes(teacher.id)
                                                    ? "bg-white"
                                                    : "bg-[#6366f1]"
                                              }`}></div>
                                              <span className="font-medium text-sm">{teacher.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {hasConflict && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                              {selectedMeetingTeachers.includes(teacher.id) && !hasConflict && (
                                                <Check className="h-4 w-4" />
                                              )}
                                            </div>
                                          </div>
                                          <div className={`text-xs mt-1 mr-4 ${
                                            hasConflict
                                              ? "text-red-600"
                                              : selectedMeetingTeachers.includes(teacher.id)
                                                ? "text-indigo-100"
                                                : "text-gray-500"
                                          }`}>
                                            {/* @ts-ignore */}
                                            {teacher.subject}
                                            {hasConflict && " (في اجتماع آخر)"}
                                          </div>
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>
                              </ScrollArea>
                            </div>
                          </div>

                          {/* القسم ب: تحديد الموعد والإعدادات (اليسار) */}
                          <div className="col-span-7">
                            <div className="rounded-xl overflow-hidden border border-gray-200">
                              <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] p-4">
                                <h3 className="text-white font-bold text-base">تحديد الموعد والحفظ</h3>
                              </div>
                              
                              <div className="p-4 bg-white">
                                <ScrollArea className="h-[540px]">
                                  <div className="space-y-4 pr-2">
                                    {/* اسم الاجتماع */}
                                    <div>
                                      <Label className="text-sm font-bold text-gray-700 mb-2 block">
                                        اسم الاجتماع
                                      </Label>
                                      <Input
                                        value={meetingName}
                                        onChange={(e) => setMeetingName(e.target.value)}
                                        placeholder="مثال: اجتماع اللغة العربية - المجموعة 1"
                                        className="w-full"
                                      />
                                    </div>

                                    {/* اليوم */}
                                    <div>
                                      <Label className="text-sm font-bold text-gray-700 mb-2 block">
                                        اليوم
                                      </Label>
                                      <Select 
                                        value={selectedMeetingDay.toString()} 
                                        onValueChange={(value) => {
                                          setSelectedMeetingDay(parseInt(value));
                                          if (selectedMeetingPeriod !== -1) {
                                            checkMeetingAvailability(parseInt(value), selectedMeetingPeriod, editingMeetingId || undefined);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="اختر اليوم" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {WEEK_DAYS.map((day, index) => (
                                            <SelectItem key={index} value={index.toString()}>
                                              {day}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* الحصة */}
                                    <div>
                                      <Label className="text-sm font-bold text-gray-700 mb-2 block">
                                        الحصة
                                      </Label>
                                      <Select 
                                        value={selectedMeetingPeriod.toString()} 
                                        onValueChange={(value) => {
                                          setSelectedMeetingPeriod(parseInt(value));
                                          if (selectedMeetingDay !== -1) {
                                            checkMeetingAvailability(selectedMeetingDay, parseInt(value), editingMeetingId || undefined);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="اختر الحصة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {PERIODS.map((period, index) => (
                                            <SelectItem key={index} value={index.toString()}>
                                              الحصة {period}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* رسالة التعارض */}
                                    {meetingConflict && (
                                      <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
                                        <div className="flex items-start gap-3">
                                          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                          <div className="flex-1">
                                            <p className="text-sm text-amber-800 font-medium mb-2">
                                              {meetingConflict.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3">
                                              <input
                                                type="checkbox"
                                                id="allow-clash"
                                                checked={allowGlobalClash}
                                                onChange={(e) => setAllowGlobalClash(e.target.checked)}
                                                className="rounded border-amber-400"
                                              />
                                              <label htmlFor="allow-clash" className="text-sm text-amber-700 font-medium cursor-pointer">
                                                السماح بالاستثناء (تجاهل التعارض)
                                              </label>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* معلومات إضافية */}
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                      <div className="flex items-center gap-2 text-sm text-blue-800">
                                        <Info className="h-4 w-4 flex-shrink-0" />
                                        <span>
                                          تم اختيار <strong>{selectedMeetingTeachers.length}</strong> معلم للاجتماع
                                        </span>
                                      </div>
                                    </div>

                                    {/* إشعار احترافي بجانب الأزرار */}
                                    {showSuccessNotification && (
                                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl flex items-center gap-3 shadow-lg animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                          <Info className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-blue-800 font-semibold">{notificationMessage}</p>
                                        </div>
                                        <button
                                          onClick={() => setShowSuccessNotification(false)}
                                          className="flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                          <X className="h-5 w-5" />
                                        </button>
                                      </div>
                                    )}

                                    {/* أزرار الحفظ والإلغاء */}
                                    <div className="flex gap-3 pt-4 border-t">
                                      <Button
                                        onClick={saveMeeting}
                                        className="flex-1 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#4f46e5] hover:to-[#6366f1] text-white"
                                      >
                                        <Save className="h-4 w-4 ml-2" />
                                        {editingMeetingId ? "تحديث" : "حفظ"} الاجتماع
                                      </Button>
                                      {editingMeetingId && (
                                        <Button
                                          onClick={resetMeetingForm}
                                          variant="outline"
                                          className="border-gray-300 text-gray-700"
                                        >
                                          إلغاء التعديل
                                        </Button>
                                      )}
                                    </div>

                                    {/* جدول الاجتماعات المحفوظة */}
                                    {departmentMeetings.length > 0 && (
                                      <div className="mt-6 pt-4 border-t">
                                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                          <CalendarDays className="h-5 w-5 text-[#4f46e5]" />
                                          الاجتماعات المحفوظة ({departmentMeetings.length})
                                        </h4>
                                        <div className="space-y-2">
                                          {departmentMeetings.map((meeting) => (
                                            <div 
                                              key={meeting.id}
                                              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#4f46e5] transition-colors"
                                            >
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-800">{meeting.name}</span>
                                                <div className="flex items-center gap-2">
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => editMeeting(meeting)}
                                                    className="h-7 px-2 text-blue-600 border-blue-300"
                                                  >
                                                    <Edit className="h-3 w-3" />
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                      setConfirmDialog({
                                                        open: true,
                                                        title: "تأكيد الحذف",
                                                        message: `هل أنت متأكد من حذف اجتماع "${meeting.name}"؟`,
                                                        onConfirm: () => {
                                                          deleteMeeting(meeting.id);
                                                          setConfirmDialog({ ...confirmDialog, open: false });
                                                        }
                                                      });
                                                    }}
                                                    className="h-7 px-2 text-red-600 border-red-300"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                                <span className="flex items-center gap-1">
                                                  <Calendar className="h-3 w-3" />
                                                  {WEEK_DAYS[meeting.day_index]}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                  <Clock className="h-3 w-3" />
                                                  الحصة {PERIODS[meeting.period_index]}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                  <Users className="h-3 w-3" />
                                                  {meeting.participants.length} معلم
                                                </span>
                                                {meeting.allow_global_clash && (
                                                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">
                                                    استثناء
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </ScrollArea>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      )}
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="subjects" className="space-y-6" dir="rtl">
              <div className="space-y-6">
                <Card className="border-2 border-[#6366f1] rounded-2xl shadow-lg bg-gradient-to-br from-white to-blue-50">
                  <CardHeader 
                    className="cursor-pointer hover:bg-blue-50 transition-all duration-200"
                    onClick={() => setIsSubjectConsecutiveOpen(!isSubjectConsecutiveOpen)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-[#4f46e5] font-bold flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-[#4f46e5] text-white rounded-full text-base font-bold">1</span>
                        تتابع حصص مادة
                      </CardTitle>
                      <ChevronDown 
                        className={`h-6 w-6 text-[#4f46e5] transition-transform duration-300 ${
                          isSubjectConsecutiveOpen ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>
                  {isSubjectConsecutiveOpen && (
                  <CardContent>
                    <div className="p-6">
                      {/* إشعار احترافي */}
                      {showSubjectsNotification && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl flex items-center gap-3 shadow-lg animate-in slide-in-from-top-2 duration-300">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <Info className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-blue-800 font-semibold">{subjectsNotificationMessage}</p>
                          </div>
                          <button
                            onClick={() => setShowSubjectsNotification(false)}
                            className="flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                      
                      {/* قسمين: يمنى للمواد ويسرى للشرح */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* القائمة اليمنى - اختيار المواد */}
                        <div className="p-6 bg-white rounded-2xl border-2 border-[#6366f1] shadow-md">
                          <div className="flex items-center mb-5">
                            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl ml-3">
                              <Book className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800 text-[18px]">المواد</h3>
                              <p className="text-sm text-gray-600">اختر المواد المطلوبة للتتابع</p>
                            </div>
                          </div>
                          
                          <ScrollArea className="h-[400px] pr-3">
                            <div className="space-y-3">
                              {SUBJECTS.map((subject) => {
                                const canBeConsecutive = subject.periodsPerWeek >= 2;
                                const isSelected = selectedConsecutiveSubjects.includes(subject.id);
                                const exceeds3Subjects = selectedConsecutiveSubjects.length >= 3 && !isSelected;
                                
                                return (
                                  <div
                                    key={subject.id}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                      !canBeConsecutive 
                                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                                        : exceeds3Subjects
                                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                                        : isSelected
                                        ? 'bg-gradient-to-r from-[#818cf8] to-[#6366f1] border-[#4f46e5] shadow-lg text-white cursor-pointer'
                                        : 'bg-gray-50 border-gray-200 hover:border-[#6366f1] hover:bg-blue-50 cursor-pointer'
                                    }`}
                                    onClick={() => {
                                      if (!canBeConsecutive) {
                                        setSubjectsNotificationMessage(`⚠️ مادة ${subject.name} نصابها الأسبوعي (${subject.periodsPerWeek}) حصة فقط. يشترط حصتين أو أكثر للتتابع.`);
                                        setShowSubjectsNotification(true);
                                        setTimeout(() => setShowSubjectsNotification(false), 4000);
                                        return;
                                      }
                                      
                                      if (exceeds3Subjects) {
                                        setSubjectsNotificationMessage('⚠️ لا يمكن اختيار أكثر من 3 مواد للتتابع');
                                        setShowSubjectsNotification(true);
                                        setTimeout(() => setShowSubjectsNotification(false), 3000);
                                        return;
                                      }
                                      
                                      setSelectedConsecutiveSubjects(prev => 
                                        prev.includes(subject.id)
                                          ? prev.filter(id => id !== subject.id)
                                          : [...prev, subject.id]
                                      );
                                      setHasUnsavedChanges(true);
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <span className={`text-[16px] font-semibold ${
                                          isSelected ? 'text-white' : 'text-gray-700'
                                        }`}>
                                          {subject.name}
                                        </span>
                                        <div className={`text-xs mt-1 ${
                                          isSelected ? 'text-indigo-100' : 'text-gray-500'
                                        }`}>
                                          النصاب: {subject.periodsPerWeek} حصص أسبوعياً
                                        </div>
                                      </div>
                                      {!canBeConsecutive && (
                                        <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
                                      )}
                                      {canBeConsecutive && isSelected && (
                                        <CheckCircle className="h-6 w-6 text-white" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>

                          {selectedConsecutiveSubjects.length > 0 && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-[#818cf8] to-[#6366f1] rounded-xl border-2 border-[#4f46e5] shadow-md">
                              <p className="text-sm font-bold text-white mb-2">
                                المواد المختارة ({selectedConsecutiveSubjects.length}/3):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {selectedConsecutiveSubjects.map(subjectId => {
                                  const subject = SUBJECTS.find(s => s.id === subjectId);
                                  return (
                                    <Badge
                                      key={subjectId}
                                      className="bg-white text-[#4f46e5] text-xs font-bold"
                                    >
                                      {subject?.name} ({subject?.periodsPerWeek} حصص)
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* القائمة اليسرى - الشرح التوضيحي والفصول */}
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-[#6366f1] shadow-md">
                          <div className="flex items-center mb-5">
                            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl ml-3">
                              <Info className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800 text-[18px]">الشرح التوضيحي</h3>
                              <p className="text-sm text-gray-600">كيفية استخدام التتابع</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="p-5 bg-white rounded-lg border-2 border-[#818cf8] shadow-sm">
                              <h4 className="font-bold text-[#4f46e5] text-base mb-3 flex items-center">
                                <CheckCircle className="h-5 w-5 ml-2" />
                                شروط التتابع:
                              </h4>
                              <ul className="space-y-2.5 text-sm text-gray-700 leading-relaxed">
                                <li className="flex items-start">
                                  <span className="text-[#6366f1] font-bold ml-2 text-lg">•</span>
                                  <span>الوضع التلقائي حصة منفردة وعند التفعيل: حصتان متتابعتان مرة واحدة.</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-[#6366f1] font-bold ml-2 text-lg">•</span>
                                  <span>يشترط نصاب المادة "حصتين وأكثر".</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-[#6366f1] font-bold ml-2 text-lg">•</span>
                                  <span>خصص الفصل المطلوب أو اختر كل الفصول.</span>
                                </li>
                              </ul>
                            </div>

                            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-300 shadow-sm">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <p className="text-xs text-amber-900 font-semibold">
                                  لا يمكن اختيار أكثر من 3 مواد متتابعة في الجدول.
                                </p>
                              </div>
                            </div>

                            {/* قائمة الفصول */}
                            <div className="p-4 bg-white rounded-lg border-2 border-[#818cf8] shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-[#4f46e5] text-base flex items-center">
                                  <Users className="h-5 w-5 ml-2" />
                                  اختيار الفصول
                                </h4>
                                <button
                                  onClick={() => {
                                    if (selectedConsecutiveClasses.length === MOCK_CLASSES.length) {
                                      setSelectedConsecutiveClasses([]);
                                    } else {
                                      setSelectedConsecutiveClasses(MOCK_CLASSES.map(c => c.id));
                                    }
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white px-2.5 py-1 rounded-md transition-colors font-medium"
                                >
                                  {selectedConsecutiveClasses.length === MOCK_CLASSES.length ? "إلغاء الكل" : "تحديد الكل"}
                                </button>
                              </div>
                              
                              <ScrollArea className="h-[140px]">
                                <div className="grid grid-cols-3 gap-1.5 pr-3">
                                  {MOCK_CLASSES.map((classroom) => (
                                    <div
                                      key={classroom.id}
                                      className={`p-1.5 rounded-md cursor-pointer transition-all duration-200 border ${
                                        selectedConsecutiveClasses.includes(classroom.id)
                                          ? "bg-[#6366f1] text-white border-[#6366f1]"
                                          : "bg-gray-50 border-gray-200 hover:border-[#6366f1] hover:bg-blue-50"
                                      }`}
                                      onClick={() => {
                                        setSelectedConsecutiveClasses(prev => 
                                          prev.includes(classroom.id)
                                            ? prev.filter(id => id !== classroom.id)
                                            : [...prev, classroom.id]
                                        );
                                        setHasUnsavedChanges(true);
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold">{classroom.shortName}</span>
                                        {selectedConsecutiveClasses.includes(classroom.id) && (
                                          <Check className="h-3 w-3" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                              
                              {selectedConsecutiveClasses.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs text-gray-600 font-medium">
                                    تم اختيار {selectedConsecutiveClasses.length} من {MOCK_CLASSES.length} فصل
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* أزرار التحكم */}
                      <div className="flex justify-start gap-3 mt-6 pt-5 border-t-2 border-gray-200">
                        <Button 
                          className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5 font-bold" 
                          onClick={saveChanges}
                        >
                          <Save className="h-5 w-5 ml-2" />
                          حفظ
                        </Button>
                        <Button 
                          variant="outline"
                          className="hover:bg-blue-50 border-[#6366f1] text-[#6366f1] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-all duration-200 px-6 py-2.5 font-bold rounded-xl"
                          onClick={handleEdit}
                        >
                          <Edit className="h-5 w-5 ml-2" />
                          تعديل
                        </Button>
                        <Button 
                          className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5 font-bold"
                          onClick={() => {
                            if (selectedConsecutiveSubjects.length > 0) {
                              setSelectedConsecutiveSubjects([]);
                              setHasUnsavedChanges(true);
                              setSubjectsNotificationMessage('✅ تم حذف جميع اختيارات التتابع بنجاح');
                              setShowSubjectsNotification(true);
                              setTimeout(() => setShowSubjectsNotification(false), 3000);
                            }
                          }}
                        >
                          <Trash2 className="h-5 w-5 ml-2" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  )}
                </Card>

                {/* بطاقة استثناء مواد من حصص معينة - التصميم الجديد */}
                <Card className="border-2 border-[#6366f1] rounded-2xl shadow-lg bg-gradient-to-br from-white to-blue-50">
                  <CardHeader 
                    className="cursor-pointer hover:bg-blue-50 transition-all duration-200"
                    onClick={() => setIsExceptionsOpen(!isExceptionsOpen)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-[#4f46e5] font-bold flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-[#4f46e5] text-white rounded-full text-base font-bold">2</span>
                        استثناء مادة من حصة
                      </CardTitle>
                      <ChevronDown 
                        className={`h-6 w-6 text-[#4f46e5] transition-transform duration-300 ${
                          isExceptionsOpen ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>
                  {isExceptionsOpen && (
                  <CardContent className="p-6">
                    {/* قسمين: يمنى للمواد ويسرى للحصص */}
                    <div className="grid grid-cols-12 gap-6">
                      {/* القائمة اليمنى - المواد */}
                      <div className="col-span-4">
                        <div className="bg-white border-2 border-[#6366f1] rounded-xl shadow-md overflow-hidden">
                          <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] p-4">
                            <h3 className="text-white font-bold text-base flex items-center">
                              <Book className="h-5 w-5 ml-2" />
                              المواد
                            </h3>
                            <p className="text-blue-100 text-sm mt-1">اختر مادة واحدة لتطبيق الاستثناء عليها</p>
                          </div>
                          
                          <ScrollArea className="h-[470px]">
                            <div className="p-2">
                              {SUBJECTS.map((subject) => {
                                const isSelected = selectedSubjects.includes(subject.id);
                                const hasOtherSelection = selectedSubjects.length > 0 && !isSelected;
                                
                                return (
                                  <div
                                    key={subject.id}
                                    className={`p-3 mb-2 rounded-lg transition-all duration-200 border ${
                                      hasOtherSelection
                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                                        : isSelected
                                        ? "bg-[#6366f1] text-white border-[#6366f1] shadow-md cursor-pointer"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-[#6366f1] hover:bg-indigo-50 cursor-pointer"
                                    }`}
                                    onClick={() => {
                                      if (!hasOtherSelection) {
                                        toggleSubject(subject.id);
                                        setHasUnsavedChanges(true);
                                      }
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                          isSelected ? "bg-white" : "bg-[#6366f1]"
                                        }`}></div>
                                        <span className="font-medium text-sm">{subject.name}</span>
                                      </div>
                                      {isSelected && <Check className="h-4 w-4" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>

                      {/* القائمة اليسرى - الحصص المستثناة */}
                      <div className="col-span-8">
                        <div className="rounded-xl overflow-hidden border-2 border-[#6366f1]">
                          <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] p-4">
                            <h3 className="text-white font-bold text-lg">الحصص المستثناة</h3>
                            <p className="text-blue-100 text-sm mt-1">حدد الحصص التي سيتم استثناؤها</p>
                          </div>
                          <div className="p-4 bg-white">
                            <ScrollArea className="h-[540px]">
                              <div className="space-y-5 pr-4">
                                {/* شرح توضيحي */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-[#818cf8] p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Info className="h-5 w-5 text-[#4f46e5]" />
                                    <h4 className="text-[#4f46e5] font-bold text-base">كيفية استخدام هذه الميزة</h4>
                                  </div>
                                  <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start">
                                      <span className="text-[#6366f1] font-bold ml-2">•</span>
                                      <span>اختر المادة التي تريد تطبيق الاستثناء عليها</span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="text-[#6366f1] font-bold ml-2">•</span>
                                      <span>حدد الحصص التي سيتم استثناؤها</span>
                                    </li>
                                  </ul>
                                  <div className="mt-3 p-3 bg-amber-50 border-2 border-amber-400 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-amber-800 font-semibold">كثرة الاشتراطات والاستثناءات قد تؤثر على عملية إنشاء الجدول</p>
                                    </div>
                                  </div>
                                </div>

                                {/* اختيار الحصص */}
                                <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4">
                                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                                    <Clock className="h-5 w-5 ml-2 text-[#6366f1]" />
                                    اختر الحصص المستثناة
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {PERIODS_NAMES.map((period, index) => (
                                      <div
                                        key={index}
                                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                                          excludedPeriods["selected"]?.includes(index)
                                            ? "bg-gradient-to-r from-[#818cf8] to-[#6366f1] border-[#4f46e5] text-white shadow-md"
                                            : "bg-white border-gray-200 hover:border-[#6366f1] hover:bg-blue-50"
                                        }`}
                                        onClick={() => {
                                          toggleExcludedPeriod("selected", index);
                                          setHasUnsavedChanges(true);
                                        }}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className={`text-sm font-semibold ${
                                            excludedPeriods["selected"]?.includes(index) ? "text-white" : "text-gray-700"
                                          }`}>
                                            الحصة {period}
                                          </span>
                                          {excludedPeriods["selected"]?.includes(index) && (
                                            <CheckCircle className="h-5 w-5 text-white" />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* إشعار احترافي فوق الأزرار */}
                                {showSubjectsNotification && (
                                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl flex items-center gap-3 shadow-lg animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                      <Info className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-blue-800 font-semibold">{subjectsNotificationMessage}</p>
                                    </div>
                                    <button
                                      onClick={() => setShowSubjectsNotification(false)}
                                      className="flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                      <X className="h-5 w-5" />
                                    </button>
                                  </div>
                                )}

                                {/* زر إضافة الاستثناء */}
                                {selectedSubjects.length === 1 && excludedPeriods["selected"]?.length > 0 && (
                                  <Button
                                    onClick={addException}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl py-3 font-bold shadow-lg"
                                  >
                                    <Plus className="h-5 w-5 ml-2" />
                                    إضافة الاستثناء ({excludedPeriods["selected"]?.length} حصة)
                                  </Button>
                                )}

                                {/* بطاقة الاستثناءات - جدول */}
                                <div className="bg-white rounded-xl border-2 border-[#6366f1] overflow-hidden">
                                  <div className="bg-gradient-to-r from-[#818cf8] to-[#6366f1] p-3">
                                    <h4 className="text-white font-bold flex items-center">
                                      <AlertCircle className="h-5 w-5 ml-2" />
                                      الاستثناءات ({savedExceptions.length})
                                    </h4>
                                  </div>
                                  
                                  {savedExceptions.length > 0 ? (
                                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                      <table className="w-full">
                                        <thead className="bg-indigo-50 sticky top-0">
                                          <tr>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-[#4f46e5]">المادة</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-[#4f46e5]">الحصص المستثناة</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-[#4f46e5]">الإجراءات</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {savedExceptions.map((exception) => (
                                            <tr key={exception.id} className="hover:bg-gray-50">
                                              <td className="px-4 py-3 text-sm text-gray-700 font-medium">{exception.subjectName}</td>
                                              <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                  {exception.periodNames.map((periodName, idx) => (
                                                    <Badge key={idx} className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                                                      الحصة {periodName}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </td>
                                              <td className="px-4 py-3 text-center">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => deleteException(exception.id)}
                                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="p-8 text-center text-gray-500">
                                      <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                      <p>لا توجد استثناءات مضافة بعد</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="flex justify-start gap-3 mt-6 pt-5 border-t-2 border-gray-200">
                      <Button 
                        className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5 font-bold" 
                        onClick={saveChanges}
                      >
                        <Save className="h-5 w-5 ml-2" />
                        حفظ
                      </Button>
                      <Button 
                        variant="outline"
                        className="hover:bg-blue-50 border-[#6366f1] text-[#6366f1] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-all duration-200 px-6 py-2.5 font-bold rounded-xl"
                        onClick={handleEdit}
                      >
                        <Edit className="h-5 w-5 ml-2" />
                        تعديل
                      </Button>
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5 font-bold"
                        onClick={() => {
                          if (savedExceptions.length > 0) {
                            deleteAllExceptions();
                            setSubjectsNotificationMessage('✅ تم حذف جميع الاستثناءات بنجاح');
                            setShowSubjectsNotification(true);
                            setTimeout(() => setShowSubjectsNotification(false), 3000);
                          }
                        }}
                      >
                        <Trash2 className="h-5 w-5 ml-2" />
                        حذف الاستثناءات
                      </Button>
                    </div>
                  </CardContent>
                  )}
                </Card>

                {/* بطاقة تحديد مواد في حصص معينة - جديدة */}
                <Card className="border-2 border-[#6366f1] rounded-2xl shadow-lg bg-gradient-to-br from-white to-blue-50 mt-6">
                  <CardHeader 
                    className="cursor-pointer hover:bg-blue-50 transition-all duration-200"
                    onClick={() => setIsAssignmentsOpen(!isAssignmentsOpen)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-[#4f46e5] font-bold flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-[#4f46e5] text-white rounded-full text-base font-bold">3</span>
                        تفضيل حصص لمادة
                      </CardTitle>
                      <ChevronDown 
                        className={`h-6 w-6 text-[#4f46e5] transition-transform duration-300 ${
                          isAssignmentsOpen ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>
                  {isAssignmentsOpen && (
                  <CardContent className="p-6">
                    {/* قسمين: يمنى للمواد ويسرى للحصص */}
                    <div className="grid grid-cols-12 gap-6">
                      {/* القائمة اليمنى - المواد */}
                      <div className="col-span-4">
                        <div className="bg-white border-2 border-[#6366f1] rounded-xl shadow-md overflow-hidden">
                          <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] p-4">
                            <h3 className="text-white font-bold text-base flex items-center">
                              <Book className="h-5 w-5 ml-2" />
                              المواد
                            </h3>
                            <p className="text-blue-100 text-sm mt-1">اختر مادة واحدة لتحديد حصص مفضلة لها</p>
                          </div>
                          
                          <ScrollArea className="h-[470px]">
                            <div className="p-2">
                              {SUBJECTS.map((subject) => {
                                const isSelected = selectedSubjectsForPeriods === subject.id;
                                const hasOtherSelection = selectedSubjectsForPeriods !== null && !isSelected;
                                
                                return (
                                  <div
                                    key={subject.id}
                                    className={`p-3 mb-2 rounded-lg transition-all duration-200 border ${
                                      hasOtherSelection
                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                                        : isSelected
                                        ? "bg-[#6366f1] text-white border-[#6366f1] shadow-md cursor-pointer"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-[#6366f1] hover:bg-indigo-50 cursor-pointer"
                                    }`}
                                    onClick={() => {
                                      if (!hasOtherSelection) {
                                        setSelectedSubjectsForPeriods(isSelected ? null : subject.id);
                                        setHasUnsavedChanges(true);
                                      }
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                          isSelected ? "bg-white" : "bg-[#6366f1]"
                                        }`}></div>
                                        <span className="font-medium text-sm">{subject.name}</span>
                                      </div>
                                      {isSelected && <Check className="h-4 w-4" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>

                      {/* القائمة اليسرى - الحصص المحددة */}
                      <div className="col-span-8">
                        <div className="rounded-xl overflow-hidden border-2 border-[#6366f1]">
                          <div className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] p-4">
                            <h3 className="text-white font-bold text-lg">الحصص المفضلة</h3>
                            <p className="text-blue-100 text-sm mt-1">حدد الحصص المفضلة للمادة المختارة</p>
                          </div>
                          <div className="p-4 bg-white">
                            <ScrollArea className="h-[540px]">
                              <div className="space-y-5 pr-4">
                                {/* شرح توضيحي */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-[#818cf8] p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Info className="h-5 w-5 text-[#4f46e5]" />
                                    <h4 className="text-[#4f46e5] font-bold text-base">كيفية استخدام هذه الميزة</h4>
                                  </div>
                                  <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start">
                                      <span className="text-[#6366f1] font-bold ml-2">•</span>
                                      <span>اختر المادة التي تريد تحديد حصص معينة لها</span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="text-[#6366f1] font-bold ml-2">•</span>
                                      <span>حدد الحصص المفضلة</span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="text-[#6366f1] font-bold ml-2">•</span>
                                      <span>مثال: مادة الرياضيات في الحصص الأولى والثانية</span>
                                    </li>
                                  </ul>
                                </div>

                                {/* اختيار الحصص */}
                                <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4">
                                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                                    <Clock className="h-5 w-5 ml-2 text-[#6366f1]" />
                                    اختر الحصص المطلوبة
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {PERIODS_NAMES.map((period, index) => (
                                      <div
                                        key={index}
                                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                                          selectedPeriodsForSubjects.includes(index)
                                            ? "bg-gradient-to-r from-[#818cf8] to-[#6366f1] border-[#4f46e5] text-white shadow-md"
                                            : "bg-white border-gray-200 hover:border-[#6366f1] hover:bg-blue-50"
                                        }`}
                                        onClick={() => {
                                          setSelectedPeriodsForSubjects(prev =>
                                            prev.includes(index)
                                              ? prev.filter(i => i !== index)
                                              : [...prev, index]
                                          );
                                          setHasUnsavedChanges(true);
                                        }}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className={`text-sm font-semibold ${
                                            selectedPeriodsForSubjects.includes(index) ? "text-white" : "text-gray-700"
                                          }`}>
                                            الحصة {period}
                                          </span>
                                          {selectedPeriodsForSubjects.includes(index) && (
                                            <CheckCircle className="h-5 w-5 text-white" />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* إشعار احترافي فوق الأزرار */}
                                {showSubjectsNotification && (
                                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl flex items-center gap-3 shadow-lg animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                      <Info className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-blue-800 font-semibold">{subjectsNotificationMessage}</p>
                                    </div>
                                    <button
                                      onClick={() => setShowSubjectsNotification(false)}
                                      className="flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                      <X className="h-5 w-5" />
                                    </button>
                                  </div>
                                )}

                                {/* زر إضافة التفضيل */}
                                {selectedSubjectsForPeriods !== null && selectedPeriodsForSubjects.length > 0 && (
                                  <Button
                                    onClick={addSubjectPeriodAssignment}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl py-3 font-bold shadow-lg"
                                  >
                                    <Plus className="h-5 w-5 ml-2" />
                                    إضافة التفضيل ({selectedPeriodsForSubjects.length} حصة)
                                  </Button>
                                )}

                                {/* بطاقة التفضيلات - جدول */}
                                <div className="bg-white rounded-xl border-2 border-[#6366f1] overflow-hidden">
                                  <div className="bg-gradient-to-r from-[#818cf8] to-[#6366f1] p-3">
                                    <h4 className="text-white font-bold flex items-center">
                                      <CheckCircle className="h-5 w-5 ml-2" />
                                      التفضيلات ({savedSubjectPeriodAssignments.length})
                                    </h4>
                                  </div>
                                  
                                  {savedSubjectPeriodAssignments.length > 0 ? (
                                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                      <table className="w-full">
                                        <thead className="bg-indigo-50 sticky top-0">
                                          <tr>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-[#4f46e5]">المادة</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-[#4f46e5]">الحصص المفضلة</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-[#4f46e5]">الإجراءات</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {savedSubjectPeriodAssignments.map((assignment) => (
                                            <tr key={assignment.id} className="hover:bg-gray-50">
                                              <td className="px-4 py-3 text-sm text-gray-700 font-medium">{assignment.subjectName}</td>
                                              <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                  {assignment.periodNames.map((periodName, idx) => (
                                                    <Badge key={idx} className="bg-green-100 text-green-700 border-green-300 text-xs">
                                                      الحصة {periodName}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </td>
                                              <td className="px-4 py-3 text-center">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => deleteAssignment(assignment.id)}
                                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="p-8 text-center text-gray-500">
                                      <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                      <p>لا توجد تفضيلات مضافة بعد</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="flex justify-start gap-3 mt-6 pt-5 border-t-2 border-gray-200">
                      <Button 
                        className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5 font-bold" 
                        onClick={saveChanges}
                      >
                        <Save className="h-5 w-5 ml-2" />
                        حفظ
                      </Button>
                      <Button 
                        variant="outline"
                        className="hover:bg-blue-50 border-[#6366f1] text-[#6366f1] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-all duration-200 px-6 py-2.5 font-bold rounded-xl"
                        onClick={handleEdit}
                      >
                        <Edit className="h-5 w-5 ml-2" />
                        تعديل
                      </Button>
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5 font-bold"
                        onClick={() => {
                          if (savedSubjectPeriodAssignments.length > 0) {
                            deleteAllAssignments();
                            setSubjectsNotificationMessage('✅ تم حذف جميع التفضيلات بنجاح');
                            setShowSubjectsNotification(true);
                            setTimeout(() => setShowSubjectsNotification(false), 3000);
                          }
                        }}
                      >
                        <Trash2 className="h-5 w-5 ml-2" />
                        حذف التفضيلات
                      </Button>
                    </div>
                  </CardContent>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* ===================== تبويب حصص الانتظار ===================== */}
            <TabsContent value="waiting" className="space-y-6" dir="rtl">
              {/* البطاقة الأولى: عدد الحصص الأسبوعية */}
              <Card className="border rounded-xl shadow-sm">
                      <CardHeader 
                        className="pb-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition-all duration-200"
                        onClick={() => setIsDemandMatrixOpen(!isDemandMatrixOpen)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-[#4f46e5] font-bold flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-[#4f46e5] text-white rounded-full text-base font-bold">1</span>
                            عدد الحصص الأسبوعية
                          </CardTitle>
                          <ChevronDown 
                            className={`h-6 w-6 text-[#4f46e5] transition-transform duration-300 ${
                              isDemandMatrixOpen ? 'transform rotate-180' : ''
                            }`}
                          />
                        </div>
                      </CardHeader>
                      {isDemandMatrixOpen && (
                        <CardContent className="p-6 space-y-6"
                          style={{
                            animation: isDemandMatrixOpen ? 'slideDown 0.3s ease-out' : 'slideUp 0.3s ease-out'
                          }}
                        >
                  {/* فاصل بصري شفاف */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>
                  
                  {/* عدد الحصص اليومية - تصميم جديد بقائمتين */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* القائمة اليمنى: جدول الأيام وعدد الحصص */}
                    <div className="lg:col-span-3">
                      <div className="bg-white border-2 border-[#6366f1] rounded-2xl overflow-hidden shadow-lg">
                        <div className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] px-6 py-4">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <CalendarDays className="h-5 w-5" />
                            توزيع الحصص على الأيام
                          </h3>
                        </div>
                        <div className="p-6">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-[#6366f1]">
                                <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">اليوم</th>
                                <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">عدد الحصص</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {[
                                { key: 'sundaySlots', label: 'الأحد', color: 'from-blue-500 to-blue-600' },
                                { key: 'mondaySlots', label: 'الاثنين', color: 'from-indigo-500 to-indigo-600' },
                                { key: 'tuesdaySlots', label: 'الثلاثاء', color: 'from-purple-500 to-purple-600' },
                                { key: 'wednesdaySlots', label: 'الأربعاء', color: 'from-violet-500 to-violet-600' },
                                { key: 'thursdaySlots', label: 'الخميس', color: 'from-fuchsia-500 to-fuchsia-600' }
                              ].map((day) => (
                                <tr key={day.key} className="hover:bg-blue-50 transition-colors">
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${day.color}`}></div>
                                      <span className="text-sm font-bold text-gray-800">{day.label}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={waitingSettings[day.key as keyof typeof waitingSettings] as number}
                                      onChange={(e) => setWaitingSettings({
                                        ...waitingSettings,
                                        [day.key]: parseInt(e.target.value) || 1
                                      })}
                                      className="w-24 text-center text-xl font-bold h-12 text-[#4f46e5] border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all mx-auto"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* القائمة اليسرى: إجمالي الحصص */}
                    <div className="lg:col-span-1">
                      <div className="relative overflow-hidden bg-gradient-to-br from-[#6366f1] via-[#7c7ff5] to-[#9ca3f9] text-white rounded-2xl shadow-xl h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
                        
                        <div className="relative z-10 p-6 pt-8 flex flex-col justify-center h-full">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                              <CalendarDays className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold opacity-95">إجمالي الحصص</h3>
                          </div>
                          
                          <div className="text-center my-8">
                            <div className="flex items-baseline justify-center gap-2">
                              <span className="text-6xl font-black tracking-tight">
                                {(waitingSettings.sundaySlots || 0) + 
                                 (waitingSettings.mondaySlots || 0) + 
                                 (waitingSettings.tuesdaySlots || 0) + 
                                 (waitingSettings.wednesdaySlots || 0) + 
                                 (waitingSettings.thursdaySlots || 0)}
                              </span>
                              <span className="text-xl font-semibold opacity-90">حصة</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                              <div className="flex items-center justify-between text-sm">
                                <span className="opacity-90">عدد الأيام</span>
                                <span className="font-bold">5 أيام</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                        </CardContent>
                      )}
                    </Card>
              
              {/* البطاقة الثانية: إعداد المنتظرين */}
              <Card className="border rounded-xl shadow-sm mb-6">
                <CardHeader 
                  className="pb-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition-all duration-200"
                  onClick={() => setIsTeachersSetupOpen(!isTeachersSetupOpen)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-[#4f46e5] font-bold flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-[#4f46e5] text-white rounded-full text-base font-bold">2</span>
                      إعداد المنتظرين
                    </CardTitle>
                    <ChevronDown 
                      className={`h-6 w-6 text-[#4f46e5] transition-transform duration-300 ${
                        isTeachersSetupOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                </CardHeader>
                {isTeachersSetupOpen && (
                  <CardContent className="p-6"
                    style={{
                      animation: isTeachersSetupOpen ? 'slideDown 0.3s ease-out' : 'slideUp 0.3s ease-out'
                    }}
                  >
                    {/* فاصل بصري شفاف */}
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>
                    
                    {/* زر إضافة منتظر */}
                    <div className="mb-6 flex items-center justify-start gap-4">
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => setShowAddWaiterDialog(true)}
                          className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white hover:from-[#4338ca] hover:to-[#4f46e5] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          size="default"
                        >
                          <Plus className="h-4 w-4" />
                          إضافة منتظر
                        </Button>
                      </div>
                    </div>
                  <div className="border-2 border-[#6366f1] rounded-xl overflow-hidden shadow-md">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white sticky top-0">
                          <tr>
                            <th className="px-4 py-4 text-right text-sm font-bold border-b-2 border-[#4f46e5]">م</th>
                            <th className="px-4 py-4 text-right text-sm font-bold border-b-2 border-[#4f46e5]">المعلم</th>
                            <th className="px-4 py-4 text-center text-sm font-bold border-b-2 border-[#4f46e5]">المؤشر</th>
                            <th className="px-4 py-4 text-center text-sm font-bold border-b-2 border-[#4f46e5]">نصاب الحصص</th>
                            <th className="px-4 py-4 text-center text-sm font-bold border-b-2 border-[#4f46e5]">نصاب الانتظار</th>
                            <th className="px-4 py-4 text-center text-sm font-bold border-b-2 border-[#4f46e5]">المتبقي من الانتظار</th>
                            <th className="px-4 py-4 text-center text-sm font-bold border-b-2 border-[#4f46e5]">القيود</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {[...MOCK_TEACHERS, ...customWaiters].sort((a, b) => a.name.localeCompare(b.name, 'ar')).map((teacher, index) => {
                            // البيانات الافتراضية (يجب جلبها من صفحة إدارة المعلمين)
                            const basicLoad = 18; // نصاب الحصص الأساسي
                            const waitingQuota = teachersWaitingQuota[teacher.id] ?? 0; // نصاب الانتظار
                            const totalLoad = basicLoad + waitingQuota; // الحمل الكلي
                            const maxAllowed = 24; // الحد الأقصى المسموح
                            const remainingWaiting = Math.max(0, maxAllowed - totalLoad); // المتبقي من الانتظار
                            
                            // التحقق من تجاوز 24 حصة
                            const isExceeded = totalLoad > maxAllowed;
                            const isAtLimit = totalLoad === maxAllowed;
                            const isFullCapacity = basicLoad >= maxAllowed;
                            
                            return (
                              <tr 
                                key={teacher.id} 
                                className={`hover:bg-blue-50 transition-colors ${
                                  isFullCapacity ? 'bg-gray-50 opacity-60' : ''
                                } ${isExceeded ? 'bg-red-50' : ''}`}
                              >
                                <td className="px-4 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <div className="text-sm font-bold text-gray-900">{teacher.name}</div>
                                      {/* @ts-ignore */}
                                      <div className="text-xs text-gray-500">{teacher.subject}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="w-full space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-600 font-medium">
                                        {totalLoad} / {maxAllowed}
                                      </span>
                                      {isExceeded && (
                                        <span className="text-red-600 font-bold flex items-center gap-1 bg-red-100 px-2 py-0.5 rounded-full">
                                          <AlertTriangle className="h-3 w-3" />
                                          تجاوز
                                        </span>
                                      )}
                                      {isAtLimit && !isExceeded && (
                                        <span className="text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">
                                          مكتمل
                                        </span>
                                      )}
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-7 overflow-hidden shadow-inner">
                                      <div className="h-full flex">
                                        {/* الحصص الأساسية - أزرق */}
                                        <div 
                                          className="bg-gradient-to-r from-[#6b9ff9] to-[#8bb4fc] h-full transition-all duration-500 flex items-center justify-center"
                                          style={{ width: `${(basicLoad / maxAllowed) * 100}%` }}
                                          title={`حصص أساسية: ${basicLoad}`}
                                        >
                                          {basicLoad > 0 && (
                                            <span className="text-[10px] font-bold text-white">{basicLoad}</span>
                                          )}
                                        </div>
                                        {/* حصص الانتظار - برتقالي أو أحمر */}
                                        {waitingQuota > 0 && (
                                          <div 
                                            className={`${
                                              isExceeded 
                                                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                                : 'bg-gradient-to-r from-orange-400 to-orange-500'
                                            } h-full transition-all duration-500 flex items-center justify-center`}
                                            style={{ width: `${(waitingQuota / maxAllowed) * 100}%` }}
                                            title={`حصص انتظار: ${waitingQuota}`}
                                          >
                                            <span className="text-[10px] font-bold text-white">{waitingQuota}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px]">
                                      <div className="flex items-center gap-1">
                                        <div className="w-2.5 h-2.5 bg-[#6b9ff9] rounded-full"></div>
                                        <span className="text-gray-600">أساسي</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className={`w-2.5 h-2.5 ${isExceeded ? 'bg-red-500' : 'bg-orange-500'} rounded-full`}></div>
                                        <span className="text-gray-600">انتظار</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="px-4 py-2 bg-blue-100 text-[#4f46e5] rounded-lg text-base font-bold shadow-sm">
                                      {basicLoad}
                                    </span>
                                    <span className="text-xs text-gray-500">حصة</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  {isFullCapacity ? (
                                    <div className="flex flex-col items-center">
                                      <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-base font-bold">
                                        0
                                      </span>
                                      <span className="text-xs text-gray-500 mt-1">مكتمل النصاب</span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <Input
                                        type="number"
                                        min="0"
                                        max={maxAllowed - basicLoad}
                                        value={waitingQuota}
                                        onChange={(e) => {
                                          const newValue = Math.min(parseInt(e.target.value) || 0, maxAllowed - basicLoad);
                                          updateTeacherQuota(teacher.id, newValue);
                                        }}
                                        className={`w-24 text-center font-bold text-base border-2 rounded-lg ${
                                          isExceeded 
                                            ? 'border-red-500 text-red-600 bg-red-50' 
                                            : 'border-[#6366f1] text-[#4f46e5] bg-white'
                                        }`}
                                        disabled={isFullCapacity}
                                      />
                                      <span className="text-xs text-gray-500 mt-1">
                                        الحد الأقصى: {maxAllowed - basicLoad}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className={`px-4 py-2 rounded-lg text-base font-bold shadow-sm ${
                                      remainingWaiting > 3 
                                        ? 'bg-green-100 text-green-700' 
                                        : remainingWaiting > 0 
                                        ? 'bg-yellow-100 text-yellow-700' 
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                      {remainingWaiting}
                                    </span>
                                    <span className="text-xs text-gray-500">حصة</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-[#4f46e5] hover:bg-indigo-50 border-[#6366f1] font-medium"
                                      disabled={isFullCapacity}
                                      onClick={() => {
                                        // التوجيه لصفحة إدارة القيود
                                        // @ts-ignore
                                        navigate(`/dashboard/schedule/teacher-constraints?teacherId=${teacher.id}&teacherName=${encodeURIComponent(teacher.name)}&teacherSubject=${encodeURIComponent(teacher.subject)}&waitingQuota=${teachersWaitingQuota[teacher.id] || 0}`);
                                      }}
                                      title="إدارة القيود (الحد الأقصى اليومي واستثناء الحصص)"
                                    >
                                      <Settings className="h-4 w-4 ml-1" />
                                      إدارة القيود
                                      {blockedPeriods[teacher.id] && blockedPeriods[teacher.id].length > 0 && (
                                        <span className="mr-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                          {blockedPeriods[teacher.id].length}
                                        </span>
                                      )}
                                    </Button>
                                    {teacher.id >= 1000 && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteCustomWaiter(teacher.id)}
                                        className="text-red-600 hover:bg-red-50 border-red-300"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-[#6366f1]">
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-sm font-bold text-gray-900">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-[#4f46e5]" />
                                إجمالي نصاب الانتظار
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="px-4 py-2 bg-[#4f46e5] text-white rounded-lg text-base font-bold shadow-md">
                                {[...MOCK_TEACHERS, ...customWaiters].reduce((sum, teacher) => {
                                  const quota = teachersWaitingQuota[teacher.id] ?? 0;
                                  return sum + quota;
                                }, 0)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-sm text-gray-600 font-medium">
                                حصة
                              </span>
                            </td>
                            <td className="px-4 py-4"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* تحذير في حالة وجود تجاوز */}
                  {[...MOCK_TEACHERS, ...customWaiters].some(teacher => {
                    const basicLoad = 18;
                    const waitingQuota = teachersWaitingQuota[teacher.id] ?? 0;
                    return (basicLoad + waitingQuota) > 24;
                  }) && (
                    <div className="mt-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl animate-pulse">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-red-800 font-bold">
                            ⚠️ تحذير: يوجد تجاوز لقاعدة الـ 24 حصة!
                          </p>
                          <p className="text-sm text-red-700 mt-1">
                            يرجى تعديل نصاب الانتظار للمعلمين المظللين باللون الأحمر
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                        </CardContent>
                      )}
                    </Card>
              
              {/* البطاقة الثالثة: طريقة توزيع الانتظار */}
              <Card className="border rounded-xl shadow-sm mb-6">
                <CardHeader 
                  className="pb-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition-all duration-200"
                  onClick={() => setIsDistributionStrategyOpen(!isDistributionStrategyOpen)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-[#4f46e5] font-bold flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-[#4f46e5] text-white rounded-full text-base font-bold">3</span>
                      طريقة توزيع الانتظار
                    </CardTitle>
                    <ChevronDown 
                      className={`h-6 w-6 text-[#4f46e5] transition-transform duration-300 ${
                        isDistributionStrategyOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                </CardHeader>
                {isDistributionStrategyOpen && (
                  <CardContent className="p-6 pt-8 space-y-6"
                    style={{
                      animation: isDistributionStrategyOpen ? 'slideDown 0.3s ease-out' : 'slideUp 0.3s ease-out'
                    }}
                  >
                  {/* البطاقات الإحصائية في الأعلى - الترتيب الجديد */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    {/* البطاقة الأولى: إجمالي الحصص */}
                    <div className="bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs opacity-90 mb-1.5 font-medium">إجمالي الحصص</p>
                          <p className="text-2xl font-black">
                            {(waitingSettings.sundaySlots || 0) + 
                             (waitingSettings.mondaySlots || 0) + 
                             (waitingSettings.tuesdaySlots || 0) + 
                             (waitingSettings.wednesdaySlots || 0) + 
                             (waitingSettings.thursdaySlots || 0)}
                          </p>
                          <p className="text-[10px] opacity-75 mt-1">حصة أسبوعية</p>
                        </div>
                        <CalendarDays className="h-8 w-8 opacity-70" />
                      </div>
                    </div>
                    
                    {/* البطاقة الثانية: عدد المنتظرين */}
                    <div className="bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs opacity-90 mb-1.5 font-medium">عدد المنتظرين</p>
                          <p className="text-2xl font-black">
                            {[...MOCK_TEACHERS, ...customWaiters].reduce((sum, teacher) => {
                              const quota = teachersWaitingQuota[teacher.id] ?? 0;
                              return sum + quota;
                            }, 0)}
                          </p>
                          <p className="text-[10px] opacity-75 mt-1">إجمالي نصاب الانتظار</p>
                        </div>
                        <Users className="h-8 w-8 opacity-70" />
                      </div>
                    </div>

                    {/* البطاقة الثالثة: حصص الانتظار المطلوبة */}
                    <div className="bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs opacity-90 mb-1.5 font-medium">حصص الانتظار المطلوبة</p>
                          <p className="text-2xl font-black">
                            {waitingSettings.distributionMode === 'balanced' 
                              ? ((waitingSettings.sundaySlots || 0) + 
                                 (waitingSettings.mondaySlots || 0) + 
                                 (waitingSettings.tuesdaySlots || 0) + 
                                 (waitingSettings.wednesdaySlots || 0) + 
                                 (waitingSettings.thursdaySlots || 0))
                              : ((waitingSettings.sundaySlots || 0) + 
                                 (waitingSettings.mondaySlots || 0) + 
                                 (waitingSettings.tuesdaySlots || 0) + 
                                 (waitingSettings.wednesdaySlots || 0) + 
                                 (waitingSettings.thursdaySlots || 0)) * waitingSettings.coverageTargetPerSlot
                            }
                          </p>
                          <p className="text-[10px] opacity-75 mt-1">
                            {waitingSettings.distributionMode === 'balanced' 
                              ? 'توزيع تلقائي' 
                              : `${waitingSettings.coverageTargetPerSlot} منتظرين × الحصص`
                            }
                          </p>
                        </div>
                        <Clock className="h-8 w-8 opacity-70" />
                      </div>
                    </div>
                  </div>

                  {/* اختيار وضع التوزيع */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* التوزيع التلقائي */}
                    <div
                      onClick={() => setWaitingSettings({ ...waitingSettings, distributionMode: 'balanced' })}
                      className={`group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                        waitingSettings.distributionMode === 'balanced'
                          ? 'border-[#4f46e5] bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-[#6366f1]'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg flex-shrink-0 transition-all duration-300 ${
                            waitingSettings.distributionMode === 'balanced'
                              ? 'bg-[#4f46e5] text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 group-hover:bg-[#818cf8] group-hover:text-white'
                          }`}>
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">توزيع تلقائي</h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-2">
                              النظام يملأ جداول المعلمين بحصص انتظار حتى يصلوا للحد الأقصى المسجل في نصاب الانتظار لكل معلم لضمان أكبر تغطية ممكنة من المنتظرين.
                            </p>
                            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>مناسب للاستفادة القصوى من عدد حصص الانتظار المسندة للمنتظرين</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {waitingSettings.distributionMode === 'balanced' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] opacity-5 pointer-events-none"></div>
                      )}
                    </div>

                    {/* التوزيع المحدد */}
                    <div
                      onClick={() => setWaitingSettings({ ...waitingSettings, distributionMode: 'coverage_target' })}
                      className={`group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                        waitingSettings.distributionMode === 'coverage_target'
                          ? 'border-[#4f46e5] bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-[#6366f1]'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg flex-shrink-0 transition-all duration-300 ${
                            waitingSettings.distributionMode === 'coverage_target'
                              ? 'bg-[#4f46e5] text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 group-hover:bg-[#818cf8] group-hover:text-white'
                          }`}>
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">توزيع محدد</h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-2">
                              حدد عدد منتظرين لكل حصة و النظام سيلتزم بالعدد المحدد قدر الإمكان (مثلاً 5 معلمين للحصة الواحدة) ويختار الأنسب لهم.
                            </p>
                            
                            {/* العدد المستهدف للمنتظرين - داخل البطاقة */}
                            {waitingSettings.distributionMode === 'coverage_target' && (
                              <div className="mt-3 bg-white p-3 rounded-lg border-2 border-[#6366f1]">
                                <Label className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-2">
                                  <Users className="h-4 w-4 text-[#4f46e5]" />
                                  العدد المستهدف للمنتظرين
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    max="15"
                                    value={waitingSettings.coverageTargetPerSlot}
                                    onChange={(e) => setWaitingSettings({
                                      ...waitingSettings,
                                      coverageTargetPerSlot: parseInt(e.target.value) || 1
                                    })}
                                    className="text-center text-base font-bold h-9 text-[#4f46e5] border-2 border-[#6366f1] rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] max-w-[70px]"
                                  />
                                  <span className="text-gray-600 font-medium text-xs">معلم لكل حصة</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg mt-2">
                              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>مناسب للتحكم الدقيق في عدد المنتظرين لكل حصة</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {waitingSettings.distributionMode === 'coverage_target' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] opacity-5 pointer-events-none"></div>
                      )}
                    </div>
                  </div>

                  {/* مؤشر التوازن - مخصص للتوزيع المحدد فقط */}
                  {waitingSettings.distributionMode === 'coverage_target' && (() => {
                    const totalWeeklySlots = (waitingSettings.sundaySlots || 0) + 
                                            (waitingSettings.mondaySlots || 0) + 
                                            (waitingSettings.tuesdaySlots || 0) + 
                                            (waitingSettings.wednesdaySlots || 0) + 
                                            (waitingSettings.thursdaySlots || 0);
                    
                    const totalWaitingQuota = [...MOCK_TEACHERS, ...customWaiters].reduce((sum, teacher) => {
                      const quota = teachersWaitingQuota[teacher.id] ?? 0;
                      return sum + quota;
                    }, 0);
                    
                    const requiredSlots = totalWeeklySlots * waitingSettings.coverageTargetPerSlot;
                    const averagePerSlot = totalWeeklySlots > 0 ? totalWaitingQuota / totalWeeklySlots : 0;
                    const canCover = totalWaitingQuota >= requiredSlots;
                    const suggestedTarget = totalWeeklySlots > 0 ? Math.floor(totalWaitingQuota / totalWeeklySlots) : 0;
                    const deficit = Math.max(0, requiredSlots - totalWaitingQuota);
                    const neededQuota = requiredSlots;
                    
                    return (
                      <div className={`border-2 rounded-xl p-5 ${
                        canCover 
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                          : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${
                              canCover ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              {canCover ? (
                                <CheckCircle className="h-6 w-6 text-white" />
                              ) : (
                                <AlertTriangle className="h-6 w-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">مؤشر التوازن</h3>
                              <p className="text-xs text-gray-600">التوزيع المحدد فقط</p>
                            </div>
                          </div>
                          <span className={`text-sm font-bold px-4 py-2 rounded-full ${
                            canCover 
                              ? 'bg-green-500 text-white shadow-md' 
                              : 'bg-red-500 text-white shadow-md'
                          }`}>
                            {canCover ? '✓ يمكن التغطية' : '✗ يوجد عجز'}
                          </span>
                        </div>
                        
                        {/* شريط التقدم */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                            <span className="font-medium">إجمالي نصاب الانتظار: {totalWaitingQuota}</span>
                            <span className="font-medium">المطلوب: {requiredSlots}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                            <div 
                              className={`h-full transition-all duration-500 flex items-center justify-center ${
                                canCover
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                  : 'bg-gradient-to-r from-red-500 to-orange-500'
                              }`}
                              style={{ width: `${Math.min(100, (totalWaitingQuota / requiredSlots) * 100)}%` }}
                            >
                              <span className="text-white text-xs font-bold">
                                {Math.round((totalWaitingQuota / requiredSlots) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* الرسالة التوضيحية */}
                        <div className={`p-4 rounded-lg border-2 ${
                          canCover 
                            ? 'bg-white border-green-200' 
                            : 'bg-white border-red-200'
                        }`}>
                          {canCover ? (
                            <div className="space-y-2">
                              <p className="text-sm text-green-800 font-bold flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                يمكن تغطية جميع الحصص الأسبوعية
                              </p>
                              <p className="text-xs text-gray-700">
                                إجمالي نصاب الانتظار ({totalWaitingQuota}) ÷ عدد الحصص ({totalWeeklySlots}) = {averagePerSlot.toFixed(2)} منتظر/حصة
                              </p>
                              <p className="text-xs text-gray-700">
                                النظام قادر على توزيع {waitingSettings.coverageTargetPerSlot} منتظرين لكل حصة بشكل متوازن.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-sm text-red-800 font-bold flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                لا يمكن تغطية الانتظار - يوجد عجز
                              </p>
                              <p className="text-xs text-gray-700">
                                إجمالي نصاب الانتظار ({totalWaitingQuota}) ÷ عدد الحصص ({totalWeeklySlots}) = {averagePerSlot.toFixed(2)} منتظر/حصة
                              </p>
                              <p className="text-xs text-gray-700 font-medium">
                                العدد المطلوب: {waitingSettings.coverageTargetPerSlot} منتظرين، لكن المتوفر: {averagePerSlot.toFixed(2)} فقط
                              </p>
                              
                              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 mt-3">
                                <p className="text-sm font-bold text-amber-900 mb-2">💡 الحلول المقترحة:</p>
                                <div className="space-y-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full justify-between text-xs border-amber-400 hover:bg-amber-100"
                                    onClick={() => {
                                      if (suggestedTarget > 0) {
                                        setWaitingSettings({
                                          ...waitingSettings,
                                          coverageTargetPerSlot: suggestedTarget
                                        });
                                        toast({
                                          title: "✓ تم التعديل",
                                          description: `تم تعديل العدد المستهدف إلى ${suggestedTarget} منتظرين لكل حصة`,
                                        });
                                      }
                                    }}
                                  >
                                    <span>اعتماد {suggestedTarget} منتظرين لكل حصة</span>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <p className="text-xs text-gray-600 px-2">
                                    أو قم بزيادة نصاب الانتظار إلى {neededQuota} حصة على الأقل
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                        </CardContent>
                      )}
                    </Card>

              {/* بطاقة الملاحظات */}
              <Card className="border-2 border-amber-200 rounded-xl shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Info className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="font-bold">ملاحظات</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-amber-100">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 leading-relaxed">المعلمون الذين أكملوا نصابهم من الحصص الأساسية (24 حصة) لا تُسند لهم حصص انتظار تلقائياً.</p>
                    </div>
                    <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-amber-100">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 leading-relaxed">الاستثناءات والقيود المخصصة قد تؤثر على التوزيع التلقائي للنظام.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* زر الحفظ */}
              <div className="flex justify-end gap-4">
                  <Button
                    onClick={async () => {
                      setLoadingWaitingData(true);
                      try {
                        // التحقق من عدم وجود تجاوز
                        const hasExceeded = [...MOCK_TEACHERS, ...customWaiters].some(teacher => {
                          const basicLoad = 18;
                          const waitingQuota = teachersWaitingQuota[teacher.id] ?? 0;
                          return (basicLoad + waitingQuota) > 24;
                        });
                        
                        if (hasExceeded) {
                          toast({
                            title: "تحذير",
                            description: "يوجد تجاوز للحد الأقصى المسموح! يرجى تعديل نصاب الانتظار",
                            variant: "destructive"
                          });
                          setLoadingWaitingData(false);
                          return;
                        }
                        
                        // TODO: استدعاء API لحفظ الإعدادات
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        toast({
                          title: "✓ تم الحفظ",
                          description: "تم حفظ إعدادات حصص الانتظار بنجاح",
                        });
                        setHasUnsavedChanges(false);
                      } catch (error) {
                        toast({
                          title: "خطأ",
                          description: "فشل حفظ الإعدادات",
                          variant: "destructive"
                        });
                      } finally {
                        setLoadingWaitingData(false);
                      }
                    }}
                    className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white"
                    disabled={loadingWaitingData}
                  >
                    <Save className="h-4 w-4 ml-2" />
                    {loadingWaitingData ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                  </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* مربع حوار تطبيق القيود على مجموعة معلمين */}
        <Dialog open={showBulkConstraintsDialog} onOpenChange={setShowBulkConstraintsDialog}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden" dir="rtl">
            <DialogHeader className="pb-4 border-b border-gray-200">
              {/* @ts-ignore */}
              <DialogTitle className="flex items-center gap-2 text-[#4f46e5] text-xl">
                <Users className="h-6 w-6" />
                تطبيق القيود على معلمين آخرين
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-right mt-2">
                انسخ القيود من المعلم الحالي وطبقها على معلمين آخرين
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] overflow-y-auto px-1">
              <div className="py-4 space-y-6">
                {/* معلومات المعلم المصدر */}
                {selectedTeacherForBlocking && (
                  <div className="p-4 bg-gradient-to-r from-[#818cf8] to-[#6366f1] bg-opacity-10 rounded-xl border-2 border-[#6366f1]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-6 w-6 text-[#4f46e5]" />
                        <div>
                          <p className="text-xs text-gray-600 mb-1">نسخ القيود من المعلم:</p>
                          <p className="font-bold text-gray-900">
                            {[...MOCK_TEACHERS, ...customWaiters].find(t => t.id === selectedTeacherForBlocking)?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">الحصص المستثناة</p>
                        <p className="text-2xl font-bold text-[#4f46e5]">
                          {blockedPeriods[selectedTeacherForBlocking]?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* قائمة المعلمين */}
                <div className="border-2 border-[#6366f1] rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] px-6 py-4">
                    <h3 className="text-lg font-bold text-white">
                      اختيار المعلمين ({selectedTeachersForBulk.length} معلم)
                    </h3>
                    <p className="text-sm text-indigo-100 mt-1">حدد المعلمين الذين تريد نسخ القيود إليهم</p>
                  </div>
                  <div className="p-4 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[...MOCK_TEACHERS, ...customWaiters]
                        .filter(teacher => teacher.id !== selectedTeacherForBlocking)
                        .map(teacher => {
                        const isSelected = selectedTeachersForBulk.includes(teacher.id);
                        const quota = teachersWaitingQuota[teacher.id] ?? 0;
                        
                        return (
                          <div
                            key={teacher.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedTeachersForBulk(prev => prev.filter(id => id !== teacher.id));
                              } else {
                                setSelectedTeachersForBulk(prev => [...prev, teacher.id]);
                              }
                            }}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#4f46e5] border-[#4f46e5] text-white'
                                : 'bg-white border-gray-300 hover:border-[#6366f1] hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                  {teacher.name}
                                </p>
                                <p className={`text-xs ${isSelected ? 'text-white text-opacity-80' : 'text-gray-500'}`}>
                                  {/* @ts-ignore */}
                                  {teacher.subject}
                                </p>
                              </div>
                              <div className={`text-xs font-bold px-2 py-1 rounded ${
                                isSelected ? 'bg-white bg-opacity-20' : 'bg-blue-100 text-[#4f46e5]'
                              }`}>
                                {quota} حصة
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ملخص القيود التي سيتم نسخها */}
                {selectedTeachersForBulk.length > 0 && selectedTeacherForBlocking && (
                  <div className="border-2 border-green-300 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                      <h3 className="text-lg font-bold text-white">القيود التي سيتم نسخها</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">الحد الأقصى اليومي</p>
                            <p className="text-2xl font-bold text-green-700">
                              {teachersDailyMaxWaiting[selectedTeacherForBlocking] || Math.ceil((teachersWaitingQuota[selectedTeacherForBlocking] || 0) / 5) + 1} حصة
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">الحصص المستثناة</p>
                            <p className="text-2xl font-bold text-green-700">
                              {blockedPeriods[selectedTeacherForBlocking]?.length || 0} حصة
                            </p>
                          </div>
                        </div>
                        {blockedPeriods[selectedTeacherForBlocking] && blockedPeriods[selectedTeacherForBlocking].length > 0 && (
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs font-bold text-gray-700 mb-2">الحصص المستثناة:</p>
                            <div className="flex flex-wrap gap-1">
                              {blockedPeriods[selectedTeacherForBlocking].map((bp, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                  {WEEK_DAYS_NEW[bp.day].label} - {PERIODS[bp.period]}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                        <p className="text-sm text-gray-700">
                          <Info className="h-4 w-4 inline ml-1 text-green-600" />
                          سيتم نسخ هذه القيود إلى {selectedTeachersForBulk.length} معلم محدد. القيود الحالية للمعلمين المحددين سيتم استبدالها.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="flex gap-3 justify-end mt-4 border-t border-gray-200 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkConstraintsDialog(false);
                  setSelectedTeachersForBulk([]);
                }}
                className="hover:bg-gray-100"
              >
                إلغاء
              </Button>
              <Button
                onClick={() => {
                  // نسخ القيود من المعلم المصدر إلى المعلمين المحددين
                  if (selectedTeacherForBlocking) {
                    const sourceMaxDaily = teachersDailyMaxWaiting[selectedTeacherForBlocking];
                    const sourceBlockedPeriods = blockedPeriods[selectedTeacherForBlocking] || [];
                    
                    // تطبيق القيود على كل معلم محدد
                    selectedTeachersForBulk.forEach(teacherId => {
                      if (sourceMaxDaily) {
                        setTeachersDailyMaxWaiting(prev => ({
                          ...prev,
                          [teacherId]: sourceMaxDaily
                        }));
                      }
                      
                      if (sourceBlockedPeriods.length > 0) {
                        setBlockedPeriods(prev => ({
                          ...prev,
                          [teacherId]: [...sourceBlockedPeriods]
                        }));
                      }
                    });
                  }
                  
                  setShowBulkConstraintsDialog(false);
                  setSelectedTeachersForBulk([]);
                  toast({
                    title: "✓ تم التطبيق",
                    description: `تم نسخ القيود إلى ${selectedTeachersForBulk.length} معلم بنجاح`,
                  });
                }}
                disabled={selectedTeachersForBulk.length === 0}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white disabled:opacity-50"
              >
                <Check className="h-4 w-4 ml-2" />
                تطبيق على {selectedTeachersForBulk.length} معلم
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مربع حوار حذف بيانات التتابع */}
        <Dialog open={showDeleteConsecutiveDialog} onOpenChange={setShowDeleteConsecutiveDialog}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              {/* @ts-ignore */}
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                تأكيد حذف بيانات التتابع
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-right">
                هل أنت متأكد من حذف جميع بيانات التتابع؟ سيتم حذف:
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <ul className="space-y-2 text-sm text-red-800">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    إعدادات عدد الحصص المتتابعة
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    الأيام المحددة للتتابع
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    جميع إعدادات التتابع المخصصة
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    <strong>تحذير:</strong> هذا الإجراء لا يمكن التراجع عنه. ستحتاج إلى إعادة تكوين إعدادات التتابع من جديد.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConsecutiveDialog(false)}
                className="hover:bg-gray-100"
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConsecutiveData}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف البيانات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مربع حوار إنشاء قاعدة توزيع جديدة */}
        <Dialog open={showCreateRuleDialog} onOpenChange={setShowCreateRuleDialog}>
          <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-hidden" dir="rtl">
            <DialogHeader className="pb-4 border-b border-gray-200">
              {/* @ts-ignore */}
              <DialogTitle className="flex items-center gap-2 text-purple-600 text-xl">
                <Plus className="h-6 w-6" />
                {editingRule ? 'تعديل قاعدة التوزيع' : 'إنشاء قاعدة توزيع مخصصة'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-right mt-2">
                حدد الأيام والحصص المستهدفة والمعلمين المطلوب تطبيق القاعدة عليهم مع نطاق التوزيع الأسبوعي
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[70vh] overflow-y-auto px-1">
              <div className="space-y-6 pb-4">
                {/* اختيار نوع القاعدة - يظهر فقط عند الإنشاء الجديد */}
                {!editingRule && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Settings className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-purple-800">قاعدة توزيع حصص مخصصة</h3>
                    </div>
                    <p className="text-purple-700 text-sm leading-relaxed">
                      تتيح لك هذه القاعدة التحكم الدقيق في توزيع حصص معينة على المعلمين في أيام محددة، 
                      مع إمكانية تحديد الحد الأدنى والأقصى للحصص الأسبوعية لكل معلم.
                    </p>
                  </div>
                )}

                {/* 1. اختيار الأيام المستهدفة */}
                <div className="space-y-4">
                  <Label className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-indigo-600" />
                    الأيام المستهدفة
                  </Label>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-blue-800 font-medium">أيام تطبيق القاعدة:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (newRule.days.length === workingDays.length) {
                              setNewRule(prev => ({ ...prev, days: [] }));
                            } else {
                              setNewRule(prev => ({ ...prev, days: [...workingDays] }));
                            }
                          }}
                          className="text-xs h-7"
                        >
                          {newRule.days.length === workingDays.length ? 'إلغاء الكل' : 'تحديد الكل'}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {workingDays.map((day) => (
                        <div
                          key={day}
                          className={`p-3 rounded-lg cursor-pointer transition-all border-2 text-center ${
                            newRule.days.includes(day)
                              ? 'bg-blue-100 border-blue-400 text-blue-800'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                          onClick={() => toggleDayInNewRule(day)}
                        >
                          <div className="font-medium text-sm">{day}</div>
                          <div className="text-xs mt-1">
                            {newRule.days.includes(day) && <Check className="h-3 w-3 mx-auto" />}
                          </div>
                        </div>
                      ))}
                    </div>
                    {newRule.days.length > 0 && (
                      <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
                        تم اختيار {newRule.days.length} من أصل {workingDays.length} أيام عمل
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. اختيار الحصص المستهدفة */}
                <div className="space-y-4">
                  <Label className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    الحصص المستهدفة
                  </Label>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-purple-800 font-medium">اختر الحصص المراد تطبيق القاعدة عليها:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (newRule.periods.length === AVAILABLE_PERIODS.length) {
                              setNewRule(prev => ({ ...prev, periods: [] }));
                            } else {
                              setNewRule(prev => ({ ...prev, periods: AVAILABLE_PERIODS.map(p => p.name) }));
                            }
                          }}
                          className="text-xs h-7"
                        >
                          {newRule.periods.length === AVAILABLE_PERIODS.length ? 'إلغاء الكل' : 'تحديد الكل'}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {AVAILABLE_PERIODS.map((period) => (
                        <div
                          key={period.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all border-2 text-center ${
                            newRule.periods.includes(period.name)
                              ? 'bg-purple-100 border-purple-400 text-purple-800'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                          onClick={() => togglePeriodInNewRule(period.name)}
                        >
                          <div className="font-medium text-sm">{period.name}</div>
                          <div className="text-xs mt-1">
                            {newRule.periods.includes(period.name) && <Check className="h-3 w-3 mx-auto" />}
                          </div>
                        </div>
                      ))}
                    </div>
                    {newRule.periods.length > 0 && (
                      <div className="mt-3 p-2 bg-purple-100 rounded text-xs text-purple-700">
                        تم اختيار {newRule.periods.length} من أصل {AVAILABLE_PERIODS.length} حصص
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. اختيار المعلمين المستهدفين */}
                <div className="space-y-4">
                  <Label className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    المعلمون المستهدفون
                  </Label>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-green-800 font-medium">اختر المعلمين لتطبيق القاعدة:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (newRule.teachers.length === MOCK_TEACHERS.length) {
                              setNewRule(prev => ({ ...prev, teachers: [] }));
                            } else {
                              setNewRule(prev => ({ ...prev, teachers: MOCK_TEACHERS.map(t => t.id) }));
                            }
                          }}
                          className="text-xs h-7"
                        >
                          {newRule.teachers.length === MOCK_TEACHERS.length ? 'إلغاء الكل' : 'تحديد الكل'}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {MOCK_TEACHERS.map((teacher) => (
                        <div
                          key={teacher.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                            newRule.teachers.includes(teacher.id)
                              ? 'bg-green-100 border-green-400 text-green-800'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                          onClick={() => toggleTeacherInNewRule(teacher.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{teacher.name}</div>
                              <div className="text-xs mt-1">{/* @ts-ignore */}{teacher.subject}</div>
                            </div>
                            <div className="text-xs">
                              {newRule.teachers.includes(teacher.id) && <Check className="h-4 w-4" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {newRule.teachers.length > 0 && (
                      <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-700">
                        تم اختيار {newRule.teachers.length} من أصل {MOCK_TEACHERS.length} معلمين
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. نطاق التوزيع الأسبوعي */}
                <div className="space-y-4">
                  <Label className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-orange-600" />
                    نطاق التوزيع الأسبوعي
                  </Label>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-orange-800 text-sm mb-4">حدد عدد المرات التي يجب أن يحصل فيها كل معلم على الحصص المختارة أسبوعياً</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-orange-700">الحد الأدنى</Label>
                        <Input
                          type="number"
                          min={0}
                          max={5}
                          value={newRule.minAssignments}
                          onChange={(e) => setNewRule(prev => ({ 
                            ...prev, 
                            minAssignments: Math.min(5, Math.max(0, parseInt(e.target.value) || 0))
                          }))}
                          className="text-center border-orange-300 focus:border-orange-500"
                          placeholder="1"
                        />
                        <p className="text-xs text-orange-600">أقل عدد مرات في الأسبوع</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-orange-700">الحد الأقصى</Label>
                        <Input
                          type="number"
                          min={0}
                          max={5}
                          value={newRule.maxAssignments}
                          onChange={(e) => setNewRule(prev => ({ 
                            ...prev, 
                            maxAssignments: Math.min(5, Math.max(0, parseInt(e.target.value) || 0))
                          }))}
                          className="text-center border-orange-300 focus:border-orange-500"
                          placeholder="3"
                        />
                        <p className="text-xs text-orange-600">أكبر عدد مرات في الأسبوع</p>
                      </div>
                    </div>
                    
                    {/* ملاحظة خاصة للحد الأدنى = الحد الأقصى = 1 */}
                    {newRule.minAssignments === 1 && newRule.maxAssignments === 1 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-yellow-800">
                            <strong>ملاحظة مهمة:</strong> مع تحديد الحد الأدنى والأقصى = 1، سيضمن النظام حصول كل معلم مختار 
                            على الحصص المحددة مرة واحدة بالضبط في الأسبوع.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">
                          <strong>مثال:</strong> إذا اخترت الحد الأدنى 2 والحد الأقصى 3، فسيحصل كل معلم من المعلمين المختارين 
                          على الحصص المحددة بين 2 و 3 مرات في الأسبوع في الأيام المختارة.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* رسائل التحقق والتعارضات */}
                {validationMessages.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-2">يرجى تصحيح الأخطاء التالية:</h4>
                        <ul className="space-y-1">
                          {validationMessages.map((message, index) => (
                            <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              {message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* رسائل التعارضات المحتملة */}
                {conflictWarnings.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-amber-800 mb-2">تحذيرات التعارض:</h4>
                        <ul className="space-y-1">
                          {conflictWarnings.map((warning, index) => (
                            <li key={index} className="text-sm text-amber-700 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                              {warning}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-amber-600 mt-2">
                          يمكنك المتابعة لكن قد تحتاج لتعديل القواعد المتعارضة لاحقاً.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelCreateRule}
                className="hover:bg-gray-100"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCreateRule}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                <Save className="h-4 w-4 ml-2" />
                {editingRule ? 'حفظ التعديل' : 'حفظ القاعدة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مربع حوار معاينة القاعدة */}
        <Dialog open={showRulePreview} onOpenChange={setShowRulePreview}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              {/* @ts-ignore */}
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Eye className="h-5 w-5" />
                معاينة التأثير المتوقع للقاعدة
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-right">
                تأثير تطبيق هذه القاعدة على الجدول المدرسي
              </DialogDescription>
            </DialogHeader>

            {previewingRule && (
              <div className="py-4 space-y-6">
                {(() => {
                  // معاينة قواعد التوزيع العادية (الكود الموجود حالياً)
                  const rule = distributionRules.find(r => r.id === previewingRule);
                  if (!rule) return null;

                  const affectedTeachers = rule.teachers.map(id => MOCK_TEACHERS.find(t => t.id === id)).filter(Boolean);
                  const totalClassrooms = MOCK_CLASSES.length;
                  const weeklySlots = totalClassrooms * 5; // 5 أيام دراسية

                  return (
                    <>
                      {/* ملخص القاعدة */}
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-medium text-green-800 mb-3">ملخص القاعدة:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-green-700">الحصة المستهدفة:</span>
                            <p className="text-green-800">{rule.period}</p>
                          </div>
                          <div>
                            <span className="font-medium text-green-700">المعلمون:</span>
                            <p className="text-green-800">
                              {affectedTeachers.length === MOCK_TEACHERS.length 
                                ? `اختيار الكل (${MOCK_TEACHERS.length})`
                                : `${affectedTeachers.length} معلم`
                              }
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-green-700">النطاق الأسبوعي:</span>
                            <p className="text-green-800">{rule.minAssignments} - {rule.maxAssignments} مرات</p>
                          </div>
                        </div>
                      </div>

                      {/* المعلمون المتأثرون */}
                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-800">
                          المعلمون المتأثرون
                          {affectedTeachers.length === MOCK_TEACHERS.length && (
                            <span className="mr-2 text-sm text-green-600 font-normal">(جميع المعلمين)</span>
                          )}
                          :
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {affectedTeachers.map(teacher => (
                            <div key={teacher.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-blue-800">{teacher.name}</p>
                                  <p className="text-sm text-blue-600">{/* @ts-ignore */}{teacher.subject}</p>
                                  <p className="text-xs text-blue-500">
                                    سيحصل على {rule.period} بين {rule.minAssignments}-{rule.maxAssignments} مرات أسبوعياً
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* التحليل الإحصائي */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-800">التحليل الإحصائي:</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-800">
                              {weeklySlots}
                            </div>
                            <p className="text-sm text-purple-600">إجمالي الحصص الأسبوعية</p>
                          </div>
                          
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-800">
                              {rule.minAssignments * affectedTeachers.length}
                            </div>
                            <p className="text-sm text-blue-600">الحد الأدنى المطلوب</p>
                          </div>
                          
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-800">
                              {rule.maxAssignments * affectedTeachers.length}
                            </div>
                            <p className="text-sm text-green-600">الحد الأقصى المطلوب</p>
                          </div>
                          
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                            <div className="text-2xl font-bold text-amber-800">
                              {Math.max(0, weeklySlots - (rule.maxAssignments * affectedTeachers.length))}
                            </div>
                            <p className="text-sm text-amber-600">الحصص المتبقية</p>
                          </div>
                        </div>

                        {/* تحذيرات إن وجدت */}
                        {(rule.minAssignments * affectedTeachers.length) > weeklySlots && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-medium text-red-800 mb-1">تحذير: متطلبات مستحيلة!</h4>
                                <p className="text-sm text-red-700">
                                  الحد الأدنى المطلوب ({rule.minAssignments * affectedTeachers.length}) 
                                  يتجاوز إجمالي الحصص المتاحة ({weeklySlots}). يرجى تعديل القاعدة.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {(rule.maxAssignments * affectedTeachers.length) > (weeklySlots * 0.8) && (rule.minAssignments * affectedTeachers.length) <= weeklySlots && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-medium text-amber-800 mb-1">تحذير: قد يصعب التحقيق</h4>
                                <p className="text-sm text-amber-700">
                                  الحد الأقصى المطلوب مرتفع نسبياً. قد يؤثر على توزيع باقي المعلمين.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* التوزيع المتوقع */}
                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-800">التوزيع المتوقع على الأسبوع:</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-5 gap-2 text-center text-sm">
                            {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((day, index) => (
                              <div key={day} className="p-2 bg-white rounded border">
                                <div className="font-medium text-gray-700 mb-2">{day}</div>
                                <div className="space-y-1">
                                  {affectedTeachers.slice(0, Math.min(3, affectedTeachers.length)).map((teacher, tIndex) => (
                                    <div key={teacher.id} className="text-xs p-1 bg-blue-100 text-blue-800 rounded">
                                      {teacher.name.split(' ')[0]}
                                    </div>
                                  ))}
                                  {affectedTeachers.length > 3 && (
                                    <div className="text-xs text-gray-500">+{affectedTeachers.length - 3}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-3 text-center">
                            * هذا توزيع تقريبي. التوزيع الفعلي يعتمد على باقي القيود والقواعد
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRulePreview(false);
                  setPreviewingRule(null);
                }}
                className="hover:bg-gray-100"
              >
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مربع حوار إضافة منتظر يدوياً للبطاقة الأولى (التوزيع المتوازن) - تصميم متجاوب احترافي */}
        <Dialog open={showAddWaiterDialog} onOpenChange={setShowAddWaiterDialog}>
          <DialogContent className="max-w-[95vw] w-full sm:max-w-md md:max-w-lg bg-gradient-to-br from-white to-blue-50 max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader className="border-b border-gray-200 pb-4 sticky top-0 bg-gradient-to-br from-white to-blue-50 z-10">
              {/* @ts-ignore */}
              <DialogTitle className="flex flex-col sm:flex-row items-center gap-3 text-xl sm:text-2xl">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#4f46e5] to-[#6366f1] rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] bg-clip-text text-transparent font-bold text-center sm:text-right">
                  إضافة منتظر جديد
                </span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-center sm:text-right mt-2 text-sm">
                أدخل بيانات المعلم المنتظر الجديد وحدد نصاب الانتظار الخاص به
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-5 py-4 sm:py-6 px-2 sm:px-0">
              {/* حقل اسم المنتظر */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="waiter-name" className="text-right font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <User className="h-4 w-4 text-[#4f46e5]" />
                  اسم المنتظر
                </Label>
                <Input
                  id="waiter-name"
                  value={newWaiterData.name}
                  onChange={(e) => setNewWaiterData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسم المعلم المنتظر"
                  className="text-right border-2 border-gray-300 focus:border-[#4f46e5] h-11 sm:h-12 text-sm sm:text-base w-full"
                  dir="rtl"
                />
              </div>

              {/* حقل نصاب الانتظار */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="waiter-quota" className="text-right font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <Clock className="h-4 w-4 text-[#4f46e5]" />
                  نصاب الانتظار الأسبوعي
                </Label>
                <div className="relative">
                  <Input
                    id="waiter-quota"
                    type="number"
                    min="1"
                    max="24"
                    value={newWaiterData.waitingQuota}
                    onChange={(e) => {
                      let value = parseInt(e.target.value) || 0;
                      if (value < 0) value = 0;
                      if (value > 24) value = 24;
                      setNewWaiterData(prev => ({ ...prev, waitingQuota: value }));
                    }}
                    placeholder="عدد حصص الانتظار"
                    className="text-center border-2 border-gray-300 focus:border-[#4f46e5] h-12 sm:h-14 text-lg sm:text-xl font-bold text-[#4f46e5] w-full"
                  />
                  <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs sm:text-sm">
                    حصة
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2.5 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800 flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>الحد الأقصى لعدد حصص الانتظار الأسبوعية <strong className="text-[#4f46e5]">24 حصة</strong> فقط</span>
                  </p>
                </div>
              </div>

              {/* معاينة سريعة */}
              {newWaiterData.name.trim() && newWaiterData.waitingQuota > 0 && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Eye className="h-4 w-4 text-blue-600" />
                    معاينة سريعة
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">الاسم:</span>
                      <span className="font-bold text-gray-900 truncate ml-2">{newWaiterData.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">نصاب الانتظار:</span>
                      <span className="font-bold text-[#4f46e5]">{newWaiterData.waitingQuota} حصة</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">المتوسط اليومي:</span>
                      <span className="font-bold text-gray-900">
                        {(newWaiterData.waitingQuota / 5).toFixed(1)} حصة
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddWaiterDialog(false);
                  setNewWaiterData({ name: '', waitingQuota: 0 });
                }}
                className="hover:bg-gray-100 border-2 w-full sm:w-auto order-2 sm:order-1"
              >
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <Button
                onClick={handleAddWaiter}
                disabled={!newWaiterData.name.trim() || newWaiterData.waitingQuota === 0}
                className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto order-1 sm:order-2"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة المنتظر
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مربع حوار إضافة منتظر يدوياً للبطاقة الثانية (تحديد عدد المنتظرين) */}
        <Dialog open={showAddWaiterDialogSecond} onOpenChange={setShowAddWaiterDialogSecond}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              {/* @ts-ignore */}
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Plus className="h-5 w-5" />
                إضافة منتظر يدوياً
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-right">
                أدخل بيانات المنتظر الجديد
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="waiter-name" className="text-right">اسم المنتظر</Label>
                <Input
                  id="waiter-name"
                  value={newWaiterData.name}
                  onChange={(e) => setNewWaiterData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسم المنتظر"
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waiter-quota" className="text-right">نصاب الانتظار</Label>
                <Input
                  id="waiter-quota"
                  type="number"
                  min="0"
                  max="15"
                  value={newWaiterData.waitingQuota}
                  onChange={(e) => setNewWaiterData(prev => ({ ...prev, waitingQuota: parseInt(e.target.value) || 0 }))}
                  placeholder="عدد حصص الانتظار"
                  className="text-center"
                />
                <p className="text-xs text-gray-500">عدد حصص الانتظار الأسبوعية</p>
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddWaiterDialog(false);
                  setNewWaiterData({ name: '', waitingQuota: 0 });
                }}
                className="hover:bg-gray-100"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddWaiter}
                disabled={!newWaiterData.name.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة المنتظر
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مربع حوار إضافة منتظر يدوياً للبطاقة الثانية (تحديد عدد المنتظرين) */}
        <Dialog open={showAddWaiterDialogSecond} onOpenChange={setShowAddWaiterDialogSecond}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              {/* @ts-ignore */}
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Plus className="h-5 w-5" />
                إضافة منتظر يدوياً
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-right">
                أدخل بيانات المنتظر الجديد لجدول المنتظرين
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="waiter-name-second" className="text-right">اسم المنتظر</Label>
                <Input
                  id="waiter-name-second"
                  value={newWaiterData.name}
                  onChange={(e) => setNewWaiterData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسم المنتظر"
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waiter-quota-second" className="text-right">نصاب الانتظار</Label>
                <Input
                  id="waiter-quota-second"
                  type="number"
                  min="0"
                  max="15"
                  value={newWaiterData.waitingQuota}
                  onChange={(e) => setNewWaiterData(prev => ({ ...prev, waitingQuota: parseInt(e.target.value) || 0 }))}
                  placeholder="عدد حصص الانتظار"
                  className="text-center"
                />
                <p className="text-xs text-gray-500">عدد حصص الانتظار الأسبوعية</p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Info className="h-4 w-4 inline ml-1" />
                  سيتم حساب عدد الانتظار في اليوم والفائض تلقائياً حسب إعدادات التوزيع.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddWaiterDialogSecond(false);
                  setNewWaiterData({ name: '', waitingQuota: 0 });
                }}
                className="hover:bg-gray-100"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddWaiterSecond}
                disabled={!newWaiterData.name.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة المنتظر
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مربع حوار التأكيد الاحترافي */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              {/* @ts-ignore */}
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {confirmDialog.showCancel !== false ? (
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-[#4f46e5]" />
                )}
                {confirmDialog.title}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-4 whitespace-pre-line text-base">
                {confirmDialog.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3 justify-end mt-6">
              {confirmDialog.showCancel !== false && (
                <Button
                  variant="outline"
                  onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
                  className="hover:bg-gray-100 px-6"
                >
                  إلغاء
                </Button>
              )}
              <Button
                onClick={() => confirmDialog.onConfirm()}
                className={`px-6 ${
                  confirmDialog.showCancel === false 
                    ? 'bg-[#6366f1] hover:bg-[#4f46e5]' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {confirmDialog.confirmText || "تأكيد الحذف"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ToastViewport className="fixed bottom-4 right-4 flex flex-col p-4 gap-2 w-full max-w-sm m-0 z-[2147483647] outline-none" />
      </ToastProvider>
    </div>
  );
};

// التصدير الافتراضي للمكون
export default ScheduleSettingsFinal;
