/**
 * صفحة عرض جميع المعلمين
 * All Teachers Overview Page
 */

import React, { useState } from 'react';
import { ArrowRight, Users, Search, Filter, BarChart3, BookOpen, Clock } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  specialization: string;
  max_load: number;
  current_load: number;
  efficiency: number;
  assignments_count: number;
  status: 'low' | 'medium' | 'high' | 'full';
}

interface AllTeachersPageProps {
  onBack: () => void;
  onTeacherSelect: (teacherId: string) => void;
}

const AllTeachersPage: React.FC<AllTeachersPageProps> = ({ onBack, onTeacherSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'efficiency' | 'load'>('name');

  // بيانات تجريبية شاملة للمعلمين
  const allTeachers: Teacher[] = [
    { id: '1', name: 'أحمد محمد السعدي', specialization: 'رياضيات', max_load: 24, current_load: 18, efficiency: 75, assignments_count: 4, status: 'high' },
    { id: '2', name: 'فاطمة أحمد النجار', specialization: 'لغة عربية', max_load: 24, current_load: 20, efficiency: 83, assignments_count: 4, status: 'high' },
    { id: '3', name: 'خالد سعد العتيبي', specialization: 'علوم', max_load: 24, current_load: 12, efficiency: 50, assignments_count: 3, status: 'medium' },
    { id: '4', name: 'نورا القحطاني', specialization: 'تربية إسلامية', max_load: 24, current_load: 24, efficiency: 100, assignments_count: 6, status: 'full' },
    { id: '5', name: 'عبدالرحمن الشمري', specialization: 'تاريخ وجغرافيا', max_load: 24, current_load: 8, efficiency: 33, assignments_count: 2, status: 'low' },
    { id: '6', name: 'سارة محمد الأحمدي', specialization: 'لغة إنجليزية', max_load: 24, current_load: 16, efficiency: 67, assignments_count: 4, status: 'medium' },
    { id: '7', name: 'محمد عبدالله الزهراني', specialization: 'حاسوب', max_load: 24, current_load: 10, efficiency: 42, assignments_count: 5, status: 'low' },
    { id: '8', name: 'عائشة علي القرني', specialization: 'تربية فنية', max_load: 24, current_load: 14, efficiency: 58, assignments_count: 7, status: 'medium' },
    { id: '9', name: 'يوسف أحمد المطيري', specialization: 'تربية بدنية', max_load: 24, current_load: 22, efficiency: 92, assignments_count: 8, status: 'high' },
    { id: '10', name: 'هند سعد الغامدي', specialization: 'مكتبة ومصادر', max_load: 24, current_load: 6, efficiency: 25, assignments_count: 3, status: 'low' }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'low': return { color: 'border-yellow-200 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800', label: 'منخفض' };
      case 'medium': return { color: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-800', label: 'متوسط' };
      case 'high': return { color: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-800', label: 'عالي' };
      case 'full': return { color: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-800', label: 'مكتمل' };
      default: return { color: 'border-gray-200 bg-gray-50', badge: 'bg-gray-100 text-gray-800', label: '' };
    }
  };

  // فلترة وترتيب البيانات
  const filteredAndSortedTeachers = allTeachers
    .filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || teacher.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'efficiency': return b.efficiency - a.efficiency;
        case 'load': return b.current_load - a.current_load;
        default: return a.name.localeCompare(b.name, 'ar');
      }
    });

  // الإحصائيات العامة
  const stats = {
    total: allTeachers.length,
    low: allTeachers.filter(t => t.status === 'low').length,
    medium: allTeachers.filter(t => t.status === 'medium').length,
    high: allTeachers.filter(t => t.status === 'high').length,
    full: allTeachers.filter(t => t.status === 'full').length,
    avgEfficiency: Math.round(allTeachers.reduce((sum, t) => sum + t.efficiency, 0) / allTeachers.length),
    totalHours: allTeachers.reduce((sum, t) => sum + t.current_load, 0)
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* شريط التنقل */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة للقائمة الرئيسية</span>
        </button>
      </div>

      {/* العنوان والإحصائيات العامة */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">جميع المعلمين</h1>
              <p className="text-blue-100 text-lg">نظرة شاملة على النصاب والإسنادات</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-blue-200 text-sm">معلم</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.low}</div>
              <div className="text-xs text-yellow-800">نصاب منخفض</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.medium}</div>
              <div className="text-xs text-blue-800">نصاب متوسط</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
              <div className="text-xs text-orange-800">نصاب عالي</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.full}</div>
              <div className="text-xs text-red-800">نصاب مكتمل</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.avgEfficiency}%</div>
              <div className="text-xs text-green-800">متوسط النصاب</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{stats.totalHours}</div>
              <div className="text-xs text-purple-800">إجمالي الحصص</div>
            </div>
          </div>
        </div>
      </div>

      {/* أدوات البحث والفلترة */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="البحث عن معلم أو تخصص..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="rtl"
            />
          </div>

          {/* فلتر الحالة */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="rtl"
            >
              <option value="all">جميع الحالات</option>
              <option value="low">نصاب منخفض</option>
              <option value="medium">نصاب متوسط</option>
              <option value="high">نصاب عالي</option>
              <option value="full">نصاب مكتمل</option>
            </select>
          </div>

          {/* الترتيب */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'efficiency' | 'load')}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="rtl"
            >
              <option value="name">ترتيب حسب الاسم</option>
              <option value="efficiency">ترتيب حسب النصاب</option>
              <option value="load">ترتيب حسب الحصص</option>
            </select>
          </div>
        </div>
      </div>

      {/* قائمة المعلمين */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-semibold text-gray-900">
                نتائج البحث ({filteredAndSortedTeachers.length} معلم)
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4">
            {filteredAndSortedTeachers.map((teacher) => {
              const statusConfig = getStatusConfig(teacher.status);
              
              return (
                <div
                  key={teacher.id}
                  onClick={() => onTeacherSelect(teacher.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${statusConfig.color}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{teacher.name}</h3>
                        <p className="text-gray-600">{teacher.specialization}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.badge}`}>
                            {statusConfig.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {teacher.assignments_count} إسناد
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{teacher.efficiency}%</div>
                          <div className="text-xs text-gray-500">النصاب</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{teacher.current_load}</div>
                          <div className="text-xs text-gray-500">حصة</div>
                        </div>
                      </div>
                      
                      {/* شريط النصاب الصغير */}
                      <div className="w-32 bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            teacher.efficiency < 50 ? 'bg-yellow-500' :
                            teacher.efficiency < 80 ? 'bg-blue-500' :
                            teacher.efficiency < 100 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${teacher.efficiency}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {teacher.current_load}/{teacher.max_load}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* رسالة عدم وجود نتائج */}
          {filteredAndSortedTeachers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">لم يتم العثور على معلمين يطابقون معايير البحث</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTeachersPage;