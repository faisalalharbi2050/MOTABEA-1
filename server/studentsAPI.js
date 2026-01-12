// API endpoints for students management
const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'motabea_db',
  charset: 'utf8mb4'
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all students for a school
app.get('/api/students', async (req, res) => {
  try {
    const { school_id } = req.query;
    
    if (!school_id) {
      return res.status(400).json({ success: false, message: 'معرف المدرسة مطلوب' });
    }

    const [students] = await db.execute(`
      SELECT 
        s.*,
        c.name as class_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.school_id = ?
      ORDER BY s.grade_level, s.section, s.name
    `, [school_id]);

    res.json({ success: true, students });
  } catch (error) {
    console.error('خطأ في جلب الطلاب:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Get classes count for smart check
app.get('/api/classes/count', async (req, res) => {
  try {
    const [result] = await db.execute('SELECT COUNT(*) as count FROM classes');
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('خطأ في عد الفصول:', error);
    res.status(500).json({ count: 0 });
  }
});

// Get schools
app.get('/api/schools', async (req, res) => {
  try {
    const [schools] = await db.execute(`
      SELECT id, name, status 
      FROM schools 
      WHERE status = 'active'
      ORDER BY name
    `);

    res.json({ success: true, schools });
  } catch (error) {
    console.error('خطأ في جلب المدارس:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Get classes for a school
app.get('/api/classes', async (req, res) => {
  try {
    const { school_id } = req.query;
    
    if (!school_id) {
      return res.status(400).json({ success: false, message: 'معرف المدرسة مطلوب' });
    }

    const [classes] = await db.execute(`
      SELECT * FROM classes 
      WHERE status = 'active'
      ORDER BY grade_level, section
    `);

    res.json({ success: true, classes });
  } catch (error) {
    console.error('خطأ في جلب الفصول:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Batch import students
app.post('/api/students/batch-import', async (req, res) => {
  try {
    const { students } = req.body;
    
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ 
        success: false, 
        message: 'بيانات الطلاب مطلوبة',
        imported_count: 0,
        failed_count: 0,
        errors: [],
        needs_review: []
      });
    }

    let imported_count = 0;
    let failed_count = 0;
    const errors = [];
    const needs_review = [];

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        
        try {
          // Generate unique student ID
          const student_id = await generateStudentId();
          const id = uuidv4();
          
          // Insert student
          await db.execute(`
            INSERT INTO students (
              id, student_id, name, grade_level, section, parent_phone,
              class_id, school_id, parent_name, enrollment_date, 
              status, academic_level, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'active', 'average', NOW(), NOW())
          `, [
            id,
            student_id,
            student.name,
            student.grade_level,
            student.section,
            student.parent_phone,
            student.class_id || null,
            student.school_id,
            student.name.split(' ')[0] + ' (ولي الأمر)', // Default parent name
          ]);

          // Update class student count if class_id exists
          if (student.class_id) {
            await db.execute(`
              UPDATE classes 
              SET current_students = current_students + 1 
              WHERE id = ?
            `, [student.class_id]);
          }

          imported_count++;
        } catch (studentError) {
          console.error(`خطأ في إدراج الطالب ${i + 1}:`, studentError);
          failed_count++;
          errors.push({
            row: i + 2,
            field: 'insert',
            value: student.name,
            message: 'فشل في إدراج الطالب في قاعدة البيانات'
          });
        }
      }

      await db.execute('COMMIT');

      res.json({
        success: true,
        imported_count,
        failed_count,
        errors,
        needs_review
      });

    } catch (transactionError) {
      await db.execute('ROLLBACK');
      throw transactionError;
    }

  } catch (error) {
    console.error('خطأ في استيراد الطلاب:', error);
    res.status(500).json({
      success: false,
      imported_count: 0,
      failed_count: students?.length || 0,
      errors: [{
        row: 0,
        field: 'general',
        value: '',
        message: 'خطأ في الخادم'
      }],
      needs_review: []
    });
  }
});

// Generate unique student ID
async function generateStudentId() {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);
  
  // Get the latest student ID for this year
  const [result] = await db.execute(`
    SELECT student_id 
    FROM students 
    WHERE student_id LIKE ? 
    ORDER BY student_id DESC 
    LIMIT 1
  `, [`${yearSuffix}%`]);

  let nextNumber = 1;
  if (result.length > 0) {
    const lastId = result[0].student_id;
    const lastNumber = parseInt(lastId.slice(-4));
    nextNumber = lastNumber + 1;
  }

  return `${yearSuffix}${nextNumber.toString().padStart(4, '0')}`;
}

// Get student by ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [students] = await db.execute(`
      SELECT 
        s.*,
        c.name as class_name,
        c.room_number,
        c.capacity,
        c.current_students
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'الطالب غير موجود' });
    }

    res.json({ success: true, student: students[0] });
  } catch (error) {
    console.error('خطأ في جلب بيانات الطالب:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const studentData = req.body;

    // Update student
    await db.execute(`
      UPDATE students 
      SET name = ?, grade_level = ?, section = ?, parent_name = ?, 
          parent_phone = ?, parent_email = ?, mother_name = ?, 
          mother_phone = ?, emergency_contact = ?, address = ?, 
          national_id = ?, status = ?, academic_level = ?, 
          behavioral_notes = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      studentData.name,
      studentData.grade_level,
      studentData.section,
      studentData.parent_name,
      studentData.parent_phone,
      studentData.parent_email,
      studentData.mother_name,
      studentData.mother_phone,
      studentData.emergency_contact,
      studentData.address,
      studentData.national_id,
      studentData.status,
      studentData.academic_level,
      studentData.behavioral_notes,
      studentData.notes,
      id
    ]);

    res.json({ success: true, message: 'تم تحديث بيانات الطالب بنجاح' });
  } catch (error) {
    console.error('خطأ في تحديث الطالب:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get student info before deletion
    const [students] = await db.execute('SELECT class_id FROM students WHERE id = ?', [id]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'الطالب غير موجود' });
    }

    const classId = students[0].class_id;

    // Delete student
    await db.execute('DELETE FROM students WHERE id = ?', [id]);

    // Update class count if needed
    if (classId) {
      await db.execute(`
        UPDATE classes 
        SET current_students = GREATEST(0, current_students - 1) 
        WHERE id = ?
      `, [classId]);
    }

    res.json({ success: true, message: 'تم حذف الطالب بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف الطالب:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Move student to different class
app.post('/api/students/:id/move', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_class_id } = req.body;

    // Get current student info
    const [students] = await db.execute('SELECT class_id FROM students WHERE id = ?', [id]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'الطالب غير موجود' });
    }

    const oldClassId = students[0].class_id;

    // Update student's class
    await db.execute('UPDATE students SET class_id = ? WHERE id = ?', [new_class_id, id]);

    // Update class counts
    if (oldClassId) {
      await db.execute(`
        UPDATE classes 
        SET current_students = GREATEST(0, current_students - 1) 
        WHERE id = ?
      `, [oldClassId]);
    }

    if (new_class_id) {
      await db.execute(`
        UPDATE classes 
        SET current_students = current_students + 1 
        WHERE id = ?
      `, [new_class_id]);
    }

    res.json({ success: true, message: 'تم نقل الطالب بنجاح' });
  } catch (error) {
    console.error('خطأ في نقل الطالب:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = {
  db,
  generateStudentId
};