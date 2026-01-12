/**
 * شريط التحديد البسيط والنظيف - قوائم منسدلة فقط
 * Clean and Simple Selection Bar - Dropdown Only
 */

import React, { useState } from 'react';
import { Users, School, Eye, ArrowRight } from 'lucide-react';

interface SelectionBarProps {
  className?: string;
  onTeacherView?: (teacherId: string) => void;
  onClassroomView?: (classroomId: string) => void;
  onAllTeachersView?: () => void;
  onAllClassroomsView?: () => void;
}

const SelectionBar: React.FC<SelectionBarProps> = ({ 
  className, 
  onTeacherView, 
  onClassroomView, 
  onAllTeachersView, 
  onAllClassroomsView 
}) => {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');

  // بيانات تجريبية للمعلمين
  const mockTeachers = [
    { id: '1', name: 'أحمد محمد السعدي', specialization: 'رياضيات', load: '18/24' },
    { id: '2', name: 'فاطمة أحمد النجار', specialization: 'لغة عربية', load: '20/24' },
    { id: '3', name: 'خالد سعد العتيبي', specialization: 'علوم', load: '12/24' },
    { id: '4', name: 'نورا القحطاني', specialization: 'تربية إسلامية', load: '24/24' },
    { id: '5', name: 'عبدالرحمن الشمري', specialization: 'تاريخ وجغرافيا', load: '8/24' }
  ];

  // بيانات تجريبية للفصول (بصيغة رقمية)
  const mockClassrooms = [
    { id: '1-1', name: '1/1', level: 'الأول', students: 25, subjects: 6 },
    { id: '1-2', name: '1/2', level: 'الأول', students: 23, subjects: 6 },
    { id: '2-1', name: '2/1', level: 'الثاني', students: 28, subjects: 7 },
    { id: '2-2', name: '2/2', level: 'الثاني', students: 26, subjects: 7 },
    { id: '3-1', name: '3/1', level: 'الثالث', students: 30, subjects: 8 },
    { id: '3-2', name: '3/2', level: 'الثالث', students: 29, subjects: 8 }
  ];

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacher(teacherId);
    if (teacherId === 'all') {
      onAllTeachersView?.();
    } else if (teacherId) {
      onTeacherView?.(teacherId);
    }
  };

  const handleClassroomChange = (classroomId: string) => {
    setSelectedClassroom(classroomId);
    if (classroomId === 'all') {
      onAllClassroomsView?.();
    } else if (classroomId) {
      onClassroomView?.(classroomId);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className || ''}`} dir="rtl">
      {/* عنوان القسم */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">البحث والفلاتر</h3>
        <p className="text-sm text-gray-500">ابحث عن الفصول والمعلمين وأعرض تفاصيل الإسناد</p>
      </div>

      {/* القوائم المنسدلة - ترتيب RTL صحيح */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* قائمة المعلمين - على اليمين */}
        <div className="lg:order-1">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
            <Users className="h-4 w-4 text-blue-600" />
            البحث عن المعلم
          </label>
          
          <select
            value={selectedTeacher}
            onChange={(e) => handleTeacherChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
            dir="rtl"
          >
            <option value="">اختر معلماً...</option>
            <option value="all" className="font-semibold bg-blue-50">
              📊 عرض جميع المعلمين
            </option>
            <optgroup label="المعلمون">
              {mockTeachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} - {teacher.specialization} ({teacher.load})
                </option>
              ))}
            </optgroup>
          </select>
          
          {selectedTeacher && selectedTeacher !== 'all' && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800 flex items-center gap-1">
              <Eye className="h-3 w-3" />
              انقر لعرض تفاصيل المعلم المحدد
            </div>
          )}
        </div>

        {/* قائمة الفصول - على اليسار */}
        <div className="lg:order-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
            <School className="h-4 w-4 text-green-600" />
            البحث عن الصف والفصل
          </label>
          
          <select
            value={selectedClassroom}
            onChange={(e) => handleClassroomChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 text-sm"
            dir="rtl"
          >
            <option value="">اختر فصلاً...</option>
            <option value="all" className="font-semibold bg-green-50">
              📚 عرض جميع الفصول
            </option>
            <optgroup label="الفصول الدراسية">
              {mockClassrooms.map(classroom => (
                <option key={classroom.id} value={classroom.id}>
                  الصف {classroom.name} - {classroom.level} ({classroom.subjects} مواد)
                </option>
              ))}
            </optgroup>
          </select>
          
          {selectedClassroom && selectedClassroom !== 'all' && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-center gap-1">
              <Eye className="h-3 w-3" />
              انقر لعرض مواد الفصل وحالة الإسناد
            </div>
          )}
        </div>
      </div>

      {/* رسالة توضيحية محسنة */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">كيفية الاستخدام:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• اختر <strong>معلماً محدداً</strong> لعرض نصابه ومواده المسندة</li>
              <li>• اختر <strong>فصلاً محدداً</strong> لعرض مواده وحالة الإسناد بالألوان</li>
              <li>• اختر <strong>"عرض الكل"</strong> للحصول على نظرة شاملة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionBar;