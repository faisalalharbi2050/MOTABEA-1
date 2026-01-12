import React, { useState, useEffect } from 'react';
import { Send, X, Search, CheckSquare, Square, Users, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  phone: string;
  type: 'teacher' | 'admin';
  assignedDay?: string;
}

interface SendNotificationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supervisionData?: any;
}

const SendNotificationsDialog: React.FC<SendNotificationsDialogProps> = ({
  isOpen,
  onClose,
  supervisionData
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    failed?: Array<{ name: string; reason: string }>;
  } | null>(null);

  // قائمة الموظفين (المعلمين والإداريين)
  const [employees, setEmployees] = useState<Employee[]>([]);

  // تحميل بيانات الموظفين
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      generateDefaultMessage();
    }
  }, [isOpen, supervisionData]);

  const loadEmployees = () => {
    // جلب المعلمين من localStorage
    const teachersData = localStorage.getItem('teachers');
    const teachers: Employee[] = teachersData 
      ? JSON.parse(teachersData).map((t: any) => ({
          id: `teacher-${t.id}`,
          name: t.name || t.fullName || 'غير محدد',
          phone: t.phone || t.mobile || '',
          type: 'teacher' as const,
          assignedDay: getAssignedDay(t.id, 'teacher')
        }))
      : [];

    // جلب الإداريين من localStorage
    const adminsData = localStorage.getItem('administrators');
    const admins: Employee[] = adminsData 
      ? JSON.parse(adminsData).map((a: any) => ({
          id: `admin-${a.id}`,
          name: a.name || a.fullName || 'غير محدد',
          phone: a.phone || a.mobile || '',
          type: 'admin' as const,
          assignedDay: getAssignedDay(a.id, 'admin')
        }))
      : [];

    // دمج القائمتين
    const allEmployees = [...teachers, ...admins];
    setEmployees(allEmployees);

    // تحديد الموظفين الذين لديهم إشراف تلقائياً
    const employeesWithSupervision = allEmployees
      .filter(emp => emp.assignedDay)
      .map(emp => emp.id);
    setSelectedEmployees(employeesWithSupervision);
  };

  const getAssignedDay = (employeeId: string, type: string): string | undefined => {
    // هنا يمكن جلب اليوم المخصص من بيانات جدول الإشراف
    // سيتم تطويرها لاحقاً للربط مع البيانات الفعلية
    return undefined;
  };

  const generateDefaultMessage = () => {
    const defaultMessage = `المكرم/ة، نشعركم بأنه تم إسناد مهمة الإشراف اليومي لكم في يوم [اليوم المخصص] وفق الجدول المنشأ للإشراف اليومي، شاكرين تعاونكم،،،`;
    setMessage(defaultMessage);
  };

  const getMessageForEmployee = (employee: Employee): string => {
    if (employee.assignedDay) {
      return message.replace('[اليوم المخصص]', employee.assignedDay);
    }
    return message;
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.phone.includes(searchTerm)
  );

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAll = () => {
    setSelectedEmployees(filteredEmployees.map(emp => emp.id));
  };

  const deselectAll = () => {
    setSelectedEmployees([]);
  };

  const handleSendNotifications = async () => {
    if (selectedEmployees.length === 0) {
      alert('الرجاء اختيار موظف واحد على الأقل');
      return;
    }

    if (!message.trim()) {
      alert('الرجاء كتابة محتوى الرسالة');
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      // محاكاة إرسال الرسائل
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedEmployeesData = employees.filter(emp => 
        selectedEmployees.includes(emp.id)
      );

      // محاكاة نتائج الإرسال
      const failed: Array<{ name: string; reason: string }> = [];
      
      selectedEmployeesData.forEach(emp => {
        // محاكاة فشل عشوائي (10% احتمال)
        if (Math.random() < 0.1) {
          failed.push({
            name: emp.name,
            reason: emp.phone ? 'رقم الهاتف غير صحيح' : 'رقم الهاتف غير مسجل'
          });
        }
      });

      if (failed.length === 0) {
        setSendResult({
          success: true,
          message: `تم إرسال الإشعارات بنجاح إلى ${selectedEmployees.length} موظف`
        });
      } else {
        setSendResult({
          success: false,
          message: `تم إرسال ${selectedEmployees.length - failed.length} من ${selectedEmployees.length} رسالة`,
          failed
        });
      }
    } catch (error) {
      setSendResult({
        success: false,
        message: 'حدث خطأ أثناء إرسال الإشعارات',
        failed: []
      });
    } finally {
      setSending(false);
    }
  };

  const handleRetry = () => {
    setSendResult(null);
    handleSendNotifications();
  };

  const handleClose = () => {
    setSelectedEmployees([]);
    setSearchTerm('');
    setMessage('');
    setShowPreview(false);
    setSendResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-kufi" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white p-4 rounded-t-xl flex justify-between items-center z-10 shadow-lg">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            <h2 className="text-xl font-bold">إرسال إشعارات الإشراف اليومي</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!showPreview && !sendResult ? (
            <>
              {/* اختيار الموظفين */}
              <div>
                <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
                  <Users className="w-5 h-5 text-[#4f46e5]" />
                  اختيار الموظفين
                </label>

                {/* شريط البحث */}
                <div className="relative mb-3">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن موظف بالاسم أو رقم الهاتف..."
                    className="w-full pr-10 pl-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all text-sm"
                  />
                </div>

                {/* أزرار التحديد */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={selectAll}
                    className="flex-1 px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                  >
                    <CheckSquare className="w-4 h-4" />
                    تحديد الكل
                  </button>
                  <button
                    onClick={deselectAll}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                  >
                    <Square className="w-4 h-4" />
                    إلغاء الكل
                  </button>
                </div>

                {/* قائمة الموظفين */}
                <div className="space-y-1 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => (
                      <label
                        key={emp.id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-150 border ${
                          selectedEmployees.includes(emp.id)
                            ? 'bg-gradient-to-r from-[#4f46e5]/10 to-[#6366f1]/10 border-[#4f46e5]'
                            : 'bg-white border-transparent hover:border-[#6366f1]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(emp.id)}
                            onChange={() => toggleEmployee(emp.id)}
                            className="w-4 h-4 text-[#4f46e5] rounded focus:ring-[#4f46e5] border-gray-300"
                          />
                          <div>
                            <div className="font-semibold text-gray-800">{emp.name}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded ${
                                emp.type === 'teacher' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {emp.type === 'teacher' ? 'معلم' : 'إداري'}
                              </span>
                              {emp.phone && (
                                <span className="text-gray-500">📱 {emp.phone}</span>
                              )}
                              {!emp.phone && (
                                <span className="text-red-500 text-xs">⚠️ رقم الهاتف غير مسجل</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {emp.assignedDay && (
                          <div className="text-xs text-[#4f46e5] font-semibold">
                            {emp.assignedDay}
                          </div>
                        )}
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد نتائج للبحث
                    </div>
                  )}
                </div>

                {selectedEmployees.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <span className="text-sm text-blue-800">
                      <strong>تم اختيار:</strong> {selectedEmployees.length} موظف
                    </span>
                  </div>
                )}
              </div>

              {/* محتوى الرسالة */}
              <div>
                <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
                  <MessageSquare className="w-5 h-5 text-[#4f46e5]" />
                  محتوى الرسالة
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all resize-none text-sm leading-relaxed"
                  placeholder="اكتب محتوى الرسالة هنا..."
                />
                <div className="mt-2 text-xs text-gray-500">
                  💡 سيتم استبدال [اليوم المخصص] بالبيانات الفعلية لكل موظف
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={selectedEmployees.length === 0 || !message.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white rounded-lg hover:from-[#4f46e5] hover:to-[#6366f1] transition-all duration-200 font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <MessageSquare className="w-5 h-5" />
                  معاينة الرسائل
                </button>
                <button
                  onClick={handleSendNotifications}
                  disabled={selectedEmployees.length === 0 || !message.trim() || sending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جارٍ الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      إرسال الآن
                    </>
                  )}
                </button>
              </div>
            </>
          ) : showPreview ? (
            /* معاينة الرسائل */
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-800 mb-2">معاينة الرسائل</h3>
                <p className="text-sm text-blue-700">
                  سيتم إرسال رسالة واتساب إلى <strong>{selectedEmployees.length}</strong> موظف
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {employees
                  .filter(emp => selectedEmployees.includes(emp.id))
                  .map(emp => (
                    <div key={emp.id} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-gray-800">{emp.name}</div>
                        <div className="text-xs text-gray-500">
                          {emp.phone || 'رقم الهاتف غير متوفر'}
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">
                        {getMessageForEmployee(emp)}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-bold"
                >
                  رجوع
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    handleSendNotifications();
                  }}
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Send className="w-5 h-5" />
                  تأكيد الإرسال
                </button>
              </div>
            </div>
          ) : sendResult ? (
            /* نتيجة الإرسال */
            <div className="space-y-4">
              <div className={`border-2 rounded-lg p-6 text-center ${
                sendResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                {sendResult.success ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      تم الإرسال بنجاح!
                    </h3>
                    <p className="text-green-700">{sendResult.message}</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-yellow-800 mb-2">
                      تحذير
                    </h3>
                    <p className="text-yellow-700 mb-4">{sendResult.message}</p>

                    {sendResult.failed && sendResult.failed.length > 0 && (
                      <div className="mt-4 text-right">
                        <h4 className="font-bold text-yellow-800 mb-2">الرسائل الفاشلة:</h4>
                        <div className="space-y-2">
                          {sendResult.failed.map((fail, index) => (
                            <div key={index} className="bg-white border border-yellow-300 rounded p-2 text-sm">
                              <strong>{fail.name}:</strong> {fail.reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-3">
                {!sendResult.success && sendResult.failed && sendResult.failed.length > 0 && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white rounded-lg hover:from-[#4338ca] hover:to-[#4f46e5] transition-all duration-200 font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-5 h-5" />
                    إعادة المحاولة
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-bold"
                >
                  إغلاق
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SendNotificationsDialog;
