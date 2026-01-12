import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Download,
  Upload,
  Users,
  BookOpen,
  Clock,
  CheckCircle
} from 'lucide-react';

const TeachersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Sample teachers data
  const teachers = [
    {
      id: '1',
      employee_id: 'T001',
      name: 'أحمد محمد السعد',
      email: 'ahmed.saad@school.edu.sa',
      phone: '0501234567',
      subject: 'الرياضيات',
      classes: ['1أ', '2ب', '3ج'],
      weekly_quota: 20,
      current_quota: 18,
      experience_years: 8,
      status: 'active',
      hire_date: '2020-08-15',
    },
    {
      id: '2',
      employee_id: 'T002',
      name: 'فاطمة علي الأحمد',
      email: 'fatima.ahmed@school.edu.sa',
      phone: '0512345678',
      subject: 'اللغة العربية',
      classes: ['1ب', '2أ'],
      weekly_quota: 18,
      current_quota: 16,
      experience_years: 5,
      status: 'active',
      hire_date: '2022-09-01',
    },
    {
      id: '3',
      employee_id: 'T003',
      name: 'خالد محمد العمر',
      email: 'khalid.omar@school.edu.sa',
      phone: '0523456789',
      subject: 'العلوم',
      classes: ['3أ', '3ب'],
      weekly_quota: 22,
      current_quota: 22,
      experience_years: 12,
      status: 'active',
      hire_date: '2018-01-20',
    },
    {
      id: '4',
      employee_id: 'T004',
      name: 'سارة أحمد الزهراني',
      email: 'sara.zahrani@school.edu.sa',
      phone: '0534567890',
      subject: 'الإنجليزية',
      classes: ['1أ', '2أ', '3أ'],
      weekly_quota: 20,
      current_quota: 14,
      experience_years: 3,
      status: 'on_leave',
      hire_date: '2023-02-10',
    },
  ];

  const stats = [
    { label: 'إجمالي المعلمين', value: '148', icon: Users, color: 'bg-blue-500' },
    { label: 'المعلمين النشطين', value: '142', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'في إجازة', value: '6', icon: Clock, color: 'bg-yellow-500' },
    { label: 'المواد المُدرَّسة', value: '24', icon: BookOpen, color: 'bg-purple-500' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">نشط</span>;
      case 'on_leave':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">في إجازة</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">غير نشط</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">غير محدد</span>;
    }
  };

  const getQuotaColor = (current: number, total: number) => {
    const percentage = (current / total) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || teacher.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المعلمين</h1>
          <p className="text-gray-600 mt-1">إدارة شاملة لبيانات المعلمين ونصاب الحصص</p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </button>
          <button className="btn-secondary flex items-center">
            <Upload className="h-4 w-4 ml-2" />
            استيراد
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة معلم
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث عن معلم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex space-x-4 space-x-reverse">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">جميع المعلمين</option>
              <option value="active">النشطين</option>
              <option value="on_leave">في إجازة</option>
              <option value="inactive">غير نشط</option>
            </select>
            <button className="btn-secondary flex items-center">
              <Filter className="h-4 w-4 ml-2" />
              المزيد من الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المعلم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التخصص
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الفصول
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نصاب الحصص
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  سنوات الخبرة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                      <div className="text-sm text-gray-500">{teacher.employee_id}</div>
                      <div className="text-sm text-gray-500">{teacher.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{teacher.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.map((className, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {className}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <span className={`font-medium ${getQuotaColor(teacher.current_quota, teacher.weekly_quota)}`}>
                        {teacher.current_quota}
                      </span>
                      <span className="text-gray-500"> / {teacher.weekly_quota}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min((teacher.current_quota / teacher.weekly_quota) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{teacher.experience_years} سنوات</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(teacher.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg border border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            عرض <span className="font-medium">1</span> إلى <span className="font-medium">10</span> من أصل{' '}
            <span className="font-medium">{filteredTeachers.length}</span> معلم
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
              السابق
            </button>
            <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded">1</button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">2</button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">3</button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
              التالي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachersPage;
