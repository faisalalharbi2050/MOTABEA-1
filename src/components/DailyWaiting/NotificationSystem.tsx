import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Send, MessageSquare, Phone, CheckCircle, Clock, AlertCircle, 
  Users, Smartphone, MessageCircle, Mail, Eye, Link, Settings 
} from 'lucide-react';
import { WaitingAssignment, NotificationMessage } from '@/types/dailyWait';

interface NotificationSystemProps {
  assignments: WaitingAssignment[];
  onNotificationSent: (assignmentIds: string[]) => void;
  schoolInfo: {
    name: string;
    principalName: string;
    vicePrincipalName: string;
  };
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  assignments,
  onNotificationSent,
  schoolInfo
}) => {
  const [notificationMessages, setNotificationMessages] = useState<NotificationMessage[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [notificationType, setNotificationType] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [useCustomMessage, setUseCustomMessage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewAssignment, setPreviewAssignment] = useState<WaitingAssignment | null>(null);
  const [confirmationStats, setConfirmationStats] = useState({
    sent: 0,
    delivered: 0,
    read: 0,
    confirmed: 0
  });

  // إنشاء رسالة الإشعار التلقائية
  const generateNotificationMessage = (assignment: WaitingAssignment, type: 'whatsapp' | 'sms'): string => {
    const dayName = getDayName(assignment.date);
    
    const baseMessage = `
🏫 ${schoolInfo.name}

السلام عليكم أستاذ/ة ${assignment.substituteTeacherName}

نأمل منكم تسديد حصة انتظار:
📅 يوم: ${dayName}
🗓️ التاريخ: ${assignment.date} (${assignment.hijriDate})
⏰ الحصة: ${assignment.periodNumber}
🏛️ الفصل: ${assignment.className}
📚 المادة: ${assignment.subject}
👨‍🏫 بدلاً من: ${assignment.absentTeacherName}

يرجى تأكيد الحضور عبر النقر على الرابط:
${generateConfirmationLink(assignment.id)}

شكراً لتعاونكم
إدارة المدرسة
    `;

    if (type === 'sms') {
      return `انتظار ${assignment.periodNumber} فصل ${assignment.className} يوم ${dayName} ${assignment.date} بدلاً من ${assignment.absentTeacherName}. تأكيد: ${generateConfirmationLink(assignment.id)}`;
    }

    return baseMessage.trim();
  };

  // إنشاء رابط التأكيد
  const generateConfirmationLink = (assignmentId: string): string => {
    return `https://motabea.edu.sa/confirm/${assignmentId}`;
  };

  // الحصول على اسم اليوم
  const getDayName = (date: string): string => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayIndex = new Date(date).getDay();
    return days[dayIndex];
  };

  // معالج إرسال الإشعارات
  const handleSendNotifications = async () => {
    if (selectedAssignments.length === 0) {
      alert('يرجى اختيار إسناد واحد على الأقل');
      return;
    }

    setIsLoading(true);

    try {
      const targetAssignments = assignments.filter(a => selectedAssignments.includes(a.id));
      const newNotifications: NotificationMessage[] = [];

      for (const assignment of targetAssignments) {
        const message = useCustomMessage 
          ? customMessage 
          : generateNotificationMessage(assignment, notificationType);

        const notification: NotificationMessage = {
          id: `notif_${Date.now()}_${Math.random()}`,
          recipientId: assignment.substituteTeacherId,
          recipientName: assignment.substituteTeacherName,
          recipientPhone: getTeacherPhone(assignment.substituteTeacherId),
          type: notificationType,
          message,
          confirmationLink: generateConfirmationLink(assignment.id),
          sentAt: new Date().toISOString(),
          isDelivered: false,
          isRead: false,
          isConfirmed: false
        };

        // محاكاة إرسال الإشعار
        await simulateNotificationSending(notification);
        newNotifications.push(notification);
      }

      setNotificationMessages(prev => [...prev, ...newNotifications]);
      onNotificationSent(selectedAssignments);
      setSelectedAssignments([]);
      
      // تحديث الإحصائيات
      updateConfirmationStats();
      
    } catch (error) {
      console.error('خطأ في إرسال الإشعارات:', error);
      alert('حدث خطأ أثناء إرسال الإشعارات');
    } finally {
      setIsLoading(false);
    }
  };

  // محاكاة إرسال الإشعار
  const simulateNotificationSending = async (notification: NotificationMessage): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // محاكاة حالات مختلفة للإرسال
        notification.isDelivered = Math.random() > 0.1; // 90% نجاح التسليم
        
        if (notification.isDelivered) {
          setTimeout(() => {
            notification.isRead = Math.random() > 0.3; // 70% يقرأون الرسالة
            
            if (notification.isRead) {
              setTimeout(() => {
                notification.isConfirmed = Math.random() > 0.2; // 80% يؤكدون الحضور
              }, 2000);
            }
          }, 1000);
        }
        
        resolve();
      }, 1000);
    });
  };

  // الحصول على رقم هاتف المعلم
  const getTeacherPhone = (teacherId: string): string => {
    // يمكن ربطها بقاعدة البيانات الفعلية
    const phones: {[key: string]: string} = {
      'sub_1': '966501234567',
      'sub_2': '966501234568',
      'sub_3': '966501234569',
      'sub_4': '966501234570'
    };
    return phones[teacherId] || '966500000000';
  };

  // تحديث إحصائيات التأكيد
  const updateConfirmationStats = () => {
    const stats = {
      sent: notificationMessages.length,
      delivered: notificationMessages.filter(n => n.isDelivered).length,
      read: notificationMessages.filter(n => n.isRead).length,
      confirmed: notificationMessages.filter(n => n.isConfirmed).length
    };
    setConfirmationStats(stats);
  };

  // معالج اختيار الإسنادات
  const handleAssignmentSelection = (assignmentId: string) => {
    setSelectedAssignments(prev => 
      prev.includes(assignmentId)
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  // معالج اختيار الكل
  const handleSelectAll = () => {
    const unnotifiedAssignments = assignments.filter(a => !a.isNotificationSent);
    if (selectedAssignments.length === unnotifiedAssignments.length) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(unnotifiedAssignments.map(a => a.id));
    }
  };

  // إرسال إشعار للمدير/الوكيل
  const handleSendToManagement = () => {
    const managementMessage = generateManagementReport();
    
    // محاكاة إرسال التقرير للإدارة
    console.log('إرسال تقرير للإدارة:', managementMessage);
    alert('تم إرسال التقرير لإدارة المدرسة بنجاح');
  };

  // إنشاء تقرير الإدارة
  const generateManagementReport = (): string => {
    const today = new Date().toLocaleDateString('ar-SA');
    const todayHijri = new Date().toLocaleDateString('ar-SA-islamic');
    
    let report = `📋 تقرير الانتظار اليومي\n`;
    report += `🗓️ التاريخ: ${today} - ${todayHijri}\n`;
    report += `🏫 ${schoolInfo.name}\n\n`;
    
    assignments.forEach((assignment, index) => {
      report += `${index + 1}. المعلم الغائب: ${assignment.absentTeacherName}\n`;
      report += `   المادة: ${assignment.subject} | الحصة: ${assignment.periodNumber} | الفصل: ${assignment.className}\n`;
      report += `   المعلم المنتظر: ${assignment.substituteTeacherName}\n`;
      report += `   الحالة: ${assignment.isConfirmedBySubstitute ? '✅ مؤكد' : '⏳ في الانتظار'}\n\n`;
    });
    
    return report;
  };

  useEffect(() => {
    updateConfirmationStats();
  }, [notificationMessages]);

  return (
    <div className="space-y-6">
      {/* إحصائيات الإشعارات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Send className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-800">{confirmationStats.sent}</p>
            <p className="text-blue-600 text-sm">مُرسل</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-800">{confirmationStats.delivered}</p>
            <p className="text-green-600 text-sm">مُسلم</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-800">{confirmationStats.read}</p>
            <p className="text-purple-600 text-sm">مقروء</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-800">{confirmationStats.confirmed}</p>
            <p className="text-orange-600 text-sm">مُؤكد</p>
          </CardContent>
        </Card>
      </div>

      {/* إعدادات الإشعار */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Settings className="w-5 h-5 text-blue-600" />
            إعدادات الإشعار
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع الإشعار</Label>
              <Select value={notificationType} onValueChange={(value) => setNotificationType(value as 'whatsapp' | 'sms')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      واتساب
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      رسالة نصية
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="custom-message"
                checked={useCustomMessage}
                onCheckedChange={setUseCustomMessage}
              />
              <Label htmlFor="custom-message">استخدام رسالة مخصصة</Label>
            </div>
          </div>

          {useCustomMessage && (
            <div className="space-y-2">
              <Label>الرسالة المخصصة</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="اكتب رسالتك المخصصة هنا..."
                rows={4}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* قائمة الإسنادات */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-right">إسنادات الانتظار</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSelectAll}
                disabled={assignments.filter(a => !a.isNotificationSent).length === 0}
              >
                {selectedAssignments.length === assignments.filter(a => !a.isNotificationSent).length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              </Button>
              
              <Button
                onClick={handleSendNotifications}
                disabled={selectedAssignments.length === 0 || isLoading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    إرسال الإشعارات ({selectedAssignments.length})
                  </>
                )}
              </Button>

              <Button
                onClick={handleSendToManagement}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Users className="w-4 h-4 ml-2" />
                إرسال للإدارة
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 rounded-lg">
              <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                <tr>
                  <th className="border border-gray-200 p-3">
                    <input
                      type="checkbox"
                      checked={selectedAssignments.length === assignments.filter(a => !a.isNotificationSent).length && assignments.filter(a => !a.isNotificationSent).length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="border border-gray-200 p-3 text-right">المعلم المنتظر</th>
                  <th className="border border-gray-200 p-3 text-right">الحصة</th>
                  <th className="border border-gray-200 p-3 text-right">الفصل</th>
                  <th className="border border-gray-200 p-3 text-right">المادة</th>
                  <th className="border border-gray-200 p-3 text-right">الحالة</th>
                  <th className="border border-gray-200 p-3 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-3">
                      {!assignment.isNotificationSent && (
                        <input
                          type="checkbox"
                          checked={selectedAssignments.includes(assignment.id)}
                          onChange={() => handleAssignmentSelection(assignment.id)}
                          className="rounded"
                        />
                      )}
                    </td>
                    <td className="border border-gray-200 p-3">{assignment.substituteTeacherName}</td>
                    <td className="border border-gray-200 p-3">{assignment.periodNumber}</td>
                    <td className="border border-gray-200 p-3">{assignment.className}</td>
                    <td className="border border-gray-200 p-3">{assignment.subject}</td>
                    <td className="border border-gray-200 p-3">
                      {assignment.isNotificationSent ? (
                        assignment.isConfirmedBySubstitute ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            مؤكد
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Clock className="w-3 h-3 ml-1" />
                            مُرسل
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="text-gray-600 border-gray-200">
                          <AlertCircle className="w-3 h-3 ml-1" />
                          في الانتظار
                        </Badge>
                      )}
                    </td>
                    <td className="border border-gray-200 p-3">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => setPreviewAssignment(assignment)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl" dir="rtl">
                            <DialogHeader>
                              <DialogTitle>معاينة الإشعار</DialogTitle>
                            </DialogHeader>
                            {previewAssignment && (
                              <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <h4 className="font-medium mb-2">نص الرسالة:</h4>
                                  <div className="whitespace-pre-line text-sm text-gray-700">
                                    {generateNotificationMessage(previewAssignment, notificationType)}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                  <Link className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm text-blue-700">
                                    رابط التأكيد: {generateConfirmationLink(previewAssignment.id)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:text-green-700"
                          disabled={assignment.isNotificationSent}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600 hover:text-blue-700"
                          disabled={assignment.isNotificationSent}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {assignments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>لا توجد إسنادات انتظار لإرسال الإشعارات</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* سجل الإشعارات */}
      {notificationMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right">سجل الإشعارات المرسلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificationMessages.map((notification) => (
                <div 
                  key={notification.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1">
                        {notification.type === 'whatsapp' ? (
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Smartphone className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="font-medium">{notification.recipientName}</span>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {new Date(notification.sentAt).toLocaleString('ar-SA')}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      {notification.isDelivered && (
                        <Badge className="bg-green-100 text-green-800 text-xs">مُسلم</Badge>
                      )}
                      {notification.isRead && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">مقروء</Badge>
                      )}
                      {notification.isConfirmed && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">مؤكد</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {!notification.isDelivered && (
                      <Button size="sm" variant="outline" className="text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationSystem;