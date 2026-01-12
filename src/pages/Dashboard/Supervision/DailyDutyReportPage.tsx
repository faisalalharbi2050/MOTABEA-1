import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, Printer, Plus, Trash2, ChevronRight, FileText
} from 'lucide-react';

const DailyDutyReportPage = () => {
  const navigate = useNavigate();
  
  // حالات النموذج
  const [semester, setSemester] = useState('الأول');
  const [academicYear, setAcademicYear] = useState('1445-1446');
  const [day, setDay] = useState('');
  const [date, setDate] = useState('');
  
  // بيانات الموظفين المناوبين
  const [dutyOfficers, setDutyOfficers] = useState([
    { id: '1', name: '', signature: '', notes: '' }
  ]);
  
  // بيانات الطلاب المتأخرون
  const [lateStudents, setLateStudents] = useState(
    Array.from({length: 5}, (_, i) => ({
      id: (i + 1).toString(),
      name: '',
      classSection: '',
      leaveTime: '',
      action: '',
      notes: ''
    }))
  );
  
  // بيانات الطلاب المخالفون
  const [violatingStudents, setViolatingStudents] = useState(
    Array.from({length: 5}, (_, i) => ({
      id: (i + 1).toString(),
      name: '',
      classSection: '',
      violation: '',
      action: '',
      notes: ''
    }))
  );

  // دالة إضافة موظف مناوب
  const addDutyOfficer = () => {
    const newOfficer = {
      id: Date.now().toString(),
      name: '',
      signature: '',
      notes: ''
    };
    setDutyOfficers([...dutyOfficers, newOfficer]);
  };

  // دالة حذف موظف مناوب
  const removeDutyOfficer = (id: string) => {
    setDutyOfficers(dutyOfficers.filter(officer => officer.id !== id));
  };

  // دالة تحديث بيانات موظف مناوب
  const updateDutyOfficer = (id: string, field: string, value: string) => {
    setDutyOfficers(prev => 
      prev.map(officer => 
        officer.id === id ? { ...officer, [field]: value } : officer
      )
    );
  };

  // دالة إضافة طالب متأخر
  const addLateStudent = () => {
    const newStudent = {
      id: Date.now().toString(),
      name: '',
      classSection: '',
      leaveTime: '',
      action: '',
      notes: ''
    };
    setLateStudents([...lateStudents, newStudent]);
  };

  // دالة حذف طالب متأخر
  const removeLateStudent = (id: string) => {
    if (lateStudents.length > 1) {
      setLateStudents(lateStudents.filter(student => student.id !== id));
    }
  };

  // دالة تحديث بيانات طالب متأخر
  const updateLateStudent = (id: string, field: string, value: string) => {
    setLateStudents(prev => 
      prev.map(student => 
        student.id === id ? { ...student, [field]: value } : student
      )
    );
  };

  // دالة إضافة طالب مخالف
  const addViolatingStudent = () => {
    const newStudent = {
      id: Date.now().toString(),
      name: '',
      classSection: '',
      violation: '',
      action: '',
      notes: ''
    };
    setViolatingStudents([...violatingStudents, newStudent]);
  };

  // دالة حذف طالب مخالف
  const removeViolatingStudent = (id: string) => {
    if (violatingStudents.length > 1) {
      setViolatingStudents(violatingStudents.filter(student => student.id !== id));
    }
  };

  // دالة تحديث بيانات طالب مخالف
  const updateViolatingStudent = (id: string, field: string, value: string) => {
    setViolatingStudents(prev => 
      prev.map(student => 
        student.id === id ? { ...student, [field]: value } : student
      )
    );
  };

  // دالة الطباعة
  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>تقرير المناوبة اليومي</title>
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
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border-radius: 12px;
          }
          
          .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 15px;
          }
          
          .header-info {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
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
          
          .info-value {
            padding: 8px 16px;
            border: 2px solid rgba(255, 255, 255, 0.4);
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.15);
            color: white;
            font-size: 16px;
            font-weight: 600;
            min-width: 120px;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .section {
            margin: 30px 0;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #3b82f6;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
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
            min-height: 50px;
          }
          
          .footer-notes {
            margin: 30px 0;
            padding: 20px;
            background: #fef9c3;
            border: 1px solid #eab308;
            border-radius: 8px;
          }
          
          .footer-notes ul {
            list-style: none;
            padding: 0;
          }
          
          .footer-notes li {
            margin: 5px 0;
            color: #92400e;
            font-weight: 500;
          }
          
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding: 20px 0;
          }
          
          .signature-box {
            text-align: center;
            width: 200px;
          }
          
          .signature-title {
            font-weight: 600;
            margin-bottom: 30px;
            color: #374151;
          }
          
          .signature-line {
            border-top: 1px solid #6b7280;
            margin-top: 20px;
            padding-top: 5px;
            font-size: 12px;
            color: #6b7280;
          }
          
          @media print {
            body { margin: 0; padding: 15px; }
            .header { margin-bottom: 20px; padding: 15px; }
            th, td { padding: 8px 6px; font-size: 12px; }
            .section { margin: 20px 0; }
            .signature-section { margin-top: 30px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير المناوبة اليومي</h1>
          <div class="header-info">
            <div class="info-item">
              <label>الفصل الدراسي:</label>
              <div class="info-value">${semester}</div>
            </div>
            <div class="info-item">
              <label>العام الدراسي:</label>
              <div class="info-value">${academicYear}</div>
            </div>
            <div class="info-item">
              <label>اليوم:</label>
              <div class="info-value">${day}</div>
            </div>
            <div class="info-item">
              <label>التاريخ:</label>
              <div class="info-value">${date}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">الموظف المناوب</div>
          <table>
            <thead>
              <tr>
                <th>م</th>
                <th>اسم الموظف المناوب</th>
                <th>التوقيع</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${dutyOfficers.map((officer, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${officer.name}</td>
                  <td></td>
                  <td>${officer.notes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">أسماء الطلاب المتأخرين</div>
          <table>
            <thead>
              <tr>
                <th>م</th>
                <th>الاسم</th>
                <th>الصف والفصل</th>
                <th>وقت الانصراف</th>
                <th>الاجراء المتخذ</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${lateStudents.map((student, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${student.name}</td>
                  <td>${student.classSection}</td>
                  <td>${student.leaveTime}</td>
                  <td>${student.action}</td>
                  <td>${student.notes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">أسماء الطلاب المخالفين</div>
          <table>
            <thead>
              <tr>
                <th>م</th>
                <th>الاسم</th>
                <th>الصف والفصل</th>
                <th>المخالفة</th>
                <th>الاجراء المتخذ</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${violatingStudents.map((student, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${student.name}</td>
                  <td>${student.classSection}</td>
                  <td>${student.violation}</td>
                  <td>${student.action}</td>
                  <td>${student.notes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="footer-notes">
          <ul>
            <li>* يسلم هذا التقرير في اليوم التالي للمناوبة إلى وكيل المدرسة للشؤون التعليمية</li>
            <li>* يوضع التقرير في ملف المناوبة</li>
          </ul>
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-title">وكيل الشؤون التعليمية</div>
            <div class="signature-line">الاسم والتوقيع</div>
          </div>
          <div class="signature-box">
            <div class="signature-title">مدير المدرسة</div>
            <div class="signature-line">الاسم والتوقيع</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-kufi" style={{ direction: 'rtl' }}>

      {/* النموذج الرئيسي */}
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <FileText className="h-6 w-6 ml-2" />
                تقرير المناوبة اليومي
              </CardTitle>
              <Button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Printer className="h-4 w-4 ml-2" />
                طباعة التقرير
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* معلومات رأس التقرير */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <Label htmlFor="semester">الفصل الدراسي</Label>
                <Input
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="academicYear">العام الدراسي</Label>
                <Input
                  id="academicYear"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="day" className="text-sm font-semibold text-gray-700">اليوم</Label>
                <Input
                  id="day"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="مثال: الأحد"
                  className="text-lg font-medium border-2 border-gray-300 focus:border-indigo-500"
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-sm font-semibold text-gray-700">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-lg font-medium border-2 border-gray-300 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* جدول الموظفين المناوبين */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-900">الموظف المناوب</h3>
                <Button
                  onClick={addDutyOfficer}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة موظف
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-gray-300 p-3 text-center w-16">م</th>
                      <th className="border border-gray-300 p-3 text-center">اسم الموظف المناوب</th>
                      <th className="border border-gray-300 p-3 text-center w-32">التوقيع</th>
                      <th className="border border-gray-300 p-3 text-center">ملاحظات</th>
                      <th className="border border-gray-300 p-3 text-center w-20">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dutyOfficers.map((officer, index) => (
                      <tr key={officer.id}>
                        <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={officer.name}
                            onChange={(e) => updateDutyOfficer(officer.id, 'name', e.target.value)}
                            placeholder="اسم الموظف"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center text-gray-400">
                          (للتوقيع اليدوي)
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Textarea
                            value={officer.notes}
                            onChange={(e) => updateDutyOfficer(officer.id, 'notes', e.target.value)}
                            placeholder="ملاحظات"
                            rows={2}
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {dutyOfficers.length > 1 && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeDutyOfficer(officer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* جدول الطلاب المتأخرين */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-900">أسماء الطلاب المتأخرين</h3>
                <Button
                  onClick={addLateStudent}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة طالب
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-red-50">
                      <th className="border border-gray-300 p-3 text-center w-16">م</th>
                      <th className="border border-gray-300 p-3 text-center">الاسم</th>
                      <th className="border border-gray-300 p-3 text-center">الصف والفصل</th>
                      <th className="border border-gray-300 p-3 text-center">وقت الانصراف</th>
                      <th className="border border-gray-300 p-3 text-center">الاجراء المتخذ</th>
                      <th className="border border-gray-300 p-3 text-center">ملاحظات</th>
                      <th className="border border-gray-300 p-3 text-center w-20">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lateStudents.map((student, index) => (
                      <tr key={student.id}>
                        <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={student.name}
                            onChange={(e) => updateLateStudent(student.id, 'name', e.target.value)}
                            placeholder="اسم الطالب"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={student.classSection}
                            onChange={(e) => updateLateStudent(student.id, 'classSection', e.target.value)}
                            placeholder="مثال: 3/1"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            type="time"
                            value={student.leaveTime}
                            onChange={(e) => updateLateStudent(student.id, 'leaveTime', e.target.value)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={student.action}
                            onChange={(e) => updateLateStudent(student.id, 'action', e.target.value)}
                            placeholder="الإجراء المتخذ"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Textarea
                            value={student.notes}
                            onChange={(e) => updateLateStudent(student.id, 'notes', e.target.value)}
                            placeholder="ملاحظات"
                            rows={2}
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {lateStudents.length > 1 && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeLateStudent(student.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* جدول الطلاب المخالفين */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-900">أسماء الطلاب المخالفين</h3>
                <Button
                  onClick={addViolatingStudent}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة طالب
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-yellow-50">
                      <th className="border border-gray-300 p-3 text-center w-16">م</th>
                      <th className="border border-gray-300 p-3 text-center">الاسم</th>
                      <th className="border border-gray-300 p-3 text-center">الصف والفصل</th>
                      <th className="border border-gray-300 p-3 text-center">المخالفة</th>
                      <th className="border border-gray-300 p-3 text-center">الاجراء المتخذ</th>
                      <th className="border border-gray-300 p-3 text-center">ملاحظات</th>
                      <th className="border border-gray-300 p-3 text-center w-20">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violatingStudents.map((student, index) => (
                      <tr key={student.id}>
                        <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={student.name}
                            onChange={(e) => updateViolatingStudent(student.id, 'name', e.target.value)}
                            placeholder="اسم الطالب"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={student.classSection}
                            onChange={(e) => updateViolatingStudent(student.id, 'classSection', e.target.value)}
                            placeholder="مثال: 3/1"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={student.violation}
                            onChange={(e) => updateViolatingStudent(student.id, 'violation', e.target.value)}
                            placeholder="نوع المخالفة"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={student.action}
                            onChange={(e) => updateViolatingStudent(student.id, 'action', e.target.value)}
                            placeholder="الإجراء المتخذ"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Textarea
                            value={student.notes}
                            onChange={(e) => updateViolatingStudent(student.id, 'notes', e.target.value)}
                            placeholder="ملاحظات"
                            rows={2}
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {violatingStudents.length > 1 && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeViolatingStudent(student.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ملاحظات تذييل الصفحة */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border-2 border-amber-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-amber-500 rounded-full p-2 ml-3">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-bold text-amber-800 text-lg">ملاحظات مهمة</h4>
              </div>
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <ul className="text-sm text-amber-700 space-y-2 font-medium">
                  <li className="flex items-start">
                    <span className="text-amber-600 font-bold ml-2">•</span>
                    يسلم هذا التقرير في اليوم التالي للمناوبة إلى وكيل المدرسة للشؤون التعليمية
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 font-bold ml-2">•</span>
                    يوضع التقرير في ملف المناوبة
                  </li>
                </ul>
              </div>
            </div>

            {/* التوقيعات النهائية */}
            <div className="flex justify-between pt-6 border-t">
              <div className="text-center">
                <div className="mb-4">
                  <Label>وكيل الشؤون التعليمية</Label>
                  <div className="mt-2 w-48 h-16 border border-gray-300 rounded bg-gray-50"></div>
                </div>
                <div className="border-t border-gray-400 pt-2 text-sm text-gray-600">
                  الاسم والتوقيع
                </div>
              </div>
              <div className="text-center">
                <div className="mb-4">
                  <Label>مدير المدرسة</Label>
                  <div className="mt-2 w-48 h-16 border border-gray-300 rounded bg-gray-50"></div>
                </div>
                <div className="border-t border-gray-400 pt-2 text-sm text-gray-600">
                  الاسم والتوقيع
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyDutyReportPage;
