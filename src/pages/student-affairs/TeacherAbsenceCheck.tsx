import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserX, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Send
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  studentId: string;
  classRoom: string;
  status: 'present' | 'absent';
}

const TeacherAbsenceCheck = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [classInfo, setClassInfo] = useState({ grade: '', class: '', period: '' });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }));

  // بيانات تجريبية للطلاب
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'أحمد محمد علي',
      studentId: '2024001',
      classRoom: 'الأول أ',
      status: 'present'
    },
    {
      id: '2',
      name: 'محمد عبدالله',
      studentId: '2024002',
      classRoom: 'الأول أ',
      status: 'present'
    },
    {
      id: '3',
      name: 'عبدالعزيز سعد',
      studentId: '2024003',
      classRoom: 'الأول أ',
      status: 'present'
    },
    {
      id: '4',
      name: 'فيصل خالد',
      studentId: '2024004',
      classRoom: 'الأول أ',
      status: 'present'
    },
    {
      id: '5',
      name: 'خالد عبدالرحمن',
      studentId: '2024005',
      classRoom: 'الأول أ',
      status: 'present'
    }
  ]);

  // التحقق من صلاحية الرابط
  useEffect(() => {
    const validateToken = async () => {
      try {
        if (token && token.length > 5) {
          setIsValid(true);
          const expiry = new Date(Date.now() + 60 * 60 * 1000);
          setExpiryTime(expiry);
          setClassInfo({ grade: 'الأول', class: 'أ', period: 'الحصة الثانية' });
        } else {
          setIsValid(false);
        }
      } catch (error) {
        setIsValid(false);
      }
    };

    validateToken();
  }, [token]);

  // تحديث الوقت كل دقيقة
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // تبديل حالة الطالب
  const toggleStudentStatus = (studentId: string) => {
    if (hasSubmitted) return;
    
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, status: student.status === 'present' ? 'absent' : 'present' }
        : student
    ));
  };

  // حفظ الرصد
  const handleSubmit = async () => {
    try {
      const absentStudents = students.filter(s => s.status === 'absent');
      
      // إرسال البيانات للخادم
      const response = await fetch('/api/student-affairs/teacher-absence-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          classInfo,
          students: students.map(s => ({
            id: s.id,
            name: s.name,
            status: s.status
          })),
          submittedAt: new Date()
        })
      });

      if (response.ok) {
        setHasSubmitted(true);
        
        // إرسال إشعار للوكيل
        console.log(`تم رصد الغياب في ${classInfo.grade} ${classInfo.class} - ${classInfo.period}`);
        console.log(`عدد الغائبين: ${absentStudents.length}`);
      }
    } catch (error) {
      console.error('خطأ في حفظ الرصد:', error);
    }
  };

  // عدد الحاضرين والغائبين
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;

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

  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">تم الحفظ بنجاح!</h1>
          <p className="text-gray-600 mb-4">
            تم رصد الغياب بنجاح وإرسال إشعار للإدارة.
          </p>
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>الفصل:</strong> {classInfo.grade} {classInfo.class}</p>
              <p><strong>الحصة:</strong> {classInfo.period}</p>
              <p><strong>الحاضرون:</strong> {presentCount}</p>
              <p><strong>الغائبون:</strong> {absentCount}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
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
                <UserX className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">رصد الغياب</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {classInfo.grade} {classInfo.class} - {classInfo.period}
                </p>
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

        {/* تعليمات */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📋 تعليمات الرصد</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>جميع الطلاب <strong>حاضرون</strong> افتراضياً (علامة صح خضراء)</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span>اضغط على الطالب لتحويله إلى <strong>غائب</strong> (علامة خطأ حمراء)</span>
            </li>
            <li className="flex items-start gap-2">
              <Send className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>بعد الانتهاء اضغط <strong>حفظ وإرسال</strong> لإشعار الإدارة</span>
            </li>
          </ul>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">الحاضرون</p>
                <p className="text-3xl font-bold text-gray-800">{presentCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">الغائبون</p>
                <p className="text-3xl font-bold text-gray-800">{absentCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* قائمة الطلاب */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">
              قائمة الطلاب ({students.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => toggleStudentStatus(student.id)}
                className={`w-full p-6 text-right transition-all hover:bg-gray-50 ${
                  student.status === 'absent' ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {student.status === 'present' ? (
                      <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    ) : (
                      <div className="bg-red-100 p-3 rounded-full">
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 text-right">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600 text-right">
                        رقم الطالب: {student.studentId}
                      </p>
                    </div>
                  </div>
                  <div>
                    {student.status === 'present' ? (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800">
                        حاضر
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-800">
                        غائب
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={hasSubmitted}
            className="flex-1 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="inline h-6 w-6 ml-2" />
            حفظ وإرسال للإدارة
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white text-gray-700 px-6 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            <ArrowRight className="inline h-5 w-5 ml-1" />
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherAbsenceCheck;
