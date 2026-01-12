import React from "react";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";
import TutorialsSection from "@/components/TutorialsSection";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function TutorialsPage() {
  return (
    <main dir="rtl" className="relative font-arabic bg-gray-50 min-h-screen flex flex-col">
      <MainHeader />
      <div className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <TutorialsSection />
      </div>
      <Footer />
      <ScrollToTopButton />
    </main>
  );
}
