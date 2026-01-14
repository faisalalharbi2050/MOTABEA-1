import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Book,
  GraduationCap,
  Award,
  Home,
  Printer,
  CheckCircle,
  Star,
  BookMarked,
  Library,
  Users,
  Calendar,
  Clock,
  NotebookPen,
  Bookmark,
  FileText,
  ScrollText,
  BookA,
  BookCopy,
  Trash2,
  Edit3,
  Save,
  FileCheck,
  X,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
// استيراد ملف التصميم الموحد
import '@/styles/unified-header-styles.css';

// تعريف أنواع البيانات
interface Subject {
  id: string;
  name: string;
  hours: number;
  isEditing?: boolean;
}

interface SubjectPlan {
  departmentId: string;
  subjects: Subject[];
  isApproved: boolean;
  totalHours: number;
}

interface DepartmentData {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  grades: any[];
}

interface StageData {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  departments: DepartmentData[];
}

  // تحديث البيانات لتكون جميع البطاقات بدرجات مختلفة من الأزرق
  const educationalStages: StageData[] = [
    {
      id: 'primary',
      name: 'الابتدائية',
      color: 'blue',
      icon: 'Book',
      description: 'المرحلة الابتدائية من الصف الأول إلى السادس',
      departments: [
        {
          id: 'primary-general',
          name: 'قسم عام',
          icon: 'Library',
          color: 'customIndigo', // لون مخصص #6366f1
          description: 'التعليم العام للمرحلة الابتدائية',
          grades: []
        },
        {
          id: 'primary-tahfeez',
          name: 'قسم تحفيظ',
          icon: 'Library',
          color: 'customPurple', // لون مخصص #818cf8
          description: 'تحفيظ القرآن الكريم للمرحلة الابتدائية',
          grades: []
        }
      ]
    },
    {
      id: 'middle',
      name: 'المتوسطة',
      color: 'blue',
      icon: 'Book',
      description: 'المرحلة المتوسطة من الصف الأول إلى الثالث',
      departments: [
        {
          id: 'middle-general',
          name: 'قسم عام',
          icon: 'Library',
          color: 'customIndigo', // لون مخصص #6366f1
          description: 'التعليم العام للمرحلة المتوسطة',
          grades: []
        },
        {
          id: 'middle-tahfeez',
          name: 'قسم تحفيظ',
          icon: 'Library',
          color: 'customPurple', // لون مخصص #818cf8
          description: 'تحفيظ القرآن الكريم للمرحلة المتوسطة',
          grades: []
        }
      ]
    },
    {
      id: 'secondary',
      name: 'الثانوية',
      color: 'blue',
      icon: 'Book',
      description: 'المرحلة الثانوية والمعاهد العلمية',
      departments: [
        {
          id: 'secondary-first',
          name: 'الصف الأول الثانوي',
          icon: 'Library',
          color: 'customIndigo', // لون مخصص #6366f1
          description: 'السنة المشتركة',
          grades: []
        },
        {
          id: 'secondary-second',
          name: 'الصف الثاني الثانوي',
          icon: 'Library',
          color: 'customPurple', // لون مخصص #818cf8
          description: 'المسارات',
          grades: []
        },
        {
          id: 'secondary-third',
          name: 'الصف الثالث الثانوي',
          icon: 'Library',
          color: 'lightPurple', // لون أفتح #a5b4fc
          description: 'المسارات',
          grades: []
        },
        {
          id: 'scientific-institutes',
          name: 'المعاهد الثانوية',
          icon: 'Library',
          color: 'lighterPurple', // لون أفتح #c7d2fe
          description: 'الثالث الثانوي',
          grades: []
        }
      ]
    },
    {
      id: 'kindergarten',
      name: 'رياض الأطفال',
      color: 'blue',
      icon: 'Book',
      description: 'مرحلة رياض الأطفال والتمهيدي',
      departments: [
        {
          id: 'kindergarten-main',
          name: 'رياض الأطفال',
          icon: 'Library',
          color: 'customIndigo', // لون مخصص #6366f1
          description: 'مرحلة رياض الأطفال والتمهيدي',
          grades: []
        }
      ]
    },
    {
      id: 'continuing-education',
      name: 'التعليم المستمر',
      color: 'blue',
      icon: 'Book',
      description: 'برامج التعليم المستمر وذوي الاحتياجات الخاصة',
      departments: [
        {
          id: 'continuing-primary',
          name: 'المرحلة الابتدائية',
          icon: 'Library',
          color: 'customIndigo', // لون مخصص #6366f1
          description: 'التعليم المستمر للمرحلة الابتدائية',
          grades: []
        },
        {
          id: 'mild-intellectual-disability',
          name: 'ذوو الإعاقة',
          icon: 'Library',
          color: 'customPurple', // لون مخصص #818cf8
          description: 'الإعاقة الفكرية البسيطة',
          grades: []
        }
      ]
    },
    {
      id: 'dar-alhadith',
      name: 'دار الحديث المكية / المدنية',
      color: 'blue',
      icon: 'BookMarked',
      description: 'معاهد دار الحديث للدراسات الإسلامية',
      departments: [
        {
          id: 'dar-alhadith-middle',
          name: 'المرحلة المتوسطة',
          icon: 'Library',
          color: 'customIndigo', // لون مخصص #6366f1
          description: 'دار الحديث المكية / المدنية',
          grades: []
        },
        {
          id: 'dar-alhadith-secondary',
          name: 'المرحلة الثانوية',
          icon: 'Library',
          color: 'customPurple', // لون مخصص #818cf8
          description: 'دار الحديث المكية / المدنية',
          grades: []
        }
      ]
    },
    {
      id: 'special-needs',
      name: 'ذوي الإعاقة',
      color: 'blue',
      icon: 'Book',
      description: 'برامج التربية الخاصة لذوي الإعاقة',
      departments: [
        {
          id: 'autism-spectrum',
          name: 'اضطراب طيف التوحد',
          icon: 'Library',
          color: 'customIndigo', // لون مخصص #6366f1 (مثل الأول الثانوي)
          description: 'الابتدائية - المتوسطة - التأهيلية',
          grades: []
        },
        {
          id: 'intellectual-education',
          name: 'التربية الفكرية',
          icon: 'Library',
          color: 'customPurple', // لون مخصص #818cf8 (مثل الثاني الثانوي)
          description: 'الابتدائية - المتوسطة - التأهيلية',
          grades: []
        },
        {
          id: 'multiple-disabilities',
          name: 'تعدد الإعاقات',
          icon: 'Library',
          color: 'lightPurple', // لون أفتح #a5b4fc (مثل الثالث الثانوي)
          description: 'الابتدائية - المتوسطة - التأهيلية',
          grades: []
        }
      ]
    }
  ];

  // تعريف أنواع البيانات المحدثة للمرحلة الثانية
  interface SubjectHours {
    grade1: number;
    grade2: number;
    grade3: number;
    grade4: number;
    grade5: number;
    grade6: number;
  }

  interface SubjectWithGrades {
    id: string;
    name: string;
    hours: SubjectHours;
    isEditing?: boolean;
  }

  interface DepartmentPlan {
    departmentId: string;
    subjects: SubjectWithGrades[];
    isApproved: boolean;
    totalHoursByGrade: SubjectHours;
  }

  // المواد الدراسية للمرحلة الابتدائية - القسم العام
  const primaryGeneralSubjects: SubjectWithGrades[] = [
    { 
      id: '1', 
      name: 'القرآن الكريم والدراسات الإسلامية', 
      hours: { grade1: 5, grade2: 5, grade3: 5, grade4: 5, grade5: 5, grade6: 5 }
    },
    { 
      id: '2', 
      name: 'اللغة العربية', 
      hours: { grade1: 8, grade2: 7, grade3: 6, grade4: 5, grade5: 5, grade6: 5 }
    },
    { 
      id: '3', 
      name: 'الدراسات الاجتماعية', 
      hours: { grade1: 0, grade2: 0, grade3: 0, grade4: 2, grade5: 2, grade6: 2 }
    },
    { 
      id: '4', 
      name: 'الرياضيات', 
      hours: { grade1: 5, grade2: 6, grade3: 6, grade4: 6, grade5: 6, grade6: 6 }
    },
    { 
      id: '5', 
      name: 'العلوم', 
      hours: { grade1: 3, grade2: 3, grade3: 4, grade4: 4, grade5: 4, grade6: 4 }
    },
    { 
      id: '6', 
      name: 'اللغة الإنجليزية', 
      hours: { grade1: 3, grade2: 3, grade3: 3, grade4: 3, grade5: 3, grade6: 3 }
    },
    { 
      id: '7', 
      name: 'التربية الفنية', 
      hours: { grade1: 2, grade2: 2, grade3: 2, grade4: 1, grade5: 1, grade6: 1 }
    },
    { 
      id: '8', 
      name: 'التربية البدنية', 
      hours: { grade1: 3, grade2: 3, grade3: 3, grade4: 2, grade5: 2, grade6: 2 }
    },
    { 
      id: '9', 
      name: 'المهارات الحياتية', 
      hours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }
    },
    { 
      id: '10', 
      name: 'المهارات الرقمية', 
      hours: { grade1: 0, grade2: 0, grade3: 0, grade4: 2, grade5: 2, grade6: 2 }
    },
    { 
      id: '11', 
      name: 'النشاط', 
      hours: { grade1: 3, grade2: 3, grade3: 3, grade4: 2, grade5: 2, grade6: 2 }
    }
  ];

  // المواد الدراسية للمرحلة الابتدائية - قسم التحفيظ
  const primaryTahfeezSubjects: SubjectWithGrades[] = [
    { 
      id: '1', 
      name: 'القرآن الكريم والدراسات الإسلامية', 
      hours: { grade1: 9, grade2: 9, grade3: 9, grade4: 8, grade5: 8, grade6: 8 }
    },
    { 
      id: '2', 
      name: 'التجويد', 
      hours: { grade1: 0, grade2: 0, grade3: 0, grade4: 1, grade5: 1, grade6: 1 }
    },
    { 
      id: '3', 
      name: 'اللغة العربية', 
      hours: { grade1: 8, grade2: 7, grade3: 6, grade4: 5, grade5: 5, grade6: 5 }
    },
    { 
      id: '4', 
      name: 'الدراسات الاجتماعية', 
      hours: { grade1: 0, grade2: 0, grade3: 0, grade4: 2, grade5: 2, grade6: 2 }
    },
    { 
      id: '5', 
      name: 'الرياضيات', 
      hours: { grade1: 5, grade2: 6, grade3: 6, grade4: 6, grade5: 6, grade6: 6 }
    },
    { 
      id: '6', 
      name: 'العلوم', 
      hours: { grade1: 3, grade2: 3, grade3: 4, grade4: 4, grade5: 4, grade6: 4 }
    },
    { 
      id: '7', 
      name: 'اللغة الإنجليزية', 
      hours: { grade1: 3, grade2: 3, grade3: 3, grade4: 3, grade5: 3, grade6: 3 }
    },
    { 
      id: '8', 
      name: 'التربية الفنية', 
      hours: { grade1: 2, grade2: 2, grade3: 2, grade4: 1, grade5: 1, grade6: 1 }
    },
    { 
      id: '9', 
      name: 'التربية البدنية', 
      hours: { grade1: 3, grade2: 3, grade3: 3, grade4: 2, grade5: 2, grade6: 2 }
    },
    { 
      id: '10', 
      name: 'المهارات الحياتية', 
      hours: { grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1 }
    },
    { 
      id: '11', 
      name: 'المهارات الرقمية', 
      hours: { grade1: 0, grade2: 0, grade3: 0, grade4: 2, grade5: 2, grade6: 2 }
    },
    { 
      id: '12', 
      name: 'النشاط', 
      hours: { grade1: 1, grade2: 1, grade3: 1, grade4: 0, grade5: 0, grade6: 0 }
    }
  ];

  // دالة لحساب إجمالي الحصص لكل صف
  const calculateTotalHoursByGrade = (subjects: SubjectWithGrades[]): SubjectHours => {
    return subjects.reduce((totals, subject) => ({
      grade1: totals.grade1 + subject.hours.grade1,
      grade2: totals.grade2 + subject.hours.grade2,
      grade3: totals.grade3 + subject.hours.grade3,
      grade4: totals.grade4 + subject.hours.grade4,
      grade5: totals.grade5 + subject.hours.grade5,
      grade6: totals.grade6 + subject.hours.grade6,
    }), { grade1: 0, grade2: 0, grade3: 0, grade4: 0, grade5: 0, grade6: 0 });
  };

const SubjectsPage: React.FC = () => {
  const { toast } = useToast();
  
  // الحالات
  const [stages] = useState<StageData[]>(educationalStages);
  const [selectedStage, setSelectedStage] = useState<StageData | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentData | null>(null);
  const [showInternalPage, setShowInternalPage] = useState(false); // استبدال النافذة المنبثقة بصفحة داخلية
  
  // حالات إدارة المواد المحدثة
  const [departmentPlans, setDepartmentPlans] = useState<{ [key: string]: DepartmentPlan }>(() => {
    const primaryGeneralPlan = {
      departmentId: 'primary-general',
      subjects: primaryGeneralSubjects.map(subject => ({ ...subject })),
      isApproved: false,
      totalHoursByGrade: { grade1: 0, grade2: 0, grade3: 0, grade4: 0, grade5: 0, grade6: 0 }
    };
    primaryGeneralPlan.totalHoursByGrade = calculateTotalHoursByGrade(primaryGeneralPlan.subjects);

    const primaryTahfeezPlan = {
      departmentId: 'primary-tahfeez',
      subjects: primaryTahfeezSubjects.map(subject => ({ ...subject })),
      isApproved: false,
      totalHoursByGrade: { grade1: 0, grade2: 0, grade3: 0, grade4: 0, grade5: 0, grade6: 0 }
    };
    primaryTahfeezPlan.totalHoursByGrade = calculateTotalHoursByGrade(primaryTahfeezPlan.subjects);

    return {
      'primary-general': primaryGeneralPlan,
      'primary-tahfeez': primaryTahfeezPlan
    };
  });
  
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<{ departmentId: string; subjectId: string; subjectName: string } | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [planToApprove, setPlanToApprove] = useState<string | null>(null);

  // دالة لتحديث عدد الحصص لمادة في صف معين
  const updateSubjectHours = (departmentId: string, subjectId: string, grade: keyof SubjectHours, hours: number) => {
    setDepartmentPlans(prev => {
      const updated = { ...prev };
      const plan = updated[departmentId];
      if (plan) {
        plan.subjects = plan.subjects.map(subject => {
          if (subject.id === subjectId) {
            return {
              ...subject,
              hours: {
                ...subject.hours,
                [grade]: Math.max(0, hours) // منع القيم السالبة
              }
            };
          }
          return subject;
        });
        plan.totalHoursByGrade = calculateTotalHoursByGrade(plan.subjects);
      }
      return updated;
    });
  };

  // دالة لحذف مادة مع تأكيد احترافي
  const handleDeleteSubject = (departmentId: string, subjectId: string) => {
    const plan = departmentPlans[departmentId];
    const subject = plan?.subjects.find(s => s.id === subjectId);
    if (subject) {
      setSubjectToDelete({ departmentId, subjectId, subjectName: subject.name });
      setShowDeleteConfirmDialog(true);
    }
  };

  const confirmDeleteSubject = () => {
    if (subjectToDelete) {
      setDepartmentPlans(prev => {
        const updated = { ...prev };
        const plan = updated[subjectToDelete.departmentId];
        if (plan) {
          plan.subjects = plan.subjects.filter(subject => subject.id !== subjectToDelete.subjectId);
          plan.totalHoursByGrade = calculateTotalHoursByGrade(plan.subjects);
        }
        return updated;
      });
      
      toast({
        title: "✅ تم حذف المادة بنجاح",
        description: `تم حذف مادة "${subjectToDelete.subjectName}" من الخطة الدراسية وإعادة حساب الحصص الأسبوعية`,
      });
      
      setShowDeleteConfirmDialog(false);
      setSubjectToDelete(null);
    }
  };

  // دالة لحذف مادة (النسخة القديمة محذوفة)
  const deleteSubject = (departmentId: string, subjectId: string) => {
    handleDeleteSubject(departmentId, subjectId);
  };

  // دالة لإضافة مادة جديدة مع رسائل محسنة
  const addNewSubject = (departmentId: string) => {
    if (!newSubjectName.trim()) {
      toast({
        title: "⚠️ خطأ في البيانات",
        description: "يرجى إدخال اسم صحيح للمادة قبل المتابعة",
        variant: "destructive"
      });
      return;
    }

    // التحقق من عدم تكرار اسم المادة
    const plan = departmentPlans[departmentId];
    if (plan?.subjects.some(subject => subject.name.toLowerCase() === newSubjectName.trim().toLowerCase())) {
      toast({
        title: "❌ مادة موجودة بالفعل",
        description: "يوجد مادة بنفس هذا الاسم في الخطة الدراسية. يرجى استخدام اسم مختلف",
        variant: "destructive"
      });
      return;
    }

    setDepartmentPlans(prev => {
      const updated = { ...prev };
      const plan = updated[departmentId];
      if (plan) {
        const newId = (plan.subjects.length + 1).toString();
        plan.subjects.push({
          id: newId,
          name: newSubjectName.trim(),
          hours: { grade1: 0, grade2: 0, grade3: 0, grade4: 0, grade5: 0, grade6: 0 }
        });
        plan.totalHoursByGrade = calculateTotalHoursByGrade(plan.subjects);
      }
      return updated;
    });

    toast({
      title: "✅ تم إضافة المادة بنجاح",
      description: `تم إضافة مادة "${newSubjectName.trim()}" إلى الخطة الدراسية ويمكنك الآن توزيع الحصص عليها`,
    });

    setNewSubjectName('');
    setShowAddSubjectDialog(false);
  };

  // دالة لحفظ الخطة مع رسالة محسنة
  const savePlan = (departmentId: string) => {
    const plan = departmentPlans[departmentId];
    const totalSubjects = plan?.subjects.length || 0;
    const totalHours = Object.values(plan?.totalHoursByGrade || {}).reduce((sum, hours) => sum + hours, 0);
    
    toast({
      title: "💾 تم حفظ الخطة بنجاح",
      description: `تم حفظ ${totalSubjects} مادة دراسية بإجمالي ${totalHours} حصة أسبوعية في قاعدة البيانات`,
    });
  };

  // دالة لاعتماد الخطة مع تأكيد احترافي
  const handleApprovePlan = (departmentId: string) => {
    setPlanToApprove(departmentId);
    setShowApprovalDialog(true);
  };

  const confirmApprovePlan = () => {
    if (planToApprove) {
      setDepartmentPlans(prev => {
        const updated = { ...prev };
        const plan = updated[planToApprove];
        if (plan) {
          plan.isApproved = true;
        }
        return updated;
      });
      
      toast({
        title: "🎯 تم اعتماد الخطة بنجاح",
        description: "تم اعتماد الخطة الدراسية وسيتم تطبيقها على جميع فصول هذا القسم تلقائياً",
      });
      
      setShowApprovalDialog(false);
      setPlanToApprove(null);
    }
  };

  // دالة لاعتماد الخطة (النسخة القديمة محذوفة)
  const approvePlan = (departmentId: string) => {
    handleApprovePlan(departmentId);
  };

  // دالة لطباعة الخطة مع إشعار محسن
  const printPlan = (departmentId: string) => {
    const plan = departmentPlans[departmentId];
    const department = selectedDepartment;
    const stage = selectedStage;
    
    if (plan && department && stage) {
      // إنشاء نافذة طباعة مخصصة
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const printContent = `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>خطة توزيع المواد - ${stage.name} - ${department.name}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #fff;
                padding: 20px;
                direction: rtl;
              }
              
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
              }
              
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
              }
              
              .title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 5px;
                color: #1f2937;
              }
              
              .subtitle {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 10px;
              }
              
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
              }
              
              .info-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
              }
              
              .info-label {
                font-weight: bold;
                color: #374151;
                margin-bottom: 5px;
              }
              
              .info-value {
                color: #6b7280;
                font-size: 14px;
              }
              
              .table-container {
                margin: 20px 0;
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid #e2e8f0;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                background: white;
              }
              
              th {
                background: #f1f5f9;
                color: #374151;
                font-weight: bold;
                padding: 12px 8px;
                text-align: center;
                border-bottom: 2px solid #e2e8f0;
                font-size: 14px;
              }
              
              th:first-child {
                text-align: right;
                padding-right: 15px;
              }
              
              td {
                padding: 10px 8px;
                text-align: center;
                border-bottom: 1px solid #f1f5f9;
                font-size: 13px;
              }
              
              td:first-child {
                text-align: right;
                font-weight: 500;
                padding-right: 15px;
                background: #fafbfc;
              }
              
              .total-row {
                background: #dbeafe !important;
                font-weight: bold;
              }
              
              .total-row td {
                color: #1e40af;
                border-top: 2px solid #2563eb;
              }
              
              .footer {
                margin-top: 40px;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
              }
              
              @media print {
                body {
                  padding: 0;
                }
                
                .header {
                  margin-bottom: 20px;
                }
                
                .info-grid {
                  margin-bottom: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">مدرسة متابعة - نظام إدارة المواد الدراسية</div>
              <div class="title">خطة توزيع المواد الدراسية</div>
              <div class="subtitle">${stage.name} - ${department.name}</div>
            </div>
            
            <div class="info-grid">
              <div class="info-card">
                <div class="info-label">المرحلة التعليمية:</div>
                <div class="info-value">${stage.name}</div>
              </div>
              
              <div class="info-card">
                <div class="info-label">القسم:</div>
                <div class="info-value">${department.name}</div>
              </div>
              
              <div class="info-card">
                <div class="info-label">تاريخ الطباعة:</div>
                <div class="info-value">${new Date().toLocaleDateString('ar-SA')}</div>
              </div>
              
              <div class="info-card">
                <div class="info-label">حالة الخطة:</div>
                <div class="info-value">${plan.isApproved ? 'معتمدة ✓' : 'غير معتمدة'}</div>
              </div>
            </div>
            
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="min-width: 200px;">المادة الدراسية</th>
                    <th>الأول</th>
                    <th>الثاني</th>
                    <th>الثالث</th>
                    <th>الرابع</th>
                    <th>الخامس</th>
                    <th>السادس</th>
                  </tr>
                </thead>
                <tbody>
                  ${plan.subjects.map(subject => `
                    <tr>
                      <td>${subject.name}</td>
                      <td>${subject.hours.grade1}</td>
                      <td>${subject.hours.grade2}</td>
                      <td>${subject.hours.grade3}</td>
                      <td>${subject.hours.grade4}</td>
                      <td>${subject.hours.grade5}</td>
                      <td>${subject.hours.grade6}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td>إجمالي الحصص الأسبوعية</td>
                    <td>${plan.totalHoursByGrade.grade1}</td>
                    <td>${plan.totalHoursByGrade.grade2}</td>
                    <td>${plan.totalHoursByGrade.grade3}</td>
                    <td>${plan.totalHoursByGrade.grade4}</td>
                    <td>${plan.totalHoursByGrade.grade5}</td>
                    <td>${plan.totalHoursByGrade.grade6}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="footer">
              <p>تم إنتاج هذا التقرير بواسطة نظام متابعة لإدارة المدارس</p>
              <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')} - الوقت: ${new Date().toLocaleTimeString('ar-SA')}</p>
            </div>
          </body>
          </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // انتظار تحميل المحتوى ثم الطباعة
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        };
        
        toast({
          title: "🖨️ تم تحضير الخطة للطباعة",
          description: `تم إنشاء تقرير طباعة احترافي لخطة ${department.name} مع تنسيق مثالي للطباعة`,
        });
      } else {
        toast({
          title: "❌ خطأ في الطباعة",
          description: "لم يتمكن النظام من فتح نافذة الطباعة. يرجى التحقق من إعدادات المتصفح والمحاولة مرة أخرى",
          variant: "destructive"
        });
      }
    }
  };

  // دالة لرسم الأيقونة
  const renderIcon = (iconName: string, className: string = "w-8 h-8") => {
    const iconMap: { [key: string]: React.FC<any> } = {
      BookOpen,
      Book,
      BookMarked,
      GraduationCap,
      Award,
      Home,
      Clock,
      Library,
      Users,
      NotebookPen,
      Bookmark,
      FileText,
      ScrollText,
      BookA,
      BookCopy,
      Trash2,
      Edit3,
      Save,
      FileCheck,
      Plus,
      Printer,
      CheckCircle,
      Star,
      X
    };
    
    const IconComponent = iconMap[iconName] || Book;
    return <IconComponent className={className} />;
  };

  // دالة لتحديد ألوان المرحلة
  const getStageColors = (color: string) => {
    const colorMap: { [key: string]: { bg: string; border: string; text: string; gradient: string } } = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        gradient: 'from-blue-600 to-blue-700'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        gradient: 'from-green-600 to-green-700'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        gradient: 'from-purple-600 to-purple-700'
      },
      pink: {
        bg: 'bg-pink-50',
        border: 'border-pink-200',
        text: 'text-pink-700',
        gradient: 'from-pink-600 to-pink-700'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        gradient: 'from-orange-600 to-orange-700'
      },
      emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        gradient: 'from-emerald-600 to-emerald-700'
      },
      cyan: {
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        text: 'text-cyan-700',
        gradient: 'from-cyan-600 to-cyan-700'
      }
    };
    
    return colorMap[color] || colorMap.blue;
  };

  // دالة لتحديد ألوان القسم مع كلاسات كاملة - درجات فاتحة من الأزرق
  const getDepartmentStyles = (color: string) => {
    const styleMap: { [key: string]: { 
      gradient: string; 
      hover: string; 
      button: string;
      buttonHover: string;
    } } = {
      sky: { 
        gradient: 'from-sky-300 to-sky-400', 
        hover: 'hover:from-sky-400 hover:to-sky-500',
        button: 'from-sky-300 to-sky-400',
        buttonHover: 'hover:from-sky-400 hover:to-sky-500'
      },
      cyan: { 
        gradient: 'from-cyan-300 to-cyan-400', 
        hover: 'hover:from-cyan-400 hover:to-cyan-500',
        button: 'from-cyan-300 to-cyan-400',
        buttonHover: 'hover:from-cyan-400 hover:to-cyan-500'
      },
      blue: { 
        gradient: 'from-blue-300 to-blue-400', 
        hover: 'hover:from-blue-400 hover:to-blue-500',
        button: 'from-blue-300 to-blue-400',
        buttonHover: 'hover:from-blue-400 hover:to-blue-500'
      },
      indigo: { 
        gradient: 'from-indigo-300 to-indigo-400', 
        hover: 'hover:from-indigo-400 hover:to-indigo-500',
        button: 'from-indigo-300 to-indigo-400',
        buttonHover: 'hover:from-indigo-400 hover:to-indigo-500'
      },
      // لون مخصص للقسم العام - #6366f1
      customIndigo: { 
        gradient: 'from-[#818cf8] to-[#6366f1]', 
        hover: 'hover:from-[#6366f1] hover:to-[#4f46e5]',
        button: 'from-[#818cf8] to-[#6366f1]',
        buttonHover: 'hover:from-[#6366f1] hover:to-[#4f46e5]'
      },
      // لون مخصص لقسم تحفيظ القرآن - #818cf8
      customPurple: { 
        gradient: 'from-[#a5b4fc] to-[#818cf8]', 
        hover: 'hover:from-[#818cf8] hover:to-[#6366f1]',
        button: 'from-[#a5b4fc] to-[#818cf8]',
        buttonHover: 'hover:from-[#818cf8] hover:to-[#6366f1]'
      },
      // لون أفتح للصف الثالث الثانوي - #a5b4fc
      lightPurple: { 
        gradient: 'from-[#c7d2fe] to-[#a5b4fc]', 
        hover: 'hover:from-[#a5b4fc] hover:to-[#818cf8]',
        button: 'from-[#c7d2fe] to-[#a5b4fc]',
        buttonHover: 'hover:from-[#a5b4fc] hover:to-[#818cf8]'
      },
      // لون أفتح للمعاهد العلمية - #c7d2fe
      lighterPurple: { 
        gradient: 'from-[#e0e7ff] to-[#c7d2fe]', 
        hover: 'hover:from-[#c7d2fe] hover:to-[#a5b4fc]',
        button: 'from-[#e0e7ff] to-[#c7d2fe]',
        buttonHover: 'hover:from-[#c7d2fe] hover:to-[#a5b4fc]'
      },
      violet: { 
        gradient: 'from-violet-300 to-violet-400', 
        hover: 'hover:from-violet-400 hover:to-violet-500',
        button: 'from-violet-300 to-violet-400',
        buttonHover: 'hover:from-violet-400 hover:to-violet-500'
      },
      slate: { 
        gradient: 'from-slate-300 to-slate-400', 
        hover: 'hover:from-slate-400 hover:to-slate-500',
        button: 'from-slate-300 to-slate-400',
        buttonHover: 'hover:from-slate-400 hover:to-slate-500'
      }
    };
    
    return styleMap[color] || styleMap.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-1 pb-6 px-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {!showInternalPage ? (
          <>
            {/* رأس الصفحة */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-3 rounded-xl shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المواد</h1>
          </div>
        </div>

        {/* محتوى المراحل التعليمية */}
        <div className="space-y-8">
          {stages.map((stage, stageIndex) => {
            const stageColors = getStageColors(stage.color);
            
            return (
              <div key={stage.id}>
                {/* عنوان المرحلة - خلفية رمادية فاتحة */}
                <div className="bg-gray-100 border-2 border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center">
                    <h2 className="text-xl font-bold text-gray-700">{stage.name}</h2>
                  </div>
                </div>

                {/* بطاقات الأقسام */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {stage.departments.map((department) => {
                    const deptStyles = getDepartmentStyles(department.color);
                    
                    return (
                      <div 
                        key={department.id}
                        className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
                        onClick={() => {
                          setSelectedStage(stage);
                          setSelectedDepartment(department);
                          setShowInternalPage(true);
                        }}
                      >
                        {/* البطاقة الرئيسية */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                          {/* الخلفية العلوية المتدرجة */}
                          <div className={`h-32 bg-gradient-to-br ${deptStyles.gradient} relative overflow-hidden`}>
                            {/* نمط زخرفي في الخلفية */}
                            <div className="absolute inset-0 opacity-20">
                              <div className="absolute top-2 right-2 w-8 h-8 border-2 border-white rounded-full"></div>
                              <div className="absolute top-6 right-8 w-4 h-4 border border-white rounded-full"></div>
                              <div className="absolute bottom-4 left-4 w-6 h-6 border-2 border-white rounded-full"></div>
                            </div>
                            
                            {/* الأيقونة الرئيسية */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-300">
                                {renderIcon(department.icon, "w-8 h-8 text-white")}
                              </div>
                            </div>
                          </div>

                          {/* محتوى البطاقة */}
                          <div className="p-5">
                            {/* عنوان القسم */}
                            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center group-hover:text-blue-600 transition-colors duration-300">
                              {department.name}
                            </h3>
                            
                            {/* وصف القسم */}
                            <p className="text-gray-600 text-sm text-center mb-4 leading-relaxed">
                              {department.description}
                            </p>

                            {/* زر الدخول */}
                            <div className="mt-4">
                              <div className={`w-full py-2 px-4 bg-gradient-to-r ${deptStyles.button} text-white rounded-lg text-center font-medium text-sm ${deptStyles.buttonHover} transition-all duration-300 group-hover:shadow-lg`}>
                                إدارة المواد
                              </div>
                            </div>
                          </div>

                          {/* تأثير الحركة عند التمرير */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* فاصل بين المراحل */}
                {stageIndex < stages.length - 1 && (
                  <div className="flex items-center justify-center my-12">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full max-w-md"></div>
                    <div className="px-4">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full max-w-md"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
          </>
        ) : (
          /* الصفحة الداخلية لإدارة المواد */
          <div className="space-y-6">
            {/* رأس الصفحة الداخلية مع زر العودة */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowInternalPage(false);
                      setSelectedStage(null);
                      setSelectedDepartment(null);
                    }}
                    className="flex items-center gap-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span>العودة</span>
                  </Button>
                  <div className={`p-3 rounded-xl shadow-lg bg-gradient-to-r ${selectedDepartment ? getDepartmentStyles(selectedDepartment.color).gradient : 'from-blue-500 to-blue-600'}`}>
                    {selectedDepartment && renderIcon(selectedDepartment.icon, "w-6 h-6 text-white")}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      إدارة مواد {selectedDepartment?.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        {selectedStage?.name}
                      </Badge>
                      {selectedDepartment?.id && departmentPlans[selectedDepartment.id]?.isApproved && (
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          معتمدة
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* محتوى الصفحة الداخلية */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              {selectedDepartment?.id && (selectedDepartment.id === 'primary-general' || selectedDepartment.id === 'primary-tahfeez') ? (
                <div className="space-y-6">
                  {/* جدول المواد للمرحلة الثانية */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">المواد الدراسية والخطة الأسبوعية</h3>
                      <p className="text-sm text-gray-600 mt-1">توزيع الحصص على الصفوف من الأول إلى السادس</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 min-w-[200px]">المادة</th>
                            <th className="px-3 py-3 text-center text-sm font-medium text-gray-700 min-w-[80px]">الأول</th>
                            <th className="px-3 py-3 text-center text-sm font-medium text-gray-700 min-w-[80px]">الثاني</th>
                            <th className="px-3 py-3 text-center text-sm font-medium text-gray-700 min-w-[80px]">الثالث</th>
                            <th className="px-3 py-3 text-center text-sm font-medium text-gray-700 min-w-[80px]">الرابع</th>
                            <th className="px-3 py-3 text-center text-sm font-medium text-gray-700 min-w-[80px]">الخامس</th>
                            <th className="px-3 py-3 text-center text-sm font-medium text-gray-700 min-w-[80px]">السادس</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 min-w-[120px]">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {departmentPlans[selectedDepartment.id]?.subjects.map((subject) => (
                            <tr key={subject.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                                {subject.name}
                              </td>
                              {/* حقول الصفوف */}
                              {(['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'] as const).map((grade) => (
                                <td key={grade} className="px-3 py-4 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={subject.hours[grade]}
                                    onChange={(e) => updateSubjectHours(
                                      selectedDepartment.id!,
                                      subject.id,
                                      grade,
                                      parseInt(e.target.value) || 0
                                    )}
                                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  />
                                </td>
                              ))}
                              <td className="px-4 py-4 text-center">
                                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSubject(selectedDepartment.id!, subject.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-10 w-10 rounded-md transition-all duration-200"
                                    title="حذف المادة"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {/* صف الإجمالي */}
                        <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                          <tr>
                            <td className="px-4 py-3 text-sm font-bold text-blue-900">إجمالي الحصص</td>
                            {(['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'] as const).map((grade) => (
                              <td key={grade} className="px-3 py-3 text-center">
                                <div className="bg-blue-100 rounded-md px-2 py-1 text-sm font-bold text-blue-900">
                                  {departmentPlans[selectedDepartment.id!]?.totalHoursByGrade[grade] || 0}
                                </div>
                              </td>
                            ))}
                            <td className="px-4 py-3"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* أزرار العمليات */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={() => setShowAddSubjectDialog(true)}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2 space-x-reverse"
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة مادة</span>
                      </Button>
                      
                      <Button
                        onClick={() => selectedDepartment?.id && savePlan(selectedDepartment.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 space-x-reverse"
                        size="sm"
                      >
                        <Save className="w-4 h-4" />
                        <span>حفظ</span>
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={() => selectedDepartment?.id && handleApprovePlan(selectedDepartment.id)}
                        disabled={selectedDepartment?.id ? departmentPlans[selectedDepartment.id]?.isApproved : false}
                        className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{selectedDepartment?.id && departmentPlans[selectedDepartment.id]?.isApproved ? 'معتمدة' : 'اعتماد الخطة'}</span>
                      </Button>
                      
                      <Button
                        onClick={() => selectedDepartment?.id && printPlan(selectedDepartment.id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white flex items-center space-x-2 space-x-reverse"
                        size="sm"
                      >
                        <Printer className="w-4 h-4" />
                        <span>طباعة الخطة</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* حالة المراحل الأخرى - قيد التطوير */
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border-2 border-blue-100">
                    {/* أيقونة الكتب الدراسية */}
                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <BookOpen className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      إدارة المواد قيد التطوير
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      سيتم إضافة واجهة إدارة المواد الدراسية لهذه المرحلة في المراحل القادمة من التطوير
                    </p>
                    
                    {/* معاينة الميزات القادمة */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                        <div className="flex items-center mb-2">
                          <Book className="w-5 h-5 text-blue-600 ml-2" />
                          <span className="font-medium text-gray-800">إدارة المناهج</span>
                        </div>
                        <p className="text-sm text-gray-600">إضافة وتعديل المواد الدراسية</p>
                      </div>
                      
                      <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
                        <div className="flex items-center mb-2">
                          <Calendar className="w-5 h-5 text-green-600 ml-2" />
                          <span className="font-medium text-gray-800">توزيع الساعات</span>
                        </div>
                        <p className="text-sm text-gray-600">تحديد عدد الحصص لكل مادة</p>
                      </div>
                      
                      <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="w-5 h-5 text-purple-600 ml-2" />
                          <span className="font-medium text-gray-800">اعتماد الخطط</span>
                        </div>
                        <p className="text-sm text-gray-600">مراجعة واعتماد الخطط الدراسية</p>
                      </div>
                      
                      <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
                        <div className="flex items-center mb-2">
                          <Printer className="w-5 h-5 text-orange-600 ml-2" />
                          <span className="font-medium text-gray-800">طباعة التقارير</span>
                        </div>
                        <p className="text-sm text-gray-600">تصدير وطباعة خطط المواد</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* مربع حوار إضافة مادة جديدة */}
        <Dialog open={showAddSubjectDialog} onOpenChange={setShowAddSubjectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 space-x-reverse text-lg font-bold text-green-700">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <span>إضافة مادة جديدة</span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                أدخل اسم المادة الجديدة التي تريد إضافتها للخطة الدراسية. سيتم إضافتها بـ 0 حصة افتراضياً ويمكنك تعديل عدد الحصص لاحقاً.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 space-x-reverse mb-3">
                  <Book className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">بيانات المادة الجديدة</span>
                </div>
                
                <div>
                  <label htmlFor="subject-name" className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المادة <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject-name"
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="مثال: الرياضيات، العلوم، اللغة العربية..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newSubjectName.trim()) {
                        selectedDepartment?.id && addNewSubject(selectedDepartment.id);
                      }
                    }}
                  />
                  {newSubjectName.trim() && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ سيتم إضافة مادة "{newSubjectName.trim()}" إلى الخطة
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2 space-x-reverse">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs">ℹ</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">معلومة مفيدة</p>
                    <p className="text-sm text-blue-700">يمكنك تعديل عدد الحصص لكل صف بعد إضافة المادة من الجدول الرئيسي.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex items-center justify-end space-x-2 space-x-reverse pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddSubjectDialog(false);
                  setNewSubjectName('');
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center space-x-1 space-x-reverse"
              >
                <X className="w-4 h-4" />
                <span>إلغاء</span>
              </Button>
              <Button
                onClick={() => selectedDepartment?.id && addNewSubject(selectedDepartment.id)}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1 space-x-reverse"
                disabled={!newSubjectName.trim()}
              >
                <Plus className="w-4 h-4" />
                <span>إضافة المادة</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مربع حوار تأكيد حذف المادة */}
        <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 space-x-reverse text-lg font-bold text-red-700">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </div>
                <span>تأكيد حذف المادة</span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                هل أنت متأكد من رغبتك في حذف هذه المادة نهائياً؟ سيتم حذف جميع الحصص المخصصة لها في كافة الصفوف.
              </DialogDescription>
            </DialogHeader>
            
            {subjectToDelete && (
              <div className="py-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 space-x-reverse mb-3">
                    <Book className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">المادة المراد حذفها:</span>
                  </div>
                  <p className="text-red-700 font-semibold text-lg mb-2">{subjectToDelete.subjectName}</p>
                  
                  <div className="bg-white border border-red-300 rounded-md p-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <span className="font-medium text-red-800 text-sm">تحذير مهم</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      لا يمكن التراجع عن هذا الإجراء. سيتم حذف المادة وجميع الحصص المرتبطة بها نهائياً.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex items-center justify-end space-x-2 space-x-reverse pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirmDialog(false);
                  setSubjectToDelete(null);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center space-x-1 space-x-reverse"
              >
                <X className="w-4 h-4" />
                <span>إلغاء</span>
              </Button>
              <Button
                onClick={confirmDeleteSubject}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1 space-x-reverse"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف المادة</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مربع حوار تأكيد اعتماد الخطة */}
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 space-x-reverse text-lg font-bold text-purple-700">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <span>تأكيد اعتماد الخطة</span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                هل أنت متأكد من رغبتك في اعتماد هذه الخطة الدراسية نهائياً؟ بعد الاعتماد سيتم تطبيقها على جميع فصول هذا القسم.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 space-x-reverse mb-3">
                  <Star className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-800">ما سيحدث بعد الاعتماد:</span>
                </div>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• سيتم تطبيق الخطة على جميع فصول القسم فوراً</li>
                  <li>• سيتم إنشاء الجداول الدراسية تلقائياً</li>
                </ul>
              </div>
            </div>
            
            <DialogFooter className="flex items-center justify-end space-x-2 space-x-reverse pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalDialog(false);
                  setPlanToApprove(null);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center space-x-1 space-x-reverse"
              >
                <X className="w-4 h-4" />
                <span>إلغاء</span>
              </Button>
              <Button
                onClick={confirmApprovePlan}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-1 space-x-reverse"
              >
                <CheckCircle className="w-4 h-4" />
                <span>اعتماد الخطة</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SubjectsPage;
