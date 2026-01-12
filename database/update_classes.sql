-- تحديث قاعدة البيانات لإضافة عمود school_id لجدول classes
-- إذا كان الجدول موجود بالفعل

-- إضافة العمود school_id إلى جدول classes إذا لم يكن موجوداً
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS school_id VARCHAR(36) AFTER name;

-- إضافة المفتاح الخارجي
ALTER TABLE classes 
ADD CONSTRAINT FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;

-- إضافة فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);

-- تحديث الفصول الموجودة لتحديد school_id افتراضي (إذا كان هناك مدرسة واحدة)
-- يمكن تخصيص هذا حسب البيانات الموجودة
UPDATE classes 
SET school_id = (SELECT id FROM schools LIMIT 1) 
WHERE school_id IS NULL;

-- إضافة بعض البيانات التجريبية للفصول إذا لم تكن موجودة
INSERT INTO classes (id, name, school_id, grade_level, section, capacity, current_students, status, created_at, updated_at) 
SELECT 
    UUID() as id,
    CONCAT('الصف ', grade_num, ' الفصل ', section_letter) as name,
    (SELECT id FROM schools LIMIT 1) as school_id,
    grade_num as grade_level,
    section_letter as section,
    30 as capacity,
    0 as current_students,
    'active' as status,
    NOW() as created_at,
    NOW() as updated_at
FROM (
    SELECT 1 as grade_num, 'أ' as section_letter UNION ALL
    SELECT 1, 'ب' UNION ALL
    SELECT 2, 'أ' UNION ALL
    SELECT 2, 'ب' UNION ALL
    SELECT 3, 'أ' UNION ALL
    SELECT 3, 'ب' UNION ALL
    SELECT 4, 'أ' UNION ALL
    SELECT 4, 'ب' UNION ALL
    SELECT 5, 'أ' UNION ALL
    SELECT 5, 'ب' UNION ALL
    SELECT 6, 'أ' UNION ALL
    SELECT 6, 'ب'
) AS grade_sections
WHERE NOT EXISTS (
    SELECT 1 FROM classes 
    WHERE name = CONCAT('الصف ', grade_sections.grade_num, ' الفصل ', grade_sections.section_letter)
);

-- التأكد من وجود بيانات المدرسة التجريبية
INSERT INTO schools (id, name, address, phone, email, principal_name, school_type, status, created_at, updated_at)
SELECT 
    'school_1' as id,
    'مدرسة متابع النموذجية' as name,
    'الرياض، المملكة العربية السعودية' as address,
    '+966501234567' as phone,
    'info@motabea-school.edu.sa' as email,
    'أحمد محمد الأحمد' as principal_name,
    'primary' as school_type,
    'active' as status,
    NOW() as created_at,
    NOW() as updated_at
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE id = 'school_1');