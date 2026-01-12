/**
 * صفحة عرض جميع الفصول
 * All Classrooms Overview Page
 */

import React, { useState } from 'react';
import { ArrowRight, School, Search, Filter, BookOpen, Users, CheckCircle, XCircle } from 'lucide-react';

interface Subject {
  name: string;
  assigned: boolean;
  teacherName?: string;
  teacherId?: string;
}

interface Classroom {
  id: string;
  name: string;
  grade: string;
  level: string;
  section: string;
  students_count: number;
  subjects: Subject[];
  assigned_count: number;
  total_subjects: number;
  completion_percentage: number;
  status: 'complete' | 'partial' | 'empty';
}

interface AllClassroomsPageProps {
  onBack: () => void;
  onClassroomSelect: (classroomId: string) => void;
}

const AllClassroomsPage: React.FC<AllClassroomsPageProps> = ({ onBack, onClassroomSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'completion' | 'subjects'>('name');

  // بيانات تجريبية شاملة للفصول
  const allClassrooms: Classroom[] = [
    {
      id: '1', name: '1/1', grade: '1', level: 'الأول', section: '1', students_count: 28,
      subjects: [
        { name: 'رياضيات', assigned: true, teacherName: 'أحمد محمد السعدي', teacherId: '1' },
        { name: 'لغة عربية', assigned: true, teacherName: 'فاطمة أحمد النجار', teacherId: '2' },
        { name: 'علوم', assigned: false },
        { name: 'تربية إسلامية', assigned: true, teacherName: 'نورا القحطاني', teacherId: '4' },
        { name: 'تاريخ وجغرافيا', assigned: false },
        { name: 'لغة إنجليزية', assigned: true, teacherName: 'سارة محمد الأحمدي', teacherId: '6' }
      ],
      assigned_count: 4, total_subjects: 6, completion_percentage: 67, status: 'partial'
    },
    {
      id: '2', name: '2/1', grade: '2', level: 'الثاني', section: '1', students_count: 25,
      subjects: [
        { name: 'رياضيات', assigned: true, teacherName: 'أحمد محمد السعدي', teacherId: '1' },
        { name: 'لغة عربية', assigned: true, teacherName: 'فاطمة أحمد النجار', teacherId: '2' },
        { name: 'علوم', assigned: true, teacherName: 'خالد سعد العتيبي', teacherId: '3' },
        { name: 'تربية إسلامية', assigned: true, teacherName: 'نورا القحطاني', teacherId: '4' },
        { name: 'تاريخ وجغرافيا', assigned: true, teacherName: 'عبدالرحمن الشمري', teacherId: '5' },
        { name: 'لغة إنجليزية', assigned: true, teacherName: 'سارة محمد الأحمدي', teacherId: '6' },
        { name: 'حاسوب', assigned: true, teacherName: 'محمد عبدالله الزهراني', teacherId: '7' }
      ],
      assigned_count: 7, total_subjects: 7, completion_percentage: 100, status: 'complete'
    },
    {
      id: '3', name: '3/1', grade: '3', level: 'الثالث', section: '1', students_count: 30,
      subjects: [
        { name: 'رياضيات', assigned: false },
        { name: 'لغة عربية', assigned: false },
        { name: 'علوم', assigned: false },
        { name: 'تربية إسلامية', assigned: false },
        { name: 'تاريخ وجغرافيا', assigned: false },
        { name: 'لغة إنجليزية', assigned: false }
      ],
      assigned_count: 0, total_subjects: 6, completion_percentage: 0, status: 'empty'
    },
    {
      id: '4', name: '1/2', grade: '1', level: 'الأول', section: '2', students_count: 26,
      subjects: [
        { name: 'رياضيات', assigned: true, teacherName: 'أحمد محمد السعدي', teacherId: '1' },
        { name: 'لغة عربية', assigned: false },
        { name: 'علوم', assigned: true, teacherName: 'خالد سعد العتيبي', teacherId: '3' },
        { name: 'تربية إسلامية', assigned: true, teacherName: 'نورا القحطاني', teacherId: '4' },
        { name: 'تاريخ وجغرافيا', assigned: false },
        { name: 'لغة إنجليزية', assigned: false }
      ],
      assigned_count: 3, total_subjects: 6, completion_percentage: 50, status: 'partial'
    },
    {
      id: '5', name: '2/2', grade: '2', level: 'الثاني', section: '2', students_count: 24,
      subjects: [
        { name: 'رياضيات', assigned: true, teacherName: 'أحمد محمد السعدي', teacherId: '1' },
        { name: 'لغة عربية', assigned: true, teacherName: 'فاطمة أحمد النجار', teacherId: '2' },
        { name: 'علوم', assigned: true, teacherName: 'خالد سعد العتيبي', teacherId: '3' },
        { name: 'تربية إسلامية', assigned: true, teacherName: 'نورا القحطاني', teacherId: '4' },
        { name: 'تاريخ وجغرافيا', assigned: false },
        { name: 'لغة إنجليزية', assigned: true, teacherName: 'سارة محمد الأحمدي', teacherId: '6' },
        { name: 'حاسوب', assigned: false }
      ],
      assigned_count: 5, total_subjects: 7, completion_percentage: 71, status: 'partial'
    },
    {
      id: '6', name: '4/1', grade: '4', level: 'الرابع', section: '1', students_count: 22,
      subjects: [
        { name: 'رياضيات', assigned: true, teacherName: 'أحمد محمد السعدي', teacherId: '1' },
        { name: 'لغة عربية', assigned: true, teacherName: 'فاطمة أحمد النجار', teacherId: '2' },
        { name: 'علوم', assigned: true, teacherName: 'خالد سعد العتيبي', teacherId: '3' },
        { name: 'تربية إسلامية', assigned: true, teacherName: 'نورا القحطاني', teacherId: '4' },
        { name: 'تاريخ وجغرافيا', assigned: true, teacherName: 'عبدالرحمن الشمري', teacherId: '5' },
        { name: 'لغة إنجليزية', assigned: true, teacherName: 'سارة محمد الأحمدي', teacherId: '6' },
        { name: 'حاسوب', assigned: true, teacherName: 'محمد عبدالله الزهراني', teacherId: '7' },
        { name: 'تربية فنية', assigned: true, teacherName: 'عائشة علي القرني', teacherId: '8' }
      ],
      assigned_count: 8, total_subjects: 8, completion_percentage: 100, status: 'complete'
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'complete': return { color: 'border-green-200 bg-green-50', badge: 'bg-green-100 text-green-800', label: 'مكتمل' };
      case 'partial': return { color: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-800', label: 'جزئي' };
      case 'empty': return { color: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-800', label: 'غير مسند' };
      default: return { color: 'border-gray-200 bg-gray-50', badge: 'bg-gray-100 text-gray-800', label: '' };
    }
  };

  // فلترة وترتيب البيانات
  const filteredAndSortedClassrooms = allClassrooms
    .filter(classroom => {
      const matchesSearch = classroom.name.includes(searchTerm) ||
                          classroom.level.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || classroom.status === filterStatus;
      const matchesGrade = filterGrade === 'all' || classroom.grade === filterGrade;
      return matchesSearch && matchesStatus && matchesGrade;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'completion': return b.completion_percentage - a.completion_percentage;
        case 'subjects': return b.total_subjects - a.total_subjects;
        default: return a.name.localeCompare(b.name, 'ar');
      }
    });

  // الإحصائيات العامة
  const stats = {
    total: allClassrooms.length,
    complete: allClassrooms.filter(c => c.status === 'complete').length,
    partial: allClassrooms.filter(c => c.status === 'partial').length,
    empty: allClassrooms.filter(c => c.status === 'empty').length,
    avgCompletion: Math.round(allClassrooms.reduce((sum, c) => sum + c.completion_percentage, 0) / allClassrooms.length),
    totalStudents: allClassrooms.reduce((sum, c) => sum + c.students_count, 0),
    totalSubjects: allClassrooms.reduce((sum, c) => sum + c.total_subjects, 0),
    assignedSubjects: allClassrooms.reduce((sum, c) => sum + c.assigned_count, 0)
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
              <School className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">جميع الفصول الدراسية</h1>
              <p className="text-blue-100 text-lg">نظرة شاملة على إسناد المواد</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-blue-200 text-sm">فصل</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
              <div className="text-xs text-green-800">فصول مكتملة</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{stats.partial}</div>
              <div className="text-xs text-orange-800">فصول جزئية</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.empty}</div>
              <div className="text-xs text-red-800">فصول غير مسندة</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.avgCompletion}%</div>
              <div className="text-xs text-blue-800">متوسط الإسناد</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{stats.assignedSubjects}</div>
              <div className="text-xs text-purple-800">مادة مسندة</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="text-2xl font-bold text-indigo-600">{stats.totalStudents}</div>
              <div className="text-xs text-indigo-800">طالب</div>
            </div>
          </div>
        </div>
      </div>

      {/* أدوات البحث والفلترة */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="البحث عن فصل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="rtl"
            />
          </div>

          {/* فلتر الصف */}
          <div>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="rtl"
            >
              <option value="all">جميع الصفوف</option>
              <option value="1">الصف الأول</option>
              <option value="2">الصف الثاني</option>
              <option value="3">الصف الثالث</option>
              <option value="4">الصف الرابع</option>
            </select>
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
              <option value="complete">مكتملة الإسناد</option>
              <option value="partial">إسناد جزئي</option>
              <option value="empty">غير مسندة</option>
            </select>
          </div>

          {/* الترتيب */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'completion' | 'subjects')}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="rtl"
            >
              <option value="name">ترتيب حسب الاسم</option>
              <option value="completion">ترتيب حسب الإسناد</option>
              <option value="subjects">ترتيب حسب المواد</option>
            </select>
          </div>
        </div>
      </div>

      {/* قائمة الفصول */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-semibold text-gray-900">
                نتائج البحث ({filteredAndSortedClassrooms.length} فصل)
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4">
            {filteredAndSortedClassrooms.map((classroom) => {
              const statusConfig = getStatusConfig(classroom.status);
              
              return (
                <div
                  key={classroom.id}
                  onClick={() => onClassroomSelect(classroom.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${statusConfig.color}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <School className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-xl text-gray-900">{classroom.name}</h3>
                          <span className="text-gray-600">({classroom.level})</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{classroom.students_count} طالب</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{classroom.total_subjects} مادة</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${statusConfig.badge}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-6 mb-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{classroom.completion_percentage}%</div>
                          <div className="text-xs text-gray-500">نسبة الإسناد</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {classroom.assigned_count}/{classroom.total_subjects}
                          </div>
                          <div className="text-xs text-gray-500">المواد المسندة</div>
                        </div>
                      </div>
                      
                      {/* شريط التقدم */}
                      <div className="w-32 bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            classroom.completion_percentage === 100 ? 'bg-green-500' :
                            classroom.completion_percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${classroom.completion_percentage}%` }}
                        ></div>
                      </div>
                      
                      {/* أيقونات المواد */}
                      <div className="flex items-center gap-1 justify-end">
                        {classroom.subjects.slice(0, 6).map((subject, index) => (
                          <div key={index} className="relative">
                            {subject.assigned ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        ))}
                        {classroom.subjects.length > 6 && (
                          <span className="text-xs text-gray-500 mr-1">+{classroom.subjects.length - 6}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* رسالة عدم وجود نتائج */}
          {filteredAndSortedClassrooms.length === 0 && (
            <div className="text-center py-8">
              <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">لم يتم العثور على فصول تطابق معايير البحث</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllClassroomsPage;