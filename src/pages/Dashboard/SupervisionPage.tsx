import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield, Clock } from 'lucide-react';

const SupervisionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 font-kufi" style={{ direction: 'rtl' }}>
      {/* عنوان الصفحة */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الإشراف والمناوبة</h1>
            <p className="text-sm text-gray-500">إدارة الإشراف اليومي وجداول المناوبة المدرسية</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* بطاقة نماذج الإشراف والمناوبة */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-reverse space-x-2">
                <FileText className="h-6 w-6 text-indigo-600" />
                <CardTitle className="text-lg">نماذج الإشراف والمناوبة</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-sm">
                نماذج شاملة لإدارة الإشراف اليومي والمناوبة المدرسية
              </p>
              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                <li>• جداول الإشراف اليومي</li>
                <li>• تقارير الإشراف</li>
                <li>• جداول المناوبة</li>
                <li>• تقارير المناوبة اليومية</li>
              </ul>
              <Button
                onClick={() => navigate('/dashboard/supervision/forms')}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                <FileText className="h-4 w-4 ml-2" />
                عرض النماذج
              </Button>
            </CardContent>
          </Card>

          {/* بطاقات أخرى يمكن إضافتها لاحقاً */}
          <Card className="hover:shadow-lg transition-shadow duration-200 opacity-50">
            <CardHeader>
              <div className="flex items-center space-x-reverse space-x-2">
                <Shield className="h-6 w-6 text-gray-400" />
                <CardTitle className="text-lg text-gray-500">إدارة المشرفين</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4 text-sm">
                قيد التطوير...
              </p>
              <Button disabled className="w-full">
                قريباً
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 opacity-50">
            <CardHeader>
              <div className="flex items-center space-x-reverse space-x-2">
                <Clock className="h-6 w-6 text-gray-400" />
                <CardTitle className="text-lg text-gray-500">جدولة المناوبات</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4 text-sm">
                قيد التطوير...
              </p>
              <Button disabled className="w-full">
                قريباً
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupervisionPage;
