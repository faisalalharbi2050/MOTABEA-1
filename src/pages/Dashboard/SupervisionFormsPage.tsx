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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-1 pb-8 px-4 sm:px-6 lg:px-8 font-kufi" style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl">م</span>
            </div>
            <div className="mr-3">
              <h2 className="text-lg font-bold text-gray-800">متابع</h2>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/supervision')}
            className="w-10 h-10 flex items-center justify-center text-white transition-colors bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-full shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <FileText className="h-8 w-8 ml-3" />
            <h1 className="text-2xl font-bold">نماذج الإشراف والمناوبة اليومية</h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-md">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('supervision')}
              className={`flex-1 py-4 px-6 text-center font-medium rounded-tr-xl transition-colors ${
                activeTab === 'supervision'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <Shield className="h-5 w-5 ml-2" />
                <span>الإشراف اليومي</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('duty')}
              className={`flex-1 py-4 px-6 text-center font-medium rounded-tl-xl transition-colors ${
                activeTab === 'duty'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <Clock className="h-5 w-5 ml-2" />
                <span>المناوبة اليومية</span>
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
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* بطاقة جدول الإشراف اليومي */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                    <div className="flex items-center mb-3">
                      <TableIcon className="h-5 w-5 text-sky-500 ml-2" />
                      <h4 className="font-semibold text-gray-800">جدول الإشراف اليومي</h4>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      جدول مصمم و منظم لإسناد مهام الإشراف اليومي على الموظفين
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• جدول مصمم وفق الاحتياج الفعلي للمدارس</li>
                      <li>• إضافة المشرف اليومي</li>
                      <li>• تحديد موقع الإشراف</li>
                      <li>• إضافة المشرف المتابع</li>
                      <li>• تصميم احترافي جاهز للطباعة</li>
                    </ul>
                    <div className="mt-4">
                      <Button 
                        onClick={() => navigate('/dashboard/supervision/daily-table')}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      >
                        <TableIcon className="h-4 w-4 ml-2" />
                        جدول الإشراف اليومي
                      </Button>
                    </div>
                  </div>
                  
                  {/* بطاقة تقرير الإشراف اليومي */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                    <div className="flex items-center mb-3">
                      <BarChart3 className="h-5 w-5 text-sky-500 ml-2" />
                      <h4 className="font-semibold text-gray-800">تقرير الإشراف اليومي</h4>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      نموذج تقرير شهري لمتابعة سير الإشراف اليومي
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• تقرير مصمم وفق الاحتياج الفعلي للمدارس</li>
                      <li>• التقرير مرتبط بجدول الإشراف اليومي</li>
                      <li>• يمكن العمل على التقرير الكترونياً أو ورقياً</li>
                      <li>• متابعة سير العمل لكل يوم</li>
                      <li>• تصميم احترافي جاهز للطباعة</li>
                    </ul>
                    <Button
                      onClick={() => navigate('/dashboard/supervision/daily-report')}
                      className="w-full mt-4 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <FileText className="h-4 w-4 ml-2" />
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
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* بطاقة جدول المناوبة اليومية */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                    <div className="flex items-center mb-3">
                      <TableIcon className="h-5 w-5 text-sky-500 ml-2" />
                      <h4 className="font-semibold text-gray-800">جدول المناوبة اليومية</h4>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      جدول مصمم و منظم لإسناد مهام المناوبة اليومية على الموظفين
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• جدول مصمم وفق الاحتياج الفعلي للمدارس</li>
                      <li>• إضافة المناوب اليومي</li>
                      <li>• تصميم احترافي جاهز للطباعة</li>
                    </ul>
                    <div className="mt-4">
                      <Button 
                        onClick={() => navigate('/dashboard/supervision/daily-duty')}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      >
                        <TableIcon className="h-4 w-4 ml-2" />
                        جدول المناوبة اليومية
                      </Button>
                    </div>
                  </div>
                  
                  {/* بطاقة تقرير المناوبة اليومية */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                    <div className="flex items-center mb-3">
                      <BarChart3 className="h-5 w-5 text-sky-500 ml-2" />
                      <h4 className="font-semibold text-gray-800">تقرير المناوبة اليومية</h4>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      نموذج بنفس تصميم نموذج التقرير الرسمي
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• إضافة المناوب في النموذج مباشرة</li>
                      <li>• يمكن العمل على التقرير الكترونياً أو ورقياً</li>
                      <li>• تصميم احترافي جاهز للطباعة</li>
                    </ul>
                    <div className="mt-4">
                      <Button 
                        onClick={() => navigate('/dashboard/supervision/daily-duty-report')}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      >
                        <BarChart3 className="h-4 w-4 ml-2" />
                        تقرير المناوبة اليومية
                      </Button>
                    </div>
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