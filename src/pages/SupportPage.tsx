import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Send,
  FileText,
  User,
  AtSign,
  MessageCircle,
  ArrowRight
} from "lucide-react";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: ""
  });

  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // التوجيه لأعلى الصفحة عند التحميل يتم الآن عبر مكون ScrollToTop

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // محاكاة إرسال التذكرة
    setTimeout(() => {
      setSubmitStatus("success");
      setIsSubmitting(false);
      // إعادة تعيين النموذج
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: ""
      });
      
      // إخفاء رسالة النجاح بعد 5 ثوانٍ
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    }, 1500);
  };

  const supportCategories = [
    { value: "technical", label: "مشكلة تقنية" },
    { value: "account", label: "مشكلة في الحساب" },
    { value: "billing", label: "الفواتير والاشتراكات" },
    { value: "other", label: "أخرى" }
  ];

  // رقم الواتساب - سيتم تحديثه لاحقاً
  const whatsappNumber = "966505015005"; // استبدل بالرقم الفعلي للدعم الفني

  const openWhatsApp = () => {
    const message = encodeURIComponent("مرحباً، أحتاج للمساعدة في نظام متابع");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <MainHeader />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-brand-dark to-brand-main text-white py-16 sm:py-20 relative overflow-hidden">

          <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                الدعم الفني
              </h1>
              <p className="text-base sm:text-lg text-brand-light/90">
                نحن هنا لمساعدتك! تواصل معنا عبر الواتساب أو البريد الالكتروني أو أرسل تذكرة دعم فني
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick Contact Options */}
        <section className="py-12 -mt-16 relative z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* واتساب */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-2 border-[#25D366]/20 hover:border-[#25D366] transition-all hover:shadow-xl cursor-pointer h-full group" onClick={openWhatsApp}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">واتساب</h3>
                    <p className="text-gray-600 mb-4">تواصل معنا مباشرة عبر الواتساب</p>
                    <Button className="w-full bg-[#25D366] hover:bg-[#128C7E]">
                      فتح المحادثة
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* البريد الإلكتروني */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-2 border-brand-light hover:border-brand-main transition-all hover:shadow-xl h-full group">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-brand-light/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Mail className="w-8 h-8 text-brand-main" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">البريد الإلكتروني</h3>
                    <p className="text-gray-600 mb-4">راسلنا على البريد الإلكتروني</p>
                    <a href="mailto:support@motabea.com">
                      <Button variant="outline" className="w-full border-brand-main text-brand-main hover:bg-brand-light/10">
                        إرسال رسالة
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Support Ticket Form */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  إنشاء تذكرة دعم فني
                </h2>
                <p className="text-lg text-gray-600">
                  املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن
                </p>
              </motion.div>

              {/* Success Message */}
              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
                >
                  <CheckCircle className="w-6 h-6 text-green-600 ml-3" />
                  <div>
                    <h4 className="font-semibold text-green-900">تم إرسال التذكرة بنجاح!</h4>
                    <p className="text-sm text-green-700">سنتواصل معك قريباً عبر البريد الإلكتروني أو الهاتف</p>
                  </div>
                </motion.div>
              )}

              <Card className="shadow-lg border-t-4 border-t-brand-main">
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* الاسم */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline-block ml-1 text-brand-main" />
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main focus:border-transparent transition-all"
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>

                    {/* رقم الجوال */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline-block ml-1 text-brand-main" />
                        رقم الجوال *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main focus:border-transparent transition-all"
                        placeholder="05xxxxxxxx"
                      />
                    </div>

                    {/* البريد الإلكتروني */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <AtSign className="w-4 h-4 inline-block ml-1 text-brand-main" />
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main focus:border-transparent transition-all"
                        placeholder="example@email.com"
                      />
                    </div>

                    {/* التصنيف */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline-block ml-1 text-brand-main" />
                        تصنيف المشكلة *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main focus:border-transparent transition-all"
                      >
                        <option value="">اختر التصنيف</option>
                        {supportCategories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* موضوع التذكرة */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <MessageSquare className="w-4 h-4 inline-block ml-1 text-brand-main" />
                        موضوع التذكرة *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main focus:border-transparent transition-all"
                        placeholder="اكتب موضوع المشكلة باختصار"
                      />
                    </div>

                    {/* وصف المشكلة */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        تفاصيل المشكلة *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main focus:border-transparent transition-all resize-none"
                        placeholder="اشرح المشكلة بالتفصيل..."
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-brand-main hover:bg-brand-dark py-6 text-lg font-semibold transition-colors duration-300"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                            جاري الإرسال...
                          </>
                        ) : (
                          <>
                            <Send className="ml-2 h-5 w-5" />
                            إرسال التذكرة
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              
                {/* ساعات العمل */}
                <Card className="border border-brand-light/50">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-brand-light/30 rounded-full flex items-center justify-center ml-4">
                        <Clock className="w-6 h-6 text-brand-main" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">ساعات العمل</h3>
                    </div>
                    <div className="space-y-2 text-gray-600">
                      <p>الأحد - الخميس: من 8:00 ص إلى 2:30 م</p>
                      <p>الجمعة - السبت: مغلق</p>
                      <p className="text-sm text-gray-500 mt-4">
                        * الواتساب متاح على مدار الساعة
                      </p>
                    </div>
                  </CardContent>
                </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SupportPage;
