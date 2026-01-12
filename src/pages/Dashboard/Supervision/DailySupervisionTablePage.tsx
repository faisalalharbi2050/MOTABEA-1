import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowRight, Printer, RotateCcw, Plus, Trash2, Home, Shield, 
  Calendar, User, FileText, Users, CheckCircle, X, ChevronRight, Clock
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  supervisors2: Supervisor[]; // مشرفين منفصلين
  followUpSupervisors: FollowUpSupervisor[];
  supervisionLocation: string;
}

const DailySupervisionTablePage = () => {
  const navigate = useNavigate();
  const [semester, setSemester] = useState('الأول');
  const [academicYear, setAcademicYear] = useState('1445-1446');
  const [startDate, setStartDate] = useState('');
  const [startDay, setStartDay] = useState('');
  const [deputyName, setDeputyName] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [breakCount, setBreakCount] = useState(1); // عدد الفسح
  
  // مسميات الفسح المخصصة
  const [breakNames, setBreakNames] = useState<{ [breakNumber: number]: string }>({
    1: '',
    2: '',
    3: '',
    4: ''
  });

  // بيانات الفسح المتعددة
  const [breaksData, setBreaksData] = useState<{ [breakNumber: number]: DayData[] }>({
    1: [
      {
        day: 'الأحد',
        supervisors: [{ id: '1', name: '', signature: '' }],
        supervisors2: [{ id: '1', name: '', signature: '' }],
        followUpSupervisors: [{ id: '1', name: '', signature: '' }],
        supervisionLocation: ''
      },
      {
        day: 'الاثنين',
        supervisors: [{ id: '1', name: '', signature: '' }],
        supervisors2: [{ id: '1', name: '', signature: '' }],
        followUpSupervisors: [{ id: '1', name: '', signature: '' }],
        supervisionLocation: ''
      },
      {
        day: 'الثلاثاء',
        supervisors: [{ id: '1', name: '', signature: '' }],
        supervisors2: [{ id: '1', name: '', signature: '' }],
        followUpSupervisors: [{ id: '1', name: '', signature: '' }],
        supervisionLocation: ''
      },
      {
        day: 'الأربعاء',
        supervisors: [{ id: '1', name: '', signature: '' }],
        supervisors2: [{ id: '1', name: '', signature: '' }],
        followUpSupervisors: [{ id: '1', name: '', signature: '' }],
        supervisionLocation: ''
      },
      {
        day: 'الخميس',
        supervisors: [{ id: '1', name: '', signature: '' }],
        supervisors2: [{ id: '1', name: '', signature: '' }],
        followUpSupervisors: [{ id: '1', name: '', signature: '' }],
        supervisionLocation: ''
      }
    ]
  });

  // إنشاء بيانات افتراضية للفسحة الجديدة
  const createDefaultBreakData = (): DayData[] => [
    { day: 'الأحد', supervisors: [{ id: '1', name: '', signature: '' }], supervisors2: [{ id: '1', name: '', signature: '' }], followUpSupervisors: [{ id: '1', name: '', signature: '' }], supervisionLocation: '' },
    { day: 'الاثنين', supervisors: [{ id: '1', name: '', signature: '' }], supervisors2: [{ id: '1', name: '', signature: '' }], followUpSupervisors: [{ id: '1', name: '', signature: '' }], supervisionLocation: '' },
    { day: 'الثلاثاء', supervisors: [{ id: '1', name: '', signature: '' }], supervisors2: [{ id: '1', name: '', signature: '' }], followUpSupervisors: [{ id: '1', name: '', signature: '' }], supervisionLocation: '' },
    { day: 'الأربعاء', supervisors: [{ id: '1', name: '', signature: '' }], supervisors2: [{ id: '1', name: '', signature: '' }], followUpSupervisors: [{ id: '1', name: '', signature: '' }], supervisionLocation: '' },
    { day: 'الخميس', supervisors: [{ id: '1', name: '', signature: '' }], supervisors2: [{ id: '1', name: '', signature: '' }], followUpSupervisors: [{ id: '1', name: '', signature: '' }], supervisionLocation: '' }
  ];

  // تحديث عدد الفسح
  const updateBreakCount = (newCount: number) => {
    const newBreaksData = { ...breaksData };
    
    // إضافة فسح جديدة إذا لزم الأمر
    for (let i = 1; i <= newCount; i++) {
      if (!newBreaksData[i]) {
        newBreaksData[i] = createDefaultBreakData();
      }
    }
    
    // إزالة الفسح الزائدة
    Object.keys(newBreaksData).forEach(breakNum => {
      if (parseInt(breakNum) > newCount) {
        delete newBreaksData[parseInt(breakNum)];
      }
    });
    
    setBreaksData(newBreaksData);
    setBreakCount(newCount);
  };

  // الحصول على بيانات الفسحة الحالية
  const getCurrentBreakData = (breakNumber: number = 1): DayData[] => {
    return breaksData[breakNumber] || createDefaultBreakData();
  };

  // تحديث اسم الفسحة
  const updateBreakName = (breakNumber: number, name: string) => {
    setBreakNames(prev => ({
      ...prev,
      [breakNumber]: name
    }));
  };

  // الحصول على اسم الفسحة مع النص الافتراضي
  const getBreakDisplayName = (breakNumber: number): string => {
    const defaultNames = { 1: 'الأولى', 2: 'الثانية', 3: 'الثالثة', 4: 'الرابعة' };
    const customName = breakNames[breakNumber]?.trim();
    
    if (customName) {
      return `${defaultNames[breakNumber as keyof typeof defaultNames]} (${customName})`;
    }
    
    return defaultNames[breakNumber as keyof typeof defaultNames];
  };

  // دالة إضافة مشرف جديد
  const addSupervisor = (dayIndex: number, breakNumber: number = 1) => {
    const newSupervisor: Supervisor = {
      id: Date.now().toString(),
      name: '',
      signature: ''
    };
    
    const updatedBreaksData = { ...breaksData };
    const updatedDays = [...updatedBreaksData[breakNumber]];
    updatedDays[dayIndex].supervisors.push(newSupervisor);
    updatedBreaksData[breakNumber] = updatedDays;
    setBreaksData(updatedBreaksData);
  };

  // دالة إضافة مشرف جديد للعمود الثاني
  const addSupervisor2 = (dayIndex: number, breakNumber: number = 1) => {
    const newSupervisor: Supervisor = {
      id: Date.now().toString(),
      name: '',
      signature: ''
    };
    
    const updatedBreaksData = { ...breaksData };
    const updatedDays = [...updatedBreaksData[breakNumber]];
    updatedDays[dayIndex].supervisors2.push(newSupervisor);
    updatedBreaksData[breakNumber] = updatedDays;
    setBreaksData(updatedBreaksData);
  };

  // دالة حذف مشرف
  const removeSupervisor = (dayIndex: number, supervisorIndex: number, breakNumber: number = 1) => {
    const updatedBreaksData = { ...breaksData };
    const updatedDays = [...updatedBreaksData[breakNumber]];
    updatedDays[dayIndex].supervisors.splice(supervisorIndex, 1);
    updatedBreaksData[breakNumber] = updatedDays;
    setBreaksData(updatedBreaksData);
  };

  // دالة حذف مشرف من العمود الثاني
  const removeSupervisor2 = (dayIndex: number, supervisorIndex: number, breakNumber: number = 1) => {
    const updatedBreaksData = { ...breaksData };
    const updatedDays = [...updatedBreaksData[breakNumber]];
    updatedDays[dayIndex].supervisors2.splice(supervisorIndex, 1);
    updatedBreaksData[breakNumber] = updatedDays;
    setBreaksData(updatedBreaksData);
  };

  // دالة إضافة مشرف متابع
  const addFollowUpSupervisor = (dayIndex: number, breakNumber: number = 1) => {
    const newFollowUpSupervisor: FollowUpSupervisor = {
      id: Date.now().toString(),
      name: '',
      signature: ''
    };
    
    const updatedBreaksData = { ...breaksData };
    const updatedDays = [...updatedBreaksData[breakNumber]];
    updatedDays[dayIndex].followUpSupervisors.push(newFollowUpSupervisor);
    updatedBreaksData[breakNumber] = updatedDays;
    setBreaksData(updatedBreaksData);
  };

  // دالة حذف مشرف متابع
  const removeFollowUpSupervisor = (dayIndex: number, supervisorIndex: number, breakNumber: number = 1) => {
    const updatedBreaksData = { ...breaksData };
    const updatedDays = [...updatedBreaksData[breakNumber]];
    updatedDays[dayIndex].followUpSupervisors.splice(supervisorIndex, 1);
    updatedBreaksData[breakNumber] = updatedDays;
    setBreaksData(updatedBreaksData);
  };

  // دالة تحديث بيانات المشرف
  const updateSupervisor = (dayIndex: number, supervisorIndex: number, field: 'name' | 'signature', value: string, breakNumber: number = 1) => {
    const updatedBreaksData = { ...breaksData };
    const updatedDays = [...updatedBreaksData[breakNumber]];
    updatedDays[dayIndex].supervisors[supervisorIndex][field] = value;
    updatedBreaksData[breakNumber] = updatedDays;
    setBreaksData(updatedBreaksData);
  };

  // دالة تحديث بيانات المشرف في العمود الثاني
  const updateSupervisor2 = (dayIndex: number, supervisorIndex: number, field: 'name' | 'signature', value: string, breakNumber: number = 1) => {
    const updatedBreaksData = { ...breaksData };
    const updatedDays = [...updatedBreaksData[breakNumber]];
    updatedDays[dayIndex].supervisors2[supervisorIndex][field] = value;
    updatedBreaksData[breakNumber] = updatedDays;
    setBreaksData(updatedBreaksData);
  };

  // دالة تحديث بيانات المشرف المتابع
  const updateFollowUpSupervisor = (dayIndex: number, supervisorIndex: number, field: 'name' | 'signature', value: string, breakNumber: number = 1) => {
    const updatedBreaksData = { ...breaksData };
    const updatedDays = [...updatedBreaksData[breakNumber]];
    updatedDays[dayIndex].followUpSupervisors[supervisorIndex][field] = value;
    updatedBreaksData[breakNumber] = updatedDays;
    setBreaksData(updatedBreaksData);
  };

  // دالة تحديث موقع الإشراف
  const updateSupervisionLocation = (dayIndex: number, value: string, breakNumber: number = 1) => {
    const updatedBreaksData = { ...breaksData };
    const updatedDays = [...updatedBreaksData[breakNumber]];
    updatedDays[dayIndex].supervisionLocation = value;
    updatedBreaksData[breakNumber] = updatedDays;
    setBreaksData(updatedBreaksData);
  };

  // دالة حذف جميع البيانات
  const clearAllData = () => {
    const resetBreaksData: { [breakNumber: number]: DayData[] } = {};
    for (let i = 1; i <= breakCount; i++) {
      resetBreaksData[i] = createDefaultBreakData();
    }
    setBreaksData(resetBreaksData);
    
    // إعادة تعيين مسميات الفسح
    setBreakNames({
      1: '',
      2: '',
      3: '',
      4: ''
    });
    
    setSemester('الأول');
    setAcademicYear('1445-1446');
    setStartDate('');
    setStartDay('');
    setDeputyName('');
    setPrincipalName('');
    setShowDeleteDialog(false);
    showNotification('تم حذف جميع البيانات بنجاح', 'success');
  };

  // دالة الطباعة المحسنة للفسحة المحددة
  const handlePrintBreak = (type: 'current' | 'empty', breakNumber: number) => {
    const daysData = getCurrentBreakData(breakNumber);
    const displayName = getBreakDisplayName(breakNumber);
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>جدول الإشراف اليومي - الفسحة ${displayName}</title>
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
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          
          th {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #1e40af;
            font-weight: 600;
            padding: 12px 8px;
            text-align: center;
            border: 1px solid #93c5fd;
            font-size: 14px;
          }
          
          td {
            padding: 12px 8px;
            text-align: center;
            border: 1px solid #e5e7eb;
            vertical-align: top;
            min-height: 60px;
          }
          
          .day-cell {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            color: #1e40af;
            font-weight: 600;
            font-size: 16px;
          }
          
          .input-field {
            width: 100%;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          .textarea-field {
            width: 100%;
            min-height: 80px;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 14px;
            resize: vertical;
            font-family: inherit;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
            
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>جدول الإشراف اليومي - الفسحة ${displayName}</h1>
          <div class="header-info">
            <div class="info-item">
              <label>الفصل الدراسي:</label>
              <input type="text" value="${semester}" readonly />
            </div>
            <div class="info-item">
              <label>العام الدراسي:</label>
              <input type="text" value="${academicYear}" readonly />
            </div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>اليوم</th>
              <th>اسم المشرف</th>
              <th>التوقيع</th>
              <th>اسم المشرف</th>
              <th>التوقيع</th>
              <th>موقع الإشراف</th>
              <th>المشرف المتابع</th>
              <th>التوقيع</th>
            </tr>
          </thead>
          <tbody>
            ${daysData.map(day => `
              <tr>
                <td class="day-cell">${day.day}</td>
                <td>
                  ${day.supervisors.map(supervisor => `
                    <input type="text" class="input-field" value="${supervisor.name}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="اسم المشرف"'} />
                  `).join('')}
                </td>
                <td>
                  ${day.supervisors.map(supervisor => `
                    <input type="text" class="input-field" value="${supervisor.signature}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="التوقيع"'} />
                  `).join('')}
                </td>
                <td>
                  ${day.supervisors2.map(supervisor => `
                    <input type="text" class="input-field" value="${supervisor.name}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="اسم المشرف"'} />
                  `).join('')}
                </td>
                <td>
                  ${day.supervisors2.map(supervisor => `
                    <input type="text" class="input-field" value="${supervisor.signature}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="التوقيع"'} />
                  `).join('')}
                </td>
                <td>
                  <textarea class="textarea-field" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="المقصف - الفناء الخارجي - الفناء الداخلي - المصلى - ..."'}>${day.supervisionLocation || ''}</textarea>
                </td>
                <td>
                  ${day.followUpSupervisors.map(followUpSupervisor => `
                    <input type="text" class="input-field" value="${followUpSupervisor.name}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="المشرف المتابع"'} />
                  `).join('')}
                </td>
                <td>
                  ${day.followUpSupervisors.map(followUpSupervisor => `
                    <input type="text" class="input-field" value="${followUpSupervisor.signature}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="التوقيع"'} />
                  `).join('')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
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

  // دالة الطباعة المحسنة للكل
  const handlePrint = (type: 'current' | 'empty') => {
    const allDaysData = getCurrentBreakData(1);
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>جدول الإشراف اليومي</title>
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
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          
          th {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #1e40af;
            font-weight: 600;
            padding: 12px 8px;
            text-align: center;
            border: 1px solid #93c5fd;
            font-size: 14px;
          }
          
          td {
            padding: 12px 8px;
            text-align: center;
            border: 1px solid #e5e7eb;
            vertical-align: top;
            min-height: 60px;
          }
          
          .day-cell {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            color: #1e40af;
            font-weight: 600;
            font-size: 16px;
          }
          
          .input-field {
            width: 100%;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          .textarea-field {
            width: 100%;
            min-height: 80px;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 14px;
            resize: vertical;
            font-family: inherit;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
            line-height: 1.4;
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
            font-size: 18px;
          }
          
          .footer-section p {
            color: #374151;
            margin-bottom: 15px;
            font-size: 14px;
          }
          
          .input-group {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
          }
          
          .input-group label {
            font-weight: 500;
            color: #374151;
            font-size: 14px;
            min-width: 60px;
          }
          
          .input-group input {
            padding: 6px 10px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 14px;
            width: 120px;
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
              padding: 20px;
            }
            
            .no-print {
              display: none !important;
            }
            
            table {
              page-break-inside: avoid;
            }
            
            .footer {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>جدول الإشراف اليومي</h1>
          <div class="header-info">
            <div class="info-item">
              <label>الفصل الدراسي:</label>
              <input type="text" value="${semester}" readonly />
            </div>
            <div class="info-item">
              <label>العام الدراسي:</label>
              <input type="text" value="${academicYear}" readonly />
            </div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>اليوم</th>
              <th>اسم المشرف</th>
              <th>التوقيع</th>
              <th>اسم المشرف</th>
              <th>التوقيع</th>
              <th>موقع الإشراف</th>
              <th>المشرف المتابع</th>
              <th>التوقيع</th>
            </tr>
          </thead>
          <tbody>
            ${allDaysData.map(day => `
              <tr>
                <td class="day-cell">${day.day}</td>
                <td>
                  ${day.supervisors.map(supervisor => `
                    <input type="text" class="input-field" value="${supervisor.name}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="اسم المشرف"'} />
                  `).join('')}
                </td>
                <td>
                  ${day.supervisors.map(supervisor => `
                    <input type="text" class="input-field" value="${supervisor.signature}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="التوقيع"'} />
                  `).join('')}
                </td>
                <td>
                  ${day.supervisors2.map(supervisor => `
                    <input type="text" class="input-field" value="${supervisor.name}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="اسم المشرف"'} />
                  `).join('')}
                </td>
                <td>
                  ${day.supervisors2.map(supervisor => `
                    <input type="text" class="input-field" value="${supervisor.signature}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="التوقيع"'} />
                  `).join('')}
                </td>
                <td>
                  <textarea class="textarea-field" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="المقصف - الفناء الخارجي - الفناء الداخلي - المصلى - ..."'} style="white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word;">${day.supervisionLocation || ''}</textarea>
                </td>
                <td>
                  ${day.followUpSupervisors.map(followUpSupervisor => `
                    <input type="text" class="input-field" value="${followUpSupervisor.name}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="المشرف المتابع"'} />
                  `).join('')}
                </td>
                <td>
                  ${day.followUpSupervisors.map(followUpSupervisor => `
                    <input type="text" class="input-field" value="${followUpSupervisor.signature}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="التوقيع"'} />
                  `).join('')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <div class="footer-grid">
            <div class="footer-section">
              <h3>بداية العمل</h3>
              <p>يبدأ العمل بجدول الإشراف اليومي من يوم الموافق</p>
              <div class="input-group">
                <label>من يوم:</label>
                <input type="text" value="${startDay}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="اليوم"'} />
                <label>الموافق:</label>
                <input type="text" value="${startDate}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="التاريخ"'} />
              </div>
            </div>
            
            <div class="footer-section">
              <div class="signature-section">
                <h4 style="color: #1e40af; font-weight: 600; margin-bottom: 15px;">وكيل الشؤون التعليمية:</h4>
                <div class="signature-grid">
                  <div class="signature-item">
                    <label>الاسم:</label>
                    <input type="text" value="${deputyName}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="اسم الوكيل"'} />
                  </div>
                  <div class="signature-item">
                    <label>التوقيع:</label>
                    <div class="signature-box">خانة التوقيع</div>
                  </div>
                </div>
              </div>
              
              <div class="signature-section" style="margin-top: 30px;">
                <h4 style="color: #1e40af; font-weight: 600; margin-bottom: 15px;">مدير المدرسة:</h4>
                <div class="signature-grid">
                  <div class="signature-item">
                    <label>الاسم:</label>
                    <input type="text" value="${principalName}" ${type === 'empty' ? 'readonly placeholder=""' : 'placeholder="اسم المدير"'} />
                  </div>
                  <div class="signature-item">
                    <label>التوقيع:</label>
                    <div class="signature-box">خانة التوقيع</div>
                  </div>
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
    const notification = document.createElement('div');
    notification.className = `fixed z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.style.cssText = 'top: 20px; right: 20px;';
    
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-kufi" style={{ direction: 'rtl' }}>

      {/* بطاقة الفصل الدراسي والعام الدراسي */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-8 flex-wrap">
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
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <Label className="text-blue-800 font-bold text-lg">عدد الفسح:</Label>
                <Select value={breakCount.toString()} onValueChange={(value) => updateBreakCount(parseInt(value))}>
                  <SelectTrigger className="w-24 bg-white text-blue-800 border-blue-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-right bg-white border border-gray-200 shadow-lg z-[70]" dir="rtl">
                    {[1, 2, 3, 4].map((num) => {
                      const getBreakText = (number: number) => {
                        switch (number) {
                          case 1: return 'فسحة';
                          case 2: return 'فسحتان';
                          case 3: return 'ثلاث فسح';
                          case 4: return 'أربع فسح';
                          default: return 'فسح';
                        }
                      };
                      
                      return (
                        <SelectItem key={num} value={num.toString()} className="text-right hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">
                          {getBreakText(num)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {breakCount > 1 && (
              <div className="mt-4 flex items-center justify-center">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <p className="text-sm text-blue-700 text-center">
                    💡 يمكنك إضافة مسمى مخصص لكل فسحة (مثل: المرحلة المتوسطة، المرحلة الثانوية)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* شريط الأزرار */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => handlePrint('current')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Printer className="h-5 w-5 ml-2" />
                طباعة البيانات الحالية
              </Button>
              
              <Button
                onClick={() => handlePrint('empty')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <FileText className="h-5 w-5 ml-2" />
                طباعة نموذج فارغ
              </Button>
              
              <Button
                onClick={() => navigate('/dashboard/supervision/daily-report')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <FileText className="h-5 w-5 ml-2" />
                تقرير الإشراف اليومي
              </Button>
              
              <Button
                onClick={() => setShowDeleteDialog(true)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <RotateCcw className="h-5 w-5 ml-2" />
                حذف كل البيانات
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جداول الإشراف للفسح المتعددة */}
      {Array.from({ length: breakCount }, (_, breakIndex) => {
        const currentBreakNumber = breakIndex + 1;
        const currentDaysData = getCurrentBreakData(currentBreakNumber);
        
        return (
          <div key={currentBreakNumber} className="max-w-7xl mx-auto mb-8">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200 pb-4">
                <CardTitle className="text-center text-blue-800 text-xl font-bold flex items-center justify-center gap-2">
                  <Clock className="h-6 w-6" />
                  جدول الإشراف اليومي - الفسحة {getBreakDisplayName(currentBreakNumber)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300" style={{ direction: 'rtl' }}>
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
                        <th className="border border-gray-300 p-3 text-center font-bold">اليوم</th>
                        <th className="border border-gray-300 p-3 text-center font-bold">اسم المشرف</th>
                        <th className="border border-gray-300 p-3 text-center font-bold">التوقيع</th>
                        <th className="border border-gray-300 p-3 text-center font-bold">اسم المشرف</th>
                        <th className="border border-gray-300 p-3 text-center font-bold">التوقيع</th>
                        <th className="border border-gray-300 p-3 text-center font-bold">موقع الإشراف</th>
                        <th className="border border-gray-300 p-3 text-center font-bold">المشرف المتابع</th>
                        <th className="border border-gray-300 p-3 text-center font-bold">التوقيع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDaysData.map((day, dayIndex) => (
                        <tr key={day.day} className="border-b border-gray-300 hover:bg-gray-50">
                          <td className="border border-gray-300 p-3 text-center font-bold bg-blue-50 text-blue-700">
                            {day.day}
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="space-y-2">
                              {day.supervisors.map((supervisor, supervisorIndex) => (
                                <div key={supervisor.id} className="flex items-center gap-2">
                                  <Input
                                    value={supervisor.name}
                                    onChange={(e) => updateSupervisor(dayIndex, supervisorIndex, 'name', e.target.value, currentBreakNumber)}
                                    placeholder="اسم المشرف"
                                    className="flex-1 border-gray-300 focus:border-blue-500"
                                  />
                                  {supervisorIndex > 0 && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => removeSupervisor(dayIndex, supervisorIndex, currentBreakNumber)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <div className="flex justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addSupervisor(dayIndex, currentBreakNumber)}
                                  className="w-8 h-8 p-0 bg-blue-50 text-blue-600 border-blue-300 hover:bg-blue-100 rounded-full"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="space-y-2">
                              {day.supervisors.map((supervisor, supervisorIndex) => (
                                <div key={supervisor.id} className="flex items-center gap-2">
                                  <Input
                                    value={supervisor.signature}
                                    onChange={(e) => updateSupervisor(dayIndex, supervisorIndex, 'signature', e.target.value, currentBreakNumber)}
                                    placeholder="التوقيع"
                                    className="flex-1 border-gray-300 focus:border-blue-500"
                                  />
                                </div>
                              ))}
                              <div className="h-8"></div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="space-y-2">
                              {day.supervisors2.map((supervisor, supervisorIndex) => (
                                <div key={supervisor.id} className="flex items-center gap-2">
                                  <Input
                                    value={supervisor.name}
                                    onChange={(e) => updateSupervisor2(dayIndex, supervisorIndex, 'name', e.target.value, currentBreakNumber)}
                                    placeholder="اسم المشرف"
                                    className="flex-1 border-gray-300 focus:border-blue-500"
                                  />
                                  {supervisorIndex > 0 && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => removeSupervisor2(dayIndex, supervisorIndex, currentBreakNumber)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <div className="flex justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addSupervisor2(dayIndex, currentBreakNumber)}
                                  className="w-8 h-8 p-0 bg-blue-50 text-blue-600 border-blue-300 hover:bg-blue-100 rounded-full"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="space-y-2">
                              {day.supervisors2.map((supervisor, supervisorIndex) => (
                                <div key={supervisor.id} className="flex items-center gap-2">
                                  <Input
                                    value={supervisor.signature}
                                    onChange={(e) => updateSupervisor2(dayIndex, supervisorIndex, 'signature', e.target.value, currentBreakNumber)}
                                    placeholder="التوقيع"
                                    className="flex-1 border-gray-300 focus:border-blue-500"
                                  />
                                </div>
                              ))}
                              <div className="h-8"></div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <Textarea
                              value={day.supervisionLocation}
                              onChange={(e) => updateSupervisionLocation(dayIndex, e.target.value, currentBreakNumber)}
                              placeholder="المقصف - الفناء الخارجي - الفناء الداخلي - المصلى - ..."
                              className="min-h-[80px] border-gray-300 focus:border-blue-500 resize-none"
                            />
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="space-y-2">
                              {day.followUpSupervisors.map((followUpSupervisor, supervisorIndex) => (
                                <div key={followUpSupervisor.id} className="flex items-center gap-2">
                                  <Input
                                    value={followUpSupervisor.name}
                                    onChange={(e) => updateFollowUpSupervisor(dayIndex, supervisorIndex, 'name', e.target.value, currentBreakNumber)}
                                    placeholder="المشرف المتابع"
                                    className="flex-1 border-gray-300 focus:border-blue-500"
                                  />
                                  {supervisorIndex > 0 && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => removeFollowUpSupervisor(dayIndex, supervisorIndex, currentBreakNumber)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <div className="flex justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addFollowUpSupervisor(dayIndex, currentBreakNumber)}
                                  className="w-8 h-8 p-0 bg-blue-50 text-blue-600 border-blue-300 hover:bg-blue-100 rounded-full"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="space-y-2">
                              {day.followUpSupervisors.map((followUpSupervisor, supervisorIndex) => (
                                <div key={followUpSupervisor.id} className="flex items-center gap-2">
                                  <Input
                                    value={followUpSupervisor.signature}
                                    onChange={(e) => updateFollowUpSupervisor(dayIndex, supervisorIndex, 'signature', e.target.value, currentBreakNumber)}
                                    placeholder="التوقيع"
                                    className="flex-1 border-gray-300 focus:border-blue-500"
                                  />
                                </div>
                              ))}
                              <div className="h-8"></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* حقل إدخال مسمى الفسحة */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Label className="text-blue-800 font-semibold whitespace-nowrap">مسمى الفسحة (اختياري):</Label>
                    <Input
                      value={breakNames[currentBreakNumber] || ''}
                      onChange={(e) => updateBreakName(currentBreakNumber, e.target.value)}
                      placeholder="مثال: المرحلة المتوسطة، المرحلة الثانوية، الصف الأول..."
                      className="flex-1 max-w-md bg-white border-blue-300 focus:border-blue-500"
                      dir="rtl"
                    />
                  </div>
                  
                  {/* أزرار الطباعة لكل فسحة */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button
                      onClick={() => handlePrintBreak('current', currentBreakNumber)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 text-sm"
                    >
                      <Printer className="h-4 w-4 ml-2" />
                      طباعة الفسحة {getBreakDisplayName(currentBreakNumber)}
                    </Button>
                    
                    <Button
                      onClick={() => handlePrintBreak('empty', currentBreakNumber)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 text-sm"
                    >
                      <FileText className="h-4 w-4 ml-2" />
                      نموذج فارغ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}

      {/* التذييل المحسن */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* بداية العمل */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-800 mb-4">بداية العمل</h3>
                <p className="text-blue-700 mb-4">يبدأ العمل بجدول الإشراف اليومي</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-blue-800 font-medium">من يوم:</Label>
                    <Input
                      value={startDay}
                      onChange={(e) => setStartDay(e.target.value)}
                      placeholder="اليوم"
                      className="w-32 bg-white border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-blue-800 font-medium">الموافق:</Label>
                    <Input
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="التاريخ"
                      className="w-32 bg-white border-blue-300 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* التوقيعات */}
              <div className="space-y-6">
                {/* وكيل الشؤون التعليمية */}
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-blue-800">وكيل الشؤون التعليمية:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-blue-700 text-sm">الاسم:</Label>
                      <Input
                        value={deputyName}
                        onChange={(e) => setDeputyName(e.target.value)}
                        placeholder="اسم الوكيل"
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
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-blue-800">مدير المدرسة:</h4>
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* مربع حوار التأكيد */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full m-4 font-kufi" style={{ direction: 'rtl' }}>
            <h3 className="text-lg font-bold text-red-600 mb-4">تأكيد حذف البيانات</h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من رغبتك في حذف جميع البيانات المدخلة في جدول الإشراف اليومي؟ 
              هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteDialog(false)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                إلغاء
              </Button>
              <Button 
                onClick={clearAllData}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                حذف جميع البيانات
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; // تم إصلاح المشكلة

export default DailySupervisionTablePage; 