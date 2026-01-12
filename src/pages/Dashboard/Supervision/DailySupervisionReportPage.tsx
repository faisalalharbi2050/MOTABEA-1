import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowRight, FileText, Printer, Plus, Trash2, RotateCcw, 
  Calendar as CalendarIcon, Info, ChevronRight, Home, ArrowLeft,
  Users, CheckSquare, XCircle, Clock, Save, Download, X, CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// أنواع البيانات
interface Supervisor {
  id: string;
  name: string;
  signature: string;
}

interface FollowUpSupervisor {
  id: string;
  name: string;
  signature: string;
}

interface DayData {
  day: string;
  supervisors: Supervisor[];
  supervisors2: Supervisor[];
  followUpSupervisors: FollowUpSupervisor[];
  supervisionLocation: string;
}

interface ReportSupervisor {
  id: string;
  name: string;
  attendance: string;
  location: string;
  followUp: string;
}

const DailySupervisionReportPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState('الأحد');
  const [selectedDays, setSelectedDays] = useState<string[]>(['الأحد']); // إضافة اختيار عدة أيام
  const [semester, setSemester] = useState('الأول');
  const [academicYear, setAcademicYear] = useState('1445-1446');
  const [followUpSupervisor, setFollowUpSupervisor] = useState('');
  const [principalName, setPrincipalName] = useState('');
  
  // بيانات الأيام من جدول الإشراف اليومي
  const [daysData, setDaysData] = useState<DayData[]>([
    {
      day: 'الأحد',
      supervisors: [{ id: '1', name: 'أحمد محمد', signature: '' }],
      supervisors2: [{ id: '1', name: 'فاطمة علي', signature: '' }],
      followUpSupervisors: [{ id: '1', name: 'خالد عبدالله', signature: '' }],
      supervisionLocation: 'المقصف - الفناء الخارجي'
    },
    {
      day: 'الاثنين',
      supervisors: [{ id: '1', name: 'سارة أحمد', signature: '' }],
      supervisors2: [{ id: '1', name: 'محمد حسن', signature: '' }],
      followUpSupervisors: [{ id: '1', name: 'علي محمد', signature: '' }],
      supervisionLocation: 'الفناء الداخلي - المصلى'
    },
    {
      day: 'الثلاثاء',
      supervisors: [{ id: '1', name: 'نورا سعد', signature: '' }],
      supervisors2: [{ id: '1', name: 'عبدالله خالد', signature: '' }],
      followUpSupervisors: [{ id: '1', name: 'فاطمة علي', signature: '' }],
      supervisionLocation: 'المقصف - الفناء الخارجي'
    },
    {
      day: 'الأربعاء',
      supervisors: [{ id: '1', name: 'خالد محمد', signature: '' }],
      supervisors2: [{ id: '1', name: 'سارة أحمد', signature: '' }],
      followUpSupervisors: [{ id: '1', name: 'أحمد علي', signature: '' }],
      supervisionLocation: 'الفناء الداخلي - المصلى'
    },
    {
      day: 'الخميس',
      supervisors: [{ id: '1', name: 'علي حسن', signature: '' }],
      supervisors2: [{ id: '1', name: 'نورا سعد', signature: '' }],
      followUpSupervisors: [{ id: '1', name: 'محمد خالد', signature: '' }],
      supervisionLocation: 'المقصف - الفناء الخارجي'
    }
  ]);

  // بيانات التقرير الشهري
  const [reportData, setReportData] = useState<ReportSupervisor[][]>([
    [], [], [], [] // 4 أسابيع
  ]);

  // تحميل البيانات من جدول الإشراف اليومي
  useEffect(() => {
    const selectedDayData = daysData.find(day => day.day === selectedDay);
    if (selectedDayData) {
      const allSupervisors = [
        ...selectedDayData.supervisors,
        ...selectedDayData.supervisors2
      ].filter(s => s.name.trim() !== '');

      // توزيع المشرفين على الأسابيع الأربعة
      const newReportData = [
        allSupervisors.slice(0, Math.ceil(allSupervisors.length / 4)),
        allSupervisors.slice(Math.ceil(allSupervisors.length / 4), Math.ceil(allSupervisors.length / 2)),
        allSupervisors.slice(Math.ceil(allSupervisors.length / 2), Math.ceil(allSupervisors.length * 3 / 4)),
        allSupervisors.slice(Math.ceil(allSupervisors.length * 3 / 4))
      ].map(weekSupervisors => 
        weekSupervisors.map(supervisor => ({
          id: supervisor.id,
          name: supervisor.name,
          attendance: '',
          location: selectedDayData.supervisionLocation,
          followUp: selectedDayData.followUpSupervisors[0]?.name || ''
        }))
      );

      setReportData(newReportData);
    }
  }, [selectedDay, daysData]);

  // دالة تحديث بيانات التقرير
  const updateReportData = (weekIndex: number, supervisorIndex: number, field: keyof ReportSupervisor, value: string) => {
    const updatedData = [...reportData];
    updatedData[weekIndex][supervisorIndex][field] = value;
    setReportData(updatedData);
  };

  // ترتيب الأيام حسب الترتيب الطبيعي
  const dayOrder = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  
  // دالة ترتيب الأيام المختارة
  const sortSelectedDays = (days: string[]) => {
    return days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  };

  // دالة إضافة يوم للاختيار
  const addDayToSelection = (day: string) => {
    if (!selectedDays.includes(day)) {
      const newSelectedDays = [...selectedDays, day];
      setSelectedDays(sortSelectedDays(newSelectedDays));
    }
  };

  // دالة إزالة يوم من الاختيار
  const removeDayFromSelection = (day: string) => {
    setSelectedDays(selectedDays.filter(d => d !== day));
  };

  // دالة اختيار جميع الأيام
  const selectAllDays = () => {
    setSelectedDays(dayOrder);
  };

  // دالة إلغاء اختيار جميع الأيام
  const clearAllDays = () => {
    setSelectedDays([]);
  };

  // دالة تحديث الأيام المختارة عند تغيير اليوم المحدد
  const handleDayChange = (value: string) => {
    if (value === 'all') {
      selectAllDays();
    } else if (value === 'clear') {
      clearAllDays();
    } else {
      setSelectedDay(value);
      if (!selectedDays.includes(value)) {
        const newSelectedDays = [...selectedDays, value];
        setSelectedDays(sortSelectedDays(newSelectedDays));
      }
    }
  };

  // دالة الطباعة المحسنة
  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>التقرير الشهري للإشراف اليومي</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Noto Sans Arabic', Arial, sans-serif;
            direction: rtl;
            background: white;
            color: #333;
            line-height: 1.6;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin: 20px 0 30px 0;
            padding: 20px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .header-info {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 15px;
          }
          
          .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .info-item label {
            font-weight: 600;
            font-size: 14px;
          }
          
          .info-item input {
            padding: 4px 8px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 14px;
            width: 80px;
          }
          
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
            font-size: 12px;
          }
          
          .report-table th {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #1e40af;
            font-weight: 600;
            padding: 8px 4px;
            text-align: center;
            border: 1px solid #93c5fd;
            font-size: 11px;
            min-width: 60px;
          }
          
          .report-table td {
            padding: 6px 4px;
            text-align: center;
            border: 1px solid #e5e7eb;
            vertical-align: middle;
            min-height: 40px;
            font-size: 11px;
          }
          
          .week-header {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            color: #1e40af;
            font-weight: 600;
            font-size: 12px;
            border-right: 3px solid #3b82f6;
          }
          
          .day-cell {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            color: #1e40af;
            font-weight: 600;
            font-size: 12px;
          }
          
          .supervisor-cell {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            color: #1e40af;
            font-weight: 600;
            font-size: 12px;
          }
          
          .location-cell {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            color: #374151;
            font-size: 12px;
          }
          
          .followup-cell {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            color: #374151;
            font-size: 12px;
          }
          
          .attendance-cell {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            border-right: 2px solid #93c5fd;
          }
          
          .input-field {
            width: 100%;
            padding: 4px;
            border: 1px solid #d1d5db;
            border-radius: 3px;
            font-size: 10px;
            text-align: center;
            min-height: 30px;
          }
          
          .footer {
            margin-top: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .footer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
          
          .footer-section h3 {
            color: #1e40af;
            font-weight: 600;
            margin-bottom: 15px;
            font-size: 16px;
          }
          
          .footer-section p {
            color: #374151;
            margin-bottom: 15px;
            font-size: 14px;
          }
          
          .signature-section {
            margin-top: 20px;
          }
          
          .signature-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          
          .signature-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          
          .signature-item label {
            font-weight: 500;
            color: #374151;
            font-size: 12px;
          }
          
          .signature-item input {
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 14px;
          }
          
          .signature-box {
            height: 40px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f9fafb;
            color: #6b7280;
            font-size: 12px;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 10px;
            }
            
            .no-print {
              display: none !important;
            }
            
            .report-table {
              page-break-inside: avoid;
              font-size: 10px;
            }
            
            .report-table th {
              font-size: 9px;
              padding: 6px 3px;
            }
            
            .report-table td {
              font-size: 9px;
              padding: 4px 3px;
            }
            
            .footer {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>التقرير الشهري للإشراف اليومي</h1>
          <div class="header-info">
            <div class="info-item">
              <label>لشهر:</label>
              <input type="text" value="شهر محرم" readonly />
            </div>
            <div class="info-item">
              <label>من الفصل الدراسي:</label>
              <input type="text" value="${semester}" readonly />
            </div>
            <div class="info-item">
              <label>للعام الدراسي:</label>
              <input type="text" value="${academicYear}" readonly />
            </div>
          </div>
        </div>
        
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 80px;">اليوم</th>
              <th style="width: 120px;">اسم المشرف</th>
              <th style="width: 100px;">موقع الإشراف</th>
              <th style="width: 100px;">المشرف المتابع</th>
              <th style="width: 80px;" class="week-header">الأسبوع الأول</th>
              <th style="width: 80px;" class="week-header">الأسبوع الثاني</th>
              <th style="width: 80px;" class="week-header">الأسبوع الثالث</th>
              <th style="width: 80px;" class="week-header">الأسبوع الرابع</th>
            </tr>
          </thead>
          <tbody>
            ${selectedDays.map(selectedDay => {
              const dayData = daysData.find(day => day.day === selectedDay);
              if (!dayData) return '';
              
              // دمج المشرفين من العمودين
              const allSupervisors = [
                ...dayData.supervisors.filter(s => s.name.trim() !== ''),
                ...dayData.supervisors2.filter(s => s.name.trim() !== '')
              ];
              
              return allSupervisors.map((supervisor, index) => `
                <tr>
                  <td class="day-cell">${selectedDay}</td>
                  <td class="supervisor-cell">${supervisor.name}</td>
                  <td class="location-cell">${dayData.supervisionLocation}</td>
                  <td class="followup-cell">${dayData.followUpSupervisors[0]?.name || ''}</td>
                  <td class="attendance-cell">
                    <input type="text" class="input-field" placeholder="" />
                  </td>
                  <td class="attendance-cell">
                    <input type="text" class="input-field" placeholder="" />
                  </td>
                  <td class="attendance-cell">
                    <input type="text" class="input-field" placeholder="" />
                  </td>
                  <td class="attendance-cell">
                    <input type="text" class="input-field" placeholder="" />
                  </td>
                </tr>
              `).join('');
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <div class="footer-grid">
            <div class="footer-section">
              <h3>المشرف المتابع:</h3>
              <div class="signature-grid">
                <div class="signature-item">
                  <label>الاسم:</label>
                  <input type="text" value="${followUpSupervisor}" placeholder="اسم المشرف المتابع" />
                </div>
                <div class="signature-item">
                  <label>التوقيع:</label>
                  <div class="signature-box">خانة التوقيع</div>
                </div>
              </div>
            </div>
            
            <div class="footer-section">
              <h3>مدير المدرسة:</h3>
              <div class="signature-grid">
                <div class="signature-item">
                  <label>الاسم:</label>
                  <input type="text" value="${principalName}" placeholder="اسم المدير" />
                </div>
                <div class="signature-item">
                  <label>التوقيع:</label>
                  <div class="signature-box">خانة التوقيع</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  // دالة إظهار الإشعارات
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    toast({
      title: type === 'success' ? 'نجح' : 'خطأ',
      description: message,
      variant: type === 'success' ? 'default' : 'destructive',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-kufi" style={{ direction: 'rtl' }}>

      {/* بطاقة الإعدادات */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Label className="text-blue-800 font-bold text-lg">اختر الأيام:</Label>
                <Select value={selectedDay} onValueChange={handleDayChange}>
                  <SelectTrigger className="w-48 bg-white border-blue-300 focus:border-blue-500 hover:border-blue-400 transition-colors">
                    <SelectValue placeholder="اختر اليوم" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200 shadow-lg">
                    <div className="p-2 border-b border-blue-100">
                      <div className="text-xs font-medium text-blue-600 mb-2">أيام الأسبوع</div>
                      {dayOrder.map(day => (
                        <SelectItem 
                          key={day} 
                          value={day}
                          className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                        >
                          {day}
                        </SelectItem>
                      ))}
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-medium text-green-600 mb-2">خيارات سريعة</div>
                      <SelectItem 
                        value="all" 
                        onClick={selectAllDays}
                        className="hover:bg-green-50 focus:bg-green-50 cursor-pointer text-green-700"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          اختيار الكل
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="clear" 
                        onClick={clearAllDays}
                        className="hover:bg-red-50 focus:bg-red-50 cursor-pointer text-red-700"
                      >
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          إلغاء الكل
                        </div>
                      </SelectItem>
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-blue-800 font-bold text-lg">الفصل الدراسي:</Label>
                <Input
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-24 bg-white text-blue-800 border-blue-300 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-blue-800 font-bold text-lg">العام الدراسي:</Label>
                <Input
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-32 bg-white text-blue-800 border-blue-300 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* عرض الأيام المختارة */}
            <div className="mt-4">
              <Label className="text-blue-800 font-bold text-sm mb-2 block">الأيام المختارة:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedDays.map(day => (
                  <div key={day} className="flex items-center gap-2 bg-blue-200 px-3 py-1 rounded-full">
                    <span className="text-blue-800 text-sm">{day}</span>
                    <button
                      onClick={() => removeDayFromSelection(day)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {selectedDays.length === 0 && (
                  <span className="text-gray-500 text-sm">لم يتم اختيار أيام</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* شريط الأزرار */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={handlePrint}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Printer className="h-5 w-5 ml-2" />
                طباعة التقرير الشهري
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول التقرير */}
      <div className="max-w-7xl mx-auto mb-8">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-blue-200" style={{ direction: 'rtl' }}>
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
                    <th className="border border-blue-200 p-3 text-center font-bold" style={{ width: '80px' }}>اليوم</th>
                    <th className="border border-blue-200 p-3 text-center font-bold" style={{ width: '120px' }}>اسم المشرف</th>
                    <th className="border border-blue-200 p-3 text-center font-bold" style={{ width: '100px' }}>موقع الإشراف</th>
                    <th className="border border-blue-200 p-3 text-center font-bold" style={{ width: '100px' }}>المشرف المتابع</th>
                    <th className="border border-blue-300 p-2 text-center font-bold bg-blue-100" style={{ width: '80px' }}>الأسبوع الأول</th>
                    <th className="border border-blue-300 p-2 text-center font-bold bg-blue-100" style={{ width: '80px' }}>الأسبوع الثاني</th>
                    <th className="border border-blue-300 p-2 text-center font-bold bg-blue-100" style={{ width: '80px' }}>الأسبوع الثالث</th>
                    <th className="border border-blue-300 p-2 text-center font-bold bg-blue-100" style={{ width: '80px' }}>الأسبوع الرابع</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDays.map(selectedDay => {
                    const dayData = daysData.find(day => day.day === selectedDay);
                    if (!dayData) return null;
                    
                    // دمج المشرفين من العمودين
                    const allSupervisors = [
                      ...dayData.supervisors.filter(s => s.name.trim() !== ''),
                      ...dayData.supervisors2.filter(s => s.name.trim() !== '')
                    ];
                    
                    return allSupervisors.map((supervisor, index) => (
                      <tr key={`${selectedDay}-${supervisor.id}-${index}`} className="border-b border-blue-200 hover:bg-blue-50">
                        <td className="border border-blue-200 p-3 text-center font-bold bg-blue-50 text-blue-700">
                          {selectedDay}
                        </td>
                        <td className="border border-blue-200 p-3 text-center font-bold bg-blue-50 text-blue-700">
                          {supervisor.name}
                        </td>
                        <td className="border border-blue-200 p-3 text-center">
                          <Input
                            value={dayData.supervisionLocation}
                            placeholder=""
                            className="w-full border-blue-300 focus:border-blue-500 text-center"
                            readOnly
                          />
                        </td>
                        <td className="border border-blue-200 p-3 text-center">
                          <Input
                            value={dayData.followUpSupervisors[0]?.name || ''}
                            placeholder=""
                            className="w-full border-blue-300 focus:border-blue-500 text-center"
                            readOnly
                          />
                        </td>
                        <td className="border border-blue-300 p-2 bg-blue-50">
                          <Input
                            placeholder=""
                            className="w-full border-blue-300 focus:border-blue-500 text-center"
                          />
                        </td>
                        <td className="border border-blue-300 p-2 bg-blue-50">
                          <Input
                            placeholder=""
                            className="w-full border-blue-300 focus:border-blue-500 text-center"
                          />
                        </td>
                        <td className="border border-blue-300 p-2 bg-blue-50">
                          <Input
                            placeholder=""
                            className="w-full border-blue-300 focus:border-blue-500 text-center"
                          />
                        </td>
                        <td className="border border-blue-300 p-2 bg-blue-50">
                          <Input
                            placeholder=""
                            className="w-full border-blue-300 focus:border-blue-500 text-center"
                          />
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التذييل المحسن */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* المشرف المتابع */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-800 mb-4">المشرف المتابع:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-blue-700 text-sm">الاسم:</Label>
                    <Input
                      value={followUpSupervisor}
                      onChange={(e) => setFollowUpSupervisor(e.target.value)}
                      placeholder="اسم المشرف المتابع"
                      className="w-full bg-white border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-700 text-sm">التوقيع:</Label>
                    <div className="w-full h-10 bg-white border border-blue-300 rounded-md flex items-center justify-center text-blue-500">
                      <span className="text-sm">خانة التوقيع</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* مدير المدرسة */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-800 mb-4">مدير المدرسة:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-blue-700 text-sm">الاسم:</Label>
                    <Input
                      value={principalName}
                      onChange={(e) => setPrincipalName(e.target.value)}
                      placeholder="اسم المدير"
                      className="w-full bg-white border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-700 text-sm">التوقيع:</Label>
                    <div className="w-full h-10 bg-white border border-blue-300 rounded-md flex items-center justify-center text-blue-500">
                      <span className="text-sm">خانة التوقيع</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailySupervisionReportPage; 
