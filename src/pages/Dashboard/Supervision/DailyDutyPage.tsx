import React, { useState } from 'react';
import { Clock, Settings, Plus, CheckCircle, BarChart3, Trash2, Send, Eye, Trash } from 'lucide-react';
import DutySettingsDialog from '../../../components/DailyDuty/DutySettingsDialog';
import CreateDutyTableDialog from '../../../components/DailyDuty/CreateDutyTableDialog';
import DutyActivationTrackingDialog from '../../../components/DailyDuty/DutyActivationTrackingDialog';
import DutyReportsDialog from '../../../components/DailyDuty/DutyReportsDialog';
import SendDutyNotificationsDialog from '../../../components/DailyDuty/SendDutyNotificationsDialog';
import ViewEditDutyTableDialog from '../../../components/DailyDuty/ViewEditDutyTableDialog';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import ToastNotification from '../../../components/common/ToastNotification';
import { DutySettings, DutyTable, DutyActivation } from '../../../types/dailyDuty';

const DailyDutyPage: React.FC = () => {
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [showReportsDialog, setShowReportsDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  
  const [settings, setSettings] = useState<DutySettings | null>(null);
  const [tables, setTables] = useState<DutyTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<DutyTable | null>(null);
  const [tableToDelete, setTableToDelete] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    isVisible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>({
    isVisible: false,
    type: 'success',
    message: '',
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ isVisible: true, type, message });
  };

  const handleSaveSettings = (newSettings: DutySettings) => {
    setSettings(newSettings);
    setShowSettingsDialog(false);
    showToast('success', 'تم حفظ الإعدادات بنجاح');
  };

  const handleCreateTable = () => {
    if (!settings) {
      showToast('warning', 'يرجى إعداد إعدادات المناوبة أولاً');
      setShowSettingsDialog(true);
      return;
    }
    setShowCreateDialog(true);
  };

  const handleActivationTracking = () => {
    if (tables.length === 0) {
      showToast('warning', 'لا توجد جداول مناوبة. يرجى إنشاء جدول أولاً');
      return;
    }
    setShowActivationDialog(true);
  };

  const handleSaveActivations = (activations: DutyActivation[]) => {
    console.log('حفظ تفعيل المناوبة:', activations);
    setShowActivationDialog(false);
    showToast('success', 'تم حفظ متابعة التفعيل بنجاح');
  };

  const handleDeleteAll = () => {
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAll = () => {
    setTables([]);
    setSettings(null);
    showToast('success', 'تم حذف جميع الجداول والبيانات بنجاح');
  };

  const handleViewTable = (index: number) => {
    setSelectedTable(tables[index]);
    setShowViewDialog(true);
  };

  const handleSaveEditedTable = (updatedTable: DutyTable) => {
    const updatedTables = tables.map(table => 
      table.id === updatedTable.id ? updatedTable : table
    );
    setTables(updatedTables);
    setShowViewDialog(false);
    setSelectedTable(null);
    showToast('success', 'تم حفظ التعديلات بنجاح');
  };

  const handleDeleteTable = (index: number) => {
    setTableToDelete(index);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTable = () => {
    if (tableToDelete !== null) {
      const updatedTables = tables.filter((_, index) => index !== tableToDelete);
      setTables(updatedTables);
      setTableToDelete(null);
      showToast('success', 'تم حذف الجدول بنجاح');
    }
  };

  const handleSendNotifications = () => {
    setShowSendDialog(true);
  };

  const handleCreateNewTable = (newTable: DutyTable) => {
    try {
      console.log('حفظ جدول جديد:', newTable);
      setTables(prevTables => [...prevTables, newTable]);
      setShowCreateDialog(false);
      showToast('success', 'تم إنشاء جدول المناوبة بنجاح');
    } catch (error) {
      console.error('خطأ في حفظ الجدول:', error);
      showToast('error', 'حدث خطأ أثناء حفظ الجدول');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-1 pb-8 px-4 sm:px-6 lg:px-8 font-kufi" style={{ direction: 'rtl' }}>
      
      {/* عنوان الصفحة */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">المناوبة اليومية</h1>
          </div>
        </div>
      </div>

      {/* الشريط الموحد: العمليات الأساسية */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="pt-6 pb-6 px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
              {/* زر إعدادات المناوبة */}
              <button
                onClick={() => setShowSettingsDialog(true)}
                className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">إعدادات المناوبة</span>
              </button>

              {/* زر إنشاء جدول */}
              <button
                onClick={handleCreateTable}
                className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">إنشاء جدول</span>
              </button>

              {/* زر متابعة التفعيل */}
              <button
                onClick={handleActivationTracking}
                className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">متابعة التفعيل</span>
              </button>

              {/* زر التقارير */}
              <button
                onClick={() => setShowReportsDialog(true)}
                className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">تقارير المناوبة</span>
              </button>

              {/* زر الإرسال */}
              <button
                onClick={handleSendNotifications}
                className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="text-sm">إرسال</span>
              </button>

              {/* زر الحذف */}
              <button
                onClick={handleDeleteAll}
                className="bg-red-600 hover:bg-red-700 text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">حذف الكل</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* جدول المناوبة اليومية */}
        {tables.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#818cf8] p-1.5 rounded-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">جدول المناوبة اليومية</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#818cf8] text-white">
                    <th className="px-3 py-2 text-center text-sm font-bold border-l border-white/20">الجدول</th>
                    <th className="px-3 py-2 text-center text-sm font-bold border-l border-white/20">يوم وتاريخ الإنشاء</th>
                    <th className="px-3 py-2 text-center text-sm font-bold border-l border-white/20">أنشئ بواسطة</th>
                    <th className="px-3 py-2 text-center text-sm font-bold">التقرير اليومي</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table, index) => {
                    // التحقق من وجود البيانات المطلوبة
                    const tableDataCount = table.tableData?.length || 0;
                    // حساب يوم وتاريخ الإنشاء
                    const createdDate = table.createdAt ? new Date(table.createdAt) : new Date();
                    const dayName = createdDate.toLocaleDateString('ar-SA', { weekday: 'long' });
                    const dateStr = createdDate.toLocaleDateString('ar-SA');
                    
                    return (
                      <tr key={table.id || index} className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}>
                        <td className="px-3 py-2 text-center text-sm font-bold text-[#4f46e5]">
                          {index === 0 ? 'الأول' : index === 1 ? 'الثاني' : index === 2 ? 'الثالث' : index === 3 ? 'الرابع' : index === 4 ? 'الخامس' : `الجدول ${index + 1}`}
                        </td>
                        <td className="px-3 py-2 text-center text-sm text-gray-700">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-gray-800">{dayName}</span>
                            <span className="text-xs text-gray-600 mt-1">{dateStr}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center text-sm text-gray-700 font-medium">
                          {table.userId === 'admin' ? 'مسؤول النظام' : table.educationalAffairsVice ? 'وكيل' : 'مدير'}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleViewTable(index)}
                              className="p-1.5 bg-[#818cf8] text-white rounded-md hover:bg-[#6366f1] transition-all shadow-sm"
                              title="عرض الجدول"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTable(index)}
                              className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all shadow-sm"
                              title="حذف الجدول"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
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

        {/* رسالة عدم وجود بيانات */}
        {!settings && tables.length === 0 && (
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-8 text-center">
            <Settings className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-indigo-900 mb-2">مرحباً بك في نظام المناوبة اليومية</h3>
            <p className="text-indigo-700 mb-4">
              للبدء، يرجى الضغط على زر "إعدادات المناوبة" لإعداد النظام
            </p>
            <button
              onClick={() => setShowSettingsDialog(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium inline-flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              إعداد النظام الآن
            </button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {settings && (
        <DutySettingsDialog
          isOpen={showSettingsDialog}
          onClose={() => setShowSettingsDialog(false)}
          onSave={handleSaveSettings}
          initialSettings={settings}
        />
      )}
      
      {!settings && (
        <DutySettingsDialog
          isOpen={showSettingsDialog}
          onClose={() => setShowSettingsDialog(false)}
          onSave={handleSaveSettings}
        />
      )}

      {/* Dialogs للإنشاء والتفعيل والتقارير */}
      
      {settings && (
        <CreateDutyTableDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          settings={settings}
          onSave={handleCreateNewTable}
          existingTables={tables}
        />
      )}

      {/* نافذة متابعة تفعيل المناوبة */}
      <DutyActivationTrackingDialog
        isOpen={showActivationDialog}
        onClose={() => setShowActivationDialog(false)}
        onSave={handleSaveActivations}
      />

      {/* نافذة تقارير المناوبة */}
      <DutyReportsDialog
        isOpen={showReportsDialog}
        onClose={() => setShowReportsDialog(false)}
      />

      {/* نافذة إرسال الإشعارات */}
      <SendDutyNotificationsDialog
        isOpen={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        dutySchedule={tables.flatMap(table => {
          if (!table.tableData || !Array.isArray(table.tableData)) {
            return [];
          }
          return table.tableData.flatMap(dayData => {
            if (!dayData.dutyGuards || !Array.isArray(dayData.dutyGuards)) {
              return [];
            }
            return dayData.dutyGuards.map(guard => ({
              guardId: guard.teacherId || guard.id || '',
              guardName: guard.name || 'غير محدد',
              date: dayData.date || '',
              day: dayData.day || ''
            }));
          });
        })}
      />

      {/* نافذة عرض وتعديل الجدول */}
      <ViewEditDutyTableDialog
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setSelectedTable(null);
        }}
        table={selectedTable}
        onSave={handleSaveEditedTable}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setTableToDelete(null);
        }}
        onConfirm={confirmDeleteTable}
        title="تأكيد حذف الجدول"
        message={"هل أنت متأكد من رغبتك في حذف هذا الجدول؟\n\nملاحظة: هذا الإجراء لا يمكن التراجع عنه"}
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />

      <ConfirmDialog
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={confirmDeleteAll}
        title="تأكيد حذف جميع البيانات"
        message={"هل أنت متأكد من رغبتك في حذف جميع جداول المناوبة اليومية والبيانات المدخلة؟\n\n⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه\n\nسيتم حذف:\n• جميع جداول المناوبة المنشأة\n• الإعدادات الحالية\n• بيانات التفعيل والمتابعة\n\n✓ سيتم الاحتفاظ بـ:\n• التقارير المؤرشفة (لمدة عام دراسي)\n• سجلات الإرسال السابقة"}
        confirmText="حذف الكل"
        cancelText="إلغاء"
        type="danger"
      />

      {/* Toast Notifications */}
      <ToastNotification
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
};

export default DailyDutyPage;
