-- ===== جداول قاعدة البيانات لنظام الإشراف اليومي الذكي =====
-- Smart Daily Supervision Database Schema

-- 1. جدول إعدادات الإشراف
CREATE TABLE IF NOT EXISTS supervision_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_year VARCHAR(20) NOT NULL,
  semester ENUM('الأول', 'الثاني', 'الثالث') NOT NULL,
  supervisors_per_day INT NOT NULL DEFAULT 8,
  break_timing JSON NOT NULL, -- مثال: [{"breakNumber": 1, "afterPeriod": 2}, {"breakNumber": 2, "afterPeriod": 4}]
  locations JSON NOT NULL, -- مثال: ["الساحة الشرقية", "الساحة الغربية", ...]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_school_semester (school_year, semester)
);

-- 2. جدول المعلمين المستثنين من الإشراف
CREATE TABLE IF NOT EXISTS supervision_exclusions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  school_year VARCHAR(20) NOT NULL,
  semester ENUM('الأول', 'الثاني', 'الثالث') NOT NULL,
  reason VARCHAR(500),
  excluded_by INT, -- معرف الموظف الذي أضاف الاستثناء
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_teacher_exclusion (teacher_id, school_year, semester)
);

-- 3. جدول مواعيد الإشراف (الجدول الأساسي)
CREATE TABLE IF NOT EXISTS supervision_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(100) UNIQUE NOT NULL, -- معرف فريد للاستخدام في API
  school_year VARCHAR(20) NOT NULL,
  semester ENUM('الأول', 'الثاني', 'الثالث') NOT NULL,
  week_start_date DATE NOT NULL, -- تاريخ بداية الأسبوع
  day_of_week ENUM('الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس') NOT NULL,
  day_index INT NOT NULL, -- 0-4 للأحد-الخميس
  break_number INT NOT NULL, -- 1, 2, 3, ...
  teacher_id INT NOT NULL,
  location VARCHAR(200) NOT NULL,
  status ENUM('scheduled', 'present', 'absent', 'excused', 'late') DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  INDEX idx_week_day (week_start_date, day_index),
  INDEX idx_teacher_week (teacher_id, week_start_date),
  INDEX idx_status (status)
);

-- 4. جدول سجلات الحضور والغياب
CREATE TABLE IF NOT EXISTS supervision_attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supervision_slot_id INT NOT NULL,
  status ENUM('present', 'absent', 'excused', 'late') NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  recorded_by INT, -- معرف الموظف الذي سجل الحضور
  notes TEXT,
  FOREIGN KEY (supervision_slot_id) REFERENCES supervision_slots(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_slot_timestamp (supervision_slot_id, timestamp)
);

-- 5. جدول تاريخ التغييرات (Audit Log)
CREATE TABLE IF NOT EXISTS supervision_audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supervision_slot_id INT,
  action_type ENUM('created', 'updated', 'deleted', 'status_changed') NOT NULL,
  old_value JSON,
  new_value JSON,
  changed_by INT,
  change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supervision_slot_id) REFERENCES supervision_slots(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_timestamp (change_timestamp)
);

-- 6. جدول الإشعارات والتنبيهات
CREATE TABLE IF NOT EXISTS supervision_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supervision_slot_id INT NOT NULL,
  teacher_id INT NOT NULL,
  notification_type ENUM('assignment', 'reminder', 'change', 'absence') NOT NULL,
  message TEXT NOT NULL,
  sent_via ENUM('whatsapp', 'sms', 'email', 'system') NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (supervision_slot_id) REFERENCES supervision_slots(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  INDEX idx_teacher_read (teacher_id, is_read)
);

-- 7. جدول التقارير المحفوظة
CREATE TABLE IF NOT EXISTS supervision_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_type ENUM('weekly', 'monthly', 'custom') NOT NULL,
  school_year VARCHAR(20) NOT NULL,
  semester ENUM('الأول', 'الثاني', 'الثالث') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  report_data JSON NOT NULL, -- البيانات والإحصائيات
  generated_by INT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_dates (start_date, end_date)
);

-- ===== Views (عروض مفيدة) =====

-- عرض للمشرفين مع معلوماتهم الكاملة
CREATE OR REPLACE VIEW v_supervision_schedule AS
SELECT 
  ss.id,
  ss.uuid,
  ss.school_year,
  ss.semester,
  ss.week_start_date,
  ss.day_of_week,
  ss.day_index,
  ss.break_number,
  ss.location,
  ss.status,
  ss.notes,
  t.id AS teacher_id,
  t.name AS teacher_name,
  t.specialization AS teacher_specialization,
  t.phone AS teacher_phone,
  ss.created_at,
  ss.updated_at
FROM supervision_slots ss
INNER JOIN teachers t ON ss.teacher_id = t.id;

-- عرض لإحصائيات الإشراف
CREATE OR REPLACE VIEW v_supervision_statistics AS
SELECT 
  school_year,
  semester,
  week_start_date,
  day_of_week,
  COUNT(*) AS total_slots,
  SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_count,
  SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
  SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) AS excused_count,
  SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_count,
  ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS attendance_percentage
FROM supervision_slots
GROUP BY school_year, semester, week_start_date, day_of_week;

-- ===== Stored Procedures =====

-- إجراء للحصول على المعلمين المؤهلين للإشراف في يوم معين
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS GetEligibleTeachers(
  IN p_school_year VARCHAR(20),
  IN p_semester VARCHAR(20),
  IN p_week_start DATE,
  IN p_day_index INT,
  IN p_break_period INT
)
BEGIN
  -- جلب المعلمين غير المستثنين وغير المعينين في نفس الأسبوع
  SELECT DISTINCT t.id, t.name, t.specialization, t.phone
  FROM teachers t
  WHERE 
    -- استبعاد المعلمين المستثنين
    t.id NOT IN (
      SELECT teacher_id 
      FROM supervision_exclusions 
      WHERE school_year = p_school_year 
      AND semester = p_semester
    )
    -- استبعاد المعلمين المعينين في نفس الأسبوع
    AND t.id NOT IN (
      SELECT teacher_id 
      FROM supervision_slots 
      WHERE school_year = p_school_year 
      AND semester = p_semester
      AND week_start_date = p_week_start
    )
    -- TODO: إضافة شرط التحقق من جدول الحصص
    -- AND (has_free_period_before OR has_free_period_after)
  ORDER BY RAND()
  LIMIT 20;
END$$

DELIMITER ;

-- إجراء لحذف جدول أسبوع كامل
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS DeleteWeekSchedule(
  IN p_week_start DATE,
  IN p_school_year VARCHAR(20),
  IN p_semester VARCHAR(20)
)
BEGIN
  DELETE FROM supervision_slots 
  WHERE week_start_date = p_week_start
  AND school_year = p_school_year
  AND semester = p_semester;
END$$

DELIMITER ;

-- ===== Triggers =====

-- Trigger لإضافة سجل في Audit Log عند التعديل
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS supervision_slots_after_update
AFTER UPDATE ON supervision_slots
FOR EACH ROW
BEGIN
  INSERT INTO supervision_audit_log (
    supervision_slot_id,
    action_type,
    old_value,
    new_value,
    changed_by
  ) VALUES (
    NEW.id,
    'updated',
    JSON_OBJECT(
      'teacher_id', OLD.teacher_id,
      'location', OLD.location,
      'status', OLD.status,
      'notes', OLD.notes
    ),
    JSON_OBJECT(
      'teacher_id', NEW.teacher_id,
      'location', NEW.location,
      'status', NEW.status,
      'notes', NEW.notes
    ),
    NULL -- يمكن إضافة معرف المستخدم من Application
  );
END$$

DELIMITER ;

-- ===== بيانات أولية (Initial Data) =====

-- إدراج إعدادات افتراضية
INSERT INTO supervision_settings (school_year, semester, supervisors_per_day, break_timing, locations)
VALUES (
  '1445-1446',
  'الأول',
  8,
  JSON_ARRAY(
    JSON_OBJECT('breakNumber', 1, 'afterPeriod', 2),
    JSON_OBJECT('breakNumber', 2, 'afterPeriod', 4)
  ),
  JSON_ARRAY('الساحة الشرقية', 'الساحة الغربية', 'المدخل الرئيسي', 'الممرات')
)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ===== ملاحظات مهمة =====
-- 1. تأكد من وجود جدول teachers مع الحقول المطلوبة (id, name, specialization, phone)
-- 2. تأكد من وجود جدول users للمصادقة
-- 3. قد تحتاج لتعديل أنواع البيانات حسب نظام قاعدة البيانات الخاص بك
-- 4. الـ UUIDs مفيدة للاستخدام في الـ API بدلاً من الـ IDs العددية لأسباب أمنية
-- 5. الـ Triggers والـ Procedures اختيارية ولكنها مفيدة للأداء
