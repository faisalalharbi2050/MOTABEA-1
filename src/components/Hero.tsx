import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = ["/imag/1.png", "/imag/2.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000); // تبديل الصورة كل 4 ثوانٍ

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-16 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* المحتوى النصي */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-right"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-extrabold mb-8 leading-tight"
            >
              <span className="bg-clip-text text-blue-700 [background:-webkit-linear-gradient(right,#1d4ed8,#4f46e5,#1d4ed8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;] drop-shadow-lg text-3xl sm:text-4xl lg:text-5xl xl:text-6xl">
                متابع..{" "}
                <span className="block mt-2 text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
                  ليوم مدرسي مُنظّم
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              نظام ذكي يُبسّط المهام متوافق مع الواقع المدرسي
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/register">
                <Button 
                  size="lg"
                  variant="default"
                  className="bg-white text-[#655ac1] border border-transparent hover:bg-[#655ac1] hover:text-white hover:border-[#655ac1] hover:-translate-y-1 hover:shadow-xl shadow-lg transition-all duration-300 group px-8 py-6 text-lg rounded-xl"
                >
                  <ArrowLeft className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:scale-125 group-hover:-translate-x-2" />
                  ابدأ الآن مجاناً
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
              >
                <Play className="ml-2 h-5 w-5 text-blue-600" />
                شاهد العرض التوضيحي
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="inline-flex items-center bg-blue-50 border border-blue-200 px-4 py-2 rounded-full mt-6 text-sm text-blue-700"
            >
              <span className="ml-2">🎉</span>
              <span>تجربة مجانية لمدة 10 أيام</span>
            </motion.div>
          </motion.div>

          {/* الصورة التوضيحية */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 relative"
          >
            <div className="relative z-10">
              {/* إطار شاشة الكمبيوتر */}
              <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-3">
                {/* الشاشة */}
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-2 shadow-inner">
                  {/* نقاط التحكم في الأعلى */}
                  <div className="flex items-center justify-between mb-2 px-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-gray-400 text-xs">متابع</div>
                  </div>
                  
                  {/* منطقة عرض الصور */}
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                    <div className="relative w-full h-[240px] sm:h-[300px] lg:h-[360px]">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentImage}
                          src={images[currentImage]}
                          alt={`لقطة شاشة ${currentImage + 1}`}
                          className="absolute inset-0 w-full h-full object-contain"
                          initial={{ opacity: 0, scale: 0.95, rotateY: 90 }}
                          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                          exit={{ opacity: 0, scale: 0.95, rotateY: -90 }}
                          transition={{ 
                            duration: 0.8,
                            ease: "easeInOut"
                          }}
                        />
                      </AnimatePresence>
                      
                      {/* مؤشرات الصور */}
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImage(index)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                              index === currentImage 
                                ? 'bg-blue-600 w-7' 
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`الانتقال للصورة ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* قاعدة الشاشة */}
                <div className="flex justify-center mt-3">
                  <div className="w-32 h-2 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-lg"></div>
                </div>
                <div className="flex justify-center">
                  <div className="w-48 h-3 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-xl shadow-lg"></div>
                </div>
              </div>
            </div>

            {/* عناصر زخرفية */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-200 rounded-full opacity-20 blur-xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
