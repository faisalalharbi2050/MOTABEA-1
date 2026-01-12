import React, { useState } from 'react';
import { ClipboardList, Shield, Eye, Calendar, Clock } from 'lucide-react';

interface DayScheduleWidgetProps {
  title: string;
  icon?: React.ReactNode;
  absentTeachers: { name: string; subject: string; periods: number }[];
  supervisors: string[];
  dutyStaff: string[];
}

const DayScheduleWidget: React.FC<DayScheduleWidgetProps> = ({ 
  title, 
  icon,
  absentTeachers, 
  supervisors, 
  dutyStaff 
}) => {
  const [activeTab, setActiveTab] = useState<'absences' | 'supervisors' | 'duty'>('absences');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#e5e1fe] flex items-center justify-center">
                {icon || <Calendar className="h-5 w-5 text-[#655ac1]" />}
            </div>
            {title}
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-gray-50 rounded-xl mb-4 gap-1">
        <button 
          onClick={() => setActiveTab('absences')}
          className={`flex-1 py-3 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${
            activeTab === 'absences' 
              ? 'bg-white text-[#655ac1] shadow-md scale-[1.02]' 
              : 'text-gray-500 hover:text-[#655ac1] hover:bg-white/60 hover:shadow-sm hover:scale-[1.02]'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <ClipboardList className="w-4 h-4" />
             <span>الغياب</span>
             <span className={`px-1.5 py-0.5 rounded-md text-[10px] transition-colors ${activeTab === 'absences' ? 'bg-[#f0efff] text-[#655ac1]' : 'bg-gray-100 text-gray-500'}`}>{absentTeachers.length}</span>
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('supervisors')}
          className={`flex-1 py-3 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${
            activeTab === 'supervisors' 
              ? 'bg-white text-[#655ac1] shadow-md scale-[1.02]' 
              : 'text-gray-500 hover:text-[#655ac1] hover:bg-white/60 hover:shadow-sm hover:scale-[1.02]'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Shield className="w-4 h-4" />
             <span>الإشراف</span>
             <span className={`px-1.5 py-0.5 rounded-md text-[10px] transition-colors ${activeTab === 'supervisors' ? 'bg-[#f0efff] text-[#655ac1]' : 'bg-gray-100 text-gray-500'}`}>{supervisors.length}</span>
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('duty')}
          className={`flex-1 py-3 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${
            activeTab === 'duty' 
              ? 'bg-white text-[#655ac1] shadow-md scale-[1.02]' 
              : 'text-gray-500 hover:text-[#655ac1] hover:bg-white/60 hover:shadow-sm hover:scale-[1.02]'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Eye className="w-4 h-4" />
             <span>المناوبة</span>
             <span className={`px-1.5 py-0.5 rounded-md text-[10px] transition-colors ${activeTab === 'duty' ? 'bg-[#f0efff] text-[#655ac1]' : 'bg-gray-100 text-gray-500'}`}>{dutyStaff.length}</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 max-h-[250px]">
        {activeTab === 'absences' && (
          <>
            {absentTeachers.length > 0 ? absentTeachers.map((t, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#f6f5ff] border border-transparent hover:border-[#e5e1fe] transition-colors group">
                <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-gray-400 font-bold text-xs shadow-sm group-hover:text-[#7768e5] group-hover:border-[#7768e5]">{idx+1}</div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.subject}</p>
                </div>
                 <span className="text-xs font-bold text-[#7768e5] bg-[#e5e1fe] px-2 py-1 rounded">{t.periods} حصص</span>
              </div>
            )) : <p className="text-center text-gray-400 py-4 text-xs">لا يوجد غياب مسجل</p>}
          </>
        )}

        {activeTab === 'supervisors' && (
          <>
             {supervisors.length > 0 ? supervisors.map((name, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#f6f5ff] border border-transparent hover:border-[#e5e1fe] transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-gray-400 font-bold text-xs shadow-sm group-hover:text-[#7768e5] group-hover:border-[#7768e5]">{idx+1}</div>
                    <p className="font-bold text-sm text-gray-800">{name}</p>
                </div>
             )) : <p className="text-center text-gray-400 py-4 text-xs">لا يوجد مشرفين مسجلين</p>}
          </>
        )}

        {activeTab === 'duty' && (
          <>
             {dutyStaff.length > 0 ? dutyStaff.map((name, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#f6f5ff] border border-transparent hover:border-[#e5e1fe] transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-gray-400 font-bold text-xs shadow-sm group-hover:text-[#7768e5] group-hover:border-[#7768e5]">{idx+1}</div>
                    <p className="font-bold text-sm text-gray-800">{name}</p>
                </div>
             )) : <p className="text-center text-gray-400 py-4 text-xs">لا يوجد مناوبين مسجلين</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default DayScheduleWidget;
