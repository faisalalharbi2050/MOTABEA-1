// ===== API Routes لنظام الإشراف اليومي الذكي =====
// server/routes/supervision.js

const express = require('express');
const router = express.Router();

// Middleware للمصادقة (يجب تعديله وفق نظام المصادقة الخاص بك)
const authenticateToken = (req, res, next) => {
  // TODO: Implement your authentication logic
  next();
};

// ===== بيانات تجريبية (يجب استبدالها بقاعدة البيانات الفعلية) =====
let supervisionSettings = {
  supervisorsPerDay: 8,
  excludedTeachers: [],
  breakTiming: [
    { breakNumber: 1, afterPeriod: 2 },
    { breakNumber: 2, afterPeriod: 4 }
  ],
  locations: ['الساحة الشرقية', 'الساحة الغربية', 'المدخل الرئيسي', 'الممرات']
};

let supervisionSlots = [];
let attendanceRecords = [];

// ===== 1. GET - الحصول على إعدادات الإشراف =====
router.get('/settings', authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      data: supervisionSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب الإعدادات',
      error: error.message
    });
  }
});

// ===== 2. POST - حفظ إعدادات الإشراف =====
router.post('/settings', authenticateToken, (req, res) => {
  try {
    const { supervisorsPerDay, excludedTeachers, breakTiming, locations } = req.body;
    
    // التحقق من صحة البيانات
    if (!supervisorsPerDay || supervisorsPerDay < 1) {
      return res.status(400).json({
        success: false,
        message: 'عدد المشرفين غير صحيح'
      });
    }
    
    supervisionSettings = {
      supervisorsPerDay,
      excludedTeachers: excludedTeachers || [],
      breakTiming: breakTiming || supervisionSettings.breakTiming,
      locations: locations || []
    };
    
    // TODO: حفظ في قاعدة البيانات
    // await db.query('UPDATE supervision_settings SET ...', [supervisionSettings]);
    
    res.json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح',
      data: supervisionSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في حفظ الإعدادات',
      error: error.message
    });
  }
});

// ===== 3. GET - الحصول على جدول الإشراف =====
router.get('/schedule', authenticateToken, (req, res) => {
  try {
    const { weekStart, weekEnd } = req.query;
    
    // TODO: جلب من قاعدة البيانات مع تصفية حسب التواريخ
    // const slots = await db.query('SELECT * FROM supervision_slots WHERE date BETWEEN ? AND ?', [weekStart, weekEnd]);
    
    res.json({
      success: true,
      data: supervisionSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب الجدول',
      error: error.message
    });
  }
});

// ===== 4. POST - إنشاء جدول الإشراف التلقائي =====
router.post('/schedule/generate', authenticateToken, async (req, res) => {
  try {
    const { weekStart } = req.body;
    
    // TODO: تنفيذ الخوارزمية الذكية
    // 1. جلب قائمة المعلمين من قاعدة البيانات
    // 2. جلب جداول الحصص
    // 3. تطبيق الخوارزمية
    
    // مثال مبسط:
    const newSlots = generateSmartSchedule();
    supervisionSlots = newSlots;
    
    // TODO: حفظ في قاعدة البيانات
    // await db.query('INSERT INTO supervision_slots VALUES ...', [newSlots]);
    
    res.json({
      success: true,
      message: 'تم إنشاء الجدول بنجاح',
      data: {
        slots: newSlots,
        totalAssigned: newSlots.length,
        totalNeeded: 5 * supervisionSettings.supervisorsPerDay * supervisionSettings.breakTiming.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إنشاء الجدول',
      error: error.message
    });
  }
});

// ===== 5. PUT - تحديث موعد إشراف محدد =====
router.put('/schedule/:slotId', authenticateToken, (req, res) => {
  try {
    const { slotId } = req.params;
    const { teacherId, location, notes } = req.body;
    
    const slotIndex = supervisionSlots.findIndex(s => s.id === slotId);
    
    if (slotIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود'
      });
    }
    
    supervisionSlots[slotIndex] = {
      ...supervisionSlots[slotIndex],
      teacherId: teacherId || supervisionSlots[slotIndex].teacherId,
      location: location || supervisionSlots[slotIndex].location,
      notes: notes || supervisionSlots[slotIndex].notes
    };
    
    // TODO: تحديث في قاعدة البيانات
    // await db.query('UPDATE supervision_slots SET ... WHERE id = ?', [slotId]);
    
    res.json({
      success: true,
      message: 'تم تحديث الموعد بنجاح',
      data: supervisionSlots[slotIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحديث الموعد',
      error: error.message
    });
  }
});

// ===== 6. DELETE - حذف جدول الإشراف =====
router.delete('/schedule', authenticateToken, (req, res) => {
  try {
    const { weekStart } = req.query;
    
    supervisionSlots = [];
    attendanceRecords = [];
    
    // TODO: حذف من قاعدة البيانات
    // await db.query('DELETE FROM supervision_slots WHERE week_start = ?', [weekStart]);
    // await db.query('DELETE FROM attendance_records WHERE week_start = ?', [weekStart]);
    
    res.json({
      success: true,
      message: 'تم حذف الجدول بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في حذف الجدول',
      error: error.message
    });
  }
});

// ===== 7. GET - الحصول على سجلات الحضور =====
router.get('/attendance', authenticateToken, (req, res) => {
  try {
    const { day, breakNumber } = req.query;
    
    let filteredRecords = attendanceRecords;
    
    // تصفية حسب اليوم والفسحة إذا تم تحديدهما
    if (day || breakNumber) {
      const filteredSlots = supervisionSlots.filter(slot => {
        return (!day || slot.day === day) && (!breakNumber || slot.breakNumber === parseInt(breakNumber));
      });
      const slotIds = filteredSlots.map(s => s.id);
      filteredRecords = attendanceRecords.filter(r => slotIds.includes(r.supervisionSlotId));
    }
    
    res.json({
      success: true,
      data: filteredRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب سجلات الحضور',
      error: error.message
    });
  }
});

// ===== 8. POST - تحديث حالة الحضور =====
router.post('/attendance', authenticateToken, (req, res) => {
  try {
    const { supervisionSlotId, status, notes } = req.body;
    
    // التحقق من صحة الحالة
    const validStatuses = ['scheduled', 'present', 'absent', 'excused', 'late'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'حالة الحضور غير صحيحة'
      });
    }
    
    // تحديث الخانة
    const slotIndex = supervisionSlots.findIndex(s => s.id === supervisionSlotId);
    if (slotIndex !== -1) {
      supervisionSlots[slotIndex].status = status;
    }
    
    // إضافة/تحديث سجل الحضور
    const recordIndex = attendanceRecords.findIndex(r => r.supervisionSlotId === supervisionSlotId);
    const newRecord = {
      supervisionSlotId,
      status,
      timestamp: new Date(),
      notes: notes || ''
    };
    
    if (recordIndex !== -1) {
      attendanceRecords[recordIndex] = newRecord;
    } else {
      attendanceRecords.push(newRecord);
    }
    
    // TODO: حفظ في قاعدة البيانات
    // await db.query('UPDATE supervision_slots SET status = ? WHERE id = ?', [status, supervisionSlotId]);
    // await db.query('INSERT INTO attendance_records ... ON DUPLICATE KEY UPDATE ...', [newRecord]);
    
    res.json({
      success: true,
      message: 'تم تحديث حالة الحضور بنجاح',
      data: newRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحديث حالة الحضور',
      error: error.message
    });
  }
});

// ===== 9. GET - إحصائيات وتقارير =====
router.get('/reports/statistics', authenticateToken, (req, res) => {
  try {
    const { weekStart, weekEnd } = req.query;
    
    // TODO: جلب البيانات من قاعدة البيانات مع التصفية
    
    const totalSlots = supervisionSlots.length;
    const presentCount = supervisionSlots.filter(s => s.status === 'present').length;
    const absentCount = supervisionSlots.filter(s => s.status === 'absent').length;
    const excusedCount = supervisionSlots.filter(s => s.status === 'excused').length;
    const lateCount = supervisionSlots.filter(s => s.status === 'late').length;
    const scheduledCount = supervisionSlots.filter(s => s.status === 'scheduled').length;
    
    const presentPercentage = totalSlots > 0 ? ((presentCount / totalSlots) * 100).toFixed(2) : '0';
    
    // إحصائيات حسب اليوم
    const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
    const byDay = daysOfWeek.map(day => {
      const daySlots = supervisionSlots.filter(s => s.day === day);
      const dayPresent = daySlots.filter(s => s.status === 'present').length;
      return {
        day,
        total: daySlots.length,
        present: dayPresent,
        percentage: daySlots.length > 0 ? ((dayPresent / daySlots.length) * 100).toFixed(1) : '0'
      };
    });
    
    res.json({
      success: true,
      data: {
        overall: {
          total: totalSlots,
          present: presentCount,
          absent: absentCount,
          excused: excusedCount,
          late: lateCount,
          scheduled: scheduledCount,
          presentPercentage
        },
        byDay
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب الإحصائيات',
      error: error.message
    });
  }
});

// ===== 10. GET - جلب قائمة المعلمين =====
router.get('/teachers', authenticateToken, (req, res) => {
  try {
    // TODO: جلب من قاعدة البيانات
    // const teachers = await db.query('SELECT id, name, specialization, phone FROM teachers');
    
    // بيانات تجريبية
    const demoTeachers = [
      { id: '1', name: 'أحمد محمد العمري', specialization: 'اللغة العربية', phone: '0501234567' },
      { id: '2', name: 'خالد عبدالله السعيد', specialization: 'الرياضيات', phone: '0501234568' },
      // ... المزيد
    ];
    
    res.json({
      success: true,
      data: demoTeachers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب قائمة المعلمين',
      error: error.message
    });
  }
});

// ===== دالة مساعدة - توليد الجدول التلقائي =====
function generateSmartSchedule() {
  // TODO: تنفيذ الخوارزمية الذكية الكاملة
  // هذه نسخة مبسطة للتوضيح
  
  const newSlots = [];
  const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const usedTeachers = new Set();
  
  // ... باقي الكود
  
  return newSlots;
}

module.exports = router;
