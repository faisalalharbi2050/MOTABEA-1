-- MOTABEA School Management System Database Schema

-- إعدادات قاعدة البيانات
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS motabea_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE motabea_db;

-- جدول المدارس
CREATE TABLE schools (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    principal_name VARCHAR(255),
    vice_principal_name VARCHAR(255),
    establishment_date DATE,
    school_type ENUM('primary', 'middle', 'secondary', 'combined') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول المستخدمين
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'principal', 'vice_principal', 'supervisor', 'teacher', 'staff') NOT NULL,
    school_id VARCHAR(36),
    phone VARCHAR(20),
    hire_date DATE,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    permissions JSON,
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
);

-- جدول المعلمين
CREATE TABLE teachers (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    national_id VARCHAR(20),
    birth_date DATE,
    gender ENUM('male', 'female'),
    address TEXT,
    emergency_contact VARCHAR(255),
    specialization VARCHAR(255),
    qualifications JSON,
    experience_years INT DEFAULT 0,
    weekly_quota INT DEFAULT 0,
    current_quota INT DEFAULT 0,
    hire_date DATE,
    contract_type ENUM('permanent', 'temporary', 'substitute'),
    status ENUM('active', 'inactive', 'on_leave', 'transferred') DEFAULT 'active',
    subjects JSON,
    classes JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- جدول الطلاب
CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    national_id VARCHAR(20),
    birth_date DATE,
    gender ENUM('male', 'female'),
    class_id VARCHAR(36),
    school_id VARCHAR(36),
    class_name VARCHAR(100),
    grade_level INT,
    section VARCHAR(10),
    enrollment_date DATE,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    mother_name VARCHAR(255),
    mother_phone VARCHAR(20),
    emergency_contact VARCHAR(255),
    address TEXT,
    medical_conditions JSON,
    behavioral_notes TEXT,
    academic_level ENUM('excellent', 'good', 'average', 'needs_improvement'),
    status ENUM('active', 'transferred', 'graduated', 'dropped', 'suspended') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
);

-- جدول المواد الدراسية
CREATE TABLE subjects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    grade_levels JSON,
    weekly_hours INT DEFAULT 0,
    type ENUM('core', 'elective', 'activity'),
    department VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول الفصول الدراسية
CREATE TABLE classes (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    school_id VARCHAR(36),
    grade_level INT,
    section VARCHAR(10),
    room_number VARCHAR(50),
    capacity INT DEFAULT 30,
    current_students INT DEFAULT 0,
    class_teacher_id VARCHAR(36),
    academic_year VARCHAR(20),
    semester VARCHAR(20),
    education_type ENUM('general', 'memorization') DEFAULT 'general',
    status ENUM('active', 'inactive') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
);

-- جدول ربط الفصول بالمواد
CREATE TABLE class_subjects (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36) NOT NULL,
    subject_id VARCHAR(36) NOT NULL,
    teacher_id VARCHAR(36),
    weekly_hours INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_class_subject (class_id, subject_id)
);

-- جدول الجداول المدرسية
CREATE TABLE schedules (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('weekly', 'daily', 'exam', 'special') DEFAULT 'weekly',
    school_year VARCHAR(20),
    semester VARCHAR(20),
    status ENUM('draft', 'active', 'archived') DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    created_by VARCHAR(36),
    approved_by VARCHAR(36),
    approved_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- جدول حصص الجدول
CREATE TABLE schedule_periods (
    id VARCHAR(36) PRIMARY KEY,
    schedule_id VARCHAR(36) NOT NULL,
    day_of_week TINYINT, -- 0=Sunday, 1=Monday, etc.
    period_number TINYINT,
    start_time TIME,
    end_time TIME,
    subject_id VARCHAR(36),
    teacher_id VARCHAR(36),
    class_id VARCHAR(36),
    room VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- جدول الاستبدالات (الانتظار اليومي)
CREATE TABLE substitutions (
    id VARCHAR(36) PRIMARY KEY,
    original_teacher_id VARCHAR(36) NOT NULL,
    substitute_teacher_id VARCHAR(36),
    date DATE NOT NULL,
    period_number TINYINT,
    class_id VARCHAR(36),
    subject_id VARCHAR(36),
    reason VARCHAR(500),
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (original_teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (substitute_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- إدراج بيانات أولية للمدرسة
INSERT INTO schools (id, name, address, phone, email, principal_name, school_type) VALUES
('school_1', 'مدرسة متابع النموذجية', 'الرياض، المملكة العربية السعودية', '+966112345678', 'info@motabea-school.edu.sa', 'محمد عبدالله السعد', 'combined');

-- إدراج بيانات المستخدمين الأولية
INSERT INTO users (id, username, email, password_hash, name, role, school_id, status, permissions) VALUES
('user_1', 'admin', 'admin@motabea.edu.sa', '$2b$10$8OhJw.Hl/XWrC3qw2BpbvODqcjpLy5qJY8fQh3v.QX9XJe7LHbqGm', 'مدير النظام', 'admin', 'school_1', 'active', '["all"]'),
('user_2', 'vice', 'vice@motabea.edu.sa', '$2b$10$8OhJw.Hl/XWrC3qw2BpbvODqcjpLy5qJY8fQh3v.QX9XJe7LHbqGm', 'وكيل المدرسة', 'vice_principal', 'school_1', 'active', '["teachers", "students", "reports"]'),
('user_3', 'supervisor', 'supervisor@motabea.edu.sa', '$2b$10$8OhJw.Hl/XWrC3qw2BpbvODqcjpLy5qJY8fQh3v.QX9XJe7LHbqGm', 'مشرف تربوي', 'supervisor', 'school_1', 'active', '["supervision", "visits", "reports"]');

-- إدراج بيانات المواد الأساسية
INSERT INTO subjects (id, name, code, grade_levels, weekly_hours, type, department) VALUES
('subj_1', 'الرياضيات', 'MATH', '[1,2,3,4,5,6,7,8,9,10,11,12]', 5, 'core', 'العلوم'),
('subj_2', 'اللغة العربية', 'ARAB', '[1,2,3,4,5,6,7,8,9,10,11,12]', 6, 'core', 'اللغات'),
('subj_3', 'العلوم', 'SCI', '[1,2,3,4,5,6,7,8,9,10,11,12]', 4, 'core', 'العلوم'),
('subj_4', 'اللغة الإنجليزية', 'ENG', '[1,2,3,4,5,6,7,8,9,10,11,12]', 4, 'core', 'اللغات'),
('subj_5', 'التربية الإسلامية', 'ISLAM', '[1,2,3,4,5,6,7,8,9,10,11,12]', 3, 'core', 'الدراسات الإسلامية'),
('subj_6', 'الاجتماعيات', 'SOC', '[1,2,3,4,5,6,7,8,9,10,11,12]', 3, 'core', 'الدراسات الاجتماعية');

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_teachers_employee_id ON teachers(employee_id);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_schedule_periods_schedule_day ON schedule_periods(schedule_id, day_of_week);
CREATE INDEX idx_substitutions_date ON substitutions(date);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

COMMIT;
