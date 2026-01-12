import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Move, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  MoreHorizontal,
  Download,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserPlus
} from 'lucide-react';
import { Student } from '../../types/student';
import { Classroom } from '../../types/classroom';

interface StudentsTableProps {
  students: Student[];
  classrooms: Classroom[];
  onStudentSelect?: (student: Student) => void;
  onStudentEdit?: (student: Student) => void;
  onStudentDelete?: (studentId: string) => void;
  onStudentMove?: (studentId: string) => void;
  isLoading?: boolean;
}

const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  classrooms,
  onStudentSelect,
  onStudentEdit,
  onStudentDelete,
  onStudentMove,
  isLoading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Student>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // الترتيب
  const sortedStudents = React.useMemo(() => {
    return [...students].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue, 'ar')
          : bValue.localeCompare(aValue, 'ar');
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [students, sortField, sortDirection]);

  // التصفح
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = sortedStudents.slice(startIndex, endIndex);

  const handleSort = (field: keyof Student) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === currentStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(currentStudents.map(s => s.id));
    }
  };

  const getClassroomName = (classId?: string) => {
    if (!classId) return 'غير محدد';
    const classroom = classrooms.find(c => c.id === classId);
    return classroom ? classroom.name : 'غير موجود';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'نشط', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      transferred: { label: 'منقول', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      graduated: { label: 'متخرج', variant: 'outline' as const, color: 'bg-purple-100 text-purple-800' },
      dropped: { label: 'منقطع', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      suspended: { label: 'موقوف', variant: 'destructive' as const, color: 'bg-orange-100 text-orange-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات الطلاب...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد بيانات طلاب</h3>
          <p className="text-gray-600 mb-6">ابدأ بإضافة الطلاب من خلال استيراد ملف Excel أو إضافة طالب جديد</p>
          <div className="flex justify-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة طالب جديد
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 ml-2" />
              تحميل نموذج Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* أدوات الجدول */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-5 h-5 ml-2 text-blue-600" />
              قائمة الطلاب
              <Badge variant="secondary" className="mr-3">
                {students.length} طالب
              </Badge>
            </div>
            <div className="flex gap-2">
              {selectedStudents.length > 0 && (
                <>
                  <Badge variant="outline" className="px-3 py-1">
                    {selectedStudents.length} محدد
                  </Badge>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف المحدد
                  </Button>
                  <Button variant="outline" size="sm">
                    <Move className="w-4 h-4 ml-1" />
                    نقل المحدد
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 ml-1" />
                تصدير Excel
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <UserPlus className="w-4 h-4 ml-1" />
                إضافة طالب
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* إعدادات العرض */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">عرض</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">عنصر</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              عرض {startIndex + 1}-{Math.min(endIndex, students.length)} من أصل {students.length}
            </div>
          </div>

          {/* الجدول */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-right">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === currentStudents.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="p-3 text-right">#</th>
                  <th 
                    className="p-3 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      اسم الطالب
                      <ArrowUpDown className="w-4 h-4 mr-1" />
                    </div>
                  </th>
                  <th 
                    className="p-3 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('grade_level')}
                  >
                    <div className="flex items-center">
                      الصف
                      <ArrowUpDown className="w-4 h-4 mr-1" />
                    </div>
                  </th>
                  <th className="p-3 text-right">الفصل</th>
                  <th className="p-3 text-right">ولي الأمر</th>
                  <th className="p-3 text-right">الجوال</th>
                  <th 
                    className="p-3 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      الحالة
                      <ArrowUpDown className="w-4 h-4 mr-1" />
                    </div>
                  </th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student, index) => (
                  <tr 
                    key={student.id} 
                    className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onStudentSelect?.(student)}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3 text-gray-600">{startIndex + index + 1}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {student.student_id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        الصف {student.grade_level}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-gray-700">
                        {getClassroomName(student.class_id)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-800">{student.parent_name}</div>
                        {student.parent_email && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 ml-1" />
                            {student.parent_email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-4 h-4 ml-2 text-gray-400" />
                        {student.parent_phone}
                      </div>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStudentSelect?.(student)}
                          title="عرض التفاصيل"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStudentEdit?.(student)}
                          title="تعديل"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStudentMove?.(student.id)}
                          title="نقل فصل"
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <Move className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStudentDelete?.(student.id)}
                          title="حذف"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* التنقل بين الصفحات */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {currentPage < totalPages - 2 && totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsTable;