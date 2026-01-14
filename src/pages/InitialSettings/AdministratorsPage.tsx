import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Upload, 
  FileDown, 
  Printer, 
  UserPlus, 
  Trash2, 
  Search, 
  CheckCircle, 
  X as XIcon, 
  SortAsc, 
  AlertTriangle, 
  Edit2, 
  XCircle
} from 'lucide-react';

interface Administrator {
  id: string;
  name: string;
  phone: string;
  position: string;
  viceAttributes?: string[];
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const POSITIONS = ['وكيل', 'موجه', 'رائد نشاط', 'محضر مختبر', 'مساعد إداري', 'آخر'];
const VICE_ATTRIBUTES = ['الشؤون التعليمية', 'شؤون الطلاب', 'الشؤون المدرسية'];

const AdministratorsPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdminNames, setSelectedAdminNames] = useState<string[]>([]);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newAdminsCount, setNewAdminsCount] = useState(1);
  const [newAdministrators, setNewAdministrators] = useState<Omit<Administrator, 'id'>[]>([
    { name: '', phone: '', position: '', viceAttributes: [] }
  ]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [administratorToDelete, setAdministratorToDelete] = useState<Administrator | null>(null);
  const [showDeleteSingleDialog, setShowDeleteSingleDialog] = useState(false);

  // دالة عرض الإشعارات
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // فلترة وترتيب البيانات
  const filteredAdministrators = React.useMemo(() => {
    let filtered = administrators;
    
    // البحث النصي
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(query) || 
        a.phone.toLowerCase().includes(query)
      );
    }
    
    // فلتر الأسماء المحددة
    if (selectedAdminNames.length > 0) {
      filtered = filtered.filter(a => selectedAdminNames.includes(a.name));
    }
    
    // الترتيب الأبجدي
    if (sortAlphabetically) {
      filtered = [...filtered].sort((a, b) => new Intl.Collator('ar').compare(a.name, b.name));
    }
    
    return filtered;
  }, [administrators, searchTerm, selectedAdminNames, sortAlphabetically]);

  // تصدير Excel
  const handleExportExcel = () => {
    if (administrators.length === 0) {
      showToast('لا توجد بيانات لتصديرها', 'error');
      return;
    }

    const exportData = filteredAdministrators.map((admin, index) => ({
      '#': index + 1,
      'اسم الإداري': admin.name,
      'رقم الجوال': admin.phone,
      'المسمى الوظيفي': admin.position,
      'الصفة': admin.viceAttributes?.join(' - ') || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الإداريين');
    
    const wscols = [
      { wch: 5 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 }
    ];
    ws['!cols'] = wscols;

    XLSX.writeFile(wb, `بيانات_الإداريين_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    showToast('تم تصدير البيانات بنجاح', 'success');
  };

  // طباعة PDF
  const handlePrintPDF = () => {
    if (administrators.length === 0) {
      showToast('لا توجد بيانات للطباعة', 'error');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>بيانات الإداريين</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Noto Kufi Arabic', sans-serif;
            padding: 20px;
            direction: rtl;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 15px;
          }
          .header h1 {
            color: #4f46e5;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header p {
            color: #6b7280;
            font-size: 14px;
          }
          .stats {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 8px;
          }
          .stat-item {
            text-align: center;
          }
          .stat-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #4f46e5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: linear-gradient(to right, #4f46e5, #6366f1);
            color: white;
            padding: 12px 8px;
            text-align: center;
            font-weight: 600;
            font-size: 14px;
          }
          td {
            padding: 10px 8px;
            text-align: center;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          @media print {
            body { padding: 10px; }
            .header h1 { font-size: 24px; }
            th, td { padding: 8px 5px; font-size: 12px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 بيانات الإداريين</h1>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}</p>
        </div>
        
        <div class="stats">
          <div class="stat-item">
            <div class="stat-label">إجمالي الإداريين</div>
            <div class="stat-value">${filteredAdministrators.length}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>اسم الإداري</th>
              <th>رقم الجوال</th>
              <th>المسمى الوظيفي</th>
              <th>الصفة</th>
            </tr>
          </thead>
          <tbody>
            ${filteredAdministrators.map((admin, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${admin.name}</td>
                <td dir="ltr">${admin.phone}</td>
                <td>${admin.position}</td>
                <td>${admin.viceAttributes?.join(' - ') || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);

    showToast('تم فتح نافذة الطباعة', 'success');
  };

  // فتح لوحة الإضافة
  const openAddPanel = () => {
    setNewAdminsCount(1);
    setNewAdministrators([{ name: '', phone: '', position: '', viceAttributes: [] }]);
    setShowAddPanel(true);
  };

  // إضافة الإداريين الجدد
  const handleAddAdministrators = () => {
    const validAdmins = newAdministrators.filter(admin => admin.name.trim() && admin.position);
    
    if (validAdmins.length === 0) {
      showToast('يجب إدخال اسم ومسمى وظيفي لإداري واحد على الأقل', 'error');
      return;
    }

    const adminsToAdd: Administrator[] = validAdmins.map(admin => ({
      id: `admin_${Date.now()}_${Math.random()}`,
      name: admin.name,
      phone: admin.phone,
      position: admin.position,
      viceAttributes: admin.viceAttributes
    }));

    setAdministrators(prev => [...prev, ...adminsToAdd]);
    setShowAddPanel(false);
    showToast(`تم إضافة ${adminsToAdd.length} إداري بنجاح`, 'success');
  };

  // حذف إداري واحد
  const handleDeleteAdministrator = (id: string) => {
    const admin = administrators.find(a => a.id === id);
    if (admin) {
      setAdministratorToDelete(admin);
      setShowDeleteSingleDialog(true);
    }
  };

  const confirmDeleteSingleAdministrator = () => {
    if (administratorToDelete) {
      setAdministrators(prev => prev.filter(a => a.id !== administratorToDelete.id));
      showToast('تم حذف الإداري بنجاح', 'success');
      setShowDeleteSingleDialog(false);
      setAdministratorToDelete(null);
    }
  };

  // حذف الكل
  const handleDeleteAll = () => {
    if (administrators.length === 0) {
      showToast('لا توجد بيانات للحذف', 'info');
      return;
    }
    setShowDeleteDialog(true);
  };

  const confirmDeleteAll = () => {
    setAdministrators([]);
    setShowDeleteDialog(false);
    showToast('تم حذف جميع البيانات بنجاح', 'success');
  };

  // الأسماء الفريدة للفلتر
  const uniqueAdminNames = React.useMemo(() => {
    return Array.from(new Set(administrators.map(a => a.name)));
  }, [administrators]);

  return (
    <div className="pt-1 pb-4 px-4 md:pb-6 md:px-6 max-w-[1600px] mx-auto space-y-4 md:space-y-6">
      {/* رأس الصفحة */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">إدارة الإداريين</h1>
          </div>
        </div>
      </div>

      {/* شريط الأزرار */}
      <Card className="shadow-md border-gray-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
            <Button 
              className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] hover:from-[#4f46e5] hover:to-[#6366f1] text-white shadow-md h-auto py-3" 
              onClick={handleExportExcel}
            >
              <FileDown className="w-4 h-4 ml-2" />
              <span className="text-sm">تصدير Excel</span>
            </Button>
            
            <Button 
              className="bg-gradient-to-r from-[#818cf8] to-[#a5b4fc] hover:from-[#6366f1] hover:to-[#818cf8] text-white shadow-md h-auto py-3" 
              onClick={handlePrintPDF}
            >
              <Printer className="w-4 h-4 ml-2" />
              <span className="text-sm">طباعة PDF</span>
            </Button>
            
            <Button 
              className="bg-gradient-to-r from-[#818cf8] to-[#a5b4fc] hover:from-[#6366f1] hover:to-[#818cf8] text-white shadow-md h-auto py-3" 
              onClick={openAddPanel}
            >
              <UserPlus className="w-4 h-4 ml-2" />
              <span className="text-sm">إضافة إداري</span>
            </Button>
            
            <Button 
              className={`${isEditMode ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'} text-white shadow-md h-auto py-3`}
              onClick={() => {
                setIsEditMode(!isEditMode);
                if (isEditMode) {
                  showToast('تم حفظ التعديلات', 'success');
                }
              }}
            >
              <Edit2 className="w-4 h-4 ml-2" />
              <span className="text-sm">{isEditMode ? 'حفظ التعديل' : 'تعديل البيانات'}</span>
            </Button>
            
            <Button 
              variant="destructive" 
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md h-auto py-3 col-span-2 md:col-span-1" 
              onClick={handleDeleteAll}
            >
              <Trash2 className="w-4 h-4 ml-2" />
              <span className="text-sm">حذف الكل</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* لوحة إضافة إداريين جدد */}
      {showAddPanel && (
        <Card className="shadow-lg border-2 border-[#818cf8]">
          <CardHeader className="bg-gradient-to-r from-[#818cf8] to-[#a5b4fc] text-white">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                إضافة إداريين جدد
              </span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20" 
                onClick={() => setShowAddPanel(false)}
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="mb-4">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">عدد الإداريين المراد إضافتهم</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={newAdminsCount}
                onChange={(e) => {
                  const count = Math.max(1, Math.min(20, Number(e.target.value)));
                  setNewAdminsCount(count);
                  setNewAdministrators(Array(count).fill(null).map(() => ({
                    name: '', phone: '', position: '', viceAttributes: []
                  })));
                }}
                className="w-full md:w-48 border-gray-300"
              />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {newAdministrators.map((admin, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="md:col-span-12 text-sm font-semibold text-[#4f46e5] mb-1">
                    إداري #{index + 1}
                  </div>
                  
                  <div className="md:col-span-4">
                    <Label className="text-xs text-gray-600 mb-1 block">اسم الإداري *</Label>
                    <Input
                      value={admin.name}
                      onChange={(e) => {
                        const updated = [...newAdministrators];
                        updated[index].name = e.target.value;
                        setNewAdministrators(updated);
                      }}
                      placeholder="أدخل اسم الإداري"
                      className="border-gray-300 h-9"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <Label className="text-xs text-gray-600 mb-1 block">المسمى الوظيفي *</Label>
                    <Select
                      value={admin.position}
                      onValueChange={(value) => {
                        const updated = [...newAdministrators];
                        updated[index].position = value;
                        if (value !== 'وكيل') {
                          updated[index].viceAttributes = [];
                        }
                        setNewAdministrators(updated);
                      }}
                    >
                      <SelectTrigger className="border-gray-300 h-10 bg-white">
                        <SelectValue placeholder="اختر المسمى..." />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map(pos => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-3">
                    <Label className="text-xs text-gray-600 mb-1 block">رقم الجوال</Label>
                    <Input
                      value={admin.phone}
                      onChange={(e) => {
                        const updated = [...newAdministrators];
                        updated[index].phone = e.target.value;
                        setNewAdministrators(updated);
                      }}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                      className="border-gray-300 h-9"
                    />
                  </div>

                  {admin.position === 'وكيل' && (
                    <div className="md:col-span-12">
                      <Label className="text-xs text-gray-600 mb-2 block">صفة الوكيل (يمكن اختيار أكثر من صفة)</Label>
                      <div className="flex flex-wrap gap-3">
                        {VICE_ATTRIBUTES.map(attr => (
                          <label key={attr} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                            <Checkbox
                              checked={admin.viceAttributes?.includes(attr) || false}
                              onCheckedChange={(checked) => {
                                const updated = [...newAdministrators];
                                if (checked) {
                                  updated[index].viceAttributes = [...(updated[index].viceAttributes || []), attr];
                                } else {
                                  updated[index].viceAttributes = (updated[index].viceAttributes || []).filter(a => a !== attr);
                                }
                                setNewAdministrators(updated);
                              }}
                              className="rounded border-gray-300 text-[#4f46e5]"
                            />
                            <span className="text-sm text-gray-700">{attr}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddAdministrators}
                className="flex-1 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5]"
              >
                <UserPlus className="w-4 h-4 ml-2" />
                حفظ وإضافة الإداريين
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddPanel(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* شريط البحث والفلترة */}
      <Card className="shadow-md border-gray-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="البحث عن إداري (الاسم، الجوال)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 border-gray-300 h-11"
              />
            </div>

            <div>
              <Select
                value={selectedAdminNames.length > 0 ? selectedAdminNames[0] : ''}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setSelectedAdminNames([]);
                  } else {
                    setSelectedAdminNames([value]);
                  }
                }}
              >
                <SelectTrigger className="border-gray-300 h-11">
                  <SelectValue placeholder="تحديد الإداريين..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">عرض الكل</SelectItem>
                  {uniqueAdminNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* شريط الترتيب والإحصائيات */}
      {administrators.length > 0 && (
        <Card className="shadow-md border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={sortAlphabetically ? "default" : "outline"}
                  className={sortAlphabetically ? "bg-[#4f46e5] hover:bg-[#4338ca]" : ""}
                  onClick={() => setSortAlphabetically(!sortAlphabetically)}
                >
                  <SortAsc className="w-4 h-4 ml-2" />
                  ترتيب أبجدي
                </Button>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <Users className="h-5 w-5 text-blue-600" />
                <div className="text-sm">
                  <span className="font-bold text-blue-900">{filteredAdministrators.length}</span>
                  <span className="text-blue-700"> من </span>
                  <span className="font-bold text-blue-900">{administrators.length}</span>
                  <span className="text-blue-700"> إداري</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* مربع حوار حذف الكل */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full shadow-2xl border-2 border-red-500 animate-in fade-in zoom-in duration-200">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <span>تحذير: حذف جميع البيانات</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold mb-2">⚠️ تنبيه مهم!</p>
                  <p className="text-red-700 text-sm">
                    أنت على وشك حذف <span className="font-bold text-red-900">{administrators.length} إداري</span> من النظام.
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>هذا الإجراء لا يمكن التراجع عنه</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>سيتم حذف جميع البيانات نهائياً</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>لن تتمكن من استرجاع المعلومات</span>
                    </li>
                  </ul>
                </div>

                <p className="text-center text-gray-600 font-semibold">
                  هل أنت متأكد 100% من المتابعة؟
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={confirmDeleteAll}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  نعم، احذف الكل
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 border-gray-300 hover:bg-gray-100"
                >
                  <XCircle className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* مربع حوار حذف إداري واحد */}
      {showDeleteSingleDialog && administratorToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full shadow-2xl border-2 border-red-500 animate-in fade-in zoom-in duration-200">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Trash2 className="h-6 w-6" />
                </div>
                <span>تأكيد حذف الإداري</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold mb-2">⚠️ تحذير</p>
                  <p className="text-red-700 text-sm">
                    هل أنت متأكد من حذف الإداري: <span className="font-bold text-red-900">{administratorToDelete.name}</span>؟
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الاسم:</span>
                      <span className="font-semibold">{administratorToDelete.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المسمى الوظيفي:</span>
                      <span className="font-semibold">{administratorToDelete.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الجوال:</span>
                      <span className="font-semibold" dir="ltr">{administratorToDelete.phone}</span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-gray-600 font-medium text-sm">
                  هذا الإجراء لا يمكن التراجع عنه
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={confirmDeleteSingleAdministrator}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  نعم، احذف
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteSingleDialog(false);
                    setAdministratorToDelete(null);
                  }}
                  className="flex-1 border-gray-300 hover:bg-gray-100"
                >
                  <XCircle className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* الجدول أو رسالة فارغة */}
      {administrators.length > 0 ? (
        <Card className="shadow-md border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <Users className="h-5 w-5 text-[#4f46e5]" />
              <span>بيانات الإداريين</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white sticky top-0">
                  <tr>
                    <th className="p-3 text-center w-12">#</th>
                    <th className="p-3 text-right w-[200px]">اسم الإداري</th>
                    <th className="p-3 text-center w-[150px]">المسمى الوظيفي</th>
                    <th className="p-3 text-center w-[200px]">الصفة</th>
                    <th className="p-3 text-right w-[130px]">رقم الجوال</th>
                    <th className="p-3 text-center w-24">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdministrators.map((admin, index) => (
                    <tr key={admin.id} className="border-b hover:bg-blue-50 transition-colors">
                      <td className="p-3 text-sm text-gray-600 font-semibold text-center">{index + 1}</td>
                      <td className="p-3">
                        {isEditMode ? (
                          <Input 
                            value={admin.name} 
                            onChange={(e) => setAdministrators(administrators.map(a => 
                              a.id === admin.id ? {...a, name: e.target.value} : a
                            ))} 
                            className="h-9 border-gray-300 font-medium" 
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">{admin.name}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {isEditMode ? (
                          <Select 
                            value={admin.position} 
                            onValueChange={(value) => setAdministrators(administrators.map(a => 
                              a.id === admin.id ? {...a, position: value, viceAttributes: value !== 'وكيل' ? [] : a.viceAttributes} : a
                            ))}
                          >
                            <SelectTrigger className="h-9 border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {POSITIONS.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className="bg-[#6366f1] hover:bg-[#4f46e5]">{admin.position}</Badge>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {admin.position === 'وكيل' ? (
                          <span className="text-sm text-gray-700">
                            {admin.viceAttributes && admin.viceAttributes.length > 0 
                              ? admin.viceAttributes.join(' - ') 
                              : '-'}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditMode ? (
                          <Input 
                            value={admin.phone} 
                            onChange={(e) => setAdministrators(administrators.map(a => 
                              a.id === admin.id ? {...a, phone: e.target.value} : a
                            ))} 
                            className="h-9 border-gray-300" 
                            dir="ltr" 
                          />
                        ) : (
                          <span className="text-sm text-gray-700" dir="ltr">{admin.phone}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center">
                          <Button 
                            size="sm" 
                            onClick={() => handleDeleteAdministrator(admin.id)} 
                            variant="ghost" 
                            className="hover:bg-red-50 h-10 w-10 p-0" 
                            title="حذف الإداري"
                          >
                            <Trash2 className="h-6 w-6 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md border-gray-200">
          <CardContent className="p-12 text-center">
            <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">لا توجد بيانات إداريين</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة إداريين جدد</p>
            <Button
              onClick={openAddPanel}
              className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5]"
            >
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة إداري جديد
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 min-w-[320px] max-w-md">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl
              transform transition-all duration-300 animate-in slide-in-from-top-5
              ${toast.type === 'success' ? 'bg-green-600 text-white' : 
                toast.type === 'error' ? 'bg-red-600 text-white' : 
                'bg-blue-600 text-white'}
            `}
          >
            {toast.type === 'success' && <CheckCircle className="h-6 w-6 flex-shrink-0" />}
            {toast.type === 'error' && <XCircle className="h-6 w-6 flex-shrink-0" />}
            {toast.type === 'info' && <AlertTriangle className="h-6 w-6 flex-shrink-0" />}
            <span className="font-medium text-base">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdministratorsPage;
