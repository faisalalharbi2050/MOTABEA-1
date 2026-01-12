import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { 
  Search, 
  Filter, 
  X, 
  Users, 
  GraduationCap, 
  School,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { Student } from '../../types/student';
import { Classroom } from '../../types/classroom';

interface StudentsFilterProps {
  students: Student[];
  classrooms: Classroom[];
  onFilterChange: (filteredStudents: Student[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
  selectedClass: string;
  onClassChange: (classId: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const StudentsFilter: React.FC<StudentsFilterProps> = ({
  students,
  classrooms,
  onFilterChange,
  searchTerm,
  onSearchChange,
  selectedGrade,
  onGradeChange,
  selectedClass,
  onClassChange,
  selectedStatus,
  onStatusChange
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // الحصول على المراحل الفريدة
  const uniqueGrades = Array.from(new Set(students.map(s => s.grade_level))).sort();
  
  // الحصول على الحالات الفريدة
  const uniqueStatuses = Array.from(new Set(students.map(s => s.status)));

  // تطبيق الفلاتر
  React.useEffect(() => {
    let filtered = students;

    // فلتر البحث
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchLower) ||
        student.student_id.toLowerCase().includes(searchLower) ||
        student.parent_name?.toLowerCase().includes(searchLower) ||
        student.parent_phone?.includes(searchTerm)
      );
    }

    // فلتر الصف
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(student => student.grade_level.toString() === selectedGrade);
    }

    // فلتر الفصل
    if (selectedClass !== 'all') {
      filtered = filtered.filter(student => student.class_id === selectedClass);
    }

    // فلتر الحالة
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(student => student.status === selectedStatus);
    }

    onFilterChange(filtered);
  }, [students, searchTerm, selectedGrade, selectedClass, selectedStatus, onFilterChange]);

  const resetFilters = () => {
    onSearchChange('');
    onGradeChange('all');
    onClassChange('all');
    onStatusChange('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (selectedGrade !== 'all') count++;
    if (selectedClass !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    return count;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'transferred': return 'secondary';
      case 'graduated': return 'outline';
      case 'dropped': return 'destructive';
      case 'suspended': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'transferred': return 'منقول';
      case 'graduated': return 'متخرج';
      case 'dropped': return 'منقطع';
      case 'suspended': return 'موقوف';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Search className="w-5 h-5 ml-2 text-blue-600" />
            البحث والفلترة
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="mr-2">
                {getActiveFiltersCount()} مرشح نشط
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-gray-600"
            >
              <SlidersHorizontal className="w-4 h-4 ml-1" />
              فلاتر متقدمة
            </Button>
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-red-600 hover:text-red-700"
              >
                <RefreshCw className="w-4 h-4 ml-1" />
                إعادة تعيين
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* البحث الرئيسي */}
        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث بالاسم، رقم الطالب، اسم الوالد، أو رقم الجوال..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* الفلاتر الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">الصف</label>
            <Select value={selectedGrade} onValueChange={onGradeChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الصف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center">
                    <GraduationCap className="w-4 h-4 ml-2" />
                    جميع الصفوف
                  </div>
                </SelectItem>
                {uniqueGrades.map(grade => (
                  <SelectItem key={grade} value={grade.toString()}>
                    الصف {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">الفصل</label>
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفصل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center">
                    <School className="w-4 h-4 ml-2" />
                    جميع الفصول
                  </div>
                </SelectItem>
                {classrooms.map(classroom => (
                  <SelectItem key={classroom.id} value={classroom.id}>
                    {classroom.name}
                    <span className="text-sm text-gray-500 mr-2">
                      ({classroom.currentStudents}/{classroom.capacity})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">الحالة</label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 ml-2" />
                    جميع الحالات
                  </div>
                </SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    <Badge variant={getStatusBadgeVariant(status)} className="text-xs">
                      {getStatusLabel(status)}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* الفلاتر المتقدمة */}
        {showAdvancedFilters && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-700 flex items-center">
              <Filter className="w-4 h-4 ml-2" />
              فلاتر متقدمة
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* يمكن إضافة المزيد من الفلاتر هنا */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">المستوى الأكاديمي</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستويات</SelectItem>
                    <SelectItem value="excellent">ممتاز</SelectItem>
                    <SelectItem value="good">جيد</SelectItem>
                    <SelectItem value="average">متوسط</SelectItem>
                    <SelectItem value="needs_improvement">يحتاج تحسين</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">الجنس</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الجنس" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* ملخص النتائج */}
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center">
            <Users className="w-4 h-4 ml-2" />
            عدد النتائج: <strong className="mr-1">{students.length}</strong> طالب
          </div>
          {getActiveFiltersCount() > 0 && (
            <div className="flex items-center text-blue-600">
              <Filter className="w-4 h-4 ml-2" />
              تم تطبيق {getActiveFiltersCount()} مرشح
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsFilter;