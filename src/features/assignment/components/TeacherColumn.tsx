/**
 * عمود المعلمين - يعرض جميع المعلمين مع إمكانية الاختيار والبحث
 * Teachers Column Component
 */

import React, { useState, useMemo } from 'react';
import { User, Search } from 'lucide-react';
import { useAssignment } from '../store/assignmentStore';
import type { Teacher } from '../store/types';

interface TeacherColumnProps {
  onTeacherSelect?: (teacherId: string) => void;
  selectedTeachers: Set<string>;
  onToggleTeacher: (teacherId: string) => void;
}

const TeacherColumn: React.FC<TeacherColumnProps> = ({
  selectedTeachers,
  onToggleTeacher,
}) => {
  const { state } = useAssignment();
  const [searchTerm, setSearchTerm] = useState('');
  const [pinnedTeachers, setPinnedTeachers] = useState<Set<string>>(new Set());

  // حساب الإسنادات لكل معلم
  const teacherAssignments = useMemo(() => {
    const assignments = new Map<string, number>();
    state.assignments.forEach(assignment => {
      if (assignment.status === 'active') {
        const current = assignments.get(assignment.teacherId) || 0;
        assignments.set(assignment.teacherId, current + assignment.hoursPerWeek);
      }
    });
    return assignments;
  }, [state.assignments]);

  // فلترة وترتيب المعلمين
  const sortedTeachers = useMemo(() => {
    let filtered = state.teachers.filter(teacher => 
      teacher.isActive && 
      (teacher.name.includes(searchTerm) || teacher.specialization?.includes(searchTerm))
    );

    // ترتيب أبجدي
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));

    // المعلمون المثبتون في الأول
    const pinned = filtered.filter(t => pinnedTeachers.has(t.id));
    const unpinned = filtered.filter(t => !pinnedTeachers.has(t.id));

    return [...pinned, ...unpinned];
  }, [state.teachers, searchTerm, pinnedTeachers]);

  // حساب نسبة الإسناد
  const getUtilizationPercentage = (teacher: Teacher): number => {
    const assigned = teacherAssignments.get(teacher.id) || 0;
    const maxLoad = teacher.maxLoad || 24;
    return (assigned / maxLoad) * 100;
  };

  // لون الشريط حسب النسبة - تم تحديث الألوان لتناسب التصميم الجديد
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return '#ef4444'; // Red
    if (percentage >= 80) return '#f97316'; // Orange
    if (percentage >= 60) return '#eab308'; // Yellow
    return '#655ac1'; // The main brand color (Purple)
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col" dir="rtl">
      {/* رأس العمود - تحديث التدرج اللوني */}
      <div className="p-4 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #655ac1 0%, #8779fb 100%)' }}>
        <div className="flex items-center gap-2 mb-3">
          <User className="h-5 w-5 text-white" />
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            المعلمون
          </h2>
          <span className="mr-auto bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
            {sortedTeachers.length}
          </span>
        </div>
        
        {/* شريط البحث */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
          <input
            type="text"
            placeholder="ابحث عن معلم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
          />
        </div>
      </div>

      {/* قائمة المعلمين */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 'calc(100vh - 350px)' }}>
        {sortedTeachers.map(teacher => {
          const assigned = teacherAssignments.get(teacher.id) || 0;
          const maxLoad = teacher.maxLoad || 24;
          const percentage = getUtilizationPercentage(teacher);
          const isSelected = selectedTeachers.has(teacher.id);
          const isPinned = pinnedTeachers.has(teacher.id);

          return (
            <div
              key={teacher.id}
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md`}
              style={{
                borderColor: isSelected ? '#8779fb' : 'transparent',
                backgroundColor: isSelected ? '#e5e1fe' : '#ffffff',
                border: isSelected ? '2px solid #8779fb' : '1px solid #e5e7eb'
              }}
              onClick={() => onToggleTeacher(teacher.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleTeacher(teacher.id);
                    }}
                    className="h-4 w-4 rounded focus:ring-[#8779fb]"
                    style={{ accentColor: '#655ac1' }}
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                      {teacher.name}
                    </h3>
                    {teacher.specialization && (
                      <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                        {teacher.specialization}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPinnedTeachers(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(teacher.id)) {
                        newSet.delete(teacher.id);
                      } else {
                        newSet.add(teacher.id);
                      }
                      return newSet;
                    });
                  }}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    isPinned ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {isPinned ? '📌' : '📍'}
                </button>
              </div>

              {/* شريط النصاب */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    النصاب
                  </span>
                  <span className={`font-bold ${percentage >= 100 ? 'text-red-600' : 'text-gray-800'}`} style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    {assigned} / <span className="text-gray-500">{maxLoad}</span>
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: getProgressColor(percentage)
                    }}
                  />
                </div>
                {percentage > 100 && (
                  <p className="text-[10px] text-red-600 font-bold flex items-center gap-1" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    <span>⚠️</span>
                    تجاوز بـ {(assigned - maxLoad)} حصة
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {sortedTeachers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>لا توجد نتائج</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherColumn;
