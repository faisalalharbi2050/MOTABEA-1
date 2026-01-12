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
  const [activeTab, setActiveTab] = useState('overview');
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
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [sessions, setSessions] = useState<ClassSession[]>([]);

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

  // إعدادات التوقيت
  const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const periodsPerDay = 6;

  // الفترات الزمنية
  const timeSlots: TimeSlot[] = [];
  daysOfWeek.forEach((day, dayIndex) => {
    for (let period = 1; period <= periodsPerDay; period++) {
      const startHour = 7 + Math.floor((period - 1) / 2);
      const startMinute = ((period - 1) % 2) * 45;
      const endHour = startHour + (startMinute === 45 ? 1 : 0);
      const endMinute = (startMinute + 45) % 60;
      
      timeSlots.push({
        id: `${dayIndex + 1}-${period}`,
        day,
        period,
        startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
        endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
      });
    }
  });

  // دوال المعالجة
  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    setProgressPercentage(0);
    
    try {
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
      
    } catch (error) {
      console.error('خطأ في الإنشاء التلقائي:', error);
    } finally {
      setIsGenerating(false);
      setProgressPercentage(0);
    }
  };

  const handleUndo = () => {
    setSessions([]);
    setCanUndo(false);
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || 'غير محدد';
  };

  const getClassName = (classId: string) => {
    const classItem = classes.find(c => c.id === classId);
    return classItem?.name || 'غير محدد';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'غير محدد';
  };

  const getTimeSlotInfo = (timeSlotId: string) => {
    const timeSlot = timeSlots.find(ts => ts.id === timeSlotId);
    return timeSlot ? `${timeSlot.day} - الحصة ${timeSlot.period}` : 'غير محدد';
  };

  return (
    <div className="p-6" style={{ direction: 'rtl' }}>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-7 w-7 text-blue-600" />
              الجداول الذكية
            </h1>
            <p className="text-gray-600 mt-1">إنشاء وإدارة جداول الحصص والانتظار بطريقة ذكية</p>
          </div>
          <div className="flex items-center gap-3">
            {canUndo && (
              <Button
                onClick={handleUndo}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Undo className="h-4 w-4" />
                تراجع
              </Button>
            )}
            <Button
              onClick={() => setShowHistory(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              السجل
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الحصص</p>
                <p className="text-2xl font-bold text-blue-600">
                  {classes.length * daysOfWeek.length * periodsPerDay}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Grid className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">عدد الفصول</p>
                <p className="text-2xl font-bold text-green-600">{classes.length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">عدد المعلمين</p>
                <p className="text-2xl font-bold text-purple-600">{teachers.length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الحصص المنشأة</p>
                <p className="text-2xl font-bold text-orange-600">{sessions.length}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                لوحة التحكم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* إنشاء تلقائي */}
              <div className="space-y-2">
                <Label>الإنشاء التلقائي للجداول</Label>
                <Button
                  onClick={handleAutoGenerate}
                  disabled={isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                      جاري الإنشاء... ({progressPercentage}%)
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 ml-2" />
                      إنشاء تلقائي
                    </>
                  )}
                </Button>
              </div>

              {/* أدوات إضافية */}
              <div className="space-y-2">
                <Label>أدوات إضافية</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 ml-1" />
                    تصدير
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 ml-1" />
                    طباعة
                  </Button>
                </div>
              </div>

              {/* حالة الجدول */}
              <div className="space-y-2">
                <Label>حالة الجدول</Label>
                <div className="flex items-center gap-2">
                  {isBasicTimetableLocked ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      مقفل
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Unlock className="h-3 w-3" />
                      قابل للتعديل
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timetable Display */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TableIcon className="h-5 w-5" />
                  جدول الحصص
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teachers">المعلمين</SelectItem>
                      <SelectItem value="classes">الفصول</SelectItem>
                      <SelectItem value="individual">فردي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد جداول منشأة</h3>
                  <p className="text-gray-500 mb-4">ابدأ بإنشاء جدول تلقائي أو قم بإضافة الحصص يدوياً</p>
                  <Button onClick={handleAutoGenerate} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Zap className="h-4 w-4 ml-2" />
                    إنشاء جدول تلقائي
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Table View */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الفصل</TableHead>
                          <TableHead>المعلم</TableHead>
                          <TableHead>المادة</TableHead>
                          <TableHead>الوقت</TableHead>
                          <TableHead>النوع</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.slice(0, 10).map((session) => (
                          <TableRow key={session.id}>
                            <TableCell className="font-medium">
                              {getClassName(session.classId)}
                            </TableCell>
                            <TableCell>{getTeacherName(session.teacherId)}</TableCell>
                            <TableCell>{getSubjectName(session.subjectId)}</TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {getTimeSlotInfo(session.timeSlotId)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={session.type === 'basic' ? 'default' : 'outline'}>
                                {session.type === 'basic' ? 'أساسي' : 'انتظار'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {sessions.length > 10 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        عرض 10 من أصل {sessions.length} حصة
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              سجل العمليات
            </DialogTitle>
            <DialogDescription>
              عرض تاريخ العمليات المنفذة على الجداول
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عمليات مسجلة</h3>
              <p className="text-gray-500">سيتم عرض سجل العمليات هنا عند البدء بالعمل</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowHistory(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      جاري إنشاء الجدول...
                    </span>
                    <span className="text-sm text-gray-500">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SmartTimetablePageEnhanced;