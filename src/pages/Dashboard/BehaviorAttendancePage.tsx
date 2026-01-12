import React from 'react';
import { FileText, Clock, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BehaviorAttendancePage = () => {
  return (
    <div className="space-y-6 font-kufi" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">نماذج شؤون الطلاب</h1>
          <p className="text-gray-600">إدارة سلوك الطلاب ومتابعة حضورهم ومواظبتهم</p>
        </div>
        
        {/* إحصائيات سريعة */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">الحضور اليوم</p>
                  <p className="text-2xl font-bold text-green-800">95%</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">السلوك الممتاز</p>
                  <p className="text-2xl font-bold text-blue-800">87%</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">التأخير</p>
                  <p className="text-2xl font-bold text-purple-800">8</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">التحسن الشهري</p>
                  <p className="text-2xl font-bold text-orange-800">+12%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* رسالة التطوير */}
        <div className="text-center bg-gray-50 rounded-lg p-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-4">
            <FileText className="h-6 w-6 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">قسم نماذج شؤون الطلاب</h2>
          <p className="text-gray-600 mb-4">هذا القسم قيد التطوير وسيتم تفعيله قريباً</p>
          <div className="text-sm text-gray-500">
            <p>سيشمل القسم:</p>
            <ul className="mt-2 space-y-1">
              <li>• متابعة حضور وغياب الطلاب</li>
              <li>• تسجيل السلوكيات الإيجابية والسلبية</li>
              <li>• تقارير المواظبة والسلوك</li>
              <li>• نظام المكافآت والإنذارات</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorAttendancePage;