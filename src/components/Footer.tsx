import React from "react";
import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  MapPin,
  Twitter,
  ExternalLink
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-brand-dark text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* المحتوى الرئيسي للفوتر */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            
            {/* معلومات الشركة - الشعار والسوشيال */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 space-x-reverse mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#655ac1] to-[#8779fb] rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-300">
                  <span className="text-white text-2xl font-black">M</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">متابع</h3>
                </div>
              </div>
              
              {/* روابط التواصل الاجتماعي */}
              <div className="flex space-x-4 space-x-reverse">
                <a 
                  href="https://wa.me/966505015005" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-green-500 rounded-xl flex items-center justify-center transition-colors duration-300 backdrop-blur-sm"
                  aria-label="واتساب"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/10 hover:bg-blue-400 rounded-xl flex items-center justify-center transition-colors duration-300 backdrop-blur-sm"
                  aria-label="تويتر"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* من نحن */}
            <div id="about-us">
              <h4 className="text-lg font-bold mb-6 text-white">من نحن</h4>
              <div className="text-sm text-brand-light/80 space-y-2">
                <p className="font-bold text-white">مؤسسة متابع التقنية</p>
                <p>سجل تجاري رقم 10101010101</p>
                <p>مسجل لدى المركز السعودي للأعمال رقم 101010101</p>
              </div>
            </div>

            {/* الدعم والمساعدة */}
            <div id="support-section">
              <h4 className="text-lg font-bold mb-6 text-white">الدعم والمساعدة</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/support" className="text-brand-light/80 hover:text-white transition-colors duration-200 flex items-center group">
                    <span>الدعم الفني</span>
                    <ExternalLink className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-brand-light/80 hover:text-white transition-colors duration-200 flex items-center group">
                    <span>الأسئلة الشائعة</span>
                    <ExternalLink className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
                <li>
                  <Link to="/tutorials" className="text-brand-light/80 hover:text-white transition-colors duration-200 flex items-center group">
                    <span>شروحات النظام</span>
                    <ExternalLink className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* السياسات والشروط */}
            <div id="privacy-section">
              <h4 className="text-lg font-bold mb-6 text-white">السياسات والشروط</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/privacy-policy" className="text-brand-light/80 hover:text-white transition-colors duration-200 flex items-center group">
                    <span>سياسة الخصوصية</span>
                    <ExternalLink className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-brand-light/80 hover:text-white transition-colors duration-200 flex items-center group">
                    <span>شروط الاستخدام</span>
                    <ExternalLink className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="text-brand-light/80 hover:text-white transition-colors duration-200 flex items-center group">
                    <span>سياسة الاسترجاع</span>
                    <ExternalLink className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* معلومات التواصل */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">تواصل معنا</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <Mail className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-brand-light/80 text-sm font-medium mb-1">البريد الإلكتروني</p>
                    <a 
                      href="mailto:info@motabea.com" 
                      className="text-white hover:text-brand-main transition-colors duration-200"
                    >
                      info@motabea.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 space-x-reverse">
                  <Phone className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-brand-light/80 text-sm font-medium mb-1">الهاتف</p>
                    <a 
                      href="tel:+966505015005" 
                      className="text-white hover:text-brand-main transition-colors duration-200"
                    >
                      966505015005
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 space-x-reverse">
                  <MapPin className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-brand-light/80 text-sm font-medium mb-1">العنوان</p>
                    <p className="text-white text-xs whitespace-nowrap">
                      مكة المكرمة، المملكة العربية السعودية
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* وسائل الدفع المتاحة - أيقونات فقط */}
        <div className="flex justify-center pb-8 lg:pb-12">
           <div className="flex flex-wrap justify-center gap-4 items-center">
              {/* Mada Pay */}
              <div className="bg-white px-3 py-1.5 rounded-lg border border-brand-light/10 shadow-sm opacity-80 hover:opacity-100 transition-all flex items-center justify-center h-9">
                <img 
                  src="/images/landing/madapay.png" 
                  alt="Mada Pay" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              
              {/* Visa */}
              <div className="bg-white px-3 py-1.5 rounded-lg border border-brand-light/10 shadow-sm opacity-80 hover:opacity-100 transition-all h-9 flex items-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
                  alt="Visa" 
                  className="h-4 w-auto object-contain"
                />
              </div>

              {/* MasterCard */}
              <div className="bg-white px-3 py-1.5 rounded-lg border border-brand-light/10 shadow-sm opacity-80 hover:opacity-100 transition-all h-9 flex items-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                  alt="MasterCard" 
                  className="h-6 w-auto object-contain"
                />
              </div>

              {/* Apple Pay */}
              <div className="bg-white px-3 py-1.5 rounded-lg border border-brand-light/10 shadow-sm opacity-80 hover:opacity-100 transition-all h-9 flex items-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" 
                  alt="Apple Pay" 
                  className="h-4 w-auto object-contain"
                />
              </div>

              {/* Samsung Pay */}
              <div className="bg-white px-2 py-0.5 rounded-lg border border-brand-light/10 shadow-sm opacity-80 hover:opacity-100 transition-all h-9 flex items-center">
                <img 
                  src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/apm/samsung-pay.svg" 
                  alt="Samsung Pay" 
                  className="h-8 w-auto object-contain"
                />
              </div>
           </div>
        </div>

        {/* خط فاصل */}
        <div className="border-t border-brand-light/10"></div>

        {/* الجزء السفلي */}
        <div className="py-6 sm:py-8 flex flex-col items-center gap-6">
          <div className="flex justify-center items-center">
            <div className="text-brand-light/60 text-sm text-center">
              <p>&copy; {currentYear} نظام متابع. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
