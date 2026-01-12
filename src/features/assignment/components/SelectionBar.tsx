/**
 * شريط التحديد والفلاتر لنظام إسناد المواد
 * Assignment System Selection Bar
 */

import React, { useState, useMemo } from 'react';
import { useAssignment, useAssignmentActions } from '../store/assignmentStore';
import { selectActiveFilters, selectFilteredTeachers, selectFilteredSubjects, selectFilteredClassrooms } from '../store/selectors';

interface SelectionBarProps {
  className?: string;
}

const SelectionBar: React.FC<SelectionBarProps> = ({ className }) => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();
  const activeFilters = selectActiveFilters(state);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // حساب النتائج المفلترة
  const filteredData = useMemo(() => ({
    teachers: selectFilteredTeachers(state),
    subjects: selectFilteredSubjects(state),
    classrooms: selectFilteredClassrooms(state),
  }), [state]);

  // تعامل مع البحث
  const handleSearch = (term: string) => {
    actions.setSearchTerm(term);
  };

  // مسح فلتر محدد
  const clearFilter = (filterKey: string) => {
    actions.setFilter(filterKey as any, undefined);
  };

  // مسح جميع الفلاتر
  const clearAllFilters = () => {
    actions.clearFilters();
  };

  // تحديد/إلغاء تحديد جميع العناصر المفلترة
  const handleSelectAll = () => {
    const allIds = [
      ...filteredData.teachers.map(t => t.id),
      ...filteredData.subjects.map(s => s.id),
      ...filteredData.classrooms.map(c => c.id),
    ];
    
    const allSelected = allIds.every(id => state.ui.selectedItems.includes(id));
    
    if (allSelected) {
      actions.clearSelection();
    } else {
      actions.selectItems(allIds);
    }
  };

  // حساب حالة التحديد
  const selectionState = useMemo(() => {
    const selectedCount = state.ui.selectedItems.length;
    const totalItems = filteredData.teachers.length + filteredData.subjects.length + filteredData.classrooms.length;
    
    return {
      selectedCount,
      totalItems,
      hasSelection: selectedCount > 0,
      allSelected: selectedCount === totalItems && totalItems > 0,
      partiallySelected: selectedCount > 0 && selectedCount < totalItems,
    };
  }, [state.ui.selectedItems, filteredData]);

  return (
    <div className={`assignment-selection-bar ${className || ''}`}>
      {/* شريط البحث والفلاتر الأساسية */}
      <div className="assignment-filters-section">
        {/* البحث */}
        <div className="assignment-search">
          <input
            type="text"
            placeholder="البحث في المعلمين والمواد والفصول..."
            value={state.filters.searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="assignment-search-input"
          />
          <i className="fas fa-search assignment-search-icon" aria-hidden="true"></i>
        </div>

        {/* فلاتر سريعة */}
        <div className="assignment-quick-filters">
          {/* فلتر المرحلة */}
          <select
            value={state.filters.level || ''}
            onChange={(e) => actions.setFilter('level', e.target.value || undefined)}
            className="assignment-filter-select"
          >
            <option value="">جميع المراحل</option>
            <option value="primary">ابتدائي</option>
            <option value="middle">متوسط</option>
            <option value="high">ثانوي</option>
          </select>

          {/* فلتر الفصل الدراسي */}
          <select
            value={state.filters.semester || ''}
            onChange={(e) => actions.setFilter('semester', e.target.value || undefined)}
            className="assignment-filter-select"
          >
            <option value="">جميع الفصول</option>
            <option value="first">الفصل الأول</option>
            <option value="second">الفصل الثاني</option>
            <option value="full">العام الكامل</option>
          </select>

          {/* فلتر المعلم */}
          <select
            value={state.filters.selectedTeacherId || ''}
            onChange={(e) => actions.setFilter('selectedTeacherId', e.target.value || undefined)}
            className="assignment-filter-select"
          >
            <option value="">جميع المعلمين</option>
            {state.teachers.filter(t => t.isActive).map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>

          {/* زر الفلاتر المتقدمة */}
          <button
            className={`assignment-btn assignment-btn-sm ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            title="فلاتر متقدمة"
          >
            <i className="fas fa-filter" aria-hidden="true"></i>
            <span>متقدم</span>
          </button>

          {/* زر مسح الفلاتر */}
          {activeFilters.length > 0 && (
            <button
              className="assignment-btn assignment-btn-sm warning"
              onClick={clearAllFilters}
              title="مسح جميع الفلاتر"
            >
              <i className="fas fa-times" aria-hidden="true"></i>
              <span>مسح الفلاتر</span>
            </button>
          )}
        </div>
      </div>

      {/* شريط التحديد والإجراءات الجماعية */}
      <div className="assignment-selection-section">
        {/* معلومات التحديد */}
        <div className="assignment-selection-info">
          {selectionState.hasSelection ? (
            <span className="assignment-selection-text">
              تم تحديد {selectionState.selectedCount} من {selectionState.totalItems} عنصر
            </span>
          ) : (
            <span className="assignment-selection-text">
              {filteredData.teachers.length} معلم، {filteredData.subjects.length} مادة، {filteredData.classrooms.length} فصل
            </span>
          )}
        </div>

        {/* أزرار التحديد */}
        <div className="assignment-selection-actions">
          <button
            className={`assignment-btn assignment-btn-sm ${selectionState.allSelected ? 'active' : ''}`}
            onClick={handleSelectAll}
            title={selectionState.allSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
          >
            <i className={`fas fa-${selectionState.allSelected ? 'minus' : 'plus'}-square`} aria-hidden="true"></i>
            <span>{selectionState.allSelected ? 'إلغاء الكل' : 'تحديد الكل'}</span>
          </button>

          {/* إجراءات جماعية (تظهر عند وجود تحديد) */}
          {selectionState.hasSelection && (
            <>
              <button
                className="assignment-btn assignment-btn-sm"
                onClick={() => actions.clearSelection()}
                title="مسح التحديد"
              >
                <i className="fas fa-times" aria-hidden="true"></i>
                <span>مسح التحديد</span>
              </button>
              
              <button
                className="assignment-btn assignment-btn-sm primary"
                onClick={() => {/* سيتم تطبيقه مع واتساب */}}
                title="مشاركة المحدد"
              >
                <i className="fas fa-share" aria-hidden="true"></i>
                <span>مشاركة</span>
              </button>

              <button
                className="assignment-btn assignment-btn-sm success"
                onClick={() => {/* سيتم تطبيقه مع التصدير */}}
                title="تصدير المحدد"
              >
                <i className="fas fa-download" aria-hidden="true"></i>
                <span>تصدير</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* الفلاتر النشطة */}
      {activeFilters.length > 0 && (
        <div className="assignment-active-filters">
          <span className="assignment-active-filters-label">الفلاتر النشطة:</span>
          <div className="assignment-filter-tags">
            {activeFilters.map((filter, index) => (
              <span key={index} className="assignment-filter-tag">
                <span className="assignment-filter-tag-text">{filter.label}</span>
                <button
                  className="assignment-filter-tag-remove"
                  onClick={() => clearFilter(filter.key)}
                  title={`إزالة فلتر: ${filter.label}`}
                >
                  <i className="fas fa-times" aria-hidden="true"></i>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* الفلاتر المتقدمة */}
      {showAdvancedFilters && (
        <div className="assignment-advanced-filters">
          <div className="assignment-advanced-filters-content">
            {/* فلتر حالة الإسناد */}
            <div className="assignment-filter-group">
              <label className="assignment-filter-label">حالة الإسناد:</label>
              <select
                value={state.filters.status || ''}
                onChange={(e) => actions.setFilter('status', e.target.value || undefined)}
                className="assignment-filter-select"
              >
                <option value="">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="pending">معلق</option>
                <option value="cancelled">ملغى</option>
              </select>
            </div>

            {/* فلتر المادة */}
            <div className="assignment-filter-group">
              <label className="assignment-filter-label">المادة:</label>
              <select
                value={state.filters.selectedSubjectId || ''}
                onChange={(e) => actions.setFilter('selectedSubjectId', e.target.value || undefined)}
                className="assignment-filter-select"
              >
                <option value="">جميع المواد</option>
                {state.subjects.filter(s => s.isActive).map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* فلتر الفصل */}
            <div className="assignment-filter-group">
              <label className="assignment-filter-label">الفصل:</label>
              <select
                value={state.filters.selectedClassroomId || ''}
                onChange={(e) => actions.setFilter('selectedClassroomId', e.target.value || undefined)}
                className="assignment-filter-select"
              >
                <option value="">جميع الفصول</option>
                {state.classrooms.filter(c => c.isActive).map(classroom => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionBar;