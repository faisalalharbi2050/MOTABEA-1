/**
 * الشريط الجانبي المطور للمعلمين مع اختيار متعدد وأداء محسن
 * Enhanced Teachers Rail with Multi-Selection and Performance Optimization
 */

import React, { useState, useMemo } from 'react';
import { useAssignment, useAssignmentActions } from '../store/assignmentStore';
import { 
  selectFilterableTeachers,
  selectAssignmentSummaryByTeacher,
  selectAllFilteredTeachersSelected,
  selectSelectedFilteredTeachersCount
} from '../store/teacherSelectors';
import VirtualizedTeacherList from './VirtualizedTeacherList';
import './virtualized-components.css';

interface NewTeacherRailProps {
  className?: string;
  onTeacherSelect?: (teacherId: string) => void;
}

const NewTeacherRail: React.FC<NewTeacherRailProps> = ({ 
  className, 
  onTeacherSelect 
}) => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'load' | 'subjects'>('name');
  
  // البيانات المفلترة والقابلة للاختيار
  const filterableTeacherIds = useMemo(() => selectFilterableTeachers(state), [state]);
  const allFilteredSelected = useMemo(() => selectAllFilteredTeachersSelected(state), [state]);
  const selectedFilteredCount = useMemo(() => selectSelectedFilteredTeachersCount(state), [state]);
  
  // معلمون مفلترون بالبحث المحلي
  const filteredTeachers = useMemo(() => {
    let teachers = state.teachers.filter(t => 
      filterableTeacherIds.includes(t.id) && t.isActive
    );

    // تطبيق البحث المحلي
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      teachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchLower) ||
        teacher.specialization.toLowerCase().includes(searchLower)
      );
    }

    // ترتيب المعلمين
    teachers.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ar');
        case 'load': {
          const summaryA = selectAssignmentSummaryByTeacher(state, a.id);
          const summaryB = selectAssignmentSummaryByTeacher(state, b.id);
          const loadA = summaryA?.loadPercentage || 0;
          const loadB = summaryB?.loadPercentage || 0;
          return loadB - loadA; // من الأعلى للأقل
        }
        case 'subjects': {
          const summaryA = selectAssignmentSummaryByTeacher(state, a.id);
          const summaryB = selectAssignmentSummaryByTeacher(state, b.id);
          const subjectsA = summaryA?.totalAssignments || 0;
          const subjectsB = summaryB?.totalAssignments || 0;
          return subjectsB - subjectsA;
        }
        default:
          return 0;
      }
    });

    return teachers;
  }, [state.teachers, filterableTeacherIds, searchTerm, sortBy, state]);

  // التحكم في التحديد
  const handleTeacherToggle = (teacherId: string) => {
    actions.selectTeacher(teacherId);
    onTeacherSelect?.(teacherId);
  };

  const handleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      actions.clearTeacherSelection();
    } else {
      const filteredIds = filteredTeachers.map(t => t.id);
      actions.selectAllFilteredTeachers(filteredIds);
    }
  };

  // حساب إحصائيات النصاب للشريط العلوي
  const workloadStats = useMemo(() => {
    const summaries = filteredTeachers.map(t => 
      selectAssignmentSummaryByTeacher(state, t.id)
    ).filter(Boolean);

    const totalTeachers = summaries.length;
    const totalHours = summaries.reduce((sum, s) => sum + (s?.totalHours || 0), 0);
    const averageLoad = totalTeachers > 0 ? totalHours / totalTeachers : 0;
    const overloadedCount = summaries.filter(s => (s?.loadPercentage || 0) > 90).length;

    return {
      totalTeachers,
      totalHours,
      averageLoad: Math.round(averageLoad * 100) / 100,
      overloadedCount,
      selectedCount: state.ui.selectedTeacherIds.size,
    };
  }, [filteredTeachers, state]);

  // حساب بيانات شريط النصاب اللحظي
  const liveWorkloadBar = useMemo(() => {
    const maxPossibleHours = filteredTeachers.reduce((sum, t) => sum + t.maxLoad, 0);
    const currentHours = workloadStats.totalHours;
    const percentage = maxPossibleHours > 0 ? (currentHours / maxPossibleHours) * 100 : 0;

    return {
      percentage: Math.min(percentage, 100),
      current: currentHours,
      max: maxPossibleHours,
      status: percentage > 90 ? 'high' : percentage > 70 ? 'medium' : 'low'
    };
  }, [filteredTeachers, workloadStats.totalHours]);

  const isCollapsed = !state.ui.sidebarOpen;

  return (
    <aside className={`new-teacher-rail ${isCollapsed ? 'collapsed' : ''} ${className || ''}`}>
      {/* شريط النصاب اللحظي */}
      <div className="workload-status-bar">
        <div className="workload-info">
          <span className="workload-label">
            النصاب الإجمالي: {liveWorkloadBar.current}/{liveWorkloadBar.max}
          </span>
          <span className="workload-percentage">
            ({Math.round(liveWorkloadBar.percentage)}%)
          </span>
        </div>
        <div className="workload-bar">
          <div 
            className={`workload-fill ${liveWorkloadBar.status}`}
            style={{ width: `${liveWorkloadBar.percentage}%` }}
          />
        </div>
        {workloadStats.overloadedCount > 0 && (
          <div className="overload-warning">
            <i className="fas fa-exclamation-triangle"></i>
            {workloadStats.overloadedCount} معلم متجاوز للحد
          </div>
        )}
      </div>

      {/* رأس الشريط */}
      <div className="teacher-rail-header">
        <div className="header-info">
          <h3>المعلمون ({filteredTeachers.length})</h3>
          {workloadStats.selectedCount > 0 && (
            <span className="selection-count">
              محدد: {workloadStats.selectedCount}
            </span>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="header-actions">
            <button
              className={`select-all-btn ${allFilteredSelected ? 'selected' : ''}`}
              onClick={handleSelectAllFiltered}
              title={allFilteredSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            >
              <i className={`fas ${allFilteredSelected ? 'fa-check-square' : 'fa-square'}`}></i>
            </button>
          </div>
        )}
      </div>

      {/* البحث والترتيب */}
      {!isCollapsed && (
        <div className="rail-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="بحث في الأسماء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          
          <div className="sort-controls">
            <label className="sort-label">ترتيب:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="name">الاسم</option>
              <option value="load">النصاب</option>
              <option value="subjects">عدد المواد</option>
            </select>
          </div>
        </div>
      )}

      {/* قائمة المعلمين المحسنة مع Virtualization */}
      <div className="teachers-list-container">
        {filteredTeachers.length === 0 ? (
          <div className="no-teachers">
            <i className="fas fa-user-slash" aria-hidden="true"></i>
            <span>لا يوجد معلمون متاحون</span>
          </div>
        ) : (
          <VirtualizedTeacherList
            teachers={filteredTeachers.map(teacher => {
              const summary = selectAssignmentSummaryByTeacher(state, teacher.id);
              return {
                ...teacher,
                totalHours: summary?.totalHours || 0,
                loadPercentage: summary?.loadPercentage || 0,
              };
            })}
            selectedIds={state.ui.selectedTeacherIds}
            onTeacherSelect={handleTeacherToggle}
            onTeacherToggle={handleTeacherToggle}
            containerHeight={isCollapsed ? 200 : 400}
            itemHeight={64}
            className="rail-teacher-list"
          />
        )}
      </div>

      {/* إحصائيات سريعة */}
      {!isCollapsed && workloadStats.selectedCount > 0 && (
        <div className="rail-stats">
          <div className="stat-item">
            <i className="fas fa-users"></i>
            <span>محدد: {workloadStats.selectedCount}</span>
          </div>
          <div className="stat-item">
            <i className="fas fa-clock"></i>
            <span>المتوسط: {workloadStats.averageLoad}</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default NewTeacherRail;