import React, { createContext, useContext, useState, useEffect } from 'react';

// إنشاء السياق
const SchoolContext = createContext();

// Provider للسياق
export const SchoolProvider = ({ children }) => {
  const [schoolData, setSchoolData] = useState({
    schoolType: 'male',
    selectedStage: '',
    principalName: '',
    principalMobile: '',
    semester: '',
    semesterWeeks: 18,
    academicYear: '',
    schools: [],
    isMultipleSchools: false
  });

  // تحميل البيانات من localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('schoolData');
    if (savedData) {
      try {
        setSchoolData(JSON.parse(savedData));
      } catch (error) {
        console.error('خطأ في تحميل بيانات المدرسة:', error);
      }
    }
  }, []);

  // حفظ البيانات
  const saveSchoolData = (data) => {
    setSchoolData(data);
    localStorage.setItem('schoolData', JSON.stringify(data));
  };

  // الحصول على النص المناسب للجنس
  const getGenderedText = (maleText, femaleText) => {
    return schoolData.schoolType === 'female' ? femaleText : maleText;
  };

  // الحصول على مسمى المدير/المديرة
  const getPrincipalTitle = () => {
    return getGenderedText('مدير المدرسة', 'مديرة المدرسة');
  };

  // الحصول على مسمى الوكيل/الوكيلة
  const getVicePrincipalTitle = () => {
    return getGenderedText('وكيل المدرسة', 'وكيلة المدرسة');
  };

  // الحصول على مسمى الموجه/الموجهة
  const getSupervisorTitle = () => {
    return getGenderedText('الموجه الطلابي', 'الموجهة الطلابية');
  };

  // الحصول على مسمى المعلم/المعلمة
  const getTeacherTitle = () => {
    return getGenderedText('معلم', 'معلمة');
  };

  // الحصول على مسمى الطالب/الطالبة
  const getStudentTitle = () => {
    return getGenderedText('طالب', 'طالبة');
  };

  // الحصول على مسمى الإداري/الإدارية
  const getAdminTitle = () => {
    return getGenderedText('إداري', 'إدارية');
  };

  // الحصول على مسمى المرشد/المرشدة
  const getCounselorTitle = () => {
    return getGenderedText('مرشد', 'مرشدة');
  };

  // الحصول على مسمى المعلمون/المعلمات (جمع)
  const getTeachersTitle = () => {
    return getGenderedText('المعلمون', 'المعلمات');
  };

  // الحصول على مسمى الطلاب/الطالبات (جمع)
  const getStudentsTitle = () => {
    return getGenderedText('الطلاب', 'الطالبات');
  };

  // الحصول على مسمى الإداريون/الإداريات (جمع)
  const getAdminsTitle = () => {
    return getGenderedText('الإداريون', 'الإداريات');
  };

  const value = {
    schoolData,
    saveSchoolData,
    getGenderedText,
    getPrincipalTitle,
    getVicePrincipalTitle,
    getSupervisorTitle,
    getTeacherTitle,
    getStudentTitle,
    getAdminTitle,
    getCounselorTitle,
    getTeachersTitle,
    getStudentsTitle,
    getAdminsTitle
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
};

// Hook لاستخدام السياق
export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};

export default SchoolContext;
