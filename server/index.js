const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Mock database for demo purposes
const mockDatabase = require('./mockDatabase');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' });
  console.log(`\n📥 [${timestamp}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // السماح للتوكن المؤقت للتطوير
  if (token === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0.fake_token_for_dev') {
    req.user = { id: '1', username: 'admin', role: 'admin' };
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'motabea-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Sample users for demo - مدير النظام فقط
const users = [
  {
    id: '1',
    username: 'admin',
    password: '$2b$10$f8MjI3vmED9.0buRfNgBluQVc9rM64Op6dgDTBhFzUxB/bny2KCPu', // admin123
    email: 'admin@motabea.edu.sa',
    name: 'مدير النظام',
    role: 'admin',
    permissions: ['all'],
    school_id: 'school_1'
  }
];

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MOTABEA Server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('📊 Login request received:', new Date().toISOString());
    const { username, password } = req.body;

    console.log('👤 Login attempt for username:', username);

    if (!username || !password) {
      console.log('⚠️ Missing username or password');
      return res.status(400).json({ 
        error: 'Username and password are required',
        message: 'يرجى إدخال اسم المستخدم وكلمة المرور' 
      });
    }

    // تنظيف المدخلات
    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();

    console.log('🔍 Looking for user:', cleanUsername);
    console.log('📋 Available users:', users.map(u => u.username));

    // Find user
    const user = users.find(u => u.username === cleanUsername);
    if (!user) {
      console.log('❌ User not found:', cleanUsername);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
      });
    }

    console.log('✅ User found, checking password...');

    // Check password
    const isValidPassword = await bcrypt.compare(cleanPassword, user.password);
    console.log('🔐 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', cleanUsername);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
      });
    }

    console.log('🎫 Generating JWT token...');

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        school_id: user.school_id 
      },
      process.env.JWT_SECRET || 'motabea-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('✅ Login successful for user:', cleanUsername);
    
    res.status(200).json({
      token,
      user: userWithoutPassword,
      message: 'تم تسجيل الدخول بنجاح'
    });

  } catch (error) {
    console.error('💥 Login error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      requestBody: req.body ? Object.keys(req.body) : 'no body'
    });
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'حدث خطأ في الخادم - يرجى المحاولة مرة أخرى' 
    });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  try {
    // Find user by ID from token
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'المستخدم غير موجود' 
      });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'حدث خطأ في الخادم' 
    });
  }
});

// Protected routes
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  // Sample dashboard statistics
  const stats = {
    teachers: {
      total: 148,
      active: 142,
      on_leave: 6
    },
    students: {
      total: 2547,
      present_today: 2401,
      absent_today: 146
    },
    tasks: {
      total: 45,
      pending: 23,
      completed: 22,
      overdue: 3
    },
    attendance_rate: 94.5
  };

  res.json(stats);
});

app.get('/api/teachers', authenticateToken, (req, res) => {
  // Sample teachers data
  const teachers = [
    {
      id: '1',
      employee_id: 'T001',
      name: 'أحمد محمد السعد',
      email: 'ahmed.saad@school.edu.sa',
      phone: '0501234567',
      subject: 'الرياضيات',
      classes: ['1أ', '2ب', '3ج'],
      weekly_quota: 20,
      current_quota: 18,
      experience_years: 8,
      status: 'active',
      hire_date: '2020-08-15',
    },
    // Add more sample data as needed
  ];

  res.json(teachers);
});

// Classrooms API routes
app.get('/api/classrooms', authenticateToken, (req, res) => {
  // Sample classrooms data
  const classrooms = [
    {
      id: '1',
      name: '1/1',
      grade_level: 1,
      section: '1',
      room_number: 'A101',
      capacity: 30,
      current_students: 28,
      class_teacher_id: null,
      academic_year: '2024',
      semester: '1',
      status: 'active',
      notes: '',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: '1/2',
      grade_level: 1,
      section: '2',
      room_number: 'A102',
      capacity: 30,
      current_students: 25,
      class_teacher_id: null,
      academic_year: '2024',
      semester: '1',
      status: 'active',
      notes: '',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  res.json(classrooms);
});

app.post('/api/classrooms', authenticateToken, (req, res) => {
  try {
    const { classrooms } = req.body;
    
    if (!classrooms || !Array.isArray(classrooms)) {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'بيانات غير صالحة'
      });
    }

    // Generate mock response with created classrooms
    const createdClassrooms = classrooms.map((classroom, index) => ({
      id: `new_${Date.now()}_${index}`,
      ...classroom,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    res.status(201).json({
      message: 'تم إنشاء الفصول بنجاح',
      classrooms: createdClassrooms
    });
  } catch (error) {
    console.error('Error creating classrooms:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'حدث خطأ في إنشاء الفصول'
    });
  }
});

app.put('/api/classrooms/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const classroomData = req.body;

    // Mock update response
    const updatedClassroom = {
      id,
      ...classroomData,
      updated_at: new Date().toISOString()
    };

    res.json({
      message: 'تم تحديث الفصل بنجاح',
      classroom: updatedClassroom
    });
  } catch (error) {
    console.error('Error updating classroom:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'حدث خطأ في تحديث الفصل'
    });
  }
});

app.delete('/api/classrooms/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    res.json({
      message: 'تم حذف الفصل بنجاح',
      id
    });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'حدث خطأ في حذف الفصل'
    });
  }
});

app.delete('/api/classrooms/bulk-delete', authenticateToken, (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'بيانات غير صالحة'
      });
    }

    res.json({
      message: `تم حذف ${ids.length} فصل بنجاح`,
      deletedIds: ids
    });
  } catch (error) {
    console.error('Error bulk deleting classrooms:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'حدث خطأ في حذف الفصول'
    });
  }
});

// Classroom management endpoints
let mockClassrooms = [
  {
    id: '1',
    name: 'فصل 1/1',
    grade_level: 1,
    section: '1',
    capacity: 30,
    current_students: 25,
    academic_year: '1446',
    semester: 'الفصل الأول',
    education_type: 'general',
    status: 'active',
    subjects: [
      { id: '1', name: 'الرياضيات', weekly_hours: 5 },
      { id: '2', name: 'اللغة العربية', weekly_hours: 6 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let mockGrades = [
  {
    level: 1,
    name: 'المرحلة الابتدائية',
    education_type: 'general',
    subjects: [
      { id: '1', name: 'الرياضيات', code: 'MATH', weekly_hours: 5, is_assigned: false },
      { id: '2', name: 'اللغة العربية', code: 'ARAB', weekly_hours: 6, is_assigned: false },
      { id: '3', name: 'العلوم', code: 'SCI', weekly_hours: 4, is_assigned: false },
      { id: '4', name: 'اللغة الإنجليزية', code: 'ENG', weekly_hours: 3, is_assigned: false },
      { id: '5', name: 'التربية الإسلامية', code: 'ISLAM', weekly_hours: 3, is_assigned: false }
    ]
  },
  {
    level: 2,
    name: 'المرحلة المتوسطة',
    education_type: 'general',
    subjects: [
      { id: '1', name: 'الرياضيات', code: 'MATH', weekly_hours: 5, is_assigned: false },
      { id: '2', name: 'اللغة العربية', code: 'ARAB', weekly_hours: 6, is_assigned: false },
      { id: '3', name: 'العلوم', code: 'SCI', weekly_hours: 4, is_assigned: false },
      { id: '4', name: 'اللغة الإنجليزية', code: 'ENG', weekly_hours: 4, is_assigned: false },
      { id: '5', name: 'التربية الإسلامية', code: 'ISLAM', weekly_hours: 3, is_assigned: false },
      { id: '6', name: 'الاجتماعيات', code: 'SOC', weekly_hours: 3, is_assigned: false }
    ]
  },
  {
    level: 3,
    name: 'المرحلة الثانوية',
    education_type: 'general',
    subjects: [
      { id: '1', name: 'الرياضيات', code: 'MATH', weekly_hours: 5, is_assigned: false },
      { id: '2', name: 'اللغة العربية', code: 'ARAB', weekly_hours: 5, is_assigned: false },
      { id: '3', name: 'الفيزياء', code: 'PHY', weekly_hours: 4, is_assigned: false },
      { id: '4', name: 'الكيمياء', code: 'CHEM', weekly_hours: 4, is_assigned: false },
      { id: '5', name: 'الأحياء', code: 'BIO', weekly_hours: 4, is_assigned: false },
      { id: '6', name: 'اللغة الإنجليزية', code: 'ENG', weekly_hours: 4, is_assigned: false }
    ]
  }
];

// Get all grades
app.get('/api/grades', authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      data: mockGrades
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch grades',
      message: 'فشل في جلب المراحل الدراسية'
    });
  }
});

// Get classrooms by grade level
app.get('/api/classrooms', authenticateToken, (req, res) => {
  try {
    const { grade_level } = req.query;
    let filteredClassrooms = mockClassrooms;
    
    if (grade_level) {
      filteredClassrooms = mockClassrooms.filter(c => c.grade_level === parseInt(grade_level));
    }
    
    res.json({
      success: true,
      data: filteredClassrooms
    });
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch classrooms',
      message: 'فشل في جلب الفصول الدراسية'
    });
  }
});

// Create multiple classrooms
app.post('/api/classrooms/bulk', (req, res) => {
  console.log('📡 طلب حفظ فصول دراسية...');
  try {
    const { classrooms, grade_level, count, education_type = 'general' } = req.body;
    
    // حالة 1: إرسال مصفوفة فصول جاهزة (من ClassroomManagement)
    if (classrooms && Array.isArray(classrooms)) {
      const newClassrooms = classrooms.map(classroom => ({
        id: classroom.id || `class_${Date.now()}_${Math.random()}`,
        name: classroom.name,
        grade_level: classroom.grade_level,
        section: classroom.section,
        capacity: classroom.capacity || 30,
        current_students: classroom.current_students || 0,
        school_id: classroom.school_id || 'school_1',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      // حفظ في mockDatabase
      mockDatabase.classes = [...mockDatabase.classes, ...newClassrooms];
      
      console.log(`✅ تم حفظ ${newClassrooms.length} فصل في الخادم`);
      
      return res.json({
        success: true,
        classes: newClassrooms,
        message: `تم إنشاء ${newClassrooms.length} فصل بنجاح`
      });
    }
    
    // حالة 2: الطريقة القديمة (grade_level + count)
    if (!grade_level || !count || count <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid parameters',
        message: 'معاملات غير صحيحة'
      });
    }
    
    const newClassrooms = [];
    for (let i = 1; i <= count; i++) {
      const classroom = {
        id: `${grade_level}_${i}_${Date.now()}`,
        name: `فصل ${grade_level}/${i}`,
        grade_level: parseInt(grade_level),
        section: i.toString(),
        capacity: 30,
        current_students: 0,
        academic_year: '1446',
        semester: 'الفصل الأول',
        education_type,
        status: 'active',
        subjects: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      newClassrooms.push(classroom);
      mockClassrooms.push(classroom);
    }
    
    res.json({
      success: true,
      data: newClassrooms,
      message: `تم إنشاء ${count} فصل بنجاح`
    });
  } catch (error) {
    console.error('Error creating classrooms:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create classrooms',
      message: 'فشل في إنشاء الفصول'
    });
  }
});

// Create single classroom
app.post('/api/classrooms', authenticateToken, (req, res) => {
  try {
    const { name, grade_level, section, capacity = 30, education_type = 'general' } = req.body;
    
    if (!name || !grade_level || !section) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        message: 'الحقول المطلوبة مفقودة'
      });
    }
    
    const classroom = {
      id: `new_${Date.now()}`,
      name,
      grade_level: parseInt(grade_level),
      section,
      capacity: parseInt(capacity),
      current_students: 0,
      academic_year: '1446',
      semester: 'الفصل الأول',
      education_type,
      status: 'active',
      subjects: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockClassrooms.push(classroom);
    
    res.json({
      success: true,
      data: classroom,
      message: 'تم إنشاء الفصل بنجاح'
    });
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create classroom',
      message: 'فشل في إنشاء الفصل'
    });
  }
});

// Update classroom
app.put('/api/classrooms/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const classroomIndex = mockClassrooms.findIndex(c => c.id === id);
    if (classroomIndex === -1) {
      return res.status(404).json({ 
        success: false,
        error: 'Classroom not found',
        message: 'الفصل غير موجود'
      });
    }
    
    mockClassrooms[classroomIndex] = {
      ...mockClassrooms[classroomIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: mockClassrooms[classroomIndex],
      message: 'تم تحديث الفصل بنجاح'
    });
  } catch (error) {
    console.error('Error updating classroom:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update classroom',
      message: 'فشل في تحديث الفصل'
    });
  }
});

// Delete classroom
app.delete('/api/classrooms/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const classroomIndex = mockClassrooms.findIndex(c => c.id === id);
    if (classroomIndex === -1) {
      return res.status(404).json({ 
        success: false,
        error: 'Classroom not found',
        message: 'الفصل غير موجود'
      });
    }
    
    mockClassrooms.splice(classroomIndex, 1);
    
    res.json({
      success: true,
      message: 'تم حذف الفصل بنجاح'
    });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete classroom',
      message: 'فشل في حذف الفصل'
    });
  }
});

// Assign subjects to classroom
app.post('/api/classrooms/:id/subjects', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { subjects } = req.body;
    
    const classroomIndex = mockClassrooms.findIndex(c => c.id === id);
    if (classroomIndex === -1) {
      return res.status(404).json({ 
        success: false,
        error: 'Classroom not found',
        message: 'الفصل غير موجود'
      });
    }
    
    mockClassrooms[classroomIndex].subjects = subjects || [];
    mockClassrooms[classroomIndex].updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      data: mockClassrooms[classroomIndex],
      message: 'تم تخصيص المواد بنجاح'
    });
  } catch (error) {
    console.error('Error assigning subjects:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to assign subjects',
      message: 'فشل في تخصيص المواد'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'حدث خطأ في الخادم' 
  });
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ============= STUDENTS API =============

// Get all students for a school
app.get('/api/students', (req, res) => {
  try {
    const { school_id } = req.query;
    
    if (!school_id) {
      return res.status(400).json({ success: false, message: 'معرف المدرسة مطلوب' });
    }

    // Filter students by school_id and add class names
    const students = mockDatabase.students
      .filter(student => student.school_id === school_id)
      .map(student => {
        const classInfo = mockDatabase.classes.find(c => c.id === student.class_id);
        return {
          ...student,
          class_name: classInfo ? classInfo.name : 'غير محدد'
        };
      })
      .sort((a, b) => {
        if (a.grade_level !== b.grade_level) return a.grade_level - b.grade_level;
        if (a.section !== b.section) return a.section.localeCompare(b.section, 'ar');
        return a.name.localeCompare(b.name, 'ar');
      });

    res.json({ success: true, students });
  } catch (error) {
    console.error('خطأ في جلب الطلاب:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Get classes count for smart check
app.get('/api/classes/count', (req, res) => {
  try {
    const { school_id } = req.query;
    
    let count;
    if (school_id) {
      count = mockDatabase.classes.filter(c => c.school_id === school_id).length;
    } else {
      count = mockDatabase.classes.length;
    }
    
    res.json({ count });
  } catch (error) {
    console.error('خطأ في عد الفصول:', error);
    res.status(500).json({ count: 0 });
  }
});

// Get schools
app.get('/api/schools', (req, res) => {
  console.log('📡 طلب جلب المدارس...');
  try {
    // التحقق من وجود mockDatabase
    if (!mockDatabase) {
      console.error('❌ mockDatabase غير موجود');
      return res.status(500).json({ success: false, message: 'قاعدة البيانات غير متوفرة', schools: [] });
    }

    if (!mockDatabase.schools) {
      console.error('❌ mockDatabase.schools غير موجود');
      return res.status(500).json({ success: false, message: 'بيانات المدارس غير متوفرة', schools: [] });
    }

    console.log(`📊 عدد المدارس في قاعدة البيانات: ${mockDatabase.schools.length}`);

    const schools = mockDatabase.schools.map(school => ({
      id: school.id,
      name: school.name,
      status: 'active'
    })).sort((a, b) => {
      try {
        return a.name.localeCompare(b.name, 'ar');
      } catch (sortError) {
        // في حالة فشل الترتيب العربي، نستخدم ترتيب عادي
        return a.name > b.name ? 1 : -1;
      }
    });

    console.log(`✅ تم إرسال ${schools.length} مدرسة`);
    res.json({ success: true, schools });
  } catch (error) {
    console.error('❌ خطأ في جلب المدارس:', error);
    console.error('📋 تفاصيل الخطأ:', error.message);
    console.error('📍 Stack trace:', error.stack);
    res.json({ success: false, message: `خطأ في الخادم: ${error.message}`, schools: [] });
  }
});

// Save school data
app.post('/api/schools', (req, res) => {
  console.log('📡 طلب حفظ بيانات المدرسة...');
  try {
    const { schools: schoolsData } = req.body;
    
    if (!schoolsData || !Array.isArray(schoolsData)) {
      return res.status(400).json({ success: false, message: 'بيانات غير صحيحة' });
    }

    // حذف المدارس القديمة وإضافة الجديدة
    mockDatabase.schools = schoolsData.map((school, index) => ({
      id: school.id || `school_${Date.now()}_${index}`,
      name: school.name,
      stage: school.stage,
      sectionType: school.sectionType,
      type: school.stage,
      city: '',
      created_at: new Date().toISOString()
    }));

    console.log(`✅ تم حفظ ${mockDatabase.schools.length} مدرسة`);
    res.json({ success: true, message: 'تم حفظ بيانات المدرسة بنجاح', schools: mockDatabase.schools });
  } catch (error) {
    console.error('❌ خطأ في حفظ المدارس:', error);
    res.status(500).json({ success: false, message: `خطأ في الخادم: ${error.message}` });
  }
});

// Get classes for a school
app.get('/api/classes', (req, res) => {
  try {
    const { school_id } = req.query;

    let classes = mockDatabase.classes;

    // إضافة فلتر school_id إذا كان متوفراً
    if (school_id) {
      classes = classes.filter(c => c.school_id === school_id);
    }

    // ترتيب الفصول حسب المستوى والشعبة
    classes = classes
      .map(c => ({
        ...c,
        status: 'active'  // إضافة حالة افتراضية
      }))
      .sort((a, b) => {
        if (a.grade_level !== b.grade_level) return a.grade_level - b.grade_level;
        return a.section.localeCompare(b.section, 'ar');
      });

    res.json({ success: true, classes });
  } catch (error) {
    console.error('خطأ في جلب الفصول:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Batch import students
app.post('/api/students/batch-import', (req, res) => {
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

    try {
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        
        try {
          // Generate unique student ID
          const student_id = generateStudentIdMock();
          const id = uuidv4();
          
          // Create new student object
          const newStudent = {
            id,
            student_id,
            name: student.name,
            grade_level: student.grade_level,
            section: student.section,
            parent_phone: student.parent_phone,
            class_id: student.class_id || null,
            school_id: student.school_id,
            parent_name: student.name.split(' ')[0] + ' (ولي الأمر)',
            enrollment_date: new Date().toISOString().split('T')[0],
            status: 'نشط',
            academic_level: 'متوسط',
            birth_date: '2010-01-01', // Default birth date
            national_id: generateNationalId(),
            phone: student.parent_phone,
            address: 'العنوان غير محدد'
          };

          // Add to mock database
          mockDatabase.students.push(newStudent);

          // Update class student count if class_id exists
          if (student.class_id) {
            const classIndex = mockDatabase.classes.findIndex(c => c.id === student.class_id);
            if (classIndex !== -1) {
              mockDatabase.classes[classIndex].current_students++;
            }
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

      res.json({
        success: true,
        imported_count,
        failed_count,
        errors,
        needs_review
      });

    } catch (transactionError) {
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

// Helper functions for mock database
function generateStudentIdMock() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `STD${timestamp}${random}`;
}

function generateNationalId() {
  return Math.floor(Math.random() * 9000000000000) + 1000000000000;
}

// Old MySQL function - no longer needed

// Delete student
app.delete('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Find student index
    const studentIndex = mockDatabase.students.findIndex(s => s.id === id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ success: false, message: 'الطالب غير موجود' });
    }

    const student = mockDatabase.students[studentIndex];
    const classId = student.class_id;

    // Delete student
    mockDatabase.students.splice(studentIndex, 1);

    // Update class count if needed
    if (classId) {
      const classIndex = mockDatabase.classes.findIndex(c => c.id === classId);
      if (classIndex !== -1 && mockDatabase.classes[classIndex].current_students > 0) {
        mockDatabase.classes[classIndex].current_students--;
      }
    }

    res.json({ success: true, message: 'تم حذف الطالب بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف الطالب:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// =====================================================
// WhatsApp Messaging & Subscription Endpoints
// =====================================================

/**
 * دالة إرسال رسالة واتساب باستخدام Template
 * @param {string} schoolId - معرف المدرسة
 * @param {string} recipientPhoneNumber - رقم المستلم
 * @param {string} templateName - اسم القالب
 * @param {array} templateParameters - متغيرات القالب
 */
async function sendTemplatedWhatsAppMessage(schoolId, recipientPhoneNumber, templateName, templateParameters = []) {
  try {
    // 1. البحث عن إعدادات واتساب للمدرسة
    const whatsappConfig = mockDatabase.whatsappConfigurations?.find(
      config => config.school_id === schoolId && config.is_active
    );

    if (!whatsappConfig) {
      throw new Error('لم يتم العثور على إعدادات واتساب نشطة لهذه المدرسة');
    }

    // 2. التحقق من الاشتراك والرصيد
    const subscription = mockDatabase.subscriptions?.find(
      sub => sub.school_id === schoolId && sub.subscription_status === 'active'
    );

    if (!subscription) {
      throw new Error('لا يوجد اشتراك نشط لهذه المدرسة');
    }

    if (subscription.message_credits <= 0) {
      throw new Error('رصيد الرسائل غير كافٍ');
    }

    // 3. بناء جسم الطلب لـ WhatsApp Cloud API
    const requestBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhoneNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'ar'
        },
        components: templateParameters.length > 0 ? [
          {
            type: 'body',
            parameters: templateParameters.map(param => ({
              type: 'text',
              text: param
            }))
          }
        ] : []
      }
    };

    // 4. إرسال الطلب إلى Meta API
    const SYSTEM_ACCESS_TOKEN = process.env.WHATSAPP_SYSTEM_ACCESS_TOKEN || 'DEMO_TOKEN';
    const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${whatsappConfig.phone_number_id}/messages`;

    console.log('📤 إرسال رسالة واتساب:', {
      to: recipientPhoneNumber,
      template: templateName,
      school: schoolId
    });

    // في بيئة الإنتاج، قم بإلغاء التعليق على هذا الكود:
    /*
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SYSTEM_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'فشل إرسال الرسالة');
    }
    */

    // محاكاة استجابة WhatsApp API للتطوير
    const mockResponse = {
      messaging_product: 'whatsapp',
      contacts: [{ input: recipientPhoneNumber, wa_id: recipientPhoneNumber }],
      messages: [{ id: `wamid.${Date.now()}` }]
    };

    // 5. تحديث رصيد الرسائل
    subscription.message_credits--;
    subscription.messages_sent++;

    // 6. تسجيل الرسالة في السجل
    const messageLog = {
      id: uuidv4(),
      school_id: schoolId,
      subscription_id: subscription.id,
      recipient_phone: recipientPhoneNumber,
      template_name: templateName,
      whatsapp_message_id: mockResponse.messages[0].id,
      status: 'sent',
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    if (!mockDatabase.messageLog) {
      mockDatabase.messageLog = [];
    }
    mockDatabase.messageLog.push(messageLog);

    console.log('✅ تم إرسال الرسالة بنجاح:', mockResponse.messages[0].id);

    return {
      success: true,
      message_id: mockResponse.messages[0].id,
      remaining_credits: subscription.message_credits
    };

  } catch (error) {
    console.error('❌ خطأ في إرسال رسالة واتساب:', error);
    throw error;
  }
}

// API Endpoint: إرسال رسالة واتساب
app.post('/api/messages/send', authenticateToken, async (req, res) => {
  try {
    const { recipientPhoneNumber, templateName, templateParameters } = req.body;
    const schoolId = req.user.school_id || 'school_1';

    // التحقق من البيانات المطلوبة
    if (!recipientPhoneNumber || !templateName) {
      return res.status(400).json({
        success: false,
        message: 'رقم المستلم واسم القالب مطلوبان'
      });
    }

    // إرسال الرسالة
    const result = await sendTemplatedWhatsAppMessage(
      schoolId,
      recipientPhoneNumber,
      templateName,
      templateParameters || []
    );

    res.json(result);

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في إرسال الرسالة'
    });
  }
});

// API Endpoint: جلب حالة الاشتراك
app.get('/api/subscription/status', authenticateToken, (req, res) => {
  try {
    const schoolId = req.user.school_id || 'school_1';

    // البحث عن الاشتراك
    let subscription = mockDatabase.subscriptions?.find(
      sub => sub.school_id === schoolId
    );

    // إنشاء اشتراك تجريبي إذا لم يكن موجوداً
    if (!subscription) {
      subscription = {
        id: uuidv4(),
        school_id: schoolId,
        package_type: 'none',
        subscription_status: 'inactive',
        message_credits: 0,
        total_messages: 0,
        messages_sent: 0,
        subscription_starts_at: null,
        subscription_ends_at: null
      };
      
      if (!mockDatabase.subscriptions) {
        mockDatabase.subscriptions = [];
      }
      mockDatabase.subscriptions.push(subscription);
    }

    // البحث عن إعدادات واتساب
    const whatsappConfig = mockDatabase.whatsappConfigurations?.find(
      config => config.school_id === schoolId && config.is_active
    );

    res.json({
      subscription_status: subscription.subscription_status,
      message_credits: subscription.message_credits,
      total_messages: subscription.total_messages,
      messages_sent: subscription.messages_sent,
      subscription_ends_at: subscription.subscription_ends_at,
      whatsapp_connected: !!whatsappConfig,
      whatsapp_phone_number: whatsappConfig?.phone_number || null
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الاشتراك'
    });
  }
});

// API Endpoint: إنشاء جلسة Stripe Checkout
app.post('/api/stripe/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { packageType } = req.body;
    const schoolId = req.user.school_id || 'school_1';
    const userId = req.user.id;

    // تحديد تفاصيل الباقة
    const packages = {
      'package_1000': { messages: 1000, price: 100, duration_months: 3 },
      'package_5000': { messages: 5000, price: 400, duration_months: 6 },
      'package_10000': { messages: 10000, price: 700, duration_months: 12 }
    };

    const selectedPackage = packages[packageType];
    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        message: 'نوع الباقة غير صحيح'
      });
    }

    // في بيئة الإنتاج، استخدم Stripe API الفعلي
    // هنا نستخدم محاكاة للتطوير
    
    console.log('📦 إنشاء جلسة دفع:', {
      package: packageType,
      school: schoolId,
      price: selectedPackage.price
    });

    // محاكاة جلسة Stripe
    const mockSessionId = `cs_test_${Date.now()}`;
    const mockCheckoutUrl = `http://localhost:5001/api/stripe/mock-checkout?session_id=${mockSessionId}&school_id=${schoolId}&package=${packageType}`;

    // في الإنتاج استخدم:
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'sar',
          product_data: {
            name: `باقة رسائل واتساب - ${selectedPackage.messages} رسالة`,
            description: `صالحة لمدة ${selectedPackage.duration_months} أشهر`
          },
          unit_amount: selectedPackage.price * 100 // Convert to halalas
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard/whatsapp?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/whatsapp?payment=cancelled`,
      client_reference_id: schoolId,
      metadata: {
        school_id: schoolId,
        package_type: packageType,
        user_id: userId
      }
    });

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });
    */

    // للتطوير
    res.json({
      success: true,
      checkoutUrl: mockCheckoutUrl,
      sessionId: mockSessionId,
      note: 'هذا رابط تجريبي - في الإنتاج سيتم استخدام Stripe الحقيقي'
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء جلسة الدفع'
    });
  }
});

// Mock Checkout Page (للتطوير فقط)
app.get('/api/stripe/mock-checkout', (req, res) => {
  const { session_id, school_id, package: packageType } = req.query;
  
  res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>صفحة الدفع التجريبية</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; }
        button { background: #2563eb; color: white; border: none; padding: 15px 30px; font-size: 16px; border-radius: 5px; cursor: pointer; margin: 10px; }
        button:hover { background: #1d4ed8; }
        .cancel { background: #dc2626; }
        .cancel:hover { background: #b91c1c; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏪 صفحة الدفع التجريبية</h1>
        <p>هذه صفحة تجريبية لمحاكاة عملية الدفع عبر Stripe</p>
        <p><strong>الباقة:</strong> ${packageType}</p>
        <p><strong>معرف الجلسة:</strong> ${session_id}</p>
        <p>في البيئة الفعلية، سيتم توجيهك لصفحة Stripe الحقيقية</p>
        <div style="margin-top: 30px;">
          <button onclick="completePayment()">✅ إتمام الدفع (محاكاة)</button>
          <button class="cancel" onclick="cancelPayment()">❌ إلغاء</button>
        </div>
      </div>
      <script>
        function completePayment() {
          // محاكاة نجاح الدفع
          fetch('/api/stripe/webhooks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'checkout.session.completed',
              data: {
                object: {
                  id: '${session_id}',
                  client_reference_id: '${school_id}',
                  metadata: {
                    school_id: '${school_id}',
                    package_type: '${packageType}'
                  }
                }
              }
            })
          }).then(() => {
            window.location.href = 'http://localhost:3000/dashboard/whatsapp?payment=success';
          });
        }
        
        function cancelPayment() {
          window.location.href = 'http://localhost:3000/dashboard/whatsapp?payment=cancelled';
        }
      </script>
    </body>
    </html>
  `);
});

// API Endpoint: Stripe Webhooks Handler
app.post('/api/stripe/webhooks', async (req, res) => {
  try {
    const event = req.body;

    console.log('🎣 Webhook received:', event.type);

    // في الإنتاج، يجب التحقق من توقيع Webhook
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    */

    // معالجة حدث إتمام الدفع
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const schoolId = session.metadata?.school_id || session.client_reference_id;
      const packageType = session.metadata?.package_type;

      console.log('💰 معالجة دفع ناجح:', { schoolId, packageType });

      // تحديد تفاصيل الباقة
      const packages = {
        'package_1000': { messages: 1000, price: 100, duration_months: 3 },
        'package_5000': { messages: 5000, price: 400, duration_months: 6 },
        'package_10000': { messages: 10000, price: 700, duration_months: 12 }
      };

      const selectedPackage = packages[packageType];

      if (selectedPackage && schoolId) {
        // البحث عن الاشتراك أو إنشاء واحد جديد
        if (!mockDatabase.subscriptions) {
          mockDatabase.subscriptions = [];
        }

        let subscription = mockDatabase.subscriptions.find(
          sub => sub.school_id === schoolId
        );

        const now = new Date();
        const expiryDate = new Date(now);
        expiryDate.setMonth(expiryDate.getMonth() + selectedPackage.duration_months);

        if (subscription) {
          // تحديث الاشتراك الموجود
          subscription.subscription_status = 'active';
          subscription.message_credits += selectedPackage.messages;
          subscription.total_messages += selectedPackage.messages;
          subscription.package_type = packageType;
          subscription.subscription_starts_at = now.toISOString();
          subscription.subscription_ends_at = expiryDate.toISOString();
          subscription.stripe_session_id = session.id;
          subscription.payment_status = 'paid';
          subscription.updated_at = now.toISOString();
        } else {
          // إنشاء اشتراك جديد
          subscription = {
            id: uuidv4(),
            school_id: schoolId,
            package_type: packageType,
            subscription_status: 'active',
            message_credits: selectedPackage.messages,
            total_messages: selectedPackage.messages,
            messages_sent: 0,
            price: selectedPackage.price,
            currency: 'SAR',
            subscription_starts_at: now.toISOString(),
            subscription_ends_at: expiryDate.toISOString(),
            stripe_session_id: session.id,
            payment_status: 'paid',
            created_at: now.toISOString(),
            updated_at: now.toISOString()
          };
          mockDatabase.subscriptions.push(subscription);
        }

        // تسجيل المعاملة
        if (!mockDatabase.transactions) {
          mockDatabase.transactions = [];
        }

        const transaction = {
          id: uuidv4(),
          subscription_id: subscription.id,
          school_id: schoolId,
          transaction_type: 'purchase',
          amount: selectedPackage.price,
          currency: 'SAR',
          message_credits_added: selectedPackage.messages,
          stripe_payment_intent_id: session.payment_intent,
          status: 'completed',
          created_at: now.toISOString()
        };
        mockDatabase.transactions.push(transaction);

        console.log('✅ تم تفعيل الاشتراك بنجاح:', subscription.id);
        console.log('📊 رصيد الرسائل:', subscription.message_credits);
      }
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في معالجة Webhook'
    });
  }
});

// API Endpoint: حفظ إعدادات واتساب بعد Embedded Signup
app.post('/api/whatsapp/save-config', authenticateToken, (req, res) => {
  try {
    const { phoneNumberId, businessAccountId, phoneNumber, accessToken } = req.body;
    const schoolId = req.user.school_id || 'school_1';

    if (!phoneNumberId || !businessAccountId) {
      return res.status(400).json({
        success: false,
        message: 'بيانات واتساب مطلوبة'
      });
    }

    // إنشاء أو تحديث الإعدادات
    if (!mockDatabase.whatsappConfigurations) {
      mockDatabase.whatsappConfigurations = [];
    }

    let config = mockDatabase.whatsappConfigurations.find(
      c => c.school_id === schoolId
    );

    const now = new Date().toISOString();

    if (config) {
      config.phone_number_id = phoneNumberId;
      config.business_account_id = businessAccountId;
      config.phone_number = phoneNumber;
      config.is_active = true;
      config.verified_at = now;
      config.status = 'active';
      config.updated_at = now;
    } else {
      config = {
        id: uuidv4(),
        school_id: schoolId,
        phone_number_id: phoneNumberId,
        business_account_id: businessAccountId,
        phone_number: phoneNumber,
        is_active: true,
        verified_at: now,
        status: 'active',
        created_at: now,
        updated_at: now
      };
      mockDatabase.whatsappConfigurations.push(config);
    }

    console.log('✅ تم حفظ إعدادات واتساب:', config.id);

    res.json({
      success: true,
      message: 'تم ربط واتساب بنجاح',
      config: {
        id: config.id,
        phone_number: config.phone_number,
        status: config.status
      }
    });

  } catch (error) {
    console.error('Error saving WhatsApp config:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حفظ إعدادات واتساب'
    });
  }
});

// Initialize mock data for WhatsApp system
if (!mockDatabase.subscriptions) {
  mockDatabase.subscriptions = [];
}
if (!mockDatabase.whatsappConfigurations) {
  mockDatabase.whatsappConfigurations = [];
}
if (!mockDatabase.messageLog) {
  mockDatabase.messageLog = [];
}
if (!mockDatabase.transactions) {
  mockDatabase.transactions = [];
}

// =====================================================
// End of WhatsApp Messaging & Subscription Endpoints
// =====================================================

// =====================================================
// Student Reports Routes
// =====================================================
const studentReportsRouter = require('./routes/studentReports');
app.use('/api/student-reports', authenticateToken, studentReportsRouter);

// =====================================================
// Student Affairs Routes (Late Tracking, Absence, Leave)
// =====================================================
const studentAffairsRouter = require('./routes/studentAffairs');
app.use('/api/student-affairs', studentAffairsRouter);

// Global error handler - يجب أن يكون قبل 404 handler
app.use((error, req, res, next) => {
  console.error('\n❌ خطأ في الخادم:');
  console.error('📍 المسار:', req.method, req.url);
  console.error('💥 الخطأ:', error.message);
  console.error('📋 Stack:', error.stack);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'خطأ داخلي في الخادم',
    message: 'حدث خطأ في معالجة الطلب',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ==================== API للاجتماعات التخصصية ====================

/**
 * GET /api/meetings
 * الحصول على جميع جلسات الاجتماعات التخصصية
 */
app.get('/api/meetings', (req, res) => {
  try {
    const meetings = mockDatabase.meetingSessions.map(session => {
      const participants = mockDatabase.meetingParticipants
        .filter(p => p.meeting_id === session.id)
        .map(p => p.teacher_id);
      
      return {
        ...session,
        participants
      };
    });

    res.json({ success: true, meetings });
  } catch (error) {
    console.error('❌ خطأ في جلب الاجتماعات:', error);
    res.status(500).json({ success: false, error: 'فشل في جلب الاجتماعات' });
  }
});

/**
 * POST /api/meetings
 * إنشاء جلسة اجتماع تخصصية جديدة
 */
app.post('/api/meetings', (req, res) => {
  try {
    const { name, day_index, period_index, allow_global_clash, teacher_ids } = req.body;

    // التحقق من البيانات المطلوبة
    if (!name || day_index === undefined || period_index === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'البيانات المطلوبة ناقصة' 
      });
    }

    // التحقق من عدم وجود معلم في اجتماعين في نفس الوقت
    const conflictingTeachers = [];
    if (teacher_ids && teacher_ids.length > 0) {
      // البحث عن الاجتماعات في نفس التوقيت
      const existingMeetings = mockDatabase.meetingSessions.filter(
        m => m.day_index === day_index && m.period_index === period_index
      );

      for (const meeting of existingMeetings) {
        const meetingTeachers = mockDatabase.meetingParticipants
          .filter(p => p.meeting_id === meeting.id)
          .map(p => p.teacher_id);
        
        const duplicates = teacher_ids.filter(id => meetingTeachers.includes(id));
        if (duplicates.length > 0) {
          conflictingTeachers.push(...duplicates);
        }
      }

      if (conflictingTeachers.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'بعض المعلمين موجودون بالفعل في اجتماع آخر في نفس التوقيت',
          conflictingTeachers
        });
      }
    }

    // التحقق من التعارض مع تخصصات أخرى (إذا لم يتم السماح بالاستثناء)
    if (!allow_global_clash) {
      const existingMeetingsAtSlot = mockDatabase.meetingSessions.filter(
        m => m.day_index === day_index && 
             m.period_index === period_index && 
             !m.allow_global_clash
      );

      if (existingMeetingsAtSlot.length > 0) {
        // استخراج أسماء التخصصات المتعارضة
        const conflictingMeetings = existingMeetingsAtSlot.map(m => m.name);
        
        return res.status(409).json({
          success: false,
          error: 'يوجد اجتماع لتخصص آخر في هذه الحصة',
          conflictingMeetings,
          requireException: true
        });
      }
    }

    // إنشاء جلسة الاجتماع
    const newMeeting = {
      id: uuidv4(),
      name,
      day_index: parseInt(day_index),
      period_index: parseInt(period_index),
      allow_global_clash: allow_global_clash || false,
      created_at: new Date().toISOString()
    };

    mockDatabase.meetingSessions.push(newMeeting);

    // إضافة المشاركين
    if (teacher_ids && teacher_ids.length > 0) {
      teacher_ids.forEach(teacher_id => {
        mockDatabase.meetingParticipants.push({
          id: uuidv4(),
          meeting_id: newMeeting.id,
          teacher_id: parseInt(teacher_id),
          created_at: new Date().toISOString()
        });
      });
    }

    console.log(`✅ تم إنشاء جلسة اجتماع جديدة: ${name}`);
    res.json({ 
      success: true, 
      message: 'تم إنشاء الاجتماع بنجاح',
      meeting: {
        ...newMeeting,
        participants: teacher_ids || []
      }
    });
  } catch (error) {
    console.error('❌ خطأ في إنشاء الاجتماع:', error);
    res.status(500).json({ success: false, error: 'فشل في إنشاء الاجتماع' });
  }
});

/**
 * PUT /api/meetings/:id
 * تحديث جلسة اجتماع موجودة
 */
app.put('/api/meetings/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, day_index, period_index, allow_global_clash, teacher_ids } = req.body;

    const meetingIndex = mockDatabase.meetingSessions.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      return res.status(404).json({ success: false, error: 'الاجتماع غير موجود' });
    }

    // التحقق من التعارضات (نفس المنطق كما في POST)
    if (!allow_global_clash) {
      const existingMeetingsAtSlot = mockDatabase.meetingSessions.filter(
        m => m.id !== id && 
             m.day_index === day_index && 
             m.period_index === period_index && 
             !m.allow_global_clash
      );

      if (existingMeetingsAtSlot.length > 0) {
        const conflictingMeetings = existingMeetingsAtSlot.map(m => m.name);
        return res.status(409).json({
          success: false,
          error: 'يوجد اجتماع لتخصص آخر في هذه الحصة',
          conflictingMeetings,
          requireException: true
        });
      }
    }

    // تحديث بيانات الجلسة
    mockDatabase.meetingSessions[meetingIndex] = {
      ...mockDatabase.meetingSessions[meetingIndex],
      name: name || mockDatabase.meetingSessions[meetingIndex].name,
      day_index: day_index !== undefined ? parseInt(day_index) : mockDatabase.meetingSessions[meetingIndex].day_index,
      period_index: period_index !== undefined ? parseInt(period_index) : mockDatabase.meetingSessions[meetingIndex].period_index,
      allow_global_clash: allow_global_clash !== undefined ? allow_global_clash : mockDatabase.meetingSessions[meetingIndex].allow_global_clash,
      updated_at: new Date().toISOString()
    };

    // تحديث المشاركين إذا تم تقديمهم
    if (teacher_ids) {
      // حذف المشاركين القدامى
      mockDatabase.meetingParticipants = mockDatabase.meetingParticipants.filter(
        p => p.meeting_id !== id
      );

      // إضافة المشاركين الجدد
      teacher_ids.forEach(teacher_id => {
        mockDatabase.meetingParticipants.push({
          id: uuidv4(),
          meeting_id: id,
          teacher_id: parseInt(teacher_id),
          created_at: new Date().toISOString()
        });
      });
    }

    console.log(`✅ تم تحديث الاجتماع: ${id}`);
    res.json({ 
      success: true, 
      message: 'تم تحديث الاجتماع بنجاح',
      meeting: {
        ...mockDatabase.meetingSessions[meetingIndex],
        participants: teacher_ids || []
      }
    });
  } catch (error) {
    console.error('❌ خطأ في تحديث الاجتماع:', error);
    res.status(500).json({ success: false, error: 'فشل في تحديث الاجتماع' });
  }
});

/**
 * DELETE /api/meetings/:id
 * حذف جلسة اجتماع
 */
app.delete('/api/meetings/:id', (req, res) => {
  try {
    const { id } = req.params;

    const meetingIndex = mockDatabase.meetingSessions.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      return res.status(404).json({ success: false, error: 'الاجتماع غير موجود' });
    }

    // حذف الجلسة
    const deletedMeeting = mockDatabase.meetingSessions.splice(meetingIndex, 1)[0];

    // حذف المشاركين
    mockDatabase.meetingParticipants = mockDatabase.meetingParticipants.filter(
      p => p.meeting_id !== id
    );

    console.log(`✅ تم حذف الاجتماع: ${deletedMeeting.name}`);
    res.json({ 
      success: true, 
      message: 'تم حذف الاجتماع بنجاح' 
    });
  } catch (error) {
    console.error('❌ خطأ في حذف الاجتماع:', error);
    res.status(500).json({ success: false, error: 'فشل في حذف الاجتماع' });
  }
});

/**
 * GET /api/meetings/check-availability
 * التحقق من توفر حصة معينة للاجتماع
 */
app.get('/api/meetings/check-availability', (req, res) => {
  try {
    const { day_index, period_index, exclude_id } = req.query;

    if (day_index === undefined || period_index === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'يجب تحديد اليوم والحصة' 
      });
    }

    const existingMeetings = mockDatabase.meetingSessions.filter(
      m => m.day_index === parseInt(day_index) && 
           m.period_index === parseInt(period_index) &&
           (!exclude_id || m.id !== exclude_id)
    );

    const hasConflict = existingMeetings.some(m => !m.allow_global_clash);

    res.json({
      success: true,
      available: !hasConflict,
      conflictingMeetings: hasConflict ? existingMeetings.map(m => ({
        id: m.id,
        name: m.name,
        allow_global_clash: m.allow_global_clash
      })) : []
    });
  } catch (error) {
    console.error('❌ خطأ في التحقق من التوفر:', error);
    res.status(500).json({ success: false, error: 'فشل في التحقق من التوفر' });
  }
});

// ==================== نهاية API الاجتماعات التخصصية ====================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'المسار غير موجود' 
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                   🚀 MOTABEA Server Started                    ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  🌐 Port:        ${PORT.toString().padEnd(47)}║`);
  console.log(`║  📱 Frontend:    ${(process.env.FRONTEND_URL || 'http://localhost:3003').padEnd(47)}║`);
  console.log(`║  🔐 Environment: ${(process.env.NODE_ENV || 'development').padEnd(47)}║`);
  console.log(`║  � Schools:     ${mockDatabase.schools.length.toString().padEnd(47)}║`);
  console.log(`║  🎓 Classes:     ${mockDatabase.classes.length.toString().padEnd(47)}║`);
  console.log(`║  👨‍🎓 Students:    ${mockDatabase.students.length.toString().padEnd(47)}║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║  ✅ Server is ready to accept connections                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please kill any existing processes or use a different port.`);
    process.exit(1);
  }
});

module.exports = app;
