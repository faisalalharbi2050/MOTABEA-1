// أنواع البيانات لنظام الإشراف اليومي

export interface SupervisionSettings {
  id?: string;
  userId: string;
  weekDays: string[]; // أيام الأسبوع المختارة
  breakCount: number; // عدد الفسح
  breakTimings: BreakTiming[]; // مواعيد الفسح
  supervisorCount: number; // عدد المشرفين (يطبق على جميع الأيام)
  supervisorCountPerDay?: { [key: string]: number }; // عدد المشرفين لكل يوم (اختياري)
  educationalAffairsVice: string; // وكيل الشؤون التعليمية
  principalName: string; // اسم مدير المدرسة
  semester?: string; // الفصل الدراسي
  academicYear?: string; // العام الدراسي
  createdAt?: string;
  updatedAt?: string;
}

export interface BreakTiming {
  breakNumber: number; // رقم الفسحة
  afterLesson: number; // بعد أي حصة (1-7)
}

export interface SupervisionTable {
  id?: string;
  userId: string;
  breakNumber: number; // رقم الفسحة (1-4)
  startDay: string; // يوم البداية
  startDate: string; // تاريخ البداية
  supervisorCount: number; // عدد المشرفين
  educationalAffairsVice: string; // وكيل الشؤون التعليمية
  principalName: string; // اسم مدير المدرسة
  tableData: SupervisionDayData[]; // بيانات الأيام
  status: 'draft' | 'published' | 'archived'; // حالة الجدول
  createdAt?: string;
  updatedAt?: string;
}

export interface SupervisionDayData {
  day: string; // اسم اليوم
  date?: string; // التاريخ (اختياري)
  supervisors: SupervisorEntry[]; // المشرفين
  followupSupervisor?: string; // المشرف المتابع
}

export interface SupervisorEntry {
  id?: string;
  name: string; // اسم المشرف
  position: 'right' | 'left'; // اليمين أو اليسار
  location: string; // موقع الإشراف
  isAutoAssigned: boolean; // تم إسناده تلقائياً؟
  teacherId?: string; // معرف المعلم (للربط مع جدول المعلمين)
}

export interface SupervisionActivation {
  id?: string;
  userId: string;
  tableId: string; // معرف جدول الإشراف
  supervisorId: string; // معرف المشرف
  supervisorName: string; // اسم المشرف
  day: string; // اليوم
  date: string; // التاريخ
  action: 'present' | 'absent' | 'excused' | 'withdrawn' | 'late'; // الإجراء
  actionTime?: string; // وقت الانسحاب أو التأخر
  notes?: string; // ملاحظات
  createdAt?: string;
  updatedAt?: string;
}

export interface SupervisionReport {
  id?: string;
  userId: string;
  supervisorId?: string; // معرف المشرف (اختياري للتقارير الجماعية)
  supervisorName?: string; // اسم المشرف
  reportType: 'weekly' | 'monthly'; // نوع التقرير
  startDate: string; // تاريخ البداية
  endDate: string; // تاريخ النهاية
  excludedDates?: string[]; // أيام الإجازات المستبعدة
  statistics: SupervisionStatistics; // الإحصائيات
  details: SupervisionActivation[]; // تفاصيل التفعيل
  pdfUrl?: string; // رابط ملف PDF
  createdAt?: string;
  updatedAt?: string;
}

export interface SupervisionStatistics {
  totalDays: number; // إجمالي أيام الإشراف
  workingDays: number; // أيام العمل (بعد استبعاد الإجازات)
  fullyActivated: number; // المفعلون بالكامل (حاضر)
  notActivated: number; // غير مفعلون (غائب + مستأذن)
  partiallyActivated: number; // مفعلون جزئياً (منسحب + متأخر)
  activationRate: number; // نسبة التفعيل
}

export interface WeekDay {
  nameAr: string;
  nameEn: string;
  value: string;
}

export const WEEK_DAYS: WeekDay[] = [
  { nameAr: 'السبت', nameEn: 'Saturday', value: 'saturday' },
  { nameAr: 'الأحد', nameEn: 'Sunday', value: 'sunday' },
  { nameAr: 'الاثنين', nameEn: 'Monday', value: 'monday' },
  { nameAr: 'الثلاثاء', nameEn: 'Tuesday', value: 'tuesday' },
  { nameAr: 'الأربعاء', nameEn: 'Wednesday', value: 'wednesday' },
  { nameAr: 'الخميس', nameEn: 'Thursday', value: 'thursday' },
  { nameAr: 'الجمعة', nameEn: 'Friday', value: 'friday' }
];

export const SUPERVISION_ACTIONS = {
  present: { label: 'حاضر', color: 'green', value: 'present' },
  absent: { label: 'غائب', color: 'red', value: 'absent' },
  excused: { label: 'مستأذن', color: 'yellow', value: 'excused' },
  withdrawn: { label: 'منسحب', color: 'orange', value: 'withdrawn' },
  late: { label: 'متأخر', color: 'blue', value: 'late' }
} as const;
