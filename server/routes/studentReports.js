const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// قاعدة بيانات مؤقتة للكشوف
let studentReports = [];
let reportGrades = {};

// جلب جميع الكشوف
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const schoolId = req.user?.school_id;

    // تصفية الكشوف حسب المدرسة
    const filteredReports = studentReports.filter(
      report => report.schoolId === schoolId
    );

    res.json(filteredReports);
  } catch (error) {
    console.error('Error fetching student reports:', error);
    res.status(500).json({ error: 'Failed to fetch student reports' });
  }
});

// جلب كشف معين
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user?.school_id;

    const report = studentReports.find(
      r => r.id === id && r.schoolId === schoolId
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // جلب الطلاب من الفصل والشعبة المحددة
    // هذا مثال - يجب أن يتم جلب الطلاب الفعليين من قاعدة البيانات
    const students = await getStudentsByClassAndSection(report.classId, report.sectionId);

    // جلب الدرجات المحفوظة
    const grades = reportGrades[id] || {};

    res.json({
      ...report,
      students,
      grades
    });
  } catch (error) {
    console.error('Error fetching student report:', error);
    res.status(500).json({ error: 'Failed to fetch student report' });
  }
});

// إنشاء كشف جديد
router.post('/', async (req, res) => {
  try {
    const { name, classId, sectionId, subjectId, columns } = req.body;
    const userId = req.user?.id;
    const schoolId = req.user?.school_id;

    // التحقق من البيانات
    if (!name || !classId || !sectionId || !subjectId || !columns || columns.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // الحصول على معلومات الفصل والمادة
    const classData = await getClassById(classId);
    const sectionData = await getSectionById(sectionId);
    const subjectData = await getSubjectById(subjectId);

    if (!classData || !sectionData || !subjectData) {
      return res.status(400).json({ error: 'Invalid class, section, or subject' });
    }

    const newReport = {
      id: uuidv4(),
      name,
      classId,
      className: classData.name,
      sectionId,
      sectionName: sectionData.name,
      subjectId,
      subjectName: subjectData.name,
      columns: columns.map(col => ({
        id: col.id || uuidv4(),
        name: col.name,
        hasGrade: col.hasGrade || false,
        maxGrade: col.maxGrade || null
      })),
      createdBy: userId,
      schoolId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    studentReports.push(newReport);
    reportGrades[newReport.id] = {};

    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating student report:', error);
    res.status(500).json({ error: 'Failed to create student report' });
  }
});

// تحديث كشف
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, classId, sectionId, subjectId, columns } = req.body;
    const schoolId = req.user?.school_id;

    const reportIndex = studentReports.findIndex(
      r => r.id === id && r.schoolId === schoolId
    );

    if (reportIndex === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // تحديث البيانات
    const classData = await getClassById(classId);
    const sectionData = await getSectionById(sectionId);
    const subjectData = await getSubjectById(subjectId);

    studentReports[reportIndex] = {
      ...studentReports[reportIndex],
      name,
      classId,
      className: classData?.name || studentReports[reportIndex].className,
      sectionId,
      sectionName: sectionData?.name || studentReports[reportIndex].sectionName,
      subjectId,
      subjectName: subjectData?.name || studentReports[reportIndex].subjectName,
      columns,
      updatedAt: new Date().toISOString()
    };

    res.json(studentReports[reportIndex]);
  } catch (error) {
    console.error('Error updating student report:', error);
    res.status(500).json({ error: 'Failed to update student report' });
  }
});

// حذف كشف
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user?.school_id;

    const reportIndex = studentReports.findIndex(
      r => r.id === id && r.schoolId === schoolId
    );

    if (reportIndex === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // حذف الكشف والدرجات المرتبطة به
    studentReports.splice(reportIndex, 1);
    delete reportGrades[id];

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting student report:', error);
    res.status(500).json({ error: 'Failed to delete student report' });
  }
});

// حفظ الدرجات
router.put('/:id/grades', async (req, res) => {
  try {
    const { id } = req.params;
    const { grades } = req.body;
    const schoolId = req.user?.school_id;

    const report = studentReports.find(
      r => r.id === id && r.schoolId === schoolId
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // حفظ الدرجات
    reportGrades[id] = grades;

    // تحديث وقت التعديل
    const reportIndex = studentReports.findIndex(r => r.id === id);
    if (reportIndex !== -1) {
      studentReports[reportIndex].updatedAt = new Date().toISOString();
    }

    res.json({ message: 'Grades saved successfully', grades });
  } catch (error) {
    console.error('Error saving grades:', error);
    res.status(500).json({ error: 'Failed to save grades' });
  }
});

// دوال مساعدة للحصول على البيانات
async function getStudentsByClassAndSection(classId, sectionId) {
  // هذه دالة مؤقتة - يجب أن تجلب الطلاب الفعليين من قاعدة البيانات
  // يمكن تعديلها لاحقاً للاتصال بقاعدة البيانات الفعلية
  
  // مثال: إرجاع طلاب تجريبيين
  const mockStudents = [
    { id: '1', name: 'أحمد محمد علي', number: 1 },
    { id: '2', name: 'محمد عبدالله أحمد', number: 2 },
    { id: '3', name: 'خالد سعد عبدالرحمن', number: 3 },
    { id: '4', name: 'عبدالعزيز فهد محمد', number: 4 },
    { id: '5', name: 'فيصل ناصر علي', number: 5 },
    { id: '6', name: 'عبدالرحمن صالح أحمد', number: 6 },
    { id: '7', name: 'سلطان عبدالله محمد', number: 7 },
    { id: '8', name: 'تركي فهد سعد', number: 8 },
    { id: '9', name: 'يوسف محمد عبدالله', number: 9 },
    { id: '10', name: 'ماجد أحمد علي', number: 10 }
  ];

  return mockStudents;
}

async function getClassById(classId) {
  // دالة مؤقتة - يجب أن تجلب من قاعدة البيانات
  const mockClasses = [
    { id: '1', name: 'الأول الابتدائي' },
    { id: '2', name: 'الثاني الابتدائي' },
    { id: '3', name: 'الثالث الابتدائي' },
    { id: '4', name: 'الرابع الابتدائي' },
    { id: '5', name: 'الخامس الابتدائي' },
    { id: '6', name: 'السادس الابتدائي' }
  ];

  return mockClasses.find(c => c.id === classId);
}

async function getSectionById(sectionId) {
  // دالة مؤقتة - يجب أن تجلب من قاعدة البيانات
  const mockSections = [
    { id: '1', name: 'أ' },
    { id: '2', name: 'ب' },
    { id: '3', name: 'ج' }
  ];

  return mockSections.find(s => s.id === sectionId);
}

async function getSubjectById(subjectId) {
  // دالة مؤقتة - يجب أن تجلب من قاعدة البيانات
  const mockSubjects = [
    { id: '1', name: 'الرياضيات' },
    { id: '2', name: 'اللغة العربية' },
    { id: '3', name: 'العلوم' },
    { id: '4', name: 'التربية الإسلامية' },
    { id: '5', name: 'اللغة الإنجليزية' },
    { id: '6', name: 'التربية الاجتماعية' }
  ];

  return mockSubjects.find(s => s.id === subjectId);
}

module.exports = router;
