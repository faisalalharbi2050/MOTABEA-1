import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isPausedRef = useRef(false);
  
  const testimonials = [
    {
      id: 1,
      name: "أ. محمد العتيبي",
      role: "مدير مدرسة",
      content: "نظام متابع غيّر طريقة إدارتنا للمدرسة بالكامل. التقارير الدقيقة وتوفير الوقت هو ما كنا نحتاجه حقاً."
    },
    {
      id: 2,
      name: "أ. سارة الغامدي",
      role: "وكيلة شؤون طلاب",
      content: "سهولة الاستخدام والتكامل مع منصة مدرستي ونظام نور مذهلة. الدعم الفني متجاوب جداً."
    },
    {
      id: 3,
      name: "أ. عبدالعزيز المطيري",
      role: "مستخدم",
      content: "تجربة مميزة جداً، النظام يغطي كافة احتياجاتنا اليومية في المدرسة بشكل احترافي."
    },
    {
      id: 4,
      name: "أ. نورة القحطاني",
      role: "مديرة مدرسة",
      content: "استطعنا تنظيم عملية الحضور والانصراف والمناوبة بشكل لم يسبق له مثيل. شكراً لكم."
    },
    {
      id: 5,
      name: "أ. خالد الحربي",
      role: "وكيل مدرسة",
      content: "النظام وفر علينا جهد كبير في متابعة التأخر والغياب، أنصح الجميع باستخدامه."
    }
  ];

  // Double the list for seamless infinite scroll
  const extendedTestimonials = [...testimonials, ...testimonials];

  // Conveyor Belt Animation
  useEffect(() => {
    let animationFrameId: number;

    const animateScroll = () => {
      const scrollContainer = scrollRef.current;
      
      if (scrollContainer && !isPausedRef.current) {
        // Speed: 1px per frame (scrolling LEFT for RTL)
        // In most RTL browsers, scrolling left means decreasing scrollLeft (becoming more negative)
        scrollContainer.scrollLeft -= 1; 

        const singleSetWidth = scrollContainer.scrollWidth / 2;
        
        // Loop back seamlessly
        // Check absolute value because RTL scrollLeft is usually negative
        if (Math.abs(scrollContainer.scrollLeft) >= singleSetWidth) {
           scrollContainer.scrollLeft = 0;
        }

        // Update active index for dots
        const itemWidth = scrollContainer.children[0]?.clientWidth || 0;
        if (itemWidth > 0) {
           // Use Math.abs for the index calculation
           // Adding a small offset (10) ensures we catch the transition nicely
           const currentScroll = Math.abs(scrollContainer.scrollLeft);
           const currentIndex = Math.round((currentScroll % singleSetWidth) / (itemWidth + 24)); 
           
           setActiveIndex((prev) => {
             // Safe modulo
             const newIndex = currentIndex % testimonials.length;
             return prev !== newIndex ? newIndex : prev;
           });
        }
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [testimonials.length]);

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
        const itemWidth = scrollRef.current.children[0]?.clientWidth || 0;
        const gap = 24; // sm:gap-6 is 24px
        // Simply scroll to that item in the first set
        const targetScroll = index * (itemWidth + gap);
        scrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
        setActiveIndex(index);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-brand-light/20 overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
          >
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">
              آراء عملاؤنا
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              نسعد ونفخر بثقة عملائنا وآرائهم التي تدفعنا للتطوير المستمر
              </p>
          </motion.div>
        </div>

        {/* Frame Container */}
        <div 
          className="relative max-w-6xl mx-auto"
          onPointerEnter={() => { isPausedRef.current = true; }}
          onPointerLeave={() => { isPausedRef.current = false; }}
          onPointerDown={() => { isPausedRef.current = true; }}
          onPointerUp={() => { isPausedRef.current = false; }}
        >
             {/* The Unified Frame */}
             <div className="relative border border-[#e5e1fe] bg-white/50 backdrop-blur-sm shadow-sm rounded-3xl p-6 sm:p-10">
                
                {/* Gradient Overlay Left */}
                <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none rounded-l-3xl"></div>
                
                {/* Gradient Overlay Right */}
                <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none rounded-r-3xl"></div>

                {/* Scrollable Content - Continuous Scroll (No Snap) */}
                <div 
                  ref={scrollRef} 
                  className="flex overflow-x-hidden gap-6 pb-4 hide-scrollbar -mx-4 px-4 sm:px-0"
                  style={{  scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {extendedTestimonials.map((testimonial, index) => (
                      <div 
                        key={`${testimonial.id}-${index}`} 
                        className="w-[240px] sm:w-[260px] lg:w-[280px] flex-shrink-0"
                      >
                         {/* Card Design - Medium Square */}
                         <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#655ac1]/20 transition-all duration-300 aspect-square flex flex-col justify-between h-auto cursor-pointer">
                             
                             <div className="flex-1 flex flex-col justify-center relative">
                                <div className="absolute top-0 left-0 bg-[#f4f2ff] p-2 rounded-full">
                                   <Quote className="w-3 h-3 text-[#655ac1]" />
                                </div>
                                
                                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed text-center px-1 mt-6 line-clamp-4">
                                  "{testimonial.content}"
                                </p>
                             </div>
                             
                             <div className="flex items-center justify-center gap-3 mt-4 border-t border-gray-50 pt-3">
                                  <div className="w-9 h-9 rounded-full bg-[#f4f2ff] flex items-center justify-center text-[#655ac1] font-bold text-sm border border-[#e5e1fe] flex-shrink-0">
                                    {testimonial.name.charAt(0)}
                                  </div>
                                  <div className="text-right min-w-0">
                                    <h4 className="font-bold text-gray-900 text-xs truncate max-w-[120px]">{testimonial.name}</h4>
                                    <p className="text-[#655ac1] text-[10px] font-medium truncate max-w-[120px]">{testimonial.role}</p>
                                  </div>
                             </div>

                         </div>
                      </div>
                    ))}
                </div>
             </div>

             {/* Pagination Dots */}
             <div className="flex justify-center items-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                   <button
                     key={index}
                     onClick={() => scrollTo(index)}
                     className={`transition-all duration-300 rounded-full ${
                        activeIndex === index 
                          ? 'w-8 h-2.5 bg-[#655ac1]' 
                          : 'w-2.5 h-2.5 bg-gray-200 hover:bg-[#8779fb]/50'
                     }`}
                     aria-label={`Go to slide ${index + 1}`}
                   />
                ))}
             </div>
        </div>

      </div>
    </section>
  );
}
