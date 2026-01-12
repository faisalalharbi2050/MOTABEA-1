import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Download, Filter, Search, User, Clock, FileText, Bell, CheckCircle, TrendingUp, BarChart3, ArrowRight, X, Users } from 'lucide-react';
import { WaitingAssignment } from '@/types/dailyWait';
import jsPDF from 'jspdf';

// تعريف نوع jsPDF مع autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

interface NotificationHistoryPageProps {
  assignments: WaitingAssignment[];
  onBack: () => void;
}

const NotificationHistoryPage: React.FC<NotificationHistoryPageProps> = ({ assignments, onBack }) => {
  // الفلاتر
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [showStaffDropdown, setShowStaffDropdown] = useState<boolean>(false);
  
  // بيانات جميع الموظفين (معلمين + إداريين)
  const mockTeachers = [
    { id: '1', name: 'أحمد محمد علي', type: 'teacher' },
    { id: '2', name: 'فاطمة أحمد السلمي', type: 'teacher' },
    { id: '3', name: 'محمد سالم القحطاني', type: 'teacher' },
    { id: '4', name: 'نورا عبدالله المطيري', type: 'teacher' },
    { id: '5', name: 'خالد سعد الغامدي', type: 'teacher' },
    { id: '6', name: 'سارة عبدالرحمن الدوسري', type: 'teacher' },
    { id: '7', name: 'عبدالعزيز ناصر الشهري', type: 'teacher' },
    { id: '8', name: 'منى سليمان العتيبي', type: 'teacher' }
  ];
  
  const mockAdminStaff = [
    { id: 'admin1', name: 'عبدالله محمد السلمي', type: 'admin' },
    { id: 'admin2', name: 'أحمد سالم القحطاني', type: 'admin' },
    { id: 'admin3', name: 'فهد عبدالعزيز المطيري', type: 'admin' },
    { id: 'admin4', name: 'خالد حسن الغامدي', type: 'admin' },
    { id: 'admin5', name: 'سعد عبدالرحمن الدوسري', type: 'admin' }
  ];
  
  const allStaff = [...mockTeachers, ...mockAdminStaff];

  // تصفية الإشعارات حسب الفلاتر
  const filteredAssignments = useMemo(() => {
    let filtered = [...assignments].filter(a => a.isNotificationSent);

    // البحث النصي
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(a => 
        a.substituteTeacherName?.toLowerCase().includes(term) ||
        a.absentTeacherName?.toLowerCase().includes(term) ||
        a.className?.toLowerCase().includes(term) ||
        a.subject?.toLowerCase().includes(term)
      );
    }

    // تصفية حسب الموظفين المحددين
    if (selectedStaffIds.length > 0) {
      filtered = filtered.filter(a => selectedStaffIds.includes(a.substituteTeacherId));
    }

    // تصفية حسب الفترة الزمنية
    if (filterPeriod !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filterPeriod === 'today') {
        filtered = filtered.filter(a => {
          const assignmentDate = new Date(a.date);
          assignmentDate.setHours(0, 0, 0, 0);
          return assignmentDate.getTime() === today.getTime();
        });
      } else if (filterPeriod === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(a => {
          const assignmentDate = new Date(a.date);
          return assignmentDate >= weekStart && assignmentDate <= weekEnd;
        });
      } else if (filterPeriod === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(a => {
          const assignmentDate = new Date(a.date);
          return assignmentDate >= monthStart && assignmentDate <= monthEnd;
        });
      } else if (filterPeriod === 'custom' && dateFrom && dateTo) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(a => {
          const assignmentDate = new Date(a.date);
          return assignmentDate >= from && assignmentDate <= to;
        });
      }
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [assignments, searchTerm, selectedStaffIds, filterPeriod, dateFrom, dateTo]);

  // إحصائيات
  const stats = useMemo(() => {
    // حساب عدد الأيام التي تم فيها تنفيذ انتظار فعلي (يوجد فيها إسنادات مرسلة)
    const allAssignments = assignments.filter(a => a.isNotificationSent);
    const uniqueDaysWithWaiting = new Set(allAssignments.map(a => a.date)).size;
    
    return {
      total: filteredAssignments.length,
      teachers: new Set(filteredAssignments.map(a => a.substituteTeacherId)).size,
      days: uniqueDaysWithWaiting, // عدد الأيام التي تم فيها تنفيذ انتظار
      confirmed: filteredAssignments.filter(a => a.isConfirmedBySubstitute).length
    };
  }, [filteredAssignments, assignments]);

  // طباعة PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // إضافة الخط العربي
    doc.setFont('Arial', 'normal');
    doc.setR2L(true);

    // العنوان
    doc.setFontSize(20);
    doc.text('سجل إشعارات الانتظار', doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // المعلومات العامة
    doc.setFontSize(12);
    let yPos = 35;
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, doc.internal.pageSize.width - 20, yPos, { align: 'right' });
    yPos += 8;
    doc.text(`الفترة: ${getPeriodLabel(filterPeriod)}`, doc.internal.pageSize.width - 20, yPos, { align: 'right' });
    yPos += 8;
    doc.text(`عدد الإشعارات: ${stats.total}`, doc.internal.pageSize.width - 20, yPos, { align: 'right' });
    yPos += 8;
    doc.text(`عدد الموظفين: ${stats.teachers}`, doc.internal.pageSize.width - 20, yPos, { align: 'right' });

    // الجدول
    const tableData = filteredAssignments.map((a, index) => [
      (index + 1).toString(),
      a.date,
      a.substituteTeacherName,
      a.absentTeacherName,
      a.className,
      a.subject,
      a.periodNumber.toString(),
      a.isConfirmedBySubstitute ? 'تم التوقيع' : 'في الانتظار'
    ]);

    doc.autoTable({
      startY: yPos + 10,
      head: [['#', 'التاريخ', 'الموظف المنتظر', 'الموظف الغائب', 'الفصل', 'المادة', 'الحصة', 'الحالة']],
      body: tableData,
      styles: {
        font: 'Arial',
        halign: 'center',
        fontSize: 10
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255]
      },
      margin: { top: 10, right: 10, bottom: 10, left: 10 }
    });

    // الحفظ
    const fileName = `سجل_الإشعارات_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const getPeriodLabel = (period: string): string => {
    const labels: { [key: string]: string } = {
      'all': 'الكل',
      'today': 'اليوم',
      'week': 'هذا الأسبوع',
      'month': 'هذا الشهر',
      'custom': 'فترة مخصصة'
    };
    return labels[period] || 'الكل';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* زر العودة */}
        <Button
          onClick={onBack}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-lg font-semibold"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          عودة
        </Button>
        
        {/* العنوان */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">سجل الإشعارات</h1>
            <p className="text-gray-600">سجل شامل لجميع الإشعارات المرسلة</p>
          </div>
        </div>

        {/* البطاقات الإحصائية المحسّنة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* بطاقة إجمالي الإشعارات */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-600 mb-1">إجمالي الإشعارات</p>
                <p className="text-4xl font-extrabold text-blue-900">{stats.total}</p>
                <p className="text-xs text-blue-600 mt-1">إشعار مرسل</p>
              </div>
              <div className="p-4 bg-blue-200 rounded-xl">
                <Bell className="w-10 h-10 text-blue-700" />
              </div>
            </div>
          </div>

          {/* بطاقة عدد الموظفين */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold text-green-600 mb-1">عدد الموظفين</p>
                <p className="text-4xl font-extrabold text-green-900">{stats.teachers}</p>
                <p className="text-xs text-green-600 mt-1">موظف مستلم</p>
              </div>
              <div className="p-4 bg-green-200 rounded-xl">
                <User className="w-10 h-10 text-green-700" />
              </div>
            </div>
          </div>

          {/* بطاقة عدد الأيام */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold text-orange-600 mb-1">أيام الانتظار</p>
                <p className="text-4xl font-extrabold text-orange-900">{stats.days}</p>
                <p className="text-xs text-orange-600 mt-1">يوم عمل انتظار</p>
              </div>
              <div className="p-4 bg-orange-200 rounded-xl">
                <Calendar className="w-10 h-10 text-orange-700" />
              </div>
            </div>
          </div>

          {/* بطاقة تم التوقيع */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold text-purple-600 mb-1">تم التوقيع</p>
                <p className="text-4xl font-extrabold text-purple-900">{stats.confirmed}</p>
                <p className="text-xs text-purple-600 mt-1">موقّع ومؤكد</p>
              </div>
              <div className="p-4 bg-purple-200 rounded-xl">
                <CheckCircle className="w-10 h-10 text-purple-700" />
              </div>
            </div>
          </div>
        </div>

        {/* الفلاتر */}
        <Card className="shadow-lg border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-right">
              <Filter className="w-6 h-6 text-blue-600" />
              فلاتر البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* البحث */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">بحث عام</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="ابحث في الإشعارات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 text-right border-2 border-gray-300 focus:border-blue-500"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              {/* الفترة الزمنية */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">الفترة الزمنية</Label>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="text-right border-2 border-gray-300 bg-white hover:border-blue-400 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-300 shadow-xl">
                    <SelectItem value="all" className="hover:bg-blue-50">الكل</SelectItem>
                    <SelectItem value="today" className="hover:bg-blue-50">اليوم</SelectItem>
                    <SelectItem value="week" className="hover:bg-blue-50">هذا الأسبوع</SelectItem>
                    <SelectItem value="month" className="hover:bg-blue-50">هذا الشهر</SelectItem>
                    <SelectItem value="custom" className="hover:bg-blue-50">فترة مخصصة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* الموظفون - اختيار متعدد */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  الموظفون ({selectedStaffIds.length} محدد)
                </Label>
                <div className="relative">
                  <Button
                    onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                    variant="outline"
                    className="w-full justify-between text-right border-2 border-gray-300 bg-white hover:border-blue-400 transition-colors"
                  >
                    <span className="text-gray-700">
                      {selectedStaffIds.length === 0 
                        ? 'جميع الموظفين' 
                        : selectedStaffIds.length === allStaff.length
                        ? 'الكل محدد'
                        : `${selectedStaffIds.length} موظف محدد`}
                    </span>
                    <Users className="w-4 h-4 text-gray-500" />
                  </Button>
                  
                  {showStaffDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
                      {/* أزرار التحكم */}
                      <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b-2 border-gray-200 flex gap-2">
                        <Button
                          onClick={() => setSelectedStaffIds(allStaff.map(s => s.id))}
                          size="sm"
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          تحديد الكل
                        </Button>
                        <Button
                          onClick={() => setSelectedStaffIds([])}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-2 border-red-400 text-red-600 hover:bg-red-50"
                        >
                          إلغاء الكل
                        </Button>
                        <Button
                          onClick={() => setShowStaffDropdown(false)}
                          size="sm"
                          variant="ghost"
                          className="px-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* قائمة الموظفين */}
                      <div className="p-2">
                        {allStaff.map((staff) => {
                          const isSelected = selectedStaffIds.includes(staff.id);
                          return (
                            <div
                              key={staff.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedStaffIds(prev => prev.filter(id => id !== staff.id));
                                } else {
                                  setSelectedStaffIds(prev => [...prev, staff.id]);
                                }
                              }}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-blue-100 border-2 border-blue-400' 
                                  : 'hover:bg-gray-50 border-2 border-transparent'
                              }`}
                            >
                              <Checkbox
                                checked={isSelected}
                                className="w-5 h-5"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-sm">{staff.name}</p>
                                <p className="text-xs text-gray-600">
                                  {staff.type === 'teacher' ? 'معلم' : 'إداري'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* إعادة تعيين الفلاتر */}
              <div className="space-y-2 flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setDateFrom('');
                    setDateTo('');
                    setFilterPeriod('all');
                    setSelectedStaffIds([]);
                    setShowStaffDropdown(false);
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <X className="w-4 h-4 ml-2" />
                  إعادة تعيين
                </Button>
              </div>
            </div>

            {/* فترة مخصصة */}
            {filterPeriod === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2 border-gray-200">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">من تاريخ</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-right border-2 border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">إلى تاريخ</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-right border-2 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* جدول النتائج */}
        <Card className="shadow-lg border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center justify-between text-right">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                نتائج البحث ({filteredAssignments.length})
              </div>
              <Button
                onClick={generatePDF}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={filteredAssignments.length === 0}
              >
                <Download className="w-5 h-5 ml-2" />
                طباعة PDF
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filteredAssignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="border border-gray-300 p-3 text-right font-bold text-gray-700">#</th>
                      <th className="border border-gray-300 p-3 text-right font-bold text-gray-700">التاريخ</th>
                      <th className="border border-gray-300 p-3 text-right font-bold text-gray-700">الموظف المنتظر</th>
                      <th className="border border-gray-300 p-3 text-right font-bold text-gray-700">الموظف الغائب</th>
                      <th className="border border-gray-300 p-3 text-right font-bold text-gray-700">الفصل</th>
                      <th className="border border-gray-300 p-3 text-right font-bold text-gray-700">المادة</th>
                      <th className="border border-gray-300 p-3 text-center font-bold text-gray-700">الحصة</th>
                      <th className="border border-gray-300 p-3 text-center font-bold text-gray-700">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((assignment, index) => (
                      <tr key={assignment.id} className="hover:bg-blue-50 transition-colors">
                        <td className="border border-gray-300 p-3 text-center">{index + 1}</td>
                        <td className="border border-gray-300 p-3">{assignment.date}</td>
                        <td className="border border-gray-300 p-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold">{assignment.substituteTeacherName}</span>
                          </div>
                        </td>
                        <td className="border border-gray-300 p-3">{assignment.absentTeacherName}</td>
                        <td className="border border-gray-300 p-3 font-medium">{assignment.className}</td>
                        <td className="border border-gray-300 p-3">{assignment.subject}</td>
                        <td className="border border-gray-300 p-3 text-center font-bold text-blue-700">{assignment.periodNumber}</td>
                        <td className="border border-gray-300 p-3 text-center">
                          {assignment.isConfirmedBySubstitute ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle className="w-3 h-3 ml-1" />
                              تم التوقيع
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                              <Clock className="w-3 h-3 ml-1" />
                              في الانتظار
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-500">لم يتم العثور على أي إشعارات مطابقة للفلاتر المحددة</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationHistoryPage;
