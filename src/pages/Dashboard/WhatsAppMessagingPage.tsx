import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Send, Users, Search, Plus, Smartphone, MessageSquare, Settings, Archive, CreditCard, Paperclip, CalendarDays, FileText, UserCheck, GraduationCap, Edit, Trash2, Copy, BarChart3, Calendar, Clock, Link2, Image, Eye, Printer, Download
} from 'lucide-react';

// --- Mock Data ---
const mockStats = {
  today: 152,
  week: 845,
  month: 3210,
  balance: 4320,
};

const mockStudents = [
  { id: 's1', name: 'عبدالله الغامدي', class: '1-1' },
  { id: 's2', name: 'محمد الزهراني', class: '1-2' },
  { id: 's3', name: 'سارة القحطاني', class: '2-1' },
  { id: 's4', name: 'فهد العتيبي', class: '3-3' },
];

const mockTeachers = [
  { id: 't1', name: 'أحمد الشمري' },
  { id: 't2', name: 'فاطمة الشهري' },
  { id: 't3', name: 'خالد المالكي' },
];

const mockClasses = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '3-3'];

const mockTemplates = [
  { 
    id: 'absence', 
    name: 'رسالة غياب', 
    content: 'المكرم ولي أمر الطالب/ة {{student_name}}، نشعركم بغياب ابنكم عن المدرسة اليوم {{date}} الموافق {{history}}' 
  },
  { 
    id: 'lateness', 
    name: 'رسالة تأخر', 
    content: 'المكرم ولي أمر الطالب/ة {{student_name}}، نشعركم بتأخر ابنكم اليوم {{date}} الموافق {{history}} وحضوره الساعة {{time}}.' 
  },
  { 
    id: 'behavior', 
    name: 'رسالة سلوك', 
    content: 'المكرم ولي أمر الطالب {{student_name}}، نشعركم بمخالفة ابنكم سلوكياً (تكتب المخالفة) اليوم {{date}} الموافق {{history}} نأمل (يكتب هنا المطلوب).' 
  },
  { 
    id: 'supervision', 
    name: 'رسالة الإشراف اليومي', 
    content: 'المكرم {{staff_name}} نذكركم بموعد الإشراف اليومي هذا اليوم {{date}} الموافق {{history}}' 
  },
  { 
    id: 'duty', 
    name: 'رسالة المناوبة اليومية', 
    content: 'المكرم {{staff_name}} نذكركم بموعد المناوبة اليومية هذا اليوم {{date}} الموافق {{history}}' 
  },
  { 
    id: 'schedule', 
    name: 'رسالة الجدول المدرسي', 
    content: 'المكرم {{staff_name}} نفيدكم بجدول الحصص المسند لكم وفق المرفق نأمل الاطلاع وعمل اللازم.' 
  },
  { 
    id: 'waiting', 
    name: 'رسالة الانتظار اليومي', 
    content: 'المكرم {{staff_name}} نذكركم بموعد الانتظار اليومي هذا اليوم {{date}} الموافق {{history}}' 
  },
  { 
    id: 'circular', 
    name: 'رسالة التعاميم الداخلية', 
    content: 'المكرم {{staff_name}} نحيطكم علماً بالتعميم (عنوان التعميم) المرفق نأمل الاطلاع وعمل اللازم.' 
  },
  { 
    id: 'custom', 
    name: 'رسالة مخصصة', 
    content: '' 
  },
];

const mockArchive = [
  { id: 'm1', content: 'ولي أمر الطالب/ة عبدالله الغامدي، نفيدكم بغيابه...', recipient: 'ولي أمر', status: 'sent', time: 'اليوم، 10:30 صباحًا' },
  { id: 'm2', content: 'تذكير باجتماع المعلمين غداً الساعة 1 ظهراً.', recipient: 'موظف', status: 'sent', time: 'الأمس، 04:15 مساءً' },
  { id: 'm3', content: 'رسالة اختبار مادة العلوم لطلاب الصف الثاني.', recipient: 'مجموعة فصول', status: 'failed', time: '2025-07-28' },
];

const WhatsAppMessagingPage: React.FC = () => {
  const [activeView, setActiveView] = useState('home'); // تغيير من 'send' إلى 'home'
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [templates, setTemplates] = useState(mockTemplates);
  const [newTemplate, setNewTemplate] = useState({ id: '', name: '', content: '' });
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    } else {
      setTemplates([...templates, { ...newTemplate, id: `template_${Date.now()}` }]);
    }
    setIsTemplateModalOpen(false);
    setNewTemplate({ id: '', name: '', content: '' });
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const menuItems = [
    { id: 'send', label: 'إرسال رسالة جديدة', icon: Send, color: 'green' },
    { id: 'archive', label: 'أرشيف الرسائل', icon: Archive, color: 'blue' },
    { id: 'templates', label: 'قوالب الرسائل', icon: FileText, color: 'purple' },
    { id: 'staff', label: 'مجموعات الموظفين', icon: UserCheck, color: 'indigo' },
    { id: 'students', label: 'مجموعات الطلاب', icon: GraduationCap, color: 'cyan' },
    { id: 'subscription', label: 'إدارة الرسائل', icon: Settings, color: 'lightBlue' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <MessageSquare className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">مرحباً بك في نظام الرسائل</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                اختر أحد الخيارات من الأعلى للبدء في إرسال الرسائل أو إدارة القوالب والمجموعات
              </p>
              <Button 
                onClick={() => setIsSendModalOpen(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl shadow-lg"
              >
                <Send className="ml-2 h-5 w-5" />
                إرسال رسالة جديدة
              </Button>
            </div>
          </div>
        );
      case 'archive':
        return <MessageArchive />;
      case 'templates':
        return <TemplateManager 
                  templates={templates} 
                  onAdd={() => { setEditingTemplate(null); setNewTemplate({ id: '', name: '', content: '' }); setIsTemplateModalOpen(true); }}
                  onEdit={(t) => { setEditingTemplate(t); setIsTemplateModalOpen(true); }}
                  onDelete={handleDeleteTemplate}
                />;
      case 'staff':
        return <StaffGroupsManager />;
      case 'students':
        return <StudentGroupsManager />;
      case 'subscription':
        return <SubscriptionManager />;
      default:
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <MessageSquare className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">مرحباً بك في نظام الرسائل</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                اختر أحد الخيارات من الأعلى للبدء في إرسال الرسائل أو إدارة القوالب والمجموعات
              </p>
              <Button 
                onClick={() => setIsSendModalOpen(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl shadow-lg"
              >
                <Send className="ml-2 h-5 w-5" />
                إرسال رسالة جديدة
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 font-kufi" style={{ direction: 'rtl' }}>
      {/* عنوان الصفحة */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الرسائل</h1>
          </div>
        </div>
      </div>

      {/* الشريط السابق - Stats Cards */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard title="رسائل اليوم" value={mockStats.today.toString()} icon={CalendarDays} />
          <StatsCard title="رسائل الأسبوع" value={mockStats.week.toString()} icon={Calendar} />
          <StatsCard title="رسائل الشهر" value={mockStats.month.toString()} icon={BarChart3} />
          <StatsCard title="الرصيد المتبقي" value={mockStats.balance.toString()} icon={Smartphone} />
        </div>

        {/* Horizontal Navigation Menu */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-blue-50 via-white to-indigo-50">
          <CardContent className="p-5">
            <nav className="flex flex-wrap gap-3">
              {menuItems.map(item => {
                const colorClasses = {
                  green: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg',
                  blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md',
                  purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md',
                  indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md',
                  cyan: 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-md',
                  lightBlue: 'bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md'
                };

                const isActive = activeView === item.id && item.id !== 'send';
                const baseClasses = item.id === 'send' || isActive ? colorClasses[item.color] : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm';

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'send') {
                        setIsSendModalOpen(true);
                      } else {
                        setActiveView(item.id);
                      }
                    }}
                    className={`flex items-center px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${baseClasses}`}
                  >
                    <item.icon className="h-5 w-5 ml-2" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Main Layout */}
        <div className="w-full">

          {/* Main Content */}
          <main className="w-full">
            <div key={activeView} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Send Message Modal */}
      <SendMessageDialog 
        isOpen={isSendModalOpen} 
        onClose={() => setIsSendModalOpen(false)}
        onConfirm={() => {
          setIsSendModalOpen(false);
          setShowConfirmDialog(true);
        }}
      />

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الإرسال</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم إرسال الرسالة إلى <strong>15</strong> مستلم. هل أنت متأكد؟
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse">
              <AlertDialogAction onClick={() => setShowConfirmDialog(false)} className="bg-blue-600 hover:bg-blue-700">
                تأكيد وإرسال
              </AlertDialogAction>
              <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>إلغاء</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Template Manager Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-purple-50 to-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="border-b-2 border-purple-200 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              {editingTemplate ? 'تعديل قالب' : 'إضافة قالب جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="template-name" className="text-sm font-semibold text-gray-700 mb-2 block">اسم القالب</Label>
              <Input 
                id="template-name" 
                value={editingTemplate ? editingTemplate.name : newTemplate.name}
                onChange={(e) => editingTemplate ? setEditingTemplate({...editingTemplate, name: e.target.value}) : setNewTemplate({...newTemplate, name: e.target.value})}
                className="border-2 border-purple-200 focus:border-purple-500 rounded-lg"
                placeholder="مثال: رسالة غياب"
              />
            </div>
            <div>
              <Label htmlFor="template-content" className="text-sm font-semibold text-gray-700 mb-2 block">محتوى القالب</Label>
              <Textarea 
                id="template-content" 
                rows={6}
                value={editingTemplate ? editingTemplate.content : newTemplate.content}
                onChange={(e) => editingTemplate ? setEditingTemplate({...editingTemplate, content: e.target.value}) : setNewTemplate({...newTemplate, content: e.target.value})}
                className="border-2 border-purple-200 focus:border-purple-500 rounded-lg resize-none"
                placeholder="اكتب محتوى القالب هنا..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-purple-100">
            <Button 
              variant="outline" 
              onClick={() => setIsTemplateModalOpen(false)}
              className="border-2 border-gray-300 hover:bg-gray-100 rounded-lg px-6"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleSaveTemplate}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg px-6 font-semibold shadow-lg"
            >
              حفظ القالب
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Sub-components ---

const StatsCard = ({ title, value, icon: Icon }) => {
  // ألوان متدرجة مخففة لكل بطاقة
  const gradients = {
    'رسائل اليوم': 'from-blue-400 to-blue-500',
    'رسائل الأسبوع': 'from-blue-500 to-indigo-500',
    'رسائل الشهر': 'from-indigo-500 to-purple-500',
    'الرصيد المتبقي': 'from-blue-600 to-cyan-500'
  };

  const gradient = gradients[title] || 'from-blue-400 to-blue-500';

  return (
    <Card className={`bg-gradient-to-br ${gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative`}>
      <CardContent className="p-6 flex items-center min-h-[120px]">
        {/* توسيط عمودي وأفقي للمحتوى */}
        <div className="flex items-center justify-between w-full">
          {/* النصوص والأرقام */}
          <div className="flex flex-col">
            <p className="text-sm font-medium text-white/90 mb-2">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
          
          {/* الأيقونة */}
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* تأثير ديكوري خفيف */}
        <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
      </CardContent>
    </Card>
  );
};

const MessageArchive = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [viewingMessage, setViewingMessage] = useState(null);

  const filteredArchive = useMemo(() => 
    mockArchive.filter(msg => {
      const matchesSearch = msg.content.includes(searchTerm) || msg.recipient.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || msg.status === filterStatus;
      const matchesDate = !filterDate || msg.time.includes(filterDate);
      return matchesSearch && matchesStatus && matchesDate;
    }), [searchTerm, filterStatus, filterDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleSelectAll = () => {
    if (selectedMessages.size === filteredArchive.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(filteredArchive.map(m => m.id)));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Archive Header */}
      <div className="border-b-2 border-blue-200 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg ml-3">
              <Archive className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">أرشيف الرسائل</h2>
              <p className="text-gray-600">تصفح وإدارة الرسائل المرسلة</p>
            </div>
          </div>
          <div className="text-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-4 shadow-lg min-w-[120px]">
            <div className="text-3xl font-bold">{filteredArchive.length}</div>
            <div className="text-sm opacity-90">رسالة محفوظة</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-2 border-blue-100 shadow-lg">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Input 
                placeholder="ابحث في المحتوى، اسم الطالب أو الموظف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 border-2 border-blue-200 focus:border-blue-500 rounded-lg h-11"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
            </div>
            
            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 rounded-lg h-11">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="sent">✅ تم الإرسال</SelectItem>
                <SelectItem value="failed">❌ فشل الإرسال</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Input 
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border-2 border-blue-200 focus:border-blue-500 rounded-lg h-11"
              placeholder="التاريخ"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-blue-200">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleSelectAll}
              className="border-2 border-blue-300 hover:bg-blue-50 rounded-lg font-semibold"
            >
              <Checkbox checked={selectedMessages.size === filteredArchive.length} className="ml-2" />
              تحديد الكل
            </Button>
            <Button 
              size="sm"
              onClick={handlePrint}
              disabled={selectedMessages.size === 0}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold shadow-md"
            >
              <Printer className="ml-2 h-4 w-4" />
              طباعة المحدد ({selectedMessages.size})
            </Button>
            <Button 
              size="sm"
              variant="outline"
              disabled={selectedMessages.size === 0}
              className="border-2 border-blue-300 hover:bg-blue-50 rounded-lg font-semibold"
            >
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="bg-white rounded-xl border-2 border-blue-100 shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-500 hover:to-indigo-500">
              <TableHead className="font-bold text-white text-center">
                <Checkbox 
                  checked={selectedMessages.size === filteredArchive.length && filteredArchive.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="font-bold text-white text-center">الرسالة</TableHead>
              <TableHead className="font-bold text-white text-center">المستلم</TableHead>
              <TableHead className="font-bold text-white text-center">الحالة</TableHead>
              <TableHead className="font-bold text-white text-center">وقت الإرسال</TableHead>
              <TableHead className="font-bold text-white text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArchive.length > 0 ? (
              filteredArchive.map((msg) => (
                <TableRow key={msg.id} className="hover:bg-blue-50 transition-colors border-b border-blue-100">
                  <TableCell className="text-center py-4">
                    <Checkbox 
                      checked={selectedMessages.has(msg.id)}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(selectedMessages);
                        if (checked) {
                          newSet.add(msg.id);
                        } else {
                          newSet.delete(msg.id);
                        }
                        setSelectedMessages(newSet);
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <div className="max-w-md mx-auto">
                      <p className="text-gray-900 truncate font-medium">{msg.content}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 font-semibold">
                      {msg.recipient}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <Badge className={`font-semibold ${
                      msg.status === 'sent' 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                    }`}>
                      {msg.status === 'sent' ? '✓ تم الإرسال' : '✗ فشل الإرسال'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-4 text-gray-600 font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {msg.time}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setViewingMessage(msg)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg p-2"
                        title="عرض الرسالة"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg p-2"
                        title="نسخ"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg p-2"
                        title="حذف"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="text-gray-400">
                    <Archive className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="font-semibold text-lg mb-2">لا توجد رسائل</p>
                    <p className="text-sm">لم يتم العثور على رسائل تطابق البحث</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Message Dialog */}
      {viewingMessage && (
        <Dialog open={!!viewingMessage} onOpenChange={() => setViewingMessage(null)}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-blue-50 to-white border-0 shadow-2xl rounded-2xl">
            <DialogHeader className="border-b-2 border-blue-200 pb-4">
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                تفاصيل الرسالة
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
                <Label className="text-sm font-semibold text-gray-600 mb-2 block">محتوى الرسالة:</Label>
                <p className="text-gray-900 leading-relaxed">{viewingMessage.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <Label className="text-xs font-semibold text-gray-600 block mb-1">المستلم:</Label>
                  <p className="text-gray-900 font-semibold">{viewingMessage.recipient}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <Label className="text-xs font-semibold text-gray-600 block mb-1">وقت الإرسال:</Label>
                  <p className="text-gray-900 font-semibold">{viewingMessage.time}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-blue-100">
                <Label className="text-xs font-semibold text-gray-600 block mb-2">الحالة:</Label>
                <Badge className={`${
                  viewingMessage.status === 'sent' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                } px-4 py-2 text-base font-semibold`}>
                  {viewingMessage.status === 'sent' ? '✓ تم الإرسال بنجاح' : '✗ فشل الإرسال'}
                </Badge>
              </div>
            </div>
            <DialogFooter className="flex gap-3">
              <Button variant="outline" onClick={() => setViewingMessage(null)} className="px-6 border-2">
                إغلاق
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6">
                <Printer className="ml-2 h-4 w-4" />
                طباعة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const TemplateManager = ({ templates, onAdd, onEdit, onDelete }) => (
  <div className="p-6 space-y-6">
    {/* Templates Header */}
    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
      <div className="flex items-center">
        <FileText className="h-6 w-6 text-gray-500 ml-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">قوالب الرسائل</h2>
          <p className="text-gray-600">إنشاء وإدارة قوالب الرسائل المحفوظة</p>
        </div>
      </div>
      <Button 
        onClick={onAdd} 
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        <Plus className="ml-2 h-4 w-4" />
        إضافة قالب جديد
      </Button>
    </div>

    {/* Templates Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center ml-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                  <p className="text-gray-700 text-sm leading-relaxed">{template.content}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(template)} 
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-green-600 hover:bg-green-50 p-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(template.id)} 
                className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Add New Template Card */}
      <Card 
        onClick={onAdd}
        className="bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
      >
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 bg-gray-200 hover:bg-blue-200 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors">
            <Plus className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="font-medium text-gray-700 mb-1">إنشاء قالب جديد</h3>
          <p className="text-gray-500 text-sm">انقر لإضافة قالب رسالة جديد</p>
        </CardContent>
      </Card>
    </div>

    {/* Templates Statistics */}
    <div className="grid grid-cols-3 gap-4 mt-6">
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">{templates.length}</div>
          <div className="text-sm text-gray-500">إجمالي القوالب</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">23</div>
          <div className="text-sm text-gray-500">مرات الاستخدام</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">4.8</div>
          <div className="text-sm text-gray-500">تقييم متوسط</div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const SendMessageDialog = ({ isOpen, onClose, onConfirm }) => {
  const [recipientType, setRecipientType] = useState('students');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sendTime, setSendTime] = useState('now');
  const [selectedRecipients, setSelectedRecipients] = useState(new Set());
  const [selectedClass, setSelectedClass] = useState('all'); // تغيير من '' إلى 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');

  const handleTemplateChange = (templateId) => {
    setSelectedTemplateId(templateId);
    const template = mockTemplates.find(t => t.id === templateId);
    setMessageContent(template ? template.content : '');
  };

  const handleRecipientToggle = (id) => {
    setSelectedRecipients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const recipientList = useMemo(() => {
    let list = [];
    switch(recipientType) {
      case 'students':
        list = (selectedClass && selectedClass !== 'all')
          ? mockStudents.filter(s => s.class === selectedClass)
          : mockStudents;
        break;
      case 'staff':
        list = mockTeachers;
        break;
      default:
        list = [];
    }
    
    // Filter by search term
    if (searchTerm) {
      list = list.filter(item => item.name.includes(searchTerm));
    }
    
    return list;
  }, [recipientType, selectedClass, searchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-0 shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div>
              <span>إرسال رسالة واتساب جديدة</span>
              <DialogDescription className="text-blue-100 text-sm mt-1 font-normal">
                اختر المستلمين وأنشئ رسالتك بكل سهولة
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Recipients */}
            <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow rounded-xl">
              <CardHeader className="border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span>1. تحديد المستلمين</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Recipient Type Selection */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">نوع المستلمين</Label>
                  <Select value={recipientType} onValueChange={(val) => { setRecipientType(val); setSelectedClass(''); setSelectedRecipients(new Set()); }}>
                    <SelectTrigger className="bg-white border-2 border-blue-200 focus:border-blue-500 rounded-lg h-11 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-xl border-2 border-blue-100 rounded-lg">
                      <SelectItem value="students" className="font-medium hover:bg-blue-50">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          الطلاب
                        </div>
                      </SelectItem>
                      <SelectItem value="staff" className="font-medium hover:bg-indigo-50">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-indigo-600" />
                          الموظفين
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Class Filter for Students */}
                {recipientType === 'students' && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">تحديد الصف والفصل</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="bg-white border-2 border-blue-200 focus:border-blue-500 rounded-lg h-11">
                        <SelectValue placeholder="جميع الفصول" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-xl border-2 border-blue-100 rounded-lg">
                        <SelectItem value="all">جميع الفصول</SelectItem>
                        {mockClasses.map(cls => (
                          <SelectItem key={cls} value={cls}>الفصل {cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Search Input */}
                <div className="relative">
                  <Input 
                    placeholder="ابحث عن الاسم..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border-2 border-blue-200 focus:border-blue-500 rounded-lg pr-10 h-11" 
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                </div>
                
                {/* Recipients List */}
                <div className="border-2 border-blue-200 rounded-xl p-3 h-64 overflow-y-auto bg-gradient-to-br from-white to-blue-50 space-y-2 custom-scrollbar">
                  {recipientList.length > 0 ? (
                    recipientList.map(item => (
                      <RecipientItem 
                        key={item.id} 
                        id={item.id} 
                        name={item.name}
                        info={recipientType === 'students' ? item.class : null}
                        isSelected={selectedRecipients.has(item.id)}
                        onToggle={handleRecipientToggle}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Users className="h-12 w-12 mb-2" />
                      <p className="text-sm">لا توجد نتائج</p>
                    </div>
                  )}
                </div>
                
                {/* Selected Count */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between text-white">
                    <span className="font-semibold">عدد المحددين:</span>
                    <Badge className="bg-white text-blue-600 font-bold text-lg px-4 py-1">
                      {selectedRecipients.size}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column: Message Content */}
            <Card className="border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow rounded-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100 p-5 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <span>محتوى الرسالة</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-5 space-y-4">
                {/* Template Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">اختر قالب الرسالة</Label>
                  <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                    <SelectTrigger className="bg-white border-2 border-purple-200 focus:border-purple-500 rounded-lg h-11">
                      <SelectValue placeholder="اختر قالباً جاهزاً أو رسالة مخصصة..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-xl border-2 border-purple-100 rounded-lg max-h-96">
                      {mockTemplates.map(t => (
                        <SelectItem key={t.id} value={t.id} className="hover:bg-purple-50">
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Message Content */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">نص الرسالة</Label>
                  <Textarea 
                    rows={6} 
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="bg-white border-2 border-purple-200 focus:border-purple-500 rounded-lg resize-none font-medium"
                  />
                  
                  {/* Variable Tags */}
                  <div className="flex gap-2 flex-wrap bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                    <span className="text-xs text-gray-600 font-semibold w-full mb-1">إضافة متغيرات:</span>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer bg-white hover:bg-purple-100 hover:text-purple-700 transition-all border border-purple-200 text-xs font-semibold" 
                      onClick={() => setMessageContent(c => c + ' {{student_name}}')}
                    >
                      + اسم الطالب
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer bg-white hover:bg-purple-100 hover:text-purple-700 transition-all border border-purple-200 text-xs font-semibold" 
                      onClick={() => setMessageContent(c => c + ' {{staff_name}}')}
                    >
                      + اسم الموظف
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer bg-white hover:bg-purple-100 hover:text-purple-700 transition-all border border-purple-200 text-xs font-semibold" 
                      onClick={() => setMessageContent(c => c + ' {{date}}')}
                    >
                      + التاريخ
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer bg-white hover:bg-purple-100 hover:text-purple-700 transition-all border border-purple-200 text-xs font-semibold" 
                      onClick={() => setMessageContent(c => c + ' {{history}}')}
                    >
                      + التاريخ الهجري
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer bg-white hover:bg-purple-100 hover:text-purple-700 transition-all border border-purple-200 text-xs font-semibold" 
                      onClick={() => setMessageContent(c => c + ' {{time}}')}
                    >
                      + الوقت
                    </Badge>
                  </div>
                </div>

                {/* Attachments & Links */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1 block">إضافة مرفق</Label>
                    <Button size="sm" variant="outline" className="w-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg">
                      <Paperclip className="ml-2 h-4 w-4" />
                      اختر ملف
                    </Button>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1 block">إضافة رابط</Label>
                    <div className="relative">
                      <Input 
                        placeholder="https://..."
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="bg-white border-2 border-green-200 focus:border-green-500 rounded-lg pr-9 h-9 text-sm"
                      />
                      <Link2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-400" />
                    </div>
                  </div>
                </div>

                {/* Send Time */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    وقت الإرسال
                  </Label>
                  <Select value={sendTime} onValueChange={setSendTime}>
                    <SelectTrigger className="bg-white border-2 border-orange-200 focus:border-orange-500 rounded-lg h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-xl border-2 border-orange-100 rounded-lg">
                      <SelectItem value="now">🚀 إرسال فوري</SelectItem>
                      <SelectItem value="later">⏰ جدولة لوقت لاحق</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Scheduling Options */}
                  {sendTime === 'later' && (
                    <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1 block">التاريخ</Label>
                        <Input 
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="border-2 border-orange-200 focus:border-orange-500 rounded-lg h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1 block">الوقت</Label>
                        <Input 
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="border-2 border-orange-200 focus:border-orange-500 rounded-lg h-9"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Preview */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-inner">
                  <Label className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    معاينة الرسالة
                  </Label>
                  <div className="bg-white rounded-lg p-3 border border-green-300 text-sm text-gray-700 min-h-[80px] max-h-32 overflow-y-auto">
                    {messageContent || <span className="text-gray-400 italic">سيتم عرض محتوى الرسالة هنا...</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Footer */}
        <DialogFooter className="flex justify-end gap-3 p-6 bg-gray-50 border-t-2 border-gray-200 rounded-b-2xl">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="px-8 py-2 border-2 border-gray-300 hover:bg-gray-100 rounded-lg font-semibold"
          >
            إلغاء
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={selectedRecipients.size === 0 || !messageContent}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-2 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="ml-2 h-5 w-5" />
            إرسال الرسالة ({selectedRecipients.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RecipientItem = ({ id, name, info, isSelected, onToggle }) => (
  <div 
    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
      isSelected 
        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-[1.02]' 
        : 'bg-white hover:bg-blue-50 border-2 border-blue-100 hover:border-blue-300'
    }`}
    onClick={() => onToggle(id)}
  >
    <div className="flex items-center flex-1">
      <Checkbox 
        id={`recipient-${id}`} 
        checked={isSelected}
        className={`ml-3 ${isSelected ? 'border-white' : 'border-blue-300'}`}
      />
      <Label htmlFor={`recipient-${id}`} className="flex-1 cursor-pointer font-medium">
        <div className="flex items-center justify-between">
          <span>{name}</span>
          {info && (
            <Badge variant="outline" className={`text-xs mr-2 ${isSelected ? 'bg-white/20 text-white border-white/40' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
              {info}
            </Badge>
          )}
        </div>
      </Label>
    </div>
  </div>
);

// مكون مجموعات الموظفين
const StaffGroupsManager = () => {
  const [groups, setGroups] = useState([
    { id: 1, name: 'الهيئة الإدارية', members: ['أحمد الشمري', 'خالد المالكي'], type: 'admin' },
    { id: 2, name: 'الهيئة التعليمية', members: ['فاطمة الشهري'], type: 'teaching' },
  ]);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState('teaching');

  const handleAddGroup = () => {
    if (newGroupName) {
      setGroups([...groups, { 
        id: Date.now(), 
        name: newGroupName, 
        members: [], 
        type: newGroupType 
      }]);
      setNewGroupName('');
      setIsAddingGroup(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-indigo-200 pb-5">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg ml-3">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">مجموعات الموظفين</h2>
            <p className="text-gray-600">إنشاء وإدارة مجموعات الموظفين</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsAddingGroup(true)} 
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
        >
          <Plus className="ml-2 h-5 w-5" />
          إضافة مجموعة جديدة
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="border-2 border-indigo-100 shadow-lg hover:shadow-xl transition-all rounded-xl">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center ml-3">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{group.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1 bg-indigo-50 text-indigo-700 border-indigo-200">
                        {group.type === 'admin' ? 'إدارية' : 'تعليمية'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 mb-3 border border-indigo-200">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">الأعضاء ({group.members.length}):</p>
                    <div className="space-y-1">
                      {group.members.length > 0 ? (
                        group.members.slice(0, 3).map((member, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-700 bg-white rounded px-2 py-1">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full ml-2"></div>
                            {member}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">لا يوجد أعضاء</p>
                      )}
                      {group.members.length > 3 && (
                        <p className="text-xs text-indigo-600 font-semibold">+{group.members.length - 3} آخرين</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-indigo-100">
                <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded-lg">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Group Dialog */}
      <Dialog open={isAddingGroup} onOpenChange={setIsAddingGroup}>
        <DialogContent className="max-w-xl bg-gradient-to-br from-indigo-50 to-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="border-b-2 border-indigo-200 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              إضافة مجموعة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">اسم المجموعة</Label>
              <Input 
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="مثال: معلمو الرياضيات"
                className="border-2 border-indigo-200 focus:border-indigo-500 rounded-lg h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">نوع المجموعة</Label>
              <Select value={newGroupType} onValueChange={setNewGroupType}>
                <SelectTrigger className="border-2 border-indigo-200 focus:border-indigo-500 rounded-lg h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-xl border-2 border-indigo-100 rounded-lg">
                  <SelectItem value="admin">الهيئة الإدارية</SelectItem>
                  <SelectItem value="teaching">الهيئة التعليمية</SelectItem>
                  <SelectItem value="math">معلمو الرياضيات</SelectItem>
                  <SelectItem value="science">معلمو العلوم</SelectItem>
                  <SelectItem value="arabic">معلمو اللغة العربية</SelectItem>
                  <SelectItem value="english">معلمو اللغة الإنجليزية</SelectItem>
                  <SelectItem value="religion">معلمو التربية الإسلامية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex gap-3 pt-4 border-t-2 border-indigo-100">
            <Button 
              variant="outline" 
              onClick={() => setIsAddingGroup(false)} 
              className="border-2 border-gray-300 hover:bg-gray-100 rounded-lg px-6"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleAddGroup} 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg px-6 font-semibold shadow-lg"
            >
              حفظ المجموعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// مكون مجموعات الطلاب
const StudentGroupsManager = () => {
  const [selectedClass, setSelectedClass] = useState('all'); // تغيير من '' إلى 'all'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-cyan-200 pb-5">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg ml-3">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">مجموعات الطلاب</h2>
            <p className="text-gray-600">عرض وإدارة الصفوف والفصول</p>
          </div>
        </div>
      </div>

      {/* Class Filter */}
      <Card className="bg-gradient-to-r from-cyan-50 via-white to-blue-50 border-2 border-cyan-100 shadow-lg">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Label className="font-semibold text-gray-700">اختر الصف:</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-64 border-2 border-cyan-200 focus:border-cyan-500 rounded-lg">
                <SelectValue placeholder="جميع الفصول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفصول</SelectItem>
                {mockClasses.map(cls => (
                  <SelectItem key={cls} value={cls}>الصف {cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClasses
          .filter(cls => !selectedClass || selectedClass === 'all' || cls === selectedClass)
          .map((cls) => {
            const classStudents = mockStudents.filter(s => s.class === cls);
            return (
              <Card key={cls} className="border-2 border-cyan-100 shadow-lg hover:shadow-xl transition-all rounded-xl">
                <CardContent className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center ml-3">
                      <GraduationCap className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">الفصل {cls}</h3>
                      <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs mt-1">
                        {classStudents.length} طالب
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-3 border border-cyan-200">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">الطلاب:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {classStudents.map((student) => (
                        <div key={student.id} className="flex items-center text-sm text-gray-700 bg-white rounded px-2 py-1">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full ml-2"></div>
                          {student.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-cyan-100">
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold"
                    >
                      <Send className="ml-2 h-4 w-4" />
                      إرسال رسالة للفصل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

// مكون إدارة الاشتراك
const SubscriptionManager = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | 'loading'>('loading');
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [showEmbeddedSignup, setShowEmbeddedSignup] = useState(false);

  // جلب حالة الاشتراك عند تحميل الصفحة
  React.useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setSubscriptionStatus('loading');
      // استدعاء API للتحقق من حالة الاشتراك
      const response = await fetch('/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
        setSubscriptionStatus(data.subscription_status === 'active' ? 'active' : 'inactive');
        setWhatsappConnected(data.whatsapp_connected || false);
      } else {
        setSubscriptionStatus('inactive');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscriptionStatus('inactive');
    }
  };

  const handleSubscribe = async (packageType: string) => {
    try {
      // إنشاء جلسة Stripe Checkout
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ packageType })
      });

      if (response.ok) {
        const { checkoutUrl } = await response.json();
        // توجيه المستخدم لصفحة الدفع
        window.location.href = checkoutUrl;
      } else {
        alert('حدث خطأ أثناء إنشاء جلسة الدفع');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('حدث خطأ في الاتصال');
    }
  };

  const handleEmbeddedSignup = () => {
    // فتح نافذة Meta Embedded Signup
    setShowEmbeddedSignup(true);
    
    // هنا سيتم تكامل Meta's Embedded Signup
    // يجب استخدام Facebook SDK لفتح نافذة الربط
    window.open(
      'https://www.facebook.com/v18.0/dialog/oauth?' +
      'client_id=YOUR_APP_ID&' +
      'redirect_uri=YOUR_REDIRECT_URI&' +
      'config_id=YOUR_CONFIG_ID&' +
      'response_type=code&' +
      'override_default_response_type=true&' +
      'extras={"setup":{"business":{"name":"' + encodeURIComponent('مدرسة متابع') + '"}}}',
      'facebook-login',
      'width=600,height=800'
    );
  };

  // عرض حالة التحميل
  if (subscriptionStatus === 'loading') {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من حالة الاشتراك...</p>
        </div>
      </div>
    );
  }

  // إذا كان الاشتراك نشطاً
  if (subscriptionStatus === 'active') {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-blue-200 pb-5">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg ml-3">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">إدارة الرسائل</h2>
              <p className="text-gray-600">إدارة اتصال واتساب والرسائل</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 border border-green-300 px-4 py-2 text-lg font-bold">
            اشتراك نشط
          </Badge>
        </div>

        {/* Current Balance */}
        <Card className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="mb-2 opacity-90 text-sm">الرصيد الحالي</div>
                <div className="text-4xl font-bold">{subscriptionData?.message_credits || 0}</div>
                <div className="opacity-90 text-sm">رسالة متبقية</div>
              </div>
              <div>
                <div className="mb-2 opacity-90 text-sm">تاريخ الانتهاء</div>
                <div className="text-2xl font-bold">
                  {subscriptionData?.subscription_ends_at 
                    ? new Date(subscriptionData.subscription_ends_at).toLocaleDateString('ar-SA')
                    : 'غير محدد'}
                </div>
              </div>
              <div>
                <div className="mb-2 opacity-90 text-sm">الرسائل المرسلة</div>
                <div className="text-4xl font-bold">{subscriptionData?.messages_sent || 0}</div>
                <div className="opacity-90 text-sm">رسالة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Connection Status */}
        {!whatsappConnected ? (
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
              <CardTitle className="text-lg font-bold text-gray-900">ربط رقم واتساب</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                <Smartphone className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">قم بربط رقم واتساب الخاص بمدرستك</h3>
                <p className="text-gray-600 mb-6">
                  لبدء إرسال الرسائل، يجب ربط رقم واتساب الأعمال الخاص بمدرستك
                </p>
                <Button 
                  onClick={handleEmbeddedSignup}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg"
                >
                  <Link2 className="ml-2 h-5 w-5" />
                  ربط رقم واتساب
                </Button>
              </div>
              
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-yellow-900 mb-2">ملاحظات هامة:</h4>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>ستحتاج إلى حساب Facebook Business</li>
                  <li>يجب أن يكون لديك رقم هاتف لم يتم استخدامه في واتساب من قبل</li>
                  <li>عملية الربط آمنة تماماً عبر Meta</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-green-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-100">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
                <span>حالة اتصال واتساب</span>
                <Badge className="bg-green-500 text-white">متصل</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">رقم الواتساب المربوط</p>
                  <p className="text-gray-600">{subscriptionData?.whatsapp_phone_number || '+966xxxxxxxxx'}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  إلغاء الربط
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Renew Subscription */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">تجديد أو زيادة الرصيد</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { messages: 1000, price: 100, popular: false },
              { messages: 5000, price: 400, popular: true },
              { messages: 10000, price: 700, popular: false },
            ].map((pkg) => (
              <Card key={pkg.messages} className={`border-2 ${pkg.popular ? 'border-blue-400 shadow-xl scale-105' : 'border-blue-100 shadow-lg'} transition-all hover:shadow-2xl`}>
                {pkg.popular && (
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-center py-2 font-bold text-sm rounded-t-lg">
                    الأكثر شعبية
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{pkg.messages.toLocaleString()}</div>
                  <div className="text-gray-600 mb-4">رسالة</div>
                  <div className="text-3xl font-bold text-blue-600 mb-6">{pkg.price} ريال</div>
                  <Button 
                    onClick={() => handleSubscribe(`package_${pkg.messages}`)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-bold shadow-lg"
                  >
                    شراء الآن
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // إذا كان الاشتراك غير نشط - عرض الباقات
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-blue-200 pb-5">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg ml-3">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة الرسائل</h2>
            <p className="text-gray-600">اشترك لبدء إرسال رسائل واتساب</p>
          </div>
        </div>
        <Badge className="bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 text-lg font-bold">
          غير مشترك
        </Badge>
      </div>

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-20 w-20 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">ابدأ بإرسال رسائل واتساب لمدرستك</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            اشترك الآن في إحدى باقات الرسائل لتتمكن من إرسال رسائل واتساب تلقائية لأولياء الأمور والموظفين. 
            بعد الاشتراك سيتم تفعيل حسابك فوراً ويمكنك البدء بربط رقم واتساب مدرستك.
          </p>
        </CardContent>
      </Card>

      {/* Available Packages */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">اختر الباقة المناسبة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              messages: 1000, 
              price: 100, 
              popular: false,
              features: ['1000 رسالة', 'صالحة لمدة 3 أشهر', 'دعم فني', 'قوالب جاهزة']
            },
            { 
              messages: 5000, 
              price: 400, 
              popular: true,
              features: ['5000 رسالة', 'صالحة لمدة 6 أشهر', 'دعم فني مميز', 'قوالب جاهزة', 'تقارير مفصلة']
            },
            { 
              messages: 10000, 
              price: 700, 
              popular: false,
              features: ['10000 رسالة', 'صالحة لمدة سنة', 'دعم فني على مدار الساعة', 'قوالب جاهزة', 'تقارير مفصلة', 'أولوية في الإرسال']
            },
          ].map((pkg) => (
            <Card key={pkg.messages} className={`border-2 ${pkg.popular ? 'border-blue-400 shadow-xl scale-105' : 'border-blue-100 shadow-lg'} transition-all hover:shadow-2xl`}>
              {pkg.popular && (
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-center py-2 font-bold text-sm rounded-t-lg">
                  الأكثر شعبية ⭐
                </div>
              )}
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{pkg.messages.toLocaleString()}</div>
                  <div className="text-gray-600 mb-4">رسالة</div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{pkg.price} ريال</div>
                  <div className="text-sm text-gray-500">{(pkg.price / pkg.messages * 1000).toFixed(2)} ريال لكل 1000 رسالة</div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center ml-2">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handleSubscribe(`package_${pkg.messages}`)}
                  className={`w-full ${pkg.popular 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' 
                    : 'bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500'
                  } text-white rounded-lg font-bold shadow-lg py-3`}
                >
                  اشترك الآن
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it works */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
          <CardTitle className="text-lg font-bold text-gray-900">كيف يعمل النظام؟</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">اختر الباقة</h4>
              <p className="text-sm text-gray-600">اختر الباقة المناسبة وأتمم عملية الدفع بشكل آمن</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">التفعيل التلقائي</h4>
              <p className="text-sm text-gray-600">سيتم تفعيل اشتراكك فوراً بعد إتمام الدفع</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">ابدأ الإرسال</h4>
              <p className="text-sm text-gray-600">اربط رقم واتساب وابدأ بإرسال الرسائل مباشرة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppMessagingPage;
