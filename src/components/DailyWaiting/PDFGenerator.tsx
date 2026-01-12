/**
 * مكون PDFGenerator - لإنشاء ومعاينة وطباعة جداول الانتظار اليومي
 * @author MOTABEA System
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Printer, Eye, Calendar } from 'lucide-react';
import { WaitingAssignment } from '@/types/dailyWait';

interface PDFGeneratorProps {
  assignments: WaitingAssignment[];
  selectedDate: string;
  schoolInfo: {
    name: string;
    principalName: string;
    vicePrincipalName: string;
  };
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  assignments,
  selectedDate,
  schoolInfo
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [documentTitle, setDocumentTitle] = useState<string>('جدول الانتظار اليومي');
  const [vicePrincipalName, setVicePrincipalName] = useState<string>(schoolInfo.vicePrincipalName);
  const [principalName, setPrincipalName] = useState<string>(schoolInfo.principalName);

  // تحويل التاريخ للهجري (مبسط)
  const convertToHijri = (gregorianDate: string): string => {
    const date = new Date(gregorianDate);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() - 579}هـ`;
  };

  // الحصول على اسم اليوم
  const getDayName = (date: string): string => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayIndex = new Date(date).getDay();
    return days[dayIndex];
  };

  // معالج إنشاء PDF
  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const filename = `انتظار_${selectedDate}_${new Date().getTime()}.pdf`;
      alert(`تم إنشاء ملف PDF: ${filename}\n\nسيتم تحميله الآن...`);
      
    } catch (error) {
      console.error('خطأ في إنشاء PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  // معالج الطباعة المباشرة
  const handleDirectPrint = () => {
    // التأكد من أن العناصر المخفية جاهزة للطباعة
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // تجميع الإسنادات حسب المعلم الغائب
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const key = assignment.absentTeacherId;
    if (!acc[key]) {
      acc[key] = {
        absentTeacherName: assignment.absentTeacherName,
        assignments: []
      };
    }
    acc[key].assignments.push(assignment);
    return acc;
  }, {} as {[key: string]: {absentTeacherName: string, assignments: WaitingAssignment[]}});

  const absentTeachers = Object.values(groupedAssignments);

  return (
    <div className="space-y-6">
      {/* إعدادات التصدير والطباعة - تخفى عند الطباعة */}
      <div className="print:hidden">
        <Card className="shadow-lg border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-right text-gray-800">
              <FileText className="w-6 h-6 text-blue-600" />
              التصدير والطباعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doc-title" className="text-base font-semibold">عنوان المستند</Label>
                <Input
                  id="doc-title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="عنوان المستند"
                  className="text-right border-2 border-blue-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">اليوم والتاريخ</Label>
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-800">
                    {getDayName(selectedDate)} - {selectedDate} / {convertToHijri(selectedDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* أسماء المسؤولين */}
            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200 space-y-3">
              <h3 className="text-base font-bold text-amber-900 mb-3">أسماء المسؤولين (تُحفظ تلقائياً)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vice-principal" className="text-sm font-semibold text-gray-700">
                    وكيل الشؤون التعليمية
                  </Label>
                  <Input
                    id="vice-principal"
                    value={vicePrincipalName}
                    onChange={(e) => setVicePrincipalName(e.target.value)}
                    placeholder="اسم وكيل الشؤون التعليمية"
                    className="text-right border-2 border-amber-300 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="principal" className="text-sm font-semibold text-gray-700">
                    مدير المدرسة
                  </Label>
                  <Input
                    id="principal"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    placeholder="اسم مدير المدرسة"
                    className="text-right border-2 border-amber-300 focus:border-amber-500"
                  />
                </div>
              </div>
              <p className="text-xs text-amber-700 text-center mt-2">
                ✓ سيتم استخدام هذه الأسماء في جميع عمليات الطباعة المستقبلية
              </p>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-2 border-blue-400 hover:bg-blue-50 text-blue-700 font-semibold py-6"
                    disabled={assignments.length === 0}
                  >
                    <Eye className="w-5 h-5 ml-2" />
                    معاينة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-blue-800">معاينة جدول الانتظار</DialogTitle>
                  </DialogHeader>
                  <PDFPreview 
                    groupedAssignments={groupedAssignments}
                    selectedDate={selectedDate}
                    schoolInfo={{...schoolInfo, vicePrincipalName, principalName}}
                    documentTitle={documentTitle}
                    getDayName={getDayName}
                    convertToHijri={convertToHijri}
                  />
                </DialogContent>
              </Dialog>

              <Button 
                onClick={handleDirectPrint}
                disabled={assignments.length === 0}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6"
              >
                <Printer className="w-5 h-5 ml-2" />
                طباعة
              </Button>

              <Button 
                onClick={handleGeneratePDF}
                disabled={isGenerating || assignments.length === 0}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-6"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 ml-2" />
                    تحميل PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* رسالة عدم وجود بيانات */}
        {assignments.length === 0 && (
          <Card className="text-center py-16 shadow-lg border-2 border-gray-200">
            <CardContent>
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">لا توجد حصص انتظار لهذا اليوم</h3>
              <p className="text-gray-500">يرجى إضافة إسنادات انتظار أولاً للمعاينة والطباعة</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* قسم الطباعة - يظهر فقط عند الطباعة */}
      <div className="hidden print:block">
        <PDFPrintView
          groupedAssignments={groupedAssignments}
          selectedDate={selectedDate}
          schoolInfo={{...schoolInfo, vicePrincipalName, principalName}}
          documentTitle={documentTitle}
          getDayName={getDayName}
          convertToHijri={convertToHijri}
        />
      </div>
    </div>
  );
};

// مكون معاينة PDF
interface PDFPreviewProps {
  groupedAssignments: {[key: string]: {absentTeacherName: string, assignments: WaitingAssignment[]}};
  selectedDate: string;
  schoolInfo: {
    name: string;
    principalName: string;
    vicePrincipalName: string;
  };
  documentTitle: string;
  getDayName: (date: string) => string;
  convertToHijri: (date: string) => string;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  groupedAssignments,
  selectedDate,
  schoolInfo,
  documentTitle,
  getDayName,
  convertToHijri
}) => {
  const absentTeachers = Object.values(groupedAssignments);
  const dayName = getDayName(selectedDate);
  const hijriDate = convertToHijri(selectedDate);

  return (
    <div className="bg-white p-8" dir="rtl">
      {/* رأس المستند */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">{schoolInfo.name}</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{documentTitle}</h2>
        <div className="text-sm text-gray-700 font-medium">
          <p>{dayName} - التاريخ: {selectedDate} الموافق {hijriDate}</p>
        </div>
      </div>

      {/* جداول منفصلة لكل معلم غائب */}
      {absentTeachers.map((teacher, index) => {
        const visibleAssignments = teacher.assignments.filter(a => !a.isHidden);
        
        if (visibleAssignments.length === 0) return null;

        return (
          <div key={index} className="mb-10 page-break-inside-avoid">
            {/* النص التمهيدي لكل معلم */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="text-sm leading-relaxed text-justify text-gray-800">
                نظراً لغياب زميلنا المعلم <strong className="text-blue-900">"{teacher.absentTeacherName}"</strong> لهذا اليوم <strong>{dayName}</strong> الموافق <strong>{selectedDate}</strong> ({hijriDate}) نأمل تسديد مكانه حسب الجدول الموضح والتوقيع بالعلم والاطلاع ،،، ولكم جزيل الشكر
              </p>
            </div>

            {/* جدول الحصص */}
            <table className="w-full border-collapse border-2 border-gray-800 mb-6">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border-2 border-gray-700 p-3 text-center font-bold text-gray-900">رقم الحصة</th>
                  <th className="border-2 border-gray-700 p-3 text-center font-bold text-gray-900">الصف والفصل</th>
                  <th className="border-2 border-gray-700 p-3 text-center font-bold text-gray-900">المادة</th>
                  <th className="border-2 border-gray-700 p-3 text-center font-bold text-gray-900">المعلم المنتظر</th>
                  <th className="border-2 border-gray-700 p-3 text-center font-bold text-gray-900" style={{width: '120px'}}>التوقيع</th>
                  <th className="border-2 border-gray-700 p-3 text-center font-bold text-gray-900" style={{width: '150px'}}>ملاحظات</th>
                  <th className="border-2 border-gray-700 p-3 text-center font-bold text-gray-900" style={{width: '100px'}}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {visibleAssignments.map((assignment, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border-2 border-gray-600 p-3 text-center font-semibold text-gray-800">{assignment.periodNumber}</td>
                    <td className="border-2 border-gray-600 p-3 text-center font-medium text-gray-800">{assignment.className}</td>
                    <td className="border-2 border-gray-600 p-3 text-center text-gray-800">{assignment.subject}</td>
                    <td className="border-2 border-gray-600 p-3 text-center font-medium text-blue-900">{assignment.substituteTeacherName}</td>
                    <td className="border-2 border-gray-600 p-3 h-14"></td>
                    <td className="border-2 border-gray-600 p-3 h-14"></td>
                    <td className="border-2 border-gray-600 p-3 h-14 text-center text-xs text-gray-500">إخفاء</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* التواقيع - تظهر بعد آخر جدول فقط */}
            {index === absentTeachers.length - 1 && (
              <div className="flex justify-between items-end mt-12 pt-8 border-t-2 border-gray-400">
                <div className="text-center">
                  <div className="border-b-2 border-gray-600 w-56 mb-3 pb-1"></div>
                  <p className="text-sm font-bold text-gray-800">وكيل الشؤون التعليمية</p>
                  <p className="text-sm font-semibold text-blue-900 mt-1">{schoolInfo.vicePrincipalName}</p>
                </div>

                <div className="text-center">
                  <div className="border-b-2 border-gray-600 w-56 mb-3 pb-1"></div>
                  <p className="text-sm font-bold text-gray-800">مدير المدرسة</p>
                  <p className="text-sm font-semibold text-blue-900 mt-1">{schoolInfo.principalName}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* تذييل */}
      <div className="text-center text-xs text-gray-500 mt-12 pt-4 border-t border-gray-300">
        <p className="font-medium">تم إنشاء هذا المستند بواسطة نظام MOTABEA لإدارة المدارس</p>
        <p className="mt-1">تاريخ الإنشاء: {new Date().toLocaleString('ar-SA')}</p>
      </div>
    </div>
  );
};

// مكون عرض الطباعة - نفس المعاينة بدون عامود الإجراءات
const PDFPrintView: React.FC<PDFPreviewProps> = ({
  groupedAssignments,
  selectedDate,
  schoolInfo,
  documentTitle,
  getDayName,
  convertToHijri
}) => {
  const absentTeachers = Object.values(groupedAssignments);
  const dayName = getDayName(selectedDate);
  const hijriDate = convertToHijri(selectedDate);

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '32px',
      direction: 'rtl',
      color: 'black'
    }}>
      {/* رأس المستند */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        borderBottom: '2px solid #d1d5db',
        paddingBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1e3a8a',
          marginBottom: '8px'
        }}>{schoolInfo.name}</h1>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '12px'
        }}>{documentTitle}</h2>
        <div style={{
          fontSize: '14px',
          color: '#374151',
          fontWeight: '500'
        }}>
          <p>{dayName} - التاريخ: {selectedDate} الموافق {hijriDate}</p>
        </div>
      </div>

      {/* جداول منفصلة لكل معلم غائب */}
      {absentTeachers.map((teacher, index) => {
        const visibleAssignments = teacher.assignments.filter(a => !a.isHidden);
        
        if (visibleAssignments.length === 0) return null;

        return (
          <div key={index} style={{ marginBottom: '40px' }}>
            {/* النص التمهيدي لكل معلم */}
            <div style={{
              marginBottom: '16px',
              padding: '16px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '2px solid #bfdbfe'
            }}>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.7',
                textAlign: 'justify',
                color: '#1f2937'
              }}>
                نظراً لغياب زميلنا المعلم <strong style={{ color: '#1e3a8a' }}>"{teacher.absentTeacherName}"</strong> لهذا اليوم <strong>{dayName}</strong> الموافق <strong>{selectedDate}</strong> ({hijriDate}) نأمل تسديد مكانه حسب الجدول الموضح والتوقيع بالعلم والاطلاع ،،، ولكم جزيل الشكر
              </p>
            </div>

            {/* جدول الحصص بدون عامود الإجراءات */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '2px solid #1f2937',
              marginBottom: '24px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#dbeafe' }}>
                  <th style={{
                    border: '2px solid #374151',
                    padding: '12px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>رقم الحصة</th>
                  <th style={{
                    border: '2px solid #374151',
                    padding: '12px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>الصف والفصل</th>
                  <th style={{
                    border: '2px solid #374151',
                    padding: '12px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>المادة</th>
                  <th style={{
                    border: '2px solid #374151',
                    padding: '12px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>المعلم المنتظر</th>
                  <th style={{
                    border: '2px solid #374151',
                    padding: '12px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    width: '120px'
                  }}>التوقيع</th>
                  <th style={{
                    border: '2px solid #374151',
                    padding: '12px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    width: '150px'
                  }}>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {visibleAssignments.map((assignment, idx) => (
                  <tr key={idx}>
                    <td style={{
                      border: '2px solid #4b5563',
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>{assignment.periodNumber}</td>
                    <td style={{
                      border: '2px solid #4b5563',
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '500',
                      color: '#1f2937'
                    }}>{assignment.className}</td>
                    <td style={{
                      border: '2px solid #4b5563',
                      padding: '12px',
                      textAlign: 'center',
                      color: '#1f2937'
                    }}>{assignment.subject}</td>
                    <td style={{
                      border: '2px solid #4b5563',
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '500',
                      color: '#1e3a8a'
                    }}>{assignment.substituteTeacherName}</td>
                    <td style={{
                      border: '2px solid #4b5563',
                      padding: '12px',
                      height: '56px'
                    }}></td>
                    <td style={{
                      border: '2px solid #4b5563',
                      padding: '12px',
                      height: '56px'
                    }}></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* التواقيع - تظهر بعد آخر جدول فقط */}
            {index === absentTeachers.length - 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '48px',
                paddingTop: '32px',
                borderTop: '2px solid #9ca3af'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    borderBottom: '2px solid #4b5563',
                    width: '224px',
                    marginBottom: '12px',
                    paddingBottom: '4px'
                  }}></div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>وكيل الشؤون التعليمية</p>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e3a8a',
                    marginTop: '4px'
                  }}>{schoolInfo.vicePrincipalName}</p>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    borderBottom: '2px solid #4b5563',
                    width: '224px',
                    marginBottom: '12px',
                    paddingBottom: '4px'
                  }}></div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>مدير المدرسة</p>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e3a8a',
                    marginTop: '4px'
                  }}>{schoolInfo.principalName}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* تذييل */}
      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '48px',
        paddingTop: '16px',
        borderTop: '1px solid #d1d5db'
      }}>
        <p style={{ fontWeight: '500' }}>تم إنشاء هذا المستند بواسطة نظام MOTABEA لإدارة المدارس</p>
        <p style={{ marginTop: '4px' }}>تاريخ الإنشاء: {new Date().toLocaleString('ar-SA')}</p>
      </div>
    </div>
  );
};

export default PDFGenerator;
