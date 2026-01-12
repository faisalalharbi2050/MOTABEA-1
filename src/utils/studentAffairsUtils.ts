/**
 * نظام متابعة التأخر والتنبيهات التراكمية
 * يوفر دوال لحساب التأخير وإدارة التنبيهات
 */

export interface LateRecord {
  id: string;
  studentId: string;
  studentName: string;
  classRoom: string;
  arrivalTime: string;
  lateMinutes: number;
  date: string;
  status: 'pending' | 'notified' | 'printed';
}

export interface AlertThreshold {
  days: number;
  message: string;
  type: 'consecutive' | 'total';
}

// عتبات التنبيهات (5، 10، 15، 20 يوم)
export const ALERT_THRESHOLDS: AlertThreshold[] = [
  { days: 5, message: 'تنبيه: الطالب متأخر 5 أيام', type: 'total' },
  { days: 10, message: 'تنبيه مهم: الطالب متأخر 10 أيام', type: 'total' },
  { days: 15, message: 'تنبيه عاجل: الطالب متأخر 15 يوم', type: 'total' },
  { days: 20, message: 'تنبيه حرج: الطالب متأخر 20 يوم', type: 'total' },
];

/**
 * حساب مقدار التأخير بالدقائق
 */
export const calculateLateMinutes = (
  arrivalTime: string,
  expectedTime: string = '07:00'
): number => {
  const [expectedHours, expectedMinutes] = expectedTime.split(':').map(Number);
  const [actualHours, actualMinutes] = arrivalTime.split(':').map(Number);
  
  const expectedTotalMinutes = expectedHours * 60 + expectedMinutes;
  const actualTotalMinutes = actualHours * 60 + actualMinutes;
  
  return Math.max(0, actualTotalMinutes - expectedTotalMinutes);
};

/**
 * تحديد ما إذا كان يجب إرسال تنبيه بناءً على عدد أيام التأخر
 */
export const shouldSendAlert = (
  lateDaysCount: number,
  lastAlertAt: number = 0
): { shouldSend: boolean; threshold?: AlertThreshold } => {
  // البحث عن العتبة المناسبة
  const applicableThreshold = ALERT_THRESHOLDS
    .reverse()
    .find(threshold => lateDaysCount >= threshold.days);
  
  if (!applicableThreshold) {
    return { shouldSend: false };
  }
  
  // التحقق من أن آخر تنبيه كان عند عتبة أقل
  if (lateDaysCount >= applicableThreshold.days && lastAlertAt < applicableThreshold.days) {
    return { shouldSend: true, threshold: applicableThreshold };
  }
  
  return { shouldSend: false };
};

/**
 * تنسيق الوقت للعرض
 */
export const formatTime = (time: string): string => {
  return time;
};

/**
 * حساب إحصائيات التأخر لطالب معين
 */
export const calculateStudentLateStats = (
  records: LateRecord[],
  studentId: string
) => {
  const studentRecords = records.filter(r => r.studentId === studentId);
  const totalLateDays = studentRecords.length;
  const totalLateMinutes = studentRecords.reduce((sum, r) => sum + r.lateMinutes, 0);
  const averageLateMinutes = totalLateDays > 0 ? Math.round(totalLateMinutes / totalLateDays) : 0;
  
  // حساب الأيام المتصلة
  const sortedDates = studentRecords
    .map(r => new Date(r.date))
    .sort((a, b) => b.getTime() - a.getTime());
  
  let consecutiveDays = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      consecutiveDays = 1;
      continue;
    }
    
    const daysDiff = Math.abs(
      (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff === 1) {
      consecutiveDays++;
    } else {
      break;
    }
  }
  
  return {
    totalLateDays,
    consecutiveDays,
    totalLateMinutes,
    averageLateMinutes,
    lastLateDate: sortedDates[0] || null
  };
};

/**
 * توليد رسالة واتساب لولي الأمر
 */
export const generateGuardianMessage = (
  studentName: string,
  arrivalTime: string,
  lateMinutes: number,
  date: string
): string => {
  return `عزيزي ولي الأمر،

نحيطكم علماً بأن نجلكم/نجلتكم ${studentName} قد تأخر عن الطابور الصباحي.

📅 التاريخ: ${date}
🕐 وقت الحضور: ${arrivalTime}
⏱ مقدار التأخير: ${lateMinutes} دقيقة

نأمل منكم متابعة الأمر وحث نجلكم/نجلتكم على الالتزام بالحضور في الموعد المحدد.

شكراً لتعاونكم
إدارة المدرسة`;
};

/**
 * توليد رسالة تنبيه للوكيل
 */
export const generateVicePrincipalAlert = (
  studentName: string,
  studentId: string,
  classRoom: string,
  lateDaysCount: number,
  consecutiveDays: number
): string => {
  const isConsecutive = consecutiveDays >= 3;
  
  return `🔔 تنبيه: تأخر متكرر

👤 الطالب: ${studentName}
🆔 الرقم: ${studentId}
🏫 الفصل: ${classRoom}

📊 الإحصائيات:
• عدد أيام التأخر: ${lateDaysCount}
• أيام متصلة: ${consecutiveDays}
${isConsecutive ? '⚠️ تأخر متصل يتطلب متابعة فورية' : ''}

يرجى اتخاذ الإجراء المناسب.`;
};

/**
 * حساب نسبة التأخر في فصل معين
 */
export const calculateClassLatePercentage = (
  records: LateRecord[],
  classRoom: string,
  totalStudents: number,
  date: string
): number => {
  const classLateRecords = records.filter(
    r => r.classRoom === classRoom && r.date === date
  );
  
  if (totalStudents === 0) return 0;
  
  return Math.round((classLateRecords.length / totalStudents) * 100);
};

/**
 * توليد تقرير التأخر اليومي
 */
export const generateDailyLateReport = (
  records: LateRecord[],
  date: string
) => {
  const dailyRecords = records.filter(r => r.date === date);
  
  const totalLate = dailyRecords.length;
  const averageLateMinutes = totalLate > 0
    ? Math.round(dailyRecords.reduce((sum, r) => sum + r.lateMinutes, 0) / totalLate)
    : 0;
  
  // تجميع حسب الفصل
  const byClass = dailyRecords.reduce((acc, record) => {
    if (!acc[record.classRoom]) {
      acc[record.classRoom] = [];
    }
    acc[record.classRoom].push(record);
    return acc;
  }, {} as Record<string, LateRecord[]>);
  
  return {
    date,
    totalLate,
    averageLateMinutes,
    byClass,
    records: dailyRecords
  };
};

/**
 * التحقق من انتهاء صلاحية رابط الوصول السريع
 */
export const isLinkExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};

/**
 * توليد رمز رابط وصول سريع
 */
export const generateAccessToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * حساب وقت انتهاء صلاحية الرابط (ساعة واحدة)
 */
export const calculateLinkExpiry = (): Date => {
  return new Date(Date.now() + 60 * 60 * 1000);
};
