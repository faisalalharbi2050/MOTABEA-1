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

interface ParentSummonFormProps {
  student: Student;
  absenceDays: AbsenceDay[];
  totalAbsenceDays: number;
  onClose: () => void;
}

const ParentSummonForm: React.FC<ParentSummonFormProps> = ({
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* رأس النافذة - لا يُطبع */}
        <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-6 rounded-t-2xl sticky top-0 z-10 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">استدعاء ولي أمر + تحويل للجنة التوجيه</h2>
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
          {/* ترويسة المدرسة */}
          <div className="text-center mb-8 border-b-4 border-[#4f46e5] pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="flex-1 mx-4">
                <h1 className="text-3xl font-bold text-[#4f46e5] mb-2">المملكة العربية السعودية</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">وزارة التعليم</h2>
                <h3 className="text-xl font-semibold text-gray-700">مدرسة ...........................</h3>
              </div>
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="bg-[#4f46e5] text-white py-3 rounded-lg">
              <p className="text-xl font-bold">استدعاء ولي أمر طالب</p>
            </div>
          </div>

          {/* التاريخ */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-lg">
              <span className="font-bold text-[#4f46e5]">التاريخ:</span> {today}
            </p>
          </div>

          {/* القسم الأول: استدعاء ولي الأمر */}
          <div className="mb-10 border-4 border-[#4f46e5] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-center text-[#4f46e5] mb-6 bg-blue-50 py-3 rounded-lg">
              القسم الأول: استدعاء ولي الأمر
            </h2>

            {/* بيانات الطالب */}
            <div className="mb-6 border-2 border-[#6366f1] rounded-lg p-6 bg-blue-50">
              <h3 className="text-xl font-bold text-[#6366f1] mb-4 border-b-2 border-[#6366f1] pb-2">
                بيانات الطالب
              </h3>
              <div className="grid grid-cols-2 gap-4 text-lg">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">اسم الطالب:</span>
                  <span className="text-gray-900 font-semibold">{student.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">رقم الطالب:</span>
                  <span className="text-gray-900 font-semibold">{student.studentId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">الصف:</span>
                  <span className="text-gray-900 font-semibold">{student.grade}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">الفصل:</span>
                  <span className="text-gray-900 font-semibold">{student.classRoom}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <span className="font-bold text-gray-700">جوال ولي الأمر:</span>
                  <span className="text-gray-900 font-semibold">{student.guardianPhone}</span>
                </div>
              </div>
            </div>

            {/* بيانات الغياب */}
            <div className="mb-6 border-2 border-red-500 rounded-lg p-6 bg-red-50">
              <h3 className="text-xl font-bold text-red-700 mb-4 border-b-2 border-red-500 pb-2">
                بيانات الغياب
              </h3>
              <div className="mb-4">
                <p className="text-lg">
                  <span className="font-bold text-red-700">عدد أيام الغياب:</span>
                  <span className="text-red-900 font-bold text-2xl mx-2">{totalAbsenceDays}</span>
                  <span className="text-red-700">يوم</span>
                </p>
              </div>
              <div>
                <p className="font-bold text-red-700 mb-3 text-lg">أيام الغياب وتواريخها:</p>
                <div className="grid grid-cols-1 gap-2">
                  {absenceDays.map((day, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-red-300">
                      <p className="text-gray-800">
                        <span className="font-semibold">{index + 1}.</span> {formatDate(day.date)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* نص الاستدعاء */}
            <div className="mb-6 bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6">
              <p className="text-lg text-gray-800 leading-relaxed mb-4">
                السيد ولي أمر الطالب / <strong>{student.name}</strong>
              </p>
              <p className="text-lg text-gray-800 leading-relaxed">
                السلام عليكم ورحمة الله وبركاته،،،
              </p>
              <p className="text-lg text-gray-800 leading-relaxed mt-4">
                نحيطكم علماً بأن نجلكم قد تغيب عن المدرسة لمدة <strong className="text-red-600">{totalAbsenceDays}</strong> أيام،
                ونظراً لأهمية انتظام الطالب في الدراسة، نأمل من سعادتكم الحضور إلى المدرسة لمناقشة أسباب الغياب 
                واتخاذ الإجراءات اللازمة لضمان انتظام نجلكم.
              </p>
            </div>

            {/* تعهد ولي الأمر */}
            <div className="mb-6 border-2 border-green-600 rounded-lg p-6 bg-green-50">
              <h3 className="text-xl font-bold text-green-700 mb-4 text-center">تعهد ولي الأمر</h3>
              <p className="text-lg text-gray-800 leading-relaxed mb-6">
                أتعهد أنا ولي أمر الطالب / <strong>{student.name}</strong> بالعمل على انتظام ابني في الدراسة وعدم 
                الغياب إلا لظروف قاهرة مع تقديم العذر الرسمي، وأتحمل المسؤولية الكاملة عن أي غياب مستقبلي.
              </p>
              <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">اسم ولي الأمر:</span>
                    <div className="border-b-2 border-gray-400 flex-1 mx-4"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">رقم الهوية:</span>
                    <div className="border-b-2 border-gray-400 flex-1 mx-4"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">التوقيع:</span>
                    <div className="border-b-2 border-gray-400 flex-1 mx-4"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">التاريخ:</span>
                    <div className="border-b-2 border-gray-400 flex-1 mx-4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* توقيع وكيل الطلاب */}
            <div className="text-center mt-8">
              <div className="inline-block border-2 border-[#4f46e5] rounded-lg p-6 bg-blue-50 w-64">
                <p className="font-bold text-[#4f46e5] mb-4">وكيل شؤون الطلاب</p>
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
          </div>

          {/* فاصل بين القسمين */}
          <div className="my-10 border-t-4 border-dashed border-[#6366f1]"></div>

          {/* القسم الثاني: تحويل للجنة التوجيه */}
          <div className="border-4 border-[#6366f1] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-center text-[#6366f1] mb-6 bg-indigo-50 py-3 rounded-lg">
              القسم الثاني: تحويل للجنة التوجيه والإرشاد الطلابي
            </h2>

            {/* نص التحويل */}
            <div className="mb-6 bg-purple-50 border-2 border-purple-500 rounded-lg p-6">
              <p className="text-lg text-gray-800 leading-relaxed">
                بناءً على استمرار غياب الطالب / <strong>{student.name}</strong> وبعد استدعاء ولي أمره،
                نحيل الحالة إلى لجنة التوجيه والإرشاد الطلابي لدراستها واتخاذ الإجراءات التوجيهية والإرشادية اللازمة.
              </p>
            </div>

            {/* إجراءات اللجنة */}
            <div className="mb-6 border-2 border-[#6366f1] rounded-lg p-6 bg-indigo-50">
              <h3 className="text-xl font-bold text-[#6366f1] mb-4 border-b-2 border-[#6366f1] pb-2">
                إجراءات لجنة التوجيه والإرشاد
              </h3>
              <div className="bg-white p-6 rounded-lg border border-gray-300 min-h-[150px]">
                <p className="text-gray-500 text-sm mb-2">تُعبأ بعد الطباعة:</p>
                <div className="space-y-3">
                  <div className="border-b-2 border-dotted border-gray-300 w-full h-8"></div>
                  <div className="border-b-2 border-dotted border-gray-300 w-full h-8"></div>
                  <div className="border-b-2 border-dotted border-gray-300 w-full h-8"></div>
                  <div className="border-b-2 border-dotted border-gray-300 w-full h-8"></div>
                </div>
              </div>
            </div>

            {/* جدول أعضاء اللجنة */}
            <div className="border-2 border-[#6366f1] rounded-lg overflow-hidden">
              <h3 className="text-xl font-bold text-white bg-[#6366f1] p-4 text-center">
                أعضاء لجنة التوجيه والإرشاد الطلابي
              </h3>
              <table className="w-full">
                <thead className="bg-indigo-100">
                  <tr>
                    <th className="border-2 border-[#6366f1] p-3 text-center font-bold">م</th>
                    <th className="border-2 border-[#6366f1] p-3 text-center font-bold">الاسم</th>
                    <th className="border-2 border-[#6366f1] p-3 text-center font-bold">الصفة</th>
                    <th className="border-2 border-[#6366f1] p-3 text-center font-bold">التوقيع</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <td className="border-2 border-gray-300 p-3 text-center">1</td>
                    <td className="border-2 border-gray-300 p-3"></td>
                    <td className="border-2 border-gray-300 p-3 text-center">رئيس اللجنة</td>
                    <td className="border-2 border-gray-300 p-3"></td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border-2 border-gray-300 p-3 text-center">2</td>
                    <td className="border-2 border-gray-300 p-3"></td>
                    <td className="border-2 border-gray-300 p-3 text-center">عضو</td>
                    <td className="border-2 border-gray-300 p-3"></td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-300 p-3 text-center">3</td>
                    <td className="border-2 border-gray-300 p-3"></td>
                    <td className="border-2 border-gray-300 p-3 text-center">عضو</td>
                    <td className="border-2 border-gray-300 p-3"></td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border-2 border-gray-300 p-3 text-center">4</td>
                    <td className="border-2 border-gray-300 p-3"></td>
                    <td className="border-2 border-gray-300 p-3 text-center">عضو</td>
                    <td className="border-2 border-gray-300 p-3"></td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-300 p-3 text-center">5</td>
                    <td className="border-2 border-gray-300 p-3"></td>
                    <td className="border-2 border-gray-300 p-3 text-center">عضو</td>
                    <td className="border-2 border-gray-300 p-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* الختم */}
          <div className="mt-12 text-center">
            <div className="inline-block border-4 border-[#4f46e5] rounded-full w-32 h-32 flex items-center justify-center">
              <p className="text-[#4f46e5] font-bold">ختم المدرسة</p>
            </div>
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

export default ParentSummonForm;
