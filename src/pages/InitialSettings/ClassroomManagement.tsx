import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import { useSchool } from '../../contexts/SchoolContext.jsx';
import '../../styles/classroom-management.css';
import '@/styles/unified-header-styles.css';
import {
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  School,
  GraduationCap,
  Building,
  Save,
  AlertCircle,
  Settings,
  Check,
  X,
  Clock
} from 'lucide-react';

// إضافة أنيميشن للإشعار
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
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
  if (!document.querySelector('[data-animation-styles]')) {
    styleElement.setAttribute('data-animation-styles', 'true');
    document.head.appendChild(styleElement);
  }
}

// أنواع البيانات
interface Classroom {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  room_number?: string;
  capacity: number;
  class_teacher_id?: string;
  semester: string;
  education_type: 'general' | 'memorization';
  status: 'active' | 'inactive';
  notes?: string;
  subjects?: Subject[];
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  weekly_hours: number;
  is_assigned: boolean;
}

interface SchedulePeriod {
  isActive: boolean;
  name?: string;
}

interface DaySchedule {
  [periodNumber: string]: SchedulePeriod;
}

interface ClassSchedule {
  [day: string]: DaySchedule;
}

interface Grade {
  id: string;
  level: number;
  name: string;
  stage: string; // kindergarten, primary, middle, secondary
  education_type: 'general' | 'memorization';
  subjects: Subject[];
  gradesCount: number; // عدد الصفوف في هذه المرحلة
}

interface AddClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (classroomData: { name: string; grade_level: number; section: string }) => void;
  suggestedName: string;
  gradeLevel: number;
  section: string;
}

// نافذة إضافة فصل جديد
const AddClassroomModal: React.FC<AddClassroomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  suggestedName,
  gradeLevel,
  section
}) => {
  const [classroomName, setClassroomName] = useState(suggestedName);

  useEffect(() => {
    if (isOpen) {
      setClassroomName(suggestedName);
    }
  }, [isOpen, suggestedName]);

  const handleConfirm = () => {
    if (classroomName.trim()) {
      onConfirm({
        name: classroomName.trim(),
        grade_level: gradeLevel,
        section: section
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center text-lg font-bold arabic-text">
            <Plus className="w-5 h-5 ml-2 text-blue-600 flex-shrink-0" />
            <span>إضافة فصل جديد</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="className" className="block text-sm font-medium mb-2 arabic-text">
              اسم الفصل
            </Label>
            <Input
              id="className"
              value={classroomName}
              onChange={(e) => setClassroomName(e.target.value)}
              placeholder="مثال: 1/1"
              className="text-center"
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-2 arabic-text">
              سيتم إضافة الفصل للصف <span className="font-medium">{gradeLevel}</span> القسم <span className="font-medium">{section}</span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 pt-4 border-t">
          <Button 
            onClick={handleConfirm}
            disabled={!classroomName.trim()}
            className="w-full arabic-text"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة الفصل
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full arabic-text"
          >
            <X className="w-4 h-4 ml-2" />
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

// مكون مربع حوار التأكيد المحسن الاحترافي
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "موافق",
  cancelText = "إلغاء",
  variant = "default"
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[90vw] max-w-[450px] rounded-xl shadow-2xl" dir="rtl">
        <DialogHeader className="pb-3 border-b border-gray-100">
          <DialogTitle className="flex items-center text-lg font-bold arabic-text">
            {variant === 'destructive' ? (
              <div className="bg-red-100 p-2 rounded-lg ml-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              </div>
            ) : (
              <div className="bg-blue-100 p-2 rounded-lg ml-2.5">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
              </div>
            )}
            <span className="flex-1 text-gray-900">{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-5 px-1">
          <p className="text-gray-700 arabic-text text-sm leading-relaxed">{description}</p>
          {variant === 'destructive' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-xs arabic-text flex items-start font-medium">
                <AlertCircle className="w-4 h-4 ml-1.5 mt-0.5 text-red-600 flex-shrink-0" />
                <span>تحذير: هذا الإجراء لا يمكن التراجع عنه</span>
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-gray-100">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:flex-1 arabic-text font-medium border-2 hover:bg-gray-50 h-10 text-sm rounded-lg"
          >
            <X className="w-4 h-4 ml-1.5" />
            {cancelText}
          </Button>
          <Button 
            onClick={handleConfirm}
            className={`w-full sm:flex-1 arabic-text font-medium h-10 text-sm rounded-lg shadow-md hover:shadow-lg transition-all ${
              variant === 'destructive' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-[#4f46e5] hover:bg-[#4338ca]'
            }`}
          >
            {variant === 'destructive' ? (
              <Trash2 className="w-4 h-4 ml-1.5" />
            ) : (
              <Check className="w-4 h-4 ml-1.5" />
            )}
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ClassroomManagement: React.FC = () => {
  const { toast } = useToast();
  const { schoolData } = useSchool();
  const navigate = useNavigate();
  
  // الحالات الأساسية
  const [grades, setGrades] = useState<Grade[]>([]);
  const [activeGrade, setActiveGrade] = useState<Grade | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classroomCount, setClassroomCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // حالات النوافذ المنبثقة
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  } | null>(null);
  const [isAddingNewClass, setIsAddingNewClass] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  
  // تحديد عدد الصفوف لكل مرحلة
  const getGradesCount = (stage: string): number => {
    switch (stage) {
      case 'kindergarten': return 3; // KG1, KG2, KG3
      case 'primary': return 6; // 1-6
      case 'middle': return 3; // 7-9
      case 'secondary': return 3; // 10-12
      default: return 1;
    }
  };

  // تحديد المواد لكل مرحلة
  const getSubjectsForStage = (stage: string): Subject[] => {
    const commonSubjects: Record<string, Subject[]> = {
      kindergarten: [
        { id: '1', name: 'اللغة العربية', code: 'ARAB', weekly_hours: 5, is_assigned: false },
        { id: '2', name: 'الرياضيات', code: 'MATH', weekly_hours: 4, is_assigned: false },
        { id: '3', name: 'الأنشطة', code: 'ACT', weekly_hours: 3, is_assigned: false },
        { id: '4', name: 'التربية الإسلامية', code: 'ISLAM', weekly_hours: 2, is_assigned: false }
      ],
      primary: [
        { id: '1', name: 'الرياضيات', code: 'MATH', weekly_hours: 5, is_assigned: false },
        { id: '2', name: 'اللغة العربية', code: 'ARAB', weekly_hours: 6, is_assigned: false },
        { id: '3', name: 'العلوم', code: 'SCI', weekly_hours: 4, is_assigned: false },
        { id: '4', name: 'اللغة الإنجليزية', code: 'ENG', weekly_hours: 3, is_assigned: false },
        { id: '5', name: 'التربية الإسلامية', code: 'ISLAM', weekly_hours: 3, is_assigned: false },
        { id: '6', name: 'التربية البدنية', code: 'PE', weekly_hours: 2, is_assigned: false }
      ],
      middle: [
        { id: '1', name: 'الرياضيات', code: 'MATH', weekly_hours: 5, is_assigned: false },
        { id: '2', name: 'اللغة العربية', code: 'ARAB', weekly_hours: 6, is_assigned: false },
        { id: '3', name: 'العلوم', code: 'SCI', weekly_hours: 4, is_assigned: false },
        { id: '4', name: 'اللغة الإنجليزية', code: 'ENG', weekly_hours: 4, is_assigned: false },
        { id: '5', name: 'التربية الإسلامية', code: 'ISLAM', weekly_hours: 3, is_assigned: false },
        { id: '6', name: 'الاجتماعيات', code: 'SOC', weekly_hours: 3, is_assigned: false },
        { id: '7', name: 'التربية البدنية', code: 'PE', weekly_hours: 2, is_assigned: false }
      ],
      secondary: [
        { id: '1', name: 'الرياضيات', code: 'MATH', weekly_hours: 5, is_assigned: false },
        { id: '2', name: 'اللغة العربية', code: 'ARAB', weekly_hours: 5, is_assigned: false },
        { id: '3', name: 'الفيزياء', code: 'PHY', weekly_hours: 4, is_assigned: false },
        { id: '4', name: 'الكيمياء', code: 'CHEM', weekly_hours: 4, is_assigned: false },
        { id: '5', name: 'الأحياء', code: 'BIO', weekly_hours: 4, is_assigned: false },
        { id: '6', name: 'اللغة الإنجليزية', code: 'ENG', weekly_hours: 4, is_assigned: false },
        { id: '7', name: 'التربية الإسلامية', code: 'ISLAM', weekly_hours: 2, is_assigned: false }
      ]
    };
    return commonSubjects[stage] || [];
  };

  // تحديد اسم المرحلة باللغة العربية
  const getStageDisplayName = (stage: string): string => {
    const stageNames: Record<string, string> = {
      'kindergarten': 'رياض الأطفال',
      'primary': 'المرحلة الابتدائية',
      'middle': 'المرحلة المتوسطة',
      'secondary': 'المرحلة الثانوية'
    };
    return stageNames[stage] || stage;
  };

  // تحميل المراحل من بيانات المدرسة
  useEffect(() => {
    if (schoolData.schools && schoolData.schools.length > 0) {
      const schoolGrades: Grade[] = schoolData.schools.map((school: any, index: number) => ({
        id: school.id || `school_${index}`,
        level: index + 1,
        name: school.name || getStageDisplayName(school.stage),
        stage: school.stage,
        education_type: school.sectionType === 'memorization' ? 'memorization' : 'general',
        subjects: getSubjectsForStage(school.stage),
        gradesCount: getGradesCount(school.stage)
      }));
      
      setGrades(schoolGrades);
      if (schoolGrades.length > 0 && !activeGrade) {
        setActiveGrade(schoolGrades[0]);
      }
    } else {
      // في حالة عدم وجود بيانات محفوظة، عرض رسالة
      setGrades([]);
      setActiveGrade(null);
    }
  }, [schoolData]);

  // جلب الفصول للمرحلة النشطة
  useEffect(() => {
    if (activeGrade) {
      loadClassrooms(activeGrade.level);
    }
  }, [activeGrade]);

  const loadClassrooms = async (gradeLevel: number) => {
    setIsLoading(true);
    try {
      // محاكاة جلب البيانات من الخادم
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // التحقق من وجود بيانات محفوظة للمرحلة الحالية
      const savedData = localStorage.getItem(`classrooms_stage_${activeGrade?.id}`);
      
      if (savedData) {
        // تحميل الفصول المحفوظة
        const savedClassrooms = JSON.parse(savedData);
        setClassrooms(savedClassrooms);
        setClassroomCount(savedClassrooms.length);
      } else {
        // إنشاء فصول تلقائية (فصل واحد لكل صف)
        const defaultClassrooms: Classroom[] = [];
        
        if (activeGrade) {
          for (let gradeIndex = 1; gradeIndex <= activeGrade.gradesCount; gradeIndex++) {
            const classroomName = `${gradeIndex}/1`;
            
            defaultClassrooms.push({
              id: `${activeGrade.id}_${gradeIndex}_1_${Date.now()}_${gradeIndex}`,
              name: classroomName,
              grade_level: gradeIndex,
              section: '1',
              capacity: 30,
              semester: 'الفصل الأول',
              education_type: activeGrade.education_type,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
          
          setClassrooms(defaultClassrooms);
          setClassroomCount(defaultClassrooms.length);
          
          // حفظ الفصول التلقائية
          localStorage.setItem(`classrooms_stage_${activeGrade.id}`, JSON.stringify(defaultClassrooms));
        }
      }
    } catch (error) {
      showConfirmDialog({
        title: "خطأ في التحميل",
        description: "فشل في تحميل بيانات الفصول بسبب مشكلة في الاتصال. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.",
        onConfirm: () => {},
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // حساب توزيع الفصول على الصفوف
  const calculateClassroomDistribution = (totalClassrooms: number, gradesCount: number) => {
    const classroomsPerGrade = Math.floor(totalClassrooms / gradesCount);
    const remainder = totalClassrooms % gradesCount;
    
    const distribution: number[] = [];
    for (let i = 0; i < gradesCount; i++) {
      distribution.push(classroomsPerGrade + (i < remainder ? 1 : 0));
    }
    
    return distribution;
  };

  const generateClassrooms = async () => {
    if (!activeGrade || classroomCount <= 0) {
      showConfirmDialog({
        title: "تنبيه",
        description: "يرجى إدخال عدد صحيح للفصول (أكبر من صفر).",
        onConfirm: () => {},
        variant: 'default'
      });
      return;
    }

    setIsLoading(true);
    try {
      const newClassrooms: Classroom[] = [];
      const distribution = calculateClassroomDistribution(classroomCount, activeGrade.gradesCount);
      
      let classroomIndex = 1;
      
      // إنشاء الفصول وفقاً للتوزيع المحسوب
      for (let gradeIndex = 0; gradeIndex < activeGrade.gradesCount; gradeIndex++) {
        const classroomsInThisGrade = distribution[gradeIndex];
        const gradeNumber = gradeIndex + 1;
        
        for (let sectionIndex = 1; sectionIndex <= classroomsInThisGrade; sectionIndex++) {
          // عرض الأرقام بشكل صحيح: gradeNumber/sectionIndex
          // مثال: 2/1 يعني الصف الثاني فصل 1
          const classroomName = `${gradeNumber}/${sectionIndex}`;
          
          newClassrooms.push({
            id: `${activeGrade.id}_${gradeNumber}_${sectionIndex}_${Date.now()}_${classroomIndex}`,
            name: classroomName,
            grade_level: gradeNumber,
            section: sectionIndex.toString(),
            capacity: 30,
            semester: 'الفصل الأول',
            education_type: activeGrade.education_type,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
          classroomIndex++;
        }
      }
      
      // ترتيب الفصول حسب الصف ثم القسم
      newClassrooms.sort((a, b) => {
        if (a.grade_level !== b.grade_level) {
          return a.grade_level - b.grade_level;
        }
        return parseInt(a.section) - parseInt(b.section);
      });
      
      setClassrooms(newClassrooms);
      
      // حفظ الفصول في localStorage
      if (activeGrade) {
        localStorage.setItem(`classrooms_stage_${activeGrade.id}`, JSON.stringify(newClassrooms));
      }
      
      // إرسال الفصول إلى الخادم الخلفي
      try {
        // الحصول على school_id من localStorage
        const schoolData = localStorage.getItem('schoolData');
        let schoolId = 'school_1'; // قيمة افتراضية
        
        if (schoolData) {
          try {
            const parsedData = JSON.parse(schoolData);
            if (parsedData.schools && parsedData.schools.length > 0) {
              schoolId = parsedData.schools[0].id;
            }
          } catch (e) {
            console.warn('تعذر قراءة school_id');
          }
        }
        
        const response = await fetch('/api/classrooms/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            classrooms: newClassrooms.map(c => ({
              name: c.name,
              grade_level: c.grade_level,
              section: c.section,
              capacity: c.capacity,
              school_id: schoolId
            }))
          }),
        });
        
        if (response.ok) {
          console.log('✅ تم حفظ الفصول في الخادم');
        }
      } catch (apiError) {
        console.warn('⚠️ تم الحفظ محلياً فقط');
      }
      
      toast({
        title: "نجح",
        description: `تم إنشاء ${classroomCount} فصل بنجاح موزعة على ${activeGrade.gradesCount} صفوف`,
      });
    } catch (error) {
      showConfirmDialog({
        title: "خطأ في الإنشاء",
        description: "فشل في إنشاء الفصول بسبب خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
        onConfirm: () => {},
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateClassroomName = async (classroomId: string, newName: string) => {
    setClassrooms(prev => prev.map(classroom => 
      classroom.id === classroomId 
        ? { ...classroom, name: newName, updated_at: new Date().toISOString() }
        : classroom
    ));
  };

  const deleteClassroom = async (classroomId: string) => {
    try {
      setClassrooms(prev => prev.filter(classroom => classroom.id !== classroomId));
      toast({
        title: "نجح",
        description: "تم حذف الفصل بنجاح",
      });
    } catch (error) {
      showConfirmDialog({
        title: "خطأ في الحذف",
        description: "فشل في حذف الفصل بسبب خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
        onConfirm: () => {},
        variant: 'destructive'
      });
    }
  };

  const deleteAllClassrooms = async () => {
    try {
      setClassrooms([]);
      setClassroomCount(0);
      
      // حذف البيانات من localStorage
      if (activeGrade) {
        localStorage.removeItem(`classrooms_stage_${activeGrade.id}`);
      }
      
      toast({
        title: "نجح",
        description: "تم حذف جميع الفصول بنجاح",
      });
    } catch (error) {
      showConfirmDialog({
        title: "خطأ في الحذف",
        description: "فشل في حذف الفصول بسبب خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
        onConfirm: () => {},
        variant: 'destructive'
      });
    }
  };

  const showConfirmDialog = (data: {
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }) => {
    setConfirmDialogData(data);
    setIsConfirmDialogOpen(true);
  };

  const handleDeleteClassroom = (classroomId: string, classroomName: string) => {
    showConfirmDialog({
      title: "تأكيد حذف الفصل",
      description: `هل أنت متأكد من حذف فصل "${classroomName}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: () => deleteClassroom(classroomId),
      variant: 'destructive'
    });
  };

  const handleDeleteAllClassrooms = () => {
    if (classrooms.length === 0) {
      showConfirmDialog({
        title: "تنبيه",
        description: "لا توجد فصول دراسية لحذفها. يرجى إنشاء الفصول أولاً.",
        onConfirm: () => {},
        variant: 'default'
      });
      return;
    }

    showConfirmDialog({
      title: "تأكيد حذف جميع الفصول",
      description: `هل أنت متأكد من حذف جميع الفصول (${classrooms.length} فصل)؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة بالفصول.`,
      onConfirm: () => deleteAllClassrooms(),
      variant: 'destructive'
    });
  };

  const addNewClassroom = () => {
    if (!activeGrade) return;
    
    // اقتراح اسم للفصل الجديد بناءً على آخر صف
    let suggestedGrade = 1;
    let suggestedSection = 1;
    
    if (classrooms.length > 0) {
      // البحث عن أعلى رقم صف
      const maxGrade = Math.max(...classrooms.map(c => c.grade_level));
      const classroomsInMaxGrade = classrooms.filter(c => c.grade_level === maxGrade);
      const maxSection = Math.max(...classroomsInMaxGrade.map(c => parseInt(c.section) || 1));
      
      suggestedGrade = maxGrade;
      suggestedSection = maxSection + 1;
    }
    
    // عرض الأرقام بشكل صحيح: الصف/الفصل
    setNewClassroomName(`${suggestedGrade}/${suggestedSection}`);
    setIsAddingNewClass(true);
  };

  const handleConfirmAddClassroom = () => {
    if (!activeGrade || !newClassroomName.trim()) return;

    // استخراج الصف والقسم من الاسم المدخل
    // الترتيب الصحيح: الصف/الفصل (مثال: 2/1 = الصف الثاني فصل 1)
    const nameParts = newClassroomName.trim().split('/');
    const gradeLevel = parseInt(nameParts[0]) || 1; // الصف (أول رقم)
    const section = nameParts[1] || '1'; // الفصل (ثاني رقم)

    const newClassroom: Classroom = {
      id: `new_${Date.now()}`,
      name: newClassroomName.trim(),
      grade_level: gradeLevel,
      section: section,
      capacity: 30,
      semester: 'الفصل الأول',
      education_type: activeGrade.education_type,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // إضافة الفصل وإعادة الترتيب
    const updatedClassrooms = [...classrooms, newClassroom].sort((a, b) => {
      if (a.grade_level !== b.grade_level) {
        return a.grade_level - b.grade_level;
      }
      return parseInt(a.section) - parseInt(b.section);
    });
    
    setClassrooms(updatedClassrooms);
    
    // حفظ التحديث
    if (activeGrade) {
      localStorage.setItem(`classrooms_stage_${activeGrade.id}`, JSON.stringify(updatedClassrooms));
    }
    
    setIsAddingNewClass(false);
    setNewClassroomName('');
    
    toast({
      title: "نجح",
      description: `تم إضافة الفصل "${newClassroomName.trim()}" بنجاح`,
    });
  };

  const handleCancelAddClassroom = () => {
    setIsAddingNewClass(false);
    setNewClassroomName('');
  };

  const openSubjectModal = (classroom: Classroom) => {
    // التوجيه لصفحة تخصيص المواد
    navigate(`/dashboard/initial-settings/classrooms/subjects-setup?classroomId=${classroom.id}&classroomName=${encodeURIComponent(classroom.name)}&stage=${activeGrade?.stage || 'primary'}&stageId=${activeGrade?.id || ''}`);
  };

  const openScheduleModal = (classroom: Classroom) => {
    // التوجيه لصفحة تخصيص الحصص
    navigate(`/dashboard/initial-settings/classrooms/schedule-setup?classroomId=${classroom.id}&classroomName=${encodeURIComponent(classroom.name)}&stageId=${activeGrade?.id || ''}`);
  };

  const handleScheduleSave = (schedule: ClassSchedule) => {
    // تم نقل هذه الوظيفة للصفحة الداخلية
    toast({
      title: "نجح",
      description: `تم حفظ جدول الحصص بنجاح`,
    });
  };

  const handleApplyScheduleToOthers = (scheduleData: any, selectedIds: string[]) => {
    // تطبيق الإعدادات على الفصول المحددة
    selectedIds.forEach(classroomId => {
      localStorage.setItem(`periods_${classroomId}`, JSON.stringify(scheduleData));
    });
    
    const classroomNames = classrooms
      .filter(c => selectedIds.includes(c.id))
      .map(c => c.name)
      .join('، ');
    
    toast({
      title: "تم التطبيق بنجاح",
      description: `تم تطبيق إعداد الحصص على الفصول: ${classroomNames}`,
    });
  };

  const handleSubjectSave = (subjects: Subject[]) => {
    // تم نقل هذه الوظيفة للصفحة الداخلية
    toast({
      title: "نجح",
      description: "تم حفظ تخصيص المواد بنجاح",
    });
  };

  const saveAllChanges = async () => {
    if (classrooms.length === 0) {
      toast({
        title: "تنبيه",
        description: "لا توجد فصول دراسية لحفظها. يرجى إنشاء الفصول أولاً.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // حفظ البيانات في localStorage
      if (activeGrade) {
        localStorage.setItem(`classrooms_stage_${activeGrade.id}`, JSON.stringify(classrooms));
      }
      
      // محاكاة حفظ البيانات
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // إظهار إشعار نجاح احترافي
      setShowSaveNotification(true);
      
      // إخفاء الإشعار بعد 3 ثواني
      setTimeout(() => {
        setShowSaveNotification(false);
      }, 3000);
      
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ التغييرات. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="classroom-management-container" dir="rtl">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        
        {/* إشعار احترافي للحفظ الناجح */}
        {showSaveNotification && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideInDown">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px]">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <Check className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg arabic-text">تم الحفظ بنجاح!</p>
                <p className="text-sm opacity-90 arabic-text">تم حفظ جميع التغييرات</p>
              </div>
            </div>
          </div>
        )}
        
        {/* رأس الصفحة */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#4338ca] p-3 rounded-xl shadow-lg">
              <School className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الفصول</h1>
          </div>
        </div>

      {/* التبويبات للمراحل الدراسية */}
      {grades.length > 0 ? (
        <Card className="mb-6 shadow-lg border-gray-200 overflow-hidden">
          <CardContent className="pb-6 pt-6">
            <Tabs 
              value={activeGrade?.id || ''} 
              onValueChange={(value) => {
                const grade = grades.find(g => g.id === value);
                setActiveGrade(grade || null);
              }}
              dir="rtl"
            >
              <TabsList className="w-full h-auto p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 shadow-inner">
                {grades.map(grade => {
                  // تحديد الأيقونة المناسبة لكل مرحلة
                  const getStageIcon = (stage: string) => {
                    switch (stage) {
                      case 'kindergarten': return <School className="w-5 h-5 flex-shrink-0" />;
                      case 'primary': return <BookOpen className="w-5 h-5 flex-shrink-0" />;
                      case 'middle': return <GraduationCap className="w-5 h-5 flex-shrink-0" />;
                      case 'secondary': return <Building className="w-5 h-5 flex-shrink-0" />;
                      default: return <School className="w-5 h-5 flex-shrink-0" />;
                    }
                  };

                  // بناء النص للتبويبة مع اسم المدرسة
                  const schoolName = schoolData?.schools?.find((s: any) => s.stage === grade.stage)?.name || 'مدرسة';
                  const stageName = getStageDisplayName(grade.stage);
                  const educationType = grade.education_type === 'memorization' ? 'تحفيظ' : 'تعليم عام';

                  return (
                    <TabsTrigger 
                      key={grade.id} 
                      value={grade.id}
                      className="h-auto p-4 text-right bg-white border-2 border-gray-200 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-blue-500 data-[state=active]:shadow-lg hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-300 arabic-text"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="bg-blue-100 data-[state=active]:bg-white/20 p-2.5 rounded-lg text-blue-600 data-[state=active]:text-white transition-colors">
                          {getStageIcon(grade.stage)}
                        </div>
                        <div className="flex-1 text-right min-w-0">
                          <div className="font-bold text-base leading-tight truncate mb-1">
                            {schoolName}
                          </div>
                          <div className="text-xs font-medium opacity-90 leading-tight truncate">
                            {stageName}
                          </div>
                          <div className="text-xs opacity-75 leading-tight mt-0.5 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                            {educationType}
                          </div>
                        </div>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 shadow-sm border-gray-200">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2 arabic-text">لا توجد مراحل دراسية محددة</h3>
            <p className="text-sm text-gray-500 arabic-text max-w-md mx-auto">
              يرجى الذهاب إلى صفحة بيانات المدرسة أولاً لتحديد المراحل الدراسية المطلوبة
            </p>
          </CardContent>
        </Card>
      )}

      {/* قسم التحكم بعدد الفصول */}
      {activeGrade && (
        <Card className="mb-6 shadow-md border-gray-200 overflow-hidden">
          <CardHeader className="pb-4" style={{ background: 'linear-gradient(to right, #6366f1, #6366f1)' }}>
            <CardTitle className="flex items-center text-lg arabic-text text-white">
              <div className="bg-white/20 p-2 rounded-lg ml-2">
                <Settings className="w-5 h-5 text-white" />
              </div>
              تحديد عدد الفصول للمرحلة
            </CardTitle>
            <p className="text-sm text-white/90 arabic-text mt-1 mr-11">
              {activeGrade.name}
            </p>
          </CardHeader>
          <CardContent className="pb-6 pt-6">
            {/* حقل إدخال عدد الفصول */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
              <div className="flex-1 max-w-full sm:max-w-md">
                <Label htmlFor="classroomCount" className="text-sm font-medium mb-3 arabic-text text-gray-700 flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#6366f1]" />
                  عدد الفصول المطلوبة
                </Label>
                <Input
                  id="classroomCount"
                  type="number"
                  min="1"
                  max="50"
                  value={classroomCount}
                  onChange={(e) => setClassroomCount(parseInt(e.target.value) || 0)}
                  placeholder="أدخل العدد"
                  className="text-center ltr-numbers text-xl font-bold border-2 border-[#6366f1]/30 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 h-12 rounded-lg"
                />
                {classroomCount > 0 && (
                  <div className="mt-3 p-2.5 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-lg">
                    <p className="text-sm text-[#4f46e5] arabic-text font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      <span>
                        توزيع <span className="ltr-numbers font-bold">{classroomCount}</span> فصل على <span className="ltr-numbers font-bold">{activeGrade.gradesCount}</span> صفوف
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <Button 
                onClick={generateClassrooms}
                disabled={isLoading || classroomCount <= 0}
                className="w-full sm:w-auto px-6 py-3 text-base arabic-text bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] shadow-md hover:shadow-lg transition-all duration-300 rounded-lg font-medium h-12"
              >
                {isLoading ? (
                  <div className="loading-spinner ml-2" />
                ) : (
                  <Plus className="w-5 h-5 ml-2" />
                )}
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء الفصول'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة الفصول */}
      {activeGrade && (
        <Card className="shadow-lg border-gray-200 overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <CardTitle className="flex items-center text-lg arabic-text text-gray-800">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg ml-2">
                    <School className="w-5 h-5 text-white" />
                  </div>
                  قائمة الفصول - {activeGrade.name}
                  <Badge variant="secondary" className="mr-3 text-sm font-medium bg-blue-100 text-blue-700">
                    {classrooms.length} فصل
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 arabic-text mt-1 mr-11">
                  إدارة الفصول الدراسية وتخصيص المواد لكل فصل
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={saveAllChanges} 
                  disabled={isLoading} 
                  size="sm"
                  style={{ backgroundColor: '#6366f1' }}
                  className="arabic-text hover:opacity-90 text-white font-medium shadow-md hover:shadow-lg transition-all"
                >
                  {isLoading ? (
                    <div className="loading-spinner ml-1" />
                  ) : (
                    <Save className="w-4 h-4 ml-1" />
                  )}
                  {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
                <Button 
                  onClick={addNewClassroom} 
                  variant="outline" 
                  size="sm"
                  style={{ backgroundColor: '#6366f1', color: 'white', borderColor: '#6366f1' }}
                  className="arabic-text hover:opacity-90 font-medium shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة فصل
                </Button>
                {classrooms.length > 0 && (
                  <Button 
                    onClick={handleDeleteAllClassrooms} 
                    variant="outline" 
                    size="sm"
                    className="arabic-text text-red-600 border-red-300 hover:bg-red-50 font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف الكل
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6 pt-4">
            <div className="space-y-4">
              
              {/* نموذج إضافة فصل جديد inline */}
              {isAddingNewClass && (
                <div className="border-2 rounded-xl p-4 shadow-md" style={{ borderColor: '#818cf8', backgroundColor: '#818cf8' + '15' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#818cf8' }}>
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold arabic-text" style={{ color: '#5b21b6' }}>إضافة فصل جديد</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                    <div className="flex-1">
                      <Label className="text-sm font-medium mb-2 arabic-text text-gray-700 flex items-center gap-1">
                        <School className="w-4 h-4" style={{ color: '#818cf8' }} />
                        اسم الفصل
                      </Label>
                      <Input
                        value={newClassroomName}
                        onChange={(e) => setNewClassroomName(e.target.value)}
                        placeholder="مثال: 2/1 (الصف الثاني فصل 1)"
                        className="text-center font-medium border-2 h-11"
                        style={{ borderColor: '#818cf8' + '60' }}
                        dir="ltr"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleConfirmAddClassroom();
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleConfirmAddClassroom}
                        disabled={!newClassroomName.trim()}
                        className="text-white font-medium px-6 h-11"
                        style={{ backgroundColor: '#818cf8' }}
                      >
                        <Check className="w-4 h-4 ml-1" />
                        إضافة
                      </Button>
                      <Button 
                        onClick={handleCancelAddClassroom}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 font-medium h-11"
                      >
                        <X className="w-4 h-4 ml-1" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {classrooms.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <School className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2 arabic-text">لا توجد فصول دراسية</p>
                  <p className="text-sm arabic-text">انقر على زر "إضافة فصل" لإنشاء فصل جديد</p>
                </div>
              ) : (
                classrooms.map((classroom, index) => (
                  <div key={classroom.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* معلومات الفصل */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-medium text-gray-700 arabic-text whitespace-nowrap">فصل</span>
                          <Input
                            value={classroom.name.replace(/^فصل\s*/, '')}
                            onChange={(e) => updateClassroomName(classroom.id, e.target.value)}
                            className="font-medium text-center max-w-[100px]"
                            placeholder="2/1"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {/* أزرار الإجراءات */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* زر تخصيص الحصص */}
                        <Button
                          onClick={() => openScheduleModal(classroom)}
                          size="sm"
                          style={{ backgroundColor: '#818cf8' }}
                          className="hover:opacity-90 text-white font-medium shadow-sm hover:shadow-md transition-all"
                        >
                          <Clock className="w-4 h-4 ml-1" />
                          <span className="hidden sm:inline">تخصيص الحصص</span>
                          <span className="sm:hidden">الحصص</span>
                        </Button>
                        
                        <Button
                          onClick={() => openSubjectModal(classroom)}
                          size="sm"
                          style={{ backgroundColor: '#818cf8' }}
                          className="hover:opacity-90 text-white font-medium shadow-sm hover:shadow-md transition-all"
                        >
                          <BookOpen className="w-4 h-4 ml-1" />
                          <span className="hidden sm:inline">تخصيص المواد</span>
                          <span className="sm:hidden">المواد</span>
                        </Button>
                        
                        <Button
                          onClick={() => handleDeleteClassroom(classroom.id, classroom.name)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50 font-medium shadow-sm hover:shadow-md transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* المواد المخصصة */}
                    {classroom.subjects && classroom.subjects.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm font-medium text-gray-700 arabic-text">المواد المخصصة:</span>
                          <div className="flex flex-wrap gap-1">
                            {classroom.subjects.map(subject => (
                              <Badge key={subject.id} variant="secondary" className="text-xs arabic-text">
                                {subject.name} ({subject.weekly_hours}ح)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* مربع حوار التأكيد */}
      {confirmDialogData && (
        <ConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={confirmDialogData.onConfirm}
          title={confirmDialogData.title}
          description={confirmDialogData.description}
          variant={confirmDialogData.variant}
        />
      )}
      </div>
    </div>
  );
};

export default ClassroomManagement;