import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { ArrowRight, Clock, Check, Save, School } from 'lucide-react';
import '@/styles/unified-header-styles.css';

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

interface Classroom {
  id: string;
  name: string;
  gradeId: string;
}

const ClassroomScheduleSetup: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const classroomId = searchParams.get('classroomId');
  const classroomName = searchParams.get('classroomName');
  const stageId = searchParams.get('stageId');

  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const basePeriods = ['الحصة 1', 'الحصة 2', 'الحصة 3', 'الحصة 4', 'الحصة 5', 'الحصة 6', 'الحصة 7'];
  
  // حالة عدد الحصص لكل يوم
  const [dailyPeriods, setDailyPeriods] = useState<{[day: string]: number}>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // حالة الفصول الأخرى وتطبيق الإعدادات عليها
  const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);
  const [applyToAll, setApplyToAll] = useState(false);

  // إنشاء جدول افتراضي
  const createDefaultSchedule = () => {
    const defaultSchedule: {[day: string]: number} = {};
    days.forEach(day => {
      defaultSchedule[day] = 6; // 6 حصص افتراضية
    });
    return defaultSchedule;
  };

  useEffect(() => {
    // تحميل جميع الفصول من نفس المرحلة
    if (stageId) {
      const classrooms = JSON.parse(localStorage.getItem(`classrooms_stage_${stageId}`) || '[]');
      // استبعاد الفصل الحالي
      const otherClassrooms = classrooms.filter((c: Classroom) => c.id !== classroomId);
      setAllClassrooms(otherClassrooms);
    }
  }, [stageId, classroomId]);

  useEffect(() => {
    // تحميل الجدول المحفوظ أو إنشاء جدول افتراضي
    const savedSchedule = localStorage.getItem(`periods_${classroomId}`);
    if (savedSchedule) {
      const parsed = JSON.parse(savedSchedule);
      setDailyPeriods(parsed.dailyPeriods || createDefaultSchedule());
    } else {
      setDailyPeriods(createDefaultSchedule());
    }
  }, [classroomId]);

  const updateDayPeriods = (day: string, periods: number) => {
    setDailyPeriods(prev => ({
      ...prev,
      [day]: periods
    }));
  };

  const handleSave = async () => {
    if (!classroomId) return;
    
    setIsSaving(true);
    try {
      const scheduleData = {
        dailyPeriods,
        hasEighthPeriod: false // دائماً false لأننا حذفنا خيار الحصة الثامنة
      };
      
      // حفظ للفصل الحالي
      localStorage.setItem(`periods_${classroomId}`, JSON.stringify(scheduleData));
      
      // حفظ للفصول المحددة إذا تم اختيارها
      const classroomsToApply = applyToAll 
        ? allClassrooms.map(c => c.id)
        : selectedClassrooms;
      
      classroomsToApply.forEach(id => {
        localStorage.setItem(`periods_${id}`, JSON.stringify(scheduleData));
      });
      
      let successMessage = `تم حفظ جدول الحصص للفصل ${classroomName}`;
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
        description: "فشل في حفظ جدول الحصص",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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

  const maxPeriods = 7; // الحد الأقصى 7 حصص
  const allPeriods = basePeriods; // فقط 7 حصص

  return (
    <div className="classroom-schedule-container" dir="rtl">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        
        {/* رأس الصفحة */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}>
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">تخصيص عدد الحصص اليومية</h1>
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
              حدد عدد الحصص لكل يوم من أيام الأسبوع
            </CardTitle>
          </CardHeader>

          <CardContent className="pb-6 pt-6">
            {/* جدول تحديد عدد الحصص */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #818cf8 0%, #a5b4fc 100%)' }}>
                    <th className="border border-gray-300 p-2 text-center font-bold text-white text-sm">
                      اليوم
                    </th>
                    {allPeriods.map((period, index) => (
                      <th key={period} className="border border-gray-300 p-1.5 text-center font-medium text-white text-xs">
                        {period}
                      </th>
                    ))}
                    <th className="border border-gray-300 p-4 text-center font-bold text-white">
                      المجموع
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-2 text-center font-bold bg-gray-50 text-gray-700 text-xs">
                        {day}
                      </td>
                      {allPeriods.map((period, periodIndex) => {
                        const isActive = periodIndex < (dailyPeriods[day] || 0);
                        return (
                          <td key={period} className="border border-gray-300 p-1 text-center">
                            <div 
                              className={`w-6 h-6 mx-auto rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                isActive 
                                  ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-600 shadow-lg shadow-green-500/30 scale-105' 
                                  : 'bg-white border-gray-300 hover:bg-green-50 hover:border-green-400 hover:scale-105'
                              }`}
                              onClick={() => {
                                // إذا كانت الحصة نشطة، نلغيها (نجعل العدد = periodIndex)
                                // إذا كانت غير نشطة، نفعلها (نجعل العدد = periodIndex + 1)
                                const newCount = isActive ? periodIndex : periodIndex + 1;
                                updateDayPeriods(day, newCount);
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
                            const count = dailyPeriods[day] || 0;
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
                    const total = Object.values(dailyPeriods).reduce((sum, count) => sum + (count || 0), 0);
                    if (total === 0) return '0 حصص';
                    if (total === 1) return 'حصة واحدة';
                    if (total === 2) return 'حصتان';
                    if (total >= 3 && total <= 10) return `${total} حصص`;
                    return `${total} حصة`;
                  })()}
                </strong>
              </div>
            </div>

            {/* قسم تطبيق الإعدادات على فصول أخرى */}
            {allClassrooms.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <School className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 mb-1 arabic-text">تطبيق على فصول أخرى</h4>
                    <p className="text-xs text-slate-600 arabic-text">يمكنك تطبيق نفس إعداد الحصص على فصول متعددة</p>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="apply-all"
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
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-8 arabic-text"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
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
      </div>
    </div>
  );
};

export default ClassroomScheduleSetup;
