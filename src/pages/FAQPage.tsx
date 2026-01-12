import React from 'react';
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const FAQPage = () => {
  return (
    <main dir="rtl" className="relative font-arabic min-h-screen bg-white">
      <MainHeader />


      <div className="pt-4">
        <FAQSection />
      </div>
      <Footer />
      <ScrollToTopButton />
    </main>
  );
};

export default FAQPage;
