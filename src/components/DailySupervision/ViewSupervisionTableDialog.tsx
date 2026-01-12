import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Calendar, Clock } from 'lucide-react';
import { SupervisionTable, SupervisionDayData } from '../../types/dailySupervision';

interface ViewSupervisionTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  table: SupervisionTable;
  onUpdate: (updatedTable: SupervisionTable) => void;
}

const ViewSupervisionTableDialog: React.FC<ViewSupervisionTableDialogProps> = ({
  isOpen,
  onClose,
  table,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTable, setEditedTable] = useState<SupervisionTable>(table);

  useEffect(() => {
    setEditedTable(table);
  }, [table]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate(editedTable);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTable(table);
    setIsEditing(false);
  };

  const updateSupervisorName = (dayIndex: number, supervisorIndex: number, newName: string) => {
    const newTableData = [...editedTable.tableData];
    newTableData[dayIndex].supervisors[supervisorIndex].name = newName;
    setEditedTable({ ...editedTable, tableData: newTableData });
  };

  const updateSupervisorLocation = (dayIndex: number, supervisorIndex: number, newLocation: string) => {
    const newTableData = [...editedTable.tableData];
    newTableData[dayIndex].supervisors[supervisorIndex].location = newLocation;
    setEditedTable({ ...editedTable, tableData: newTableData });
  };

  const updateFollowupSupervisor = (dayIndex: number, newFollowup: string) => {
    const newTableData = [...editedTable.tableData];
    newTableData[dayIndex].followupSupervisor = newFollowup;
    setEditedTable({ ...editedTable, tableData: newTableData });
  };

  // الحصول على توقيت الفسحة
  const getBreakTiming = () => {
    // البحث في الإعدادات عن توقيت هذه الفسحة
    return `بعد الحصة ${table.breakNumber + 1}`; // افتراضي
  };

  // تحويل اسم اليوم للعربية
  const getDayNameAr = (dayValue: string) => {
    const dayMap: { [key: string]: string } = {
      saturday: 'السبت',
      sunday: 'الأحد',
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      'السبت': 'السبت',
      'الأحد': 'الأحد',
      'الاثنين': 'الاثنين',
      'الثلاثاء': 'الثلاثاء',
      'الأربعاء': 'الأربعاء',
      'الخميس': 'الخميس',
      'الجمعة': 'الجمعة'
    };
    return dayMap[dayValue.toLowerCase()] || dayValue;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-kufi" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">جدول الإشراف اليومي</h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  <span>الفسحة {editedTable.breakNumber}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>{getBreakTiming()}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                  <span>تاريخ الإنشاء: {editedTable.createdAt ? new Date(editedTable.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="mr-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* جدول الإشراف */}
          <div className="space-y-3">
            {editedTable.tableData.map((dayData, dayIndex) => {
              // حساب عدد المشرفين في كل عمود
              const supervisorsPerColumn = Math.ceil(editedTable.supervisorCount / 2);
              
              return (
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
                            {/* عمود المشرف الأول */}
                            <th className="px-2 py-2 text-center border border-[#c7d2fe] font-bold text-gray-800">المشرف</th>
                            <th className="px-2 py-2 text-center border border-[#c7d2fe] font-bold text-gray-800">موقع الإشراف</th>
                            {/* عمود المشرف الثاني إذا كان هناك أكثر من مشرف */}
                            {editedTable.supervisorCount > supervisorsPerColumn && (
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
                                
                                {/* المشرف الأول */}
                                {isEditing ? (
                                  <>
                                    <td className="px-1 py-1 border border-gray-200 bg-white">
                                      <input
                                        type="text"
                                        value={sup1?.name || ''}
                                        onChange={(e) => updateSupervisorName(dayIndex, sup1Index, e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-[#4f46e5] focus:outline-none"
                                        placeholder="اسم المشرف"
                                      />
                                    </td>
                                    <td className="px-1 py-1 border border-gray-200 bg-white">
                                      <input
                                        type="text"
                                        value={sup1?.location || ''}
                                        onChange={(e) => updateSupervisorLocation(dayIndex, sup1Index, e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-[#4f46e5] focus:outline-none"
                                        placeholder="الموقع"
                                      />
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-2 py-2 border border-gray-200 text-center bg-white">
                                      <div className="font-medium text-gray-900">{sup1?.name || '-'}</div>
                                    </td>
                                    <td className="px-2 py-2 border border-gray-200 text-center text-gray-600">
                                      {sup1?.location || '-'}
                                    </td>
                                  </>
                                )}
                                
                                {/* المشرف الثاني */}
                                {editedTable.supervisorCount > supervisorsPerColumn && (
                                  <>
                                    {isEditing ? (
                                      <>
                                        <td className="px-1 py-1 border border-gray-200 bg-white">
                                          <input
                                            type="text"
                                            value={sup2?.name || ''}
                                            onChange={(e) => updateSupervisorName(dayIndex, sup2Index, e.target.value)}
                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-[#4f46e5] focus:outline-none"
                                            placeholder="اسم المشرف"
                                          />
                                        </td>
                                        <td className="px-1 py-1 border border-gray-200 bg-white">
                                          <input
                                            type="text"
                                            value={sup2?.location || ''}
                                            onChange={(e) => updateSupervisorLocation(dayIndex, sup2Index, e.target.value)}
                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-[#4f46e5] focus:outline-none"
                                            placeholder="الموقع"
                                          />
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td className="px-2 py-2 border border-gray-200 text-center bg-white">
                                          <div className="font-medium text-gray-900">{sup2?.name || '-'}</div>
                                        </td>
                                        <td className="px-2 py-2 border border-gray-200 text-center text-gray-600">
                                          {sup2?.location || '-'}
                                        </td>
                                      </>
                                    )}
                                  </>
                                )}
                                
                                {/* المشرف المتابع */}
                                {rowIdx === 0 && (
                                  <td 
                                    rowSpan={supervisorsPerColumn}
                                    className="px-2 py-2 border border-gray-200 text-center bg-[#fafbff]"
                                  >
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={dayData.followupSupervisor || ''}
                                        onChange={(e) => updateFollowupSupervisor(dayIndex, e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-[#4f46e5] focus:outline-none text-center"
                                        placeholder="المشرف المتابع"
                                      />
                                    ) : (
                                      <div className="font-medium text-gray-900">{dayData.followupSupervisor || '-'}</div>
                                    )}
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
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-start gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  حفظ التعديلات
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  إلغاء
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white rounded-lg hover:from-[#4338ca] hover:to-[#4f46e5] transition-all font-medium flex items-center gap-2 shadow-lg"
                >
                  <Edit2 className="w-5 h-5" />
                  تعديل الجدول
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  إغلاق
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSupervisionTableDialog;
