import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Chrome, ChevronDown } from "lucide-react";
import { useState } from "react";

const MainHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* شعار الموقع */}
          <div className="flex items-center space-x-3 space-x-reverse cursor-pointer" onClick={() => window.location.href="/"}>
            <div className="w-12 h-12 bg-gradient-to-br from-[#655ac1] to-[#8779fb] rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-300">
              <span className="text-white text-2xl font-black">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-dark">متابع</h1>
            </div>
          </div>

          {/* القائمة الرئيسية - سطح المكتب */}
          <nav className="hidden md:flex flex-1 justify-center items-center space-x-8 space-x-reverse">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-brand-main transition-colors font-medium text-sm"
            >
              الرئيسية
            </Link>
            <a 
              href="#features" 
              className="text-gray-600 hover:text-brand-main transition-colors font-medium text-sm"
            >
              المزايا
            </a>
            <a 
              href="#prices" 
              className="text-gray-600 hover:text-brand-main transition-colors font-medium text-sm"
            >
              الأسعار
            </a>
            <a 
              href="#chrome-extension"
              className="flex items-center gap-2 text-gray-600 hover:text-brand-main transition-colors font-medium text-sm"
            >
               <Chrome className="w-4 h-4" />
               <span>إضافة متابع</span>
            </a>
            
            {/* الدعم والمساعدة - Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-gray-600 group-hover:text-brand-main transition-colors font-medium text-sm outline-none">
                <span>الدعم والمساعدة</span>
                <ChevronDown className="w-4 h-4 text-[#655ac1] transition-transform duration-300 group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 min-w-[180px]">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1">
                  <Link to="/support" className="px-3 py-2 text-sm text-gray-600 hover:text-brand-main hover:bg-[#655ac1]/5 rounded-lg transition-colors text-right block">
                    الدعم الفني
                  </Link>
                  <Link to="/faq" className="px-3 py-2 text-sm text-gray-600 hover:text-brand-main hover:bg-[#655ac1]/5 rounded-lg transition-colors text-right block">
                    الأسئلة الشائعة
                  </Link>
                  <Link to="/tutorials" className="px-3 py-2 text-sm text-gray-600 hover:text-brand-main hover:bg-[#655ac1]/5 rounded-lg transition-colors text-right block">
                    شروحات النظام
                  </Link>
                </div>
              </div>
            </div>

            {/* السياسات والشروط - Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-gray-600 group-hover:text-brand-main transition-colors font-medium text-sm outline-none">
                <span>السياسات والشروط</span>
                <ChevronDown className="w-4 h-4 text-[#655ac1] transition-transform duration-300 group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 min-w-[180px]">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1">
                  <Link to="/privacy" className="px-3 py-2 text-sm text-gray-600 hover:text-brand-main hover:bg-[#655ac1]/5 rounded-lg transition-colors text-right block">
                    سياسة الخصوصية
                  </Link>
                  <Link to="/terms" className="px-3 py-2 text-sm text-gray-600 hover:text-brand-main hover:bg-[#655ac1]/5 rounded-lg transition-colors text-right block">
                    شروط الاستخدام
                  </Link>
                  <Link to="/refund-policy" className="px-3 py-2 text-sm text-gray-600 hover:text-brand-main hover:bg-[#655ac1]/5 rounded-lg transition-colors text-right block">
                    سياسة الاسترجاع
                  </Link>
                </div>
              </div>
            </div>
            <a 
               href="#footer" 
               className="text-gray-600 hover:text-brand-main transition-colors font-medium text-sm"
            >
               تواصل معنا
            </a>
          </nav>

          {/* أزرار تسجيل الدخول والتسجيل */}
          <div className="hidden md:flex items-center space-x-3 space-x-reverse">
            <Link to="/login">
              <Button 
                variant="outline" 
                className="border-brand-main text-brand-main hover:bg-brand-light/50"
              >
                تسجيل الدخول
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-brand-main hover:bg-brand-dark shadow-md shadow-brand-main/20">
                ابدأ الآن مجانًا
              </Button>
            </Link>
          </div>

          {/* زر القائمة للموبايل */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* القائمة المنسدلة للموبايل */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white">
            <nav className="flex flex-col space-y-4 px-2">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-brand-main transition-colors font-medium p-2 rounded-lg hover:bg-brand-light/10"
                onClick={() => setIsMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <a 
                href="#features" 
                className="text-gray-700 hover:text-brand-main transition-colors font-medium p-2 rounded-lg hover:bg-brand-light/10"
                onClick={() => setIsMenuOpen(false)}
              >
                المزايا
              </a>
              <a 
                href="#prices" 
                className="text-gray-700 hover:text-brand-main transition-colors font-medium p-2 rounded-lg hover:bg-brand-light/10"
                onClick={() => setIsMenuOpen(false)}
              >
                الأسعار
              </a>
              <a
                href="#chrome-extension"
                className="text-gray-700 hover:text-brand-main transition-colors font-medium p-2 rounded-lg hover:bg-brand-light/10"
                onClick={() => setIsMenuOpen(false)}
              >
                 إضافة متابع
              </a>
              <a 
                href="#support-section" 
                className="text-gray-700 hover:text-brand-main transition-colors font-medium p-2 rounded-lg hover:bg-brand-light/10"
                onClick={() => setIsMenuOpen(false)}
              >
                الدعم والمساعدة
              </a>
              <a 
                href="#privacy-section" 
                className="text-gray-700 hover:text-brand-main transition-colors font-medium p-2 rounded-lg hover:bg-brand-light/10"
                onClick={() => setIsMenuOpen(false)}
              >
                 السياسات والشروط
              </a>
              <a 
                href="#footer" 
                className="text-gray-700 hover:text-brand-main transition-colors font-medium p-2 rounded-lg hover:bg-brand-light/10"
                onClick={() => setIsMenuOpen(false)}
              >
                تواصل معنا
              </a>
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    className="w-full border-brand-main text-brand-main hover:bg-brand-light/50"
                  >
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-brand-main hover:bg-brand-dark">
                    ابدأ الآن مجانًا
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default MainHeader;
