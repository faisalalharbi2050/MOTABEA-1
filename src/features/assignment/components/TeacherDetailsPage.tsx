/**
 * صفحة تفاصيل المعلم المنفردة
 * Individual Teacher Details Page
 */

import React from 'react';
import { ArrowRight, User, BookOpen, Clock, BarChart3, CheckCircle } from 'lucide-react';

interface TeacherAssignment {
  id: string;
  subject_name: string;
  classroom_name: string;
  hours_per_week: number;
  students_count: number;
}

interface TeacherDetailsPageProps {
  teacherId: string;
  onBack: () => void;
}

const TeacherDetailsPage: React.FC<TeacherDetailsPageProps> = ({ teacherId, onBack }) => {
  // بيانات تجريبية للمعلم (ستأتي من API لاحقاً)
  const teacherData = {
    '1': {
      id: '1',
      name: 'أحمد محمد السعدي',
      specialization: 'رياضيات',
      max_load: 24,
      current_load: 18,
      efficiency: 75, // نسبة النصاب
      assignments: [
        { id: '1', subject_name: 'الرياضيات', classroom_name: '1/1', hours_per_week: 5, students_count: 25 },
        { id: '2', subject_name: 'الرياضيات', classroom_name: '2/1', hours_per_week: 5, students_count: 28 },
        { id: '3', subject_name: 'الرياضيات', classroom_name: '3/1', hours_per_week: 6, students_count: 30 },
        { id: '4', subject_name: 'الإحصاء', classroom_name: '3/2', hours_per_week: 2, students_count: 29 }
      ]
    },
    '2': {
      id: '2',
      name: 'فاطمة أحمد النجار',
      specialization: 'لغة عربية',
      max_load: 24,
      current_load: 20,
      efficiency: 83,
      assignments: [
        { id: '1', subject_name: 'اللغة العربية', classroom_name: '1/1', hours_per_week: 6, students_count: 25 },
        { id: '2', subject_name: 'اللغة العربية', classroom_name: '1/2', hours_per_week: 6, students_count: 23 },
        { id: '3', subject_name: 'البلاغة', classroom_name: '3/1', hours_per_week: 4, students_count: 30 },
        { id: '4', subject_name: 'النحو', classroom_name: '2/1', hours_per_week: 4, students_count: 28 }
      ]
    }
    // يمكن إضافة المزيد من المعلمين هنا...
  };

  const teacher = teacherData[teacherId as keyof typeof teacherData];

  if (!teacher) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">معلم غير موجود</h2>
        <p className="text-gray-600 mb-4">لم يتم العثور على بيانات هذا المعلم</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للقائمة
        </button>
      </div>
    );
  }

  const getLoadStatus = (percentage: number) => {
    if (percentage < 50) return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'منخفض' };
    if (percentage < 80) return { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'متوسط' };
    if (percentage < 100) return { color: 'text-orange-600 bg-orange-50 border-orange-200', label: 'عالي' };
    return { color: 'text-red-600 bg-red-50 border-red-200', label: 'مكتمل' };
  };

  const loadStatus = getLoadStatus(teacher.efficiency);

  return (
    <div className="space-y-6" dir="rtl">
      {/* شريط التنقل */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة للقائمة</span>
        </button>
      </div>

      {/* معلومات المعلم الرئيسية */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* الهيدر */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{teacher.name}</h1>
              <p className="text-blue-100 text-lg">{teacher.specialization}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{teacher.efficiency}%</div>
              <div className="text-blue-200 text-sm">نسبة النصاب</div>
            </div>
          </div>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{teacher.current_load}</div>
              <div className="text-sm text-gray-600">الحصص الحالية</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{teacher.max_load}</div>
              <div className="text-sm text-gray-600">النصاب الأقصى</div>
            </div>
            
            <div className={`rounded-lg p-4 text-center border ${loadStatus.color}`}>
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{loadStatus.label}</div>
              <div className="text-sm opacity-75">حالة النصاب</div>
            </div>
          </div>

          {/* شريط النصاب البصري */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">مؤشر النصاب</span>
              <span className="text-sm text-gray-500">{teacher.current_load} من {teacher.max_load} حصة</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  teacher.efficiency < 50 ? 'bg-yellow-500' :
                  teacher.efficiency < 80 ? 'bg-blue-500' :
                  teacher.efficiency < 100 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${teacher.efficiency}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* الإسنادات التفصيلية */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">الإسنادات الحالية</h2>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {teacher.assignments.length} مادة
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4">
            {teacher.assignments.map((assignment, index) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{assignment.subject_name}</h3>
                    <p className="text-sm text-gray-600">
                      الصف {assignment.classroom_name} • {assignment.students_count} طالب
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {assignment.hours_per_week} حصة
                  </div>
                  <div className="text-xs text-gray-500">في الأسبوع</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* ملخص الإسنادات */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">ملخص الإسنادات:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-blue-600">{teacher.assignments.length}</div>
                <div className="text-xs text-gray-600">مواد مسندة</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">{teacher.current_load}</div>
                <div className="text-xs text-gray-600">حصة أسبوعية</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">
                  {teacher.assignments.reduce((sum, a) => sum + a.students_count, 0)}
                </div>
                <div className="text-xs text-gray-600">إجمالي الطلاب</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-600">{teacher.max_load - teacher.current_load}</div>
                <div className="text-xs text-gray-600">حصة متبقية</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailsPage;