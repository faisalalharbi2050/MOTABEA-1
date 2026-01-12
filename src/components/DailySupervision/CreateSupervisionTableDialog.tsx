import React, { useState, useEffect } from 'react';
import { X, Copy, Save, ChevronDown, Wand2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { SupervisionTable, SupervisionDayData, SupervisorEntry, SupervisionSettings } from '../../types/dailySupervision';

interface CreateSupervisionTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (table: SupervisionTable) => void;
  settings: SupervisionSettings;
}

// نظام الإشعارات الاحترافي
interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />
  };

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] ${colors[type]} border-r-4 rounded-lg shadow-xl p-4 min-w-[300px] max-w-[500px] animate-slideDown`}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1">
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// مربع حوار تأكيد احترافي
interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150]" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scaleIn">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">تأكيد العملية</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white rounded-lg transition-all text-sm font-medium"
          >
            تأكيد
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

// قائمة المعلمين والإداريين (سيتم جلبها من قاعدة البيانات لاحقاً)
const mockTeachers = [
  { id: '1', name: 'أحمد محمد السعيد', role: 'معلم', isFree: true },
  { id: '2', name: 'محمد علي الأحمد', role: 'معلم', isFree: true },
  { id: '3', name: 'خالد عبدالله المحمد', role: 'معلم', isFree: false },
  { id: '4', name: 'عبدالرحمن سعد العمري', role: 'معلم', isFree: true },
  { id: '5', name: 'فهد محمد الشمري', role: 'إداري', isFree: true },
  { id: '6', name: 'سعد أحمد القحطاني', role: 'معلم', isFree: false },
  { id: '7', name: 'ماجد عبدالله الدوسري', role: 'معلم', isFree: true },
  { id: '8', name: 'يوسف محمد الغامدي', role: 'إداري', isFree: true },
  { id: '9', name: 'عبدالعزيز فهد المطيري', role: 'معلم', isFree: true },
  { id: '10', name: 'صالح أحمد الزهراني', role: 'معلم', isFree: false },
];

// Component for searchable dropdown
const SearchableSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  dayIndex?: number;
  fieldIndex?: number;
}> = ({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTeachers = mockTeachers.filter(t => 
    t.name.includes(search)
  );

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
        />
        <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
      </div>
      
      {isOpen && filteredTeachers.length > 0 && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute z-[101] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
            {filteredTeachers.map((teacher) => (
              <button
                key={teacher.id}
                onClick={() => {
                  onChange(teacher.name);
                  setIsOpen(false);
                  setSearch('');
                }}
                className="w-full px-3 py-2 text-right hover:bg-[#eef2ff] transition-colors border-b border-gray-100 last:border-0 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded ${teacher.isFree ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {teacher.isFree ? 'متفرغ' : 'مشغول'}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">{teacher.name}</div>
                    <div className="text-xs text-gray-500">{teacher.role}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const CreateSupervisionTableDialog: React.FC<CreateSupervisionTableDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
  settings
}) => {
  const [tableData, setTableData] = useState<SupervisionDayData[]>([]);
  const [selectedBreak, setSelectedBreak] = useState(1);
  const [commonLocation, setCommonLocation] = useState('');
  const [autoAssignAlert, setAutoAssignAlert] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // تهيئة بيانات الجدول عند الفتح
  useEffect(() => {
    if (isOpen && tableData.length === 0) {
      initializeTable();
    }
  }, [isOpen]);

  // تهيئة بيانات الجدول
  const initializeTable = () => {
    const days = settings.weekDays.map(day => ({
      day,
      supervisors: Array.from({ length: settings.supervisorCount }, () => ({
        name: '',
        position: 'center' as 'right' | 'left' | 'center',
        location: '',
        isAutoAssigned: false
      } as SupervisorEntry)),
      followupSupervisor: ''
    }));
    
    setTableData(days);
  };

  // إضافة المشرفين تلقائياً من جداول الحصص
  const autoAssignSupervisors = () => {
    const freeTeachers = mockTeachers.filter(t => t.isFree);
    const busyTeachers = mockTeachers.filter(t => !t.isFree);
    
    if (busyTeachers.length > 0) {
      setAutoAssignAlert(busyTeachers.map(t => t.name));
    }

    const newData = tableData.map((day, dayIndex) => {
      const supervisors = day.supervisors.map((sup, idx) => {
        if (idx < freeTeachers.length) {
          return {
            ...sup,
            name: freeTeachers[idx].name,
            isAutoAssigned: true
          };
        }
        return sup;
      });
      return { ...day, supervisors };
    });

    setTableData(newData);
    
    if (freeTeachers.length < settings.supervisorCount) {
      setNotification({
        type: 'warning',
        message: `تم إضافة ${freeTeachers.length} مشرفين متفرغين من أصل ${settings.supervisorCount}. يرجى إضافة باقي المشرفين يدوياً.`
      });
    } else {
      setNotification({
        type: 'success',
        message: 'تم إضافة المشرفين المتفرغين بنجاح!'
      });
    }
  };

  // إضافة موقع الإشراف لجميع المشرفين
  const addLocationToAll = () => {
    if (!commonLocation.trim()) {
      setNotification({
        type: 'error',
        message: 'يرجى إدخال موقع الإشراف'
      });
      return;
    }
    const newData = tableData.map(day => ({
      ...day,
      supervisors: day.supervisors.map(sup => ({
        ...sup,
        location: sup.location || commonLocation
      }))
    }));
    setTableData(newData);
    setCommonLocation('');
    setNotification({
      type: 'success',
      message: 'تم إضافة الموقع بنجاح'
    });
  };

  // تحديث بيانات مشرف
  const updateSupervisor = (dayIndex: number, supIndex: number, field: keyof SupervisorEntry, value: any) => {
    const newData = [...tableData];
    newData[dayIndex].supervisors[supIndex] = {
      ...newData[dayIndex].supervisors[supIndex],
      [field]: value
    };
    setTableData(newData);
  };

  // تحديث المشرف المتابع
  const updateFollowupSupervisor = (dayIndex: number, value: string) => {
    const newData = [...tableData];
    newData[dayIndex].followupSupervisor = value;
    setTableData(newData);
  };

  // إنشاء الجدول
  const handleCreate = () => {
    const table: Partial<SupervisionTable> = {
      userId: '', 
      breakNumber: selectedBreak,
      startDay: '', 
      startDate: '', 
      supervisorCount: settings.supervisorCount,
      educationalAffairsVice: settings.educationalAffairsVice,
      principalName: settings.principalName,
      tableData,
      status: 'published'
    };

    onCreate(table as SupervisionTable);
    setTableData([]);
    setCommonLocation('');
    setAutoAssignAlert([]);
  };

  const getDayNameAr = (dayValue: string) => {
    const dayMap: { [key: string]: string } = {
      saturday: 'السبت',
      sunday: 'الأحد',
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة'
    };
    return dayMap[dayValue] || dayValue;
  };

  if (!isOpen) return null;

  // تقسيم المشرفين إلى مجموعتين (حد أقصى 2 عمود)
  const maxColumns = 2;
  const supervisorsPerColumn = Math.ceil(settings.supervisorCount / maxColumns);

  return (
    <>
      {/* نظام الإشعارات */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* مربع حوار التأكيد */}
      {showConfirm && (
        <ConfirmDialog
          message="هل أنت متأكد من إنشاء جدول الإشراف؟"
          onConfirm={() => {
            setShowConfirm(false);
            handleCreate();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - مصغر */}
        <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">إنشاء جدول الإشراف اليومي</h2>
            <p className="text-[#e0e7ff] text-xs mt-0.5">قم بملء بيانات جدول الإشراف للفسحة المختارة</p>
          </div>
          <button
            onClick={() => {
              onClose();
              setTableData([]);
              setCommonLocation('');
              setAutoAssignAlert([]);
            }}
            className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* اختيار الفسحة - مصغر */}
          <div className="bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] rounded-lg p-3 border border-[#818cf8]">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
              <div className="w-1 h-5 bg-[#4f46e5] rounded-full"></div>
              اختر الفسحة
            </label>
            <div className="grid grid-cols-4 gap-2">
              {settings.breakTimings.map(timing => (
                <button
                  key={timing.breakNumber}
                  onClick={() => setSelectedBreak(timing.breakNumber)}
                  className="p-2 rounded-lg transition-all text-sm"
                  style={{
                    border: selectedBreak === timing.breakNumber ? '2px solid #4f46e5' : '1px solid #d1d5db',
                    backgroundColor: selectedBreak === timing.breakNumber ? '#ffffff' : '#f9fafb',
                    boxShadow: selectedBreak === timing.breakNumber ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none'
                  }}
                >
                  <div className="font-bold text-[#4f46e5]">الفسحة {timing.breakNumber}</div>
                  <div className="text-xs text-gray-600">بعد الحصة {timing.afterLesson}</div>
                </button>
              ))}
            </div>
          </div>

          {/* إضافة المشرفين تلقائياً */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <Wand2 className="w-4 h-4 text-green-600" />
                  إضافة المشرفين تلقائياً
                </label>
                <p className="text-xs text-gray-600 mt-1">البحث عن المعلمين المتفرغين وإضافتهم تلقائياً</p>
              </div>
              <button
                onClick={autoAssignSupervisors}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2 shadow-md"
              >
                <Wand2 className="w-4 h-4" />
                إضافة تلقائية
              </button>
            </div>
            
            {autoAssignAlert.length > 0 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-800">
                    <strong>تنبيه:</strong> المعلمون التالية أسماؤهم غير متفرغين: {autoAssignAlert.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* أضف موقع الإشراف - مصغر */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
              <div className="w-1 h-4 bg-[#6366f1] rounded-full"></div>
              أضف موقع الإشراف لجميع المشرفين
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={commonLocation}
                onChange={(e) => setCommonLocation(e.target.value)}
                placeholder="أدخل موقع الإشراف"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
              />
              <button
                onClick={addLocationToAll}
                className="px-4 py-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                إضافة
              </button>
            </div>
          </div>

          {/* جداول الأيام - مصغر ومحسن */}
          <div className="space-y-3">
            {tableData.map((dayData, dayIndex) => (
              <div key={dayIndex} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white p-2 text-sm font-bold flex items-center gap-2">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center text-xs">
                    {dayIndex + 1}
                  </div>
                  {getDayNameAr(dayData.day)}
                </div>
                
                <div className="p-2">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#eef2ff] to-[#e0e7ff]">
                          <th rowSpan={supervisorsPerColumn} className="px-2 py-2 text-center border border-[#c7d2fe] font-bold text-gray-800 w-16">اليوم</th>
                          {/* عمود المشرف */}
                          <th className="px-2 py-2 text-center border border-[#c7d2fe] font-bold text-gray-800">المشرف</th>
                          <th className="px-2 py-2 text-center border border-[#c7d2fe] font-bold text-gray-800">موقع الإشراف</th>
                          {/* عمود المشرف الثاني إذا كان هناك أكثر من مشرف */}
                          {settings.supervisorCount > supervisorsPerColumn && (
                            <>
                              <th className="px-2 py-2 text-center border border-[#c7d2fe] font-bold text-gray-800">المشرف</th>
                              <th className="px-2 py-2 text-center border border-[#c7d2fe] font-bold text-gray-800">موقع الإشراف</th>
                            </>
                          )}
                          <th rowSpan={supervisorsPerColumn} className="px-2 py-2 text-center border border-[#c7d2fe] font-bold text-gray-800">المشرف المتابع</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: supervisorsPerColumn }).map((_, rowIdx) => {
                          const sup1Index = rowIdx;
                          const sup2Index = rowIdx + supervisorsPerColumn;
                          const sup1 = dayData.supervisors[sup1Index];
                          const sup2 = dayData.supervisors[sup2Index];
                          
                          return (
                            <tr key={rowIdx} className="hover:bg-[#f9fafb] transition-colors">
                              {rowIdx === 0 && (
                                <td 
                                  rowSpan={supervisorsPerColumn}
                                  className="px-2 py-2 text-center border border-gray-200 font-bold text-[#4f46e5] bg-[#fafbff]"
                                >
                                  {getDayNameAr(dayData.day)}
                                </td>
                              )}
                              
                              {/* المشرف 1 */}
                              <td className="px-1 py-1 border border-gray-200">
                                <SearchableSelect
                                  value={sup1?.name || ''}
                                  onChange={(value) => updateSupervisor(dayIndex, sup1Index, 'name', value)}
                                  placeholder="اختر المشرف"
                                  dayIndex={dayIndex}
                                  fieldIndex={sup1Index}
                                />
                              </td>
                              <td className="px-1 py-1 border border-gray-200">
                                <input
                                  type="text"
                                  value={sup1?.location || ''}
                                  onChange={(e) => updateSupervisor(dayIndex, sup1Index, 'location', e.target.value)}
                                  placeholder="الموقع"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
                                />
                              </td>
                              
                              {/* المشرف 2 */}
                              {settings.supervisorCount > supervisorsPerColumn && sup2 && (
                                <>
                                  <td className="px-1 py-1 border border-gray-200">
                                    <SearchableSelect
                                      value={sup2.name}
                                      onChange={(value) => updateSupervisor(dayIndex, sup2Index, 'name', value)}
                                      placeholder="اختر المشرف"
                                      dayIndex={dayIndex}
                                      fieldIndex={sup2Index}
                                    />
                                  </td>
                                  <td className="px-1 py-1 border border-gray-200">
                                    <input
                                      type="text"
                                      value={sup2.location}
                                      onChange={(e) => updateSupervisor(dayIndex, sup2Index, 'location', e.target.value)}
                                      placeholder="الموقع"
                                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all"
                                    />
                                  </td>
                                </>
                              )}
                              
                              {/* المشرف المتابع */}
                              {rowIdx === 0 && (
                                <td 
                                  rowSpan={supervisorsPerColumn}
                                  className="px-1 py-1 border border-gray-200"
                                >
                                  <SearchableSelect
                                    value={dayData.followupSupervisor || ''}
                                    onChange={(value) => updateFollowupSupervisor(dayIndex, value)}
                                    placeholder="اختر المتابع"
                                  />
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - مصغر */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex gap-2 justify-start">
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            إنشاء الجدول
          </button>
          
          <button
            onClick={() => {
              onClose();
              setTableData([]);
              setCommonLocation('');
              setAutoAssignAlert([]);
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            إلغاء
          </button>
          
          <button
            onClick={() => {
              onClose();
              setTableData([]);
              setCommonLocation('');
              setAutoAssignAlert([]);
            }}
            className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm font-medium"
          >
            رجوع
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default CreateSupervisionTableDialog;
