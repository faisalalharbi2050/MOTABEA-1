import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle, Users, Calendar, FileText } from 'lucide-react';
import { DutySettings, DutyTable, DutyDayData } from '../../types/dailyDuty';
import { smartDutyDistribution, generateDates, calculateDistributionStats } from '../../utils/dutyGenerator';
import DailyDutyReport from './DailyDutyReport';

interface CreateDutyTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (table: DutyTable) => void;
  settings: DutySettings;
  existingTables?: DutyTable[];
}

const CreateDutyTableDialog: React.FC<CreateDutyTableDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  settings,
  existingTables = []
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [generatedDays, setGeneratedDays] = useState<DutyDayData[]>([]);
  const [stats, setStats] = useState<any>({});
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [officialHolidays, setOfficialHolidays] = useState<Set<string>>(new Set());
  const [holidaySelectionWeek, setHolidaySelectionWeek] = useState(1);
  const [allGeneratedDays, setAllGeneratedDays] = useState<DutyDayData[]>([]);
  const [editingGuards, setEditingGuards] = useState<{[key: string]: boolean}>({});
  const [selectedGuards, setSelectedGuards] = useState<{[key: string]: string[]}>({});
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedDayForReport, setSelectedDayForReport] = useState<DutyDayData | null>(null);

  // جلب بيانات المعلمين والإداريين من localStorage
  const getTeachers = () => {
    try {
      const teachersData = localStorage.getItem('teachers');
      return teachersData ? JSON.parse(teachersData) : [];
    } catch {
      return [];
    }
  };

  const getAdministrators = () => {
    try {
      const adminsData = localStorage.getItem('administrators');
      return adminsData ? JSON.parse(adminsData) : [];
    } catch {
      return [];
    }
  };

  // جلب قائمة جميع الموظفين (إداريين + معلمين)
  const getAllStaff = () => {
    const teachers = getTeachers();
    const administrators = getAdministrators();
    return [...administrators.map((a: any) => ({ id: a.id, name: a.name, type: 'إداري' })), 
            ...teachers.map((t: any) => ({ id: t.id, name: t.name, type: 'معلم' }))];
  };

  const handleGenerate = async () => {
    if (allGeneratedDays.length === 0) {
      // المرحلة الأولى: توليد جميع الأيام لعرضها في واجهة الإجازات
      const allDays = generateDates(
        settings.firstWeekStartDate,
        settings.weekCount,
        settings.weekDays,
        settings.calendarType
      );
      setAllGeneratedDays(allDays);
      return;
    }

    // المرحلة الثانية: توليد الجدول النهائي بعد استثناء الإجازات
    setIsGenerating(true);

    try {
      // 1. استثناء الإجازات الرسمية
      const filteredDays = allGeneratedDays.filter(day => !officialHolidays.has(day.date));

      // 2. جلب البيانات
      const teachers = getTeachers();
      const administrators = getAdministrators();

      // 3. تطبيق الخوارزمية الذكية
      const distributedDays = smartDutyDistribution(
        settings,
        filteredDays,
        administrators,
        teachers
      );

      setGeneratedDays(distributedDays);

      // 4. حساب الإحصائيات
      const distributionStats = calculateDistributionStats(distributedDays);
      setStats(distributionStats);

      // 5. التحقق من التعارضات
      const detectedConflicts: string[] = [];
      distributedDays.forEach(day => {
        const emptyGuards = day.dutyGuards.filter(g => !g.name);
        if (emptyGuards.length > 0) {
          detectedConflicts.push(`يوم ${day.day} (${day.date}): ${emptyGuards.length} مناوب غير محدد`);
        }
      });
      setConflicts(detectedConflicts);

    } catch (error) {
      console.error('خطأ في توليد الجدول:', error);
      alert('حدث خطأ أثناء توليد الجدول');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleHoliday = (date: string) => {
    const newHolidays = new Set(officialHolidays);
    if (newHolidays.has(date)) {
      newHolidays.delete(date);
    } else {
      newHolidays.add(date);
    }
    setOfficialHolidays(newHolidays);
  };

  const toggleWeekHoliday = (weekNumber: number) => {
    const weekDays = allGeneratedDays.filter((_, index) => {
      const week = Math.floor(index / settings.weekDays.length) + 1;
      return week === weekNumber;
    });
    
    const allSelected = weekDays.every(day => officialHolidays.has(day.date));
    const newHolidays = new Set(officialHolidays);
    
    weekDays.forEach(day => {
      if (allSelected) {
        newHolidays.delete(day.date);
      } else {
        newHolidays.add(day.date);
      }
    });
    
    setOfficialHolidays(newHolidays);
  };

  const handleGuardChange = (dayDate: string, guardIndex: number, staffId: string) => {
    const allStaff = getAllStaff();
    const selectedStaff = allStaff.find((s: any) => s.id === staffId);
    
    if (!selectedStaff) return;
    
    setGeneratedDays(prevDays => 
      prevDays.map(day => {
        if (day.date === dayDate) {
          const newGuards = [...day.dutyGuards];
          newGuards[guardIndex] = {
            id: selectedStaff.id,
            name: selectedStaff.name,
            type: selectedStaff.type,
            notes: ''
          };
          return { ...day, dutyGuards: newGuards };
        }
        return day;
      })
    );
    
    // إغلاق القائمة بعد الاختيار
    setEditingGuards(prev => ({...prev, [`${dayDate}-${guardIndex}`]: false}));
  };

  const handleOpenReport = (day: DutyDayData) => {
    setSelectedDayForReport(day);
    setShowReportDialog(true);
  };

  const handleSave = () => {
    if (generatedDays.length === 0) {
      alert('يرجى توليد الجدول أولاً');
      return;
    }

    // حساب تاريخ البداية والنهاية للأسبوع المحدد
    const weekDays = generatedDays.filter((_, index) => {
      const weekNumber = Math.floor(index / settings.weekDays.length) + 1;
      return weekNumber === selectedWeek;
    });

    if (weekDays.length === 0) {
      alert('لا توجد بيانات للأسبوع المحدد');
      return;
    }

    const table: DutyTable = {
      id: Date.now().toString(),
      userId: 'admin',
      weekNumber: selectedWeek,
      startDate: weekDays[0].date,
      endDate: weekDays[weekDays.length - 1].date,
      dutyGuardCount: settings.dutyGuardCount,
      educationalAffairsVice: settings.educationalAffairsVice,
      principalName: settings.principalName,
      tableData: weekDays,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    onSave(table);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-6 py-5 flex justify-between items-center">
          <h2 className="text-xl font-bold">إنشاء جدول المناوبة</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {/* معلومات الإعدادات */}
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                معلومات الجدول
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">الفصل الدراسي:</span>
                  <span className="font-bold text-gray-800 mr-2">{settings.semester}</span>
                </div>
                <div>
                  <span className="text-gray-600">العام الدراسي:</span>
                  <span className="font-bold text-gray-800 mr-2">{settings.academicYear}</span>
                </div>
                <div>
                  <span className="text-gray-600">عدد الأسابيع:</span>
                  <span className="font-bold text-gray-800 mr-2">{settings.weekCount} أسبوع</span>
                </div>
                <div>
                  <span className="text-gray-600">أيام الأسبوع:</span>
                  <span className="font-bold text-gray-800 mr-2">{settings.weekDays.length} أيام</span>
                </div>
                <div>
                  <span className="text-gray-600">عدد المناوبين:</span>
                  <span className="font-bold text-gray-800 mr-2">{settings.dutyGuardCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">تاريخ البداية:</span>
                  <span className="font-bold text-gray-800 mr-2">
                    {generatedDays[0]?.hijriDate} ({generatedDays[0]?.gregorianDate})
                  </span>
                </div>
              </div>
            </div>

            {/* زر التوليد أو تحديد الإجازات */}
            {allGeneratedDays.length === 0 && generatedDays.length === 0 && (
              <div className="text-center py-8">
                <button
                  onClick={handleGenerate}
                  className="px-8 py-4 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white rounded-lg transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                >
                  المتابعة لتحديد الإجازات الرسمية
                </button>
                <p className="text-gray-600 text-sm mt-3">
                  سيتم توليد جميع الأيام أولاً ثم يمكنك استثناء أيام الإجازات
                </p>
              </div>
            )}

            {/* قسم تحديد الإجازات الرسمية */}
            {allGeneratedDays.length > 0 && generatedDays.length === 0 && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  <h3 className="font-bold text-gray-800 text-lg">تحديد أيام وتواريخ الإجازات الرسمية</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  اضغط على أي يوم لتحديده كإجازة رسمية. يمكنك أيضاً تحديد أسبوع كامل كإجازة.
                </p>

                {/* اختيار الأسبوع */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    اختر الأسبوع لعرض أيامه
                  </label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={holidaySelectionWeek}
                      onChange={(e) => setHolidaySelectionWeek(parseInt(e.target.value))}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] transition-all text-sm bg-white"
                    >
                      {Array.from({ length: settings.weekCount }, (_, i) => i + 1).map(week => {
                        const getWeekName = (num: number) => {
                          const names = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
                                        'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر', 'الثامن عشر', 'التاسع عشر', 'العشرون'];
                          if (num <= 20) return names[num - 1];
                          if (num <= 30) return `الـ ${num}`;
                          return `الـ ${num}`;
                        };
                        
                        return (
                          <option key={week} value={week}>
                            الأسبوع {getWeekName(week)}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      onClick={() => toggleWeekHoliday(holidaySelectionWeek)}
                      className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-sm whitespace-nowrap"
                    >
                      تحديد الأسبوع كإجازة
                    </button>
                  </div>
                </div>

                {/* جدول الأيام */}
                <div className="overflow-x-auto bg-white rounded-lg border-2 border-gray-300">
                  <table className="w-full text-sm">
                    <thead className="bg-[#818cf8] text-white">
                      <tr>
                        <th className="px-3 py-2 text-center">اليوم</th>
                        <th className="px-3 py-2 text-center">التاريخ الهجري</th>
                        <th className="px-3 py-2 text-center">التاريخ الميلادي</th>
                        <th className="px-3 py-2 text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allGeneratedDays
                        .filter((_, index) => {
                          const weekNumber = Math.floor(index / settings.weekDays.length) + 1;
                          return weekNumber === holidaySelectionWeek;
                        })
                        .map((day, index) => {
                          const isHoliday = officialHolidays.has(day.date);
                          return (
                            <tr 
                              key={index} 
                              onClick={() => toggleHoliday(day.date)}
                              className={`cursor-pointer hover:bg-gray-100 transition-colors ${
                                isHoliday ? 'bg-orange-100' : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                              }`}
                            >
                              <td className="px-3 py-2 text-center font-medium">{day.day}</td>
                              <td className="px-3 py-2 text-center">{day.hijriDate}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{day.gregorianDate}</td>
                              <td className="px-3 py-2 text-center">
                                {isHoliday ? (
                                  <span className="inline-block px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                                    إجازة رسمية
                                  </span>
                                ) : (
                                  <span className="inline-block px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                                    يوم دراسي
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* زر توليد الجدول بعد تحديد الإجازات */}
                <div className="mt-5 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    تم تحديد <span className="font-bold text-orange-600">{officialHolidays.size}</span> يوم كإجازة رسمية
                  </p>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all font-bold text-base shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        جاري توليد الجدول...
                      </span>
                    ) : (
                      'توليد جدول المناوبة'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* النتائج */}
            {generatedDays.length > 0 && (
              <>
                {/* التعارضات والتنبيهات */}
                {conflicts.length > 0 && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                    <div 
                      className="flex items-center gap-2 mb-2 cursor-pointer hover:opacity-80"
                      onClick={() => {
                        const detailsEl = document.getElementById('conflicts-details');
                        if (detailsEl) {
                          detailsEl.style.display = detailsEl.style.display === 'none' ? 'block' : 'none';
                        }
                      }}
                    >
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-bold text-yellow-800">تنبيهات ({conflicts.length}) - اضغط للاطلاع</h4>
                    </div>
                    <div id="conflicts-details" style={{ display: 'none' }}>
                      <div className="overflow-x-auto mt-3">
                        <table className="w-full text-sm border-collapse">
                          <thead className="bg-yellow-200">
                            <tr>
                              <th className="border border-yellow-300 px-3 py-2 text-center">الأسبوع</th>
                              <th className="border border-yellow-300 px-3 py-2 text-center">اليوم</th>
                              <th className="border border-yellow-300 px-3 py-2 text-center">التاريخ</th>
                              <th className="border border-yellow-300 px-3 py-2 text-center">المشكلة</th>
                            </tr>
                          </thead>
                          <tbody>
                            {conflicts.map((conflict, index) => {
                              const dayIndex = Math.floor(index / settings.weekDays.length);
                              const weekNumber = Math.floor(dayIndex / settings.weekDays.length) + 1;
                              const day = generatedDays[dayIndex];
                              
                              return (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                                  <td className="border border-yellow-300 px-3 py-2 text-center font-medium">
                                    الأسبوع {weekNumber === 1 ? 'الأول' : weekNumber === 2 ? 'الثاني' : weekNumber === 3 ? 'الثالث' : weekNumber}
                                  </td>
                                  <td className="border border-yellow-300 px-3 py-2 text-center">{day?.day}</td>
                                  <td className="border border-yellow-300 px-3 py-2 text-center text-xs">
                                    {day?.hijriDate}<br />
                                    <span className="text-gray-500">({day?.gregorianDate})</span>
                                  </td>
                                  <td className="border border-yellow-300 px-3 py-2 text-sm text-yellow-800">{conflict}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* الإحصائيات */}
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-green-800">إحصائيات التوزيع</h4>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    توزيع المناوبات بين الموظفين بشكل متوازن حسب عدد الحصص والأولوية
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(stats).slice(0, 6).map(([id, data]: [string, any]) => (
                      <div key={id} className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="text-sm text-gray-700 font-medium">{data.name}</div>
                        <div className="text-lg font-bold text-green-600">{data.count} يوم</div>
                      </div>
                    ))}
                  </div>
                  {Object.keys(stats).length > 6 && (
                    <p className="text-sm text-gray-600 mt-2">
                      و {Object.keys(stats).length - 6} موظف آخرين
                    </p>
                  )}
                </div>

                {/* اختيار الأسبوع */}
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    اختر الأسبوع المراد حفظه
                  </label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#818cf8] transition-all text-sm bg-white"
                  >
                    {Array.from({ length: settings.weekCount }, (_, i) => i + 1).map(week => {
                      const getWeekName = (num: number) => {
                        const names = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
                                      'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر', 'الثامن عشر', 'التاسع عشر', 'العشرون',
                                      'الحادي والعشرون', 'الثاني والعشرون', 'الثالث والعشرون', 'الرابع والعشرون', 'الخامس والعشرون', 'السادس والعشرون', 'السابع والعشرون', 'الثامن والعشرون', 'التاسع والعشرون', 'الثلاثون',
                                      'الحادي والثلاثون', 'الثاني والثلاثون', 'الثالث والثلاثون', 'الرابع والثلاثون', 'الخامس والثلاثون', 'السادس والثلاثون', 'السابع والثلاثون', 'الثامن والثلاثون', 'التاسع والثلاثون', 'الأربعون'];
                        return num <= 40 ? names[num - 1] : `الـ ${num}`;
                      };
                      
                      return (
                        <option key={week} value={week}>
                          الأسبوع {getWeekName(week)}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    يمكنك إنشاء جدول لكل أسبوع على حدة
                  </p>
                </div>

                {/* معاينة سريعة */}
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3">
                    معاينة سريعة للأسبوع {(() => {
                      const names = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
                                    'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر', 'الثامن عشر', 'التاسع عشر', 'العشرون',
                                    'الحادي والعشرون', 'الثاني والعشرون', 'الثالث والعشرون', 'الرابع والعشرون', 'الخامس والعشرون', 'السادس والعشرون', 'السابع والعشرون', 'الثامن والعشرون', 'التاسع والعشرون', 'الثلاثون',
                                    'الحادي والثلاثون', 'الثاني والثلاثون', 'الثالث والثلاثون', 'الرابع والثلاثون', 'الخامس والثلاثون', 'السادس والثلاثون', 'السابع والثلاثون', 'الثامن والثلاثون', 'التاسع والثلاثون', 'الأربعون'];
                      return selectedWeek <= 40 ? names[selectedWeek - 1] : `الـ ${selectedWeek}`;
                    })()}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#818cf8] text-white">
                        <tr>
                          <th className="px-3 py-2 text-center">اليوم</th>
                          <th className="px-3 py-2 text-center">التاريخ</th>
                          <th className="px-3 py-2 text-center">المناوبون</th>
                          <th className="px-3 py-2 text-center">التقرير اليومي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedDays
                          .filter((_, index) => {
                            const weekNumber = Math.floor(index / settings.weekDays.length) + 1;
                            return weekNumber === selectedWeek;
                          })
                          .map((day, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="px-3 py-2 text-center font-medium">{day.day}</td>
                              <td className="px-3 py-2 text-center text-xs">
                                <div className="font-medium">{day.hijriDate}</div>
                                <div className="text-gray-500">{day.gregorianDate}</div>
                              </td>
                              <td className="px-3 py-2">
                                {day.dutyGuards.map((guard, gIndex) => {
                                  const guardKey = `${day.date}-${gIndex}`;
                                  const isEditing = editingGuards[guardKey];
                                  const allStaff = getAllStaff();
                                  
                                  return (
                                    <div key={gIndex} className="text-xs mb-2 relative">
                                      {guard.name ? (
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{guard.name}</span>
                                          <span className="text-gray-500">({guard.type})</span>
                                          <button
                                            onClick={() => setEditingGuards(prev => ({...prev, [guardKey]: true}))}
                                            className="text-blue-600 hover:text-blue-800 underline"
                                          >
                                            تغيير
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setEditingGuards(prev => ({...prev, [guardKey]: true}))}
                                          className="text-orange-600 hover:text-orange-800 underline font-medium"
                                        >
                                          ⚠️ اضغط للاختيار يدوياً
                                        </button>
                                      )}
                                      
                                      {isEditing && (
                                        <div className="absolute z-10 mt-1 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-2 min-w-[200px]">
                                          <div className="max-h-48 overflow-y-auto">
                                            {allStaff.map((staff: any) => (
                                              <button
                                                key={staff.id}
                                                onClick={() => handleGuardChange(day.date, gIndex, staff.id)}
                                                className="w-full text-right px-3 py-2 hover:bg-blue-50 rounded text-xs border-b border-gray-200"
                                              >
                                                <div className="font-medium">{staff.name}</div>
                                                <div className="text-gray-500">{staff.type}</div>
                                              </button>
                                            ))}
                                          </div>
                                          <button
                                            onClick={() => setEditingGuards(prev => ({...prev, [guardKey]: false}))}
                                            className="w-full mt-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs"
                                          >
                                            إلغاء
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  onClick={() => handleOpenReport(day)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all text-xs font-bold shadow-sm hover:shadow-md"
                                  title="فتح/طباعة التقرير اليومي"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>التقرير</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        {generatedDays.length > 0 && (
          <div className="sticky bottom-0 bg-gray-100 px-6 py-4 rounded-b-xl flex gap-3 justify-start border-t-2 border-gray-300">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white rounded-lg transition-all font-bold flex items-center gap-2 shadow-lg hover:shadow-xl text-sm"
            >
              <Save className="w-4 h-4" />
              حفظ الجدول
            </button>
            <button
              onClick={() => setGeneratedDays([])}
              className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-bold text-sm"
            >
              إعادة التوليد
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-bold text-sm"
            >
              إلغاء
            </button>
          </div>
        )}
      </div>

      {/* نافذة التقرير اليومي */}
      {selectedDayForReport && (
        <DailyDutyReport
          isOpen={showReportDialog}
          onClose={() => {
            setShowReportDialog(false);
            setSelectedDayForReport(null);
          }}
          day={selectedDayForReport}
          settings={settings}
          showGuardNames={true}
        />
      )}
    </div>
  );
};

export default CreateDutyTableDialog;
