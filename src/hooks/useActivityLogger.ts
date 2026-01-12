import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook مساعد لإضافة إشعارات تلقائياً عند تنفيذ العمليات
 */
export const useActivityLogger = () => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  const logActivity = (
    type: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'system',
    title: string,
    message: string,
    module?: string
  ) => {
    addNotification({
      type,
      title,
      message,
      source: user?.name || 'النظام',
      module,
    });
  };

  // دوال مساعدة محددة
  const logCreate = (module: string, itemName: string) => {
    logActivity('create', 'إضافة جديدة', `تم إضافة ${itemName} بنجاح`, module);
  };

  const logUpdate = (module: string, itemName: string) => {
    logActivity('update', 'تحديث', `تم تحديث ${itemName} بنجاح`, module);
  };

  const logDelete = (module: string, itemName: string) => {
    logActivity('delete', 'حذف', `تم حذف ${itemName}`, module);
  };

  const logLogin = (userName: string) => {
    logActivity('login', 'تسجيل دخول', `قام ${userName} بتسجيل الدخول إلى النظام`);
  };

  const logLogout = (userName: string) => {
    logActivity('logout', 'تسجيل خروج', `قام ${userName} بتسجيل الخروج من النظام`);
  };

  return {
    logActivity,
    logCreate,
    logUpdate,
    logDelete,
    logLogin,
    logLogout,
  };
};
