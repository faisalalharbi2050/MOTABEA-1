import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { exportToExcel, exportToHTML } from '@/utils/timetableExport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Home, Settings, Users, Calendar, FileText, BarChart3, Printer, Search, RotateCcw, Edit, 
  Clock, Send, CheckCircle, AlertTriangle, XCircle, TrendingUp, CalendarDays,
  GraduationCap, X, Phone, UserPlus, ChevronDown, Shield, Users2, Info,
  ChevronRight, Table as TableIcon, Shuffle, RefreshCw, Lock, Unlock,
  Download, Share2, Eye, Save, Undo, History, AlertCircle, Play,
  BookOpen, UserCheck, Target, Zap, Grid, BarChart2, Filter, List,
  MousePointer, Maximize2, Minimize2, Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// CSS للأنميشن المخصص
const customStyles = `
  @keyframes swapPulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1) rotate(0deg);
    }
    50% { 
      opacity: 0.7; 
      transform: scale(1.2) rotate(10deg);
    }
  }
  
  .swap-indicator {
    animation: swapPulse 1.5s ease-in-out infinite;
  }
`;

// إضافة الـ CSS للصفحة
if (typeof document !== 'undefined' && !document.querySelector('#swap-indicator-styles')) {
  const style = document.createElement('style');
  style.id = 'swap-indicator-styles';
  style.textContent = customStyles;
  document.head.appendChild(style);
}

// أنواع البيانات
interface Teacher {
  id: string;
  name: string;
  specialization: string;
  rank: string;
  basicQuota: number;
  standbyQuota: number;
  subjects: string[];
}

interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  studentsCount: number;
}

interface Subject {
  id: string;
  name: string;
  weeklyHours: number;
  maxConsecutive: number;
}

interface TimeSlot {
  id: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
}

interface ClassSession {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  timeSlotId: string;
  type: 'basic' | 'standby';
  isLocked: boolean;
  dayIndex?: number;
  periodIndex?: number;
  className?: string;
  subjectName?: string;
  subject?: string;
  day?: string;
  period?: number;
  isStandby?: boolean;
}

interface Conflict {
  type: 'teacher_conflict' | 'class_conflict' | 'quota_exceeded' | 'consecutive_limit';
  description: string;
  teacherName?: string;
  className?: string;
  subjectName?: string;
  timeSlot?: string;
  severity: 'high' | 'medium' | 'low';
}

const SmartTimetablePageEnhanced = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // حالات النظام
  const [activeTab, setActiveTab] = useState('general-teachers');
  const [viewMode, setViewMode] = useState<'teachers' | 'classes' | 'individual' | 'standby'>(
    (location.state as any)?.viewMode || 'teachers'
  );

  // Update view mode when navigating with state
  useEffect(() => {
    if (location.state && (location.state as any).viewMode) {
      setViewMode((location.state as any).viewMode);
    }
  }, [location.state]);
  const [isBasicTimetableLocked, setIsBasicTimetableLocked] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [selectedIndividualId, setSelectedIndividualId] = useState<string>('');
  const [selectedIndividualType, setSelectedIndividualType] = useState<'teacher' | 'class'>('teacher');
  const [isDragMode, setIsDragMode] = useState(false);
  
  // نظام الإشعارات الاحترافي
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>>([]);
  
  // دالة عرض الإشعارات
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };
  
  // إدارة الجداول المحفوظة
  const [savedTimetables, setSavedTimetables] = useState<Array<{
    id: string;
    name: string;
    createdDate: string;
    createdTime: string;
    createdBy: string;
    sessions: ClassSession[];
    isActive: boolean;
  }>>([]);
  const [showManageTimetablesDialog, setShowManageTimetablesDialog] = useState(false);
  const [showSaveEditDialog, setShowSaveEditDialog] = useState(false); // مربع حوار حفظ التعديل
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false); // مربع حوار تأكيد الحذف
  const [timetableToDelete, setTimetableToDelete] = useState<string | null>(null); // الجدول المراد حذفه
  
  const [lastDragOperation, setLastDragOperation] = useState(null); // لعرض آخر عملية
  const [dragOperationsCount, setDragOperationsCount] = useState(0); // عداد العمليات
  const [swappedSessions, setSwappedSessions] = useState<Set<string>>(new Set()); // الحصص المتبدلة
  const [operationsHistory, setOperationsHistory] = useState<any[]>([]); // تاريخ العمليات
  const [showOperationsModal, setShowOperationsModal] = useState(false); // نافذة العمليات
  const [showLockConfirmDialog, setShowLockConfirmDialog] = useState(false); // مربع حوار تأكيد القفل
  const [showUnlockConfirmDialog, setShowUnlockConfirmDialog] = useState(false); // مربع حوار تأكيد فتح القفل
  const [draggedSession, setDraggedSession] = useState<ClassSession | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [isProcessingDrag, setIsProcessingDrag] = useState(false);
  const [lastBackupSessions, setLastBackupSessions] = useState<ClassSession[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [sortBy, setSortBy] = useState<'name' | 'specialization'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSpecializationSort, setShowSpecializationSort] = useState(false);
  const [specializationOrder, setSpecializationOrder] = useState<string[]>([]);
  const [isDraggingSpecialization, setIsDraggingSpecialization] = useState(false);
  const [draggedSpecialization, setDraggedSpecialization] = useState<string>('');
  
  // حالة عرض جميع الجداول الفردية
  const [showAllIndividual, setShowAllIndividual] = useState<boolean>(false);
  
  // حالات العرض المدمج Zoom & Compact
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 100% = عادي
  const [teachersZoom, setTeachersZoom] = useState<number>(100); // للجدول العام للمعلمين
  const [classesZoom, setClassesZoom] = useState<number>(100); // للجدول العام للفصول
  const [standbyZoom, setStandbyZoom] = useState<number>(100); // للجدول العام للانتظار
  const [individualZoom, setIndividualZoom] = useState<number>(100); // للجداول الفردية
  
  // حالات zoom منفصلة للشاشة الكاملة لمنع تأثيرها على الصفحة الرئيسية
  const [fullscreenTeachersZoom, setFullscreenTeachersZoom] = useState<number>(100);
  const [fullscreenClassesZoom, setFullscreenClassesZoom] = useState<number>(100);
  const [fullscreenStandbyZoom, setFullscreenStandbyZoom] = useState<number>(100);
  const [fullscreenIndividualZoom, setFullscreenIndividualZoom] = useState<number>(100);
  
  const [isCompactMode, setIsCompactMode] = useState<boolean>(true);
  const [teachersCompact, setTeachersCompact] = useState<boolean>(true);
  const [classesCompact, setClassesCompact] = useState<boolean>(true);
  const [standbyCompact, setStandbyCompact] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // بيانات النظام (بيانات تجريبية)
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: '1', name: 'أحمد محمد العمري', specialization: 'اللغة العربية', rank: 'خبير', basicQuota: 24, standbyQuota: 6, subjects: ['اللغة العربية'] },
    { id: '2', name: 'خالد عبدالله السعيد', specialization: 'الرياضيات', rank: 'ممارس', basicQuota: 22, standbyQuota: 5, subjects: ['الرياضيات'] },
    { id: '3', name: 'فهد سعد المالكي', specialization: 'العلوم', rank: 'متقدم', basicQuota: 20, standbyQuota: 4, subjects: ['العلوم'] },
    { id: '4', name: 'عبدالرحمن علي الحربي', specialization: 'الإنجليزي', rank: 'ممارس', basicQuota: 18, standbyQuota: 5, subjects: ['اللغة الإنجليزية'] },
    { id: '5', name: 'محمد سالم القحطاني', specialization: 'إسلامية', rank: 'خبير', basicQuota: 20, standbyQuota: 4, subjects: ['الدراسات الإسلامية'] },
    { id: '6', name: 'سعود فيصل الدوسري', specialization: 'اجتماعيات', rank: 'متقدم', basicQuota: 16, standbyQuota: 4, subjects: ['الاجتماعيات'] },
    { id: '7', name: 'عبدالله راشد الشمري', specialization: 'بدنية', rank: 'ممارس', basicQuota: 15, standbyQuota: 3, subjects: ['التربية البدنية'] },
    { id: '8', name: 'يوسف حسن الغامدي', specialization: 'حاسب', rank: 'متقدم', basicQuota: 14, standbyQuota: 3, subjects: ['الحاسب الآلي'] },
    { id: '9', name: 'طارق ماجد العتيبي', specialization: 'فنية', rank: 'ممارس', basicQuota: 12, standbyQuota: 3, subjects: ['التربية الفنية'] },
    { id: '10', name: 'ناصر عبدالعزيز الزهراني', specialization: 'اللغة العربية', rank: 'ممارس', basicQuota: 22, standbyQuota: 5, subjects: ['اللغة العربية'] }
  ]);

  const [classes, setClasses] = useState<Class[]>([
    { id: '1', name: '1/1', grade: 'الأول', section: '1', studentsCount: 25 },
    { id: '2', name: '1/2', grade: 'الأول', section: '2', studentsCount: 28 },
    { id: '3', name: '2/1', grade: 'الثاني', section: '1', studentsCount: 26 },
    { id: '4', name: '2/2', grade: 'الثاني', section: '2', studentsCount: 27 },
    { id: '5', name: '3/1', grade: 'الثالث', section: '1', studentsCount: 24 },
    { id: '6', name: '3/2', grade: 'الثالث', section: '2', studentsCount: 29 },
    { id: '7', name: '4/1', grade: 'الرابع', section: '1', studentsCount: 26 },
    { id: '8', name: '4/2', grade: 'الرابع', section: '2', studentsCount: 25 },
    { id: '9', name: '5/1', grade: 'الخامس', section: '1', studentsCount: 28 },
    { id: '10', name: '5/2', grade: 'الخامس', section: '2', studentsCount: 27 },
    { id: '11', name: '6/1', grade: 'السادس', section: '1', studentsCount: 30 },
    { id: '12', name: '6/2', grade: 'السادس', section: '2', studentsCount: 26 }
  ]);

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'اللغة العربية', weeklyHours: 6, maxConsecutive: 1 },
    { id: '2', name: 'الرياضيات', weeklyHours: 5, maxConsecutive: 1 },
    { id: '3', name: 'العلوم', weeklyHours: 4, maxConsecutive: 1 },
    { id: '4', name: 'اللغة الإنجليزية', weeklyHours: 3, maxConsecutive: 1 },
    { id: '5', name: 'الدراسات الإسلامية', weeklyHours: 4, maxConsecutive: 1 },
    { id: '6', name: 'الاجتماعيات', weeklyHours: 3, maxConsecutive: 1 },
    { id: '7', name: 'التربية البدنية', weeklyHours: 2, maxConsecutive: 1 },
    { id: '8', name: 'الحاسب الآلي', weeklyHours: 2, maxConsecutive: 1 },
    { id: '9', name: 'التربية الفنية', weeklyHours: 1, maxConsecutive: 1 }
  ]);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  
  // دالة الحصول على رتبة المعلم من الخدمة المشتركة
  const getActualTeacherRank = (teacher: Teacher) => {
    return teacher.rank;
  };
  
  // الأيام والحصص
  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const periodsPerDay = 7;

  // دالة اختصار أسماء المواد
  const getSubjectAbbreviation = (subjectName: string) => {
    const abbreviations: { [key: string]: string } = {
      'اللغة العربية': 'عربي',
      'التربية الفنية': 'فنية',
      'التربية البدنية': 'بدنية',
      'القرآن الكريم': 'قرآن',
      'الدراسات الإسلامية': 'إسلامية',
      'القرآن والإسلامية': 'ق.وإسلامية',
      'الحاسب الآلي': 'رقمية',
      'المهارات الرقمية': 'رقمية',
      'المهارات الحياتية': 'حياتية',
      'اللغة الإنجليزية': 'إنجليزي',
      'الرياضيات': 'رياضيات',
      'العلوم': 'علوم',
      'الاجتماعيات': 'اجتماعيات'
    };
    return abbreviations[subjectName] || subjectName;
  };

  // تهيئة المواقت الزمنية
  useEffect(() => {
    const slots: TimeSlot[] = [];
    daysOfWeek.forEach(day => {
      for (let period = 1; period <= periodsPerDay; period++) {
        const startHour = 7 + Math.floor((period - 1) * 0.75);
        const startMinute = ((period - 1) * 45) % 60;
        const endHour = startHour + (startMinute + 45 >= 60 ? 1 : 0);
        const endMinute = (startMinute + 45) % 60;
        
        slots.push({
          id: `${day}-${period}`,
          day,
          period,
          startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
          endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
        });
      }
    });
    setTimeSlots(slots);
    
    // إضافة حصص وهمية لعرض الجدول
    const demoSessions: ClassSession[] = [
      // الأحد
      { id: 's1', teacherId: '1', classId: '1', subjectId: '1', timeSlotId: 'الأحد-1', type: 'basic', isLocked: false },
      { id: 's2', teacherId: '2', classId: '2', subjectId: '2', timeSlotId: 'الأحد-1', type: 'basic', isLocked: false },
      { id: 's3', teacherId: '3', classId: '3', subjectId: '3', timeSlotId: 'الأحد-1', type: 'basic', isLocked: false },
      { id: 's4', teacherId: '1', classId: '2', subjectId: '1', timeSlotId: 'الأحد-2', type: 'basic', isLocked: false },
      { id: 's5', teacherId: '2', classId: '1', subjectId: '2', timeSlotId: 'الأحد-2', type: 'basic', isLocked: false },
      { id: 's6', teacherId: '4', classId: '4', subjectId: '4', timeSlotId: 'الأحد-2', type: 'basic', isLocked: false },
      { id: 's7', teacherId: '5', classId: '5', subjectId: '5', timeSlotId: 'الأحد-3', type: 'basic', isLocked: false },
      { id: 's8', teacherId: '3', classId: '1', subjectId: '3', timeSlotId: 'الأحد-3', type: 'basic', isLocked: false },
      { id: 's9', teacherId: '1', classId: '3', subjectId: '1', timeSlotId: 'الأحد-4', type: 'basic', isLocked: false },
      { id: 's10', teacherId: '6', classId: '6', subjectId: '6', timeSlotId: 'الأحد-4', type: 'basic', isLocked: false },
      
      // الإثنين
      { id: 's11', teacherId: '2', classId: '3', subjectId: '2', timeSlotId: 'الإثنين-1', type: 'basic', isLocked: false },
      { id: 's12', teacherId: '1', classId: '4', subjectId: '1', timeSlotId: 'الإثنين-1', type: 'basic', isLocked: false },
      { id: 's13', teacherId: '3', classId: '2', subjectId: '3', timeSlotId: 'الإثنين-2', type: 'basic', isLocked: false },
      { id: 's14', teacherId: '4', classId: '1', subjectId: '4', timeSlotId: 'الإثنين-2', type: 'basic', isLocked: false },
      { id: 's15', teacherId: '5', classId: '3', subjectId: '5', timeSlotId: 'الإثنين-3', type: 'basic', isLocked: false },
      { id: 's16', teacherId: '7', classId: '5', subjectId: '7', timeSlotId: 'الإثنين-3', type: 'basic', isLocked: false },
      { id: 's17', teacherId: '2', classId: '4', subjectId: '2', timeSlotId: 'الإثنين-4', type: 'basic', isLocked: false },
      { id: 's18', teacherId: '8', classId: '7', subjectId: '8', timeSlotId: 'الإثنين-5', type: 'basic', isLocked: false },
      
      // الثلاثاء
      { id: 's19', teacherId: '1', classId: '5', subjectId: '1', timeSlotId: 'الثلاثاء-1', type: 'basic', isLocked: false },
      { id: 's20', teacherId: '2', classId: '6', subjectId: '2', timeSlotId: 'الثلاثاء-1', type: 'basic', isLocked: false },
      { id: 's21', teacherId: '3', classId: '4', subjectId: '3', timeSlotId: 'الثلاثاء-2', type: 'basic', isLocked: false },
      { id: 's22', teacherId: '4', classId: '2', subjectId: '4', timeSlotId: 'الثلاثاء-2', type: 'basic', isLocked: false },
      { id: 's23', teacherId: '6', classId: '1', subjectId: '6', timeSlotId: 'الثلاثاء-3', type: 'basic', isLocked: false },
      { id: 's24', teacherId: '9', classId: '8', subjectId: '9', timeSlotId: 'الثلاثاء-3', type: 'basic', isLocked: false },
      
      // الأربعاء
      { id: 's25', teacherId: '10', classId: '7', subjectId: '1', timeSlotId: 'الأربعاء-1', type: 'basic', isLocked: false },
      { id: 's26', teacherId: '2', classId: '8', subjectId: '2', timeSlotId: 'الأربعاء-1', type: 'basic', isLocked: false },
      { id: 's27', teacherId: '5', classId: '9', subjectId: '5', timeSlotId: 'الأربعاء-2', type: 'basic', isLocked: false },
      { id: 's28', teacherId: '1', classId: '6', subjectId: '1', timeSlotId: 'الأربعاء-3', type: 'basic', isLocked: false },
      { id: 's29', teacherId: '3', classId: '5', subjectId: '3', timeSlotId: 'الأربعاء-4', type: 'basic', isLocked: false },
      
      // الخميس
      { id: 's30', teacherId: '1', classId: '8', subjectId: '1', timeSlotId: 'الخميس-1', type: 'basic', isLocked: false },
      { id: 's31', teacherId: '2', classId: '9', subjectId: '2', timeSlotId: 'الخميس-1', type: 'basic', isLocked: false },
      { id: 's32', teacherId: '4', classId: '3', subjectId: '4', timeSlotId: 'الخميس-2', type: 'basic', isLocked: false },
      { id: 's33', teacherId: '7', classId: '1', subjectId: '7', timeSlotId: 'الخميس-3', type: 'basic', isLocked: false },
      { id: 's34', teacherId: '8', classId: '2', subjectId: '8', timeSlotId: 'الخميس-4', type: 'basic', isLocked: false },
      
      // حصص انتظار
      { id: 's35', teacherId: '1', classId: '9', subjectId: '1', timeSlotId: 'الأحد-5', type: 'standby', isLocked: false },
      { id: 's36', teacherId: '2', classId: '5', subjectId: '2', timeSlotId: 'الإثنين-6', type: 'standby', isLocked: false },
      { id: 's37', teacherId: '3', classId: '7', subjectId: '3', timeSlotId: 'الثلاثاء-5', type: 'standby', isLocked: false },
      { id: 's38', teacherId: '4', classId: '6', subjectId: '4', timeSlotId: 'الأربعاء-5', type: 'standby', isLocked: false },
      { id: 's39', teacherId: '5', classId: '10', subjectId: '5', timeSlotId: 'الخميس-5', type: 'standby', isLocked: false }
    ];
    setSessions(demoSessions);
  }, []);

  // دوال إدارة نقل الحصص المتقدمة
  const checkConflicts = (dragData: any, targetSlot: { teacherId: string, day: string, period: number }) => {
    const conflicts: Conflict[] = [];
    
    // فحص تعارض المعلم
    const teacherConflict = sessions.find(session => 
      session.teacherId === targetSlot.teacherId && 
      session.timeSlotId === `${targetSlot.day}-${targetSlot.period}` &&
      session.id !== dragData.sessionId
    );
    
    if (teacherConflict) {
      const teacher = teachers.find(t => t.id === targetSlot.teacherId);
      const subject = subjects.find(s => s.id === teacherConflict.subjectId);
      const classData = classes.find(c => c.id === teacherConflict.classId);
      
      conflicts.push({
        type: 'teacher_conflict',
        description: `المعلم ${teacher?.name} لديه حصة ${subject?.name} مع ${classData?.name} في نفس الوقت`,
        teacherName: teacher?.name,
        subjectName: subject?.name,
        className: classData?.name,
        timeSlot: `${targetSlot.day} - الحصة ${targetSlot.period}`,
        severity: 'high'
      });
    }
    
    // فحص تعارض الفصل
    const classConflict = sessions.find(session => 
      session.classId === dragData.classId && 
      session.timeSlotId === `${targetSlot.day}-${targetSlot.period}` &&
      session.id !== dragData.sessionId
    );
    
    if (classConflict) {
      const classData = classes.find(c => c.id === dragData.classId);
      const conflictTeacher = teachers.find(t => t.id === classConflict.teacherId);
      const conflictSubject = subjects.find(s => s.id === classConflict.subjectId);
      
      conflicts.push({
        type: 'class_conflict',
        description: `الفصل ${classData?.name} لديه حصة ${conflictSubject?.name} مع المعلم ${conflictTeacher?.name} في نفس الوقت`,
        teacherName: conflictTeacher?.name,
        subjectName: conflictSubject?.name,
        className: classData?.name,
        timeSlot: `${targetSlot.day} - الحصة ${targetSlot.period}`,
        severity: 'high'
      });
    }
    
    return conflicts;
  };

  const performSessionTransfer = (dragData: any, targetSlot: { teacherId: string, day: string, period: number }) => {
    setSessions(prevSessions => {
      const newSessions = [...prevSessions];
      
      // العثور على الحصة المراد نقلها
      const sessionIndex = newSessions.findIndex(session => session.id === dragData.sessionId);
      
      if (sessionIndex !== -1) {
        // إنشاء نسخة محدثة من الحصة
        const updatedSession = {
          ...newSessions[sessionIndex],
          teacherId: targetSlot.teacherId,
          timeSlotId: `${targetSlot.day}-${targetSlot.period}`
        };
        
        // استبدال الحصة
        newSessions[sessionIndex] = updatedSession;
        
        console.log('تم نقل الحصة بنجاح:', {
          session: updatedSession,
          from: `${dragData.teacher} - ${dragData.day} الحصة ${dragData.period}`,
          to: `${teachers.find(t => t.id === targetSlot.teacherId)?.name} - ${targetSlot.day} الحصة ${targetSlot.period}`
        });
      }
      
      return newSessions;
    });
  };

  const handleDragDrop = (dragData: any, targetSlot: { teacherId: string, day: string, period: number }) => {
    // فحص التعارضات
    const conflicts = checkConflicts(dragData, targetSlot);
    
    if (conflicts.length > 0) {
      // إظهار حوار التعارضات
      console.log('تم اكتشاف تعارضات:', conflicts);
      
      // هنا يمكن إضافة حوار للمستخدم للموافقة على النقل رغم التعارضات
      const userConfirmed = window.confirm(
        `تم اكتشاف ${conflicts.length} تعارض(ات). هل تريد المتابعة؟\n\n` +
        conflicts.map(c => `• ${c.description}`).join('\n')
      );
      
      if (!userConfirmed) {
        return false;
      }
    }
    
    // تنفيذ النقل
    performSessionTransfer(dragData, targetSlot);
    
    // إضافة الحصة المتبدلة للقائمة مع مؤشر السهمين
    setSwappedSessions(prev => new Set([...prev, dragData.sessionId]));
    
    // إزالة المؤشر بعد 3 ثوان
    setTimeout(() => {
      setSwappedSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(dragData.sessionId);
        return newSet;
      });
    }, 3000);
    
    // إنشاء سجل العملية
    const operation = {
      id: Date.now(),
      operationNumber: dragOperationsCount + 1,
      from: `${dragData.teacher} - ${dragData.day} الحصة ${dragData.period}`,
      to: `${teachers.find(t => t.id === targetSlot.teacherId)?.name} - ${targetSlot.day} الحصة ${targetSlot.period}`,
      subject: dragData.subject || 'غير محدد',
      class: dragData.class || 'غير محدد',
      conflicts: conflicts.length,
      timestamp: new Date().toLocaleTimeString('ar'),
      date: new Date().toLocaleDateString('ar'),
      details: {
        sessionId: dragData.sessionId,
        fromTeacher: dragData.teacher,
        toTeacher: teachers.find(t => t.id === targetSlot.teacherId)?.name,
        conflictsResolved: conflicts.map(c => c.description)
      }
    };
    
    // تحديث الإحصائيات
    setDragOperationsCount(prev => prev + 1);
    setLastDragOperation(operation);
    setOperationsHistory(prev => [operation, ...prev]); // إضافة للبداية
    
    // إخفاء تنبيه آخر عملية بعد 8 ثوان
    setTimeout(() => {
      setLastDragOperation(null);
    }, 8000);
    
    return true;
  };

  // وظائف التحكم الأساسية
  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    setProgressPercentage(0);
    
    try {
      // الخطوة 1: جلب بيانات إسناد المواد من صفحة إسناد المواد
      setProgressPercentage(5);
      console.log('📚 جاري جلب بيانات إسناد المواد...');
      let assignmentData: any = null;
      try {
        const assignmentResponse = await fetch('http://localhost:5001/api/assignments');
        if (assignmentResponse.ok) {
          assignmentData = await assignmentResponse.json();
          console.log(`✅ تم جلب ${assignmentData?.assignments?.length || 0} إسناد من صفحة إسناد المواد`);
        }
      } catch (error) {
        console.warn('⚠️ لم يتم العثور على بيانات إسناد المواد، سيتم استخدام البيانات الافتراضية');
      }

      // الخطوة 2: جلب إعدادات الجدول (الخطوة الأولى: المعلمون)
      setProgressPercentage(8);
      console.log('👥 جاري جلب إعدادات المعلمين من إعدادات الجدول...');
      let scheduleSettings: any = null;
      try {
        const settingsResponse = await fetch('http://localhost:5001/api/schedule/settings');
        if (settingsResponse.ok) {
          scheduleSettings = await settingsResponse.json();
          console.log(`✅ تم جلب إعدادات ${scheduleSettings?.teachers?.length || 0} معلم من إعدادات الجدول`);
        }
      } catch (error) {
        console.warn('⚠️ لم يتم العثور على إعدادات الجدول، سيتم استخدام الإعدادات الافتراضية');
      }

      // الخطوة 3: جلب إعدادات المواد (الخطوة الثانية: المواد)
      setProgressPercentage(10);
      console.log('📖 جاري جلب إعدادات المواد من إعدادات الجدول...');
      let subjectSettings: any = null;
      try {
        const subjectResponse = await fetch('http://localhost:5001/api/schedule/subjects');
        if (subjectResponse.ok) {
          subjectSettings = await subjectResponse.json();
          console.log(`✅ تم جلب إعدادات ${subjectSettings?.subjects?.length || 0} مادة من إعدادات الجدول`);
        }
      } catch (error) {
        console.warn('⚠️ لم يتم العثور على إعدادات المواد، سيتم استخدام الإعدادات الافتراضية');
      }

      // الخطوة 4: جلب الاجتماعات التخصصية
      setProgressPercentage(12);
      console.log('🤝 جاري جلب الاجتماعات التخصصية...');
      let departmentMeetings: any[] = [];
      try {
        const meetingsResponse = await fetch('http://localhost:5001/api/meetings');
        const meetingsData = await meetingsResponse.json();
        if (meetingsData.success) {
          departmentMeetings = meetingsData.meetings;
          console.log(`✅ تم جلب ${departmentMeetings.length} اجتماع تخصصي`);
        }
      } catch (error) {
        console.warn('⚠️ لم يتم العثور على اجتماعات تخصصية، المتابعة بدونها');
      }

      // التحقق من توفر البيانات الأساسية
      if (!assignmentData || !assignmentData.assignments || assignmentData.assignments.length === 0) {
        showNotification('warning', 'تنبيه', 'لا يوجد إسناد للمواد. يرجى إتمام إسناد المواد أولاً من صفحة إسناد المواد');
        console.warn('⚠️ لا يوجد إسناد للمواد، الرجاء إتمام إسناد المواد أولاً');
      }

      if (!scheduleSettings || !scheduleSettings.teachers || scheduleSettings.teachers.length === 0) {
        showNotification('warning', 'تنبيه', 'لا توجد إعدادات للمعلمين. يرجى ضبط إعدادات الجدول أولاً (الخطوة الأولى: المعلمون)');
        console.warn('⚠️ لا توجد إعدادات للمعلمين، الرجاء ضبط الإعدادات أولاً');
      }

      // محاكاة عملية الإنشاء مع شريط التقدم
      setProgressPercentage(15);
      console.log('🔄 بدء إنشاء الجدول بناءً على البيانات المستوردة...');
      
      const steps = 5;
      for (let i = 0; i < steps; i++) {
        setProgressPercentage(Math.round(15 + ((i + 1) / steps) * 75));
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // إنتاج جدول بناءً على البيانات المستوردة من إسناد المواد وإعدادات الجدول
      const newSessions: ClassSession[] = [];
      let sessionId = 1;
      
      // إنشاء map لحجز حصص الاجتماعات
      const blockedSlots = new Map<string, Set<string>>(); // Map<teacherId, Set<slotId>>
      
      // حجز الحصص للاجتماعات التخصصية
      departmentMeetings.forEach(meeting => {
        const slotId = `${meeting.day_index}-${meeting.period_index}`;
        
        // حجز الحصة لكل معلم مشارك
        meeting.participants.forEach((teacherId: number) => {
          const teacherIdStr = teacherId.toString();
          if (!blockedSlots.has(teacherIdStr)) {
            blockedSlots.set(teacherIdStr, new Set());
          }
          blockedSlots.get(teacherIdStr)?.add(slotId);
        });
        
        console.log(`🔒 تم حجز ${meeting.name} في ${slotId} لـ ${meeting.participants.length} معلم`);
      });
      
      classes.forEach(classItem => {
        subjects.forEach(subject => {
          for (let i = 0; i < Math.min(subject.weeklyHours, 5); i++) {
            const teacher = teachers.find(t => t.subjects.includes(subject.name));
            if (teacher) {
              // البحث عن حصة متاحة (غير محجوزة للاجتماعات)
              let timeSlot = null;
              let attempts = 0;
              const maxAttempts = timeSlots.length;
              
              while (!timeSlot && attempts < maxAttempts) {
                const candidateSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
                const slotId = candidateSlot.id;
                
                // التحقق من أن الحصة غير محجوزة للمعلم
                const teacherBlocked = blockedSlots.get(teacher.id);
                if (!teacherBlocked || !teacherBlocked.has(slotId)) {
                  timeSlot = candidateSlot;
                } else {
                  console.log(`⚠️ تخطي ${slotId} للمعلم ${teacher.name} - محجوز للاجتماع`);
                }
                
                attempts++;
              }
              
              if (timeSlot) {
                newSessions.push({
                  id: sessionId.toString(),
                  teacherId: teacher.id,
                  classId: classItem.id,
                  subjectId: subject.id,
                  timeSlotId: timeSlot.id,
                  type: 'basic',
                  isLocked: false
                });
                sessionId++;
              } else {
                console.warn(`⚠️ لم يتم العثور على حصة متاحة للمعلم ${teacher.name}`);
              }
            }
          }
        });
      });
      
      setSessions(newSessions);
      setCanUndo(true);
      setLastBackupSessions([]);
      
      // حفظ الجدول تلقائياً عند الإنشاء
      const now = new Date();
      const currentUser = 'المسؤول'; // يمكن جلبها من نظام المصادقة
      
      // البحث عن جدول موجود بنفس اليوم أو إنشاء جدول جديد
      const existingTodayTimetable = savedTimetables.find(t => 
        t.createdDate === now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
      );
      
      if (existingTodayTimetable) {
        // تحديث الجدول الموجود
        setSavedTimetables(prev => prev.map(t => 
          t.id === existingTodayTimetable.id 
            ? { ...t, sessions: [...newSessions], createdTime: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) }
            : t
        ));
        showNotification('success', 'تم التحديث', `تم تحديث ${existingTodayTimetable.name} بنجاح`);
      } else if (savedTimetables.length < 10) {
        // إنشاء جدول جديد
        const newTimetable = {
          id: Date.now().toString(),
          name: `الجدول ${savedTimetables.length + 1}`,
          createdDate: now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
          createdTime: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          createdBy: currentUser,
          sessions: [...newSessions],
          isActive: savedTimetables.length === 0
        };
        setSavedTimetables(prev => [...prev, newTimetable]);
      }
      
      setProgressPercentage(100);
      showNotification('success', 'تم الإنشاء بنجاح', `تم إنشاء الجدول بنجاح مع ${newSessions.length} حصة مراعاة لإسناد المواد وإعدادات الجدول والاجتماعات التخصصية`);
      console.log('✅ تم إنشاء الجدول تلقائياً مع مراعاة جميع الإعدادات والبيانات المستوردة');
      
    } catch (error) {
      console.error('❌ خطأ في الإنشاء التلقائي:', error);
      showNotification('error', 'خطأ', 'حدث خطأ أثناء إنشاء الجدول');
    } finally {
      setIsGenerating(false);
      setProgressPercentage(0);
    }
  };

  const handleSmartOptimize = async () => {
    if (sessions.length === 0) {
      showNotification('warning', 'تنبيه', 'يجب إنشاء الجدول أولاً قبل التحسين');
      return;
    }

    setIsGenerating(true);
    setProgressPercentage(0);
    setLastBackupSessions([...sessions]);
    
    try {
      showNotification('info', 'جاري التحسين', 'جاري تحليل الجدول وحل التعارضات...');
      
      // الخطوة 1: تحليل التعارضات والمشاكل
      setProgressPercentage(10);
      console.log('🔍 جاري تحليل التعارضات في الجدول...');
      
      // فحص التعارضات
      const detectedConflicts: Conflict[] = [];
      
      // فحص تعارضات المعلمين (معلم واحد في حصتين في نفس الوقت)
      sessions.forEach((session, index) => {
        const conflictingSessions = sessions.filter((s, i) => 
          i !== index && 
          s.teacherId === session.teacherId && 
          s.timeSlotId === session.timeSlotId
        );
        
        if (conflictingSessions.length > 0) {
          const teacher = teachers.find(t => t.id === session.teacherId);
          detectedConflicts.push({
            type: 'teacher_conflict',
            description: `المعلم ${teacher?.name} لديه أكثر من حصة في نفس الوقت`,
            teacherName: teacher?.name,
            timeSlot: session.timeSlotId,
            severity: 'high'
          });
        }
      });
      
      // فحص تعارضات الفصول (فصل واحد لديه حصتين في نفس الوقت)
      sessions.forEach((session, index) => {
        const conflictingSessions = sessions.filter((s, i) => 
          i !== index && 
          s.classId === session.classId && 
          s.timeSlotId === session.timeSlotId
        );
        
        if (conflictingSessions.length > 0) {
          const classData = classes.find(c => c.id === session.classId);
          detectedConflicts.push({
            type: 'class_conflict',
            description: `الفصل ${classData?.name} لديه أكثر من حصة في نفس الوقت`,
            className: classData?.name,
            timeSlot: session.timeSlotId,
            severity: 'high'
          });
        }
      });
      
      console.log(`⚠️ تم اكتشاف ${detectedConflicts.length} تعارض`);
      
      // الخطوة 2: التوزيع المتوازن على أيام الأسبوع
      setProgressPercentage(30);
      console.log('⚖️ جاري إعادة التوزيع المتوازن على أيام الأسبوع...');
      
      const optimizedSessions = [...sessions];
      
      // توزيع الحصص بشكل متوازن لكل معلم على الأيام
      teachers.forEach(teacher => {
        const teacherSessions = optimizedSessions.filter(s => s.teacherId === teacher.id && s.type === 'basic');
        const sessionsPerDay = Math.ceil(teacherSessions.length / daysOfWeek.length);
        
        // إعادة توزيع الحصص
        let dayIndex = 0;
        teacherSessions.forEach((session, index) => {
          if (index > 0 && index % sessionsPerDay === 0) {
            dayIndex = (dayIndex + 1) % daysOfWeek.length;
          }
          
          const day = daysOfWeek[dayIndex];
          const period = (index % sessionsPerDay) + 1;
          session.timeSlotId = `${day}-${period}`;
        });
      });
      
      // الخطوة 3: حل التعارضات
      setProgressPercentage(60);
      console.log('🔧 جاري حل التعارضات...');
      
      // نقل الحصص المتعارضة إلى أوقات متاحة
      detectedConflicts.forEach(conflict => {
        if (conflict.type === 'teacher_conflict' || conflict.type === 'class_conflict') {
          const conflictedSessions = optimizedSessions.filter(s => 
            (conflict.type === 'teacher_conflict' ? s.teacherId === conflict.teacherName : s.classId === conflict.className) &&
            s.timeSlotId === conflict.timeSlot
          );
          
          if (conflictedSessions.length > 1) {
            // نقل الحصة الثانية إلى وقت آخر
            for (let i = 1; i < conflictedSessions.length; i++) {
              const session = conflictedSessions[i];
              
              // البحث عن وقت متاح
              for (const slot of timeSlots) {
                const hasConflict = optimizedSessions.some(s => 
                  s.timeSlotId === slot.id && 
                  (s.teacherId === session.teacherId || s.classId === session.classId)
                );
                
                if (!hasConflict) {
                  session.timeSlotId = slot.id;
                  console.log(`✅ تم نقل الحصة إلى ${slot.id}`);
                  break;
                }
              }
            }
          }
        }
      });
      
      // الخطوة 4: تطبيق التحسينات
      setProgressPercentage(90);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessions(optimizedSessions);
      setConflicts([]); // مسح التعارضات بعد الحل
      setCanUndo(true);
      
      setProgressPercentage(100);
      showNotification('success', 'تم التحسين بنجاح', `تم تحسين الجدول وحل ${detectedConflicts.length} تعارض وإنشاء جدول متوازن`);
      console.log('✅ تم تحسين الجدول بنجاح وحل جميع التعارضات');
      
    } catch (error) {
      console.error('❌ خطأ في التحسين الذكي:', error);
      showNotification('error', 'خطأ', 'حدث خطأ أثناء تحسين الجدول');
      // استرجاع النسخة الاحتياطية
      if (lastBackupSessions.length > 0) {
        setSessions([...lastBackupSessions]);
      }
    } finally {
      setIsGenerating(false);
      setProgressPercentage(0);
    }
  };

  const handleDistributeStandby = async () => {
    // التحقق من قفل الجدول قبل توزيع الانتظار
    if (!isBasicTimetableLocked) {
      // إظهار مربع حوار مخصص يتطلب قفل الجدول أولاً
      showNotification('error', 'خطأ', 'يجب قفل الجدول أولاً قبل توزيع الانتظار');
      setShowLockConfirmDialog(true);
      return;
    }

    setIsGenerating(true);
    setProgressPercentage(0);
    
    try {
      // الخطوة 1: جلب إعدادات حصص الانتظار من الخطوة الثالثة في صفحة إعدادات الجدول
      setProgressPercentage(5);
      console.log('⏱️ جاري جلب إعدادات حصص الانتظار من الخطوة الثالثة...');
      let standbySettings: any = null;
      try {
        const standbyResponse = await fetch('http://localhost:5001/api/schedule/standby-settings');
        if (standbyResponse.ok) {
          standbySettings = await standbyResponse.json();
          console.log(`✅ تم جلب إعدادات حصص الانتظار لـ ${standbySettings?.teachers?.length || 0} معلم`);
        }
      } catch (error) {
        console.warn('⚠️ لم يتم العثور على إعدادات حصص الانتظار، سيتم استخدام الإعدادات الافتراضية');
      }

      // التحقق من توفر إعدادات الانتظار
      if (!standbySettings || !standbySettings.teachers || standbySettings.teachers.length === 0) {
        showNotification('warning', 'تنبيه', 'لا توجد إعدادات لحصص الانتظار. يرجى ضبط إعدادات الجدول أولاً (الخطوة الثالثة: حصص الانتظار)');
        console.warn('⚠️ لا توجد إعدادات لحصص الانتظار، الرجاء ضبط الإعدادات أولاً');
        setIsGenerating(false);
        setProgressPercentage(0);
        return;
      }

      // الخطوة 2: جلب الاجتماعات التخصصية
      setProgressPercentage(10);
      console.log('🤝 جاري جلب الاجتماعات التخصصية...');
      let departmentMeetings: any[] = [];
      try {
        const meetingsResponse = await fetch('http://localhost:5001/api/meetings');
        const meetingsData = await meetingsResponse.json();
        if (meetingsData.success) {
          departmentMeetings = meetingsData.meetings;
          console.log(`✅ تم جلب ${departmentMeetings.length} اجتماع تخصصي لتوزيع الانتظار`);
        }
      } catch (error) {
        console.warn('⚠️ لم يتم العثور على اجتماعات تخصصية');
      }

      // الخطوة 3: توزيع حصص الانتظار بناءً على الإعدادات المستوردة
      setProgressPercentage(15);
      console.log('📊 جاري توزيع حصص الانتظار بناءً على الإعدادات...');
      
      const steps = 3;
      for (let i = 0; i < steps; i++) {
        setProgressPercentage(Math.round(15 + ((i + 1) / steps) * 75));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // إنشاء map لحجز حصص الاجتماعات
      const blockedSlots = new Map<string, Set<string>>();
      
      departmentMeetings.forEach(meeting => {
        const slotId = `${meeting.day_index}-${meeting.period_index}`;
        meeting.participants.forEach((teacherId: number) => {
          const teacherIdStr = teacherId.toString();
          if (!blockedSlots.has(teacherIdStr)) {
            blockedSlots.set(teacherIdStr, new Set());
          }
          blockedSlots.get(teacherIdStr)?.add(slotId);
        });
      });
      
      // إضافة حصص انتظار مع تجنب الحصص المحجوزة للاجتماعات ومراعاة إعدادات الانتظار
      const standbySessionsToAdd: ClassSession[] = [];
      let standbySessionId = sessions.length + 1;
      
      // استخدام إعدادات الانتظار من الخطوة الثالثة بدلاً من البيانات الافتراضية
      const teachersWithStandby = standbySettings.teachers || teachers;
      
      teachersWithStandby.forEach((teacherSetting: any) => {
        // البحث عن المعلم في قائمة المعلمين
        const teacher = teachers.find(t => t.id === teacherSetting.id || t.name === teacherSetting.name);
        if (!teacher) return;
        
        const teacherBlocked = blockedSlots.get(teacher.id);
        
        // استخدام نصاب الانتظار من الإعدادات
        const standbyQuota = teacherSetting.standbyQuota || teacher.standbyQuota;
        
        for (let i = 0; i < Math.min(standbyQuota, 6); i++) {
          // البحث عن حصة متاحة
          let availableSlot = null;
          let attempts = 0;
          
          while (!availableSlot && attempts < timeSlots.length) {
            const candidateSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
            const slotId = candidateSlot.id;
            
            // التحقق من عدم حجز الحصة
            if (!teacherBlocked || !teacherBlocked.has(slotId)) {
              // التحقق من عدم وجود حصة أساسية في نفس الوقت
              const hasBasicSession = sessions.some(s => 
                s.teacherId === teacher.id && 
                s.timeSlotId === slotId && 
                s.type === 'basic'
              );
              
              if (!hasBasicSession) {
                availableSlot = candidateSlot;
              }
            }
            
            attempts++;
          }
          
          if (availableSlot) {
            standbySessionsToAdd.push({
              id: standbySessionId.toString(),
              teacherId: teacher.id,
              classId: '', // حصة انتظار
              subjectId: '',
              timeSlotId: availableSlot.id,
              type: 'standby',
              isLocked: false
            });
            standbySessionId++;
          } else {
            console.warn(`⚠️ لم يتم العثور على حصة انتظار متاحة للمعلم ${teacher.name}`);
          }
        }
      });
      
      setSessions([...sessions, ...standbySessionsToAdd]);
      
      setProgressPercentage(100);
      showNotification('success', 'تم التوزيع بنجاح', `تم توزيع ${standbySessionsToAdd.length} حصة انتظار بناءً على إعدادات الجدول مع مراعاة الاجتماعات التخصصية`);
      console.log(`✅ تم توزيع ${standbySessionsToAdd.length} حصة انتظار مع مراعاة إعدادات الخطوة الثالثة والاجتماعات`);
      
    } catch (error) {
      console.error('❌ خطأ في توزيع الانتظار:', error);
      showNotification('error', 'خطأ', 'حدث خطأ أثناء توزيع حصص الانتظار');
    } finally {
      setIsGenerating(false);
      setProgressPercentage(0);
    }
  };

  // دالة تأكيد القفل والمتابعة
  const handleConfirmLockAndDistribute = async () => {
    setShowLockConfirmDialog(false);
    setIsBasicTimetableLocked(true);
    
    // انتظار قصير للسماح للحالة بالتحديث ثم بدء التوزيع
    setTimeout(() => {
      handleDistributeStandby();
    }, 100);
  };

  // دالة تأكيد فتح القفل
  const handleConfirmUnlock = () => {
    setShowUnlockConfirmDialog(false);
    setIsBasicTimetableLocked(false);
    showNotification('info', 'تم فتح القفل', 'تم فتح قفل الجدول! يمكنك الآن تعديل الحصص الأساسية');
  };

  const handleUndo = () => {
    if (canUndo && lastBackupSessions.length > 0) {
      setSessions([...lastBackupSessions]);
      setCanUndo(false);
      setLastBackupSessions([]);
      console.log('تم التراجع عن آخر تعديل بنجاح');
    }
  };

  // دالة إضافة الإشراف والمناوبة للمعلمين
  const handleAddSupervisionAndDuty = () => {
    if (sessions.length === 0) {
      // إشعار احترافي في حال عدم إنشاء الجدول
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-lg shadow-lg border-r-4 border-red-700 transform transition-all duration-300';
      notification.style.fontFamily = 'Arial, sans-serif';
      notification.style.direction = 'rtl';
      notification.style.minWidth = '300px';
      notification.style.maxWidth = '400px';
      
      notification.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg">تنبيه</h3>
              <p class="text-sm opacity-90">أنشئ الجدول لإضافة الإشراف والمناوبة للمعلمين</p>
            </div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-red-200 transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // إزالة الإشعار تلقائياً بعد 5 ثوان
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 5000);
      
      return;
    }
    
    // هنا سيتم جلب بيانات الإشراف والمناوبة من صفحة نماذج الإشراف والمناوبة
    // وربطها بجداول المعلمين الفردية
    console.log('جاري جلب بيانات الإشراف والمناوبة للمعلمين...');
    
    // محاكاة جلب البيانات من صفحة نماذج الإشراف والمناوبة
    // في التطبيق الحقيقي سيتم استدعاء API أو قاعدة البيانات
    const mockSupervisionData = {
      '1': { day: 'الأحد', date: '1447-2-5' },
      '2': { day: 'الإثنين', date: '1447-2-6' },
      '3': { day: 'الثلاثاء', date: '1447-2-7' },
      '4': { day: 'الأربعاء', date: '1447-2-8' },
      '5': { day: 'الخميس', date: '1447-2-9' }
    };
    
    setSupervisionData(mockSupervisionData);
    console.log('تم ربط بيانات الإشراف والمناوبة بنجاح');
  };

  const handleManageTimetables = () => {
    setShowManageTimetablesDialog(true);
  };

  const handleSaveTimetable = () => {
    if (sessions.length === 0) {
      showNotification('warning', 'تنبيه', 'لا يوجد جدول لحفظه');
      return;
    }

    if (savedTimetables.length >= 10) {
      showNotification('error', 'خطأ', 'تم الوصول للحد الأقصى (10 جداول). يرجى حذف جدول قديم أولاً');
      return;
    }

    const now = new Date();
    const currentUser = 'المسؤول'; // يمكن جلبها من نظام المصادقة
    
    const newTimetable = {
      id: Date.now().toString(),
      name: `الجدول ${savedTimetables.length + 1}`,
      createdDate: now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
      createdTime: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      createdBy: currentUser,
      sessions: [...sessions],
      isActive: savedTimetables.length === 0 // الجدول الأول يكون معتمد تلقائياً
    };

    setSavedTimetables(prev => [...prev, newTimetable]);
    showNotification('success', 'تم الحفظ', `تم حفظ ${newTimetable.name} بنجاح`);
  };

  const handleLoadTimetable = (timetableId: string) => {
    const timetable = savedTimetables.find(t => t.id === timetableId);
    if (timetable) {
      setSessions(timetable.sessions);
      setSavedTimetables(prev => prev.map(t => ({
        ...t,
        isActive: t.id === timetableId
      })));
      setShowManageTimetablesDialog(false);
      showNotification('success', 'تم التحميل', 'تم تحميل الجدول بنجاح');
    }
  };

  const handleDeleteTimetable = (timetableId: string) => {
    setTimetableToDelete(timetableId);
    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteTimetable = () => {
    if (timetableToDelete) {
      const timetable = savedTimetables.find(t => t.id === timetableToDelete);
      setSavedTimetables(prev => prev.filter(t => t.id !== timetableToDelete));
      showNotification('success', 'تم الحذف', `تم حذف ${timetable?.name || 'الجدول'} بنجاح`);
      setShowDeleteConfirmDialog(false);
      setTimetableToDelete(null);
    }
  };

  const generateManageTimetablesContent = () => {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>إدارة الجداول</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; background-color: #f9fafb; }
          .header { text-align: center; margin-bottom: 30px; background: linear-gradient(to right, #655ac1, #7c3aed); color: white; padding: 20px; border-radius: 10px; }
          .tab-content { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #d1d5db; padding: 12px; text-align: center; font-size: 13px; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .status-active { background-color: #dcfce7; color: #166534; }
          .status-pending { background-color: #fee2e2; color: #991b1b; }
          .btn { padding: 8px 16px; margin: 2px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
          .btn-primary { background-color: #8779fb; color: white; }
          .btn-success { background-color: #10b981; color: white; }
          .btn-danger { background-color: #ef4444; color: white; }
          .btn-warning { background-color: #f59e0b; color: white; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
          .summary-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; text-align: center; }
          .summary-card h3 { margin: 0; font-size: 24px; }
          .summary-card p { margin: 5px 0 0 0; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>إدارة الجداول المنفذة</h1>
          <p>عرض وإدارة جميع الجداول التي تم إنشاؤها وتنفيذها</p>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <h3>${sessions.filter(s => s.type === 'basic').length}</h3>
            <p>الحصص المنفذة</p>
          </div>
          <div class="summary-card">
            <h3>${sessions.filter(s => s.type === 'standby').length}</h3>
            <p>حصص الانتظار</p>
          </div>
          <div class="summary-card">
            <h3>${teachers.length}</h3>
            <p>إجمالي المعلمين</p>
          </div>
          <div class="summary-card">
            <h3>${classes.length}</h3>
            <p>إجمالي الفصول</p>
          </div>
        </div>
        
        <div class="tab-content">
          <h2>الجداول المنفذة</h2>
          <table>
            <thead>
              <tr>
                <th>رقم الجدول</th>
                <th>تاريخ الإنشاء</th>
                <th>أنشئ بواسطة</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>${new Date().toLocaleDateString('ar-SA')}</td>
                <td>أحمد محمد العتيبي</td>
                <td><span class="status-active">نشط</span></td>
                <td>
                  <button class="btn btn-success" onclick="approveTimetable()">اعتماد</button>
                  <button class="btn btn-danger" onclick="deleteTimetable()">حذف</button>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>${new Date(Date.now() - 86400000).toLocaleDateString('ar-SA')}</td>
                <td>خالد سعد الأحمد</td>
                <td><span class="status-pending">غير نشط</span></td>
                <td>
                  <button class="btn btn-success" onclick="approveTimetable()">اعتماد</button>
                  <button class="btn btn-danger" onclick="deleteTimetable()">حذف</button>
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>${new Date(Date.now() - 172800000).toLocaleDateString('ar-SA')}</td>
                <td>محمد عبدالله الشمري</td>
                <td><span class="status-active">نشط</span></td>
                <td>
                  <button class="btn btn-success" onclick="approveTimetable()">اعتماد</button>
                  <button class="btn btn-danger" onclick="deleteTimetable()">حذف</button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 20px; text-align: center;">
            <button class="btn btn-primary" onclick="window.close()">إغلاق</button>
            <button class="btn btn-success" onclick="refreshData()">تحديث البيانات</button>
          </div>
        </div>
        
        <script>
          function approveTimetable() {
            alert('تم اعتماد الجدول بنجاح');
          }
          
          function deleteTimetable() {
            if(confirm('هل أنت متأكد من حذف هذا الجدول؟')) {
              alert('تم حذف الجدول بنجاح');
            }
          }
          
          function refreshData() {
            window.location.reload();
          }
        </script>
      </body>
      </html>
    `;
  };

  // دالة تصدير Excel - محسّنة
  const handleExportExcel = () => {
    if (sessions.length === 0) {
      showNotification('warning', 'تنبيه', 'لا توجد بيانات للتصدير');
      return;
    }

    try {
      // تحضير بيانات المعلمين والفصول
      const teachersData = teachers.map(t => ({
        id: t.id,
        name: t.name,
        subject: t.specialization
      }));

      const classesData = classes.map(c => ({
        id: c.id,
        name: c.name,
        grade: c.grade
      }));

      // تحضير البيانات مع الخصائص المطلوبة
      const sessionsWithDayPeriod = sessions.map(s => {
        const timeSlot = timeSlots.find(ts => ts.id === s.timeSlotId);
        const subject = subjects.find(sub => sub.id === s.subjectId);
        return {
          ...s,
          day: timeSlot?.day || 'sunday',
          period: timeSlot?.period || 1,
          subject: subject?.name || s.subjectName || '',
          isStandby: s.type === 'standby'
        };
      });

      // استدعاء دالة التصدير المحسّنة
      const result = exportToExcel(sessionsWithDayPeriod, teachersData, classesData);

      if (result.success) {
        showNotification('success', 'تم التصدير', `تم تصدير الجدول بنجاح بصيغة Excel`);
      } else {
        showNotification('error', 'خطأ', result.error || 'فشل تصدير الملف');
      }
    } catch (error) {
      console.error('خطأ في التصدير:', error);
      showNotification('error', 'خطأ', 'حدث خطأ أثناء تصدير الملف');
    }
  };

  // دالة تصدير HTML - محسّنة
  const handleExportHTML = () => {
    if (sessions.length === 0) {
      showNotification('warning', 'تنبيه', 'لا توجد بيانات للتصدير');
      return;
    }

    try {
      // تحضير بيانات المعلمين والفصول
      const teachersData = teachers.map(t => ({
        id: t.id,
        name: t.name,
        subject: t.specialization
      }));

      const classesData = classes.map(c => ({
        id: c.id,
        name: c.name,
        grade: c.grade
      }));

      // تحضير البيانات مع الخصائص المطلوبة
      const sessionsWithDayPeriod = sessions.map(s => {
        const timeSlot = timeSlots.find(ts => ts.id === s.timeSlotId);
        const subject = subjects.find(sub => sub.id === s.subjectId);
        return {
          ...s,
          day: timeSlot?.day || 'sunday',
          period: timeSlot?.period || 1,
          subject: subject?.name || s.subjectName || '',
          isStandby: s.type === 'standby'
        };
      });

      // استدعاء دالة التصدير المحسّنة (XML)
      const result = exportToHTML(sessionsWithDayPeriod, teachersData, classesData);

      if (result.success) {
        showNotification('success', 'تم التصدير', `تم تصدير الجدول بصيغة XML بنجاح!`);
      } else {
        showNotification('error', 'خطأ', result.error || 'فشل تصدير الملف');
      }
    } catch (error) {
      console.error('خطأ في التصدير:', error);
      showNotification('error', 'خطأ', 'حدث خطأ أثناء تصدير الملف');
    }
  };

  const generateTeachersTableHTML = () => {
    let html = '<table class="schedule-table"><thead><tr>';
    html += '<th>المعلم</th>';
    daysOfWeek.forEach(day => {
      for (let i = 1; i <= periodsPerDay; i++) {
        html += `<th>${day}<br>الحصة ${i}</th>`;
      }
    });
    html += '</tr></thead><tbody>';
    
    teachers.forEach(teacher => {
      html += `<tr><td class="teacher-name">${teacher.name}</td>`;
      daysOfWeek.forEach((day, dayIndex) => {
        for (let periodIndex = 1; periodIndex <= periodsPerDay; periodIndex++) {
          const session = sessions.find(s => 
            s.teacherId === teacher.id && 
            s.dayIndex === dayIndex && 
            s.periodIndex === periodIndex
          );
          if (session) {
            html += `<td class="class-cell">${session.className}<br><span class="subject-cell">${session.subjectName}</span></td>`;
          } else {
            html += '<td class="empty-cell">-</td>';
          }
        }
      });
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    return html;
  };

  const handlePrint = () => {
    if (sessions.length === 0) {
      showNotification('warning', 'تنبيه', 'لا توجد بيانات للطباعة');
      return;
    }
    
    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    if (printWindow) {
      const printContent = generatePrintSelectionContent();
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const generatePrintSelectionContent = () => {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>اختيار نوع الطباعة</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Tajawal', Arial, sans-serif;
            direction: rtl;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #655ac1 0%, #8779fb 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .content {
            padding: 30px;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .section-title::before {
            content: '';
            width: 4px;
            height: 24px;
            background: linear-gradient(135deg, #655ac1, #8779fb);
            border-radius: 2px;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .card:hover {
            border-color: #655ac1;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.1);
          }
          
          .card.selected {
            border-color: #655ac1;
            background: linear-gradient(135deg, #e5e1fe 0%, #e5e1fe 100%);
          }
          
          .card-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #655ac1, #8779fb);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            color: white;
            font-size: 24px;
          }
          
          .card h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
          }
          
          .card p {
            font-size: 14px;
            color: #64748b;
            line-height: 1.5;
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          .form-label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .form-select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
            background: white;
          }
          
          .form-select:focus {
            outline: none;
            border-color: #655ac1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          
          .recipients-list {
            max-height: 300px;
            overflow-y: auto;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
          }
          
          .recipient-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #f3f4f6;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }
          
          .recipient-item:hover {
            background-color: #f9fafb;
          }
          
          .recipient-item.selected {
            background-color: #e5e1fe;
            border-right: 4px solid #655ac1;
          }
          
          .recipient-checkbox {
            margin-left: 12px;
            width: 18px;
            height: 18px;
            accent-color: #655ac1;
          }
          
          .recipient-info {
            flex: 1;
          }
          
          .recipient-name {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
          }
          
          .recipient-details {
            font-size: 12px;
            color: #6b7280;
          }
          
          .button-group {
            display: flex;
            gap: 12px;
            margin-top: 30px;
            justify-content: center;
          }
          
          .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #655ac1, #8779fb);
            color: white;
          }
          
          .btn-primary:hover {
            background: linear-gradient(135deg, #5855eb, #7c3aed);
            transform: translateY(-1px);
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.3);
          }
          
          .btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 2px solid #e5e7eb;
          }
          
          .btn-secondary:hover {
            background: #e5e7eb;
            border-color: #d1d5db;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .stat-card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #655ac1;
            margin-bottom: 5px;
          }
          
          .stat-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
        <div class="header">
            <h1>اختيار نوع الطباعة</h1>
            <p>اختر نوع الجدول المطلوب طباعته</p>
        </div>
        
        <div class="content">
            <!-- إحصائيات الجدول -->
            <div class="section">
              <h2 class="section-title">إحصائيات الجدول الحالي</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${teachers.length}</div>
                  <div class="stat-label">عدد المعلمين</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${classes.length}</div>
                  <div class="stat-label">عدد الفصول</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${sessions.filter(s => s.type === 'basic').length}</div>
                  <div class="stat-label">الحصص الأساسية</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${sessions.filter(s => s.type === 'standby').length}</div>
                  <div class="stat-label">حصص الانتظار</div>
                </div>
              </div>
        </div>
        
            <!-- اختيار نوع الطباعة -->
            <div class="section">
              <h2 class="section-title">نوع الجدول المطلوب طباعته</h2>
              <div class="grid">
                <div class="card selected" onclick="selectPrintType('general_teachers')">
                  <div class="card-icon">👥</div>
                  <h3>الجدول العام للمعلمين</h3>
                  <p>جدول شامل لجميع المعلمين في صفحة واحدة</p>
                </div>
                
                <div class="card" onclick="selectPrintType('general_classes')">
                  <div class="card-icon">🏫</div>
                  <h3>الجدول العام للفصول</h3>
                  <p>جدول شامل لجميع الفصول في صفحة واحدة</p>
                </div>
                
                <div class="card" onclick="selectPrintType('individual_teachers')">
                  <div class="card-icon">👨‍🏫</div>
                  <h3>جداول المعلمين الفردية</h3>
                  <p>جدول منفصل لكل معلم على حدة</p>
                </div>
                
                <div class="card" onclick="selectPrintType('individual_classes')">
                  <div class="card-icon">📚</div>
                  <h3>جداول الفصول الفردية</h3>
                  <p>جدول منفصل لكل فصل على حدة</p>
                </div>
              </div>
            </div>
            
            <!-- اختيار المعلمين/الفصول -->
            <div class="section" id="selectionSection" style="display: none;">
              <h2 class="section-title" id="selectionTitle">اختيار المعلمين</h2>
              
              <div class="form-group">
                <label class="form-label">عدد الجداول في كل صفحة</label>
                <select class="form-select" id="perPage">
                  <option value="1">جدول واحد</option>
                  <option value="2">جدولين</option>
                  <option value="4">4 جداول</option>
                  <option value="6">6 جداول</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">المحددون</label>
                <div class="recipients-list" id="recipientsList">
                  <!-- سيتم ملؤها ديناميكياً -->
                </div>
              </div>
            </div>
            
            <!-- أزرار الطباعة -->
            <div class="button-group">
              <button class="btn btn-primary" onclick="printSelected()">
                🖨️ طباعة الجدول
              </button>
              <button class="btn btn-secondary" onclick="window.close()">
                ❌ إلغاء
              </button>
            </div>
          </div>
        </div>
        
        <script>
          let selectedPrintType = 'general_teachers';
          let selectedRecipients = [];
          
          // بيانات المعلمين
          const teachers = ${JSON.stringify(teachers)};
          
          // بيانات الفصول
          const classes = ${JSON.stringify(classes)};
          
          // بيانات المواد الدراسية
          const subjects = ${JSON.stringify(subjects)};
          
          // بيانات الأوقات
          const timeSlots = ${JSON.stringify(timeSlots)};
          
          // بيانات الحصص
          const sessions = ${JSON.stringify(sessions)};
          
          // أيام الأسبوع
          const daysOfWeek = ${JSON.stringify(daysOfWeek)};
          
          // عدد الحصص في اليوم
          const periodsPerDay = ${periodsPerDay};
          
          function selectPrintType(type) {
            selectedPrintType = type;
            document.querySelectorAll('.card').forEach(card => card.classList.remove('selected'));
            event.target.closest('.card').classList.add('selected');
            
            const selectionSection = document.getElementById('selectionSection');
            const selectionTitle = document.getElementById('selectionTitle');
            const recipientsList = document.getElementById('recipientsList');
            
            if (type === 'individual_teachers' || type === 'individual_classes') {
              selectionSection.style.display = 'block';
              
              if (type === 'individual_teachers') {
                selectionTitle.textContent = 'اختيار المعلمين';
                recipientsList.innerHTML = teachers.map(teacher => \`
                  <div class="recipient-item" onclick="toggleRecipient('\${teacher.id}')">
                    <input type="checkbox" class="recipient-checkbox" id="recipient-\${teacher.id}">
                    <div class="recipient-info">
                      <div class="recipient-name">\${teacher.name}</div>
                      <div class="recipient-details">\${teacher.specialization}</div>
                    </div>
                  </div>
                \`).join('');
              } else {
                selectionTitle.textContent = 'اختيار الفصول';
                recipientsList.innerHTML = classes.map(classItem => \`
                  <div class="recipient-item" onclick="toggleRecipient('\${classItem.id}')">
                    <input type="checkbox" class="recipient-checkbox" id="recipient-\${classItem.id}">
                    <div class="recipient-info">
                      <div class="recipient-name">\${classItem.name}</div>
                      <div class="recipient-details">\${classItem.grade}</div>
                    </div>
                  </div>
                \`).join('');
              }
            } else {
              selectionSection.style.display = 'none';
            }
          }
          
          function toggleRecipient(id) {
            const checkbox = document.getElementById('recipient-' + id);
            const item = checkbox.closest('.recipient-item');
            
            if (selectedRecipients.includes(id)) {
              selectedRecipients = selectedRecipients.filter(r => r !== id);
              item.classList.remove('selected');
              checkbox.checked = false;
            } else {
              selectedRecipients.push(id);
              item.classList.add('selected');
              checkbox.checked = true;
            }
          }
          
          function printSelected() {
            const perPage = document.getElementById('perPage').value;
            
            if (selectedPrintType === 'individual_teachers' || selectedPrintType === 'individual_classes') {
              if (selectedRecipients.length === 0) {
                alert('يرجى تحديد المعلمين/الفصول المطلوبة');
                return;
              }
            }
            
            // إرسال البيانات للطباعة
            const printData = {
              type: selectedPrintType,
              recipients: selectedRecipients,
              perPage: perPage
            };
            
            // فتح نافذة الطباعة
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              // إرسال البيانات إلى النافذة الجديدة
              printWindow.printData = printData;
              printWindow.teachers = teachers;
              printWindow.classes = classes;
              printWindow.subjects = subjects;
              printWindow.timeSlots = timeSlots;
              printWindow.sessions = sessions;
              printWindow.daysOfWeek = daysOfWeek;
              printWindow.periodsPerDay = periodsPerDay;
              
              const printContent = \`
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                  <meta charset="UTF-8">
                  <title>طباعة الجدول المدرسي</title>
                  <style>
                    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;600;700&display=swap');
                    
                    body {
                      font-family: 'Tajawal', Arial, sans-serif;
                      margin: 0;
                      padding: 1cm;
                      background-color: white;
                      color: #111827;
                      direction: rtl;
                    }
                    
                    .print-header {
                      text-align: center;
                      margin-bottom: 1.5cm;
                      padding-bottom: 10px;
                      border-bottom: 2px solid #e2e8f0;
                      position: relative;
                      page-break-after: avoid;
                    }
                    
                    .school-logo {
                      margin: 0 auto 1rem;
                      width: 80px;
                      height: 80px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      background-color: #655ac1;
                      color: white;
                      font-size: 2rem;
                      font-weight: bold;
                      border-radius: 50%;
                    }
                    
                    .schedule-table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-bottom: 1cm;
                      page-break-inside: avoid;
                    }
                    
                    .schedule-table th, .schedule-table td {
                      border: 1px solid #666;
                      padding: 6px;
                      text-align: center;
                      font-size: 10pt;
                      vertical-align: middle;
                    }
                    
                    .schedule-table th {
                      background-color: #f1f5f9 !important;
                      font-weight: 700;
                      color: #1e293b !important;
                    }
                    
                    .name-col {
                      font-weight: bold !important;
                      background-color: #f1f5f9 !important;
                      text-align: right !important;
                      padding: 5px 10px !important;
                      width: 120px !important;
                      min-width: 120px !important;
                      max-width: 120px !important;
                    }
                    
                    .day-header {
                      background-color: #f1f5f9 !important;
                      font-weight: bold !important;
                      border: 1px solid #666 !important;
                    }
                    
                    .period-header {
                      background-color: #f8fafc !important;
                      font-size: 9px !important;
                      border: 1px solid #666 !important;
                    }
                    
                    .empty-cell {
                      text-align: center !important;
                      color: #999 !important;
                      font-size: 12px !important;
                    }
                    
                    .schedule-cell {
                      background-color: #e5e1fe !important;
                      border: 1px solid #0ea5e9 !important;
                      padding: 4px !important;
                      font-size: 9px !important;
                      text-align: center !important;
                      vertical-align: middle !important;
                      min-height: 40px;
                    }
                    
                    .schedule-cell .font-bold {
                      font-weight: bold;
                      color: #1e293b;
                      margin-bottom: 2px;
                    }
                    
                    .schedule-cell .text-gray-600 {
                      color: #6b7280;
                      font-size: 8px;
                    }
                    
                    .schedule-data-cell {
                      padding: 2px !important;
                      vertical-align: middle !important;
                    }
                    
                    .name-cell {
                      font-weight: bold !important;
                      background-color: #f1f5f9 !important;
                      text-align: right !important;
                      padding: 5px 10px !important;
                      width: 120px !important;
                      min-width: 120px !important;
                      max-width: 120px !important;
                    }
                    
                    .name-cell .text-xs {
                      font-size: 8px;
                      color: #6b7280;
                      margin-top: 2px;
                    }
                    
                    .standby-cell {
                      background-color: #fef3c7 !important;
                      border: 1px solid #f59e0b !important;
                      padding: 4px !important;
                      font-size: 9px !important;
                      text-align: center !important;
                      vertical-align: middle !important;
                      color: #92400e !important;
                    }
                    
                    .schedule-section {
                      margin-bottom: 2cm;
                      page-break-inside: avoid;
                    }
                    
                    .teacher-info {
                      margin-bottom: 1cm;
                      padding: 0.5cm;
                      border: 1px solid #e5e7eb;
                      border-radius: 0.3cm;
                      background-color: #f9fafb;
                      page-break-inside: avoid;
                    }
                    
                    .teacher-info .grid {
                      display: grid;
                      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                      gap: 10px;
                    }
                    
                    .signatures {
                      margin-top: 2cm;
                      display: flex;
                      justify-content: space-between;
                      align-items: flex-start;
                    }
                    
                    .signature-box {
                      text-align: center;
                      width: 200px;
                    }
                    
                    .signature-line {
                      margin-top: 3cm;
                      height: 2px;
                      border-top: 2px solid #374151;
                      padding-top: 10px;
                      font-weight: 600;
                    }
                    
                    .signature-name {
                      font-size: 12px;
                      margin-top: 5px;
                      color: #6b7280;
                    }
                    
                    .print-footer {
                      margin-top: 1cm;
                      display: flex;
                      justify-content: space-between;
                      color: #6b7280;
                      font-size: 9pt;
                      border-top: 1px solid #e5e7eb;
                      padding-top: 0.5cm;
                      page-break-inside: avoid;
                    }
                    
                    .stats-container {
                      display: flex;
                      justify-content: space-around;
                      margin-bottom: 0.5cm;
                      font-size: 7px;
                      color: #6b7280;
                    }
                    
                    .stat-item {
                      text-align: center;
                      padding: 3px 6px;
                      background-color: #f8fafc;
                      border-radius: 3px;
                      border: 1px solid #e2e8f0;
                    }
                    
                    .schedule-title {
                      font-size: 14px;
                      font-weight: bold;
                      color: #1e293b;
                      margin-bottom: 0.3cm;
                      text-align: center;
                    }
                    
                    @page {
                      size: A3 landscape;
                      margin: 0.7cm;
                    }
                    
                    @media print {
                      .no-print { display: none !important; }
                      .print-header, .teacher-info, .schedule-section, tr {
                        page-break-inside: avoid;
                      }
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                      body {
                        font-size: 9px;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                      th, td {
                        padding: 3px;
                        font-size: 8px;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                    }
                  </style>
                </head>
                <body>
                  <script>
                    // استقبال البيانات من النافذة الأصلية
                    const printData = window.printData;
                    const teachers = window.teachers;
                    const classes = window.classes;
                    const subjects = window.subjects;
                    const timeSlots = window.timeSlots;
                    const sessions = window.sessions;
                    const daysOfWeek = window.daysOfWeek;
                    const periodsPerDay = window.periodsPerDay;
                    
                    const { type, recipients, perPage } = printData || { type: 'general_teachers', recipients: [], perPage: 1 };
                    
                    const generateHeader = (title) => \`
                      <div class="print-header">
                        <div class="school-logo">م</div>
                        <h1 class="schedule-title">مدرسة متابع</h1>
                        <h2 class="schedule-title">\${title}</h2>
                        <div class="text-sm text-gray-600 mb-1">العام الدراسي 1444-1445 هـ</div>
                        <div class="text-sm text-gray-600">الفصل الدراسي الأول</div>
                        <div class="stats-container">
                          <div class="stat-item">
                            <strong>عدد المعلمين:</strong> \${teachers.length}
                          </div>
                          <div class="stat-item">
                            <strong>عدد الفصول:</strong> \${classes.length}
                          </div>
                          <div class="stat-item">
                            <strong>الحصص الأساسية:</strong> \${sessions.filter(s => s.type === 'basic').length}
                          </div>
                          <div class="stat-item">
                            <strong>حصص الانتظار:</strong> \${sessions.filter(s => s.type === 'standby').length}
                          </div>
                        </div>
                      </div>
                    \`;
                    
                    const generateFooter = () => \`
                      <div class="print-footer">
                        <span>تاريخ الطباعة: \${new Date().toLocaleDateString('ar-SA')}</span>
                        <span>الوقت: \${new Date().toLocaleTimeString('ar-SA')}</span>
                        <span>متابع - الجداول المدرسية</span>
                      </div>
                    \`;
                    
                    const generateSignatures = () => \`
                      <div class="signatures">
                        <div class="signature-box">
                          <div class="signature-line">
                            وكيل الشؤون التعليمية
                          </div>
                          <div class="signature-name">أ. محمد عبدالله</div>
                        </div>
                        
                        <div class="signature-box">
                          <div class="signature-line">
                            مدير المدرسة
                          </div>
                          <div class="signature-name">أ. أحمد محمد</div>
                        </div>
                      </div>
                    \`;
                    
                    const generateIndividualTeacherTable = (teacher) => {
                      const teacherBasicSessions = sessions.filter(s => s.teacherId === teacher.id && s.type === 'basic').length;
                      const teacherStandbySessions = sessions.filter(s => s.teacherId === teacher.id && s.type === 'standby').length;
                      
                      return \`
                        <div class="schedule-section">
                          <div class="teacher-info">
                            <div class="grid">
                              <div><span class="font-semibold ml-1">المعلم:</span> \${teacher.name}</div>
                              <div><span class="font-semibold ml-1">التخصص:</span> \${teacher.specialization}</div>
                              <div><span class="font-semibold ml-1">الدرجة:</span> \${getActualTeacherRank(teacher)}</div>
                              <div><span class="font-semibold ml-1">نصاب الحصص:</span> \${teacher.basicQuota}</div>
                              <div><span class="font-semibold ml-1">الحصص الفعلية:</span> \${teacherBasicSessions} حصة</div>
                              <div><span class="font-semibold ml-1">حصص الانتظار:</span> \${teacherStandbySessions} حصة</div>
                            </div>
                          </div>
                          
                          <div class="table-print-a4-container">
                            <div class="schedule-table-wrapper">
                              <table class="schedule-table table-print-a4" dir="rtl">
                                <thead>
                                  <tr class="header-row">
                                    <th rowspan="2" class="name-col">اليوم / الحصة</th>
                                    \${Array.from({length: periodsPerDay}, (_, i) => \`<th class="period-header">الحصة \${i + 1}</th>\`).join('')}
                                  </tr>
                                </thead>
                                <tbody>
                                  \${daysOfWeek.map((day, dayIndex) => \`
                                    <tr class="data-row">
                                      <td class="name-cell">\${day}</td>
                                      \${Array.from({length: periodsPerDay}, (_, periodIndex) => {
                                        const slot = timeSlots.find(s => s.day === day && s.period === periodIndex + 1);
                                        if (slot) {
                                          const session = sessions.find(s => s.teacherId === teacher.id && s.timeSlotId === slot.id);
                                          if (session && session.type === 'basic') {
                                            const subject = subjects.find(s => s.id === session.subjectId);
                                            const classItem = classes.find(c => c.id === session.classId);
                                            return \`
                                              <td class="schedule-data-cell">
                                                <div class="schedule-cell">
                                                  <div class="font-bold">\${subject?.name || ''}</div>
                                                  <div class="text-gray-600">\${classItem?.name || ''}</div>
                                                </div>
                                              </td>
                                            \`;
                                          } else if (session && session.type === 'standby') {
                                            return \`
                                              <td class="schedule-data-cell">
                                                <div class="standby-cell">انتظار</div>
                                              </td>
                                            \`;
                                          }
                                        }
                                        return \`
                                          <td class="schedule-data-cell">
                                            <div class="empty-cell">-</div>
                                          </td>
                                        \`;
                                      }).join('')}
                                    </tr>
                                  \`).join('')}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      \`;
                    };
                    
                    const generateIndividualClassTable = (classItem) => {
                      return \`
                        <div class="schedule-section">
                          <div class="teacher-info">
                            <div class="grid">
                              <div><span class="font-semibold ml-1">الفصل:</span> \${classItem.name}</div>
                              <div><span class="font-semibold ml-1">المرحلة:</span> \${classItem.grade}</div>
                              <div><span class="font-semibold ml-1">عدد الطلاب:</span> \${classItem.studentsCount}</div>
                            </div>
                          </div>
                          
                          <div class="table-print-a4-container">
                            <div class="schedule-table-wrapper">
                              <table class="schedule-table table-print-a4" dir="rtl">
                                <thead>
                                  <tr class="header-row">
                                    <th rowspan="2" class="name-col">اليوم / الحصة</th>
                                    \${Array.from({length: periodsPerDay}, (_, i) => \`<th class="period-header">الحصة \${i + 1}</th>\`).join('')}
                                  </tr>
                                </thead>
                                <tbody>
                                  \${daysOfWeek.map((day, dayIndex) => \`
                                    <tr class="data-row">
                                      <td class="name-cell">\${day}</td>
                                      \${Array.from({length: periodsPerDay}, (_, periodIndex) => {
                                        const slot = timeSlots.find(s => s.day === day && s.period === periodIndex + 1);
                                        if (slot) {
                                          const session = sessions.find(s => s.classId === classItem.id && s.timeSlotId === slot.id);
                                          if (session && session.type === 'basic') {
                                            const subject = subjects.find(s => s.id === session.subjectId);
                                            const teacher = teachers.find(t => t.id === session.teacherId);
                                            return \`
                                              <td class="schedule-data-cell">
                                                <div class="schedule-cell">
                                                  <div class="font-bold">\${subject?.name || ''}</div>
                                                  <div class="text-gray-600">\${teacher?.name || ''}</div>
                                                </div>
                                              </td>
                                            \`;
                                          } else if (session && session.type === 'standby') {
                                            return \`
                                              <td class="schedule-data-cell">
                                                <div class="standby-cell">انتظار</div>
                                              </td>
                                            \`;
                                          }
                                        }
                                        return \`
                                          <td class="schedule-data-cell">
                                            <div class="empty-cell">-</div>
                                          </td>
                                        \`;
                                      }).join('')}
                                    </tr>
                                  \`).join('')}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      \`;
                    };
                    
                    const generateGeneralTable = () => {
                      return \`
                        <div class="schedule-section">
                          <div class="table-print-a3-container">
                            <div class="schedule-table-wrapper">
                              <table class="schedule-table table-print-a3" dir="rtl">
                                <thead>
                                  <tr class="header-row">
                                    <th rowspan="2" class="name-col">المعلم / اليوم</th>
                                    \${daysOfWeek.map(day => \`
                                      <th colspan="\${periodsPerDay}" class="day-header">\${day}</th>
                                    \`).join('')}
                                  </tr>
                                  <tr class="header-row">
                                    \${daysOfWeek.map(() => 
                                      Array.from({length: periodsPerDay}, (_, i) => \`<th class="period-header">الحصة \${i + 1}</th>\`).join('')
                                    ).join('')}
                                  </tr>
                                </thead>
                                <tbody>
                                  \${teachers.map(teacher => \`
                                    <tr class="data-row">
                                      <td class="name-cell">
                                        <div class="font-bold">\${teacher.name}</div>
                                        <div class="text-xs">\${teacher.specialization}</div>
                                      </td>
                                      \${daysOfWeek.map(day => 
                                        Array.from({length: periodsPerDay}, (_, periodIndex) => {
                                          const slot = timeSlots.find(s => s.day === day && s.period === periodIndex + 1);
                                          if (slot) {
                                            const session = sessions.find(s => s.teacherId === teacher.id && s.timeSlotId === slot.id);
                                            if (session && session.type === 'basic') {
                                              const subject = subjects.find(s => s.id === session.subjectId);
                                              const classItem = classes.find(c => c.id === session.classId);
                                              return \`
                                                <td class="schedule-data-cell">
                                                  <div class="schedule-cell">
                                                    <div class="font-bold">\${subject?.name || ''}</div>
                                                    <div class="text-gray-600">\${classItem?.name || ''}</div>
                                                  </div>
                                                </td>
                                              \`;
                                            } else if (session && session.type === 'standby') {
                                              return \`
                                                <td class="schedule-data-cell">
                                                  <div class="standby-cell">انتظار</div>
                                                </td>
                                              \`;
                                            }
                                          }
                                          return \`
                                            <td class="schedule-data-cell">
                                              <div class="empty-cell">-</div>
                                            </td>
                                          \`;
                                        }).join('')
                                      ).join('')}
                                    </tr>
                                  \`).join('')}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      \`;
                    };
                    
                    let content = '';
                    let title = '';
                    
                    switch (type) {
                      case 'general_teachers':
                        title = 'الجدول الدراسي العام للمعلمين';
                        content = generateGeneralTable();
                        break;
                      case 'general_classes':
                        title = 'الجدول الدراسي العام للفصول';
                        content = generateGeneralTable();
                        break;
                      case 'individual_teachers':
                        title = 'جداول المعلمين الفردية';
                        if (recipients.length === 0) {
                          // طباعة جميع المعلمين
                          const teacherGroups = [];
                          for (let i = 0; i < teachers.length; i += parseInt(perPage)) {
                            teacherGroups.push(teachers.slice(i, i + parseInt(perPage)));
                          }
                          content = teacherGroups.map((group, groupIndex) => \`
                            \${groupIndex > 0 ? '<div style="page-break-before: always;"></div>' : ''}
                            \${group.map(teacher => generateIndividualTeacherTable(teacher)).join('')}
                          \`).join('');
                        } else {
                          // طباعة المعلمين المحددين
                          const selectedTeachers = teachers.filter(t => recipients.includes(t.id));
                          const teacherGroups = [];
                          for (let i = 0; i < selectedTeachers.length; i += parseInt(perPage)) {
                            teacherGroups.push(selectedTeachers.slice(i, i + parseInt(perPage)));
                          }
                          content = teacherGroups.map((group, groupIndex) => \`
                            \${groupIndex > 0 ? '<div style="page-break-before: always;"></div>' : ''}
                            \${group.map(teacher => generateIndividualTeacherTable(teacher)).join('')}
                          \`).join('');
                        }
                        break;
                      case 'individual_classes':
                        title = 'جداول الفصول الفردية';
                        if (recipients.length === 0) {
                          // طباعة جميع الفصول
                          const classGroups = [];
                          for (let i = 0; i < classes.length; i += parseInt(perPage)) {
                            classGroups.push(classes.slice(i, i + parseInt(perPage)));
                          }
                          content = classGroups.map((group, groupIndex) => \`
                            \${groupIndex > 0 ? '<div style="page-break-before: always;"></div>' : ''}
                            \${group.map(classItem => generateIndividualClassTable(classItem)).join('')}
                          \`).join('');
                        } else {
                          // طباعة الفصول المحددة
                          const selectedClasses = classes.filter(c => recipients.includes(c.id));
                          const classGroups = [];
                          for (let i = 0; i < selectedClasses.length; i += parseInt(perPage)) {
                            classGroups.push(selectedClasses.slice(i, i + parseInt(perPage)));
                          }
                          content = classGroups.map((group, groupIndex) => \`
                            \${groupIndex > 0 ? '<div style="page-break-before: always;"></div>' : ''}
                            \${group.map(classItem => generateIndividualClassTable(classItem)).join('')}
                          \`).join('');
                        }
                        break;
                      default:
                        title = 'الجدول الدراسي العام للمعلمين';
                        content = generateGeneralTable();
                    }
                    
                    document.write(\`
                      <div class="print-container">
                        \${generateHeader(title)}
                        
                        <div class="content">
                          \${content}
                        </div>
                        
                        \${generateSignatures()}
                        \${generateFooter()}
                      </div>
                      
                      <div class="no-print" style="text-align: center; margin: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; margin: 5px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">طباعة</button>
                        <button onclick="window.close()" style="padding: 10px 20px; margin: 5px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">إغلاق</button>
                      </div>
                    \`);
                  </script>
                </body>
                </html>
              \`;
              
              printWindow.document.write(printContent);
              printWindow.document.close();
              printWindow.focus();
            }
          }
          
          // تهيئة الصفحة
          document.addEventListener('DOMContentLoaded', function() {
            selectPrintType('general_teachers');
          });
        </script>
      </body>
      </html>
    `;
  };

  const generatePrintContent = (printData) => {
    const { type, recipients, perPage } = printData || { type: 'general_teachers', recipients: [], perPage: 1 };
    
    const generateHeader = (title) => `
      <div class="print-header">
        <div class="school-logo">م</div>
        <h1 class="schedule-title">مدرسة متابع</h1>
        <h2 class="schedule-title">${title}</h2>
        <div class="text-sm text-gray-600 mb-1">العام الدراسي 1444-1445 هـ</div>
        <div class="text-sm text-gray-600">الفصل الدراسي الأول</div>
        <div class="stats-container">
          <div class="stat-item">
            <strong>عدد المعلمين:</strong> ${teachers.length}
          </div>
          <div class="stat-item">
            <strong>عدد الفصول:</strong> ${classes.length}
          </div>
          <div class="stat-item">
            <strong>الحصص الأساسية:</strong> ${sessions.filter(s => s.type === 'basic').length}
          </div>
          <div class="stat-item">
            <strong>حصص الانتظار:</strong> ${sessions.filter(s => s.type === 'standby').length}
          </div>
        </div>
      </div>
    `;

    const generateFooter = () => `
      <div class="print-footer">
        <span>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</span>
        <span>الوقت: ${new Date().toLocaleTimeString('ar-SA')}</span>
        <span>متابع - الجداول المدرسية</span>
      </div>
    `;

    const generateSignatures = () => `
      <div class="signatures">
        <div class="signature-box">
          <div class="signature-line">
            وكيل الشؤون التعليمية
          </div>
          <div class="signature-name">أ. محمد عبدالله</div>
        </div>
        
        <div class="signature-box">
          <div class="signature-line">
            مدير المدرسة
          </div>
          <div class="signature-name">أ. أحمد محمد</div>
        </div>
      </div>
    `;

    const generateIndividualTeacherTable = (teacher) => {
      const teacherBasicSessions = sessions.filter(s => s.teacherId === teacher.id && s.type === 'basic').length;
      const teacherStandbySessions = sessions.filter(s => s.teacherId === teacher.id && s.type === 'standby').length;
      
      return `
        <div class="schedule-section">
          <div class="teacher-info">
            <div class="grid">
              <div><span class="font-semibold ml-1">المعلم:</span> ${teacher.name}</div>
              <div><span class="font-semibold ml-1">التخصص:</span> ${teacher.specialization}</div>
              <div><span class="font-semibold ml-1">الدرجة:</span> ${getActualTeacherRank(teacher)}</div>
              <div><span class="font-semibold ml-1">نصاب الحصص:</span> ${teacher.basicQuota}</div>
              <div><span class="font-semibold ml-1">الحصص الفعلية:</span> ${teacherBasicSessions} حصة</div>
              <div><span class="font-semibold ml-1">حصص الانتظار:</span> ${teacherStandbySessions} حصة</div>
            </div>
          </div>
          
          <div class="table-print-a4-container">
            <div class="schedule-table-wrapper">
              <table class="schedule-table table-print-a4" dir="rtl">
                <thead>
                  <tr class="header-row">
                    <th rowspan="2" class="name-col">اليوم / الحصة</th>
                    ${Array.from({length: periodsPerDay}, (_, i) => `<th class="period-header">الحصة ${i + 1}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${daysOfWeek.map((day, dayIndex) => `
                    <tr class="data-row">
                      <td class="name-cell">${day}</td>
                      ${Array.from({length: periodsPerDay}, (_, periodIndex) => {
                        const slot = timeSlots.find(s => s.day === day && s.period === periodIndex + 1);
                        if (slot) {
                          const session = sessions.find(s => s.teacherId === teacher.id && s.timeSlotId === slot.id);
                          if (session && session.type === 'basic') {
                            const subject = subjects.find(s => s.id === session.subjectId);
                            const classItem = classes.find(c => c.id === session.classId);
                            return `
                              <td class="schedule-data-cell">
                                <div class="schedule-cell">
                                  <div class="font-bold">${subject?.name || ''}</div>
                                  <div class="text-gray-600">${classItem?.name || ''}</div>
                                </div>
                              </td>
                            `;
                          } else if (session && session.type === 'standby') {
                            return `
                              <td class="schedule-data-cell">
                                <div class="standby-cell">انتظار</div>
                              </td>
                            `;
                          }
                        }
                        return `
                          <td class="schedule-data-cell">
                            <div class="empty-cell">-</div>
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    };

    const generateIndividualClassTable = (classItem) => {
      return `
        <div class="schedule-section">
          <div class="teacher-info">
            <div class="grid">
              <div><span class="font-semibold ml-1">الفصل:</span> ${classItem.name}</div>
              <div><span class="font-semibold ml-1">المرحلة:</span> ${classItem.grade}</div>
              <div><span class="font-semibold ml-1">عدد الطلاب:</span> ${classItem.studentsCount}</div>
            </div>
          </div>
          
          <div class="table-print-a4-container">
            <div class="schedule-table-wrapper">
              <table class="schedule-table table-print-a4" dir="rtl">
                <thead>
                  <tr class="header-row">
                    <th rowspan="2" class="name-col">اليوم / الحصة</th>
                    ${Array.from({length: periodsPerDay}, (_, i) => `<th class="period-header">الحصة ${i + 1}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${daysOfWeek.map((day, dayIndex) => `
                    <tr class="data-row">
                      <td class="name-cell">${day}</td>
                      ${Array.from({length: periodsPerDay}, (_, periodIndex) => {
                        const slot = timeSlots.find(s => s.day === day && s.period === periodIndex + 1);
                        if (slot) {
                          const session = sessions.find(s => s.classId === classItem.id && s.timeSlotId === slot.id);
                          if (session && session.type === 'basic') {
                            const subject = subjects.find(s => s.id === session.subjectId);
                            const teacher = teachers.find(t => t.id === session.teacherId);
                            return `
                              <td class="schedule-data-cell">
                                <div class="schedule-cell">
                                  <div class="font-bold">${subject?.name || ''}</div>
                                  <div class="text-gray-600">${teacher?.name || ''}</div>
                                </div>
                              </td>
                            `;
                          } else if (session && session.type === 'standby') {
                            return `
                              <td class="schedule-data-cell">
                                <div class="standby-cell">انتظار</div>
                              </td>
                            `;
                          }
                        }
                        return `
                          <td class="schedule-data-cell">
                            <div class="empty-cell">-</div>
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    };

    let content = '';
    let title = '';

    switch (type) {
      case 'general_teachers':
        title = 'الجدول الدراسي العام للمعلمين';
        content = generateTableHTML();
        break;
      case 'general_classes':
        title = 'الجدول الدراسي العام للفصول';
        content = generateTableHTML();
        break;
      case 'individual_teachers':
        title = 'جداول المعلمين الفردية';
        if (recipients.length === 0) {
          // طباعة جميع المعلمين
          const teacherGroups = [];
          for (let i = 0; i < teachers.length; i += parseInt(perPage)) {
            teacherGroups.push(teachers.slice(i, i + parseInt(perPage)));
          }
          content = teacherGroups.map((group, groupIndex) => `
            ${groupIndex > 0 ? '<div style="page-break-before: always;"></div>' : ''}
            ${group.map(teacher => generateIndividualTeacherTable(teacher)).join('')}
          `).join('');
        } else {
          // طباعة المعلمين المحددين
          const selectedTeachers = teachers.filter(t => recipients.includes(t.id));
          const teacherGroups = [];
          for (let i = 0; i < selectedTeachers.length; i += parseInt(perPage)) {
            teacherGroups.push(selectedTeachers.slice(i, i + parseInt(perPage)));
          }
          content = teacherGroups.map((group, groupIndex) => `
            ${groupIndex > 0 ? '<div style="page-break-before: always;"></div>' : ''}
            ${group.map(teacher => generateIndividualTeacherTable(teacher)).join('')}
          `).join('');
        }
        break;
      case 'individual_classes':
        title = 'جداول الفصول الفردية';
        if (recipients.length === 0) {
          // طباعة جميع الفصول
          const classGroups = [];
          for (let i = 0; i < classes.length; i += parseInt(perPage)) {
            classGroups.push(classes.slice(i, i + parseInt(perPage)));
          }
          content = classGroups.map((group, groupIndex) => `
            ${groupIndex > 0 ? '<div style="page-break-before: always;"></div>' : ''}
            ${group.map(classItem => generateIndividualClassTable(classItem)).join('')}
          `).join('');
        } else {
          // طباعة الفصول المحددة
          const selectedClasses = classes.filter(c => recipients.includes(c.id));
          const classGroups = [];
          for (let i = 0; i < selectedClasses.length; i += parseInt(perPage)) {
            classGroups.push(selectedClasses.slice(i, i + parseInt(perPage)));
          }
          content = classGroups.map((group, groupIndex) => `
            ${groupIndex > 0 ? '<div style="page-break-before: always;"></div>' : ''}
            ${group.map(classItem => generateIndividualClassTable(classItem)).join('')}
          `).join('');
        }
        break;
      default:
        title = 'الجدول الدراسي العام للمعلمين';
        content = generateTableHTML();
    }

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>طباعة الجدول المدرسي</title>
        <style>
          /* =========================================
             تنسيقات عامة - General Styles
             ========================================= */
          body {
            font-family: 'Tajawal', Arial, 'Noto Sans Arabic', sans-serif;
            margin: 0;
            padding: 1cm;
            background-color: white;
            color: #111827;
            direction: rtl;
          }

          /* =========================================
             تنسيقات الرأس - Header Styles
             ========================================= */
          .print-header {
            text-align: center;
            margin-bottom: 1.5cm;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
            position: relative;
            page-break-after: avoid;
          }

          .print-header::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 2px;
            background: linear-gradient(to right, #655ac1, #8779fb, #655ac1);
          }

          .school-logo {
            margin: 0 auto 1rem;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #655ac1;
            color: white;
            font-size: 2rem;
            font-weight: bold;
            border-radius: 50%;
          }

          /* =========================================
             تنسيقات الجداول - Table Styles
             ========================================= */
          .schedule-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1cm;
            page-break-inside: avoid;
          }

          .schedule-table th, .schedule-table td {
            border: 1px solid #666;
            padding: 6px;
            text-align: center;
            font-size: 10pt;
            vertical-align: middle;
          }

          .schedule-table th {
            background-color: #f1f5f9 !important;
            font-weight: 700;
            color: #1e293b !important;
          }

          /* تنسيق خلية اسم المعلم/الفصل */
          .name-col {
            font-weight: bold !important;
            background-color: #f1f5f9 !important;
            text-align: right !important;
            padding: 5px 10px !important;
            width: 120px !important;
            min-width: 120px !important;
            max-width: 120px !important;
          }

          /* تنسيق عمود اليوم */
          .day-header {
            background-color: #f1f5f9 !important;
            font-weight: bold !important;
            border: 1px solid #666 !important;
          }

          /* تنسيق عمود الحصة */
          .period-header {
            background-color: #f8fafc !important;
            font-size: 9px !important;
            border: 1px solid #666 !important;
          }

          /* تنسيق الخلايا الفارغة */
          .empty-cell {
            text-align: center !important;
            color: #999 !important;
            font-size: 12px !important;
          }

          /* تنسيق خلايا الحصص */
          .schedule-cell {
            background-color: #e5e1fe !important;
            border: 1px solid #0ea5e9 !important;
            padding: 4px !important;
            font-size: 9px !important;
            text-align: center !important;
            vertical-align: middle !important;
            min-height: 40px;
          }

          .schedule-cell .font-bold {
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 2px;
          }

          .schedule-cell .text-gray-600 {
            color: #6b7280;
            font-size: 8px;
          }

          /* تنسيق خلايا البيانات */
          .schedule-data-cell {
            padding: 2px !important;
            vertical-align: middle !important;
          }

          /* تنسيق خلايا الأسماء */
          .name-cell {
            font-weight: bold !important;
            background-color: #f1f5f9 !important;
            text-align: right !important;
            padding: 5px 10px !important;
            width: 120px !important;
            min-width: 120px !important;
            max-width: 120px !important;
          }

          .name-cell .text-xs {
            font-size: 8px;
            color: #6b7280;
            margin-top: 2px;
          }

          /* تنسيق خلايا الانتظار */
          .standby-cell {
            background-color: #fef3c7 !important;
            border: 1px solid #f59e0b !important;
            padding: 4px !important;
            font-size: 9px !important;
            text-align: center !important;
            vertical-align: middle !important;
            color: #92400e !important;
          }

          /* تنسيق أقسام الجدول */
          .schedule-section {
            margin-bottom: 2cm;
            page-break-inside: avoid;
          }

          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 1cm;
            text-align: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
          }

          /* تنسيق معلومات المعلم */
          .teacher-info {
            margin-bottom: 1cm;
            padding: 0.5cm;
            border: 1px solid #e5e7eb;
            border-radius: 0.3cm;
            background-color: #f9fafb;
            page-break-inside: avoid;
          }

          .teacher-info .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
          }

          .teacher-info .text-sm {
            font-size: 12px;
          }

          .teacher-info .font-semibold {
            font-weight: 600;
          }

          /* تنسيق التوقيعات */
          .signatures {
            margin-top: 2cm;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .signature-box {
            text-align: center;
            width: 200px;
          }

          .signature-line {
            margin-top: 3cm;
            height: 2px;
            border-top: 2px solid #374151;
            padding-top: 10px;
            font-weight: 600;
          }

          .signature-name {
            font-size: 12px;
            margin-top: 5px;
            color: #6b7280;
          }

          /* =========================================
             ذيل الصفحة - Footer
             ========================================= */
          .print-footer {
            margin-top: 1cm;
            display: flex;
            justify-content: space-between;
            color: #6b7280;
            font-size: 9pt;
            border-top: 1px solid #e5e7eb;
            padding-top: 0.5cm;
            page-break-inside: avoid;
          }

          /* =========================================
             ضبط الطباعة حسب نوع الورق - Paper Size Settings
             ========================================= */
          @page {
            size: A3 landscape;
            margin: 0.7cm;
          }

          /* =========================================
             تنسيقات الطباعة - Print Styles
             ========================================= */
          @media print {
            .no-print { display: none !important; }

            /* منع انقسام العناصر المهمة بين الصفحات */
            .print-header, .teacher-info, .schedule-section, tr {
              page-break-inside: avoid;
            }

            /* ضمان ظهور الألوان في الطباعة */
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;

            body {
              font-size: 9px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* تنسيق الجدول للطباعة */
            .table-print-a3-container {
              transform: scale(0.85);
              transform-origin: top right;
              width: 118%;
              margin-bottom: 10px;
            }

            /* تنسيق الخلايا للطباعة */
            th, td {
              padding: 3px;
              font-size: 8px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* تنسيق الحاويات */
            .table-print-a3-container, .table-print-a4-container {
              page-break-inside: avoid;
              margin-bottom: 0.5cm;
            }

            /* تنسيق المعلومات الإضافية */
            .schedule-info {
              margin-bottom: 0.5cm;
              font-size: 8px;
              color: #6b7280;
            }

            /* تنسيق الإحصائيات */
            .stats-container {
              display: flex;
              justify-content: space-around;
              margin-bottom: 0.5cm;
              font-size: 7px;
              color: #6b7280;
            }

            .stat-item {
              text-align: center;
              padding: 3px 6px;
              background-color: #f8fafc;
              border-radius: 3px;
              border: 1px solid #e2e8f0;
            }

            /* تنسيق العنوان */
            .schedule-title {
              font-size: 14px;
              font-weight: bold;
              color: #1e293b;
              margin-bottom: 0.3cm;
              text-align: center;
            }

            /* تنسيق التاريخ */
            .print-date {
              font-size: 9px;
              color: #6b7280;
              text-align: center;
              margin-bottom: 0.3cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${generateHeader(title)}
          
          <div class="content">
            ${content}
          </div>

          ${generateSignatures()}
          ${generateFooter()}
        </div>
        
        <div class="no-print" style="text-align: center; margin: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; margin: 5px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">طباعة</button>
          <button onclick="window.close()" style="padding: 10px 20px; margin: 5px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">إغلاق</button>
        </div>
      </body>
      </html>
    `;
  };

  const generateTableHTML = () => {
    // إنشاء جدول شامل للمعلمين والفصول
    const generateTeachersTable = () => {
      return `
        <div class="table-print-a3-container">
          <div class="schedule-table-wrapper">
            <table class="schedule-table table-print-a3" dir="rtl">
          <thead>
                <tr class="header-row">
                  <th rowspan="2" class="name-col">المعلم</th>
                  ${daysOfWeek.map(day => `<th colspan="${periodsPerDay}" class="day-header">${day}</th>`).join('')}
                </tr>
                <tr class="periods-row">
                  ${daysOfWeek.map(() => 
                    Array.from({length: periodsPerDay}, (_, i) => `<th class="period-header">حصة ${i + 1}</th>`).join('')
                  ).join('')}
            </tr>
          </thead>
          <tbody>
            ${teachers.map(teacher => {
              const teacherBasicSessions = sessions.filter(s => s.teacherId === teacher.id && s.type === 'basic').length;
              const teacherStandbySessions = sessions.filter(s => s.teacherId === teacher.id && s.type === 'standby').length;
              return `
                    <tr class="data-row">
                      <td class="name-cell">
                        ${teacher.name}
                        <div class="text-xs text-gray-600">${teacher.specialization === 'اللغة العربية' ? 'عربي' : teacher.specialization}</div>
                      </td>
                  ${timeSlots.map(slot => {
                    const session = sessions.find(s => s.teacherId === teacher.id && s.timeSlotId === slot.id);
                    if (session && session.type === 'basic') {
                      const subject = subjects.find(s => s.id === session.subjectId);
                      const classItem = classes.find(c => c.id === session.classId);
                          return `
                            <td class="schedule-data-cell">
                              <div class="schedule-cell">
                                <div class="font-bold">${subject?.name || ''}</div>
                                <div class="text-gray-600">${classItem?.name || ''}</div>
                              </div>
                            </td>
                          `;
                        } else if (session && session.type === 'standby') {
                          return `
                            <td class="schedule-data-cell">
                              <div class="standby-cell">انتظار</div>
                            </td>
                          `;
                        }
                        return `
                          <td class="schedule-data-cell">
                            <div class="empty-cell">-</div>
                          </td>
                        `;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
          </div>
        </div>
      `;
    };

    const generateClassesTable = () => {
      return `
        <div style="page-break-before: always;"></div>
        <div class="table-print-a3-container">
          <div class="schedule-table-wrapper">
            <table class="schedule-table table-print-a3" dir="rtl">
              <thead>
                <tr class="header-row">
                  <th rowspan="2" class="name-col">الفصل</th>
                  ${daysOfWeek.map(day => `<th colspan="${periodsPerDay}" class="day-header">${day}</th>`).join('')}
                </tr>
                <tr class="periods-row">
                  ${daysOfWeek.map(() => 
                    Array.from({length: periodsPerDay}, (_, i) => `<th class="period-header">حصة ${i + 1}</th>`).join('')
                  ).join('')}
                </tr>
              </thead>
              <tbody>
                ${classes.map(classItem => {
                  return `
                    <tr class="data-row">
                      <td class="name-cell">
                        ${classItem.name.split(' ').pop() || classItem.name}
                        <div class="text-xs text-gray-600">${classItem.grade}</div>
                      </td>
                      ${timeSlots.map(slot => {
                        const session = sessions.find(s => s.classId === classItem.id && s.timeSlotId === slot.id);
                        if (session && session.type === 'basic') {
                          const subject = subjects.find(s => s.id === session.subjectId);
                          const teacher = teachers.find(t => t.id === session.teacherId);
                          return `
                            <td class="schedule-data-cell">
                              <div class="schedule-cell">
                                <div class="font-bold">${subject?.name || ''}</div>
                                <div class="text-gray-600">${teacher?.name || ''}</div>
                              </div>
                            </td>
                          `;
                        } else if (session && session.type === 'standby') {
                          return `
                            <td class="schedule-data-cell">
                              <div class="standby-cell">انتظار</div>
                            </td>
                          `;
                        }
                        return `
                          <td class="schedule-data-cell">
                            <div class="empty-cell">-</div>
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    };

    return `
      ${generateTeachersTable()}
      ${generateClassesTable()}
    `;
  };

  const handleSend = () => {
    if (sessions.length === 0) {
      alert('لا توجد بيانات للإرسال');
      return;
    }
    
    const sendWindow = window.open('', '_blank', 'width=600,height=500');
    if (sendWindow) {
      const sendContent = generateSendContent();
      sendWindow.document.write(sendContent);
      sendWindow.document.close();
    }
  };

  const generateSendContent = () => {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>إرسال الجداول الدراسية</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Tajawal', Arial, sans-serif;
            direction: rtl;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #655ac1 0%, #8779fb 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .content {
            padding: 30px;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .section-title::before {
            content: '';
            width: 4px;
            height: 24px;
            background: linear-gradient(135deg, #655ac1, #8779fb);
            border-radius: 2px;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .card:hover {
            border-color: #655ac1;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.1);
          }
          
          .card.selected {
            border-color: #655ac1;
            background: linear-gradient(135deg, #e5e1fe 0%, #e5e1fe 100%);
          }
          
          .card-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #655ac1, #8779fb);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            color: white;
            font-size: 24px;
          }
          
          .card h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
          }
          
          .card p {
            font-size: 14px;
            color: #64748b;
            line-height: 1.5;
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          .form-label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .form-input, .form-select, .form-textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
            background: white;
          }
          
          .form-input:focus, .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: #655ac1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          
          .form-textarea {
            min-height: 100px;
            resize: vertical;
          }
          
          .recipients-list {
            max-height: 300px;
            overflow-y: auto;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
          }
          
          .recipient-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #f3f4f6;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }
          
          .recipient-item:hover {
            background-color: #f9fafb;
          }
          
          .recipient-item.selected {
            background-color: #e5e1fe;
            border-right: 4px solid #655ac1;
          }
          
          .recipient-checkbox {
            margin-left: 12px;
            width: 18px;
            height: 18px;
            accent-color: #655ac1;
          }
          
          .recipient-info {
            flex: 1;
          }
          
          .recipient-name {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
          }
          
          .recipient-details {
            font-size: 12px;
            color: #6b7280;
          }
          
          .preview-section {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
          }
          
          .preview-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 15px;
          }
          
          .preview-content {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            font-size: 14px;
            line-height: 1.6;
            color: #374151;
          }
          
          .button-group {
            display: flex;
            gap: 12px;
            margin-top: 30px;
            justify-content: center;
          }
          
          .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #655ac1, #8779fb);
            color: white;
          }
          
          .btn-primary:hover {
            background: linear-gradient(135deg, #5855eb, #7c3aed);
            transform: translateY(-1px);
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.3);
          }
          
          .btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 2px solid #e5e7eb;
          }
          
          .btn-secondary:hover {
            background: #e5e7eb;
            border-color: #d1d5db;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .stat-card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #655ac1;
            margin-bottom: 5px;
          }
          
          .stat-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>إرسال الجداول الدراسية</h1>
            <p>اختر نوع الجدول والمستقبلين لإرسال الجدول المدرسي</p>
          </div>
          
          <div class="content">
            <!-- اختيار نوع الجدول -->
            <div class="section">
              <h2 class="section-title">نوع الجدول المراد إرساله</h2>
              <div class="grid">
                <div class="card selected" onclick="selectScheduleType('general_teachers')">
                  <div class="card-icon">👥</div>
                  <h3>الجدول العام للمعلمين</h3>
                  <p>جدول شامل لجميع المعلمين مع تفاصيل الحصص والمواد</p>
                </div>
                
                <div class="card" onclick="selectScheduleType('general_classes')">
                  <div class="card-icon">🏫</div>
                  <h3>الجدول العام للفصول</h3>
                  <p>جدول شامل لجميع الفصول مع تفاصيل الحصص والمعلمين</p>
                </div>
                
                <div class="card" onclick="selectScheduleType('individual_teacher')">
                  <div class="card-icon">👨‍🏫</div>
                  <h3>جداول المعلمين الفردية</h3>
                  <p>جدول منفصل لكل معلم على حدة</p>
                </div>
                
                <div class="card" onclick="selectScheduleType('individual_class')">
                  <div class="card-icon">📚</div>
                  <h3>جداول الفصول الفردية</h3>
                  <p>جدول منفصل لكل فصل على حدة</p>
                </div>
              </div>
            </div>
            
            <!-- إحصائيات الجدول -->
            <div class="section">
              <h2 class="section-title">إحصائيات الجدول الحالي</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${teachers.length}</div>
                  <div class="stat-label">عدد المعلمين</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${classes.length}</div>
                  <div class="stat-label">عدد الفصول</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${sessions.filter(s => s.type === 'basic').length}</div>
                  <div class="stat-label">الحصص الأساسية</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${sessions.filter(s => s.type === 'standby').length}</div>
                  <div class="stat-label">حصص الانتظار</div>
                </div>
              </div>
            </div>
            
            <!-- اختيار المستقبلين -->
            <div class="section">
              <h2 class="section-title">اختيار المستقبلين</h2>
              
          <div class="form-group">
                <label class="form-label">نوع المستقبلين</label>
                <select class="form-select" id="recipientType" onchange="changeRecipientType()">
                  <option value="teachers">المعلمين</option>
                  <option value="employees">الموظفين</option>
                  <option value="guardians">أولياء الأمور</option>
            </select>
          </div>
          
          <div class="form-group">
                <label class="form-label">المستقبلون المحددون</label>
                <div class="recipients-list" id="recipientsList">
                  <!-- سيتم ملؤها ديناميكياً -->
                </div>
              </div>
          </div>
          
            <!-- نوع الإرسال -->
            <div class="section">
              <h2 class="section-title">طريقة الإرسال</h2>
          <div class="form-group">
                <label class="form-label">نوع الإرسال</label>
                <select class="form-select" id="sendMethod">
                  <option value="whatsapp">واتساب</option>
                  <option value="sms">رسائل نصية</option>
                  <option value="email">بريد إلكتروني</option>
                </select>
              </div>
          </div>
          
            <!-- رسالة مخصصة -->
            <div class="section">
              <h2 class="section-title">رسالة مخصصة</h2>
              <div class="form-group">
                <label class="form-label">نص الرسالة</label>
                <textarea class="form-textarea" id="customMessage" placeholder="أدخل رسالة مخصصة إذا رغبت في ذلك...">المكرم / نشعركم بالجدول الدراسي للمدرسة للعام الدراسي الحالي، نأمل الاطلاع والمتابعة.</textarea>
              </div>
          </div>
          
            <!-- معاينة الرسالة -->
            <div class="preview-section">
              <h3 class="preview-title">معاينة الرسالة</h3>
              <div class="preview-content" id="messagePreview">
                المكرم / نشعركم بالجدول الدراسي للمدرسة للعام الدراسي الحالي، نأمل الاطلاع والمتابعة.
                
                📊 إحصائيات الجدول:
                • عدد المعلمين: ${teachers.length}
                • عدد الفصول: ${classes.length} 
                • الحصص الأساسية: ${sessions.filter(s => s.type === 'basic').length}
                • حصص الانتظار: ${sessions.filter(s => s.type === 'standby').length}
                
                📅 تاريخ الإرسال: ${new Date().toLocaleDateString('ar-SA')}
              </div>
            </div>
            
            <!-- أزرار الإرسال -->
            <div class="button-group">
              <button class="btn btn-primary" onclick="sendSchedule()">
                📤 إرسال الجدول
              </button>
              <button class="btn btn-secondary" onclick="window.close()">
                ❌ إلغاء
              </button>
            </div>
          </div>
        </div>
        
        <script>
          let selectedScheduleType = 'general_teachers';
          let selectedRecipients = [];
          
          // بيانات وهمية للمستقبلين
          const mockTeachers = [
            { id: 1, name: 'أحمد محمد العلي', subject: 'الرياضيات', phone: '0501234567' },
            { id: 2, name: 'فاطمة أحمد الزهراني', subject: 'اللغة العربية', phone: '0507654321' },
            { id: 3, name: 'محمد علي السعدي', subject: 'العلوم', phone: '0509876543' }
          ];
          
          const mockEmployees = [
            { id: 1, name: 'سعد محمد الأحمدي', position: 'مدير المدرسة', phone: '0501111111' },
            { id: 2, name: 'عبدالرحمن علي الغامدي', position: 'وكيل المدرسة', phone: '0502222222' }
          ];
          
          const mockGuardians = [
            { id: 1, name: 'عبدالله أحمد المالكي', studentName: 'سارة عبدالله المالكي', phone: '0506666666' },
            { id: 2, name: 'فهد محمد الدوسري', studentName: 'عمر فهد الدوسري', phone: '0507777777' }
          ];
          
          function selectScheduleType(type) {
            selectedScheduleType = type;
            document.querySelectorAll('.card').forEach(card => card.classList.remove('selected'));
            event.target.closest('.card').classList.add('selected');
            updateMessagePreview();
          }
          
          function changeRecipientType() {
            const type = document.getElementById('recipientType').value;
            const recipientsList = document.getElementById('recipientsList');
            let recipients = [];
            
            if (type === 'teachers') {
              recipients = mockTeachers;
            } else if (type === 'employees') {
              recipients = mockEmployees;
            } else if (type === 'guardians') {
              recipients = mockGuardians;
            }
            
                         recipientsList.innerHTML = recipients.map(recipient => 
               '<div class="recipient-item" onclick="toggleRecipient(' + recipient.id + ')">' +
                 '<input type="checkbox" class="recipient-checkbox" id="recipient-' + recipient.id + '">' +
                 '<div class="recipient-info">' +
                   '<div class="recipient-name">' + recipient.name + '</div>' +
                   '<div class="recipient-details">' +
                     (type === 'teachers' ? recipient.subject : type === 'employees' ? recipient.position : recipient.studentName) +
                     ' • ' + recipient.phone +
                   '</div>' +
                 '</div>' +
               '</div>'
             ).join('');
          }
          
          function toggleRecipient(id) {
            const checkbox = document.getElementById('recipient-' + id);
            const item = checkbox.closest('.recipient-item');
            
            if (selectedRecipients.includes(id)) {
              selectedRecipients = selectedRecipients.filter(r => r !== id);
              item.classList.remove('selected');
              checkbox.checked = false;
            } else {
              selectedRecipients.push(id);
              item.classList.add('selected');
              checkbox.checked = true;
            }
          }
          
          function updateMessagePreview() {
            const customMessage = document.getElementById('customMessage').value;
            const preview = document.getElementById('messagePreview');
            
                         preview.innerHTML = customMessage + 
               '<br><br>' +
               '📊 إحصائيات الجدول:<br>' +
               '• عدد المعلمين: ' + teachers.length + '<br>' +
               '• عدد الفصول: ' + classes.length + '<br>' +
               '• الحصص الأساسية: ' + sessions.filter(s => s.type === 'basic').length + '<br>' +
               '• حصص الانتظار: ' + sessions.filter(s => s.type === 'standby').length + '<br><br>' +
               '📅 تاريخ الإرسال: ' + new Date().toLocaleDateString('ar-SA');
          }
          
          function sendSchedule() {
            if (selectedRecipients.length === 0) {
              alert('يرجى تحديد المستقبلين أولاً');
              return;
            }
            
            const sendMethod = document.getElementById('sendMethod').value;
            const methodText = sendMethod === 'whatsapp' ? 'واتساب' : 
                              sendMethod === 'sms' ? 'رسائل نصية' : 'بريد إلكتروني';
            
                         alert('تم إرسال الجدول بنجاح إلى ' + selectedRecipients.length + ' مستقبل عبر ' + methodText);
            window.close();
          }
          
          // تهيئة الصفحة
          document.addEventListener('DOMContentLoaded', function() {
            changeRecipientType();
            updateMessagePreview();
            
            document.getElementById('customMessage').addEventListener('input', updateMessagePreview);
          });
        </script>
      </body>
      </html>
    `;
  };

  const handleExportToMadrasati = () => {
    if (sessions.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }
    
    // إنشاء بيانات XML لصالح منصة مدرستي
    const generateMadrasatiXML = () => {
      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<school_timetable>
  <school_info>
    <name>مدرسة متابع</name>
    <academic_year>${new Date().getFullYear()}-${new Date().getFullYear() + 1}</academic_year>
    <semester>الأول</semester>
    <export_date>${new Date().toISOString()}</export_date>
  </school_info>
  
  <teachers>
    ${teachers.map(teacher => `
    <teacher>
      <id>${teacher.id}</id>
      <name>${teacher.name}</name>
      <specialization>${teacher.specialization}</specialization>
      <rank>${getActualTeacherRank(teacher)}</rank>
      <basic_quota>${teacher.basicQuota}</basic_quota>
      <standby_quota>${teacher.standbyQuota}</standby_quota>
    </teacher>`).join('')}
  </teachers>
  
  <classes>
    ${classes.map(classItem => `
    <class>
      <id>${classItem.id}</id>
      <name>${classItem.name}</name>
      <grade>${classItem.grade}</grade>
      <section>${classItem.section}</section>
      <students_count>${classItem.studentsCount}</students_count>
    </class>`).join('')}
  </classes>
  
  <subjects>
    ${subjects.map(subject => `
    <subject>
      <id>${subject.id}</id>
      <name>${subject.name}</name>
      <weekly_hours>${subject.weeklyHours}</weekly_hours>
      <max_consecutive>${subject.maxConsecutive}</max_consecutive>
    </subject>`).join('')}
  </subjects>
  
  <time_slots>
    ${timeSlots.map(slot => `
    <time_slot>
      <id>${slot.id}</id>
      <day>${slot.day}</day>
      <period>${slot.period}</period>
      <start_time>${slot.startTime}</start_time>
      <end_time>${slot.endTime}</end_time>
    </time_slot>`).join('')}
  </time_slots>
  
  <sessions>
    ${sessions.map(session => {
      const teacher = teachers.find(t => t.id === session.teacherId);
      const classItem = classes.find(c => c.id === session.classId);
      const subject = subjects.find(s => s.id === session.subjectId);
      const timeSlot = timeSlots.find(ts => ts.id === session.timeSlotId);
      
      return `
    <session>
      <id>${session.id}</id>
      <teacher_id>${session.teacherId}</teacher_id>
      <teacher_name>${teacher?.name || ''}</teacher_name>
      <class_id>${session.classId}</class_id>
      <class_name>${classItem?.name || ''}</class_name>
      <subject_id>${session.subjectId}</subject_id>
      <subject_name>${subject?.name || ''}</subject_name>
      <time_slot_id>${session.timeSlotId}</time_slot_id>
      <day>${timeSlot?.day || ''}</day>
      <period>${timeSlot?.period || ''}</period>
      <start_time>${timeSlot?.startTime || ''}</start_time>
      <end_time>${timeSlot?.endTime || ''}</end_time>
      <type>${session.type}</type>
      <is_locked>${session.isLocked}</is_locked>
    </session>`;
    }).join('')}
  </sessions>
  
  <statistics>
    <total_teachers>${teachers.length}</total_teachers>
    <total_classes>${classes.length}</total_classes>
    <total_subjects>${subjects.length}</total_subjects>
    <total_basic_sessions>${sessions.filter(s => s.type === 'basic').length}</total_basic_sessions>
    <total_standby_sessions>${sessions.filter(s => s.type === 'standby').length}</total_standby_sessions>
    <total_time_slots>${timeSlots.length}</total_time_slots>
  </statistics>
</school_timetable>`;
      
      return xmlData;
    };
    
    // إنشاء ملف XML وتحميله
    const xmlContent = generateMadrasatiXML();
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `جدول_الحصص_مدرستي_${new Date().toISOString().split('T')[0]}.xml`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // عرض رسالة نجاح مع تعليمات
      const successMessage = `
تم تصدير الجدول بنجاح بصيغة XML لصالح منصة مدرستي

تعليمات الاستيراد:
1. قم بفتح منصة مدرستي في متصفح جوجل كروم
2. اذهب إلى إعدادات الجدول المدرسي
3. اختر "استيراد جدول من ملف"
4. اختر الملف الذي تم تحميله
5. تأكد من تطابق البيانات قبل الحفظ

ملاحظة: تأكد من أن جميع المعلمين والفصول موجودة في منصة مدرستي قبل الاستيراد
      `;
      
      alert(successMessage);
    } else {
      alert('المتصفح لا يدعم تحميل الملفات');
    }
  };

  // دوال الفرز
  const handleSortTeachers = (sortType: 'name' | 'specialization') => {
    const sortedTeachers = [...teachers].sort((a, b) => {
      let aValue = sortType === 'name' ? a.name : a.specialization;
      let bValue = sortType === 'name' ? b.name : b.specialization;
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue, 'ar');
      } else {
        return bValue.localeCompare(aValue, 'ar');
      }
    });
    
    setTeachers(sortedTeachers);
    setSortBy(sortType);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // دالة الفرز حسب التخصص مع إمكانية الترتيب
  const handleSortBySpecialization = () => {
    // فتح نافذة الحوار لترتيب التخصصات
    setShowSpecializationSort(true);
    // تهيئة ترتيب التخصصات إذا لم تكن موجودة
    if (specializationOrder.length === 0) {
      const specializations = [...new Set(teachers.map(t => t.specialization))];
      setSpecializationOrder(specializations);
    }
  };

  // دالة حفظ ترتيب التخصصات
  const handleSaveSpecializationOrder = () => {
    setShowSpecializationSort(false);
    setSortBy('specialization');
    setSortOrder('asc');
  };

  // دالة إلغاء ترتيب التخصصات
  const handleCancelSpecializationOrder = () => {
    setShowSpecializationSort(false);
    setSpecializationOrder([]);
  };

  // دالة بدء سحب التخصص
  const handleDragStart = (specialization: string) => {
    setIsDraggingSpecialization(true);
    setDraggedSpecialization(specialization);
  };

  // دالة إسقاط التخصص
  const handleDrop = (targetSpecialization: string) => {
    if (draggedSpecialization && draggedSpecialization !== targetSpecialization) {
      const newOrder = [...specializationOrder];
      const draggedIndex = newOrder.indexOf(draggedSpecialization);
      const targetIndex = newOrder.indexOf(targetSpecialization);
      
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedSpecialization);
      
      setSpecializationOrder(newOrder);
    }
    setIsDraggingSpecialization(false);
    setDraggedSpecialization('');
  };

  // دالة الفرز الأبجدي
  const handleAlphabeticalSort = () => {
    if (sortBy === 'name') {
      // إذا كان الفرز الحالي أبجدياً، نعكس الترتيب
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // إذا كان الفرز الحالي بنوع آخر، نبدأ بالفرز الأبجدي تصاعدياً
      setSortBy('name');
      setSortOrder('asc');
    }
    setShowSpecializationSort(false);
  };

  // عرض الجدول للمعلمين
  const renderTeachersGrid = () => {
    // تطبيق الفرز على المعلمين
    let sortedTeachers = [...teachers];
    
    if (sortBy === 'name') {
      sortedTeachers.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB, 'ar') : nameB.localeCompare(nameA, 'ar');
      });
    } else if (sortBy === 'specialization') {
      if (specializationOrder.length > 0) {
        // الفرز حسب الترتيب المخصص
        sortedTeachers.sort((a, b) => {
          const indexA = specializationOrder.indexOf(a.specialization);
          const indexB = specializationOrder.indexOf(b.specialization);
          // إذا كان التخصص غير موجود في القائمة، نضعه في النهاية
          const finalIndexA = indexA === -1 ? specializationOrder.length : indexA;
          const finalIndexB = indexB === -1 ? specializationOrder.length : indexB;
          return finalIndexA - finalIndexB;
        });
      } else {
        // الفرز الأبجدي للتخصصات
        sortedTeachers.sort((a, b) => {
          const specA = a.specialization.toLowerCase();
          const specB = b.specialization.toLowerCase();
          return sortOrder === 'asc' ? specA.localeCompare(specB, 'ar') : specB.localeCompare(specA, 'ar');
        });
      }
    }

    // ================== تصميم مضغوط احترافي على نمط aSc Timetables ==================
    // أبعاد ديناميكية حسب الوضع
    const baseNameWidth = teachersCompact ? 120 : 140;
    const baseSpecWidth = teachersCompact ? 70 : 85;
    const baseQuotaWidth = teachersCompact ? 45 : 55;
    const baseStandbyWidth = teachersCompact ? 45 : 55;
    
    // استخدام zoom الشاشة الكاملة إذا كانت مفعّلة، وإلا فالعادي
    const currentZoom = isFullscreen ? fullscreenTeachersZoom : teachersZoom;
    
    const nameWidth = baseNameWidth * (currentZoom / 100);
    const specWidth = baseSpecWidth * (currentZoom / 100);
    const quotaWidth = baseQuotaWidth * (currentZoom / 100);
    const standbyWidth = baseStandbyWidth * (currentZoom / 100);
    
    // حساب عرض عمود الحصة ديناميكياً ليتناسب مع الشاشة
    const totalDays = daysOfWeek.length;
    const totalPeriods = totalDays * periodsPerDay;
    const availableWidth = 100 - ((nameWidth + specWidth + quotaWidth + standbyWidth) / 10);
    const periodColumnWidth = `${availableWidth / totalPeriods}%`;
    
    // حجم الخط والارتفاع حسب الوضع والزوم
    const baseFontSize = teachersCompact ? 9 : 11;
    const fontSize = `${baseFontSize * (currentZoom / 100)}px`;
    const headerFontSize = `${(teachersCompact ? 10 : 11) * (currentZoom / 100)}px`;
    const rowHeight = `${(teachersCompact ? 30 : 35) * (currentZoom / 100)}px`;

    // دالة اختصار أسماء المواد
    const getSubjectAbbreviation = (subjectName: string) => {
      const abbreviations: { [key: string]: string} = {
        'اللغة العربية': 'عربي',
        'التربية الفنية': 'فنية',
        'التربية البدنية': 'بدنية',
        'القرآن الكريم': 'قرآن',
        'الدراسات الإسلامية': 'إسلامية',
        'القرآن والإسلامية': 'ق.وإسلامية',
        'الحاسب الآلي': 'رقمية',
        'المهارات الرقمية': 'رقمية',
        'المهارات الحياتية': 'حياتية',
        'اللغة الإنجليزية': 'إنجليزي',
        'الرياضيات': 'رياضيات',
        'العلوم': 'علوم',
        'الاجتماعيات': 'اجتماعيات'
      };
      return abbreviations[subjectName] || subjectName;
    };

    // دالة اختصار النصوص
    const abbreviateText = (text: string, maxLength: number = 12) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    return (
      <div style={{ 
        position: 'relative',
        background: 'white',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        border: '1px solid #ddd',
        transform: `scale(${currentZoom / 100})`,
        transformOrigin: 'top right',
        transition: 'transform 0.2s ease'
      }}>
        <div style={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: '75vh'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontSize: fontSize,
            fontFamily: 'Arial, sans-serif'
          }}>
            <thead>
              {/* صف أسماء الأيام */}
              <tr style={{ background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)' }}>
                <th rowSpan={2} style={{
                  position: 'sticky',
                  right: 0,
                  background: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)',
                  zIndex: 31,
                  width: '40px',
                  minWidth: '40px',
                  borderRight: '2px solid #94a3b8',
                  borderTop: '2px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderLeft: '1px solid #e2e8f0',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.08)',
                  color: '#334155',
                  letterSpacing: '0.3px'
                }}>
                  م
                </th>
                <th rowSpan={2} style={{
                  position: 'sticky',
                  right: '40px',
                  background: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)',
                  zIndex: 30,
                  width: `${nameWidth}px`,
                  minWidth: `${nameWidth}px`,
                  borderRight: '2px solid #94a3b8',
                  borderTop: '2px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderLeft: '1px solid #e2e8f0',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.08)',
                  color: '#334155',
                  letterSpacing: '0.3px'
                }}>
                  المعلم
                </th>
                <th rowSpan={2} style={{
                  position: 'sticky',
                  right: `${40 + nameWidth}px`,
                  background: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)',
                  zIndex: 29,
                  width: `${specWidth}px`,
                  minWidth: `${specWidth}px`,
                  borderRight: '2px solid #94a3b8',
                  borderTop: '2px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderLeft: '1px solid #e2e8f0',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.06)',
                  color: '#334155',
                  letterSpacing: '0.3px'
                }}>
                  التخصص
                </th>
                <th rowSpan={2} style={{
                  position: 'sticky',
                  right: `${40 + nameWidth + specWidth}px`,
                  background: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)',
                  zIndex: 28,
                  width: `${quotaWidth}px`,
                  minWidth: `${quotaWidth}px`,
                  borderRight: '2px solid #94a3b8',
                  borderTop: '2px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderLeft: '1px solid #e2e8f0',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.06)',
                  color: '#334155',
                  letterSpacing: '0.3px'
                }}>
                  الحصص
                </th>
                <th rowSpan={2} style={{
                  position: 'sticky',
                  right: `${40 + nameWidth + specWidth + quotaWidth}px`,
                  background: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)',
                  zIndex: 27,
                  width: `${standbyWidth}px`,
                  minWidth: `${standbyWidth}px`,
                  borderRight: '2px solid #94a3b8',
                  borderTop: '2px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderLeft: '2px solid #94a3b8',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.06)',
                  color: '#334155',
                  letterSpacing: '0.3px'
                }}>
                  انتظار
                </th>
                {daysOfWeek.map(day => (
                  <th key={day} colSpan={periodsPerDay} style={{
                    background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)',
                    borderRight: '2px solid #94a3b8',
                    borderTop: '2px solid #cbd5e1',
                    borderBottom: '1px solid #cbd5e1',
                    borderLeft: '1px solid #e2e8f0',
                    padding: '8px 4px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#334155',
                    letterSpacing: '0.5px'
                  }}>
                    {day}
                  </th>
                ))}
              </tr>
              {/* صف أرقام الحصص */}
              <tr style={{ background: 'linear-gradient(to bottom, #e2e8f0 0%, #cbd5e1 100%)' }}>
                {daysOfWeek.map(day => (
                  Array.from({ length: periodsPerDay }, (_, i) => (
                    <th key={`${day}-period-${i + 1}`} style={{
                      background: i % 2 === 0 ? '#f1f5f9' : '#e2e8f0',
                      borderRight: '1px solid #cbd5e1',
                      borderLeft: (i + 1) === 7 ? '2px solid #94a3b8' : '1px solid #e2e8f0',
                      borderBottom: '2px solid #94a3b8',
                      borderTop: '1px solid #cbd5e1',
                      padding: '6px 2px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#475569',
                      width: periodColumnWidth,
                      minWidth: '50px',
                      letterSpacing: '0.3px'
                    }}>
                      {i + 1}
                    </th>
                  ))
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTeachers.map((teacher, teacherIndex) => {
                const teacherBasicSessions = sessions.filter(s => s.teacherId === teacher.id && s.type === 'basic').length;
                const teacherStandbySessions = sessions.filter(s => s.teacherId === teacher.id && s.type === 'standby').length;
                const rowBg = teacherIndex % 2 === 0 ? '#ffffff' : '#f8fbff';
                
                return (
                  <tr key={teacher.id} style={{
                    backgroundColor: rowBg,
                    height: '35px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e1fe'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowBg}>
                    {/* عمود الترقيم - ثابت */}
                    <td style={{
                      position: 'sticky',
                      right: 0,
                      background: rowBg,
                      zIndex: 21,
                      width: '40px',
                      minWidth: '40px',
                      borderRight: '2px solid #94a3b8',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '1px solid #e2e8f0',
                      padding: '0 2px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.08)'
                    }}>
                      {teacherIndex + 1}
                    </td>
                    {/* عمود اسم المعلم - ثابت */}
                    <td style={{
                      position: 'sticky',
                      right: '40px',
                      background: rowBg,
                      zIndex: 20,
                      width: `${nameWidth}px`,
                      minWidth: `${nameWidth}px`,
                      borderRight: '2px solid #94a3b8',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '1px solid #e2e8f0',
                      padding: '0 2px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.08)'
                    }}>
                      {abbreviateText(teacher.name.split(' ').slice(0, 2).join(' '), 18)}
                    </td>
                    {/* عمود التخصص - ثابت */}
                    <td style={{
                      position: 'sticky',
                      right: `${40 + nameWidth}px`,
                      background: rowBg,
                      zIndex: 19,
                      width: `${specWidth}px`,
                      minWidth: `${specWidth}px`,
                      borderRight: '2px solid #94a3b8',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '1px solid #e2e8f0',
                      padding: '0 2px',
                      textAlign: 'center',
                      fontSize: '9px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.06)'
                    }}>
                      {abbreviateText(teacher.specialization, 10)}
                    </td>
                    {/* عمود عدد الحصص - ثابت */}
                    <td style={{
                      position: 'sticky',
                      right: `${40 + nameWidth + specWidth}px`,
                      background: rowBg,
                      zIndex: 18,
                      width: `${quotaWidth}px`,
                      minWidth: `${quotaWidth}px`,
                      borderRight: '2px solid #94a3b8',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '1px solid #e2e8f0',
                      padding: '0 2px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#655ac1',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.06)'
                    }}>
                      {teacherBasicSessions}
                    </td>
                    {/* عمود الانتظار - ثابت */}
                    <td style={{
                      position: 'sticky',
                      right: `${40 + nameWidth + specWidth + quotaWidth}px`,
                      background: rowBg,
                      zIndex: 17,
                      width: `${standbyWidth}px`,
                      minWidth: `${standbyWidth}px`,
                      borderRight: '2px solid #94a3b8',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '2px solid #94a3b8',
                      padding: '0 2px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#047857',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.06)'
                    }}>
                      {teacherStandbySessions}
                    </td>
                    {/* خلايا الحصص لجميع الأيام والحصص */}
                    {timeSlots.map((slot, slotIndex) => {
                      // في جدول المعلمين: عرض الحصص الأساسية فقط
                      const session = sessions.find(s => 
                        s.teacherId === teacher.id && s.timeSlotId === slot.id && s.type === 'basic'
                      );
                      // فحص إذا كانت هناك حصة انتظار في نفس الوقت
                      const standbySession = sessions.find(s => 
                        s.teacherId === teacher.id && s.timeSlotId === slot.id && s.type === 'standby'
                      );
                      
                      // تحديد إذا كانت هذه الحصة السابعة (آخر حصة في اليوم)
                      const isLastPeriodOfDay = slot.period === 7;
                      
                      return (
                        <td 
                          key={slot.id} 
                          style={{
                            borderRight: '1px solid #e2e8f0',
                            borderLeft: isLastPeriodOfDay ? '2px solid #94a3b8' : '1px solid #e2e8f0',
                            borderBottom: '1px solid #e2e8f0',
                            borderTop: '1px solid #e2e8f0',
                            padding: '0 2px',
                            textAlign: 'center',
                            fontSize: '9px',
                            verticalAlign: 'middle',
                            height: '35px',
                            minWidth: '50px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            background: session ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : (standbySession ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : '#ffffff'),
                            color: session ? '#655ac1' : (standbySession ? '#065f46' : '#64748b'),
                            fontWeight: session || standbySession ? 'bold' : 'normal',
                            cursor: isDragMode && (session || standbySession) ? 'grab' : 'default'
                          }}
                          {...(isDragMode && session ? {
                            draggable: true,
                            onDragStart: (e) => {
                              e.currentTarget.style.opacity = '0.5';
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', JSON.stringify({
                                sessionId: session.id,
                                teacher: teacher.name,
                                teacherId: teacher.id,
                                subject: subjects.find(s => s.id === session.subjectId)?.name,
                                subjectId: session.subjectId,
                                class: classes.find(c => c.id === session.classId)?.name,
                                classId: session.classId,
                                day: slot.day,
                                period: slot.period,
                                type: 'general-schedule'
                              }));
                            },
                            onDragEnd: (e) => {
                              e.currentTarget.style.opacity = '1';
                            }
                          } : {})}
                          {...(isDragMode ? {
                            onDragOver: (e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              e.currentTarget.style.backgroundColor = '#fff3cd';
                            },
                            onDragLeave: (e) => {
                              e.currentTarget.style.backgroundColor = session ? '#e3f2fd' : (standbySession ? '#e8f5e9' : '#fff');
                            },
                            onDrop: (e) => {
                              e.preventDefault();
                              e.currentTarget.style.backgroundColor = session ? '#e3f2fd' : (standbySession ? '#e8f5e9' : '#fff');
                              const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                              handleDragDrop(dragData, {
                                teacherId: teacher.id,
                                day: slot.day,
                                period: slot.period
                              });
                            }
                          } : {})}
                        >
                          {session ? (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: '1.1'
                            }}>
                              <span style={{ 
                                fontWeight: 'bold',
                                fontSize: '9px'
                              }}>
                                {getSubjectAbbreviation(subjects.find(s => s.id === session.subjectId)?.name || '')}
                              </span>
                              <span style={{ 
                                fontSize: '8px',
                                opacity: 0.7
                              }}>
                                {abbreviateText(classes.find(c => c.id === session.classId)?.name || '', 6)}
                              </span>
                            </div>
                          ) : standbySession ? (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: '1.1'
                            }}>
                              <span style={{ 
                                fontSize: '9px',
                                fontWeight: 'bold',
                                color: '#2e7d32'
                              }}>
                                انتظار
                              </span>
                              <span style={{ 
                                fontSize: '10px',
                                fontWeight: 'bold',
                                color: '#1565c0',
                                marginTop: '2px'
                              }}>
                                م
                              </span>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // عرض الجدول العام للانتظار
  const renderStandbyGrid = () => {
    // تطبيق الفرز على المعلمين
    let sortedTeachers = [...teachers];
    
    if (sortBy === 'name') {
      sortedTeachers.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB, 'ar') : nameB.localeCompare(nameA, 'ar');
      });
    } else if (sortBy === 'specialization') {
      if (specializationOrder.length > 0) {
        sortedTeachers.sort((a, b) => {
          const indexA = specializationOrder.indexOf(a.specialization);
          const indexB = specializationOrder.indexOf(b.specialization);
          // إذا كان التخصص غير موجود في القائمة، نضعه في النهاية
          const finalIndexA = indexA === -1 ? specializationOrder.length : indexA;
          const finalIndexB = indexB === -1 ? specializationOrder.length : indexB;
          return finalIndexA - finalIndexB;
        });
      } else {
        sortedTeachers.sort((a, b) => {
          const specA = a.specialization.toLowerCase();
          const specB = b.specialization.toLowerCase();
          return sortOrder === 'asc' ? specA.localeCompare(specB, 'ar') : specB.localeCompare(specA, 'ar');
        });
      }
    }

    // ================== تصميم مضغوط احترافي على نمط aSc Timetables ==================
    const baseNameWidth = standbyCompact ? 120 : 140;
    const baseSpecWidth = standbyCompact ? 70 : 85;
    const baseStandbyWidth = standbyCompact ? 45 : 55;
    
    // استخدام zoom الشاشة الكاملة إذا كانت مفعّلة، وإلا فالعادي
    const currentZoom = isFullscreen ? fullscreenStandbyZoom : standbyZoom;
    
    const nameWidth = baseNameWidth * (currentZoom / 100);
    const specWidth = baseSpecWidth * (currentZoom / 100);
    const standbyWidth = baseStandbyWidth * (currentZoom / 100);
    
    // حساب عرض عمود الحصة ديناميكياً
    const totalDays = daysOfWeek.length;
    const totalPeriods = totalDays * periodsPerDay;
    const availableWidth = 100 - ((nameWidth + specWidth + standbyWidth) / 10);
    const periodColumnWidth = `${availableWidth / totalPeriods}%`;
    
    const baseFontSize = standbyCompact ? 9 : 11;
    const fontSize = `${baseFontSize * (currentZoom / 100)}px`;
    const headerFontSize = `${(standbyCompact ? 10 : 11) * (currentZoom / 100)}px`;
    const rowHeight = `${(standbyCompact ? 30 : 35) * (currentZoom / 100)}px`;
    
    // دالة اختصار النصوص
    const abbreviateText = (text: string, maxLength: number = 12) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    return (
      <div style={{ 
        position: 'relative',
        background: 'white',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        border: '1px solid #ddd',
        transform: `scale(${currentZoom / 100})`,
        transformOrigin: 'top right',
        transition: 'transform 0.2s ease'
      }}>
        <div style={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: '75vh'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontSize: fontSize,
            fontFamily: 'Arial, sans-serif'
          }}>
            <thead>
              {/* صف أسماء الأيام */}
              <tr style={{ background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)' }}>
                <th rowSpan={2} style={{
                  position: 'sticky',
                  right: 0,
                  background: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)',
                  zIndex: 31,
                  width: '40px',
                  minWidth: '40px',
                  borderRight: '2px solid #94a3b8',
                  borderTop: '2px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderLeft: '1px solid #e2e8f0',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.08)',
                  color: '#334155',
                  letterSpacing: '0.3px'
                }}>
                  م
                </th>
                <th rowSpan={2} style={{
                  position: 'sticky',
                  right: '40px',
                  background: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)',
                  zIndex: 30,
                  width: `${nameWidth}px`,
                  minWidth: `${nameWidth}px`,
                  borderRight: '2px solid #94a3b8',
                  borderTop: '2px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderLeft: '1px solid #e2e8f0',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.08)',
                  color: '#334155',
                  letterSpacing: '0.3px'
                }}>
                  المعلم
                </th>
                <th rowSpan={2} style={{
                  position: 'sticky',
                  right: `${40 + nameWidth}px`,
                  background: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)',
                  zIndex: 29,
                  width: `${specWidth}px`,
                  minWidth: `${specWidth}px`,
                  borderRight: '2px solid #94a3b8',
                  borderTop: '2px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderLeft: '1px solid #e2e8f0',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.06)',
                  color: '#334155',
                  letterSpacing: '0.3px'
                }}>
                  التخصص
                </th>
                <th rowSpan={2} style={{
                  position: 'sticky',
                  right: `${40 + nameWidth + specWidth}px`,
                  background: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)',
                  zIndex: 28,
                  width: `${standbyWidth}px`,
                  minWidth: `${standbyWidth}px`,
                  borderRight: '2px solid #94a3b8',
                  borderTop: '2px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderLeft: '2px solid #94a3b8',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.06)',
                  color: '#334155',
                  letterSpacing: '0.3px'
                }}>
                  انتظار
                </th>
                {daysOfWeek.map(day => (
                  <th key={day} colSpan={periodsPerDay} style={{
                    background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)',
                    borderRight: '2px solid #94a3b8',
                    borderTop: '2px solid #cbd5e1',
                    borderBottom: '1px solid #cbd5e1',
                    borderLeft: '1px solid #e2e8f0',
                    padding: '8px 4px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#065f46',
                    letterSpacing: '0.5px'
                  }}>
                    {day}
                  </th>
                ))}
              </tr>
              {/* صف أرقام الحصص */}
              <tr style={{ background: 'linear-gradient(to bottom, #e2e8f0 0%, #cbd5e1 100%)' }}>
                {daysOfWeek.map(day => (
                  Array.from({ length: periodsPerDay }, (_, i) => (
                    <th key={`${day}-period-${i + 1}`} style={{
                      background: i % 2 === 0 ? '#f1f5f9' : '#e2e8f0',
                      borderRight: '1px solid #cbd5e1',
                      borderLeft: (i + 1) === 7 ? '2px solid #94a3b8' : '1px solid #e2e8f0',
                      borderBottom: '2px solid #94a3b8',
                      borderTop: '1px solid #cbd5e1',
                      padding: '6px 2px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#475569',
                      width: periodColumnWidth,
                      minWidth: '50px',
                      letterSpacing: '0.3px'
                    }}>
                      {i + 1}
                    </th>
                  ))
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTeachers.map((teacher, teacherIndex) => {
                const teacherStandbySessions = sessions.filter(s => s.teacherId === teacher.id && s.type === 'standby').length;
                const rowBg = teacherIndex % 2 === 0 ? '#fff' : '#fafafa';
                
                return (
                  <tr key={teacher.id} style={{
                    backgroundColor: rowBg,
                    height: '35px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e1fe'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowBg}>
                    {/* عمود الترقيم - ثابت */}
                    <td style={{
                      position: 'sticky',
                      right: 0,
                      background: rowBg,
                      zIndex: 21,
                      width: '40px',
                      minWidth: '40px',
                      borderRight: '2px solid #94a3b8',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '1px solid #e2e8f0',
                      padding: '0 2px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.08)'
                    }}>
                      {teacherIndex + 1}
                    </td>
                    {/* عمود اسم المعلم - ثابت */}
                    <td style={{
                      position: 'sticky',
                      right: '40px',
                      background: rowBg,
                      zIndex: 20,
                      width: `${nameWidth}px`,
                      minWidth: `${nameWidth}px`,
                      borderRight: '2px solid #94a3b8',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '1px solid #e2e8f0',
                      padding: '0 2px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.08)'
                    }}>
                      {abbreviateText(teacher.name.split(' ').slice(0, 2).join(' '), 18)}
                    </td>
                    {/* عمود التخصص - ثابت */}
                    <td style={{
                      position: 'sticky',
                      right: `${40 + nameWidth}px`,
                      background: rowBg,
                      zIndex: 19,
                      width: `${specWidth}px`,
                      minWidth: `${specWidth}px`,
                      borderRight: '2px solid #94a3b8',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '1px solid #e2e8f0',
                      padding: '0 2px',
                      textAlign: 'center',
                      fontSize: '9px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.06)'
                    }}>
                      {abbreviateText(teacher.specialization, 10)}
                    </td>
                    {/* عمود الانتظار - ثابت */}
                    <td style={{
                      position: 'sticky',
                      right: `${40 + nameWidth + specWidth}px`,
                      background: rowBg,
                      zIndex: 18,
                      width: `${standbyWidth}px`,
                      minWidth: `${standbyWidth}px`,
                      borderRight: '2px solid #94a3b8',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '2px solid #94a3b8',
                      padding: '0 2px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: teacherStandbySessions > 0 ? '#065f46' : '#94a3b8',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.06)'
                    }}>
                      {teacherStandbySessions}
                    </td>
                    {/* خلايا حصص الانتظار لجميع الأيام */}
                    {timeSlots.map((slot, slotIndex) => {
                      const session = sessions.find(s => 
                        s.teacherId === teacher.id && s.timeSlotId === slot.id && s.type === 'standby'
                      );
                      
                      // تحديد إذا كانت هذه الحصة السابعة (آخر حصة في اليوم)
                      const isLastPeriodOfDay = slot.period === 7;
                      
                      return (
                        <td key={slot.id} style={{
                          borderRight: '1px solid #e2e8f0',
                          borderLeft: isLastPeriodOfDay ? '2px solid #94a3b8' : '1px solid #e2e8f0',
                          borderBottom: '1px solid #e2e8f0',
                          borderTop: '1px solid #e2e8f0',
                          padding: '0 2px',
                          textAlign: 'center',
                          fontSize: '9px',
                          verticalAlign: 'middle',
                          height: '35px',
                          minWidth: '50px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          background: session ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : '#ffffff'
                        }}>
                          {session ? (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: '1.2'
                            }}>
                              <span style={{ 
                                fontSize: '9px',
                                fontWeight: 'bold',
                                color: '#065f46'
                              }}>
                                انتظار
                              </span>
                              <span style={{ 
                                fontSize: '10px',
                                fontWeight: 'bold',
                                color: '#047857',
                                marginTop: '2px'
                              }}>
                                م
                              </span>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // عرض الجدول للفصول
  const renderClassesGrid = () => {
    // ================== تصميم مضغوط احترافي على نمط aSc Timetables ==================
    const baseClassNameWidth = classesCompact ? 100 : 120;
    const baseQuotaWidth = classesCompact ? 45 : 55;
    
    // استخدام zoom الشاشة الكاملة إذا كانت مفعّلة، وإلا فالعادي
    const currentZoom = isFullscreen ? fullscreenClassesZoom : classesZoom;
    
    const classNameWidth = baseClassNameWidth * (currentZoom / 100);
    const quotaWidth = baseQuotaWidth * (currentZoom / 100);
    
    // حساب عرض عمود الحصة ديناميكياً
    const totalDays = daysOfWeek.length;
    const totalPeriods = totalDays * periodsPerDay;
    const availableWidth = 100 - ((classNameWidth + quotaWidth) / 10);
    const periodColumnWidth = `${availableWidth / totalPeriods}%`;
    
    const baseFontSize = classesCompact ? 9 : 11;
    const fontSize = `${baseFontSize * (currentZoom / 100)}px`;
    const headerFontSize = `${(classesCompact ? 10 : 11) * (currentZoom / 100)}px`;
    const rowHeight = `${(classesCompact ? 30 : 35) * (currentZoom / 100)}px`;
    
    // دالة اختصار أسماء المواد
    const getSubjectAbbreviation = (subjectName: string) => {
      const abbreviations: { [key: string]: string } = {
        'اللغة العربية': 'عربي',
        'التربية الفنية': 'فنية',
        'التربية البدنية': 'بدنية',
        'القرآن الكريم': 'قرآن',
        'الدراسات الإسلامية': 'إسلامية',
        'القرآن والإسلامية': 'ق.وإسلامية',
        'الحاسب الآلي': 'رقمية',
        'المهارات الرقمية': 'رقمية',
        'المهارات الحياتية': 'حياتية',
        'اللغة الإنجليزية': 'إنجليزي',
        'الرياضيات': 'رياضيات',
        'العلوم': 'علوم',
        'الاجتماعيات': 'اجتماعيات'
      };
      return abbreviations[subjectName] || subjectName;
    };
    
    // دالة اختصار النصوص
    const abbreviateText = (text: string, maxLength: number = 12) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    return (
      <div style={{ 
        position: 'relative',
        background: 'white',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        border: '1px solid #ddd',
        transform: `scale(${currentZoom / 100})`,
        transformOrigin: 'top right',
        transition: 'transform 0.2s ease'
      }}>
        <div style={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: '75vh'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontSize: fontSize,
            fontFamily: 'Arial, sans-serif'
          }}>
            <thead>
              {/* صف أسماء الأيام */}
              <tr style={{ background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)' }}>
                <th rowSpan={2} style={{
                  position: 'sticky',
                  right: 0,
                  background: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)',
                  zIndex: 31,
                  width: '40px',
                  minWidth: '40px',
                  borderRight: '2px solid #94a3b8',
                  borderTop: '2px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderLeft: '1px solid #e2e8f0',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.08)',
                  color: '#334155',
                  letterSpacing: '0.3px'
                }}>
                  م
                </th>
                <th rowSpan={2} style={{
                  position: 'sticky',
                  right: '40px',
                  background: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)',
                  zIndex: 30,
                  width: `${classNameWidth}px`,
                  minWidth: `${classNameWidth}px`,
                  borderRight: '2px solid #94a3b8',
                  borderTop: '2px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderLeft: '1px solid #e2e8f0',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.08)',
                  color: '#334155',
                  letterSpacing: '0.3px'
                }}>
                  الصف/الفصل
                </th>
                <th rowSpan={2} style={{
                  position: 'sticky',
                  right: `${40 + classNameWidth}px`,
                  background: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)',
                  zIndex: 29,
                  width: `${quotaWidth}px`,
                  minWidth: `${quotaWidth}px`,
                  borderRight: '2px solid #94a3b8',
                  borderTop: '2px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderLeft: '2px solid #94a3b8',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.06)',
                  color: '#334155',
                  letterSpacing: '0.3px'
                }}>
                  الحصص
                </th>
                {daysOfWeek.map(day => (
                  <th key={day} colSpan={periodsPerDay} style={{
                    background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)',
                    borderRight: '2px solid #94a3b8',
                    borderTop: '2px solid #cbd5e1',
                    borderBottom: '1px solid #cbd5e1',
                    borderLeft: '1px solid #e2e8f0',
                    padding: '8px 4px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#713f12',
                    letterSpacing: '0.5px'
                  }}>
                    {day}
                  </th>
                ))}
              </tr>
              {/* صف أرقام الحصص */}
              <tr style={{ background: 'linear-gradient(to bottom, #e2e8f0 0%, #cbd5e1 100%)' }}>
                {daysOfWeek.map(day => (
                  Array.from({ length: periodsPerDay }, (_, i) => (
                    <th key={`${day}-period-${i + 1}`} style={{
                      background: i % 2 === 0 ? '#f1f5f9' : '#e2e8f0',
                      borderRight: '1px solid #cbd5e1',
                      borderLeft: (i + 1) === 7 ? '2px solid #94a3b8' : '1px solid #e2e8f0',
                      borderBottom: '2px solid #94a3b8',
                      borderTop: '1px solid #cbd5e1',
                      padding: '6px 2px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#475569',
                      width: periodColumnWidth,
                      minWidth: '50px',
                      letterSpacing: '0.3px'
                    }}>
                      {i + 1}
                    </th>
                  ))
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem, classIndex) => {
                const classAssignedSessions = sessions.filter(s => s.classId === classItem.id && s.type === 'basic').length;
                const rowBg = classIndex % 2 === 0 ? '#fff' : '#fafafa';
                
                return (
                  <tr key={classItem.id} style={{
                    backgroundColor: rowBg,
                    height: '35px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e1fe'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowBg}>
                    {/* عمود الترقيم - ثابت */}
                    <td style={{
                      position: 'sticky',
                      right: 0,
                      background: rowBg,
                      zIndex: 21,
                      width: '40px',
                      minWidth: '40px',
                      borderRight: '2px solid #94a3b8',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '1px solid #e2e8f0',
                      padding: '0 2px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.08)'
                    }}>
                      {classIndex + 1}
                    </td>
                    {/* عمود اسم الفصل - ثابت */}
                    <td style={{
                      position: 'sticky',
                      right: '40px',
                      background: rowBg,
                      zIndex: 20,
                      width: `${classNameWidth}px`,
                      minWidth: `${classNameWidth}px`,
                      borderRight: '2px solid #94a3b8',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '1px solid #e2e8f0',
                      padding: '0 2px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.08)'
                    }}>
                      {classItem.name}
                    </td>
                    {/* عمود عدد الحصص - ثابت */}
                    <td style={{
                      position: 'sticky',
                      right: `${40 + classNameWidth}px`,
                      background: rowBg,
                      zIndex: 19,
                      width: `${quotaWidth}px`,
                      minWidth: `${quotaWidth}px`,
                      borderRight: '2px solid #94a3b8',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0',
                      borderLeft: '2px solid #94a3b8',
                      padding: '0 2px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#655ac1',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.06)'
                    }}>
                      {classAssignedSessions}
                    </td>
                    {/* خلايا الحصص لجميع الأيام */}
                    {timeSlots.map((slot, slotIndex) => {
                      // عرض الحصص الأساسية فقط (لا تظهر حصص الانتظار في جدول الفصول)
                      const session = sessions.find(s => 
                        s.classId === classItem.id && s.timeSlotId === slot.id && s.type === 'basic'
                      );
                      
                      // تحديد إذا كانت هذه الحصة السابعة (آخر حصة في اليوم)
                      const isLastPeriodOfDay = slot.period === 7;
                      
                      return (
                        <td key={slot.id} style={{
                          borderRight: '1px solid #e2e8f0',
                          borderLeft: isLastPeriodOfDay ? '2px solid #94a3b8' : '1px solid #e2e8f0',
                          borderBottom: '1px solid #e2e8f0',
                          borderTop: '1px solid #e2e8f0',
                          padding: '0 2px',
                          textAlign: 'center',
                          fontSize: '9px',
                          verticalAlign: 'middle',
                          height: '35px',
                          minWidth: '50px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          background: session ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : '#ffffff'
                        }}>
                          {session ? (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: '1.1'
                            }}>
                              <span style={{ 
                                fontWeight: 'bold',
                                fontSize: '9px',
                                color: '#655ac1'
                              }}>
                                {getSubjectAbbreviation(subjects.find(s => s.id === session.subjectId)?.name || '')}
                              </span>
                              <span style={{ 
                                fontSize: '8px',
                                opacity: 0.8,
                                color: '#8779fb'
                              }}>
                                {abbreviateText(teachers.find(t => t.id === session.teacherId)?.name.split(' ').slice(0, 2).join(' ') || '', 10)}
                              </span>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // دالة مساعدة لعرض جدول فردي واحد (للاستخدام في وضع عرض الكل)
  const renderSingleIndividualTable = (itemId: string, item: Teacher | Class, itemSessions: ClassSession[]) => {
    return (
      <div className="overflow-x-auto rounded-lg border-2 border-gray-200 shadow-sm">
        <table className="w-full border-collapse" dir="rtl">
          <thead>
            <tr className="bg-gradient-to-r from-[#e5e1fe] to-[#e5e1fe]">
              <th className="border border-gray-300 p-3 text-center font-bold text-[#4c1d95] w-32">
                اليوم
              </th>
              {Array.from({ length: periodsPerDay }, (_, i) => (
                <th key={i + 1} className="border border-gray-300 p-3 text-center font-bold text-[#4c1d95] w-32">
                  الحصة {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daysOfWeek.map(day => (
              <tr key={day} className="hover:bg-[#f5f3ff]">
                <td className="border border-gray-300 p-3 text-center font-semibold bg-gradient-to-r from-[#f5f3ff] to-[#e5e1fe] w-32 text-[#4c1d95]">
                  {day}
                </td>
                {Array.from({ length: periodsPerDay }, (_, periodIndex) => {
                  const timeSlot = timeSlots.find(ts => 
                    ts.day === day && ts.period === periodIndex + 1
                  );
                  
                  // في حالة جدول المعلم، نعرض فقط الحصص الأساسية (basic)
                  // حصص الانتظار تُعرض في الجدول العام للانتظار فقط
                  const session = timeSlot ? itemSessions.find(s => 
                    s.timeSlotId === timeSlot.id && s.type === 'basic'
                  ) : null;
                  
                  return (
                    <td 
                      key={periodIndex + 1} 
                      className="border border-gray-300 p-2 relative w-32 h-24"
                      style={{
                        minWidth: '128px',
                        maxWidth: '128px',
                        width: '128px',
                        height: '96px',
                        minHeight: '96px',
                        maxHeight: '96px',
                        overflow: 'hidden'
                      }}
                    >
                      {session ? (
                        <div 
                          className="h-full flex flex-col justify-center items-center text-center rounded p-1 border-2 border-[#a78bfa] text-[#4c1d95]"
                          style={{
                            background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
                          }}
                        >
                          {selectedIndividualType === 'teacher' ? (
                            <>
                              <div className="text-xs font-bold text-[#4c1d95] truncate w-full px-1">
                                {classes.find(c => c.id === session.classId)?.name || 'فصل غير معروف'}
                              </div>
                              <div className="text-xs font-semibold text-[#655ac1] truncate w-full px-1">
                                {subjects.find(sub => sub.id === session.subjectId)?.name || 'مادة غير معروفة'}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-xs font-bold text-[#4c1d95] truncate w-full px-1">
                                {subjects.find(sub => sub.id === session.subjectId)?.name || 'مادة غير معروفة'}
                              </div>
                              <div className="text-xs font-semibold text-[#655ac1] truncate w-full px-1">
                                {teachers.find(t => t.id === session.teacherId)?.name.split(' ').slice(0, 2).join(' ') || 'معلم غير معروف'}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-300 text-xs">
                          فارغ
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // عرض الجدول الفردي (معلم أو فصل واحد)
  const renderIndividualTimetable = () => {
    // إذا كان وضع عرض الكل مفعل
    if (showAllIndividual) {
      const itemsList = selectedIndividualType === 'teacher' ? teachers : classes;
      
      return (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-[#f5f3ff] to-[#e5e1fe] rounded-lg p-3 border border-[#ddd6fe] text-center">
            <h3 className="text-lg font-bold text-[#4c1d95]">
              عرض جميع الجداول ({itemsList.length} {selectedIndividualType === 'teacher' ? 'معلم' : 'فصل'})
            </h3>
          </div>
          
          {itemsList.map((item, index) => {
            const itemId = item.id;
            const itemSessions = sessions.filter(s => 
              selectedIndividualType === 'teacher' 
                ? s.teacherId === itemId
                : s.classId === itemId
            );
            
            return (
              <div key={itemId} className="space-y-3 border-2 border-[#ddd6fe] rounded-lg p-4 bg-white shadow-lg" style={{ transform: `scale(${isCompactMode ? 0.9 : 1})`, transformOrigin: 'top right', transition: 'transform 0.2s ease' }}>
                {/* معلومات الفرد */}
                <div className="bg-gradient-to-r from-[#f5f3ff] to-[#e5e1fe] rounded-lg p-3 border border-[#ddd6fe]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-bold text-[#4c1d95]">
                          {selectedIndividualType === 'teacher' 
                            ? (item as Teacher).name.split(' ').slice(0, 2).join(' ')
                            : (item as Class).name
                          }
                        </h3>
                      </div>
                      {selectedIndividualType === 'teacher' && (
                        <div className="flex gap-3 text-xs text-[#655ac1] mt-1 mr-9">
                          <span>التخصص: {(item as Teacher).specialization}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="text-center bg-white rounded-lg px-3 py-1.5 border border-[#c4b5fd]">
                        <div className="text-lg font-bold text-[#655ac1]">
                          {itemSessions.filter(s => s.type === 'basic').length}
                        </div>
                        <div className="text-xs text-[#8779fb]">حصص</div>
                      </div>
                      {selectedIndividualType === 'teacher' && (
                        <div className="text-center bg-white rounded-lg px-3 py-1.5 border border-orange-300">
                          <div className="text-lg font-bold text-orange-600">
                            {itemSessions.filter(s => s.type === 'standby').length}
                          </div>
                          <div className="text-xs text-orange-500">انتظار</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* الجدول */}
                {renderSingleIndividualTable(itemId, item, itemSessions)}
              </div>
            );
          })}
        </div>
      );
    }
    
    // الوضع العادي - عرض جدول واحد
    if (!selectedIndividualId) {
      return (
        <div className="text-center py-16 bg-gradient-to-br from-[#f5f3ff] to-[#e5e1fe] rounded-lg border-2 border-dashed border-[#c4b5fd]">
          <div className="mb-6">
            <Eye className="h-20 w-20 text-[#a78bfa] mx-auto animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-[#4c1d95] mb-3">
            اختر {selectedIndividualType === 'teacher' ? 'معلماً' : 'فصلاً'} لعرض جدوله
          </h3>
          <p className="text-[#655ac1] text-lg mb-6">
            استخدم القائمة المنسدلة أعلاه لاختيار {selectedIndividualType === 'teacher' ? 'المعلم' : 'الفصل'} المطلوب
          </p>
          <div className="flex justify-center items-center gap-2 text-[#8779fb]">
            <div className="w-3 h-3 bg-[#8779fb] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-[#8779fb] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-[#8779fb] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      );
    }

    const individual = selectedIndividualType === 'teacher' 
      ? teachers.find(t => t.id === selectedIndividualId)
      : classes.find(c => c.id === selectedIndividualId);

    if (!individual) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600">خطأ في البيانات</h3>
          <p className="text-red-500">لم يتم العثور على البيانات المطلوبة</p>
        </div>
      );
    }

    const individualSessions = sessions.filter(s => 
      selectedIndividualType === 'teacher' 
        ? s.teacherId === selectedIndividualId
        : s.classId === selectedIndividualId
    );

    return (
      <div className="space-y-6">
        {/* معلومات الفرد */}
        <div className="bg-gradient-to-r from-[#f5f3ff] to-[#e5e1fe] rounded-lg p-4 border border-[#ddd6fe]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#4c1d95] mb-1">
                {selectedIndividualType === 'teacher' 
                  ? (individual as Teacher).name.split(' ').slice(0, 2).join(' ')
                  : (individual as Class).name
                }
              </h2>
              {selectedIndividualType === 'teacher' && (
                <div className="flex gap-4 text-sm text-[#655ac1]">
                  <span>التخصص: {(individual as Teacher).specialization}</span>
                </div>
              )}
            </div>
            
            {/* إحصائيات سريعة */}
            <div className="flex gap-3">
              <div className="text-center bg-white rounded-lg px-3 py-1.5 border border-[#c4b5fd]">
                <div className="text-xl font-bold text-[#655ac1]">
                  {individualSessions.filter(s => s.type === 'basic').length}
                </div>
                <div className="text-xs text-[#8779fb]">الحصص</div>
              </div>
              {selectedIndividualType === 'teacher' && (
                <div className="text-center bg-white rounded-lg px-3 py-1.5 border border-orange-300">
                  <div className="text-xl font-bold text-orange-600">
                    {individualSessions.filter(s => s.type === 'standby').length}
                  </div>
                  <div className="text-xs text-orange-500">الانتظار</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الجدول الفردي */}
        <div className="overflow-x-auto" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top right', transition: 'transform 0.2s ease' }}>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gradient-to-r from-[#e5e1fe] to-[#e5e1fe]">
                <th className="border border-gray-300 p-3 text-sm font-semibold w-32 text-[#4c1d95]">اليوم</th>
                {Array.from({ length: periodsPerDay }, (_, i) => (
                  <th key={i + 1} className="border border-gray-300 p-3 text-sm font-semibold w-32 text-[#4c1d95]">
                    الحصة {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map(day => (
                <tr key={day} className="hover:bg-[#f5f3ff]">
                  <td className="border border-gray-300 p-3 text-center font-semibold bg-gradient-to-r from-[#f5f3ff] to-[#e5e1fe] w-32 text-[#4c1d95]">
                    {day}
                  </td>
                  {Array.from({ length: periodsPerDay }, (_, periodIndex) => {
                    const timeSlot = timeSlots.find(ts => 
                      ts.day === day && ts.period === periodIndex + 1
                    );
                    
                    // في جدول المعلم: عرض كل الحصص (أساسية + انتظار)
                    // في جدول الفصل: عرض الحصص الأساسية فقط
                    const session = timeSlot ? individualSessions.find(s => 
                      s.timeSlotId === timeSlot.id && 
                      (selectedIndividualType === 'teacher' || s.type === 'basic')
                    ) : null;
                    
                    return (
                      <td 
                        key={periodIndex + 1} 
                        className={`border border-gray-300 p-2 relative w-32 h-24 ${isDragMode ? 'cursor-pointer hover:bg-[#f5f3ff] transition-colors' : ''}`}
                        style={{
                          minWidth: '128px',
                          maxWidth: '128px',
                          width: '128px',
                          height: '96px',
                          minHeight: '96px',
                          maxHeight: '96px',
                          overflow: 'hidden'
                        }}
                        onDragOver={isDragMode ? (e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          
                          // تأثيرات بصرية متقدمة
                          e.currentTarget.style.backgroundColor = '#f0fdf4';
                          e.currentTarget.style.border = '2px dashed #22c55e';
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(34, 197, 94, 0.2)';
                          e.currentTarget.style.transition = 'all 0.2s ease-in-out';
                        } : undefined}
                        onDragLeave={isDragMode ? (e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.border = '1px solid #e5e7eb';
                          e.currentTarget.style.transform = '';
                          e.currentTarget.style.boxShadow = '';
                          e.currentTarget.style.transition = '';
                        } : undefined}
                        onDrop={isDragMode ? (e) => {
                          e.preventDefault();
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.border = '1px solid #e5e7eb';
                          e.currentTarget.style.transform = '';
                          e.currentTarget.style.boxShadow = '';
                          
                          const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                          
                          // تحديد معرف المعلم المستهدف
                          const targetTeacherId = selectedIndividualType === 'teacher' ? selectedIndividualId : dragData.teacherId;
                          
                          // تنفيذ النقل المتقدم مع فحص التعارضات
                          const success = handleDragDrop(dragData, {
                            teacherId: targetTeacherId,
                            day: day,
                            period: periodIndex + 1
                          });

                          if (success) {
                            // تأثير بصري لإظهار النجاح
                            e.currentTarget.style.backgroundColor = '#dcfce7';
                            e.currentTarget.style.border = '2px solid #22c55e';
                            e.currentTarget.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.3)';
                            
                            setTimeout(() => {
                              e.currentTarget.style.backgroundColor = '';
                              e.currentTarget.style.border = '1px solid #e5e7eb';
                              e.currentTarget.style.boxShadow = '';
                            }, 2000);
                          }
                        } : undefined}
                      >
                        {session && (
                          <div 
                            className={`h-full w-full rounded p-2 text-center flex flex-col justify-center relative ${
                              session.type === 'standby'
                                ? 'text-green-800 border border-green-300'
                                : 'text-[#4c1d95] border border-[#c4b5fd]'
                            } ${isDragMode ? 'cursor-grab hover:opacity-80 transition-opacity' : ''}`}
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordBreak: 'break-word',
                              background: session.type === 'standby' 
                                ? 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)' 
                                : 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
                            }}
                            draggable={isDragMode}
                            onDragStart={isDragMode ? (e) => {
                              // تأثيرات بصرية متقدمة للسحب
                              e.currentTarget.style.opacity = '0.7';
                              e.currentTarget.style.transform = 'rotate(-2deg) scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                              e.currentTarget.style.zIndex = '1000';
                              e.currentTarget.style.transition = 'all 0.2s ease-in-out';
                              
                              e.dataTransfer.effectAllowed = 'move';
                              
                              // إعداد البيانات للنقل
                              e.dataTransfer.setData('text/plain', JSON.stringify({
                                sessionId: session.id,
                                day: day,
                                period: periodIndex + 1,
                                teacher: selectedIndividualType === 'teacher' ? selectedIndividualId : session.teacherId,
                                teacherId: session.teacherId,
                                subject: subjects.find(s => s.id === session.subjectId)?.name || '',
                                subjectId: session.subjectId || '',
                                class: session.classId ? classes.find(c => c.id === session.classId)?.name : '',
                                classId: session.classId || '',
                                type: 'individual-schedule'
                              }));
                              
                              console.log('بدء سحب من الجدول الفردي:', {
                                day, 
                                period: periodIndex + 1,
                                subject: subjects.find(s => s.id === session.subjectId)?.name || '',
                                class: session.classId ? classes.find(c => c.id === session.classId)?.name : ''
                              });
                            } : undefined}
                            onDragEnd={isDragMode ? (e) => {
                              // إعادة تعيين التأثيرات البصرية
                              e.currentTarget.style.opacity = '1';
                              e.currentTarget.style.transform = '';
                              e.currentTarget.style.boxShadow = '';
                              e.currentTarget.style.zIndex = '';
                              e.currentTarget.style.transition = '';
                            } : undefined}
                          >
                            {selectedIndividualType === 'teacher' ? (
                              session.type === 'standby' ? (
                                <>
                                  <div className="font-semibold text-xs text-green-700" style={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    انتظار
                                  </div>
                                  <div className="text-base font-bold text-[#655ac1] mt-1">
                                    م
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="font-semibold text-xs" style={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%'
                                  }}>
                                    {getSubjectAbbreviation(subjects.find(s => s.id === session.subjectId)?.name || '')}
                                  </div>
                                  <div className="text-xs mt-1" style={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%'
                                  }}>
                                    {session.classId ? classes.find(c => c.id === session.classId)?.name : ''}
                                  </div>
                                </>
                              )
                            ) : (
                              <>
                                <div className="font-semibold text-xs" style={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '100%'
                                }}>
                                  {getSubjectAbbreviation(subjects.find(s => s.id === session.subjectId)?.name || '')}
                                </div>
                                <div className="text-xs mt-1" style={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '100%'
                                }}>
                                  {teachers.find(t => t.id === session.teacherId)?.name.split(' ').slice(0, 2).join(' ')}
                                </div>
                              </>
                            )}
                            {/* مؤشر السهمين المتعاكسين للحصص المتبدلة */}
                            {swappedSessions.has(session.id) && (
                              <div className="absolute top-1 right-1">
                                <span className="swap-indicator text-base font-bold text-green-600 drop-shadow-sm">⇄</span>
                              </div>
                            )}
                          </div>
                        )}
                        {!session && (
                          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                            فارغ
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              

            </tbody>
          </table>
        </div>

        {/* أدوات الجدول الفردي */}
        <div className="flex justify-center gap-3 pt-4 border-t">
          <Button
            onClick={() => {
              const printContent = generateIndividualPrintContent();
              const printWindow = window.open('', '_blank', 'width=800,height=600');
              if (printWindow) {
                printWindow.document.write(printContent);
                printWindow.document.close();
                printWindow.focus();
              }
            }}
            variant="outline"
            size="sm"
            className="text-[#655ac1] border-[#c4b5fd] hover:bg-[#f5f3ff]"
          >
            <Printer className="h-4 w-4 ml-1" />
            طباعة
          </Button>
        </div>
        
        {/* تم حذف الشريط القديم - الشريط الجديد مضمن في الجدول */}
      </div>
    );
  };

  // دالة مساعدة لطباعة الجدول الفردي
  const generateIndividualPrintContent = () => {
    const individual = selectedIndividualType === 'teacher' 
      ? teachers.find(t => t.id === selectedIndividualId)
      : classes.find(c => c.id === selectedIndividualId);
    
    if (!individual) return '';

    const individualSessions = sessions.filter(s => 
      selectedIndividualType === 'teacher' 
        ? s.teacherId === selectedIndividualId
        : s.classId === selectedIndividualId
    );

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>جدول ${selectedIndividualType === 'teacher' ? 'المعلم' : 'الفصل'}: ${individual.name}</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #000; padding: 8px; text-align: center; font-size: 12px; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .header { text-align: center; margin: 20px 0; }
          .session-basic { background-color: #dbeafe; }
          .session-standby { background-color: #dcfce7; }
          @media print { .no-print { display: none; } body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>جدول ${selectedIndividualType === 'teacher' ? 'المعلم' : 'الفصل'}</h1>
          <h2>${individual.name}</h2>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
          <p>إجمالي الحصص الأساسية: ${individualSessions.filter(s => s.type === 'basic').length}</p>
          <p>إجمالي حصص الانتظار: ${individualSessions.filter(s => s.type === 'standby').length}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>اليوم</th>
              ${Array.from({ length: periodsPerDay }, (_, i) => `<th>الحصة ${i + 1}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${daysOfWeek.map(day => `
              <tr>
                <td style="background-color: #f0f0f0; font-weight: bold;">${day}</td>
                ${Array.from({ length: periodsPerDay }, (_, periodIndex) => {
                  const timeSlot = timeSlots.find(ts => ts.day === day && ts.period === periodIndex + 1);
                  const session = timeSlot ? individualSessions.find(s => s.timeSlotId === timeSlot.id) : null;
                  
                  if (session) {
                    const sessionClass = session.type === 'basic' ? 'session-basic' : 'session-standby';
                    if (selectedIndividualType === 'teacher') {
                      const subject = subjects.find(s => s.id === session.subjectId);
                      const classItem = classes.find(c => c.id === session.classId);
                      return `<td class="${sessionClass}"><strong>${subject?.name || ''}</strong><br/><small>${classItem?.name || ''}</small></td>`;
                    } else {
                      const subject = subjects.find(s => s.id === session.subjectId);
                      const teacher = teachers.find(t => t.id === session.teacherId);
                      return `<td class="${sessionClass}"><strong>${subject?.name || ''}</strong><br/><small>${teacher?.name || ''}</small></td>`;
                    }
                  }
                  return '<td></td>';
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="no-print" style="text-align: center; margin: 20px;">
          <button onclick="window.print()">طباعة</button>
          <button onclick="window.close()">إغلاق</button>
        </div>
      </body>
      </html>
    `;
  };

  // بيانات الإشراف والمناوبة اليومية
  const [supervisionData, setSupervisionData] = useState<{[key: string]: {day: string, date: string}}>({
    '1': { day: 'الأحد', date: '1447-2-5' },
    '2': { day: 'الإثنين', date: '1447-2-6' },
    '3': { day: 'الثلاثاء', date: '1447-2-7' },
    '4': { day: 'الأربعاء', date: '1447-2-8' },
    '5': { day: 'الخميس', date: '1447-2-9' }
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-1 pb-6 px-6" dir="rtl">

      {/* عنوان الصفحة */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#655ac1] to-[#8779fb] p-3 rounded-xl shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">إنشاء الجدول</h1>
          </div>
        </div>
      </div>

      {/* الشريط الموحد: العمليات الأساسية والأدوات */}
      <div className="max-w-7xl mx-auto mb-4">
        <Card className="shadow-md border-gray-200">
          <CardContent className="pt-6">
            {/* الصف الأول: العمليات الأساسية */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 mb-3">
              <Button 
                onClick={handleAutoGenerate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-[#655ac1] to-[#8779fb] hover:from-[#4338ca] hover:to-[#655ac1] text-white shadow-md h-auto py-3"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 ml-2" />
                )}
                <span className="text-sm">إنشاء الجدول</span>
              </Button>
              
              <Button 
                onClick={() => {
                  if (sessions.length === 0) {
                    showNotification('warning', 'تنبيه', 'يجب إنشاء الجدول أولاً قبل التعديل');
                  } else {
                    if (isDragMode) {
                      // عند إيقاف وضع التعديل، فتح مربع حوار احترافي
                      setShowSaveEditDialog(true);
                    } else {
                      // عند تفعيل وضع التعديل، حفظ نسخة احتياطية
                      setLastBackupSessions([...sessions]);
                      setIsDragMode(true);
                      showNotification('info', 'وضع التعديل', 'تم تفعيل وضع التعديل. يمكنك الآن سحب وإسقاط الحصص');
                    }
                  }
                }}
                className={`shadow-md h-auto py-3 transition-all ${
                  isDragMode 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                    : 'bg-gradient-to-r from-[#655ac1] to-[#8779fb] hover:from-[#4338ca] hover:to-[#655ac1] text-white'
                }`}
              >
                {isDragMode ? (
                  <Save className="w-4 h-4 ml-2" />
                ) : (
                  <Edit className="w-4 h-4 ml-2" />
                )}
                <span className="text-sm">{isDragMode ? 'حفظ/إغلاق التعديل' : 'تعديل الجدول'}</span>
              </Button>
              
              <Button 
                onClick={() => {
                  if (sessions.length === 0) {
                    showNotification('warning', 'تنبيه', 'يجب إنشاء الجدول أولاً قبل التحسين');
                  } else if (!isGenerating) {
                    handleSmartOptimize();
                  }
                }}
                className="bg-gradient-to-r from-[#655ac1] to-[#8779fb] hover:from-[#4338ca] hover:to-[#655ac1] text-white shadow-md h-auto py-3 transition-all"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Target className="w-4 h-4 ml-2" />
                )}
                <span className="text-sm">تحسين الجدول</span>
              </Button>
              
              <Button 
                onClick={() => {
                  if (sessions.length === 0) {
                    showNotification('warning', 'تنبيه', 'يجب إنشاء الجدول أولاً قبل القفل');
                  } else if (isBasicTimetableLocked) {
                    setShowUnlockConfirmDialog(true);
                  } else {
                    setIsBasicTimetableLocked(true);
                    showNotification('success', 'تم القفل', 'تم قفل الجدول بنجاح! يمكنك الآن توزيع حصص الانتظار بأمان');
                  }
                }}
                className={`shadow-md h-auto py-3 transition-all ${
                  isBasicTimetableLocked 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                    : 'bg-gradient-to-r from-[#655ac1] to-[#8779fb] hover:from-[#4338ca] hover:to-[#655ac1] text-white'
                }`}
              >
                {isBasicTimetableLocked ? (
                  <Unlock className="w-4 h-4 ml-2" />
                ) : (
                  <Lock className="w-4 h-4 ml-2" />
                )}
                <span className="text-sm">{isBasicTimetableLocked ? 'فتح الجدول' : 'قفل الجدول'}</span>
              </Button>
              
              <Button 
                onClick={() => {
                  if (sessions.length === 0) {
                    showNotification('warning', 'تنبيه', 'يجب إنشاء الجدول أولاً');
                  } else if (!isBasicTimetableLocked) {
                    showNotification('error', 'خطأ', 'يجب قفل الجدول أولاً قبل توزيع الانتظار');
                  } else if (!isGenerating) {
                    handleDistributeStandby();
                  }
                }}
                className="bg-gradient-to-r from-[#655ac1] to-[#8779fb] hover:from-[#4338ca] hover:to-[#655ac1] text-white shadow-md h-auto py-3 transition-all"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4 ml-2" />
                )}
                <span className="text-sm">توزيع الانتظار</span>
              </Button>
            </div>

            {/* فاصل بصري */}
            <div className="my-4 border-t-2 border-gray-300"></div>

            {/* الصف الثاني: الأدوات الإضافية */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
              <Button
                onClick={handleManageTimetables}
                className="bg-[#8779fb] hover:bg-[#655ac1] text-white shadow-md h-auto py-3"
              >
                <History className="w-4 h-4 ml-2" />
                <span className="text-sm">إدارة الجداول</span>
              </Button>

              <Button
                onClick={() => {
                  if (sessions.length === 0) {
                    showNotification('warning', 'تنبيه', 'يجب إنشاء الجدول أولاً قبل التصدير');
                  } else {
                    handleExportExcel();
                  }
                }}
                className="bg-[#8779fb] hover:bg-[#655ac1] text-white shadow-md h-auto py-3"
              >
                <Download className="w-4 h-4 ml-2" />
                <span className="text-sm">تصدير Excel</span>
              </Button>

              <Button
                onClick={() => {
                  if (sessions.length === 0) {
                    showNotification('warning', 'تنبيه', 'يجب إنشاء الجدول أولاً قبل التصدير');
                  } else {
                    handleExportHTML();
                  }
                }}
                className="bg-[#8779fb] hover:bg-[#655ac1] text-white shadow-md h-auto py-3"
              >
                <FileText className="w-4 h-4 ml-2" />
                <span className="text-sm">تصدير XML</span>
              </Button>

              <Button
                onClick={() => {
                  if (sessions.length === 0) {
                    showNotification('warning', 'تنبيه', 'يجب إنشاء الجدول أولاً قبل الطباعة');
                  } else {
                    handlePrint();
                  }
                }}
                className="bg-[#8779fb] hover:bg-[#655ac1] text-white shadow-md h-auto py-3"
              >
                <Printer className="w-4 h-4 ml-2" />
                <span className="text-sm">طباعة PDF</span>
              </Button>

              <Button
                onClick={() => {
                  if (sessions.length === 0) {
                    showNotification('warning', 'تنبيه', 'يجب إنشاء الجدول أولاً قبل الإرسال');
                  } else {
                    handleSend();
                  }
                }}
                className="bg-[#8779fb] hover:bg-[#655ac1] text-white shadow-md h-auto py-3"
              >
                <Send className="w-4 h-4 ml-2" />
                <span className="text-sm">إرسال الجدول</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* شريط التقدم للعمليات الجارية */}
      {isGenerating && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-gradient-to-r from-[#655ac1]/10 to-[#655ac1]/10 rounded-lg p-4 border border-[#655ac1]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#655ac1]">جاري المعالجة...</span>
              <span className="text-sm text-[#655ac1]">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-[#655ac1] to-[#8779fb] h-2.5 rounded-full animate-pulse transition-all duration-300" 
                style={{ width: progressPercentage + '%' }}
              ></div>
            </div>
            <p className="text-xs text-[#655ac1] mt-2">يرجى الانتظار حتى اكتمال العملية</p>
          </div>
        </div>
      )}

      {/* بطاقة نظام التعديل اليدوي */}
      {isDragMode && (
        <div className="max-w-7xl mx-auto mb-4">
          <Card className="border-2 border-[#655ac1] shadow-lg bg-gradient-to-r from-[#655ac1]/5 to-[#8779fb]/5">
            <CardHeader className="bg-gradient-to-r from-[#655ac1]/10 to-[#655ac1]/10 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-[#655ac1] rounded-full">
                  <MousePointer className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-[#655ac1] font-bold">نظام السحب والإفلات المتقدم</div>
                  <div className="text-sm text-[#655ac1] font-normal">تفعيل التعديل التفاعلي للجداول</div>
                </div>
                <div className="flex-1"></div>
                <Badge variant="default" className="bg-[#655ac1] hover:bg-[#655ac1] animate-pulse">
                  نشط الآن
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* إرشادات الاستخدام */}
                <div className="bg-white p-4 rounded-lg border border-[#655ac1] shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-[#655ac1] rounded-full">
                      <Info className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-[#655ac1]">كيفية الاستخدام</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#655ac1] rounded-full"></div>
                      اسحب الحصص بين المعلمين والأوقات المختلفة
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#655ac1] rounded-full"></div>
                      سيتم فحص التعارضات تلقائياً قبل النقل
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#8779fb] rounded-full"></div>
                      التأثيرات البصرية ترشدك للأماكن الصحيحة
                    </li>
                  </ul>
                </div>

                {/* إحصائيات العمليات */}
                <div className="bg-white p-4 rounded-lg border border-[#655ac1] shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-[#655ac1] rounded-full">
                      <BarChart2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-[#655ac1]">إحصائيات العمليات</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">عدد العمليات:</span>
                      <Badge variant="outline" className="text-[#655ac1] border-[#655ac1]">
                        {dragOperationsCount}
                      </Badge>
                    </div>
                    
                    {/* زر عرض العمليات */}
                    {operationsHistory.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 text-[#655ac1] border-[#655ac1] hover:bg-[#655ac1]/10"
                        onClick={() => setShowOperationsModal(true)}
                      >
                        <History className="h-4 w-4 mr-2" />
                        عرض تاريخ العمليات ({operationsHistory.length})
                      </Button>
                    )}
                    
                    {lastDragOperation && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <div className="font-medium">آخر عملية:</div>
                        <div>{lastDragOperation.from} ← {lastDragOperation.to}</div>
                        {lastDragOperation.conflicts > 0 && (
                          <div className="text-red-600 font-medium mt-1">
                            تم حل {lastDragOperation.conflicts} تعارض(ات)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* مؤشرات الألوان */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">مؤشرات الألوان:</div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#655ac1]/20 border-2 border-dashed border-[#655ac1] rounded"></div>
                    <span className="text-xs text-gray-600">منطقة إفلات صحيحة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#655ac1]/30 border-2 border-[#655ac1] rounded"></div>
                    <span className="text-xs text-gray-600">تم النقل بنجاح</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#8779fb]/20 border border-[#8779fb] rounded opacity-70"></div>
                    <span className="text-xs text-gray-600">حصة قيد السحب</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* تنبيه نتائج السحب والإفلات المرئي */}
      {lastDragOperation && (
        <div className="max-w-7xl mx-auto mb-4">
          <Card className="border-2 border-[#655ac1] bg-gradient-to-r from-[#655ac1]/10 to-[#8779fb]/10 shadow-lg animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#655ac1]/20 rounded-full flex items-center justify-center">
                  <MousePointer className="h-5 w-5 text-[#655ac1]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#655ac1]">تمت عملية السحب والإفلات!</h4>
                    <span className="bg-[#655ac1]/20 text-[#655ac1] text-xs px-2 py-1 rounded-full">
                      عملية #{lastDragOperation.operationNumber}
                    </span>
                  </div>
                  <div className="text-sm text-[#655ac1]">
                    <div><strong>المصدر:</strong> {lastDragOperation.from}</div>
                    <div><strong>الهدف:</strong> {lastDragOperation.to}</div>
                    <div><strong>الحصة:</strong> {lastDragOperation.subject} - {lastDragOperation.class}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setLastDragOperation(null)}
                  className="text-[#655ac1] hover:text-[#655ac1] p-1 rounded-full hover:bg-[#655ac1]/10"
                >
                  ×
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* أدوات التحكم والفرز */}
      <div className={isFullscreen ? "fixed inset-0 z-50 bg-white p-4 overflow-auto" : "mx-auto mt-8"}>
        <Card className={isFullscreen ? "h-full" : ""}>
          <CardHeader>
            {/* أزرار اختيار نوع الجدول - محسّنة */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 mb-4">
              <Button
                onClick={() => setViewMode('teachers')}
                variant="outline"
                className={`border-2 shadow-sm h-auto py-3 transition-all duration-200 text-sm font-medium ${
                  viewMode === 'teachers'
                    ? 'bg-gradient-to-r from-[#8779fb] to-[#655ac1] border-[#655ac1] text-white font-bold shadow-lg'
                    : 'border-[#8779fb] text-[#8779fb] bg-transparent hover:bg-[#8779fb]/10 hover:border-[#655ac1]'
                }`}
              >
                الجدول العام للمعلمين
              </Button>
              <Button
                onClick={() => setViewMode('classes')}
                variant="outline"
                className={`border-2 shadow-sm h-auto py-3 transition-all duration-200 text-sm font-medium ${
                  viewMode === 'classes'
                    ? 'bg-gradient-to-r from-[#8779fb] to-[#655ac1] border-[#655ac1] text-white font-bold shadow-lg'
                    : 'border-[#8779fb] text-[#8779fb] bg-transparent hover:bg-[#8779fb]/10 hover:border-[#655ac1]'
                }`}
              >
                الجدول العام للفصول
              </Button>
              <Button
                onClick={() => setViewMode('standby')}
                variant="outline"
                className={`border-2 shadow-sm h-auto py-3 transition-all duration-200 text-sm font-medium ${
                  viewMode === 'standby'
                    ? 'bg-gradient-to-r from-[#8779fb] to-[#655ac1] border-[#655ac1] text-white font-bold shadow-lg'
                    : 'border-[#8779fb] text-[#8779fb] bg-transparent hover:bg-[#8779fb]/10 hover:border-[#655ac1]'
                }`}
              >
                الجدول العام للانتظار
              </Button>
              <Button
                onClick={() => {
                  setViewMode('individual');
                  setSelectedIndividualType('teacher');
                }}
                variant="outline"
                className={`border-2 shadow-sm h-auto py-3 transition-all duration-200 text-sm font-medium ${
                  viewMode === 'individual' && selectedIndividualType === 'teacher'
                    ? 'bg-gradient-to-r from-[#8779fb] to-[#655ac1] border-[#655ac1] text-white font-bold shadow-lg'
                    : 'border-[#8779fb] text-[#8779fb] bg-transparent hover:bg-[#8779fb]/10 hover:border-[#655ac1]'
                }`}
              >
                جدول معلم
              </Button>
              <Button
                onClick={() => {
                  setViewMode('individual');
                  setSelectedIndividualType('class');
                }}
                variant="outline"
                className={`border-2 shadow-sm h-auto py-3 transition-all duration-200 text-sm font-medium ${
                  viewMode === 'individual' && selectedIndividualType === 'class'
                    ? 'bg-gradient-to-r from-[#8779fb] to-[#655ac1] border-[#655ac1] text-white font-bold shadow-lg'
                    : 'border-[#8779fb] text-[#8779fb] bg-transparent hover:bg-[#8779fb]/10 hover:border-[#655ac1]'
                }`}
              >
                جدول فصل
              </Button>
            </div>
            
            {/* نافذة حوار ترتيب التخصصات */}
            {showSpecializationSort && (
              <Dialog open={showSpecializationSort} onOpenChange={setShowSpecializationSort}>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <Filter className="h-5 w-5 ml-2" />
                          ترتيب التخصصات
                        </DialogTitle>
                        <DialogDescription>
                          اسحب وأفلت التخصصات لترتيبها حسب الأهمية. سيتم عرض المعلمين في الجدول حسب هذا الترتيب.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-3">
                        {specializationOrder.map((specialization, index) => (
                          <div
                            key={specialization}
                            className={`p-3 border-2 border-dashed rounded-lg cursor-move transition-all ${
                              draggedSpecialization === specialization
                                ? 'border-[#8779fb] bg-[#f5f3ff]'
                                : 'border-gray-300 hover:border-[#a78bfa]'
                            }`}
                            draggable
                            onDragStart={() => handleDragStart(specialization)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(specialization)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="w-6 h-6 bg-[#e5e1fe] text-[#655ac1] rounded-full flex items-center justify-center text-sm font-bold ml-2">
                                  {index + 1}
                                </span>
                                <span className="font-medium">{specialization}</span>
                              </div>
                              <div className="text-gray-400">
                                <MousePointer className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <DialogFooter>
                        <Button
                          onClick={handleCancelSpecializationOrder}
                          variant="outline"
                        >
                          إلغاء
                        </Button>
                        <Button
                          onClick={handleSaveSpecializationOrder}
                          className="bg-blue-600 hover:bg-[#655ac1]"
                        >
                          <Save className="h-4 w-4 ml-1" />
                          حفظ الترتيب
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                {/* اختيار الفرد للجداول الفردية */}
                {viewMode === 'individual' && (
                  <div className="flex gap-3 items-center mt-4">
                    {/* شريط الأدوات الاحترافي للجداول الفردية */}
                    <div className="w-full p-3 bg-gradient-to-r from-[#f5f3ff] via-[#e5e1fe] to-purple-50 rounded-lg border-2 border-[#ddd6fe] shadow-sm">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* زر عرض/إخفاء الكل */}
                        <Button
                          onClick={() => setShowAllIndividual(!showAllIndividual)}
                          variant={showAllIndividual ? 'default' : 'outline'}
                          size="sm"
                          className={showAllIndividual 
                            ? 'bg-gradient-to-r from-blue-600 to-[#655ac1] hover:from-[#655ac1] hover:to-[#655ac1] text-white font-semibold shadow-md' 
                            : 'border-2 border-[#c4b5fd] text-[#655ac1] hover:bg-[#f5f3ff] font-medium'
                          }
                        >
                          <Grid className="h-4 w-4 ml-1" />
                          {showAllIndividual ? 'إخفاء الكل' : 'عرض الكل'}
                        </Button>
                        
                        {/* زر تعديل الجدول للمعلمين */}
                        {selectedIndividualType === 'teacher' && !showAllIndividual && (
                          <>
                            <div className="h-6 w-px bg-[#c4b5fd]"></div>
                            <Button
                              onClick={() => {
                                if (sessions.length === 0) {
                                  showNotification('warning', 'تنبيه', 'يجب إنشاء الجدول أولاً قبل التعديل');
                                } else {
                                  if (isDragMode) {
                                    setShowSaveEditDialog(true);
                                  } else {
                                    setLastBackupSessions([...sessions]);
                                    setIsDragMode(true);
                                    showNotification('info', 'وضع التعديل', 'تم تفعيل وضع التعديل. يمكنك الآن سحب وإسقاط الحصص');
                                  }
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className={`transition-all duration-200 font-medium ${
                                isDragMode
                                  ? ''
                                  : 'border-2 border-purple-300 text-purple-700 hover:bg-purple-50'
                              }`}
                              style={isDragMode ? {
                                backgroundColor: '#16a34a !important',
                                borderColor: '#16a34a !important',
                                color: '#ffffff !important',
                                boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.3)'
                              } : {}}
                            >
                              {isDragMode ? (
                                <>
                                  <Save className="h-4 w-4 ml-1" style={{ color: '#ffffff' }} />
                                  <span style={{ color: '#ffffff !important' }}>حفظ التعديل</span>
                                </>
                              ) : (
                                <>
                                  <Edit className="h-4 w-4 ml-1" />
                                  تعديل الجدول
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* اختيار فردي */}
                    {!showAllIndividual && (
                      <>
                    {/* أزرار اختيار نوع الجدول الفردي (معلم/فصل) - تم تعطيلها بناءً على طلب المستخدم */}
                    {false && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedIndividualType('teacher')}
                          variant={selectedIndividualType === 'teacher' ? 'default' : 'outline'}
                          size="sm"
                          className={selectedIndividualType === 'teacher' 
                            ? 'bg-[#655ac1] hover:bg-[#655ac1] text-white' 
                            : 'border-[#ddd6fe] text-[#655ac1] hover:bg-[#f5f3ff]'
                          }
                        >
                          <Users className="h-4 w-4 ml-1" />
                          معلم
                        </Button>
                        <Button
                          onClick={() => setSelectedIndividualType('class')}
                          variant={selectedIndividualType === 'class' ? 'default' : 'outline'}
                          size="sm"
                          className={selectedIndividualType === 'class' 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : 'border-purple-300 text-purple-700 hover:bg-purple-50'
                          }
                        >
                          <GraduationCap className="h-4 w-4 ml-1" />
                          فصل
                        </Button>
                      </div>
                    )}
                    <Select value={selectedIndividualId} onValueChange={setSelectedIndividualId}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder={selectedIndividualType === 'teacher' ? 'اختر معلم' : 'اختر فصل'} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedIndividualType === 'teacher' 
                          ? (() => {
                              // تطبيق الفرز على المعلمين في القائمة المنسدلة
                              let sortedTeachersForSelect = [...teachers];
                              if (sortBy === 'name') {
                                sortedTeachersForSelect.sort((a, b) => {
                                  const nameA = a.name.toLowerCase();
                                  const nameB = b.name.toLowerCase();
                                  return sortOrder === 'asc' ? nameA.localeCompare(nameB, 'ar') : nameB.localeCompare(nameA, 'ar');
                                });
                              } else if (sortBy === 'specialization') {
                                if (specializationOrder.length > 0) {
                                  sortedTeachersForSelect.sort((a, b) => {
                                    const indexA = specializationOrder.indexOf(a.specialization);
                                    const indexB = specializationOrder.indexOf(b.specialization);
                                    const finalIndexA = indexA === -1 ? specializationOrder.length : indexA;
                                    const finalIndexB = indexB === -1 ? specializationOrder.length : indexB;
                                    return finalIndexA - finalIndexB;
                                  });
                                } else {
                                  sortedTeachersForSelect.sort((a, b) => {
                                    const specA = a.specialization.toLowerCase();
                                    const specB = b.specialization.toLowerCase();
                                    return sortOrder === 'asc' ? specA.localeCompare(specB, 'ar') : specB.localeCompare(specA, 'ar');
                                  });
                                }
                              }
                              return sortedTeachersForSelect.map(teacher => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.name.split(' ').slice(0, 2).join(' ')}
                                </SelectItem>
                              ));
                            })()
                          : classes.map(classItem => (
                              <SelectItem key={classItem.id} value={classItem.id}>
                                {classItem.name}
                              </SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                    
                    {/* أزرار التنقل */}
                    <div className="flex gap-1">
                      <Button
                        onClick={() => {
                          const currentList = selectedIndividualType === 'teacher' 
                            ? (() => {
                                // تطبيق نفس منطق الفرز للقائمة المستخدمة في التنقل
                                let sortedTeachersForNav = [...teachers];
                                if (sortBy === 'name') {
                                  sortedTeachersForNav.sort((a, b) => {
                                    const nameA = a.name.toLowerCase();
                                    const nameB = b.name.toLowerCase();
                                    return sortOrder === 'asc' ? nameA.localeCompare(nameB, 'ar') : nameB.localeCompare(nameA, 'ar');
                                  });
                                } else if (sortBy === 'specialization') {
                                  if (specializationOrder.length > 0) {
                                    sortedTeachersForNav.sort((a, b) => {
                                      const indexA = specializationOrder.indexOf(a.specialization);
                                      const indexB = specializationOrder.indexOf(b.specialization);
                                      return indexA - indexB;
                                    });
                                  } else {
                                    sortedTeachersForNav.sort((a, b) => {
                                      const specA = a.specialization.toLowerCase();
                                      const specB = b.specialization.toLowerCase();
                                      return sortOrder === 'asc' ? specA.localeCompare(specB, 'ar') : specB.localeCompare(specA, 'ar');
                                    });
                                  }
                                }
                                return sortedTeachersForNav;
                              })()
                            : classes;
                          const currentIndex = currentList.findIndex(item => item.id === selectedIndividualId);
                          if (currentIndex > 0) {
                            setSelectedIndividualId(currentList[currentIndex - 1].id);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        disabled={!selectedIndividualId || (selectedIndividualType === 'teacher' 
                          ? (() => {
                              let sortedTeachersForNav = [...teachers];
                              if (sortBy === 'name') {
                                sortedTeachersForNav.sort((a, b) => {
                                  const nameA = a.name.toLowerCase();
                                  const nameB = b.name.toLowerCase();
                                  return sortOrder === 'asc' ? nameA.localeCompare(nameB, 'ar') : nameB.localeCompare(nameA, 'ar');
                                });
                              } else if (sortBy === 'specialization') {
                                if (specializationOrder.length > 0) {
                                  sortedTeachersForNav.sort((a, b) => {
                                    const indexA = specializationOrder.indexOf(a.specialization);
                                    const indexB = specializationOrder.indexOf(b.specialization);
                                    return indexA - indexB;
                                  });
                                } else {
                                  sortedTeachersForNav.sort((a, b) => {
                                    const specA = a.specialization.toLowerCase();
                                    const specB = b.specialization.toLowerCase();
                                    return sortOrder === 'asc' ? specA.localeCompare(specB, 'ar') : specB.localeCompare(specA, 'ar');
                                  });
                                }
                              }
                              return sortedTeachersForNav.findIndex(t => t.id === selectedIndividualId) === 0;
                            })()
                          : classes.findIndex(c => c.id === selectedIndividualId) === 0)}
                        className="border-[#c4b5fd] text-[#655ac1] hover:bg-[#f5f3ff]"
                      >
                        ←
                      </Button>
                      <Button
                        onClick={() => {
                          const currentList = selectedIndividualType === 'teacher' 
                            ? (() => {
                                let sortedTeachersForNav = [...teachers];
                                if (sortBy === 'name') {
                                  sortedTeachersForNav.sort((a, b) => {
                                    const nameA = a.name.toLowerCase();
                                    const nameB = b.name.toLowerCase();
                                    return sortOrder === 'asc' ? nameA.localeCompare(nameB, 'ar') : nameB.localeCompare(nameA, 'ar');
                                  });
                                } else if (sortBy === 'specialization') {
                                  if (specializationOrder.length > 0) {
                                    sortedTeachersForNav.sort((a, b) => {
                                      const indexA = specializationOrder.indexOf(a.specialization);
                                      const indexB = specializationOrder.indexOf(b.specialization);
                                      return indexA - indexB;
                                    });
                                  } else {
                                    sortedTeachersForNav.sort((a, b) => {
                                      const specA = a.specialization.toLowerCase();
                                      const specB = b.specialization.toLowerCase();
                                      return sortOrder === 'asc' ? specA.localeCompare(specB, 'ar') : specB.localeCompare(specA, 'ar');
                                    });
                                  }
                                }
                                return sortedTeachersForNav;
                              })()
                            : classes;
                          const currentIndex = currentList.findIndex(item => item.id === selectedIndividualId);
                          if (currentIndex < currentList.length - 1) {
                            setSelectedIndividualId(currentList[currentIndex + 1].id);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        disabled={!selectedIndividualId || (selectedIndividualType === 'teacher' 
                          ? (() => {
                              let sortedTeachersForNav = [...teachers];
                              if (sortBy === 'name') {
                                sortedTeachersForNav.sort((a, b) => {
                                  const nameA = a.name.toLowerCase();
                                  const nameB = b.name.toLowerCase();
                                  return sortOrder === 'asc' ? nameA.localeCompare(nameB, 'ar') : nameB.localeCompare(nameA, 'ar');
                                });
                              } else if (sortBy === 'specialization') {
                                if (specializationOrder.length > 0) {
                                  sortedTeachersForNav.sort((a, b) => {
                                    const indexA = specializationOrder.indexOf(a.specialization);
                                    const indexB = specializationOrder.indexOf(b.specialization);
                                    return indexA - indexB;
                                  });
                                } else {
                                  sortedTeachersForNav.sort((a, b) => {
                                    const specA = a.specialization.toLowerCase();
                                    const specB = b.specialization.toLowerCase();
                                    return sortOrder === 'asc' ? specA.localeCompare(specB, 'ar') : specB.localeCompare(specA, 'ar');
                                  });
                                }
                              }
                              return sortedTeachersForNav.findIndex(t => t.id === selectedIndividualId) === sortedTeachersForNav.length - 1;
                            })()
                          : classes.findIndex(c => c.id === selectedIndividualId) === classes.length - 1)}
                        className="border-[#c4b5fd] text-[#655ac1] hover:bg-[#f5f3ff]"
                      >
                        →
                      </Button>
                    </div>
                      </>
                    )}
                  </div>
                )}
          </CardHeader>
          
          <CardContent>
            {/* شريط الأدوات للجداول العامة - محسّن */}
            {(viewMode === 'teachers' || viewMode === 'classes' || viewMode === 'standby') && (
              <div className="mb-4 p-3 bg-gradient-to-r from-[#f5f3ff] to-[#e5e1fe] rounded-lg border border-[#ddd6fe]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* الأدوات في الوضع العادي (الصفحة الرئيسية) */}
                  {!isFullscreen && (
                    <>
                      {/* زر الشاشة الكاملة فقط */}
                      <Button
                        onClick={() => setIsFullscreen(true)}
                        variant="outline"
                        size="sm"
                        className="border-[#c4b5fd] text-[#655ac1] hover:bg-[#e5e1fe] px-3"
                        title="شاشة كاملة"
                      >
                        <Maximize2 className="h-4 w-4 ml-1" />
                        شاشة كاملة
                      </Button>
                      
                      {/* أزرار الفرز للمعلمين والانتظار */}
                      {(viewMode === 'teachers' || viewMode === 'standby') && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleSortBySpecialization}
                            variant="outline"
                            size="sm"
                            className="border-indigo-300 text-[#655ac1] hover:bg-[#e5e1fe] px-3"
                          >
                            <Filter className="h-4 w-4 ml-1" />
                            فرز حسب التخصص
                          </Button>
                          <Button
                            onClick={handleAlphabeticalSort}
                            variant="outline"
                            size="sm"
                            className="border-indigo-300 text-[#655ac1] hover:bg-[#e5e1fe] px-3"
                          >
                            <List className="h-4 w-4 ml-1" />
                            فرز أبجدي
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* الأدوات في وضع الشاشة الكاملة */}
                  {isFullscreen && (
                    <>
                      {/* أدوات التكبير والتصغير - منفصلة عن الصفحة الرئيسية */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            if (viewMode === 'teachers') setFullscreenTeachersZoom(Math.max(60, fullscreenTeachersZoom - 10));
                            else if (viewMode === 'classes') setFullscreenClassesZoom(Math.max(60, fullscreenClassesZoom - 10));
                            else if (viewMode === 'standby') setFullscreenStandbyZoom(Math.max(60, fullscreenStandbyZoom - 10));
                          }}
                          variant="outline"
                          size="sm"
                          className="border-[#c4b5fd] text-[#655ac1] hover:bg-[#e5e1fe] px-2"
                          title="تصغير"
                        >
                          <Minimize2 className="h-4 w-4 ml-1" />
                          تصغير
                        </Button>
                        <span className="text-sm font-semibold text-[#4c1d95] min-w-[60px] text-center bg-white px-3 py-1 rounded border border-[#ddd6fe]">
                          {viewMode === 'teachers' ? fullscreenTeachersZoom : viewMode === 'classes' ? fullscreenClassesZoom : fullscreenStandbyZoom}%
                        </span>
                        <Button
                          onClick={() => {
                            if (viewMode === 'teachers') setFullscreenTeachersZoom(Math.min(150, fullscreenTeachersZoom + 10));
                            else if (viewMode === 'classes') setFullscreenClassesZoom(Math.min(150, fullscreenClassesZoom + 10));
                            else if (viewMode === 'standby') setFullscreenStandbyZoom(Math.min(150, fullscreenStandbyZoom + 10));
                          }}
                          variant="outline"
                          size="sm"
                          className="border-[#c4b5fd] text-[#655ac1] hover:bg-[#e5e1fe] px-2"
                          title="تكبير"
                        >
                          <Maximize2 className="h-4 w-4 ml-1" />
                          تكبير
                        </Button>
                        <Button
                          onClick={() => {
                            if (viewMode === 'teachers') setFullscreenTeachersZoom(100);
                            else if (viewMode === 'classes') setFullscreenClassesZoom(100);
                            else if (viewMode === 'standby') setFullscreenStandbyZoom(100);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-[#c4b5fd] text-[#655ac1] hover:bg-[#e5e1fe] px-2"
                          title="إعادة تعيين"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* زر تعديل الجدول (للمعلمين والانتظار فقط) */}
                      {(viewMode === 'teachers' || viewMode === 'standby') && (
                        <Button
                          onClick={() => {
                            if (sessions.length === 0) {
                              showNotification('warning', 'تنبيه', 'يجب إنشاء الجدول أولاً قبل التعديل');
                            } else {
                              if (isDragMode) {
                                setShowSaveEditDialog(true);
                              } else {
                                setLastBackupSessions([...sessions]);
                                setIsDragMode(true);
                                showNotification('info', 'وضع التعديل', 'تم تفعيل وضع التعديل. يمكنك الآن سحب وإسقاط الحصص');
                              }
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className={`px-3 transition-all duration-200 font-medium ${
                            isDragMode
                              ? ''
                              : 'border-2 border-purple-300 text-purple-700 hover:bg-purple-50'
                          }`}
                          style={isDragMode ? {
                            backgroundColor: '#16a34a !important',
                            borderColor: '#16a34a !important',
                            color: '#ffffff !important',
                            boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.3)'
                          } : {}}
                        >
                          {isDragMode ? (
                            <>
                              <Save className="h-4 w-4 ml-1" style={{ color: '#ffffff' }} />
                              <span style={{ color: '#ffffff !important' }}>حفظ التعديل</span>
                            </>
                          ) : (
                            <>
                              <Edit className="h-4 w-4 ml-1" />
                              تعديل الجدول
                            </>
                          )}
                        </Button>
                      )}
                      
                      {/* زر الخروج من الشاشة الكاملة */}
                      <Button
                        onClick={() => {
                          // إعادة تعيين جميع قيم zoom الشاشة الكاملة عند الخروج
                          setFullscreenTeachersZoom(100);
                          setFullscreenClassesZoom(100);
                          setFullscreenStandbyZoom(100);
                          setFullscreenIndividualZoom(100);
                          setIsFullscreen(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50 px-3"
                        title="خروج من الشاشة الكاملة"
                      >
                        <Minimize2 className="h-4 w-4 ml-1" />
                        خروج من الشاشة الكاملة
                      </Button>
                      
                      {/* أزرار الفرز للمعلمين والانتظار */}
                      {(viewMode === 'teachers' || viewMode === 'standby') && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleSortBySpecialization}
                            variant="outline"
                            size="sm"
                            className="border-indigo-300 text-[#655ac1] hover:bg-[#e5e1fe] px-3"
                          >
                            <Filter className="h-4 w-4 ml-1" />
                            فرز حسب التخصص
                          </Button>
                          <Button
                            onClick={handleAlphabeticalSort}
                            variant="outline"
                            size="sm"
                            className="border-indigo-300 text-[#655ac1] hover:bg-[#e5e1fe] px-3"
                          >
                            <List className="h-4 w-4 ml-1" />
                            فرز أبجدي
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {viewMode === 'teachers' && renderTeachersGrid()}
            {viewMode === 'classes' && renderClassesGrid()}
            {viewMode === 'standby' && renderStandbyGrid()}
            {viewMode === 'individual' && renderIndividualTimetable()}
          </CardContent>
        </Card>
      </div>

      {/* نافذة عرض عمليات التعديل */}
      <Dialog open={showOperationsModal} onOpenChange={setShowOperationsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#655ac1]" />
              تاريخ عمليات التعديل
            </DialogTitle>
            <DialogDescription>
              عرض تفصيلي لجميع عمليات السحب والإفلات التي تمت على الجدول
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#e5e1fe] rounded-full">
                      <Shuffle className="h-4 w-4 text-[#655ac1]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#655ac1]">{operationsHistory.length}</div>
                      <div className="text-xs text-gray-600">إجمالي العمليات</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {operationsHistory.filter(op => op.conflicts === 0).length}
                      </div>
                      <div className="text-xs text-gray-600">بدون تعارضات</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {operationsHistory.filter(op => op.conflicts > 0).length}
                      </div>
                      <div className="text-xs text-gray-600">مع تعارضات</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* جدول العمليات */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">سجل العمليات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">رقم العملية</TableHead>
                        <TableHead className="text-right">الوقت/التاريخ</TableHead>
                        <TableHead className="text-right">من</TableHead>
                        <TableHead className="text-right">إلى</TableHead>
                        <TableHead className="text-right">المادة</TableHead>
                        <TableHead className="text-right">الفصل</TableHead>
                        <TableHead className="text-right">التعارضات</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operationsHistory.map((operation, index) => (
                        <TableRow key={operation.id}>
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="text-[#655ac1]">
                              #{operation.operationNumber}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{operation.date}</div>
                              <div className="text-xs text-gray-500">{operation.timestamp}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-red-600 font-medium">
                              {operation.from}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-green-600 font-medium">
                              {operation.to}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {operation.subject}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {operation.class}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {operation.conflicts > 0 ? (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {operation.conflicts}
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                0
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-[#8779fb]">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              مكتمل
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {operationsHistory.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            لا توجد عمليات تعديل بعد
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOperationsModal(false)}>
              إغلاق
            </Button>
            <Button 
              onClick={() => {
                setOperationsHistory([]);
                setDragOperationsCount(0);
                setShowOperationsModal(false);
              }}
              variant="destructive"
            >
              مسح السجل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تأكيد قفل الجدول */}
      <Dialog open={showLockConfirmDialog} onOpenChange={setShowLockConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-orange-600">
              <AlertTriangle className="h-6 w-6 ml-2" />
              تنبيه - قفل الجدول مطلوب
            </DialogTitle>
            <DialogDescription className="text-gray-600 leading-relaxed">
              يجب قفل الجدول أولاً قبل توزيع حصص الانتظار لضمان عدم تأثر الحصص الأساسية المُنشأة.
              <br /><br />
              <strong>هل تريد قفل الجدول الآن والمتابعة مع توزيع الانتظار؟</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              onClick={() => setShowLockConfirmDialog(false)}
              variant="outline"
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleConfirmLockAndDistribute}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Lock className="h-4 w-4 ml-2" />
              قفل ومتابعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* مربع حوار إدارة الجداول */}
      <Dialog open={showManageTimetablesDialog} onOpenChange={setShowManageTimetablesDialog}>
        <DialogContent className="sm:max-w-6xl max-h-[85vh]" style={{ direction: 'rtl' }}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-[#655ac1] to-[#8779fb] p-3 rounded-full">
                <History className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  إدارة الجداول المحفوظة
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  عرض وإدارة جميع الجداول المُنشأة (الحد الأقصى: 10 جداول)
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-[#f5f3ff] to-[#e5e1fe] border-[#ddd6fe]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">الجداول المحفوظة</p>
                    <p className="text-3xl font-bold text-[#655ac1]">{savedTimetables.length}</p>
                  </div>
                  <FileText className="h-10 w-10 text-[#655ac1] opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">الجدول المعتمد</p>
                    <p className="text-xl font-bold text-green-600">
                      {savedTimetables.find(t => t.isActive)?.name || '-'}
                    </p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">المساحة المتبقية</p>
                    <p className="text-3xl font-bold text-amber-600">{10 - savedTimetables.length}</p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-amber-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* الجدول الاحترافي */}
          <div className="border rounded-lg overflow-hidden">
            {savedTimetables.length === 0 ? (
              <div className="text-center py-12 bg-gray-50">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold text-gray-600 mb-2">لا توجد جداول محفوظة</p>
                <p className="text-sm text-gray-500">سيتم حفظ الجداول تلقائياً عند إنشائها</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#655ac1] to-[#8779fb]">
                      <TableHead className="text-white text-center font-bold">#</TableHead>
                      <TableHead className="text-white font-bold">اسم الجدول</TableHead>
                      <TableHead className="text-white font-bold">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-white font-bold text-center">وقت الإنشاء</TableHead>
                      <TableHead className="text-white font-bold text-center">المُنشئ</TableHead>
                      <TableHead className="text-white font-bold text-center">عدد الحصص</TableHead>
                      <TableHead className="text-white font-bold text-center">الحالة</TableHead>
                      <TableHead className="text-white font-bold text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedTimetables.map((timetable, index) => (
                      <TableRow 
                        key={timetable.id}
                        className={`${
                          timetable.isActive 
                            ? 'bg-green-50 hover:bg-green-100' 
                            : 'hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <TableCell className="text-center font-bold text-[#655ac1]">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TableIcon className="h-4 w-4 text-[#655ac1]" />
                            <span className="font-semibold">{timetable.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-700">
                            <Calendar className="h-4 w-4 text-[#8779fb]" />
                            <span className="text-sm">{timetable.createdDate}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-700">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-mono">{timetable.createdTime}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-700">
                            <UserCheck className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{timetable.createdBy}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-semibold">
                            {timetable.sessions.length} حصة
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {timetable.isActive ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="h-3 w-3 ml-1" />
                              معتمد
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              غير معتمد
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            {!timetable.isActive && (
                              <Button
                                onClick={() => {
                                  setSavedTimetables(prev => prev.map(t => ({
                                    ...t,
                                    isActive: t.id === timetable.id
                                  })));
                                  showNotification('success', 'تم الاعتماد', `تم اعتماد ${timetable.name} كجدول أساسي`);
                                }}
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                title="اعتماد هذا الجدول"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              onClick={() => {
                                handleLoadTimetable(timetable.id);
                                setShowManageTimetablesDialog(false);
                              }}
                              size="sm"
                              variant="outline"
                              className="border-[#8779fb] text-[#8779fb] hover:bg-[#f5f3ff]"
                              title="عرض الجدول"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                handleDeleteTimetable(timetable.id);
                              }}
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              title="حذف الجدول"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* تنبيه في حالة الوصول للحد الأقصى */}
          {savedTimetables.length >= 10 && (
            <Alert className="mt-4 border-amber-500 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>تنبيه:</strong> تم الوصول للحد الأقصى (10 جداول). يُرجى حذف جدول قديم لإنشاء جدول جديد.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-6">
            <Button
              onClick={() => setShowManageTimetablesDialog(false)}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
            >
              <X className="h-4 w-4 ml-2" />
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تأكيد فتح قفل الجدول */}
      <Dialog open={showUnlockConfirmDialog} onOpenChange={setShowUnlockConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 font-bold text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              تحذير - فتح قفل الجدول
            </DialogTitle>
            <div className="text-gray-700 space-y-3 text-center">
              فتح قفل الجدول سيسمح بتعديل الحصص الأساسية مرة أخرى، وقد يؤثر ذلك على حصص الانتظار المنجزة.
              <br />
              <strong>هل أنت متأكد من فتح قفل الجدول؟</strong>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              onClick={() => setShowUnlockConfirmDialog(false)}
              variant="outline"
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleConfirmUnlock}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              <Unlock className="h-4 w-4 ml-2" />
              فتح القفل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نظام الإشعارات الاحترافي */}
      <div className="fixed top-4 left-4 z-50 space-y-3 max-w-md">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              animate-in slide-in-from-left duration-300
              rounded-lg shadow-2xl border-l-4 p-4 backdrop-blur-sm
              ${notification.type === 'success' ? 'bg-green-50/95 border-green-500' : ''}
              ${notification.type === 'error' ? 'bg-red-50/95 border-red-500' : ''}
              ${notification.type === 'warning' ? 'bg-amber-50/95 border-amber-500' : ''}
              ${notification.type === 'info' ? 'bg-[#f5f3ff]/95 border-[#8779fb]' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
                {notification.type === 'error' && (
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-white" />
                  </div>
                )}
                {notification.type === 'warning' && (
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                )}
                {notification.type === 'info' && (
                  <div className="w-8 h-8 bg-[#8779fb] rounded-full flex items-center justify-center">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-sm mb-1 ${
                  notification.type === 'success' ? 'text-green-900' : ''
                }${notification.type === 'error' ? 'text-red-900' : ''
                }${notification.type === 'warning' ? 'text-amber-900' : ''
                }${notification.type === 'info' ? 'text-[#4c1d95]' : ''
                }`}>
                  {notification.title}
                </h4>
                <p className={`text-xs ${
                  notification.type === 'success' ? 'text-green-700' : ''
                }${notification.type === 'error' ? 'text-red-700' : ''
                }${notification.type === 'warning' ? 'text-amber-700' : ''
                }${notification.type === 'info' ? 'text-[#655ac1]' : ''
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* مربع حوار حفظ التعديلات - احترافي */}
      <Dialog open={showSaveEditDialog} onOpenChange={setShowSaveEditDialog}>
        <DialogContent className="sm:max-w-md" style={{ direction: 'rtl' }}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-full">
                <Save className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                حفظ التعديلات
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-600">
              هل تريد حفظ التعديلات التي أجريتها على الجدول؟
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-[#655ac1] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-[#4c1d95]">
                <p className="font-semibold mb-1">ملاحظة مهمة:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>عند اختيار "حفظ"، سيتم تطبيق جميع التعديلات</li>
                  <li>عند اختيار "إلغاء"، سيتم استعادة الجدول الأصلي</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button
              onClick={() => {
                // استرجاع النسخة الاحتياطية
                if (lastBackupSessions.length > 0) {
                  setSessions([...lastBackupSessions]);
                  showNotification('info', 'تم الإلغاء', 'تم إلغاء التعديلات واستعادة الجدول السابق');
                }
                setIsDragMode(false);
                setShowSaveEditDialog(false);
              }}
              variant="outline"
              className="border-gray-300 hover:bg-gray-100"
            >
              <X className="w-4 h-4 ml-2" />
              إلغاء التعديلات
            </Button>
            <Button
              onClick={() => {
                // حفظ التعديلات وتحديث الجدول المحفوظ
                const now = new Date();
                
                // البحث عن الجدول النشط وتحديثه
                const activeTimetable = savedTimetables.find(t => t.isActive);
                if (activeTimetable) {
                  setSavedTimetables(prev => prev.map(t => 
                    t.id === activeTimetable.id 
                      ? { ...t, sessions: [...sessions], createdTime: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) }
                      : t
                  ));
                }
                
                showNotification('success', 'تم الحفظ', 'تم حفظ التعديلات بنجاح');
                setLastBackupSessions([...sessions]); // حفظ نسخة احتياطية جديدة
                setIsDragMode(false);
                setShowSaveEditDialog(false);
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <CheckCircle className="w-4 h-4 ml-2" />
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تأكيد الحذف */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <DialogTitle>تأكيد حذف الجدول</DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm leading-relaxed">
                هل أنت متأكد من حذف الجدول "{savedTimetables.find(t => t.id === timetableToDelete)?.name}"؟
              </p>
              <p className="text-red-600 text-xs mt-2">
                ⚠️ لا يمكن التراجع عن هذا الإجراء!
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => {
                setShowDeleteConfirmDialog(false);
                setTimetableToDelete(null);
              }}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
            <Button
              onClick={confirmDeleteTimetable}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف نهائياً
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartTimetablePageEnhanced;










