/**
 * نظام الصلاحيات المتقدم
 * Advanced Permissions System Types
 */

// أنواع الأقسام المتاحة في النظام (الصلاحيات الستة المعتمدة)
export type ModuleKey = 
  | 'settings'            // الإعدادات العامة
  | 'schedule'            // الجدول المدرسي
  | 'supervision'         // الإشراف والمناوبة
  | 'daily-waiting'       // الانتظار اليومي
  | 'student-forms'       // نماذج شؤون الطلاب
  | 'messages';           // الرسائل

// أنواع الصلاحيات داخل كل قسم
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'print';

// واجهة الصلاحية الواحدة
export interface ModulePermission {
  module: ModuleKey;
  actions: PermissionAction[];
  enabled: boolean;
}

// معلومات القسم
export interface ModuleInfo {
  key: ModuleKey;
  nameAr: string;
  nameEn: string;
  icon: string;
  description: string;
  category: 'main' | 'academic' | 'student' | 'reports' | 'settings';
}

// مستوى الوصول العام
export type AccessLevel = 'admin' | 'manager' | 'user' | 'custom';

// الصفة (منصب المستخدم)
export type UserRole = 'principal' | 'vice-principal' | 'other';

// واجهة المستخدم
export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  password: string;
  quickAccessPin: string;        // رقم الدخول السريع (4 أرقام)
  accessLevel: AccessLevel;
  role: UserRole;                // الصفة
  permissions: ModulePermission[];
  source: 'teacher' | 'administrator' | 'manual'; // مصدر البيانات
  sourceId?: string;             // معرف المصدر (معلم أو إداري)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;             // من قام بإنشاء المستخدم
  lastLogin?: Date;
}

// واجهة إنشاء مستخدم جديد
export interface CreateUserInput {
  username?: string;              // اختياري للإضافة اليدوية
  name: string;
  email?: string;
  phone: string;                  // مطلوب
  password?: string;              // اختياري
  quickAccessPin?: string;        // اختياري - سيتم توليده تلقائياً
  accessLevel: AccessLevel;
  role: UserRole;                 // الصفة
  permissions: ModulePermission[];
  source: 'teacher' | 'administrator' | 'manual';
  sourceId?: string;
}

// واجهة تحديث المستخدم
export interface UpdateUserInput {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  quickAccessPin?: string;
  accessLevel?: AccessLevel;
  role?: UserRole;               // الصفة
  permissions?: ModulePermission[];
  isActive?: boolean;
}

// واجهة تسجيل الدخول
export interface LoginCredentials {
  type: 'username' | 'quick-access';
  username?: string;
  password?: string;
  quickAccessPin?: string;
}

// واجهة الاستجابة من تسجيل الدخول
export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// واجهة الفلتر والبحث
export interface UserFilter {
  search?: string;
  accessLevel?: AccessLevel;
  source?: 'teacher' | 'administrator' | 'manual';
  isActive?: boolean;
  module?: ModuleKey;
}

// واجهة إحصائيات الصلاحيات
export interface PermissionsStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByAccessLevel: {
    admin: number;
    manager: number;
    user: number;
    custom: number;
  };
  usersBySource: {
    teacher: number;
    administrator: number;
    manual: number;
  };
  totalModules: number;
}

// قوالب الصلاحيات المعرفة مسبقاً
export interface PermissionTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  accessLevel: AccessLevel;
  permissions: ModulePermission[];
}

// سجل تغييرات الصلاحيات
export interface PermissionLog {
  id: string;
  userId: string;
  userName: string;
  action: 'created' | 'updated' | 'deleted' | 'login' | 'logout' | 'permission_changed';
  details: string;
  timestamp: Date;
  performedBy: string;
  performedByName: string;
  ipAddress?: string;
}

// الأقسام المتاحة مع معلوماتها (الصلاحيات الستة فقط)
export const AVAILABLE_MODULES: ModuleInfo[] = [
  {
    key: 'settings',
    nameAr: 'الإعدادات العامة',
    nameEn: 'General Settings',
    icon: 'Settings',
    description: 'إعدادات النظام العامة',
    category: 'settings'
  },
  {
    key: 'schedule',
    nameAr: 'الجدول المدرسي',
    nameEn: 'School Schedule',
    icon: 'Calendar',
    description: 'إدارة الجداول الدراسية',
    category: 'academic'
  },
  {
    key: 'supervision',
    nameAr: 'الإشراف والمناوبة',
    nameEn: 'Supervision & Duty',
    icon: 'Eye',
    description: 'نظام الإشراف والمناوبة اليومية',
    category: 'academic'
  },
  {
    key: 'daily-waiting',
    nameAr: 'الانتظار اليومي',
    nameEn: 'Daily Waiting',
    icon: 'Clock',
    description: 'متابعة انتظار الطلاب',
    category: 'student'
  },
  {
    key: 'student-forms',
    nameAr: 'نماذج شؤون الطلاب',
    nameEn: 'Student Affairs Forms',
    icon: 'FileText',
    description: 'النماذج الخاصة بشؤون الطلاب',
    category: 'student'
  },
  {
    key: 'messages',
    nameAr: 'الرسائل',
    nameEn: 'Messages',
    icon: 'MessageSquare',
    description: 'إرسال الرسائل والإشعارات',
    category: 'main'
  }
];

// قوالب الصلاحيات الافتراضية
export const DEFAULT_PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: 'admin-template',
    name: 'Admin',
    nameAr: 'مدير النظام',
    description: 'صلاحيات كاملة على جميع الأقسام',
    accessLevel: 'admin',
    permissions: AVAILABLE_MODULES.map(module => ({
      module: module.key,
      actions: ['view', 'create', 'edit', 'delete', 'export', 'print'],
      enabled: true
    }))
  },
  {
    id: 'manager-template',
    name: 'Manager',
    nameAr: 'مدير',
    description: 'صلاحيات إدارية على معظم الأقسام',
    accessLevel: 'manager',
    permissions: AVAILABLE_MODULES.map(module => ({
      module: module.key,
      actions: module.key === 'settings' 
        ? ['view'] 
        : ['view', 'create', 'edit', 'export', 'print'],
      enabled: true
    }))
  },
  {
    id: 'user-template',
    name: 'User',
    nameAr: 'مستخدم',
    description: 'صلاحيات عرض فقط',
    accessLevel: 'user',
    permissions: AVAILABLE_MODULES.map(module => ({
      module: module.key,
      actions: ['view'],
      enabled: module.key !== 'settings'
    }))
  }
];

// دالة مساعدة للتحقق من الصلاحية
export const hasPermission = (
  user: User | null,
  module: ModuleKey,
  action: PermissionAction
): boolean => {
  if (!user) return false;
  if (user.accessLevel === 'admin') return true;
  
  const modulePermission = user.permissions.find(p => p.module === module);
  if (!modulePermission || !modulePermission.enabled) return false;
  
  return modulePermission.actions.includes(action);
};

// دالة مساعدة لتوليد رقم دخول سريع
export const generateQuickAccessPin = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// دالة مساعدة للحصول على معلومات القسم
export const getModuleInfo = (moduleKey: ModuleKey): ModuleInfo | undefined => {
  return AVAILABLE_MODULES.find(m => m.key === moduleKey);
};

// دالة مساعدة للحصول على قالب الصلاحيات
export const getPermissionTemplate = (accessLevel: AccessLevel): PermissionTemplate | undefined => {
  return DEFAULT_PERMISSION_TEMPLATES.find(t => t.accessLevel === accessLevel);
};
