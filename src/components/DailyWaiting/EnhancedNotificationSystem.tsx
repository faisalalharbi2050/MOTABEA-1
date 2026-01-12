import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, Send, MessageSquare, Mail, Phone, Users, Eye } from 'lucide-react';
import { WaitingAssignment } from '@/types/dailyWait';

interface EnhancedNotificationSystemProps {
  assignments: WaitingAssignment[];
  onNotificationSent: (assignmentIds: string[]) => void;
  schoolInfo: {
    name: string;
    principalName: string;
    vicePrincipalName: string;
  };
}

const EnhancedNotificationSystem: React.FC<EnhancedNotificationSystemProps> = ({
  assignments,
  onNotificationSent,
  schoolInfo
}) => {
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [notificationMethod, setNotificationMethod] = useState<'whatsapp' | 'sms' | 'both'>('whatsapp');
  const [sendToAdministration, setSendToAdministration] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>(['principal']);

  const pendingAssignments = assignments.filter(a => !a.isNotificationSent);
  const sentAssignments = assignments.filter(a => a.isNotificationSent);

  // قائمة الإداريين
  const administrators = [
    { id: 'principal', name: schoolInfo.principalName, role: 'مدير المدرسة', phone: '0501234567' },
    { id: 'vice_principal', name: schoolInfo.vicePrincipalName, role: 'وكيل المدرسة', phone: '0501234568' },
    { id: 'student_affairs', name: 'مسؤول شؤون الطلاب', role: 'شؤون الطلاب', phone: '0501234569' }
  ];

  // معالج تحديد/إلغاء تحديد الإسناد
  const toggleAssignmentSelection = (assignmentId: string) => {
    setSelectedAssignments(prev =>
      prev.includes(assignmentId)
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  // تحديد الكل
  const selectAllPending = () => {
    setSelectedAssignments(pendingAssignments.map(a => a.id));
  };

  // إلغاء تحديد الكل
  const deselectAll = () => {
    setSelectedAssignments([]);
  };

  // معالج إرسال الإشعارات
  const handleSendNotifications = async () => {
    if (selectedAssignments.length === 0) {
      alert('الرجاء اختيار إسناد واحد على الأقل');
      return;
    }

    setIsSending(true);

    // محاكاة إرسال الإشعارات
    await new Promise(resolve => setTimeout(resolve, 2000));

    // إرسال للمعلمين المنتظرين
    selectedAssignments.forEach(assignmentId => {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        const message = generateNotificationMessage(assignment);
        const confirmationLink = generateConfirmationLink(assignment.id);
        
        console.log(`إرسال ${notificationMethod} إلى: ${assignment.substituteTeacherName}`);
        console.log(`الرسالة: ${message}`);
        console.log(`رابط التأكيد: ${confirmationLink}`);
      }
    });

    // إرسال للإداريين إذا تم تفعيل الخيار
    if (sendToAdministration) {
      const summaryTable = generateAdministrationSummary(selectedAssignments);
      console.log('إرسال ملخص للإداريين:', summaryTable);
      selectedAdmins.forEach(adminId => {
        const admin = administrators.find(a => a.id === adminId);
        console.log(`إرسال إلى: ${admin?.name} (${admin?.role})`);
      });
    }

    onNotificationSent(selectedAssignments);
    setSelectedAssignments([]);
    setIsSending(false);
    alert('تم إرسال الإشعارات بنجاح!');
  };

  // توليد رسالة الإشعار
  const generateNotificationMessage = (assignment: WaitingAssignment): string => {
    return `المعلم ${assignment.substituteTeacherName}، لديك حصة انتظار يوم ${getDayName(assignment.date)}، ${assignment.date}، الحصة ${assignment.periodNumber} في فصل ${assignment.className} بدلاً من المعلم ${assignment.absentTeacherName}. الرجاء تأكيد الحضور عبر الرابط التالي:`;
  };

  // توليد رابط التأكيد
  const generateConfirmationLink = (assignmentId: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/confirm-assignment/${assignmentId}`;
  };

  // الحصول على اسم اليوم
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  // توليد ملخص للإداريين
  const generateAdministrationSummary = (assignmentIds: string[]): string => {
    const selectedItems = assignments.filter(a => assignmentIds.includes(a.id));
    let summary = 'ملخص الانتظار اليومي:\n\n';
    selectedItems.forEach(assignment => {
      summary += `المعلم الغائب: ${assignment.absentTeacherName}\n`;
      summary += `المادة: ${assignment.subject} | الحصة: ${assignment.periodNumber} | الفصل: ${assignment.className}\n`;
      summary += `المعلم المنتظر: ${assignment.substituteTeacherName}\n`;
      summary += '---\n';
    });
    return summary;
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* إعدادات الإرسال */}
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-right text-gray-800 flex items-center gap-2">
            <Send className="w-6 h-6 text-blue-600" />
            إعدادات الإرسال
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          
          {/* اختيار طريقة الإرسال */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">طريقة الإرسال</label>
            <Select value={notificationMethod} onValueChange={(value: any) => setNotificationMethod(value)}>
              <SelectTrigger className="w-full border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <span>WhatsApp فقط</span>
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>SMS فقط</span>
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-purple-600" />
                    <span>WhatsApp + SMS</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* إرسال للإداريين */}
          <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Checkbox
                id="send-to-admin"
                checked={sendToAdministration}
                onCheckedChange={(checked) => setSendToAdministration(checked as boolean)}
              />
              <label htmlFor="send-to-admin" className="font-semibold text-gray-700 cursor-pointer">
                إرسال نسخة للإداريين
              </label>
            </div>

            {sendToAdministration && (
              <div className="space-y-2 mr-8">
                {administrators.map(admin => (
                  <div key={admin.id} className="flex items-center gap-3">
                    <Checkbox
                      id={admin.id}
                      checked={selectedAdmins.includes(admin.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAdmins(prev => [...prev, admin.id]);
                        } else {
                          setSelectedAdmins(prev => prev.filter(id => id !== admin.id));
                        }
                      }}
                    />
                    <label htmlFor={admin.id} className="text-sm cursor-pointer">
                      <span className="font-medium text-gray-800">{admin.name}</span>
                      <span className="text-gray-500"> ({admin.role})</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* الإشعارات قيد الإرسال */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-right text-gray-800 flex items-center gap-2">
              <Clock className="w-6 h-6 text-orange-600" />
              قيد الإرسال ({pendingAssignments.length})
            </CardTitle>
            {pendingAssignments.length > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={selectAllPending}
                  className="text-xs"
                >
                  تحديد الكل
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deselectAll}
                  className="text-xs"
                >
                  إلغاء التحديد
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {pendingAssignments.length > 0 ? (
            <div className="space-y-3">
              {pendingAssignments.map(assignment => (
                <div
                  key={assignment.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedAssignments.includes(assignment.id)
                      ? 'bg-blue-50 border-blue-400'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => toggleAssignmentSelection(assignment.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedAssignments.includes(assignment.id)}
                      onCheckedChange={() => toggleAssignmentSelection(assignment.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{assignment.substituteTeacherName}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            الحصة {assignment.periodNumber} - {assignment.className} - {assignment.subject}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            بدلاً من: {assignment.absentTeacherName}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                          <Clock className="w-3 h-3 ml-1" />
                          معلق
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* زر الإرسال */}
              <div className="pt-4">
                <Button
                  onClick={handleSendNotifications}
                  disabled={selectedAssignments.length === 0 || isSending}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg font-bold"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-3"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 ml-3" />
                      إرسال الإشعارات المحددة ({selectedAssignments.length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد إشعارات قيد الإرسال</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* الإشعارات المُرسلة (الأرشيف) */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-right text-gray-800 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            سجل الإشعارات المُرسلة ({sentAssignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {sentAssignments.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sentAssignments.map(assignment => (
                <div
                  key={assignment.id}
                  className="p-4 bg-green-50 rounded-lg border-2 border-green-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-gray-900">{assignment.substituteTeacherName}</p>
                        {assignment.isConfirmedBySubstitute && (
                          <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            تم التوقيع
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        الحصة {assignment.periodNumber} - {assignment.className} - {assignment.subject}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        بدلاً من: {assignment.absentTeacherName}
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        ✓ تم الإرسال بنجاح
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => {
                        const link = generateConfirmationLink(assignment.id);
                        navigator.clipboard.writeText(link);
                        alert('تم نسخ رابط التأكيد');
                      }}
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      عرض الرابط
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد إشعارات مُرسلة</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default EnhancedNotificationSystem;
