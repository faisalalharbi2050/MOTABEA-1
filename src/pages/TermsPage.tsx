import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Scale, FileCheck, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
      <MainHeader />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-brand-light/30 rounded-2xl mb-6">
              <Scale className="w-10 h-10 text-brand-main" />
            </div>
            <h1 className="text-4xl font-extrabold text-brand-dark mb-4">شروط الاستخدام</h1>
            <p className="text-xl text-gray-600">
              القواعد والضوابط المنظمة لاستخدام نظام متابع
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Content Header */}
            <div className="bg-brand-main/5 p-8 border-b border-brand-light/20">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/')}
                  className="hover:bg-brand-main/10 text-brand-dark"
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                  عودة للرئيسية
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                 <Button 
                  variant="ghost" 
                  onClick={() => navigate('/privacy-policy')}
                  className="hover:bg-brand-main/10 text-brand-dark"
                >
                  سياسة الخصوصية
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                <span className="text-sm text-gray-500">آخر تحديث: يناير 2026</span>
              </div>
            </div>

            {/* Terms Content */}
            <div className="p-8 sm:p-12 space-y-12">
              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <FileCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. قبول الشروط</h2>
                    <p className="text-gray-600 leading-relaxed">
                      بوصولك إلى نظام "متابع" واستخدامه، فإنك توافق على الالتزام بشروط الاستخدام هذه وجميع القوانين واللوائح المعمول بها. إذا كنت لا توافق على أي من هذه الشروط، فيُحظر عليك استخدام هذا النظام.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. حساب المستخدم</h2>
                    <div className="space-y-4 text-gray-600 leading-relaxed">
                      <p>للاستفادة من خدمات النظام، يجب عليك التسجيل وإنشاء حساب. أنت مسؤول عن:</p>
                      <ul className="list-disc list-inside space-y-2 mr-4 bg-gray-50 p-6 rounded-xl">
                        <li>الحفاظ على سرية معلومات وتفاصيل تسجيل الدخول الخاصة بك.</li>
                        <li>جميع الأنشطة التي تحدث تحت حسابك.</li>
                        <li>تقديم معلومات دقيقة ومحدثة وكاملة أثناء عملية التسجيل.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg shrink-0">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. الاستخدام المقبول</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      يُمنح لك ترخيص محدود لاستخدام النظام لأغراض إدارة المدرسة والمتابعة التعليمية. يُحظر عليك:
                    </p>
                    <div className="grid sm:grid-cols-1 gap-3">
                      <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
                        <span className="text-gray-700">استخدام النظام لأي غرض غير قانوني أو غير مصرح به.</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
                        <span className="text-gray-700">محاولة اختراق النظام أو الوصول إلى بيانات مدارس أخرى.</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
                        <span className="text-gray-700">نسخ أو تعديل أو توزيع أي جزء من النظام دون إذن كتابي.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg shrink-0">
                    <Scale className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. الملكية الفكرية</h2>
                    <p className="text-gray-600 leading-relaxed">
                      جميع الحقوق والملكيات والمصالح في النظام (بما في ذلك البرمجيات، التصاميم، النصوص، والشعارات) هي ملكية حصرية لنظام "متابع". يمنع استخدام علامتنا التجارية أو أي محتوى محمي بحقوق الطبع والنشر دون إذن مسبق.
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-brand-light/10 p-6 rounded-2xl border border-brand-light/20">
                <h2 className="text-xl font-bold text-brand-dark mb-2">تعديلات الشروط</h2>
                <p className="text-gray-600">
                  نحتفظ بالحق في تعديل شروط الاستخدام هذه في أي وقت. سنقوم بإشعارك بأي تغييرات جوهرية. استمرارك في استخدام النظام بعد نشر التعديلات يعني قبولك للشروط المحدثة.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
