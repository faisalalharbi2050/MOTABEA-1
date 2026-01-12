import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Users, Edit2, Check, FileText, AlertCircle, Plus, Ban, Monitor, Trash2 } from 'lucide-react';
import { DutyTable, DutyDayData, DutyGuardEntry } from '../../types/dailyDuty';
import DailyDutyReport from './DailyDutyReport';

interface ViewEditDutyTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  table: DutyTable | null;
  onSave: (updatedTable: DutyTable) => void;
}

type DayStatus = 'normal' | 'holiday' | 'remote';

const ViewEditDutyTableDialog: React.FC<ViewEditDutyTableDialogProps> = ({
  isOpen,
  onClose,
  table,
  onSave
}) => {
  const [editedTable, setEditedTable] = useState<DutyTable | null>(null);
  const [editingGuard, setEditingGuard] = useState<string | null>(null); // "dayDate-guardIndex"
  const [selectedGuardId, setSelectedGuardId] = useState<string>('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedDayForReport, setSelectedDayForReport] = useState<DutyDayData | null>(null);
  const [dayStatuses, setDayStatuses] = useState<{[date: string]: DayStatus}>({});
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    if (table) {
      setEditedTable({ ...table });
    }
  }, [table]);

  // جلب بيانات المعلمين والإداريين من localStorage
  const getAllStaff = () => {
    try {
      const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
      const administrators = JSON.parse(localStorage.getItem('administrators') || '[]');
      return [
        ...administrators.map((a: any) => ({ id: a.id, name: a.name, type: 'إداري' })),
        ...teachers.map((t: any) => ({ id: t.id, name: t.name, type: 'معلم' }))
      ];
    } catch {
      return [];
    }
  };

  const allStaff = getAllStaff();

  // حساب عدد أيام الأسبوع
  const getDaysPerWeek = () => {
    if (!editedTable || editedTable.tableData.length === 0) return 5;
    const firstWeekDays = editedTable.tableData.slice(0, 7).length;
    return firstWeekDays <= 7 ? firstWeekDays : 5;
  };

  // تجميع الأيام حسب الأسابيع
  const getWeeklyData = () => {
    if (!editedTable) return [];
    const daysPerWeek = getDaysPerWeek();
    const weeks: { weekNumber: number; days: DutyDayData[] }[] = [];
    
    for (let i = 0; i < editedTable.tableData.length; i += daysPerWeek) {
      const weekDays = editedTable.tableData.slice(i, i + daysPerWeek);
      weeks.push({
        weekNumber: Math.floor(i / daysPerWeek) + 1,
        days: weekDays
      });
    }
    
    return weeks;
  };

  // تبديل حالة اليوم
  const toggleDayStatus = (date: string, newStatus: DayStatus) => {
    setDayStatuses(prev => ({
      ...prev,
      [date]: prev[date] === newStatus ? 'normal' : newStatus
    }));
  };

  // إضافة مناوب جديد ليوم محدد
  const addGuardToDay = (dayDate: string) => {
    if (!editedTable) return;

    const updatedTableData = editedTable.tableData.map(day => {
      if (day.date === dayDate) {
        const newGuards = [...day.dutyGuards, {
          id: '',
          name: '',
          type: '',
          teacherId: '',
          notes: ''
        }];
        return { ...day, dutyGuards: newGuards };
      }
      return day;
    });

    setEditedTable({
      ...editedTable,
      tableData: updatedTableData
    });
  };

  // حذف مناوب من يوم محدد
  const removeGuardFromDay = (dayDate: string, guardIndex: number) => {
    if (!editedTable) return;

    const updatedTableData = editedTable.tableData.map(day => {
      if (day.date === dayDate) {
        const newGuards = day.dutyGuards.filter((_, idx) => idx !== guardIndex);
        return { ...day, dutyGuards: newGuards };
      }
      return day;
    });

    setEditedTable({
      ...editedTable,
      tableData: updatedTableData
    });
  };

  // تغيير مناوب
  const handleGuardChange = (dayDate: string, guardIndex: number, staffId: string) => {
    if (!editedTable) return;

    const selectedStaff = allStaff.find(s => s.id === staffId);
    if (!selectedStaff) return;

    const updatedTableData = editedTable.tableData.map(day => {
      if (day.date === dayDate) {
        const newGuards = [...day.dutyGuards];
        newGuards[guardIndex] = {
          id: selectedStaff.id,
          name: selectedStaff.name,
          type: selectedStaff.type,
          teacherId: selectedStaff.id,
          notes: newGuards[guardIndex]?.notes || ''
        };
        return { ...day, dutyGuards: newGuards };
      }
      return day;
    });

    setEditedTable({
      ...editedTable,
      tableData: updatedTableData
    });

    setEditingGuard(null);
    setSelectedGuardId('');
  };

  const handleSave = () => {
    if (editedTable) {
      onSave({
        ...editedTable,
        updatedAt: new Date().toISOString()
      });
      onClose();
    }
  };

  const handleOpenReport = (day: DutyDayData) => {
    setSelectedDayForReport(day);
    setShowReportDialog(true);
  };

  if (!isOpen || !editedTable) return null;

  const weeklyData = getWeeklyData();
  const currentWeekData = weeklyData.find(w => w.weekNumber === selectedWeek) || weeklyData[0];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-kufi" style={{ direction: 'rtl' }}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-5 py-4 flex justify-between items-center z-10 shadow-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <div>
                <h2 className="text-lg font-bold">عرض وتعديل جدول المناوبة</h2>
                <p className="text-xs text-white/80 mt-0.5">
                  {weeklyData.length} {weeklyData.length === 1 ? 'أسبوع' : 'أسابيع'} | {editedTable.tableData.length} {editedTable.tableData.length === 1 ? 'يوم' : 'أيام'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              {/* معلومات الجدول */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">الفصل الدراسي:</span>
                    <span className="font-bold text-gray-800 mr-1">{localStorage.getItem('currentSemester') || 'الفصل الأول'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">العام الدراسي:</span>
                    <span className="font-bold text-gray-800 mr-1">{localStorage.getItem('currentAcademicYear') || '1446'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">عدد الأسابيع:</span>
                    <span className="font-bold text-gray-800 mr-1">{weeklyData.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">الوكيل:</span>
                    <span className="font-bold text-gray-800 mr-1">{editedTable.educationalAffairsVice}</span>
                  </div>
                </div>
              </div>

              {/* قائمة اختيار الأسبوع */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <label className="block text-sm font-bold text-gray-800 mb-2">اختر الأسبوع للعرض والتعديل:</label>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border-2 border-[#4f46e5] rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 bg-white"
                >
                  {weeklyData.map((week) => (
                    <option key={week.weekNumber} value={week.weekNumber}>
                      الأسبوع {week.weekNumber} ({week.days.length} {week.days.length === 1 ? 'يوم' : 'أيام'})
                    </option>
                  ))}
                </select>
              </div>

              {/* تنبيه التعديل */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 flex items-start gap-2">
                <Edit2 className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  <p className="font-bold mb-1">يمكنك: تحديد إجازة/مدرستي • تعديل المناوبين • إضافة/حذف مناوب</p>
                </div>
              </div>

              {/* جدول الأسبوع المحدد */}
              {currentWeekData && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  {/* عنوان الأسبوع */}
                  <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white py-2.5 px-3">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      الأسبوع {currentWeekData.weekNumber}
                    </h3>
                  </div>

                  {/* جدول المناوبة */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#818cf8] text-white">
                          <th className="px-3 py-2.5 text-center text-sm font-bold border-l border-white/20">اليوم</th>
                          <th className="px-3 py-2.5 text-center text-sm font-bold border-l border-white/20">التاريخ</th>
                          <th className="px-3 py-2.5 text-center text-sm font-bold border-l border-white/20">المناوب</th>
                          <th className="px-3 py-2.5 text-center text-sm font-bold border-l border-white/20">التقرير</th>
                          <th className="px-3 py-2.5 text-center text-sm font-bold">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentWeekData.days.map((day, dayIdx) => {
                          const dayStatus = dayStatuses[day.date] || 'normal';
                          const isHoliday = dayStatus === 'holiday';
                          const isRemote = dayStatus === 'remote';
                          const guardsCount = day.dutyGuards.length;
                          
                          return (
                            <React.Fragment key={dayIdx}>
                              {day.dutyGuards.map((guard, guardIdx) => {
                                const guardKey = `${day.date}-${guardIdx}`;
                                const isEditing = editingGuard === guardKey;
                                const isFirstRow = guardIdx === 0;
                                
                                return (
                                  <tr 
                                    key={`${dayIdx}-${guardIdx}`}
                                    className={`border-b border-gray-200 transition-colors ${
                                      isHoliday 
                                        ? 'bg-red-50'
                                        : isRemote
                                        ? 'bg-blue-50'
                                        : dayIdx % 2 === 0 ? 'bg-gray-50 hover:bg-blue-50' : 'bg-white hover:bg-blue-50'
                                    }`}
                                  >
                                    {/* اليوم - يظهر فقط في الصف الأول */}
                                    {isFirstRow && (
                                      <td 
                                        rowSpan={guardsCount} 
                                        className="px-3 py-2.5 text-center text-sm font-semibold text-gray-800 border-l border-gray-200"
                                      >
                                        <div>{day.day}</div>
                                        {isHoliday && (
                                          <div className="text-xs text-red-600 mt-0.5">إجازة</div>
                                        )}
                                        {isRemote && (
                                          <div className="text-xs text-blue-600 mt-0.5">مدرستي</div>
                                        )}
                                      </td>
                                    )}
                                    
                                    {/* التاريخ - يظهر فقط في الصف الأول */}
                                    {isFirstRow && (
                                      <td 
                                        rowSpan={guardsCount} 
                                        className="px-3 py-2.5 text-center text-sm text-gray-700 border-l border-gray-200"
                                      >
                                        <div>{day.hijriDate || day.date}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          {day.gregorianDate || day.date}
                                        </div>
                                      </td>
                                    )}
                                    
                                    {/* المناوب - صف لكل مناوب */}
                                    <td className="px-3 py-2.5 text-center text-sm border-l border-gray-200">
                                      {isEditing ? (
                                        <div className="flex items-center gap-1 justify-center">
                                          <select
                                            value={selectedGuardId}
                                            onChange={(e) => {
                                              setSelectedGuardId(e.target.value);
                                              if (e.target.value) {
                                                handleGuardChange(day.date, guardIdx, e.target.value);
                                              }
                                            }}
                                            className="flex-1 px-2 py-1.5 border border-[#4f46e5] rounded text-sm focus:outline-none"
                                            autoFocus
                                          >
                                            <option value="">اختر...</option>
                                            {allStaff.map(staff => (
                                              <option key={staff.id} value={staff.id}>
                                                {staff.name} ({staff.type})
                                              </option>
                                            ))}
                                          </select>
                                          <button
                                            onClick={() => {
                                              setEditingGuard(null);
                                              setSelectedGuardId('');
                                            }}
                                            className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                                            title="إلغاء"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 justify-between">
                                          <div 
                                            onClick={() => {
                                              setEditingGuard(guardKey);
                                              setSelectedGuardId(guard.teacherId || guard.id || '');
                                            }}
                                            className="flex-1 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                                          >
                                            <div className="font-semibold text-gray-800">
                                              {guard.name || 'غير محدد'}
                                            </div>
                                            {guard.type && (
                                              <div className="text-xs text-gray-500">
                                                ({guard.type})
                                              </div>
                                            )}
                                          </div>
                                          {guardIdx > 0 && (
                                            <button
                                              onClick={() => removeGuardFromDay(day.date, guardIdx)}
                                              className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex-shrink-0"
                                              title="حذف المناوب"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                    
                                    {/* التقرير اليومي - يظهر فقط في الصف الأول */}
                                    {isFirstRow && (
                                      <td 
                                        rowSpan={guardsCount} 
                                        className="px-3 py-2.5 text-center border-l border-gray-200"
                                      >
                                        <button
                                          onClick={() => handleOpenReport(day)}
                                          className="p-2 bg-[#6366f1] text-white rounded hover:bg-[#4f46e5] transition-all inline-flex items-center"
                                          title="التقرير اليومي"
                                        >
                                          <FileText className="w-4 h-4" />
                                        </button>
                                      </td>
                                    )}
                                    
                                    {/* الإجراء - يظهر فقط في الصف الأول */}
                                    {isFirstRow && (
                                      <td 
                                        rowSpan={guardsCount} 
                                        className="px-3 py-2.5 text-center"
                                      >
                                        <div className="flex items-center justify-center gap-1">
                                          <button
                                            onClick={() => toggleDayStatus(day.date, 'holiday')}
                                            className={`p-1.5 rounded transition-all ${
                                              isHoliday
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white text-red-600 hover:bg-red-50 border border-red-300'
                                            }`}
                                            title="إجازة رسمية"
                                          >
                                            <Ban className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => toggleDayStatus(day.date, 'remote')}
                                            className={`p-1.5 rounded transition-all ${
                                              isRemote
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-300'
                                            }`}
                                            title="عمل عن بعد - مدرستي"
                                          >
                                            <Monitor className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (window.confirm(`حذف ${day.day}؟`)) {
                                                if (editedTable) {
                                                  const updatedTableData = editedTable.tableData.filter(d => d.date !== day.date);
                                                  setEditedTable({
                                                    ...editedTable,
                                                    tableData: updatedTableData
                                                  });
                                                }
                                              }
                                            }}
                                            className="p-1.5 bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-300 rounded transition-all"
                                            title="حذف اليوم"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                              
                              {/* صف إضافة مناوب جديد */}
                              <tr className={`border-b border-gray-200 ${
                                isHoliday 
                                  ? 'bg-red-50'
                                  : isRemote
                                  ? 'bg-blue-50'
                                  : dayIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                              }`}>
                                <td colSpan={3} className="px-3 py-2 text-center">
                                  <button
                                    onClick={() => addGuardToDay(day.date)}
                                    className="text-[#4f46e5] hover:text-[#4338ca] transition-colors text-sm font-medium flex items-center justify-center gap-1 mx-auto"
                                  >
                                    <Plus className="w-4 h-4" />
                                    إضافة مناوب
                                  </button>
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white rounded-lg transition-all font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg text-sm"
              >
                <Save className="w-4 h-4" />
                حفظ
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium text-sm"
              >
                إلغاء
              </button>
            </div>
            <div className="text-xs text-gray-600">
              آخر تحديث: {editedTable.updatedAt ? new Date(editedTable.updatedAt).toLocaleString('ar-SA') : 'لم يتم التحديث'}
            </div>
          </div>
        </div>
      </div>

      {/* نافذة التقرير اليومي */}
      {showReportDialog && selectedDayForReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">تقرير المناوبة - {selectedDayForReport.day}</h3>
              <button
                onClick={() => {
                  setShowReportDialog(false);
                  setSelectedDayForReport(null);
                }}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <DailyDutyReport
                isOpen={true}
                onClose={() => {
                  setShowReportDialog(false);
                  setSelectedDayForReport(null);
                }}
                day={selectedDayForReport}
                settings={{
                  userId: editedTable.userId,
                  weekDays: [],
                  weekCount: 1,
                  useCustomWeeks: false,
                  firstWeekStartDate: editedTable.startDate,
                  dutyGuardCount: editedTable.dutyGuardCount,
                  educationalAffairsVice: editedTable.educationalAffairsVice,
                  principalName: editedTable.principalName,
                  semester: localStorage.getItem('currentSemester') || 'الفصل الأول',
                  academicYear: localStorage.getItem('currentAcademicYear') || '1446',
                  calendarType: 'hijri'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewEditDutyTableDialog;
