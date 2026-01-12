import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Users, CheckCircle, AlertCircle, User, AlertTriangle, EyeOff } from 'lucide-react';

// مكون Switch مبسط
const Switch: React.FC<{
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onCheckedChange, disabled, ...props }) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
      {...props}
    >
      <div
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};
import { SubstituteTeacher, StaffMember, WaitingAssignment } from '@/types/dailyWait';

interface SubstituteSelectionProps {
  absentTeacherPeriods: {
    periodNumber: number;
    className: string;
    subject: string;
  }[];
  onAssignmentComplete: (assignments: WaitingAssignment[]) => void;
  selectedDate: string;
  absentTeacherId: string;
  absentTeacherName: string;
}

const SubstituteSelection: React.FC<SubstituteSelectionProps> = ({
  absentTeacherPeriods,
  onAssignmentComplete,
  selectedDate,
  absentTeacherId,
  absentTeacherName
}) => {
  const [autoAssignMode, setAutoAssignMode] = useState<boolean>(false);
  const [substituteAssignments, setSubstituteAssignments] = useState<{[key: number]: string}>({});
  const [manualEntries, setManualEntries] = useState<{[key: number]: string}>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hiddenPeriods, setHiddenPeriods] = useState<Set<number>>(new Set());
  
  // بيانات وهمية للمعلمين البدلاء
  const mockSubstituteTeachers: SubstituteTeacher[] = [
    {
      id: 'sub_1',
      teacherId: 'teacher_1',
      name: 'سارة أحمد المالكي',
      currentWeeklyLoad: 3,
      maxWeeklyLoad: 8,
      totalWaitingPeriods: 12,
      remainingWaitingPeriods: 9,
      isAvailable: true,
      contactNumber: '0501234567',
      whatsappNumber: '966501234567'
    },
    {
      id: 'sub_2',
      teacherId: 'teacher_2',
      name: 'عبدالرحمن سليم الشهراني',
      currentWeeklyLoad: 5,
      maxWeeklyLoad: 10,
      totalWaitingPeriods: 15,
      remainingWaitingPeriods: 10,
      isAvailable: true,
      contactNumber: '0501234568',
      whatsappNumber: '966501234568'
    },
    {
      id: 'sub_3',
      teacherId: 'teacher_3',
      name: 'هند محمد العتيبي',
      currentWeeklyLoad: 2,
      maxWeeklyLoad: 7,
      totalWaitingPeriods: 10,
      remainingWaitingPeriods: 8,
      isAvailable: true,
      contactNumber: '0501234569',
      whatsappNumber: '966501234569'
    },
    {
      id: 'sub_4',
      teacherId: 'teacher_4',
      name: 'فايز عبدالله القحطاني',
      currentWeeklyLoad: 7,
      maxWeeklyLoad: 8,
      totalWaitingPeriods: 12,
      remainingWaitingPeriods: 1,
      isAvailable: true,
      contactNumber: '0501234570',
      whatsappNumber: '966501234570'
    }
  ];

  // بيانات وهمية للموظفين الإداريين
  const mockStaffMembers: StaffMember[] = [
    {
      id: 'staff_1',
      name: 'محضر المختبر - أحمد علي',
      type: 'lab_technician',
      contactNumber: '0501234571',
      whatsappNumber: '966501234571',
      isAvailableForSubstitution: true
    },
    {
      id: 'staff_2',
      name: 'رائد النشاط - سالم محمد',
      type: 'activity_supervisor',
      contactNumber: '0501234572',
      whatsappNumber: '966501234572',
      isAvailableForSubstitution: true
    },
    {
      id: 'staff_3',
      name: 'وكيل المدرسة - عبدالعزيز أحمد',
      type: 'vice_principal',
      contactNumber: '0501234573',
      whatsappNumber: '966501234573',
      isAvailableForSubstitution: true
    },
    {
      id: 'staff_4',
      name: 'الموجه الطلابي - ناصر سعد',
      type: 'student_advisor',
      contactNumber: '0501234574',
      whatsappNumber: '966501234574',
      isAvailableForSubstitution: true
    }
  ];

  // دمج المعلمين والموظفين
  const allAvailableSubstitutes = [
    ...mockSubstituteTeachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      type: 'teacher' as const,
      currentLoad: teacher.currentWeeklyLoad,
      maxLoad: teacher.maxWeeklyLoad,
      totalWaitingPeriods: teacher.totalWaitingPeriods,
      // حساب المتبقي بشكل صحيح: المتبقي = (النصاب الكلي) - (المستخدم حالياً)
      remaining: teacher.totalWaitingPeriods - teacher.currentWeeklyLoad,
      isAvailable: teacher.isAvailable && (teacher.totalWaitingPeriods - teacher.currentWeeklyLoad) > 0,
      contactNumber: teacher.contactNumber,
      whatsappNumber: teacher.whatsappNumber
    })),
    ...mockStaffMembers.filter(staff => staff.isAvailableForSubstitution).map(staff => ({
      id: staff.id,
      name: staff.name,
      type: staff.type,
      currentLoad: 0,
      maxLoad: 5,
      totalWaitingPeriods: 5,
      remaining: 5,
      isAvailable: true,
      contactNumber: staff.contactNumber,
      whatsappNumber: staff.whatsappNumber
    }))
  ];

  // تصفية المعلمين حسب البحث
  const filteredSubstitutes = allAvailableSubstitutes.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) && sub.isAvailable
  );

  // خوارزمية التوزيع التلقائي المتقدمة
  const performAutoAssignment = () => {
    setIsProcessing(true);
    
    // ترتيب المعلمين حسب الأولوية
    const sortedTeachers = [...mockSubstituteTeachers]
      .filter(teacher => teacher.isAvailable && teacher.remainingWaitingPeriods > 0)
      .sort((a, b) => {
        // الأولوية للمعلم الأقل نصابًا
        if (a.currentWeeklyLoad !== b.currentWeeklyLoad) {
          return a.currentWeeklyLoad - b.currentWeeklyLoad;
        }
        // إذا تساووا، الأولوية للأكثر نصابًا متبقيًا
        return b.remainingWaitingPeriods - a.remainingWaitingPeriods;
      });

    const newAssignments: {[key: number]: string} = {};
    let teacherIndex = 0;

    absentTeacherPeriods.forEach((period, index) => {
      if (sortedTeachers.length > 0) {
        const selectedTeacher = sortedTeachers[teacherIndex % sortedTeachers.length];
        newAssignments[period.periodNumber] = selectedTeacher.id;
        
        // تحديث النصاب
        selectedTeacher.currentWeeklyLoad++;
        selectedTeacher.remainingWaitingPeriods--;
        
        // إذا وصل للحد الأقصى، أزله من القائمة
        if (selectedTeacher.remainingWaitingPeriods <= 0) {
          sortedTeachers.splice(teacherIndex, 1);
        } else {
          teacherIndex++;
        }
      }
    });

    setTimeout(() => {
      setSubstituteAssignments(newAssignments);
      setIsProcessing(false);
    }, 1500);
  };

  // معالج التعديل اليدوي
  const handleManualAssignment = (periodNumber: number, substituteId: string) => {
    setSubstituteAssignments(prev => ({
      ...prev,
      [periodNumber]: substituteId
    }));
  };

  // معالج إدخال النص اليدوي
  const handleManualTextEntry = (periodNumber: number, text: string) => {
    setManualEntries(prev => ({
      ...prev,
      [periodNumber]: text
    }));
    // تعيين علامة خاصة للإدخال اليدوي
    if (text.trim()) {
      setSubstituteAssignments(prev => ({
        ...prev,
        [periodNumber]: `manual_text_${periodNumber}`
      }));
    }
  };

  // معالج إخفاء الحصة
  const togglePeriodVisibility = (periodNumber: number) => {
    setHiddenPeriods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(periodNumber)) {
        newSet.delete(periodNumber);
      } else {
        newSet.add(periodNumber);
      }
      return newSet;
    });
  };

  // معالج تأكيد الإسناد
  const handleConfirmAssignments = () => {
    const assignments: WaitingAssignment[] = absentTeacherPeriods
      .filter(period => !hiddenPeriods.has(period.periodNumber))
      .map(period => {
        const substituteId = substituteAssignments[period.periodNumber];
        const substitute = allAvailableSubstitutes.find(sub => sub.id === substituteId);
        const manualText = manualEntries[period.periodNumber];
        
        return {
          id: `${Date.now()}_${period.periodNumber}`,
          absentTeacherId,
          absentTeacherName,
          substituteTeacherId: substituteId || 'manual',
          substituteTeacherName: manualText || substitute?.name || 'يتطلب إسناد يدوي',
          date: selectedDate,
          hijriDate: convertToHijri(selectedDate),
          periodNumber: period.periodNumber,
          className: period.className,
          subject: period.subject,
          isNotificationSent: false,
          isConfirmedBySubstitute: false,
          assignmentMethod: autoAssignMode ? 'auto' : 'manual',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

    onAssignmentComplete(assignments);
  };

  // تحويل التاريخ للهجري
  const convertToHijri = (gregorianDate: string): string => {
    const date = new Date(gregorianDate);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() - 579}هـ`;
  };

  useEffect(() => {
    if (autoAssignMode) {
      performAutoAssignment();
    }
  }, [autoAssignMode, absentTeacherPeriods]);

  return (
    <div className="space-y-6">
      {/* إعدادات التوزيع - شريط موحد للكل */}
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-3 text-right text-gray-800">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            إعدادات التوزيع
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl border-2 border-blue-300 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-md">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <Label htmlFor="auto-assign" className="text-base font-bold text-gray-900 cursor-pointer block mb-1">
                  التوزيع التلقائي الذكي
                </Label>
                <p className="text-sm text-gray-600">
                  توزيع الحصص تلقائياً حسب النصاب والعدالة
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="auto-assign"
                checked={autoAssignMode}
                onCheckedChange={setAutoAssignMode}
              />
              <span className={`text-sm font-semibold ${autoAssignMode ? 'text-green-600' : 'text-gray-500'}`}>
                {autoAssignMode ? 'مُفعّل' : 'مُعطّل'}
              </span>
            </div>
          </div>

          {autoAssignMode && isProcessing && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl mt-4 border-2 border-blue-200">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <span className="text-blue-700 font-semibold block">جاري التوزيع التلقائي...</span>
                <span className="text-blue-600 text-sm">تطبيق خوارزمية التوازن الديناميكي</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* جدول الإسنادات */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
          <CardTitle className="flex items-center gap-3 text-right text-gray-800">
            <div className="p-2 bg-orange-500 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            حصص تحتاج تغطية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 rounded-lg">
              <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                <tr>
                  <th className="border border-gray-200 p-3 text-right font-bold text-gray-700">الحصة</th>
                  <th className="border border-gray-200 p-3 text-right font-bold text-gray-700">الصف والفصل</th>
                  <th className="border border-gray-200 p-3 text-right font-bold text-gray-700">المادة</th>
                  <th className="border border-gray-200 p-3 text-right font-bold text-gray-700">المعلم المنتظر</th>
                  <th className="border border-gray-200 p-3 text-right font-bold text-gray-700">الحالة</th>
                  <th className="border border-gray-200 p-3 text-right font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {absentTeacherPeriods.map((period) => {
                  const assignedSubstituteId = substituteAssignments[period.periodNumber];
                  const assignedSubstitute = allAvailableSubstitutes.find(sub => sub.id === assignedSubstituteId);
                  
                  return (
                    <tr 
                      key={period.periodNumber} 
                      className={`hover:bg-gray-50 transition-colors ${
                        hiddenPeriods.has(period.periodNumber) ? 'opacity-40 bg-gray-100' : ''
                      }`}
                    >
                      <td className="border border-gray-200 p-3 text-center">
                        <Badge variant="outline" className="text-base font-bold">
                          {period.periodNumber}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 p-3 text-center font-semibold text-gray-800">
                        {period.className}
                      </td>
                      <td className="border border-gray-200 p-3 font-medium text-gray-700">{period.subject}</td>
                      <td className="border border-gray-200 p-3">
                        {autoAssignMode ? (
                          <div className="flex items-center gap-2">
                            {assignedSubstitute ? (
                              <>
                                <User className="w-4 h-4 text-green-600" />
                                <span className="text-green-700 font-medium">
                                  {assignedSubstitute.name}
                                </span>
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                  تلقائي
                                </Badge>
                              </>
                            ) : (
                              <span className="text-gray-500">جاري التحديد...</span>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            {/* قائمة منسدلة احترافية مع إمكانية الإدخال اليدوي */}
                            <Select
                              value={manualEntries[period.periodNumber] ? `manual_${period.periodNumber}` : (assignedSubstituteId || '')}
                              onValueChange={(value) => {
                                if (value === 'manual_entry') {
                                  // فتح حقل الإدخال اليدوي
                                  const manualName = prompt('أدخل اسم المعلم المنتظر يدوياً:');
                                  if (manualName && manualName.trim()) {
                                    handleManualTextEntry(period.periodNumber, manualName.trim());
                                  }
                                } else {
                                  handleManualAssignment(period.periodNumber, value);
                                  // مسح الإدخال اليدوي عند اختيار من القائمة
                                  setManualEntries(prev => {
                                    const newEntries = {...prev};
                                    delete newEntries[period.periodNumber];
                                    return newEntries;
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="w-full border-2 hover:border-blue-400 transition-colors bg-white shadow-sm">
                                <SelectValue placeholder="اختر معلم أو أدخل يدوياً">
                                  {manualEntries[period.periodNumber] ? (
                                    <span className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-purple-600" />
                                      <span className="font-medium">{manualEntries[period.periodNumber]}</span>
                                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">يدوي</Badge>
                                    </span>
                                  ) : assignedSubstitute ? (
                                    <span className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-blue-600" />
                                      <span className="font-medium">{assignedSubstitute.name}</span>
                                    </span>
                                  ) : null}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="max-h-96 bg-white border-2 shadow-2xl z-[100]" dir="rtl">
                                {/* حقل البحث داخل القائمة */}
                                <div className="sticky top-0 bg-white z-10 p-3 border-b-2 border-gray-200">
                                  <div className="relative">
                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                      placeholder="ابحث عن معلم..."
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      className="text-right pr-10 border-2 bg-gray-50"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                </div>
                                
                                {/* خيار الإدخال اليدوي */}
                                <SelectItem 
                                  value="manual_entry" 
                                  className="text-right py-3 hover:bg-purple-50 cursor-pointer border-b-2 border-purple-200 bg-purple-50 font-semibold"
                                >
                                  <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-purple-600" />
                                    <span className="text-purple-700">➕ إدخال اسم يدوياً</span>
                                  </div>
                                </SelectItem>
                                
                                {/* قائمة المعلمين المتاحين */}
                                {filteredSubstitutes.length > 0 ? (
                                  filteredSubstitutes.map((substitute) => (
                                    <SelectItem 
                                      key={substitute.id} 
                                      value={substitute.id} 
                                      className="text-right py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 bg-white transition-colors"
                                    >
                                      <div className="flex items-center justify-between w-full gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                          <User className="w-5 h-5 text-blue-600" />
                                          <div className="text-right">
                                            <p className="font-semibold text-gray-900">{substitute.name}</p>
                                            <p className="text-xs text-gray-500">
                                              {substitute.type === 'teacher' ? 'معلم' : 'إداري'}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                                            {substitute.currentLoad}/{substitute.totalWaitingPeriods}
                                          </Badge>
                                          <span className={`text-xs font-medium ${
                                            substitute.remaining > 3 ? 'text-green-600' : 
                                            substitute.remaining > 1 ? 'text-yellow-600' : 'text-red-600'
                                          }`}>
                                            متبقي {substitute.remaining}
                                          </span>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-4 text-center text-gray-500 bg-white">
                                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">لا توجد نتائج</p>
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-200 p-3">
                        {assignedSubstitute ? (
                          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            مُسند
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                            <AlertCircle className="w-3 h-3 ml-1" />
                            في الانتظار
                          </Badge>
                        )}
                      </td>
                      <td className="border border-gray-200 p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePeriodVisibility(period.periodNumber)}
                          className={`hover:bg-gray-100 transition-colors ${
                            hiddenPeriods.has(period.periodNumber) ? 'bg-red-50' : ''
                          }`}
                          title={hiddenPeriods.has(period.periodNumber) ? "إظهار الحصة" : "إخفاء الحصة"}
                        >
                          <EyeOff className={`w-4 h-4 ${
                            hiddenPeriods.has(period.periodNumber) ? 'text-red-600' : 'text-gray-600'
                          }`} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600 space-x-2 space-x-reverse">
              <span>إجمالي الحصص: {absentTeacherPeriods.length}</span>
              <span className="text-gray-400">|</span>
              <span className="text-green-600 font-medium">المُسندة: {Object.keys(substituteAssignments).length}</span>
              <span className="text-gray-400">|</span>
              <span className="text-yellow-600 font-medium">المتبقية: {absentTeacherPeriods.length - Object.keys(substituteAssignments).length}</span>
              {hiddenPeriods.size > 0 && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-red-600 font-medium">المخفية: {hiddenPeriods.size}</span>
                </>
              )}
            </div>

            <Button
              onClick={handleConfirmAssignments}
              disabled={Object.keys(substituteAssignments).length === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <CheckCircle className="w-5 h-5 ml-2" />
              تأكيد الإسناد النهائي
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubstituteSelection;