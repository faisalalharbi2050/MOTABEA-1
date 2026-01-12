import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, 
  Lock, 
  Loader2,
  Eye,
  EyeOff,
  Home,
  AlertCircle,
  Hash,
  MessageCircle,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'phone'>('credentials');
  const [quickPin, setQuickPin] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.length || !password.length) {
      setLocalError("يرجى إدخال اسم المستخدم وكلمة المرور.");
      return;
    }

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      // الخطأ سيتم عرضه من AuthContext
      console.error('Login error:', err);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // التحقق من صحة رقم الدخول السريع - السماح بأي 4 أرقام
    if (quickPin.length !== 4 || !/^\d{4}$/.test(quickPin)) {
      setLocalError('يرجى إدخال رقم دخول سريع صحيح مكون من 4 أرقام');
      return;
    }

    try {
      // استخدام الدخول العادي مع بيانات وهمية للدخول السريع
      await login('QuickPin_' + quickPin, quickPin);
      
      // حفظ معلومات إضافية للدخول السريع
      localStorage.setItem('loginMethod', 'quickPin');
      localStorage.setItem('quickPin', quickPin);
      
      // إرسال إشعار نجح تسجيل الدخول
      await sendLoginNotifications();
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Quick pin login error:', err);
      setLocalError('فشل في تسجيل الدخول بالرقم السريع');
    }
  };

  const sendLoginNotifications = async () => {
    try {
      // محاكاة إرسال إشعار واتساب
      console.log('إرسال إشعار واتساب: تم تسجيل الدخول بنجاح');
      
      // محاكاة إرسال رسالة نصية
      console.log('إرسال رسالة نصية: تم تسجيل الدخول بنجاح');
      
      // عرض رسالة نجاح للمستخدم
      setTimeout(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('متابع', {
              body: 'تم تسجيل الدخول بنجاح. تم إرسال إشعار إلى واتساب ورسالة نصية.',
              icon: '/favicon.ico'
            });
          }
        }
      }, 1000);
    } catch (error) {
      console.error('خطأ في إرسال الإشعارات:', error);
    }
  };

  const handleQuickPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setQuickPin(value);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden" dir="rtl">
      {/* الخلفية الملونة بدون صورة */}
      <div className="absolute inset-0">
        {/* طبقة التدرج الملونة المخففة */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-main to-brand-light" />
      </div>

      {/* المحتوى */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20">
          
          {/* عنوان الترحيب - يمين الشاشة في الكبير وأعلى في الصغير */}
          <div className="text-center lg:text-right text-white lg:w-1/2 mb-8 lg:mb-0">
            <h1 className="text-7xl lg:text-9xl font-black tracking-tighter drop-shadow-2xl text-white leading-none select-none hover:scale-105 transition-transform duration-500 cursor-default">
              متابع
            </h1>
          </div>

          {/* نافذة تسجيل الدخول الشفافة */}
          <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-main rounded-xl flex items-center justify-center shadow-lg shadow-brand-main/20">
                  <span className="text-white text-2xl font-bold italic">M</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">متابع</h2>
                  <p className="text-xs text-gray-500">تسجيل الدخول</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-gray-200 text-gray-600 hover:text-brand-main hover:border-brand-main hover:bg-brand-light/10 transition-all duration-200"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">الرئيسية</span>
              </Button>
            </div>

            <Tabs defaultValue="credentials" className="w-full" dir="rtl">
              <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-50 rounded-lg gap-1">
                <TabsTrigger 
                  value="credentials"
                  onClick={() => { setLoginMethod('credentials'); setLocalError(null); }}
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-brand-dark data-[state=active]:shadow-sm py-2.5 text-sm font-medium transition-all"
                >
                  تسجيل الدخول
                </TabsTrigger>
                <TabsTrigger 
                  value="phone"
                  onClick={() => { setLoginMethod('phone'); setLocalError(null); }}
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-brand-dark data-[state=active]:shadow-sm py-2.5 text-sm font-medium transition-all"
                >
                  الدخول السريع
                </TabsTrigger>
              </TabsList>

              <TabsContent value="credentials">
                <form onSubmit={handleCredentialsLogin} className="space-y-6">
                  <div>
                    <Label htmlFor="username" className="text-brand-dark font-medium">اسم المستخدم</Label>
                    <div className="mt-2 relative">
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className={`pr-10 placeholder:text-gray-400 border-gray-200 focus:border-brand-main focus:ring-brand-main rounded-lg ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="أدخل اسم المستخدم"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <User className="h-5 w-5 text-gray-400 absolute top-2.5 right-3" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-brand-dark font-medium">كلمة المرور</Label>
                    <div className="mt-2 relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className={`pr-10 placeholder:text-gray-400 border-gray-200 focus:border-brand-main focus:ring-brand-main rounded-lg ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Lock className="h-5 w-5 text-gray-400 absolute top-2.5 right-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-gray-300 text-brand-main focus:ring-brand-main"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600">تذكرني</Label>
                    </div>
                    <div className="text-sm">
                      <a href="#" className="font-medium text-brand-main hover:text-brand-dark transition-colors">
                        نسيت كلمة المرور؟
                      </a>
                    </div>
                  </div>

                  {(error || localError) && (
                    <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                      <AlertCircle className="h-5 w-5 ml-2 flex-shrink-0" />
                      <p className="text-sm font-medium">{error || localError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-brand-main hover:bg-brand-dark text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg py-2.5"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone">
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-brand-dark">الدخول السريع</h2>
                    <p className="mt-2 text-sm text-gray-600">
                      أدخل رقم الدخول السريع المكون من 4 أرقام
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      سيتم إرسال إشعار لك عبر واتساب ورسالة نصية عند تسجيل الدخول
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="quickPin" className="text-brand-dark font-medium">رقم الدخول السريع</Label>
                    <div className="mt-2 relative">
                      <Input
                        id="quickPin"
                        name="quickPin"
                        type="text"
                        required
                        maxLength={4}
                        className="pr-10 text-center text-xl tracking-widest font-mono placeholder:text-gray-400 border-gray-200 focus:border-brand-main focus:ring-brand-main rounded-lg"
                        placeholder="0000"
                        value={quickPin}
                        onChange={handleQuickPinChange}
                      />
                      <Hash className="h-5 w-5 text-gray-400 absolute top-2.5 right-3" />
                    </div>
                    <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <MessageCircle className="h-4 w-4" />
                      <span>واتساب</span>
                      <MessageSquare className="h-4 w-4" />
                      <span>رسالة نصية</span>
                    </div>
                  </div>

                  {((error || localError) && loginMethod === 'phone') && (
                    <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                      <AlertCircle className="h-5 w-5 ml-2 flex-shrink-0" />
                      <p className="text-sm font-medium">{error || localError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-brand-main hover:bg-brand-dark text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg py-2.5"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    ليس لديك حساب؟
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-lg py-2.5"
                  onClick={() => navigate('/register')}
                >
                  إنشاء حساب جديد
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
