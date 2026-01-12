import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, User, Calendar, BookOpen, Home, X, FileText } from 'lucide-react';

interface AssignmentConfirmationPageProps {}

const AssignmentConfirmationPage: React.FC<AssignmentConfirmationPageProps> = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigned, setIsSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // محاكاة تحميل بيانات الإسناد
  useEffect(() => {
    // في التطبيق الفعلي، سيتم جلب البيانات من API
    setTimeout(() => {
      setAssignment({
        id: assignmentId,
        absentTeacherName: 'أحمد محمد علي',
        substituteTeacherName: 'سارة أحمد المالكي',
        date: '2025-10-15',
        hijriDate: '12/4/1447هـ',
        dayName: 'الأربعاء',
        periodNumber: 3,
        className: '2/أ',
        subject: 'الرياضيات',
        isConfirmedBySubstitute: false,
        schoolName: 'مدرسة الإمام محمد بن سعود الابتدائية'
      });
      setIsLoading(false);
    }, 1000);
  }, [assignmentId]);

  // معالج التوقيع
  const handleSign = async () => {
    setIsSubmitting(true);
    
    // محاكاة إرسال التوقيع إلى الخادم
    setTimeout(() => {
      setIsSigned(true);
      setIsSubmitting(false);
      
      // في التطبيق الفعلي، سيتم تحديث البيانات في قاعدة البيانات
      console.log('تم التوقيع على الإسناد:', assignmentId);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6" dir="rtl">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">غير موجود</h2>
            <p className="text-gray-600 mb-6">الإسناد المطلوب غير موجود أو تم حذفه</p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Home className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* رأس الصفحة */}
        <Card className="shadow-xl border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">إشعار انتظار</h1>
              <p className="text-blue-100">{assignment.schoolName}</p>
            </div>
          </CardHeader>
        </Card>

        {/* حالة التوقيع */}
        {isSigned ? (
          <Card className="shadow-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-green-700 mb-2">تم التوقيع بنجاح!</h2>
              <p className="text-green-600 text-lg mb-6">
                شكراً لك، تم تسجيل علمك واطلاعك على الإسناد
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => window.print()}
                  variant="outline"
                  className="border-2 border-green-500 text-green-700 hover:bg-green-50"
                >
                  <FileText className="w-4 h-4 ml-2" />
                  طباعة الإشعار
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Home className="w-4 h-4 ml-2" />
                  العودة للرئيسية
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* معلومات الإسناد */}
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                <CardTitle className="text-right text-gray-800 flex items-center gap-2">
                  <User className="w-6 h-6 text-orange-600" />
                  تفاصيل الإسناد
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  
                  {/* المعلم المنتظر */}
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-600 font-medium mb-1">المعلم المنتظر</p>
                    <p className="text-2xl font-bold text-blue-900">{assignment.substituteTeacherName}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* التاريخ */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <p className="text-sm text-gray-600 font-medium">اليوم والتاريخ</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{assignment.dayName}</p>
                      <p className="text-sm text-gray-600">{assignment.date}</p>
                      <p className="text-xs text-gray-500">{assignment.hijriDate}</p>
                    </div>

                    {/* الحصة */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <p className="text-sm text-gray-600 font-medium">الحصة</p>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">الحصة {assignment.periodNumber}</p>
                    </div>

                    {/* الفصل */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="w-5 h-5 text-gray-600" />
                        <p className="text-sm text-gray-600 font-medium">الفصل</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{assignment.className}</p>
                    </div>

                    {/* المادة */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-gray-600" />
                        <p className="text-sm text-gray-600 font-medium">المادة</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{assignment.subject}</p>
                    </div>
                  </div>

                  {/* المعلم الغائب */}
                  <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                    <p className="text-sm text-red-600 font-medium mb-1">بدلاً من المعلم الغائب</p>
                    <p className="text-xl font-bold text-red-900">{assignment.absentTeacherName}</p>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* قسم التوقيع */}
            <Card className="shadow-xl border-2 border-blue-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-right text-gray-800">التوقيع بالعلم والاطلاع</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      بالضغط على زر "التوقيع بالعلم والاطلاع" أدناه، أؤكد أنني قد اطلعت على تفاصيل هذا الإسناد
                      وأتعهد بالحضور في الموعد المحدد لتغطية الحصة المذكورة أعلاه.
                    </p>
                  </div>

                  <Button 
                    onClick={handleSign}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-6 text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white ml-3"></div>
                        جاري التوقيع...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-7 h-7 ml-3" />
                        التوقيع بالعلم والاطلاع
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-gray-500">
                    سيتم تحديث حالة الإسناد تلقائياً بعد التوقيع
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* معلومات إضافية */}
        <Card className="shadow-lg border border-gray-200">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 text-center">
              هذا الإشعار تم إنشاؤه تلقائياً من نظام MOTABEA لإدارة المدارس
              <br />
              في حالة وجود أي استفسار، يرجى التواصل مع إدارة المدرسة
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AssignmentConfirmationPage;
