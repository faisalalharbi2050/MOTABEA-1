
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Settings, CalendarCheck, FileText, CheckCircle2, Users, Eye, Clock, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';

const TutorialsSection = () => {
  const [activeTab, setActiveTab] = useState('settings');

  const tabs = [
    {
      id: 'settings',
      label: 'الإعدادات العامة',
      icon: Settings,
      title: 'تهيئة النظام المتكاملة',
      description: 'الخطوة الأولى لإدارة مدرسية ناجحة تبدأ من هنا. تحكم في إعدادات المدرسة وصلاحيات الموظفين بدقة.',
      points: [
        'إدارة الإعدادات الأولية للمدرسة',
        'إدارة وتوزيع صلاحيات المستخدمين'
      ],
      videoPlaceholder: 'bg-gradient-to-br from-indigo-100 to-purple-100'
    },
    {
      id: 'schedule',
      label: 'الجدول المدرسي',
      icon: CalendarCheck,
      title: 'جدول مدرسي مرن ودقيق',
      description: 'أنشئ وعدّل الجداول المدرسية بما يتناسب مع احتياجات مدرستك ومعلميك.',
      points: [
        'إدارة الجداول المدرسية للكادر التعليمي',
      ],
      videoPlaceholder: 'bg-gradient-to-br from-blue-100 to-cyan-100'
    },
    {
      id: 'supervision',
      label: 'الإشراف والمناوبة',
      icon: Eye,
      title: 'ضبط منظومة الإشراف',
      description: 'نظم عمليات الإشراف اليومي والمناوبة بسهولة لضمان سير اليوم الدراسي بانتظام.',
      points: [
        'إنشاء جداول الإشراف اليومي',
        'إدارة سجلات المناوبة اليومية'
      ],
      videoPlaceholder: 'bg-gradient-to-br from-emerald-100 to-teal-100'
    },
    {
      id: 'waiting',
      label: 'الانتظار اليومي',
      icon: Clock,
      title: 'إدارة حصص الانتظار',
      description: 'لا مزيد من الفوضى في حصص الانتظار. وزع الحصص الاحتياطية بعدالة وشفافية.',
      points: [
        'إدارة وتوزيع حصص الانتظار اليومية',
      ],
      videoPlaceholder: 'bg-gradient-to-br from-orange-100 to-amber-100'
    },
    {
      id: 'messages',
      label: 'الرسائل',
      icon: MessageSquare,
      title: 'تواصل فعال ومباشر',
      description: 'منصة تواصل موحدة تضمن وصول رسائلك وتنبيهاتك للجميع في الوقت المناسب.',
      points: [
        'إدارة الرسائل والتنبيهات',
      ],
      videoPlaceholder: 'bg-gradient-to-br from-pink-100 to-rose-100'
    }
  ];

  const activeContent = tabs.find(t => t.id === activeTab);

  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden" id="tutorials">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">
            شروحات النظام
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            اكتشف كيف يمكن لمتابع أن يغير طريقة إدارتك للمدرسة من خلال هذه الشروحات المرئية المبسطة
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border
                  ${isActive 
                    ? 'bg-brand-main text-white border-brand-main shadow-lg shadow-brand-main/25 scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-main/50 hover:text-brand-main hover:bg-brand-light/10'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row">
                
                {/* Video/Image Side */}
                <div className="lg:w-3/5 relative min-h-[300px] lg:min-h-[450px] bg-gray-100 flex items-center justify-center group cursor-pointer overflow-hidden">
                   {/* Placeholder Background */}
                   <div className={`absolute inset-0 ${activeContent?.videoPlaceholder} opacity-50`}></div>
                   
                   {/* Play Button */}
                   <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-brand-main ml-1" fill="currentColor" />
                   </div>
                   
                   <div className="absolute bottom-6 right-6 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-white text-sm font-medium">
                      02:45 دقيقة
                   </div>
                </div>

                {/* Text Content Side */}
                <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center bg-white">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-light/30 text-brand-dark text-xs font-bold w-fit mb-6">
                    <activeContent.icon className="w-3 h-3" />
                    {activeContent?.label}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {activeContent?.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {activeContent?.description}
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    {activeContent?.points.map((point, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-brand-main ml-3 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full bg-brand-dark hover:bg-brand-main text-white h-12 rounded-xl font-bold shadow-lg shadow-brand-dark/10">
                    شاهد الشرح الكامل
                  </Button>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default TutorialsSection;
