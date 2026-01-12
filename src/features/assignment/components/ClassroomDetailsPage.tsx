/**
 * صفحة تفاصيل الفصل المنفردة
 * Individual Classroom Details Page
 */

import React from 'react';
import { ArrowRight, School, BookOpen, User, Check, X, AlertTriangle } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  weekly_hours: number;
  is_assigned: boolean;
  teacher_name?: string;
  teacher_specialization?: string;
}

interface ClassroomDetailsPageProps {
  classroomId: string;
  onBack: () => void;
}

const ClassroomDetailsPage: React.FC<ClassroomDetailsPageProps> = ({ classroomId, onBack }) => {
  // بيانات تجريبية للفصول (ستأتي من API لاحقاً)
  const classroomData = {
    '1-1': {
      id: '1-1',
      name: '1/1',
      level: 'الأول الابتدائي',
      students_count: 25,
      subjects: [
        { id: '1', name: 'الرياضيات', weekly_hours: 5, is_assigned: true, teacher_name: 'أحمد محمد السعدي', teacher_specialization: 'رياضيات' },
        { id: '2', name: 'اللغة العربية', weekly_hours: 6, is_assigned: true, teacher_name: 'فاطمة أحمد النجار', teacher_specialization: 'لغة عربية' },
        { id: '3', name: 'العلوم', weekly_hours: 4, is_assigned: true, teacher_name: 'خالد سعد العتيبي', teacher_specialization: 'علوم' },
        { id: '4', name: 'التربية الإسلامية', weekly_hours: 3, is_assigned: false },
        { id: '5', name: 'التربية البدنية', weekly_hours: 2, is_assigned: false },
        { id: '6', name: 'التربية الفنية', weekly_hours: 1, is_assigned: false }
      ]
    },
    '2-1': {
      id: '2-1',
      name: '2/1',
      level: 'الثاني الابتدائي',
      students_count: 28,
      subjects: [
        { id: '1', name: 'الرياضيات', weekly_hours: 5, is_assigned: true, teacher_name: 'أحمد محمد السعدي', teacher_specialization: 'رياضيات' },
        { id: '2', name: 'اللغة العربية', weekly_hours: 6, is_assigned: false },
        { id: '3', name: 'العلوم', weekly_hours: 4, is_assigned: false },
        { id: '4', name: 'التربية الإسلامية', weekly_hours: 3, is_assigned: true, teacher_name: 'نورا القحطاني', teacher_specialization: 'تربية إسلامية' },
        { id: '5', name: 'اللغة الإنجليزية', weekly_hours: 3, is_assigned: false },
        { id: '6', name: 'التربية البدنية', weekly_hours: 2, is_assigned: false },
        { id: '7', name: 'الحاسوب', weekly_hours: 1, is_assigned: false }
      ]
    },
    '3-1': {
      id: '3-1',
      name: '3/1',
      level: 'الثالث الابتدائي',
      students_count: 30,
      subjects: [
        { id: '1', name: 'الرياضيات', weekly_hours: 6, is_assigned: true, teacher_name: 'أحمد محمد السعدي', teacher_specialization: 'رياضيات' },
        { id: '2', name: 'اللغة العربية', weekly_hours: 7, is_assigned: false },
        { id: '3', name: 'العلوم', weekly_hours: 5, is_assigned: true, teacher_name: 'خالد سعد العتيبي', teacher_specialization: 'علوم' },
        { id: '4', name: 'التاريخ', weekly_hours: 3, is_assigned: true, teacher_name: 'عبدالرحمن الشمري', teacher_specialization: 'تاريخ وجغرافيا' },
        { id: '5', name: 'الجغرافيا', weekly_hours: 3, is_assigned: false },
        { id: '6', name: 'التربية الإسلامية', weekly_hours: 4, is_assigned: true, teacher_name: 'نورا القحطاني', teacher_specialization: 'تربية إسلامية' },
        { id: '7', name: 'اللغة الإنجليزية', weekly_hours: 4, is_assigned: false },
        { id: '8', name: 'التربية البدنية', weekly_hours: 2, is_assigned: false }
      ]
    }
  };

  const classroom = classroomData[classroomId as keyof typeof classroomData];

  if (!classroom) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">فصل غير موجود</h2>
        <p className="text-gray-600 mb-4">لم يتم العثور على بيانات هذا الفصل</p>
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

  const assignedSubjects = classroom.subjects.filter(s => s.is_assigned);
  const unassignedSubjects = classroom.subjects.filter(s => !s.is_assigned);
  const assignmentRate = Math.round((assignedSubjects.length / classroom.subjects.length) * 100);
  const totalHours = classroom.subjects.reduce((sum, s) => sum + s.weekly_hours, 0);
  const assignedHours = assignedSubjects.reduce((sum, s) => sum + s.weekly_hours, 0);

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

      {/* معلومات الفصل الرئيسية */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* الهيدر */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <School className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">الصف {classroom.name}</h1>
              <p className="text-green-100 text-lg">{classroom.level}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{assignmentRate}%</div>
              <div className="text-green-200 text-sm">نسبة الإسناد</div>
            </div>
          </div>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{classroom.students_count}</div>
              <div className="text-sm text-gray-600">طالب</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
              <div className="flex items-center justify-center mb-2">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{assignedSubjects.length}</div>
              <div className="text-sm text-green-800">مادة مسندة</div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
              <div className="flex items-center justify-center mb-2">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{unassignedSubjects.length}</div>
              <div className="text-sm text-red-800">مادة غير مسندة</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{totalHours}</div>
              <div className="text-sm text-blue-800">حصة أسبوعية</div>
            </div>
          </div>

          {/* شريط الإسناد البصري */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">مؤشر الإسناد</span>
              <span className="text-sm text-gray-500">{assignedSubjects.length} من {classroom.subjects.length} مادة</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  assignmentRate === 100 ? 'bg-green-500' :
                  assignmentRate >= 75 ? 'bg-blue-500' :
                  assignmentRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${assignmentRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة المواد */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">مواد الفصل</h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {classroom.subjects.length} مادة
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4">
            {classroom.subjects.map((subject, index) => (
              <div
                key={subject.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  subject.is_assigned 
                    ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                    : 'bg-red-50 border-red-200 hover:bg-red-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    subject.is_assigned ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {subject.is_assigned ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      subject.is_assigned ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {subject.name}
                    </h3>
                    {subject.is_assigned ? (
                      <div className="text-sm text-green-700">
                        <p className="font-medium">{subject.teacher_name}</p>
                        <p className="text-green-600">{subject.teacher_specialization}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-sm text-red-700">
                        <AlertTriangle className="h-3 w-3" />
                        <span>غير مسند - يحتاج معلم</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    subject.is_assigned ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {subject.weekly_hours} حصة
                  </div>
                  <div className="text-xs text-gray-500">في الأسبوع</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* ملخص المواد */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">ملخص الإسناد:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-green-600">{assignedSubjects.length}</div>
                <div className="text-xs text-gray-600">مواد مسندة</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">{unassignedSubjects.length}</div>
                <div className="text-xs text-gray-600">مواد غير مسندة</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">{assignedHours}</div>
                <div className="text-xs text-gray-600">حصة مسندة</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-600">{totalHours - assignedHours}</div>
                <div className="text-xs text-gray-600">حصة متبقية</div>
              </div>
            </div>
          </div>

          {/* تحذيرات إن وجدت */}
          {unassignedSubjects.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">تنبيه: مواد غير مسندة</h4>
                  <p className="text-sm text-yellow-800">
                    يوجد {unassignedSubjects.length} مادة غير مسندة تحتاج إلى تعيين معلمين لها
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomDetailsPage;