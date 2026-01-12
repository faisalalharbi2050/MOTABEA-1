/**
 * فلتر المعلمين المطور مع عرض النصاب
 * Enhanced Teachers Filter with Workload Display
 */

import React, { useState, useEffect } from 'react';
import { User, BookOpen, BarChart3, Users, Clock, Check, AlertTriangle, GraduationCap } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  specialization: string;
  max_load: number; // النصاب الأقصى
  current_load: number; // النصاب الحالي
  assignments?: {
    subject_name: string;
    classroom_name: string;
    hours_per_week: number;
  }[];
}

interface TeacherFilterProps {
  onTeacherSelect: (teacher: Teacher) => void;
  selectedTeacherId?: string;
}

const TeacherFilter: React.FC<TeacherFilterProps> = ({
  onTeacherSelect,
  selectedTeacherId
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

  // تحميل بيانات المعلمين
  useEffect(() => {
    const loadTeachers = () => {
      try {
        // بيانات تجريبية محسنة
        const mockTeachers: Teacher[] = [
          {
            id: '1',
            name: 'أحمد محمد السعدي',
            specialization: 'رياضيات',
            max_load: 24,
            current_load: 18,
            assignments: [
              {
                subject_name: 'الرياضيات',
                classroom_name: '1/1',
                hours_per_week: 5
              },
              {
                subject_name: 'الرياضيات',
                classroom_name: '2/1',
                hours_per_week: 5
              },
              {
                subject_name: 'الرياضيات',
                classroom_name: '3/1',
                hours_per_week: 6
              },
              {
                subject_name: 'الإحصاء',
                classroom_name: '3/2',
                hours_per_week: 2
              }
            ]
          },
          {
            id: '2',
            name: 'فاطمة أحمد النجار',
            specialization: 'لغة عربية',
            max_load: 24,
            current_load: 20,
            assignments: [
              {
                subject_name: 'اللغة العربية',
                classroom_name: '1/1',
                hours_per_week: 6
              },
              {
                subject_name: 'اللغة العربية',
                classroom_name: '1/2',
                hours_per_week: 6
              },
              {
                subject_name: 'البلاغة',
                classroom_name: '3/1',
                hours_per_week: 4
              },
              {
                subject_name: 'النحو',
                classroom_name: '2/1',
                hours_per_week: 4
              }
            ]
          },
          {
            id: '3',
            name: 'خالد سعد العتيبي',
            specialization: 'علوم',
            max_load: 24,
            current_load: 12,
            assignments: [
              {
                subject_name: 'العلوم',
                classroom_name: '1/1',
                hours_per_week: 4
              },
              {
                subject_name: 'الفيزياء',
                classroom_name: '3/1',
                hours_per_week: 4
              },
              {
                subject_name: 'الكيمياء',
                classroom_name: '2/1',
                hours_per_week: 4
              }
            ]
          },
          {
            id: '4',
            name: 'نورا القحطاني',
            specialization: 'تربية إسلامية',
            max_load: 24,
            current_load: 24,
            assignments: [
              {
                subject_name: 'التربية الإسلامية',
                classroom_name: '1/1',
                hours_per_week: 3
              },
              {
                subject_name: 'التربية الإسلامية',
                classroom_name: '1/2',
                hours_per_week: 3
              },
              {
                subject_name: 'التفسير',
                classroom_name: '2/1',
                hours_per_week: 4
              },
              {
                subject_name: 'الحديث',
                classroom_name: '3/1',
                hours_per_week: 4
              },
              {
                subject_name: 'الفقه',
                classroom_name: '2/2',
                hours_per_week: 5
              },
              {
                subject_name: 'التوحيد',
                classroom_name: '3/2',
                hours_per_week: 5
              }
            ]
          },
          {
            id: '5',
            name: 'عبدالرحمن الشمري',
            specialization: 'تاريخ وجغرافيا',
            max_load: 24,
            current_load: 8,
            assignments: [
              {
                subject_name: 'التاريخ',
                classroom_name: '3/1',
                hours_per_week: 4
              },
              {
                subject_name: 'الجغرافيا',
                classroom_name: '3/2',
                hours_per_week: 4
              }
            ]
          }
        ];
        
        setTeachers(mockTeachers);
        setLoading(false);
      } catch (error) {
        console.error('خطأ في تحميل بيانات المعلمين:', error);
        setLoading(false);
      }
    };

    loadTeachers();
  }, []);

  const handleTeacherToggle = (teacherId: string) => {
    setSelectedTeachers(prev => {
      const newSelected = prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId];
      
      // إشعار المكون الأب بالمعلم المحدد
      if (newSelected.length > 0) {
        const selectedTeacher = teachers.find(t => t.id === newSelected[newSelected.length - 1]);
        if (selectedTeacher) {
          onTeacherSelect(selectedTeacher);
        }
      }
      
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedTeachers.length === teachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(teachers.map(t => t.id));
    }
  };

  const getLoadPercentage = (teacher: Teacher) => {
    return Math.round((teacher.current_load / teacher.max_load) * 100);
  };

  const getLoadStatus = (percentage: number) => {
    if (percentage === 0) return { color: 'bg-gray-500', label: 'فارغ' };
    if (percentage < 50) return { color: 'bg-yellow-500', label: 'منخفض' };
    if (percentage < 80) return { color: 'bg-blue-500', label: 'متوسط' };
    if (percentage < 100) return { color: 'bg-orange-500', label: 'عالي' };
    return { color: 'bg-red-500', label: 'مكتمل' };
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">جارٍ تحميل بيانات المعلمين...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* زر اختيار متعدد */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
        >
          <GraduationCap className="h-4 w-4" />
          {selectedTeachers.length === teachers.length ? 'إلغاء تحديد الكل' : 'تحديد جميع المعلمين'}
        </button>
        
        {selectedTeachers.length > 0 && (
          <span className="text-sm text-gray-500">
            محدد: {selectedTeachers.length} من {teachers.length}
          </span>
        )}
      </div>

      {/* شريط النصاب البصري */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <BarChart3 className="h-4 w-4" />
          شريط النصاب البصري:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {teachers.map(teacher => {
            const percentage = getLoadPercentage(teacher);
            const status = getLoadStatus(percentage);
            const isSelected = selectedTeachers.includes(teacher.id);
            
            return (
              <div
                key={teacher.id}
                className={`p-2 rounded cursor-pointer transition-all ${
                  isSelected ? 'bg-blue-100 border-2 border-blue-400' : 'bg-white border border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleTeacherToggle(teacher.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">{teacher.name}</span>
                  <span className="text-xs text-gray-500">{percentage}%</span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${status.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{teacher.current_load}/{teacher.max_load}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{teacher.specialization}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    percentage === 100 ? 'bg-red-100 text-red-700' :
                    percentage >= 80 ? 'bg-orange-100 text-orange-700' :
                    percentage >= 50 ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* قائمة المعلمين التفصيلية */}
      <div className="border border-gray-200 rounded-lg bg-white max-h-64 overflow-y-auto">
        {teachers.map(teacher => {
          const isSelected = selectedTeachers.includes(teacher.id);
          const percentage = getLoadPercentage(teacher);
          
          return (
            <div
              key={teacher.id}
              className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => handleTeacherToggle(teacher.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{teacher.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {teacher.specialization}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      percentage === 100 ? 'bg-red-500' : 
                      percentage >= 80 ? 'bg-orange-500' :
                      percentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}></div>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  {teacher.current_load}/{teacher.max_load} حصة ({percentage}%)
                </div>
              </div>

              {/* عرض الإسنادات عند التحديد */}
              {isSelected && teacher.assignments && teacher.assignments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    الإسنادات الحالية:
                  </div>
                  <div className="grid gap-2">
                    {teacher.assignments.map((assignment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          <span className="text-green-800 font-medium">
                            {assignment.subject_name}
                          </span>
                        </div>
                        
                        <div className="text-right text-green-700">
                          <div className="font-medium">{assignment.classroom_name}</div>
                          <div className="text-xs opacity-75">{assignment.hours_per_week} حصة/أسبوع</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* رسالة عدم وجود إسنادات */}
              {isSelected && (!teacher.assignments || teacher.assignments.length === 0) && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 text-center">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  لا توجد إسنادات حالية لهذا المعلم
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ملخص الاختيار */}
      {selectedTeachers.length === 0 && (
        <div className="text-sm text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
          💡 اختر معلماً أو أكثر لعرض النصاب والإسنادات بالتفصيل
        </div>
      )}
    </div>
  );
};

export default TeacherFilter;