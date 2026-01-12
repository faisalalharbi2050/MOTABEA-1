import React, { useState } from 'react';
import { X, CheckCircle, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import { DutyActivation, DUTY_ACTIONS } from '../../types/dailyDuty';

interface DutyActivationTrackingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activations: DutyActivation[]) => void;
}

interface DutyGuard {
  id: string;
  name: string;
  day: string;
}

// تحويل التاريخ الميلادي إلى هجري (mock - يمكن استخدام مكتبة خارجية)
const convertToHijri = (gregorianDate: string): string => {
  // هذه دالة تقريبية - في الإنتاج يجب استخدام مكتبة موثوقة
  const date = new Date(gregorianDate);
  const hijriYear = Math.floor((date.getFullYear() - 622) * 1.030684);
  const hijriMonth = Math.floor(Math.random() * 12) + 1;
  const hijriDay = date.getDate();
  return `${hijriDay}/${hijriMonth}/${hijriYear}`;
};

const DutyActivationTrackingDialog: React.FC<DutyActivationTrackingDialogProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [trackingMode, setTrackingMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isOfficialHoliday, setIsOfficialHoliday] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dutyGuards, setDutyGuards] = useState<DutyGuard[]>([]);
  const [activations, setActivations] = useState<{ [key: string]: any }>({});
  const [reportSubmission, setReportSubmission] = useState<{ [key: string]: 'submitted' | 'not-submitted' | null }>({});

  // بيانات تجريبية للمناوبين
  const mockDutyGuards: DutyGuard[] = [
    { id: '1', name: 'عبدالله أحمد', day: 'sunday' },
    { id: '2', name: 'محمد خالد', day: 'sunday' },
    { id: '3', name: 'سعيد علي', day: 'monday' },
    { id: '4', name: 'فهد يوسف', day: 'monday' },
    { id: '5', name: 'عمر سالم', day: 'tuesday' }
  ];

  const loadDutyGuards = () => {
    if (trackingMode === 'daily' && selectedDay && selectedDate) {
      // التحقق من أن اليوم إجازة رسمية في جدول المناوبة
      // هنا يجب الاستعلام من جدول المناوبة الفعلي
      const isHolidayInTable = false; // TODO: التحقق من جدول المناوبة
      
      if (isHolidayInTable) {
        setIsOfficialHoliday(true);
        return;
      }
      
      const filtered = mockDutyGuards.filter(g => g.day === selectedDay);
      setDutyGuards(filtered);
      
      // تهيئة الحالات
      const initialActivations: { [key: string]: any } = {};
      const initialReportSubmission: { [key: string]: 'submitted' | 'not-submitted' | null } = {};
      filtered.forEach(guard => {
        initialActivations[guard.id] = {
          action: 'present',
          actionTime: '',
          notes: ''
        };
        initialReportSubmission[guard.id] = null;
      });
      setActivations(initialActivations);
      setReportSubmission(initialReportSubmission);
    } else if (trackingMode === 'weekly' && startDate && endDate) {
      setDutyGuards(mockDutyGuards);
      
      const initialActivations: { [key: string]: any } = {};
      const initialReportSubmission: { [key: string]: 'submitted' | 'not-submitted' | null } = {};
      mockDutyGuards.forEach(guard => {
        initialActivations[guard.id] = {
          action: 'present',
          actionTime: '',
          notes: ''
        };
        initialReportSubmission[guard.id] = null;
      });
      setActivations(initialActivations);
      setReportSubmission(initialReportSubmission);
    }
  };

  const handleBack = () => {
    setDutyGuards([]);
    setActivations({});
    setReportSubmission({});
  };

  const updateActivation = (guardId: string, field: string, value: any) => {
    setActivations(prev => ({
      ...prev,
      [guardId]: {
        ...prev[guardId],
        [field]: value
      }
    }));
  };

  const toggleReportSubmission = (guardId: string, status: 'submitted' | 'not-submitted') => {
    setReportSubmission(prev => ({
      ...prev,
      [guardId]: prev[guardId] === status ? null : status
    }));
  };

  const handleSave = () => {
    const activationsList: DutyActivation[] = dutyGuards.map(guard => ({
      userId: '',
      tableId: '',
      dutyGuardId: guard.id,
      dutyGuardName: guard.name,
      day: guard.day,
      date: trackingMode === 'daily' ? selectedDate : startDate,
      action: activations[guard.id]?.action || 'present',
      actionTime: activations[guard.id]?.actionTime,
      notes: activations[guard.id]?.notes
    }));

    onSave(activationsList);
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      present: '#10b981',
      absent: '#ef4444',
      excused: '#f59e0b',
      withdrawn: '#fb923c'
    };
    return colors[action] || '#6b7280';
  };

  const getDayNameArabic = (day: string): string => {
    const dayNames: { [key: string]: string } = {
      sunday: 'الأحد',
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      saturday: 'السبت'
    };
    return dayNames[day] || day;
  };

  // التحقق من توافق اليوم والتاريخ
  const checkDateDayMatch = () => {
    if (!selectedDay || !selectedDate) return true;
    
    const date = new Date(selectedDate);
    const dayIndex = date.getDay();
    const dayMap: { [key: number]: string } = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    
    return dayMap[dayIndex] === selectedDay;
  };

  const isDateDayMismatch = selectedDay && selectedDate && !checkDateDayMatch();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">متابعة تفعيل المناوبة</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* نوع المتابعة */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
              <Calendar className="w-5 h-5 text-[#4f46e5]" />
              نوع المتابعة
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setTrackingMode('daily');
                  setDutyGuards([]);
                  setIsOfficialHoliday(false);
                }}
                className="p-4 border-2 rounded-lg transition-all"
                style={{
                  borderColor: trackingMode === 'daily' ? '#4f46e5' : '#e5e7eb',
                  backgroundColor: trackingMode === 'daily' ? '#eef2ff' : 'white'
                }}
              >
                <div className="text-center">
                  <div className="font-bold text-lg" style={{ color: trackingMode === 'daily' ? '#4f46e5' : '#374151' }}>
                    المتابعة اليومية
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setTrackingMode('weekly');
                  setDutyGuards([]);
                  setIsOfficialHoliday(false);
                }}
                className="p-4 border-2 rounded-lg transition-all"
                style={{
                  borderColor: trackingMode === 'weekly' ? '#4f46e5' : '#e5e7eb',
                  backgroundColor: trackingMode === 'weekly' ? '#eef2ff' : 'white'
                }}
              >
                <div className="text-center">
                  <div className="font-bold text-lg" style={{ color: trackingMode === 'weekly' ? '#4f46e5' : '#374151' }}>
                    المتابعة الأسبوعية
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* خيارات المتابعة اليومية */}
          {trackingMode === 'daily' && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* اليوم */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">اليوم</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => {
                      setSelectedDay(e.target.value);
                      setIsOfficialHoliday(false);
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] focus:ring-opacity-20 transition-all text-sm"
                  >
                    <option value="">اختر اليوم</option>
                    <option value="sunday">الأحد</option>
                    <option value="monday">الاثنين</option>
                    <option value="tuesday">الثلاثاء</option>
                    <option value="wednesday">الأربعاء</option>
                    <option value="thursday">الخميس</option>
                  </select>
                </div>
                
                {/* التاريخ */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">التاريخ</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setIsOfficialHoliday(false);
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] focus:ring-opacity-20 transition-all text-sm"
                  />
                </div>
              </div>

              {/* تحذير عدم التوافق بين اليوم والتاريخ */}
              {isDateDayMismatch && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-800">
                        التاريخ المحدد لا يوافق اليوم المختار
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        يرجى التأكد من التوافق بين اليوم والتاريخ أو تغيير أحدهما
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* تحذير إجازة رسمية */}
              {isOfficialHoliday && (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-orange-800">
                        هذا اليوم إجازة رسمية في جدول المناوبة
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        اختر يوماً وتاريخاً آخر أو عد للجدول للتغيير إلى يوم عمل
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* خيارات المتابعة الأسبوعية */}
          {trackingMode === 'weekly' && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ البداية</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] focus:ring-opacity-20 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ النهاية</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] focus:ring-opacity-20 transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* زر تحميل المناوبين */}
          {!isOfficialHoliday && (
            <button
              onClick={loadDutyGuards}
              disabled={
                (trackingMode === 'daily' && (!selectedDay || !selectedDate || isDateDayMismatch)) ||
                (trackingMode === 'weekly' && (!startDate || !endDate))
              }
              className="w-full px-4 py-2.5 rounded-lg font-bold text-base transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              style={{
                backgroundColor: ((trackingMode === 'daily' && (!selectedDay || !selectedDate || isDateDayMismatch)) ||
                  (trackingMode === 'weekly' && (!startDate || !endDate))) ? '#d1d5db' : '#4f46e5',
                color: 'white'
              }}
            >
              <Calendar className="w-5 h-5" />
              تحميل المناوبين
            </button>
          )}

          {/* جدول المناوبين */}
          {dutyGuards.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
              {/* رأس القسم */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    المناوبون ({dutyGuards.length})
                  </h3>
                </div>
              </div>

              {/* الجدول */}
              <div className="overflow-x-auto rounded-lg border border-gray-300">
                <table className="w-full bg-white text-sm" style={{ direction: 'rtl' }}>
                  <thead>
                    <tr className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1]">
                      <th className="px-4 py-2.5 text-center text-white font-bold border-l border-white border-opacity-20">
                        اليوم
                      </th>
                      <th className="px-4 py-2.5 text-center text-white font-bold border-l border-white border-opacity-20">
                        التاريخ
                      </th>
                      <th className="px-4 py-2.5 text-right text-white font-bold border-l border-white border-opacity-20">
                        المناوب
                      </th>
                      <th className="px-4 py-2.5 text-right text-white font-bold border-l border-white border-opacity-20">
                        التفعيل
                      </th>
                      <th className="px-4 py-2.5 text-right text-white font-bold border-l border-white border-opacity-20">
                        ملاحظات
                      </th>
                      <th className="px-4 py-2.5 text-center text-white font-bold">
                        تسليم تقرير المناوبة
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dutyGuards.map((guard, index) => {
                      const hijriDate = selectedDate ? convertToHijri(selectedDate) : '';
                      const gregorianDate = selectedDate;
                      
                      return (
                        <tr 
                          key={guard.id} 
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          {/* اليوم - يظهر مرة واحدة فقط ومحاذاة في المنتصف */}
                          {index === 0 && (
                            <td 
                              rowSpan={dutyGuards.length}
                              className="px-4 py-2 text-sm font-bold text-gray-800 border-l border-gray-200 align-middle text-center"
                            >
                              {getDayNameArabic(selectedDay)}
                            </td>
                          )}
                          
                          {/* التاريخ - يظهر مرة واحدة فقط ومحاذاة في المنتصف */}
                          {index === 0 && (
                            <td 
                              rowSpan={dutyGuards.length}
                              className="px-4 py-2 border-l border-gray-200 align-middle"
                            >
                              <div className="text-center space-y-1">
                                <div className="text-sm font-bold text-gray-800">
                                  {hijriDate}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {gregorianDate}
                                </div>
                              </div>
                            </td>
                          )}
                          
                          {/* المناوب */}
                          <td className="px-4 py-2 text-sm font-bold text-gray-800 border-l border-gray-200">
                            {guard.name}
                          </td>
                          
                          {/* التفعيل */}
                          <td className="px-4 py-2 border-l border-gray-200">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {['present', 'absent', 'excused', 'withdrawn'].map(actionValue => {
                                const action = Object.values(DUTY_ACTIONS).find(a => a.value === actionValue);
                                if (!action) return null;
                                return (
                                  <button
                                    key={action.value}
                                    onClick={() => updateActivation(guard.id, 'action', action.value)}
                                    className="px-2.5 py-1 rounded text-xs font-bold transition-all border"
                                    style={{
                                      borderColor: activations[guard.id]?.action === action.value 
                                        ? getActionColor(action.value) 
                                        : '#e5e7eb',
                                      backgroundColor: activations[guard.id]?.action === action.value 
                                        ? getActionColor(action.value) 
                                        : 'white',
                                      color: activations[guard.id]?.action === action.value 
                                        ? 'white' 
                                        : getActionColor(action.value)
                                    }}
                                  >
                                    {action.label}
                                  </button>
                                );
                              })}
                            </div>
                            
                            {/* وقت الانسحاب */}
                            {activations[guard.id]?.action === 'withdrawn' && (
                              <div className="mt-2">
                                <input
                                  type="time"
                                  value={activations[guard.id]?.actionTime || ''}
                                  onChange={(e) => updateActivation(guard.id, 'actionTime', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                  placeholder="الوقت"
                                />
                              </div>
                            )}
                          </td>
                          
                          {/* ملاحظات */}
                          <td className="px-4 py-2 border-l border-gray-200">
                            <input
                              type="text"
                              value={activations[guard.id]?.notes || ''}
                              onChange={(e) => updateActivation(guard.id, 'notes', e.target.value)}
                              placeholder="أضف ملاحظات"
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]"
                            />
                          </td>
                          
                          {/* تسليم تقرير المناوبة */}
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-center gap-3">
                              {/* تم */}
                              <label className="flex items-center gap-1.5 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={reportSubmission[guard.id] === 'submitted'}
                                  onChange={() => toggleReportSubmission(guard.id, 'submitted')}
                                  className="w-4 h-4 rounded border-2 border-gray-300 cursor-pointer"
                                  style={{
                                    accentColor: reportSubmission[guard.id] === 'submitted' ? '#4f46e5' : undefined
                                  }}
                                />
                                <span className="text-xs font-medium text-gray-700 group-hover:text-[#4f46e5] transition-colors">
                                  تم
                                </span>
                              </label>

                              {/* لم يتم */}
                              <label className="flex items-center gap-1.5 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={reportSubmission[guard.id] === 'not-submitted'}
                                  onChange={() => toggleReportSubmission(guard.id, 'not-submitted')}
                                  className="w-4 h-4 rounded border-2 border-gray-300 cursor-pointer"
                                  style={{
                                    accentColor: reportSubmission[guard.id] === 'not-submitted' ? '#ef4444' : undefined
                                  }}
                                />
                                <span className="text-xs font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                                  لم يتم
                                </span>
                              </label>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 justify-start" style={{ direction: 'rtl' }}>
          {dutyGuards.length > 0 && (
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white rounded-lg hover:from-[#4338ca] hover:to-[#4f46e5] transition-all font-bold text-sm flex items-center gap-2 shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              حفظ المتابعة
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-bold text-sm"
          >
            إلغاء
          </button>
          {dutyGuards.length > 0 && (
            <button
              onClick={handleBack}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-bold text-sm flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              رجوع
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DutyActivationTrackingDialog;
