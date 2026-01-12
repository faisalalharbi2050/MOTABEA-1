import React, { useRef } from "react";
import { 
  Database,
  Users,
  Cloud,
  MessageCircle,
  Mail,
  BarChart3,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Settings,
  MousePointerClick,
  MonitorSmartphone,
  CheckCheck
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

interface FeaturesProps {
  showAll?: boolean;
}

const Features: React.FC<FeaturesProps> = ({ showAll = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const smartManagementFeatures = [
    {
      icon: Database,
      title: "استيراد ذكي وسهل لبيانات المعلمين والطلاب من نظام نور"
    },
    {
      icon: Users,
      title: "توزيع المهام وتفويضها للوكلاء والإداريين"
    },
    {
      icon: Cloud,
      title: "نظام سحابي يعمل على كافة أجهزتك (جوال وكمبيوتر)"
    },
    {
      icon: MessageCircle,
      title: "تواصل فوري عبر الواتساب والرسائل بقوالب جاهزة"
    },
    {
      icon: BarChart3,
      title: "تقارير متوافقة مع الواقع المدرسي"
    }
  ];

  const scheduleFeatures = [
    {
      title: "جدول الحصص",
      icon: Calendar,
      features: [
        "بناء آلي ذكي: إنشاء الجدول بضغطة زر بناءً على الإسناد.",
        "تعديل يدوي مرن: إمكانية السحب والإفلات للتعديل بعد الإنشاء.",
        "خالٍ من التعارضات: ضبط تلقائي يمنع تضارب الحصص."
      ]
    },
    {
      title: "جدول الانتظار",
      icon: Clock,
      features: [
        "توزيع عادل وآلي: يراعي نصاب المعلم وعدالة التوزيع.",
        "تحكم كامل: خيار للتوزيع اليدوي أو تحديد عدد المنتظرين.",
        "تنبيهات فورية: إشعار المنتظر بحصة الانتظار مباشرة"
      ]
    },
    {
      title: "جدول الإشراف والمناوبة",
      icon: UserCheck,
      features: [
        "توزيع ذكي ومتكامل: مبنية على جدول الحصص",
        "التعديلات: مرونة وسهولة التعديل اليدوي"
      ]
    }
  ];

  return (
    <section id="features" ref={containerRef} className="py-20 lg:py-24 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Section Header */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#655ac1] mb-6">
                    مزايا متابع
                </h2>
                <div className="h-1.5 w-24 bg-[#655ac1] mx-auto rounded-full opacity-20"></div>
            </motion.div>

            {/* Layered Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-y-0 items-start relative mt-12 mb-20">
                
                {/* 1. Hero Image - Right Side (Foreground) */}
                <div className="relative w-full z-20 order-1 lg:order-none lg:col-start-1 lg:col-span-7 lg:row-start-1 lg:row-span-2">
                    <motion.div
                        initial={{ opacity: 0, x: 50, y: 20 }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative w-full perspective-1000 max-h-[600px] lg:max-h-[700px]"
                    >
                        {/* Soft Purple Shadow */}
                        <div className="absolute inset-0 bg-[#655ac1] opacity-30 blur-[80px] rounded-[3rem] transform translate-y-10"></div>
                        
                        {/* 3D Transform Container */}
                        <div className="relative z-10 transform transition-transform duration-500 hover:rotate-y-2 hover:rotate-x-2 transform-style-3d pl-0 lg:pl-12">
                             <div className="bg-[#121212] rounded-3xl p-[6px] shadow-2xl ring-1 ring-white/10 relative z-20 max-w-full">
                                <div className="bg-black rounded-2xl overflow-hidden aspect-video relative shadow-inner group border border-gray-800">
                                    <img 
                                        src="/images/landing/dashbord20.png" 
                                        alt="لوحة تحكم متابع" 
                                        className="w-full h-full object-contain bg-[#f3f4f6]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-20 pointer-events-none"></div>
                                </div>
                            </div>

                            {/* Floating WhatsApp Notification Widget */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
                                viewport={{ once: true }}
                                className="absolute right-[10%] left-auto w-fit -top-12 z-30 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-3 pl-4 pr-3 flex flex-row-reverse items-center gap-3 max-w-sm hover:scale-105 transition-transform duration-300 cursor-default"
                                style={{ transform: 'translateZ(40px)' }}
                            >
                                {/* Mail Icon - Absolute Top Right */}
                                <div className="absolute top-2 right-2.5">
                                    <Mail className="w-3.5 h-3.5 text-[#655ac1]" />
                                </div>

                                {/* WhatsApp Icon */}
                                <div className="w-9 h-9 mt-2 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden group">
                                     <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                     <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                     </svg>
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-right pt-2">
                                    <div className="flex items-center justify-end gap-1.5">
                                         {/* Double Check */}
                                        <div className="flex items-center">
                                           <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />
                                        </div>
                                        <p className="text-[11px] sm:text-xs font-bold text-gray-800 whitespace-nowrap">
                                            المعلم / نشعركم بالحصة المسندة لكم انتظاراً
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* 2. Top Card: Smart Management - Left Side */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 relative z-10 order-2 lg:order-none lg:col-start-8 lg:col-span-5 lg:mb-[-40px]"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-100 to-[#e5e1fe]"></div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-[#655ac1] rounded-full"></span>
                        الإدارة الذكية
                    </h3>
                    
                    <ul className="space-y-4">
                        {[
                            { icon: Database, text: "استيراد ذكي وسهل لبيانات المعلمين والطلاب من نظام نور" },
                            { icon: Users, text: "توزيع المهام وتفويضها للوكلاء والإداريين" },
                            { icon: Cloud, text: "نظام سحابي يعمل على كافة أجهزتك (جوال وكمبيوتر)" },
                            { icon: MessageCircle, text: "تواصل فوري عبر الواتساب والرسائل بقوالب جاهزة" },
                            { icon: BarChart3, text: "تقارير متوافقة مع الواقع المدرسي" }
                        ].map((item, index) => (
                            <li key={index} className="flex items-start gap-3 text-gray-600 group">
                                <div className="w-6 h-6 rounded-full bg-[#f4f2ff] flex items-center justify-center text-[#655ac1] mt-0.5 group-hover:bg-[#655ac1] group-hover:text-white transition-colors duration-200 flex-shrink-0">
                                    <item.icon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-sm font-medium leading-relaxed group-hover:text-gray-900 transition-colors">
                                    {item.text}
                                </span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* 3. Bottom Card: Smart Scheduling - Left Side + Overlap */}
                <motion.div
                     initial={{ opacity: 0, x: -30, y: 30 }}
                     whileInView={{ opacity: 1, x: 0, y: 0 }}
                     transition={{ duration: 0.8, delay: 0.2 }}
                     viewport={{ once: true }}
                     className="bg-[#655ac1] text-white rounded-[2.5rem] p-8 lg:pr-12 lg:pt-20 shadow-2xl relative z-0 order-3 lg:order-none lg:col-start-5 lg:col-span-8 lg:row-start-2 overflow-hidden"
                >
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#4f46e5]/30 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 lg:w-fit lg:mr-[33%]">
                            <span className="w-1.5 h-8 bg-[#8779fb] rounded-full"></span>
                            منظومة الجداول الذكية
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Sub-item 1 */}
                            <div className="space-y-3">
                                <h4 className="text-white font-bold text-lg border-b border-white/10 pb-2 inline-block">جدول الحصص</h4>
                                <ul className="space-y-2">
                                    <li className="text-indigo-100 text-xs flex items-center gap-2">
                                        <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                                        بناء آلي بضغطة زر
                                    </li>
                                    <li className="text-indigo-100 text-xs flex items-center gap-2">
                                        <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                                       تعديل يدوي مرن
                                    </li>
                                    <li className="text-indigo-100 text-xs flex items-center gap-2">
                                        <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                                        خالٍ من التعارضات
                                    </li>
                                </ul>
                            </div>

                            {/* Sub-item 2 */}
                             <div className="space-y-3">
                                <h4 className="text-white font-bold text-lg border-b border-white/10 pb-2 inline-block">جدول الانتظار</h4>
                                <ul className="space-y-2">
                                    <li className="text-indigo-100 text-xs flex items-center gap-2">
                                        <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                                        توزيع عادل وآلي
                                    </li>
                                    <li className="text-indigo-100 text-xs flex items-center gap-2">
                                        <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                                        تنبيهات فورية للمعلم
                                    </li>
                                </ul>
                            </div>

                            {/* Sub-item 3 */}
                             <div className="space-y-3">
                                <h4 className="text-white font-bold text-lg border-b border-white/10 pb-2 inline-block">الإشراف والمناوبة</h4>
                                <ul className="space-y-2">
                                    <li className="text-indigo-100 text-xs flex items-center gap-2">
                                        <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                                        توزيع ذكي مبني على الجدول
                                    </li>
                                    <li className="text-indigo-100 text-xs flex items-center gap-2">
                                        <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                                        مرونة في التعديل
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    </section>
  );
};

export default Features;
