
import React, { useState } from 'react';
import { FileText, Printer, Share2, Calendar, User, CalendarDays } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { Label } from '../../../components/ui/label';
import { mockTeachers } from '../mockData';

type ReportType = 'DAILY_PREPARATION' | 'TEACHER_WORKS';
type PeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

const ReportsTab = () => {
  const [reportType, setReportType] = useState<ReportType>('DAILY_PREPARATION');
  const [periodType, setPeriodType] = useState<PeriodType>('DAILY');
  
  // Daily Params
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Weekly Params
  const [selectedWeek, setSelectedWeek] = useState<string>('1');
  
  // Monthly Params
  const [selectedMonth, setSelectedMonth] = useState<string>('1');

  // Teacher Selection
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');

  const weeks = Array.from({ length: 13 }, (_, i) => i + 1);
  const months = [
    { value: '1', label: 'محرم' },
    { value: '2', label: 'صفر' },
    { value: '3', label: 'ربيع الأول' },
    { value: '4', label: 'ربيع الثاني' },
    { value: '5', label: 'جمادى الأولى' },
    { value: '6', label: 'جمادى الثانية' },
  ];

  const handlePrint = () => {
    // In a real app, this would generate a PDF
    window.print();
  };

  const handleWhatsApp = () => {
    const text = `تقرير ${reportType === 'DAILY_PREPARATION' ? 'متابعة التحضير' : 'أعمال المعلمين'} - ${periodType === 'DAILY' ? selectedDate : periodType === 'WEEKLY' ? `الأسبوع ${selectedWeek}` : `شهر ${selectedMonth}`}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#4f46e5]" />
          إصدار التقارير
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Report Configuration Form */}
          <div className="space-y-6">
            
            {/* 1. Report Category */}
            <div className="space-y-3">
               <Label className="text-base font-bold text-gray-700">نوع التقرير</Label>
               <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setReportType('DAILY_PREPARATION')}
                    className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${reportType === 'DAILY_PREPARATION' ? 'border-[#4f46e5] bg-indigo-50/50 text-[#4f46e5]' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <CalendarDays className="w-6 h-6" />
                    <span className="font-bold">متابعة التحضير اليومي</span>
                  </div>
                  <div 
                    onClick={() => setReportType('TEACHER_WORKS')}
                    className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${reportType === 'TEACHER_WORKS' ? 'border-[#6366f1] bg-indigo-50/50 text-[#6366f1]' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="font-bold">متابعة أعمال المعلمين</span>
                  </div>
               </div>
            </div>

            {/* 2. Period Selection */}
            <div className="space-y-3">
               <Label className="text-base font-bold text-gray-700">فترة التقرير</Label>
               <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setPeriodType('DAILY')}
                    className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${periodType === 'DAILY' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    يومي
                  </button>
                  <button 
                    onClick={() => setPeriodType('WEEKLY')}
                    className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${periodType === 'WEEKLY' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    أسبوعي
                  </button>
                  <button 
                    onClick={() => setPeriodType('MONTHLY')}
                    className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${periodType === 'MONTHLY' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    شهري
                  </button>
               </div>
            </div>

            {/* 3. Specific Date/Period */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
               {periodType === 'DAILY' && (
                 <div className="space-y-2">
                   <Label>تاريخ التقرير</Label>
                   <Input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-white"
                   />
                 </div>
               )}
               
               {periodType === 'WEEKLY' && (
                 <div className="space-y-2">
                   <Label>اختر الأسبوع</Label>
                   <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                     <SelectTrigger className="bg-white">
                       <SelectValue placeholder="اختر الأسبوع" />
                     </SelectTrigger>
                     <SelectContent>
                       {weeks.map(w => (
                         <SelectItem key={w} value={w.toString()} className="text-right">الأسبوع {w}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               )}

               {periodType === 'MONTHLY' && (
                 <div className="space-y-2">
                   <Label>اختر الشهر</Label>
                   <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                     <SelectTrigger className="bg-white">
                       <SelectValue placeholder="اختر الشهر" />
                     </SelectTrigger>
                     <SelectContent>
                       {months.map(m => (
                         <SelectItem key={m.value} value={m.value} className="text-right">{m.label}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               )}
            </div>

            {/* 4. Teacher Scope */}
            <div className="space-y-2">
               <Label className="text-base font-bold text-gray-700">المعلمين</Label>
               <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                 <SelectTrigger className="bg-white border-gray-300 h-11">
                   <SelectValue placeholder="اختر المعلمين" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all" className="font-bold text-right border-b">عرض جميع المعلمين</SelectItem>
                   {mockTeachers.map(t => (
                     <SelectItem key={t.id} value={t.id} className="text-right">{t.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
          </div>

          {/* Report Preview / Actions */}
          <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-6 flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
               {reportType === 'DAILY_PREPARATION' ? (
                 <CalendarDays className="w-8 h-8 text-[#4f46e5]" />
               ) : (
                 <FileText className="w-8 h-8 text-[#6366f1]" />
               )}
             </div>
             
             <h4 className="text-lg font-bold text-gray-900 mb-2">
               {reportType === 'DAILY_PREPARATION' ? 'تقرير متابعة التحضير' : 'تقرير أعمال المعلمين'}
             </h4>
             <p className="text-gray-500 text-sm mb-6">
               {periodType === 'DAILY' && `ليوم ${selectedDate}`}
               {periodType === 'WEEKLY' && `للأسبوع رقم ${selectedWeek}`}
               {periodType === 'MONTHLY' && `لشهر ${months.find(m => m.value === selectedMonth)?.label}`}
               <br />
               {selectedTeacherId === 'all' ? 'لجميع المعلمين' : `للمعلم: ${mockTeachers.find(t => t.id === selectedTeacherId)?.name}`}
             </p>

             <div className="w-full space-y-3">
               <Button onClick={handlePrint} className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white h-12 text-lg shadow-lg">
                 <Printer className="w-5 h-5 ml-2" />
                 طباعة التقرير (PDF)
               </Button>
               
               <Button onClick={handleWhatsApp} variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50 h-12 text-lg">
                 <Share2 className="w-5 h-5 ml-2" />
                 إرسال عبر واتساب
               </Button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
