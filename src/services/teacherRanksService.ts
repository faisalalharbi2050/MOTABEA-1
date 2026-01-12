import { useState, useEffect } from 'react';

// أنواع المراتب المهنية
export type TeacherRank = 'ممارس' | 'متقدم' | 'خبير';

// واجهة بيانات المرتبة
export interface TeacherRankData {
  teacherId: string;
  rank: TeacherRank;
  quotaWeekly: number;
  waitingQuota: number;
  updatedAt: Date;
}

// نصاب الحصص حسب المرتبة والتخصص
const QUOTA_MAPPING: Record<TeacherRank, { general: number; special: number; waiting: number }> = {
  'ممارس': { general: 24, special: 18, waiting: 5 },
  'متقدم': { general: 22, special: 16, waiting: 5 },
  'خبير': { general: 18, special: 14, waiting: 5 }
};

// التخصصات الخاصة (التربية الخاصة)
const SPECIAL_EDUCATION_SPECIALIZATIONS = [
  'تربية فكرية',
  'صعوبات تعلم',
  'توحد',
  'إعاقة',
  'تربية خاصة'
];

// فئة خدمة مراتب المعلمين
class TeacherRanksService {
  private ranks: Map<string, TeacherRankData> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  // تحميل البيانات من التخزين المحلي
  private loadFromStorage() {
    const stored = localStorage.getItem('teacher-ranks');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.ranks = new Map(data.map((item: any) => [
          item.teacherId,
          {
            ...item,
            updatedAt: new Date(item.updatedAt)
          }
        ]));
      } catch (error) {
        console.error('Error loading teacher ranks from storage:', error);
      }
    }
  }

  // حفظ البيانات في التخزين المحلي
  private saveToStorage() {
    const data = Array.from(this.ranks.values());
    localStorage.setItem('teacher-ranks', JSON.stringify(data));
  }

  // إشعار المستمعين بالتغييرات
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // إضافة مستمع للتغييرات
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // تحديد النصاب الأسبوعي للمعلم حسب المرتبة والتخصص
  calculateQuota(rank: TeacherRank, specialization: string): { weekly: number; waiting: number } {
    const quotaData = QUOTA_MAPPING[rank];
    const isSpecialEducation = SPECIAL_EDUCATION_SPECIALIZATIONS.some(spec => 
      specialization.toLowerCase().includes(spec.toLowerCase())
    );
    
    return {
      weekly: isSpecialEducation ? quotaData.special : quotaData.general,
      waiting: quotaData.waiting
    };
  }

  // تعيين مرتبة معلم
  setTeacherRank(teacherId: string, rank: TeacherRank, specialization: string = '') {
    const { weekly, waiting } = this.calculateQuota(rank, specialization);
    
    const rankData: TeacherRankData = {
      teacherId,
      rank,
      quotaWeekly: weekly,
      waitingQuota: waiting,
      updatedAt: new Date()
    };

    this.ranks.set(teacherId, rankData);
    this.saveToStorage();
    this.notifyListeners();
  }

  // الحصول على مرتبة معلم
  getTeacherRank(teacherId: string): TeacherRankData | null {
    return this.ranks.get(teacherId) || null;
  }

  // الحصول على جميع المراتب
  getAllRanks(): TeacherRankData[] {
    return Array.from(this.ranks.values());
  }

  // تعيين مراتب متعددة دفعة واحدة
  setMultipleRanks(updates: Array<{ teacherId: string; rank: TeacherRank; specialization?: string }>) {
    updates.forEach(({ teacherId, rank, specialization = '' }) => {
      const { weekly, waiting } = this.calculateQuota(rank, specialization);
      
      const rankData: TeacherRankData = {
        teacherId,
        rank,
        quotaWeekly: weekly,
        waitingQuota: waiting,
        updatedAt: new Date()
      };

      this.ranks.set(teacherId, rankData);
    });

    this.saveToStorage();
    this.notifyListeners();
  }

  // حذف مرتبة معلم
  removeTeacherRank(teacherId: string) {
    this.ranks.delete(teacherId);
    this.saveToStorage();
    this.notifyListeners();
  }

  // مسح جميع المراتب
  clearAllRanks() {
    this.ranks.clear();
    this.saveToStorage();
    this.notifyListeners();
  }

  // الحصول على المراتب حسب المرتبة
  getRanksByLevel(rank: TeacherRank): TeacherRankData[] {
    return Array.from(this.ranks.values()).filter(data => data.rank === rank);
  }

  // إحصائيات المراتب
  getRankStatistics() {
    const all = Array.from(this.ranks.values());
    const total = all.length;
    
    const byRank = {
      'ممارس': all.filter(r => r.rank === 'ممارس').length,
      'متقدم': all.filter(r => r.rank === 'متقدم').length,
      'خبير': all.filter(r => r.rank === 'خبير').length
    };

    const averageQuota = total > 0 ? 
      all.reduce((sum, r) => sum + r.quotaWeekly, 0) / total : 0;

    return {
      total,
      byRank,
      averageQuota: Math.round(averageQuota * 100) / 100
    };
  }

  // تصدير البيانات
  exportData(): string {
    const data = Array.from(this.ranks.values());
    return JSON.stringify(data, null, 2);
  }

  // استيراد البيانات
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data)) {
        this.ranks.clear();
        data.forEach((item: any) => {
          const rankData: TeacherRankData = {
            teacherId: item.teacherId,
            rank: item.rank,
            quotaWeekly: item.quotaWeekly,
            waitingQuota: item.waitingQuota,
            updatedAt: new Date(item.updatedAt)
          };
          this.ranks.set(item.teacherId, rankData);
        });
        this.saveToStorage();
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      console.error('Error importing teacher ranks data:', error);
    }
    return false;
  }
}

// إنشاء مثيل وحيد من الخدمة
export const teacherRanksService = new TeacherRanksService();

// هوك لاستخدام خدمة مراتب المعلمين
export function useTeacherRanks() {
  const [ranks, setRanks] = useState<TeacherRankData[]>([]);

  useEffect(() => {
    // تحميل البيانات الأولية
    setRanks(teacherRanksService.getAllRanks());

    // الاشتراك في التحديثات
    const unsubscribe = teacherRanksService.subscribe(() => {
      setRanks(teacherRanksService.getAllRanks());
    });

    return () => unsubscribe();
  }, []);

  return {
    ranks,
    setTeacherRank: teacherRanksService.setTeacherRank.bind(teacherRanksService),
    getTeacherRank: teacherRanksService.getTeacherRank.bind(teacherRanksService),
    setMultipleRanks: teacherRanksService.setMultipleRanks.bind(teacherRanksService),
    removeTeacherRank: teacherRanksService.removeTeacherRank.bind(teacherRanksService),
    clearAllRanks: teacherRanksService.clearAllRanks.bind(teacherRanksService),
    getRanksByLevel: teacherRanksService.getRanksByLevel.bind(teacherRanksService),
    getRankStatistics: teacherRanksService.getRankStatistics.bind(teacherRanksService),
    calculateQuota: teacherRanksService.calculateQuota.bind(teacherRanksService),
    exportData: teacherRanksService.exportData.bind(teacherRanksService),
    importData: teacherRanksService.importData.bind(teacherRanksService)
  };
}

// مساعدات إضافية
export const RANK_OPTIONS: { value: TeacherRank; label: string; color: string }[] = [
  { value: 'ممارس', label: 'معلم ممارس', color: '#3498db' },
  { value: 'متقدم', label: 'معلم متقدم', color: '#e67e22' },
  { value: 'خبير', label: 'معلم خبير', color: '#27ae60' }
];

export const getRankColor = (rank: TeacherRank): string => {
  const option = RANK_OPTIONS.find(opt => opt.value === rank);
  return option?.color || '#95a5a6';
};

export const getRankLabel = (rank: TeacherRank): string => {
  const option = RANK_OPTIONS.find(opt => opt.value === rank);
  return option?.label || rank;
};

export default teacherRanksService;