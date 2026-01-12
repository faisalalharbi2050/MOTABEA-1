import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, AlertCircle, Clock, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';

const RefundPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
      <MainHeader />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-brand-light/30 rounded-2xl mb-6">
              <Banknote className="w-10 h-10 text-brand-main" />
            </div>
            <h1 className="text-4xl font-extrabold text-brand-dark mb-4">سياسة الاسترجاع</h1>
            <p className="text-xl text-gray-600">
              نلتزم بضمان حقوق عملائنا وتقديم خدمة ذات جودة عالية
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
                <span className="text-sm text-gray-500">آخر تحديث: يناير 2026</span>
              </div>
            </div>

            {/* Policy Content */}
            <div className="p-8 sm:p-12 space-y-12">
              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">شروط الاسترجاع</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      نحرص في نظام "متابع" على رضا عملائنا، ويمكن طلب استرجاع المبلغ المدفوع في الحالات التالية فقط:
                    </p>
                    <ul className="list-disc list-inside space-y-2 mr-4 bg-gray-50 p-6 rounded-xl text-gray-700">
                      <li>وجود مشكلة تقنية جوهرية في النظام تمنع الاستفادة من الخدمة.</li>
                      <li>تعذر تقديم حلول للمشكلة التقنية من قبل فريق الدعم الفني لدينا.</li>
                      <li>عدم التمكن من استخدام النظام للأغراض الأساسية المعلن عنها.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">المدة الزمنية</h2>
                    <p className="text-gray-600 leading-relaxed">
                      يجب تقديم طلب الاسترجاع خلال مدة أقصاها <span className="font-bold text-gray-900">5 أيام</span> من تاريخ عملية الدفع. لن يتم قبول أي طلبات استرجاع بعد انقضاء هذه المدة.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg shrink-0">
                    <Banknote className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">الرسوم الإدارية</h2>
                    <p className="text-gray-600 leading-relaxed">
                      في حال قبول طلب الاسترجاع واستيفاء الشروط المذكورة أعلاه، سيتم استرجاع المبلغ المدفوع بعد خصم <span className="font-bold text-red-600">25%</span> من قيمة الباقة كرسوم إدارية وتشغيلية.
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-brand-light/10 p-6 rounded-2xl border border-brand-light/20">
                <h2 className="text-xl font-bold text-brand-dark mb-2">تقديم طلب استرجاع</h2>
                <p className="text-gray-600 mb-4">
                  لتقديم طلب استرجاع، يرجى التواصل مع فريق الدعم الفني وتوضيح المشكلة التقنية بالتفصيل:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                   <a href="mailto:support@motabea.com" className="text-brand-main font-semibold hover:underline flex items-center gap-2">
                     <span className="w-2 h-2 bg-brand-main rounded-full"></span>
                     support@motabea.com
                   </a>
                   <a href="https://wa.me/966505015005" target="_blank" rel="noreferrer" className="text-brand-main font-semibold hover:underline flex items-center gap-2">
                     <span className="w-2 h-2 bg-brand-main rounded-full"></span>
                     تواصل عبر واتساب
                   </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicyPage;
