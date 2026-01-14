import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { ArrowRight, BookOpen, Save, Check, School, Plus, Trash2, Edit3, AlertCircle } from 'lucide-react';
import '@/styles/unified-header-styles.css';

interface Subject {
  id: string;
  name: string;
  code: string;
  weekly_hours: number;
  is_assigned: boolean;
}

interface Classroom {
  id: string;
  name: string;
  gradeId: string;
}

const ClassroomSubjectsSetup: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const classroomId = searchParams.get('classroomId');
  const classroomName = searchParams.get('classroomName');
  const stage = searchParams.get('stage');
  const stageId = searchParams.get('stageId');

  const [editableSubjects, setEditableSubjects] = useState<Subject[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectHours, setNewSubjectHours] = useState(3);
  
  // حالة مربع حوار التأكيد
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // حالة الفصول الأخرى وتطبيق الإعدادات عليها
  const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);
  const [applyToAll, setApplyToAll] = useState(false);

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
    return commonSubjects[stage || 'primary'] || commonSubjects['primary'];
  };

  useEffect(() => {
    // تحميل المواد المحفوظة أو إنشاء قائمة جديدة
    const savedSubjects = localStorage.getItem(`subjects_${classroomId}`);
    if (savedSubjects) {
      const subjects = JSON.parse(savedSubjects);
      // جعل جميع المواد مفعلة (is_assigned = true) بشكل افتراضي
      setEditableSubjects(subjects.map((s: Subject) => ({ ...s, is_assigned: true })));
    } else {
      // جلب المواد من إدارة المواد للمرحلة
      const stageSubjects = getSubjectsForStage(stage || 'primary');
      // جعل جميع المواد مفعلة بشكل افتراضي
      setEditableSubjects(stageSubjects.map(s => ({ ...s, is_assigned: true })));
    }
  }, [classroomId, stage]);

  useEffect(() => {
    // تحميل جميع الفصول من نفس المرحلة
    if (stageId) {
      const classrooms = JSON.parse(localStorage.getItem(`classrooms_stage_${stageId}`) || '[]');
      // استبعاد الفصل الحالي
      const otherClassrooms = classrooms.filter((c: Classroom) => c.id !== classroomId);
      setAllClassrooms(otherClassrooms);
    }
  }, [stageId, classroomId]);

  const handleSubjectToggle = (subject: Subject) => {
    setEditableSubjects(prev => 
      prev.map(s => 
        s.id === subject.id 
          ? { ...s, is_assigned: !s.is_assigned }
          : s
      )
    );
  };

  const handleWeeklyHoursChange = (subjectId: string, hours: number) => {
    setEditableSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? { ...s, weekly_hours: Math.max(1, Math.min(10, hours)) }
          : s
      )
    );
  };

  const handleDeleteSubject = (subjectId: string, subjectName: string) => {
    // فتح مربع حوار التأكيد
    setSubjectToDelete({ id: subjectId, name: subjectName });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSubject = () => {
    if (subjectToDelete) {
      setEditableSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));
      toast({
        title: "تم الحذف",
        description: `تم حذف المادة "${subjectToDelete.name}" بنجاح`,
      });
      setIsDeleteDialogOpen(false);
      setSubjectToDelete(null);
    }
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      toast({
        title: "تنبيه",
        description: "يرجى إدخال اسم المادة",
        variant: "destructive"
      });
      return;
    }

    const newSubject: Subject = {
      id: `custom_${Date.now()}`,
      name: newSubjectName.trim(),
      code: newSubjectCode.trim() || 'CUSTOM',
      weekly_hours: newSubjectHours,
      is_assigned: true
    };

    setEditableSubjects(prev => [...prev, newSubject]);
    setIsAddingSubject(false);
    setNewSubjectName('');
    setNewSubjectCode('');
    setNewSubjectHours(3);

    toast({
      title: "تم الإضافة",
      description: `تم إضافة المادة "${newSubject.name}" بنجاح`,
    });
  };

  const toggleClassroomSelection = (classroomId: string) => {
    setSelectedClassrooms(prev => 
      prev.includes(classroomId)
        ? prev.filter(id => id !== classroomId)
        : [...prev, classroomId]
    );
  };

  const handleApplyToAllChange = (checked: boolean) => {
    setApplyToAll(checked);
    if (checked) {
      setSelectedClassrooms([]);
    }
  };

  const handleSave = async () => {
    if (!classroomId) return;
    
    setIsSaving(true);
    try {
      // حفظ للفصل الحالي
      localStorage.setItem(`subjects_${classroomId}`, JSON.stringify(editableSubjects));
      
      // حفظ للفصول المحددة إذا تم اختيارها
      const classroomsToApply = applyToAll 
        ? allClassrooms.map(c => c.id)
        : selectedClassrooms;
      
      classroomsToApply.forEach(id => {
        localStorage.setItem(`subjects_${id}`, JSON.stringify(editableSubjects));
      });
      
      const selectedCount = editableSubjects.filter(s => s.is_assigned).length;
      let successMessage = `تم حفظ تخصيص المواد للفصل ${classroomName} (${selectedCount} مادة)`;
      if (classroomsToApply.length > 0) {
        successMessage += ` وتم تطبيقه على ${classroomsToApply.length} فصل إضافي`;
      }
      
      toast({
        title: "نجح",
        description: successMessage,
      });

      // العودة للصفحة السابقة
      setTimeout(() => {
        navigate(-1);
      }, 500);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ تخصيص المواد",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalWeeklyHours = () => {
    return editableSubjects.reduce((total, subject) => total + subject.weekly_hours, 0);
  };

  const selectedSubjectsCount = editableSubjects.length;

  return (
    <div className="classroom-subjects-container" dir="rtl">
      <div className="container mx-auto pt-1 px-4 pb-4 sm:px-6 sm:pb-6 max-w-7xl">
        
        {/* رأس الصفحة */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">تخصيص المواد الدراسية</h1>
                <p className="text-sm text-gray-600 mt-1">فصل: {classroomName || 'غير محدد'}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="arabic-text"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              رجوع
            </Button>
          </div>
        </div>

        <Card className="shadow-lg border-gray-200">
          <CardHeader className="pb-4" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}>
            <CardTitle className="text-center text-white arabic-text">
              المواد المطلوبة للفصل وعدد حصصها الأسبوعية
            </CardTitle>
          </CardHeader>

          <CardContent className="pb-6 pt-6">
            {/* إحصائيات سريعة وزر إضافة مادة */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#6366f1' + '15', border: '1px solid #6366f1' + '40' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm flex-1">
                  <span className="font-medium arabic-text" style={{ color: '#5b21b6' }}>
                    عدد المواد: <span className="font-bold text-lg" style={{ color: '#6366f1' }}>{selectedSubjectsCount}</span> مادة
                  </span>
                  {/* فاصل عمودي */}
                  <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
                  <span className="font-medium arabic-text" style={{ color: '#5b21b6' }}>
                    إجمالي الحصص: <span className="font-bold text-lg" style={{ color: '#6366f1' }}>{getTotalWeeklyHours()}</span> حصة أسبوعياً
                  </span>
                </div>
                {!isAddingSubject && (
                  <Button
                    onClick={() => setIsAddingSubject(true)}
                    className="text-white arabic-text whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة مادة جديدة
                  </Button>
                )}
              </div>
            </div>

            {/* نموذج إضافة مادة */}
            {isAddingSubject && (
              <div className="mb-4 p-4 border-2 rounded-lg bg-blue-50" style={{ borderColor: '#818cf8' }}>
                <h3 className="font-bold mb-3 arabic-text flex items-center gap-2" style={{ color: '#5b21b6' }}>
                  <Plus className="w-5 h-5" />
                  إضافة مادة جديدة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label className="text-sm mb-1 arabic-text">اسم المادة *</Label>
                    <Input
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="مثال: التربية الفنية"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-1 arabic-text">عدد الحصص الأسبوعية *</Label>
                    <Input
                      type="number"
                      value={newSubjectHours}
                      onChange={(e) => setNewSubjectHours(parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddSubject}
                    className="flex-1 text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}
                  >
                    <Check className="w-4 h-4 ml-2" />
                    إضافة
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAddingSubject(false);
                      setNewSubjectName('');
                      setNewSubjectCode('');
                      setNewSubjectHours(3);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}

            {/* جدول المواد الاحترافي */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}>
                    <th className="border border-gray-300 p-3 text-right font-bold text-white text-sm">#</th>
                    <th className="border border-gray-300 p-3 text-right font-bold text-white text-sm">اسم المادة</th>
                    <th className="border border-gray-300 p-3 text-center font-bold text-white text-sm">عدد الحصص الأسبوعية</th>
                    <th className="border border-gray-300 p-3 text-center font-bold text-white text-sm">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {editableSubjects.map((subject, index) => (
                    <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                      <td className="border border-gray-300 p-3 text-center font-semibold text-gray-700">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 p-3 text-right">
                        <span className="font-medium text-gray-800 arabic-text">{subject.name}</span>
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="flex items-center justify-center">
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={subject.weekly_hours}
                            onChange={(e) => handleWeeklyHoursChange(subject.id, parseInt(e.target.value) || 1)}
                            className="w-24 h-10 text-center font-bold text-base"
                            style={{ borderColor: '#818cf8', borderWidth: '2px' }}
                          />
                        </div>
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleDeleteSubject(subject.id, subject.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* قسم تطبيق الإعدادات على فصول أخرى */}
            {allClassrooms.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <School className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 mb-1 arabic-text">تطبيق على فصول أخرى</h4>
                    <p className="text-xs text-slate-600 arabic-text">يمكنك تطبيق نفس تخصيص المواد على فصول متعددة</p>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="apply-all-subjects"
                      checked={applyToAll}
                      onCheckedChange={(checked) => handleApplyToAllChange(checked as boolean)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {applyToAll && (
                  <div className="space-y-4 border-t border-slate-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700 arabic-text">اختر الفصول:</span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedClassrooms(allClassrooms.map(c => c.id))}
                          className="text-xs h-7 px-3 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          تحديد الكل
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedClassrooms([])}
                          className="text-xs h-7 px-3 text-slate-600 border-slate-200 hover:bg-slate-50"
                        >
                          إلغاء التحديد
                        </Button>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="border-2 border-slate-300 rounded-lg bg-white shadow-sm hover:border-blue-400 transition-colors">
                        <div className="max-h-40 overflow-y-auto p-2">
                          {allClassrooms.map(classroom => (
                            <div 
                              key={classroom.id} 
                              onClick={() => toggleClassroomSelection(classroom.id)}
                              className={`flex items-center gap-3 p-3 mb-1 rounded-lg cursor-pointer transition-all duration-200 ${
                                selectedClassrooms.includes(classroom.id)
                                  ? 'bg-blue-50 border-2 border-blue-400 shadow-sm'
                                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-300'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                selectedClassrooms.includes(classroom.id)
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'bg-white border-gray-300'
                              }`}>
                                {selectedClassrooms.includes(classroom.id) && (
                                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm font-medium ${
                                selectedClassrooms.includes(classroom.id)
                                  ? 'text-blue-700'
                                  : 'text-slate-700'
                              }`}>
                                فصل {classroom.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {selectedClassrooms.length > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium arabic-text">
                          سيتم تطبيق الإعداد على {selectedClassrooms.length} فصل
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* أزرار التحكم */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)} 
                className="w-full sm:w-auto px-8 arabic-text"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving || selectedSubjectsCount === 0}
                className="w-full sm:w-auto px-8 text-white arabic-text"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}
              >
                {isSaving ? (
                  <div className="loading-spinner ml-2" />
                ) : (
                  <Save className="w-4 h-4 ml-2" />
                )}
                {isSaving ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* مربع حوار تأكيد الحذف */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md w-[90vw] max-w-[450px] rounded-xl shadow-2xl" dir="rtl">
            <DialogHeader className="pb-3 border-b border-gray-100">
              <DialogTitle className="flex items-center text-lg font-bold arabic-text">
                <div className="bg-red-100 p-2 rounded-lg ml-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                </div>
                <span className="flex-1 text-gray-900">تأكيد حذف المادة</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-5 px-1">
              <p className="text-gray-700 arabic-text text-sm leading-relaxed">
                هل أنت متأكد من حذف المادة <span className="font-bold text-red-600">"{subjectToDelete?.name}"</span>؟
              </p>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-xs arabic-text flex items-start font-medium">
                  <AlertCircle className="w-4 h-4 ml-1.5 mt-0.5 text-red-600 flex-shrink-0" />
                  <span>تحذير: هذا الإجراء لا يمكن التراجع عنه</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-gray-100">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSubjectToDelete(null);
                }}
                className="w-full sm:flex-1 arabic-text font-medium border-2 hover:bg-gray-50 h-10 text-sm rounded-lg"
              >
                إلغاء
              </Button>
              <Button 
                onClick={confirmDeleteSubject}
                className="w-full sm:flex-1 arabic-text font-medium h-10 text-sm rounded-lg shadow-md hover:shadow-lg transition-all bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 ml-1.5" />
                تأكيد الحذف
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ClassroomSubjectsSetup;
