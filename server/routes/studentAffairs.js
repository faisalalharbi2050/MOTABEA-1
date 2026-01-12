const express = require('express');
const router = express.Router();

/**
 * نماذج البيانات (يمكن استبدالها بـ ORM مثل Prisma أو Mongoose)
 */

// قاعدة بيانات مؤقتة في الذاكرة
let lateRecords = [];
let absenceRecords = [];
let quickAccessLinks = [];
let teacherLinks = [];
let alertHistory = [];

/**
 * POST /api/student-affairs/late-tracking
 * تسجيل تأخر طالب
 */
router.post('/late-tracking', async (req, res) => {
  try {
    const { studentId, studentName, classRoom, arrivalTime, date, lateMinutes } = req.body;

    // التحقق من البيانات
    if (!studentId || !arrivalTime || !date) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير مكتملة'
      });
    }

    // إنشاء سجل التأخر
    const lateRecord = {
      id: Date.now().toString(),
      studentId,
      studentName,
      classRoom,
      arrivalTime,
      lateMinutes,
      date,
      status: 'pending',
      createdAt: new Date(),
      notifiedAt: null
    };

    lateRecords.push(lateRecord);

    // إرسال إشعار لولي الأمر (محاكاة)
    setTimeout(() => {
      sendGuardianNotification(lateRecord);
    }, 1000);

    // التحقق من التنبيهات التراكمية
    checkAlertThresholds(studentId);

    res.json({
      success: true,
      message: 'تم تسجيل التأخر بنجاح',
      data: lateRecord
    });
  } catch (error) {
    console.error('خطأ في تسجيل التأخر:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

/**
 * GET /api/student-affairs/late-tracking
 * الحصول على سجلات التأخر
 */
router.get('/late-tracking', async (req, res) => {
  try {
    const { date, studentId, classRoom } = req.query;

    let filteredRecords = [...lateRecords];

    // فلترة حسب التاريخ
    if (date) {
      filteredRecords = filteredRecords.filter(r => r.date === date);
    }

    // فلترة حسب الطالب
    if (studentId) {
      filteredRecords = filteredRecords.filter(r => r.studentId === studentId);
    }

    // فلترة حسب الفصل
    if (classRoom) {
      filteredRecords = filteredRecords.filter(r => r.classRoom === classRoom);
    }

    res.json({
      success: true,
      data: filteredRecords,
      count: filteredRecords.length
    });
  } catch (error) {
    console.error('خطأ في جلب سجلات التأخر:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

/**
 * POST /api/student-affairs/quick-access-link
 * توليد رابط وصول سريع
 */
router.post('/quick-access-link', async (req, res) => {
  try {
    const token = generateToken();
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // ساعة واحدة

    const link = {
      token,
      expiryDate,
      createdAt: new Date(),
      isActive: true,
      usageCount: 0
    };

    quickAccessLinks.push(link);

    res.json({
      success: true,
      data: {
        token,
        expiryDate,
        link: `${req.protocol}://${req.get('host')}/quick-late-tracking/${token}`
      }
    });
  } catch (error) {
    console.error('خطأ في توليد الرابط:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

/**
 * GET /api/student-affairs/quick-access-link/:token
 * التحقق من صلاحية رابط الوصول السريع
 */
router.get('/quick-access-link/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const link = quickAccessLinks.find(l => l.token === token);

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'رابط غير موجود'
      });
    }

    // التحقق من انتهاء الصلاحية
    if (new Date() > new Date(link.expiryDate)) {
      link.isActive = false;
      return res.status(403).json({
        success: false,
        message: 'انتهت صلاحية الرابط'
      });
    }

    // زيادة عداد الاستخدام
    link.usageCount++;

    res.json({
      success: true,
      data: {
        isValid: true,
        expiryDate: link.expiryDate
      }
    });
  } catch (error) {
    console.error('خطأ في التحقق من الرابط:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

/**
 * GET /api/student-affairs/late-stats/:studentId
 * الحصول على إحصائيات تأخر طالب معين
 */
router.get('/late-stats/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentRecords = lateRecords.filter(r => r.studentId === studentId);
    
    const stats = {
      totalLateDays: studentRecords.length,
      totalLateMinutes: studentRecords.reduce((sum, r) => sum + r.lateMinutes, 0),
      averageLateMinutes: studentRecords.length > 0 
        ? Math.round(studentRecords.reduce((sum, r) => sum + r.lateMinutes, 0) / studentRecords.length)
        : 0,
      consecutiveDays: calculateConsecutiveDays(studentRecords),
      lastLateDate: studentRecords.length > 0 
        ? studentRecords[studentRecords.length - 1].date 
        : null
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الطالب:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

/**
 * POST /api/student-affairs/send-notification
 * إعادة إرسال إشعار لولي أمر
 */
router.post('/send-notification', async (req, res) => {
  try {
    const { recordId } = req.body;

    const record = lateRecords.find(r => r.id === recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'سجل غير موجود'
      });
    }

    // إرسال الإشعار
    await sendGuardianNotification(record);

    record.notifiedAt = new Date();
    record.status = 'notified';

    res.json({
      success: true,
      message: 'تم إرسال الإشعار بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

/**
 * دوال مساعدة
 */

// توليد رمز عشوائي
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// حساب الأيام المتصلة
function calculateConsecutiveDays(records) {
  if (records.length === 0) return 0;

  const sortedDates = records
    .map(r => new Date(r.date))
    .sort((a, b) => b.getTime() - a.getTime());

  let consecutiveDays = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = Math.abs(
      (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      consecutiveDays++;
    } else {
      break;
    }
  }

  return consecutiveDays;
}

// إرسال إشعار لولي الأمر (محاكاة)
async function sendGuardianNotification(record) {
  const message = `
عزيزي ولي الأمر،

نحيطكم علماً بأن نجلكم/نجلتكم ${record.studentName} قد تأخر عن الطابور الصباحي.

📅 التاريخ: ${record.date}
🕐 وقت الحضور: ${record.arrivalTime}
⏱ مقدار التأخير: ${record.lateMinutes} دقيقة

نأمل منكم متابعة الأمر وحث نجلكم/نجلتكم على الالتزام بالحضور في الموعد المحدد.

شكراً لتعاونكم
إدارة المدرسة
  `;

  // هنا يتم التكامل مع خدمة الواتساب/SMS
  console.log('إرسال إشعار:', message);
  
  // محاكاة تأخير الإرسال
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { success: true, message: 'تم الإرسال بنجاح' };
}

// التحقق من التنبيهات التراكمية
function checkAlertThresholds(studentId) {
  const studentRecords = lateRecords.filter(r => r.studentId === studentId);
  const lateDaysCount = studentRecords.length;

  const thresholds = [5, 10, 15, 20];
  
  for (const threshold of thresholds) {
    if (lateDaysCount === threshold) {
      // إرسال تنبيه للوكيل
      sendVicePrincipalAlert(studentRecords[0], lateDaysCount);
      
      // حفظ التنبيه في السجل
      alertHistory.push({
        studentId,
        threshold,
        date: new Date(),
        type: 'late-threshold'
      });
    }
  }
}

// إرسال تنبيه للوكيل (محاكاة)
async function sendVicePrincipalAlert(record, lateDaysCount) {
  const message = `
🔔 تنبيه: تأخر متكرر

👤 الطالب: ${record.studentName}
🏫 الفصل: ${record.classRoom}

📊 الإحصائيات:
• عدد أيام التأخر: ${lateDaysCount}

يرجى اتخاذ الإجراء المناسب.
  `;

  console.log('تنبيه للوكيل:', message);
  
  return { success: true };
}

/**
 * =====================================
 * Absence Tracking Endpoints
 * =====================================
 */

/**
 * POST /api/student-affairs/absence-tracking
 * تسجيل غياب طالب
 */
router.post('/absence-tracking', async (req, res) => {
  try {
    const { studentId, studentName, classRoom, date, period, recordedBy } = req.body;

    if (!studentId || !date) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير مكتملة'
      });
    }

    const absenceRecord = {
      id: Date.now().toString(),
      studentId,
      studentName,
      classRoom,
      date,
      period,
      recordedBy: recordedBy || 'الإداري',
      notificationSent: false,
      createdAt: new Date()
    };

    absenceRecords.push(absenceRecord);

    // إرسال إشعار لولي الأمر
    setTimeout(() => {
      sendAbsenceNotification(absenceRecord);
    }, 1000);

    // التحقق من التنبيهات
    checkAbsenceAlerts(studentId);

    res.json({
      success: true,
      message: 'تم تسجيل الغياب بنجاح',
      data: absenceRecord
    });
  } catch (error) {
    console.error('خطأ في تسجيل الغياب:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

/**
 * GET /api/student-affairs/absence-tracking
 * الحصول على سجلات الغياب
 */
router.get('/absence-tracking', async (req, res) => {
  try {
    const { date, studentId, classRoom } = req.query;

    let filteredRecords = [...absenceRecords];

    if (date) {
      filteredRecords = filteredRecords.filter(r => r.date === date);
    }

    if (studentId) {
      filteredRecords = filteredRecords.filter(r => r.studentId === studentId);
    }

    if (classRoom) {
      filteredRecords = filteredRecords.filter(r => r.classRoom === classRoom);
    }

    res.json({
      success: true,
      data: filteredRecords,
      count: filteredRecords.length
    });
  } catch (error) {
    console.error('خطأ في جلب سجلات الغياب:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

/**
 * POST /api/student-affairs/teacher-link
 * توليد رابط للمعلم لرصد الغياب
 */
router.post('/teacher-link', async (req, res) => {
  try {
    const { grade, classRoom, period, teacherId } = req.body;

    const token = generateToken();
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

    const link = {
      token,
      grade,
      classRoom,
      period,
      teacherId,
      expiryDate,
      createdAt: new Date(),
      isActive: true,
      submitted: false
    };

    teacherLinks.push(link);

    res.json({
      success: true,
      data: {
        token,
        expiryDate,
        link: `${req.protocol}://${req.get('host')}/teacher-absence-check/${token}`
      }
    });
  } catch (error) {
    console.error('خطأ في توليد رابط المعلم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

/**
 * GET /api/student-affairs/teacher-link/:token
 * التحقق من صلاحية رابط المعلم
 */
router.get('/teacher-link/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const link = teacherLinks.find(l => l.token === token);

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'رابط غير موجود'
      });
    }

    if (new Date() > new Date(link.expiryDate)) {
      link.isActive = false;
      return res.status(403).json({
        success: false,
        message: 'انتهت صلاحية الرابط'
      });
    }

    if (link.submitted) {
      return res.status(403).json({
        success: false,
        message: 'تم استخدام هذا الرابط مسبقاً'
      });
    }

    res.json({
      success: true,
      data: {
        isValid: true,
        expiryDate: link.expiryDate,
        classInfo: {
          grade: link.grade,
          classRoom: link.classRoom,
          period: link.period
        }
      }
    });
  } catch (error) {
    console.error('خطأ في التحقق من رابط المعلم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

/**
 * POST /api/student-affairs/teacher-absence-check
 * حفظ رصد الغياب من المعلم
 */
router.post('/teacher-absence-check', async (req, res) => {
  try {
    const { token, classInfo, students, submittedAt } = req.body;

    const link = teacherLinks.find(l => l.token === token);

    if (!link || !link.isActive) {
      return res.status(403).json({
        success: false,
        message: 'رابط غير صالح'
      });
    }

    // تحديث حالة الرابط
    link.submitted = true;
    link.submittedAt = new Date(submittedAt);

    // حفظ سجلات الغياب
    const absentStudents = students.filter(s => s.status === 'absent');
    
    for (const student of absentStudents) {
      const absenceRecord = {
        id: Date.now().toString() + Math.random(),
        studentId: student.id,
        studentName: student.name,
        classRoom: `${classInfo.grade} ${classInfo.class}`,
        date: new Date().toISOString().split('T')[0],
        period: classInfo.period,
        recordedBy: 'المعلم',
        notificationSent: false,
        createdAt: new Date()
      };

      absenceRecords.push(absenceRecord);

      // إرسال إشعار لولي الأمر
      await sendAbsenceNotification(absenceRecord);

      // التحقق من التنبيهات
      checkAbsenceAlerts(student.id);
    }

    // إرسال تنبيه للوكيل
    if (absentStudents.length > 0) {
      await notifyVicePrincipalAbsence(classInfo, absentStudents.length);
    }

    res.json({
      success: true,
      message: 'تم حفظ الرصد بنجاح',
      data: {
        absentCount: absentStudents.length,
        presentCount: students.length - absentStudents.length
      }
    });
  } catch (error) {
    console.error('خطأ في حفظ رصد المعلم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

/**
 * GET /api/student-affairs/absence-stats/:studentId
 * إحصائيات الغياب لطالب معين
 */
router.get('/absence-stats/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentRecords = absenceRecords.filter(r => r.studentId === studentId);
    
    const stats = {
      totalAbsenceDays: studentRecords.length,
      consecutiveDays: calculateConsecutiveAbsenceDays(studentRecords),
      lastAbsenceDate: studentRecords.length > 0 
        ? studentRecords[studentRecords.length - 1].date 
        : null,
      alertsSent: alertHistory.filter(a => a.studentId === studentId && a.type === 'absence-threshold').length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الغياب:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

/**
 * دوال مساعدة للغياب
 */

// إرسال إشعار الغياب لولي الأمر
async function sendAbsenceNotification(record) {
  const message = `
عزيزي ولي الأمر،

نحيطكم علماً بأن نجلكم/نجلتكم ${record.studentName} غائب اليوم.

📅 التاريخ: ${record.date}
🕐 الحصة: ${record.period}

يرجى التواصل مع إدارة المدرسة في حال وجود عذر.

شكراً لتعاونكم
إدارة المدرسة
  `;

  console.log('إرسال إشعار غياب:', message);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { success: true };
}

// التحقق من تنبيهات الغياب
function checkAbsenceAlerts(studentId) {
  const studentRecords = absenceRecords.filter(r => r.studentId === studentId);
  const totalAbsenceDays = studentRecords.length;
  const consecutiveDays = calculateConsecutiveAbsenceDays(studentRecords);

  const thresholds = [3, 5, 10, 15, 20];
  
  // تنبيه للأيام المتصلة
  if (consecutiveDays === 3) {
    sendAbsenceAlert(studentRecords[0], consecutiveDays, 'consecutive');
  }
  
  // تنبيهات للإجمالي
  if (thresholds.includes(totalAbsenceDays)) {
    sendAbsenceAlert(studentRecords[0], totalAbsenceDays, 'total');
  }
}

// إرسال تنبيه الغياب للوكيل
async function sendAbsenceAlert(record, days, type) {
  const message = `
🔔 تنبيه: غياب ${type === 'consecutive' ? 'متصل' : 'متكرر'}

👤 الطالب: ${record.studentName}
🏫 الفصل: ${record.classRoom}

📊 عدد أيام الغياب: ${days} ${type === 'consecutive' ? '(متصلة)' : ''}

يرجى اتخاذ الإجراء المناسب.
  `;

  console.log('تنبيه غياب للوكيل:', message);

  alertHistory.push({
    studentId: record.studentId,
    threshold: days,
    date: new Date(),
    type: 'absence-threshold',
    alertType: type
  });
  
  return { success: true };
}

// حساب أيام الغياب المتصلة
function calculateConsecutiveAbsenceDays(records) {
  if (records.length === 0) return 0;

  const sortedDates = records
    .map(r => new Date(r.date))
    .sort((a, b) => b.getTime() - a.getTime());

  let consecutiveDays = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = Math.abs(
      (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      consecutiveDays++;
    } else {
      break;
    }
  }

  return consecutiveDays;
}

// إشعار الوكيل برصد المعلم
async function notifyVicePrincipalAbsence(classInfo, absentCount) {
  const message = `
📊 تقرير رصد الغياب

🏫 الفصل: ${classInfo.grade} ${classInfo.class}
🕐 الحصة: ${classInfo.period}
👥 عدد الغائبين: ${absentCount}

تم الرصد من قبل المعلم.
  `;

  console.log('إشعار الوكيل:', message);
  
  return { success: true };
}

/**
 * ========================================
 * نظام استئذان الطلاب (المرحلة الثالثة)
 * ========================================
 */

// قاعدة بيانات الاستئذانات
let leaveRequests = [];

/**
 * POST /api/student-affairs/leave-request
 * تسجيل استئذان طالب
 */
router.post('/leave-request', async (req, res) => {
  try {
    const { 
      studentId, 
      studentName, 
      classRoom,
      destination,
      reason,
      guardianName,
      guardianPhone,
      date,
      time
    } = req.body;

    // التحقق من البيانات
    if (!studentId || !destination || !guardianName || !guardianPhone) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير مكتملة'
      });
    }

    // إنشاء سجل الاستئذان
    const leaveRequest = {
      id: Date.now().toString(),
      studentId,
      studentName,
      classRoom,
      destination,
      reason,
      guardianName,
      guardianPhone,
      date: date || new Date().toISOString().split('T')[0],
      time: time || new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      status: 'in-progress', // in-progress, completed
      exitTime: new Date(),
      returnTime: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    leaveRequests.push(leaveRequest);

    // إرسال إشعار للمعلم (محاكاة)
    setTimeout(() => {
      sendTeacherLeaveNotification(leaveRequest);
    }, 500);

    res.status(201).json({
      success: true,
      message: 'تم تسجيل الاستئذان بنجاح',
      data: leaveRequest
    });
  } catch (error) {
    console.error('خطأ في تسجيل الاستئذان:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الاستئذان'
    });
  }
});

/**
 * GET /api/student-affairs/leave-requests
 * جلب سجلات الاستئذان
 */
router.get('/leave-requests', (req, res) => {
  try {
    const { date, studentId, classRoom, status } = req.query;

    let filteredRequests = [...leaveRequests];

    // تصفية حسب التاريخ
    if (date) {
      filteredRequests = filteredRequests.filter(record => record.date === date);
    }

    // تصفية حسب الطالب
    if (studentId) {
      filteredRequests = filteredRequests.filter(record => record.studentId === studentId);
    }

    // تصفية حسب الصف
    if (classRoom) {
      filteredRequests = filteredRequests.filter(record => record.classRoom === classRoom);
    }

    // تصفية حسب الحالة
    if (status) {
      filteredRequests = filteredRequests.filter(record => record.status === status);
    }

    // ترتيب حسب الأحدث
    filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: filteredRequests,
      count: filteredRequests.length
    });
  } catch (error) {
    console.error('خطأ في جلب سجلات الاستئذان:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات'
    });
  }
});

/**
 * GET /api/student-affairs/leave-stats/:studentId
 * إحصائيات استئذان طالب محدد
 */
router.get('/leave-stats/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    let studentLeaves = leaveRequests.filter(record => record.studentId === studentId);

    // تصفية حسب الفترة الزمنية
    if (startDate) {
      studentLeaves = studentLeaves.filter(record => record.date >= startDate);
    }
    if (endDate) {
      studentLeaves = studentLeaves.filter(record => record.date <= endDate);
    }

    // حساب الإحصائيات
    const stats = {
      totalLeaves: studentLeaves.length,
      inProgress: studentLeaves.filter(r => r.status === 'in-progress').length,
      completed: studentLeaves.filter(r => r.status === 'completed').length,
      byDestination: {},
      recentLeaves: studentLeaves.slice(0, 5).map(leave => ({
        date: leave.date,
        time: leave.time,
        destination: leave.destination,
        status: leave.status
      }))
    };

    // تجميع حسب الوجهة
    studentLeaves.forEach(leave => {
      stats.byDestination[leave.destination] = (stats.byDestination[leave.destination] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الاستئذان:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإحصائيات'
    });
  }
});

/**
 * PUT /api/student-affairs/leave-request/:id/complete
 * تحديث حالة الاستئذان (عودة الطالب)
 */
router.put('/leave-request/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { returnTime } = req.body;

    const leaveIndex = leaveRequests.findIndex(record => record.id === id);

    if (leaveIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'سجل الاستئذان غير موجود'
      });
    }

    // تحديث الحالة
    leaveRequests[leaveIndex].status = 'completed';
    leaveRequests[leaveIndex].returnTime = returnTime || new Date();
    leaveRequests[leaveIndex].updatedAt = new Date();

    res.json({
      success: true,
      message: 'تم تحديث حالة الاستئذان بنجاح',
      data: leaveRequests[leaveIndex]
    });
  } catch (error) {
    console.error('خطأ في تحديث حالة الاستئذان:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الحالة'
    });
  }
});

/**
 * GET /api/student-affairs/leave-daily-stats
 * إحصائيات يومية للاستئذانات
 */
router.get('/leave-daily-stats', (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const dailyLeaves = leaveRequests.filter(record => record.date === targetDate);

    const stats = {
      total: dailyLeaves.length,
      inProgress: dailyLeaves.filter(r => r.status === 'in-progress').length,
      completed: dailyLeaves.filter(r => r.status === 'completed').length,
      byDestination: {},
      byClass: {}
    };

    // تجميع حسب الوجهة
    dailyLeaves.forEach(leave => {
      stats.byDestination[leave.destination] = (stats.byDestination[leave.destination] || 0) + 1;
      stats.byClass[leave.classRoom] = (stats.byClass[leave.classRoom] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات اليومية:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإحصائيات'
    });
  }
});

/**
 * وظيفة إرسال إشعار واتساب للمعلم (محاكاة)
 */
function sendTeacherLeaveNotification(leaveRequest) {
  const message = `
🔔 إشعار استئذان طالب

👤 الطالب: ${leaveRequest.studentName}
🏫 الصف: ${leaveRequest.classRoom}
📍 جهة التوجه: ${leaveRequest.destination}
🕐 الوقت: ${leaveRequest.time}

أخي المعلم: تم استئذان الطالب، يرجى التكرم بالسماح له بالتوجه إلى ${leaveRequest.destination}.

📱 للتواصل مع ولي الأمر: ${leaveRequest.guardianPhone}
  `;

  console.log('إشعار المعلم (واتساب):', message);
  
  // هنا يمكن دمج API الواتساب الحقيقي
  // مثل: Twilio, WhatsApp Business API, إلخ
  
  return { success: true };
}

module.exports = router;
