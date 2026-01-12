/**
 * مكون القائمة المحسنة للمعلمين مع دعم Virtualization والأداء العالي
 * Virtualized Teacher List Component with High Performance Support
 */

import React, { useState, useMemo, useCallback, useRef, useLayoutEffect } from 'react';

interface Teacher {
  id: string;
  name: string;
  specialization: string;
  isActive: boolean;
  totalHours?: number;
  loadPercentage?: number;
}

interface VirtualizedTeacherListProps {
  teachers: Teacher[];
  selectedIds: Set<string>;
  onTeacherSelect: (teacherId: string) => void;
  onTeacherToggle: (teacherId: string) => void;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  className?: string;
}

interface VirtualItem {
  index: number;
  teacher: Teacher;
  isVisible: boolean;
  top: number;
  height: number;
}

const VirtualizedTeacherList: React.FC<VirtualizedTeacherListProps> = ({
  teachers,
  selectedIds,
  onTeacherSelect,
  onTeacherToggle,
  itemHeight = 64, // ارتفاع افتراضي للعنصر
  containerHeight = 400,
  overscan = 5, // عناصر إضافية للعرض خارج المنطقة المرئية
  className = '',
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);

  // حساب العناصر المرئية
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      teachers.length
    );
    const actualStartIndex = Math.max(0, startIndex - overscan);

    const items: VirtualItem[] = [];
    for (let i = actualStartIndex; i < endIndex; i++) {
      if (i < teachers.length) {
        items.push({
          index: i,
          teacher: teachers[i],
          isVisible: i >= startIndex && i < endIndex - overscan,
          top: i * itemHeight,
          height: itemHeight,
        });
      }
    }

    return items;
  }, [teachers, scrollTop, itemHeight, containerHeight, overscan]);

  // معالجة التمرير
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // معالجة التنقل بالكيبورد
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const teacher = teachers[index];
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onTeacherSelect(teacher.id);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (index < teachers.length - 1) {
          setFocusedIndex(index + 1);
          // التمرير إذا لزم الأمر
          const nextItemTop = (index + 1) * itemHeight;
          const containerScrollTop = containerRef.current?.scrollTop || 0;
          if (nextItemTop > containerScrollTop + containerHeight - itemHeight) {
            containerRef.current?.scrollTo({
              top: nextItemTop - containerHeight + itemHeight,
              behavior: 'smooth'
            });
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          setFocusedIndex(index - 1);
          // التمرير إذا لزم الأمر
          const prevItemTop = (index - 1) * itemHeight;
          const containerScrollTop = containerRef.current?.scrollTop || 0;
          if (prevItemTop < containerScrollTop) {
            containerRef.current?.scrollTo({
              top: prevItemTop,
              behavior: 'smooth'
            });
          }
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(teachers.length - 1);
        containerRef.current?.scrollTo({ 
          top: (teachers.length - 1) * itemHeight,
          behavior: 'smooth' 
        });
        break;
      default:
        break;
    }
  }, [teachers, itemHeight, containerHeight, onTeacherSelect]);

  // ضبط التركيز على العنصر المحدد
  useLayoutEffect(() => {
    if (focusedIndex >= 0 && containerRef.current) {
      const focusedElement = containerRef.current.querySelector(
        `[data-index="${focusedIndex}"]`
      ) as HTMLElement;
      focusedElement?.focus();
    }
  }, [focusedIndex]);

  // معالجة النقر على العنصر
  const handleItemClick = useCallback((teacher: Teacher, index: number, e: React.MouseEvent) => {
    if (e.shiftKey) {
      // تحديد متعدد بـ Shift
      // يمكن تطبيق منطق التحديد المتعدد هنا
      onTeacherToggle(teacher.id);
    } else if (e.ctrlKey || e.metaKey) {
      // إضافة/إزالة من التحديد
      onTeacherToggle(teacher.id);
    } else {
      // تحديد واحد
      onTeacherSelect(teacher.id);
    }
    setFocusedIndex(index);
  }, [onTeacherSelect, onTeacherToggle]);

  const totalHeight = teachers.length * itemHeight;

  return (
    <div 
      className={`virtualized-teacher-list ${className}`}
      style={{ height: containerHeight }}
    >
      <div
        ref={containerRef}
        className="virtual-container"
        onScroll={handleScroll}
        style={{ 
          height: '100%', 
          overflow: 'auto',
          position: 'relative'
        }}
        role="listbox"
        aria-label={`قائمة المعلمين ${teachers.length} معلم`}
        aria-multiselectable="true"
        tabIndex={0}
      >
        {/* المساحة الإجمالية */}
        <div 
          className="virtual-spacer"
          style={{ height: totalHeight, position: 'relative' }}
          aria-hidden="true"
        >
          {/* العناصر المرئية فقط */}
          {visibleItems.map(({ index, teacher, top, height }) => {
            const isSelected = selectedIds.has(teacher.id);
            const isFocused = focusedIndex === index;
            
            return (
              <div
                key={teacher.id}
                data-index={index}
                className={`virtual-teacher-item ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''} ${!teacher.isActive ? 'inactive' : ''}`}
                style={{
                  position: 'absolute',
                  top,
                  height,
                  width: '100%',
                  left: 0,
                }}
                onClick={(e) => handleItemClick(teacher, index, e)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="option"
                aria-selected={isSelected}
                aria-label={`${teacher.name} - ${teacher.specialization}${teacher.totalHours ? ` - ${teacher.totalHours} حصة` : ''}`}
                tabIndex={isFocused ? 0 : -1}
              >
                <div className="teacher-item-content">
                  <div className="teacher-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onTeacherToggle(teacher.id)}
                      aria-labelledby={`teacher-name-${teacher.id}`}
                      tabIndex={-1} // التنقل يتم عبر العنصر الرئيسي
                    />
                  </div>
                  
                  <div className="teacher-info">
                    <div 
                      id={`teacher-name-${teacher.id}`}
                      className="teacher-name"
                    >
                      {teacher.name}
                    </div>
                    <div className="teacher-specialization">
                      {teacher.specialization}
                    </div>
                    {teacher.totalHours !== undefined && (
                      <div className="teacher-stats">
                        <span className="hours-count">{teacher.totalHours} حصة</span>
                        {teacher.loadPercentage !== undefined && (
                          <span className="load-percentage">({teacher.loadPercentage}%)</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="teacher-actions">
                    <button
                      className="view-details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTeacherSelect(teacher.id);
                      }}
                      title={`عرض تفاصيل ${teacher.name}`}
                      aria-label={`عرض تفاصيل ${teacher.name}`}
                      tabIndex={-1}
                    >
                      <i className="fas fa-eye" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>

                {/* مؤشر التحميل والحالة */}
                {teacher.loadPercentage !== undefined && (
                  <div 
                    className="load-indicator"
                    style={{ 
                      width: `${Math.min(teacher.loadPercentage, 100)}%`,
                      backgroundColor: teacher.loadPercentage > 100 ? '#ef4444' : teacher.loadPercentage > 80 ? '#f59e0b' : '#10b981'
                    }}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* شريط التمرير المخصص (اختياري) */}
      <div className="virtual-scrollbar" ref={scrollbarRef}>
        <div 
          className="scrollbar-thumb"
          style={{
            height: `${(containerHeight / totalHeight) * 100}%`,
            top: `${(scrollTop / totalHeight) * 100}%`
          }}
        />
      </div>

      {/* معلومات الأداء (في وضع التطوير) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="virtual-debug-info">
          <small>
            المرئي: {visibleItems.length} من {teachers.length} | 
            التمرير: {Math.round(scrollTop)}px |
            الأداء: {Math.round((visibleItems.length / teachers.length) * 100)}%
          </small>
        </div>
      )}
    </div>
  );
};

export default VirtualizedTeacherList;