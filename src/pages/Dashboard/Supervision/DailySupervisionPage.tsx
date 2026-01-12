import React, { useState } from 'react';
import { Settings, Plus, CheckCircle, BarChart3, Trash2, Send, UserCheck, Eye, Trash } from 'lucide-react';
import SupervisionSettingsDialog from '../../../components/DailySupervision/SupervisionSettingsDialog';
import CreateSupervisionTableDialog from '../../../components/DailySupervision/CreateSupervisionTableDialog';
import ActivationTrackingDialog from '../../../components/DailySupervision/ActivationTrackingDialog';
import ReportsDialog from '../../../components/DailySupervision/ReportsDialog';
import SendNotificationsDialog from '../../../components/DailySupervision/SendNotificationsDialog';
import ViewSupervisionTableDialog from '../../../components/DailySupervision/ViewSupervisionTableDialog';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import ToastNotification from '../../../components/common/ToastNotification';
import { SupervisionSettings, SupervisionTable, SupervisionActivation } from '../../../types/dailySupervision';

const DailySupervisionPage: React.FC = () => {
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [showReportsDialog, setShowReportsDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  
  const [settings, setSettings] = useState<SupervisionSettings | null>(null);
  const [tables, setTables] = useState<SupervisionTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<SupervisionTable | null>(null);
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

  const handleSaveSettings = (newSettings: SupervisionSettings) => {
    setSettings(newSettings);
    setShowSettingsDialog(false);
    showToast('success', 'تم حفظ الإعدادات بنجاح');
  };

  const handleCreateTable = (table: SupervisionTable) => {
    const newTable = {
      ...table,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTables([...tables, newTable]);
    setShowCreateDialog(false);
    showToast('success', 'تم إنشاء جدول الإشراف بنجاح');
  };

  const handleSaveActivation = (activations: SupervisionActivation[]) => {
    setShowActivationDialog(false);
    showToast('success', 'تم حفظ بيانات التفعيل بنجاح');
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

  const handleUpdateTable = (updatedTable: SupervisionTable) => {
    const updatedTables = tables.map((table) =>
      table === selectedTable ? { ...updatedTable, updatedAt: new Date().toISOString() } : table
    );
    setTables(updatedTables);
    setShowViewDialog(false);
    showToast('success', 'تم تحديث الجدول بنجاح');
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

  const getBreakTiming = (breakNumber: number) => {
    if (settings && settings.breakTimings) {
      const timing = settings.breakTimings.find(t => t.breakNumber === breakNumber);
      if (timing) {
        return `بعد الحصة ${timing.afterLesson}`;
      }
    }
    return 'غير محدد';
  };

  const handleSendNotifications = () => {
    setShowSendDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-kufi" style={{ direction: 'rtl' }}>
      
      {/* عنوان الصفحة */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">الإشراف اليومي</h1>
          </div>
        </div>
      </div>

      {/* الشريط الموحد: العمليات الأساسية */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="pt-6 pb-6 px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
              {/* زر إعدادات الإشراف */}
              <button
                onClick={() => setShowSettingsDialog(true)}
                className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">إعدادات الإشراف</span>
              </button>

              {/* زر إنشاء جدول */}
              <button
                onClick={() => {
                  if (!settings) {
                    showToast('warning', 'يرجى إعداد إعدادات الإشراف أولاً');
                    setShowSettingsDialog(true);
                    return;
                  }
                  setShowCreateDialog(true);
                }}
                className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3 rounded-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">إنشاء جدول</span>
              </button>

              {/* زر متابعة التفعيل */}
              <button
                onClick={() => {
                  if (tables.length === 0) {
                    showToast('warning', 'لا توجد جداول إشراف. يرجى إنشاء جدول أولاً');
                    return;
                  }
                  setShowActivationDialog(true);
                }}
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
                <span className="text-sm">تقارير الإشراف</span>
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
        {/* جدول الإشراف اليومي */}
        {tables.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#818cf8] p-1.5 rounded-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">جدول الإشراف اليومي</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#818cf8] text-white">
                    <th className="px-3 py-2 text-center text-sm font-bold border-l border-white/20">الجدول</th>
                    <th className="px-3 py-2 text-center text-sm font-bold border-l border-white/20">يوم وتاريخ الإنشاء</th>
                    <th className="px-3 py-2 text-center text-sm font-bold border-l border-white/20">أنشئ بواسطة</th>
                    <th className="px-3 py-2 text-center text-sm font-bold">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table, index) => (
                    <tr key={index} className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}>
                      <td className="px-3 py-2 text-center text-sm font-bold text-[#4f46e5]">
                        {index === 0 ? 'الأول' : index === 1 ? 'الثاني' : index === 2 ? 'الثالث' : index === 3 ? 'الرابع' : index === 4 ? 'الخامس' : `الجدول ${index + 1}`}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-700">
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{table.startDay}</span>
                          <span className="text-xs text-gray-500">
                            {table.createdAt ? new Date(table.createdAt).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'غير محدد'}
                          </span>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* رسالة عدم وجود بيانات */}
        {!settings && tables.length === 0 && (
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-8 text-center">
            <Settings className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-indigo-900 mb-2">مرحباً بك في نظام الإشراف اليومي</h3>
            <p className="text-indigo-700 mb-4">
              للبدء، يرجى الضغط على زر "إعدادات الإشراف" لإعداد النظام
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
        <>
          <SupervisionSettingsDialog
            isOpen={showSettingsDialog}
            onClose={() => setShowSettingsDialog(false)}
            onSave={handleSaveSettings}
            initialSettings={settings}
          />
          <CreateSupervisionTableDialog
            isOpen={showCreateDialog}
            onClose={() => setShowCreateDialog(false)}
            onCreate={handleCreateTable}
            settings={settings}
          />
        </>
      )}
      
      {!settings && (
        <SupervisionSettingsDialog
          isOpen={showSettingsDialog}
          onClose={() => setShowSettingsDialog(false)}
          onSave={handleSaveSettings}
        />
      )}

      <ActivationTrackingDialog
        isOpen={showActivationDialog}
        onClose={() => setShowActivationDialog(false)}
        onSave={handleSaveActivation}
      />

      <ReportsDialog
        isOpen={showReportsDialog}
        onClose={() => setShowReportsDialog(false)}
      />

      <SendNotificationsDialog
        isOpen={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        supervisionData={tables}
      />

      {selectedTable && (
        <ViewSupervisionTableDialog
          isOpen={showViewDialog}
          onClose={() => setShowViewDialog(false)}
          table={selectedTable}
          onUpdate={handleUpdateTable}
        />
      )}

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
        message={"هل أنت متأكد من رغبتك في حذف جميع جداول الإشراف والبيانات المدخلة؟\n\nملاحظة: هذا الإجراء لا يمكن التراجع عنه\nسيتم حذف جميع الجداول والإعدادات، ولكن سيتم الاحتفاظ بالتقارير المحفوظة"}
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

export default DailySupervisionPage;
