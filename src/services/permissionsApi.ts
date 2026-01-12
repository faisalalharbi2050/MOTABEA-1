/**
 * Permissions API Service
 * خدمة API للصلاحيات
 */

import axios from 'axios';
import { User, CreateUserInput, UpdateUserInput, LoginCredentials, PermissionsStats } from '../types/permissions';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// إنشاء instance من axios مع التكوين الافتراضي
const api = axios.create({
  baseURL: `${API_BASE_URL}/permissions`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor لإضافة token في كل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor للتعامل مع الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إعادة توجيه لصفحة تسجيل الدخول
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * خدمات إدارة المستخدمين
 */
export const permissionsApi = {
  /**
   * جلب جميع المستخدمين
   */
  getUsers: async (params?: {
    search?: string;
    accessLevel?: string;
    source?: string;
    isActive?: boolean;
  }): Promise<{ success: boolean; users: User[] }> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  /**
   * جلب مستخدم واحد
   */
  getUser: async (id: string): Promise<{ success: boolean; user: User }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * إضافة مستخدم جديد
   */
  createUser: async (userData: CreateUserInput): Promise<{ success: boolean; message: string; userId: string }> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  /**
   * تحديث مستخدم
   */
  updateUser: async (id: string, userData: Partial<UpdateUserInput>): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * حذف مستخدم
   */
  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * تسجيل دخول بالرقم السريع
   */
  quickAccessLogin: async (pin: string): Promise<{ success: boolean; user: User; token: string }> => {
    const response = await api.post('/quick-access-login', { pin });
    
    // حفظ token في localStorage
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    return response.data;
  },

  /**
   * جلب إحصائيات الصلاحيات
   */
  getStats: async (): Promise<{ success: boolean; stats: PermissionsStats }> => {
    const response = await api.get('/stats');
    return response.data;
  },

  /**
   * جلب سجل التغييرات
   */
  getLogs: async (params?: {
    userId?: string;
    action?: string;
    limit?: number;
  }): Promise<{ success: boolean; logs: any[] }> => {
    const response = await api.get('/logs', { params });
    return response.data;
  },

  /**
   * تبديل حالة المستخدم (نشط/غير نشط)
   */
  toggleUserStatus: async (id: string, isActive: boolean): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/users/${id}`, { isActive });
    return response.data;
  },

  /**
   * تحديث كلمة المرور
   */
  updatePassword: async (id: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/users/${id}`, { password });
    return response.data;
  },

  /**
   * تحديث رقم الدخول السريع
   */
  updateQuickAccessPin: async (id: string, quickAccessPin: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/users/${id}`, { quickAccessPin });
    return response.data;
  },

  /**
   * تحديث صلاحيات المستخدم
   */
  updatePermissions: async (id: string, permissions: any[]): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/users/${id}`, { permissions });
    return response.data;
  },
};

/**
 * Hook مخصص لاستخدام API الصلاحيات مع React Query (اختياري)
 */
export const usePermissionsQuery = () => {
  // يمكن إضافة React Query hooks هنا لاحقاً
  return permissionsApi;
};

export default permissionsApi;
