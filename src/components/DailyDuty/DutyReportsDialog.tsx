import React, { useState } from 'react';
import { X, FileText, Download, Printer, Search, CheckSquare, Square, FileCheck } from 'lucide-react';
import { DutyReport, DutyStatistics } from '../../types/dailyDuty';

interface DutyReportsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WeeklyReportRow {
  day: string;
  date: string;
  dutyGuardName: string;
  present: boolean;
  absent: boolean;
  excused: boolean;
  withdrawn: boolean;
  reportSubmitted: boolean | null;
  actionTime?: string;
  notes?: string;
}

interface MonthlyReportRow {
  week: string;
  dutyGuardName: string;
  present: number;
  absent: number;
  excused: number;
  withdrawn: number;
  reportsSubmitted: number;
  reportsNotSubmitted: number;
  actionTimes: string[];
  notes: string[];
}

const DutyReportsDialog: React.FC<DutyReportsDialogProps> = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'template'>('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDutyGuards, setSelectedDutyGuards] = useState<string[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<DutyReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [weeklyData, setWeeklyData] = useState<WeeklyReportRow[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyReportRow[]>([]);

  // بيانات تجريبية للمناوبين
  const mockDutyGuards = [
    { id: '1', name: 'عبدالله أحمد' },
    { id: '2', name: 'محمد خالد' },
    { id: '3', name: 'سعيد علي' },
    { id: '4', name: 'فهد يوسف' },
    { id: '5', name: 'عمر سالم' },
    { id: '6', name: 'خالد محمود' }
  ];

  // فلترة المناوبين بناءً على البحث
  const filteredDutyGuards = mockDutyGuards.filter(guard =>
    guard.name.includes(searchTerm)
  );

  const toggleDutyGuard = (id: string) => {
    setSelectedDutyGuards(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedDutyGuards(filteredDutyGuards.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedDutyGuards([]);
  };

  // دالة حساب الفرق بالأيام بين تاريخين
  const calculateDaysDifference = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // دالة توليد بيانات تجريبية للتقرير الأسبوعي
  const generateWeeklyData = (): WeeklyReportRow[] => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
    const data: WeeklyReportRow[] = [];
    
    const selectedDutyGuardNames = mockDutyGuards
      .filter(s => selectedDutyGuards.includes(s.id))
      .map(s => s.name);

    days.forEach((day) => {
      selectedDutyGuardNames.forEach((name) => {
        const random = Math.random();
        const row: WeeklyReportRow = {
          day,
          date: `${startDate}`,
          dutyGuardName: name,
          present: random > 0.3,
          absent: random <= 0.1,
          excused: random > 0.1 && random <= 0.15,
          withdrawn: random > 0.15 && random <= 0.3,
          reportSubmitted: random > 0.5 ? true : random > 0.3 ? false : null,
          actionTime: random <= 0.3 ? '10:30' : undefined,
          notes: random <= 0.2 ? 'ملاحظة تجريبية' : undefined
        };
        data.push(row);
      });
    });

    return data;
  };

  // دالة توليد بيانات تجريبية للتقرير الشهري
  const generateMonthlyData = (): MonthlyReportRow[] => {
    const weeks = ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع'];
    const data: MonthlyReportRow[] = [];
    
    const selectedDutyGuardNames = mockDutyGuards
      .filter(s => selectedDutyGuards.includes(s.id))
      .map(s => s.name);

    weeks.forEach(week => {
      selectedDutyGuardNames.forEach(name => {
        const row: MonthlyReportRow = {
          week,
          dutyGuardName: name,
          present: Math.floor(Math.random() * 4) + 1,
          absent: Math.floor(Math.random() * 2),
          excused: Math.floor(Math.random() * 2),
          withdrawn: Math.floor(Math.random() * 2),
          reportsSubmitted: Math.floor(Math.random() * 4) + 1,
          reportsNotSubmitted: Math.floor(Math.random() * 2),
          actionTimes: ['10:30', '11:00'],
          notes: ['ملاحظة 1', 'ملاحظة 2']
        };
        data.push(row);
      });
    });

    return data;
  };

  const generateReport = () => {
    // إذا كان نموذج تقرير المناوبة، نعرضه مباشرة
    if (reportType === 'template') {
      setShowReport(true);
      return;
    }

    if (!startDate || !endDate) {
      alert('يرجى تحديد الفترة الزمنية');
      return;
    }

    if (selectedDutyGuards.length === 0) {
      alert('يرجى اختيار مناوب واحد على الأقل');
      return;
    }

    // تحذير للتقرير الشهري إذا كانت الفترة أقل من 4 أسابيع
    if (reportType === 'monthly') {
      const daysDiff = calculateDaysDifference(startDate, endDate);
      if (daysDiff < 28) {
        const confirmProceed = confirm(
          `تنبيه: الفترة المحددة (${daysDiff} يوم) أقل من 4 أسابيع (28 يوم).\n\n` +
          'للحصول على تقرير شهري دقيق، يُفضل اختيار فترة 4 أسابيع على الأقل.\n\n' +
          'هل تريد المتابعة؟'
        );
        if (!confirmProceed) {
          return;
        }
      }
    }

    // توليد البيانات
    if (reportType === 'weekly') {
      setWeeklyData(generateWeeklyData());
    } else {
      setMonthlyData(generateMonthlyData());
    }

    // حساب إحصائيات تجريبية
    const totalDays = 20;
    const workingDays = totalDays;
    const fullyActivated = 15;
    const notActivated = 3;
    const partiallyActivated = 2;
    const activationRate = ((fullyActivated + partiallyActivated * 0.5) / workingDays) * 100;

    const statistics: DutyStatistics = {
      totalDays,
      workingDays,
      fullyActivated,
      notActivated,
      partiallyActivated,
      activationRate: Math.round(activationRate * 100) / 100
    };

    const report: DutyReport = {
      userId: '',
      reportType: reportType === 'weekly' ? 'weekly' : 'monthly',
      startDate,
      endDate,
      statistics,
      details: []
    };

    setReportData(report);
    setShowReport(true);
  };

  const exportToPDF = () => {
    alert('سيتم تصدير التقرير إلى PDF قريباً');
  };

  const printReport = () => {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) return;

    const reportContent = document.getElementById('report-content');
    if (!reportContent) return;

    // معلومات المسؤولين - يجب جلبها من الإعدادات
    const educationalAffairsVice = 'أحمد محمد العمري';
    const principalName = 'خالد سعيد المطيري';

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>تقرير المناوبة اليومية</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              direction: rtl; 
              padding: 20px;
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 3px solid #4f46e5;
              padding-bottom: 20px;
            }
            .header h1 { 
              color: #4f46e5; 
              margin-bottom: 15px;
              font-size: 28px;
            }
            .header p {
              color: #666;
              font-size: 14px;
              margin: 5px 0;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th, td { 
              border: 1px solid #333; 
              padding: 10px 8px; 
              text-align: center;
              font-size: 13px;
            }
            th { 
              background-color: #4f46e5; 
              color: white; 
              font-weight: bold;
              font-size: 14px;
            }
            tr:nth-child(even) { background-color: #f8f9fa; }
            .check-mark { 
              color: #10b981; 
              font-weight: bold;
              font-size: 18px;
            }
            .signatures {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .signature-box {
              width: 45%;
              text-align: center;
            }
            .signature-line {
              border-top: 2px solid #333;
              margin-top: 80px;
              padding-top: 10px;
              font-weight: bold;
            }
            @media print {
              body { padding: 10px; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          ${reportContent.innerHTML}
          
          ${reportType !== 'template' ? `
          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line">
                توقيع وكيل الشؤون التعليمية<br>
                ${educationalAffairsVice}
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                توقيع مدير المدرسة<br>
                ${principalName}
              </div>
            </div>
          </div>
          ` : ''}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const resetReport = () => {
    setShowReport(false);
    setReportData(null);
    setWeeklyData([]);
    setMonthlyData([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-kufi" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white p-4 rounded-t-xl flex justify-between items-center z-10 shadow-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h2 className="text-xl font-bold">تقارير المناوبة</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!showReport ? (
            <div className="space-y-4">
              {/* نوع التقرير */}
              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">
                  نوع التقرير
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setReportType('weekly')}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                      reportType === 'weekly'
                        ? 'border-[#4f46e5] bg-gradient-to-br from-[#4f46e5]/10 to-[#6366f1]/10 shadow-lg'
                        : 'border-gray-300 bg-white hover:border-[#6366f1] hover:shadow-md'
                    }`}
                  >
                    <div className="font-bold text-base text-gray-800">أسبوعي</div>
                  </button>
                  <button
                    onClick={() => setReportType('monthly')}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                      reportType === 'monthly'
                        ? 'border-[#4f46e5] bg-gradient-to-br from-[#4f46e5]/10 to-[#6366f1]/10 shadow-lg'
                        : 'border-gray-300 bg-white hover:border-[#6366f1] hover:shadow-md'
                    }`}
                  >
                    <div className="font-bold text-base text-gray-800">شهري</div>
                    <div className="text-xs text-gray-600 mt-1">تقرير لمدة شهر (4 أسابيع)</div>
                  </button>
                  <button
                    onClick={() => setReportType('template')}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                      reportType === 'template'
                        ? 'border-[#4f46e5] bg-gradient-to-br from-[#4f46e5]/10 to-[#6366f1]/10 shadow-lg'
                        : 'border-gray-300 bg-white hover:border-[#6366f1] hover:shadow-md'
                    }`}
                  >
                    <div className="font-bold text-base text-gray-800 flex items-center justify-center gap-1">
                      <FileCheck className="w-4 h-4" />
                      نموذج تقرير المناوبة
                    </div>
                    <div className="text-xs text-gray-600 mt-1">نموذج مفرّغ للطباعة</div>
                  </button>
                </div>
              </div>

              {/* الفترة الزمنية - يخفى عند اختيار النموذج */}
              {reportType !== 'template' && (
                <div>
                  <label className="block text-base font-bold text-gray-800 mb-2">
                    الفترة الزمنية
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        من تاريخ
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        إلى تاريخ
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* اختيار المناوبين - يخفى عند اختيار النموذج */}
              {reportType !== 'template' && (
                <div>
                  <label className="block text-base font-bold text-gray-800 mb-2">
                    المناوبون
                  </label>
                  
                  {/* شريط البحث وأزرار التحديد */}
                  <div className="mb-3 space-y-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث عن مناوب..."
                        className="w-full pr-10 pl-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all text-sm"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={selectAll}
                        className="flex-1 px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                      >
                        <CheckSquare className="w-4 h-4" />
                        تحديد الكل
                      </button>
                      <button
                        onClick={deselectAll}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                      >
                        <Square className="w-4 h-4" />
                        إلغاء الكل
                      </button>
                    </div>
                  </div>

                  {/* قائمة المناوبين */}
                  <div className="space-y-1 max-h-48 overflow-y-auto border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
                    {filteredDutyGuards.length > 0 ? (
                      filteredDutyGuards.map(guard => (
                        <label
                          key={guard.id}
                          className="flex items-center p-2 hover:bg-white rounded-lg cursor-pointer transition-all duration-150 border border-transparent hover:border-[#4f46e5]"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDutyGuards.includes(guard.id)}
                            onChange={() => toggleDutyGuard(guard.id)}
                            className="w-4 h-4 text-[#4f46e5] rounded focus:ring-[#4f46e5] border-gray-300"
                          />
                          <span className="mr-2 text-sm text-gray-700">{guard.name}</span>
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        لا توجد نتائج للبحث
                      </div>
                    )}
                  </div>
                  
                  {selectedDutyGuards.length > 0 && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-semibold">تم اختيار:</span> {selectedDutyGuards.length} مناوب
                    </div>
                  )}
                </div>
              )}

              {/* زر إنشاء التقرير */}
              <button
                onClick={generateReport}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white rounded-lg hover:from-[#4338ca] hover:to-[#4f46e5] transition-all duration-200 font-bold text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <FileText className="w-5 h-5" />
                {reportType === 'template' ? 'عرض النموذج' : 'إنشاء التقرير'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* محتوى التقرير للطباعة والعرض */}
              <div id="report-content" className="report-view">
                {reportType === 'template' ? (
                  /* نموذج تقرير المناوبة اليومي */
                  <>
                    <div className="header text-center mb-4 pb-4 border-b-2 border-[#4f46e5]">
                      <h1 className="text-2xl font-bold text-[#4f46e5] mb-2">تقرير المناوبة اليومي</h1>
                      <div className="header-info flex justify-around text-sm mt-3 flex-wrap gap-2">
                        <div>
                          <strong className="text-[#4f46e5]">المدرسة:</strong> {localStorage.getItem('schoolName') || '_________________'}
                        </div>
                        <div>
                          <strong className="text-[#4f46e5]">الفصل الدراسي:</strong> _________________
                        </div>
                        <div>
                          <strong className="text-[#4f46e5]">العام الدراسي:</strong> _________________
                        </div>
                      </div>
                      <div className="header-info flex justify-around text-sm mt-2 flex-wrap gap-2">
                        <div>
                          <strong className="text-[#4f46e5]">اليوم:</strong> _________________
                        </div>
                        <div>
                          <strong className="text-[#4f46e5]">التاريخ:</strong> _________________ (_________________)
                        </div>
                      </div>
                    </div>

                    {/* الجدول 1: الموظف المناوب */}
                    <div className="bg-[#818cf8] text-white py-2 px-3 mt-3 mb-2 rounded font-bold text-sm">الموظف المناوب</div>
                    <table className="w-full border-collapse mb-4 text-xs">
                      <thead>
                        <tr className="bg-[#4f46e5] text-white">
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '10%' }}>م</th>
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '35%' }}>الاسم</th>
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '30%' }}>التوقيع</th>
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '25%' }}>ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                            <td className="border border-gray-300 p-2 h-10"></td>
                            <td className="border border-gray-300 p-2 h-10"></td>
                            <td className="border border-gray-300 p-2 h-10"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* الجدول 2: الطلاب المتأخرون */}
                    <div className="bg-[#818cf8] text-white py-2 px-3 mt-3 mb-2 rounded font-bold text-sm">الطلاب المتأخرون</div>
                    <table className="w-full border-collapse mb-4 text-xs">
                      <thead>
                        <tr className="bg-[#4f46e5] text-white">
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '25%' }}>الاسم</th>
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '15%' }}>الصف</th>
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '15%' }}>وقت التأخر</th>
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '20%' }}>الإجراء</th>
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '25%' }}>ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 8 }).map((_, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="border border-gray-300 p-2 h-8"></td>
                            <td className="border border-gray-300 p-2 h-8"></td>
                            <td className="border border-gray-300 p-2 h-8"></td>
                            <td className="border border-gray-300 p-2 h-8"></td>
                            <td className="border border-gray-300 p-2 h-8"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* الجدول 3: الطلاب المخالفون */}
                    <div className="bg-[#818cf8] text-white py-2 px-3 mt-3 mb-2 rounded font-bold text-sm">الطلاب المخالفون</div>
                    <table className="w-full border-collapse mb-4 text-xs">
                      <thead>
                        <tr className="bg-[#4f46e5] text-white">
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '25%' }}>الاسم</th>
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '15%' }}>الصف</th>
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '25%' }}>المخالفة</th>
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '15%' }}>الإجراء</th>
                          <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '20%' }}>ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 8 }).map((_, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="border border-gray-300 p-2 h-8"></td>
                            <td className="border border-gray-300 p-2 h-8"></td>
                            <td className="border border-gray-300 p-2 h-8"></td>
                            <td className="border border-gray-300 p-2 h-8"></td>
                            <td className="border border-gray-300 p-2 h-8"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* التذييل */}
                    <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-center font-bold text-yellow-900 text-sm">
                      📝 يُسلّم التقرير في اليوم التالي للمناوبة لوكيل الشؤون التعليمية
                    </div>
                  </>
                ) : (
                  <>
                    <div className="header text-center mb-4 pb-4 border-b-2 border-[#4f46e5]">
                      <h1 className="text-2xl font-bold text-[#4f46e5] mb-2">تقرير المناوبة اليومية - {reportType === 'weekly' ? 'أسبوعي' : 'شهري'}</h1>
                      <p className="text-sm text-gray-600">من يوم {new Date(startDate).toLocaleDateString('ar-SA')} الموافق {startDate}</p>
                      <p className="text-sm text-gray-600">إلى يوم {new Date(endDate).toLocaleDateString('ar-SA')} الموافق {endDate}</p>
                    </div>

                    {/* جدول التقرير الأسبوعي */}
                    {reportType === 'weekly' && weeklyData.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white">
                              <th className="border border-gray-300 px-2 py-2 text-xs">اليوم</th>
                              <th className="border border-gray-300 px-2 py-2 text-xs">التاريخ</th>
                              <th className="border border-gray-300 px-2 py-2 text-xs">المناوب</th>
                              <th colSpan={4} className="border border-gray-300 px-2 py-2 text-xs text-center">تفعيل المناوبة</th>
                              <th colSpan={2} className="border border-gray-300 px-2 py-2 text-xs text-center">تسليم التقرير</th>
                              <th className="border border-gray-300 px-2 py-2 text-xs">ملاحظات</th>
                            </tr>
                            <tr className="bg-[#6366f1] text-white">
                              <th colSpan={3} className="border border-gray-300"></th>
                              <th className="border border-gray-300 px-2 py-1 text-xs">حاضر</th>
                              <th className="border border-gray-300 px-2 py-1 text-xs">غائب</th>
                              <th className="border border-gray-300 px-2 py-1 text-xs">مستأذن</th>
                              <th className="border border-gray-300 px-2 py-1 text-xs">منسحب</th>
                              <th className="border border-gray-300 px-2 py-1 text-xs">تم</th>
                              <th className="border border-gray-300 px-2 py-1 text-xs">لم يتم</th>
                              <th className="border border-gray-300"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {weeklyData.map((row, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 px-2 py-2 text-xs font-semibold text-center">{row.day}</td>
                                <td className="border border-gray-300 px-2 py-2 text-xs text-center">{row.date}</td>
                                <td className="border border-gray-300 px-2 py-2 text-xs font-semibold text-center">{row.dutyGuardName}</td>
                                <td className="border border-gray-300 px-2 py-2 text-center">{row.present ? <span className="text-green-600 font-bold text-base">✓</span> : ''}</td>
                                <td className="border border-gray-300 px-2 py-2 text-center">{row.absent ? <span className="text-green-600 font-bold text-base">✓</span> : ''}</td>
                                <td className="border border-gray-300 px-2 py-2 text-center">{row.excused ? <span className="text-green-600 font-bold text-base">✓</span> : ''}</td>
                                <td className="border border-gray-300 px-2 py-2 text-center">
                                  {row.withdrawn ? (
                                    <div className="flex flex-col items-center">
                                      <span className="text-green-600 font-bold text-base">✓</span>
                                      {row.actionTime && <span className="text-xs text-gray-600 mt-1">{row.actionTime}</span>}
                                    </div>
                                  ) : ''}
                                </td>
                                <td className="border border-gray-300 px-2 py-2 text-center">{row.reportSubmitted === true ? <span className="text-blue-600 font-bold text-base">✓</span> : ''}</td>
                                <td className="border border-gray-300 px-2 py-2 text-center">{row.reportSubmitted === false ? <span className="text-red-600 font-bold text-base">✓</span> : ''}</td>
                                <td className="border border-gray-300 px-2 py-2 text-xs text-center">{row.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* جدول التقرير الشهري */}
                    {reportType === 'monthly' && monthlyData.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white">
                              <th className="border border-gray-300 px-2 py-2 text-xs">الأسبوع</th>
                              <th className="border border-gray-300 px-2 py-2 text-xs">المناوب</th>
                              <th colSpan={4} className="border border-gray-300 px-2 py-2 text-xs text-center">تفعيل المناوبة</th>
                              <th colSpan={2} className="border border-gray-300 px-2 py-2 text-xs text-center">تسليم التقرير</th>
                              <th className="border border-gray-300 px-2 py-2 text-xs">ملاحظات</th>
                            </tr>
                            <tr className="bg-[#6366f1] text-white">
                              <th colSpan={2} className="border border-gray-300"></th>
                              <th className="border border-gray-300 px-2 py-1 text-xs">حاضر</th>
                              <th className="border border-gray-300 px-2 py-1 text-xs">غائب</th>
                              <th className="border border-gray-300 px-2 py-1 text-xs">مستأذن</th>
                              <th className="border border-gray-300 px-2 py-1 text-xs">منسحب</th>
                              <th className="border border-gray-300 px-2 py-1 text-xs">تم</th>
                              <th className="border border-gray-300 px-2 py-1 text-xs">لم يتم</th>
                              <th className="border border-gray-300"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthlyData.map((row, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 px-2 py-2 text-xs font-semibold text-center">{row.week}</td>
                                <td className="border border-gray-300 px-2 py-2 text-xs font-semibold text-center">{row.dutyGuardName}</td>
                                <td className="border border-gray-300 px-2 py-2 text-xs text-center">{row.present > 0 ? <span className="text-green-600 font-bold">✓ ({row.present})</span> : '-'}</td>
                                <td className="border border-gray-300 px-2 py-2 text-xs text-center">{row.absent > 0 ? <span className="text-green-600 font-bold">✓ ({row.absent})</span> : '-'}</td>
                                <td className="border border-gray-300 px-2 py-2 text-xs text-center">{row.excused > 0 ? <span className="text-green-600 font-bold">✓ ({row.excused})</span> : '-'}</td>
                                <td className="border border-gray-300 px-2 py-2 text-xs text-center">
                                  {row.withdrawn > 0 ? (
                                    <div className="flex flex-col items-center">
                                      <span className="text-green-600 font-bold">✓ ({row.withdrawn})</span>
                                      {row.actionTimes.length > 0 && (
                                        <span className="text-xs text-gray-600 mt-1">{row.actionTimes.join(', ')}</span>
                                      )}
                                    </div>
                                  ) : '-'}
                                </td>
                                <td className="border border-gray-300 px-2 py-2 text-xs text-center">{row.reportsSubmitted > 0 ? <span className="text-blue-600 font-bold">✓ ({row.reportsSubmitted})</span> : '-'}</td>
                                <td className="border border-gray-300 px-2 py-2 text-xs text-center">{row.reportsNotSubmitted > 0 ? <span className="text-red-600 font-bold">✓ ({row.reportsNotSubmitted})</span> : '-'}</td>
                                <td className="border border-gray-300 px-2 py-2 text-xs text-center">{row.notes.join(', ')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* أزرار التصدير والإجراءات */}
              <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t-2 border-gray-200">
                <button
                  onClick={exportToPDF}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  تصدير PDF
                </button>
                <button
                  onClick={printReport}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  طباعة
                </button>
                <button
                  onClick={resetReport}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  إنشاء تقرير جديد
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DutyReportsDialog;
