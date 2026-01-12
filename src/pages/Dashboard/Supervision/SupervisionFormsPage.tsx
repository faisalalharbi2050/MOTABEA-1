import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, FileText, BarChart3, Printer, Search, RotateCcw, Edit, 
  Home, Users, UserCheck, Plus, Trash2, Eye, Clock, Send, CheckCircle, 
  Calendar as CalendarIcon, AlertTriangle, XCircle, TrendingUp, CalendarDays,
  CalendarRange, GraduationCap, X, Phone, UserPlus, ChevronDown, Shield, Users2, Info,
  ChevronRight, Table as TableIcon
} from 'lucide-react';

const SupervisionFormsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('supervision');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-kufi" style={{ direction: 'rtl' }}>

      {/* عنوان الصفحة */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-3 rounded-xl shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">الإشراف والمناوبة</h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
          <div className="flex bg-gray-50 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('supervision')}
              className={`flex-1 py-2.5 px-6 text-center font-semibold rounded-xl transition-all duration-300 transform ${
                activeTab === 'supervision'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center space-x-reverse space-x-3">
                <Shield className={`h-5 w-5 ${activeTab === 'supervision' ? 'text-white' : 'text-indigo-500'}`} />
                <span className="text-base">الإشراف اليومي</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('duty')}
              className={`flex-1 py-2.5 px-6 text-center font-semibold rounded-xl transition-all duration-300 transform ${
                activeTab === 'duty'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center space-x-reverse space-x-3">
                <Clock className={`h-5 w-5 ${activeTab === 'duty' ? 'text-white' : 'text-indigo-500'}`} />
                <span className="text-base">المناوبة اليومية</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'supervision' ? (
          // تبويب الإشراف اليومي
          <>
            {/* بطاقة الترحيب - قسم الإشراف اليومي */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 rounded-full p-2 ml-3">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900">مرحباً بك في قسم الإشراف اليومي</h3>
                </div>
                
                <div className="space-y-6">
                  {/* بطاقة جدول الإشراف اليومي */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center mb-4">
                      <TableIcon className="h-6 w-6 text-sky-500 ml-3" />
                      <h4 className="font-bold text-gray-800 text-lg">جدول الإشراف اليومي</h4>
                    </div>
                    <p className="text-gray-600 text-base leading-relaxed mb-4">
                      جدول مصمم و منظم لإسناد مهام الإشراف اليومي على الموظفين
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1 mb-5">
                      <li>• جدول مصمم وفق الاحتياج الفعلي للمدارس</li>
                      <li>• إضافة المشرف اليومي</li>
                      <li>• تحديد موقع الإشراف</li>
                      <li>• إضافة المشرف المتابع</li>
                      <li>• تصميم احترافي جاهز للطباعة</li>
                    </ul>
                    <Button 
                      onClick={() => navigate('/dashboard/supervision/daily')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-base font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <TableIcon className="h-5 w-5 ml-2" />
                      جدول الإشراف اليومي
                    </Button>
                  </div>
                  
                  {/* بطاقة تقرير الإشراف اليومي */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center mb-4">
                      <BarChart3 className="h-6 w-6 text-sky-500 ml-3" />
                      <h4 className="font-bold text-gray-800 text-lg">تقرير الإشراف اليومي</h4>
                    </div>
                    <p className="text-gray-600 text-base leading-relaxed mb-4">
                      نموذج تقرير شهري لمتابعة سير الإشراف اليومي
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1 mb-5">
                      <li>• تقرير مصمم وفق الاحتياج الفعلي للمدارس</li>
                      <li>• التقرير مرتبط بجدول الإشراف اليومي</li>
                      <li>• يمكن العمل على التقرير الكترونياً أو ورقياً</li>
                      <li>• متابعة سير العمل لكل يوم</li>
                      <li>• تصميم احترافي جاهز للطباعة</li>
                    </ul>
                    <Button
                      onClick={() => navigate('/dashboard/supervision/daily-report')}
                      className="w-full bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white py-3 text-base font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <FileText className="h-5 w-5 ml-2" />
                      تقرير الإشراف اليومي
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // تبويب المناوبة اليومية
          <>
            {/* بطاقة الترحيب - قسم المناوبة اليومية */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 rounded-full p-2 ml-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900">مرحباً بك في قسم المناوبة اليومية</h3>
                </div>
                
                <div className="space-y-6">
                  {/* بطاقة جدول المناوبة اليومية */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center mb-4">
                      <TableIcon className="h-6 w-6 text-sky-500 ml-3" />
                      <h4 className="font-bold text-gray-800 text-lg">جدول المناوبة اليومية</h4>
                    </div>
                    <p className="text-gray-600 text-base leading-relaxed mb-4">
                      جدول مصمم و منظم لإسناد مهام المناوبة اليومية على الموظفين
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1 mb-5">
                      <li>• جدول مصمم وفق الاحتياج الفعلي للمدارس</li>
                      <li>• إضافة المناوب اليومي</li>
                      <li>• تصميم احترافي جاهز للطباعة</li>
                    </ul>
                    <Button 
                      onClick={() => navigate('/dashboard/supervision/duty')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-base font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <TableIcon className="h-5 w-5 ml-2" />
                      جدول المناوبة اليومية
                    </Button>
                  </div>
                  
                  {/* بطاقة تقرير المناوبة اليومية */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center mb-4">
                      <BarChart3 className="h-6 w-6 text-sky-500 ml-3" />
                      <h4 className="font-bold text-gray-800 text-lg">تقرير المناوبة اليومية</h4>
                    </div>
                    <p className="text-gray-600 text-base leading-relaxed mb-4">
                      نموذج بنفس تصميم نموذج التقرير الرسمي
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1 mb-5">
                      <li>• إضافة المناوب في النموذج مباشرة</li>
                      <li>• يمكن العمل على التقرير الكترونياً أو ورقياً</li>
                      <li>• تصميم احترافي جاهز للطباعة</li>
                    </ul>
                    <Button 
                      onClick={() => navigate('/dashboard/supervision/daily-duty-report')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-base font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <BarChart3 className="h-5 w-5 ml-2" />
                      تقرير المناوبة اليومية
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupervisionFormsPage;