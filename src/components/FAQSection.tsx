import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQSection = () => {
  const aqs = [
    {
      question: "من نحن؟",
      answer: "نحن فريق تقني متخصص في بناء الحلول الرقمية التعليمية، نسعى لتسهيل العمليات الإدارية والتعليمية في المدارس من خلال منصة متابع الذكية."
    },
    {
      question: "كيف يمكنني الاشتراك في الخدمة؟",
      answer: "يمكنك الاشتراك بسهولة عن طريق اختيار الباقة المناسبة من قسم الأسعار، ثم تعبئة نموذج التسجيل وإتمام عملية الدفع."
    },
    {
      question: "هل يتطلب النظام تثبيت برامج خاصة؟",
      answer: "لا، نظام متابع يعمل سحابياً بالكامل، كل ما تحتاجه هو متصفح إنترنت واتصال بالشبكة."
    },
    {
      question: "هل يمكن تجربة النظام قبل الاشتراك؟",
      answer: "نعم، نوفر فترة تجربة مجانية لمدة 10 أيام لتكتشف جميع مزايا النظام بنفسك."
    },
    {
      question: "هل البيانات آمنة؟",
      answer: "نعم، نستخدم أحدث تقنيات التشفير والحماية لضمان أمان وخصوصية بيانات مدرستك وطلابك."
    }
  ];

  return (
    <section id="faq" className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">
            الأسئلة الشائعة
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            إجابات على أكثر الأسئلة تكراراً حول نظام متابع
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {aqs.map((faq, index) => (
             <AccordionItem key={index} question={faq.question} answer={faq.answer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const AccordionItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="border border-gray-100 rounded-xl bg-gray-50 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-right hover:bg-white transition-colors duration-200"
      >
        <span className={`font-bold text-lg ${isOpen ? 'text-brand-main' : 'text-gray-800'}`}>
          {question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-brand-main transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5 text-gray-600 leading-relaxed text-right border-t border-gray-100/50 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQSection;
