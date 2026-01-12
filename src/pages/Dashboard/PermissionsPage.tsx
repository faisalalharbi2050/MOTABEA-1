import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Edit, Trash2, Eye, Users, Lock, Unlock, Hash, XCircle, CheckCircle } from 'lucide-react';
import { User, UserRole } from '../../types/permissions';

const PermissionsPage = () => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([
    { 
      id: '1', 
      username: 'admin', 
      name: 'أحمد محمد السعيد', 
      phone: '0501234567', 
      password: 'hash', 
      quickAccessPin: '1234', 
      accessLevel: 'admin', 
      role: 'principal', 
      permissions: [], 
      source: 'manual', 
      isActive: true, 
      createdAt: new Date('2024-01-15'), 
      updatedAt: new Date(), 
      createdBy: 'system', 
      lastLogin: new Date() 
    },
    { 
      id: '2', 
      username: 'vice', 
      name: 'خالد عبدالله العمر', 
      phone: '0512345678', 
      password: 'hash', 
      quickAccessPin: '5678', 
      accessLevel: 'manager', 
      role: 'vice-principal', 
      permissions: [], 
      source: 'administrator', 
      isActive: true, 
      createdAt: new Date('2024-02-01'), 
      updatedAt: new Date(), 
      createdBy: 'admin', 
      lastLogin: new Date('2024-10-09') 
    },
    { 
      id: '3', 
      username: '', 
      name: 'فاطمة علي الأحمد', 
      phone: '0523456789', 
      password: 'hash', 
      quickAccessPin: '9012', 
      accessLevel: 'user', 
      role: 'other', 
      permissions: [], 
      source: 'teacher', 
      isActive: false, 
      createdAt: new Date('2024-03-10'), 
      updatedAt: new Date(), 
      createdBy: 'admin'
    }
  ]);

  const getRoleBadge = (role: UserRole) => {
    const configs = {
      principal: { label: 'مدير المدرسة', color: 'bg-red-100 text-red-800' },
      'vice-principal': { label: 'وكيل المدرسة', color: 'bg-blue-100 text-blue-800' },
      other: { label: 'آخر', color: 'bg-gray-100 text-gray-800' }
    };
    return <span className={`px-3 py-1 text-xs font-medium rounded-full ${configs[role].color}`}>{configs[role].label}</span>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
        <CheckCircle className="w-3 h-3" />نشط
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
        <XCircle className="w-3 h-3" />غير نشط
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6 font-kufi" style={{ direction: 'rtl' }}>
      {/* عنوان الصفحة */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة الصلاحيات</h1>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard/permissions/user-form')} 
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors"
          >
            <Plus className="w-5 h-5" />
            إضافة مستخدم جديد
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 md:px-6 py-4 text-right text-sm font-bold text-gray-700">المستخدم</th>
                <th className="px-4 md:px-6 py-4 text-right text-sm font-bold text-gray-700">معلومات الدخول</th>
                <th className="px-4 md:px-6 py-4 text-right text-sm font-bold text-gray-700">الصفة</th>
                <th className="px-4 md:px-6 py-4 text-right text-sm font-bold text-gray-700">الحالة</th>
                <th className="px-4 md:px-6 py-4 text-right text-sm font-bold text-gray-700">آخر دخول</th>
                <th className="px-4 md:px-6 py-4 text-right text-sm font-bold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="space-y-1">
                      {user.username ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{user.username}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">لا يوجد اسم مستخدم</div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 font-mono">{user.quickAccessPin}</span>
                        <span className="text-xs text-gray-500">(رمز سريع)</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-4 md:px-6 py-4">{getStatusBadge(user.isActive)}</td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'لم يسجل دخول'}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate('/dashboard/permissions/user-permissions', { state: { user } })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="إدارة الصلاحيات">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleToggleStatus(user.id)} className={`p-2 rounded-lg ${user.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`} title={user.isActive ? 'تعطيل' : 'تفعيل'}>
                        {user.isActive ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                      </button>
                      <button onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="حذف">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
              <p className="text-gray-600 mb-6">
                هل أنت متأكد من حذف المستخدم <span className="font-bold">{selectedUser.name}</span>؟
                <br />لن تتمكن من التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setShowDeleteConfirm(false); setSelectedUser(null); }} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">إلغاء</button>
                <button onClick={confirmDelete} className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700">حذف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsPage;
