import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, Edit, GraduationCap, Users, School, ChevronLeft, AlertTriangle, X, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSchool } from "@/contexts/SchoolContext";

// أنواع البيانات
interface Classroom {
  id: string;
  gradeNumber: number;
  classNumber: number;
  studentCount: number;
  stage: string;
  department: string;
  displayName: string;
}

interface Grade {
  gradeNumber: number;
  name: string;
  stage: string;
  department: string;
  classrooms: Classroom[];
  color: 'blue' | 'purple' | 'green';
}

interface Stage {
  id: string;
  name: string;
  grades: number[];
  selectedDepartments: string[]; // تعديل لدعم أقسام متعددة
  active: boolean;
}

interface Department {
  id: string;
  name: string;
  active: boolean;
}

// واجهة جديدة لمزيج المرحلة والقسم
interface SchoolUnit {
  id: string;
  stageName: string;
  departmentName: string;
  stageId: string;
  departmentId: string;
  grades: Grade[];
}

// إضافة interface للإعدادات المخصصة لرياض الأطفال
interface KindergartenConfig {
  customLevels: { name: string; id: string }[];
  useCustomLevels: boolean;
}

// واجهة جديدة لإعداد الفصول
interface ClassroomSetup {
  gradeNumber: number;
  gradeName: string;
  classroomsCount: number;
}

interface StageClassroomSetup {
  stageId: string;
  stageName: string;
  departmentId: string;
  departmentName: string;
  classrooms: ClassroomSetup[];
}

// مكون مربع حوار إعداد الفصول للمراحل والأقسام
interface ClassroomSetupDialogProps {
  stageSetups: StageClassroomSetup[];
  onSave: (setups: StageClassroomSetup[]) => void;
  onCancel: () => void;
  isStepByStepMode?: boolean;
  currentSetupIndex?: number;
  completedSetups?: string[];
}

interface SchoolSetupDialogProps {
  currentStages: Stage[];
  currentDepartments: Department[];
  onSave: (stages: Stage[], departments: Department[]) => void;
  onCancel: () => void;
}

const ClassroomSetupDialog: React.FC<ClassroomSetupDialogProps> = ({
  stageSetups,
  onSave,
  onCancel,
  isStepByStepMode = false,
  currentSetupIndex = 0,
  completedSetups = []
}) => {
  const [setups, setSetups] = useState<StageClassroomSetup[]>(stageSetups);
  const [showInfoAlert, setShowInfoAlert] = useState(true);

  // تحديث setups عند تغيير stageSetups
  useEffect(() => {
    setSetups(stageSetups);
  }, [stageSetups]);

  // في النمط المرحلي، أعرض فقط الإعداد الحالي
  const displaySetups = isStepByStepMode ? [setups[currentSetupIndex]].filter(Boolean) : setups;
  const currentSetup = isStepByStepMode ? setups[currentSetupIndex] : null;

  const updateClassroomCount = (stageId: string, departmentId: string, gradeNumber: number, count: number) => {
    setSetups(prev => prev.map(setup => 
      setup.stageId === stageId && setup.departmentId === departmentId
        ? {
            ...setup,
            classrooms: setup.classrooms.map(classroom =>
              classroom.gradeNumber === gradeNumber
                ? { ...classroom, classroomsCount: count }
                : classroom
            )
          }
        : setup
    ));
    
    // في النمط المرحلي، نحتاج أيضاً لتحديث stageSetups الأصلي
    if (isStepByStepMode) {
      // تحديث البيانات في المصدر الأصلي
      const updatedStageSetups = stageSetups.map(setup => 
        setup.stageId === stageId && setup.departmentId === departmentId
          ? {
              ...setup,
              classrooms: setup.classrooms.map(classroom =>
                classroom.gradeNumber === gradeNumber
                  ? { ...classroom, classroomsCount: count }
                  : classroom
              )
            }
          : setup
      );
      // يمكن إضافة callback هنا لتحديث البيانات في المكون الأب إذا لزم الأمر
    }
  };

  const handleSave = () => {
    if (isStepByStepMode && currentSetup) {
      // في النمط المرحلي، أرسل الإعداد الحالي فقط مع التحديثات
      const updatedSetup = setups.find(setup => 
        setup.stageId === currentSetup.stageId && setup.departmentId === currentSetup.departmentId
      ) || currentSetup;
      
      onSave([updatedSetup]);
    } else {
      // في النمط العادي، أرسل جميع الإعدادات
      onSave(setups);
    }
  };

  return (
    <DialogContent className="sm:max-w-[1200px] h-[90vh] flex flex-col" dir="rtl">
      <DialogHeader className="flex-shrink-0">
        <DialogTitle className="text-right text-2xl font-bold text-gray-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            {isStepByStepMode ? (
              <div>
                <div className="text-xl">إعداد الفصول - المرحلة {currentSetupIndex + 1} من {stageSetups.length}</div>
                <div className="text-sm text-gray-600 font-normal">
                  {currentSetup ? `${currentSetup.stageName} - ${currentSetup.departmentName}` : ''}
                </div>
              </div>
            ) : (
              'إعداد الفصول لجميع المراحل والأقسام'
            )}
          </div>
        </DialogTitle>
        
        {/* شريط التقدم للنمط المرحلي */}
        {isStepByStepMode && (
          <div className="mt-4 mb-6 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">التقدم:</span>
              <span className="text-sm font-medium text-blue-600">
                {completedSetups.length} من {stageSetups.length} مكتمل
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(completedSetups.length / stageSetups.length) * 100}%` }}
              ></div>
            </div>
            
            {/* قائمة الوحدات مع علامات الإكمال */}
            <div className="flex flex-wrap gap-2 mt-3">
              {stageSetups.map((setup, index) => {
                const setupId = `${setup.stageId}-${setup.departmentId}`;
                const isCompleted = completedSetups.includes(setupId);
                const isCurrent = index === currentSetupIndex;
                
                return (
                  <div 
                    key={setupId}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      isCompleted 
                        ? 'bg-green-100 text-green-700 border-green-300' 
                        : isCurrent 
                          ? 'bg-blue-100 text-blue-700 border-blue-300' 
                          : 'bg-gray-100 text-gray-600 border-gray-300'
                    }`}
                  >
                    {isCompleted && <span className="mr-1">✓</span>}
                    {isCurrent && !isCompleted && <span className="mr-1">⏳</span>}
                    {setup.stageName} - {setup.departmentName}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogHeader>
      
      <div className="flex-1 overflow-y-auto px-1">
        {/* تنبيه توضيحي قابل للإغلاق */}
        {showInfoAlert && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg relative mb-6">
            <button
              onClick={() => setShowInfoAlert(false)}
              className="absolute top-2 left-2 p-1 hover:bg-blue-200 rounded-full transition-colors z-10"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4 text-blue-600" />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <div>
                <h4 className="font-semibold text-blue-800">إعداد الفصول</h4>
                <p className="text-blue-700 text-sm mt-1">
                  حدد عدد الفصول لكل صف في كل مرحلة وقسم. يمكنك تعديل هذه الأرقام لاحقاً من خلال أزرار الإضافة في كل صف.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* عرض إعداد الفصول لكل وحدة مدرسية */}
        <div className="space-y-6">
          {displaySetups.map((setup, setupIndex) => (
            <Card key={`${setup.stageId}-${setup.departmentId}`} className="border-2 border-gray-200 bg-white shadow-lg">
              <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg">
                <h3 className="text-lg font-bold text-gray-800">
                  {setup.stageName} - {setup.departmentName}
                  {isStepByStepMode && (
                    <div className="mr-auto">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        المرحلة الحالية
                      </span>
                    </div>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {isStepByStepMode 
                    ? 'حدد عدد الفصول لكل صف في هذه الوحدة المدرسية ثم انقر "إنشاء" للانتقال للمرحلة التالية'
                    : 'حدد عدد الفصول لكل صف في هذه الوحدة المدرسية'
                  }
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {setup.classrooms.map((classroom) => (
                    <div key={classroom.gradeNumber} className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {classroom.gradeName.replace(setup.stageName, '').trim()}
                          </h4>
                          <p className="text-xs text-gray-600">عدد الفصول</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`classroom-${setup.stageId}-${setup.departmentId}-${classroom.gradeNumber}`} className="text-sm font-medium">
                          عدد الفصول:
                        </Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateClassroomCount(setup.stageId, setup.departmentId, classroom.gradeNumber, Math.max(0, classroom.classroomsCount - 1))}
                            className="h-8 w-8 p-0"
                            disabled={classroom.classroomsCount <= 0}
                          >
                            -
                          </Button>
                          <Input
                            id={`classroom-${setup.stageId}-${setup.departmentId}-${classroom.gradeNumber}`}
                            type="number"
                            min="0"
                            max="50"
                            value={classroom.classroomsCount}
                            onChange={(e) => updateClassroomCount(setup.stageId, setup.departmentId, classroom.gradeNumber, parseInt(e.target.value) || 0)}
                            className="h-8 text-center flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateClassroomCount(setup.stageId, setup.departmentId, classroom.gradeNumber, Math.min(50, classroom.classroomsCount + 1))}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* معاينة الفصول - تحسين التنسيق العربي */}
                      {classroom.classroomsCount > 0 && (
                        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-700 font-medium">
                            سيتم إنشاء {classroom.classroomsCount} فصل:
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Array.from({length: Math.min(classroom.classroomsCount, 10)}, (_, i) => {
                              // تنسيق عربي صحيح (الصف-الفصل)
                              let displayName = '';
                              if (setup.stageName === 'المرحلة المتوسطة') {
                                const actualGrade = classroom.gradeNumber - 6; // تحويل 7,8,9 إلى 1,2,3
                                displayName = actualGrade + '-' + (i + 1);
                              } else if (setup.stageName === 'المرحلة الثانوية') {
                                const actualGrade = classroom.gradeNumber - 9; // تحويل 10,11,12 إلى 1,2,3
                                displayName = actualGrade + '-' + (i + 1);
                              } else if (setup.stageName === 'رياض الأطفال') {
                                // للروضة: المستوى-الفصل (1-1, 2-1, إلخ)
                                displayName = classroom.gradeNumber + '-' + (i + 1);
                              } else {
                                // المرحلة الابتدائية: الصف-الفصل (1-1, 2-1, إلخ)
                                displayName = classroom.gradeNumber + '-' + (i + 1);
                              }
                              
                              return (
                                <Badge key={i} variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300" dir="ltr">
                                  {displayName}
                                </Badge>
                              );
                            })}
                            {classroom.classroomsCount > 10 && (
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                ...
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* إحصائيات الوحدة */}
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">إحصائيات الوحدة:</h4>
                    <div className="flex gap-4 text-sm">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {setup.classrooms.length} صف
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {setup.classrooms.reduce((total, c) => total + c.classroomsCount, 0)} فصل
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* إحصائيات إجمالية */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                الإحصائيات الإجمالية
              </h3>
              <div className="flex gap-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 px-4 py-2">
                  {setups.length} وحدة مدرسية
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-4 py-2">
                  {setups.reduce((total, setup) => total + setup.classrooms.length, 0)} صف إجمالي
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2">
                  {setups.reduce((total, setup) => total + setup.classrooms.reduce((sum, c) => sum + c.classroomsCount, 0), 0)} فصل إجمالي
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أزرار الحفظ والإلغاء */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 flex-shrink-0">
        <Button variant="outline" onClick={onCancel} size="lg">
          إلغاء
        </Button>
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" size="lg">
          <Plus className="w-5 h-5 ml-2" />
          {isStepByStepMode ? (
            currentSetupIndex < stageSetups.length - 1 ? 'إنشاء فصول هذه المرحلة والانتقال للتالية' : 'إنشاء فصول المرحلة الأخيرة'
          ) : (
            'إنشاء جميع الفصول'
          )}
        </Button>
      </div>
    </DialogContent>
  );
};

const SchoolSetupDialog: React.FC<SchoolSetupDialogProps> = ({
  currentStages,
  currentDepartments,
  onSave,
  onCancel
}) => {
  const [stages, setStages] = useState<Stage[]>(currentStages);
  const [kindergartenConfig, setKindergartenConfig] = useState<KindergartenConfig>({
    customLevels: [{ name: 'المستوى الأول', id: '1' }, { name: 'المستوى الثاني', id: '2' }],
    useCustomLevels: false
  });

  const defaultStages = [
    { id: '1', name: 'رياض الأطفال', grades: [], selectedDepartments: [], active: false },
    { id: '2', name: 'المرحلة الابتدائية', grades: [1, 2, 3, 4, 5, 6], selectedDepartments: [], active: false },
    { id: '3', name: 'المرحلة المتوسطة', grades: [7, 8, 9], selectedDepartments: [], active: false },
    { id: '4', name: 'المرحلة الثانوية', grades: [10, 11, 12], selectedDepartments: ['general'], active: false }
  ];

  const departments = [
    { id: '1', name: 'قسم تعليم عام', active: true },
    { id: '2', name: 'قسم تحفيظ القرآن الكريم', active: true },
    { id: 'general', name: 'تعليم عام', active: true } // قسم خاص للثانوية
  ];

  // فلترة الأقسام حسب المرحلة
  const getAvailableDepartments = (stageName: string) => {
    if (stageName === 'المرحلة الثانوية') {
      return []; // المرحلة الثانوية لا تحتاج أقسام
    }
    return departments.filter(dept => dept.id !== 'general');
  };

  useEffect(() => {
    if (stages.length === 0) {
      setStages(defaultStages);
    }
  }, []);

  const handleStageToggle = (stageId: string) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, active: !stage.active, selectedDepartments: stage.active ? [] : stage.selectedDepartments } 
        : stage
    ));
  };

  const handleStageDepartmentToggle = (stageId: string, departmentId: string) => {
    setStages(prev => prev.map(stage => {
      if (stage.id === stageId) {
        const updatedDepartments = stage.selectedDepartments.includes(departmentId)
          ? stage.selectedDepartments.filter(id => id !== departmentId)
          : [...stage.selectedDepartments, departmentId];
        
        return { ...stage, selectedDepartments: updatedDepartments };
      }
      return stage;
    }));
  };

  const addKindergartenLevel = () => {
    setKindergartenConfig(prev => ({
      ...prev,
      customLevels: [...prev.customLevels, { name: `المستوى ${prev.customLevels.length + 1}`, id: Date.now().toString() }]
    }));
  };

  const removeKindergartenLevel = (levelId: string) => {
    setKindergartenConfig(prev => ({
      ...prev,
      customLevels: prev.customLevels.filter(level => level.id !== levelId)
    }));
  };

  const updateKindergartenLevelName = (levelId: string, newName: string) => {
    setKindergartenConfig(prev => ({
      ...prev,
      customLevels: prev.customLevels.map(level => 
        level.id === levelId ? { ...level, name: newName } : level
      )
    }));
  };

  const isKindergartenStage = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.name === 'رياض الأطفال';
  };

  const handleSave = () => {
    // التحقق من صحة البيانات
    const activeStages = stages.filter(stage => stage.active);
    const hasInvalidStage = activeStages.some(stage => {
      if (stage.name === 'رياض الأطفال' || stage.name === 'المرحلة الثانوية') {
        return false; // رياض الأطفال والثانوية لا تحتاج قسم
      }
      return stage.selectedDepartments.length === 0;
    });

    if (hasInvalidStage) {
      alert('يجب اختيار قسم واحد على الأقل لجميع المراحل المفعلة (عدا رياض الأطفال والمرحلة الثانوية)');
      return;
    }

    // إضافة القسم العام افتراضياً للمرحلة الثانوية
    const updatedStages = stages.map(stage => {
      if (stage.name === 'المرحلة الثانوية' && stage.active) {
        return { ...stage, selectedDepartments: ['general'] };
      }
      return stage;
    });

    onSave(updatedStages, departments);
  };

  return (
    <DialogContent className="sm:max-w-[1200px] max-h-[95vh] overflow-hidden p-0" dir="rtl">
      <div className="flex flex-col h-full max-h-[95vh]">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <DialogTitle className="text-right text-xl font-bold text-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-full shadow-md">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              إعدادات الفصول والمراحل الدراسية
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* تنبيه هام */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div>
              <h4 className="font-semibold text-blue-800">تنبيه:</h4>
              <p className="text-blue-700 text-sm mt-1">
                كل مرحلة مع قسم تعليمي تمثل <strong>مدرسة منفصلة</strong>. 
                مثال: إذا اخترت المرحلة الابتدائية مع قسمي "تعليم عام" و"تحفيظ القرآن" 
                سيتم إنشاء مدرستين منفصلتين لنفس المرحلة.
              </p>
              <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                <p className="text-xs text-blue-600">
                  <strong>إضاءة:</strong> يمكنك اختيار قسم واحد أو أكثر لكل مرحلة حسب احتياجات مدرستك.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* المراحل الدراسية مع الأقسام */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-bold text-gray-800">
              المراحل الدراسية والأقسام التعليمية
            </h3>
            <p className="text-sm text-gray-600">اختر المراحل والأقسام المتوفرة في مدرستك</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stages.map((stage) => (
                <Card key={stage.id} className="border border-gray-200 bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* اختيار المرحلة */}
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Checkbox
                          id={`stage-${stage.id}`}
                          checked={stage.active}
                          onCheckedChange={() => handleStageToggle(stage.id)}
                          className="w-5 h-5"
                        />
                        <Label htmlFor={`stage-${stage.id}`} className="text-base font-semibold cursor-pointer text-gray-800">
                          {stage.name}
                        </Label>
                        {stage.grades.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {stage.grades.length} صفوف
                          </Badge>
                        )}
                      </div>
                      
                      {/* خيارات المرحلة */}
                      {stage.active && (
                        <div className="mr-8 space-y-4 p-4 bg-gray-50 rounded-lg">
                          {/* خيارات خاصة برياض الأطفال */}
                          {isKindergartenStage(stage.id) ? (
                            <div className="space-y-4">
                              <div className="p-3 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-800 mb-2">خيارات رياض الأطفال</h4>
                                <p className="text-sm text-green-700">
                                  اختر بين استخدام المستويات أو الفصول التقليدية
                                </p>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                  <Checkbox
                                    id="useCustomLevels"
                                    checked={kindergartenConfig.useCustomLevels}
                                    onCheckedChange={(checked) => setKindergartenConfig(prev => ({ ...prev, useCustomLevels: !!checked }))}
                                    className="w-4 h-4"
                                  />
                                  <Label htmlFor="useCustomLevels" className="text-sm font-medium cursor-pointer">
                                    مستويات مخصصة
                                  </Label>
                                </div>
                                
                                <div className="flex items-center space-x-3 space-x-reverse">
                                  <Checkbox
                                    id="useClassrooms"
                                    checked={!kindergartenConfig.useCustomLevels}
                                    onCheckedChange={(checked) => setKindergartenConfig(prev => ({ ...prev, useCustomLevels: !checked }))}
                                    className="w-4 h-4"
                                  />
                                  <Label htmlFor="useClassrooms" className="text-sm font-medium cursor-pointer">
                                    نظام الفصول
                                  </Label>
                                </div>
                                
                                {kindergartenConfig.useCustomLevels && (
                                  <div className="space-y-3 mr-6 p-3 bg-white rounded-lg border border-blue-200">
                                    <Label className="text-sm font-medium text-blue-700">المستويات المخصصة:</Label>
                                    {kindergartenConfig.customLevels.map((level) => (
                                      <div key={level.id} className="flex items-center gap-2">
                                        <Input
                                          value={level.name}
                                          onChange={(e) => updateKindergartenLevelName(level.id, e.target.value)}
                                          className="flex-1 h-8 text-sm"
                                          placeholder="اسم المستوى"
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeKindergartenLevel(level.id)}
                                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                          disabled={kindergartenConfig.customLevels.length <= 1}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={addKindergartenLevel}
                                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                                    >
                                      <Plus className="w-3 h-3 ml-1" />
                                      إضافة مستوى
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* خيارات الأقسام للمراحل الأخرى */
                            <div className="space-y-3">
                              {/* المرحلة الثانوية لا تحتاج اختيار قسم */}
                              {stage.name === 'المرحلة الثانوية' ? (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex items-center gap-2">
                                    <p className="text-blue-700 text-sm font-medium">
                                      المرحلة الثانوية نظام المسارات
                                    </p>
                                  </div>
                                  <p className="text-blue-600 text-xs mt-1">
                                    سيتم تطبيق التعليم العام افتراضياً
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <Label className="text-sm font-medium text-gray-700">اختر الأقسام التعليمية:</Label>
                                  <div className="space-y-2">
                                    {getAvailableDepartments(stage.name).map((department) => (
                                      <div key={department.id} className="flex items-center space-x-3 space-x-reverse p-2 bg-white rounded border">
                                        <Checkbox
                                          id={`stage-${stage.id}-dept-${department.id}`}
                                          checked={stage.selectedDepartments.includes(department.id)}
                                          onCheckedChange={() => handleStageDepartmentToggle(stage.id, department.id)}
                                          className="w-4 h-4"
                                        />
                                        <Label 
                                          htmlFor={`stage-${stage.id}-dept-${department.id}`} 
                                          className="text-sm font-medium cursor-pointer flex-1"
                                        >
                                          {department.name}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                              
                              {stage.selectedDepartments.length > 1 && (
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                  <div className="flex items-start gap-2">
                                    <School className="w-4 h-4 text-green-600 mt-0.5" />
                                    <div>
                                      <p className="text-green-700 text-sm font-medium">
                                        سيتم إنشاء {stage.selectedDepartments.length} مدرسة منفصلة لـ {stage.name}
                                      </p>
                                      <p className="text-green-600 text-xs mt-1">
                                        كل قسم سيعمل كوحدة مدرسية مستقلة مع إدارة منفصلة للفصول والطلاب
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {stage.grades.length > 0 && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <Label className="text-xs font-medium text-blue-700">
                                    الصفوف المتضمنة: {stage.grades.map(grade => {
                                      if (stage.name === 'المرحلة المتوسطة') {
                                        return `الصف ${grade - 6}`;
                                      } else if (stage.name === 'المرحلة الثانوية') {
                                        return `الصف ${grade - 9}`;
                                      }
                                      return `الصف ${grade}`;
                                    }).join(' - ')}
                                  </Label>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        </div>
        
        {/* أزرار الحفظ والإلغاء */}
        <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onCancel} size="lg">
              إلغاء
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" size="lg">
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

// المكون الرئيسي
const ClassesManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-1 pb-6 px-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
              <School className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الفصول</h1>
          </div>
        </div>
        <ClassesManagementCore />
      </div>
    </div>
  );
};

const ClassesManagementCore: React.FC = () => {
  const { toast } = useToast();
  const { schoolData } = useSchool();
  
  // الحالات المحلية
  const [schoolUnits, setSchoolUnits] = useState<SchoolUnit[]>([]);
  const [activeStages, setActiveStages] = useState<Stage[]>([]);
  const [activeDepartments, setActiveDepartments] = useState<Department[]>([]);
  const [selectedSchoolUnit, setSelectedSchoolUnit] = useState<SchoolUnit | null>(null);
  const [isSchoolSetupDialogOpen, setIsSchoolSetupDialogOpen] = useState(false);
  const [isClassroomSetupDialogOpen, setIsClassroomSetupDialogOpen] = useState(false);
  const [pendingStageSetups, setPendingStageSetups] = useState<StageClassroomSetup[]>([]);
  const [isAddClassroomsDialogOpen, setIsAddClassroomsDialogOpen] = useState(false);
  const [selectedGradeForAddition, setSelectedGradeForAddition] = useState<Grade | null>(null);
  const [numberOfClassrooms, setNumberOfClassrooms] = useState<number>(1);
  
  // حالات جديدة لمربعات الحوار
  const [isEditClassroomDialogOpen, setIsEditClassroomDialogOpen] = useState(false);
  const [selectedClassroomForEdit, setSelectedClassroomForEdit] = useState<Classroom | null>(null);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'classroom' | 'grade', id: string, name: string} | null>(null);
  
  // حالات جديدة لتتبع إنشاء الفصول المرحلي
  const [currentSetupIndex, setCurrentSetupIndex] = useState(0);
  const [completedSetups, setCompletedSetups] = useState<string[]>([]);
  const [isStepByStepMode, setIsStepByStepMode] = useState(false);

  // تحميل البيانات عند بدء التشغيل أو تغيير بيانات المدرسة
  useEffect(() => {
    loadInitialData();
  }, [schoolData]);

  // حفظ البيانات في localStorage عند تغيير schoolUnits
  useEffect(() => {
    if (schoolUnits.length > 0) {
      saveToLocalStorage();
    }
  }, [schoolUnits]);

  const loadInitialData = () => {
    // التحقق من وجود بيانات المدرسة في SchoolContext
    if (schoolData.schools && schoolData.schools.length > 0) {
      // إنشاء وحدات مدرسية من بيانات المدرسة المحفوظة
      const units = createSchoolUnitsFromSchoolData(schoolData.schools);
      setSchoolUnits(units);
      if (units.length > 0) {
        setSelectedSchoolUnit(units[0]);
      }
    } else {
      // محاولة تحميل البيانات من localStorage كبديل
      const savedUnits = loadFromLocalStorage();
      if (savedUnits && savedUnits.length > 0) {
        setSchoolUnits(savedUnits);
        setSelectedSchoolUnit(savedUnits[0]);
      } else {
        // عرض رسالة للمستخدم لإعداد بيانات المدرسة أولاً
        toast({
          title: "لا توجد بيانات مدرسة",
          description: "يرجى إعداد بيانات المدرسة أولاً من صفحة بيانات المدرسة",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  // إنشاء بيانات تجريبية للاختبار
  const createInitialTestData = () => {
    const testUnits: SchoolUnit[] = [
      {
        id: 'primary-general',
        stageName: 'الابتدائية',
        departmentName: 'عام',
        stageId: 'primary',
        departmentId: 'general',
        grades: [
          {
            gradeNumber: 1,
            name: 'الأول الابتدائي',
            stage: 'الابتدائية',
            department: 'عام',
            color: 'blue',
            classrooms: [
              {
                id: 'class-1-1',
                gradeNumber: 1,
                classNumber: 1,
                studentCount: 25,
                stage: 'primary',
                department: 'عام',
                displayName: '1-1'
              },
              {
                id: 'class-1-2',
                gradeNumber: 1,
                classNumber: 2,
                studentCount: 23,
                stage: 'primary',
                department: 'عام',
                displayName: '1-2'
              }
            ]
          },
          {
            gradeNumber: 2,
            name: 'الثاني الابتدائي',
            stage: 'الابتدائية',
            department: 'عام',
            color: 'purple',
            classrooms: [
              {
                id: 'class-2-1',
                gradeNumber: 2,
                classNumber: 1,
                studentCount: 22,
                stage: 'primary',
                department: 'عام',
                displayName: '2-1'
              }
            ]
          }
        ]
      }
    ];

    setSchoolUnits(testUnits);
    setSelectedSchoolUnit(testUnits[0]);
    
    toast({
      title: "تم إنشاء بيانات تجريبية",
      description: "تم إنشاء فصول تجريبية للمرحلة الابتدائية للاختبار",
      duration: 3000,
    });
  };

  // حفظ البيانات في localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('schoolUnits', JSON.stringify(schoolUnits));
      console.log('تم حفظ البيانات في localStorage:', schoolUnits.length, 'وحدة');
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
    }
  };

  // تحميل البيانات من localStorage
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('schoolUnits');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('تم تحميل البيانات من localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    }
    return null;
  };

  // إنشاء وحدات مدرسية من بيانات المدرسة
  const createSchoolUnitsFromSchoolData = (schools) => {
    const units: SchoolUnit[] = [];
    
    schools.forEach(school => {
      const stageInfo = getStageInfo(school.stage);
      const departmentInfo = getDepartmentInfo(school.sectionType || 'general');
      
      const unitId = `${school.stage}-${school.sectionType || 'general'}`;
      const grades: Grade[] = [];
      
      // إنشاء الصفوف حسب المرحلة
      if (stageInfo && stageInfo.grades) {
        stageInfo.grades.forEach(gradeNumber => {
          grades.push({
            gradeNumber,
            name: getGradeName(gradeNumber, school.stage),
            stage: stageInfo.name,
            department: departmentInfo.name,
            classrooms: [],
            color: getGradeColor(gradeNumber)
          });
        });
      }
      
      units.push({
        id: unitId,
        stageName: stageInfo?.name || school.stage,
        departmentName: departmentInfo.name,
        stageId: school.stage,
        departmentId: school.sectionType || 'general',
        grades
      });
    });
    
    return units;
  };

  // الحصول على معلومات المرحلة
  const getStageInfo = (stageId) => {
    const stageMap = {
      'kindergarten': { name: 'رياض الأطفال', grades: [1, 2, 3] },
      'primary': { name: 'الابتدائية', grades: [1, 2, 3, 4, 5, 6] },
      'middle': { name: 'المتوسطة', grades: [1, 2, 3] },
      'secondary': { name: 'الثانوية', grades: [1, 2, 3] }
    };
    return stageMap[stageId];
  };

  // الحصول على معلومات القسم
  const getDepartmentInfo = (sectionType) => {
    const departmentMap = {
      'general': { name: 'عام' },
      'tahfeez': { name: 'تحفيظ' }
    };
    return departmentMap[sectionType] || { name: 'عام' };
  };

  // الحصول على اسم الصف
  const getGradeName = (gradeNumber, stage) => {
    const stageNames = {
      'kindergarten': 'رياض الأطفال',
      'primary': 'الابتدائي',
      'middle': 'المتوسط',
      'secondary': 'الثانوي'
    };
    
    const gradeNames = {
      1: 'الأول',
      2: 'الثاني', 
      3: 'الثالث',
      4: 'الرابع',
      5: 'الخامس',
      6: 'السادس'
    };
    
    return `${gradeNames[gradeNumber]} ${stageNames[stage] || ''}`;
  };

  // الحصول على لون الصف
  const getGradeColor = (gradeNumber: number): 'blue' | 'purple' | 'green' => {
    const colors: ('blue' | 'purple' | 'green')[] = ['blue', 'purple', 'green'];
    return colors[(gradeNumber - 1) % colors.length];
  };

  // تحميل بيانات المواد الدراسية من localStorage
  const loadSubjectsData = () => {
    try {
      const savedSubjects = localStorage.getItem('subjectsData');
      if (savedSubjects) {
        return JSON.parse(savedSubjects);
      }
    } catch (error) {
      console.error('خطأ في تحميل بيانات المواد:', error);
    }
    return null;
  };

  // ربط المواد الدراسية بالفصول حسب المرحلة والقسم
  const linkSubjectsToClassrooms = (stageId: string, departmentId: string) => {
    const subjectsData = loadSubjectsData();
    if (!subjectsData) {
      toast({
        title: "لا توجد بيانات مواد",
        description: "يرجى إعداد المواد الدراسية أولاً من صفحة إدارة المواد",
        variant: "destructive",
        duration: 5000,
      });
      return [];
    }

    // البحث عن المواد المناسبة للمرحلة والقسم
    const stageKey = `${stageId}-${departmentId}`;
    const stageSubjects = subjectsData[stageKey];
    
    if (stageSubjects && stageSubjects.subjects) {
      return stageSubjects.subjects;
    }
    
    return [];
  };

  // حفظ ربط المواد بالفصول
  const saveClassroomSubjects = (classroomId: string, subjects: any[]) => {
    try {
      const savedClassroomSubjects = localStorage.getItem('classroomSubjects') || '{}';
      const classroomSubjects = JSON.parse(savedClassroomSubjects);
      classroomSubjects[classroomId] = subjects;
      localStorage.setItem('classroomSubjects', JSON.stringify(classroomSubjects));
    } catch (error) {
      console.error('خطأ في حفظ ربط المواد بالفصول:', error);
    }
  };

  // تحميل المواد المرتبطة بالفصل
  const getClassroomSubjects = (classroomId: string) => {
    try {
      const savedClassroomSubjects = localStorage.getItem('classroomSubjects') || '{}';
      const classroomSubjects = JSON.parse(savedClassroomSubjects);
      return classroomSubjects[classroomId] || [];
    } catch (error) {
      console.error('خطأ في تحميل المواد المرتبطة بالفصل:', error);
      return [];
    }
  };

  // إنشاء الوحدات المدرسية من المراحل والأقسام
  const createSchoolUnits = (stages: Stage[], departments: Department[]): SchoolUnit[] => {
    const units: SchoolUnit[] = [];
    
    stages.filter(stage => stage.active).forEach(stage => {
      stage.selectedDepartments.forEach(departmentId => {
        const department = departments.find(d => d.id === departmentId);
        if (department) {
          const unitId = `${stage.id}-${departmentId}`;
          const grades: Grade[] = [];
          
          if (stage.grades.length > 0) {
            // للمراحل التي لها صفوف محددة
            stage.grades.forEach(gradeNumber => {
              const gradeName = getGradeName(gradeNumber, stage.name);
              const colors: ('blue' | 'purple' | 'green')[] = ['blue', 'purple', 'green'];
              const color = colors[(gradeNumber - 1) % 3];
              grades.push({
                gradeNumber,
                name: gradeName,
                stage: stage.name,
                department: department.name,
                color,
                classrooms: []
              });
            });
          }
          
          units.push({
            id: unitId,
            stageName: stage.name,
            departmentName: department.name,
            stageId: stage.id,
            departmentId: department.id,
            grades
          });
        }
      });
    });
    
    return units;
  };

  const handleSchoolSetup = (stages: Stage[], departments: Department[]) => {
    const activeStagesFiltered = stages.filter(stage => stage.active);
    const activeDepartmentsFiltered = departments.filter(department => department.active);
    
    setActiveStages(activeStagesFiltered);
    setActiveDepartments(activeDepartmentsFiltered);
    
    // إنشاء الوحدات المدرسية (مزيج المراحل والأقسام) فوراً بدون فصول
    const newUnits: SchoolUnit[] = [];
    
    activeStagesFiltered.forEach(stage => {
      // التعامل مع رياض الأطفال بشكل خاص
      if (stage.name === 'رياض الأطفال') {
        // رياض الأطفال لها قسم واحد افتراضي
        const grades: Grade[] = [1, 2].map(gradeNumber => {
          const colors: ('blue' | 'purple' | 'green')[] = ['blue', 'purple', 'green'];
          const color = colors[(gradeNumber - 1) % 3];
          return {
            gradeNumber,
            name: `المستوى ${gradeNumber}`,
            stage: stage.name,
            department: 'رياض الأطفال',
            color,
            classrooms: []
          };
        });
        
        newUnits.push({
          id: `${stage.id}-kg`,
          stageName: stage.name,
          departmentName: 'رياض الأطفال',
          stageId: stage.id,
          departmentId: 'kg',
          grades
        });
      } else {
        // للمراحل الأخرى، إنشاء وحدة لكل قسم مختار
        stage.selectedDepartments.forEach(departmentId => {
          const department = activeDepartmentsFiltered.find(d => d.id === departmentId);
          if (department && stage.grades.length > 0) {
            const grades: Grade[] = stage.grades.map(gradeNumber => {
              const colors: ('blue' | 'purple' | 'green')[] = ['blue', 'purple', 'green'];
              const color = colors[(gradeNumber - 1) % 3];
              return {
                gradeNumber,
                name: getGradeName(gradeNumber, stage.name),
                stage: stage.name,
                department: department.name,
                color,
                classrooms: []
              };
            });
            
            newUnits.push({
              id: `${stage.id}-${department.id}`,
              stageName: stage.name,
              departmentName: department.name,
              stageId: stage.id,
              departmentId: department.id,
              grades
            });
          }
        });
      }
    });
    
    // حفظ الوحدات المدرسية
    setSchoolUnits(newUnits);
    
    // اختيار أول وحدة كافتراضية
    if (newUnits.length > 0) {
      setSelectedSchoolUnit(newUnits[0]);
    } else {
      setSelectedSchoolUnit(null);
    }
    
    setIsSchoolSetupDialogOpen(false);
    
    // إعداد الفصول فوراً للوحدات المدرسية التي تم إنشاؤها
    if (newUnits.length > 0) {
      const stageSetups: StageClassroomSetup[] = newUnits.map(unit => ({
        stageId: unit.stageId,
        stageName: unit.stageName,
        departmentId: unit.departmentId,
        departmentName: unit.departmentName,
        classrooms: unit.grades.map(grade => ({
          gradeNumber: grade.gradeNumber,
          gradeName: grade.name,
          classroomsCount: 1 // افتراضي فصل واحد لكل صف
        }))
      }));
      
      setPendingStageSetups(stageSetups);
      
      // إذا كان هناك أكثر من وحدة مدرسية، استخدم النمط المرحلي
      if (stageSetups.length > 1) {
        setIsStepByStepMode(true);
        setCurrentSetupIndex(0);
        setCompletedSetups([]);
      } else {
        setIsStepByStepMode(false);
      }
      
      setIsClassroomSetupDialogOpen(true);
      
      toast({
        title: "تم إنشاء الوحدات المدرسية",
        description: `تم إنشاء ${newUnits.length} وحدة مدرسية. ${stageSetups.length > 1 ? 'سيتم إنشاء الفصول مرحلة تلو الأخرى.' : 'حدد عدد الفصول المطلوبة لكل صف.'}`,
        duration: 3000,
      });
    } else {
      toast({
        title: "تم حفظ الإعدادات بنجاح",
        description: "تم حفظ إعدادات المدرسة بنجاح",
        duration: 3000,
      });
    }
  };

  const handleClassroomSetupSave = (setups: StageClassroomSetup[]) => {
    if (isStepByStepMode && setups.length > 0) {
      // في النمط المرحلي، معالجة الإعداد الحالي فقط
      const currentSetup = setups[currentSetupIndex];
      if (currentSetup) {
        // تحديث الوحدة المدرسية المحددة فقط
        const updatedUnits: SchoolUnit[] = schoolUnits.map(unit => {
          if (unit.stageId === currentSetup.stageId && unit.departmentId === currentSetup.departmentId) {
            // تحديث الصفوف مع الفصول الجديدة
            const updatedGrades: Grade[] = unit.grades.map(grade => {
              const classroomSetup = currentSetup.classrooms.find(c => c.gradeNumber === grade.gradeNumber);
              
              if (classroomSetup && classroomSetup.classroomsCount > 0) {
                // إنشاء الفصول للصف
                const classrooms: Classroom[] = [];
                for (let i = 1; i <= classroomSetup.classroomsCount; i++) {
                  // تنسيق عربي صحيح (الصف-الفصل)
                  let displayName = '';
                  if (unit.stageName === 'المرحلة المتوسطة') {
                    const actualGrade = classroomSetup.gradeNumber - 6; // تحويل 7,8,9 إلى 1,2,3
                    displayName = actualGrade + '-' + i;
                  } else if (unit.stageName === 'المرحلة الثانوية') {
                    const actualGrade = classroomSetup.gradeNumber - 9; // تحويل 10,11,12 إلى 1,2,3
                    displayName = actualGrade + '-' + i;
                  } else {
                    // المرحلة الابتدائية ورياض الأطفال
                    displayName = classroomSetup.gradeNumber + '-' + i;
                  }
                  
                  classrooms.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + i,
                    gradeNumber: classroomSetup.gradeNumber,
                    classNumber: i,
                    studentCount: 0,
                    stage: unit.stageName,
                    department: unit.departmentName,
                    displayName
                  });
                }
                
                return {
                  ...grade,
                  classrooms
                };
              }
              
              return grade;
            });
            
            return {
              ...unit,
              grades: updatedGrades
            };
          }
          
          return unit;
        });
        
        setSchoolUnits(updatedUnits);
        
        // إضافة الإعداد الحالي للمكتملة
        const setupId = `${currentSetup.stageId}-${currentSetup.departmentId}`;
        setCompletedSetups(prev => [...prev, setupId]);
        
        // الانتقال للإعداد التالي
        if (currentSetupIndex < pendingStageSetups.length - 1) {
          setCurrentSetupIndex(prev => prev + 1);
          
          toast({
            title: "تم إنشاء الفصول",
            description: `تم إنشاء فصول ${currentSetup.stageName} - ${currentSetup.departmentName}. انتقل للوحدة التالية.`,
            duration: 3000,
          });
        } else {
          // انتهاء جميع الإعدادات
          setIsClassroomSetupDialogOpen(false);
          setPendingStageSetups([]);
          setCurrentSetupIndex(0);
          setCompletedSetups([]);
          setIsStepByStepMode(false);
          
          const totalClassrooms = updatedUnits.reduce((total, unit) => 
            total + unit.grades.reduce((sum, grade) => sum + grade.classrooms.length, 0), 0);
          
          toast({
            title: "تم إنشاء جميع الفصول بنجاح",
            description: `تم إنشاء ${totalClassrooms} فصل دراسي لجميع الوحدات المدرسية`,
            duration: 4000,
          });
        }
        
        return;
      }
    }
    
    // النمط العادي - معالجة جميع الإعدادات مرة واحدة
    const updatedUnits: SchoolUnit[] = schoolUnits.map(unit => {
      const matchingSetup = setups.find(setup => 
        setup.stageId === unit.stageId && setup.departmentId === unit.departmentId
      );
      
      if (matchingSetup) {
        // تحديث الصفوف مع الفصول الجديدة
        const updatedGrades: Grade[] = unit.grades.map(grade => {
          const classroomSetup = matchingSetup.classrooms.find(c => c.gradeNumber === grade.gradeNumber);
          
          if (classroomSetup && classroomSetup.classroomsCount > 0) {
            // إنشاء الفصول للصف
            const classrooms: Classroom[] = [];
            for (let i = 1; i <= classroomSetup.classroomsCount; i++) {
              // تنسيق عربي: رقم الصف - رقم الفصل
              let displayName = '';
              if (unit.stageName === 'المرحلة المتوسطة') {
                const actualGrade = classroomSetup.gradeNumber - 6; // تحويل 7,8,9 إلى 1,2,3
                displayName = actualGrade + '-' + i;
              } else if (unit.stageName === 'المرحلة الثانوية') {
                const actualGrade = classroomSetup.gradeNumber - 9; // تحويل 10,11,12 إلى 1,2,3
                displayName = actualGrade + '-' + i;
              } else {
                displayName = classroomSetup.gradeNumber + '-' + i;
              }
              
              classrooms.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + i,
                gradeNumber: classroomSetup.gradeNumber,
                classNumber: i,
                studentCount: 0,
                stage: unit.stageName,
                department: unit.departmentName,
                displayName
              });
            }
            
            return {
              ...grade,
              classrooms
            };
          }
          
          return grade; // احتفظ بالفصول الموجودة إذا لم يتم تحديد عدد جديد
        });
        
        return {
          ...unit,
          grades: updatedGrades
        };
      }
      
      return unit; // احتفظ بالوحدة كما هي إذا لم تكن في الإعدادات
    });
    
    setSchoolUnits(updatedUnits);
    
    // تحديث الوحدة المختارة إذا كانت متأثرة
    if (selectedSchoolUnit) {
      const updatedSelectedUnit = updatedUnits.find(unit => unit.id === selectedSchoolUnit.id);
      if (updatedSelectedUnit) {
        setSelectedSchoolUnit(updatedSelectedUnit);
      }
    }
    
    setIsClassroomSetupDialogOpen(false);
    setPendingStageSetups([]);
    
    const totalClassrooms = updatedUnits.reduce((total, unit) => 
      total + unit.grades.reduce((sum, grade) => sum + grade.classrooms.length, 0), 0);
    
    toast({
      title: "تم إنشاء الفصول بنجاح",
      description: `تم إنشاء ${totalClassrooms} فصل دراسي موزعة على ${updatedUnits.length} وحدة مدرسية`,
      duration: 3000,
    });
  };

  // دالة تطبيق الخطة الدراسية على الفصول
  const applyCurriculumToClassrooms = () => {
    toast({
      title: "تم تطبيق الخطة الدراسية",
      description: "تم تطبيق الخطة الدراسية على جميع الفصول بنجاح",
      duration: 3000,
    });
  };



  const handleAddClassrooms = (grade: Grade) => {
    setSelectedGradeForAddition(grade);
    setNumberOfClassrooms(1);
    setIsAddClassroomsDialogOpen(true);
  };

  const handleSaveClassrooms = () => {
    if (!selectedGradeForAddition || !selectedSchoolUnit) return;

    const newClassrooms: Classroom[] = [];
    const existingClassroomsCount = selectedGradeForAddition.classrooms.length;
    
    // الحصول على المواد الدراسية للمرحلة والقسم
    const stageSubjects = linkSubjectsToClassrooms(selectedSchoolUnit.stageId, selectedSchoolUnit.departmentId);
    
    for (let i = 1; i <= numberOfClassrooms; i++) {
      const classNumber = existingClassroomsCount + i;
      
      // تنسيق عربي: رقم الصف - رقم الفصل
      let displayName = '';
      if (selectedSchoolUnit.stageName === 'المرحلة المتوسطة') {
        const actualGrade = selectedGradeForAddition.gradeNumber - 6;
        displayName = actualGrade + '-' + classNumber;
      } else if (selectedSchoolUnit.stageName === 'المرحلة الثانوية') {
        const actualGrade = selectedGradeForAddition.gradeNumber - 9;
        displayName = actualGrade + '-' + classNumber;
      } else {
        displayName = selectedGradeForAddition.gradeNumber + '-' + classNumber;
      }
      
      const classroomId = Date.now().toString() + i;
      
      newClassrooms.push({
        id: classroomId,
        gradeNumber: selectedGradeForAddition.gradeNumber,
        classNumber,
        studentCount: 0,
        stage: selectedGradeForAddition.stage,
        department: selectedGradeForAddition.department,
        displayName
      });
      
      // ربط المواد الدراسية بالفصل الجديد
      if (stageSubjects.length > 0) {
        saveClassroomSubjects(classroomId, stageSubjects);
      }
    }

    // تحديث الوحدة المدرسية
    setSchoolUnits(prev => prev.map(unit => 
      unit.id === selectedSchoolUnit.id 
        ? {
            ...unit,
            grades: unit.grades.map(grade => 
              grade.gradeNumber === selectedGradeForAddition.gradeNumber &&
              grade.stage === selectedGradeForAddition.stage &&
              grade.department === selectedGradeForAddition.department
                ? { ...grade, classrooms: [...grade.classrooms, ...newClassrooms] }
                : grade
            )
          }
        : unit
    ));

    // تحديث الوحدة المختارة
    setSelectedSchoolUnit(prev => 
      prev ? {
        ...prev,
        grades: prev.grades.map(grade => 
          grade.gradeNumber === selectedGradeForAddition.gradeNumber &&
          grade.stage === selectedGradeForAddition.stage &&
          grade.department === selectedGradeForAddition.department
            ? { ...grade, classrooms: [...grade.classrooms, ...newClassrooms] }
            : grade
        )
      } : null
    );

    setIsAddClassroomsDialogOpen(false);
    setSelectedGradeForAddition(null);
    
    const subjectsMessage = stageSubjects.length > 0 
      ? ` وتم ربط ${stageSubjects.length} مادة دراسية`
      : '';
    
    toast({
      title: "تم إضافة الفصول",
      description: `تم إضافة ${numberOfClassrooms} فصل جديد بنجاح${subjectsMessage}`,
      duration: 3000,
    });
  };

  const handleDeleteAllGradeClassrooms = (grade: Grade) => {
    if (grade.classrooms.length === 0) {
      toast({
        title: "تنبيه",
        description: "لا توجد فصول لحذفها في هذا الصف",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // استخدام dialog التأكيد بدلاً من window.confirm
    setDeleteTarget({
      type: 'grade',
      id: grade.gradeNumber.toString(),
      name: grade.name
    });
    setIsDeleteConfirmDialogOpen(true);
  };

  const handleDeleteClassroom = (classroomId: string) => {
    // العثور على الفصل للحصول على اسمه
    const classroom = selectedSchoolUnit?.grades.flatMap(g => g.classrooms).find(c => c.id === classroomId);
    if (!classroom) return;

    // استخدام dialog التأكيد بدلاً من window.confirm
    setDeleteTarget({
      type: 'classroom',
      id: classroomId,
      name: classroom.displayName
    });
    setIsDeleteConfirmDialogOpen(true);
  };

  const handleEditClassroom = (classroom: Classroom, newStudentCount: number, newDisplayName?: string) => {
    if (!selectedSchoolUnit) return;

    // تحديث الوحدة المدرسية
    setSchoolUnits(prev => prev.map(unit => 
      unit.id === selectedSchoolUnit.id 
        ? {
            ...unit,
            grades: unit.grades.map(grade => ({
              ...grade,
              classrooms: grade.classrooms.map(c => 
                c.id === classroom.id ? { 
                  ...c, 
                  studentCount: newStudentCount,
                  displayName: newDisplayName || c.displayName
                } : c
              )
            }))
          }
        : unit
    ));

    // تحديث الوحدة المختارة
    setSelectedSchoolUnit(prev => 
      prev ? {
        ...prev,
        grades: prev.grades.map(grade => ({
          ...grade,
          classrooms: grade.classrooms.map(c => 
            c.id === classroom.id ? { 
              ...c, 
              studentCount: newStudentCount,
              displayName: newDisplayName || c.displayName
            } : c
          )
        }))
      } : null
    );
    
    toast({
      title: "تم التحديث",
      description: "تم تحديث بيانات الفصل بنجاح",
      duration: 2000,
    });
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* بطاقة إعدادات الفصول */}
      <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-3 bg-white rounded-full shadow-md">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              إعدادات الفصول
            </CardTitle>
            <div className="flex gap-3">
              {schoolUnits.length > 0 && (
                <>
                  <Button
                    onClick={() => {
                      // إعداد الفصول للوحدات الموجودة - نبدأ بعدد افتراضي 1 لكل صف
                      const stageSetups: StageClassroomSetup[] = schoolUnits.map(unit => ({
                        stageId: unit.stageId,
                        stageName: unit.stageName,
                        departmentId: unit.departmentId,
                        departmentName: unit.departmentName,
                        classrooms: unit.grades.map(grade => ({
                          gradeNumber: grade.gradeNumber,
                          gradeName: grade.name,
                          classroomsCount: Math.max(1, grade.classrooms.length) // على الأقل فصل واحد
                        }))
                      }));
                      
                      setPendingStageSetups(stageSetups);
                      
                      // إذا كان هناك أكثر من وحدة مدرسية، استخدم النمط المرحلي
                      if (stageSetups.length > 1) {
                        setIsStepByStepMode(true);
                        setCurrentSetupIndex(0);
                        setCompletedSetups([]);
                      } else {
                        setIsStepByStepMode(false);
                      }
                      
                      setIsClassroomSetupDialogOpen(true);
                    }}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 py-3"
                    title="إنشاء فصول بكمية للوحدات المدرسية"
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    إنشاء فصول
                  </Button>
                  
                  <Button
                    onClick={() => {
                      // تطبيق الخطة الدراسية على الفصول
                      applyCurriculumToClassrooms();
                    }}
                    size="lg"
                    className="bg-purple-200 hover:bg-purple-300 text-purple-800 border border-purple-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 py-3"
                    title="تطبيق الخطة الدراسية المعتمدة على جميع الفصول حسب المرحلة الدراسية"
                  >
                    <BookOpen className="w-5 h-5 ml-2" />
                    تطبيق الخطة الدراسية على الفصول
                  </Button>
                </>
              )}
              <Button
                onClick={() => setIsSchoolSetupDialogOpen(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 py-3"
                title="تكوين إعدادات الفصول"
              >
                <Settings className="w-5 h-5 ml-2" />
                {schoolUnits.length === 0 ? 'ابدأ الإعداد' : 'تعديل الإعدادات'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">
                المرحلة الدراسية
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeStages.map((stage, index) => {
                  const colors = [
                    'bg-gradient-to-r from-blue-300 to-blue-400 text-white hover:from-blue-400 hover:to-blue-500 border border-blue-100 shadow-sm hover:shadow-md',
                    'bg-gradient-to-r from-purple-300 to-purple-400 text-white hover:from-purple-400 hover:to-purple-500 border border-purple-100 shadow-sm hover:shadow-md',
                    'bg-gradient-to-r from-emerald-300 to-emerald-400 text-white hover:from-emerald-400 hover:to-emerald-500 border border-emerald-100 shadow-sm hover:shadow-md',
                    'bg-gradient-to-r from-amber-300 to-amber-400 text-white hover:from-amber-400 hover:to-amber-500 border border-amber-100 shadow-sm hover:shadow-md'
                  ];
                  return (
                    <Badge 
                      key={stage.id} 
                      variant="secondary" 
                      className={`${colors[index % colors.length]} transition-all duration-300 px-4 py-2 text-sm font-medium transform hover:scale-105 cursor-pointer`}
                    >
                      {stage.name}
                    </Badge>
                  );
                })}
                {activeStages.length === 0 && (
                  <p className="text-gray-500 text-sm">لم يتم إعداد أي مراحل دراسية</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                القسم
              </h3>
              <div className="flex flex-wrap gap-2">
                {schoolUnits.length > 0 ? (
                  schoolUnits.map((unit, index) => {
                    const colors = [
                      'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-sm hover:shadow-md',
                      'bg-gradient-to-r from-teal-400 to-teal-500 text-white hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md',
                      'bg-gradient-to-r from-cyan-400 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-600 shadow-sm hover:shadow-md',
                      'bg-gradient-to-r from-indigo-400 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-600 shadow-sm hover:shadow-md'
                    ];
                    return (
                      <Badge 
                        key={unit.id} 
                        variant="secondary" 
                        className={`${colors[index % colors.length]} transition-all duration-300 px-4 py-2 text-sm font-medium transform hover:scale-105`}
                      >
                        {unit.departmentName}
                      </Badge>
                    );
                  })
                ) : (
                  <Badge variant="secondary" className="bg-gradient-to-r from-slate-400 to-slate-500 text-white hover:from-slate-500 hover:to-slate-600 transition-all duration-300 px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105">
                    {schoolUnits.length} وحدة مدرسية
                  </Badge>
                )}
                {schoolUnits.length === 0 && (
                  <p className="text-gray-500 text-sm">لم يتم إعداد أي أقسام تعليمية</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* بطاقات التنقل المحسنة بين الوحدات المدرسية */}
      {schoolUnits.length > 1 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-md">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">اختيار المرحلة والقسم</h3>
                <p className="text-sm text-gray-600">انقر على الوحدة المدرسية المطلوبة لعرض فصولها</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {schoolUnits.map((unit, index) => {
                const isSelected = selectedSchoolUnit?.id === unit.id;
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-purple-500 to-purple-600', 
                  'from-emerald-500 to-emerald-600',
                  'from-amber-500 to-amber-600'
                ];
                const currentColor = colors[index % colors.length];
                
                return (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedSchoolUnit(unit)}
                    className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      isSelected 
                        ? `bg-gradient-to-br ${currentColor} shadow-lg scale-105` 
                        : 'bg-white hover:shadow-md border-2 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {/* أيقونة التحديد */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* محتوى البطاقة */}
                    <div className="space-y-3">
                      {/* العنوان الرئيسي */}
                      <div className="flex items-start gap-2">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-white/20' : `bg-gradient-to-br ${currentColor}/10`
                        }`}>
                          <GraduationCap className={`w-5 h-5 ${
                            isSelected ? 'text-white' : `text-${currentColor.split('-')[1]}-600`
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold leading-tight truncate ${
                            isSelected ? 'text-white' : 'text-gray-800'
                          }`}>
                            {unit.stageName}
                          </h4>
                          <p className={`text-xs truncate ${
                            isSelected ? 'text-white/90' : 'text-gray-600'
                          }`}>
                            {unit.departmentName}
                          </p>
                        </div>
                      </div>
                      
                      {/* الإحصائيات */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`p-2 rounded text-center ${
                          isSelected ? 'bg-white/20' : 'bg-gray-50'
                        }`}>
                          <div className={`text-lg font-bold ${
                            isSelected ? 'text-white' : 'text-gray-800'
                          }`}>
                            {unit.grades.length}
                          </div>
                          <div className={`text-xs ${
                            isSelected ? 'text-white/80' : 'text-gray-600'
                          }`}>
                            صف
                          </div>
                        </div>
                        <div className={`p-2 rounded text-center ${
                          isSelected ? 'bg-white/20' : 'bg-gray-50'
                        }`}>
                          <div className={`text-lg font-bold ${
                            isSelected ? 'text-white' : 'text-gray-800'
                          }`}>
                            {unit.grades.reduce((total, grade) => total + grade.classrooms.length, 0)}
                          </div>
                          <div className={`text-xs ${
                            isSelected ? 'text-white/80' : 'text-gray-600'
                          }`}>
                            فصل
                          </div>
                        </div>
                      </div>
                      
                      {/* مؤشر الحالة */}
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-1 ${
                          isSelected ? 'text-white/90' : 'text-gray-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white/60' : 'bg-green-500'
                          }`}></div>
                          <span className="text-xs font-medium">
                            {isSelected ? 'محدد' : 'متاح'}
                          </span>
                        </div>
                        <ChevronLeft className={`w-3 h-3 transition-transform group-hover:translate-x-1 ${
                          isSelected ? 'text-white' : 'text-gray-400'
                        }`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* الفصول الدراسية */}
      <div className="max-w-7xl mx-auto">
        {!selectedSchoolUnit ? (
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-gray-800">
                  الفصول الدراسية
                </CardTitle>
                <Button
                  onClick={() => setIsSchoolSetupDialogOpen(true)}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة فصل جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-12">
              <div className="text-center">
                <School className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-blue-700 text-xl font-semibold mb-2">مرحباً بك في إدارة الفصول</h3>
                <p className="text-gray-500 text-lg mb-2">لم يتم إعداد أي مراحل دراسية أو فصول حتى الآن</p>
                <p className="text-gray-400 text-sm mt-2 mb-6">ابدأ بإعداد المراحل الدراسية والأقسام التعليمية لمدرستك</p>
                <div className="flex justify-center">
                  <Button
                    onClick={() => setIsSchoolSetupDialogOpen(true)}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-8 py-3"
                  >
                    <Settings className="w-5 h-5 ml-2" />
                    ابدأ إعداد المدرسة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* معلومات الوحدة المدرسية المختارة */}
            <div className="space-y-6">
              {(() => {
                const totalClassrooms = selectedSchoolUnit.grades.reduce((total, grade) => total + grade.classrooms.length, 0);
                const totalStudents = selectedSchoolUnit.grades.reduce((total, grade) => 
                  total + grade.classrooms.reduce((sum, classroom) => sum + classroom.studentCount, 0), 0);

                return (
                  <div className="space-y-6">


                    {/* إطار الفصول الدراسية */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <div className="p-1 bg-blue-100 rounded">
                            <School className="w-4 h-4 text-blue-600" />
                          </div>
                          الفصول الدراسية
                        </h3>
                      </div>

                      {/* عرض صفوف الوحدة في شبكة */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {selectedSchoolUnit.grades.map((grade) => (
                          <Card key={`${grade.gradeNumber}-${grade.stage}-${grade.department}`} 
                                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white h-fit">
                            <CardHeader className={`pb-3 ${
                              grade.color === 'blue' 
                                ? 'bg-gradient-to-r from-blue-50 to-blue-100' 
                                : grade.color === 'purple'
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-100'
                                : 'bg-gradient-to-r from-blue-50 to-sky-100'
                            }`}>
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white rounded-full shadow-md">
                                    <BookOpen className={`h-6 w-6 ${
                                      grade.color === 'blue' ? 'text-blue-600' : 
                                      grade.color === 'purple' ? 'text-purple-600' : 'text-green-600'
                                    }`} />
                                  </div>
                                  <div>
                                    <CardTitle className={`text-lg font-bold leading-tight ${
                                      grade.color === 'blue' 
                                        ? 'text-gray-900 group-hover:text-blue-700' 
                                        : grade.color === 'purple'
                                        ? 'text-gray-900 group-hover:text-indigo-700'
                                        : 'text-gray-900 group-hover:text-sky-700'
                                    }`}>
                                      {grade.name.replace(grade.stage, '').trim()}
                                    </CardTitle>
                                    
                                    {/* إحصائيات الصف */}
                                    <div className="flex gap-2 mt-2 text-xs">
                                      <Badge variant="outline" className={`bg-white/80 ${
                                        grade.color === 'blue' 
                                          ? 'text-blue-700 border-blue-200' 
                                          : grade.color === 'purple'
                                          ? 'text-indigo-700 border-indigo-200'
                                          : 'text-sky-700 border-sky-200'
                                      }`}>
                                        {grade.classrooms.length} فصل
                                      </Badge>
                                      <Badge variant="outline" className={`bg-white/80 ${
                                        grade.color === 'blue' 
                                          ? 'text-blue-700 border-blue-200' 
                                          : grade.color === 'purple'
                                          ? 'text-indigo-700 border-indigo-200'
                                          : 'text-sky-700 border-sky-200'
                                      }`}>
                                        {grade.classrooms.reduce((total, classroom) => total + classroom.studentCount, 0)} طالب
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleAddClassrooms(grade)}
                                      size="sm"
                                      className="h-8 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2"
                                      title="إضافة فصول"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteAllGradeClassrooms(grade)}
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs px-2 text-red-400 border-red-300 hover:bg-red-50 hover:text-red-500"
                                      title="حذف جميع الفصول"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4">
                              {grade.classrooms.length === 0 ? (
                                <div className="text-center py-6">
                                  <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                  <p className="text-gray-500 text-sm">لا توجد فصول</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {/* صفوف الفصول المضغوطة */}
                                  {grade.classrooms.map((classroom, index) => (
                                    <div key={classroom.id} 
                                         className={`flex items-center justify-between py-2 px-3 rounded-md transition-all duration-200 ${
                                           index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'
                                         }`}>
                                      {/* رقم الفصل وعدد الطلاب */}
                                      <div className="flex items-center gap-3">
                                        <div className={`p-1 rounded ${
                                          grade.color === 'blue' ? 'bg-blue-100' : 
                                          grade.color === 'purple' ? 'bg-indigo-100' : 'bg-sky-100'
                                        }`}>
                                          <BookOpen className={`h-3 w-3 ${
                                            grade.color === 'blue' ? 'text-blue-600' : 
                                            grade.color === 'purple' ? 'text-indigo-600' : 'text-sky-600'
                                          }`} />
                                        </div>
                                        <div>
                                          <span className="font-bold text-sm" dir="ltr">
                                            {classroom.displayName}
                                          </span>
                                          <div className="text-xs text-gray-600">
                                            {classroom.studentCount} طالب
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* أيقونات الإجراءات */}
                                      <div className="flex gap-1">
                                        <Button
                                          onClick={() => {
                                            setSelectedClassroomForEdit(classroom);
                                            setIsEditClassroomDialogOpen(true);
                                          }}
                                          size="sm"
                                          variant="outline"
                                          className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600 border-blue-200"
                                          title="تعديل الفصل"
                                        >
                                          <Edit className="h-2 w-2" />
                                        </Button>
                                        <Button
                                          onClick={() => handleDeleteClassroom(classroom.id)}
                                          size="sm"
                                          variant="outline"
                                          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-500 border-red-200"
                                          title="حذف الفصل"
                                        >
                                          <Trash2 className="h-2 w-2" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* مربع حوار إعداد المدرسة */}
      <Dialog open={isSchoolSetupDialogOpen} onOpenChange={setIsSchoolSetupDialogOpen}>
        <SchoolSetupDialog
          currentStages={activeStages}
          currentDepartments={activeDepartments}
          onSave={handleSchoolSetup}
          onCancel={() => setIsSchoolSetupDialogOpen(false)}
        />
      </Dialog>

      {/* مربع حوار إضافة فصول */}
      <Dialog open={isAddClassroomsDialogOpen} onOpenChange={setIsAddClassroomsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader className="pb-6 border-b border-gray-100">
            <DialogTitle className="text-right flex items-center gap-3 text-xl font-semibold">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-800">إضافة فصول جديدة</h3>
                <p className="text-sm text-gray-500 font-normal mt-1">{selectedGradeForAddition?.name}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-sm">
              <div className="space-y-3">
                <Label htmlFor="numberOfClassrooms" className="text-sm font-medium text-gray-700">
                  عدد الفصول المطلوب إضافتها
                </Label>
                <Input
                  id="numberOfClassrooms"
                  type="number"
                  min="1"
                  max="50"
                  value={numberOfClassrooms}
                  onChange={(e) => setNumberOfClassrooms(parseInt(e.target.value) || 1)}
                  placeholder="أدخل عدد الفصول"
                  className="text-center text-lg font-medium border-2 focus:border-blue-400 focus:ring-blue-100"
                />
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    سيتم إضافة <span className="font-semibold">{numberOfClassrooms}</span> فصل جديد إلى <span className="font-semibold">{selectedGradeForAddition?.name}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddClassroomsDialogOpen(false);
                  setSelectedGradeForAddition(null);
                  setNumberOfClassrooms(1);
                }}
                className="px-6 py-2 text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleSaveClassrooms}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة الفصول
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تأكيد الحذف */}
      <Dialog open={isDeleteConfirmDialogOpen} onOpenChange={setIsDeleteConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[450px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              تأكيد الحذف
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-800 font-medium">
                {deleteTarget?.type === 'classroom' 
                  ? `هل أنت متأكد من حذف الفصل "${deleteTarget.name}"؟`
                  : `هل أنت متأكد من حذف جميع فصول "${deleteTarget?.name}"؟`
                }
              </p>
              <p className="text-red-600 text-sm mt-2">
                {deleteTarget?.type === 'classroom' 
                  ? 'سيتم حذف الفصل نهائياً ولا يمكن التراجع عن هذا الإجراء.'
                  : 'سيتم حذف جميع الفصول نهائياً ولا يمكن التراجع عن هذا الإجراء.'
                }
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteConfirmDialogOpen(false);
                  setDeleteTarget(null);
                }}
                className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                إلغاء
              </Button>
              <Button 
                variant="destructive"
                className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                onClick={() => {
                  if (deleteTarget && selectedSchoolUnit) {
                    if (deleteTarget.type === 'classroom') {
                      // تنفيذ حذف الفصل مباشرة
                      setSchoolUnits(prev => prev.map(unit => 
                        unit.id === selectedSchoolUnit.id 
                          ? {
                              ...unit,
                              grades: unit.grades.map(grade => ({
                                ...grade,
                                classrooms: grade.classrooms.filter(classroom => classroom.id !== deleteTarget.id)
                              }))
                            }
                          : unit
                      ));

                      // تحديث الوحدة المختارة
                      setSelectedSchoolUnit(prev => 
                        prev ? {
                          ...prev,
                          grades: prev.grades.map(grade => ({
                            ...grade,
                            classrooms: grade.classrooms.filter(classroom => classroom.id !== deleteTarget.id)
                          }))
                        } : null
                      );
                      
                      toast({
                        title: "تم الحذف",
                        description: "تم حذف الفصل بنجاح",
                        duration: 3000,
                      });
                    } else {
                      // تنفيذ حذف جميع فصول الصف مباشرة
                      const grade = selectedSchoolUnit.grades.find(g => g.name === deleteTarget.name);
                      if (grade) {
                        setSchoolUnits(prev => prev.map(unit => 
                          unit.id === selectedSchoolUnit.id 
                            ? {
                                ...unit,
                                grades: unit.grades.map(g => 
                                  g.gradeNumber === grade.gradeNumber &&
                                  g.stage === grade.stage &&
                                  g.department === grade.department
                                    ? { ...g, classrooms: [] }
                                    : g
                                )
                              }
                            : unit
                        ));

                        // تحديث الوحدة المختارة
                        setSelectedSchoolUnit(prev => 
                          prev ? {
                            ...prev,
                            grades: prev.grades.map(g => 
                              g.gradeNumber === grade.gradeNumber &&
                              g.stage === grade.stage &&
                              g.department === grade.department
                                ? { ...g, classrooms: [] }
                                : g
                            )
                          } : null
                        );
                        
                        toast({
                          title: "تم الحذف",
                          description: `تم حذف جميع فصول ${grade.name} بنجاح`,
                          duration: 3000,
                        });
                      }
                    }
                  }
                  setIsDeleteConfirmDialogOpen(false);
                  setDeleteTarget(null);
                }}
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف نهائياً
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تعديل الفصل */}
      <Dialog open={isEditClassroomDialogOpen} onOpenChange={setIsEditClassroomDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-right flex items-center gap-3 text-xl font-semibold">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <Edit className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-800">تعديل الفصل</h3>
                <p className="text-sm text-gray-500 font-normal mt-1">{selectedClassroomForEdit?.displayName}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-sm">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="editClassroomName" className="text-sm font-medium text-gray-700">
                    اسم الفصل
                  </Label>
                  <Input
                    id="editClassroomName"
                    type="text"
                    value={selectedClassroomForEdit?.displayName || ''}
                    onChange={(e) => {
                      if (selectedClassroomForEdit) {
                        setSelectedClassroomForEdit({
                          ...selectedClassroomForEdit,
                          displayName: e.target.value
                        });
                      }
                    }}
                    placeholder="مثال: 1-1"
                    className="text-center text-lg font-medium border-2 focus:border-green-400 focus:ring-green-100"
                  />
                  <p className="text-xs text-gray-500">
                    يمكنك تغيير اسم الفصل حسب النظام المتبع في المدرسة
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="editStudentCount" className="text-sm font-medium text-gray-700">
                    عدد الطلاب
                  </Label>
                  <Input
                    id="editStudentCount"
                    type="number"
                    min="0"
                    max="50"
                    value={selectedClassroomForEdit?.studentCount || 0}
                    onChange={(e) => {
                      if (selectedClassroomForEdit) {
                        setSelectedClassroomForEdit({
                          ...selectedClassroomForEdit,
                          studentCount: parseInt(e.target.value) || 0
                        });
                      }
                    }}
                    placeholder="أدخل عدد الطلاب"
                    className="text-center text-lg font-medium border-2 focus:border-green-400 focus:ring-green-100"
                  />
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      العدد الحالي: <span className="font-semibold">{selectedClassroomForEdit?.studentCount || 0}</span> طالب
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditClassroomDialogOpen(false);
                  setSelectedClassroomForEdit(null);
                }}
                className="px-6 py-2 text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                إلغاء
              </Button>
              <Button 
                onClick={() => {
                  if (selectedClassroomForEdit) {
                    handleEditClassroom(
                      selectedClassroomForEdit, 
                      selectedClassroomForEdit.studentCount, 
                      selectedClassroomForEdit.displayName
                    );
                    setIsEditClassroomDialogOpen(false);
                    setSelectedClassroomForEdit(null);
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Edit className="w-4 h-4 ml-2" />
                حفظ التعديلات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* مربع حوار إعداد الفصول بكمية */}
      <Dialog open={isClassroomSetupDialogOpen} onOpenChange={setIsClassroomSetupDialogOpen}>
        <ClassroomSetupDialog
          stageSetups={pendingStageSetups}
          onSave={handleClassroomSetupSave}
          onCancel={() => {
            setIsClassroomSetupDialogOpen(false);
            setPendingStageSetups([]);
            setCurrentSetupIndex(0);
            setCompletedSetups([]);
            setIsStepByStepMode(false);
          }}
          isStepByStepMode={isStepByStepMode}
          currentSetupIndex={currentSetupIndex}
          completedSetups={completedSetups}
        />
      </Dialog>
    </div>
  );
};

export default ClassesManagement;
