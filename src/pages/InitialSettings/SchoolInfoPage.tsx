/**
 * صفحة بيانات المدرسة المحدثة
 * ملاحظة هامة: هذا هو الملف الرئيسي المستخدم حاليًا لصفحة بيانات المدرسة.
 * يجب تحديث هذا الملف مباشرة عند إجراء أي تعديلات وعدم إنشاء ملفات جديدة لمنع التشتت.
 * 
 * الميزات الرئيسية المحدثة:
 * - تحديد نوع المدرسة (بنين/بنات) مع انعكاس النصوص
 * - اختيار المرحلة (رياض الأطفال، ابتدائية، متوسطة، ثانوية)
 * - تحديد نوع القسم للابتدائية والمتوسطة (عام/تحفيظ)
 * - إضافة مدارس متعددة للمراحل المشتركة
 * - تحديد الفصل الدراسي والعام الدراسي
 * - جميع الحقول إلزامية
 * 
 * آخر تحديث: سبتمبر 2025
 */

import React, { useState, useEffect } from 'react';
import {
  Building, Save, ArrowLeft, Edit, School,
  User, CheckSquare, Phone, CheckCircle, AlertCircle,
  Calendar, BookOpen, GraduationCap, Settings,
  X, Plus, Trash2
} from 'lucide-react';
import { useSchool } from '../../contexts/SchoolContext.jsx';

const SchoolInfoPage = () => {
  const { schoolData, saveSchoolData, getGenderedText, getPrincipalTitle } = useSchool();
  
  // حالة نوع المدرسة
  const [schoolType, setSchoolType] = useState(schoolData.schoolType || 'male');
  
  // حالة المدارس
  const [schools, setSchools] = useState([]);
  
  // حالة البيانات الأساسية
  const [principalName, setPrincipalName] = useState(schoolData.principalName || '');
  const [principalMobile, setPrincipalMobile] = useState(schoolData.principalMobile || '');
  const [semester, setSemester] = useState(schoolData.semester || '');
  const [semesterWeeks, setSemesterWeeks] = useState(schoolData.semesterWeeks || 18);
  const [academicYear, setAcademicYear] = useState(schoolData.academicYear || '');
  
  // حالة التعديل والإشعارات
  const [isEditing, setIsEditing] = useState(true);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showEditNotification, setShowEditNotification] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // حالة مربعات الحوار الاحترافية
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  // تحميل البيانات المحفوظة
  useEffect(() => {
    if (schoolData.schools && schoolData.schools.length > 0) {
      setSchools(schoolData.schools);
    }
  }, [schoolData]);

  // إخفاء الإشعارات بعد فترة
  useEffect(() => {
    let timer;
    if (showSaveNotification || showEditNotification) {
      timer = setTimeout(() => {
        setShowSaveNotification(false);
        setShowEditNotification(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showSaveNotification, showEditNotification]);

  // دالة إضافة مدرسة جديدة مباشرة
  const addNewSchool = () => {
    const newSchool = {
      id: Date.now(),
      name: '',
      stage: '',
      sectionType: ''
    };
    
    setSchools([...schools, newSchool]);
    setUnsavedChanges(true);
  };

  // دالة حذف مدرسة مع مربع حوار احترافي
  const removeSchool = (schoolId, schoolIndex) => {
    const school = schools.find(s => s.id === schoolId);
    setDeleteTarget({ 
      type: 'school', 
      id: schoolId, 
      index: schoolIndex,
      name: school?.name || `المدرسة رقم ${schoolIndex + 1}`
    });
    setShowDeleteDialog(true);
  };

  // تأكيد حذف المدرسة
  const confirmDeleteSchool = () => {
    if (deleteTarget && deleteTarget.type === 'school') {
      setSchools(schools.filter(school => school.id !== deleteTarget.id));
      setUnsavedChanges(true);
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  };

  // إلغاء حذف المدرسة
  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  // فتح مربع حوار حذف جميع البيانات
  const openDeleteAllDialog = () => {
    setShowDeleteAllDialog(true);
  };

  // تأكيد حذف جميع البيانات
  const confirmDeleteAll = () => {
    localStorage.removeItem('schoolData');
    setSchoolType('male');
    setSchools([]);
    setPrincipalName('');
    setPrincipalMobile('');
    setSemester('');
    setSemesterWeeks(18);
    setAcademicYear('');
    setUnsavedChanges(false);
    saveSchoolData({
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
    setShowDeleteAllDialog(false);
    setShowSaveNotification(true);
  };

  // إلغاء حذف جميع البيانات
  const cancelDeleteAll = () => {
    setShowDeleteAllDialog(false);
  };

  // دالة تحديث بيانات مدرسة
  const updateSchoolData = (schoolId, field, value) => {
    setSchools(schools.map(school => 
      school.id === schoolId 
        ? { ...school, [field]: value }
        : school
    ));
    setUnsavedChanges(true);
  };

  // معالجة تغيير نوع المدرسة
  const handleSchoolTypeChange = (type) => {
    setSchoolType(type);
    setUnsavedChanges(true);
    // تحديث Context فوراً لانعكاس التغيير على النصوص
    saveSchoolData({ ...schoolData, schoolType: type });
  };

  // دالة الحفظ
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (schools.length === 0) {
      alert('يرجى إضافة مدرسة واحدة على الأقل');
      return;
    }
    
    if (!principalName.trim()) {
      alert('يرجى إدخال اسم مدير/مديرة المدرسة');
      return;
    }
    
    if (!semester) {
      alert('يرجى اختيار الفصل الدراسي');
      return;
    }
    
    if (!academicYear) {
      alert('يرجى إدخال العام الدراسي');
      return;
    }
    
    // التحقق من بيانات المدارس
    for (let school of schools) {
      if (!school.name.trim()) {
        alert('يرجى إدخال اسم المدرسة لجميع المدارس المضافة');
        return;
      }
      
      if (!school.stage) {
        alert('يرجى اختيار المرحلة الدراسية لجميع المدارس المضافة');
        return;
      }
      
      if (!school.sectionType) {
        alert('يرجى اختيار نوع القسم لجميع المدارس المضافة');
        return;
      }
    }
    
    try {
      // حفظ البيانات في localStorage
      const updatedData = {
        ...schoolData,
        schoolType,
        principalName,
        principalMobile,
        semester,
        semesterWeeks: Number(semesterWeeks),
        academicYear,
        schools: schools,
        isMultipleSchools: schools.length > 1
      };
      
      await saveSchoolData(updatedData);
      
      // إرسال البيانات إلى الخادم الخلفي
      try {
        const response = await fetch('/api/schools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schools }),
        });
        
        if (response.ok) {
          console.log('✅ تم حفظ البيانات في الخادم أيضاً');
        }
      } catch (apiError) {
        console.warn('⚠️ تم الحفظ محلياً فقط، الخادم غير متاح');
      }
      
      setIsEditing(false);
      setShowSaveNotification(true);
      setUnsavedChanges(false);
      
      console.log('تم حفظ بيانات المدرسة بنجاح');
      
    } catch (error) {
      console.error('حدث خطأ أثناء حفظ البيانات:', error);
      alert('حدث خطأ أثناء حفظ البيانات. الرجاء المحاولة مرة أخرى.');
    }
  };

  // دالة التعديل
  const handleEdit = () => {
    setIsEditing(true);
    setShowEditNotification(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-1 pb-8 px-4 sm:px-6 lg:px-8 font-kufi" style={{ direction: 'rtl' }}>
      {/* إشعارات */}
      {showSaveNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-200 text-green-800 px-8 py-4 rounded-lg shadow-xl z-50 flex items-center animate-fadeInDown">
          <CheckCircle className="h-6 w-6 text-green-500 ml-3" />
          <span className="text-lg font-medium">تم حفظ بيانات المدرسة بنجاح!</span>
        </div>
      )}
      
      {showEditNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-200 text-blue-800 px-8 py-4 rounded-lg shadow-xl z-50 flex items-center animate-fadeInDown">
          <AlertCircle className="h-6 w-6 text-blue-500 ml-3" />
          <span className="text-lg font-medium">يمكنك الآن تعديل بيانات المدرسة</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#655ac1] to-[#8779fb] p-3 rounded-xl shadow-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">بيانات المدرسة</h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* القسم الأول: نوع المدرسة والمرحلة */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="h-5 w-5 ml-2 text-[#655ac1]" />
                الإعدادات الأساسية
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                {/* نوع المدرسة */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <User className="h-4 w-4 ml-1 text-[#4f46e5]" />
                    نوع المدرسة <span className="text-red-500 mr-1">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        schoolType === 'male' 
                          ? 'border-[#655ac1] bg-[#e5e1fe]' 
                          : 'border-gray-200 hover:border-[#8779fb]/50'
                      }`}
                      onClick={() => isEditing && handleSchoolTypeChange('male')}
                    >
                      <input
                        id="type-male"
                        type="radio"
                        value="male"
                        checked={schoolType === 'male'}
                        onChange={(e) => handleSchoolTypeChange(e.target.value)}
                        className="sr-only"
                        disabled={!isEditing}
                      />
                      <label 
                        htmlFor="type-male" 
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${
                          schoolType === 'male' ? 'bg-[#655ac1] text-white' : 'bg-gray-300'
                        }`}>
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium">بنين</span>
                      </label>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        schoolType === 'female' 
                          ? 'border-[#655ac1] bg-[#e5e1fe]' 
                          : 'border-gray-200 hover:border-[#8779fb]/50'
                      }`}
                      onClick={() => isEditing && handleSchoolTypeChange('female')}
                    >
                      <input
                        id="type-female"
                        type="radio"
                        value="female"
                        checked={schoolType === 'female'}
                        onChange={(e) => handleSchoolTypeChange(e.target.value)}
                        className="sr-only"
                        disabled={!isEditing}
                      />
                      <label 
                        htmlFor="type-female" 
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${
                          schoolType === 'female' ? 'bg-[#655ac1] text-white' : 'bg-gray-300'
                        }`}>
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium">بنات</span>
                      </label>
                    </div>
                  </div>
                  
                  {schoolType === 'female' && (
                    <div className="mt-3 bg-blue-500 text-white p-3 rounded-md shadow-sm animate-fadeIn">
                      <span className="text-sm font-medium">
                        تم تغيير صيغة النصوص إلى المؤنث
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* القسم الثاني: المدارس */}
            {schoolType && (
              <div className="bg-white border-2 border-gray-100 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <School className="h-5 w-5 ml-2 text-[#655ac1]" />
                    المدارس
                  </h3>
                  
                  {isEditing && (
                    <button
                      type="button"
                      onClick={addNewSchool}
                      className="bg-[#655ac1] text-white px-6 py-2.5 rounded-lg hover:bg-[#8779fb] transition-colors flex items-center text-sm font-medium shadow-md"
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة مدرسة
                    </button>
                  )}
                </div>

                {schools.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <School className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-4">لم يتم إضافة أي مدرسة بعد</p>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={addNewSchool}
                        className="bg-[#655ac1] text-white px-6 py-2.5 rounded-lg hover:bg-[#8779fb] transition-colors inline-flex items-center font-medium shadow-md"
                      >
                        <Plus className="h-4 w-4 ml-1" />
                        إضافة مدرسة
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {schools.map((school, index) => (
                      <div key={school.id} className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50 hover:border-[#8779fb] hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            {/* رقم المدرسة في تصميم دائري */}
                            <div className="w-10 h-10 bg-[#655ac1] text-white rounded-full flex items-center justify-center font-bold text-base ml-4 shadow-lg">
                              {index + 1}
                            </div>
                            <h4 className="font-semibold text-gray-800 text-lg">
                              مدرسة {index + 1}
                            </h4>
                          </div>
                          
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeSchool(school.id, index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2.5 rounded-lg transition-all duration-200 group"
                              title="حذف المدرسة"
                            >
                              <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* اسم المدرسة */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              اسم المدرسة <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={school.name}
                              onChange={(e) => updateSchoolData(school.id, 'name', e.target.value)}
                              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#655ac1] focus:border-transparent transition-all duration-200 hover:border-[#8779fb]"
                              placeholder="أدخل اسم المدرسة"
                              required
                              disabled={!isEditing}
                            />
                          </div>

                          {/* المرحلة الدراسية */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              المرحلة الدراسية <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={school.stage || ''}
                              onChange={(e) => updateSchoolData(school.id, 'stage', e.target.value)}
                              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#655ac1] focus:border-transparent transition-all duration-200 hover:border-[#8779fb]"
                              required
                              disabled={!isEditing}
                            >
                              <option value="">اختر المرحلة</option>
                              <option value="kindergarten">رياض أطفال</option>
                              <option value="primary">الابتدائية</option>
                              <option value="middle">المتوسطة</option>
                              <option value="secondary">الثانوية</option>
                            </select>
                          </div>

                          {/* نوع القسم */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              نوع القسم <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={school.sectionType || ''}
                              onChange={(e) => updateSchoolData(school.id, 'sectionType', e.target.value)}
                              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#655ac1] focus:border-transparent transition-all duration-200 hover:border-[#8779fb]"
                              required
                              disabled={!isEditing}
                            >
                              <option value="">اختر نوع القسم</option>
                              <option value="عام">عام</option>
                              <option value="تحفيظ قرآن">تحفيظ قرآن</option>
                              <option value="التعليم المستمر">التعليم المستمر</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* القسم الثالث: البيانات الأساسية */}
            <div className="bg-white border-2 border-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 ml-2 text-[#655ac1]" />
                البيانات الأساسية
              </h3>

              {/* الصف الأول: اسم المدير ورقم الجوال */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* اسم المدير */}
                <div>
                  <label htmlFor="principalName" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User className="h-4 w-4 ml-1 text-[#655ac1]" />
                    اسم {getPrincipalTitle()} <span className="text-red-500 mr-1">*</span>
                  </label>
                  <input
                    id="principalName"
                    type="text"
                    value={principalName}
                    onChange={(e) => {
                      setPrincipalName(e.target.value);
                      setUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#655ac1] focus:border-transparent transition-all duration-200 hover:border-[#8779fb]"
                    placeholder={`أدخل اسم ${getPrincipalTitle()}`}
                    required
                    disabled={!isEditing}
                  />
                </div>

                {/* رقم الجوال */}
                <div>
                  <label htmlFor="principalMobile" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Phone className="h-4 w-4 ml-1 text-[#655ac1]" />
                    رقم الجوال <span className="text-red-500 mr-1">*</span>
                  </label>
                  <input
                    id="principalMobile"
                    type="tel"
                    value={principalMobile}
                    onChange={(e) => {
                      setPrincipalMobile(e.target.value);
                      setUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#655ac1] focus:border-transparent transition-all duration-200 hover:border-[#8779fb]"
                    placeholder="05xxxxxxxx"
                    required
                    disabled={!isEditing}
                    pattern="^05[0-9]{8}$"
                  />
                </div>
              </div>

              {/* الصف الثاني: الفصل الدراسي وعدد الأسابيع والعام الدراسي */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* الفصل الدراسي */}
                <div>
                  <label htmlFor="semester" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 ml-1 text-[#655ac1]" />
                    الفصل الدراسي <span className="text-red-500 mr-1">*</span>
                  </label>
                  <select
                    id="semester"
                    value={semester}
                    onChange={(e) => {
                      setSemester(e.target.value);
                      setUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#655ac1] focus:border-transparent transition-all duration-200 hover:border-[#8779fb]"
                    required
                    disabled={!isEditing}
                  >
                    <option value="">اختر الفصل الدراسي</option>
                    <option value="الفصل الأول">الفصل الأول</option>
                    <option value="الفصل الثاني">الفصل الثاني</option>
                  </select>
                </div>

                {/* عدد الأسابيع */}
                <div>
                  <label htmlFor="semesterWeeks" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 ml-1 text-[#655ac1]" />
                    عدد الأسابيع <span className="text-red-500 mr-1">*</span>
                  </label>
                  <select
                    id="semesterWeeks"
                    value={semesterWeeks}
                    onChange={(e) => {
                      setSemesterWeeks(Number(e.target.value));
                      setUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#655ac1] focus:border-transparent transition-all duration-200 hover:border-[#8779fb]"
                    required
                    disabled={!isEditing}
                  >
                    <option value="">اختر عدد الأسابيع</option>
                    {Array.from({ length: 40 }, (_, i) => i + 1).map(week => (
                      <option key={week} value={week}>{week} أسبوع</option>
                    ))}
                  </select>
                </div>

                {/* العام الدراسي */}
                <div>
                  <label htmlFor="academicYear" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 ml-1 text-[#655ac1]" />
                    العام الدراسي <span className="text-red-500 mr-1">*</span>
                  </label>
                  <input
                    id="academicYear"
                    type="text"
                    value={academicYear}
                    onChange={(e) => {
                      setAcademicYear(e.target.value);
                      setUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#655ac1] focus:border-transparent transition-all duration-200 hover:border-[#8779fb]"
                    placeholder="1446"
                    required
                    disabled={!isEditing}
                    pattern="^[0-9]{4}$"
                  />
                </div>
              </div>
            </div>

            {/* أزرار الحفظ والتعديل والحذف */}
            <div className="flex justify-start items-center gap-4 pt-6 border-t border-gray-100">
              {/* زر الحفظ/التعديل (الأول من اليسار) */}
              {isEditing ? (
                <button
                  type="submit"
                  className="bg-[#655ac1] hover:bg-[#8779fb] text-white font-medium px-8 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center"
                >
                  <Save className="h-5 w-5 ml-2" />
                  حفظ البيانات
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="bg-[#655ac1] hover:bg-[#8779fb] text-white font-medium px-8 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center"
                >
                  <Edit className="h-5 w-5 ml-2" />
                  تعديل البيانات
                </button>
              )}
              
              {/* زر حذف جميع البيانات (الثاني من اليسار) */}
              <button
                type="button"
                onClick={openDeleteAllDialog}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center"
              >
                <Trash2 className="h-5 w-5 ml-2" />
                حذف جميع البيانات
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* مربع حوار حذف المدرسة الاحترافي */}
      {showDeleteDialog && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            {/* الأيقونة والعنوان */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              حذف مدرسة
            </h3>
            
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-3">
                هل أنت متأكد من حذف
              </p>
              <p className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                "{deleteTarget.name}"
              </p>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    <strong>تحذير:</strong> هذا الإجراء لا يمكن التراجع عنه
                  </p>
                </div>
              </div>
            </div>
            
            {/* الأزرار */}
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteSchool}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4 ml-1" />
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مربع حوار حذف جميع البيانات الاحترافي */}
      {showDeleteAllDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-scaleIn">
            {/* الأيقونة والعنوان */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              تحذير: حذف جميع البيانات
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-600 text-center mb-4">
                هل أنت متأكد من حذف <strong>جميع البيانات</strong>؟
              </p>
              
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 ml-2" />
                  سيتم حذف البيانات التالية:
                </h4>
                <ul className="space-y-2 text-sm text-red-800">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full ml-2"></div>
                    نوع المدرسة (بنين/بنات)
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full ml-2"></div>
                    جميع المدارس المضافة ({schools.length})
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full ml-2"></div>
                    البيانات الأساسية (المدير، الجوال، إلخ)
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full ml-2"></div>
                    الفصل والعام الدراسي
                  </li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    <strong>تحذير:</strong> هذا الإجراء لا يمكن التراجع عنه نهائياً
                  </p>
                </div>
              </div>
            </div>
            
            {/* الأزرار */}
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteAll}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteAll}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4 ml-1" />
                حذف جميع البيانات
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* تعريفات CSS للرسوم المتحركة */}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 0.5s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SchoolInfoPage;
