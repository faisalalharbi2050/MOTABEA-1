/**
 * عمود الفصول والمواد - يعرض الفصول ومواد كل فصل
 * Classroom & Subject Column Component
 */

import React, { useMemo, useState } from 'react';
import { School, Check, X, Filter, ChevronDown } from 'lucide-react';
import { useAssignment } from '../store/assignmentStore';
import type { Classroom, Subject } from '../store/types';

interface ClassroomSubjectColumnProps {
  onSubjectClick?: (classroomId: string, subjectId: string) => void;
  selectedTeachers: Set<string>;
}

const ClassroomSubjectColumn: React.FC<ClassroomSubjectColumnProps> = ({
  onSubjectClick,
  selectedTeachers,
}) => {
  const { state } = useAssignment();
  
  // حالة القائمة المنسدلة
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedClassrooms, setSelectedClassrooms] = useState<Set<string> | null>(null); // null = عرض الكل

  // حساب عدد الحصص المسندة لكل مادة في كل فصل
  const assignmentCounts = useMemo(() => {
    const counts = new Map<string, { assigned: number; teacherName: string }>();
    state.assignments.forEach(assignment => {
      if (assignment.status === 'active') {
        const key = `${assignment.classroomId}-${assignment.subjectId}`;
        const teacher = state.teachers.find(t => t.id === assignment.teacherId);
        counts.set(key, {
          assigned: assignment.hoursPerWeek,
          teacherName: teacher?.name || 'غير معروف'
        });
      }
    });
    return counts;
  }, [state.assignments, state.teachers]);

  // الحصول على مواد الفصل
  const getClassroomSubjects = (classroom: Classroom): Subject[] => {
    return state.subjects.filter(subject => subject.isActive);
  };

  // ترتيب الفصول
  const sortedClassrooms = useMemo(() => {
    return [...state.classrooms]
      .filter(c => c.isActive)
      .sort((a, b) => {
        const gradeA = parseInt(a.grade || '0');
        const gradeB = parseInt(b.grade || '0');
        if (gradeA !== gradeB) return gradeA - gradeB;
        return a.name.localeCompare(b.name, 'ar');
      });
  }, [state.classrooms]);

  // الفصول المعروضة بناءً على التصفية
  const displayedClassrooms = useMemo(() => {
    if (selectedClassrooms === null) {
      return sortedClassrooms; // عرض الكل (الوضع الافتراضي)
    }
    if (selectedClassrooms.size === 0) {
      return []; // إلغاء الكل - لا يعرض أي فصل
    }
    return sortedClassrooms.filter(c => selectedClassrooms.has(c.id));
  }, [sortedClassrooms, selectedClassrooms]);

  // دوال التحكم بالتحديد
  const handleSelectAll = () => {
    setSelectedClassrooms(null); // null = عرض الكل
    setIsDropdownOpen(false);
  };

  const handleDeselectAll = () => {
    setSelectedClassrooms(new Set());
    setIsDropdownOpen(false);
  };

  const toggleClassroom = (classroomId: string) => {
    // إذا كان في وضع "عرض الكل"، نبدأ بتحديد جميع الفصول ثم نزيل المحدد
    const currentSelection = selectedClassrooms === null 
      ? new Set(sortedClassrooms.map(c => c.id)) 
      : new Set(selectedClassrooms);
    
    if (currentSelection.has(classroomId)) {
      currentSelection.delete(classroomId);
    } else {
      currentSelection.add(classroomId);
    }
    setSelectedClassrooms(currentSelection);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col" dir="rtl">
      {/* رأس العمود */}
      <div className="p-4 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <School className="h-5 w-5 text-white" />
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              الفصول والمواد
            </h2>
            <span className="bg-white bg-opacity-30 text-white text-xs font-bold px-2 py-1 rounded-full">
              {selectedClassrooms === null ? sortedClassrooms.length : displayedClassrooms.length} / {sortedClassrooms.length}
            </span>
          </div>
        </div>

        {/* القائمة المنسدلة لتصفية الفصول */}
        <div className="relative mt-3">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2.5 rounded-lg border border-white border-opacity-30 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium text-sm">
                {selectedClassrooms === null 
                  ? 'جميع الفصول' 
                  : selectedClassrooms.size === 0
                  ? 'لا يوجد فصول محددة'
                  : `${selectedClassrooms.size} ${selectedClassrooms.size === 1 ? 'فصل' : selectedClassrooms.size === 2 ? 'فصلان' : 'فصول'} محددة`
                }
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* قائمة الفصول المنسدلة */}
          {isDropdownOpen && (
            <>
              {/* خلفية شفافة للإغلاق عند النقر خارج القائمة */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
              />
              
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border-2 border-indigo-200 overflow-hidden z-20" style={{ maxHeight: '400px' }}>
                {/* أزرار التحكم */}
                <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b-2 border-indigo-100 flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow"
                  >
                    تحديد الكل
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-2 rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow"
                  >
                    إلغاء الكل
                  </button>
                </div>

                {/* قائمة الفصول */}
                <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
                  {sortedClassrooms.map((classroom, index) => {
                    const isSelected = selectedClassrooms === null || selectedClassrooms.has(classroom.id);
                    const subjects = getClassroomSubjects(classroom);
                    
                    return (
                      <button
                        key={classroom.id}
                        onClick={() => toggleClassroom(classroom.id)}
                        className={`
                          w-full px-4 py-3 flex items-center justify-between transition-all
                          ${isSelected 
                            ? 'bg-indigo-50 hover:bg-indigo-100 border-r-4 border-indigo-500' 
                            : 'hover:bg-gray-50 border-r-4 border-transparent'
                          }
                          ${index > 0 ? 'border-t border-gray-100' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {/* مربع التحديد */}
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                            ${isSelected 
                              ? 'bg-indigo-600 border-indigo-600' 
                              : 'bg-white border-gray-300'
                            }
                          `}>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <School className={`h-4 w-4 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <span className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-gray-600'}`} style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                              {classroom.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                            {subjects.length} {subjects.length === 1 ? 'مادة' : subjects.length === 2 ? 'مادتان' : 'مواد'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* قائمة الفصول */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(100vh - 350px)' }}>
        {displayedClassrooms.map(classroom => {
          const subjects = getClassroomSubjects(classroom);

          return (
            <div key={classroom.id} className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
              {/* رأس الفصل */}
              <div className="p-3 text-white" style={{ background: 'linear-gradient(135deg, #818cf8 0%, #a5b4fc 100%)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    <span className="font-bold text-base" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                      {classroom.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                      {subjects.length} {subjects.length === 1 ? 'مادة' : subjects.length === 2 ? 'مادتان' : 'مواد'}
                    </span>
                  </div>
                </div>
              </div>

              {/* شريط المواد */}
              <div className="p-2">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5">
                  {subjects.map(subject => {
                    const key = `${classroom.id}-${subject.id}`;
                    const assignmentData = assignmentCounts.get(key);
                    const isAssigned = !!assignmentData;
                    const canAssign = selectedTeachers.size === 1 && !isAssigned;
                    const canClick = canAssign || isAssigned; // يمكن النقر للإسناد أو للإلغاء

                    return (
                      <button
                        key={subject.id}
                        onClick={() => canClick && onSubjectClick?.(classroom.id, subject.id)}
                        disabled={!canClick}
                        className={`
                          relative p-2 rounded-md border-2 transition-all duration-200 text-center
                          ${isAssigned
                            ? 'border-green-500 bg-green-50 cursor-pointer hover:border-green-600 hover:shadow-sm'
                            : canAssign
                            ? 'border-red-400 bg-red-50 hover:border-red-600 hover:shadow-sm cursor-pointer transform hover:-translate-y-0.5'
                            : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
                          }
                        `}
                        title={isAssigned ? `مسندة لـ ${assignmentData.teacherName}` : 'غير مسندة'}
                      >
                        {/* أيقونة الحالة صغيرة */}
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                          isAssigned ? 'bg-green-600' : 'bg-red-500'
                        }`}>
                          {isAssigned ? (
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                          ) : (
                            <X className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                          )}
                        </div>

                        <div>
                          <span className={`text-xs font-bold block ${
                            isAssigned ? 'text-green-900' : 'text-red-900'
                          }`} style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                            {subject.name}
                          </span>
                          
                          <div className={`text-[10px] mt-0.5 font-medium ${
                            isAssigned ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {subject.requiredHours} حصة
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {displayedClassrooms.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <School className="h-16 w-16 mx-auto mb-3 opacity-30" />
            <p className="text-lg" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              {sortedClassrooms.length === 0 ? 'لا توجد فصول' : 'لم يتم اختيار أي فصل'}
            </p>
            {sortedClassrooms.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all"
              >
                عرض جميع الفصول
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomSubjectColumn;
