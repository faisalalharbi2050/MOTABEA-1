import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  UserPlus,
  Save,
  User as UserIcon,
  Phone,
  Mail,
  Key,
  Hash,
  Shield,
  Users,
  Briefcase,
  RefreshCw
} from 'lucide-react';
import { User, CreateUserInput, UserRole, generateQuickAccessPin } from '../../types/permissions';

const UserFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editUser = location.state?.user as User | undefined;
  const mode = editUser ? 'edit' : 'create';

  const [formData, setFormData] = useState<Partial<CreateUserInput>>({
    name: editUser?.name || '',
    phone: editUser?.phone || '',
    email: editUser?.email || '',
    username: editUser?.username || '',
    password: '',
    quickAccessPin: editUser?.quickAccessPin || generateQuickAccessPin(),
    role: editUser?.role || 'other',
    source: 'manual',
    accessLevel: 'user',
    permissions: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // مسح الخطأ عند التعديل
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateNewPin = () => {
    const newPin = generateQuickAccessPin();
    handleChange('quickAccessPin', newPin);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'رقم الجوال مطلوب';
    } else if (!/^05\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الجوال غير صحيح (يجب أن يبدأ بـ 05 ويتكون من 10 أرقام)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!editUser && formData.username && formData.username.length < 3) {
      newErrors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    }

    if (!editUser && formData.password && formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // هنا يتم حفظ البيانات
    console.log('حفظ بيانات المستخدم:', formData);
    
    // العودة للصفحة الرئيسية
    navigate('/dashboard/permissions', { 
      state: { message: mode === 'create' ? 'تم إضافة المستخدم بنجاح' : 'تم تحديث بيانات المستخدم بنجاح' }
    });
  };

  const getRoleBadge = (role: UserRole) => {
    const configs = {
      principal: { label: 'مدير المدرسة', color: 'bg-red-100 text-red-800' },
      'vice-principal': { label: 'وكيل المدرسة', color: 'bg-blue-100 text-blue-800' },
      other: { label: 'آخر', color: 'bg-gray-100 text-gray-800' }
    };
    return configs[role];
  };

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserPlus className="w-7 h-7 text-blue-600" />
            {mode === 'create' ? 'إضافة مستخدم جديد' : 'تعديل بيانات المستخدم'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'create' 
              ? 'أدخل بيانات المستخدم الجديد. سيتم توليد رمز الدخول السريع تلقائياً'
              : 'قم بتعديل بيانات المستخدم حسب الحاجة'
            }
          </p>
        </div>
      </div>

      {/* النموذج */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* البيانات الأساسية */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600" />
            البيانات الأساسية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* الاسم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="أدخل الاسم الكامل"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* رقم الجوال */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الجوال <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="05xxxxxxxx"
                  maxLength={10}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني (اختياري)
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="example@school.edu.sa"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* الصفة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الصفة <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="principal">مدير المدرسة</option>
                  <option value="vice-principal">وكيل المدرسة</option>
                  <option value="other">آخر</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* معلومات الدخول */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            معلومات الدخول
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* اسم المستخدم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم (اختياري)
              </label>
              <div className="relative">
                <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="اسم مستخدم فريد"
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                يمكن للمستخدم تسجيله لاحقاً من خلال رمز الدخول السريع
              </p>
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور (اختياري)
              </label>
              <div className="relative">
                <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="كلمة مرور قوية"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                يمكن للمستخدم تعيينها لاحقاً أو الاكتفاء برمز الدخول السريع
              </p>
            </div>

            {/* رمز الدخول السريع */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز الدخول السريع <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.quickAccessPin}
                    readOnly
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg font-bold text-center"
                  />
                </div>
                <button
                  type="button"
                  onClick={generateNewPin}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  title="توليد رمز جديد"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="hidden sm:inline">توليد رمز جديد</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                رمز مكون من 4 أرقام للدخول السريع إلى النظام
              </p>
            </div>
          </div>
        </div>

        {/* ملاحظة هامة */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-1">ملاحظة هامة</h3>
              <p className="text-sm text-blue-800">
                سيتمكن المستخدم من تسجيل الدخول باستخدام رمز الدخول السريع فوراً. 
                يمكنه لاحقاً تسجيل اسم مستخدم وكلمة مرور خاصة به من خلال إعدادات الحساب، 
                أو الاستمرار في استخدام رمز الدخول السريع فقط.
              </p>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end sticky bottom-4 bg-gray-50 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {mode === 'create' ? 'إضافة المستخدم' : 'حفظ التعديلات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFormPage;
