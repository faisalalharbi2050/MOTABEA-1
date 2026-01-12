import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  User as UserIcon,
  Mail,
  Phone,
  Key,
  Shield,
  Hash,
  RefreshCw,
  Eye,
  EyeOff,
  Users,
  Settings,
  Edit,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  AccessLevel,
  ModulePermission,
  AVAILABLE_MODULES,
  generateQuickAccessPin,
  getPermissionTemplate,
  PermissionAction
} from '../../types/permissions';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: CreateUserInput | UpdateUserInput) => void;
  user?: User | null;
  mode: 'create' | 'edit';
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  mode
}) => {
  // حالات النموذج
  const [formData, setFormData] = useState<CreateUserInput>({
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    quickAccessPin: generateQuickAccessPin(),
    accessLevel: 'user',
    role: 'other',
    permissions: [],
    source: 'manual'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['main', 'academic', 'student']);
  const [selectAllModules, setSelectAllModules] = useState(false);

  // تحميل بيانات المستخدم عند التعديل
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        username: user.username,
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        quickAccessPin: user.quickAccessPin,
        accessLevel: user.accessLevel,
        role: user.role,
        permissions: user.permissions,
        source: user.source,
        sourceId: user.sourceId
      });
    }
  }, [mode, user]);

  // تطبيق قالب الصلاحيات عند تغيير المستوى
  const handleAccessLevelChange = (level: AccessLevel) => {
    setFormData(prev => ({ ...prev, accessLevel: level }));
    
    if (level !== 'custom') {
      const template = getPermissionTemplate(level);
      if (template) {
        setFormData(prev => ({ ...prev, permissions: template.permissions }));
      }
    }
  };

  // إنشاء رقم دخول سريع جديد
  const handleGeneratePin = () => {
    setFormData(prev => ({ ...prev, quickAccessPin: generateQuickAccessPin() }));
  };

  // التعامل مع تفعيل/تعطيل القسم
  const handleToggleModule = (moduleKey: string) => {
    setFormData(prev => {
      const existingPermission = prev.permissions.find(p => p.module === moduleKey);
      
      if (existingPermission) {
        // تبديل حالة التفعيل
        return {
          ...prev,
          permissions: prev.permissions.map(p =>
            p.module === moduleKey ? { ...p, enabled: !p.enabled } : p
          )
        };
      } else {
        // إضافة صلاحية جديدة
        return {
          ...prev,
          permissions: [
            ...prev.permissions,
            {
              module: moduleKey as any,
              actions: ['view'],
              enabled: true
            }
          ]
        };
      }
    });
  };

  // التعامل مع تفعيل/تعطيل صلاحية معينة
  const handleToggleAction = (moduleKey: string, action: PermissionAction) => {
    setFormData(prev => {
      const existingPermission = prev.permissions.find(p => p.module === moduleKey);
      
      if (existingPermission) {
        const hasAction = existingPermission.actions.includes(action);
        
        return {
          ...prev,
          permissions: prev.permissions.map(p => {
            if (p.module === moduleKey) {
              if (hasAction) {
                // إزالة الصلاحية
                return {
                  ...p,
                  actions: p.actions.filter(a => a !== action)
                };
              } else {
                // إضافة الصلاحية
                return {
                  ...p,
                  actions: [...p.actions, action]
                };
              }
            }
            return p;
          })
        };
      } else {
        // إضافة القسم مع الصلاحية
        return {
          ...prev,
          permissions: [
            ...prev.permissions,
            {
              module: moduleKey as any,
              actions: [action],
              enabled: true
            }
          ]
        };
      }
    });
  };

  // تحديد/إلغاء تحديد كل الأقسام
  const handleSelectAll = () => {
    if (selectAllModules) {
      // إلغاء تحديد الكل
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.map(p => ({ ...p, enabled: false }))
      }));
      setSelectAllModules(false);
    } else {
      // تحديد الكل
      const allPermissions: ModulePermission[] = AVAILABLE_MODULES.map(module => ({
        module: module.key,
        actions: ['view', 'create', 'edit', 'delete', 'export', 'print'],
        enabled: true
      }));
      setFormData(prev => ({ ...prev, permissions: allPermissions }));
      setSelectAllModules(true);
    }
  };

  // تبديل توسيع الفئة
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // التحقق من الصلاحية
  const hasAction = (moduleKey: string, action: PermissionAction): boolean => {
    const permission = formData.permissions.find(p => p.module === moduleKey);
    return permission ? permission.actions.includes(action) : false;
  };

  // التحقق من تفعيل القسم
  const isModuleEnabled = (moduleKey: string): boolean => {
    const permission = formData.permissions.find(p => p.module === moduleKey);
    return permission ? permission.enabled : false;
  };

  // حفظ البيانات
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'edit' && user) {
      const updateData: UpdateUserInput = {
        id: user.id,
        ...formData
      };
      onSave(updateData);
    } else {
      onSave(formData);
    }
  };

  // أسماء الصلاحيات بالعربية
  const actionLabels: Record<PermissionAction, string> = {
    view: 'عرض',
    create: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    export: 'تصدير',
    print: 'طباعة'
  };

  // تجميع الأقسام حسب الفئة
  const groupedModules = AVAILABLE_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_MODULES>);

  // أسماء الفئات بالعربية
  const categoryLabels: Record<string, string> = {
    main: 'الأقسام الرئيسية',
    academic: 'الأقسام الأكاديمية',
    student: 'أقسام الطلاب',
    reports: 'التقارير',
    settings: 'الإعدادات'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* رأس المودال */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-l from-blue-600 to-blue-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7" />
            {mode === 'create' ? 'إضافة مستخدم جديد' : 'تعديل بيانات المستخدم'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* محتوى المودال */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* معلومات المستخدم الأساسية */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                المعلومات الأساسية
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أحمد محمد السعيد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المستخدم <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ahmed_saeed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ahmed@school.edu.sa"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الجوال
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="05xxxxxxxx"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* معلومات تسجيل الدخول */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                معلومات تسجيل الدخول
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور {mode === 'create' && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={mode === 'create'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={mode === 'edit' ? 'اتركه فارغاً للإبقاء على القديم' : '••••••••'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الدخول السريع (4 أرقام) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      maxLength={4}
                      pattern="[0-9]{4}"
                      value={formData.quickAccessPin}
                      onChange={(e) => setFormData(prev => ({ ...prev, quickAccessPin: e.target.value }))}
                      className="w-full pr-10 pl-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg"
                      placeholder="1234"
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePin}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
                      title="إنشاء رقم جديد"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    يمكن للمستخدم الدخول باستخدام هذا الرقم بدلاً من اسم المستخدم وكلمة المرور
                  </p>
                </div>
              </div>
            </div>

            {/* مستوى الصلاحية */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                مستوى الصلاحية
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleAccessLevelChange('admin')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.accessLevel === 'admin'
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  <Shield className={`w-6 h-6 mx-auto mb-2 ${
                    formData.accessLevel === 'admin' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <div className="text-center">
                    <div className="font-bold text-sm">مدير النظام</div>
                    <div className="text-xs text-gray-600 mt-1">صلاحيات كاملة</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAccessLevelChange('manager')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.accessLevel === 'manager'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <Users className={`w-6 h-6 mx-auto mb-2 ${
                    formData.accessLevel === 'manager' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className="text-center">
                    <div className="font-bold text-sm">مدير</div>
                    <div className="text-xs text-gray-600 mt-1">صلاحيات إدارية</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAccessLevelChange('user')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.accessLevel === 'user'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <UserIcon className={`w-6 h-6 mx-auto mb-2 ${
                    formData.accessLevel === 'user' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div className="text-center">
                    <div className="font-bold text-sm">مستخدم</div>
                    <div className="text-xs text-gray-600 mt-1">عرض فقط</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAccessLevelChange('custom')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.accessLevel === 'custom'
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  <Sparkles className={`w-6 h-6 mx-auto mb-2 ${
                    formData.accessLevel === 'custom' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <div className="text-center">
                    <div className="font-bold text-sm">مخصص</div>
                    <div className="text-xs text-gray-600 mt-1">اختيار يدوي</div>
                  </div>
                </button>
              </div>
            </div>

            {/* تفاصيل الصلاحيات */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  تفاصيل الصلاحيات
                </h3>
                
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {selectAllModules ? (
                    <>
                      <Square className="w-4 h-4" />
                      إلغاء تحديد الكل
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      تحديد الكل
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(groupedModules).map(([category, modules]) => (
                  <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <span className="font-bold text-gray-900">{categoryLabels[category]}</span>
                      {expandedCategories.includes(category) ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>

                    {expandedCategories.includes(category) && (
                      <div className="p-4 space-y-3">
                        {modules.map((module) => (
                          <div key={module.key} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleToggleModule(module.key)}
                                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                    isModuleEnabled(module.key)
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {isModuleEnabled(module.key) && <CheckSquare className="w-4 h-4 text-white" />}
                                </button>
                                <div>
                                  <div className="font-medium text-gray-900">{module.nameAr}</div>
                                  <div className="text-xs text-gray-500">{module.description}</div>
                                </div>
                              </div>
                            </div>

                            {isModuleEnabled(module.key) && (
                              <div className="flex flex-wrap gap-2 mr-9">
                                {(['view', 'create', 'edit', 'delete', 'export', 'print'] as PermissionAction[]).map((action) => (
                                  <button
                                    key={action}
                                    type="button"
                                    onClick={() => handleToggleAction(module.key, action)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                      hasAction(module.key, action)
                                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                                        : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                                    }`}
                                  >
                                    {actionLabels[action]}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Save className="w-5 h-5" />
              {mode === 'create' ? 'إضافة المستخدم' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
