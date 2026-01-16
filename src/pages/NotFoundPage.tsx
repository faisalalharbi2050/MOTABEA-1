import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowRight } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center font-arabic" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full border border-gray-100">
        <div className="w-20 h-20 bg-brand-light/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-brand-main">404</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">الصفحة غير موجودة</h1>
        <p className="text-gray-600 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate('/')}
            className="bg-brand-main hover:bg-brand-dark text-white gap-2"
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-gray-200 hover:bg-gray-50 text-gray-700 gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للسابق
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
