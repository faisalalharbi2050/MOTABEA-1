import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Save,
  Settings,
  Calendar,
  Eye,
  Clock,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { User, ModulePermission, AVAILABLE_MODULES } from '../../types/permissions';

const UserPermissionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user as User | undefined;

  const [permissions, setPermissions] = useState<ModulePermission[]>(
    user?.permissions || AVAILABLE_MODULES.map(module => ({
      module: module.key,
      actions: [],
      enabled: false
    }))
  );

  const [hasChanges, setHasChanges] = useState(false);

  // أيقونات الصلاحيات
  const moduleIcons: Record<string, React.ElementType> = {
    settings: Settings,
    schedule: Calendar,
    supervision: Eye,
    'daily-waiting': Clock,
    'student-forms': FileText,
    messages: MessageSquare
  };

  const handleToggleModule = (moduleKey: string) => {
    setPermissions(prev => prev.map(p => 
      p.module === moduleKey 
        ? { 
            ...p, 
            enabled: !p.enabled,
            actions: !p.enabled ? ['view', 'create', 'edit'] : []
          } 
        : p
    ));
    setHasChanges(true);
  };

  const handleToggleAction = (moduleKey: string, action: 'create' | 'edit' | 'delete') => {
    setPermissions(prev => prev.map(p => {
      if (p.module === moduleKey) {
        const hasAction = p.actions.includes(action);
        return {
          ...p,
          actions: hasAction 
            ? p.actions.filter(a => a !== action)
            : [...p.actions, action]
        };
      }
      return p;
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // هنا يتم حفظ الصلاحيات
    console.log('حفظ الصلاحيات:', permissions);
    // يمكن إضافة استدعاء API هنا
    navigate(-1);
  };

  const getModulePermission = (moduleKey: string) => {
    return permissions.find(p => p.module === moduleKey);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">لم يتم العثور على بيانات المستخدم</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-1 px-4 pb-4 md:px-6 md:pb-6" dir="rtl">
      {/* الرأس */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة</span>
        </button>

        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                إدارة صلاحيات المستخدم
              </h1>
              <p className="text-gray-600 mt-1">
                {user.name} • {user.username}
              </p>
            </div>
          </div>

          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
              <p className="text-yellow-800 text-sm">لديك تغييرات غير محفوظة</p>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </button>
            </div>
          )}
        </div>
      </div>

      {/* الصلاحيات */}
      <div className="space-y-4">
        {AVAILABLE_MODULES.map((module) => {
          const Icon = moduleIcons[module.key];
          const permission = getModulePermission(module.key);
          const isEnabled = permission?.enabled || false;

          return (
            <div
              key={module.key}
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                isEnabled ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* رأس الصلاحية */}
              <div
                className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleToggleModule(module.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isEnabled ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{module.nameAr}</h3>
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isEnabled ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* تفاصيل الصلاحيات */}
              {isEnabled && (
                <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-3">العمليات المسموح بها:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* إضافة */}
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={permission?.actions.includes('create') || false}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleAction(module.key, 'create');
                        }}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 font-medium">إضافة</span>
                    </label>

                    {/* تعديل */}
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={permission?.actions.includes('edit') || false}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleAction(module.key, 'edit');
                        }}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 font-medium">تعديل</span>
                    </label>

                    {/* حذف */}
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={permission?.actions.includes('delete') || false}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleAction(module.key, 'delete');
                        }}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 font-medium">حذف</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* أزرار الإجراءات */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end sticky bottom-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          إلغاء
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            hasChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Save className="w-5 h-5" />
          حفظ الصلاحيات
        </button>
      </div>
    </div>
  );
};

export default UserPermissionsPage;
