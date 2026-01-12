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

            {/* Layered Layout - Corrected for RTL (Screen Right, Cards Left) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-0 gap-x-6 items-start relative mt-16 mb-24 px-4 max-w-7xl mx-auto">
                
                {/* 1. LAYER 3 (FRONT): Computer Screen (Right Side in RTL - Cols 1-7) */}
                <div className="relative z-30 w-full lg:col-start-1 lg:col-span-7 lg:row-start-1 lg:row-span-2 pt-12 lg:pt-0">
                     <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative w-full"
                    >
                         {/* Glow */}
                        <div className="absolute inset-0 bg-[#655ac1] opacity-20 blur-[60px] rounded-[3rem] transform translate-y-4 scale-90"></div>
                        
                        {/* Screen Frame */}
                        <div className="relative z-10 max-w-full">
                             <div className="bg-white rounded-[2rem] p-2 shadow-2xl ring-1 ring-gray-200 border-4 border-gray-100 relative overflow-hidden">
                                {/* Dot */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-100 rounded-b-xl z-30 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                </div>
                                {/* Image */}
                                <div className="bg-gray-50 rounded-[1.5rem] overflow-hidden aspect-[16/10] relative shadow-inner group border border-gray-100">
                                    <img 
                                        src="/images/landing/dashbord20.png" 
                                        alt="لوحة تحكم متابع" 
                                        className="w-full h-full object-contain bg-[#f3f4f6]"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 2. LAYER 1 (BACK): Smart Management Card (Top Left - Cols 8-12) */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[2.5rem] p-8 pb-32 shadow-lg border border-gray-100 relative z-10 lg:col-start-8 lg:col-span-5 lg:row-start-1 lg:-ml-12"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gray-100 to-[#e5e1fe]"></div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
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

                {/* 3. LAYER 2 (MIDDLE): Smart Scheduling Card (Bottom Left - Wide) */}
                <motion.div
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.8, delay: 0.2 }}
                     viewport={{ once: true }}
                     // Adjusted Positioning: Span cols 4-12 (Left side), Negative Margin Top to tuck under white card
                     className="bg-[#655ac1] text-white rounded-[2.5rem] p-8 shadow-2xl relative z-20 lg:col-start-4 lg:col-span-9 lg:row-start-2 -mt-24 lg:mr-[-10%] min-h-[300px] flex flex-col justify-center"
                >
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#4f46e5]/30 rounded-full blur-2xl pointer-events-none"></div>

                    {/* Content Container */}
                    <div className="relative z-10 w-full mt-6">
                        {/* Title Aligned to Left (Safe from Screen) */}
                        <div className="flex justify-end mb-8 pl-4 lg:pl-12">
                             <h3 className="text-2xl font-bold text-white flex items-center gap-3 flex-row-reverse">
                                <span className="w-1.5 h-8 bg-white rounded-full"></span>
                                منظومة الجداول الذكية
                            </h3>
                        </div>
                        
                        {/* Features Grid - Spanning Full Width (Under Screen) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                             <div className="space-y-3">
                                <h4 className="text-white font-bold text-lg border-b border-white/10 pb-2 inline-block">جدول الحصص</h4>
                                <ul className="space-y-2">
                                    <li className="text-indigo-100 text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                        بناء آلي بضغطة زر
                                    </li>
                                     <li className="text-indigo-100 text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                        تحسين التعارضات
                                    </li>
                                    <li className="text-indigo-100 text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                        تعديل يدوي مرن
                                    </li>
                                </ul>
                            </div>

                             <div className="space-y-3">
                                <h4 className="text-white font-bold text-lg border-b border-white/10 pb-2 inline-block">جدول الانتظار</h4>
                                <ul className="space-y-2">
                                    <li className="text-indigo-100 text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                        توزيع عادل ومتوازن
                                    </li>
                                    <li className="text-indigo-100 text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                        توزيع آلي أو يدوي
                                    </li>
                                     <li className="text-indigo-100 text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                        تنبيهات فورية للمنتظر
                                    </li>
                                </ul>
                            </div>

                             <div className="space-y-3">
                                <h4 className="text-white font-bold text-lg border-b border-white/10 pb-2 inline-block">الإشراف والمناوبة</h4>
                                <ul className="space-y-2">
                                    <li className="text-indigo-100 text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                        توزيع ذكي
                                    </li>
                                    <li className="text-indigo-100 text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                        مرونة في التعديل
                                    </li>
                                     <li className="text-indigo-100 text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                        تنبيهات فورية
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
