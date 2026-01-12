import React from "react";
import { ShieldCheck, Zap, FileText } from "lucide-react";
import { motion } from "framer-motion";

const PaymentSection = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: "دفع آمن ومشفر 100%",
      description: "نستخدم أحدث تقنيات التشفير SSL لحماية بياناتك المالية بشكل كامل.",
      gradient: "from-green-500 to-emerald-600",
      iconBg: "bg-gradient-to-br from-green-50 to-emerald-50",
      iconColor: "text-green-600",
      shadowColor: "shadow-green-500/30",
      glowColor: "group-hover:shadow-green-500/50"
    },
    {
      icon: Zap,
      title: "تفعيل فوري للخدمة",
      description: "ابدأ استخدام النظام مباشرة خلال ثوانٍ بعد إتمام عملية الدفع.",
      gradient: "from-yellow-500 to-amber-600",
      iconBg: "bg-gradient-to-br from-yellow-50 to-amber-50",
      iconColor: "text-yellow-600",
      shadowColor: "shadow-yellow-500/30",
      glowColor: "group-hover:shadow-yellow-500/50"
    },
    {
      icon: FileText,
      title: "فواتير رسمية معتمدة",
      description: "احصل على فواتير ضريبية رسمية معتمدة لجميع معاملاتك.",
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      iconColor: "text-blue-600",
      shadowColor: "shadow-blue-500/30",
      glowColor: "group-hover:shadow-blue-500/50"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Right Column: Text Content */}
          <div className="w-full lg:w-1/2 text-right">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#655ac1] via-[#8779fb] to-[#655ac1] bg-clip-text text-transparent mb-6 leading-tight"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                طرق دفع آمنة ومتعددة
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600 mb-12 leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                وفرنا لك خيارات دفع مرنة مع تفعيل فوري للاشتراك.
              </motion.p>

              <div className="space-y-5">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.02, x: -5 }}
                      className={`group relative flex items-start gap-5 p-5 rounded-2xl bg-white border border-gray-100 shadow-lg ${feature.shadowColor} hover:shadow-2xl ${feature.glowColor} transition-all duration-300 cursor-pointer`}
                    >
                      {/* Gradient border effect */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      
                      {/* Icon container with glow effect */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center shrink-0 ${feature.iconColor} shadow-lg group-hover:shadow-xl transition-all duration-300 relative`}>
                          <Icon className="w-8 h-8 relative z-10" strokeWidth={2.5} />
                          {/* Glow effect */}
                          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300`}></div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className={`text-xl font-bold text-gray-900 mb-2 group-hover:bg-gradient-to-r ${feature.gradient} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-base leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      {/* Decorative corner element */}
                      <div className={`absolute top-0 left-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity duration-300`}></div>
                    </motion.div>
                  );
                })}
              </div>

            </motion.div>
          </div>

          {/* Left Column: Visual (Floating Placeholder) */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative w-full max-w-md aspect-square"
            >
              {/* Floating Animation Container */}
              <motion.div 
                className="w-full h-full relative z-10"
                animate={{ 
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                 <img 
                    src="/images/payment/payment-methods.png" 
                    alt="Payment Methods" 
                    className="w-full h-full object-contain drop-shadow-2xl rounded-2xl transform hover:scale-105 transition-transform duration-500"
                 />
              </motion.div>
              
              {/* Enhanced Background Decor with multiple layers */}
              <div className="absolute top-10 left-10 w-full h-full bg-gradient-to-br from-[#8779fb] to-[#655ac1] rounded-3xl -z-10 transform -rotate-6 opacity-20 blur-sm"></div>
              <div className="absolute top-5 left-5 w-full h-full bg-gradient-to-tr from-[#655ac1] to-[#4f46e5] rounded-3xl -z-20 transform rotate-3 opacity-10 blur-md"></div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PaymentSection;
