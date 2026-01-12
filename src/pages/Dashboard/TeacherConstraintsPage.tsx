import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { ArrowRight, Settings, User, Clock, Info, X, Check, CheckCircle, XCircle, Users, Search, ChevronDown, AlertTriangle, Trash2 } from 'lucide-react';

interface BlockedPeriod {
  day: number;
  period: number;
}

interface Teacher {
  id: number;
  name: string;
  subject: string;
}

const WEEK_DAYS = [
  { label: 'الأحد', key: 'sunday' },
  { label: 'الاثنين', key: 'monday' },
  { label: 'الثلاثاء', key: 'tuesday' },
  { label: 'الأربعاء', key: 'wednesday' },
  { label: 'الخميس', key: 'thursday' }
];

const PERIODS = ['الحصة 1', 'الحصة 2', 'الحصة 3', 'الحصة 4', 'الحصة 5', 'الحصة 6', 'الحصة 7'];

// معلمون وهميون للتجربة
const MOCK_TEACHERS: Teacher[] = [
  { id: 1, name: 'أحمد محمد', subject: 'رياضيات' },
  { id: 2, name: 'فاطمة علي', subject: 'لغة عربية' },
  { id: 3, name: 'محمود حسن', subject: 'علوم' },
  { id: 4, name: 'سارة أحمد', subject: 'لغة إنجليزية' },
  { id: 5, name: 'خالد يوسف', subject: 'اجتماعيات' },
  { id: 6, name: 'نورة عبدالله', subject: 'حاسب آلي' },
  { id: 7, name: 'عمر إبراهيم', subject: 'تربية إسلامية' },
  { id: 8, name: 'ليلى محمد', subject: 'تربية فنية' },
];

const TeacherConstraintsPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // لا يوجد اختيار افتراضي
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [dailyMaxWaiting, setDailyMaxWaiting] = useState<number>(3);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingConstraints, setIsApplyingConstraints] = useState(false);
  const [showCopyTargets, setShowCopyTargets] = useState(false);
  const [copyTargetTeachers, setCopyTargetTeachers] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // مربعات حوار احترافية للإشعارات
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState({ title: '', description: '' });
  
  // مربع حوار حذف صف من جدول القيود
  const [showDeleteRowDialog, setShowDeleteRowDialog] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<number | null>(null);
  
  // مربع حوار حذف جميع القيود
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  
  // حالات جديدة لإدارة نسخ القيود
  const [showCopyConstraints, setShowCopyConstraints] = useState(false);
  const [sourceTeacherId, setSourceTeacherId] = useState<number | null>(null);
  const [targetTeachers, setTargetTeachers] = useState<number[]>([]);
  
  // حفظ القيود المطبقة على كل معلم
  interface SavedConstraints {
    teacherId: number;
    teacherName: string;
    maxDaily: number;
    blockedPeriodsCount: number;
    blockedPeriodsList: BlockedPeriod[];
  }
  
  const [savedConstraintsList, setSavedConstraintsList] = useState<SavedConstraints[]>([]);

  useEffect(() => {
    // تحميل القيود المحفوظة للمعلم الأول المحدد - فقط إذا كان هناك اختيار
    if (selectedTeachers.length > 0) {
      const firstTeacherId = selectedTeachers[0];
      const savedMaxDaily = localStorage.getItem(`dailyMaxWaiting_${firstTeacherId}`);
      const savedBlocked = localStorage.getItem(`blockedPeriods_${firstTeacherId}`);
      
      if (savedMaxDaily) {
        setDailyMaxWaiting(parseInt(savedMaxDaily));
      } else {
        setDailyMaxWaiting(3); // القيمة الافتراضية
      }
      
      if (savedBlocked) {
        setBlockedPeriods(JSON.parse(savedBlocked));
      } else {
        setBlockedPeriods([]); // مسح الحصص المستثناة
      }
    } else {
      // إذا لم يكن هناك اختيار، إعادة تعيين القيم الافتراضية
      setDailyMaxWaiting(3);
      setBlockedPeriods([]);
    }
  }, [selectedTeachers]);
  
  // تحميل جميع القيود المحفوظة عند تحميل الصفحة
  useEffect(() => {
    const loadAllSavedConstraints = () => {
      const allConstraints: SavedConstraints[] = [];
      
      MOCK_TEACHERS.forEach(teacher => {
        const savedMaxDaily = localStorage.getItem(`dailyMaxWaiting_${teacher.id}`);
        const savedBlocked = localStorage.getItem(`blockedPeriods_${teacher.id}`);
        
        if (savedMaxDaily || savedBlocked) {
          const blockedList: BlockedPeriod[] = savedBlocked ? JSON.parse(savedBlocked) : [];
          allConstraints.push({
            teacherId: teacher.id,
            teacherName: teacher.name,
            maxDaily: savedMaxDaily ? parseInt(savedMaxDaily) : 3,
            blockedPeriodsCount: blockedList.length,
            blockedPeriodsList: blockedList
          });
        }
      });
      
      setSavedConstraintsList(allConstraints);
    };
    
    loadAllSavedConstraints();
  }, [isSaving]);

  const handleCopyConstraints = () => {
    if (!sourceTeacherId || targetTeachers.length === 0) {
      toast({
        title: "تنبيه",
        description: "يرجى اختيار المعلم المصدر والمعلمين المستهدفين",
        variant: "destructive"
      });
      return;
    }
    
    // نسخ القيود من المعلم المصدر
    const sourceMaxDaily = localStorage.getItem(`dailyMaxWaiting_${sourceTeacherId}`);
    const sourceBlocked = localStorage.getItem(`blockedPeriods_${sourceTeacherId}`);
    
    if (!sourceMaxDaily && !sourceBlocked) {
      toast({
        title: "تنبيه",
        description: "المعلم المصدر لا يملك قيودًا محفوظة",
        variant: "destructive"
      });
      return;
    }
    
    // تطبيق القيود على المعلمين المستهدفين
    targetTeachers.forEach(teacherId => {
      if (sourceMaxDaily) {
        localStorage.setItem(`dailyMaxWaiting_${teacherId}`, sourceMaxDaily);
      }
      if (sourceBlocked) {
        localStorage.setItem(`blockedPeriods_${teacherId}`, sourceBlocked);
      }
    });
    
    toast({
      title: "✓ تم النسخ",
      description: `تم نسخ القيود من المعلم المصدر إلى ${targetTeachers.length} معلم`,
    });
    
    // إعادة ضبط
    setShowCopyConstraints(false);
    setSourceTeacherId(null);
    setTargetTeachers([]);
  };

  // دالة حذف القيود
  const handleDeleteConstraints = () => {
    if (selectedTeachers.length === 0) {
      setDialogMessage({
        title: 'تنبيه',
        description: 'يرجى اختيار معلم واحد على الأقل'
      });
      setShowWarningDialog(true);
      return;
    }

    // التحقق من وجود قيود للمعلمين المحددين
    const hasConstraints = selectedTeachers.some(teacherId => {
      const savedMaxDaily = localStorage.getItem(`dailyMaxWaiting_${teacherId}`);
      const savedBlocked = localStorage.getItem(`blockedPeriods_${teacherId}`);
      return savedMaxDaily || savedBlocked;
    });

    if (!hasConstraints) {
      setDialogMessage({
        title: 'تنبيه',
        description: 'لا توجد قيود أو استثناءات للمعلمين المحددين'
      });
      setShowWarningDialog(true);
      return;
    }

    // إظهار مربع حوار التأكيد
    setShowDeleteDialog(true);
  };

  // تأكيد الحذف
  const confirmDelete = () => {
    // حذف القيود من localStorage
    selectedTeachers.forEach(teacherId => {
      localStorage.removeItem(`dailyMaxWaiting_${teacherId}`);
      localStorage.removeItem(`blockedPeriods_${teacherId}`);
    });

    // تحديث قائمة القيود المحفوظة - حذف القيود المحذوفة
    const updatedList = savedConstraintsList.filter(
      constraint => !selectedTeachers.includes(constraint.teacherId)
    );
    setSavedConstraintsList(updatedList);

    setDialogMessage({
      title: '✓ تم الحذف',
      description: `تم حذف القيود لـ ${selectedTeachers.length} معلم بنجاح`
    });
    setShowSuccessDialog(true);
    
    // إغلاق تلقائي بعد 2 ثانية
    setTimeout(() => {
      setShowSuccessDialog(false);
    }, 2000);

    // إعادة ضبط
    setSelectedTeachers([]);
    setDailyMaxWaiting(3);
    setBlockedPeriods([]);
    setShowDeleteDialog(false);
  };

  // دالة حفظ القيود
  const handleSaveConstraints = async () => {
    if (selectedTeachers.length === 0) {
      setDialogMessage({
        title: 'تنبيه',
        description: 'يرجى اختيار معلم واحد على الأقل'
      });
      setShowWarningDialog(true);
      
      // إغلاق تلقائي بعد 2 ثانية
      setTimeout(() => {
        setShowWarningDialog(false);
      }, 2000);
      return;
    }
    
    setIsSaving(true);
    try {
      // حفظ القيود لجميع المعلمين المحددين
      selectedTeachers.forEach(teacherId => {
        localStorage.setItem(`dailyMaxWaiting_${teacherId}`, dailyMaxWaiting.toString());
        localStorage.setItem(`blockedPeriods_${teacherId}`, JSON.stringify(blockedPeriods));
      });
      
      // تحديث قائمة القيود المحفوظة
      const updatedList = [...savedConstraintsList];
      selectedTeachers.forEach(teacherId => {
        const teacher = MOCK_TEACHERS.find(t => t.id === teacherId);
        if (teacher) {
          const existingIndex = updatedList.findIndex(c => c.teacherId === teacherId);
          const constraintData = {
            teacherId: teacher.id,
            teacherName: teacher.name,
            maxDaily: dailyMaxWaiting,
            blockedPeriodsCount: blockedPeriods.length,
            blockedPeriodsList: blockedPeriods
          };
          
          if (existingIndex >= 0) {
            updatedList[existingIndex] = constraintData;
          } else {
            updatedList.push(constraintData);
          }
        }
      });
      setSavedConstraintsList(updatedList);
      
      setDialogMessage({
        title: '✓ تم الحفظ',
        description: `تم حفظ القيود لـ ${selectedTeachers.length} معلم بنجاح`
      });
      setShowSuccessDialog(true);
      
      // إغلاق تلقائي بعد 2 ثانية
      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 2000);

      // تفعيل زر تطبيق القيود
      setIsApplyingConstraints(true);
    } catch (error) {
      setDialogMessage({
        title: 'خطأ',
        description: 'فشل في حفظ القيود'
      });
      setShowErrorDialog(true);
      
      // إغلاق تلقائي بعد 2 ثانية
      setTimeout(() => {
        setShowErrorDialog(false);
      }, 2000);
    } finally {
      // التأكد من إيقاف حالة الحفظ بعد فترة قصيرة
      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    }
  };

  const toggleTeacherSelection = (teacherId: number) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const togglePeriodBlock = (dayIndex: number, periodIndex: number) => {
    const existingIndex = blockedPeriods.findIndex(
      bp => bp.day === dayIndex && bp.period === periodIndex
    );
    
    if (existingIndex >= 0) {
      setBlockedPeriods(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      setBlockedPeriods(prev => [...prev, { day: dayIndex, period: periodIndex }]);
    }
  };

  const filteredTeachers = MOCK_TEACHERS.filter(teacher =>
    teacher.name.includes(searchTerm) || teacher.subject.includes(searchTerm)
  );

  // دالة حذف قيود معلم محدد من الجدول
  const handleDeleteSingleConstraint = (teacherId: number) => {
    setTeacherToDelete(teacherId);
    setShowDeleteRowDialog(true);
  };

  const confirmDeleteRow = () => {
    if (teacherToDelete !== null) {
      // حذف القيود من localStorage
      localStorage.removeItem(`dailyMaxWaiting_${teacherToDelete}`);
      localStorage.removeItem(`blockedPeriods_${teacherToDelete}`);

      // تحديث قائمة القيود المحفوظة
      const updatedList = savedConstraintsList.filter(
        constraint => constraint.teacherId !== teacherToDelete
      );
      setSavedConstraintsList(updatedList);

      const teacher = MOCK_TEACHERS.find(t => t.id === teacherToDelete);
      
      setShowDeleteRowDialog(false);
      setTeacherToDelete(null);
      
      // إشعار toast بدلاً من مربع حوار
      toast({
        title: '✓ تم الحذف',
        description: `تم حذف قيود المعلم ${teacher?.name || ''} بنجاح`,
      });
    }
  };

  // دالة حذف جميع القيود
  const handleDeleteAll = () => {
    if (savedConstraintsList.length === 0) {
      toast({
        title: 'تنبيه',
        description: 'لا توجد قيود محفوظة لحذفها',
        variant: 'destructive'
      });
      return;
    }
    setShowDeleteAllDialog(true);
  };

  const confirmDeleteAll = () => {
    // حذف جميع القيود من localStorage
    savedConstraintsList.forEach(constraint => {
      localStorage.removeItem(`dailyMaxWaiting_${constraint.teacherId}`);
      localStorage.removeItem(`blockedPeriods_${constraint.teacherId}`);
    });

    const count = savedConstraintsList.length;
    setSavedConstraintsList([]);
    setShowDeleteAllDialog(false);
    
    // إشعار toast
    toast({
      title: '✓ تم الحذف',
      description: `تم حذف جميع القيود (${count} معلم) بنجاح`,
    });
  };

  return (
    <div className="teacher-constraints-container min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto p-4 sm:p-6 max-w-[1600px]">
        
        {/* رأس الصفحة */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}>
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">إدارة قيود المنتظرين</h1>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                // العودة إلى صفحة إعدادات الجدول - تبويب حصص الانتظار (بطاقة إعداد المنتظرين)
                navigate('/dashboard/schedule/settings?tab=waiting');
              }}
              size="sm"
            >
              <ArrowRight className="w-4 h-4 ml-1" />
              رجوع
            </Button>
          </div>
        </div>

        {/* التخطيط الرئيسي - عمودين */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* العمود الأيمن - قائمة المنتظرين */}
          <div className="lg:col-span-4">
            <Card className="shadow-lg border-2 border-[#6366f1] sticky top-6">
              <CardHeader className="pb-3" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  اختيار المنتظرين ({selectedTeachers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* فاصل بصري شفاف بين العنوان وشريط البحث */}
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent mb-4"></div>
                
                {/* شريط البحث */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="ابحث عن معلم..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 text-sm"
                    />
                  </div>
                </div>

                {/* أزرار تحديد الكل وإلغاء الكل */}
                <div className="flex gap-2 mb-3">
                  <Button
                    onClick={() => {
                      const allTeacherIds = filteredTeachers.map(t => t.id);
                      setSelectedTeachers(allTeacherIds);
                      setDialogMessage({
                        title: '✓ تم التحديد',
                        description: `تم تحديد ${allTeacherIds.length} معلم`
                      });
                      setShowSuccessDialog(true);
                      
                      // إغلاق تلقائي بعد 1.5 ثانية
                      setTimeout(() => {
                        setShowSuccessDialog(false);
                      }, 1500);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-2 border-[#6366f1] text-[#4f46e5] hover:bg-blue-50 font-medium text-xs h-8"
                  >
                    <CheckCircle className="h-3.5 w-3.5 ml-1" />
                    تحديد الكل
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedTeachers([]);
                      setDialogMessage({
                        title: '✓ تم الإلغاء',
                        description: 'تم إلغاء اختيار جميع المعلمين'
                      });
                      setShowSuccessDialog(true);
                      
                      // إغلاق تلقائي بعد 1.5 ثانية
                      setTimeout(() => {
                        setShowSuccessDialog(false);
                      }, 1500);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium text-xs h-8"
                  >
                    <XCircle className="h-3.5 w-3.5 ml-1" />
                    إلغاء الكل
                  </Button>
                </div>

                {/* فاصل بصري شفاف بين الأزرار وقائمة المعلمين */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-3"></div>

                {/* قائمة المعلمين */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto px-1">
                  {filteredTeachers.map(teacher => {
                    const isSelected = selectedTeachers.includes(teacher.id);
                    return (
                      <div
                        key={teacher.id}
                        onClick={() => toggleTeacherSelection(teacher.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#6b9ff9] border-[#6b9ff9] text-white shadow-md'
                            : 'bg-white border-gray-200 hover:border-[#6366f1] hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${
                              isSelected ? 'text-white' : 'text-gray-900'
                            }`}>
                              {teacher.name}
                            </p>
                            <p className={`text-xs ${
                              isSelected ? 'text-white opacity-90' : 'text-gray-500'
                            }`}>
                              {teacher.subject}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-[#6b9ff9]" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ملخص */}
                {selectedTeachers.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-bold">
                      <CheckCircle className="h-4 w-4 inline ml-1" />
                      تم اختيار {selectedTeachers.length} معلم
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* العمود الأيسر - الجدول والإعدادات */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* الحد الأقصى اليومي */}
            <Card className={`shadow-lg border-2 ${
              selectedTeachers.length === 0 
                ? 'border-gray-300 opacity-60' 
                : 'border-[#6366f1]'
            }`}>
              <CardHeader className="pb-3" style={{ 
                background: selectedTeachers.length === 0 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)'
              }}>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  الحد الأقصى اليومي
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* فاصل بصري شفاف */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>
                
                {selectedTeachers.length === 0 ? (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <p className="text-sm text-amber-800 font-medium">
                        يرجى اختيار معلم أو أكثر من القائمة اليمنى لتحديد الحد الأقصى اليومي
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-sm font-bold text-gray-800 mb-2 block">
                        عدد الحصص كحد أقصى باليوم
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="7"
                        value={dailyMaxWaiting}
                        onChange={(e) => setDailyMaxWaiting(parseInt(e.target.value) || 1)}
                        className="text-center text-lg font-bold h-11 text-[#4f46e5] border-2 border-[#6366f1] max-w-[120px]"
                      />
                    </div>
                    <div className="flex-1 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800">
                        <Info className="h-3.5 w-3.5 inline ml-1" />
                        يمنع النظام من تجاوز هذا الحد عند توزيع حصص الانتظار
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* جدول استثناء الحصص */}
            <Card className={`shadow-lg border-2 ${
              selectedTeachers.length === 0 
                ? 'border-gray-300 opacity-60' 
                : 'border-[#6366f1]'
            }`}>
              <CardHeader className="pb-3" style={{ 
                background: selectedTeachers.length === 0 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)'
              }}>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  استثناء الحصص
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* فاصل بصري شفاف */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>
                
                {selectedTeachers.length === 0 ? (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <p className="text-sm text-amber-800 font-medium">
                        يرجى اختيار معلم أو أكثر من القائمة اليمنى لاستثناء الحصص
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #818cf8 0%, #a5b4fc 100%)' }}>
                        <th className="border border-gray-300 p-2 text-center font-bold text-white text-xs w-24">
                          اليوم / الحصة
                        </th>
                        {PERIODS.map((period, periodIndex) => (
                          <th key={periodIndex} className="border border-gray-300 p-1.5 text-center font-medium text-white text-xs">
                            {period.replace('الحصة ', '')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {WEEK_DAYS.map((day, dayIndex) => (
                        <tr key={dayIndex} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 text-center font-bold bg-gray-50 text-gray-700 text-xs">
                            {day.label}
                          </td>
                          {PERIODS.map((period, periodIndex) => {
                            const isBlocked = blockedPeriods.some(
                              bp => bp.day === dayIndex && bp.period === periodIndex
                            );
                            
                            return (
                              <td key={periodIndex} className="border border-gray-300 p-1 text-center">
                                <div 
                                  className={`w-7 h-7 mx-auto rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                    isBlocked
                                      ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-600 shadow-md' 
                                      : 'bg-white border-gray-300 hover:bg-red-50 hover:border-red-400 hover:scale-110'
                                  }`}
                                  onClick={() => togglePeriodBlock(dayIndex, periodIndex)}
                                  title={isBlocked ? 'مستثناة' : 'نشطة'}
                                >
                                  {isBlocked && (
                                    <X className="w-4 h-4 text-white" strokeWidth={3} />
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                )}

                {/* شرح توضيحي */}
                {selectedTeachers.length > 0 && (
                  <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <Info className="h-3.5 w-3.5 inline ml-1" />
                      انقر على الخلية لاستثناء الحصة. الحصص المستثناة تظهر باللون الأحمر
                    </p>
                  </div>
                )}

                {/* شريط الأزرار - من اليمين لليسار: حفظ - حذف - تطبيق */}
                <div className="flex gap-2 mt-4" dir="rtl">
                  {/* زر حفظ القيود */}
                  <Button
                    onClick={handleSaveConstraints}
                    disabled={isSaving || selectedTeachers.length === 0}
                    className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white font-medium text-sm h-9 px-4"
                  >
                    <Check className="h-4 w-4 ml-2" />
                    {isSaving ? 'جاري الحفظ...' : 'حفظ القيود'}
                  </Button>
                  
                  {/* زر حذف */}
                  <Button
                    onClick={handleDeleteConstraints}
                    disabled={selectedTeachers.length === 0}
                    variant="outline"
                    className="border-2 border-red-500 text-red-600 hover:bg-red-50 font-medium text-sm h-9 px-4"
                  >
                    <X className="h-4 w-4 ml-2" />
                    حذف
                  </Button>
                  
                  {/* زر تطبيق القيود على */}
                  <Button
                    onClick={() => {
                      if (!isApplyingConstraints) {
                        setDialogMessage({
                          title: 'تنبيه',
                          description: 'يجب حفظ القيود أولاً قبل تطبيقها'
                        });
                        setShowWarningDialog(true);
                        
                        // إغلاق تلقائي بعد 2 ثانية
                        setTimeout(() => {
                          setShowWarningDialog(false);
                        }, 2000);
                        return;
                      }
                      setDialogMessage({
                        title: '📋 اختر المنتظرين',
                        description: 'من فضلك اختر المنتظرين من القائمة اليمنى لتطبيق القيود عليهم'
                      });
                      setShowSuccessDialog(true);
                      
                      // إغلاق تلقائي بعد 2.5 ثانية
                      setTimeout(() => {
                        setShowSuccessDialog(false);
                      }, 2500);
                    }}
                    disabled={!isApplyingConstraints}
                    variant="outline"
                    className="border-2 border-green-500 text-green-600 hover:bg-green-50 font-medium text-sm h-9 px-4"
                  >
                    <Users className="h-4 w-4 ml-2" />
                    تطبيق القيود على
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* جدول القيود والاستثناءات المحفوظة - بطاقة مستقلة */}
        {savedConstraintsList.length > 0 && (
          <Card className="shadow-lg border-2 border-[#6366f1] mt-6">
            <CardHeader 
              className="pb-3" 
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg font-bold">
                    القيود والاستثناءات المحفوظة
                  </CardTitle>
                  <p className="text-white text-xs opacity-90 mt-0.5">
                    عدد المنتظرين: {savedConstraintsList.length}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
                {/* فاصل بصري شفاف */}
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent mb-5"></div>
                
                {/* زر حذف الكل */}
                <div className="mb-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">
                      إجمالي <span className="font-bold text-[#4f46e5]">{savedConstraintsList.length}</span> منتظر مع قيود
                    </span>
                  </div>
                  <Button
                    onClick={handleDeleteAll}
                    variant="outline"
                    className="border-2 border-red-500 text-red-600 hover:bg-red-50 font-medium text-sm h-9 px-4 hover:scale-105 transition-transform"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف الكل
                  </Button>
                </div>
                
                <div className="overflow-x-auto rounded-lg border-2 border-[#6366f1]">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}>
                        <th className="border-r border-indigo-400 p-3 text-center font-bold text-white text-sm" style={{ width: '60px' }}>
                          م
                        </th>
                        <th className="border-r border-indigo-400 p-3 text-right font-bold text-white text-sm" style={{ width: '180px' }}>
                          المنتظر
                        </th>
                        <th className="border-r border-indigo-400 p-3 text-center font-bold text-white text-sm" style={{ width: '150px' }}>
                          الحد الأقصى اليومي
                        </th>
                        <th className="border-r border-indigo-400 p-3 text-center font-bold text-white text-sm" style={{ width: '140px' }}>
                          عدد الحصص المستثناة
                        </th>
                        <th className="border-r border-indigo-400 p-3 text-center font-bold text-white text-sm">
                          تفاصيل الحصص المستثناة
                        </th>
                        <th className="p-3 text-center font-bold text-white text-sm" style={{ width: '100px' }}>
                          الإجراء
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {savedConstraintsList.map((constraint, index) => {
                        // ترتيب الحصص المستثناة حسب اليوم ثم الحصة
                        const sortedBlockedPeriods = [...constraint.blockedPeriodsList].sort((a, b) => {
                          if (a.day !== b.day) {
                            return a.day - b.day;
                          }
                          return a.period - b.period;
                        });
                        
                        return (
                          <tr key={constraint.teacherId} className="hover:bg-blue-50 transition-colors">
                            <td className="border-t border-r border-gray-200 p-3 text-center font-bold text-gray-700">
                              {index + 1}
                            </td>
                            <td className="border-t border-r border-gray-200 p-3 text-right">
                              <span className="font-bold text-gray-900">{constraint.teacherName}</span>
                            </td>
                            <td className="border-t border-r border-gray-200 p-3 text-center">
                              <span className="font-bold text-[#4f46e5]">
                                {constraint.maxDaily} حصة/يوم
                              </span>
                            </td>
                            <td className="border-t border-r border-gray-200 p-3 text-center">
                              {constraint.blockedPeriodsCount > 0 ? (
                                <span className="font-bold text-red-700">
                                  {constraint.blockedPeriodsCount} حصص
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>
                            <td className="border-t border-r border-gray-200 p-3">
                              {constraint.blockedPeriodsCount > 0 ? (
                                <div className="flex flex-wrap gap-1.5 justify-start">
                                  {sortedBlockedPeriods.map((bp, idx) => (
                                    <span 
                                      key={idx} 
                                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-red-50 text-red-700 rounded-md border border-red-200 font-medium hover:bg-red-100 transition-colors"
                                    >
                                      <span className="font-bold">{WEEK_DAYS[bp.day].label}</span>
                                      <span className="text-red-400">•</span>
                                      <span>ح{bp.period + 1}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">لا يوجد حصص مستثناة</span>
                              )}
                            </td>
                            <td className="border-t border-r border-gray-200 p-3 text-center">
                              <button
                                onClick={() => handleDeleteSingleConstraint(constraint.teacherId)}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-400 text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                                title="حذف القيود"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* ملاحظة توضيحية */}
                <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-800">
                      <span className="font-bold">ملاحظة:</span> الحصص المستثناة مرتبة حسب اليوم والحصة لسهولة القراءة
                    </p>
                  </div>
                </div>
              </CardContent>
          </Card>
        )}

        {/* مربع حوار تأكيد الحذف الاحترافي */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md bg-white" dir="rtl">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="flex items-center gap-3 text-xl text-red-600">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <span>تأكيد الحذف</span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-right mt-3">
                هل أنت متأكد من حذف القيود والاستثناءات لـ <strong>{selectedTeachers.length}</strong> معلم؟
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-bold mb-2">⚠️ تحذير:</p>
                <p className="text-sm text-red-700">
                  سيتم حذف جميع القيود والاستثناءات المحفوظة للمعلمين المحددين.
                  <br />
                  <strong>هذا الإجراء لا يمكن التراجع عنه.</strong>
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="w-full sm:w-auto hover:bg-gray-100 border-2"
              >
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <Button
                onClick={confirmDelete}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                <Check className="h-4 w-4 ml-2" />
                تأكيد الحذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مربع حوار النجاح الاحترافي */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md bg-white" dir="rtl">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="flex items-center gap-3 text-xl text-green-600">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <span>{dialogMessage.title}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-sm text-green-800 text-center">
                  {dialogMessage.description}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* مربع حوار التحذير الاحترافي */}
        <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <DialogContent className="sm:max-w-md bg-white" dir="rtl">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="flex items-center gap-3 text-xl text-amber-600">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <span>{dialogMessage.title}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 text-center">
                  {dialogMessage.description}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* مربع حوار الخطأ الاحترافي */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent className="sm:max-w-md bg-white" dir="rtl">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="flex items-center gap-3 text-xl text-red-600">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <span>{dialogMessage.title}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-sm text-red-800 text-center">
                  {dialogMessage.description}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* مربع حوار تأكيد حذف صف من الجدول */}
        <Dialog open={showDeleteRowDialog} onOpenChange={setShowDeleteRowDialog}>
          <DialogContent className="sm:max-w-md bg-white" dir="rtl">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="flex items-center gap-3 text-xl text-red-600">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <span>تأكيد حذف القيود</span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-right mt-3">
                هل أنت متأكد من حذف القيود والاستثناءات لـ <strong>{MOCK_TEACHERS.find(t => t.id === teacherToDelete)?.name}</strong>؟
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-bold mb-2">⚠️ تحذير:</p>
                <p className="text-sm text-red-700">
                  سيتم حذف جميع القيود والاستثناءات المحفوظة لهذا المعلم.
                  <br />
                  <strong>هذا الإجراء لا يمكن التراجع عنه.</strong>
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteRowDialog(false);
                  setTeacherToDelete(null);
                }}
                className="w-full sm:w-auto hover:bg-gray-100 border-2"
              >
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <Button
                onClick={confirmDeleteRow}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                <Check className="h-4 w-4 ml-2" />
                تأكيد الحذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مربع حوار تأكيد حذف جميع القيود */}
        <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
          <DialogContent className="sm:max-w-md bg-white" dir="rtl">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="flex items-center gap-3 text-xl text-red-600">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <span>تأكيد حذف جميع القيود</span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-right mt-3">
                هل أنت متأكد من حذف جميع القيود والاستثناءات لـ <strong>{savedConstraintsList.length}</strong> معلم؟
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-bold mb-2">⚠️ تحذير:</p>
                <p className="text-sm text-red-700">
                  سيتم حذف جميع القيود والاستثناءات المحفوظة لكل المعلمين.
                  <br />
                  <strong>هذا الإجراء لا يمكن التراجع عنه.</strong>
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowDeleteAllDialog(false)}
                className="w-full sm:w-auto hover:bg-gray-100 border-2"
              >
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <Button
                onClick={confirmDeleteAll}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                <Check className="h-4 w-4 ml-2" />
                تأكيد الحذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TeacherConstraintsPage;
