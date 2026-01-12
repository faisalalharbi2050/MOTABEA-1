-- جداول نظام رسائل الواتساب والاشتراكات
-- MOTABEA WhatsApp Messaging System Tables

USE motabea_db;

-- جدول إعدادات واتساب للمدارس
-- يخزن معلومات ربط واتساب لكل مدرسة
CREATE TABLE IF NOT EXISTS whatsapp_configurations (
    id VARCHAR(36) PRIMARY KEY,
    school_id VARCHAR(36) NOT NULL,
    phone_number_id VARCHAR(255) NOT NULL COMMENT 'WhatsApp Business Phone Number ID from Meta',
    business_account_id VARCHAR(255) NOT NULL COMMENT 'WhatsApp Business Account ID from Meta',
    phone_number VARCHAR(20) COMMENT 'رقم الهاتف المربوط',
    access_token TEXT COMMENT 'Token خاص بالمدرسة (مشفر)',
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMP NULL COMMENT 'تاريخ التحقق من الرقم',
    webhook_verified BOOLEAN DEFAULT FALSE,
    quality_rating ENUM('green', 'yellow', 'red', 'unknown') DEFAULT 'unknown',
    messaging_limit ENUM('tier_50', 'tier_250', 'tier_1k', 'tier_10k', 'tier_100k', 'tier_unlimited') DEFAULT 'tier_250',
    status ENUM('active', 'pending', 'suspended', 'disconnected') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_school_whatsapp (school_id),
    INDEX idx_phone_number_id (phone_number_id),
    INDEX idx_business_account_id (business_account_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='إعدادات واتساب للمدارس - تخزين بيانات الربط مع Meta API';

-- جدول الاشتراكات
-- يدير اشتراكات المدارس في خدمة الرسائل
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    school_id VARCHAR(36) NOT NULL,
    package_type VARCHAR(50) NOT NULL COMMENT 'نوع الباقة: package_1000, package_5000, package_10000',
    subscription_status ENUM('active', 'inactive', 'expired', 'cancelled', 'pending') DEFAULT 'pending',
    message_credits INT DEFAULT 0 COMMENT 'عدد الرسائل المتبقية',
    total_messages INT DEFAULT 0 COMMENT 'إجمالي الرسائل في الباقة',
    messages_sent INT DEFAULT 0 COMMENT 'عدد الرسائل المرسلة',
    price DECIMAL(10, 2) COMMENT 'سعر الاشتراك',
    currency VARCHAR(3) DEFAULT 'SAR',
    subscription_starts_at TIMESTAMP NULL,
    subscription_ends_at TIMESTAMP NULL COMMENT 'تاريخ انتهاء الاشتراك',
    stripe_customer_id VARCHAR(255) COMMENT 'Stripe Customer ID',
    stripe_payment_id VARCHAR(255) COMMENT 'Stripe Payment Intent ID',
    stripe_session_id VARCHAR(255) COMMENT 'Stripe Checkout Session ID',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_school_status (school_id, subscription_status),
    INDEX idx_stripe_session (stripe_session_id),
    INDEX idx_status (subscription_status),
    INDEX idx_expires (subscription_ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='اشتراكات المدارس في خدمة رسائل الواتساب';

-- جدول سجل المعاملات المالية
CREATE TABLE IF NOT EXISTS subscription_transactions (
    id VARCHAR(36) PRIMARY KEY,
    subscription_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    transaction_type ENUM('purchase', 'renewal', 'refund', 'credit_addition') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    message_credits_added INT DEFAULT 0,
    stripe_payment_intent_id VARCHAR(255),
    payment_method VARCHAR(50),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_subscription (subscription_id),
    INDEX idx_school (school_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='سجل المعاملات المالية للاشتراكات';

-- جدول قوالب الرسائل المعتمدة من Meta
CREATE TABLE IF NOT EXISTS whatsapp_message_templates (
    id VARCHAR(36) PRIMARY KEY,
    school_id VARCHAR(36) NOT NULL,
    template_name VARCHAR(255) NOT NULL COMMENT 'اسم القالب في Meta',
    template_id VARCHAR(255) COMMENT 'معرف القالب من Meta',
    category ENUM('MARKETING', 'UTILITY', 'AUTHENTICATION') DEFAULT 'UTILITY',
    language VARCHAR(10) DEFAULT 'ar',
    status ENUM('pending', 'approved', 'rejected', 'deleted') DEFAULT 'pending',
    template_content TEXT NOT NULL COMMENT 'محتوى القالب',
    template_parameters JSON COMMENT 'المتغيرات في القالب',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_school_template (school_id, template_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='قوالب الرسائل المعتمدة من Meta لكل مدرسة';

-- جدول سجل الرسائل المرسلة
CREATE TABLE IF NOT EXISTS whatsapp_message_log (
    id VARCHAR(36) PRIMARY KEY,
    school_id VARCHAR(36) NOT NULL,
    subscription_id VARCHAR(36),
    template_id VARCHAR(36),
    recipient_type ENUM('student_parent', 'teacher', 'staff', 'custom') NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_name VARCHAR(255),
    message_content TEXT NOT NULL,
    message_type ENUM('template', 'text', 'media') DEFAULT 'template',
    whatsapp_message_id VARCHAR(255) COMMENT 'معرف الرسالة من WhatsApp',
    status ENUM('pending', 'sent', 'delivered', 'read', 'failed') DEFAULT 'pending',
    failure_reason TEXT,
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    cost DECIMAL(6, 4) DEFAULT 0 COMMENT 'تكلفة الرسالة',
    sent_by VARCHAR(36) COMMENT 'معرف المستخدم الذي أرسل',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    FOREIGN KEY (template_id) REFERENCES whatsapp_message_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_school (school_id),
    INDEX idx_subscription (subscription_id),
    INDEX idx_status (status),
    INDEX idx_recipient (recipient_phone),
    INDEX idx_sent_at (sent_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='سجل جميع رسائل الواتساب المرسلة';

-- جدول ردود الواتساب الواردة (Webhooks)
CREATE TABLE IF NOT EXISTS whatsapp_incoming_messages (
    id VARCHAR(36) PRIMARY KEY,
    school_id VARCHAR(36),
    whatsapp_message_id VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    sender_name VARCHAR(255),
    message_content TEXT,
    message_type ENUM('text', 'image', 'video', 'audio', 'document', 'location', 'contact') DEFAULT 'text',
    timestamp BIGINT,
    is_processed BOOLEAN DEFAULT FALSE,
    related_message_id VARCHAR(36) COMMENT 'معرف الرسالة الأصلية إن كانت ردًا',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL,
    FOREIGN KEY (related_message_id) REFERENCES whatsapp_message_log(id) ON DELETE SET NULL,
    UNIQUE KEY unique_whatsapp_msg (whatsapp_message_id),
    INDEX idx_school (school_id),
    INDEX idx_sender (sender_phone),
    INDEX idx_processed (is_processed),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='الرسائل الواردة من واتساب (الردود)';

-- جدول إحصائيات الرسائل اليومية
CREATE TABLE IF NOT EXISTS whatsapp_daily_stats (
    id VARCHAR(36) PRIMARY KEY,
    school_id VARCHAR(36) NOT NULL,
    stat_date DATE NOT NULL,
    messages_sent INT DEFAULT 0,
    messages_delivered INT DEFAULT 0,
    messages_read INT DEFAULT 0,
    messages_failed INT DEFAULT 0,
    total_cost DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_school_date (school_id, stat_date),
    INDEX idx_school (school_id),
    INDEX idx_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='إحصائيات الرسائل اليومية لكل مدرسة';

-- بيانات تجريبية للمدرسة الافتراضية
-- إضافة اشتراك تجريبي
INSERT INTO subscriptions (id, school_id, package_type, subscription_status, message_credits, total_messages, messages_sent, price, subscription_starts_at, subscription_ends_at)
VALUES (
    'sub_demo_001',
    'school_1',
    'package_5000',
    'inactive',
    0,
    5000,
    0,
    400.00,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE id=id;

-- إنشاء فهارس إضافية لتحسين الأداء
CREATE INDEX idx_whatsapp_config_school ON whatsapp_configurations(school_id, is_active);
CREATE INDEX idx_subscription_active ON subscriptions(school_id, subscription_status, subscription_ends_at);
CREATE INDEX idx_message_log_school_date ON whatsapp_message_log(school_id, created_at, status);

COMMIT;

-- عرض ملخص الجداول المنشأة
SELECT 
    'whatsapp_configurations' AS table_name, 
    'إعدادات واتساب للمدارس' AS description
UNION ALL SELECT 'subscriptions', 'اشتراكات المدارس'
UNION ALL SELECT 'subscription_transactions', 'سجل المعاملات المالية'
UNION ALL SELECT 'whatsapp_message_templates', 'قوالب الرسائل المعتمدة'
UNION ALL SELECT 'whatsapp_message_log', 'سجل الرسائل المرسلة'
UNION ALL SELECT 'whatsapp_incoming_messages', 'الرسائل الواردة'
UNION ALL SELECT 'whatsapp_daily_stats', 'إحصائيات يومية';
