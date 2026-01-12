/**
 * فلتر الفصول المطور مع عرض حالة المواد
 * Enhanced Classrooms Filter with Subject Status Display
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, BookOpen, User, Check, X, Users, School } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  weekly_hours: number;
  is_assigned: boolean;
  teacher_name?: string;
}

interface Classroom {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  subjects?: Subject[];
}

interface ClassroomFilterProps {
  onClassroomSelect: (classroom: Classroom) => void;
  selectedClassroomId?: string;
}

const ClassroomFilter: React.FC<ClassroomFilterProps> = ({
  onClassroomSelect,
  selectedClassroomId
}) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);

  // تحميل بيانات الفصول من localStorage أو API
  useEffect(() => {
    const loadClassrooms = () => {
      try {
        // محاولة تحميل من localStorage أولاً
        const savedClassrooms = localStorage.getItem('classrooms');
        if (savedClassrooms) {
          const parsedClassrooms = JSON.parse(savedClassrooms);
          setClassrooms(parsedClassrooms);
        } else {
          // بيانات تجريبية بالتنسيق الرقمي المطلوب
          const mockClassrooms: Classroom[] = [
            {
              id: '1-1',
              name: '1/1',
              grade_level: 1,
              section: '1',
              subjects: [
                {
                  id: '1',
                  name: 'الرياضيات',
                  weekly_hours: 5,
                  is_assigned: true,
                  teacher_name: 'أحمد محمد السعدي'
                },
                {
                  id: '2',
                  name: 'اللغة العربية',
                  weekly_hours: 6,
                  is_assigned: false
                },
                {
                  id: '3',
                  name: 'العلوم',
                  weekly_hours: 4,
                  is_assigned: true,
                  teacher_name: 'فاطمة أحمد النجار'
                },
                {
                  id: '4',
                  name: 'التربية الإسلامية',
                  weekly_hours: 3,
                  is_assigned: false
                }
              ]
            },
            {
              id: '1-2',
              name: '1/2',
              grade_level: 1,
              section: '2',
              subjects: [
                {
                  id: '1',
                  name: 'الرياضيات',
                  weekly_hours: 5,
                  is_assigned: false
                },
                {
                  id: '2',
                  name: 'اللغة العربية',
                  weekly_hours: 6,
                  is_assigned: true,
                  teacher_name: 'خالد سعد العتيبي'
                }
              ]
            },
            {
              id: '2-1',
              name: '2/1',
              grade_level: 2,
              section: '1',
              subjects: [
                {
                  id: '1',
                  name: 'الرياضيات',
                  weekly_hours: 5,
                  is_assigned: true,
                  teacher_name: 'محمد عبدالله'
                },
                {
                  id: '2',
                  name: 'اللغة العربية',
                  weekly_hours: 6,
                  is_assigned: true,
                  teacher_name: 'نورا القحطاني'
                },
                {
                  id: '3',
                  name: 'العلوم',
                  weekly_hours: 4,
                  is_assigned: false
                }
              ]
            },
            {
              id: '3-1',
              name: '3/1',
              grade_level: 3,
              section: '1',
              subjects: [
                {
                  id: '1',
                  name: 'الرياضيات',
                  weekly_hours: 6,
                  is_assigned: true,
                  teacher_name: 'عبدالرحمن الشمري'
                },
                {
                  id: '2',
                  name: 'اللغة العربية',
                  weekly_hours: 7,
                  is_assigned: false
                },
                {
                  id: '3',
                  name: 'العلوم',
                  weekly_hours: 5,
                  is_assigned: true,
                  teacher_name: 'ريم المطيري'
                }
              ]
            }
          ];
          
          setClassrooms(mockClassrooms);
          setLoading(false);
        }
      } catch (error) {
        console.error('خطأ في تحميل بيانات الفصول:', error);
        setLoading(false);
      }
    };

    loadClassrooms();
  }, []);

  const handleClassroomToggle = (classroomId: string) => {
    setSelectedClassrooms(prev => {
      const newSelected = prev.includes(classroomId) 
        ? prev.filter(id => id !== classroomId)
        : [...prev, classroomId];
      
      // إشعار المكون الأب بالفصول المحددة
      if (newSelected.length > 0) {
        const selectedClassroom = classrooms.find(c => c.id === newSelected[newSelected.length - 1]);
        if (selectedClassroom) {
          onClassroomSelect(selectedClassroom);
        }
      }
      
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedClassrooms.length === classrooms.length) {
      setSelectedClassrooms([]);
    } else {
      setSelectedClassrooms(classrooms.map(c => c.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">جارٍ تحميل الفصول...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* زر اختيار متعدد */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Users className="h-4 w-4" />
          {selectedClassrooms.length === classrooms.length ? 'إلغاء تحديد الكل' : 'تحديد جميع الفصول'}
        </button>
        
        {selectedClassrooms.length > 0 && (
          <span className="text-sm text-gray-500">
            محدد: {selectedClassrooms.length} من {classrooms.length}
          </span>
        )}
      </div>

      {/* قائمة الفصول */}
      <div className="border border-gray-200 rounded-lg bg-white max-h-64 overflow-y-auto">
        {classrooms.map(classroom => {
          const isSelected = selectedClassrooms.includes(classroom.id);
          const assignedCount = classroom.subjects?.filter(s => s.is_assigned).length || 0;
          const totalCount = classroom.subjects?.length || 0;
          const assignmentRate = totalCount > 0 ? (assignedCount / totalCount) * 100 : 0;
          
          return (
            <div
              key={classroom.id}
              className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => handleClassroomToggle(classroom.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{classroom.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {assignedCount}/{totalCount} مسند
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      assignmentRate === 100 ? 'bg-green-500' : 
                      assignmentRate > 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  الصف {classroom.grade_level} - الفصل {classroom.section}
                </div>
              </div>

              {/* عرض المواد عند التحديد */}
              {isSelected && classroom.subjects && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    المواد المسندة:
                  </div>
                  <div className="grid gap-2">
                    {classroom.subjects.map(subject => (
                      <div
                        key={subject.id}
                        className={`flex items-center justify-between p-2 rounded text-xs ${
                          subject.is_assigned 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {subject.is_assigned ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-red-600" />
                          )}
                          <span className={subject.is_assigned ? 'text-green-800' : 'text-red-800'}>
                            {subject.name}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          {subject.is_assigned ? (
                            <div className="text-green-700">
                              <div className="font-medium">{subject.teacher_name}</div>
                              <div className="text-xs opacity-75">{subject.weekly_hours} حصة</div>
                            </div>
                          ) : (
                            <div className="text-red-700">
                              <div className="font-medium">غير مسند</div>
                              <div className="text-xs opacity-75">{subject.weekly_hours} حصة</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ملخص الاختيار */}
      {selectedClassrooms.length === 0 && (
        <div className="text-sm text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
          💡 اختر فصلاً أو أكثر لعرض المواد وحالة الإسناد
        </div>
      )}
    </div>
  );
};

export default ClassroomFilter;