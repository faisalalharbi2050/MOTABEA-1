import React from 'react';
import { X, Shield, CheckCircle, XCircle, Eye, Edit as EditIcon, Trash, Clock } from 'lucide-react';
import { User, AVAILABLE_MODULES, ModulePermission, PermissionAction } from '../../types/permissions';

interface PermissionsViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const PermissionsViewModal: React.FC<PermissionsViewModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  if (!isOpen || !user) return null;

  // تجميع الصلاحيات حسب الفئة
  const categorizedPermissions = AVAILABLE_MODULES.reduce((acc, module) => {
    const permission = user.permissions.find(p => p.module === module.key);
    
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    
    acc[module.category].push({
      module,
      permission
    });
    
    return acc;
  }, {} as Record<string, Array<{ module: typeof AVAILABLE_MODULES[0], permission?: ModulePermission }>>);

  // أسماء الفئات
  const categoryLabels: Record<string, string> = {
    main: 'الأقسام الرئيسية',
    academic: 'الأقسام الأكاديمية',
    student: 'أقسام الطلاب',
    reports: 'التقارير',
    settings: 'الإعدادات'
  };

  // أسماء الصلاحيات
  const actionLabels: Record<PermissionAction, string> = {
    view: 'عرض',
    create: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    export: 'تصدير',
    print: 'طباعة'
  };

  // أيقونات الصلاحيات
  const actionIcons: Record<PermissionAction, any> = {
    view: Eye,
    create: '+',
    edit: EditIcon,
    delete: Trash,
    export: '↓',
    print: '🖨'
  };

  // حساب الإحصائيات
  const stats = {
    totalModules: AVAILABLE_MODULES.length,
    enabledModules: user.permissions.filter(p => p.enabled).length,
    totalActions: user.permissions.reduce((sum, p) => sum + p.actions.length, 0)
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* رأس المودال */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-l from-blue-600 to-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Shield className="w-7 h-7" />
                صلاحيات المستخدم
              </h2>
              <p className="text-blue-100 text-sm mt-1">{user.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.enabledModules}</div>
              <div className="text-xs text-gray-600 mt-1">أقسام مفعلة</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalActions}</div>
              <div className="text-xs text-gray-600 mt-1">إجمالي الصلاحيات</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user.accessLevel === 'admin' ? '100%' : Math.round((stats.enabledModules / stats.totalModules) * 100) + '%'}
              </div>
              <div className="text-xs text-gray-600 mt-1">نسبة الوصول</div>
            </div>
          </div>
        </div>

        {/* محتوى المودال */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* رسالة للمدير */}
          {user.accessLevel === 'admin' && (
            <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-900">مدير النظام - صلاحيات كاملة</span>
              </div>
              <p className="text-red-700 text-sm mt-2">
                يمتلك هذا المستخدم صلاحيات كاملة على جميع أقسام النظام دون قيود.
              </p>
            </div>
          )}

          {/* عرض الصلاحيات حسب الفئات */}
          <div className="space-y-6">
            {Object.entries(categorizedPermissions).map(([category, items]) => (
              <div key={category} className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {categoryLabels[category]}
                </h3>
                
                <div className="space-y-3">
                  {items.map(({ module, permission }) => {
                    const isEnabled = user.accessLevel === 'admin' || (permission && permission.enabled);
                    const actions = user.accessLevel === 'admin' 
                      ? ['view', 'create', 'edit', 'delete', 'export', 'print'] as PermissionAction[]
                      : permission?.actions || [];

                    return (
                      <div
                        key={module.key}
                        className={`bg-white rounded-lg p-4 border-2 transition-all ${
                          isEnabled
                            ? 'border-green-200 shadow-sm'
                            : 'border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {isEnabled ? (
                              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                            )}
                            <div>
                              <div className={`font-bold ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                                {module.nameAr}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {module.description}
                              </div>
                            </div>
                          </div>
                          
                          {isEnabled ? (
                            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              مفعّل
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              معطّل
                            </span>
                          )}
                        </div>

                        {isEnabled && (
                          <div className="flex flex-wrap gap-2 mr-9">
                            {actions.map((action) => (
                              <span
                                key={action}
                                className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-md border border-blue-300"
                              >
                                {actionLabels[action]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* معلومات إضافية */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <div className="font-bold mb-1">معلومات الحساب</div>
                <div className="space-y-1 text-blue-700">
                  <div>تاريخ الإنشاء: {new Date(user.createdAt).toLocaleDateString('ar-SA')}</div>
                  <div>آخر تحديث: {new Date(user.updatedAt).toLocaleDateString('ar-SA')}</div>
                  {user.lastLogin && (
                    <div>آخر دخول: {new Date(user.lastLogin).toLocaleDateString('ar-SA')}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* أزرار الإغلاق */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsViewModal;
