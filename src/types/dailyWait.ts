// أنواع بيانات إدارة الانتظار اليومي
export interface AbsentTeacher {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string; // التاريخ بصيغة YYYY-MM-DD
  hijriDate: string; // التاريخ الهجري
  absenceType: 'full_day' | 'specific_periods';
  periods: number[]; // أرقام الحصص المتأثرة
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherSchedulePeriod {
  periodNumber: number;
  className: string;
  subject: string;
  isAssigned: boolean; // هل تم تعيين معلم بديل
  substituteTeacherId?: string;
  substituteTeacherName?: string;
  isWarning: boolean; // لعرض أيقونة التحذير
}

export interface SubstituteTeacher {
  id: string;
  teacherId: string;
  name: string;
  currentWeeklyLoad: number; // عدد حصص الانتظار هذا الأسبوع
  maxWeeklyLoad: number; // الحد الأقصى للانتظار أسبوعياً
  totalWaitingPeriods: number; // إجمالي حصص الانتظار المسندة
  remainingWaitingPeriods: number; // المتبقي من نصاب الانتظار
  isAvailable: boolean; // متاح للإسناد أم لا
  contactNumber: string;
  whatsappNumber: string;
}

export interface WaitingAssignment {
  id: string;
  absentTeacherId: string;
  absentTeacherName: string;
  substituteTeacherId: string;
  substituteTeacherName: string;
  date: string;
  hijriDate: string;
  periodNumber: number;
  className: string;
  subject: string;
  isNotificationSent: boolean; // هل تم إرسال الإشعار
  isConfirmedBySubstitute: boolean; // هل أكد المعلم البديل
  confirmationTime?: string;
  assignmentMethod: 'auto' | 'manual'; // طريقة الإسناد
  isHidden?: boolean; // مخفي من الطباعة
  createdAt: string;
  updatedAt: string;
}

export interface DailyWaitingReport {
  date: string;
  hijriDate: string;
  assignments: WaitingAssignment[];
  totalAbsentTeachers: number;
  totalAffectedPeriods: number;
  totalAssignedPeriods: number;
  unassignedPeriods: number;
}

export interface WeeklyWaitingReport {
  weekNumber: number;
  startDate: string;
  endDate: string;
  startHijriDate: string;
  endHijriDate: string;
  teachersData: {
    [teacherId: string]: {
      teacherName: string;
      sunday: number[];
      monday: number[];
      tuesday: number[];
      wednesday: number[];
      thursday: number[];
      totalPeriods: number;
    };
  };
}

export interface MonthlyWaitingReport {
  month: number;
  year: number;
  hijriMonth: string;
  hijriYear: number;
  weeklyReports: {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
  };
  teachersMonthlyData: {
    [teacherId: string]: {
      teacherName: string;
      totalPeriods: number;
      weeklyBreakdown: number[];
    };
  };
}

export interface NotificationMessage {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  type: 'whatsapp' | 'sms';
  message: string;
  confirmationLink: string;
  sentAt: string;
  isDelivered: boolean;
  isRead: boolean;
  isConfirmed: boolean;
}

export interface PDFReportData {
  title: string;
  date: string;
  hijriDate: string;
  assignments: WaitingAssignment[];
  schoolInfo: {
    name: string;
    principalName: string;
    vicePrincipalName: string;
  };
}

// أنواع بيانات المعلمين والموظفين الإداريين
export interface StaffMember {
  id: string;
  name: string;
  type: 'teacher' | 'lab_technician' | 'activity_supervisor' | 'vice_principal' | 'student_advisor' | 'principal';
  contactNumber: string;
  whatsappNumber: string;
  isAvailableForSubstitution: boolean;
}

// خيارات التوزيع التلقائي
export interface AutoAssignmentOptions {
  prioritizeScheduledSubstitute: boolean; // الأولوية للمعلم المسند انتظاراً في الجدول
  balanceWorkload: boolean; // توزيع عادل حسب النصاب
  allowManualOverride: boolean; // السماح بالتعديل اليدوي
}

// حالات الانتظار
export type WaitingStatus = 'pending' | 'assigned' | 'confirmed' | 'completed' | 'cancelled';

// أنواع التقارير
export type ReportType = 'daily' | 'weekly' | 'monthly' | 'individual';
export type ReportFormat = 'view' | 'pdf' | 'excel';

// فلاتر البحث والتصفية
export interface WaitingFilters {
  dateFrom?: string;
  dateTo?: string;
  teacherId?: string;
  className?: string;
  subject?: string;
  status?: WaitingStatus;
  assignmentMethod?: 'auto' | 'manual';
}