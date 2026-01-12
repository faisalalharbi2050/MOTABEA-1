import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Lock, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
      <MainHeader />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-brand-light/30 rounded-2xl mb-6">
              <Shield className="w-10 h-10 text-brand-main" />
            </div>
            <h1 className="text-4xl font-extrabold text-brand-dark mb-4">سياسة الخصوصية</h1>
            <p className="text-xl text-gray-600">
              نحن نولي اهتماماً كبيراً لخصوصية بياناتك وأمانها في نظام متابع
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
                  onClick={() => navigate('/terms')}
                  className="hover:bg-brand-main/10 text-brand-dark"
                >
                  شروط الاستخدام
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                <span className="text-sm text-gray-500">آخر تحديث: يناير 2026</span>
              </div>
            </div>

            {/* Policy Content */}
            <div className="p-8 sm:p-12 space-y-12">
              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. مقدمة</h2>
                    <p className="text-gray-600 leading-relaxed">
                      مرحبًا بك في نظام "متابع". نحن ندرك أهمية الخصوصية بالنسبة لك، ونلتزم بحماية بياناتك الشخصية وبيانات مدرستك. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا للمعلومات التي تقدمها عند استخدامك لخدماتنا.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. البيانات التي نجمعها</h2>
                    <div className="space-y-4 text-gray-600 leading-relaxed">
                      <p>قد نقوم بجمع الأنواع التالية من المعلومات:</p>
                      <ul className="list-disc list-inside space-y-2 mr-4 bg-gray-50 p-6 rounded-xl">
                        <li><span className="font-semibold text-gray-900">معلومات الحساب:</span> الاسم، البريد الإلكتروني، رقم الهاتف، واسم المدرسة.</li>
                        <li><span className="font-semibold text-gray-900">البيانات المدرسية:</span> بيانات الطلاب، المعلمين، الجداول الدراسية، وسجلات الحضور والغياب التي تقوم بإدخالها للنظام.</li>
                        <li><span className="font-semibold text-gray-900">بيانات الاستخدام:</span> معلومات حول كيفية تفاعلك مع النظام لتحسين تجربتك.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg shrink-0">
                    <Lock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. كيف نستخدم بياناتك</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      نستخدم المعلومات التي نجمعها للأغراض التالية:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                        <span className="w-2 h-2 bg-brand-main rounded-full"></span>
                        <span className="text-gray-700">تقديم خدمات النظام وتشغيلها بكفاءة.</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                        <span className="w-2 h-2 bg-brand-main rounded-full"></span>
                        <span className="text-gray-700">تحسين وتطوير الميزات الجديدة.</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                        <span className="w-2 h-2 bg-brand-main rounded-full"></span>
                        <span className="text-gray-700">التواصل معك بخصوص التحديثات والدعم.</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                        <span className="w-2 h-2 bg-brand-main rounded-full"></span>
                        <span className="text-gray-700">ضمان أمان النظام وحماية المستخدمين.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg shrink-0">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. أمن البيانات</h2>
                    <p className="text-gray-600 leading-relaxed">
                      نحن نتخذ تدابير أمنية تقنية وتنظيمية متقدمة لحماية بياناتك من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف. يتم تشفير البيانات الحساسة وتخزينها على خوادم آمنة.
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-brand-light/10 p-6 rounded-2xl border border-brand-light/20">
                <h2 className="text-xl font-bold text-brand-dark mb-2">تواصل معنا</h2>
                <p className="text-gray-600 mb-4">
                  إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر:
                </p>
                <a href="mailto:privacy@motabea.com" className="text-brand-main font-semibold hover:underline">
                  privacy@motabea.com
                </a>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
