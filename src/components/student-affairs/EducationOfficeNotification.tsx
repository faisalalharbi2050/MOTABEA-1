import React from 'react';
import { X, Printer } from 'lucide-react';

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

interface EducationOfficeNotificationProps {
  student: Student;
  absenceDays: AbsenceDay[];
  totalAbsenceDays: number;
  onClose: () => void;
}

const EducationOfficeNotification: React.FC<EducationOfficeNotificationProps> = ({
  student,
  absenceDays,
  totalAbsenceDays,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const today = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* رأس النافذة - لا يُطبع */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl sticky top-0 z-10 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">إشعار إدارة التعليم</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
                title="طباعة"
              >
                <Printer className="h-6 w-6" />
              </button>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
                title="إغلاق"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* محتوى النموذج - قابل للطباعة */}
        <div className="p-8 font-kufi" style={{ direction: 'rtl' }}>
          {/* ترويسة رسمية */}
          <div className="text-center mb-8 border-b-4 border-red-600 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1 mx-4">
                <h1 className="text-4xl font-bold text-red-600 mb-3">المملكة العربية السعودية</h1>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">وزارة التعليم</h2>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">إدارة التعليم بـ ...........................</h3>
                <h4 className="text-xl font-semibold text-gray-600">مدرسة ...........................</h4>
              </div>
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            </div>
            <div className="bg-red-600 text-white py-4 rounded-lg shadow-lg">
              <p className="text-2xl font-bold">إشعار رسمي بشأن غياب طالب</p>
              <p className="text-sm mt-1">وفقاً للوائح وزارة التعليم</p>
            </div>
          </div>

          {/* رقم الإشعار والتاريخ */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-600">
              <p className="text-lg">
                <span className="font-bold text-red-700">رقم الإشعار:</span>
                <span className="mx-2 text-gray-800">.................</span>
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-600">
              <p className="text-lg">
                <span className="font-bold text-red-700">التاريخ:</span>
                <span className="mx-2 text-gray-800">{today}</span>
              </p>
            </div>
          </div>

          {/* المرسل إليه */}
          <div className="mb-6 bg-gray-100 p-5 rounded-lg border-r-4 border-red-600">
            <p className="text-xl font-bold text-gray-800">
              إلى: <span className="text-red-600">إدارة التعليم - قسم التوجيه والإرشاد</span>
            </p>
          </div>

          {/* الموضوع */}
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-500 rounded-lg p-5">
            <p className="text-xl font-bold text-gray-800 mb-2">
              الموضوع: <span className="text-red-700">إشعار بتجاوز الطالب الحد المسموح للغياب</span>
            </p>
          </div>

          {/* المقدمة */}
          <div className="mb-6 p-5 leading-relaxed text-lg">
            <p className="text-gray-800">السلام عليكم ورحمة الله وبركاته،،،</p>
            <p className="text-gray-800 mt-3">
              تحية طيبة وبعد،
            </p>
          </div>

          {/* بيانات الطالب - مميزة */}
          <div className="mb-8 border-4 border-red-600 rounded-xl p-6 bg-red-50 shadow-lg">
            <h3 className="text-2xl font-bold text-red-700 mb-6 text-center bg-white py-3 rounded-lg">
              بيانات الطالب المتغيب
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border-2 border-red-400">
                <p className="text-gray-600 text-sm mb-1">اسم الطالب</p>
                <p className="text-xl font-bold text-gray-900">{student.name}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-red-400">
                <p className="text-gray-600 text-sm mb-1">رقم الطالب</p>
                <p className="text-xl font-bold text-gray-900">{student.studentId}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-red-400">
                <p className="text-gray-600 text-sm mb-1">الصف الدراسي</p>
                <p className="text-xl font-bold text-gray-900">{student.grade}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-red-400">
                <p className="text-gray-600 text-sm mb-1">الفصل</p>
                <p className="text-xl font-bold text-gray-900">{student.classRoom}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-red-400 col-span-2">
                <p className="text-gray-600 text-sm mb-1">جوال ولي الأمر</p>
                <p className="text-xl font-bold text-gray-900">{student.guardianPhone}</p>
              </div>
            </div>
          </div>

          {/* بيانات الغياب - مميزة بشكل خاص */}
          <div className="mb-8 border-4 border-red-700 rounded-xl p-6 bg-gradient-to-br from-red-50 to-red-100 shadow-xl">
            <h3 className="text-2xl font-bold text-red-800 mb-6 text-center bg-white py-3 rounded-lg border-2 border-red-700">
              ⚠️ بيانات الغياب - حالة حرجة ⚠️
            </h3>
            
            <div className="mb-6 bg-white p-6 rounded-lg border-3 border-red-600 shadow-md">
              <div className="flex items-center justify-center gap-4">
                <span className="text-2xl font-bold text-red-700">إجمالي أيام الغياب:</span>
                <div className="bg-red-600 text-white px-8 py-4 rounded-xl">
                  <span className="text-4xl font-bold">{totalAbsenceDays}</span>
                  <span className="text-xl mr-2">يوم</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-red-500">
              <p className="font-bold text-red-800 mb-4 text-xl text-center">تفاصيل أيام الغياب وتواريخها</p>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {absenceDays.map((day, index) => (
                  <div key={index} className="bg-red-50 p-4 rounded-lg border-r-4 border-red-600 hover:bg-red-100 transition-colors">
                    <p className="text-gray-900 font-semibold flex items-center gap-2">
                      <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span>{formatDate(day.date)}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* الإجراءات المتخذة */}
          <div className="mb-8 border-2 border-orange-500 rounded-lg p-6 bg-orange-50">
            <h3 className="text-xl font-bold text-orange-700 mb-4 border-b-2 border-orange-500 pb-2">
              الإجراءات التي تم اتخاذها من قبل المدرسة
            </h3>
            <div className="space-y-3 text-lg text-gray-800">
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">✓</span>
                <p>تم التواصل مع ولي الأمر عبر الهاتف وإبلاغه بغياب الطالب</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">✓</span>
                <p>تم إرسال رسائل نصية متكررة لولي الأمر</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">✓</span>
                <p>تم تحويل الطالب للموجه الطلابي</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">✓</span>
                <p>تم استدعاء ولي الأمر وأخذ تعهد خطي منه</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">✓</span>
                <p>تم عرض الحالة على لجنة التوجيه والإرشاد</p>
              </div>
            </div>
          </div>

          {/* المطلوب */}
          <div className="mb-8 border-3 border-blue-600 rounded-lg p-6 bg-blue-50">
            <h3 className="text-xl font-bold text-blue-700 mb-4">المطلوب:</h3>
            <p className="text-lg text-gray-800 leading-relaxed">
              نظراً لتجاوز الطالب الحد المسموح به للغياب وفقاً للوائح وزارة التعليم، وبعد استنفاد جميع الإجراءات 
              التوجيهية والإرشادية من قبل المدرسة، نرفع لسعادتكم هذا الإشعار الرسمي لاتخاذ ما ترونه مناسباً 
              وفقاً للأنظمة واللوائح المعتمدة.
            </p>
          </div>

          {/* التوقيعات */}
          <div className="mt-12 space-y-8">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mb-8 border-b-2 border-gray-400 pb-2">
                  <p className="text-lg font-bold text-gray-800">وكيل شؤون الطلاب</p>
                </div>
                <div className="space-y-3">
                  <div className="border-b-2 border-gray-400 pb-2">
                    <span className="text-gray-600 text-sm">الاسم</span>
                  </div>
                  <div className="border-b-2 border-gray-400 pb-2">
                    <span className="text-gray-600 text-sm">التوقيع</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="mb-8 border-b-2 border-gray-400 pb-2">
                  <p className="text-lg font-bold text-gray-800">المرشد الطلابي</p>
                </div>
                <div className="space-y-3">
                  <div className="border-b-2 border-gray-400 pb-2">
                    <span className="text-gray-600 text-sm">الاسم</span>
                  </div>
                  <div className="border-b-2 border-gray-400 pb-2">
                    <span className="text-gray-600 text-sm">التوقيع</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="mb-8 border-b-2 border-gray-400 pb-2">
                  <p className="text-lg font-bold text-gray-800">قائد المدرسة</p>
                </div>
                <div className="space-y-3">
                  <div className="border-b-2 border-gray-400 pb-2">
                    <span className="text-gray-600 text-sm">الاسم</span>
                  </div>
                  <div className="border-b-2 border-gray-400 pb-2">
                    <span className="text-gray-600 text-sm">التوقيع</span>
                  </div>
                </div>
              </div>
            </div>

            {/* الختم */}
            <div className="text-center mt-12">
              <div className="inline-flex border-4 border-red-600 rounded-full w-40 h-40 items-center justify-center shadow-lg">
                <div className="text-center">
                  <p className="text-red-600 font-bold text-lg">ختم المدرسة</p>
                  <p className="text-red-500 text-xs mt-1">الرسمي</p>
                </div>
              </div>
            </div>
          </div>

          {/* ملاحظة مهمة */}
          <div className="mt-8 bg-red-100 border-r-4 border-red-600 p-4 rounded">
            <p className="text-sm text-red-800">
              <strong>ملاحظة مهمة:</strong> هذا الإشعار رسمي ويجب حفظه في ملف الطالب والرجوع إليه عند الحاجة.
            </p>
          </div>
        </div>
      </div>

      {/* أنماط الطباعة */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed > div {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EducationOfficeNotification;
