// أنواع البيانات لنظام المناوبة اليومية

export interface DutySettings {
  id?: string;
  userId: string;
  weekDays: string[]; // أيام الأسبوع المختارة
  weekCount: number; // عدد الأسابيع الدراسية (1-40)
  useCustomWeeks: boolean; // تفعيل تخصيص الأيام لكل أسبوع
  customWeeks?: CustomWeek[]; // الأسابيع المخصصة
  firstWeekStartDate: string; // تاريخ بداية الأسبوع الأول
  dutyGuardCount: number; // عدد المناوبين (يطبق على جميع الأيام)
  dutyGuardCountPerDay?: { [key: string]: number }; // عدد المناوبين لكل يوم (اختياري)
  educationalAffairsVice: string; // وكيل الشؤون التعليمية
  principalName: string; // اسم مدير المدرسة
  semester?: string; // الفصل الدراسي
  academicYear?: string; // العام الدراسي
  calendarType: 'hijri' | 'gregorian'; // نوع التقويم
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomWeek {
  weekNumber: number; // رقم الأسبوع
  selectedDays: string[]; // الأيام المحددة لهذا الأسبوع
}

export interface DutyTable {
  id?: string;
  userId: string;
  weekNumber: number; // رقم الأسبوع
  startDate: string; // تاريخ بداية الأسبوع
  endDate: string; // تاريخ نهاية الأسبوع
  dutyGuardCount: number; // عدد المناوبين
  educationalAffairsVice: string; // وكيل الشؤون التعليمية
  principalName: string; // اسم مدير المدرسة
  tableData: DutyDayData[]; // بيانات الأيام
  status: 'draft' | 'published' | 'archived'; // حالة الجدول
  createdAt?: string;
  updatedAt?: string;
}

export interface DutyDayData {
  day: string; // اسم اليوم
  date: string; // التاريخ
  hijriDate?: string; // التاريخ الهجري
  gregorianDate?: string; // التاريخ الميلادي
  dutyGuards: DutyGuardEntry[]; // المناوبين
}

export interface DutyGuardEntry {
  id?: string;
  name: string; // اسم المناوب
  type?: string; // نوع المناوب (إداري/معلم)
  location?: string; // موقع المناوبة
  isAutoAssigned?: boolean; // تم إسناده تلقائياً؟
  teacherId?: string; // معرف المعلم (للربط مع جدول المعلمين)
  notes?: string; // ملاحظات
}

export interface DutyActivation {
  id?: string;
  userId: string;
  tableId: string; // معرف جدول المناوبة
  dutyGuardId: string; // معرف المناوب
  dutyGuardName: string; // اسم المناوب
  day: string; // اليوم
  date: string; // التاريخ
  action: 'present' | 'absent' | 'excused' | 'withdrawn' | 'late'; // الإجراء
  actionTime?: string; // وقت الانسحاب أو التأخر
  notes?: string; // ملاحظات
  createdAt?: string;
  updatedAt?: string;
}

export interface DutyReport {
  id?: string;
  userId: string;
  dutyGuardId?: string; // معرف المناوب (اختياري للتقارير الجماعية)
  dutyGuardName?: string; // اسم المناوب
  reportType: 'weekly' | 'monthly'; // نوع التقرير
  startDate: string; // تاريخ البداية
  endDate: string; // تاريخ النهاية
  excludedDates?: string[]; // أيام الإجازات المستبعدة
  statistics: DutyStatistics; // الإحصائيات
  details: DutyActivation[]; // تفاصيل التفعيل
  pdfUrl?: string; // رابط ملف PDF
  createdAt?: string;
  updatedAt?: string;
}

export interface DutyStatistics {
  totalDays: number; // إجمالي أيام المناوبة
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

export const DUTY_ACTIONS = {
  present: { label: 'حاضر', color: 'green', value: 'present' },
  absent: { label: 'غائب', color: 'red', value: 'absent' },
  excused: { label: 'مستأذن', color: 'yellow', value: 'excused' },
  withdrawn: { label: 'منسحب', color: 'orange', value: 'withdrawn' },
  late: { label: 'متأخر', color: 'blue', value: 'late' }
} as const;
