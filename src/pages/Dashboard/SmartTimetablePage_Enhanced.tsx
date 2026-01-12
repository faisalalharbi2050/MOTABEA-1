import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  MousePointer, Maximize2, Minimize2
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
  
  // حالات النظام
  const [activeTab, setActiveTab] = useState('general-teachers');
  const [viewMode, setViewMode] = useState<'teachers' | 'classes' | 'individual'>('teachers');
  const [isBasicTimetableLocked, setIsBasicTimetableLocked] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [selectedIndividualId, setSelectedIndividualId] = useState<string>('');
  const [selectedIndividualType, setSelectedIndividualType] = useState<'teacher' | 'class'>('teacher');
  const [isDragMode, setIsDragMode] = useState(false);
  const [lastDragOperation, setLastDragOperation] = useState(null); // لعرض آخر عملية
  const [dragOperationsCount, setDragOperationsCount] = useState(0); // عداد العمليات
  const [swappedSessions, setSwappedSessions] = useState<Set<string>>(new Set()); // الحصص المتبدلة
  const [operationsHistory, setOperationsHistory] = useState<any[]>([]); // تاريخ العمليات
  const [showOperationsModal, setShowOperationsModal] = useState(false); // نافذة العمليات
  const [showLockConfirmDialog, setShowLockConfirmDialog] = useState(false); // مربع حوار تأكيد القفل
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
  
  // بيانات النظام (بيانات تجريبية)
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: '1',
      name: 'أحمد محمد العتيبي',
      specialization: 'اللغة العربية',
      rank: 'ممارس',
      basicQuota: 24,
      standbyQuota: 6,
      subjects: ['اللغة العربية']
    },
    {
      id: '2',
      name: 'خالد سعد الأحمد',
      specialization: 'الرياضيات',
      rank: 'متقدم',
      basicQuota: 22,
      standbyQuota: 8,
      subjects: ['الرياضيات']
    },
    {
      id: '3',
      name: 'محمد عبدالله الشمري',
      specialization: 'العلوم',
      rank: 'خبير',
      basicQuota: 18,
      standbyQuota: 12,
      subjects: ['العلوم']
    }
  ]);

  const [classes, setClasses] = useState<Class[]>([
    {
      id: '1',
      name: '1-1',
      grade: 'الأول',
      section: '1',
      studentsCount: 25
    },
    {
      id: '2',
      name: '1-2',
      grade: 'الأول',
      section: '2',
      studentsCount: 28
    },
    {
      id: '3',
      name: '2-1',
      grade: 'الثاني',
      section: '1',
      studentsCount: 26
    }
  ]);

  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: '1',
      name: 'اللغة العربية',
      weeklyHours: 6,
      maxConsecutive: 1
    },
    {
      id: '2',
      name: 'الرياضيات',
      weeklyHours: 5,
      maxConsecutive: 1
    },
    {
      id: '3',
      name: 'العلوم',
      weeklyHours: 4,
      maxConsecutive: 1
    }
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
      // محاكاة عملية الإنشاء مع شريط التقدم
      const steps = 5;
      for (let i = 0; i < steps; i++) {
        setProgressPercentage(Math.round(((i + 1) / steps) * 100));
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // إنتاج جدول تجريبي
      const newSessions: ClassSession[] = [];
      let sessionId = 1;
      
      classes.forEach(classItem => {
        subjects.forEach(subject => {
          for (let i = 0; i < Math.min(subject.weeklyHours, 5); i++) {
            const teacher = teachers.find(t => t.subjects.includes(subject.name));
            if (teacher) {
              const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
              
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
            }
          }
        });
      });
      
      setSessions(newSessions);
      setCanUndo(true);
      setLastBackupSessions([]);
      
      console.log('تم إنشاء الجدول تلقائياً');
      
    } catch (error) {
      console.error('خطأ في الإنشاء التلقائي:', error);
    } finally {
      setIsGenerating(false);
      setProgressPercentage(0);
    }
  };

  const handleSmartOptimize = async () => {
    setIsGenerating(true);
    setProgressPercentage(0);
    setLastBackupSessions([...sessions]);
    
    try {
      // محاكاة التحسين الذكي
      const steps = 4;
      for (let i = 0; i < steps; i++) {
        setProgressPercentage(Math.round(((i + 1) / steps) * 100));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // تطبيق تحسينات على الجدول
      const optimizedSessions = [...sessions];
      
      setSessions(optimizedSessions);
      setCanUndo(true);
      
      console.log('تم تحسين الجدول بالذكاء الاصطناعي');
      
    } catch (error) {
      console.error('خطأ في التحسين الذكي:', error);
    } finally {
      setIsGenerating(false);
      setProgressPercentage(0);
    }
  };

  const handleDistributeStandby = async () => {
    // التحقق من قفل الجدول قبل توزيع الانتظار
    if (!isBasicTimetableLocked) {
      // إظهار مربع حوار مخصص يتطلب قفل الجدول أولاً
      setShowLockConfirmDialog(true);
      return;
    }

    setIsGenerating(true);
    setProgressPercentage(0);
    
    try {
      // محاكاة توزيع الانتظار
      const steps = 3;
      for (let i = 0; i < steps; i++) {
        setProgressPercentage(Math.round(((i + 1) / steps) * 100));
        await new Promise(resolve => setTimeout(resolve, 700));
      }
      
      console.log('تم توزيع حصص الانتظار');
      
    } catch (error) {
      console.error('خطأ في توزيع الانتظار:', error);
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
    const manageWindow = window.open('', '_blank', 'width=900,height=700');
    if (manageWindow) {
      const manageContent = generateManageTimetablesContent();
      manageWindow.document.write(manageContent);
      manageWindow.document.close();
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
          .header { text-align: center; margin-bottom: 30px; background: linear-gradient(to right, #4f46e5, #7c3aed); color: white; padding: 20px; border-radius: 10px; }
          .tab-content { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #d1d5db; padding: 12px; text-align: center; font-size: 13px; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .status-active { background-color: #dcfce7; color: #166534; }
          .status-pending { background-color: #fee2e2; color: #991b1b; }
          .btn { padding: 8px 16px; margin: 2px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
          .btn-primary { background-color: #3b82f6; color: white; }
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

  const handleExportExcel = () => {
    if (sessions.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }
    
    // إنشاء محتوى HTML محسن للتصدير كملف Excel
    const generateExcelHTML = () => {
      const tableRows = [];
    
    // إضافة رؤوس الأعمدة
      const headerRow = ['المعلم', 'التخصص', 'نصاب الحصص', 'نصاب الانتظار'];
    daysOfWeek.forEach(day => {
      for (let i = 1; i <= periodsPerDay; i++) {
          headerRow.push(`${day} - الحصة ${i}`);
      }
    });
      tableRows.push(headerRow);
    
    // إضافة بيانات المعلمين
    teachers.forEach(teacher => {
      const teacherRow = [teacher.name, teacher.specialization];
      const teacherBasicSessions = sessions.filter(s => s.teacherId === teacher.id && s.type === 'basic').length;
      const teacherStandbySessions = sessions.filter(s => s.teacherId === teacher.id && s.type === 'standby').length;
      
      teacherRow.push(teacherBasicSessions.toString(), teacherStandbySessions.toString());
      
      // إضافة الحصص للأيام
      timeSlots.forEach(slot => {
        const session = sessions.find(s => s.teacherId === teacher.id && s.timeSlotId === slot.id);
        if (session && session.type === 'basic') {
          const subject = subjects.find(s => s.id === session.subjectId);
          const classItem = classes.find(c => c.id === session.classId);
          teacherRow.push(`${subject?.name || ''} - ${classItem?.name || ''}`);
        } else if (session && session.type === 'standby') {
          teacherRow.push('انتظار');
        } else {
          teacherRow.push('');
        }
      });
      
        tableRows.push(teacherRow);
      });
      
      // إنشاء HTML محسن
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>الجدول المدرسي - ${new Date().toLocaleDateString('ar-SA')}</title>
          <style>
            body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; font-size: 12px; }
            th { background-color: #4472c4; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            tr:nth-child(odd) { background-color: #ffffff; }
            .header { text-align: center; margin: 20px 0; background-color: #4472c4; color: white; padding: 15px; border-radius: 5px; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; background-color: #e7e6e6; padding: 15px; border-radius: 5px; }
            .summary-item { text-align: center; }
            .summary-item h3 { margin: 0; color: #4472c4; }
            .summary-item p { margin: 5px 0 0 0; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>الجدول المدرسي</h1>
            <p>مدرسة متابع - ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <h3>${teachers.length}</h3>
              <p>عدد المعلمين</p>
            </div>
            <div class="summary-item">
              <h3>${classes.length}</h3>
              <p>عدد الفصول</p>
            </div>
            <div class="summary-item">
              <h3>${sessions.filter(s => s.type === 'basic').length}</h3>
              <p>الحصص المنفذة</p>
            </div>
            <div class="summary-item">
              <h3>${sessions.filter(s => s.type === 'standby').length}</h3>
              <p>حصص الانتظار</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                ${tableRows[0].map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows.slice(1).map(row => 
                `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 10px;">
            <p>تم إنتاج هذا التقرير من متابع لإدارة الجداول المدرسية</p>
            <p>تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}</p>
          </div>
        </body>
        </html>
      `;
      
      return htmlContent;
    };
    
    // إنشاء ملف HTML وتحميله
    const htmlContent = generateExcelHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `الجدول_المدرسي_${new Date().toISOString().split('T')[0]}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('تم تصدير الجدول بنجاح كملف Excel (HTML)\nيمكنك فتح الملف في Excel أو أي برنامج جداول بيانات');
    } else {
      alert('المتصفح لا يدعم تحميل الملفات');
    }
  };

  const handlePrint = () => {
    if (sessions.length === 0) {
      alert('لا توجد بيانات للطباعة');
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
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
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
            border-color: #6366f1;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.1);
          }
          
          .card.selected {
            border-color: #6366f1;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          }
          
          .card-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
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
            border-color: #6366f1;
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
            background-color: #eff6ff;
            border-right: 4px solid #6366f1;
          }
          
          .recipient-checkbox {
            margin-left: 12px;
            width: 18px;
            height: 18px;
            accent-color: #6366f1;
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
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
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
            color: #6366f1;
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
                      background-color: #4f46e5;
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
                      background-color: #f0f9ff !important;
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
            background: linear-gradient(to right, #6366f1, #8b5cf6, #6366f1);
          }

          .school-logo {
            margin: 0 auto 1rem;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #4f46e5;
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
            background-color: #f0f9ff !important;
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
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
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
            border-color: #6366f1;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.1);
          }
          
          .card.selected {
            border-color: #6366f1;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          }
          
          .card-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
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
            border-color: #6366f1;
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
            background-color: #eff6ff;
            border-right: 4px solid #6366f1;
          }
          
          .recipient-checkbox {
            margin-left: 12px;
            width: 18px;
            height: 18px;
            accent-color: #6366f1;
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
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
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
            color: #6366f1;
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
    setSortBy('name');
    setSortOrder('asc');
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
          return indexA - indexB;
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

    return (
      <div style={{ 
        position: 'relative',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: '500',
          borderBottom: '1px solid #e5e7eb'
        }}>
          ← يمكنك التمرير أفقياً لعرض جميع الحصص - الأعمدة الأساسية تبقى ثابتة →
        </div>
        <div style={{
          position: 'relative',
          overflowX: 'auto',
          overflowY: 'visible',
          scrollBehavior: 'smooth'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0',
            minWidth: '1500px'
          }}>
            <thead>
              <tr>
                <th style={{
                  position: 'sticky',
                  right: '0px',
                  background: '#f8fafc',
                  zIndex: 25,
                  boxShadow: '2px 0 8px rgba(0,0,0,0.12)',
                  width: '180px',
                  minWidth: '180px',
                  maxWidth: '180px',
                  borderRight: '3px solid #3b82f6',
                  border: '1px solid #e5e7eb',
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#1e40af'
                }}>
                  المعلم
                </th>
                <th style={{
                  position: 'sticky',
                  right: '180px',
                  background: '#f8fafc',
                  zIndex: 24,
                  boxShadow: '2px 0 6px rgba(0,0,0,0.08)',
                  width: '100px',
                  minWidth: '100px',
                  maxWidth: '100px',
                  borderRight: '2px solid #e5e7eb',
                  border: '1px solid #e5e7eb',
                  padding: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#1e40af'
                }}>
                  التخصص
                </th>
                <th style={{
                  position: 'sticky',
                  right: '280px',
                  background: '#f8fafc',
                  zIndex: 23,
                  boxShadow: '2px 0 6px rgba(0,0,0,0.08)',
                  width: '80px',
                  minWidth: '80px',
                  maxWidth: '80px',
                  borderRight: '2px solid #e5e7eb',
                  border: '1px solid #e5e7eb',
                  padding: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#1e40af'
                }}>
                  نصاب الحصص
                </th>
                <th style={{
                  position: 'sticky',
                  right: '360px',
                  background: '#f8fafc',
                  zIndex: 22,
                  boxShadow: '2px 0 6px rgba(0,0,0,0.08)',
                  width: '80px',
                  minWidth: '80px',
                  maxWidth: '80px',
                  borderRight: '2px solid #e5e7eb',
                  border: '1px solid #e5e7eb',
                  padding: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#1e40af'
                }}>
                  نصاب الانتظار
                </th>
                {daysOfWeek.map(day => (
                  <th key={day} style={{
                    background: 'linear-gradient(to right, #dbeafe, #bfdbfe)',
                    border: '1px solid #e5e7eb',
                    padding: '8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#1e40af',
                    position: 'sticky',
                    top: '0',
                    zIndex: 20
                  }} colSpan={periodsPerDay}>
                    {day}
                  </th>
                ))}
              </tr>
              <tr>
                <th style={{
                  position: 'sticky',
                  right: '0px',
                  background: '#f1f5f9',
                  zIndex: 25,
                  width: '180px',
                  border: '1px solid #e5e7eb',
                  padding: '8px'
                }}></th>
                <th style={{
                  position: 'sticky',
                  right: '180px',
                  background: '#f1f5f9',
                  zIndex: 24,
                  width: '100px',
                  border: '1px solid #e5e7eb',
                  padding: '8px'
                }}></th>
                <th style={{
                  position: 'sticky',
                  right: '280px',
                  background: '#f1f5f9',
                  zIndex: 23,
                  width: '80px',
                  border: '1px solid #e5e7eb',
                  padding: '8px'
                }}></th>
                <th style={{
                  position: 'sticky',
                  right: '360px',
                  background: '#f1f5f9',
                  zIndex: 22,
                  width: '80px',
                  border: '1px solid #e5e7eb',
                  padding: '8px'
                }}></th>
                {daysOfWeek.map(day => (
                  Array.from({ length: periodsPerDay }, (_, i) => (
                    <th key={day + '-' + (i + 1)} style={{
                      background: '#f1f5f9',
                      border: '1px solid #e5e7eb',
                      padding: '4px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      position: 'sticky',
                      top: '60px',
                      zIndex: 20
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
                
                return (
                  <tr key={teacher.id} style={{
                    backgroundColor: teacherIndex % 2 === 0 ? '#ffffff' : '#f9fafb'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = teacherIndex % 2 === 0 ? '#ffffff' : '#f9fafb'}>
                    <td style={{
                      position: 'sticky',
                      right: '0px',
                      background: teacherIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                      zIndex: 15,
                      boxShadow: '2px 0 8px rgba(0,0,0,0.12)',
                      width: '180px',
                      borderRight: '3px solid #3b82f6',
                      border: '1px solid #e5e7eb',
                      padding: '12px',
                      textAlign: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#1d4ed8', fontSize: '16px', lineHeight: '1.2' }}>
                          {teacher.name.split(' ').slice(0, 2).join(' ')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          {getActualTeacherRank(teacher)}
                        </div>
                      </div>
                    </td>
                    <td style={{
                      position: 'sticky',
                      right: '180px',
                      background: teacherIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                      zIndex: 14,
                      boxShadow: '2px 0 6px rgba(0,0,0,0.08)',
                      width: '100px',
                      borderRight: '2px solid #e5e7eb',
                      border: '1px solid #e5e7eb',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '12px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: '600'
                      }}>
                        {teacher.specialization === 'اللغة العربية' ? 'عربي' :
                         teacher.specialization === 'الرياضيات' ? 'رياضيات' :
                         teacher.specialization === 'العلوم' ? 'علوم' :
                         teacher.specialization}
                      </span>
                    </td>
                    <td style={{
                      position: 'sticky',
                      right: '280px',
                      background: teacherIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                      zIndex: 13,
                      boxShadow: '2px 0 6px rgba(0,0,0,0.08)',
                      width: '80px',
                      borderRight: '2px solid #e5e7eb',
                      border: '1px solid #e5e7eb',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e40af' }}>{teacherBasicSessions}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>حصة</div>
                      </div>
                    </td>
                    <td style={{
                      position: 'sticky',
                      right: '360px',
                      background: teacherIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                      zIndex: 12,
                      boxShadow: '2px 0 6px rgba(0,0,0,0.08)',
                      width: '80px',
                      borderRight: '2px solid #e5e7eb',
                      border: '1px solid #e5e7eb',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ea580c' }}>{teacherStandbySessions}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>انتظار</div>
                      </div>
                    </td>
                    {timeSlots.map(slot => {
                      const session = sessions.find(s => 
                        s.teacherId === teacher.id && s.timeSlotId === slot.id
                      );
                      
                      return (
                        <td 
                          key={slot.id} 
                          style={{
                            width: '120px',
                            minWidth: '120px',
                            maxWidth: '120px',
                            height: '70px',
                            verticalAlign: 'top',
                            padding: '3px',
                            border: '1px solid #e5e7eb',
                            ...(isDragMode ? {
                              cursor: 'pointer',
                              transition: 'background-color 0.15s ease'
                            } : {})
                          }}
                          {...(isDragMode ? {
                            onDragOver: (e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              
                              // تأثيرات بصرية متقدمة
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                              e.currentTarget.style.border = '2px dashed #22c55e';
                              e.currentTarget.style.transform = 'scale(1.02)';
                              e.currentTarget.style.boxShadow = '0 4px 20px rgba(34, 197, 94, 0.2)';
                              e.currentTarget.style.transition = 'all 0.2s ease-in-out';
                            },
                            onDragLeave: (e) => {
                              e.currentTarget.style.backgroundColor = '';
                              e.currentTarget.style.border = '1px solid #e5e7eb';
                              e.currentTarget.style.transform = '';
                              e.currentTarget.style.boxShadow = '';
                              e.currentTarget.style.transition = '';
                            },
                            onDrop: (e) => {
                              e.preventDefault();
                              e.currentTarget.style.backgroundColor = '';
                              e.currentTarget.style.border = '1px solid #e5e7eb';
                              e.currentTarget.style.transform = '';
                              
                              const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                              
                              // تنفيذ النقل المتقدم مع فحص التعارضات
                              const success = handleDragDrop(dragData, {
                                teacherId: teacher.id,
                                day: slot.day,
                                period: slot.period
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
                            }
                          } : {})}
                        >
                          {session ? (
                            <div 
                              style={{
                                width: '100%',
                                height: '62px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '500',
                                textAlign: 'center',
                                cursor: isDragMode ? 'grab' : 'pointer',
                                transition: 'all 0.15s ease',
                                padding: '2px',
                                boxSizing: 'border-box',
                                backgroundColor: session.type === 'basic' ? '#dbeafe' : '#dcfce7',
                                color: session.type === 'basic' ? '#1e40af' : '#166534',
                                border: session.type === 'basic' ? '1px solid #93c5fd' : '1px solid #86efac'
                              }}
                              {...(isDragMode ? {
                                draggable: true,
                                onDragStart: (e) => {
                                  // تأثيرات بصرية متقدمة للسحب
                                  e.currentTarget.style.opacity = '0.7';
                                  e.currentTarget.style.transform = 'rotate(3deg) scale(1.05)';
                                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                                  e.currentTarget.style.zIndex = '1000';
                                  e.currentTarget.style.transition = 'all 0.2s ease-in-out';
                                  
                                  // إضافة مؤشر بصري للسحب
                                  const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
                                  dragElement.style.width = '120px';
                                  dragElement.style.height = '60px';
                                  dragElement.style.backgroundColor = '#3b82f6';
                                  dragElement.style.color = 'white';
                                  dragElement.style.border = '2px solid #1d4ed8';
                                  dragElement.style.borderRadius = '8px';
                                  dragElement.style.opacity = '0.9';
                                  dragElement.style.transform = 'rotate(-5deg)';
                                  
                                  e.dataTransfer.effectAllowed = 'move';
                                  e.dataTransfer.setDragImage(dragElement, 60, 30);
                                  
                                  // إعداد البيانات للنقل
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
                                  
                                  console.log('بدء سحب من الجدول العام:', {
                                    teacher: teacher.name,
                                    day: slot.day,
                                    period: slot.period,
                                    subject: subjects.find(s => s.id === session.subjectId)?.name
                                  });
                                },
                                onDragEnd: (e) => {
                                  // إعادة تعيين التأثيرات البصرية
                                  e.currentTarget.style.opacity = '1';
                                  e.currentTarget.style.transform = '';
                                  e.currentTarget.style.boxShadow = '';
                                  e.currentTarget.style.zIndex = '';
                                  e.currentTarget.style.transition = '';
                                }
                              } : {})}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {session.type === 'basic' ? (
                                <>
                                  <div style={{ fontWeight: '600', lineHeight: '1.1', marginBottom: '2px', fontSize: '11px' }}>
                                    {subjects.find(s => s.id === session.subjectId)?.name}
                                  </div>
                                  <div style={{ fontSize: '10px', opacity: '0.85', lineHeight: '1' }}>
                                    {classes.find(c => c.id === session.classId)?.name}
                                  </div>
                                  {/* مؤشر السهمين المتعاكسين للحصص المتبدلة */}
                                  {swappedSessions.has(session.id) && (
                                    <div style={{
                                      position: 'absolute',
                                      top: '2px',
                                      right: '2px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <span className="swap-indicator" style={{
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: '#059669',
                                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                                        display: 'inline-block'
                                      }}>⇄</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div style={{ fontWeight: '600', fontSize: '12px' }}>انتظار</div>
                              )}
                            </div>
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '62px',
                              background: '#f9fafb',
                              border: '1px dashed #d1d5db',
                              borderRadius: '6px'
                            }}></div>
                          )}
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
    return (
      <div style={{ 
        position: 'relative',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: '500',
          borderBottom: '1px solid #e5e7eb'
        }}>
          ← يمكنك التمرير أفقياً لعرض جميع الحصص - الأعمدة الأساسية تبقى ثابتة →
        </div>
        <div style={{
          position: 'relative',
          overflowX: 'auto',
          overflowY: 'visible',
          scrollBehavior: 'smooth'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0',
            minWidth: '1400px'
          }}>
            <thead>
              <tr>
                <th style={{
                  position: 'sticky',
                  right: '0px',
                  background: '#f8fafc',
                  zIndex: 25,
                  boxShadow: '2px 0 8px rgba(0,0,0,0.12)',
                  width: '150px',
                  minWidth: '150px',
                  maxWidth: '150px',
                  borderRight: '3px solid #8b5cf6',
                  border: '1px solid #e5e7eb',
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#6b21a8'
                }}>
                  الصف والفصل
                </th>
                <th style={{
                  position: 'sticky',
                  right: '150px',
                  background: '#f8fafc',
                  zIndex: 24,
                  boxShadow: '2px 0 6px rgba(0,0,0,0.08)',
                  width: '80px',
                  minWidth: '80px',
                  maxWidth: '80px',
                  borderRight: '2px solid #e5e7eb',
                  border: '1px solid #e5e7eb',
                  padding: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#6b21a8'
                }}>
                  الحصص
                </th>
                {daysOfWeek.map(day => (
                  <th key={day} style={{
                    background: 'linear-gradient(to right, #f3e8ff, #e9d5ff)',
                    border: '1px solid #e5e7eb',
                    padding: '8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#6b21a8',
                    position: 'sticky',
                    top: '0',
                    zIndex: 20
                  }} colSpan={periodsPerDay}>
                    {day}
                  </th>
                ))}
              </tr>
              <tr>
                <th style={{
                  position: 'sticky',
                  right: '0px',
                  background: '#f1f5f9',
                  zIndex: 25,
                  width: '150px',
                  border: '1px solid #e5e7eb',
                  padding: '8px'
                }}></th>
                <th style={{
                  position: 'sticky',
                  right: '150px',
                  background: '#f1f5f9',
                  zIndex: 24,
                  width: '80px',
                  border: '1px solid #e5e7eb',
                  padding: '8px'
                }}></th>
                {daysOfWeek.map(day => (
                  Array.from({ length: periodsPerDay }, (_, i) => (
                    <th key={day + '-' + (i + 1)} style={{
                      background: '#f1f5f9',
                      border: '1px solid #e5e7eb',
                      padding: '4px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      position: 'sticky',
                      top: '60px',
                      zIndex: 20
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
                const displayName = classItem.name;
                
                return (
                  <tr key={classItem.id} style={{
                    backgroundColor: classIndex % 2 === 0 ? '#ffffff' : '#f9fafb'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fdf4ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = classIndex % 2 === 0 ? '#ffffff' : '#f9fafb'}>
                    <td style={{
                      position: 'sticky',
                      right: '0px',
                      background: classIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                      zIndex: 15,
                      boxShadow: '2px 0 8px rgba(0,0,0,0.12)',
                      width: '150px',
                      borderRight: '3px solid #8b5cf6',
                      border: '1px solid #e5e7eb',
                      padding: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontWeight: 'bold', color: '#7c3aed', fontSize: '18px', lineHeight: '1.2' }}>
                        {displayName}
                      </div>
                    </td>
                    <td style={{
                      position: 'sticky',
                      right: '150px',
                      background: classIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                      zIndex: 14,
                      boxShadow: '2px 0 6px rgba(0,0,0,0.08)',
                      width: '80px',
                      borderRight: '2px solid #e5e7eb',
                      border: '1px solid #e5e7eb',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>{classAssignedSessions}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>حصة</div>
                      </div>
                    </td>
                    {timeSlots.map(slot => {
                      const session = sessions.find(s => 
                        s.classId === classItem.id && s.timeSlotId === slot.id && s.type === 'basic'
                      );
                      
                      return (
                        <td key={slot.id} style={{
                          width: '120px',
                          minWidth: '120px',
                          maxWidth: '120px',
                          height: '70px',
                          verticalAlign: 'top',
                          padding: '3px',
                          border: '1px solid #e5e7eb'
                        }}>
                          {session ? (
                            <div 
                              style={{
                                width: '100%',
                                height: '62px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '500',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                padding: '2px',
                                boxSizing: 'border-box',
                                backgroundColor: '#f3e8ff',
                                color: '#6b21a8',
                                border: '1px solid #c4b5fd'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <div style={{ fontWeight: '600', lineHeight: '1.1', marginBottom: '2px', fontSize: '11px' }}>
                                {subjects.find(s => s.id === session.subjectId)?.name}
                              </div>
                              <div style={{ fontSize: '10px', opacity: '0.85', lineHeight: '1' }}>
                                {teachers.find(t => t.id === session.teacherId)?.name.split(' ').slice(0, 2).join(' ')}
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '62px',
                              background: '#f9fafb',
                              border: '1px dashed #d1d5db',
                              borderRadius: '6px'
                            }}></div>
                          )}
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

  // عرض الجدول الفردي (معلم أو فصل واحد)
  const renderIndividualTimetable = () => {
    if (!selectedIndividualId) {
      return (
        <div className="text-center py-12">
          <div className="mb-4">
            <Eye className="h-16 w-16 text-gray-300 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            اختر {selectedIndividualType === 'teacher' ? 'معلم' : 'فصل'} لعرض جدوله
          </h3>
          <p className="text-gray-500">
            استخدم القائمة المنسدلة أعلاه لاختيار {selectedIndividualType === 'teacher' ? 'المعلم' : 'الفصل'} المطلوب
          </p>
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">
                {selectedIndividualType === 'teacher' 
                  ? (individual as Teacher).name.split(' ').slice(0, 2).join(' ')
                  : (individual as Class).name
                }
              </h2>
              {selectedIndividualType === 'teacher' && (
                <div className="flex gap-4 text-sm text-blue-700">
                  <span>التخصص: {(individual as Teacher).specialization}</span>
                  <span>الرتبة: {(individual as Teacher).rank}</span>
                </div>
              )}
            </div>
            
            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {individualSessions.filter(s => s.type === 'basic').length}
                </div>
                <div className="text-sm text-blue-700">الحصص</div>
              </div>
              {selectedIndividualType === 'teacher' && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {individualSessions.filter(s => s.type === 'standby').length}
                  </div>
                  <div className="text-sm text-orange-700">الانتظار</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الجدول الفردي */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-3 text-sm font-semibold w-20">اليوم</th>
                {Array.from({ length: periodsPerDay }, (_, i) => (
                  <th key={i + 1} className="border border-gray-300 p-3 text-sm font-semibold">
                    الحصة {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map(day => (
                <tr key={day} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 text-center font-semibold bg-gray-100">
                    {day}
                  </td>
                  {Array.from({ length: periodsPerDay }, (_, periodIndex) => {
                    const timeSlot = timeSlots.find(ts => 
                      ts.day === day && ts.period === periodIndex + 1
                    );
                    const session = timeSlot ? individualSessions.find(s => 
                      s.timeSlotId === timeSlot.id
                    ) : null;
                    
                    return (
                      <td 
                        key={periodIndex + 1} 
                        className={`border border-gray-300 p-2 h-20 relative ${isDragMode ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''}`}
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
                              session.type === 'basic' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : 'bg-green-100 text-green-800 border border-green-200'
                            } ${isDragMode ? 'cursor-grab hover:opacity-80 transition-opacity' : ''}`}
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
                                subject: subjects.find(s => s.id === session.subjectId)?.name,
                                subjectId: session.subjectId,
                                class: classes.find(c => c.id === session.classId)?.name,
                                classId: session.classId,
                                type: 'individual-schedule'
                              }));
                              
                              console.log('بدء سحب من الجدول الفردي:', {
                                day, 
                                period: periodIndex + 1,
                                subject: subjects.find(s => s.id === session.subjectId)?.name,
                                class: classes.find(c => c.id === session.classId)?.name
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
                              <>
                                <div className="font-semibold text-sm">
                                  {subjects.find(s => s.id === session.subjectId)?.name}
                                </div>
                                <div className="text-xs mt-1">
                                  {classes.find(c => c.id === session.classId)?.name}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="font-semibold text-sm">
                                  {subjects.find(s => s.id === session.subjectId)?.name}
                                </div>
                                <div className="text-xs mt-1">
                                  {teachers.find(t => t.id === session.teacherId)?.name}
                                </div>
                              </>
                            )}
                            {session.type === 'standby' && (
                              <div className="text-xs mt-1 font-semibold text-green-600">انتظار</div>
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
              
              {/* شريط الإشراف والمناوبة اليومية مضمن في الجدول */}
              {selectedIndividualType === 'teacher' && (
                <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <td colSpan={periodsPerDay + 1} className="border border-gray-300 p-4">
                    <div className="flex justify-center gap-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Shield className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-green-800">الإشراف اليومي</div>
                          <div className="text-xs text-green-600">{supervisionData['1']?.day || 'الأحد'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-emerald-800">المناوبة اليومية</div>
                          <div className="text-xs text-emerald-600">
                            {supervisionData['1']?.day || 'الأحد'} الموافق {supervisionData['1']?.date || '1447-2-5'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
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
            className="text-blue-700 border-blue-300 hover:bg-blue-50"
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
            ${selectedIndividualType === 'teacher' ? `
              <tr style="background: linear-gradient(to right, #f0fdf4, #ecfdf5);">
                <td colspan="${periodsPerDay + 1}" style="padding: 12px; text-align: center; border: 1px solid #000;">
                  <div style="display: flex; justify-content: center; gap: 32px; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 32px; height: 32px; background-color: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #166534; font-size: 16px;">🛡️</span>
                      </div>
                      <div>
                        <div style="font-size: 14px; font-weight: 600; color: #166534;">الإشراف اليومي</div>
                        <div style="font-size: 12px; color: #166534;">${supervisionData['1']?.day || 'الأحد'}</div>
                      </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 32px; height: 32px; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #047857; font-size: 16px;">📅</span>
                      </div>
                      <div>
                        <div style="font-size: 14px; font-weight: 600; color: #047857;">المناوبة اليومية</div>
                        <div style="font-size: 12px; color: #047857;">
                          ${supervisionData['1']?.day || 'الأحد'} الموافق ${supervisionData['1']?.date || '1447-2-5'}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ` : ''}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-kufi" style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl">م</span>
            </div>
            <div className="mr-3">
              <h2 className="text-lg font-bold text-gray-800">متابع</h2>
            </div>
          </div>
          <Link to="/dashboard" className="w-10 h-10 flex items-center justify-center text-white transition-colors bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-full shadow-sm">
            <Home className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* عنوان الصفحة */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Calendar className="h-7 w-7 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">الجداول</h1>
        </div>
      </div>

      {/* إحصائيات الجدول */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* عدد الحصص */}
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-indigo-600 mb-1">عدد الحصص</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {classes.length * daysOfWeek.length * periodsPerDay}
                  </p>
                  <p className="text-xs text-indigo-500 mt-1">
                    {classes.length} فصل × {daysOfWeek.length} أيام × {periodsPerDay} حصص
                  </p>
                </div>
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Grid className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* عدد الفصول */}
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600 mb-1">عدد الفصول</p>
                  <p className="text-2xl font-bold text-blue-900">{classes.length}</p>
                  <p className="text-xs text-blue-500 mt-1">الفصول المدرجة</p>
                </div>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* عدد المعلمين */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-indigo-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-indigo-600 mb-1">عدد المعلمين</p>
                  <p className="text-2xl font-bold text-indigo-900">{teachers.length}</p>
                  <p className="text-xs text-indigo-500 mt-1">المعلمين المسجلين</p>
                </div>
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إجمالي الانتظار */}
          <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">إجمالي الانتظار</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teachers.reduce((total, teacher) => total + teacher.standbyQuota, 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {teachers.length} معلم × {teachers.length > 0 ? Math.round(teachers.reduce((total, teacher) => total + teacher.standbyQuota, 0) / teachers.length) : 0} حصة متوسط
                  </p>
                </div>
                <div className="p-2 bg-gray-500 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* أدوات التحكم الرئيسية */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
            <CardTitle className="flex items-center text-indigo-900">
              <Settings className="h-6 w-6 ml-3 text-indigo-600" />
              <span className="text-xl font-bold">إعدادات الجدول</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* الأزرار الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* إنشاء الجدول */}
              <div className="group">
                <Button
                  onClick={handleAutoGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-5 w-5 ml-2 animate-spin" />
                  ) : (
                    <Zap className="h-5 w-5 ml-2" />
                  )}
                  إنشاء الجدول
                </Button>
              </div>

              {/* تحسين الجدول */}
              <div className="group">
                <Button
                  onClick={handleSmartOptimize}
                  disabled={isGenerating || sessions.length === 0}
                  className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-5 w-5 ml-2 animate-spin" />
                  ) : (
                    <Target className="h-5 w-5 ml-2" />
                  )}
                  تحسين الجدول
                </Button>
              </div>

              {/* قفل/فتح الجدول */}
              <div className="group">
                <Button
                  onClick={() => setIsBasicTimetableLocked(!isBasicTimetableLocked)}
                  className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                >
                  {isBasicTimetableLocked ? (
                    <Unlock className="h-5 w-5 ml-2" />
                  ) : (
                    <Lock className="h-5 w-5 ml-2" />
                  )}
                  {isBasicTimetableLocked ? 'فتح الجدول' : 'قفل الجدول'}
                </Button>
              </div>

              {/* توزيع الانتظار */}
              <div className="group">
                <Button
                  onClick={handleDistributeStandby}
                  disabled={isGenerating || sessions.length === 0}
                  className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-5 w-5 ml-2 animate-spin" />
                  ) : (
                    <Calendar className="h-5 w-5 ml-2" />
                  )}
                  توزيع الانتظار
                </Button>
              </div>
            </div>

            {/* شريط التقدم للعمليات الجارية */}
            {isGenerating && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">جاري المعالجة...</span>
                    <span className="text-sm text-blue-700">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full animate-pulse transition-all duration-300" 
                      style={{ width: progressPercentage + '%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">يرجى الانتظار حتى اكتمال العملية</p>
                </div>
              </div>
            )}

            {/* أدوات إضافية */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-wrap gap-3 justify-between">
                {/* مجموعة أدوات التحكم */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleManageTimetables}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <History className="h-4 w-4 ml-1" />
                    إدارة الجداول
                  </Button>

                  <Button
                    onClick={() => setIsDragMode(!isDragMode)}
                    variant={isDragMode ? "default" : "outline"}
                    size="sm"
                    className={isDragMode ? "bg-blue-500 hover:bg-blue-600 text-white" : "border-blue-300 text-blue-700 hover:bg-blue-50"}
                  >
                    <Edit className="h-4 w-4 ml-1" />
                    التعديل اليدوي
                    {dragOperationsCount > 0 && (
                      <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {dragOperationsCount}
                      </span>
                    )}
                  </Button>

                  <Button
                    onClick={handleAddSupervisionAndDuty}
                    disabled={sessions.length === 0}
                    variant="outline"
                    size="sm"
                    className="border-orange-400 text-orange-700 hover:bg-orange-50 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-orange-50 to-amber-50"
                  >
                    <Shield className="h-4 w-4 ml-1" />
                    إضافة الإشراف والمناوبة للمعلمين
                  </Button>
                </div>

                {/* مجموعة أدوات التصدير - تم نقلها إلى اليسار */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportExcel}
                    variant="outline"
                    size="sm"
                    className="text-blue-700 border-blue-300 hover:bg-blue-50"
                    disabled={sessions.length === 0}
                  >
                    <Download className="h-4 w-4 ml-1" />
                    تصدير Excel
                  </Button>

                  <Button
                    onClick={handleExportToMadrasati}
                    variant="outline"
                    size="sm"
                    className="text-blue-700 border-blue-300 hover:bg-blue-50"
                    disabled={sessions.length === 0}
                  >
                    <Download className="h-4 w-4 ml-1" />
                    تصدير الجدول لمدرستي
                  </Button>

                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    size="sm"
                    className="text-blue-700 border-blue-300 hover:bg-blue-50"
                    disabled={sessions.length === 0}
                  >
                    <Printer className="h-4 w-4 ml-1" />
                    طباعة
                  </Button>

                  <Button
                    onClick={handleSend}
                    variant="outline"
                    size="sm"
                    className="text-blue-700 border-blue-300 hover:bg-blue-50"
                    disabled={sessions.length === 0}
                  >
                    <Send className="h-4 w-4 ml-1" />
                    إرسال
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {isDragMode && (
          <Card className="mt-6 border-2 border-green-200 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-full">
                  <MousePointer className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-green-800 font-bold">نظام السحب والإفلات المتقدم</div>
                  <div className="text-sm text-green-600 font-normal">تفعيل التعديل التفاعلي للجداول</div>
                </div>
                <div className="flex-1"></div>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600 animate-pulse">
                  نشط الآن
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* إرشادات الاستخدام */}
                <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-blue-500 rounded-full">
                      <Info className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-blue-800">كيفية الاستخدام</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      اسحب الحصص بين المعلمين والأوقات المختلفة
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      سيتم فحص التعارضات تلقائياً قبل النقل
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      التأثيرات البصرية ترشدك للأماكن الصحيحة
                    </li>
                  </ul>
                </div>

                {/* إحصائيات العمليات */}
                <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-green-500 rounded-full">
                      <BarChart2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-green-800">إحصائيات العمليات</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">عدد العمليات:</span>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        {dragOperationsCount}
                      </Badge>
                    </div>
                    
                    {/* زر عرض العمليات */}
                    {operationsHistory.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 text-blue-600 border-blue-300 hover:bg-blue-50"
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
                    <div className="w-4 h-4 bg-green-200 border-2 border-dashed border-green-500 rounded"></div>
                    <span className="text-xs text-gray-600">منطقة إفلات صحيحة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-300 border-2 border-green-500 rounded"></div>
                    <span className="text-xs text-gray-600">تم النقل بنجاح</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded opacity-70"></div>
                    <span className="text-xs text-gray-600">حصة قيد السحب</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* تنبيه نتائج السحب والإفلات المرئي */}
      {lastDragOperation && (
        <div className="max-w-7xl mx-auto mb-4">
          <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MousePointer className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-blue-800">تمت عملية السحب والإفلات!</h4>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      عملية #{lastDragOperation.operationNumber}
                    </span>
                  </div>
                  <div className="text-sm text-blue-700">
                    <div><strong>المصدر:</strong> {lastDragOperation.from}</div>
                    <div><strong>الهدف:</strong> {lastDragOperation.to}</div>
                    <div><strong>الحصة:</strong> {lastDragOperation.subject} - {lastDragOperation.class}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setLastDragOperation(null)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                >
                  ×
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* اختيار طريقة العرض - منطقة بارزة ومميزة */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-indigo-200 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">عرض الجدول</h2>
              <p className="text-gray-600">اختر نوع الجدول الذي تريد عرضه أو تحريره</p>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setViewMode('teachers')}
                variant={viewMode === 'teachers' ? 'default' : 'outline'}
                size="lg"
                className={viewMode === 'teachers' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0' 
                  : 'border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400'
                }
              >
                <Users className="h-5 w-5 ml-2" />
                الجدول العام للمعلمين
              </Button>
              
              <Button
                onClick={() => setViewMode('classes')}
                variant={viewMode === 'classes' ? 'default' : 'outline'}
                size="lg"
                className={viewMode === 'classes' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0' 
                  : 'border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400'
                }
              >
                <GraduationCap className="h-5 w-5 ml-2" />
                الجدول العام للفصول
              </Button>
              
              <Button
                onClick={() => {
                  setViewMode('individual');
                  setSelectedIndividualType('teacher');
                }}
                variant={viewMode === 'individual' && selectedIndividualType === 'teacher' ? 'default' : 'outline'}
                size="lg"
                className={viewMode === 'individual' && selectedIndividualType === 'teacher'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0' 
                  : 'border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400'
                }
              >
                <UserCheck className="h-5 w-5 ml-2" />
                جدول معلم
              </Button>
              
              <Button
                onClick={() => {
                  setViewMode('individual');
                  setSelectedIndividualType('class');
                }}
                variant={viewMode === 'individual' && selectedIndividualType === 'class' ? 'default' : 'outline'}
                size="lg"
                className={viewMode === 'individual' && selectedIndividualType === 'class'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0' 
                  : 'border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400'
                }
              >
                <BookOpen className="h-5 w-5 ml-2" />
                جدول فصل
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات التحكم والفرز */}
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Grid className="h-5 w-5 ml-2" />
                {viewMode === 'teachers' ? 'الجدول العام للمعلمين' : 
                 viewMode === 'classes' ? 'الجدول العام للفصول' : 
                 'جدول فردي'}
              </CardTitle>
              <div className="flex items-center gap-3">
                {/* أزرار الفرز */}
                {(viewMode === 'teachers' || (viewMode === 'individual' && selectedIndividualType === 'teacher')) && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSortBySpecialization}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Filter className="h-4 w-4 ml-1" />
                      فرز حسب التخصص
                    </Button>
                    <Button
                      onClick={handleAlphabeticalSort}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <List className="h-4 w-4 ml-1" />
                      فرز أبجدي
                    </Button>
                  </div>
                )}
                
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
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-blue-400'
                            }`}
                            draggable
                            onDragStart={() => handleDragStart(specialization)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(specialization)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold ml-2">
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
                          className="bg-blue-600 hover:bg-blue-700"
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
                  <div className="flex gap-3 items-center">
                    {/* أزرار اختيار نوع الجدول الفردي (معلم/فصل) - تم تعطيلها بناءً على طلب المستخدم */}
                    {false && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedIndividualType('teacher')}
                          variant={selectedIndividualType === 'teacher' ? 'default' : 'outline'}
                          size="sm"
                          className={selectedIndividualType === 'teacher' 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                            : 'border-indigo-300 text-indigo-700 hover:bg-indigo-50'
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
                                    return indexA - indexB;
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
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
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
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        →
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'teachers' && renderTeachersGrid()}
            {viewMode === 'classes' && renderClassesGrid()}
            {viewMode === 'individual' && renderIndividualTimetable()}
          </CardContent>
        </Card>
      </div>

      {/* نافذة عرض عمليات التعديل */}
      <Dialog open={showOperationsModal} onOpenChange={setShowOperationsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
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
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Shuffle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{operationsHistory.length}</div>
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
                            <Badge variant="outline" className="text-blue-600">
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
                            <Badge variant="default" className="bg-blue-500">
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
    </div>
  );
};

export default SmartTimetablePageEnhanced;
