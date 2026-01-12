import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Lock, 
  Phone,
  Home,
  Asterisk,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [fullNameWords, setFullNameWords] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("05");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Count words in full name by splitting on whitespace and filtering out empty strings
    const words = fullName.trim().split(/\s+/).filter(word => word.length > 0);
    setFullNameWords(words.length);
  }, [fullName]);

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // إذا كان المستخدم حذف كل شيء، ضع 05 كبداية
    if (value === "") {
      setPhoneNumber("05");
      return;
    }
    
    // تأكد من أن الرقم يبدأ بـ 05 وأن طول الرقم لا يتجاوز 10 أرقام
    if (value.startsWith("05") && value.length <= 10 && /^\d+$/.test(value)) {
      setPhoneNumber(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate full name has exactly 3 words
    if (fullNameWords !== 3) {
      toast.error("اسم المستخدم مطلوب (يجب إدخال ثلاثة أسماء)");
      setIsLoading(false);
      return;
    }
    
    // Validate phone number
    if (!phoneNumber.startsWith("05") || phoneNumber.length !== 10) {
      toast.error("الرجاء إدخال رقم هاتف صحيح يبدأ بـ 05 ويتكون من 10 أرقام");
      setIsLoading(false);
      return;
    }
    
    // Validate password
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تتكون من 6 أحرف على الأقل");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("تم إنشاء الحساب بنجاح! مرحباً بك في متابع");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }, 2000);
  };

  const RequiredIndicator = () => (
    <Asterisk className="inline-block h-3 w-3 text-red-500 mr-1" />
  );

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

          {/* نافذة التسجيل الجديد الشفافة */}
          <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-main rounded-xl flex items-center justify-center shadow-lg shadow-brand-main/20">
                  <span className="text-white text-2xl font-bold italic">M</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">متابع</h2>
                  <p className="text-xs text-gray-500">حساب جديد</p>
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

            {/* Social Registration */}
            <div className="flex justify-center gap-6 mb-8">
               <button 
                type="button"
                className="w-14 h-14 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-md hover:-translate-y-1 hover:shadow-lg"
                title="Apple"
               >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.08-.49-3.2.14-1.02.57-2.09.43-3.13-.53V20.2c-2.39-2.28-3.66-5.88-2.67-9.3.93-3.26 3.73-5.26 7.18-5.11 1.77.11 3.25.75 4.3 2.02.83-.99 2.05-1.63 4.13-1.63 1.09 0 2.08.19 2.97.57-2.14 1.14-3.5 3.19-3.4 5.67.07 2.25 1.54 4.09 3.55 5.09-.59 1.34-1.4 2.65-2.65 3.97l-.02-.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
               </button>
               <button 
                type="button"
                className="w-14 h-14 flex items-center justify-center bg-white border border-gray-100 text-gray-700 rounded-full hover:bg-gray-50 transition-all shadow-md hover:-translate-y-1 hover:shadow-lg"
                title="Google"
               >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
               </button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">أو عبر البريد الإلكتروني</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
              <div>
                <Label htmlFor="fullName" className="text-gray-700 text-sm font-bold flex items-center mb-1.5">
                  <RequiredIndicator />
                  اسم المستخدم
                </Label>
                <div className="relative group">
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="h-11 pr-10 bg-gray-50 border-transparent focus:bg-white focus:border-brand-main focus:ring-4 focus:ring-brand-light/20 rounded-xl transition-all duration-300"
                    placeholder="الاسم الثلاثي"
                    value={fullName}
                    onChange={handleFullNameChange}
                  />
                  <User className="h-5 w-5 text-gray-400 absolute top-3 right-3 group-focus-within:text-brand-main transition-colors" />
                </div>
                <div className="flex justify-between items-center mt-1">
                   {fullNameWords > 0 && (
                      <div className="flex gap-1">
                         {[1, 2, 3].map((i) => (
                           <div key={i} className={`h-1 w-4 rounded-full transition-colors ${i <= fullNameWords ? 'bg-green-500' : 'bg-gray-200'}`} />
                         ))}
                      </div>
                   )}
                   <p className={`text-[10px] ${fullNameWords === 3 ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                    ({fullNameWords}/3)
                   </p>
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-700 text-sm font-bold flex items-center mb-1.5">
                  <RequiredIndicator />
                  رقم الجوال
                </Label>
                <div className="relative group">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    dir="ltr"
                    className="h-11 pr-10 bg-gray-50 border-transparent focus:bg-white focus:border-brand-main focus:ring-4 focus:ring-brand-light/20 rounded-xl transition-all duration-300 font-mono text-left"
                    placeholder="05xxxxxxxx"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                  />
                  <Phone className="h-5 w-5 text-gray-400 absolute top-3 right-3 group-focus-within:text-brand-main transition-colors" />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 text-sm font-bold flex items-center mb-1.5">
                  <RequiredIndicator />
                  كلمة المرور
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="h-11 pr-10 bg-gray-50 border-transparent focus:bg-white focus:border-brand-main focus:ring-4 focus:ring-brand-light/20 rounded-xl transition-all duration-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute top-3 right-3 group-focus-within:text-brand-main transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick PIN removed as per request */}

              <Button
                type="submit"
                className="w-full h-12 bg-brand-main hover:bg-brand-dark text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>جاري إنشاء الحساب...</span>
                  </div>
                ) : (
                  'إنشاء حساب جديد'
                )}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    لديك حساب بالفعل؟
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-lg py-2.5"
                  onClick={() => navigate('/login')}
                >
                  تسجيل الدخول
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
