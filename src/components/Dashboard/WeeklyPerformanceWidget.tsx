import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  GraduationCap, 
  MessageSquare, 
  ClipboardList, 
  BarChart3 
} from 'lucide-react';

const WEEK_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

// Mock Data
const data = [
  { name: 'الأحد', teacherAbsence: 4, studentAbsence: 25, messages: 150, waiting: 5 },
  { name: 'الاثنين', teacherAbsence: 2, studentAbsence: 18, messages: 230, waiting: 3 },
  { name: 'الثلاثاء', teacherAbsence: 5, studentAbsence: 30, messages: 180, waiting: 6 },
  { name: 'الأربعاء', teacherAbsence: 1, studentAbsence: 15, messages: 120, waiting: 2 },
  { name: 'الخميس', teacherAbsence: 3, studentAbsence: 40, messages: 200, waiting: 4 },
];

const WeeklyPerformanceWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'messages' | 'waiting'>('teachers');

  const tabs = [
    { id: 'teachers', label: 'غياب المعلمين', icon: Users, color: '#8884d8', dataKey: 'teacherAbsence' },

    { id: 'messages', label: 'الرسائل', icon: MessageSquare, color: '#ffc658', dataKey: 'messages' },
    { id: 'waiting', label: 'الانتظار', icon: ClipboardList, color: '#ff8042', dataKey: 'waiting' },
  ];

  const activeTabInfo = tabs.find(t => t.id === activeTab)!;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl text-right">
          <p className="font-bold text-gray-800 mb-1">{label}</p>
          <p className="text-sm" style={{ color: '#8779fb' }}>
            {`${activeTabInfo.label}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#e5e1fe] flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-[#655ac1]" />
            </div>
            الأداء الأسبوعي
        </h2>
      </div>

      {/* Tabs - Icon Only */}
      <div className="flex items-center justify-start gap-2 mb-6">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            title={tab.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              activeTab === tab.id 
                ? 'bg-[#e5e1fe] text-[#8779fb] ring-2 ring-[#8779fb] ring-offset-2' 
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
          >
            <tab.icon className="w-5 h-5" style={{ color: activeTab === tab.id ? '#8779fb' : undefined }} />
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[250px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'messages' ? (
             <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8779fb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8779fb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  reversed={true}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  dy={10}
                  interval={0}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Area 
                  type="monotone" 
                  dataKey={activeTabInfo.dataKey} 
                  stroke="#8779fb" 
                  fillOpacity={1} 
                  fill="url(#colorMessages)" 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
             </AreaChart>
          ) : (
            <BarChart data={data} barSize={40} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                reversed={true}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                dy={10}
                interval={0}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Bar 
                dataKey={activeTabInfo.dataKey} 
                fill="#8779fb" 
                radius={[6, 6, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyPerformanceWidget;
