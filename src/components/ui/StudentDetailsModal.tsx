import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from './separator';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Users, 
  School,
  Heart,
  BookOpen,
  AlertTriangle,
  Edit,
  Trash2,
  Move,
  X,
  UserCheck,
  Clock,
  FileText
} from 'lucide-react';
import { Student } from '../../types/student';
import { Classroom } from '../../types/classroom';

interface StudentDetailsModalProps {
  student: Student | null;
  classroom?: Classroom;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (student: Student) => void;
  onDelete?: (studentId: string) => void;
  onMove?: (studentId: string) => void;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  student,
  classroom,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onMove
}) => {
  if (!student) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'نشط', color: 'bg-green-100 text-green-800 border-green-200' },
      transferred: { label: 'منقول', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      graduated: { label: 'متخرج', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      dropped: { label: 'منقطع', color: 'bg-red-100 text-red-800 border-red-200' },
      suspended: { label: 'موقوف', color: 'bg-orange-100 text-orange-800 border-orange-200' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getAcademicLevelBadge = (level: string) => {
    const levelConfig = {
      excellent: { label: 'ممتاز', color: 'bg-green-100 text-green-800' },
      good: { label: 'جيد', color: 'bg-blue-100 text-blue-800' },
      average: { label: 'متوسط', color: 'bg-yellow-100 text-yellow-800' },
      needs_improvement: { label: 'يحتاج تحسين', color: 'bg-red-100 text-red-800' }
    };

    const config = levelConfig[level as keyof typeof levelConfig];
    if (!config) return null;
    
    return (
      <span className={`px-2 py-1 rounded text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'غير محدد';
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: Date | string) => {
    if (!birthDate) return 'غير محدد';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return `${age} سنة`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-6 h-6 ml-3 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">{student.name}</h2>
                <p className="text-sm text-gray-500 font-normal">رقم الطالب: {student.student_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(student.status)}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* المعلومات الأساسية */}
          <div className="lg:col-span-2 space-y-6">
            {/* البيانات الشخصية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 ml-2 text-blue-600" />
                  البيانات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">الاسم الكامل</label>
                    <p className="text-gray-900 font-medium">{student.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">رقم الهوية</label>
                    <p className="text-gray-900">{student.national_id || 'غير محدد'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">تاريخ الميلاد</label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 ml-2 text-gray-400" />
                      <p className="text-gray-900">{formatDate(student.birth_date)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">العمر</label>
                    <p className="text-gray-900">{calculateAge(student.birth_date)}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">الجنس</label>
                    <p className="text-gray-900">{student.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">تاريخ التسجيل</label>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 ml-2 text-gray-400" />
                      <p className="text-gray-900">{formatDate(student.enrollment_date)}</p>
                    </div>
                  </div>
                </div>
                
                {student.address && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">العنوان</label>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 ml-2 mt-1 text-gray-400" />
                      <p className="text-gray-900 flex-1">{student.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* بيانات الدراسة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 ml-2 text-green-600" />
                  بيانات الدراسة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">الصف</label>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 ml-2 text-gray-400" />
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        الصف {student.grade_level}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">الفصل</label>
                    <div className="flex items-center">
                      <School className="w-4 h-4 ml-2 text-gray-400" />
                      <p className="text-gray-900 font-medium">{student.class_name || 'غير محدد'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">الشعبة</label>
                    <p className="text-gray-900">{student.section || 'غير محدد'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">المستوى الأكاديمي</label>
                    <div>{getAcademicLevelBadge(student.academic_level)}</div>
                  </div>
                </div>
                
                {classroom && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-gray-700">تفاصيل الفصل</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>رقم الغرفة: {classroom.roomNumber || 'غير محدد'}</div>
                      <div>السعة: {classroom.currentStudents}/{classroom.capacity}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* بيانات ولي الأمر */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 ml-2 text-orange-600" />
                  بيانات ولي الأمر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">اسم الوالد</label>
                    <p className="text-gray-900 font-medium">{student.parent_name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">جوال الوالد</label>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 ml-2 text-gray-400" />
                      <a href={`tel:${student.parent_phone}`} className="text-blue-600 hover:underline">
                        {student.parent_phone}
                      </a>
                    </div>
                  </div>
                  {student.parent_email && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">بريد الوالد</label>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 ml-2 text-gray-400" />
                        <a href={`mailto:${student.parent_email}`} className="text-blue-600 hover:underline">
                          {student.parent_email}
                        </a>
                      </div>
                    </div>
                  )}
                  {student.mother_name && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">اسم الوالدة</label>
                      <p className="text-gray-900">{student.mother_name}</p>
                    </div>
                  )}
                  {student.mother_phone && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">جوال الوالدة</label>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 ml-2 text-gray-400" />
                        <a href={`tel:${student.mother_phone}`} className="text-blue-600 hover:underline">
                          {student.mother_phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {student.emergency_contact && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">جهة الاتصال في الطوارئ</label>
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 ml-2 text-red-500" />
                        <p className="text-gray-900">{student.emergency_contact}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* الملاحظات والحالة الطبية */}
            {(student.medical_conditions?.length || student.behavioral_notes) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 ml-2 text-red-600" />
                    الملاحظات الطبية والسلوكية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {student.medical_conditions && student.medical_conditions.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">الحالات الطبية</label>
                      <div className="flex flex-wrap gap-2">
                        {student.medical_conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-red-600 border-red-200">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {student.behavioral_notes && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">الملاحظات السلوكية</label>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-gray-900">{student.behavioral_notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ملاحظات إضافية */}
            {student.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 ml-2 text-gray-600" />
                    ملاحظات إضافية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">{student.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* الإجراءات */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الإجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => onEdit?.(student)} 
                  className="w-full justify-start bg-green-600 hover:bg-green-700"
                >
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل البيانات
                </Button>
                <Button 
                  onClick={() => onMove?.(student.id)} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Move className="w-4 h-4 ml-2" />
                  نقل إلى فصل آخر
                </Button>
                <Separator />
                <Button 
                  onClick={() => onDelete?.(student.id)} 
                  variant="outline" 
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف الطالب
                </Button>
              </CardContent>
            </Card>

            {/* إحصائيات سريعة */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إحصائيات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <UserCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">مدة الدراسة</p>
                  <p className="font-semibold text-blue-600">
                    {student.enrollment_date 
                      ? `${Math.floor((new Date().getTime() - new Date(student.enrollment_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} سنة`
                      : 'غير محدد'
                    }
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">المستوى الأكاديمي</p>
                  <p className="font-semibold text-green-600">
                    {(() => {
                      const levels: Record<string, string> = {
                        excellent: 'ممتاز',
                        good: 'جيد',
                        average: 'متوسط',
                        needs_improvement: 'يحتاج تحسين'
                      };
                      return levels[student.academic_level] || 'غير محدد';
                    })()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* معلومات النظام */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">معلومات النظام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-500">
                <div>تاريخ الإنشاء: {formatDate(student.created_at)}</div>
                <div>آخر تحديث: {formatDate(student.updated_at)}</div>
                <div>معرف الطالب: {student.id}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsModal;