// دالة مساعدة لدمج أسماء الفئات
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// دالة مساعدة لتنسيق النصوص
export function formatText(text) {
  if (!text) return '';
  return text.trim();
}

// دالة مساعدة للتحقق من صحة البريد الإلكتروني
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// دالة مساعدة لتنسيق أرقام الهواتف
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  // إزالة جميع الأحرف غير الرقمية
  const cleaned = phone.replace(/\D/g, '');
  // تنسيق الرقم السعودي
  if (cleaned.startsWith('966')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('05')) {
    return `+966${cleaned.substring(1)}`;
  }
  return phone;
}