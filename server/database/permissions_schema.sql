-- نظام إدارة الصلاحيات
-- Permissions Management System Database Schema

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  quick_access_pin CHAR(4) UNIQUE NOT NULL,
  access_level ENUM('admin', 'manager', 'user', 'custom') NOT NULL DEFAULT 'user',
  source ENUM('teacher', 'administrator', 'manual') NOT NULL DEFAULT 'manual',
  source_id VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_username (username),
  INDEX idx_quick_access_pin (quick_access_pin),
  INDEX idx_access_level (access_level),
  INDEX idx_source (source),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول صلاحيات المستخدمين
CREATE TABLE IF NOT EXISTS user_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  module VARCHAR(50) NOT NULL,
  actions JSON NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_module (module),
  INDEX idx_enabled (enabled),
  UNIQUE KEY unique_user_module (user_id, module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سجل تغييرات الصلاحيات
CREATE TABLE IF NOT EXISTS permission_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  action ENUM('created', 'updated', 'deleted', 'login', 'logout', 'permission_changed') NOT NULL,
  details TEXT,
  performed_by INT NOT NULL,
  performed_by_name VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_performed_by (performed_by),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدخال مستخدم مدير افتراضي
INSERT INTO users (username, name, email, password, quick_access_pin, access_level, source, is_active, created_by)
VALUES 
  ('admin', 'مدير النظام', 'admin@motabea.sa', '$2b$10$YourHashedPasswordHere', '1234', 'admin', 'manual', TRUE, 1),
  ('vice', 'وكيل المدرسة', 'vice@motabea.sa', '$2b$10$YourHashedPasswordHere', '5678', 'manager', 'administrator', TRUE, 1),
  ('teacher_demo', 'معلم تجريبي', 'teacher@motabea.sa', '$2b$10$YourHashedPasswordHere', '9012', 'user', 'teacher', TRUE, 1)
ON DUPLICATE KEY UPDATE username=username;

-- إدخال صلاحيات للمدير (صلاحيات كاملة)
INSERT INTO user_permissions (user_id, module, actions, enabled)
SELECT 
  u.id,
  m.module,
  '["view", "create", "edit", "delete", "export", "print"]' as actions,
  TRUE as enabled
FROM users u
CROSS JOIN (
  SELECT 'dashboard' as module UNION ALL
  SELECT 'teachers' UNION ALL
  SELECT 'students' UNION ALL
  SELECT 'schedule' UNION ALL
  SELECT 'supervision' UNION ALL
  SELECT 'daily-waiting' UNION ALL
  SELECT 'behavior-attendance' UNION ALL
  SELECT 'student-forms' UNION ALL
  SELECT 'messages' UNION ALL
  SELECT 'tasks' UNION ALL
  SELECT 'reports' UNION ALL
  SELECT 'settings' UNION ALL
  SELECT 'initial-settings'
) m
WHERE u.username = 'admin'
ON DUPLICATE KEY UPDATE module=module;

-- إدخال صلاحيات للوكيل (صلاحيات إدارية)
INSERT INTO user_permissions (user_id, module, actions, enabled)
SELECT 
  u.id,
  m.module,
  CASE 
    WHEN m.module IN ('settings', 'initial-settings') THEN '["view"]'
    ELSE '["view", "create", "edit", "export", "print"]'
  END as actions,
  CASE 
    WHEN m.module = 'settings' THEN FALSE
    ELSE TRUE
  END as enabled
FROM users u
CROSS JOIN (
  SELECT 'dashboard' as module UNION ALL
  SELECT 'teachers' UNION ALL
  SELECT 'students' UNION ALL
  SELECT 'schedule' UNION ALL
  SELECT 'supervision' UNION ALL
  SELECT 'daily-waiting' UNION ALL
  SELECT 'behavior-attendance' UNION ALL
  SELECT 'student-forms' UNION ALL
  SELECT 'messages' UNION ALL
  SELECT 'tasks' UNION ALL
  SELECT 'reports' UNION ALL
  SELECT 'settings' UNION ALL
  SELECT 'initial-settings'
) m
WHERE u.username = 'vice'
ON DUPLICATE KEY UPDATE module=module;

-- إدخال صلاحيات للمعلم (عرض فقط)
INSERT INTO user_permissions (user_id, module, actions, enabled)
SELECT 
  u.id,
  m.module,
  '["view"]' as actions,
  CASE 
    WHEN m.module IN ('settings', 'initial-settings') THEN FALSE
    ELSE TRUE
  END as enabled
FROM users u
CROSS JOIN (
  SELECT 'dashboard' as module UNION ALL
  SELECT 'teachers' UNION ALL
  SELECT 'students' UNION ALL
  SELECT 'schedule' UNION ALL
  SELECT 'supervision' UNION ALL
  SELECT 'daily-waiting' UNION ALL
  SELECT 'behavior-attendance' UNION ALL
  SELECT 'student-forms' UNION ALL
  SELECT 'messages' UNION ALL
  SELECT 'tasks' UNION ALL
  SELECT 'reports'
) m
WHERE u.username = 'teacher_demo'
ON DUPLICATE KEY UPDATE module=module;

-- إنشاء views للإحصائيات
CREATE OR REPLACE VIEW permissions_stats AS
SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
  SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as inactive_users,
  SUM(CASE WHEN access_level = 'admin' THEN 1 ELSE 0 END) as admin_users,
  SUM(CASE WHEN access_level = 'manager' THEN 1 ELSE 0 END) as manager_users,
  SUM(CASE WHEN access_level = 'user' THEN 1 ELSE 0 END) as regular_users,
  SUM(CASE WHEN access_level = 'custom' THEN 1 ELSE 0 END) as custom_users,
  SUM(CASE WHEN source = 'teacher' THEN 1 ELSE 0 END) as teacher_source,
  SUM(CASE WHEN source = 'administrator' THEN 1 ELSE 0 END) as admin_source,
  SUM(CASE WHEN source = 'manual' THEN 1 ELSE 0 END) as manual_source
FROM users;

-- إنشاء stored procedure لتوليد رقم دخول سريع فريد
DELIMITER //
CREATE PROCEDURE generate_unique_pin()
BEGIN
  DECLARE pin CHAR(4);
  DECLARE pin_exists INT;
  
  REPEAT
    SET pin = LPAD(FLOOR(RAND() * 10000), 4, '0');
    SELECT COUNT(*) INTO pin_exists FROM users WHERE quick_access_pin = pin;
  UNTIL pin_exists = 0
  END REPEAT;
  
  SELECT pin;
END //
DELIMITER ;

-- إنشاء trigger لتسجيل التغييرات
DELIMITER //
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO permission_logs (user_id, user_name, action, details, performed_by, performed_by_name, timestamp)
  VALUES (NEW.id, NEW.name, 'created', CONCAT('User created: ', NEW.username), NEW.created_by, 'System', NOW());
END //

CREATE TRIGGER after_user_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  IF OLD.is_active != NEW.is_active THEN
    INSERT INTO permission_logs (user_id, user_name, action, details, performed_by, performed_by_name, timestamp)
    VALUES (NEW.id, NEW.name, 'updated', 
            CONCAT('Account status changed to: ', IF(NEW.is_active, 'Active', 'Inactive')), 
            NEW.created_by, 'System', NOW());
  END IF;
END //

CREATE TRIGGER after_permission_change
AFTER INSERT ON user_permissions
FOR EACH ROW
BEGIN
  INSERT INTO permission_logs (user_id, user_name, action, details, performed_by, performed_by_name, timestamp)
  SELECT NEW.user_id, u.name, 'permission_changed', 
         CONCAT('Permission added for module: ', NEW.module), 
         u.created_by, 'System', NOW()
  FROM users u WHERE u.id = NEW.user_id;
END //
DELIMITER ;

-- الفهارس الإضافية لتحسين الأداء
CREATE INDEX idx_user_permissions_lookup ON user_permissions(user_id, module, enabled);
CREATE INDEX idx_permission_logs_lookup ON permission_logs(user_id, action, timestamp);
CREATE INDEX idx_users_active_lookup ON users(is_active, access_level);

-- منح الصلاحيات (تأكد من تعديل اسم المستخدم)
-- GRANT ALL PRIVILEGES ON motabea.* TO 'motabea_user'@'localhost';
-- FLUSH PRIVILEGES;
