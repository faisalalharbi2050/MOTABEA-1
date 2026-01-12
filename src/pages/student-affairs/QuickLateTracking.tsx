import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClockAlert, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Search,
  Users
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  studentId: string;
  classRoom: string;
  grade: string;
}

const QuickLateTracking = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [recordedStudents, setRecordedStudents] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }));
  const [searchMode, setSearchMode] = useState<'class' | 'name'>('class');
  const [studentNameSearch, setStudentNameSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // بيانات تجريبية
  const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const classes = ['أ', 'ب', 'ج'];

  const students: Student[] = [
    {
      id: '1',
      name: 'أحمد محمد علي',
      studentId: '2024001',
      classRoom: 'الأول أ',
      grade: 'الأول'
    },
    {
      id: '2',
      name: 'محمد عبدالله',
      studentId: '2024002',
      classRoom: 'الأول أ',
      grade: 'الأول'
    },
    {
      id: '3',
      name: 'عبدالعزيز سعد',
      studentId: '2024003',
      classRoom: 'الثاني ب',
      grade: 'الثاني'
    },
    {
      id: '4',
      name: 'فيصل خالد',
      studentId: '2024004',
      classRoom: 'الثاني ب',
      grade: 'الثاني'
    }
  ];

  // التحقق من صلاحية الرابط
  useEffect(() => {
    const validateToken = async () => {
      try {
        // هنا يتم التحقق من الرابط عبر API
        // محاكاة: الرابط صالح إذا كان طوله أكبر من 5 أحرف
        if (token && token.length > 5) {
          setIsValid(true);
          // تعيين وقت انتهاء الصلاحية (ساعة من الآن)
          const expiry = new Date(Date.now() + 60 * 60 * 1000);
          setExpiryTime(expiry);
        } else {
          setIsValid(false);
        }
      } catch (error) {
        setIsValid(false);
      }
    };

    validateToken();
  }, [token]);

  // تحديث الوقت الحالي كل دقيقة
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // تسجيل طالب متأخر
  const recordLateStudent = async (studentId: string) => {
    try {
      // إرسال البيانات للخادم
      const response = await fetch('/api/student-affairs/late-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          arrivalTime: currentTime,
          date: new Date().toISOString().split('T')[0],
          token
        })
      });

      if (response.ok) {
        setRecordedStudents(prev => new Set([...prev, studentId]));
      }
    } catch (error) {
      console.error('خطأ في تسجيل التأخر:', error);
    }
  };

  // فلترة الطلاب حسب الفصل أو الاسم
  const filteredStudents = students.filter(student => {
    if (searchMode === 'name') {
      // في حالة البحث بالاسم
      if (!studentNameSearch.trim()) {
        return false;
      }
      const matchesSearch = student.name.includes(studentNameSearch.trim());
      // إذا تم تحديد طلاب معينين
      if (selectedStudentIds.size > 0) {
        return matchesSearch && selectedStudentIds.has(student.id);
      }
      return matchesSearch;
    } else {
      // في حالة البحث بالفصل
      const matchesGrade = !selectedGrade || student.grade === selectedGrade;
      const matchesClass = !selectedClass || student.classRoom.includes(selectedClass);
      return matchesGrade && matchesClass;
    }
  });

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4f46e5] mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">جاري التحقق من الرابط...</p>
        </div>
      </div>
    );
  }

  if (isValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">رابط غير صالح</h1>
          <p className="text-gray-600 mb-6">
            عذراً، هذا الرابط غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد من الإدارة.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4f46e5] to-[#818cf8] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-4 rounded-xl">
                <ClockAlert className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">رصد التأخر السريع</h1>
                <p className="text-sm text-gray-600 mt-1">الرصد الميداني للطلاب المتأخرين</p>
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Clock className="h-5 w-5" />
                <span className="text-xl font-mono font-bold">{currentTime}</span>
              </div>
              {expiryTime && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  صالح حتى: {expiryTime.toLocaleTimeString('ar-SA')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <ClockAlert className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">تم رصدهم</p>
                <p className="text-3xl font-bold text-gray-800">{recordedStudents.size}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">متبقي</p>
                <p className="text-3xl font-bold text-gray-800">
                  {filteredStudents.length - recordedStudents.size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* فلترة الفصول */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* اختيار طريقة البحث */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-[#6366f1] rounded-xl p-4 mb-6">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              <Search className="inline h-5 w-5 ml-1 text-[#4f46e5]" />
              اختر طريقة البحث
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSearchMode('class');
                  setStudentNameSearch('');
                  setSelectedStudentIds(new Set());
                }}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  searchMode === 'class'
                    ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>البحث بالصف والفصل</span>
              </button>
              <button
                onClick={() => {
                  setSearchMode('name');
                  setSelectedGrade('');
                  setSelectedClass('');
                }}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  searchMode === 'name'
                    ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <Search className="h-5 w-5" />
                <span>البحث بالاسم</span>
              </button>
            </div>
          </div>

          {/* البحث بالاسم */}
          {searchMode === 'name' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="inline h-4 w-4 ml-1" />
                  ابحث عن الطالب بالاسم
                </label>
                <input
                  type="text"
                  value={studentNameSearch}
                  onChange={(e) => setStudentNameSearch(e.target.value)}
                  placeholder="اكتب اسم الطالب..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all text-lg"
                />
              </div>
              {studentNameSearch.trim() && (
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-[#4f46e5]">{students.filter(s => s.name.includes(studentNameSearch.trim())).length}</span> طالب يتطابق مع البحث
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {students.filter(s => s.name.includes(studentNameSearch.trim())).map(student => (
                      <label
                        key={student.id}
                        className="flex items-center gap-3 bg-white p-3 rounded-lg cursor-pointer hover:bg-blue-50 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.has(student.id) || selectedStudentIds.size === 0}
                          onChange={(e) => {
                            const newSet = new Set(selectedStudentIds);
                            if (e.target.checked) {
                              newSet.add(student.id);
                            } else {
                              newSet.delete(student.id);
                            }
                            setSelectedStudentIds(newSet);
                          }}
                          className="w-5 h-5 text-[#4f46e5] border-gray-300 rounded focus:ring-[#4f46e5]"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.classRoom} - {student.studentId}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* اختيار الصف */}
          {searchMode === 'class' && (
          <>
          <h2 className="text-lg font-bold text-gray-800 mb-4">اختيار الفصل</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الصف</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all text-lg"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all text-lg"
              >
                <option value="">جميع الفصول</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
          </>
          )}
        </div>

        {/* قائمة الطلاب */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">
              قائمة الطلاب ({filteredStudents.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
                  <AlertCircle className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-500">لا توجد طلاب في هذا الفصل</p>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const isRecorded = recordedStudents.has(student.id);
                return (
                  <div
                    key={student.id}
                    className={`p-6 transition-all ${
                      isRecorded ? 'bg-red-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {student.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>رقم الطالب: {student.studentId}</span>
                          <span>الفصل: {student.classRoom}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => recordLateStudent(student.id)}
                        disabled={isRecorded}
                        className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md ${
                          isRecorded
                            ? 'bg-red-600 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        {isRecorded ? (
                          <>
                            <CheckCircle className="inline h-6 w-6 ml-2" />
                            تم التسجيل
                          </>
                        ) : (
                          <>
                            <ClockAlert className="inline h-6 w-6 ml-2" />
                            رصد التأخر
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* زر العودة */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 bg-white text-[#4f46e5] px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <ArrowRight className="h-5 w-5" />
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickLateTracking;
