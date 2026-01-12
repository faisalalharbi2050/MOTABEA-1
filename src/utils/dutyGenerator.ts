// خوارزمية توليد جدول المناوبة الذكي
import { DutySettings, DutyTable, DutyDayData, DutyGuardEntry, WEEK_DAYS } from '../types/dailyDuty';

interface Teacher {
  id: string;
  name: string;
  hasSession6th?: boolean;
  hasSession7th?: boolean;
  hasSession5th?: boolean;
  dutyDaysCount?: number;
}

interface Administrator {
  id: string;
  name: string;
  position: string;
}

// دالة توليد التواريخ
export const generateDates = (
  startDate: string,
  weekCount: number,
  selectedDays: string[],
  calendarType: 'hijri' | 'gregorian' = 'hijri'
): DutyDayData[] => {
  const days: DutyDayData[] = [];
  const start = new Date(startDate);
  
  const dayMapping: { [key: string]: number } = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };

  for (let week = 1; week <= weekCount; week++) {
    selectedDays.forEach((dayValue) => {
      const dayIndex = dayMapping[dayValue];
      const currentDate = new Date(start);
      // حساب عدد الأيام من بداية الأسبوع الأول
      const daysToAdd = ((week - 1) * 7) + dayIndex;
      currentDate.setDate(start.getDate() + daysToAdd);

      const dayName = WEEK_DAYS.find(d => d.value === dayValue)?.nameAr || '';
      
      days.push({
        day: dayName,
        date: currentDate.toISOString().split('T')[0],
        hijriDate: formatHijriDate(currentDate),
        gregorianDate: formatGregorianDate(currentDate),
        dutyGuards: []
      });
    });
  }

  return days;
};

// تنسيق التاريخ الهجري
const formatHijriDate = (date: Date): string => {
  try {
    return date.toLocaleDateString('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return date.toLocaleDateString('ar-SA');
  }
};

// تنسيق التاريخ الميلادي
const formatGregorianDate = (date: Date): string => {
  try {
    // استخدام التقويم الميلادي الصريح
    return date.toLocaleDateString('ar-SA-u-ca-gregory', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    // في حالة فشل التنسيق، نستخدم الطريقة اليدوية
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }
};

// الخوارزمية الذكية لتوزيع المناوبين
export const smartDutyDistribution = (
  settings: DutySettings,
  days: DutyDayData[],
  administrators: Administrator[],
  teachers: Teacher[]
): DutyDayData[] => {
  
  // 1. التحقق من عدد الإداريين (مساعد إداري)
  const assistantAdmins = administrators.filter(a => a.position === 'مساعد إداري');
  const useOnlyAdmins = assistantAdmins.length >= 5;

  // 2. إعداد قائمة المناوبين المتاحين
  const availableStaff = useOnlyAdmins ? assistantAdmins : [...assistantAdmins, ...teachers];
  
  // 3. تهيئة عداد الأيام لكل موظف
  const staffDutyCount: { [key: string]: number } = {};
  availableStaff.forEach(staff => {
    staffDutyCount[staff.id] = 0;
  });

  // 4. توزيع المناوبين على الأيام
  const updatedDays = days.map((day, dayIndex) => {
    const dayValue = WEEK_DAYS.find(d => d.nameAr === day.day)?.value || '';
    const guardsNeeded = settings.dutyGuardCountPerDay?.[dayValue] || settings.dutyGuardCount;
    
    const dayGuards: DutyGuardEntry[] = [];

    for (let i = 0; i < guardsNeeded; i++) {
      // البحث عن أفضل مناوب متاح
      const selectedGuard = selectBestGuard(
        availableStaff,
        teachers,
        staffDutyCount,
        useOnlyAdmins,
        dayIndex,
        day
      );

      if (selectedGuard) {
        dayGuards.push({
          id: selectedGuard.id,
          name: selectedGuard.name,
          location: '', // سيتم تحديده يدوياً
          isAutoAssigned: true,
          teacherId: 'id' in selectedGuard ? selectedGuard.id : undefined,
          notes: selectedGuard.notes || ''
        });

        // زيادة العداد
        staffDutyCount[selectedGuard.id]++;
      } else {
        // في حالة عدم توفر مناوب، نضع خانة فارغة
        dayGuards.push({
          id: `empty-${dayIndex}-${i}`,
          name: '',
          location: '',
          isAutoAssigned: false,
          notes: 'يرجى الاختيار يدوياً'
        });
      }
    }

    return {
      ...day,
      dutyGuards: dayGuards
    };
  });

  return updatedDays;
};

// اختيار أفضل مناوب متاح
const selectBestGuard = (
  availableStaff: any[],
  teachers: Teacher[],
  staffDutyCount: { [key: string]: number },
  useOnlyAdmins: boolean,
  dayIndex: number,
  day: DutyDayData
): any => {
  
  if (useOnlyAdmins) {
    // إذا كان استخدام الإداريين فقط، اختر الأقل مناوبة
    return selectLeastAssignedStaff(availableStaff, staffDutyCount);
  }

  // البحث عن معلمين مؤهلين حسب الشروط
  const qualifiedTeachers = teachers.filter(t => {
    // شرط 1: لديه حصة 7 أو 6
    if (t.hasSession7th || t.hasSession6th) return true;
    // شرط 2: لديه حصة 5
    if (t.hasSession5th) return true;
    return false;
  });

  if (qualifiedTeachers.length > 0) {
    // اختيار المعلم الأقل مناوبة من المؤهلين
    return selectLeastAssignedStaff(qualifiedTeachers, staffDutyCount);
  }

  // قائمة الاحتياط: معلمين لديهم حصص قريبة
  const backupTeachers = teachers.filter(t => 
    !qualifiedTeachers.includes(t) && (t.hasSession5th || t.hasSession6th)
  );

  if (backupTeachers.length > 0) {
    const backup = selectLeastAssignedStaff(backupTeachers, staffDutyCount);
    return {
      ...backup,
      notes: '⚠️ احتياط - يفضل التغيير'
    };
  }

  // إذا لم يتوفر أحد، نختار من الإداريين
  const admins = availableStaff.filter(s => 'position' in s);
  if (admins.length > 0) {
    return selectLeastAssignedStaff(admins, staffDutyCount);
  }

  return null;
};

// اختيار الموظف الأقل مناوبة
const selectLeastAssignedStaff = (
  staff: any[],
  staffDutyCount: { [key: string]: number }
): any => {
  if (staff.length === 0) return null;

  return staff.reduce((least, current) => {
    const leastCount = staffDutyCount[least.id] || 0;
    const currentCount = staffDutyCount[current.id] || 0;
    return currentCount < leastCount ? current : least;
  });
};

// دالة حساب إحصائيات التوزيع
export const calculateDistributionStats = (
  days: DutyDayData[]
): { [staffId: string]: { name: string; count: number } } => {
  const stats: { [staffId: string]: { name: string; count: number } } = {};

  days.forEach(day => {
    day.dutyGuards.forEach(guard => {
      if (guard.id && guard.name) {
        if (!stats[guard.id]) {
          stats[guard.id] = { name: guard.name, count: 0 };
        }
        stats[guard.id].count++;
      }
    });
  });

  return stats;
};

// دالة التحقق من التعارضات
export const checkConflicts = (
  days: DutyDayData[],
  teacherSchedules?: any
): string[] => {
  const conflicts: string[] = [];

  days.forEach((day, index) => {
    day.dutyGuards.forEach(guard => {
      // التحقق من عدم تكرار نفس المناوب في نفس اليوم
      const sameDayGuards = day.dutyGuards.filter(g => g.id === guard.id);
      if (sameDayGuards.length > 1) {
        conflicts.push(`تكرار المناوب ${guard.name} في ${day.day} ${day.date}`);
      }

      // يمكن إضافة المزيد من الفحوصات هنا
    });
  });

  return conflicts;
};
