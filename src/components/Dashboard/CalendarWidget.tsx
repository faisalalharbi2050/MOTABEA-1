import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Trash2, Clock } from 'lucide-react';

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color: string;
  time?: string;
}

const months = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const colors = [
  { name: 'أزرق', value: '#3b82f6' },
  { name: 'أخضر', value: '#10b981' },
  { name: 'أحمر', value: '#ef4444' },
  { name: 'برتقالي', value: '#f59e0b' },
  { name: 'بنفسجي', value: '#8b5cf6' },
];

const CalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  
  // Interaction States
  const [hoveredEvent, setHoveredEvent] = useState<{ id: string, title: string, x: number, y: number } | null>(null);
  const [viewEvent, setViewEvent] = useState<CalendarEvent | null>(null);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventColor, setNewEventColor] = useState(colors[0].value);

  // Load events from local storage
  useEffect(() => {
    const savedEvents = localStorage.getItem('motabea_calendar_events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        console.error('Failed to parse events', e);
      }
    }
  }, []);

  // Save events
  useEffect(() => {
    localStorage.setItem('motabea_calendar_events', JSON.stringify(events));
  }, [events]);

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Open Add Modal Flows
  // 1. From Header Button -> Show Instruction
  const handleHeaderAddClick = () => {
    setShowInstructionModal(true);
  };

  // 3. From Grid Click -> Direct to Main Form
  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDay(dateStr);
    setShowModal(true);
    setNewEventTitle('');
    setNewEventTime('');
    setNewEventColor(colors[0].value);
  };

  const handleAddEvent = () => {
    if (!selectedDay || !newEventTitle.trim()) return;

    const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        date: selectedDay,
        title: newEventTitle,
        color: newEventColor,
        time: newEventTime
    };

    setEvents([...events, newEvent]);
    setShowModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    setViewEvent(null);
  };

  // Hover Handlers
  const handleEventHover = (e: React.MouseEvent, event: CalendarEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setHoveredEvent({
        id: event.id,
        title: event.title,
        x: rect.left + rect.width / 2,
        y: rect.top
    });
  };

  const handleEventLeave = () => {
    setHoveredEvent(null);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const getHijriDay = (date: Date) => {
    try {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric' }).format(date);
    } catch (e) {
        return '';
    }
  };

  // Grid Generation
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-16 bg-gray-50/30 rounded-lg"></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(year, month, i);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayEvents = events.filter(e => e.date === dateStr);
    const isToday = new Date().toDateString() === dateObj.toDateString();
    const hijriDay = getHijriDay(dateObj);

    days.push(
      <div 
        key={i} 
        onClick={() => handleDayClick(i)} 
        className={`h-16 rounded-lg border flex flex-col items-center justify-between p-1 relative transition-all duration-200 group cursor-pointer
          ${isToday ? 'bg-[#f5f3ff] ring-1 ring-[#655ac1] border-[#655ac1]' : 'bg-white border-gray-100 hover:border-[#655ac1] hover:shadow-sm'}
        `}
      >
        <div className="flex justify-between w-full items-start px-1 z-0">
             <span className={`text-xs font-bold ${isToday ? 'text-[#655ac1]' : 'text-gray-700'}`}>{i}</span>
             <span className="text-[10px] text-gray-400 font-medium">{hijriDay}</span>
        </div>
        
        <div className="flex gap-1 mb-1 flex-wrap justify-center max-w-full px-1 z-10">
          {dayEvents.slice(0, 4).map((ev, idx) => (
            <div 
              key={idx} 
              className="w-3 h-3 rounded-full cursor-pointer hover:scale-125 transition-transform shadow-sm border border-white/50" 
              style={{ backgroundColor: ev.color }}
              onMouseEnter={(e) => handleEventHover(e, ev)}
              onMouseLeave={handleEventLeave}
              onClick={(e) => {
                e.stopPropagation();
                setViewEvent(ev);
              }}
            ></div>
          ))}
          {dayEvents.length > 4 && <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-full relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4 border-b border-gray-100 pb-4">
        {/* Title */}
        <div className="flex items-center gap-3">
             <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#e5e1fe] flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-[#655ac1]" />
                </div>
                التقويم
            </h2>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
             {/* Add Event Button */}
            <button 
                onClick={handleHeaderAddClick}
                className="bg-[#8779fb] hover:bg-[#7668e5] text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
                <Plus className="h-3.5 w-3.5" />
                <span>حدث جديد</span>
            </button>

            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                 <button 
                    onClick={handlePrevMonth} 
                    className="p-1 hover:bg-white rounded-md transition-colors text-gray-500 hover:text-[#655ac1]"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-2 px-2">
                    <select 
                        value={month} 
                        onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}
                        className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer hover:text-[#655ac1]"
                    >
                        {months.map((m, idx) => (
                            <option key={idx} value={idx}>{m} {idx + 1}</option>
                        ))}
                    </select>
                    <span className="text-gray-300">|</span>
                    <select 
                        value={year} 
                        onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), month, 1))}
                        className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer hover:text-[#655ac1]"
                    >
                        {Array.from({ length: 5 }).map((_, i) => {
                            const y = new Date().getFullYear() - 2 + i;
                            return <option key={y} value={y}>{y}</option>;
                        })}
                    </select>
                </div>

                <button 
                    onClick={handleNextMonth} 
                    className="p-1 hover:bg-white rounded-md transition-colors text-gray-500 hover:text-[#655ac1]"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-7 mb-2 border-b border-gray-50 pb-2">
            {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                <div key={day} className="text-xs font-bold text-gray-400 text-center">{day}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
            {days}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredEvent && (
        <div 
            className="fixed z-50 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-6px] animate-in fade-in duration-150"
            style={{ left: hoveredEvent.x, top: hoveredEvent.y }}
        >
            {hoveredEvent.title}
        </div>
      )}

      {/* View Event Details Modal */}
      {viewEvent && (
         <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/20 backdrop-blur-[2px] rounded-2xl animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-[280px] p-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#e5e1fe]/50 to-transparent rounded-bl-full -mr-4 -mt-4"></div>
                <button onClick={() => setViewEvent(null)} className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-4 w-4" />
                </button>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm text-white text-lg font-bold" style={{ backgroundColor: viewEvent.color }}>
                            {viewEvent.title.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">{viewEvent.title}</h3>
                            <span className="text-xs text-gray-500 dir-ltr">{viewEvent.date}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4 text-center justify-center">
                        <Clock className="h-4 w-4 text-[#655ac1]" />
                        <span>{viewEvent.time || 'طوال اليوم'}</span>
                    </div>
                    <button 
                        onClick={() => handleDeleteEvent(viewEvent.id)}
                        className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>حذف الحدث</span>
                    </button>
                </div>
            </div>
         </div>
      )}

      {/* Instruction Modal (Step 1) */}
      {showInstructionModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl animate-in fade-in duration-200">
             <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-[300px] p-6 animate-in zoom-in-95 duration-200 text-center">
                <div className="w-12 h-12 bg-[#f5f3ff] rounded-full flex items-center justify-center mx-auto mb-4 text-[#8779fb]">
                    <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">تعليمات الإضافة</h3>
                <p className="text-sm text-gray-500 mb-6">
                    الرجاء النقر على اليوم المطلوب من مربعات التقويم أدناه لإضافة حدث جديد.
                </p>
                <button 
                    onClick={() => setShowInstructionModal(false)}
                    className="w-full bg-[#8779fb] hover:bg-[#7668e5] text-white font-bold py-2 rounded-lg transition-colors"
                >
                    حسناً، فهمت
                </button>
             </div>
        </div>
      )}

      {/* Add Event Form Modal (Step 2) */}
      {showModal && selectedDay && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm mx-4 p-4 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">
                        إضافة حدث جديد
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="bg-gray-50 p-2 rounded-lg text-center text-sm font-medium text-[#655ac1] mb-2 flex items-center justify-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {selectedDay}
                    </div>

                    <input
                        type="text"
                        placeholder="عنوان المهمة / الحدث..."
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#655ac1] focus:ring-1 focus:ring-[#655ac1]"
                        autoFocus
                    />
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Clock className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                                <input 
                                    type="time" 
                                    value={newEventTime}
                                    onChange={(e) => setNewEventTime(e.target.value)}
                                    className="w-full text-sm p-2 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:border-[#655ac1]"
                                />
                            </div>
                            <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                                {colors.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => setNewEventColor(c.value)}
                                        className={`w-6 h-6 rounded-full m-0.5 border-2 transition-transform hover:scale-110 ${newEventColor === c.value ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c.value }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                    <button
                        onClick={handleAddEvent}
                        disabled={!newEventTitle.trim()}
                        className="w-full bg-[#8779fb] hover:bg-[#7668e5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        حفظ الحدث
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default CalendarWidget;
