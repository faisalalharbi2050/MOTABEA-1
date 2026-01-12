import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle,
  Chrome,
  ArrowLeft,
  MessageCircle,
  Play,
  Users,
  Lock,
  Zap,
  FileCheck,
  TrendingUp,
  BarChart,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Check,
  Rocket,
  Mail,
  Percent
} from "lucide-react";
import MainHeader from "@/components/MainHeader";
import Features from "@/components/Features";

import Footer from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";

import TestimonialsSection from "@/components/TestimonialsSection";
import { motion } from "framer-motion";

export default function Index() {
  const navigate = useNavigate();
  
  return (
    <main dir="rtl" className="relative font-arabic">
      <MainHeader />
      <HeroSection />
      <Features showAll={true} />

      {/* Statistics Section - Redesigned Trust Strip */}
      <section className="py-24 bg-[#1e1b4b] relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#655ac1] rounded-full blur-[100px] -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4f46e5] rounded-full blur-[100px] -ml-20 -mb-20"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
           
           {/* Header */}
           <div className="text-center mb-20">
              <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white text-sm font-medium mb-6"
              >
                  <TrendingUp className="w-4 h-4 text-[#a5b4fc]" />
                  <span>نمو مستمر</span>
              </motion.div>
              
              <motion.h2 
                 initial={{ opacity: 0, y: 10 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 viewport={{ once: true }}
                 className="text-4xl sm:text-5xl font-bold text-white relative inline-block mx-auto"
              >
                  متابع في أرقام
                  {/* Underline Decoration */}
                  <svg className="absolute w-full h-3 -bottom-4 left-0 text-[#655ac1] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                  </svg>
              </motion.h2>
           </div>
           
           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 text-center max-w-5xl mx-auto">
               
               {/* Metric 1 */}
               <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 0.2 }}
                   viewport={{ once: true }}
                   className="flex flex-col items-center group"
               >
                    <div className="text-6xl sm:text-7xl font-black text-white mb-4 font-english tracking-tighter group-hover:scale-105 transition-transform duration-300">
                        +10000
                    </div>
                    <div className="flex items-center gap-3 text-[#c7d2fe] text-xl font-medium bg-white/5 px-6 py-2 rounded-full backdrop-blur-sm border border-white/5">
                        <BarChart className="w-5 h-5 text-[#818cf8]" />
                        <span>زيارة شهرية</span>
                    </div>
               </motion.div>

               {/* Metric 2 */}
               <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 0.3 }}
                   viewport={{ once: true }}
                   className="flex flex-col items-center group"
               >
                    <div className="text-6xl sm:text-7xl font-black text-white mb-4 font-english tracking-tighter group-hover:scale-105 transition-transform duration-300">
                        +2500
                    </div>
                    <div className="flex items-center gap-3 text-[#c7d2fe] text-xl font-medium bg-white/5 px-6 py-2 rounded-full backdrop-blur-sm border border-white/5">
                        <TrendingUp className="w-5 h-5 text-[#818cf8]" />
                        <span>زيارة أسبوعية</span>
                    </div>
               </motion.div>

               {/* Metric 3 */}
               <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 0.4 }}
                   viewport={{ once: true }}
                   className="flex flex-col items-center group"
               >
                    <div className="text-6xl sm:text-7xl font-black text-white mb-4 font-english tracking-tighter group-hover:scale-105 transition-transform duration-300">
                        +1500
                    </div>
                   <div className="flex items-center gap-3 text-[#c7d2fe] text-xl font-medium bg-white/5 px-6 py-2 rounded-full backdrop-blur-sm border border-white/5">
                        <Users className="w-5 h-5 text-[#818cf8]" />
                        <span>مستخدم نشط</span>
                    </div>
               </motion.div>

           </div>
        </div>
      </section>

      <TestimonialsSection />
      <PricingSection />

      <ChromeExtensionSection />
      <Footer />
      <ScrollToTopButton />
    </main>
  );
}

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#655ac1] pt-24 pb-16 lg:pt-32 lg:pb-24 min-h-[600px] flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 text-right">
          
          {/* Text Content - Right Side */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-16 leading-tight relative">
                <span className="relative z-10">متابع</span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl text-white/95 mt-8 relative z-10 font-bold">ليوم دراسي منظّم</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed font-medium">
                نظام ذكي يُبسّط المهام
                <br />
                ومتوافق مع الواقع المدرسي
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-start relative z-10 mb-12">
                <Button 
                  className="group relative h-14 min-w-[300px] text-xl !bg-white !text-[#655ac1] hover:!bg-[#655ac1] hover:!text-white border-2 border-transparent hover:border-[#e5e1fe] rounded-2xl shadow-xl transition-all duration-500 font-extrabold overflow-hidden"
                  onClick={() => window.location.href="/register"}
                >
                  {/* Arrow at Start (Right in RTL) - Exits on Hover */}
                  <ArrowLeft className="absolute right-6 w-6 h-6 transition-all duration-500 opacity-100 group-hover:opacity-0 group-hover:-translate-x-8" />
                  
                  <span className="relative z-10">ابدأ الآن مجاناً</span>
                  
                  {/* Arrow at End (Left in RTL) - Enters on Hover */}
                  <ArrowLeft className="absolute left-6 w-6 h-6 transition-all duration-500 opacity-0 translate-x-8 group-hover:opacity-100 group-hover:translate-x-0" />
                </Button>
              </div>
            </motion.div>
          </div>
          
          {/* Image Content - Left Side */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="relative z-10 w-full max-w-[700px] flex items-center justify-center p-8"
             >
                {/* 1. Website Frame Background (Matches Reference Image) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[80%] bg-gradient-to-b from-[#bdaefb] to-[#8d7efb] rounded-2xl shadow-2xl border-t border-white/40 z-0 opacity-95">
                    {/* Browser Header (Apple Style Dots) */}
                    <div className="h-8 bg-black/10 flex items-center px-4 gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div> {/* Red */}
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"></div> {/* Yellow */}
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div> {/* Green */}
                        {/* Address Bar Line */}
                        <div className="ml-4 w-1/3 h-1.5 bg-white/20 rounded-full"></div>
                    </div>
                    
                    {/* Dashboard Content */}
                    <div className="relative h-full w-full overflow-hidden">
                        {/* Right Side List (Abstract Lines) */}
                        <div className="absolute top-8 right-8 flex flex-col items-end gap-3 z-10 w-1/3">
                            <div className="w-full h-2 bg-white/30 rounded-full mb-2"></div>
                             {/* List items with Bullet */}
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center gap-2 w-full justify-end">
                                     <div className="h-1.5 w-2/3 bg-white/20 rounded-full"></div>
                                     <div className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0"></div>
                                </div>
                            ))}
                        </div>

                         {/* Bottom Wave Chart (SVG) */}
                        <div className="absolute bottom-6 left-0 right-0 h-1/2 z-0 hidden lg:block">
                             <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full text-[#7c6dfa] fill-current opacity-80">
                                  <path d="M0 50 L0 35 Q 20 10 40 35 T 80 30 T 100 20 V 50 Z" />
                             </svg>
                             <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute bottom-0 left-0 right-0 w-full h-full text-[#6a5bf7] fill-current opacity-60 transform scale-y-110 origin-bottom">
                                  <path d="M0 50 L0 40 Q 30 20 50 40 T 100 10 V 50 Z" /> 
                             </svg>
                        </div>
                    </div>
                </div>

                {/* 2. Floating UI Widgets (Dynamic Data Points) */}
                


                {/* 3. The Man Image (Blended Bottom) */}
                <img 
                  src="/images/landing/saudi-principal.png" 
                  alt="مدير مدرسة سعودي" 
                  className="relative z-10 max-w-full h-auto max-h-[625px] md:max-h-[850px] object-contain drop-shadow-2xl -translate-y-16 origin-top scale-110 md:scale-120"
                  style={{ 
                    maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
                  }}
                />

                {/* Vertical Icon Dock (Right Edge of Frame) */}
                <div className="absolute top-1/2 -translate-y-1/2 -right-6 md:-right-12 z-30 flex flex-col gap-6 pointer-events-none items-center">
                    
                    {/* 1. TOP: Rocket (Speed/Launch) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: -50 }}
                        animate={{ opacity: 1, scale: 1, x: -50, y: [-6, 6, -6] }}
                        transition={{ 
                            delay: 0.2, 
                            duration: 0.5, // Quick fade in
                            y: { duration: 3, repeat: Infinity, ease: "easeInOut" } // Float
                        }}
                        className="pointer-events-auto bg-white rounded-full p-4 shadow-lg shadow-brand-dark/10 hover:shadow-xl hover:scale-110 transition-all duration-300 w-16 h-16 flex items-center justify-center border border-white/50"
                    >
                            <Rocket className="w-8 h-8 text-indigo-600" /> {/* Default rotation points top-right (towards logo) */}
                    </motion.div>

                    {/* 2. MIDDLE: Check (Success/Security) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, y: [6, -6, 6] }}
                        transition={{ 
                            delay: 0.7, 
                            duration: 0.5,
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.7 } 
                        }}
                        className="pointer-events-auto bg-white rounded-full p-4 shadow-lg shadow-brand-dark/10 hover:shadow-xl hover:scale-110 transition-all duration-300 w-16 h-16 flex items-center justify-center border border-white/50"
                    >
                            <CheckCircle className="w-8 h-8 text-green-500" />
                    </motion.div>

                    {/* 3. BOTTOM: Mail (Communication) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: -50 }}
                        animate={{ opacity: 1, scale: 1, x: -50, y: [-4, 4, -4] }}
                        transition={{ 
                            delay: 1.2, 
                            duration: 0.5,
                            y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 } 
                        }}
                        className="pointer-events-auto bg-white rounded-full p-4 shadow-lg shadow-brand-dark/10 hover:shadow-xl hover:scale-110 transition-all duration-300 w-16 h-16 flex items-center justify-center border border-white/50"
                    >
                        <Mail className="w-7 h-7 text-gray-600" />
                    </motion.div>
                </div>
            </motion.div>
          </div>
        </div>
      </div>

    </section>
  );
};

const PricingSection = () => {
  const [subscriptionType, setSubscriptionType] = useState("semester");
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const navigate = useNavigate();

  const basicPrices = {
    month: 89,
    semester: 194,
    year: 369
  };

  const basicFeatures = [
    "إدارة المعلمين والطلاب وإضافتهم بسهولة",
    "إدارة التوقيت الزمني لليوم الدراسي",
    "إنشاء جدول الحصص",
    "إنشاء جدول الانتظار",
    "إنشاء جدول الإشراف اليومي",
    "إنشاء جدول المناوبة اليومية",
    "الانتظار اليومي",
    "إدارة ومنح الصلاحيات",
    "التقارير والإحصائيات",
    "الطباعة والتصدير",
    "رسائل الواتساب"
  ];

  const proFeatures = [
    "جميع مزايا الباقة الأساسية مع خصائص متقدمة:",
    "متابعة أعمال المعلمين",
    "المجتمعات المهنية",
    "إدارة تأخر الطلاب",
    "إدارة غياب الطلاب",
    "إدارة استئذان الطلاب",
    "رصد السلوك",
    "تحويل طالب للموجه الطلابي",
    "تحويل طالب لوكيل الطلاب",
    "إدارة الاختبارات",
    "تحليل النتائج",
    "كشوف",
    "الخطط المدرسية",
    "الرسائل النصية"
  ];
  
  const basicFeaturesToShow = showAllFeatures ? basicFeatures : basicFeatures.slice(0, 5);
  const proFeaturesToShow = showAllFeatures ? proFeatures : proFeatures.slice(0, 5);

  return (
    <section id="prices" className="py-16 sm:py-20 bg-white relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">
            باقات الاشتراك
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            اختر الباقة التي تناسبك واستمتع بتجربة مجانية لمدة 10 أيام
          </p>
          <div className="mt-6 flex justify-center">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 font-bold text-sm shadow-sm border border-green-200 animate-bounce">
                 ⭐️ تجربة مجانية لمدة 10 أيام
              </span>
           </div>
        </motion.div>

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-12">
           <div className="bg-gray-100 p-1.5 rounded-xl inline-flex shadow-inner">
              {['month', 'semester', 'year'].map((type) => (
                 <button
                    key={type}
                    onClick={() => setSubscriptionType(type)}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                       subscriptionType === type
                       ? 'bg-white text-brand-main shadow-md'
                       : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    }`}
                 >
                    {type === 'month' && 'شهري'}
                    {type === 'semester' && 'فصل دراسي'}
                    {type === 'year' && 'سنة دراسية'}
                 </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
           {/* Basic Plan */}
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col"
           >
              <div className="h-2 w-full bg-brand-light"></div>
              <div className="p-8 flex-1 flex flex-col">
                 <h3 className="text-2xl font-bold text-gray-800 mb-2">الباقة الأساسية</h3>
                 <p className="text-gray-500 text-sm mb-6">كل ما تحتاجه للبدء في التنظيم</p>
                 
                 <div className="flex items-baseline mb-8">
                    <span className="text-4xl font-bold text-gray-900">
                       {subscriptionType === "month" && basicPrices.month}
                       {subscriptionType === "semester" && basicPrices.semester}
                       {subscriptionType === "year" && basicPrices.year}
                    </span>
                    <img src="/images/landing/rial.png" alt="ر.س" className="h-8 w-auto mr-2 inline-block object-contain mix-blend-multiply" />
                    <span className="text-gray-400 text-sm mr-2">
                       / {subscriptionType === "month" ? "شهرياً" : subscriptionType === "semester" ? "فصل دراسي" : "سنة دراسية"}
                    </span>
                 </div>

                 <Button className="w-full bg-brand-main hover:bg-brand-dark text-white py-6 rounded-xl text-lg mb-8 transition-colors duration-300" onClick={() => navigate('/register')}>
                    اشترك الآن
                 </Button>

                 <div className="space-y-4 flex-1">
                    {basicFeaturesToShow.map((feature, i) => (
                       <div key={i} className="flex items-start text-sm text-gray-600">
                          <CheckCircle className="w-5 h-5 text-brand-main ml-3 flex-shrink-0" />
                          <span>{feature}</span>
                       </div>
                    ))}
                 </div>
                 
                 {!showAllFeatures && (
                     <div className="mt-4 pt-4 text-center border-t border-gray-100">
                         <button 
                             onClick={() => setShowAllFeatures(true)}
                             className="text-brand-main hover:text-brand-dark text-sm font-bold flex items-center justify-center mx-auto transition-colors"
                         >
                             عرض جميع المزايا
                             <span className="mr-1 text-xs">▼</span>
                         </button>
                     </div>
                 )}

                 {showAllFeatures && (
                     <div className="mt-8 text-center bg-white pt-2 sticky bottom-0">
                         <button 
                             onClick={() => setShowAllFeatures(false)}
                             className="text-brand-main hover:text-brand-dark text-xs font-medium opacity-70 hover:opacity-100 flex items-center justify-center mx-auto"
                         >
                             إغلاق القائمة ▲
                         </button>
                     </div>
                 )}
              </div>
           </motion.div>

           {/* Pro Plan */}
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="bg-brand-dark text-white rounded-3xl shadow-2xl transform md:-translate-y-4 hover:-translate-y-6 transition-transform duration-300 relative overflow-hidden flex flex-col"
           >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full pointer-events-none"></div>
              <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="text-2xl font-bold text-white mb-2">الباقة الاحترافية</h3>
                        <p className="text-brand-light text-sm">مكان واحد يلبي احتياجك</p>
                     </div>
                     <span className="bg-brand-main px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border border-brand-light/20">الأكثر طلباً</span>
                  </div>
                 
                 <div className="flex items-baseline mb-8">
                    <span className="text-4xl font-bold text-white">
                       {subscriptionType === "month" && Math.round(basicPrices.month * 1.5)}
                       {subscriptionType === "semester" && Math.round(basicPrices.semester * 1.5)}
                       {subscriptionType === "year" && Math.round(basicPrices.year * 1.5)}
                    </span>
                    <img src="/images/landing/rial.png" alt="ر.س" className="h-8 w-auto mr-2 inline-block object-contain invert mix-blend-screen" />
                    <span className="text-brand-light/70 text-sm mr-2">
                       / {subscriptionType === "month" ? "شهرياً" : subscriptionType === "semester" ? "فصل دراسي" : "سنة دراسية"}
                    </span>
                 </div>

                 <Button 
                   className="w-full bg-white !text-brand-dark hover:!bg-brand-light hover:!text-white py-6 rounded-xl text-lg font-bold mb-8 shadow-lg transition-colors duration-300" 
                   onClick={() => navigate('/register')}
                 >
                    اختر الباقة الاحترافية
                 </Button>

                 <div className="space-y-4 flex-1">
                    {proFeaturesToShow.map((feature, i) => (
                       <div key={i} className="flex items-start text-sm text-brand-light">
                          <CheckCircle className="w-5 h-5 text-cyan-400 ml-3 flex-shrink-0" />
                          <span>{feature}</span>
                       </div>
                    ))}
                 </div>

                 {!showAllFeatures && (
                     <div className="mt-4 pt-4 text-center border-t border-white/10">
                         <button 
                             onClick={() => setShowAllFeatures(true)}
                             className="text-brand-light hover:text-white text-sm font-bold flex items-center justify-center mx-auto transition-colors"
                         >
                             عرض جميع المزايا
                             <span className="mr-1 text-xs">▼</span>
                         </button>
                     </div>
                 )}
                 
                 {showAllFeatures && (
                     <div className="mt-8 text-center">
                         <button 
                             onClick={() => setShowAllFeatures(false)}
                             className="text-brand-light hover:text-white text-xs font-medium opacity-70 hover:opacity-100"
                         >
                             إغلاق القائمة ▲
                         </button>
                     </div>
                 )}
              </div>
           </motion.div>
        </div>

        {/* New Payment & Trust Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 sm:mt-24 text-center"
        >
           {/* Trust Signals - New Clean Unified Bar */}
           <div className="max-w-4xl mx-auto mb-10">
              <div className="bg-white border border-[#e5e1fe] rounded-2xl sm:rounded-full px-6 py-6 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 shadow-lg shadow-[#655ac1]/5 hover:shadow-[#655ac1]/10 transition-all duration-300">
                  
                  {/* Item 1 */}
                  <div className="flex items-center gap-3 group px-4">
                      <div className="w-10 h-10 rounded-full bg-[#f4f2ff] group-hover:bg-[#655ac1] transition-colors duration-300 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-[#655ac1] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 group-hover:text-[#655ac1] transition-colors duration-300">دفع آمن ومشفر 100%</span>
                  </div>

                  {/* Separator */}
                  <div className="hidden sm:block w-px h-8 bg-gray-100"></div>

                  {/* Item 2 */}
                  <div className="flex items-center gap-3 group px-4">
                      <div className="w-10 h-10 rounded-full bg-[#f4f2ff] group-hover:bg-[#655ac1] transition-colors duration-300 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-[#655ac1] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 group-hover:text-[#655ac1] transition-colors duration-300">تفعيل فوري للخدمة</span>
                  </div>

                  {/* Separator */}
                  <div className="hidden sm:block w-px h-8 bg-gray-100"></div>

                  {/* Item 3 */}
                  <div className="flex items-center gap-3 group px-4">
                      <div className="w-10 h-10 rounded-full bg-[#f4f2ff] group-hover:bg-[#655ac1] transition-colors duration-300 flex items-center justify-center">
                          <FileCheck className="w-5 h-5 text-[#655ac1] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 group-hover:text-[#655ac1] transition-colors duration-300">فواتير رسمية معتمدة</span>
                  </div>
              </div>
           </div>

           {/* Payment Methods */}
           <div className="flex flex-col items-center">

           </div>
        </motion.div>
      </div>
    </section>
  );
};


const ChromeExtensionSection = () => {
  const chromeStoreUrl = "https://chrome.google.com/webstore/";

  return (
    <section 
      id="chrome-extension" 
      className="bg-brand-light/20 py-16 sm:py-20 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-white rounded-3xl p-8 sm:p-12 shadow-md hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 border border-brand-light ease-in-out relative overflow-hidden">
          
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" style={{
              backgroundImage: 'radial-gradient(#6b7280 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px'
          }}></div>

          <div className="flex-1 text-center md:text-right relative z-10">
            <div className="inline-flex items-center bg-brand-light text-brand-dark px-4 py-1.5 rounded-full mb-6 font-medium text-sm">
              <Chrome className="w-4 h-4 ml-2" />
              متوفر الآن
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark mb-4 leading-tight lg:whitespace-nowrap">
              أضف متابع الذكي لمتصفحك في قوقل كروم
            </h2>
            
            <p className="text-gray-600 mb-8 text-lg max-w-xl mx-auto md:mx-0">
               إضافة متوافقة مع نظام نور ومنصة مدرستي
               <span className="block mt-2">إضافة متابع الذكي توفر عليك الوقت وتسهل الوصول للخدمات بضغطة زر.</span>
            </p>
            
            <a 
               href={chromeStoreUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center justify-center bg-brand-dark text-white px-8 py-3.5 rounded-xl text-lg font-medium hover:bg-brand-main transition-colors duration-300 shadow-lg hover:shadow-brand-dark/30"
            >
               <Chrome className="ml-2 w-5 h-5" />
               تحميل الإضافة
            </a>
          </div>

          <div className="w-full md:w-1/3 flex justify-center relative z-10">
             <div className="relative">
                <div className="absolute inset-0 bg-brand-main blur-3xl opacity-20 rounded-full animate-pulse"></div>
                <div className="bg-gradient-to-br from-brand-main to-brand-dark p-6 rounded-3xl shadow-2xl relative rotate-3 transform hover:rotate-0 transition-transform duration-500 group">
                   <Chrome className="w-24 h-24 text-white" strokeWidth={1} />
                   
                   {/* Motabea Brand Icon Overlay */}
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm z-10 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-[#655ac1] font-black text-xl font-english pt-1">M</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};


