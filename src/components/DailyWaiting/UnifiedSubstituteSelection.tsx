import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Users, CheckCircle, AlertCircle, User, AlertTriangle, EyeOff, X } from 'lucide-react';

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

import { SubstituteTeacher, StaffMember, WaitingAssignment, AbsentTeacher } from '@/types/dailyWait';

interface TeacherPeriod {
  absentTeacherId: string;
  absentTeacherName: string;
  periodNumber: number;
  className: string;
  subject: string;
}

interface UnifiedSubstituteSelectionProps {
  absentTeachers: AbsentTeacher[];
  allTeacherPeriods: TeacherPeriod[];
  onAssignmentComplete: (assignments: WaitingAssignment[]) => void;
  selectedDate: string;
}

const UnifiedSubstituteSelection: React.FC<UnifiedSubstituteSelectionProps> = ({
  absentTeachers,
  allTeacherPeriods,
  onAssignmentComplete,
  selectedDate
}) => {
  const [autoAssignMode, setAutoAssignMode] = useState<boolean>(false);
  const [substituteAssignments, setSubstituteAssignments] = useState<{[key: string]: string}>({});
  const [manualEntries, setManualEntries] = useState<{[key: string]: string}>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hiddenPeriods, setHiddenPeriods] = useState<Set<string>>(new Set());
  const [isManualEntryDialogOpen, setIsManualEntryDialogOpen] = useState<boolean>(false);
  const [currentPeriodKey, setCurrentPeriodKey] = useState<string>('');
  const [manualNameInput, setManualNameInput] = useState<string>('');
  
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

  // خوارزمية التوزيع التلقائي المتقدمة - موحدة لكل المعلمين الغائبين
  const performAutoAssignment = () => {
    setIsProcessing(true);
    
    const sortedTeachers = [...mockSubstituteTeachers]
      .filter(teacher => teacher.isAvailable && teacher.remainingWaitingPeriods > 0)
      .sort((a, b) => {
        if (a.currentWeeklyLoad !== b.currentWeeklyLoad) {
          return a.currentWeeklyLoad - b.currentWeeklyLoad;
        }
        return b.remainingWaitingPeriods - a.remainingWaitingPeriods;
      });

    const newAssignments: {[key: string]: string} = {};
    let teacherIndex = 0;

    allTeacherPeriods.forEach((period) => {
      if (sortedTeachers.length > 0) {
        const periodKey = `${period.absentTeacherId}_${period.periodNumber}`;
        const selectedTeacher = sortedTeachers[teacherIndex % sortedTeachers.length];
        newAssignments[periodKey] = selectedTeacher.id;
        
        selectedTeacher.currentWeeklyLoad++;
        selectedTeacher.remainingWaitingPeriods--;
        
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
  const handleManualAssignment = (periodKey: string, substituteId: string) => {
    setSubstituteAssignments(prev => ({
      ...prev,
      [periodKey]: substituteId
    }));
  };

  // معالج إدخال النص اليدوي
  const handleManualTextEntry = (periodKey: string, text: string) => {
    setManualEntries(prev => ({
      ...prev,
      [periodKey]: text
    }));
    if (text.trim()) {
      setSubstituteAssignments(prev => ({
        ...prev,
        [periodKey]: `manual_text_${periodKey}`
      }));
    }
  };

  // فتح مربع الحوار لإدخال الاسم يدوياً
  const openManualEntryDialog = (periodKey: string) => {
    setCurrentPeriodKey(periodKey);
    setManualNameInput(manualEntries[periodKey] || '');
    setIsManualEntryDialogOpen(true);
  };

  // تأكيد الإدخال اليدوي
  const confirmManualEntry = () => {
    if (manualNameInput.trim()) {
      handleManualTextEntry(currentPeriodKey, manualNameInput.trim());
      setIsManualEntryDialogOpen(false);
      setManualNameInput('');
      setCurrentPeriodKey('');
    }
  };

  // معالج إخفاء الحصة
  const togglePeriodVisibility = (periodKey: string) => {
    setHiddenPeriods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(periodKey)) {
        newSet.delete(periodKey);
      } else {
        newSet.add(periodKey);
      }
      return newSet;
    });
  };

  // معالج تأكيد الإسناد - موحد للكل
  const handleConfirmAssignments = () => {
    const assignments: WaitingAssignment[] = allTeacherPeriods
      .filter(period => {
        const periodKey = `${period.absentTeacherId}_${period.periodNumber}`;
        return !hiddenPeriods.has(periodKey);
      })
      .map(period => {
        const periodKey = `${period.absentTeacherId}_${period.periodNumber}`;
        const substituteId = substituteAssignments[periodKey];
        const substitute = allAvailableSubstitutes.find(sub => sub.id === substituteId);
        const manualText = manualEntries[periodKey];
        
        return {
          id: `${Date.now()}_${periodKey}`,
          absentTeacherId: period.absentTeacherId,
          absentTeacherName: period.absentTeacherName,
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
  }, [autoAssignMode]);

  // تجميع الحصص حسب المعلم الغائب
  const periodsByTeacher: {[key: string]: TeacherPeriod[]} = {};
  allTeacherPeriods.forEach(period => {
    if (!periodsByTeacher[period.absentTeacherId]) {
      periodsByTeacher[period.absentTeacherId] = [];
    }
    periodsByTeacher[period.absentTeacherId].push(period);
  });

  return (
    <div className="space-y-6">
      {/* شريط التوزيع التلقائي الموحد - في الأعلى */}
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-3 text-right text-gray-800">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            إعدادات التوزيع الموحدة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl border-2 border-blue-300 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-md">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <Label htmlFor="auto-assign-unified" className="text-base font-bold text-gray-900 cursor-pointer block mb-1">
                  التوزيع التلقائي الذكي لجميع المعلمين الغائبين
                </Label>
                <p className="text-sm text-gray-600">
                  توزيع جميع الحصص تلقائياً حسب النصاب والعدالة
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="auto-assign-unified"
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
                <span className="text-blue-700 font-semibold block">جاري التوزيع التلقائي لجميع الحصص...</span>
                <span className="text-blue-600 text-sm">تطبيق خوارزمية التوازن الديناميكي</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* عرض جداول المعلمين الغائبين */}
      {Object.entries(periodsByTeacher).map(([teacherId, periods]) => {
        const absentTeacher = absentTeachers.find(t => t.teacherId === teacherId);
        if (!absentTeacher) return null;

        return (
          <Card key={teacherId} className="shadow-lg border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="flex items-center justify-between text-right text-gray-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                  <span>حصص المعلم الغائب: {absentTeacher.teacherName}</span>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  {periods.length} حصة
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 rounded-lg">
                  <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                    <tr>
                      <th className="border border-gray-200 p-3 text-right font-bold text-gray-700">الحصة</th>
                      <th className="border border-gray-200 p-3 text-right font-bold text-gray-700">الصف والفصل</th>
                      <th className="border border-gray-200 p-3 text-right font-bold text-gray-700">المادة</th>
                      <th className="border border-gray-200 p-3 text-right font-bold text-gray-700">المعلم المنتظر</th>
                      <th className="border border-gray-200 p-3 text-right font-bold text-gray-700">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period) => {
                      const periodKey = `${period.absentTeacherId}_${period.periodNumber}`;
                      const assignedSubstituteId = substituteAssignments[periodKey];
                      const assignedSubstitute = allAvailableSubstitutes.find(sub => sub.id === assignedSubstituteId);
                      
                      return (
                        <tr 
                          key={periodKey} 
                          className={`hover:bg-gray-50 transition-colors ${
                            hiddenPeriods.has(periodKey) ? 'opacity-40 bg-gray-100' : ''
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
                                <Select
                                  value={manualEntries[periodKey] ? `manual_${periodKey}` : (assignedSubstituteId || '')}
                                  onValueChange={(value) => {
                                    if (value === 'manual_entry') {
                                      openManualEntryDialog(periodKey);
                                    } else {
                                      handleManualAssignment(periodKey, value);
                                      setManualEntries(prev => {
                                        const newEntries = {...prev};
                                        delete newEntries[periodKey];
                                        return newEntries;
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-full border-2 hover:border-blue-400 transition-colors bg-white shadow-sm">
                                    <SelectValue placeholder="اختر معلم أو أدخل يدوياً">
                                      {manualEntries[periodKey] ? (
                                        <span className="flex items-center gap-2">
                                          <User className="w-4 h-4 text-purple-600" />
                                          <span className="font-medium">{manualEntries[periodKey]}</span>
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
                                    
                                    <SelectItem 
                                      value="manual_entry" 
                                      className="text-right py-3 hover:bg-purple-50 cursor-pointer border-b-2 border-purple-200 bg-purple-50 font-semibold"
                                    >
                                      <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-purple-600" />
                                        <span className="text-purple-700">➕ إدخال اسم يدوياً</span>
                                      </div>
                                    </SelectItem>
                                    
                                    {filteredSubstitutes.length > 0 ? (
                                      filteredSubstitutes.map((substitute) => (
                                        <SelectItem 
                                          key={substitute.id} 
                                          value={substitute.id} 
                                          className="text-right py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 bg-white transition-colors"
                                        >
                                          <div className="flex items-center justify-between w-full gap-3">
                                            <div className="flex items-center gap-3 flex-1">
                                              <User className="w-5 h-5 text-blue-600" />
                                              <div className="text-right">
                                                <div className="flex items-center gap-2">
                                                  <p className="font-semibold text-gray-900">{substitute.name}</p>
                                                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                    substitute.remaining > 3 ? 'bg-green-100 text-green-700' : 
                                                    substitute.remaining > 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                  }`}>
                                                    متبقي: {substitute.remaining}
                                                  </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                  {substitute.type === 'teacher' ? 'معلم' : 'إداري'} - ({substitute.currentLoad}/{substitute.totalWaitingPeriods})
                                                </p>
                                              </div>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* أزرار الإجراءات الموحدة في الأسفل */}
      <Card className="shadow-lg border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700 space-x-2 space-x-reverse">
              <span>إجمالي الحصص: <strong className="text-blue-700">{allTeacherPeriods.length}</strong></span>
              <span className="text-gray-400">|</span>
              <span>المُسندة: <strong className="text-green-600">{Object.keys(substituteAssignments).length}</strong></span>
              <span className="text-gray-400">|</span>
              <span>المتبقية: <strong className="text-yellow-600">{allTeacherPeriods.length - Object.keys(substituteAssignments).length}</strong></span>
              {hiddenPeriods.size > 0 && (
                <>
                  <span className="text-gray-400">|</span>
                  <span>المخفية: <strong className="text-red-600">{hiddenPeriods.size}</strong></span>
                </>
              )}
            </div>

            <Button
              onClick={handleConfirmAssignments}
              disabled={Object.keys(substituteAssignments).length === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 text-lg shadow-lg"
            >
              <CheckCircle className="w-6 h-6 ml-2" />
              تأكيد الإسناد النهائي لجميع الحصص
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* مربع حوار إدخال الاسم يدوياً */}
      <Dialog open={isManualEntryDialogOpen} onOpenChange={setIsManualEntryDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <User className="w-6 h-6 text-purple-600" />
              إدخال اسم المعلم يدوياً
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-purple-100 rounded-full">
                <User className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manual-name" className="text-base font-semibold text-gray-700">
                اسم المعلم المنتظر
              </Label>
              <Input
                id="manual-name"
                type="text"
                placeholder="أدخل اسم المعلم بالكامل..."
                value={manualNameInput}
                onChange={(e) => setManualNameInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && manualNameInput.trim()) {
                    confirmManualEntry();
                  }
                }}
                className="text-right text-base p-3 border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                autoFocus
              />
              <p className="text-sm text-gray-500 text-right">
                يمكنك الضغط على Enter للحفظ
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={confirmManualEntry}
                disabled={!manualNameInput.trim()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <CheckCircle className="w-4 h-4 ml-2" />
                تأكيد
              </Button>
              <Button
                onClick={() => {
                  setIsManualEntryDialogOpen(false);
                  setManualNameInput('');
                  setCurrentPeriodKey('');
                }}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
              >
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnifiedSubstituteSelection;
