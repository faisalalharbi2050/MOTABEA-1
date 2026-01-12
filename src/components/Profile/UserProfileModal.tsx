import React, { useState } from 'react';
import { X, Save, Trash2, Building, Mail, Phone, User, Calendar, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || 'user@example.com');
  const [schoolName, setSchoolName] = useState('مدرسة المستقبل النموذجية'); // Mock data
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  // Mock Data for Read-only fields
  const mobile = '0551234567';
  const subStart = '1445-01-01';
  const subEnd = '1446-01-01';

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
        setIsSaving(false);
        setMessage({ type: 'success', text: 'تم تحديث البيانات بنجاح' });
        setTimeout(() => setMessage(null), 3000);
    }, 1000);
  };

  const handleDeleteRequest = () => {
      setShowDeleteConfirm(false);
      // Simulate API request to Super Admin
      setMessage({ type: 'success', text: 'تم رفع طلب حذف الحساب إلى المشرف العام بنجاح. سيتم التواصل معكم قريباً.' });
      setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#655ac1] p-6 flex justify-between items-center text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="h-6 w-6" />
                <span>الملف الشخصي</span>
            </h2>
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
            </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <div className="w-2 h-2 rounded-full bg-green-500"></div> : <AlertTriangle className="h-4 w-4" />}
                    {message.text}
                </div>
            )}

            {/* Read-Only Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold">اسم المستخدم</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {user?.name || user?.username}
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold">رقم الجوال</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium flex items-center gap-2 cursor-not-allowed text-opacity-70">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {mobile}
                    </div>
                </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-[#f8f9fc] p-4 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-[#655ac1] mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    تفاصيل الاشتراك
                </h3>
                <div className="flex justify-between items-center text-sm">
                    <div className="text-center">
                        <p className="text-gray-500 text-xs mb-1">تاريخ البداية</p>
                        <p className="font-bold text-gray-800">{subStart}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div className="text-center">
                        <p className="text-gray-500 text-xs mb-1">تاريخ النهاية</p>
                        <p className="font-bold text-gray-800">{subEnd}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div className="text-center">
                        <p className="text-gray-500 text-xs mb-1">الحالة</p>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">نشط</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-bold text-gray-900 mb-4">بيانات قابلة للتعديل</h3>
                
                {/* Editable Fields */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-bold">البريد الإلكتروني</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#655ac1] focus:border-[#655ac1] transition-all"
                            />
                            <Mail className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-bold">اسم المدرسة</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={schoolName}
                                onChange={(e) => setSchoolName(e.target.value)}
                                className="w-full p-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#655ac1] focus:border-[#655ac1] transition-all"
                            />
                            <Building className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-3 text-xs text-amber-800 items-start">
               <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
               <p>تنبيه: لا يمكن تغيير البيانات الأساسية (اسم المستخدم، الجوال) إلا من خلال التواصل مع المشرف العام.</p>
            </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
            >
                <Trash2 className="h-4 w-4" />
                حذف الحساب
            </button>

            <div className="flex gap-2">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl text-sm font-bold transition-colors"
                >
                    إلغاء
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-[#655ac1] hover:bg-[#5a4ebd] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                >
                    {isSaving ? 'جارِ الحفظ...' : (
                        <>
                            <Save className="h-4 w-4" />
                            حفظ التعديلات
                        </>
                    )}
                </button>
            </div>
        </div>

      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[110] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border-2 border-red-100 animate-in zoom-in duration-200">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 mb-2">تأكيد طلب حذف الحساب؟</h3>
                <p className="text-gray-500 text-center text-sm mb-6">
                    هل أنت متأكد من رغبتك في حذف الحساب نهائياً؟ سيتم رفع طلبك إلى المشرف العام للمراجعة والموافقة.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                    >
                        تراجع
                    </button>
                    <button 
                        onClick={handleDeleteRequest}
                        className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-colors"
                    >
                        تأكيد الحذف
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default UserProfileModal;
