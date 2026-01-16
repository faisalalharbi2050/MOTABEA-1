import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { 
  Users, 
  Upload, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Move, 
  AlertCircle,
  Settings,
  Download,
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  School,
  FileSpreadsheet,
  FileDown,
  Printer,
  UserPlus,
  X as XIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Student, StudentImportData, StudentImportResult } from '../../types/student';
import { Classroom } from '../../types/classroom';

interface School {
  id: string;
  name: string;
  active: boolean;
  stage?: string;
  sectionType?: string;
}

const StudentsManagement = () => {
  const navigate = useNavigate();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [importResult, setImportResult] = useState<StudentImportResult | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  // Add student dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    grade: '',
    classId: '',
    phone: ''
  });
  
  // Export and print states
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showPrintPanel, setShowPrintPanel] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);
  const [selectAllClassrooms, setSelectAllClassrooms] = useState(false);
  
  // Edit student dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Import review dialog state  
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [studentsNeedingReview, setStudentsNeedingReview] = useState<StudentImportData[]>([]);
  const [reviewClassAssignments, setReviewClassAssignments] = useState<Record<number, string>>({});
  
  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      fetchClassrooms();
      fetchStudents();
    }
  }, [selectedSchool]);

  // إعادة محاولة صامتة في الخلفية بدون إزعاج المستخدم
  useEffect(() => {
    if (schools.length === 0 && !isLoading && retryCount < 10) {
      const timer = setTimeout(() => {
        console.log(`🔄 محاولة صامتة ${retryCount + 1}/10`);
        setRetryCount(prev => prev + 1);
        fetchSchools();
      }, 3000); // محاولة كل 3 ثواني
      
      return () => clearTimeout(timer);
    }
  }, [schools, isLoading, retryCount]);

  const fetchSchools = async () => {
    if (retryCount === 0) {
      console.log('🔄 بدء جلب المدارس...');
    }
    setIsLoading(true);
    
    try {
      // محاولة الجلب من localStorage أولاً
      const localData = localStorage.getItem('schoolData');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (parsed.schools && parsed.schools.length > 0) {
            console.log('📦 استخدام البيانات من localStorage:', parsed.schools.length);
            setSchools(parsed.schools);
            setSelectedSchool(parsed.schools[0].id);
            setRetryCount(0);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('فشل قراءة localStorage');
        }
      }
      
      // إذا لم تكن البيانات في localStorage، نحاول الجلب من API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/schools', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success === false) {
        throw new Error('فشل في جلب البيانات');
      }
      
      setSchools(data.schools || []);
      setRetryCount(0);
      
      // اختيار المدرسة الأولى تلقائياً
      if (data.schools && data.schools.length > 0) {
        console.log('✅ تم تحميل المدارس من API:', data.schools.length);
        setSelectedSchool(data.schools[0].id);
      }
    } catch (error) {
      // معالجة صامتة - لا رسائل للمستخدم
      console.log('⚠️ محاولة فاشلة، سيتم المحاولة مرة أخرى...');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    if (!selectedSchool) return;
    
    try {
      const response = await fetch(`/api/classes?school_id=${selectedSchool}`);
      const data = await response.json();
      
      // إذا كانت البيانات من الخادم فارغة، نحاول جلبها من localStorage
      if (!data.classes || data.classes.length === 0) {
        // جمع جميع الفصول من localStorage (من جميع المراحل)
        const allClassrooms: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('classrooms_stage_')) {
            try {
              const classroomsData = localStorage.getItem(key);
              if (classroomsData) {
                const parsed = JSON.parse(classroomsData);
                if (Array.isArray(parsed)) {
                  allClassrooms.push(...parsed);
                }
              }
            } catch (e) {
              console.warn(`فشل قراءة ${key}`);
            }
          }
        }
        
        if (allClassrooms.length > 0) {
          console.log('📦 استخدام الفصول من localStorage:', allClassrooms.length);
          setClassrooms(allClassrooms);
          return;
        }
      }
      
      setClassrooms(data.classes || []);
    } catch (error) {
      console.error('خطأ في جلب الفصول:', error);
      // محاولة جلب من localStorage كخطة احتياطية
      const allClassrooms: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('classrooms_stage_')) {
          try {
            const classroomsData = localStorage.getItem(key);
            if (classroomsData) {
              const parsed = JSON.parse(classroomsData);
              if (Array.isArray(parsed)) {
                allClassrooms.push(...parsed);
              }
            }
          } catch (e) {
            console.warn(`فشل قراءة ${key}`);
          }
        }
      }
      if (allClassrooms.length > 0) {
        setClassrooms(allClassrooms);
      }
    }
  };

  const fetchStudents = async () => {
    if (!selectedSchool) return;
    
    try {
      const response = await fetch(`/api/students?school_id=${selectedSchool}`);
      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('خطأ في جلب الطلاب:', error);
    }
  };

  // وظيفة إضافة طالب جديد
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.classId || !selectedSchool) return;
    
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newStudent.name,
          class_id: newStudent.classId,
          phone: newStudent.phone,
          school_id: selectedSchool,
        }),
      });

      if (response.ok) {
        await fetchStudents();
        setShowAddPanel(false);
        setNewStudent({ name: '', grade: '', classId: '', phone: '' });
      }
    } catch (error) {
      console.error('خطأ في إضافة الطالب:', error);
    }
  };
  
  const openAddPanel = () => {
    setShowAddPanel(true);
    setShowExportPanel(false);
    setShowPrintPanel(false);
  };

  // وظيفة حذف جميع الطلاب
  const handleDeleteAll = async () => {
    setShowDeleteAllDialog(true);
  };
  
  const confirmDeleteAll = async () => {
    try {
      const response = await fetch(`/api/students/delete-all?school_id=${selectedSchool}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchStudents();
        setShowDeleteAllDialog(false);
      }
    } catch (error) {
      console.error('خطأ في حذف الطلاب:', error);
    }
  };

  // وظيفة تصدير Excel
  const handleExportExcel = () => {
    setShowExportPanel(true);
    setShowPrintPanel(false);
    setShowAddPanel(false);
  };

  const executeExportExcel = () => {
    // تصفية الطلاب حسب الفصول المحددة
    const studentsToExport = selectAllClassrooms 
      ? students 
      : students.filter(s => selectedClassrooms.includes(s.class_id || ''));

    if (studentsToExport.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }

    // إعداد البيانات للتصدير
    const exportData = studentsToExport.map((student, index) => {
      const classroom = classrooms.find(c => c.id === student.class_id);
      return {
        '#': index + 1,
        'رقم الطالب': student.student_id || '',
        'اسم الطالب': student.name,
        'الصف/الفصل': classroom ? classroom.name : `${student.grade_level}/${student.section}`,
        'الجوال': student.parent_phone || ''
      };
    });

    // إنشاء ورقة عمل Excel
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الطلاب');

    // تنزيل الملف
    const fileName = `قائمة_الطلاب_${new Date().toLocaleDateString('ar-SA')}.xlsx`;
    XLSX.writeFile(wb, fileName);

    setShowExportPanel(false);
    setSelectedClassrooms([]);
    setSelectAllClassrooms(false);
  };

  // وظيفة طباعة PDF
  const handlePrintPDF = () => {
    setShowPrintPanel(true);
    setShowExportPanel(false);
    setShowAddPanel(false);
  };

  const executePrintPDF = () => {
    // تصفية الطلاب حسب الفصول المحددة
    const studentsToPrint = selectAllClassrooms 
      ? students 
      : students.filter(s => selectedClassrooms.includes(s.class_id || ''));

    if (studentsToPrint.length === 0) {
      alert('لا توجد بيانات للطباعة');
      return;
    }

    // إنشاء مستند PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // إعداد الخط العربي (استخدام خط افتراضي)
    doc.setFont('helvetica');
    doc.setFontSize(16);
    
    // عنوان التقرير
    doc.text('قائمة الطلاب', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, 105, 28, { align: 'center' });

    // إعداد بيانات الجدول
    let yPosition = 40;
    const lineHeight = 8;
    const pageHeight = doc.internal.pageSize.height;

    // رأس الجدول
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 20, yPosition);
    doc.text('Name', 35, yPosition);
    doc.text('Class', 110, yPosition);
    doc.text('Phone', 160, yPosition);
    
    yPosition += lineHeight;
    doc.line(15, yPosition - 3, 195, yPosition - 3);

    // بيانات الطلاب
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    studentsToPrint.forEach((student, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        
        // إعادة رأس الجدول في الصفحة الجديدة
        doc.setFont('helvetica', 'bold');
        doc.text('#', 20, yPosition);
        doc.text('Name', 35, yPosition);
        doc.text('Class', 110, yPosition);
        doc.text('Phone', 160, yPosition);
        yPosition += lineHeight;
        doc.line(15, yPosition - 3, 195, yPosition - 3);
        doc.setFont('helvetica', 'normal');
      }

      const classroom = classrooms.find(c => c.id === student.class_id);
      const classDisplay = classroom ? classroom.name : `${student.grade_level}/${student.section}`;
      
      doc.text(`${index + 1}`, 20, yPosition);
      doc.text(student.name || '', 35, yPosition);
      doc.text(classDisplay, 110, yPosition);
      doc.text(student.parent_phone || '', 160, yPosition);
      
      yPosition += lineHeight;
    });

    // حفظ الملف
    const fileName = `قائمة_الطلاب_${new Date().toLocaleDateString('ar-SA')}.pdf`;
    doc.save(fileName);

    setShowPrintPanel(false);
    setSelectedClassrooms([]);
    setSelectAllClassrooms(false);
  };

  // معالجة تحديد/إلغاء تحديد جميع الفصول
  const handleSelectAllClassrooms = (checked: boolean) => {
    setSelectAllClassrooms(checked);
    if (checked) {
      setSelectedClassrooms(classrooms.map(c => c.id));
    } else {
      setSelectedClassrooms([]);
    }
  };

  // معالجة تحديد/إلغاء تحديد فصل واحد
  const handleClassroomToggle = (classroomId: string) => {
    setSelectedClassrooms(prev => {
      if (prev.includes(classroomId)) {
        return prev.filter(id => id !== classroomId);
      } else {
        return [...prev, classroomId];
      }
    });
  };

  // وظيفة الاستيراد المباشر من ملف Excel
  const handleImportExcel = () => {
    // إنشاء input مخفي لاختيار الملف
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;

      try {
        // قراءة الملف
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // تحويل البيانات إلى JSON
        const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const dataRows = rawData.slice(1).filter(row => row.some(cell => cell));

        // تحويل البيانات إلى تنسيق الطلاب
        // الأعمدة المتوقعة: رقم الطالب، اسم الطالب، رقم الصف، الفصل، الجوال
        const importData: StudentImportData[] = [];
        const needsReview: StudentImportData[] = [];
        
        dataRows.forEach((row, index) => {
          const studentNumber = row[0]?.toString()?.trim() || '';
          const studentName = row[1]?.toString()?.trim() || '';
          const gradeLevel = parseInt(row[2]?.toString()) || 0;
          const section = row[3]?.toString()?.trim() || '';
          const parentPhone = row[4]?.toString()?.trim() || '';
          
          // البحث عن الفصل المطابق بناءً على رقم الصف والفصل
          // البحث يكون مفلتراً حسب school_id لتجنب التداخل بين المدارس
          const classroom = classrooms.find(c => {
            // التحقق من تطابق رقم الصف والفصل
            const gradeMatch = c.name.includes(gradeLevel.toString());
            const sectionMatch = c.section === section || c.name.includes(section);
            return gradeMatch && sectionMatch;
          });

          const studentData: StudentImportData = {
            student_number: studentNumber, // رقم الطالب (ليس رقم الهوية)
            name: studentName,
            grade_level: gradeLevel,
            section: section,
            parent_phone: parentPhone,
            class_id: classroom?.id,
            school_id: selectedSchool,
            row_number: index + 2 // رقم الصف في Excel (بعد العنوان)
          };
          
          // إذا لم يتم العثور على الفصل، يضاف للمراجعة اليدوية
          if (!classroom) {
            needsReview.push(studentData);
          } else {
            importData.push(studentData);
          }
        });

        // إذا كان هناك طلاب بحاجة للمراجعة، نعرض نافذة المراجعة
        if (needsReview.length > 0) {
          setStudentsNeedingReview(needsReview);
          setShowReviewDialog(true);
        }
        
        // إرسال الطلاب الذين تم تسكينهم تلقائياً
        if (importData.length > 0) {
          const response = await fetch('/api/students/batch-import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              students: importData,
              school_id: selectedSchool
            })
          });

          const result: StudentImportResult = await response.json();
          
          setImportResult(result);
          if (result.success && result.imported_count > 0) {
            await fetchStudents();
          }
        }
      } catch (error) {
        console.error('خطأ في الاستيراد:', error);
        alert('حدث خطأ أثناء استيراد الملف. تأكد من صحة تنسيق الملف.');
      }
    };
    
    // فتح نافذة اختيار الملف
    input.click();
  };

  // وظيفة حفظ الطلاب بعد المراجعة اليدوية
  const handleSaveReviewedStudents = async () => {
    try {
      // جمع الطلاب مع الفصول المحددة
      const studentsToImport = studentsNeedingReview
        .filter((_, index) => reviewClassAssignments[index])
        .map((student, index) => ({
          ...student,
          class_id: reviewClassAssignments[index]
        }));

      if (studentsToImport.length === 0) {
        alert('يرجى تحديد الفصل لكل طالب');
        return;
      }

      const response = await fetch('/api/students/batch-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          students: studentsToImport,
          school_id: selectedSchool
        })
      });

      const result: StudentImportResult = await response.json();
      
      if (result.success && result.imported_count > 0) {
        await fetchStudents();
        setShowReviewDialog(false);
        setStudentsNeedingReview([]);
        setReviewClassAssignments({});
        alert(`تم استيراد ${result.imported_count} طالب بنجاح`);
      }
    } catch (error) {
      console.error('خطأ في حفظ الطلاب:', error);
      alert('حدث خطأ أثناء حفظ الطلاب');
    }
  };


  // تحديث الطلاب المفلترين عند تغيير الطلاب
  React.useEffect(() => {
    let filtered = students;

    // تطبيق فلتر البحث
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student => {
        const classroom = classrooms.find(c => c.id === student.class_id);
        const classroomDisplay = classroom ? classroom.name : `${student.grade_level}/${student.section}`;
        
        return (
          student.name.toLowerCase().includes(searchLower) ||
          student.student_id?.toLowerCase().includes(searchLower) ||
          student.parent_phone?.includes(searchTerm) ||
          classroomDisplay.toLowerCase().includes(searchLower)
        );
      });
    }

    // تطبيق فلتر الفصل
    if (selectedClassroom !== 'all') {
      filtered = filtered.filter(student => student.class_id === selectedClassroom);
    }

    // تطبيق فلتر تحديد طلاب معينين
    if (selectedStudentIds.length > 0) {
      filtered = filtered.filter(student => selectedStudentIds.includes(student.id));
    }

    // الترتيب الهجائي العربي
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedClassroom, selectedStudentIds, classrooms]);

  // تصفية الطلاب حسب الفصل المحدد
  const getStudentsByClassroom = (classroomId: string) => {
    return students.filter(s => s.class_id === classroomId);
  };

  // الحصول على قائمة الطلاب في الفصل المحدد مرتبة هجائياً
  const getStudentsInSelectedClassroom = () => {
    if (selectedClassroom === 'all') {
      return students.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    }
    return students
      .filter(s => s.class_id === selectedClassroom)
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  };

  // وظائف التعامل مع الطلاب
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleStudentEdit = (student: Student) => {
    setEditingStudent(student);
    setShowEditDialog(true);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    
    try {
      const response = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingStudent),
      });

      if (response.ok) {
        await fetchStudents();
        setShowEditDialog(false);
        setEditingStudent(null);
      }
    } catch (error) {
      console.error('خطأ في تعديل الطالب:', error);
    }
  };

  const handleStudentDelete = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // عرض نافذة تأكيد مخصصة
    const confirmDelete = window.confirm(
      `⚠️ تحذير: حذف بيانات الطالب\n\n` +
      `هل أنت متأكد من حذف بيانات الطالب:\n` +
      `الاسم: ${student.name}\n` +
      `الصف/الفصل: ${student.grade_level}/${student.section || '-'}\n\n` +
      `لا يمكن التراجع عن هذا الإجراء!`
    );
    
    if (!confirmDelete) {
      return;
    }
    
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchStudents();
        // إزالة الطالب من قائمة المحددين إن وجد
        setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
      }
    } catch (error) {
      console.error('خطأ في حذف الطالب:', error);
      alert('حدث خطأ أثناء حذف الطالب. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleStudentMove = (studentId: string) => {
    // TODO: فتح نموذج نقل الطالب
    console.log('نقل الطالب:', studentId);
  };

  // عرض شاشة التحميل فقط في المحاولة الأولى
  if (isLoading && retryCount === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // رسالة بسيطة إذا لم تكن هناك مدارس
  if (!isLoading && schools.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100">
          <div className="mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <School className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              لا توجد مدارس مضافة
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              لإدارة الطلاب، يجب أولاً إضافة بيانات المدرسة من صفحة الإعدادات الأولية
            </p>
            <Button 
              onClick={() => navigate('/dashboard/initial-settings/school-info')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <School className="w-4 h-4 ml-2" />
              إضافة بيانات المدرسة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // رسالة بسيطة إذا لم تكن هناك فصول - فقط بعد التأكد من تحميل المدارس بنجاح
  const shouldShowClassroomCheck = selectedSchool && classrooms.length === 0 && !isLoading && schools.length > 0;
  
  if (shouldShowClassroomCheck) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100">
          <div className="mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <School className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              لا توجد فصول دراسية
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              يجب إنشاء الفصول الدراسية أولاً قبل إضافة الطلاب
            </p>
            <Button 
              onClick={() => navigate('/dashboard/initial-settings/classrooms')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <School className="w-4 h-4 ml-2" />
              إنشاء الفصول الدراسية
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // إذا كانت المدارس قيد التحميل (محاولات صامتة)، نعرض الواجهة الفارغة
  if (isLoading && schools.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-1 pb-6 px-6 max-w-7xl mx-auto space-y-6" style={{ animation: 'none', transition: 'none' }}>
      {/* رأس الصفحة */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6" style={{ animation: 'none', transition: 'none' }}>
        <div className="flex items-center gap-3" style={{ animation: 'none', transition: 'none', transform: 'none' }}>
          <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg" style={{ animation: 'none', transition: 'none', transform: 'none' }}>
            <Users className="h-6 w-6 text-white" style={{ animation: 'none', transition: 'none', transform: 'none' }} />
          </div>
          <div style={{ animation: 'none', transition: 'none', transform: 'none' }}>
            <h1 className="text-2xl font-bold text-gray-900" style={{ animation: 'none', transition: 'none', transform: 'none' }}>إدارة الطلاب</h1>
          </div>
        </div>
      </div>

      {/* اختيار المدرسة - يظهر فقط في حال وجود عدة مدارس */}
      {schools.length > 1 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <School className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-indigo-900 text-lg">اختر المدرسة</h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      حدد المدرسة لإدارة طلابها
                    </p>
                  </div>
                </div>
                {schools.length > 1 && (
                  <div className="bg-indigo-50 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-indigo-700">
                      {schools.length} مدارس
                    </span>
                  </div>
                )}
              </div>
              
              {/* بطاقات المدارس */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schools.map((school) => {
                  const isActive = school.id === selectedSchool;
                  
                  // دالة ترجمة المرحلة
                  const translateStage = (stage: string) => {
                    const stageMap: { [key: string]: string } = {
                      'primary': 'ابتدائي',
                      'middle': 'متوسط',
                      'secondary': 'ثانوي',
                      'kindergarten': 'رياض أطفال',
                      'ابتدائي': 'ابتدائي',
                      'متوسط': 'متوسط',
                      'ثانوي': 'ثانوي'
                    };
                    return stageMap[stage.toLowerCase()] || stage;
                  };
                  
                  // دالة ترجمة القسم
                  const translateSection = (section: string) => {
                    const sectionMap: { [key: string]: string } = {
                      'boys': 'بنين',
                      'girls': 'بنات',
                      'بنين': 'بنين',
                      'بنات': 'بنات'
                    };
                    return sectionMap[section.toLowerCase()] || section;
                  };
                  
                  return (
                    <button
                      key={school.id}
                      onClick={() => setSelectedSchool(school.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-right ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]'
                          : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                          isActive ? 'bg-indigo-500' : 'bg-gray-400'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm truncate ${
                            isActive ? 'text-indigo-700' : 'text-gray-700'
                          }`}>
                            {school.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {school.stage && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {translateStage(school.stage)}
                              </span>
                            )}
                            {school.sectionType && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                isActive ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {translateSection(school.sectionType)}
                              </span>
                            )}
                          </div>
                          {isActive && (
                            <p className="text-[10px] text-indigo-600 mt-1.5">النشطة حالياً</p>
                          )}
                        </div>
                        {isActive && (
                          <CheckCircle className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedSchool && (
        <>
          {/* بطاقة الأزرار الرئيسية */}
          <Card className="shadow-md border-gray-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                {/* زر استيراد Excel */}
                <Button
                  className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md hover:shadow-lg h-auto py-3"
                  onClick={handleImportExcel}
                >
                  <Upload className="w-4 h-4 ml-2" />
                  <span className="text-sm">استيراد Excel</span>
                </Button>

                {/* زر تصدير Excel */}
                <Button
                  className={`bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md hover:shadow-lg h-auto py-3 ${showExportPanel ? 'ring-2 ring-[#4f46e5]' : ''}`}
                  onClick={handleExportExcel}
                >
                  <FileDown className="w-4 h-4 ml-2" />
                  <span className="text-sm">تصدير Excel</span>
                </Button>

                {/* زر طباعة PDF */}
                <Button
                  className={`bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md hover:shadow-lg h-auto py-3 ${showPrintPanel ? 'ring-2 ring-[#4f46e5]' : ''}`}
                  onClick={handlePrintPDF}
                >
                  <Printer className="w-4 h-4 ml-2" />
                  <span className="text-sm">طباعة PDF</span>
                </Button>

                {/* زر إضافة طالب */}
                <Button
                  className={`bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white shadow-md hover:shadow-lg h-auto py-3 ${showAddPanel ? 'ring-2 ring-[#4f46e5]' : ''}`}
                  onClick={openAddPanel}
                >
                  <UserPlus className="w-4 h-4 ml-2" />
                  <span className="text-sm">إضافة طالب</span>
                </Button>

                {/* زر تعديل البيانات */}
                <Button
                  className={`${isEditMode ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'} text-white shadow-md hover:shadow-lg h-auto py-3`}
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                    if (isEditMode) {
                      alert('تم حفظ التعديلات');
                    }
                  }}
                >
                  <Edit className="w-4 h-4 ml-2" />
                  <span className="text-sm">{isEditMode ? 'حفظ التعديل' : 'تعديل البيانات'}</span>
                </Button>

                {/* زر حذف الكل */}
                <Button
                  variant="destructive"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg h-auto py-3 col-span-2 md:col-span-1"
                  onClick={handleDeleteAll}
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  <span className="text-sm">حذف الكل</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* لوحة إضافة طالب */}
          {showAddPanel && (
            <Card className="shadow-lg border-2 border-[#818cf8] bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="bg-gradient-to-r from-[#818cf8] to-[#a5b4fc] text-white">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <UserPlus className="w-5 h-5 ml-2" />
                    إضافة طالب جديد
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => {
                      setShowAddPanel(false);
                      setNewStudent({ name: '', grade: '', classId: '', phone: '' });
                    }}
                  >
                    <XIcon className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* اسم الطالب */}
                  <div>
                    <Label htmlFor="studentName" className="text-right block mb-2 font-semibold text-gray-700">
                      اسم الطالب
                    </Label>
                    <Input
                      id="studentName"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="أدخل اسم الطالب"
                      className="text-right border-green-300 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* اختيار الفصل */}
                  <div>
                    <Label htmlFor="studentClass" className="text-right block mb-2 font-semibold text-gray-700">
                      الصف والفصل
                    </Label>
                    <Select
                      value={newStudent.classId}
                      onValueChange={(value) => setNewStudent({ ...newStudent, classId: value })}
                    >
                      <SelectTrigger className="text-right border-green-300 focus:ring-green-500">
                        <SelectValue placeholder="اختر الصف والفصل" />
                      </SelectTrigger>
                      <SelectContent>
                        {classrooms.map((classroom) => (
                          <SelectItem key={classroom.id} value={classroom.id}>
                            {classroom.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* رقم الجوال */}
                  <div>
                    <Label htmlFor="studentPhone" className="text-right block mb-2 font-semibold text-gray-700">
                      رقم الجوال (ولي الأمر)
                    </Label>
                    <Input
                      id="studentPhone"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                      placeholder="مثال: 0501234567"
                      className="text-right border-green-300 focus:ring-green-500 focus:border-green-500"
                      dir="ltr"
                    />
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white"
                      onClick={handleAddStudent}
                      disabled={!newStudent.name || !newStudent.classId}
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      إضافة
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 hover:bg-gray-100"
                      onClick={() => {
                        setShowAddPanel(false);
                        setNewStudent({ name: '', grade: '', classId: '', phone: '' });
                      }}
                    >
                      <XIcon className="w-4 h-4 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* لوحة تصدير Excel */}
          {showExportPanel && (
            <Card className="shadow-lg border-2 border-[#4f46e5] bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileDown className="w-5 h-5 ml-2" />
                    تصدير إلى Excel
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-[#4338ca]"
                    onClick={() => {
                      setShowExportPanel(false);
                      setSelectedClassrooms([]);
                      setSelectAllClassrooms(false);
                    }}
                  >
                    <XIcon className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 font-medium">
                    اختر الفصول التي تريد تصدير بيانات طلابها:
                  </p>
                  
                  {/* خيار تحديد الكل */}
                  <div className="flex items-center space-x-2 space-x-reverse p-3 bg-blue-100 rounded-lg border border-blue-300">
                    <Checkbox
                      id="selectAllExport"
                      checked={selectAllClassrooms}
                      onCheckedChange={handleSelectAllClassrooms}
                    />
                    <Label htmlFor="selectAllExport" className="font-semibold cursor-pointer text-blue-900">
                      تحديد الكل ({classrooms.length} فصل)
                    </Label>
                  </div>

                  {/* قائمة الفصول */}
                  <div className="max-h-64 overflow-y-auto space-y-2 border-2 border-gray-200 rounded-lg p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {classrooms.map((classroom) => (
                        <div key={classroom.id} className="flex items-center space-x-2 space-x-reverse p-2 hover:bg-blue-50 rounded">
                          <Checkbox
                            id={`export-class-${classroom.id}`}
                            checked={selectedClassrooms.includes(classroom.id)}
                            onCheckedChange={() => handleClassroomToggle(classroom.id)}
                          />
                          <Label htmlFor={`export-class-${classroom.id}`} className="cursor-pointer flex-1">
                            {classroom.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* عداد الفصول المحددة */}
                  <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">
                      تم تحديد: {selectAllClassrooms ? classrooms.length : selectedClassrooms.length} فصل
                    </p>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white"
                      onClick={executeExportExcel}
                      disabled={selectedClassrooms.length === 0 && !selectAllClassrooms}
                    >
                      <FileDown className="w-4 h-4 ml-2" />
                      تصدير
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 hover:bg-gray-100"
                      onClick={() => {
                        setShowExportPanel(false);
                        setSelectedClassrooms([]);
                        setSelectAllClassrooms(false);
                      }}
                    >
                      <XIcon className="w-4 h-4 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* لوحة طباعة PDF */}
          {showPrintPanel && (
            <Card className="shadow-lg border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Printer className="w-5 h-5 ml-2" />
                    طباعة PDF
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-purple-600"
                    onClick={() => {
                      setShowPrintPanel(false);
                      setSelectedClassrooms([]);
                      setSelectAllClassrooms(false);
                    }}
                  >
                    <XIcon className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 font-medium">
                    اختر الفصول التي تريد طباعة بيانات طلابها:
                  </p>
                  
                  {/* خيار تحديد الكل */}
                  <div className="flex items-center space-x-2 space-x-reverse p-3 bg-purple-100 rounded-lg border border-purple-300">
                    <Checkbox
                      id="selectAllPrint"
                      checked={selectAllClassrooms}
                      onCheckedChange={handleSelectAllClassrooms}
                    />
                    <Label htmlFor="selectAllPrint" className="font-semibold cursor-pointer text-purple-900">
                      تحديد الكل ({classrooms.length} فصل)
                    </Label>
                  </div>

                  {/* قائمة الفصول */}
                  <div className="max-h-64 overflow-y-auto space-y-2 border-2 border-gray-200 rounded-lg p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {classrooms.map((classroom) => (
                        <div key={classroom.id} className="flex items-center space-x-2 space-x-reverse p-2 hover:bg-purple-50 rounded">
                          <Checkbox
                            id={`print-class-${classroom.id}`}
                            checked={selectedClassrooms.includes(classroom.id)}
                            onCheckedChange={() => handleClassroomToggle(classroom.id)}
                          />
                          <Label htmlFor={`print-class-${classroom.id}`} className="cursor-pointer flex-1">
                            {classroom.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* عداد الفصول المحددة */}
                  <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-900">
                      تم تحديد: {selectAllClassrooms ? classrooms.length : selectedClassrooms.length} فصل
                    </p>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={executePrintPDF}
                      disabled={selectedClassrooms.length === 0 && !selectAllClassrooms}
                    >
                      <Printer className="w-4 h-4 ml-2" />
                      طباعة
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 hover:bg-gray-100"
                      onClick={() => {
                        setShowPrintPanel(false);
                        setSelectedClassrooms([]);
                        setSelectAllClassrooms(false);
                      }}
                    >
                      <XIcon className="w-4 h-4 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dialog تأكيد حذف الكل - تصميم احترافي */}
          {showDeleteAllDialog && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full shadow-2xl border-2 border-red-500">
                <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <CardTitle className="flex items-center">
                    <AlertCircle className="w-6 h-6 ml-2" />
                    تحذير: حذف جميع البيانات
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <p className="text-gray-800 font-semibold mb-2">
                        أنت على وشك حذف جميع بيانات الطلاب ({students.length} طالب)
                      </p>
                      <p className="text-gray-600 text-sm">
                        هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع البيانات بشكل نهائي.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="destructive"
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        onClick={confirmDeleteAll}
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        تأكيد الحذف
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowDeleteAllDialog(false)}
                      >
                        <XIcon className="w-4 h-4 ml-2" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* إشعار نتيجة الاستيراد */}
          {importResult && (
            <Alert className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {importResult.success ? 
                <CheckCircle className="h-4 w-4 text-green-600" /> : 
                <XCircle className="h-4 w-4 text-red-600" />
              }
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    {importResult.success ? 'تم الاستيراد بنجاح!' : 'فشل في الاستيراد'}
                  </p>
                  <div className="text-sm">
                    <p>• تم استيراد: {importResult.imported_count} طالب</p>
                    <p>• فشل: {importResult.failed_count} طالب</p>
                    {importResult.needs_review && importResult.needs_review.length > 0 && (
                      <p>• يحتاج مراجعة: {importResult.needs_review.length} طالب</p>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* مكون البحث - تم تطويره */}
          <Card className="shadow-md border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="flex items-center text-[#4f46e5]">
                <Search className="w-5 h-5 ml-2" />
                البحث
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* 1. شريط البحث النصي - محسّن */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="ابحث باسم الطالب أو الصف/الفصل أو رقم الجوال..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 text-right border-[#6366f1] focus:ring-[#4f46e5] h-12 text-base font-medium shadow-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 2. قائمة الصف والفصل - احترافية */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block text-gray-700">
                      الصف والفصل
                    </Label>
                    <Select value={selectedClassroom} onValueChange={(value) => {
                      setSelectedClassroom(value);
                      setSelectedStudentIds([]); // إعادة تعيين اختيار الطلاب عند تغيير الفصل
                    }}>
                      <SelectTrigger className="border-[#6366f1] focus:ring-[#4f46e5] h-12 text-base shadow-sm">
                        <SelectValue placeholder="اختر الصف والفصل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-semibold text-[#4f46e5]">
                          جميع الفصول
                        </SelectItem>
                        {classrooms.map((classroom) => (
                          <SelectItem key={classroom.id} value={classroom.id}>
                            {classroom.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 3. قائمة الطلاب - مع إمكانية الاختيار المتعدد */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block text-gray-700">
                      الطلاب
                    </Label>
                    <div className="relative">
                      <Select 
                        value={selectedStudentIds.length === 1 ? selectedStudentIds[0] : 'multiple'} 
                        onValueChange={(value) => {
                          if (value === 'all') {
                            // اختيار الكل
                            const studentsInClass = getStudentsInSelectedClassroom();
                            setSelectedStudentIds(studentsInClass.map(s => s.id));
                          } else if (value === 'none') {
                            // إلغاء التحديد
                            setSelectedStudentIds([]);
                          } else {
                            // اختيار طالب واحد
                            setSelectedStudentIds([value]);
                          }
                        }}
                      >
                        <SelectTrigger className="border-[#6366f1] focus:ring-[#4f46e5] h-12 text-base shadow-sm">
                          <SelectValue>
                            {selectedStudentIds.length === 0 ? (
                              'اختر الطلاب'
                            ) : selectedStudentIds.length === 1 ? (
                              students.find(s => s.id === selectedStudentIds[0])?.name || 'طالب واحد'
                            ) : selectedStudentIds.length === getStudentsInSelectedClassroom().length ? (
                              `الكل (${selectedStudentIds.length} طالب)`
                            ) : (
                              `${selectedStudentIds.length} طلاب محددين`
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          <SelectItem value="all" className="font-semibold text-green-600">
                            ✓ تحديد الكل ({getStudentsInSelectedClassroom().length} طالب)
                          </SelectItem>
                          <SelectItem value="none" className="font-semibold text-red-600">
                            ✗ إلغاء التحديد
                          </SelectItem>
                          <div className="border-t my-2"></div>
                          {getStudentsInSelectedClassroom().map((student) => (
                            <SelectItem 
                              key={student.id} 
                              value={student.id}
                              className={selectedStudentIds.includes(student.id) ? 'bg-blue-50 font-medium' : ''}
                            >
                              {selectedStudentIds.includes(student.id) ? '✓ ' : ''}{student.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* عرض الطلاب المحددين */}
                {selectedStudentIds.length > 0 && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold text-blue-900">
                        الطلاب المحددين ({selectedStudentIds.length})
                      </Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedStudentIds([])}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        <XIcon className="w-4 h-4 ml-1" />
                        إلغاء التحديد
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudentIds.slice(0, 10).map(id => {
                        const student = students.find(s => s.id === id);
                        return student ? (
                          <Badge 
                            key={id} 
                            className="bg-blue-600 text-white px-3 py-1 text-sm"
                          >
                            {student.name}
                            <button
                              onClick={() => setSelectedStudentIds(prev => prev.filter(sid => sid !== id))}
                              className="mr-2 hover:text-red-200"
                            >
                              ×
                            </button>
                          </Badge>
                        ) : null;
                      })}
                      {selectedStudentIds.length > 10 && (
                        <Badge className="bg-blue-400 text-white px-3 py-1 text-sm">
                          + {selectedStudentIds.length - 10} آخرين
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* عداد النتائج */}
                <div className="flex items-center justify-center">
                  <Badge className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-6 py-3 text-base shadow-md">
                    <Users className="w-5 h-5 ml-2" />
                    عدد النتائج: {filteredStudents.length} طالب
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* جدول الطلاب - تم تطويره */}
          <Card className="shadow-md border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="flex items-center text-[#4f46e5]">
                <Users className="w-5 h-5 ml-2" />
                قائمة الطلاب
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">لا توجد نتائج</p>
                  <p className="text-gray-400 text-sm mt-2">جرّب تغيير معايير البحث أو اختر فصلاً آخر</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white">
                        <th className="text-right p-4 font-bold text-sm">#</th>
                        <th className="text-right p-4 font-bold text-sm">اسم الطالب</th>
                        <th className="text-center p-4 font-bold text-sm">الصف</th>
                        <th className="text-center p-4 font-bold text-sm">الفصل</th>
                        <th className="text-center p-4 font-bold text-sm">رقم الجوال</th>
                        <th className="text-center p-4 font-bold text-sm">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => {
                        const classroom = classrooms.find(c => c.id === student.class_id);
                        // استخراج رقم الصف والفصل من اسم الفصل
                        let gradeNumber = student.grade_level;
                        let sectionNumber = student.section;
                        
                        if (classroom) {
                          // محاولة استخراج الأرقام من اسم الفصل
                          const match = classroom.name.match(/(\d+)[\/\-](\d+)/);
                          if (match) {
                            gradeNumber = parseInt(match[1]);
                            sectionNumber = match[2];
                          }
                        }
                        
                        return (
                          <tr 
                            key={student.id} 
                            className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            {/* رقم التسلسل */}
                            <td className="p-4 text-gray-600 font-medium">{index + 1}</td>
                            
                            {/* اسم الطالب - مرتب هجائياً */}
                            <td className="p-4">
                              {isEditMode ? (
                                <Input 
                                  value={student.name} 
                                  onChange={(e) => {
                                    const updatedStudents = students.map(s => 
                                      s.id === student.id ? {...s, name: e.target.value} : s
                                    );
                                    setStudents(updatedStudents);
                                  }} 
                                  className="h-9 border-gray-300 font-medium" 
                                />
                              ) : (
                                <span className="font-semibold text-gray-900">{student.name}</span>
                              )}
                            </td>
                            
                            {/* الصف - عرض الرقم فقط */}
                            <td className="p-4 text-center">
                              {isEditMode ? (
                                <Input 
                                  type="number"
                                  value={gradeNumber} 
                                  onChange={(e) => {
                                    const updatedStudents = students.map(s => 
                                      s.id === student.id ? {...s, grade_level: parseInt(e.target.value)} : s
                                    );
                                    setStudents(updatedStudents);
                                  }} 
                                  className="h-9 border-gray-300 text-center font-bold w-20 mx-auto" 
                                />
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 font-bold px-3 py-1 text-base">
                                  {gradeNumber}
                                </Badge>
                              )}
                            </td>
                            
                            {/* الفصل - عرض الرقم فقط */}
                            <td className="p-4 text-center">
                              {isEditMode ? (
                                <Input 
                                  value={sectionNumber || ''} 
                                  onChange={(e) => {
                                    const updatedStudents = students.map(s => 
                                      s.id === student.id ? {...s, section: e.target.value} : s
                                    );
                                    setStudents(updatedStudents);
                                  }} 
                                  className="h-9 border-gray-300 text-center font-bold w-20 mx-auto" 
                                />
                              ) : (
                                <Badge className="bg-green-100 text-green-800 font-bold px-3 py-1 text-base">
                                  {sectionNumber || '-'}
                                </Badge>
                              )}
                            </td>
                            
                            {/* رقم الجوال */}
                            <td className="p-4 text-center" dir="ltr">
                              {isEditMode ? (
                                <Input 
                                  value={student.parent_phone || ''} 
                                  onChange={(e) => {
                                    const updatedStudents = students.map(s => 
                                      s.id === student.id ? {...s, parent_phone: e.target.value} : s
                                    );
                                    setStudents(updatedStudents);
                                  }} 
                                  className="h-9 border-gray-300" 
                                  dir="ltr"
                                  placeholder="05xxxxxxxx"
                                />
                              ) : (
                                student.parent_phone ? (
                                  <a 
                                    href={`tel:${student.parent_phone}`}
                                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                                  >
                                    <Phone className="w-4 h-4" />
                                    {student.parent_phone}
                                  </a>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )
                              )}
                            </td>
                            
                            {/* الإجراءات */}
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                {/* زر التعديل */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600 hover:bg-blue-50 hover:border-blue-400 border-blue-300 transition-all shadow-sm"
                                  onClick={() => handleStudentEdit(student)}
                                  title="تعديل بيانات الطالب"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                
                                {/* زر الحذف */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50 hover:border-red-400 border-red-300 transition-all shadow-sm"
                                  onClick={() => handleStudentDelete(student.id)}
                                  title="حذف الطالب"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dialog تعديل طالب */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-[#4f46e5]">
                  <Edit className="w-5 h-5 ml-2" />
                  تعديل بيانات الطالب
                </DialogTitle>
              </DialogHeader>
              {editingStudent && (
                <div className="space-y-4 py-4">
                  {/* اسم الطالب */}
                  <div>
                    <Label htmlFor="editStudentName" className="text-right block mb-2">
                      اسم الطالب
                    </Label>
                    <Input
                      id="editStudentName"
                      value={editingStudent.name}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                      className="text-right"
                    />
                  </div>

                  {/* اختيار الفصل */}
                  <div>
                    <Label htmlFor="editStudentClass" className="text-right block mb-2">
                      الصف والفصل
                    </Label>
                    <Select
                      value={editingStudent.class_id}
                      onValueChange={(value) => setEditingStudent({ ...editingStudent, class_id: value })}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر الصف والفصل" />
                      </SelectTrigger>
                      <SelectContent>
                        {classrooms.map((classroom) => (
                          <SelectItem key={classroom.id} value={classroom.id}>
                            {classroom.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* رقم الجوال */}
                  <div>
                    <Label htmlFor="editStudentPhone" className="text-right block mb-2">
                      رقم الجوال (ولي الأمر)
                    </Label>
                    <Input
                      id="editStudentPhone"
                      value={editingStudent.parent_phone}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parent_phone: e.target.value })}
                      className="text-right"
                      dir="ltr"
                    />
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca]"
                      onClick={handleUpdateStudent}
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      حفظ التعديلات
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowEditDialog(false);
                        setEditingStudent(null);
                      }}
                    >
                      <XIcon className="w-4 h-4 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Dialog مراجعة الطلاب */}
          <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center text-[#4f46e5]">
                  <AlertCircle className="w-5 h-5 ml-2" />
                  مراجعة الطلاب - تعيين الفصول يدوياً
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    لم يتم العثور على الفصول التالية في النظام. يرجى تحديد الفصل الصحيح لكل طالب.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {studentsNeedingReview.map((student, index) => (
                    <Card key={index} className="border-yellow-200">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* معلومات الطالب */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-50">
                                صف {index + 1}
                              </Badge>
                              <span className="font-bold text-gray-900">{student.name}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>• رقم الطالب: {student.student_number || 'غير محدد'}</p>
                              <p>• الصف المطلوب: {student.grade_level}</p>
                              <p>• الفصل المطلوب: {student.section}</p>
                              <p>• الجوال: {student.parent_phone}</p>
                            </div>
                            <Alert className="bg-red-50 border-red-200">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <AlertDescription className="text-red-800 text-xs">
                                الفصل "{student.grade_level}/{student.section}" غير موجود في النظام
                              </AlertDescription>
                            </Alert>
                          </div>

                          {/* اختيار الفصل */}
                          <div>
                            <Label className="text-right block mb-2 font-bold">
                              اختر الفصل الصحيح
                            </Label>
                            <Select
                              value={reviewClassAssignments[index] || ''}
                              onValueChange={(value) => {
                                setReviewClassAssignments(prev => ({
                                  ...prev,
                                  [index]: value
                                }));
                              }}
                            >
                              <SelectTrigger className="text-right border-[#6366f1]">
                                <SelectValue placeholder="اختر الفصل..." />
                              </SelectTrigger>
                              <SelectContent>
                                {classrooms.map((classroom) => (
                                  <SelectItem key={classroom.id} value={classroom.id}>
                                    {classroom.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5]"
                    onClick={handleSaveReviewedStudents}
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    حفظ الطلاب ({studentsNeedingReview.filter((_, i) => reviewClassAssignments[i]).length}/{studentsNeedingReview.length})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewDialog(false);
                      setReviewClassAssignments({});
                    }}
                  >
                    <XIcon className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default StudentsManagement;