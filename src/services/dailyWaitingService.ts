// خدمات إدارة الانتظار اليومي
import { 
  AbsentTeacher, 
  WaitingAssignment, 
  SubstituteTeacher, 
  StaffMember,
  WeeklyWaitingReport,
  MonthlyWaitingReport,
  NotificationMessage
} from '@/types/dailyWait';

class DailyWaitingService {
  // قاعدة بيانات محلية محاكاة
  private absentTeachers: AbsentTeacher[] = [];
  private waitingAssignments: WaitingAssignment[] = [];
  private notifications: NotificationMessage[] = [];

  // إضافة معلم غائب
  addAbsentTeacher(absentTeacher: AbsentTeacher): void {
    this.absentTeachers.push(absentTeacher);
  }

  // الحصول على المعلمين الغائبين
  getAbsentTeachers(date?: string): AbsentTeacher[] {
    if (date) {
      return this.absentTeachers.filter(teacher => teacher.date === date);
    }
    return this.absentTeachers;
  }

  // إضافة إسناد انتظار
  addWaitingAssignment(assignment: WaitingAssignment): void {
    this.waitingAssignments.push(assignment);
  }

  // الحصول على إسنادات الانتظار
  getWaitingAssignments(date?: string): WaitingAssignment[] {
    if (date) {
      return this.waitingAssignments.filter(assignment => assignment.date === date);
    }
    return this.waitingAssignments;
  }

  // تحديث حالة الإشعار
  updateNotificationStatus(assignmentId: string, status: Partial<NotificationMessage>): void {
    const notification = this.notifications.find(n => n.id === assignmentId);
    if (notification) {
      Object.assign(notification, status);
    }
  }

  // خوارزمية التوزيع التلقائي المتقدمة
  autoAssignSubstitutes(
    absentTeacherSchedule: { periodNumber: number; className: string; subject: string }[],
    availableTeachers: SubstituteTeacher[]
  ): string[] {
    // ترتيب المعلمين حسب الأولوية (الأقل نصاباً أولاً)
    const sortedTeachers = [...availableTeachers]
      .filter(teacher => teacher.isAvailable && teacher.remainingWaitingPeriods > 0)
      .sort((a, b) => {
        // الأولوية للمعلم الأقل نصابًا الحالي
        if (a.currentWeeklyLoad !== b.currentWeeklyLoad) {
          return a.currentWeeklyLoad - b.currentWeeklyLoad;
        }
        // إذا تساووا، الأولوية للأكثر نصابًا متبقيًا
        return b.remainingWaitingPeriods - a.remainingWaitingPeriods;
      });

    const assignments: string[] = [];
    let teacherIndex = 0;

    for (const period of absentTeacherSchedule) {
      if (sortedTeachers.length > 0) {
        const selectedTeacher = sortedTeachers[teacherIndex % sortedTeachers.length];
        assignments.push(selectedTeacher.id);
        
        // تحديث النصاب
        selectedTeacher.currentWeeklyLoad++;
        selectedTeacher.remainingWaitingPeriods--;
        
        // إذا وصل للحد الأقصى، أزله من القائمة
        if (selectedTeacher.remainingWaitingPeriods <= 0) {
          sortedTeachers.splice(teacherIndex, 1);
          if (teacherIndex >= sortedTeachers.length) {
            teacherIndex = 0;
          }
        } else {
          teacherIndex = (teacherIndex + 1) % sortedTeachers.length;
        }
      }
    }

    return assignments;
  }

  // تحويل التاريخ للهجري (مبسط)
  convertToHijri(gregorianDate: string): string {
    const date = new Date(gregorianDate);
    const hijriYear = date.getFullYear() - 579;
    const hijriMonth = date.getMonth() + 1;
    const hijriDay = date.getDate();
    return `${hijriDay}/${hijriMonth}/${hijriYear}هـ`;
  }

  // الحصول على اسم اليوم
  getDayName(date: string): string {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayIndex = new Date(date).getDay();
    return days[dayIndex];
  }

  // إنشاء رسالة إشعار
  generateNotificationMessage(
    assignment: WaitingAssignment, 
    type: 'whatsapp' | 'sms',
    schoolName: string
  ): string {
    const dayName = this.getDayName(assignment.date);
    
    if (type === 'sms') {
      return `انتظار ح${assignment.periodNumber} ${assignment.className} ${dayName} ${assignment.date} بدلاً من ${assignment.absentTeacherName}. تأكيد: motabea.edu.sa/c/${assignment.id}`;
    }

    return `
🏫 ${schoolName}

السلام عليكم أستاذ/ة ${assignment.substituteTeacherName}

نأمل منكم تسديد حصة انتظار:
📅 يوم: ${dayName}
🗓️ التاريخ: ${assignment.date} (${assignment.hijriDate})
⏰ الحصة: ${assignment.periodNumber}
🏛️ الفصل: ${assignment.className}
📚 المادة: ${assignment.subject}
👨‍🏫 بدلاً من: ${assignment.absentTeacherName}

يرجى تأكيد الحضور:
https://motabea.edu.sa/confirm/${assignment.id}

شكراً لتعاونكم
إدارة المدرسة`.trim();
  }

  // إنشاء تقرير أسبوعي
  generateWeeklyReport(weekNumber: number, year: number): WeeklyWaitingReport {
    const startDate = this.getWeekStartDate(weekNumber, year);
    const endDate = this.getWeekEndDate(weekNumber, year);
    
    // تجميع البيانات حسب المعلم
    const teachersData: {[key: string]: any} = {};
    
    this.waitingAssignments
      .filter(assignment => {
        const assignmentDate = new Date(assignment.date);
        return assignmentDate >= startDate && assignmentDate <= endDate;
      })
      .forEach(assignment => {
        if (!teachersData[assignment.substituteTeacherId]) {
          teachersData[assignment.substituteTeacherId] = {
            teacherName: assignment.substituteTeacherName,
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            totalPeriods: 0
          };
        }

        const dayName = this.getDayOfWeek(assignment.date);
        const dayKey = this.getDayKey(dayName);
        
        if (dayKey && teachersData[assignment.substituteTeacherId][dayKey]) {
          teachersData[assignment.substituteTeacherId][dayKey].push(assignment.periodNumber);
          teachersData[assignment.substituteTeacherId].totalPeriods++;
        }
      });

    return {
      weekNumber,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      startHijriDate: this.convertToHijri(startDate.toISOString().split('T')[0]),
      endHijriDate: this.convertToHijri(endDate.toISOString().split('T')[0]),
      teachersData
    };
  }

  // إنشاء تقرير شهري
  generateMonthlyReport(month: number, year: number): MonthlyWaitingReport {
    const hijriMonths = [
      'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
      'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];
    
    const teachersMonthlyData: {[key: string]: any} = {};
    
    // تجميع البيانات الشهرية
    this.waitingAssignments
      .filter(assignment => {
        const assignmentDate = new Date(assignment.date);
        return assignmentDate.getMonth() + 1 === month && assignmentDate.getFullYear() === year;
      })
      .forEach(assignment => {
        if (!teachersMonthlyData[assignment.substituteTeacherId]) {
          teachersMonthlyData[assignment.substituteTeacherId] = {
            teacherName: assignment.substituteTeacherName,
            totalPeriods: 0,
            weeklyBreakdown: [0, 0, 0, 0]
          };
        }
        
        teachersMonthlyData[assignment.substituteTeacherId].totalPeriods++;
        
        // تحديد الأسبوع
        const weekNumber = this.getWeekOfMonth(assignment.date);
        if (weekNumber >= 0 && weekNumber < 4) {
          teachersMonthlyData[assignment.substituteTeacherId].weeklyBreakdown[weekNumber]++;
        }
      });

    return {
      month,
      year,
      hijriMonth: hijriMonths[month - 1] || 'محرم',
      hijriYear: year - 579,
      weeklyReports: {
        week1: Object.values(teachersMonthlyData).reduce((sum: number, teacher: any) => sum + teacher.weeklyBreakdown[0], 0),
        week2: Object.values(teachersMonthlyData).reduce((sum: number, teacher: any) => sum + teacher.weeklyBreakdown[1], 0),
        week3: Object.values(teachersMonthlyData).reduce((sum: number, teacher: any) => sum + teacher.weeklyBreakdown[2], 0),
        week4: Object.values(teachersMonthlyData).reduce((sum: number, teacher: any) => sum + teacher.weeklyBreakdown[3], 0)
      },
      teachersMonthlyData
    };
  }

  // دوال مساعدة
  private getWeekStartDate(weekNumber: number, year: number): Date {
    const date = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7;
    date.setDate(date.getDate() + daysToAdd);
    return date;
  }

  private getWeekEndDate(weekNumber: number, year: number): Date {
    const startDate = this.getWeekStartDate(weekNumber, year);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return endDate;
  }

  private getDayOfWeek(date: string): number {
    return new Date(date).getDay();
  }

  private getDayKey(dayNumber: number): string | null {
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayKeys[dayNumber] || null;
  }

  private getWeekOfMonth(date: string): number {
    const d = new Date(date);
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const dayOfMonth = d.getDate();
    const weekNumber = Math.ceil((dayOfMonth + firstDay.getDay()) / 7) - 1;
    return Math.min(weekNumber, 3); // محدود بـ 4 أسابيع
  }

  // إعادة تعيين البيانات الأسبوعية (كل خميس)
  resetWeeklyData(): void {
    // محاكاة إعادة تعيين عداد الحصص الأسبوعية
    console.log('تم إعادة تعيين البيانات الأسبوعية');
  }

  // حفظ البيانات في localStorage (محاكاة قاعدة البيانات)
  saveToLocalStorage(): void {
    localStorage.setItem('dailyWaiting_absentTeachers', JSON.stringify(this.absentTeachers));
    localStorage.setItem('dailyWaiting_assignments', JSON.stringify(this.waitingAssignments));
    localStorage.setItem('dailyWaiting_notifications', JSON.stringify(this.notifications));
  }

  // تحميل البيانات من localStorage
  loadFromLocalStorage(): void {
    const absentTeachers = localStorage.getItem('dailyWaiting_absentTeachers');
    const assignments = localStorage.getItem('dailyWaiting_assignments');
    const notifications = localStorage.getItem('dailyWaiting_notifications');

    if (absentTeachers) {
      this.absentTeachers = JSON.parse(absentTeachers);
    }
    if (assignments) {
      this.waitingAssignments = JSON.parse(assignments);
    }
    if (notifications) {
      this.notifications = JSON.parse(notifications);
    }
  }
}

// تصدير instance واحد (Singleton)
export const dailyWaitingService = new DailyWaitingService();
export default DailyWaitingService;