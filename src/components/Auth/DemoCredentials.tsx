import { Info, User, Key } from 'lucide-react';

const DemoCredentials = () => {
  const account = {
    role: 'مدير النظام',
    username: 'admin',
    password: 'admin123',
    color: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center mb-4">
        <Info className="h-5 w-5 text-gray-600 ml-2" />
        <h3 className="text-lg font-semibold text-gray-900">بيانات تسجيل الدخول</h3>
      </div>
      
      <div className={`p-4 rounded-lg border ${account.color}`}>
        <h4 className="font-medium mb-2">{account.role}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <User className="h-4 w-4 ml-2" />
            <span className="font-mono">{account.username}</span>
          </div>
          <div className="flex items-center">
            <Key className="h-4 w-4 ml-2" />
            <span className="font-mono">{account.password}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>ملاحظة:</strong> استخدم البيانات أعلاه لتسجيل الدخول إلى نظام متابع.
        </p>
      </div>
    </div>
  );
};

export default DemoCredentials;
