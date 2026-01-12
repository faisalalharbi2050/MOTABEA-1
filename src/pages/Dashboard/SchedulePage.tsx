import { Link } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  Calendar,
  ClipboardList,
  FileText
} from 'lucide-react';

const SchedulePage = () => {
  const menuItems = [
    {
      title: 'إعدادات الجدول',
      description: 'تخصيص قواعد وقيود الجدول المدرسي',
      icon: Settings,
      path: '/dashboard/schedule/settings',
      color: 'bg-orange-500'
    },
    {
      title: 'الجداول الدراسية',
      description: 'عرض وإدارة الجداول المدرسية',
      icon: Calendar,
      path: '/dashboard/schedule/tables',
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">الجدول المدرسي</h1>
          <p className="text-gray-600">إدارة شاملة للجداول والإسنادات المدرسية</p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="group relative bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`${item.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="text-sm text-gray-600">أقسام فرعية</p>
          </div>
          <div className="text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900">المعلمون</p>
            <p className="text-sm text-gray-600">إدارة الإسنادات</p>
          </div>
          <div className="text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">التقارير</p>
            <p className="text-sm text-gray-600">طباعة وتصدير</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
