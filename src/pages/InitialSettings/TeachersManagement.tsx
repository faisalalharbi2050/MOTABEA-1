import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import * as XLSX from 'xlsx';
import { Users, Upload, FileDown, Printer, UserPlus, Trash2, Search, CheckCircle, X as XIcon, BookOpen, SortAsc, ArrowUpDown, AlertTriangle, Settings, Edit2, Save, XCircle, Check, ChevronDown, Filter } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  classQuota: number;
  waitingQuota: number;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const SPECIALIZATIONS = ['دين', 'عربي', 'رياضيات', 'علوم', 'انجليزي', 'الاجتماعيات', 'الحاسب', 'الفنية', 'البدنية', 'كيمياء', 'أحياء', 'فيزياء', 'علوم إدارية', 'تربية فكرية', 'صعوبات تعلم', 'توحد'];

const TeachersManagement: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [sortBySpecialization, setSortBySpecialization] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showBulkEditPanel, setShowBulkEditPanel] = useState(false);
  const [newTeachersCount, setNewTeachersCount] = useState(1);
  const [newTeachers, setNewTeachers] = useState<Omit<Teacher, 'id'>[]>([{ name: '', phone: '', specialization: '', classQuota: 0, waitingQuota: 0 }]);
  const [bulkEditField, setBulkEditField] = useState<'specialization' | 'phone' | 'classQuota' | 'waitingQuota'>('specialization');
  const [bulkEditValue, setBulkEditValue] = useState<string>('');
  const [selectedTeacherNames, setSelectedTeacherNames] = useState<string[]>([]);
  const [showTeacherFilter, setShowTeacherFilter] = useState(false);
  const [customSpecializationOrder, setCustomSpecializationOrder] = useState<string[]>([]);
  const [showSpecOrderDialog, setShowSpecOrderDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);
  const specDropdownRef = useRef<HTMLDivElement>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [showDeleteSingleDialog, setShowDeleteSingleDialog] = useState(false);

  // دالة عرض الإشعارات
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (specDropdownRef.current && !specDropdownRef.current.contains(event.target as Node)) {
        setShowSpecDropdown(false);
      }
    };

    if (showSpecDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSpecDropdown]);

  const filteredTeachers = React.useMemo(() => {
    let filtered = teachers;
    
    // تطبيق البحث النصي
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.phone.toLowerCase().includes(query) || 
        t.specialization.toLowerCase().includes(query)
      );
    }
    
    // تطبيق الفلتر حسب التخصص (يدعم أكثر من تخصص)
    if (selectedSpecialization.length > 0) {
      filtered = filtered.filter(t => selectedSpecialization.includes(t.specialization));
    }
    
    // تطبيق فلتر أسماء المعلمين المحددة
    if (selectedTeacherNames.length > 0) {
      filtered = filtered.filter(t => selectedTeacherNames.includes(t.name));
    }
    
    // تطبيق الترتيب الأبجدي
    if (sortAlphabetically) {
      filtered = [...filtered].sort((a, b) => new Intl.Collator('ar').compare(a.name, b.name));
    }
    
    // تطبيق الترتيب حسب التخصص
    if (sortBySpecialization && customSpecializationOrder.length > 0) {
      filtered = [...filtered].sort((a, b) => {
        const indexA = customSpecializationOrder.indexOf(a.specialization);
        const indexB = customSpecializationOrder.indexOf(b.specialization);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
    
    return filtered;
  }, [teachers, searchTerm, selectedSpecialization, selectedTeacherNames, sortAlphabetically, sortBySpecialization, customSpecializationOrder]);

  const handleImportExcel = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const importedTeachers: Teacher[] = jsonData.map((row: any, index) => ({
          id: `teacher_${Date.now()}_${index}`,
          name: row['اسم المعلم'] || row['name'] || '',
          phone: row['رقم الجوال'] || row['phone'] || '',
          specialization: row['التخصص'] || row['specialization'] || '',
          classQuota: Number(row['نصاب الحصص'] || row['classQuota'] || 0),
          waitingQuota: Number(row['نصاب الانتظار'] || row['waitingQuota'] || 0)
        }));
        setTeachers(importedTeachers);
        alert(`تم استيراد ${importedTeachers.length} معلم بنجاح`);
      } catch (error) {
        alert('حدث خطأ أثناء استيراد الملف');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    if (teachers.length === 0) {
      alert('لا توجد بيانات لتصديرها');
      return;
    }

    const exportData = filteredTeachers.map((teacher, index) => ({
      '#': index + 1,
      'اسم المعلم': teacher.name,
      'رقم الجوال': teacher.phone,
      'التخصص': teacher.specialization,
      'نصاب الحصص': teacher.classQuota,
      'نصاب الانتظار': teacher.waitingQuota,
      'المجموع': teacher.classQuota + teacher.waitingQuota
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المعلمين');
    
    // تنسيق العرض
    const wscols = [
      { wch: 5 },  // #
      { wch: 25 }, // الاسم
      { wch: 15 }, // الجوال
      { wch: 15 }, // التخصص
      { wch: 12 }, // نصاب الحصص
      { wch: 12 }, // نصاب الانتظار
      { wch: 10 }  // المجموع
    ];
    ws['!cols'] = wscols;

    XLSX.writeFile(wb, `بيانات_المعلمين_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
  };

  const handlePrintPDF = () => {
    if (teachers.length === 0) {
      alert('لا توجد بيانات للطباعة');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>بيانات المعلمين</title>
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
            justify-content: space-around;
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
          .total-over {
            color: #dc2626;
            font-weight: bold;
          }
          .total-exact {
            color: #eab308;
            font-weight: bold;
          }
          .total-normal {
            color: #16a34a;
            font-weight: bold;
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
          <h1>📋 بيانات المعلمين</h1>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}</p>
        </div>
        
        <div class="stats">
          <div class="stat-item">
            <div class="stat-label">إجمالي المعلمين</div>
            <div class="stat-value">${filteredTeachers.length}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">إجمالي الحصص</div>
            <div class="stat-value">${filteredTeachers.reduce((sum, t) => sum + t.classQuota, 0)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">إجمالي الانتظار</div>
            <div class="stat-value">${filteredTeachers.reduce((sum, t) => sum + t.waitingQuota, 0)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 25%;">اسم المعلم</th>
              <th style="width: 15%;">رقم الجوال</th>
              <th style="width: 15%;">التخصص</th>
              <th style="width: 12%;">نصاب الحصص</th>
              <th style="width: 13%;">نصاب الانتظار</th>
              <th style="width: 10%;">المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTeachers.map((teacher, index) => {
              const total = teacher.classQuota + teacher.waitingQuota;
              const totalClass = total > 24 ? 'total-over' : total === 24 ? 'total-exact' : 'total-normal';
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${teacher.name}</td>
                  <td>${teacher.phone}</td>
                  <td>${teacher.specialization}</td>
                  <td>${teacher.classQuota}</td>
                  <td>${teacher.waitingQuota}</td>
                  <td class="${totalClass}">${total}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleAddTeachers = () => {
    const validTeachers = newTeachers.filter(t => t.name.trim() !== '');
    if (validTeachers.length === 0) {
      showToast('يرجى إدخال اسم معلم واحد على الأقل', 'error');
      return;
    }

    const teachersToAdd: Teacher[] = validTeachers.map((teacher, index) => ({
      ...teacher,
      id: `teacher_${Date.now()}_${index}`
    }));

    setTeachers([...teachers, ...teachersToAdd]);
    setNewTeachers([{ name: '', phone: '', specialization: '', classQuota: 0, waitingQuota: 0 }]);
    setNewTeachersCount(1);
    setShowAddPanel(false);
    showToast(`تم إضافة ${teachersToAdd.length} معلم بنجاح`, 'success');
  };

  const handleDeleteAll = () => {
    if (teachers.length === 0) {
      alert('لا توجد بيانات لحذفها');
      return;
    }
    setShowDeleteDialog(true);
  };

  const confirmDeleteAll = () => {
    setTeachers([]);
    setSelectedTeacherIds([]);
    setSelectedTeacherNames([]);
    setShowDeleteDialog(false);
    alert('✅ تم حذف جميع المعلمين بنجاح');
  };

  const handleBulkEdit = () => {
    if (selectedTeacherIds.length === 0) {
      alert('يرجى تحديد معلم واحد على الأقل');
      return;
    }

    if (!bulkEditValue.trim()) {
      alert('يرجى إدخال قيمة للتعديل');
      return;
    }

    const updatedTeachers = teachers.map(teacher => {
      if (selectedTeacherIds.includes(teacher.id)) {
        if (bulkEditField === 'specialization') {
          return { ...teacher, specialization: bulkEditValue };
        } else if (bulkEditField === 'phone') {
          return { ...teacher, phone: bulkEditValue };
        } else if (bulkEditField === 'classQuota') {
          return { ...teacher, classQuota: Number(bulkEditValue) || 0 };
        } else if (bulkEditField === 'waitingQuota') {
          return { ...teacher, waitingQuota: Number(bulkEditValue) || 0 };
        }
      }
      return teacher;
    });

    setTeachers(updatedTeachers);
    setShowBulkEditPanel(false);
    setSelectedTeacherIds([]);
    setBulkEditValue('');
    alert(`تم تعديل ${selectedTeacherIds.length} معلم بنجاح`);
  };

  const toggleTeacherSelection = (id: string) => {
    setSelectedTeacherIds(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTeacherIds.length === filteredTeachers.length) {
      setSelectedTeacherIds([]);
    } else {
      setSelectedTeacherIds(filteredTeachers.map(t => t.id));
    }
  };

  const handleDeleteTeacher = (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    if (!teacher) return;

    setTeacherToDelete(teacher);
    setShowDeleteSingleDialog(true);
  };

  const confirmDeleteSingleTeacher = () => {
    if (!teacherToDelete) return;
    
    setTeachers(teachers.filter(t => t.id !== teacherToDelete.id));
    setSelectedTeacherIds(selectedTeacherIds.filter(tid => tid !== teacherToDelete.id));
    setShowDeleteSingleDialog(false);
    setTeacherToDelete(null);
    showToast('تم حذف المعلم بنجاح', 'success');
  };

  const handleSaveSpecOrder = () => {
    setSortBySpecialization(true);
    setShowSpecOrderDialog(false);
    alert('تم حفظ ترتيب التخصصات بنجاح');
  };

  const uniqueTeacherNames = React.useMemo(() => 
    Array.from(new Set(teachers.map(t => t.name).filter(n => n))).sort((a, b) => 
      new Intl.Collator('ar').compare(a, b)
    ), [teachers]
  );

  const uniqueSpecializations = React.useMemo(() => 
    Array.from(new Set(teachers.map(t => t.specialization).filter(s => s))), [teachers]
  );

  // إغلاق القائمة المنسدلة عند النقر خارجها
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTeacherFilter) {
        const target = event.target as HTMLElement;
        if (!target.closest('.teacher-filter-dropdown')) {
          setShowTeacherFilter(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTeacherFilter]);

  const openAddPanel = () => {
    setShowAddPanel(!showAddPanel);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 md:space-y-6">
      {/* رأس الصفحة */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">إدارة المعلمين</h1>
          </div>
        </div>
      </div>

      {/* بطاقة الأزرار */}
      <Card className="shadow-md border-gray-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
            <Button className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3" onClick={handleImportExcel}>
              <Upload className="w-4 h-4 ml-2" />
              <span className="text-sm">استيراد Excel</span>
            </Button>
            
            <Button className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3" onClick={handleExportExcel}>
              <FileDown className="w-4 h-4 ml-2" />
              <span className="text-sm">تصدير Excel</span>
            </Button>
            
            <Button className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3" onClick={handlePrintPDF}>
              <Printer className="w-4 h-4 ml-2" />
              <span className="text-sm">طباعة PDF</span>
            </Button>
            
            <Button className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md h-auto py-3" onClick={openAddPanel}>
              <UserPlus className="w-4 h-4 ml-2" />
              <span className="text-sm">إضافة معلم</span>
            </Button>
            
            <Button 
              className={`${isEditMode ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'} text-white shadow-md h-auto py-3`}
              onClick={() => setIsEditMode(!isEditMode)}
            >
              <Edit2 className="w-4 h-4 ml-2" />
              <span className="text-sm">{isEditMode ? 'حفظ التعديل' : 'تعديل البيانات'}</span>
            </Button>
            
            <Button variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md h-auto py-3 col-span-2 md:col-span-1" onClick={handleDeleteAll}>
              <Trash2 className="w-4 h-4 ml-2" />
              <span className="text-sm">حذف الكل</span>
            </Button>
          </div>
        </CardContent>
      </Card>      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />

      {/* لوحة إضافة معلمين جدد */}
      {showAddPanel && (
        <Card className="shadow-lg border-2 border-[#818cf8]">
          <CardHeader className="bg-gradient-to-r from-[#818cf8] to-[#a5b4fc] text-white">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                إضافة معلمين جدد
              </span>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowAddPanel(false)}>
                <XIcon className="h-5 w-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="mb-4">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">عدد المعلمين المراد إضافتهم</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={newTeachersCount}
                onChange={(e) => {
                  const count = Math.max(1, Math.min(50, Number(e.target.value)));
                  setNewTeachersCount(count);
                  setNewTeachers(Array(count).fill(null).map(() => ({
                    name: '', phone: '', specialization: '', classQuota: 0, waitingQuota: 0
                  })));
                }}
                className="w-full md:w-48 border-gray-300"
              />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {newTeachers.map((teacher, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="md:col-span-6 text-sm font-semibold text-[#4f46e5] mb-1">
                    معلم #{index + 1}
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label className="text-xs text-gray-600 mb-1 block">اسم المعلم *</Label>
                    <Input
                      value={teacher.name}
                      onChange={(e) => {
                        const updated = [...newTeachers];
                        updated[index].name = e.target.value;
                        setNewTeachers(updated);
                      }}
                      placeholder="أدخل اسم المعلم"
                      className="border-gray-300 h-9"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <Label className="text-xs text-gray-600 mb-1 block">رقم الجوال</Label>
                    <Input
                      value={teacher.phone}
                      onChange={(e) => {
                        const updated = [...newTeachers];
                        updated[index].phone = e.target.value;
                        setNewTeachers(updated);
                      }}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                      className="border-gray-300 h-9"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <Label className="text-xs text-gray-600 mb-1 block">التخصص</Label>
                    <Select
                      value={teacher.specialization}
                      onValueChange={(value) => {
                        const updated = [...newTeachers];
                        updated[index].specialization = value;
                        setNewTeachers(updated);
                      }}
                    >
                      <SelectTrigger className="border-gray-300 h-10 bg-white hover:bg-gray-50 transition-colors">
                        <SelectValue placeholder="اختر التخصص..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[320px] z-50">
                        {SPECIALIZATIONS.map(spec => (
                          <SelectItem 
                            key={spec} 
                            value={spec}
                            className="py-3 px-4 cursor-pointer hover:bg-indigo-50 focus:bg-indigo-100 text-sm"
                          >
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-1">
                    <Label className="text-xs text-gray-600 mb-1 block">نصاب الحصص</Label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      value={teacher.classQuota}
                      onChange={(e) => {
                        const updated = [...newTeachers];
                        updated[index].classQuota = Number(e.target.value);
                        setNewTeachers(updated);
                      }}
                      className="border-gray-300 h-9 text-center"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <Label className="text-xs text-gray-600 mb-1 block">نصاب الانتظار</Label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      value={teacher.waitingQuota}
                      onChange={(e) => {
                        const updated = [...newTeachers];
                        updated[index].waitingQuota = Number(e.target.value);
                        setNewTeachers(updated);
                      }}
                      className="border-gray-300 h-9 text-center"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddTeachers}
                className="flex-1 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white"
              >
                <Check className="w-4 h-4 ml-2" />
                حفظ وإضافة المعلمين
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddPanel(false);
                  setNewTeachers([{ name: '', phone: '', specialization: '', classQuota: 0, waitingQuota: 0 }]);
                  setNewTeachersCount(1);
                }}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* بطاقة البحث */}
      <Card className="shadow-md border-gray-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* البحث النصي */}
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input type="text" placeholder="البحث عن معلم (الاسم، الجوال، التخصص)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 border-gray-300" />
              </div>
            </div>
            
            {/* فلتر التخصص */}
            <div className="md:col-span-3 relative" ref={specDropdownRef}>
              <Button
                variant="outline"
                className="w-full justify-between border-gray-300"
                onClick={() => setShowSpecDropdown(!showSpecDropdown)}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {selectedSpecialization.length > 0 
                    ? `${selectedSpecialization.length} تخصص محدد`
                    : 'جميع التخصصات'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showSpecDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    <div 
                      className="px-3 py-2 hover:bg-gray-50 rounded cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setSelectedSpecialization([]);
                        setShowSpecDropdown(false);
                      }}
                    >
                      <div className={`w-4 h-4 border rounded ${selectedSpecialization.length === 0 ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                        {selectedSpecialization.length === 0 && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium">جميع التخصصات</span>
                    </div>
                    {SPECIALIZATIONS.map(spec => (
                      <div
                        key={spec}
                        className="px-3 py-2 hover:bg-gray-50 rounded cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          setSelectedSpecialization(prev => 
                            prev.includes(spec) 
                              ? prev.filter(s => s !== spec)
                              : [...prev, spec]
                          );
                        }}
                      >
                        <div className={`w-4 h-4 border rounded ${selectedSpecialization.includes(spec) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                          {selectedSpecialization.includes(spec) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* فلتر المعلمين */}
            <div className="md:col-span-4 relative teacher-filter-dropdown">
              <Button
                variant="outline"
                className="w-full justify-between border-gray-300"
                onClick={() => setShowTeacherFilter(!showTeacherFilter)}
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {selectedTeacherNames.length > 0 
                    ? `${selectedTeacherNames.length} معلم محدد`
                    : 'تحديد معلمين'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showTeacherFilter && uniqueTeacherNames.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 border-b bg-gray-50 sticky top-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-xs"
                      onClick={() => {
                        if (selectedTeacherNames.length === uniqueTeacherNames.length) {
                          setSelectedTeacherNames([]);
                        } else {
                          setSelectedTeacherNames(uniqueTeacherNames);
                        }
                      }}
                    >
                      {selectedTeacherNames.length === uniqueTeacherNames.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                    </Button>
                  </div>
                  {uniqueTeacherNames.map(name => (
                    <div key={name} className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setSelectedTeacherNames(prev =>
                          prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
                        );
                      }}
                    >
                      <Checkbox
                        checked={selectedTeacherNames.includes(name)}
                        className="pointer-events-none"
                      />
                      <span className="text-sm">{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* شريط الترتيب والإحصائيات */}
      {teachers.length > 0 && (
        <Card className="shadow-md border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* أزرار الترتيب */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Button
                  size="sm"
                  variant={sortAlphabetically ? "default" : "outline"}
                  className={sortAlphabetically ? "bg-[#4f46e5] hover:bg-[#4338ca]" : ""}
                  onClick={() => {
                    setSortAlphabetically(!sortAlphabetically);
                    if (!sortAlphabetically) setSortBySpecialization(false);
                  }}
                >
                  <SortAsc className="w-4 h-4 ml-2" />
                  ترتيب أبجدي
                  {sortAlphabetically && <Check className="w-4 h-4 mr-2" />}
                </Button>

                <Button
                  size="sm"
                  variant={sortBySpecialization ? "default" : "outline"}
                  className={sortBySpecialization ? "bg-[#6366f1] hover:bg-[#4f46e5]" : ""}
                  onClick={() => setShowSpecOrderDialog(true)}
                >
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                  ترتيب حسب التخصص
                  {sortBySpecialization && <Check className="w-4 h-4 mr-2" />}
                </Button>

                {(sortAlphabetically || sortBySpecialization) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setSortAlphabetically(false);
                      setSortBySpecialization(false);
                      setCustomSpecializationOrder([]);
                    }}
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    إلغاء الترتيب
                  </Button>
                )}
              </div>

              {/* الإحصائيات */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div className="text-sm">
                    <span className="font-bold text-blue-900">{filteredTeachers.length}</span>
                    <span className="text-blue-700"> من </span>
                    <span className="font-bold text-blue-900">{teachers.length}</span>
                    <span className="text-blue-700"> معلم</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div className="text-sm">
                    <span className="font-bold text-blue-900">
                      {filteredTeachers.reduce((sum, t) => sum + t.classQuota + t.waitingQuota, 0)}
                    </span>
                    <span className="text-blue-700"> حصة</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* حوار ترتيب التخصصات */}
      {showSpecOrderDialog && (
        <Card className="shadow-xl border-2 border-[#6366f1]">
          <CardHeader className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white">
            <CardTitle className="flex items-center justify-between">
              <span>ترتيب التخصصات</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setShowSpecOrderDialog(false)}
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              رتب التخصصات بالترتيب المطلوب من الأول إلى الأخير (اسحب وأفلت)
            </p>
            <div className="space-y-2">
              {(customSpecializationOrder.length > 0 ? customSpecializationOrder : uniqueSpecializations).map((spec, index) => (
                <div
                  key={spec}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    const toIndex = index;
                    const newOrder = [...(customSpecializationOrder.length > 0 ? customSpecializationOrder : uniqueSpecializations)];
                    const [moved] = newOrder.splice(fromIndex, 1);
                    newOrder.splice(toIndex, 0, moved);
                    setCustomSpecializationOrder(newOrder);
                  }}
                >
                  <span className="text-sm font-bold text-[#6366f1] w-8">{index + 1}</span>
                  <span className="flex-1 text-sm font-medium">{spec}</span>
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSaveSpecOrder}
                className="flex-1 bg-gradient-to-r from-[#6366f1] to-[#818cf8] hover:from-[#4f46e5] hover:to-[#6366f1]"
              >
                <Check className="w-4 h-4 ml-2" />
                حفظ الترتيب
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSpecOrderDialog(false);
                  setCustomSpecializationOrder([]);
                }}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* لوحة التعديل الجماعي */}
      {selectedTeacherIds.length > 0 && showBulkEditPanel && (
        <Card className="shadow-lg border-2 border-orange-400">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                تعديل جماعي ({selectedTeacherIds.length} معلم)
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => {
                  setShowBulkEditPanel(false);
                  setSelectedTeacherIds([]);
                }}
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">نوع التعديل</Label>
                <Select value={bulkEditField} onValueChange={(value: any) => setBulkEditField(value)}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="specialization">التخصص</SelectItem>
                    <SelectItem value="phone">رقم الجوال</SelectItem>
                    <SelectItem value="classQuota">نصاب الحصص</SelectItem>
                    <SelectItem value="waitingQuota">نصاب الانتظار</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm font-semibold mb-2 block">القيمة الجديدة</Label>
                {bulkEditField === 'specialization' ? (
                  <Select value={bulkEditValue} onValueChange={setBulkEditValue}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : bulkEditField === 'phone' ? (
                  <Input
                    value={bulkEditValue}
                    onChange={(e) => setBulkEditValue(e.target.value)}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                    className="border-gray-300"
                  />
                ) : (
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    value={bulkEditValue}
                    onChange={(e) => setBulkEditValue(e.target.value)}
                    className="border-gray-300"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleBulkEdit}
                className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white"
              >
                <Check className="w-4 h-4 ml-2" />
                تطبيق التعديل
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTeacherIds([]);
                  setBulkEditValue('');
                  setShowBulkEditPanel(false);
                }}
                className="flex-1"
              >
                إلغاء
              </Button>
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
                    أنت على وشك حذف <span className="font-bold text-red-900">{teachers.length} معلم</span> من النظام.
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

      {/* مربع حوار حذف معلم واحد */}
      {showDeleteSingleDialog && teacherToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full shadow-2xl border-2 border-red-500 animate-in fade-in zoom-in duration-200">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Trash2 className="h-6 w-6" />
                </div>
                <span>تأكيد حذف المعلم</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold mb-2">⚠️ تحذير</p>
                  <p className="text-red-700 text-sm">
                    هل أنت متأكد من حذف المعلم: <span className="font-bold text-red-900">{teacherToDelete.name}</span>؟
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الاسم:</span>
                      <span className="font-semibold">{teacherToDelete.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">التخصص:</span>
                      <span className="font-semibold">{teacherToDelete.specialization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الجوال:</span>
                      <span className="font-semibold" dir="ltr">{teacherToDelete.phone}</span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-gray-600 font-medium text-sm">
                  هذا الإجراء لا يمكن التراجع عنه
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={confirmDeleteSingleTeacher}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  نعم، احذف
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteSingleDialog(false);
                    setTeacherToDelete(null);
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
      {teachers.length > 0 ? (
        <Card className="shadow-md border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <BookOpen className="h-5 w-5 text-[#4f46e5]" />
                <span>بيانات المعلمين</span>
              </CardTitle>
              
              {selectedTeacherIds.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => setShowBulkEditPanel(!showBulkEditPanel)}
                  className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600"
                >
                  <Settings className="w-4 h-4 ml-2" />
                  تعديل المحدد ({selectedTeacherIds.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white sticky top-0">
                  <tr>
                    <th className="p-3 text-right w-12">#</th>
                    <th className="p-3 text-right w-[200px]">اسم المعلم</th>
                    <th className="p-3 text-right w-[130px]">رقم الجوال</th>
                    <th className="p-3 text-center w-[150px]">التخصص</th>
                    <th className="p-3 text-center w-28">نصاب الحصص</th>
                    <th className="p-3 text-center w-28">نصاب الانتظار</th>
                    <th className="p-3 text-center w-24">المجموع</th>
                    <th className="p-3 text-center w-24">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher, index) => {
                    const total = teacher.classQuota + teacher.waitingQuota;
                    const exceeded = total > 24;
                    
                    return (
                      <tr key={teacher.id} className="border-b hover:bg-blue-50 transition-colors">
                        <td className="p-3 text-sm text-gray-600 font-semibold">{index + 1}</td>
                        <td className="p-3">
                          {isEditMode ? (
                            <Input 
                              value={teacher.name} 
                              onChange={(e) => setTeachers(teachers.map(t => t.id === teacher.id ? {...t, name: e.target.value} : t))} 
                              className="h-9 border-gray-300 font-medium" 
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{teacher.name}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditMode ? (
                            <Input 
                              value={teacher.phone} 
                              onChange={(e) => setTeachers(teachers.map(t => t.id === teacher.id ? {...t, phone: e.target.value} : t))} 
                              className="h-9 border-gray-300" 
                              dir="ltr" 
                            />
                          ) : (
                            <span className="text-sm text-gray-700" dir="ltr">{teacher.phone}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isEditMode ? (
                            <Select 
                              value={teacher.specialization} 
                              onValueChange={(value) => setTeachers(teachers.map(t => t.id === teacher.id ? {...t, specialization: value} : t))}
                            >
                              <SelectTrigger className="h-9 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SPECIALIZATIONS.map(spec => <SelectItem key={spec} value={spec}>{spec}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-sm text-gray-700">{teacher.specialization}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isEditMode ? (
                            <Input 
                              type="number" 
                              value={teacher.classQuota} 
                              onChange={(e) => setTeachers(teachers.map(t => t.id === teacher.id ? {...t, classQuota: Number(e.target.value)} : t))} 
                              className="h-9 text-center border-gray-300 font-semibold" 
                              min="0" 
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">{teacher.classQuota}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isEditMode ? (
                            <Input 
                              type="number" 
                              value={teacher.waitingQuota} 
                              onChange={(e) => setTeachers(teachers.map(t => t.id === teacher.id ? {...t, waitingQuota: Number(e.target.value)} : t))} 
                              className="h-9 text-center border-gray-300 font-semibold" 
                              min="0" 
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">{teacher.waitingQuota}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Badge className={`${
                              exceeded ? 'bg-red-600 hover:bg-red-700' :
                              total === 24 ? 'bg-yellow-500 hover:bg-yellow-600' :
                              'bg-green-600 hover:bg-green-700'
                            } text-white font-bold`}>
                              {total}
                            </Badge>
                            {exceeded && (
                              <div title="تجاوز النصاب المسموح">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center">
                            <Button 
                              size="sm" 
                              onClick={() => handleDeleteTeacher(teacher.id)} 
                              variant="ghost" 
                              className="hover:bg-red-50 h-10 w-10 p-0" 
                              title="حذف المعلم"
                            >
                              <Trash2 className="h-6 w-6 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md border-gray-200">
          <CardContent className="p-12 text-center">
            <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">لا توجد بيانات معلمين</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة معلمين يدوياً أو استيراد ملف Excel</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                onClick={() => setShowAddPanel(true)}
                className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5]"
              >
                <UserPlus className="w-4 h-4 ml-2" />
                إضافة معلم جديد
              </Button>
              <Button
                onClick={handleImportExcel}
                variant="outline"
                className="border-[#4f46e5] text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white"
              >
                <Upload className="w-4 h-4 ml-2" />
                استيراد من Excel
              </Button>
            </div>
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

export default TeachersManagement;
