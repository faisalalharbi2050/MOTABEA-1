import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSchool } from '../../contexts/SchoolContext.jsx';
import {
  Clock,
  Settings,
  Home,
  Save,
  Plus,
  Timer,
  Sun,
  Snowflake,
  AlarmClock,
  CheckCircle,
  Calendar,
  CalendarDays,
  Trash2,
  X,
  Info,
  MoreHorizontal,
  Pencil,
  Edit,
  ClipboardCheck,
  Printer,
  Calendar as CalendarIcon,
  ChevronUp,
  ChevronDown,
  Moon,
  School,
  Check
} from 'lucide-react';

// مكونات UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Checkbox, Badge, Progress, Switch, Label } from '@/components/ui/form-components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/advanced-components';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/advanced-components';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/advanced-components";
// استيراد ملف التصميم الموحد
import '@/styles/unified-header-styles.css';

// إضافة animation للإشعار
const notificationStyles = `
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translate(-50%, -100%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
  
  .animate-slideInDown {
    animation: slideInDown 0.4s ease-out;
  }
`;

const TimingPage: React.FC = () => {
  const { toast } = useToast();
  const { schoolData } = useSchool();
  // مرجع للجداول للطباعة
  const summerScheduleRef = useRef<HTMLDivElement>(null);
  const winterScheduleRef = useRef<HTMLDivElement>(null);
  const ramadanScheduleRef = useRef<HTMLDivElement>(null);
  
  // حالة البيانات
  const [activeTab, setActiveTab] = useState<string>('settings');
  const [workDays, setWorkDays] = useState<string[]>(['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']);
  const [periodsCount, setPeriodsCount] = useState(7);
  const [startTime, setStartTime] = useState('06:45'); // تغيير الوقت الافتراضي للاصطفاف
  const [periodDuration, setPeriodDuration] = useState(45);
  const [isCustomPeriods, setIsCustomPeriods] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(95);
  
  // إعدادات التوقيت الجديدة
  const [breakCount, setBreakCount] = useState(1); // عدد الفسح
  const [breakAfterPeriods, setBreakAfterPeriods] = useState<string[]>(['بعد الحصة الثانية']); // موعد الفسحة بعد الحصة
  const [breakDuration, setBreakDuration] = useState(25); // مدة الفسحة بالدقائق
  
  // إعدادات الصلاة المتعددة
  const [prayerTimes, setPrayerTimes] = useState([
    { id: 1, prayerName: 'الظهر', afterPeriod: 'بعد الحصة السابعة', duration: 25 }
  ]); // قائمة أوقات الصلاة
  
  // إعدادات العرض للجداول المدرسية (وليس جداول التوقيت)
  const [showBreaksInClassSchedule, setShowBreaksInClassSchedule] = useState(true); // إظهار الفسحة في جداول الحصص
  const [showPrayersInClassSchedule, setShowPrayersInClassSchedule] = useState(true); // إظهار الصلاة في جداول الحصص
  
  // إعدادات المدرسة المشتركة
  const [isMultiStageSchool, setIsMultiStageSchool] = useState(false); // هل المدرسة مشتركة؟
  const [schoolStages, setSchoolStages] = useState<string[]>(['ابتدائي']); // المراحل المختلفة
  const [showUnifiedTimingAlert, setShowUnifiedTimingAlert] = useState(false); // تنبيه للتوقيت الموحد
  const [selectedSchoolForTiming, setSelectedSchoolForTiming] = useState<string | null>(null); // المدرسة المحددة للتوقيت
  
  // إعدادات التوقيت المحدد
  const [selectedScheduleType, setSelectedScheduleType] = useState<'summer' | 'winter' | 'ramadan'>('summer');
  
  // حالة الإعدادات المحفوظة
  const [savedSettings, setSavedSettings] = useState<any>(null);
  
  // حالة الإشعار الاحترافي
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showDeleteNotification, setShowDeleteNotification] = useState(false);
  
  // حالة عرض/إخفاء للجداول - تبدأ جميعها مغلقة افتراضياً
  const [isSummerScheduleOpen, setIsSummerScheduleOpen] = useState<boolean>(false);
  const [isWinterScheduleOpen, setIsWinterScheduleOpen] = useState<boolean>(false);
  const [isRamadanScheduleOpen, setIsRamadanScheduleOpen] = useState<boolean>(false);
  
  // متغيرات الملاحظات لكل جدول توقيت
  const [summerNotes, setSummerNotes] = useState<string>('');
  const [winterNotes, setWinterNotes] = useState<string>('');
  const [ramadanNotes, setRamadanNotes] = useState<string>('');
  
  // خيارات إظهار/إخفاء الملاحظات
  const [showSummerNotes, setShowSummerNotes] = useState<boolean>(true);
  const [showWinterNotes, setShowWinterNotes] = useState<boolean>(true);
  const [showRamadanNotes, setShowRamadanNotes] = useState<boolean>(true);
  
  // إدارة التوقيت للمدارس المختلفة (النظام الجديد)
  const [currentSchoolIndex, setCurrentSchoolIndex] = useState<number>(0);
  const [schoolTimings, setSchoolTimings] = useState<{[key: number]: {
    schoolName: string;
    stage?: string;
    sectionType?: string;
    summerSchedule: any[];
    winterSchedule: any[];
    ramadanSchedule: any[];
    summerNotes: string;
    winterNotes: string;
    ramadanNotes: string;
    showSummerNotes: boolean;
    showWinterNotes: boolean;
    showRamadanNotes: boolean;
    workDays: string[];
    startTime: string;
    periodDuration: number;
    breakCount: number;
    breakAfterPeriods: string[];
    breakDuration: number;
    prayerTimes: any[];
    customDaySettings?: {
      [key: string]: {
        periodsCount: number;
        startTime: string;
      };
    };
  }}>({});
  
  // حالة نافذة إضافة مدرسة جديدة
  const [showAddSchoolDialog, setShowAddSchoolDialog] = useState<boolean>(false);
  const [availableSchools, setAvailableSchools] = useState<string[]>([]);
  
  // حالة الإشعار الاحترافي للتوقيت الموحد
  const [showUnifiedTimingNotification, setShowUnifiedTimingNotification] = useState<boolean>(false);
  
  // حالة حوار تأكيد حذف الإعدادات
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState<boolean>(false);

  // جدول توقيت رمضان
  const [ramadanSchedule, setRamadanSchedule] = useState([
    { id: 1, activity: 'الاصطفاف الصباحي', startTime: '09:00', endTime: '09:15' },
    { id: 2, activity: 'الحصة الأولى', startTime: '09:15', endTime: '09:45' },
    { id: 3, activity: 'الحصة الثانية', startTime: '09:45', endTime: '10:15' },
    { id: 4, activity: 'الفسحة الأولى', startTime: '10:15', endTime: '10:30' },
    { id: 5, activity: 'الحصة الثالثة', startTime: '10:30', endTime: '11:00' },
    { id: 6, activity: 'الحصة الرابعة', startTime: '11:00', endTime: '11:30' },
    { id: 7, activity: 'الفسحة الثانية', startTime: '11:30', endTime: '11:45' },
    { id: 8, activity: 'الحصة الخامسة', startTime: '11:45', endTime: '12:15' },
    { id: 9, activity: 'الحصة السادسة', startTime: '12:15', endTime: '12:45' },
    { id: 10, activity: 'الصلاة', startTime: '12:45', endTime: '13:00' },
    { id: 11, activity: 'الحصة السابعة', startTime: '13:00', endTime: '13:30' },
  ]);

  // جدول التوقيت الصيفي
  const [summerSchedule, setSummerSchedule] = useState([
    { id: 1, activity: 'الاصطفاف الصباحي', startTime: '07:15', endTime: '07:30' },
    { id: 2, activity: 'الحصة الأولى', startTime: '07:30', endTime: '08:15' },
    { id: 3, activity: 'الحصة الثانية', startTime: '08:15', endTime: '09:00' },
    { id: 4, activity: 'الفسحة الأولى', startTime: '09:00', endTime: '09:15' },
    { id: 5, activity: 'الحصة الثالثة', startTime: '09:15', endTime: '10:00' },
    { id: 6, activity: 'الحصة الرابعة', startTime: '10:00', endTime: '10:45' },
    { id: 7, activity: 'الفسحة الثانية', startTime: '10:45', endTime: '11:00' },
    { id: 8, activity: 'الحصة الخامسة', startTime: '11:00', endTime: '11:45' },
    { id: 9, activity: 'الحصة السادسة', startTime: '11:45', endTime: '12:30' },
    { id: 10, activity: 'صلاة الظهر', startTime: '12:30', endTime: '12:45' },
    { id: 11, activity: 'الحصة السابعة', startTime: '12:45', endTime: '13:30' },
  ]);

  // جدول التوقيت الشتوي
  const [winterSchedule, setWinterSchedule] = useState([
    { id: 1, activity: 'الاصطفاف الصباحي', startTime: '07:30', endTime: '07:45' },
    { id: 2, activity: 'الحصة الأولى', startTime: '07:45', endTime: '08:30' },
    { id: 3, activity: 'الحصة الثانية', startTime: '08:30', endTime: '09:15' },
    { id: 4, activity: 'الفسحة الأولى', startTime: '09:15', endTime: '09:30' },
    { id: 5, activity: 'الحصة الثالثة', startTime: '09:30', endTime: '10:15' },
    { id: 6, activity: 'الحصة الرابعة', startTime: '10:15', endTime: '11:00' },
    { id: 7, activity: 'الفسحة الثانية', startTime: '11:00', endTime: '11:15' },
    { id: 8, activity: 'الحصة الخامسة', startTime: '11:15', endTime: '12:00' },
    { id: 9, activity: 'الحصة السادسة', startTime: '12:00', endTime: '12:45' },
    { id: 10, activity: 'صلاة الظهر', startTime: '12:45', endTime: '13:00' },
    { id: 11, activity: 'الحصة السابعة', startTime: '13:00', endTime: '13:45' },
  ]);

  // تأثير لتهيئة النظام عند تحميل الصفحة
  useEffect(() => {
    // تحديث قائمة المدارس المتاحة
    if (schoolData?.schools && schoolData.schools.length > 1) {
      setAvailableSchools(schoolData.schools.map(school => school.name));
    }
  }, [schoolData]);

  // تأثير لحفظ التوقيت الحالي عند تغيير البيانات
  useEffect(() => {
    if (Object.keys(schoolTimings).length > 0 && schoolTimings[currentSchoolIndex]) {
      const updatedTiming = {
        ...schoolTimings[currentSchoolIndex],
        summerSchedule: [...summerSchedule],
        winterSchedule: [...winterSchedule],
        ramadanSchedule: [...ramadanSchedule],
        summerNotes,
        winterNotes,
        ramadanNotes,
        showSummerNotes,
        showWinterNotes,
        showRamadanNotes,
        workDays: [...workDays],
        startTime,
        periodDuration,
        breakCount,
        breakAfterPeriods: [...breakAfterPeriods],
        breakDuration,
        prayerTimes: [...prayerTimes]
      };

      setSchoolTimings(prev => ({
        ...prev,
        [currentSchoolIndex]: updatedTiming
      }));
    }
  }, [summerSchedule, winterSchedule, ramadanSchedule, summerNotes, winterNotes, ramadanNotes, 
      showSummerNotes, showWinterNotes, showRamadanNotes, workDays, startTime, periodDuration, 
      breakCount, breakAfterPeriods, breakDuration, prayerTimes]);

  // دالة تحويل رقم الحصة إلى نص عربي
  const getPeriodText = (periodNumber: number) => {
    const periodNames: { [key: number]: string } = {
      1: 'بعد الحصة الأولى',
      2: 'بعد الحصة الثانية', 
      3: 'بعد الحصة الثالثة',
      4: 'بعد الحصة الرابعة',
      5: 'بعد الحصة الخامسة',
      6: 'بعد الحصة السادسة',
      7: 'بعد الحصة السابعة',
      8: 'بعد الحصة الثامنة',
      9: 'بعد الحصة التاسعة',
      10: 'بعد الحصة العاشرة'
    };
    return periodNames[periodNumber] || `بعد الحصة ${periodNumber}`;
  };

  // حالة البيانات المخصصة لكل يوم
  const [customDaySettings, setCustomDaySettings] = useState({
    'الأحد': { periodsCount: 7, startTime: '07:15' },
    'الاثنين': { periodsCount: 7, startTime: '07:15' },
    'الثلاثاء': { periodsCount: 7, startTime: '07:15' },
    'الأربعاء': { periodsCount: 7, startTime: '07:15' },
    'الخميس': { periodsCount: 6, startTime: '07:15' },
    'الجمعة': { periodsCount: 0, startTime: '00:00' },
    'السبت': { periodsCount: 0, startTime: '00:00' },
  });
  
  // قائمة الأيام
  const allDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // حفظ customDaySettings في schoolTimings عند التغيير
  useEffect(() => {
    if (Object.keys(schoolTimings).length > 0 && schoolTimings[currentSchoolIndex]) {
      setSchoolTimings(prev => ({
        ...prev,
        [currentSchoolIndex]: {
          ...prev[currentSchoolIndex],
          customDaySettings: {...customDaySettings}
        }
      }));
    }
  }, [customDaySettings]);

  // التعامل مع تغيير أيام العمل
  const handleWorkDayToggle = (day: string) => {
    if (workDays.includes(day)) {
      setWorkDays(workDays.filter(d => d !== day));
    } else {
      setWorkDays([...workDays, day]);
    }
  };

  // تغيير إعدادات اليوم المخصص
  const handleCustomDaySettingChange = (day: string, field: 'periodsCount' | 'startTime', value: any) => {
    setCustomDaySettings({
      ...customDaySettings,
      [day]: {
        ...customDaySettings[day as keyof typeof customDaySettings],
        [field]: value
      }
    });
  };

  // التعامل مع تغيير جدول التوقيت الصيفي مع إعادة حساب تلقائي
  const handleSummerScheduleChange = (id: number, field: 'activity' | 'startTime' | 'endTime', value: string) => {
    setSummerSchedule(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      );
      return recalculateScheduleTiming(updated);
    });
  };

  // التعامل مع تغيير جدول التوقيت الشتوي مع إعادة حساب تلقائي
  const handleWinterScheduleChange = (id: number, field: 'activity' | 'startTime' | 'endTime', value: string) => {
    setWinterSchedule(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      );
      return recalculateScheduleTiming(updated);
    });
  };

  // إضافة نشاط جديد للجدول الصيفي مع إعادة حساب
  const addSummerActivity = () => {
    const newId = summerSchedule.length > 0 ? Math.max(...summerSchedule.map(item => item.id)) + 1 : 1;
    const newSchedule = [...summerSchedule, { id: newId, activity: '', startTime: '', endTime: '' }];
    setSummerSchedule(recalculateScheduleTiming(newSchedule));
  };

  // إضافة نشاط جديد للجدول الشتوي مع إعادة حساب
  const addWinterActivity = () => {
    const newId = winterSchedule.length > 0 ? Math.max(...winterSchedule.map(item => item.id)) + 1 : 1;
    const newSchedule = [...winterSchedule, { id: newId, activity: '', startTime: '', endTime: '' }];
    setWinterSchedule(recalculateScheduleTiming(newSchedule));
  };

  // حذف نشاط من الجدول الصيفي مع إعادة حساب
  const deleteSummerActivity = (id: number) => {
    const newSchedule = summerSchedule.filter(item => item.id !== id);
    setSummerSchedule(recalculateScheduleTiming(newSchedule));
  };

  // حذف نشاط من الجدول الشتوي مع إعادة حساب
  const deleteWinterActivity = (id: number) => {
    const newSchedule = winterSchedule.filter(item => item.id !== id);
    setWinterSchedule(recalculateScheduleTiming(newSchedule));
  };

  // التعامل مع تغيير جدول توقيت رمضان مع إعادة حساب تلقائي
  const handleRamadanScheduleChange = (id: number, field: 'activity' | 'startTime' | 'endTime', value: string) => {
    setRamadanSchedule(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      );
      return recalculateScheduleTiming(updated);
    });
  };

  // دالة إعادة حساب التوقيت تلقائياً
  const recalculateScheduleTiming = (schedule: any[]) => {
    let currentTime = startTime;
    const recalculated = [...schedule];
    
    for (let i = 0; i < recalculated.length; i++) {
      const item = recalculated[i];
      
      if (item.activity === 'الاصطفاف الصباحي' || item.activity === 'الطابور الصباحي') {
        item.startTime = currentTime;
        item.endTime = addMinutesToTime(currentTime, 15);
        currentTime = item.endTime;
      } else if (item.activity.includes('الحصة')) {
        item.startTime = currentTime;
        item.endTime = addMinutesToTime(currentTime, periodDuration);
        currentTime = item.endTime;
      } else if (item.activity.includes('الفسحة')) {
        item.startTime = currentTime;
        item.endTime = addMinutesToTime(currentTime, breakDuration);
        currentTime = item.endTime;
      } else if (item.activity.includes('الصلاة') || item.activity.includes('صلاة')) {
        // البحث عن تطابق مع أوقات الصلاة المحددة
        const matchingPrayer = prayerTimes.find(p => item.activity.includes(p.prayerName));
        const duration = matchingPrayer ? matchingPrayer.duration : 25;
        item.startTime = currentTime;
        item.endTime = addMinutesToTime(currentTime, duration);
        currentTime = item.endTime;
      }
    }
    
    return recalculated;
  };

  // دالة مساعدة لإضافة دقائق لوقت محدد
  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  // دالة تحويل النص العربي إلى رقم
  const getNumberFromText = (text: string): number => {
    const textToNumber: { [key: string]: number } = {
      'بعد الحصة الأولى': 1,
      'بعد الحصة الثانية': 2, 
      'بعد الحصة الثالثة': 3,
      'بعد الحصة الرابعة': 4,
      'بعد الحصة الخامسة': 5,
      'بعد الحصة السادسة': 6,
      'بعد الحصة السابعة': 7,
      'بعد الحصة الثامنة': 8,
      'بعد الحصة التاسعة': 9,
      'بعد الحصة العاشرة': 10
    };
    return textToNumber[text] || 1;
  };

  // دالة إنشاء جدول تلقائي حسب الإعدادات
  const generateScheduleFromSettings = (): any[] => {
    const schedule = [];
    let id = 1;

    // حساب الحد الأقصى لعدد الحصص من customDaySettings أو استخدام periodsCount
    const maxPeriods = Object.keys(customDaySettings).length > 0
      ? Math.max(...Object.values(customDaySettings).map(day => day.periodsCount || 0), 0)
      : periodsCount;

    // التحقق من وجود إعدادات صحيحة
    if (!startTime || maxPeriods === 0) {
      return [];
    }

    let currentTime = startTime;

    // الاصطفاف الصباحي (15 دقيقة)
    schedule.push({
      id: id++,
      activity: 'الاصطفاف الصباحي',
      startTime: currentTime,
      endTime: addMinutesToTime(currentTime, 15)
    });
    currentTime = addMinutesToTime(currentTime, 15);

    // إنشاء قائمة بجميع الفعاليات (حصص، فسح، صلاة) مع ترتيبها
    const activities: Array<{
      order: number;
      type: 'period' | 'break' | 'prayer';
      data: any;
    }> = [];

    // إضافة جميع الحصص
    for (let i = 1; i <= maxPeriods; i++) {
      activities.push({
        order: i,
        type: 'period',
        data: { periodNumber: i }
      });
    }

    // إضافة الفسح بعد الحصص المحددة
    breakAfterPeriods.forEach((breakAfter, index) => {
      const afterPeriod = getNumberFromText(breakAfter);
      if (afterPeriod > 0 && afterPeriod <= maxPeriods) {
        activities.push({
          order: afterPeriod + 0.1 + (index * 0.01), // لضمان الترتيب الصحيح بعد الحصة
          type: 'break',
          data: { breakNumber: index + 1, duration: breakDuration }
        });
      }
    });

    // إضافة أوقات الصلاة بعد الحصص المحددة
    prayerTimes.forEach((prayer) => {
      const afterPeriod = getNumberFromText(prayer.afterPeriod);
      if (afterPeriod > 0 && afterPeriod <= maxPeriods) {
        activities.push({
          order: afterPeriod + 0.2, // بعد الفسحة إن وجدت
          type: 'prayer',
          data: { prayerName: prayer.prayerName, duration: prayer.duration }
        });
      }
    });

    // ترتيب الفعاليات حسب الترتيب
    activities.sort((a, b) => a.order - b.order);

    // إضافة الفعاليات للجدول مع حساب الأوقات
    activities.forEach(activity => {
      if (activity.type === 'period') {
        const periodNumber = activity.data.periodNumber;
        schedule.push({
          id: id++,
          activity: `الحصة ${getArabicNumber(periodNumber)}`,
          startTime: currentTime,
          endTime: addMinutesToTime(currentTime, periodDuration)
        });
        currentTime = addMinutesToTime(currentTime, periodDuration);
      } else if (activity.type === 'break') {
        schedule.push({
          id: id++,
          activity: `الفسحة ${getArabicNumber(activity.data.breakNumber)}`,
          startTime: currentTime,
          endTime: addMinutesToTime(currentTime, activity.data.duration)
        });
        currentTime = addMinutesToTime(currentTime, activity.data.duration);
      } else if (activity.type === 'prayer') {
        schedule.push({
          id: id++,
          activity: `صلاة ${activity.data.prayerName}`,
          startTime: currentTime,
          endTime: addMinutesToTime(currentTime, activity.data.duration)
        });
        currentTime = addMinutesToTime(currentTime, activity.data.duration);
      }
    });

    return schedule;
  };

  // دالة تحويل الأرقام إلى العربية
  const getArabicNumber = (num: number): string => {
    const arabicNumbers = [
      'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 
      'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة'
    ];
    return arabicNumbers[num - 1] || num.toString();
  };

  // دوال إدارة أوقات الصلاة المتعددة
  const addPrayerTime = () => {
    const newId = prayerTimes.length > 0 ? Math.max(...prayerTimes.map(p => p.id)) + 1 : 1;
    setPrayerTimes([...prayerTimes, { 
      id: newId, 
      prayerName: 'العصر', 
      afterPeriod: 'بعد الحصة السادسة', 
      duration: 25 
    }]);
  };

  const deletePrayerTime = (id: number) => {
    if (prayerTimes.length > 1) {
      setPrayerTimes(prayerTimes.filter(p => p.id !== id));
    }
  };

  const updatePrayerTime = (id: number, field: 'prayerName' | 'afterPeriod' | 'duration', value: string | number) => {
    setPrayerTimes(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // تحميل البيانات المحفوظة عند تحميل الصفحة
  React.useEffect(() => {
    const savedData = localStorage.getItem('timingSettings');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.customDaySettings) {
          setCustomDaySettings(parsed.customDaySettings);
        }
        if (parsed.schoolTimings) {
          setSchoolTimings(parsed.schoolTimings);
        }
        if (parsed.selectedSchoolForTiming) {
          setSelectedSchoolForTiming(parsed.selectedSchoolForTiming);
        }
        if (parsed.workDays) {
          setWorkDays(parsed.workDays);
        }
      } catch (error) {
        console.error('Error loading timing settings:', error);
      }
    }
  }, []);

  // تهيئة التوقيتات للمدارس عند تحميل بيانات المدارس
  React.useEffect(() => {
    if (schoolData?.schools && schoolData.schools.length > 1) {
      // التحقق من وجود مدارس لم يتم إنشاء توقيت لها
      const existingSchoolNames = Object.values(schoolTimings).map(t => t.schoolName);
      const newSchools = schoolData.schools.filter(school => 
        !existingSchoolNames.includes(school.name)
      );

      if (newSchools.length > 0) {
        // إنشاء توقيتات للمدارس الجديدة
        const updatedTimings = { ...schoolTimings };
        let startIndex = Object.keys(updatedTimings).length;
        
        newSchools.forEach((school, index) => {
          const newIndex = startIndex + index;
          updatedTimings[newIndex] = {
            schoolName: school.name,
            stage: school.stage,
            sectionType: school.sectionType,
            summerSchedule: [{
              id: 1, activity: 'الاصطفاف الصباحي', startTime: '07:15', endTime: '07:30'
            }, {
              id: 2, activity: 'الحصة الأولى', startTime: '07:30', endTime: '08:15'
            }, {
              id: 3, activity: 'الحصة الثانية', startTime: '08:15', endTime: '09:00'
            }, {
              id: 4, activity: 'الفسحة', startTime: '09:00', endTime: '09:20'
            }, {
              id: 5, activity: 'الحصة الثالثة', startTime: '09:20', endTime: '10:05'
            }, {
              id: 6, activity: 'الحصة الرابعة', startTime: '10:05', endTime: '10:50'
            }, {
              id: 7, activity: 'الحصة الخامسة', startTime: '10:50', endTime: '11:35'
            }, {
              id: 8, activity: 'الحصة السادسة', startTime: '11:35', endTime: '12:20'
            }, {
              id: 9, activity: 'صلاة الظهر', startTime: '12:20', endTime: '12:35'
            }, {
              id: 10, activity: 'الحصة السابعة', startTime: '12:35', endTime: '13:20'
            }],
            winterSchedule: [{
              id: 1, activity: 'الاصطفاف الصباحي', startTime: '07:15', endTime: '07:30'
            }, {
              id: 2, activity: 'الحصة الأولى', startTime: '07:30', endTime: '08:15'
            }, {
              id: 3, activity: 'الحصة الثانية', startTime: '08:15', endTime: '09:00'
            }, {
              id: 4, activity: 'الفسحة', startTime: '09:00', endTime: '09:20'
            }, {
              id: 5, activity: 'الحصة الثالثة', startTime: '09:20', endTime: '10:05'
            }, {
              id: 6, activity: 'الحصة الرابعة', startTime: '10:05', endTime: '10:50'
            }, {
              id: 7, activity: 'الحصة الخامسة', startTime: '10:50', endTime: '11:35'
            }, {
              id: 8, activity: 'الحصة السادسة', startTime: '11:35', endTime: '12:20'
            }, {
              id: 9, activity: 'صلاة الظهر', startTime: '12:20', endTime: '12:35'
            }, {
              id: 10, activity: 'الحصة السابعة', startTime: '12:35', endTime: '13:20'
            }],
            ramadanSchedule: [{
              id: 1, activity: 'الاصطفاف الصباحي', startTime: '09:00', endTime: '09:15'
            }, {
              id: 2, activity: 'الحصة الأولى', startTime: '09:15', endTime: '09:45'
            }, {
              id: 3, activity: 'الحصة الثانية', startTime: '09:45', endTime: '10:15'
            }, {
              id: 4, activity: 'الحصة الثالثة', startTime: '10:15', endTime: '10:45'
            }, {
              id: 5, activity: 'الحصة الرابعة', startTime: '10:45', endTime: '11:15'
            }, {
              id: 6, activity: 'الحصة الخامسة', startTime: '11:15', endTime: '11:45'
            }, {
              id: 7, activity: 'الحصة السادسة', startTime: '11:45', endTime: '12:15'
            }, {
              id: 8, activity: 'الحصة السابعة', startTime: '12:15', endTime: '12:45'
            }],
            summerNotes: '',
            winterNotes: '',
            ramadanNotes: '',
            showSummerNotes: true,
            showWinterNotes: true,
            showRamadanNotes: true,
            workDays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
            startTime: '07:15',
            periodDuration: 45,
            breakCount: 1,
            breakAfterPeriods: ['بعد الحصة الثانية'],
            breakDuration: 20,
            prayerTimes: [{
              id: 1,
              prayerName: 'الظهر',
              afterPeriod: 'بعد الحصة السادسة',
              duration: 15
            }],
            customDaySettings: {
              'الأحد': { periodsCount: 7, startTime: '07:15' },
              'الاثنين': { periodsCount: 7, startTime: '07:15' },
              'الثلاثاء': { periodsCount: 7, startTime: '07:15' },
              'الأربعاء': { periodsCount: 7, startTime: '07:15' },
              'الخميس': { periodsCount: 6, startTime: '07:15' },
              'الجمعة': { periodsCount: 0, startTime: '00:00' },
              'السبت': { periodsCount: 0, startTime: '00:00' },
            }
          };
        });
        
        setSchoolTimings(updatedTimings);
        
        // حفظ البيانات المحدثة
        const settings = {
          schoolTimings: updatedTimings
        };
        localStorage.setItem('timingSettings', JSON.stringify(settings));
      }
    }
  }, [schoolData?.schools]);

  // تحديث التوقيتات القديمة بالمراحل والأقسام
  React.useEffect(() => {
    if (schoolData?.schools && schoolData.schools.length > 0 && Object.keys(schoolTimings).length > 0) {
      let needsUpdate = false;
      const updatedTimings = { ...schoolTimings };
      
      Object.entries(updatedTimings).forEach(([key, timing]) => {
        // البحث عن المدرسة المطابقة في بيانات المدارس
        const matchingSchool = schoolData.schools.find(s => s.name === timing.schoolName);
        
        if (matchingSchool && (!timing.stage || !timing.sectionType)) {
          needsUpdate = true;
          updatedTimings[parseInt(key)] = {
            ...timing,
            stage: matchingSchool.stage,
            sectionType: matchingSchool.sectionType
          };
        }
      });
      
      if (needsUpdate) {
        setSchoolTimings(updatedTimings);
        // حفظ البيانات المحدثة
        const settings = {
          schoolTimings: updatedTimings
        };
        localStorage.setItem('timingSettings', JSON.stringify(settings));
      }
    }
  }, [schoolData?.schools, schoolTimings]);

  // تحديث الجداول عند تغيير الإعدادات
  React.useEffect(() => {
    // تجاهل التحديث إذا لم تكن هناك إعدادات
    if (!startTime || (!periodsCount && Object.keys(customDaySettings).length === 0)) {
      return;
    }
    
    const newSchedule = generateScheduleFromSettings();
    
    // تحديث الجدول المحدد فقط أو جميع الجداول
    if (selectedScheduleType === 'summer') {
      setSummerSchedule(newSchedule);
    } else if (selectedScheduleType === 'winter') {
      setWinterSchedule(newSchedule);
    } else if (selectedScheduleType === 'ramadan') {
      setRamadanSchedule(newSchedule);
    } else {
      // إذا لم يتم اختيار نوع، حدث جميع الجداول
      setSummerSchedule(newSchedule);
      setWinterSchedule(newSchedule);
      setRamadanSchedule(newSchedule);
    }
  }, [startTime, periodDuration, breakCount, breakAfterPeriods, breakDuration, prayerTimes, periodsCount, customDaySettings, selectedScheduleType]);

  // إضافة نشاط جديد لجدول رمضان مع إعادة حساب
  const addRamadanActivity = () => {
    const newId = ramadanSchedule.length > 0 ? Math.max(...ramadanSchedule.map(item => item.id)) + 1 : 1;
    const newSchedule = [...ramadanSchedule, { id: newId, activity: '', startTime: '', endTime: '' }];
    setRamadanSchedule(recalculateScheduleTiming(newSchedule));
  };

  // حذف نشاط من جدول رمضان مع إعادة حساب
  const deleteRamadanActivity = (id: number) => {
    const newSchedule = ramadanSchedule.filter(item => item.id !== id);
    setRamadanSchedule(recalculateScheduleTiming(newSchedule));
  };
  
  // طباعة الجدول
  // طباعة الجدول
  const printSchedule = (scheduleType: 'summer' | 'winter' | 'ramadan') => {
    let contentToPrint: HTMLDivElement | null = null;
    let title = "";
    
    // دالة ترجمة المرحلة للعربية
    const translateStage = (stage: string) => {
      const stageMap: { [key: string]: string } = {
        'primary': 'ابتدائي',
        'middle': 'متوسط',
        'secondary': 'ثانوي',
        'ابتدائي': 'ابتدائي',
        'متوسط': 'متوسط',
        'ثانوي': 'ثانوي'
      };
      return stageMap[stage.toLowerCase()] || stage;
    };
    
    // دالة ترجمة القسم للعربية
    const translateSection = (section: string) => {
      const sectionMap: { [key: string]: string } = {
        'boys': 'بنين',
        'girls': 'بنات',
        'بنين': 'بنين',
        'بنات': 'بنات'
      };
      return sectionMap[section.toLowerCase()] || section;
    };
    
    // الحصول على معلومات المدارس
    const getSchoolsInfo = () => {
      if (schoolData?.schools && schoolData.schools.length > 0) {
        // إذا كان التوقيت موحد، عرض جميع المدارس
        if (selectedSchoolForTiming === 'unified') {
          return schoolData.schools.map(school => ({
            name: school.name,
            stage: school.stage ? translateStage(school.stage) : '',
            section: school.sectionType ? translateSection(school.sectionType) : ''
          }));
        } 
        // إذا كان هناك مدرسة واحدة فقط
        else if (schoolData.schools.length === 1) {
          return [{
            name: schoolData.schools[0].name,
            stage: schoolData.schools[0].stage ? translateStage(schoolData.schools[0].stage) : '',
            section: schoolData.schools[0].sectionType ? translateSection(schoolData.schools[0].sectionType) : ''
          }];
        }
        // إذا كان هناك مدارس متعددة ولكن التوقيت غير موحد، عرض المدرسة الحالية فقط
        else {
          // البحث عن المدرسة الحالية أو عرض الأولى
          const currentSchool = schoolData.schools[0]; // يمكن تحسينه لاحقاً لتحديد المدرسة النشطة
          return [{
            name: currentSchool.name,
            stage: currentSchool.stage ? translateStage(currentSchool.stage) : '',
            section: currentSchool.sectionType ? translateSection(currentSchool.sectionType) : ''
          }];
        }
      }
      return [{
        name: 'المدرسة',
        stage: '',
        section: ''
      }];
    };
    
    const schoolsInfo = getSchoolsInfo();
    
    if (scheduleType === 'summer') {
      contentToPrint = summerScheduleRef.current;
      title = "جدول التوقيت المدرسي - الفترة الصيفية";
    } else if (scheduleType === 'winter') {
      contentToPrint = winterScheduleRef.current;
      title = "جدول التوقيت المدرسي - الفترة الشتوية";
    } else if (scheduleType === 'ramadan') {
      contentToPrint = ramadanScheduleRef.current;
      title = "جدول التوقيت المدرسي - شهر رمضان";
    }
    
    if (contentToPrint) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html dir="rtl">
            <head>
              <title>${title}</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;500;600;700&display=swap');
                
                body { 
                  font-family: 'Noto Kufi Arabic', Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f8fafc;
                  color: #1e293b;
                }
                
                .print-container {
                  max-width: 1000px;
                  margin: 0 auto;
                  background-color: white;
                  border-radius: 8px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                  overflow: hidden;
                }
                
                .print-header {
                  padding: 12px 20px;
                  background: ${
                    scheduleType === 'summer' 
                      ? 'linear-gradient(to right, #fef3c7, #fffbeb)' 
                      : scheduleType === 'winter' 
                        ? 'linear-gradient(to right, #dbeafe, #eff6ff)' 
                        : 'linear-gradient(to right, #f3e8ff, #f5f3ff)'
                  };
                  border-bottom: 2px solid ${
                    scheduleType === 'summer' 
                      ? '#fcd34d' 
                      : scheduleType === 'winter' 
                        ? '#93c5fd' 
                        : '#d8b4fe'
                  };
                }
                
                .header-content {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  gap: 20px;
                }
                
                .print-header h1 {
                  margin: 0;
                  color: ${
                    scheduleType === 'summer' 
                      ? '#92400e' 
                      : scheduleType === 'winter' 
                        ? '#1e40af' 
                        : '#6d28d9'
                  };
                  font-size: 18px;
                  font-weight: 700;
                  flex-shrink: 0;
                }
                
                .schools-info {
                  display: flex;
                  justify-content: flex-end;
                  flex-wrap: wrap;
                  gap: 8px;
                  flex: 1;
                }
                
                .school-item {
                  padding: 4px 10px;
                  background: white;
                  border-radius: 4px;
                  border-right: 2px solid ${
                    scheduleType === 'summer' 
                      ? '#f59e0b' 
                      : scheduleType === 'winter' 
                        ? '#3b82f6' 
                        : '#a855f7'
                  };
                  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                }
                
                .school-name {
                  font-size: 13px;
                  font-weight: 600;
                  color: #1e293b;
                }
                
                .school-details {
                  font-size: 11px;
                  color: #64748b;
                }
                
                .print-body {
                  padding: 20px;
                }
                
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 20px 0;
                  border-radius: 6px;
                  overflow: hidden;
                }
                
                th, td { 
                  border: 1px solid ${
                    scheduleType === 'summer' 
                      ? '#fcd34d' 
                      : scheduleType === 'winter' 
                        ? '#93c5fd' 
                        : '#d8b4fe'
                  }; 
                  padding: 10px 15px; 
                  text-align: right; 
                }
                
                th { 
                  background-color: ${
                    scheduleType === 'summer' 
                      ? '#fef3c7' 
                      : scheduleType === 'winter' 
                        ? '#dbeafe' 
                        : '#f3e8ff'
                  }; 
                  color: ${
                    scheduleType === 'summer' 
                      ? '#92400e' 
                      : scheduleType === 'winter' 
                        ? '#1e40af' 
                        : '#6d28d9'
                  };
                  font-weight: 600;
                }
                
                td {
                  background-color: white;
                }
                
                .print-footer {
                  text-align: center;
                  font-size: 12px;
                  color: #64748b;
                  margin-top: 30px;
                  padding-top: 15px;
                  border-top: 1px solid #e2e8f0;
                }
                
                /* إخفاء عمود الإجراءات في الطباعة */
                .actions-column {
                  display: none !important;
                }
                
                @media print {
                  body {
                    background-color: white;
                    padding: 0;
                  }
                  
                  .print-container {
                    box-shadow: none;
                    max-width: 100%;
                  }
                  
                  .actions-column {
                    display: none !important;
                  }
                  
                  @page {
                    size: A4;
                    margin: 1cm;
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="print-header">
                  <div class="header-content">
                    <h1>${title}</h1>
                    <div class="schools-info">
                      ${schoolsInfo.map(school => `
                        <div class="school-item">
                          <span class="school-name">${school.name}</span>
                          ${school.stage || school.section ? `<span class="school-details">(${school.stage}${school.stage && school.section ? ' - ' : ''}${school.section})</span>` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
                <div class="print-body">
              ${contentToPrint.innerHTML}
                </div>
                <div class="print-footer">
                  <p>تم إنشاء هذا الجدول بواسطة نظام متابعة - ${new Date().toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                  }, 500);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        toast({
          title: "خطأ في الطباعة",
          description: "يرجى السماح بفتح النوافذ المنبثقة لاستخدام ميزة الطباعة",
          variant: "destructive",
        });
      }
    }
  };

  // حفظ البيانات
  const handleSave = () => {
    // التحقق من إعدادات المدارس المشتركة
    if (isMultiStageSchool && schoolStages.length > 1) {
      // التحقق من وجود توقيت لجميع المدارس
      const missingSchools = schoolStages.filter(stage => !selectedSchoolForTiming || selectedSchoolForTiming !== stage);
      
      if (missingSchools.length > 0 && !selectedSchoolForTiming) {
        // عرض تنبيه للمستخدم
        setShowUnifiedTimingAlert(true);
        toast({
          title: "تنبيه: إعدادات المدارس المشتركة",
          description: "يجب تحديد التوقيت لجميع المدارس أو اختيار توقيت موحد",
          variant: "destructive",
        });
        return;
      }
    }
    
    // حفظ الإعدادات المدخلة
    const settings = {
      workDays,
      periodsCount,
      startTime,
      periodDuration,
      breakCount,
      breakAfterPeriods,
      breakDuration,
      prayerTimes,
      isCustomPeriods,
      customDaySettings,
      selectedScheduleType,
      // إعدادات العرض للجداول المدرسية
      showBreaksInClassSchedule,
      showPrayersInClassSchedule,
      schoolTimings,
      selectedSchoolForTiming
    };
    
    setSavedSettings(settings);
    
    // حفظ في localStorage
    localStorage.setItem('timingSettings', JSON.stringify(settings));
    
    // إعادة إنشاء الجداول بناءً على الإعدادات الجديدة
    const newSchedule = generateScheduleFromSettings();
    if (selectedScheduleType === 'summer') {
      setSummerSchedule(newSchedule);
    } else if (selectedScheduleType === 'winter') {
      setWinterSchedule(newSchedule);
    } else if (selectedScheduleType === 'ramadan') {
      setRamadanSchedule(newSchedule);
    }
    
    // إظهار الإشعار الاحترافي
    setShowSaveNotification(true);
    setTimeout(() => {
      setShowSaveNotification(false);
    }, 3000);

    // التحقق من وجود مدارس متعددة وعرض نافذة إضافة توقيت آخر
    setTimeout(() => {
      checkForMultipleSchools();
    }, 1000);
  };

  // دالة حذف جميع الإعدادات وإعادتها للوضع الافتراضي
  const handleDeleteSettings = () => {
    // إعادة تعيين جميع الإعدادات للقيم الفارغة
    setWorkDays([]);
    setPeriodsCount(0);
    setStartTime('');
    setPeriodDuration(0);
    setBreakCount(0);
    setBreakAfterPeriods([]);
    setBreakDuration(0);
    setPrayerTimes([]);
    setSelectedSchoolForTiming(null);
    setCustomDaySettings({
      'الأحد': { periodsCount: 7, startTime: '07:15' },
      'الاثنين': { periodsCount: 7, startTime: '07:15' },
      'الثلاثاء': { periodsCount: 7, startTime: '07:15' },
      'الأربعاء': { periodsCount: 7, startTime: '07:15' },
      'الخميس': { periodsCount: 6, startTime: '07:15' },
      'الجمعة': { periodsCount: 0, startTime: '00:00' },
      'السبت': { periodsCount: 0, startTime: '00:00' },
    });
    
    // إعادة تعيين جداول التوقيت
    setSummerSchedule([]);
    setWinterSchedule([]);
    setRamadanSchedule([]);
    
    // إعادة تعيين الملاحظات
    setSummerNotes('');
    setWinterNotes('');
    setRamadanNotes('');
    setShowSummerNotes(false);
    setShowWinterNotes(false);
    setShowRamadanNotes(false);
    
    // إعادة تعيين توقيتات المدارس
    setSchoolTimings({});
    
    // حذف من localStorage
    localStorage.removeItem('timingSettings');
    localStorage.removeItem('workDaysSettings');
    localStorage.removeItem('summerSchedule');
    localStorage.removeItem('winterSchedule');
    localStorage.removeItem('ramadanSchedule');
    localStorage.removeItem('schoolTimings');
    
    // إغلاق الحوار
    setShowDeleteConfirmDialog(false);
    
    // إظهار إشعار الحذف
    setShowDeleteNotification(true);
    setTimeout(() => {
      setShowDeleteNotification(false);
    }, 3000);
  };

  // دالة للتحقق من وجود مدارس متعددة
  const checkForMultipleSchools = () => {
    if (schoolData?.schools && schoolData.schools.length > 1) {
      const currentSchools = Object.keys(schoolTimings);
      const unprocessedSchools = schoolData.schools.filter(school => 
        !currentSchools.some(timingKey => 
          schoolTimings[parseInt(timingKey)]?.schoolName === school.name
        )
      );

      if (unprocessedSchools.length > 0) {
        setAvailableSchools(unprocessedSchools.map(school => school.name));
        setShowAddSchoolDialog(true);
      }
    }
  };

  // دالة لحفظ التوقيت الحالي في النظام الجديد
  const saveCurrentTimingForSchool = (schoolName: string) => {
    const newIndex = Object.keys(schoolTimings).length;
    setSchoolTimings(prev => ({
      ...prev,
      [newIndex]: {
        schoolName,
        summerSchedule: [...summerSchedule],
        winterSchedule: [...winterSchedule],
        ramadanSchedule: [...ramadanSchedule],
        summerNotes,
        winterNotes,
        ramadanNotes,
        showSummerNotes,
        showWinterNotes,
        showRamadanNotes,
        workDays: [...workDays],
        startTime,
        periodDuration,
        breakCount,
        breakAfterPeriods: [...breakAfterPeriods],
        breakDuration,
        prayerTimes: [...prayerTimes],
        customDaySettings: {...customDaySettings}
      }
    }));

    if (Object.keys(schoolTimings).length === 0) {
      setCurrentSchoolIndex(newIndex);
    }
  };

  // دالة لتحديل التوقيت لمدرسة معينة
  const switchToSchool = (schoolIndex: number) => {
    if (schoolTimings[schoolIndex]) {
      const timing = schoolTimings[schoolIndex];
      setSummerSchedule([...timing.summerSchedule]);
      setWinterSchedule([...timing.winterSchedule]);
      setRamadanSchedule([...timing.ramadanSchedule]);
      setSummerNotes(timing.summerNotes);
      setWinterNotes(timing.winterNotes);
      if (timing.customDaySettings) {
        setCustomDaySettings(prev => ({
          ...prev,
          ...timing.customDaySettings
        }));
      }
      setRamadanNotes(timing.ramadanNotes);
      setShowSummerNotes(timing.showSummerNotes);
      setShowWinterNotes(timing.showWinterNotes);
      setShowRamadanNotes(timing.showRamadanNotes);
      setWorkDays([...timing.workDays]);
      setStartTime(timing.startTime);
      setPeriodDuration(timing.periodDuration);
      setBreakCount(timing.breakCount);
      setBreakAfterPeriods([...timing.breakAfterPeriods]);
      setBreakDuration(timing.breakDuration);
      setPrayerTimes([...timing.prayerTimes]);
      setCurrentSchoolIndex(schoolIndex);
    }
  };

  // دالة لإضافة توقيت مدرسة جديدة
  const addNewSchoolTiming = (schoolName: string) => {
    saveCurrentTimingForSchool(getCurrentSchoolName());
    
    // إعادة تعيين الإعدادات للمدرسة الجديدة
    setSummerSchedule([]);
    setWinterSchedule([]);
    setRamadanSchedule([]);
    setSummerNotes('');
    setWinterNotes('');
    setRamadanNotes('');
    setShowSummerNotes(true);
    setShowWinterNotes(true);
    setShowRamadanNotes(true);
    
    setShowAddSchoolDialog(false);
    
    toast({
      title: "تم إنشاء توقيت جديد",
      description: `تم إنشاء توقيت جديد لـ ${schoolName}`,
      className: "bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5]",
    });
  };

  // دالة للحصول على اسم المدرسة الحالية
  const getCurrentSchoolName = () => {
    if (schoolTimings[currentSchoolIndex]) {
      return schoolTimings[currentSchoolIndex].schoolName;
    }
    
    if (schoolData?.schools && schoolData.schools.length > 0) {
      return schoolData.schools[0].name;
    }
    
    return 'المدرسة الأساسية';
  };

  // دالة لدمج التوقيتات في توقيت موحد
  const unifyTimings = () => {
    setSelectedSchoolForTiming('موحد');
    setShowUnifiedTimingAlert(false);
    toast({
      title: "تم توحيد التوقيت",
      description: "تم تطبيق توقيت موحد لجميع المدارس المشتركة",
      className: "bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5]",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-1 pb-6 px-6 font-['Noto_Kufi_Arabic']" dir="rtl">
      
      {/* إشعار الحفظ الاحترافي */}
      {showSaveNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideInDown">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-green-500 px-6 py-4 flex items-center gap-4 min-w-[400px]">
            <div className="bg-green-100 rounded-full p-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">تم الحفظ بنجاح!</h3>
              <p className="text-sm text-gray-600">تم حفظ جميع إعدادات التوقيت والفسح والصلاة</p>
            </div>
            <button 
              onClick={() => setShowSaveNotification(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* إشعار الحذف الاحترافي */}
      {showDeleteNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideInDown">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-red-500 px-6 py-4 flex items-center gap-4 min-w-[400px]">
            <div className="bg-red-100 rounded-full p-2">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">تم الحذف بنجاح!</h3>
              <p className="text-sm text-gray-600">تم حذف جميع الإعدادات وإعادتها للوضع الابتدائي</p>
            </div>
            <button 
              onClick={() => setShowDeleteNotification(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* إشعار تفعيل التوقيت الموحد الاحترافي */}
      {showUnifiedTimingNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] animate-slideInDown">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-lg border border-green-300 px-5 py-3 flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-green-800">
              تم تفعيل التوقيت الموحد بنجاح
            </p>
            <button 
              onClick={() => setShowUnifiedTimingNotification(false)}
              className="text-green-400 hover:text-green-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* رأس الصفحة */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة توقيت المدارس</h1>
          </div>
        </div>
        
        {/* شريط التنقل بين المدارس المختلفة */}
        {Object.keys(schoolTimings).length > 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-full">
                      <School className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-indigo-900 text-lg">اختر المدرسة</h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        حدد المدرسة لإدارة توقيتها
                      </p>
                    </div>
                  </div>
                  {Object.keys(schoolTimings).length > 1 && (
                    <div className="bg-indigo-50 px-4 py-2 rounded-full">
                      <span className="text-sm font-medium text-indigo-700">
                        {Object.keys(schoolTimings).length} مدارس
                      </span>
                    </div>
                  )}
                </div>
                
                {/* أزرار المدارس */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(schoolTimings).map(([index, timing]) => {
                    const isActive = parseInt(index) === currentSchoolIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => switchToSchool(parseInt(index))}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-right ${
                          isActive
                            ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                            isActive ? 'bg-indigo-500' : 'bg-gray-400'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm truncate ${
                              isActive ? 'text-indigo-700' : 'text-gray-700'
                            }`}>
                              {timing.schoolName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {timing.stage && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {timing.stage === 'primary' ? 'ابتدائي' : 
                                   timing.stage === 'middle' ? 'متوسط' : 
                                   timing.stage === 'secondary' ? 'ثانوي' : 
                                   timing.stage === 'kindergarten' ? 'رياض أطفال' : timing.stage}
                                </span>
                              )}
                              {timing.sectionType && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  isActive ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {timing.sectionType}
                                </span>
                              )}
                            </div>
                            {isActive && (
                              <p className="text-[10px] text-indigo-600 mt-1.5">النشطة حالياً</p>
                            )}
                          </div>
                          {isActive && (
                            <CheckCircle className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* بطاقات التوقيت */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* بطاقة إعدادات التوقيت */}
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 md:col-span-3">
            <CardContent className="p-6">
              <div className="space-y-8">
                
                {/* أيام العمل */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-md font-semibold mb-4 text-[#4f46e5]">أيام العمل الدراسية</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {allDays.map(day => (
                      <div key={day} className="relative">
                        <button
                          onClick={() => handleWorkDayToggle(day)}
                          className={`w-full py-2 px-3 rounded-md transition-colors text-center border-2 ${
                            workDays.includes(day)
                              ? 'bg-[#4f46e5]/10 text-[#4f46e5] border-[#4f46e5]'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                        >
                          <div className="text-sm font-medium">{day}</div>
                        </button>
                        {workDays.includes(day) && (
                          <div className="absolute -top-2 -left-2">
                            <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* بطاقة عدد الحصص اليومية */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-md font-semibold mb-4 text-[#4f46e5]">عدد الحصص اليومية</h3>
                  
                  {/* جدول تحديد عدد الحصص */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #818cf8 0%, #a5b4fc 100%)' }}>
                          <th className="border border-gray-300 p-2 text-center font-bold text-white text-sm">
                            اليوم
                          </th>
                          {Array.from({ length: 8 }, (_, i) => (
                            <th key={i + 1} className="border border-gray-300 p-1.5 text-center font-medium text-white text-xs">
                              {i + 1}
                            </th>
                          ))}
                          <th className="border border-gray-300 p-4 text-center font-bold text-white">
                            المجموع
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {workDays.map((day) => (
                          <tr key={day} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2 text-center font-bold bg-gray-50 text-gray-700 text-xs">
                              {day}
                            </td>
                            {Array.from({ length: 8 }, (_, periodIndex) => {
                              const daySettings = customDaySettings[day as keyof typeof customDaySettings];
                              const periodsCount = daySettings?.periodsCount || 7;
                              const isActive = periodIndex < periodsCount;
                              
                              return (
                                <td key={periodIndex + 1} className="border border-gray-300 p-1 text-center">
                                  <div 
                                    className={`w-6 h-6 mx-auto rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                      isActive 
                                        ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-600 shadow-lg shadow-green-500/30 scale-105' 
                                        : 'bg-white border-gray-300 hover:bg-green-50 hover:border-green-400 hover:scale-105'
                                    }`}
                                    onClick={() => {
                                      const newCount = isActive ? periodIndex : periodIndex + 1;
                                      handleCustomDaySettingChange(day, 'periodsCount', newCount);
                                    }}
                                    title={isActive ? 'حصة نشطة - اضغط لإلغاء' : 'حصة غير نشطة - اضغط للتفعيل'}
                                  >
                                    {isActive && (
                                      <Check className="w-3.5 h-3.5 text-white drop-shadow-md" strokeWidth={3.5} />
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                            <td className="border border-gray-300 p-2 text-center">
                              <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">
                                {(() => {
                                  const daySettings = customDaySettings[day as keyof typeof customDaySettings];
                                  const count = daySettings?.periodsCount || 7;
                                  if (count === 0) return '0 حصص';
                                  if (count === 1) return 'حصة واحدة';
                                  if (count === 2) return 'حصتان';
                                  if (count >= 3 && count <= 10) return `${count} حصص`;
                                  return `${count} حصة`;
                                })()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* إجمالي الحصص */}
                  <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#6366f1' + '15', border: '1px solid #6366f1' + '40' }}>
                    <div className="text-center arabic-text">
                      <span className="text-base text-gray-700">إجمالي الحصص الأسبوعية: </span>
                      <strong className="text-lg font-bold" style={{ color: '#6366f1' }}>
                        {(() => {
                          const total = workDays.reduce((sum, day) => {
                            const daySettings = customDaySettings[day as keyof typeof customDaySettings];
                            return sum + (daySettings?.periodsCount || 7);
                          }, 0);
                          if (total === 0) return '0 حصص';
                          if (total === 1) return 'حصة واحدة';
                          if (total === 2) return 'حصتان';
                          if (total >= 3 && total <= 10) return `${total} حصص`;
                          return `${total} حصة`;
                        })()}
                      </strong>
                    </div>
                  </div>

                  {/* خيار التوقيت الموحد للمدارس المشتركة */}
                  {Object.keys(schoolTimings).length > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                            <School className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-blue-900 text-base flex items-center gap-2">
                              توقيت موحد للمدارس المشتركة
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold">
                                متقدم
                              </span>
                            </h4>
                            <p className="text-sm text-blue-700 mt-1.5 font-medium">
                              تطبيق نفس عدد الحصص على جميع المدارس
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <p className="text-xs text-gray-600 mb-1">الحالة</p>
                            <Badge variant={selectedSchoolForTiming === 'unified' ? 'default' : 'outline'} className="font-semibold">
                              {selectedSchoolForTiming === 'unified' ? 'مُفعّل' : 'غير مُفعّل'}
                            </Badge>
                          </div>
                          <Switch
                            checked={selectedSchoolForTiming === 'unified'}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSchoolForTiming('unified');
                                // تطبيق الإعدادات الحالية على جميع المدارس
                                const currentSettings = {
                                  workDays: [...workDays],
                                  customDaySettings: {...customDaySettings},
                                  startTime,
                                  periodDuration,
                                  breakCount,
                                  breakAfterPeriods: [...breakAfterPeriods],
                                  breakDuration,
                                  prayerTimes: [...prayerTimes]
                                };
                                Object.keys(schoolTimings).forEach(key => {
                                  setSchoolTimings(prev => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[Number(key)],
                                      workDays: currentSettings.workDays,
                                      customDaySettings: currentSettings.customDaySettings,
                                      startTime: currentSettings.startTime,
                                      periodDuration: currentSettings.periodDuration,
                                      breakCount: currentSettings.breakCount,
                                      breakAfterPeriods: currentSettings.breakAfterPeriods,
                                      breakDuration: currentSettings.breakDuration,
                                      prayerTimes: currentSettings.prayerTimes
                                    }
                                  }));
                                });
                                // إظهار إشعار احترافي
                                setShowUnifiedTimingNotification(true);
                                setTimeout(() => setShowUnifiedTimingNotification(false), 4000);
                              } else {
                                setSelectedSchoolForTiming(null);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </CardContent>
          </Card>

          {/* بطاقة إعدادات التوقيت الزمني - منفصلة */}
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 md:col-span-3">
            <CardContent className="p-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-5 text-[#4f46e5] flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    إعدادات التوقيت الزمني
                  </h3>
                    <div className="space-y-5">
                      {/* اختيار نوع التوقيت */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4">
                          <button
                            onClick={() => setSelectedScheduleType('summer')}
                            className={`p-4 rounded-lg transition-all ${
                              selectedScheduleType === 'summer'
                                ? 'bg-amber-100 text-amber-700 shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <Sun className="h-6 w-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">التوقيت الصيفي</div>
                          </button>
                          <button
                            onClick={() => setSelectedScheduleType('winter')}
                            className={`p-4 rounded-lg transition-all ${
                              selectedScheduleType === 'winter'
                                ? 'bg-indigo-100 text-indigo-700 shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <Snowflake className="h-6 w-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">التوقيت الشتوي</div>
                          </button>
                          <button
                            onClick={() => setSelectedScheduleType('ramadan')}
                            className={`p-4 rounded-lg transition-all ${
                              selectedScheduleType === 'ramadan'
                                ? 'bg-purple-100 text-purple-700 shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <Moon className="h-6 w-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">توقيت رمضان</div>
                          </button>
                        </div>
                      </div>

                      {/* الحقول الأساسية في شبكة لاستغلال المساحة */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[#4f46e5] font-medium mb-1 text-right">وقت بداية اليوم الدراسي:</Label>
                          <div className="text-xs text-gray-600 mb-2 min-h-[16px]">
                            ملاحظة: الوقت المدخل هو بداية الاصطفاف الصباحي (15 دقيقة)
                          </div>
                          <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="text-center border-[#4f46e5]/30 w-full h-10 shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[#4f46e5] font-medium mb-1 text-right">مدة الحصة (دقائق):</Label>
                          <div className="text-xs text-gray-600 mb-2 min-h-[16px] opacity-0">
                            {/* مساحة فارغة لتوحيد الارتفاع مع النص التوضيحي للحقل الأول */}
                            .
                          </div>
                          <Input
                            type="number"
                            min="30"
                            max="60"
                            step="5"
                            value={periodDuration}
                            onChange={(e) => setPeriodDuration(Number(e.target.value))}
                            className="text-center border-[#4f46e5]/30 w-full h-10 shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                </div>
            </CardContent>
          </Card>
          
          {/* بطاقة إعدادات الفسح المستقلة */}
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 md:col-span-3">
            <CardContent className="p-8 pt-10">
              <div className="bg-white">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-lg font-semibold text-[#4f46e5]">إعدادات الفسح</h4>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Label className="text-xs text-[#4f46e5] font-medium">إظهار في الجداول المدرسية:</Label>
                    <Switch
                      checked={showBreaksInClassSchedule}
                      onCheckedChange={setShowBreaksInClassSchedule}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {/* عدد الفسح */}
                  <div className="space-y-2">
                    <Label className="text-[#4f46e5] font-medium mb-1 text-right">عدد الفسح:</Label>
                    <Select
                      value={breakCount.toString()}
                      onValueChange={(value) => {
                        const count = Number(value);
                        setBreakCount(count);
                        if (count === 0) {
                          setBreakAfterPeriods([]);
                        } else if (count === 1) {
                          setBreakAfterPeriods(['بعد الحصة الثانية']);
                        } else if (count === 2) {
                          setBreakAfterPeriods(['بعد الحصة الثانية', 'بعد الحصة الرابعة']);
                        } else if (count === 3) {
                          setBreakAfterPeriods(['بعد الحصة الثانية', 'بعد الحصة الرابعة', 'بعد الحصة السادسة']);
                        } else if (count === 4) {
                          setBreakAfterPeriods(['بعد الحصة الثانية', 'بعد الحصة الرابعة', 'بعد الحصة السادسة', 'بعد الحصة الثامنة']);
                        }
                      }}
                    >
                      <SelectTrigger className="border-[#4f46e5]/30 h-10 max-w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedScheduleType === 'ramadan' && (
                          <SelectItem value="0">بدون فسح</SelectItem>
                        )}
                        <SelectItem value="1">فسحة واحدة</SelectItem>
                        <SelectItem value="2">فسحتان</SelectItem>
                        <SelectItem value="3">3 فسح</SelectItem>
                        <SelectItem value="4">4 فسح</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedScheduleType === 'ramadan' && (
                      <div className="text-xs text-gray-600">
                        يمكن اختيار صفر فسح في رمضان
                      </div>
                    )}
                  </div>
                  
                  {/* إعدادات الفسح - صف لكل فسحة */}
                  {breakCount > 0 && (
                    <div className="space-y-3">
                      {Array.from({ length: breakCount }, (_, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-medium text-[#4f46e5] mb-3">الفسحة {index + 1}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[#4f46e5] font-medium mb-1 text-right text-sm">موعد الفسحة:</Label>
                              <Select
                                value={breakAfterPeriods[index] || ''}
                                onValueChange={(value) => {
                                  const newBreakAfterPeriods = [...breakAfterPeriods];
                                  newBreakAfterPeriods[index] = value;
                                  setBreakAfterPeriods(newBreakAfterPeriods);
                                }}
                              >
                                <SelectTrigger className="border-[#4f46e5]/30 h-10">
                                  <SelectValue placeholder="اختر بعد الحصة" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="بعد الحصة الأولى">بعد الحصة الأولى</SelectItem>
                                  <SelectItem value="بعد الحصة الثانية">بعد الحصة الثانية</SelectItem>
                                  <SelectItem value="بعد الحصة الثالثة">بعد الحصة الثالثة</SelectItem>
                                  <SelectItem value="بعد الحصة الرابعة">بعد الحصة الرابعة</SelectItem>
                                  <SelectItem value="بعد الحصة الخامسة">بعد الحصة الخامسة</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[#4f46e5] font-medium mb-1 text-right text-sm">مدة الفسحة (دقائق):</Label>
                              <Input
                                type="number"
                                min="10"
                                max="45"
                                step="5"
                                value={breakDuration}
                                onChange={(e) => setBreakDuration(Number(e.target.value))}
                                className="text-center border-[#4f46e5]/30 w-full h-10 shadow-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* بطاقة إعدادات الصلاة المستقلة */}
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 md:col-span-3">
            <CardContent className="p-8 pt-10">
              <div className="bg-white">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <h4 className="text-lg font-semibold text-[#4f46e5]">إعدادات الصلاة</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addPrayerTime}
                      className="border-[#4f46e5]/30 text-[#4f46e5] hover:bg-[#4f46e5]/10"
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة وقت صلاة
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Label className="text-xs text-[#4f46e5] font-medium">إظهار في الجداول المدرسية:</Label>
                    <Switch
                      checked={showPrayersInClassSchedule}
                      onCheckedChange={setShowPrayersInClassSchedule}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {prayerTimes.map((prayer, index) => (
                    <div key={prayer.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-[#4f46e5]">وقت الصلاة {index + 1}</h5>
                        {prayerTimes.length > 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePrayerTime(prayer.id)}
                            className="border-red-200 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[#4f46e5] font-medium mb-1 text-right text-sm">نوع الصلاة:</Label>
                          <Select 
                            value={prayer.prayerName} 
                            onValueChange={(value) => updatePrayerTime(prayer.id, 'prayerName', value)}
                          >
                            <SelectTrigger className="border-[#4f46e5]/30">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="الظهر">الظهر</SelectItem>
                              <SelectItem value="العصر">العصر</SelectItem>
                              <SelectItem value="المغرب">المغرب</SelectItem>
                              <SelectItem value="العشاء">العشاء</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[#4f46e5] font-medium mb-1 text-right text-sm">الصلاة بعد الحصة:</Label>
                          <Select 
                            value={prayer.afterPeriod} 
                            onValueChange={(value) => updatePrayerTime(prayer.id, 'afterPeriod', value)}
                          >
                            <SelectTrigger className="border-[#4f46e5]/30">
                              <SelectValue placeholder="اختر بعد الحصة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="بعد الحصة الأولى">بعد الحصة الأولى</SelectItem>
                              <SelectItem value="بعد الحصة الثانية">بعد الحصة الثانية</SelectItem>
                              <SelectItem value="بعد الحصة الثالثة">بعد الحصة الثالثة</SelectItem>
                              <SelectItem value="بعد الحصة الرابعة">بعد الحصة الرابعة</SelectItem>
                              <SelectItem value="بعد الحصة الخامسة">بعد الحصة الخامسة</SelectItem>
                              <SelectItem value="بعد الحصة السادسة">بعد الحصة السادسة</SelectItem>
                              <SelectItem value="بعد الحصة السابعة">بعد الحصة السابعة</SelectItem>
                              <SelectItem value="بعد الحصة الثامنة">بعد الحصة الثامنة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[#4f46e5] font-medium mb-1 text-right text-sm">مدة الصلاة (دقائق):</Label>
                          <Input
                            type="number"
                            min="15"
                            max="45"
                            step="5"
                            value={prayer.duration}
                            onChange={(e) => updatePrayerTime(prayer.id, 'duration', Number(e.target.value))}
                            className="text-center border-[#4f46e5]/30 w-full h-10 shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* شريط أزرار الحفظ والحذف */}
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 md:col-span-3">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#4338ca] hover:to-[#3730a3] text-white px-10 py-3.5 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg flex items-center gap-3"
                  >
                    <Save className="h-5 w-5" />
                    حـفـظ الإعدادات
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirmDialog(true)}
                    variant="outline"
                    className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-10 py-3.5 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 rounded-lg flex items-center gap-3"
                  >
                    <Trash2 className="h-5 w-5" />
                    حـذف الإعدادات
                  </Button>
                </div>
                <p className="text-center text-sm text-gray-600 mt-4">
                  يمكنك حفظ جميع الإعدادات أو حذفها وإعادتها للوضع الافتراضي
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* حوار تأكيد حذف الإعدادات */}
          {showDeleteConfirmDialog && (
            <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-red-100 rounded-full">
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                      تأكيد حذف الإعدادات
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-base text-gray-700 leading-relaxed pt-2">
                    هل أنت متأكد من حذف جميع الإعدادات وإعادتها للوضع الافتراضي؟
                    <br/><br/>
                    <span className="font-semibold text-red-600">تحذير:</span> سيتم حذف جميع الإعدادات المحفوظة ولن تتمكن من استرجاعها.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirmDialog(false)}
                    className="px-8 py-2.5 text-base"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleDeleteSettings}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 text-base"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    تأكيد الحذف
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          
          {/* عرض بطاقة التوقيت المحددة فقط */}
          {selectedScheduleType === 'summer' && (
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 md:col-span-3">
            <CardHeader className="bg-gradient-to-l from-amber-50 to-orange-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <Sun className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-amber-700">التوقيت الصيفي</CardTitle>
                    <CardDescription className="text-amber-500">
                      جدول الحصص والأنشطة للفترة الصيفية
                    </CardDescription>
            </div>
          </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={() => setIsSummerScheduleOpen(!isSummerScheduleOpen)}
                  >
                    {isSummerScheduleOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition-colors shadow-sm relative group"
                    onClick={() => printSchedule('summer')}
                  >
                    <Printer className="h-4 w-4" />
                    <span className="absolute hidden group-hover:block -top-8 right-1/2 transform translate-x-1/2 bg-amber-100 text-amber-800 text-xs py-1 px-2 rounded shadow-sm whitespace-nowrap">
                      طباعة الجدول
                    </span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isSummerScheduleOpen && (
                <>
                  <div className="bg-amber-50 p-1 rounded-lg border border-amber-100 mb-3" ref={summerScheduleRef}>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-amber-200">
                          <TableHead className="text-amber-800 text-right">#</TableHead>
                          <TableHead className="text-amber-800 text-right">الفعالية</TableHead>
                          <TableHead className="text-amber-800 text-right">وقت البداية</TableHead>
                          <TableHead className="text-amber-800 text-right">وقت النهاية</TableHead>
                          <TableHead className="text-amber-800 text-right actions-column">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summerSchedule.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-amber-50/50">
                            <TableCell className="text-amber-700 font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <Input
                          value={item.activity}
                          onChange={(e) => handleSummerScheduleChange(item.id, 'activity', e.target.value)}
                                className="border-amber-200 text-sm"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                          type="time"
                          value={item.startTime}
                          onChange={(e) => handleSummerScheduleChange(item.id, 'startTime', e.target.value)}
                                className="border-amber-200 text-sm"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                          type="time"
                          value={item.endTime}
                          onChange={(e) => handleSummerScheduleChange(item.id, 'endTime', e.target.value)}
                                className="border-amber-200 text-sm"
                              />
                            </TableCell>
                            <TableCell className="actions-column">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => deleteSummerActivity(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* قسم الملاحظات داخل الRef للطباعة */}
                    {summerNotes && showSummerNotes && (
                      <div className="mt-4 p-3 bg-white rounded border border-amber-200" style={{pageBreakInside: 'avoid'}}>
                        <h4 className="text-sm font-semibold text-amber-700 mb-2">ملاحظات:</h4>
                        <p className="text-sm text-amber-800 leading-relaxed">{summerNotes}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                onClick={addSummerActivity}
                    className="mt-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة
                  </Button>

                  {/* قسم الملاحظات للتوقيت الصيفي */}
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-semibold text-amber-700 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        ملاحظات
                      </h4>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={showSummerNotes}
                          onCheckedChange={setShowSummerNotes}
                          className="data-[state=checked]:bg-amber-600"
                        />
                        <Label className="text-sm text-amber-600 font-medium">
                          إظهار في الطباعة
                        </Label>
                      </div>
                    </div>
                    <textarea
                      value={summerNotes}
                      onChange={(e) => setSummerNotes(e.target.value)}
                      placeholder="أضف ملاحظات حول التوقيت الصيفي (اختياري)..."
                      className="w-full p-3 border border-amber-200 rounded-md text-sm resize-none h-20 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      dir="rtl"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          )}
          
          {/* بطاقة التوقيت الشتوي */}
          {selectedScheduleType === 'winter' && (
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 md:col-span-3">
            <CardHeader className="bg-gradient-to-l from-[#6366f1]/10 to-[#6366f1]/20 border-b border-[#6366f1]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#6366f1]/20 rounded-full">
                    <Snowflake className="h-5 w-5 text-[#6366f1]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[#6366f1]">التوقيت الشتوي</CardTitle>
                    <CardDescription className="text-[#6366f1]/70">
                      جدول الحصص والأنشطة للفترة الشتوية
                    </CardDescription>
            </div>
          </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-[#6366f1]/30 text-[#6366f1] hover:bg-[#6366f1]/10"
                    onClick={() => setIsWinterScheduleOpen(!isWinterScheduleOpen)}
                  >
                    {isWinterScheduleOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-[#6366f1]/30 text-[#6366f1] hover:bg-[#6366f1]/10 hover:text-[#6366f1] transition-colors shadow-sm relative group"
                    onClick={() => printSchedule('winter')}
                  >
                    <Printer className="h-4 w-4" />
                    <span className="absolute hidden group-hover:block -top-8 right-1/2 transform translate-x-1/2 bg-[#6366f1]/10 text-[#6366f1] text-xs py-1 px-2 rounded shadow-sm whitespace-nowrap">
                      طباعة الجدول
                    </span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isWinterScheduleOpen && (
                <>
                  <div className="bg-[#6366f1]/5 p-1 rounded-lg border border-[#6366f1]/20 mb-3" ref={winterScheduleRef}>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-[#6366f1]/30">
                          <TableHead className="text-[#6366f1] text-right">#</TableHead>
                          <TableHead className="text-[#6366f1] text-right">الفعالية</TableHead>
                          <TableHead className="text-[#6366f1] text-right">وقت البداية</TableHead>
                          <TableHead className="text-[#6366f1] text-right">وقت النهاية</TableHead>
                          <TableHead className="text-[#6366f1] text-right actions-column">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {winterSchedule.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-[#6366f1]/5">
                            <TableCell className="text-[#6366f1] font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <Input
                          value={item.activity}
                          onChange={(e) => handleWinterScheduleChange(item.id, 'activity', e.target.value)}
                                className="border-[#6366f1]/30 text-sm"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                          type="time"
                          value={item.startTime}
                          onChange={(e) => handleWinterScheduleChange(item.id, 'startTime', e.target.value)}
                                className="border-[#6366f1]/30 text-sm"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                          type="time"
                          value={item.endTime}
                          onChange={(e) => handleWinterScheduleChange(item.id, 'endTime', e.target.value)}
                                className="border-[#6366f1]/30 text-sm"
                              />
                            </TableCell>
                            <TableCell className="actions-column">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => deleteWinterActivity(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* قسم الملاحظات داخل الRef للطباعة */}
                    {winterNotes && showWinterNotes && (
                      <div className="mt-4 p-3 bg-white rounded border border-[#6366f1]/30" style={{pageBreakInside: 'avoid'}}>
                        <h4 className="text-sm font-semibold text-[#6366f1] mb-2">ملاحظات:</h4>
                        <p className="text-sm text-[#6366f1]/90 leading-relaxed">{winterNotes}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addWinterActivity}
                    className="mt-2 border-[#6366f1]/30 text-[#6366f1] hover:bg-[#6366f1]/10"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة
                  </Button>

                  {/* قسم الملاحظات للتوقيت الشتوي */}
                  <div className="mt-4 p-4 bg-[#6366f1]/5 rounded-lg border border-[#6366f1]/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-semibold text-[#6366f1] flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        ملاحظات
                      </h4>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={showWinterNotes}
                          onCheckedChange={setShowWinterNotes}
                          className="data-[state=checked]:bg-[#6366f1]"
                        />
                        <Label className="text-sm text-[#6366f1] font-medium">
                          إظهار في الطباعة
                        </Label>
                      </div>
                    </div>
                    <textarea
                      value={winterNotes}
                      onChange={(e) => setWinterNotes(e.target.value)}
                      placeholder="أضف ملاحظات حول التوقيت الشتوي (اختياري)..."
                      className="w-full p-3 border border-[#6366f1]/30 rounded-md text-sm resize-none h-20 focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                      dir="rtl"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          )}
          
          {/* بطاقة توقيت رمضان */}
          {selectedScheduleType === 'ramadan' && (
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 md:col-span-3 mt-6">
            <CardHeader className="bg-gradient-to-l from-[#818cf8]/10 to-[#818cf8]/20 border-b border-[#818cf8]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#818cf8]/20 rounded-full">
                    <Moon className="h-5 w-5 text-[#818cf8]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[#818cf8]">توقيت رمضان</CardTitle>
                    <CardDescription className="text-[#818cf8]/70">
                      جدول الحصص والأنشطة خلال شهر رمضان
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-[#818cf8]/30 text-[#818cf8] hover:bg-[#818cf8]/10"
                    onClick={() => setIsRamadanScheduleOpen(!isRamadanScheduleOpen)}
                  >
                    {isRamadanScheduleOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-[#818cf8]/30 text-[#818cf8] hover:bg-[#818cf8]/10 hover:text-[#818cf8] transition-colors shadow-sm relative group"
                    onClick={() => printSchedule('ramadan')}
                  >
                    <Printer className="h-4 w-4" />
                    <span className="absolute hidden group-hover:block -top-8 right-1/2 transform translate-x-1/2 bg-[#818cf8]/10 text-[#818cf8] text-xs py-1 px-2 rounded shadow-sm whitespace-nowrap">
                      طباعة الجدول
                    </span>
                  </Button>
            </div>
          </div>
            </CardHeader>
            <CardContent className="p-4">
              {isRamadanScheduleOpen && (
                <>
                  <div className="bg-[#818cf8]/5 p-1 rounded-lg border border-[#818cf8]/20 mb-3" ref={ramadanScheduleRef}>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-[#818cf8]/30">
                          <TableHead className="text-[#818cf8] text-right">#</TableHead>
                          <TableHead className="text-[#818cf8] text-right">الفعالية</TableHead>
                          <TableHead className="text-[#818cf8] text-right">وقت البداية</TableHead>
                          <TableHead className="text-[#818cf8] text-right">وقت النهاية</TableHead>
                          <TableHead className="text-[#818cf8] text-right actions-column">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ramadanSchedule.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-[#818cf8]/5">
                            <TableCell className="text-[#818cf8] font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <Input
                                value={item.activity}
                                onChange={(e) => handleRamadanScheduleChange(item.id, 'activity', e.target.value)}
                                className="border-[#818cf8]/30 text-sm"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="time"
                                value={item.startTime}
                                onChange={(e) => handleRamadanScheduleChange(item.id, 'startTime', e.target.value)}
                                className="border-[#818cf8]/30 text-sm"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="time"
                                value={item.endTime}
                                onChange={(e) => handleRamadanScheduleChange(item.id, 'endTime', e.target.value)}
                                className="border-[#818cf8]/30 text-sm"
                              />
                            </TableCell>
                            <TableCell className="actions-column">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => deleteRamadanActivity(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* قسم الملاحظات داخل الRef للطباعة */}
                    {ramadanNotes && showRamadanNotes && (
                      <div className="mt-4 p-3 bg-white rounded border border-[#818cf8]/30" style={{pageBreakInside: 'avoid'}}>
                        <h4 className="text-sm font-semibold text-[#818cf8] mb-2">ملاحظات:</h4>
                        <p className="text-sm text-[#818cf8]/90 leading-relaxed">{ramadanNotes}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addRamadanActivity}
                    className="mt-2 border-[#818cf8]/30 text-[#818cf8] hover:bg-[#818cf8]/10"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة
                  </Button>

                  {/* قسم الملاحظات للتوقيت رمضان */}
                  <div className="mt-4 p-4 bg-[#818cf8]/5 rounded-lg border border-[#818cf8]/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-semibold text-[#818cf8] flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        ملاحظات
                      </h4>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={showRamadanNotes}
                          onCheckedChange={setShowRamadanNotes}
                          className="data-[state=checked]:bg-[#818cf8]"
                        />
                        <Label className="text-sm text-[#818cf8] font-medium">
                          إظهار في الطباعة
                        </Label>
                      </div>
                    </div>
                    <textarea
                      value={ramadanNotes}
                      onChange={(e) => setRamadanNotes(e.target.value)}
                      placeholder="أضف ملاحظات حول توقيت رمضان (اختياري)..."
                      className="w-full p-3 border border-[#818cf8]/30 rounded-md text-sm resize-none h-20 focus:ring-2 focus:ring-[#818cf8] focus:border-transparent"
                      dir="rtl"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          )}
        </div>

        {/* Dialog للتنبيه من المدارس المشتركة */}
        <Dialog open={showUnifiedTimingAlert} onOpenChange={setShowUnifiedTimingAlert}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-indigo-700">إعدادات المدارس المشتركة</DialogTitle>
              <DialogDescription className="text-gray-600">
                لديك مدارس متعددة في المبنى. يجب تحديد كيفية إدارة التوقيت:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">الخيارات المتاحة:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• إنشاء توقيت منفصل لكل مدرسة</li>
                  <li>• توحيد التوقيت لجميع المدارس</li>
                </ul>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowUnifiedTimingAlert(false)}
                className="border-gray-200 text-gray-600"
              >
                إلغاء
              </Button>
              <Button
                onClick={unifyTimings}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                توحيد التوقيت
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة إضافة توقيت لمدرسة أخرى */}
        <Dialog open={showAddSchoolDialog} onOpenChange={setShowAddSchoolDialog}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Plus className="h-5 w-5" />
                إضافة توقيت مدرسة جديدة
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-right">
                يمكنك إنشاء توقيت منفصل لمدرسة أخرى من المدارس المسجلة
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {availableSchools.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-blue-700">المدارس المتاحة</h4>
                    </div>
                    <p className="text-sm text-blue-600">
                      اختر من المدارس التالية لإنشاء توقيت منفصل لها:
                    </p>
                  </div>

                  <div className="space-y-2">
                    {availableSchools.map((schoolName, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => addNewSchoolTiming(schoolName)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{schoolName}</h4>
                              <p className="text-sm text-gray-600">انقر لإنشاء توقيت منفصل</p>
                            </div>
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">تم إنشاء توقيت لجميع المدارس</h3>
                  <p className="text-gray-500">تم إنشاء توقيت منفصل لجميع المدارس المسجلة في النظام</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddSchoolDialog(false)}
                className="border-gray-200 text-gray-600"
              >
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TimingPage;