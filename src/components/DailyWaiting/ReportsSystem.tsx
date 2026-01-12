import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart3, Download, Calendar, User, Users, FileText, 
  TrendingUp, Clock, CheckCircle, Send, Eye, Filter, Bell, ArrowRight 
} from 'lucide-react';
import { 
  WaitingAssignment, WeeklyWaitingReport, MonthlyWaitingReport, 
  ReportType, ReportFormat 
} from '@/types/dailyWait';
// import SchoolContext from '@/contexts/SchoolContext';

interface ReportsSystemProps {
  assignments: WaitingAssignment[];
}

const ReportsSystem: React.FC<ReportsSystemProps> = ({ assignments }) => {
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(1447);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [weeksCount, setWeeksCount] = useState<number>(18);
  const [schoolYear, setSchoolYear] = useState<string>('1447هـ');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentReport, setCurrentReport] = useState<any>(null);
  
  // حالات خاصة بالتقرير الفردي
  const [individualReportType, setIndividualReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [individualSelectedWeek, setIndividualSelectedWeek] = useState<number>(1);
  const [individualSelectedMonth, setIndividualSelectedMonth] = useState<number>(1);
  const [showSendDialog, setShowSendDialog] = useState<boolean>(false);
  const [sendingReport, setSendingReport] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // استخدام بيانات المدرسة الثابتة حاليًا - يمكن ربطها بالسياق لاحقًا
  const schoolInfo = {
    name: 'مدرسة موتابيع النموذجية',
    principal: 'أ. محمد الأحمد',
    vicePrincipal: 'أ. سارة العتيبي',
    academicYear: '1447هـ'
  };

  // بيانات وهمية للمعلمين
  const mockTeachers = [
    { id: 'sub_1', name: 'سارة أحمد المالكي' },
    { id: 'sub_2', name: 'عبدالرحمن سليم الشهراني' },
    { id: 'sub_3', name: 'هند محمد العتيبي' },
    { id: 'sub_4', name: 'فايز عبدالله القحطاني' },
    { id: 'sub_5', name: 'نوال سعد الغامدي' },
    { id: 'sub_6', name: 'محمد خالد النمر' }
  ];

  // إنشاء التقرير الأسبوعي
  const generateWeeklyReport = (weekNumber?: number): WeeklyWaitingReport => {
    const week = weekNumber || (selectedWeeks[0] || 1);
    const startDate = getWeekStartDate(week, selectedYear);
    const endDate = getWeekEndDate(week, selectedYear);
    
    // بيانات وهمية للتقرير الأسبوعي
    const teachersData = {
      'sub_1': {
        teacherName: 'سارة أحمد المالكي',
        sunday: [2, 5],
        monday: [1, 4],
        tuesday: [3],
        wednesday: [6],
        thursday: [2, 7],
        totalPeriods: 7
      },
      'sub_2': {
        teacherName: 'عبدالرحمن سليم الشهراني',
        sunday: [1],
        monday: [2, 6],
        tuesday: [4, 5],
        wednesday: [1, 3],
        thursday: [4],
        totalPeriods: 8
      },
      'sub_3': {
        teacherName: 'هند محمد العتيبي',
        sunday: [3, 7],
        monday: [5],
        tuesday: [1, 2],
        wednesday: [4, 7],
        thursday: [1, 6],
        totalPeriods: 9
      },
      'sub_4': {
        teacherName: 'فايز عبدالله القحطاني',
        sunday: [4, 6],
        monday: [3, 7],
        tuesday: [6],
        wednesday: [2, 5],
        thursday: [3],
        totalPeriods: 8
      }
    };

    return {
      weekNumber: week,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      startHijriDate: convertToHijri(startDate.toISOString().split('T')[0]),
      endHijriDate: convertToHijri(endDate.toISOString().split('T')[0]),
      teachersData
    };
  };

  // إنشاء التقرير الشهري
  const generateMonthlyReport = (monthNumber?: number): MonthlyWaitingReport => {
    const month = monthNumber || (selectedMonths[0] || 1);
    const hijriMonth = getHijriMonth(month);
    const hijriYear = selectedYear - 579;

    const teachersMonthlyData = {
      'sub_1': {
        teacherName: 'سارة أحمد المالكي',
        totalPeriods: 28,
        weeklyBreakdown: [7, 6, 8, 7]
      },
      'sub_2': {
        teacherName: 'عبدالرحمن سليم الشهراني',
        totalPeriods: 31,
        weeklyBreakdown: [8, 7, 9, 7]
      },
      'sub_3': {
        teacherName: 'هند محمد العتيبي',
        totalPeriods: 35,
        weeklyBreakdown: [9, 8, 10, 8]
      },
      'sub_4': {
        teacherName: 'فايز عبدالله القحطاني',
        totalPeriods: 30,
        weeklyBreakdown: [8, 7, 8, 7]
      }
    };

    return {
      month: month,
      year: selectedYear,
      hijriMonth,
      hijriYear,
      weeklyReports: {
        week1: 32,
        week2: 28,
        week3: 35,
        week4: 29
      },
      teachersMonthlyData
    };
  };

  // إنشاء التقارير الفردية المتعددة
  const generateIndividualReports = () => {
    const reports = selectedTeacherIds.map(teacherId => {
      const teacher = mockTeachers.find(t => t.id === teacherId);
      if (!teacher) return null;

      // بيانات وهمية للمعلم مع نصاب الحصص ونصاب الانتظار
      const teacherData = {
        id: teacherId,
        name: teacher.name,
        totalLessonsQuota: 24, // نصاب الحصص
        waitingQuota: 8, // نصاب الانتظار
        weeklyData: {
          sunday: [2, 5],
          monday: [1, 4],
          tuesday: [3],
          wednesday: [6],
          thursday: [2, 7],
        },
        monthlyData: {
          week1: [2, 1, 3, 6, 2], // الأحد إلى الخميس
          week2: [5, 4, 0, 0, 7],
          week3: [0, 2, 1, 5, 1],
          week4: [3, 3, 2, 1, 3]
        }
      };

      return {
        type: 'individual',
        teacher: teacherData,
        schoolYear,
        reportSubType: individualReportType,
        selectedWeek: individualReportType === 'weekly' ? individualSelectedWeek : null,
        selectedMonth: individualReportType === 'monthly' ? individualSelectedMonth : null,
        selectedMonthName: individualReportType === 'monthly' ? getHijriMonth(individualSelectedMonth) : null
      };
    }).filter(Boolean);

    return {
      type: 'individual_multi',
      reports,
      reportSubType: individualReportType,
      schoolYear,
      selectedWeek: individualReportType === 'weekly' ? individualSelectedWeek : null,
      selectedMonth: individualReportType === 'monthly' ? individualSelectedMonth : null,
      selectedMonthName: individualReportType === 'monthly' ? getHijriMonth(individualSelectedMonth) : null
    };
  };

  // إنشاء التقرير الأسبوعي المتعدد
  const generateMultiWeeklyReport = () => {
    const weeklyReports = selectedWeeks.map(weekNumber => {
      const weeklyReport = generateWeeklyReport(weekNumber);
      return {
        ...weeklyReport,
        weekNumber
      };
    });

    return {
      type: 'multi_weekly',
      weeklyReports,
      schoolYear,
      totalWeeks: selectedWeeks.length
    };
  };

  // إنشاء التقرير الشهري المتعدد  
  const generateMultiMonthlyReport = () => {
    const monthlyReports = selectedMonths.map(month => {
      const monthlyReport = generateMonthlyReport(month);
      return {
        ...monthlyReport,
        month
      };
    });

    return {
      type: 'multi_monthly',
      monthlyReports,
      schoolYear,
      totalMonths: selectedMonths.length
    };
  };

  // التحقق من صحة إعدادات التقرير
  const isReportConfigValid = (): boolean => {
    if (reportType === 'weekly' && selectedWeeks.length === 0) return false;
    if (reportType === 'monthly' && selectedMonths.length === 0) return false;
    if (reportType === 'individual') {
      if (selectedTeacherIds.length === 0) return false;
      // التحقق من اختيار الأسبوع أو الشهر للتقرير الفردي
      if (individualReportType === 'weekly' && !individualSelectedWeek) return false;
      if (individualReportType === 'monthly' && !individualSelectedMonth) return false;
    }
    return true;
  };

  // معالج إنشاء التقرير
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let report;
      
      if (reportType === 'individual') {
        report = generateIndividualReports();
      } else if (reportType === 'weekly') {
        report = generateMultiWeeklyReport();
      } else if (reportType === 'monthly') {
        report = generateMultiMonthlyReport();
      }
      
      setCurrentReport(report);
      
    } catch (error) {
      console.error('خطأ في إنشاء التقرير:', error);
      alert('حدث خطأ أثناء إنشاء التقرير');
    } finally {
      setIsGenerating(false);
    }
  };



  // إنشاء تقرير PDF محسن
  const generatePDFReport = async (report: any): Promise<string> => {
    try {
      // إعداد البيانات للـ PDF
      const pdfData = {
        title: `تقرير ${reportType === 'weekly' ? 'أسبوعي' : reportType === 'monthly' ? 'شهري' : 'فردي'}`,
        schoolYear: schoolYear,
        reportType: reportType,
        data: report,
        generatedAt: new Date().toLocaleString('ar-SA'),
        schoolInfo: {
          name: schoolInfo.name,
          principalName: schoolInfo.principal,
          vicePrincipalName: schoolInfo.vicePrincipal
        }
      };

      // محاكاة إنشاء PDF
      console.log('إنشاء تقرير PDF:', pdfData);
      
      // إنشاء رابط وهمي للـ PDF
      const fileName = `تقرير_${reportType}_${schoolYear}_${Date.now()}.pdf`;
      const pdfUrl = `https://motabea.edu.sa/reports/${fileName}`;
      
      return pdfUrl;
    } catch (error) {
      console.error('خطأ في إنشاء PDF:', error);
      throw error;
    }
  };

  // تحميل PDF للمستخدم
  const handleDownloadPDF = async () => {
    if (!currentReport) return;
    
    try {
      const pdfUrl = await generatePDFReport(currentReport);
      
      // محاكاة تحميل الملف
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `تقرير_${reportType}_${schoolYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('✅ تم تحميل التقرير بنجاح');
    } catch (error) {
      console.error('خطأ في تحميل PDF:', error);
      alert('❌ حدث خطأ أثناء تحميل التقرير');
    }
  };

  // إرسال التقرير عبر واتساب
  const handleSendReport = async () => {
    if (!currentReport) return;
    
    setSendingReport(true);
    
    try {
      // قائمة الموظفين المستهدفين مع أرقام واتساب
      const targetStaff = [
        { name: schoolInfo.principal, phone: '+966501234567', whatsapp: '966501234567' },
        { name: schoolInfo.vicePrincipal, phone: '+966507654321', whatsapp: '966507654321' },
        { name: 'أ. فهد الشهراني', phone: '+966509876543', whatsapp: '966509876543' }
      ];

      // إنشاء PDF أولاً
      const pdfUrl = await generatePDFReport(currentReport);
      
      // إعداد رسالة الإرسال
      const reportSummary = generateReportSummary(currentReport);
      const reportTypeAr = reportType === 'weekly' ? 'أسبوعي' : reportType === 'monthly' ? 'شهري' : 'فردي';
      
      // محاكاة الإرسال لكل موظف
      for (const staff of targetStaff) {
        const whatsappMessage = `
السلام عليكم ${staff.name}
        
تم إنشاء ${reportSummary} للعام الدراسي ${schoolYear}
        
يمكنكم تحميل التقرير من الرابط التالي:
${pdfUrl}
        
تاريخ الإنشاء: ${new Date().toLocaleString('ar-SA')}
        
مدرسة موتابيع النموذجية
        `.trim();

        // إضافة إشعار لسجل الإشعارات
        const notification = {
          id: Date.now() + Math.random(),
          type: 'report_sent',
          title: `تم إشعار ${staff.name} بتقرير الانتظار`,
          description: `${reportTypeAr} - ${schoolYear}`,
          recipient: staff.name,
          phone: staff.phone,
          sentAt: new Date().toLocaleString('ar-SA'),
          status: 'sent',
          reportType: reportTypeAr
        };
        
        setNotifications(prev => [notification, ...prev]);
        
        // محاكاة تأخير الإرسال
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // إغلاق نافذة الإرسال
      setShowSendDialog(false);
      
      // إظهار رسالة النجاح
      alert(`✅ تم إرسال التقرير بنجاح عبر واتساب إلى ${targetStaff.length} موظف`);
      
    } catch (error) {
      console.error('خطأ في إرسال التقرير:', error);
      alert('❌ حدث خطأ أثناء إرسال التقرير');
    } finally {
      setSendingReport(false);
    }
  };

  // إنشاء ملخص التقرير
  const generateReportSummary = (report: any): string => {
    let summary = '';
    
    if (reportType === 'weekly') {
      summary = `التقرير الأسبوعي لحصص الانتظار - ${selectedWeeks.length} أسبوع`;
    } else if (reportType === 'monthly') {
      summary = `التقرير الشهري لحصص الانتظار - ${selectedMonths.length} شهر`;
    } else if (reportType === 'individual') {
      summary = `التقرير الفردي لحصص الانتظار - ${selectedTeacherIds.length} معلم`;
    }
    
    return summary;
  };

  // دوال مساعدة
  const getWeekStartDate = (weekNumber: number, year: number): Date => {
    const date = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7;
    date.setDate(date.getDate() + daysToAdd);
    return date;
  };

  const getWeekEndDate = (weekNumber: number, year: number): Date => {
    const startDate = getWeekStartDate(weekNumber, year);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return endDate;
  };

  const convertToHijri = (gregorianDate: string): string => {
    const date = new Date(gregorianDate);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() - 579}هـ`;
  };

  const getHijriMonth = (month: number): string => {
    const hijriMonths = [
      'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
      'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];
    return hijriMonths[month - 1] || 'محرم';
  };

  const getDayName = (day: string): string => {
    const days = {
      'sunday': 'الأحد',
      'monday': 'الإثنين', 
      'tuesday': 'الثلاثاء',
      'wednesday': 'الأربعاء',
      'thursday': 'الخميس'
    };
    return days[day as keyof typeof days] || day;
  };

  return (
    <div className="space-y-6">
      {/* إعدادات التقرير - تخفى عندما يكون سجل الإشعارات مفتوح */}
      {!showNotifications && (
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            إعدادات التقرير
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">نوع التقرير</Label>
              <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                <SelectTrigger className="bg-white border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50 max-h-60 overflow-y-auto">
                  <SelectItem value="weekly" className="hover:bg-blue-50 cursor-pointer py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">أسبوعي</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly" className="hover:bg-purple-50 cursor-pointer py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">شهري</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="individual" className="hover:bg-green-50 cursor-pointer py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="font-medium">فردي</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">عدد الأسابيع الدراسية</Label>
              <Input
                type="number"
                placeholder="أدخل عدد الأسابيع"
                min={1}
                max={52}
                value={weeksCount}
                className="bg-white border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-11"
                onChange={(e) => {
                  const count = parseInt(e.target.value);
                  if (count > 0 && count <= 52) {
                    setWeeksCount(count);
                    // إعادة تعيين الأسابيع المختارة إذا تجاوزت العدد الجديد
                    setSelectedWeeks(prev => prev.filter(week => week <= count));
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">العام الدراسي</Label>
              <Input
                type="text"
                placeholder="مثال: 1447هـ"
                value={schoolYear}
                className="bg-white border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-11 text-right"
                onChange={(e) => {
                  setSchoolYear(e.target.value);
                  // تحديث العام الدراسي إذا كان رقمًا
                  const yearPattern = /(\d{4})/;
                  const match = e.target.value.match(yearPattern);
                  if (match) {
                    setSelectedYear(parseInt(match[1]));
                  }
                }}
              />
            </div>
          </div>

          {reportType === 'weekly' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">اختيار الأسابيع</Label>
                <Select
                  value={selectedWeeks.length > 0 ? selectedWeeks[0].toString() : ""}
                  onValueChange={(value) => {
                    const weekNum = parseInt(value);
                    if (!selectedWeeks.includes(weekNum)) {
                      setSelectedWeeks([...selectedWeeks, weekNum]);
                    }
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-11">
                    <SelectValue placeholder="اختر أسبوع لإضافته" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50 max-h-60 overflow-y-auto">
                    {Array.from({length: weeksCount}, (_, i) => i + 1)
                      .filter(week => !selectedWeeks.includes(week))
                      .map(week => (
                        <SelectItem key={week} value={week.toString()} className="hover:bg-blue-50 cursor-pointer py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">الأسبوع {week}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {selectedWeeks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-sm text-gray-600 font-medium">الأسابيع المختارة:</span>
                    {selectedWeeks.map(week => (
                      <Badge 
                        key={week} 
                        variant="secondary" 
                        className="text-xs bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                        onClick={() => setSelectedWeeks(selectedWeeks.filter(w => w !== week))}
                      >
                        الأسبوع {week} ✕
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {reportType === 'monthly' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">اختيار الشهور</Label>
                <Select
                  value={selectedMonths.length > 0 ? selectedMonths[0].toString() : ""}
                  onValueChange={(value) => {
                    const monthNum = parseInt(value);
                    if (!selectedMonths.includes(monthNum)) {
                      setSelectedMonths([...selectedMonths, monthNum]);
                    }
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-300 shadow-sm hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 h-11">
                    <SelectValue placeholder="اختر شهر لإضافته" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50 max-h-60 overflow-y-auto">
                    {Array.from({length: 12}, (_, i) => i + 1)
                      .filter(month => !selectedMonths.includes(month))
                      .map(month => (
                        <SelectItem key={month} value={month.toString()} className="hover:bg-purple-50 cursor-pointer py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span className="font-medium">{getHijriMonth(month)}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {selectedMonths.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-sm text-gray-600 font-medium">الشهور المختارة:</span>
                    {selectedMonths.map(month => (
                      <Badge 
                        key={month} 
                        variant="secondary" 
                        className="text-xs bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200"
                        onClick={() => setSelectedMonths(selectedMonths.filter(m => m !== month))}
                      >
                        {getHijriMonth(month)} ✕
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {reportType === 'individual' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">اختيار المعلمين</Label>
                <Select
                  value={selectedTeacherIds.length > 0 ? selectedTeacherIds[0] : ""}
                  onValueChange={(value) => {
                    if (!selectedTeacherIds.includes(value)) {
                      setSelectedTeacherIds([...selectedTeacherIds, value]);
                    }
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-300 shadow-sm hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 h-11">
                    <SelectValue placeholder="اختر معلم لإضافته" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50 max-h-60 overflow-y-auto">
                    {mockTeachers
                      .filter(teacher => !selectedTeacherIds.includes(teacher.id))
                      .map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id} className="hover:bg-green-50 cursor-pointer py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-green-600" />
                            <span className="font-medium">{teacher.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {selectedTeacherIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-sm text-gray-600 font-medium">المعلمون المختارون:</span>
                    {selectedTeacherIds.map(id => {
                      const teacher = mockTeachers.find(t => t.id === id);
                      return teacher ? (
                        <Badge 
                          key={id} 
                          variant="secondary" 
                          className="text-xs bg-green-100 text-green-800 cursor-pointer hover:bg-green-200"
                          onClick={() => setSelectedTeacherIds(selectedTeacherIds.filter(teacherId => teacherId !== id))}
                        >
                          {teacher.name} ✕
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* خيارات التقرير الفردي */}
              {selectedTeacherIds.length > 0 && (
                <div className="space-y-4 mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-lg font-semibold text-green-800 mb-4">⚙️ إعدادات التقرير الفردي</h4>
                  
                  {/* نوع التقرير */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold">نوع التقرير الفردي</Label>
                    <Select
                      value={individualReportType}
                      onValueChange={(value) => setIndividualReportType(value as 'weekly' | 'monthly')}
                    >
                      <SelectTrigger className="bg-white border-green-300 shadow-sm hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                        <SelectItem value="weekly" className="hover:bg-green-50 cursor-pointer py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="font-medium">تقرير أسبوعي</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="monthly" className="hover:bg-green-50 cursor-pointer py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="font-medium">تقرير شهري</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* اختيار الأسبوع للتقرير الأسبوعي */}
                  {individualReportType === 'weekly' && (
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">اختيار الأسبوع</Label>
                      <Select
                        value={individualSelectedWeek.toString()}
                        onValueChange={(value) => setIndividualSelectedWeek(parseInt(value))}
                      >
                        <SelectTrigger className="bg-white border-green-300 shadow-sm hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50 max-h-60 overflow-y-auto">
                          {Array.from({length: weeksCount}, (_, i) => i + 1).map(week => (
                            <SelectItem key={week} value={week.toString()} className="hover:bg-green-50 cursor-pointer py-2">
                              <span className="font-medium">الأسبوع {week}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* اختيار الشهر للتقرير الشهري */}
                  {individualReportType === 'monthly' && (
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">اختيار الشهر</Label>
                      <Select
                        value={individualSelectedMonth.toString()}
                        onValueChange={(value) => setIndividualSelectedMonth(parseInt(value))}
                      >
                        <SelectTrigger className="bg-white border-green-300 shadow-sm hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-50 max-h-60 overflow-y-auto">
                          {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                            <SelectItem key={month} value={month.toString()} className="hover:bg-green-50 cursor-pointer py-2">
                              <span className="font-medium">{getHijriMonth(month)}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || !isReportConfigValid()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex-1 min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 ml-2" />
                  عرض التقرير
                </>
              )}
            </Button>

            {currentReport && (
              <>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل PDF
                </Button>

                <Button
                  onClick={() => setShowSendDialog(true)}
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Send className="w-4 h-4 ml-2" />
                  إرسال عبر واتساب
                </Button>

                {notifications.length > 0 && (
                  <Button
                    onClick={() => setShowNotifications(true)}
                    variant="outline"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Bell className="w-4 h-4 ml-2" />
                    سجل الإشعارات ({notifications.length})
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      )}

      {/* عرض التقرير - يخفى عندما يكون سجل الإشعارات مفتوح */}
      {!showNotifications && currentReport && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-right">
                {reportType === 'weekly' && `التقرير الأسبوعي (${selectedWeeks.length} أسبوع مختار)`}
                {reportType === 'monthly' && `التقرير الشهري (${selectedMonths.length} شهر مختار)`}
                {reportType === 'individual' && `التقرير الفردي (${selectedTeacherIds.length} معلم مختار)`}
              </CardTitle>
              
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3 ml-1" />
                تم الإنشاء
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {currentReport.type === 'multi_weekly' && (
              <MultiWeeklyReportView report={currentReport} />
            )}
            
            {currentReport.type === 'multi_monthly' && (
              <MultiMonthlyReportView report={currentReport} />
            )}
            
            {currentReport.type === 'individual_multi' && (
              <IndividualMultiReportView report={currentReport} />
            )}
          </CardContent>
        </Card>
      )}

      {!showNotifications && !currentReport && (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد تقارير</h3>
            <p className="text-gray-500 mb-4">اختر إعدادات التقرير واضغط على "إنشاء التقرير"</p>
          </CardContent>
        </Card>
      )}

      {/* نافذة تأكيد الإرسال */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800">
              📱 إرسال التقرير عبر واتساب
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* معلومات التقرير */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">📊 معلومات التقرير</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">نوع التقرير:</span>
                  <span className="font-medium mr-2">
                    {reportType === 'weekly' ? 'أسبوعي' : reportType === 'monthly' ? 'شهري' : 'فردي'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">العام الدراسي:</span>
                  <span className="font-medium mr-2">{schoolYear}</span>
                </div>
                <div>
                  <span className="text-gray-600">تاريخ الإنشاء:</span>
                  <span className="font-medium mr-2">{new Date().toLocaleDateString('ar-SA')}</span>
                </div>
                <div>
                  <span className="text-gray-600">صيغة الملف:</span>
                  <span className="font-medium mr-2">PDF</span>
                </div>
              </div>
            </div>

            {/* المستلمون */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">👥 قائمة المستلمين</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{schoolInfo.principal}</span>
                  <span className="text-sm text-gray-500">+966501234567</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{schoolInfo.vicePrincipal}</span>
                  <span className="text-sm text-gray-500">+966507654321</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="font-medium">أ. فهد الشهراني</span>
                  <span className="text-sm text-gray-500">+966509876543</span>
                </div>
              </div>
            </div>

            {/* محتوى الرسالة */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">💬 نص الرسالة</h4>
              <div className="bg-white p-3 rounded border text-sm text-gray-600 font-mono">
                السلام عليكم<br/>
                تم إنشاء {generateReportSummary(currentReport)} للعام الدراسي {schoolYear}<br/>
                يمكنكم تحميل التقرير من الرابط المرفق<br/>
                مدرسة موتابيع النموذجية
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSendReport}
                disabled={sendingReport}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                {sendingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    إرسال الآن
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowSendDialog(false)}
                disabled={sendingReport}
                className="border-gray-300"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* صفحة سجل الإشعارات */}
      {showNotifications && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-purple-800">سجل الإشعارات ({notifications.length})</CardTitle>
              </div>
              
              {/* زر العودة في الجانب الأيسر */}
              <Button
                onClick={() => setShowNotifications(false)}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                عودة
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد إشعارات</h3>
                  <p className="text-gray-500">لم يتم إرسال أي تقارير بعد</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div key={notification.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 text-green-600 rounded-full w-10 h-10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{notification.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{notification.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          📱 إلى: {notification.recipient} ({notification.phone})
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-500 mb-2">{notification.sentAt}</div>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 font-medium">
                        {notification.reportType}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>تم الإرسال بنجاح</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span>إجمالي الإشعارات: {notifications.length}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// مكون عرض التقرير الأسبوعي
interface WeeklyReportViewProps {
  report: WeeklyWaitingReport;
}

const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ report }) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-bold text-blue-800 mb-2">
          التقرير الأسبوعي لحصص الانتظار (الأسبوع {report.weekNumber})
        </h3>
        <p className="text-blue-600">
          من الأحد {report.startDate} ({report.startHijriDate}) إلى الخميس {report.endDate} ({report.endHijriDate})
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
            <tr>
              <th className="border border-gray-300 p-3 text-right font-bold">أسماء المعلمين</th>
              {dayNames.map(day => (
                <th key={day} className="border border-gray-300 p-3 text-center font-bold">{day}</th>
              ))}
              <th className="border border-gray-300 p-3 text-center font-bold">إجمالي الحصص</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(report.teachersData).map((teacher, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3 font-medium">{teacher.teacherName}</td>
                {days.map(day => (
                  <td key={day} className="border border-gray-300 p-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {Array.isArray(teacher[day as keyof typeof teacher]) && 
                       (teacher[day as keyof typeof teacher] as number[]).map((period: number, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {period}
                        </Badge>
                      ))}
                    </div>
                  </td>
                ))}
                <td className="border border-gray-300 p-3 text-center">
                  <Badge className="bg-blue-100 text-blue-800 font-bold">
                    {teacher.totalPeriods}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// مكون عرض التقرير الشهري
interface MonthlyReportViewProps {
  report: MonthlyWaitingReport;
}

const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({ report }) => {
  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-bold text-purple-800 mb-2">
          التقرير الشهري لحصص الانتظار
        </h3>
        <p className="text-purple-600">
          شهر {report.hijriMonth} {report.hijriYear}هـ ({report.month}/{report.year}م)
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
            <tr>
              <th className="border border-gray-300 p-3 text-right font-bold">أسماء المعلمين</th>
              <th className="border border-gray-300 p-3 text-center font-bold">الأسبوع الأول</th>
              <th className="border border-gray-300 p-3 text-center font-bold">الأسبوع الثاني</th>
              <th className="border border-gray-300 p-3 text-center font-bold">الأسبوع الثالث</th>
              <th className="border border-gray-300 p-3 text-center font-bold">الأسبوع الرابع</th>
              <th className="border border-gray-300 p-3 text-center font-bold">إجمالي الحصص</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(report.teachersMonthlyData).map((teacher, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3 font-medium">{teacher.teacherName}</td>
                {teacher.weeklyBreakdown.map((weekTotal, i) => (
                  <td key={i} className="border border-gray-300 p-3 text-center">
                    <Badge variant="outline" className="text-sm">
                      {weekTotal}
                    </Badge>
                  </td>
                ))}
                <td className="border border-gray-300 p-3 text-center">
                  <Badge className="bg-purple-100 text-purple-800 font-bold">
                    {teacher.totalPeriods}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// مكون عرض التقرير الفردي
interface IndividualReportViewProps {
  report: any;
}

const IndividualReportView: React.FC<IndividualReportViewProps> = ({ report }) => {
  if (report.type === 'individual_weekly') {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

    return (
      <div className="space-y-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-bold text-green-800 mb-2">
            التقرير الأسبوعي الفردي - {report.teacher.name}
          </h3>
          <p className="text-green-600">
            الأسبوع {report.weekInfo.weekNumber} من {report.weekInfo.startDate} إلى {report.weekInfo.endDate}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {days.map((day, index) => (
            <Card key={day} className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-sm">{dayNames[index]}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex flex-wrap gap-1 justify-center mb-2">
                  {report.data[day]?.map((period: number, i: number) => (
                    <Badge key={i} className="bg-blue-600 text-white text-xs">
                      {period}
                    </Badge>
                  )) || <span className="text-gray-500 text-sm">لا توجد حصص</span>}
                </div>
                <Badge variant="outline" className="text-xs">
                  {report.data[day]?.length || 0} حصص
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-800">{report.data.totalPeriods}</p>
                <p className="text-green-600">إجمالي حصص الانتظار هذا الأسبوع</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // التقرير الشهري الفردي
  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-orange-50 rounded-lg">
        <h3 className="text-lg font-bold text-orange-800 mb-2">
          التقرير الشهري الفردي - {report.teacher.name}
        </h3>
        <p className="text-orange-600">
          شهر {report.monthInfo.hijriMonth} {report.monthInfo.hijriYear}هـ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {report.data.weeklyBreakdown.map((weekTotal: number, index: number) => (
          <Card key={index} className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-800">{weekTotal}</p>
              <p className="text-orange-600 text-sm">الأسبوع {index + 1}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-orange-50 to-red-50">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-3xl font-bold text-orange-800">{report.data.totalPeriods}</p>
              <p className="text-orange-600">إجمالي حصص الانتظار هذا الشهر</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// مكون عرض التقرير الأسبوعي المتعدد
interface MultiWeeklyReportViewProps {
  report: any;
}

const MultiWeeklyReportView: React.FC<MultiWeeklyReportViewProps> = ({ report }) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-bold text-blue-800 mb-2">
          التقرير الأسبوعي الشامل لحصص الانتظار
        </h3>
        <p className="text-blue-600">
          العام الدراسي {report.schoolYear} - عدد الأسابيع: {report.totalWeeks}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
            <tr>
              <th className="border border-gray-300 p-3 text-right font-bold">الرقم التسلسلي</th>
              <th className="border border-gray-300 p-3 text-right font-bold">اسم الموظف</th>
              <th className="border border-gray-300 p-3 text-center font-bold">نصاب الانتظار</th>
              {dayNames.map(day => (
                <th key={day} className="border border-gray-300 p-3 text-center font-bold">{day}</th>
              ))}
              <th className="border border-gray-300 p-3 text-center font-bold">إجمالي الحصص</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(report.weeklyReports[0]?.teachersData || {}).map((teacher: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3 text-center font-medium">{index + 1}</td>
                <td className="border border-gray-300 p-3 font-medium">{teacher.teacherName}</td>
                <td className="border border-gray-300 p-3 text-center">
                  <Badge className="bg-orange-100 text-orange-800">8</Badge>
                </td>
                {days.map(day => (
                  <td key={day} className="border border-gray-300 p-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {Array.isArray(teacher[day as keyof typeof teacher]) && 
                       (teacher[day as keyof typeof teacher] as number[]).map((period: number, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {period}
                        </Badge>
                      ))}
                    </div>
                  </td>
                ))}
                <td className="border border-gray-300 p-3 text-center">
                  <Badge className="bg-blue-100 text-blue-800 font-bold">
                    {teacher.totalPeriods}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// مكون عرض التقرير الشهري المتعدد
interface MultiMonthlyReportViewProps {
  report: any;
}

const MultiMonthlyReportView: React.FC<MultiMonthlyReportViewProps> = ({ report }) => {
  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-bold text-purple-800 mb-2">
          التقرير الشهري الشامل لحصص الانتظار
        </h3>
        <p className="text-purple-600">
          العام الدراسي {report.schoolYear} - عدد الشهور: {report.totalMonths}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
            <tr>
              <th className="border border-gray-300 p-3 text-right font-bold">الرقم التسلسلي</th>
              <th className="border border-gray-300 p-3 text-right font-bold">اسم الموظف</th>
              <th className="border border-gray-300 p-3 text-center font-bold">نصاب الانتظار</th>
              <th className="border border-gray-300 p-3 text-center font-bold">الأسبوع الأول</th>
              <th className="border border-gray-300 p-3 text-center font-bold">الأسبوع الثاني</th>
              <th className="border border-gray-300 p-3 text-center font-bold">الأسبوع الثالث</th>
              <th className="border border-gray-300 p-3 text-center font-bold">الأسبوع الرابع</th>
              <th className="border border-gray-300 p-3 text-center font-bold">إجمالي الحصص</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(report.monthlyReports[0]?.teachersMonthlyData || {}).map((teacher: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3 text-center font-medium">{index + 1}</td>
                <td className="border border-gray-300 p-3 font-medium">{teacher.teacherName}</td>
                <td className="border border-gray-300 p-3 text-center">
                  <Badge className="bg-orange-100 text-orange-800">8</Badge>
                </td>
                {teacher.weeklyBreakdown.map((weekTotal: number, i: number) => (
                  <td key={i} className="border border-gray-300 p-3 text-center">
                    <Badge variant="outline" className="text-sm">
                      {weekTotal}
                    </Badge>
                  </td>
                ))}
                <td className="border border-gray-300 p-3 text-center">
                  <Badge className="bg-purple-100 text-purple-800 font-bold">
                    {teacher.totalPeriods}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// مكون عرض التقارير الفردية المتعددة
interface IndividualMultiReportViewProps {
  report: any;
}

const IndividualMultiReportView: React.FC<IndividualMultiReportViewProps> = ({ report }) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

  return (
    <div className="space-y-8">
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-bold text-green-800 mb-2">
          التقارير الفردية لحصص الانتظار
        </h3>
        <div className="text-green-600">
          <p>العام الدراسي {report.schoolYear} - عدد المعلمين: {report.reports.length}</p>
          <p className="mt-2">
            نوع التقرير: {report.reportSubType === 'weekly' ? 'أسبوعي' : 'شهري'}
            {report.reportSubType === 'weekly' && report.selectedWeek && ` - الأسبوع ${report.selectedWeek}`}
            {report.reportSubType === 'monthly' && report.selectedMonthName && ` - شهر ${report.selectedMonthName}`}
          </p>
        </div>
      </div>

      {report.reports.map((teacherReport: any, index: number) => (
        <Card key={index} className="border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-right text-green-800">
              المعلم: {teacherReport.teacher.name}
            </CardTitle>
            <div className="flex gap-4 text-sm text-green-600">
              <span>نصاب الحصص: {teacherReport.teacher.totalLessonsQuota}</span>
              <span>نصاب الانتظار: {teacherReport.teacher.waitingQuota}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            
            {/* عرض التقرير الأسبوعي فقط إذا كان النوع أسبوعي */}
            {report.reportSubType === 'weekly' && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-2">
                  📊 التقرير الأسبوعي - الأسبوع {report.selectedWeek}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-blue-50">
                      <tr>
                        {dayNames.map(day => (
                          <th key={day} className="border border-gray-300 p-3 text-center font-bold">{day}</th>
                        ))}
                        <th className="border border-gray-300 p-3 text-center font-bold">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50">
                        {days.map(day => (
                          <td key={day} className="border border-gray-300 p-3 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {teacherReport.teacher.weeklyData[day]?.map((period: number, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                  {period}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        ))}
                        <td className="border border-gray-300 p-3 text-center">
                          <Badge className="bg-blue-600 text-white font-bold">
                            {Object.values(teacherReport.teacher.weeklyData).flat().length}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* عرض التقرير الشهري فقط إذا كان النوع شهري */}
            {report.reportSubType === 'monthly' && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-purple-800 border-b-2 border-purple-200 pb-2">
                  📅 التقرير الشهري - شهر {report.selectedMonthName}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-purple-50">
                      <tr>
                        <th className="border border-gray-300 p-3 text-center font-bold">اليوم</th>
                        <th className="border border-gray-300 p-3 text-center font-bold">الأسبوع الأول</th>
                        <th className="border border-gray-300 p-3 text-center font-bold">الأسبوع الثاني</th>
                        <th className="border border-gray-300 p-3 text-center font-bold">الأسبوع الثالث</th>
                        <th className="border border-gray-300 p-3 text-center font-bold">الأسبوع الرابع</th>
                        <th className="border border-gray-300 p-3 text-center font-bold">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayNames.map((dayName, dayIndex) => (
                        <tr key={dayName} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3 font-medium text-center">{dayName}</td>
                          {[1, 2, 3, 4].map(weekNum => (
                            <td key={weekNum} className="border border-gray-300 p-3 text-center">
                              <Badge variant="outline" className="text-sm bg-purple-100 text-purple-800">
                                {teacherReport.teacher.monthlyData[`week${weekNum}` as keyof typeof teacherReport.teacher.monthlyData]?.[dayIndex] || 0}
                              </Badge>
                            </td>
                          ))}
                          <td className="border border-gray-300 p-3 text-center">
                            <Badge className="bg-purple-600 text-white font-bold">
                              {[1, 2, 3, 4].reduce((sum, weekNum) => 
                                sum + (teacherReport.teacher.monthlyData[`week${weekNum}` as keyof typeof teacherReport.teacher.monthlyData]?.[dayIndex] || 0), 0
                              )}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      
                      {/* صف الإجمالي الشهري */}
                      <tr className="bg-purple-100 font-bold">
                        <td className="border border-gray-300 p-3 text-center">الإجمالي الشهري</td>
                        {[1, 2, 3, 4].map(weekNum => (
                          <td key={weekNum} className="border border-gray-300 p-3 text-center">
                            <Badge className="bg-purple-200 text-purple-800">
                              {dayNames.reduce((weekSum, _, dayIndex) => 
                                weekSum + (teacherReport.teacher.monthlyData[`week${weekNum}` as keyof typeof teacherReport.teacher.monthlyData]?.[dayIndex] || 0), 0
                              )}
                            </Badge>
                          </td>
                        ))}
                        <td className="border border-gray-300 p-3 text-center">
                          <Badge className="bg-purple-700 text-white font-bold text-lg">
                            {dayNames.reduce((totalSum, _, dayIndex) => 
                              totalSum + [1, 2, 3, 4].reduce((weekSum, weekNum) => 
                                weekSum + (teacherReport.teacher.monthlyData[`week${weekNum}` as keyof typeof teacherReport.teacher.monthlyData]?.[dayIndex] || 0), 0
                              ), 0
                            )}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportsSystem;