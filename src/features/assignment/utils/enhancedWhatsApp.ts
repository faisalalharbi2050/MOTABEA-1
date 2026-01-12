/**
 * خدمات واتساب المطورة للإرسال والمشاركة
 * Enhanced WhatsApp Services for Sending and Sharing
 */

import type { TeacherAssignmentSummary, PlanSummary } from '../store/types';
import { 
  buildTeacherAssignmentText, 
  buildPlanAssignmentText,
  buildQuickShareText,
  buildQuickTeacherText 
} from './textBuilders';

// أنواع خيارات الإرسال
export type SendMode = 'individual' | 'group' | 'broadcast';

export interface WhatsAppShareOptions {
  mode: SendMode;
  phoneNumbers?: string[]; // للإرسال الفردي أو الجماعي
  text: string;
  copyFallback?: boolean; // نسخ النص إذا فشل فتح واتساب
  confirmBulk?: boolean; // طلب تأكيد للإرسال المتعدد
}

export interface ShareResult {
  success: boolean;
  method: 'whatsapp' | 'clipboard' | 'share-api';
  message?: string;
  copiedText?: string;
}

/**
 * فتح واتساب ويب أو التطبيق مع النص المحدد
 */
const openWhatsApp = (text: string, phoneNumber?: string): boolean => {
  const encodedText = encodeURIComponent(text);
  
  // إنشاء الروابط المختلفة
  const webUrl = phoneNumber 
    ? `https://wa.me/${phoneNumber}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
  
  const appUrl = phoneNumber
    ? `whatsapp://send?phone=${phoneNumber}&text=${encodedText}`
    : `whatsapp://send?text=${encodedText}`;

  try {
    // محاولة فتح التطبيق أولاً
    const appWindow = window.open(appUrl, '_blank');
    
    // إذا فشل فتح التطبيق، فتح الويب
    setTimeout(() => {
      if (!appWindow || appWindow.closed || appWindow.location.href === 'about:blank') {
        window.open(webUrl, '_blank');
      }
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('فشل في فتح واتساب:', error);
    return false;
  }
};

/**
 * نسخ النص إلى الحافظة
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // fallback للمتصفحات القديمة
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('فشل في نسخ النص:', error);
    return false;
  }
};

/**
 * استخدام Web Share API إذا كان متاحاً
 */
const useWebShare = async (text: string, title: string = 'إسناد المواد'): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      });
      return true;
    } catch (error) {
      console.error('فشل في المشاركة:', error);
      return false;
    }
  }
  return false;
};

/**
 * إرسال إسناد معلم واحد
 */
export const shareTeacherAssignment = async (
  summary: TeacherAssignmentSummary,
  options: Partial<WhatsAppShareOptions> = {}
): Promise<ShareResult> => {
  const defaultOptions: WhatsAppShareOptions = {
    mode: 'individual',
    copyFallback: true,
    text: buildTeacherAssignmentText(summary, true, true),
    ...options
  };

  // محاولة المشاركة عبر واتساب
  if (defaultOptions.phoneNumbers && defaultOptions.phoneNumbers.length > 0) {
    const phoneNumber = defaultOptions.phoneNumbers[0];
    const success = openWhatsApp(defaultOptions.text, phoneNumber);
    
    if (success) {
      return {
        success: true,
        method: 'whatsapp',
        message: 'تم فتح واتساب بنجاح'
      };
    }
  } else {
    // بدون رقم هاتف - فتح واتساب العام
    const success = openWhatsApp(defaultOptions.text);
    
    if (success) {
      return {
        success: true,
        method: 'whatsapp',
        message: 'تم فتح واتساب بنجاح'
      };
    }
  }

  // محاولة استخدام Web Share API
  const shareSuccess = await useWebShare(
    defaultOptions.text, 
    `إسناد المواد - ${summary.teacherName}`
  );
  
  if (shareSuccess) {
    return {
      success: true,
      method: 'share-api',
      message: 'تم المشاركة بنجاح'
    };
  }

  // الخيار الأخير - نسخ النص
  if (defaultOptions.copyFallback) {
    const copySuccess = await copyToClipboard(defaultOptions.text);
    
    if (copySuccess) {
      return {
        success: true,
        method: 'clipboard',
        message: 'تم نسخ النص إلى الحافظة',
        copiedText: defaultOptions.text
      };
    }
  }

  return {
    success: false,
    method: 'clipboard',
    message: 'فشل في المشاركة أو النسخ'
  };
};

/**
 * إرسال ملخص متعدد المعلمين
 */
export const sharePlanSummary = async (
  summaries: PlanSummary,
  scopeLabel: string = 'المحدد',
  options: Partial<WhatsAppShareOptions> = {}
): Promise<ShareResult> => {
  const defaultOptions: WhatsAppShareOptions = {
    mode: 'group',
    copyFallback: true,
    text: buildPlanAssignmentText(summaries, scopeLabel, true, 5),
    ...options
  };

  // محاولة المشاركة عبر واتساب
  const success = openWhatsApp(defaultOptions.text);
  
  if (success) {
    return {
      success: true,
      method: 'whatsapp',
      message: 'تم فتح واتساب بنجاح'
    };
  }

  // محاولة استخدام Web Share API
  const shareSuccess = await useWebShare(
    defaultOptions.text, 
    `ملخص إسناد المواد - ${scopeLabel}`
  );
  
  if (shareSuccess) {
    return {
      success: true,
      method: 'share-api',
      message: 'تم المشاركة بنجاح'
    };
  }

  // الخيار الأخير - نسخ النص
  if (defaultOptions.copyFallback) {
    const copySuccess = await copyToClipboard(defaultOptions.text);
    
    if (copySuccess) {
      return {
        success: true,
        method: 'clipboard',
        message: 'تم نسخ النص إلى الحافظة',
        copiedText: defaultOptions.text
      };
    }
  }

  return {
    success: false,
    method: 'clipboard',
    message: 'فشل في المشاركة أو النسخ'
  };
};

/**
 * إرسال متعدد للمعلمين (فردي لكل معلم)
 */
export const shareMultipleTeachers = async (
  summaries: TeacherAssignmentSummary[],
  phoneNumbers: string[] = [],
  options: {
    confirmEach?: boolean;
    delayBetween?: number; // تأخير بين الإرسالات بالميللي ثانية
    copyFallback?: boolean;
  } = {}
): Promise<ShareResult[]> => {
  const results: ShareResult[] = [];
  const { confirmEach = true, delayBetween = 2000, copyFallback = true } = options;

  if (confirmEach && summaries.length > 1) {
    const confirmed = confirm(
      `هل تريد إرسال ${summaries.length} رسالة واتساب منفصلة؟\n` +
      'سيتم فتح تبويب منفصل لكل معلم.'
    );
    
    if (!confirmed) {
      return [{
        success: false,
        method: 'whatsapp',
        message: 'تم إلغاء الإرسال المتعدد'
      }];
    }
  }

  for (let i = 0; i < summaries.length; i++) {
    const summary = summaries[i];
    const phoneNumber = phoneNumbers[i];
    
    try {
      const result = await shareTeacherAssignment(summary, {
        mode: 'individual',
        phoneNumbers: phoneNumber ? [phoneNumber] : undefined,
        copyFallback: copyFallback && i === summaries.length - 1 // نسخ فقط للأخير
      });
      
      results.push(result);
      
      // تأخير بين الإرسالات لتجنب حجب المتصفح
      if (i < summaries.length - 1 && delayBetween > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetween));
      }
      
    } catch (error) {
      results.push({
        success: false,
        method: 'whatsapp',
        message: `فشل في إرسال إسناد ${summary.teacherName}`
      });
    }
  }

  return results;
};

/**
 * مشاركة سريعة (نص مختصر)
 */
export const shareQuick = async (
  data: TeacherAssignmentSummary | PlanSummary,
  scopeLabel?: string
): Promise<ShareResult> => {
  let text: string;
  
  if ('teacherName' in data) {
    // معلم واحد
    text = buildQuickTeacherText(data);
  } else {
    // متعدد
    text = buildQuickShareText(data, scopeLabel || 'المحدد');
  }

  // محاولة المشاركة السريعة
  const shareSuccess = await useWebShare(text, 'إسناد المواد');
  
  if (shareSuccess) {
    return {
      success: true,
      method: 'share-api',
      message: 'تم المشاركة بنجاح'
    };
  }

  // محاولة واتساب
  const whatsappSuccess = openWhatsApp(text);
  
  if (whatsappSuccess) {
    return {
      success: true,
      method: 'whatsapp',
      message: 'تم فتح واتساب بنجاح'
    };
  }

  // نسخ النص
  const copySuccess = await copyToClipboard(text);
  
  return {
    success: copySuccess,
    method: 'clipboard',
    message: copySuccess ? 'تم نسخ النص إلى الحافظة' : 'فشل في النسخ',
    copiedText: copySuccess ? text : undefined
  };
};

/**
 * نسخ النص فقط (بدون محاولة واتساب)
 */
export const copyAssignmentText = async (
  data: TeacherAssignmentSummary | PlanSummary,
  scopeLabel?: string,
  detailed: boolean = true
): Promise<ShareResult> => {
  let text: string;
  
  if ('teacherName' in data) {
    // معلم واحد
    text = buildTeacherAssignmentText(data, true, detailed);
  } else {
    // متعدد
    text = buildPlanAssignmentText(data, scopeLabel || 'المحدد', detailed, 10);
  }

  const success = await copyToClipboard(text);
  
  return {
    success,
    method: 'clipboard',
    message: success ? 'تم نسخ النص إلى الحافظة' : 'فشل في النسخ',
    copiedText: success ? text : undefined
  };
};

/**
 * فحص دعم واتساب في المتصفح/الجهاز
 */
export const checkWhatsAppSupport = (): {
  webSupport: boolean;
  appSupport: boolean;
  shareSupport: boolean;
  clipboardSupport: boolean;
} => {
  return {
    webSupport: true, // wa.me متاح دائماً
    appSupport: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    shareSupport: !!navigator.share,
    clipboardSupport: !!navigator.clipboard || document.queryCommandSupported?.('copy')
  };
};