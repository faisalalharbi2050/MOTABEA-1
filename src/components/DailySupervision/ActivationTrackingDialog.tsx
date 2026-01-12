import React, { useState } from 'react';
import { X, CheckCircle, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import { SupervisionActivation, SUPERVISION_ACTIONS } from '../../types/dailySupervision';

interface ActivationTrackingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activations: SupervisionActivation[]) => void;
}

interface Supervisor {
  id: string;
  name: string;
  day: string;
}

const ActivationTrackingDialog: React.FC<ActivationTrackingDialogProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [trackingMode, setTrackingMode] = useState<'single' | 'week'>('single');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isOfficialHoliday, setIsOfficialHoliday] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [activations, setActivations] = useState<{ [key: string]: any }>({});

  const mockSupervisors: Supervisor[] = [
    { id: '1', name: 'أحمد محمد', day: 'sunday' },
    { id: '2', name: 'محمد علي', day: 'sunday' },
    { id: '3', name: 'خالد سعيد', day: 'monday' },
    { id: '4', name: 'عمر يوسف', day: 'monday' }
  ];

  const loadSupervisors = () => {
    // إذا كان اليوم إجازة رسمية، نقوم بالحفظ مباشرة
    if (trackingMode === 'single' && isOfficialHoliday && selectedDay && selectedDate) {
      alert('تم حفظ اليوم كإجازة رسمية');
      // إعادة تعيين جميع الحقول للبدء من جديد
      setSelectedDay('');
      setSelectedDate('');
      setIsOfficialHoliday(false);
      setSupervisors([]);
      setActivations({});
      return;
    }

    if (trackingMode === 'single' && selectedDay && selectedDate) {
      const filtered = mockSupervisors.filter(s => s.day === selectedDay);
      setSupervisors(filtered);
      
      // تهيئة الحالات
      const initialActivations: { [key: string]: any } = {};
      filtered.forEach(sup => {
        initialActivations[sup.id] = {
          action: 'present',
          actionTime: '',
          notes: ''
        };
      });
      setActivations(initialActivations);
    } else if (trackingMode === 'week' && startDate && endDate) {
      setSupervisors(mockSupervisors);
      
      const initialActivations: { [key: string]: any } = {};
      mockSupervisors.forEach(sup => {
        initialActivations[sup.id] = {
          action: 'present',
          actionTime: '',
          notes: ''
        };
      });
      setActivations(initialActivations);
    }
  };

  const handleBack = () => {
    setSupervisors([]);
    setActivations({});
  };

  const updateActivation = (supId: string, field: string, value: any) => {
    setActivations(prev => ({
      ...prev,
      [supId]: {
        ...prev[supId],
        [field]: value
      }
    }));
  };

  const markAllPresent = () => {
    const newActivations = { ...activations };
    supervisors.forEach(sup => {
      newActivations[sup.id] = {
        ...newActivations[sup.id],
        action: 'present',
        actionTime: '',
        notes: ''
      };
    });
    setActivations(newActivations);
  };

  const handleSave = () => {
    const activationsList: SupervisionActivation[] = supervisors.map(sup => ({
      userId: '',
      tableId: '',
      supervisorId: sup.id,
      supervisorName: sup.name,
      day: sup.day,
      date: trackingMode === 'single' ? selectedDate : startDate,
      action: activations[sup.id]?.action || 'present',
      actionTime: activations[sup.id]?.actionTime,
      notes: activations[sup.id]?.notes
    }));

    onSave(activationsList);
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      present: '#10b981',
      absent: '#ef4444',
      excused: '#f59e0b',
      withdrawn: '#fb923c',
      late: '#3b82f6'
    };
    return colors[action] || '#6b7280';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">متابعة تفعيل الإشراف</h2>
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
                  setTrackingMode('single');
                  setSupervisors([]);
                  setIsOfficialHoliday(false);
                }}
                className="p-4 border-2 rounded-lg transition-all"
                style={{
                  borderColor: trackingMode === 'single' ? '#4f46e5' : '#e5e7eb',
                  backgroundColor: trackingMode === 'single' ? '#eef2ff' : 'white'
                }}
              >
                <div className="text-center">
                  <div className="font-bold text-lg" style={{ color: trackingMode === 'single' ? '#4f46e5' : '#374151' }}>
                    المتابعة اليومية
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setTrackingMode('week');
                  setSupervisors([]);
                  setIsOfficialHoliday(false);
                }}
                className="p-4 border-2 rounded-lg transition-all"
                style={{
                  borderColor: trackingMode === 'week' ? '#4f46e5' : '#e5e7eb',
                  backgroundColor: trackingMode === 'week' ? '#eef2ff' : 'white'
                }}
              >
                <div className="text-center">
                  <div className="font-bold text-lg" style={{ color: trackingMode === 'week' ? '#4f46e5' : '#374151' }}>
                    المتابعة الأسبوعية
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* خيارات المتابعة اليومية */}
          {trackingMode === 'single' && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* اليوم */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">اليوم</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
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
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] focus:ring-opacity-20 transition-all text-sm"
                  />
                </div>
              </div>

              {/* إجازة رسمية */}
              <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-300">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isOfficialHoliday}
                    onChange={(e) => setIsOfficialHoliday(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-[#4f46e5] focus:ring-[#4f46e5] cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-gray-800 group-hover:text-[#4f46e5] transition-colors">
                      تحديد هذا اليوم كإجازة رسمية
                    </span>
                  </div>
                  <AlertCircle className="w-4 h-4 text-gray-400 group-hover:text-[#4f46e5] transition-colors" />
                </label>
              </div>
            </div>
          )}

          {/* خيارات المتابعة الأسبوعية */}
          {trackingMode === 'week' && (
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

          {/* زر تحميل المشرفين */}
          {!isOfficialHoliday && (
            <button
              onClick={loadSupervisors}
              disabled={
                (trackingMode === 'single' && (!selectedDay || !selectedDate)) ||
                (trackingMode === 'week' && (!startDate || !endDate))
              }
              className="w-full px-4 py-2.5 rounded-lg font-bold text-base transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              style={{
                backgroundColor: ((trackingMode === 'single' && (!selectedDay || !selectedDate)) ||
                  (trackingMode === 'week' && (!startDate || !endDate))) ? '#d1d5db' : '#4f46e5',
                color: 'white'
              }}
            >
              <Calendar className="w-5 h-5" />
              تحميل المشرفين
            </button>
          )}

          {/* زر حفظ الإجازة الرسمية */}
          {isOfficialHoliday && trackingMode === 'single' && selectedDay && selectedDate && (
            <button
              onClick={loadSupervisors}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <CheckCircle className="w-5 h-5" />
              حفظ الإجازة الرسمية
            </button>
          )}

          {/* جدول المشرفين */}
          {supervisors.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
              {/* رأس القسم */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    المشرفون ({supervisors.length})
                  </h3>
                </div>
                <button
                  onClick={markAllPresent}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 shadow-md font-bold text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  حاضر للكل
                </button>
              </div>

              {/* الجدول */}
              <div className="overflow-x-auto rounded-lg border border-gray-300">
                <table className="w-full bg-white text-sm" style={{ direction: 'rtl' }}>
                  <thead>
                    <tr className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1]">
                      <th className="px-4 py-2.5 text-right text-white font-bold border-l border-white border-opacity-20">
                        اليوم
                      </th>
                      <th className="px-4 py-2.5 text-right text-white font-bold border-l border-white border-opacity-20">
                        التاريخ
                      </th>
                      <th className="px-4 py-2.5 text-right text-white font-bold border-l border-white border-opacity-20">
                        المشرف
                      </th>
                      <th className="px-4 py-2.5 text-right text-white font-bold border-l border-white border-opacity-20">
                        التفعيل
                      </th>
                      <th className="px-4 py-2.5 text-right text-white font-bold">
                        ملاحظات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {supervisors.map((supervisor, index) => (
                      <tr 
                        key={supervisor.id} 
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        {/* اليوم - يظهر مرة واحدة فقط ومحاذاة في المنتصف */}
                        {index === 0 && (
                          <td 
                            rowSpan={supervisors.length}
                            className="px-4 py-2 text-sm font-medium text-gray-700 border-l border-gray-200 align-middle text-center"
                          >
                            {selectedDay === 'sunday' ? 'الأحد' : 
                             selectedDay === 'monday' ? 'الاثنين' :
                             selectedDay === 'tuesday' ? 'الثلاثاء' :
                             selectedDay === 'wednesday' ? 'الأربعاء' : 
                             selectedDay === 'thursday' ? 'الخميس' : ''}
                          </td>
                        )}
                        
                        {/* التاريخ - يظهر مرة واحدة فقط ومحاذاة في المنتصف */}
                        {index === 0 && (
                          <td 
                            rowSpan={supervisors.length}
                            className="px-4 py-2 text-sm font-medium text-gray-700 border-l border-gray-200 align-middle text-center"
                          >
                            {trackingMode === 'single' ? selectedDate : startDate}
                          </td>
                        )}
                        
                        {/* المشرف */}
                        <td className="px-4 py-2 text-sm font-bold text-gray-800 border-l border-gray-200">
                          {supervisor.name}
                        </td>
                        
                        {/* التفعيل */}
                        <td className="px-4 py-2 border-l border-gray-200">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {Object.values(SUPERVISION_ACTIONS).map(action => (
                              <button
                                key={action.value}
                                onClick={() => updateActivation(supervisor.id, 'action', action.value)}
                                className="px-2.5 py-1 rounded text-xs font-bold transition-all border"
                                style={{
                                  borderColor: activations[supervisor.id]?.action === action.value 
                                    ? getActionColor(action.value) 
                                    : '#e5e7eb',
                                  backgroundColor: activations[supervisor.id]?.action === action.value 
                                    ? getActionColor(action.value) 
                                    : 'white',
                                  color: activations[supervisor.id]?.action === action.value 
                                    ? 'white' 
                                    : getActionColor(action.value)
                                }}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                          
                          {/* وقت الانسحاب/التأخر */}
                          {(activations[supervisor.id]?.action === 'withdrawn' || 
                            activations[supervisor.id]?.action === 'late') && (
                            <div className="mt-2">
                              <input
                                type="time"
                                value={activations[supervisor.id]?.actionTime || ''}
                                onChange={(e) => updateActivation(supervisor.id, 'actionTime', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                placeholder="الوقت"
                              />
                            </div>
                          )}
                        </td>
                        
                        {/* ملاحظات */}
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={activations[supervisor.id]?.notes || ''}
                            onChange={(e) => updateActivation(supervisor.id, 'notes', e.target.value)}
                            placeholder="أضف ملاحظات"
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 justify-start" style={{ direction: 'rtl' }}>
          {supervisors.length > 0 && (
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white rounded-lg hover:from-[#4338ca] hover:to-[#4f46e5] transition-all font-bold text-sm flex items-center gap-2"
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
          {supervisors.length > 0 && (
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

export default ActivationTrackingDialog;
