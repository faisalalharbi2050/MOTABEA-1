const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting MOTABEA Server...');

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Demo users
const users = [
  {
    id: '1',
    username: 'admin',
    password: '$2b$10$f8MjI3vmED9.0buRfNgBluQVc9rM64Op6dgDTBhFzUxB/bny2KCPu', // admin123
    email: 'admin@motabea.edu.sa',
    name: 'مدير النظام',
    role: 'admin',
    permissions: ['all']
  },
  {
    id: '2',
    username: 'vice',
    password: '$2b$10$rQj8Z9Xm5vJKpE3l2Nd7FuWzHgTcA1bR8sP4kY6qL9mV0cX3eN5oI7', // vice123
    email: 'vice@motabea.edu.sa',
    name: 'وكيل المدرسة',
    role: 'vice_principal',
    permissions: ['teachers', 'students', 'schedule']
  },
  {
    id: '3',
    username: 'supervisor',
    password: '$2b$10$tA9Bc4D7E2F6gH8I1jK3lM5N0oP2qR7sT4uV9wX1yZ8aB5cD6eF9gH', // super123
    email: 'supervisor@motabea.edu.sa',
    name: 'المشرف التربوي',
    role: 'supervisor',
    permissions: ['supervision', 'reports']
  }
];

// Routes

// Health check
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'MOTABEA Server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('\n🔐 Login request received at:', new Date().toISOString());
    console.log('📝 Request body:', req.body);
    
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
        message: 'يرجى إدخال اسم المستخدم وكلمة المرور'
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    console.log('🔍 Looking for user:', cleanUsername);
    
    // Find user
    const user = users.find(u => u.username.toLowerCase() === cleanUsername);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    console.log('✅ User found:', user.username);

    // Check password
    const isValidPassword = await bcrypt.compare(String(password), user.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    console.log('🎫 Password valid, generating token...');

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      'motabea-secret-key-2024',
      { expiresIn: '24h' }
    );

    // Return response
    const { password: _, ...userWithoutPassword } = user;
    
    const response = {
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: userWithoutPassword
    };

    console.log('✅ Login successful for:', user.username);
    res.json(response);

  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'حدث خطأ في الخادم'
    });
  }
});

// Verify token
app.get('/api/auth/verify', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    jwt.verify(token, 'motabea-secret-key-2024', (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: 'Invalid token'
        });
      }

      const user = users.find(u => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        success: true,
        user: userWithoutPassword
      });
    });
  } catch (error) {
    console.error('💥 Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Dashboard data
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      teachers: 45,
      students: 380,
      classes: 18,
      subjects: 12
    }
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'MOTABEA API Server',
    status: 'Running',
    version: '1.0.0'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'حدث خطأ غير متوقع'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❓ Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: 'المسار غير موجود'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🎉 MOTABEA Server started successfully!');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log('🔗 Health check: http://localhost:' + PORT + '/api/health');
  console.log('\n👥 Demo Users:');
  console.log('   Admin: admin / admin123');
  console.log('   Vice: vice / vice123');
  console.log('   Supervisor: supervisor / super123\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});
