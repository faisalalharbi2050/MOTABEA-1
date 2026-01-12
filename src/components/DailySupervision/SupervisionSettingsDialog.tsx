import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { SupervisionSettings, WEEK_DAYS, BreakTiming } from '../../types/dailySupervision';
import { useSchool } from '../../contexts/SchoolContext';

interface SupervisionSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: SupervisionSettings) => void;
  initialSettings?: SupervisionSettings;
}

const SupervisionSettingsDialog: React.FC<SupervisionSettingsDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings
}) => {
  const { schoolData } = useSchool();
  
  const [settings, setSettings] = useState<Partial<SupervisionSettings>>({
    weekDays: initialSettings?.weekDays || ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    breakCount: initialSettings?.breakCount || 1,
    breakTimings: initialSettings?.breakTimings || [{ breakNumber: 1, afterLesson: 2 }],
    supervisorCount: initialSettings?.supervisorCount || 8,
    supervisorCountPerDay: initialSettings?.supervisorCountPerDay || {},
    educationalAffairsVice: initialSettings?.educationalAffairsVice || '',
    principalName: initialSettings?.principalName || '',
    semester: initialSettings?.semester || schoolData?.semester || '',
    academicYear: initialSettings?.academicYear || schoolData?.academicYear || ''
  });

  const [useCustomPerDay, setUseCustomPerDay] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        weekDays: initialSettings.weekDays,
        breakCount: initialSettings.breakCount,
        breakTimings: initialSettings.breakTimings,
        supervisorCount: initialSettings.supervisorCount,
        supervisorCountPerDay: initialSettings.supervisorCountPerDay || {},
        educationalAffairsVice: initialSettings.educationalAffairsVice,
        principalName: initialSettings.principalName,
        semester: initialSettings.semester || schoolData?.semester || '',
        academicYear: initialSettings.academicYear || schoolData?.academicYear || ''
      });
      // تفعيل الوضع المخصص إذا كان هناك قيم مخصصة
      setUseCustomPerDay(initialSettings.supervisorCountPerDay && Object.keys(initialSettings.supervisorCountPerDay).length > 0);
    } else {
      // جلب البيانات من صفحة بيانات المدرسة عند فتح النافذة لأول مرة
      setSettings(prev => ({
        ...prev,
        semester: schoolData?.semester || '',
        academicYear: schoolData?.academicYear || ''
      }));
    }
  }, [initialSettings, schoolData]);

  // تحديث عدد الفسح
  const handleBreakCountChange = (count: number) => {
    const newTimings: BreakTiming[] = [];
    
    for (let i = 1; i <= count; i++) {
      const existingTiming = settings.breakTimings?.find(t => t.breakNumber === i);
      newTimings.push(existingTiming || { breakNumber: i, afterLesson: 2 });
    }
    
    setSettings({
      ...settings,
      breakCount: count,
      breakTimings: newTimings
    });
  };

  // تحديث موعد فسحة معينة
  const handleBreakTimingChange = (breakNumber: number, afterLesson: number) => {
    const newTimings = settings.breakTimings?.map(timing =>
      timing.breakNumber === breakNumber ? { ...timing, afterLesson } : timing
    ) || [];
    
    setSettings({
      ...settings,
      breakTimings: newTimings
    });
  };

  // تحديث أيام الأسبوع
  const handleDayToggle = (dayValue: string) => {
    const currentDays = settings.weekDays || [];
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter(d => d !== dayValue)
      : [...currentDays, dayValue];
    
    setSettings({
      ...settings,
      weekDays: newDays
    });
  };

  const handleSave = () => {
    if (!settings.weekDays?.length) {
      alert('يرجى اختيار يوم واحد على الأقل');
      return;
    }
    
    if (!settings.supervisorCount || settings.supervisorCount < 1) {
      alert('يرجى إدخال عدد المشرفين');
      return;
    }
    
    onSave(settings as SupervisionSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-6 py-5 flex justify-between items-center">
          <h2 className="text-xl font-bold">إعدادات الإشراف اليومي</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {/* القسم الأول: البيانات الأساسية */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-[#4f46e5] to-[#6366f1] rounded-full"></div>
                البيانات الأساسية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* الفصل الدراسي */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الفصل الدراسي
                  </label>
                  <select
                    value={settings.semester || ''}
                    onChange={(e) => setSettings({ ...settings, semester: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm bg-white"
                  >
                    <option value="">اختر الفصل الدراسي</option>
                    <option value="الفصل الأول">الفصل الأول</option>
                    <option value="الفصل الثاني">الفصل الثاني</option>
                  </select>
                  <p className="mt-1.5 text-xs text-gray-500">
                    يتم جلب القيمة من بيانات المدرسة ويمكن التعديل يدوياً
                  </p>
                </div>

                {/* العام الدراسي */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    العام الدراسي (هجري أو ميلادي)
                  </label>
                  <input
                    type="text"
                    value={settings.academicYear || ''}
                    onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm"
                    placeholder="مثال: 1446"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    يتم جلب القيمة من بيانات المدرسة ويمكن التعديل يدوياً
                  </p>
                </div>
              </div>
            </div>

            {/* القسم الثاني: أيام الأسبوع */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-[#818cf8]">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-[#4f46e5] to-[#6366f1] rounded-full"></div>
                أيام الأسبوع
              </h3>
              <div className="flex flex-wrap gap-2.5 justify-center">
                {WEEK_DAYS.map(day => (
                  <label
                    key={day.value}
                    className="flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-md min-w-[100px]"
                    style={{
                      borderColor: settings.weekDays?.includes(day.value) ? '#4f46e5' : '#e5e7eb',
                      backgroundColor: settings.weekDays?.includes(day.value) ? '#eef2ff' : 'white'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={settings.weekDays?.includes(day.value) || false}
                      onChange={() => handleDayToggle(day.value)}
                      className="w-4 h-4 text-[#4f46e5] rounded focus:ring-[#4f46e5]"
                    />
                    <span className="mr-2 font-bold text-gray-700 text-sm">{day.nameAr}</span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-600 bg-white rounded-lg p-2.5 border border-gray-300">
                <span className="font-bold">ملاحظة:</span> الأيام من الأحد إلى الخميس مفعلة افتراضياً، يمكنك التعديل حسب الحاجة
              </p>
            </div>

            {/* القسم الثالث: إعدادات الفسح */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-[#4f46e5] to-[#6366f1] rounded-full"></div>
                إعدادات الفسح
              </h3>
              
              {/* عدد الفسح */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  عدد الفسح
                </label>
                <select
                  value={settings.breakCount || 1}
                  onChange={(e) => handleBreakCountChange(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm bg-white"
                >
                  <option value={1}>فسحة واحدة</option>
                  <option value={2}>فسحتان</option>
                  <option value={3}>ثلاث فسح</option>
                  <option value={4}>أربع فسح</option>
                </select>
              </div>

              {/* مواعيد الفسح */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  مواعيد الفسح
                </label>
                <div className="space-y-2.5">
                  {settings.breakTimings?.map(timing => (
                    <div key={timing.breakNumber} className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-300 hover:border-[#6366f1] transition-all">
                      <span className="text-gray-800 font-bold min-w-[90px] text-sm">
                        الفسحة {timing.breakNumber}:
                      </span>
                      <select
                        value={timing.afterLesson}
                        onChange={(e) => handleBreakTimingChange(timing.breakNumber, parseInt(e.target.value))}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all bg-white text-sm"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(lesson => (
                          <option key={lesson} value={lesson}>
                            بعد الحصة {lesson}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* القسم الرابع: تحديد عدد المشرفين */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-[#818cf8]">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-[#4f46e5] to-[#6366f1] rounded-full"></div>
                تحديد عدد المشرفين
              </h3>
              <div className="space-y-4">
                {/* عدد المشرفين (عام لجميع الأيام) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    عدد المشرفين (يطبق على جميع الأيام)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.supervisorCount || ''}
                    onChange={(e) => setSettings({ ...settings, supervisorCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm"
                    placeholder="أدخل عدد المشرفين"
                    disabled={useCustomPerDay}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    هذا العدد سيطبق على جميع أيام الأسبوع ما لم تفعّل التخصيص أدناه
                  </p>
                </div>

                {/* خيار التخصيص لكل يوم */}
                <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomPerDay}
                      onChange={(e) => {
                        setUseCustomPerDay(e.target.checked);
                        if (!e.target.checked) {
                          // مسح القيم المخصصة عند إلغاء التفعيل
                          setSettings({ ...settings, supervisorCountPerDay: {} });
                        }
                      }}
                      className="w-5 h-5 text-[#4f46e5] rounded focus:ring-[#4f46e5]"
                    />
                    <div>
                      <span className="font-bold text-gray-800 text-sm">تخصيص عدد مختلف لكل يوم</span>
                      <p className="text-xs text-gray-600 mt-1">
                        فعّل هذا الخيار لتحديد عدد مشرفين مختلف لكل يوم من أيام الأسبوع
                      </p>
                    </div>
                  </label>
                </div>

                {/* عدد المشرفين لكل يوم */}
                {useCustomPerDay && (
                  <div className="bg-white rounded-lg p-4 border-2 border-[#4f46e5]">
                    <h4 className="text-sm font-bold text-gray-800 mb-3">تحديد عدد المشرفين لكل يوم:</h4>
                    <div className="space-y-3">
                      {settings.weekDays?.map(day => {
                        const dayInfo = WEEK_DAYS.find(d => d.value === day);
                        if (!dayInfo) return null;
                        
                        return (
                          <div key={day} className="flex items-center gap-3">
                            <label className="text-sm font-bold text-gray-700 min-w-[80px]">
                              {dayInfo.nameAr}:
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={settings.supervisorCountPerDay?.[day] || settings.supervisorCount || ''}
                              onChange={(e) => {
                                const newCount = parseInt(e.target.value) || 0;
                                setSettings({
                                  ...settings,
                                  supervisorCountPerDay: {
                                    ...settings.supervisorCountPerDay,
                                    [day]: newCount
                                  }
                                });
                              }}
                              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm"
                              placeholder="عدد المشرفين"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-xs text-gray-600 bg-blue-50 rounded p-2 border border-blue-200">
                      <span className="font-bold">مثال:</span> يمكنك جعل الأحد والخميس 8 مشرفين وباقي الأيام 6 مشرفين
                    </p>
                  </div>
                )}

                {/* عدد المشرفين */}
                <div className="hidden">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    عدد المشرفين
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.supervisorCount || ''}
                    onChange={(e) => setSettings({ ...settings, supervisorCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm"
                    placeholder="أدخل عدد المشرفين"
                  />
                </div>

                {/* وكيل الشؤون التعليمية */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    وكيل الشؤون التعليمية
                  </label>
                  <input
                    type="text"
                    value={settings.educationalAffairsVice || ''}
                    onChange={(e) => setSettings({ ...settings, educationalAffairsVice: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm"
                    placeholder="أدخل اسم وكيل الشؤون التعليمية"
                  />
                </div>

                {/* مدير المدرسة */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    مدير المدرسة
                  </label>
                  <input
                    type="text"
                    value={settings.principalName || ''}
                    onChange={(e) => setSettings({ ...settings, principalName: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm"
                    placeholder="أدخل اسم مدير المدرسة"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    سيتم عرض هذه البيانات عند الطباعة فقط
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 px-6 py-4 rounded-b-xl flex gap-3 justify-start border-t-2 border-gray-300">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white rounded-lg transition-all font-bold flex items-center gap-2 shadow-lg hover:shadow-xl text-sm"
          >
            <Save className="w-4 h-4" />
            حفظ الإعدادات
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-bold text-sm"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupervisionSettingsDialog;
