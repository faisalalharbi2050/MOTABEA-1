import React, { useState, useRef, useEffect } from 'react';
import { Hash, ArrowRight, X, Shield, Lock } from 'lucide-react';

interface QuickAccessLoginProps {
  onLogin: (pin: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const QuickAccessLogin: React.FC<QuickAccessLoginProps> = ({
  onLogin,
  onClose,
  isOpen
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // التركيز على أول حقل عند الفتح
  useEffect(() => {
    if (isOpen && inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [isOpen]);

  // التعامل مع تغيير الرقم
  const handleChange = (index: number, value: string) => {
    // قبول الأرقام فقط
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // الانتقال إلى الحقل التالي
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // إرسال تلقائي عند اكتمال الرقم
    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value].join('');
      handleSubmit(fullPin);
    }
  };

  // التعامل مع مفتاح الحذف
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        // الانتقال للحقل السابق إذا كان الحقل الحالي فارغاً
        inputRefs[index - 1].current?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index < 3) {
      inputRefs[index + 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'Enter') {
      handleSubmit(pin.join(''));
    }
  };

  // التعامل مع اللصق
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);
    
    if (digits.length === 4) {
      const newPin = digits.split('');
      setPin(newPin);
      inputRefs[3].current?.focus();
      handleSubmit(digits);
    }
  };

  // إرسال النموذج
  const handleSubmit = async (pinValue: string) => {
    if (pinValue.length !== 4) {
      setError('يرجى إدخال رقم من 4 أرقام');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onLogin(pinValue);
    } catch (err: any) {
      setError(err.message || 'رقم الدخول السريع غير صحيح');
      // إعادة تعيين الحقول
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // مسح الحقول
  const handleClear = () => {
    setPin(['', '', '', '']);
    setError('');
    inputRefs[0].current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* رأس المودال */}
        <div className="px-6 py-4 bg-gradient-to-l from-blue-600 to-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">الدخول السريع</h2>
                <p className="text-blue-100 text-sm">أدخل رقم الدخول المكون من 4 أرقام</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* محتوى المودال */}
        <div className="p-8">
          {/* أيقونة القفل */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* حقول إدخال الرقم */}
          <div className="flex justify-center gap-4 mb-6" dir="ltr">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isLoading}
                className={`w-16 h-16 text-center text-3xl font-bold border-2 rounded-xl transition-all focus:outline-none ${
                  error
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : digit
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            ))}
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          {/* لوحة الأرقام */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  const emptyIndex = pin.findIndex(d => !d);
                  if (emptyIndex !== -1) {
                    handleChange(emptyIndex, num.toString());
                  }
                }}
                disabled={isLoading || !pin.includes('')}
                className="h-14 text-xl font-bold bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="h-14 text-sm font-medium bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              مسح
            </button>
            <button
              type="button"
              onClick={() => {
                const emptyIndex = pin.findIndex(d => !d);
                if (emptyIndex !== -1) {
                  handleChange(emptyIndex, '0');
                }
              }}
              disabled={isLoading || !pin.includes('')}
              className="h-14 text-xl font-bold bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(pin.join(''))}
              disabled={isLoading || pin.includes('')}
              className="h-14 text-sm font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  دخول
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* رسالة إرشادية */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              يمكنك أيضاً استخدام لوحة المفاتيح لإدخال الأرقام
            </p>
          </div>
        </div>

        {/* التذييل */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>نظام دخول آمن ومشفر</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAccessLogin;
