import React, { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  studentId: string;
  classRoom: string;
  grade: string;
  guardianPhone: string;
}

interface AbsenceDay {
  date: string;
  day: string;
}

interface SendMessageModalProps {
  student: Student;
  absenceDays: AbsenceDay[];
  totalAbsenceDays: number;
  messageType: '3days' | '5days' | '10days';
  onClose: () => void;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  student,
  absenceDays,
  totalAbsenceDays,
  messageType,
  onClose
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric'
    });
  };

  const getDefaultMessage = () => {
    const absenceDatesText = absenceDays
      .map((day, index) => `${index + 1}. ${formatDate(day.date)}`)
      .join('\n');

    switch (messageType) {
      case '3days':
        return `السلام عليكم ورحمة الله وبركاته
ولي أمر الطالب / ${student.name}

نحيطكم علماً بأن نجلكم قد تغيب عن المدرسة لمدة ${totalAbsenceDays} أيام

تواريخ الغياب:
${absenceDatesText}

نأمل من سعادتكم متابعة انتظام ابنكم في الدراسة.

مع خالص التحية والتقدير
إدارة المدرسة`;

      case '5days':
        return `السلام عليكم ورحمة الله وبركاته
ولي أمر الطالب / ${student.name}

نحيطكم علماً بأن نجلكم قد تغيب عن المدرسة لمدة ${totalAbsenceDays} أيام

تواريخ الغياب:
${absenceDatesText}

نأمل من سعادتكم الحضور إلى المدرسة لمناقشة أسباب الغياب واتخاذ الإجراءات اللازمة.

مع خالص التحية والتقدير
إدارة المدرسة`;

      case '10days':
        return `السلام عليكم ورحمة الله وبركاته
ولي أمر الطالب / ${student.name}

نحيطكم علماً بأن نجلكم قد تجاوز الحد المسموح للغياب حيث بلغ ${totalAbsenceDays} يوماً

تواريخ الغياب:
${absenceDatesText}

تم رفع الأمر لإدارة التعليم وفقاً للوائح المعتمدة.
يرجى التواصل العاجل مع إدارة المدرسة.

مع خالص التحية والتقدير
إدارة المدرسة`;

      default:
        return '';
    }
  };

  const [message, setMessage] = useState(getDefaultMessage());
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    
    // محاكاة إرسال الرسالة
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert(`تم إرسال الرسالة بنجاح إلى ولي أمر الطالب ${student.name}\nرقم الجوال: ${student.guardianPhone}`);
    
    setSending(false);
    onClose();
  };

  const getModalTitle = () => {
    switch (messageType) {
      case '3days':
        return 'إرسال رسالة - غياب 3 أيام';
      case '5days':
        return 'إرسال رسالة - غياب 5 أيام';
      case '10days':
        return 'إرسال رسالة - تجاوز الحد المسموح';
      default:
        return 'إرسال رسالة';
    }
  };

  const getModalColor = () => {
    switch (messageType) {
      case '3days':
        return 'from-yellow-500 to-yellow-600';
      case '5days':
        return 'from-orange-500 to-orange-600';
      case '10days':
        return 'from-red-600 to-red-700';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* رأس النافذة */}
        <div className={`bg-gradient-to-r ${getModalColor()} p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-white" />
              <h2 className="text-2xl font-bold text-white">{getModalTitle()}</h2>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
              title="إغلاق"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* محتوى النافذة */}
        <div className="p-6 font-kufi" style={{ direction: 'rtl' }}>
          {/* بيانات المستلم */}
          <div className="mb-6 bg-gray-50 border-2 border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-3">بيانات المستلم:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">اسم الطالب</p>
                <p className="text-lg font-semibold text-gray-900">{student.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الجوال</p>
                <p className="text-lg font-semibold text-gray-900" dir="ltr">{student.guardianPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الصف والفصل</p>
                <p className="text-lg font-semibold text-gray-900">{student.grade} - {student.classRoom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">عدد أيام الغياب</p>
                <p className="text-lg font-semibold text-red-600">{totalAbsenceDays} يوم</p>
              </div>
            </div>
          </div>

          {/* محتوى الرسالة */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              نص الرسالة: <span className="text-sm text-gray-500">(يمكنك تعديل النص كما ترغب)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-80 p-4 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] focus:ring-opacity-20 transition-all resize-none font-kufi text-lg leading-relaxed"
              style={{ direction: 'rtl' }}
              placeholder="اكتب نص الرسالة هنا..."
            />
            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
              <span>عدد الأحرف: {message.length}</span>
              <span>عدد الكلمات: {message.trim().split(/\s+/).length}</span>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-semibold"
            >
              إلغاء
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all flex items-center gap-2 ${
                sending || !message.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>إرسال الرسالة</span>
                </>
              )}
            </button>
          </div>

          {/* ملاحظة */}
          <div className="mt-6 bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>ملاحظة:</strong> سيتم إرسال الرسالة عبر نظام الرسائل النصية SMS إلى رقم جوال ولي الأمر المسجل في النظام.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal;
