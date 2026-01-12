/**
 * Permissions API Routes
 * مسارات API لإدارة الصلاحيات والمستخدمين
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware للتحقق من المصادقة
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = user;
    next();
  });
};

// Middleware للتحقق من صلاحيات الإدارة
const requireAdmin = (req, res, next) => {
  if (req.user.accessLevel !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * GET /api/permissions/users
 * جلب جميع المستخدمين
 */
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const { search, accessLevel, source, isActive } = req.query;
    
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR username LIKE ? OR email LIKE ? OR phone LIKE ? OR quick_access_pin LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (accessLevel) {
      query += ' AND access_level = ?';
      params.push(accessLevel);
    }
    
    if (source) {
      query += ' AND source = ?';
      params.push(source);
    }
    
    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }
    
    const [users] = await req.db.query(query, params);
    
    // جلب صلاحيات كل مستخدم
    for (let user of users) {
      const [permissions] = await req.db.query(
        'SELECT * FROM user_permissions WHERE user_id = ?',
        [user.id]
      );
      user.permissions = permissions.map(p => ({
        module: p.module,
        actions: JSON.parse(p.actions),
        enabled: p.enabled === 1
      }));
      
      // حذف كلمة المرور من الاستجابة
      delete user.password;
    }
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/permissions/users/:id
 * جلب مستخدم واحد
 */
router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const [users] = await req.db.query(
      'SELECT * FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // جلب الصلاحيات
    const [permissions] = await req.db.query(
      'SELECT * FROM user_permissions WHERE user_id = ?',
      [user.id]
    );
    
    user.permissions = permissions.map(p => ({
      module: p.module,
      actions: JSON.parse(p.actions),
      enabled: p.enabled === 1
    }));
    
    delete user.password;
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/permissions/users
 * إضافة مستخدم جديد
 */
router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      username,
      name,
      email,
      phone,
      password,
      quickAccessPin,
      accessLevel,
      permissions,
      source,
      sourceId
    } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!username || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // التحقق من عدم تكرار اسم المستخدم
    const [existing] = await req.db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // التحقق من عدم تكرار رقم الدخول السريع
    if (quickAccessPin) {
      const [existingPin] = await req.db.query(
        'SELECT id FROM users WHERE quick_access_pin = ?',
        [quickAccessPin]
      );
      
      if (existingPin.length > 0) {
        return res.status(400).json({ error: 'Quick access PIN already exists' });
      }
    }
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // إدخال المستخدم
    const [result] = await req.db.query(
      `INSERT INTO users (username, name, email, phone, password, quick_access_pin, 
       access_level, source, source_id, is_active, created_by, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
      [username, name, email, phone, hashedPassword, quickAccessPin, 
       accessLevel, source, sourceId, req.user.id]
    );
    
    const userId = result.insertId;
    
    // إدخال الصلاحيات
    if (permissions && permissions.length > 0) {
      for (let permission of permissions) {
        await req.db.query(
          `INSERT INTO user_permissions (user_id, module, actions, enabled) 
           VALUES (?, ?, ?, ?)`,
          [userId, permission.module, JSON.stringify(permission.actions), permission.enabled ? 1 : 0]
        );
      }
    }
    
    // سجل النشاط
    await req.db.query(
      `INSERT INTO permission_logs (user_id, user_name, action, details, performed_by, 
       performed_by_name, timestamp) VALUES (?, ?, 'created', ?, ?, ?, NOW())`,
      [userId, name, `User created by ${req.user.name}`, req.user.id, req.user.name]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      userId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/permissions/users/:id
 * تحديث مستخدم
 */
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      username,
      name,
      email,
      phone,
      password,
      quickAccessPin,
      accessLevel,
      permissions,
      isActive
    } = req.body;
    
    // التحقق من وجود المستخدم
    const [existing] = await req.db.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // بناء استعلام التحديث
    let updateFields = [];
    let updateValues = [];
    
    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }
    if (quickAccessPin) {
      updateFields.push('quick_access_pin = ?');
      updateValues.push(quickAccessPin);
    }
    if (accessLevel) {
      updateFields.push('access_level = ?');
      updateValues.push(accessLevel);
    }
    if (isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(isActive ? 1 : 0);
    }
    
    if (updateFields.length > 0) {
      updateFields.push('updated_at = NOW()');
      updateValues.push(userId);
      
      await req.db.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }
    
    // تحديث الصلاحيات
    if (permissions) {
      // حذف الصلاحيات القديمة
      await req.db.query('DELETE FROM user_permissions WHERE user_id = ?', [userId]);
      
      // إدخال الصلاحيات الجديدة
      for (let permission of permissions) {
        await req.db.query(
          `INSERT INTO user_permissions (user_id, module, actions, enabled) 
           VALUES (?, ?, ?, ?)`,
          [userId, permission.module, JSON.stringify(permission.actions), permission.enabled ? 1 : 0]
        );
      }
    }
    
    // سجل النشاط
    await req.db.query(
      `INSERT INTO permission_logs (user_id, user_name, action, details, performed_by, 
       performed_by_name, timestamp) VALUES (?, ?, 'updated', ?, ?, ?, NOW())`,
      [userId, name || existing[0].name, `User updated by ${req.user.name}`, req.user.id, req.user.name]
    );
    
    res.json({ 
      success: true, 
      message: 'User updated successfully' 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/permissions/users/:id
 * حذف مستخدم
 */
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // التحقق من وجود المستخدم
    const [existing] = await req.db.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // منع حذف المستخدم الخاص
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // حذف الصلاحيات
    await req.db.query('DELETE FROM user_permissions WHERE user_id = ?', [userId]);
    
    // سجل النشاط
    await req.db.query(
      `INSERT INTO permission_logs (user_id, user_name, action, details, performed_by, 
       performed_by_name, timestamp) VALUES (?, ?, 'deleted', ?, ?, ?, NOW())`,
      [userId, existing[0].name, `User deleted by ${req.user.name}`, req.user.id, req.user.name]
    );
    
    // حذف المستخدم
    await req.db.query('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/permissions/quick-access-login
 * تسجيل الدخول بالرقم السريع
 */
router.post('/quick-access-login', async (req, res) => {
  try {
    const { pin } = req.body;
    
    if (!pin || pin.length !== 4) {
      return res.status(400).json({ error: 'Invalid PIN format' });
    }
    
    // البحث عن المستخدم
    const [users] = await req.db.query(
      'SELECT * FROM users WHERE quick_access_pin = ? AND is_active = 1',
      [pin]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid PIN or account is inactive' });
    }
    
    const user = users[0];
    
    // جلب الصلاحيات
    const [permissions] = await req.db.query(
      'SELECT * FROM user_permissions WHERE user_id = ?',
      [user.id]
    );
    
    user.permissions = permissions.map(p => ({
      module: p.module,
      actions: JSON.parse(p.actions),
      enabled: p.enabled === 1
    }));
    
    // إنشاء JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        name: user.name,
        accessLevel: user.access_level 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // تحديث آخر تسجيل دخول
    await req.db.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );
    
    // سجل النشاط
    await req.db.query(
      `INSERT INTO permission_logs (user_id, user_name, action, details, performed_by, 
       performed_by_name, timestamp) VALUES (?, ?, 'login', ?, ?, ?, NOW())`,
      [user.id, user.name, 'Quick access login', user.id, user.name]
    );
    
    delete user.password;
    delete user.quick_access_pin;
    
    res.json({ 
      success: true,
      user,
      token
    });
  } catch (error) {
    console.error('Error during quick access login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/permissions/stats
 * جلب إحصائيات الصلاحيات
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [totalUsers] = await req.db.query('SELECT COUNT(*) as count FROM users');
    const [activeUsers] = await req.db.query('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    const [byLevel] = await req.db.query('SELECT access_level, COUNT(*) as count FROM users GROUP BY access_level');
    const [bySource] = await req.db.query('SELECT source, COUNT(*) as count FROM users GROUP BY source');
    
    const stats = {
      totalUsers: totalUsers[0].count,
      activeUsers: activeUsers[0].count,
      inactiveUsers: totalUsers[0].count - activeUsers[0].count,
      usersByAccessLevel: {},
      usersBySource: {}
    };
    
    byLevel.forEach(item => {
      stats.usersByAccessLevel[item.access_level] = item.count;
    });
    
    bySource.forEach(item => {
      stats.usersBySource[item.source] = item.count;
    });
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/permissions/logs
 * جلب سجل التغييرات
 */
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, action, limit = 100 } = req.query;
    
    let query = 'SELECT * FROM permission_logs WHERE 1=1';
    const params = [];
    
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [logs] = await req.db.query(query, params);
    
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
