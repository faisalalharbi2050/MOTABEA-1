import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Save, 
  AlertCircle, 
  Clock,
  Shield,
  Search,
  Filter
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  studentId: string;
  classRoom: string;
  grade: string;
  status: 'present' | 'absent' | 'not-checked';
}

interface LinkData {
  id: string;
  type: 'general' | 'teacher';
  grade?: string;
  classRoom?: string;
  expiresAt: Date;
  isActive: boolean;
  createdBy: string;
}

const ExternalAbsenceLink: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const classes = ['أ', 'ب', 'ج'];

  // محاكاة بيانات تجريبية
  const mockStudents: Student[] = [
    { id: '1', name: 'أحمد محمد علي', studentId: '2024001', classRoom: 'الأول أ', grade: 'الأول', status: 'not-checked' },
    { id: '2', name: 'محمد عبدالله', studentId: '2024002', classRoom: 'الأول أ', grade: 'الأول', status: 'not-checked' },
    { id: '3', name: 'خالد سعد', studentId: '2024003', classRoom: 'الأول أ', grade: 'الأول', status: 'not-checked' },
    { id: '4', name: 'عبدالرحمن أحمد', studentId: '2024004', classRoom: 'الأول أ', grade: 'الأول', status: 'not-checked' },
    { id: '5', name: 'سعد فهد', studentId: '2024005', classRoom: 'الثاني ب', grade: 'الثاني', status: 'not-checked' },
    { id: '6', name: 'فهد سلمان', studentId: '2024006', classRoom: 'الثاني ب', grade: 'الثاني', status: 'not-checked' },
    { id: '7', name: 'سلمان ناصر', studentId: '2024007', classRoom: 'الثالث أ', grade: 'الثالث', status: 'not-checked' },
    { id: '8', name: 'ناصر راشد', studentId: '2024008', classRoom: 'الثالث أ', grade: 'الثالث', status: 'not-checked' },
  ];

  useEffect(() => {
    // محاكاة التحقق من الرابط
    const checkLink = async () => {
      setIsLoading(true);
      
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // بيانات تجريبية
      const mockLink: LinkData = {
        id: linkId || '',
        type: 'general',
        grade: 'الأول',
        classRoom: 'أ',
        expiresAt: new Date(Date.now() + 45 * 60 * 1000), // 45 دقيقة
        isActive: true,
        createdBy: 'أحمد المدير'
      };

      // التحقق من انتهاء الصلاحية
      if (new Date() > mockLink.expiresAt) {
        setIsExpired(true);
        setIsLoading(false);
        return;
      }

      // التحقق من الحظر
      if (!mockLink.isActive) {
        setIsBlocked(true);
        setIsLoading(false);
        return;
      }

      setLinkData(mockLink);
      setStudents(mockStudents);
      
      if (mockLink.grade) setSelectedGrade(mockLink.grade);
      if (mockLink.classRoom) setSelectedClass(mockLink.classRoom);
      
      setIsLoading(false);
    };

    checkLink();
  }, [linkId]);

  const toggleStudentAbsence = (studentId: string) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId 
        ? { ...s, status: s.status === 'absent' ? 'present' : 'absent' }
        : s
    ));
    
    if (students.find(s => s.id === studentId)?.status !== 'absent') {
      setSelectedStudents(prev => new Set(prev).add(studentId));
    } else {
      setSelectedStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // محاكاة حفظ البيانات
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const absentStudents = students.filter(s => s.status === 'absent');
    
    console.log('حفظ الغياب:', {
      linkId,
      date: new Date().toISOString().split('T')[0],
      absentCount: absentStudents.length,
      students: absentStudents.map(s => ({
        id: s.id,
        name: s.name
      }))
    });
    
    setIsSaving(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm) || student.studentId.includes(searchTerm);
    const matchesGrade = !selectedGrade || student.grade === selectedGrade;
    const matchesClass = !selectedClass || student.classRoom.includes(selectedClass);
    return matchesSearch && matchesGrade && matchesClass;
  });

  const getTimeRemaining = () => {
    if (!linkData) return '';
    const now = new Date();
    const diff = linkData.expiresAt.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#4f46e5] mx-auto mb-4"></div>
          <p className="text-xl font-bold text-gray-800">جاري التحقق من الرابط...</p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md">
          <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">انتهت صلاحية الرابط</h1>
          <p className="text-lg text-gray-600 mb-6">
            عذراً، انتهت صلاحية هذا الرابط. الرجاء التواصل مع المسؤول للحصول على رابط جديد.
          </p>
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md">
          <div className="bg-orange-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-12 w-12 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">الرصد غير متاح</h1>
          <p className="text-lg text-gray-600 mb-6">
            تم إيقاف هذا الرابط من قبل المسؤول. يمكنك التواصل مع إدارة المدرسة للمزيد من المعلومات.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4f46e5] to-[#6366f1] p-4 font-kufi" style={{ direction: 'rtl' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">رصد الغياب اليومي</h1>
              <p className="text-gray-600">مدرسة متابع النموذجية</p>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Clock className="h-5 w-5" />
                <span className="font-bold text-xl">{getTimeRemaining()}</span>
              </div>
              <p className="text-sm text-gray-500">الوقت المتبقي</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-6 animate-slide-down">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-2">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-900">تم حفظ الغياب بنجاح!</h3>
                <p className="text-green-700">تم إرسال البيانات إلى النظام الرئيسي</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#4f46e5]" />
            فلترة الطلاب
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الصف</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              >
                <option value="">جميع الصفوف</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الفصل</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              >
                <option value="">جميع الفصول</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline h-4 w-4 ml-1" />
                بحث
              </label>
              <input
                type="text"
                placeholder="اسم الطالب أو رقمه"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              قائمة الطلاب ({filteredStudents.length})
            </h2>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {filteredStudents.map(student => (
              <div
                key={student.id}
                className={`p-6 border-b border-gray-200 transition-all ${
                  student.status === 'absent' ? 'bg-red-50' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.classRoom} | {student.studentId}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* زر الحالة */}
                    <button
                      onClick={() => toggleStudentAbsence(student.id)}
                      className={`px-6 py-3 rounded-lg font-bold transition-all shadow-md ${
                        student.status === 'absent'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                      }`}
                    >
                      {student.status === 'absent' ? (
                        <>
                          <XCircle className="inline h-5 w-5 ml-2" />
                          غائب
                        </>
                      ) : (
                        <>
                          <CheckCircle className="inline h-5 w-5 ml-2" />
                          حاضر
                        </>
                      )}
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <button
            onClick={handleSave}
            disabled={isSaving || students.filter(s => s.status === 'absent').length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 ${
              isSaving || students.filter(s => s.status === 'absent').length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] shadow-lg hover:shadow-xl'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-6 w-6" />
                حفظ الغياب ({students.filter(s => s.status === 'absent').length} غائب)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExternalAbsenceLink;
