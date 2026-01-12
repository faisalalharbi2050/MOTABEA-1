import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, AlertCircle } from 'lucide-react';
import { DutySettings, WEEK_DAYS, CustomWeek } from '../../types/dailyDuty';
import { useSchool } from '../../contexts/SchoolContext.jsx';

interface DutySettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: DutySettings) => void;
  initialSettings?: DutySettings;
}

const DutySettingsDialog: React.FC<DutySettingsDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings
}) => {
  const { schoolData } = useSchool();
  
  // جلب بيانات الإداريين من localStorage
  const getEducationalViceFromAdmins = () => {
    try {
      const adminsData = localStorage.getItem('administrators');
      if (adminsData) {
        const admins = JSON.parse(adminsData);
        const educationalVice = admins.find((admin: any) => 
          admin.position === 'وكيل' && 
          admin.viceAttributes?.includes('الشؤون التعليمية')
        );
        return educationalVice?.name || '';
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات الإداريين:', error);
    }
    return '';
  };

  const [settings, setSettings] = useState<Partial<DutySettings>>({
    weekDays: initialSettings?.weekDays || ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    weekCount: initialSettings?.weekCount || 18,
    useCustomWeeks: initialSettings?.useCustomWeeks || false,
    customWeeks: initialSettings?.customWeeks || [],
    firstWeekStartDate: initialSettings?.firstWeekStartDate || '',
    dutyGuardCount: initialSettings?.dutyGuardCount || 1,
    dutyGuardCountPerDay: initialSettings?.dutyGuardCountPerDay || {},
    educationalAffairsVice: initialSettings?.educationalAffairsVice || getEducationalViceFromAdmins(),
    principalName: initialSettings?.principalName || schoolData?.principalName || '',
    semester: initialSettings?.semester || schoolData?.semester || '',
    academicYear: initialSettings?.academicYear || schoolData?.academicYear || '',
    calendarType: initialSettings?.calendarType || 'hijri'
  });

  const [useCustomPerDay, setUseCustomPerDay] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        weekDays: initialSettings.weekDays,
        weekCount: initialSettings.weekCount,
        useCustomWeeks: initialSettings.useCustomWeeks,
        customWeeks: initialSettings.customWeeks,
        firstWeekStartDate: initialSettings.firstWeekStartDate,
        dutyGuardCount: initialSettings.dutyGuardCount,
        dutyGuardCountPerDay: initialSettings.dutyGuardCountPerDay || {},
        educationalAffairsVice: initialSettings.educationalAffairsVice,
        principalName: initialSettings.principalName,
        semester: initialSettings.semester || schoolData?.semester || '',
        academicYear: initialSettings.academicYear || schoolData?.academicYear || '',
        calendarType: initialSettings.calendarType || 'hijri'
      });
      // تفعيل الوضع المخصص إذا كان هناك قيم مخصصة
      setUseCustomPerDay(initialSettings.dutyGuardCountPerDay && Object.keys(initialSettings.dutyGuardCountPerDay).length > 0);
    } else {
      // جلب البيانات من صفحة بيانات المدرسة عند فتح النافذة لأول مرة
      setSettings(prev => ({
        ...prev,
        semester: schoolData?.semester || '',
        academicYear: schoolData?.academicYear || '',
        principalName: schoolData?.principalName || '',
        educationalAffairsVice: getEducationalViceFromAdmins()
      }));
    }
  }, [initialSettings, schoolData]);

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
    
    if (!settings.weekCount || settings.weekCount < 1 || settings.weekCount > 40) {
      alert('يرجى إدخال عدد الأسابيع بين 1 و 40');
      return;
    }
    
    if (!settings.firstWeekStartDate) {
      alert('يرجى تحديد تاريخ بداية الأسبوع الأول');
      return;
    }
    
    if (!settings.dutyGuardCount || settings.dutyGuardCount < 1 || settings.dutyGuardCount > 5) {
      alert('يرجى إدخال عدد المناوبين بين 1 و 5');
      return;
    }
    
    onSave(settings as DutySettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-6 py-5 flex justify-between items-center">
          <h2 className="text-xl font-bold">إعدادات المناوبة اليومية</h2>
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
                    <option value="الفصل الثالث">الفصل الثالث</option>
                  </select>
                  <p className="mt-1.5 text-xs text-gray-500">
                    يتم جلب القيمة من بيانات المدرسة ويمكن التعديل يدوياً
                  </p>
                </div>

                {/* العام الدراسي */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    العام الدراسي (هجري/ميلادي)
                  </label>
                  <input
                    type="text"
                    value={settings.academicYear || ''}
                    onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm"
                    placeholder="مثال: 1446 أو 2024/2025"
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
                <span className="font-bold">ملاحظة:</span> يتم جلب الأيام من بيانات المدرسة، يمكنك التعديل حسب الحاجة
              </p>
            </div>

            {/* القسم الثالث: إعدادات الأسابيع الدراسية */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-[#4f46e5] to-[#6366f1] rounded-full"></div>
                الأسابيع الدراسية والتواريخ
              </h3>
              
              <div className="space-y-4">
                {/* عدد الأسابيع الدراسية */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    عدد الأسابيع الدراسية (1-40)
                  </label>
                  <select
                    value={settings.weekCount || 18}
                    onChange={(e) => setSettings({ ...settings, weekCount: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm bg-white"
                  >
                    {Array.from({ length: 40 }, (_, i) => i + 1).map(week => (
                      <option key={week} value={week}>
                        {week} {week === 1 ? 'أسبوع' : week === 2 ? 'أسبوعان' : week <= 10 ? 'أسابيع' : 'أسبوع'}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-gray-500">
                    سيتم إنشاء جداول مناوبة للعدد المحدد من الأسابيع
                  </p>
                </div>

                {/* تاريخ بداية الأسبوع الأول */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    تاريخ بداية الأسبوع الأول
                  </label>
                  <input
                    type="date"
                    value={settings.firstWeekStartDate || ''}
                    onChange={(e) => setSettings({ ...settings, firstWeekStartDate: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm"
                  />
                  <div className="mt-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-800">
                        <span className="font-bold">مثال:</span> إذا حددت التاريخ 1447-6-3 واخترت 18 أسبوع، سيقوم البرنامج تلقائياً بإنشاء تواريخ {settings.calendarType === 'hijri' ? 'هجرية' : 'ميلادية'} لجميع الأيام في كل الأسابيع الـ 18
                      </p>
                    </div>
                  </div>
                </div>


              </div>
            </div>

            {/* القسم الرابع: تحديد عدد المناوبين */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-[#818cf8]">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-[#4f46e5] to-[#6366f1] rounded-full"></div>
                تحديد عدد المناوبين (1-5)
              </h3>
              <div className="space-y-4">
                {/* عدد المناوبين (عام لجميع الأيام) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    عدد المناوبين في اليوم الواحد
                  </label>
                  <select
                    value={settings.dutyGuardCount || 2}
                    onChange={(e) => setSettings({ ...settings, dutyGuardCount: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm bg-white"
                  >
                    <option value={1}>مناوب واحد</option>
                    <option value={2}>مناوبان اثنان</option>
                    <option value={3}>ثلاثة مناوبين</option>
                    <option value={4}>أربعة مناوبين</option>
                    <option value={5}>خمسة مناوبين</option>
                  </select>
                  <p className="mt-1.5 text-xs text-gray-500">
                    هذا العدد سيطبق على جميع أيام الأسبوع ما لم تفعّل التخصيص أدناه
                  </p>
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
                  <p className="mt-1.5 text-xs text-gray-500">
                    يتم جلب القيمة من صفحة الإداريين ويمكن التعديل يدوياً
                  </p>
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
                    يتم جلب القيمة من بيانات المدرسة ويمكن التعديل يدوياً - سيظهر في الطباعة فقط
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

export default DutySettingsDialog;
