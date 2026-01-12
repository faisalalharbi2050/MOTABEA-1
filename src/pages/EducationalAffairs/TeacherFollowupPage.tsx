
import React, { useState } from 'react';
import { FileText, Activity, Layers, CalendarCheck, BookOpen } from 'lucide-react';
import PreparationTab from './components/PreparationTab';
import VisitsTab from './components/VisitsTab';
import ReportsTab from './components/ReportsTab';

const TeacherFollowupPage = () => {
  const [activeTab, setActiveTab] = useState<'works' | 'preparation' | 'reports'>('preparation');

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6" dir="rtl">
      
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">متابعة أعمال المعلمين</h1>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat Card 1 */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm text-gray-500 mb-1">نسبة التحضير اليوم</p>
              <h3 className="text-2xl font-bold text-[#4f46e5]">85%</h3>
            </div>
            <div className="p-3 bg-[#4f46e5]/10 rounded-lg">
              <Activity className="w-6 h-6 text-[#4f46e5]" />
            </div>
          </div>
          
          {/* Stat Card 2 */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm text-gray-500 mb-1">زيارات هذا الشهر</p>
              <h3 className="text-2xl font-bold text-[#6366f1]">42</h3>
            </div>
            <div className="p-3 bg-[#6366f1]/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-[#6366f1]" />
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm text-gray-500 mb-1">معلمين بحاجة لزيارة</p>
              <h3 className="text-2xl font-bold text-[#818cf8]">7</h3>
            </div>
            <div className="p-3 bg-[#818cf8]/10 rounded-lg">
              <CalendarCheck className="w-6 h-6 text-[#818cf8]" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <button
            onClick={() => setActiveTab('preparation')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-sm
              ${activeTab === 'preparation' 
                ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md scale-105' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}
            `}
          >
            <CalendarCheck className="w-4 h-4" />
            متابعة التحضير اليومي
          </button>

          <button
            onClick={() => setActiveTab('works')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-sm
              ${activeTab === 'works' 
                ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md scale-105' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}
            `}
          >
            <BookOpen className="w-4 h-4" />
            متابعة أعمال المعلمين
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-sm
              ${activeTab === 'reports' 
                ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md scale-105' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}
            `}
          >
            <FileText className="w-4 h-4" />
            التقارير
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        {activeTab === 'works' && <VisitsTab />}
        {activeTab === 'preparation' && <PreparationTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>

    </div>
  );
};

export default TeacherFollowupPage;
