/**
 * أدوات الواتساب والمشاركة
 * WhatsApp and Sharing Utilities
 */

import { AssignmentState, Teacher, Subject, Classroom, Assignment } from '../store/types';

/**
 * نوع الرسالة
 */
export type MessageType = 'individual' | 'group' | 'broadcast';

/**
 * بيانات جهة الاتصال
 */
export interface Contact {
  id: string;
  name: string;
  phone: string;
  type: 'teacher' | 'admin' | 'parent';
  isActive: boolean;
}

/**
 * إعدادات الرسالة
 */
export interface MessageOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  includeTimestamp?: boolean;
  format?: 'simple' | 'detailed' | 'summary';
  attachments?: string[];
}

/**
 * فئة أدوات الواتساب
 */
export class WhatsAppUtils {
  private static readonly BASE_URL = 'https://wa.me/';
  private static readonly WEB_URL = 'https://web.whatsapp.com/send';
  private static readonly MAX_MESSAGE_LENGTH = 4000;

  /**
   * تنسيق رقم الهاتف للواتساب
   */
  private static formatPhoneNumber(phone: string): string {
    // إزالة جميع الرموز غير الرقمية
    const cleaned = phone.replace(/\D/g, '');
    
    // إذا كان الرقم يبدأ بـ 0، استبداله برمز الدولة السعودية
    if (cleaned.startsWith('0')) {
      return '966' + cleaned.substring(1);
    }
    
    // إذا كان الرقم يبدأ بـ 966، إرجاعه كما هو
    if (cleaned.startsWith('966')) {
      return cleaned;
    }
    
    // إذا كان الرقم يبدأ بـ 5، إضافة رمز الدولة
    if (cleaned.startsWith('5')) {
      return '966' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * قطع الرسالة إلى أجزاء إذا كانت طويلة
   */
  private static splitMessage(message: string): string[] {
    if (message.length <= this.MAX_MESSAGE_LENGTH) {
      return [message];
    }

    const parts: string[] = [];
    const lines = message.split('\n');
    let currentPart = '';

    for (const line of lines) {
      if ((currentPart + line + '\n').length > this.MAX_MESSAGE_LENGTH) {
        if (currentPart) {
          parts.push(currentPart.trim());
          currentPart = '';
        }
        
        // إذا كان السطر الواحد أطول من الحد الأقصى
        if (line.length > this.MAX_MESSAGE_LENGTH) {
          const chunks = line.match(new RegExp(`.{1,${this.MAX_MESSAGE_LENGTH - 100}}`, 'g')) || [line];
          parts.push(...chunks);
        } else {
          currentPart = line + '\n';
        }
      } else {
        currentPart += line + '\n';
      }
    }

    if (currentPart) {
      parts.push(currentPart.trim());
    }

    return parts;
  }

  /**
   * إنشاء رسالة تقرير معلم
   */
  static createTeacherMessage(
    state: AssignmentState, 
    teacherId: string,
    options: MessageOptions = {}
  ): string {
    const teacher = state.teachers.find(t => t.id === teacherId);
    if (!teacher) return 'المعلم غير موجود';

    const assignments = state.assignments.filter(a => a.teacherId === teacherId);
    const totalHours = assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
    const subjectCount = new Set(assignments.map(a => a.subjectId)).size;
    const classroomCount = new Set(assignments.map(a => a.classroomId)).size;

    let message = '';

    // الرأس
    if (options.includeHeader !== false) {
      message += `📋 *تقرير إسناد المعلم*\n`;
      message += `━━━━━━━━━━━━━━━━\n\n`;
    }

    // معلومات المعلم
    message += `👨‍🏫 *اسم المعلم:* ${teacher.name}\n`;
    message += `📚 *التخصص:* ${teacher.specialization}\n`;
    message += `⏱️ *إجمالي الحصص:* ${totalHours} حصة\n`;
    message += `📖 *عدد المواد:* ${subjectCount}\n`;
    message += `🏫 *عدد الفصول:* ${classroomCount}\n`;

    // حساب نسبة العبء
    const loadPercentage = teacher.maxLoad > 0 ? Math.round((totalHours / teacher.maxLoad) * 100) : 0;
    const loadStatus = loadPercentage >= 100 ? '🔴 مرتفع' : 
                      loadPercentage >= 80 ? '🟡 متوسط' : '🟢 منخفض';
    message += `📊 *نسبة العبء:* ${loadPercentage}% (${loadStatus})\n\n`;

    // تفاصيل الإسناد
    if (options.format === 'detailed' && assignments.length > 0) {
      message += `📝 *تفاصيل الإسناد:*\n`;
      message += `━━━━━━━━━━━━━━━━\n`;
      
      assignments.forEach((assignment, index) => {
        const subject = state.subjects.find(s => s.id === assignment.subjectId);
        const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
        
        message += `${index + 1}. ${subject?.name || 'غير محدد'} - ${classroom?.name || 'غير محدد'} (${assignment.hoursPerWeek} حصة)\n`;
      });
      message += '\n';
    }

    // التوقيت والتذييل
    if (options.includeTimestamp !== false) {
      const now = new Date().toLocaleString('ar-SA');
      message += `🕐 *تاريخ التقرير:* ${now}\n`;
    }

    if (options.includeFooter !== false) {
      message += `\n────────────────\n`;
      message += `نظام MOTABEA لإدارة المدارس`;
    }

    return message;
  }

  /**
   * إنشاء رسالة ملخص الإسناد العام
   */
  static createSummaryMessage(
    state: AssignmentState,
    options: MessageOptions = {}
  ): string {
    const totalTeachers = state.teachers.length;
    const activeTeachers = state.teachers.filter(t => t.isActive).length;
    const totalAssignments = state.assignments.length;
    const activeAssignments = state.assignments.filter(a => a.status === 'active').length;
    const totalSubjects = state.subjects.length;
    const totalClassrooms = state.classrooms.length;

    let message = '';

    // الرأس
    if (options.includeHeader !== false) {
      message += `📊 *ملخص نظام الإسناد*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    // الإحصائيات الرئيسية
    message += `👥 *إجمالي المعلمين:* ${totalTeachers}\n`;
    message += `✅ *المعلمون النشطون:* ${activeTeachers}\n`;
    message += `📚 *إجمالي المواد:* ${totalSubjects}\n`;
    message += `🏫 *إجمالي الفصول:* ${totalClassrooms}\n`;
    message += `📋 *إجمالي الإسناد:* ${totalAssignments}\n`;
    message += `🔄 *الإسناد النشط:* ${activeAssignments}\n\n`;

    // نسبة التغطية
    const coveragePercentage = totalSubjects > 0 ? 
      Math.round((new Set(state.assignments.map(a => a.subjectId)).size / totalSubjects) * 100) : 0;
    
    message += `📈 *نسبة تغطية المواد:* ${coveragePercentage}%\n`;

    // العبء التدريسي
    const averageLoad = totalTeachers > 0 ? 
      Math.round(state.teachers.reduce((sum, t) => sum + t.currentLoad, 0) / totalTeachers) : 0;
    
    message += `⚖️ *متوسط العبء التدريسي:* ${averageLoad} حصة\n\n`;

    // حالات العبء
    const highLoad = state.teachers.filter(t => t.currentLoad >= t.maxLoad).length;
    const mediumLoad = state.teachers.filter(t => t.currentLoad >= t.maxLoad * 0.8 && t.currentLoad < t.maxLoad).length;
    const lowLoad = state.teachers.filter(t => t.currentLoad < t.maxLoad * 0.8).length;

    message += `🔴 *عبء مرتفع:* ${highLoad} معلم\n`;
    message += `🟡 *عبء متوسط:* ${mediumLoad} معلم\n`;
    message += `🟢 *عبء منخفض:* ${lowLoad} معلم\n`;

    // التوقيت والتذييل
    if (options.includeTimestamp !== false) {
      const now = new Date().toLocaleString('ar-SA');
      message += `\n🕐 *تاريخ التقرير:* ${now}\n`;
    }

    if (options.includeFooter !== false) {
      message += `\n────────────────────\n`;
      message += `نظام MOTABEA لإدارة المدارس`;
    }

    return message;
  }

  /**
   * إنشاء رسالة مشاكل الإسناد
   */
  static createIssuesMessage(
    state: AssignmentState,
    options: MessageOptions = {}
  ): string {
    let message = '';

    // الرأس
    if (options.includeHeader !== false) {
      message += `⚠️ *مشاكل نظام الإسناد*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    // العبء الزائد
    const overloadedTeachers = state.teachers.filter(t => t.currentLoad > t.maxLoad);
    if (overloadedTeachers.length > 0) {
      message += `🔴 *المعلمون محملون بعبء زائد:*\n`;
      overloadedTeachers.forEach(teacher => {
        const percentage = Math.round((teacher.currentLoad / teacher.maxLoad) * 100);
        message += `• ${teacher.name} (${percentage}%)\n`;
      });
      message += '\n';
    }

    // المواد غير المُسندة
    const assignedSubjects = new Set(state.assignments.map(a => a.subjectId));
    const unassignedSubjects = state.subjects.filter(s => !assignedSubjects.has(s.id));
    
    if (unassignedSubjects.length > 0) {
      message += `📚 *المواد غير المُسندة:*\n`;
      unassignedSubjects.forEach(subject => {
        message += `• ${subject.name}\n`;
      });
      message += '\n';
    }

    // المعلمون بدون إسناد
    const assignedTeachers = new Set(state.assignments.map(a => a.teacherId));
    const unassignedTeachers = state.teachers.filter(t => t.isActive && !assignedTeachers.has(t.id));
    
    if (unassignedTeachers.length > 0) {
      message += `👤 *المعلمون بدون إسناد:*\n`;
      unassignedTeachers.forEach(teacher => {
        message += `• ${teacher.name} (${teacher.specialization})\n`;
      });
      message += '\n';
    }

    // إذا لم توجد مشاكل
    if (overloadedTeachers.length === 0 && unassignedSubjects.length === 0 && unassignedTeachers.length === 0) {
      message += `✅ *لا توجد مشاكل في نظام الإسناد*\n`;
      message += `جميع المعلمين والمواد مُسندة بشكل صحيح\n\n`;
    }

    // التوقيت والتذييل
    if (options.includeTimestamp !== false) {
      const now = new Date().toLocaleString('ar-SA');
      message += `🕐 *تاريخ التقرير:* ${now}\n`;
    }

    if (options.includeFooter !== false) {
      message += `\n─────────────────────\n`;
      message += `نظام MOTABEA لإدارة المدارس`;
    }

    return message;
  }

  /**
   * إرسال رسالة فردية عبر الواتساب
   */
  static sendIndividualMessage(
    phone: string, 
    message: string, 
    useWeb: boolean = false
  ): void {
    const formattedPhone = this.formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    
    const baseUrl = useWeb ? this.WEB_URL : this.BASE_URL + formattedPhone;
    const url = `${baseUrl}?text=${encodedMessage}`;
    
    window.open(url, '_blank');
  }

  /**
   * إرسال رسالة لعدة جهات اتصال
   */
  static sendMultipleMessages(
    contacts: Contact[],
    message: string,
    useWeb: boolean = false
  ): void {
    const messageParts = this.splitMessage(message);
    
    contacts.forEach((contact, index) => {
      messageParts.forEach((part, partIndex) => {
        const fullMessage = messageParts.length > 1 
          ? `(${partIndex + 1}/${messageParts.length})\n\n${part}`
          : part;
        
        // تأخير بين الرسائل لتجنب حظر المتصفح
        setTimeout(() => {
          this.sendIndividualMessage(contact.phone, fullMessage, useWeb);
        }, (index * messageParts.length + partIndex) * 1000);
      });
    });
  }

  /**
   * إنشاء رابط مشاركة سريعة
   */
  static createShareLink(message: string): string {
    const encodedMessage = encodeURIComponent(message);
    return `${this.WEB_URL}?text=${encodedMessage}`;
  }

  /**
   * نسخ الرسالة للحافظة
   */
  static async copyToClipboard(message: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        return true;
      } else {
        // طريقة بديلة للمتصفحات القديمة
        const textArea = document.createElement('textarea');
        textArea.value = message;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      }
    } catch (error) {
      console.error('خطأ في نسخ النص:', error);
      return false;
    }
  }

  /**
   * مشاركة عبر Web Share API
   */
  static async nativeShare(
    title: string,
    message: string,
    url?: string
  ): Promise<boolean> {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: message,
          url
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('خطأ في المشاركة:', error);
      return false;
    }
  }

  /**
   * تصدير جهات الاتصال من بيانات المعلمين
   */
  static exportTeacherContacts(state: AssignmentState): Contact[] {
    return state.teachers
      .filter(teacher => teacher.isActive)
      .map(teacher => ({
        id: teacher.id,
        name: teacher.name,
        phone: '', // يجب إضافة حقل phone في نوع Teacher
        type: 'teacher' as const,
        isActive: teacher.isActive
      }));
  }

  /**
   * تجميع الرسائل حسب النوع
   */
  static groupMessagesByType(
    state: AssignmentState,
    messageType: 'summary' | 'individual' | 'issues'
  ): { [key: string]: string } {
    const messages: { [key: string]: string } = {};

    switch (messageType) {
      case 'summary':
        messages['الملخص العام'] = this.createSummaryMessage(state);
        break;
      
      case 'individual':
        state.teachers.forEach(teacher => {
          messages[teacher.name] = this.createTeacherMessage(state, teacher.id);
        });
        break;
      
      case 'issues':
        messages['المشاكل والتحديات'] = this.createIssuesMessage(state);
        break;
    }

    return messages;
  }
}

/**
 * واجهات مبسطة للاستخدام السريع
 */

/**
 * إرسال تقرير معلم عبر الواتساب
 */
export function sendTeacherReport(
  state: AssignmentState,
  teacherId: string,
  phone: string,
  options?: MessageOptions
): void {
  const message = WhatsAppUtils.createTeacherMessage(state, teacherId, options);
  WhatsAppUtils.sendIndividualMessage(phone, message);
}

/**
 * إرسال ملخص عام عبر الواتساب
 */
export function sendSummaryReport(
  state: AssignmentState,
  phone: string,
  options?: MessageOptions
): void {
  const message = WhatsAppUtils.createSummaryMessage(state, options);
  WhatsAppUtils.sendIndividualMessage(phone, message);
}

/**
 * إرسال تقرير المشاكل عبر الواتساب
 */
export function sendIssuesReport(
  state: AssignmentState,
  phone: string,
  options?: MessageOptions
): void {
  const message = WhatsAppUtils.createIssuesMessage(state, options);
  WhatsAppUtils.sendIndividualMessage(phone, message);
}

/**
 * نسخ رسالة للحافظة
 */
export async function copyMessage(message: string): Promise<boolean> {
  return WhatsAppUtils.copyToClipboard(message);
}

/**
 * مشاركة رسالة
 */
export async function shareMessage(
  title: string,
  message: string
): Promise<boolean> {
  const shared = await WhatsAppUtils.nativeShare(title, message);
  if (!shared) {
    // إذا فشلت المشاركة الأصلية، انسخ للحافظة
    return WhatsAppUtils.copyToClipboard(message);
  }
  return true;
}