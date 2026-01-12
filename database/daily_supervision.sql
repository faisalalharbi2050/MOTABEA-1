-- ===================================
-- نظام الإشراف اليومي - قاعدة البيانات
-- ===================================
-- التاريخ: 25 نوفمبر 2025
-- الإصدار: 1.0.0
-- ===================================

-- 1. جدول إعدادات الإشراف
-- ===================================
CREATE TABLE IF NOT EXISTS supervision_settings (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    week_days TEXT NOT NULL COMMENT 'أيام الأسبوع بصيغة JSON',
    break_count INT NOT NULL DEFAULT 1 COMMENT 'عدد الفسح (1-4)',
    break_timings TEXT NOT NULL COMMENT 'مواعيد الفسح بصيغة JSON',
    supervisor_count INT NOT NULL DEFAULT 8 COMMENT 'عدد المشرفين',
    educational_affairs_vice VARCHAR(255) COMMENT 'اسم وكيل الشؤون التعليمية',
    principal_name VARCHAR(255) COMMENT 'اسم مدير المدرسة',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='جدول إعدادات الإشراف اليومي';

-- مثال على البيانات:
-- week_days: ["sunday", "monday", "tuesday", "wednesday", "thursday"]
-- break_timings: [{"breakNumber": 1, "afterLesson": 2}, {"breakNumber": 2, "afterLesson": 4}]

-- ===================================
-- 2. جدول جداول الإشراف
-- ===================================
CREATE TABLE IF NOT EXISTS supervision_tables (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    break_number INT NOT NULL COMMENT 'رقم الفسحة (1-4)',
    start_day VARCHAR(50) NOT NULL COMMENT 'يوم البداية (sunday, monday, etc)',
    start_date DATE NOT NULL COMMENT 'تاريخ البداية',
    supervisor_count INT NOT NULL COMMENT 'عدد المشرفين',
    educational_affairs_vice VARCHAR(255) COMMENT 'وكيل الشؤون التعليمية',
    principal_name VARCHAR(255) COMMENT 'مدير المدرسة',
    table_data LONGTEXT NOT NULL COMMENT 'بيانات الجدول بصيغة JSON',
    status ENUM('draft', 'published', 'archived') DEFAULT 'published' COMMENT 'حالة الجدول',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_break_number (break_number),
    INDEX idx_start_date (start_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='جدول جداول الإشراف اليومي';

-- مثال على table_data:
-- [
--   {
--     "day": "sunday",
--     "date": "2025-11-25",
--     "supervisors": [
--       {
--         "id": "sup-1",
--         "name": "أحمد محمد",
--         "position": "right",
--         "location": "الساحة الرئيسية",
--         "isAutoAssigned": false,
--         "teacherId": "teacher-123"
--       }
--     ],
--     "followupSupervisor": "عبدالله علي"
--   }
-- ]

-- ===================================
-- 3. جدول متابعة تفعيل الإشراف
-- ===================================
CREATE TABLE IF NOT EXISTS supervision_activations (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    table_id VARCHAR(255) NOT NULL COMMENT 'معرف جدول الإشراف',
    supervisor_id VARCHAR(255) NOT NULL COMMENT 'معرف المشرف',
    supervisor_name VARCHAR(255) NOT NULL COMMENT 'اسم المشرف',
    day VARCHAR(50) NOT NULL COMMENT 'اليوم',
    date DATE NOT NULL COMMENT 'التاريخ',
    action ENUM('present', 'absent', 'excused', 'withdrawn', 'late') NOT NULL COMMENT 'الإجراء المتخذ',
    action_time TIME NULL COMMENT 'وقت الانسحاب أو التأخر',
    notes TEXT COMMENT 'ملاحظات',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_table_id (table_id),
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_date (date),
    INDEX idx_action (action),
    
    FOREIGN KEY (table_id) REFERENCES supervision_tables(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='جدول متابعة تفعيل الإشراف اليومي';

-- أنواع الإجراءات:
-- present: حاضر (100% تفعيل)
-- absent: غائب (0% تفعيل)
-- excused: مستأذن (0% تفعيل)
-- withdrawn: منسحب (50% تفعيل) - يتطلب action_time
-- late: متأخر (50% تفعيل) - يتطلب action_time

-- ===================================
-- 4. جدول تقارير الإشراف
-- ===================================
CREATE TABLE IF NOT EXISTS supervision_reports (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    supervisor_id VARCHAR(255) NULL COMMENT 'معرف المشرف (NULL للتقارير الجماعية)',
    supervisor_name VARCHAR(255) NULL COMMENT 'اسم المشرف',
    report_type ENUM('weekly', 'monthly') NOT NULL COMMENT 'نوع التقرير',
    start_date DATE NOT NULL COMMENT 'تاريخ البداية',
    end_date DATE NOT NULL COMMENT 'تاريخ النهاية',
    excluded_dates TEXT NULL COMMENT 'أيام الإجازات المستبعدة (JSON)',
    statistics TEXT NOT NULL COMMENT 'الإحصائيات (JSON)',
    pdf_url VARCHAR(500) NULL COMMENT 'رابط ملف PDF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_report_type (report_type),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='جدول تقارير الإشراف اليومي';

-- مثال على statistics:
-- {
--   "totalDays": 20,
--   "workingDays": 18,
--   "fullyActivated": 15,
--   "notActivated": 2,
--   "partiallyActivated": 1,
--   "activationRate": 88.89
-- }

-- ===================================
-- 5. Views (عروض) للاستعلامات السريعة
-- ===================================

-- View: ملخص إحصائيات المشرفين
CREATE OR REPLACE VIEW v_supervisor_statistics AS
SELECT 
    sa.supervisor_id,
    sa.supervisor_name,
    COUNT(DISTINCT sa.date) as total_days,
    SUM(CASE WHEN sa.action = 'present' THEN 1 ELSE 0 END) as present_count,
    SUM(CASE WHEN sa.action = 'absent' THEN 1 ELSE 0 END) as absent_count,
    SUM(CASE WHEN sa.action = 'excused' THEN 1 ELSE 0 END) as excused_count,
    SUM(CASE WHEN sa.action = 'withdrawn' THEN 1 ELSE 0 END) as withdrawn_count,
    SUM(CASE WHEN sa.action = 'late' THEN 1 ELSE 0 END) as late_count,
    ROUND(
        (
            SUM(CASE WHEN sa.action = 'present' THEN 1 ELSE 0 END) +
            SUM(CASE WHEN sa.action IN ('withdrawn', 'late') THEN 0.5 ELSE 0 END)
        ) / COUNT(DISTINCT sa.date) * 100,
        2
    ) as activation_rate
FROM supervision_activations sa
GROUP BY sa.supervisor_id, sa.supervisor_name;

-- View: جداول الإشراف النشطة
CREATE OR REPLACE VIEW v_active_supervision_tables AS
SELECT 
    st.*,
    COUNT(DISTINCT sa.date) as activation_days,
    (SELECT COUNT(*) FROM supervision_activations WHERE table_id = st.id) as total_activations
FROM supervision_tables st
LEFT JOIN supervision_activations sa ON st.id = sa.table_id
WHERE st.status = 'published'
GROUP BY st.id;

-- ===================================
-- 6. Stored Procedures (إجراءات محفوظة)
-- ===================================

-- إجراء: حساب نسبة التفعيل لفترة محددة
DELIMITER //

CREATE PROCEDURE sp_calculate_activation_rate(
    IN p_supervisor_id VARCHAR(255),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_excluded_dates TEXT,
    OUT p_activation_rate DECIMAL(5,2)
)
BEGIN
    DECLARE total_days INT;
    DECLARE working_days INT;
    DECLARE fully_activated INT;
    DECLARE partially_activated INT;
    
    -- حساب إجمالي الأيام
    SET total_days = DATEDIFF(p_end_date, p_start_date) + 1;
    
    -- حساب أيام العمل (بعد استبعاد الإجازات)
    -- ملاحظة: يحتاج تحسين لمعالجة p_excluded_dates JSON
    SET working_days = total_days;
    
    -- حساب المفعلون بالكامل
    SELECT COUNT(*) INTO fully_activated
    FROM supervision_activations
    WHERE supervisor_id = p_supervisor_id
        AND date BETWEEN p_start_date AND p_end_date
        AND action = 'present';
    
    -- حساب المفعلون جزئياً
    SELECT COUNT(*) INTO partially_activated
    FROM supervision_activations
    WHERE supervisor_id = p_supervisor_id
        AND date BETWEEN p_start_date AND p_end_date
        AND action IN ('withdrawn', 'late');
    
    -- حساب النسبة
    SET p_activation_rate = ROUND(
        (fully_activated + (partially_activated * 0.5)) / working_days * 100,
        2
    );
END //

DELIMITER ;

-- ===================================
-- 7. Triggers (مشغلات)
-- ===================================

-- مشغل: تحديث updated_at تلقائياً
DELIMITER //

CREATE TRIGGER trg_supervision_settings_updated
BEFORE UPDATE ON supervision_settings
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

CREATE TRIGGER trg_supervision_tables_updated
BEFORE UPDATE ON supervision_tables
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

CREATE TRIGGER trg_supervision_activations_updated
BEFORE UPDATE ON supervision_activations
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

CREATE TRIGGER trg_supervision_reports_updated
BEFORE UPDATE ON supervision_reports
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

DELIMITER ;

-- ===================================
-- 8. بيانات تجريبية (للاختبار)
-- ===================================

-- إضافة إعدادات تجريبية
INSERT INTO supervision_settings (
    id, user_id, week_days, break_count, break_timings, 
    supervisor_count, educational_affairs_vice, principal_name
) VALUES (
    'setting-1',
    'user-1',
    '["sunday","monday","tuesday","wednesday","thursday"]',
    2,
    '[{"breakNumber":1,"afterLesson":2},{"breakNumber":2,"afterLesson":4}]',
    8,
    'أحمد محمد العلي',
    'خالد سعيد السالم'
);

-- إضافة جدول إشراف تجريبي
INSERT INTO supervision_tables (
    id, user_id, break_number, start_day, start_date,
    supervisor_count, educational_affairs_vice, principal_name,
    table_data, status
) VALUES (
    'table-1',
    'user-1',
    1,
    'sunday',
    '2025-11-25',
    8,
    'أحمد محمد العلي',
    'خالد سعيد السالم',
    '[{"day":"sunday","supervisors":[{"name":"أحمد محمد","position":"right","location":"الساحة الرئيسية","isAutoAssigned":false}],"followupSupervisor":"عبدالله"}]',
    'published'
);

-- إضافة تفعيل تجريبي
INSERT INTO supervision_activations (
    id, user_id, table_id, supervisor_id, supervisor_name,
    day, date, action, action_time, notes
) VALUES (
    'activation-1',
    'user-1',
    'table-1',
    'sup-1',
    'أحمد محمد',
    'sunday',
    '2025-11-25',
    'present',
    NULL,
    'تفعيل تجريبي'
);

-- ===================================
-- 9. استعلامات مفيدة (Queries)
-- ===================================

-- الحصول على إحصائيات مشرف محدد
/*
SELECT * FROM v_supervisor_statistics 
WHERE supervisor_id = 'sup-1';
*/

-- الحصول على جميع التفعيلات ليوم معين
/*
SELECT * FROM supervision_activations
WHERE date = '2025-11-25'
ORDER BY supervisor_name;
*/

-- الحصول على المشرفين الغائبين في فترة معينة
/*
SELECT supervisor_name, COUNT(*) as absent_days
FROM supervision_activations
WHERE action = 'absent'
    AND date BETWEEN '2025-11-18' AND '2025-11-25'
GROUP BY supervisor_id, supervisor_name
ORDER BY absent_days DESC;
*/

-- حساب نسبة التفعيل الإجمالية
/*
SELECT 
    COUNT(DISTINCT supervisor_id) as total_supervisors,
    COUNT(DISTINCT date) as total_days,
    AVG(
        CASE 
            WHEN action = 'present' THEN 100
            WHEN action IN ('withdrawn', 'late') THEN 50
            ELSE 0
        END
    ) as average_activation_rate
FROM supervision_activations
WHERE date BETWEEN '2025-11-18' AND '2025-11-25';
*/

-- ===================================
-- 10. الفهارس الإضافية للأداء
-- ===================================

-- فهرس مركب للاستعلامات المتكررة
CREATE INDEX idx_activation_supervisor_date 
ON supervision_activations(supervisor_id, date, action);

CREATE INDEX idx_table_user_break 
ON supervision_tables(user_id, break_number, status);

-- ===================================
-- ملاحظات هامة:
-- ===================================
-- 1. جميع الجداول تستخدم UTF8MB4 لدعم اللغة العربية
-- 2. الحقول النصية الطويلة (JSON) تستخدم TEXT أو LONGTEXT
-- 3. جميع التواريخ والأوقات بتنسيق ISO 8601
-- 4. Foreign Keys لضمان سلامة البيانات
-- 5. Indexes للأداء الأفضل
-- 6. Views للاستعلامات المعقدة
-- 7. Stored Procedures للعمليات المعقدة
-- 8. Triggers للتحديث التلقائي
-- 9. بيانات تجريبية للاختبار

-- ===================================
-- انتهى ملف SQL
-- ===================================
