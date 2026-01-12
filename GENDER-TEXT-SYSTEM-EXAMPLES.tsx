/**
 * دليل استخدام نظام تحويل النصوص حسب نوع المدرسة
 * 
 * هذا الملف يوضح كيفية استخدام نظام تحويل النصوص من مذكر إلى مؤنث
 * في جميع صفحات المشروع بناءً على نوع المدرسة المختار (بنين/بنات)
 */

import React from 'react';
import { useSchool } from '../contexts/SchoolContext';

// ============================================
// مثال 1: صفحة المعلمين
// ============================================
const TeachersPage = () => {
  const { 
    getTeacherTitle,      // معلم / معلمة
    getTeachersTitle      // المعلمون / المعلمات
  } = useSchool();

  return (
    <div>
      {/* العنوان الرئيسي */}
      <h1>إدارة {getTeachersTitle()}</h1>
      
      {/* زر الإضافة */}
      <button>
        إضافة {getTeacherTitle()} جديد
      </button>
      
      {/* رسالة فارغة */}
      <p>لا يوجد {getTeachersTitle()} مسجلين حالياً</p>
      
      {/* عدد */}
      <span>عدد {getTeachersTitle()}: 25</span>
    </div>
  );
};

// ============================================
// مثال 2: صفحة الطلاب
// ============================================
const StudentsPage = () => {
  const { 
    getStudentTitle,      // طالب / طالبة
    getStudentsTitle      // الطلاب / الطالبات
  } = useSchool();

  return (
    <div>
      <h1>قائمة {getStudentsTitle()}</h1>
      
      <button>
        تسجيل {getStudentTitle()} جديد
      </button>
      
      <table>
        <thead>
          <tr>
            <th>اسم {getStudentTitle()}</th>
            <th>رقم {getStudentTitle()}</th>
            <th>الفصل</th>
          </tr>
        </thead>
      </table>
      
      <p>إجمالي {getStudentsTitle()}: 150</p>
    </div>
  );
};

// ============================================
// مثال 3: صفحة الإداريين
// ============================================
const AdminsPage = () => {
  const { 
    getAdminTitle,        // إداري / إدارية
    getAdminsTitle        // الإداريون / الإداريات
  } = useSchool();

  return (
    <div>
      <h1>{getAdminsTitle()}</h1>
      
      <button>
        إضافة {getAdminTitle()}
      </button>
      
      <p>لم يتم تسجيل أي {getAdminTitle()} بعد</p>
    </div>
  );
};

// ============================================
// مثال 4: صفحة الإرشاد الطلابي
// ============================================
const CounselingPage = () => {
  const { 
    getCounselorTitle     // مرشد / مرشدة
  } = useSchool();

  return (
    <div>
      <h1>قسم الإرشاد</h1>
      
      <div>
        <label>اسم {getCounselorTitle()} الطلابي:</label>
        <input type="text" placeholder={`أدخل اسم ${getCounselorTitle()}`} />
      </div>
      
      <p>تواصل مع {getCounselorTitle()} الطلابي</p>
    </div>
  );
};

// ============================================
// مثال 5: صفحة لوحة التحكم
// ============================================
const DashboardPage = () => {
  const { 
    getPrincipalTitle,     // مدير المدرسة / مديرة المدرسة
    getVicePrincipalTitle, // وكيل المدرسة / وكيلة المدرسة
    getSupervisorTitle,    // الموجه الطلابي / الموجهة الطلابية
    getTeachersTitle,
    getStudentsTitle,
    getAdminsTitle
  } = useSchool();

  return (
    <div>
      <h1>لوحة التحكم</h1>
      
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <h3>عدد {getTeachersTitle()}</h3>
          <p className="text-3xl">25</p>
        </div>
        
        <div className="card">
          <h3>عدد {getStudentsTitle()}</h3>
          <p className="text-3xl">150</p>
        </div>
        
        <div className="card">
          <h3>عدد {getAdminsTitle()}</h3>
          <p className="text-3xl">8</p>
        </div>
      </div>
      
      {/* معلومات الإدارة */}
      <div className="mt-6">
        <h2>الإدارة</h2>
        <p>{getPrincipalTitle()}: أحمد محمد</p>
        <p>{getVicePrincipalTitle()}: خالد علي</p>
        <p>{getSupervisorTitle()}: فهد سعيد</p>
      </div>
    </div>
  );
};

// ============================================
// مثال 6: استخدام getGenderedText مباشرة
// ============================================
const CustomPage = () => {
  const { getGenderedText } = useSchool();

  return (
    <div>
      {/* لأي نص مخصص */}
      <h1>{getGenderedText('المشرف التربوي', 'المشرفة التربوية')}</h1>
      
      <p>
        {getGenderedText('مسؤول الأنشطة', 'مسؤولة الأنشطة')}
      </p>
      
      <button>
        {getGenderedText('رئيس القسم', 'رئيسة القسم')}
      </button>
      
      {/* في الجداول */}
      <table>
        <thead>
          <tr>
            <th>{getGenderedText('اسم المعلم', 'اسم المعلمة')}</th>
            <th>{getGenderedText('المشرف', 'المشرفة')}</th>
            <th>{getGenderedText('المسؤول', 'المسؤولة')}</th>
          </tr>
        </thead>
      </table>
    </div>
  );
};

// ============================================
// مثال 7: استخدام في النماذج
// ============================================
const TeacherFormPage = () => {
  const { getTeacherTitle, getStudentsTitle } = useSchool();

  return (
    <form>
      <div>
        <label>اسم {getTeacherTitle()}:</label>
        <input 
          type="text" 
          placeholder={`أدخل اسم ${getTeacherTitle()}`} 
        />
      </div>
      
      <div>
        <label>التخصص:</label>
        <input type="text" />
      </div>
      
      <div>
        <label>عدد {getStudentsTitle()} في الفصل:</label>
        <input type="number" />
      </div>
      
      <button type="submit">
        حفظ بيانات {getTeacherTitle()}
      </button>
    </form>
  );
};

// ============================================
// مثال 8: استخدام في الرسائل والتنبيهات
// ============================================
const NotificationsPage = () => {
  const { 
    getTeacherTitle, 
    getStudentTitle,
    getTeachersTitle,
    getStudentsTitle 
  } = useSchool();

  const sendNotification = () => {
    const message = `تم إضافة ${getTeacherTitle()} جديد بنجاح`;
    alert(message);
  };

  const confirmDelete = () => {
    const confirmed = confirm(`هل أنت متأكد من حذف هذا ${getStudentTitle()}؟`);
    if (confirmed) {
      console.log('تم الحذف');
    }
  };

  return (
    <div>
      <h1>الإشعارات</h1>
      
      <div className="notification">
        <p>تم تسجيل 5 {getStudentsTitle()} جدد</p>
      </div>
      
      <div className="notification">
        <p>{getTeacherTitle()} محمد أحمد قام بتحديث الدرجات</p>
      </div>
      
      <div className="notification">
        <p>اجتماع {getTeachersTitle()} يوم الأحد</p>
      </div>
    </div>
  );
};

// ============================================
// مثال 9: استخدام في التقارير
// ============================================
const ReportsPage = () => {
  const { 
    getTeachersTitle,
    getStudentsTitle,
    getAdminsTitle 
  } = useSchool();

  return (
    <div>
      <h1>التقارير</h1>
      
      <div className="reports-menu">
        <button>تقرير {getTeachersTitle()}</button>
        <button>تقرير {getStudentsTitle()}</button>
        <button>تقرير {getAdminsTitle()}</button>
        <button>تقرير الحضور والغياب</button>
      </div>
      
      <div className="report-preview">
        <h2>تقرير {getTeachersTitle()} الشهري</h2>
        <p>عدد {getTeachersTitle()}: 25</p>
        <p>عدد {getStudentsTitle()}: 150</p>
        <p>نسبة الحضور: 95%</p>
      </div>
    </div>
  );
};

// ============================================
// مثال 10: استخدام في التصدير والطباعة
// ============================================
const PrintPage = () => {
  const { 
    getTeachersTitle,
    getStudentsTitle,
    schoolData 
  } = useSchool();

  const handlePrint = () => {
    const content = `
      تقرير ${getTeachersTitle()}
      المدرسة: ${schoolData.schools[0]?.name || 'غير محدد'}
      نوع المدرسة: ${schoolData.schoolType === 'male' ? 'بنين' : 'بنات'}
      
      عدد ${getTeachersTitle()}: 25
      عدد ${getStudentsTitle()}: 150
    `;
    
    window.print();
  };

  return (
    <div>
      <button onClick={handlePrint}>
        طباعة تقرير {getTeachersTitle()}
      </button>
    </div>
  );
};

// ============================================
// جدول مرجعي سريع
// ============================================
/*

الدالة                     | بنين          | بنات
---------------------------|---------------|---------------
getTeacherTitle()          | معلم          | معلمة
getTeachersTitle()         | المعلمون      | المعلمات
getStudentTitle()          | طالب          | طالبة
getStudentsTitle()         | الطلاب        | الطالبات
getAdminTitle()            | إداري         | إدارية
getAdminsTitle()           | الإداريون     | الإداريات
getCounselorTitle()        | مرشد          | مرشدة
getPrincipalTitle()        | مدير المدرسة | مديرة المدرسة
getVicePrincipalTitle()    | وكيل المدرسة | وكيلة المدرسة
getSupervisorTitle()       | الموجه الطلابي | الموجهة الطلابية

// للنصوص المخصصة
getGenderedText(maleText, femaleText)

*/

export {
  TeachersPage,
  StudentsPage,
  AdminsPage,
  CounselingPage,
  DashboardPage,
  CustomPage,
  TeacherFormPage,
  NotificationsPage,
  ReportsPage,
  PrintPage
};
