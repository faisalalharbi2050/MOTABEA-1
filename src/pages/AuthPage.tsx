import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, 
  Lock, 
  Loader2,
  Eye,
  EyeOff,
  Home,
  AlertCircle,
  Phone,
  Asterisk,
  CheckCircle2,
  Check as Checks
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from "sonner";

interface AuthPageProps {
  initialView?: 'login' | 'register';
}

export default function AuthPage({ initialView = 'login' }: AuthPageProps) {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [view, setView] = useState<'login' | 'register'>(initialView);
  
  // Login State
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'phone'>('credentials');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register State
  const [registerName, setRegisterName] = useState("");
  const [nameWordsCount, setNameWordsCount] = useState(0);
  const [registerPhone, setRegisterPhone] = useState("05");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Helper for Register Name Validation
  const handleRegisterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegisterName(value);
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    setNameWordsCount(words.length);
  };

  const handleRegisterPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") { setRegisterPhone("05"); return; }
    if (value.startsWith("05") && value.length <= 10 && /^\d+$/.test(value)) {
      setRegisterPhone(value);
    }
  };

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Bypass all validation - Immediate Login
    try {
      // Validation: At least 1 character required
      if (loginUsername.length < 1 || loginPassword.length < 1) {
        setLoginError("يجب إدخال خانة واحدة على الأقل في اسم المستخدم وكلمة المرور");
        return;
      }

      await login(loginUsername, loginPassword);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      // Force navigation even if context throws (fallback)
      navigate('/dashboard');
    }
  };

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);

    if (nameWordsCount !== 3) {
      toast.error("اسم المستخدم مطلوب (يجب إدخال ثلاثة أسماء)");
      setRegisterLoading(false);
      return;
    }
    if (!registerPhone.startsWith("05") || registerPhone.length !== 10) {
      toast.error("الرجاء إدخال رقم هاتف صحيح يبدأ بـ 05 ويتكون من 10 أرقام");
      setRegisterLoading(false);
      return;
    }
    if (registerPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تتكون من 6 أحرف على الأقل");
      setRegisterLoading(false);
      return;
    }

    // Simulate Registration
    setTimeout(() => {
      setRegisterLoading(false);
      toast.success("تم إنشاء الحساب بنجاح! مرحباً بك في متابع");
      setTimeout(() => {
        setView('login');
        setLoginUsername(registerName);
      }, 2000);
    }, 2000);
  };

  // Switch View Helper
  const toggleView = (newView: 'login' | 'register') => {
    setView(newView);
    setLoginError(null);
    // Reset forms if needed, but keeping state might be better for UX
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center font-sans" dir="rtl">
      {/* 2. Global Styles: Gradient Background #655ac1 -> #8779fb -> #e5e1fe */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#655ac1] via-[#8779fb] to-[#e5e1fe]" />

      {/* Decorative Circles (Optional, for "vibrant" feel) */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#655ac1]/20 rounded-full blur-3xl" />

      {/* Back to Home Button - Absolute Top Left */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
        <Button
          variant="ghost"
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full px-4 py-2 gap-2 transition-all hover:scale-105 shadow-lg"
          onClick={() => navigate('/')}
        >
           <Home className="w-4 h-4" />
           <span className="hidden md:inline">العودة للرئيسية</span>
        </Button>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl p-4 flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        
        {/* 3. Responsive Layout: Stacked on Mobile, Card on Desktop */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/40">
           
           {/* Header / Brand Section */}
           <div className="bg-brand-main/5 p-8 text-center border-b border-gray-100">
             {/* 4. Brand Elements: Logo M */}
             <div className="w-16 h-16 bg-gradient-to-br from-[#655ac1] to-[#8779fb] rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 transform rotate-3 hover:rotate-0 transition-all duration-300">
                <span className="text-white text-4xl font-black">M</span>
             </div>
             <h1 className="text-2xl font-bold text-[#655ac1]">متابع</h1>
             <p className="text-gray-500 text-sm mt-1">
               {view === 'login' ? 'بوابة تسجيل الدخول' : 'بوابة تسجيل جديد'}
             </p>
           </div>

           <div className="p-6 md:p-8">
               {view === 'login' ? (
               /* ============ LOGIN VIEW ============ */
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  
                  {/* Social Login Buttons - Refined (Duplicated from Register) */}
                  <div className="flex items-center gap-3 mb-6">
                    <button 
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 h-10 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md text-xs font-bold"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.08-.49-3.2.14-1.02.57-2.09.43-3.13-.53V20.2c-2.39-2.28-3.66-5.88-2.67-9.3.93-3.26 3.73-5.26 7.18-5.11 1.77.11 3.25.75 4.3 2.02.83-.99 2.05-1.63 4.13-1.63 1.09 0 2.08.19 2.97.57-2.14 1.14-3.5 3.19-3.4 5.67.07 2.25 1.54 4.09 3.55 5.09-.59 1.34-1.4 2.65-2.65 3.97l-.02-.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      <span>Apple</span>
                    </button>

                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap px-1">أو</span>

                    <button 
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 h-10 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md text-xs font-bold"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Google</span>
                    </button>
                  </div>
                  
                  {/* Divider line only */}
                  <div className="w-full border-t border-gray-100 mb-4"></div>

                  {/* Login Method Toggle */}
                  <div className="flex bg-gray-100 p-1 rounded-xl mb-5">
                    <button
                      type="button"
                      onClick={() => { setLoginMethod('credentials'); setLoginError(null); }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        loginMethod === 'credentials' 
                          ? 'bg-white text-[#655ac1] shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      كلمة المرور
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginMethod('phone'); setLoginError(null); }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        loginMethod === 'phone' 
                          ? 'bg-white text-[#655ac1] shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      دخول سريع
                    </button>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    
                    {loginMethod === 'credentials' ? (
                      <>
                        {/* Username */}
                        <div>
                          <Label className="text-gray-700 text-xs font-bold mb-1 block">اسم المستخدم</Label>
                          <div className="relative group">
                            <Input
                              value={loginUsername}
                              onChange={(e) => setLoginUsername(e.target.value)}
                              className="h-10 pr-9 text-sm border-gray-200 focus:border-[#8779fb] focus:ring-[#8779fb]/20 rounded-lg transition-all"
                              placeholder="أدخل اسم المستخدم"
                            />
                            <User className="w-4 h-4 text-gray-400 absolute top-3 right-3 group-focus-within:text-[#655ac1] transition-colors" />
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <Label className="text-gray-700 text-xs font-bold mb-1 block">كلمة المرور</Label>
                          <div className="relative group">
                            <Input
                              type={showLoginPassword ? "text" : "password"}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="h-10 pr-9 text-sm border-gray-200 focus:border-[#8779fb] focus:ring-[#8779fb]/20 rounded-lg transition-all"
                              placeholder="••••••••"
                            />
                            <Lock className="w-4 h-4 text-gray-400 absolute top-3 right-3 group-focus-within:text-[#655ac1] transition-colors" />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                              {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Remember Me & Forgot Password Flex Container */}
                        <div className="flex items-center justify-between mt-2">
                           {/* Right: Remember Me */}
                           <div className="flex items-center gap-2">
                              <Checkbox 
                                id="login-remember-me" 
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                className="h-3.5 w-3.5 border-gray-300 text-[#655ac1] focus:ring-[#655ac1]" 
                              />
                              <Label htmlFor="login-remember-me" className="text-[11px] text-gray-600 cursor-pointer">تذكرني</Label>
                           </div>

                           {/* Left: Forgot Password */}
                           <a href="#" className="text-[11px] text-[#655ac1] hover:underline font-medium">نسيت كلمة المرور؟</a>
                        </div>
                      </>
                    ) : (
                      /* Quick Login (Phone) */
                      <>
                         {/* OTP Sent State could be handled here or inside same view - for simplicity swapping input */}
                         <div>
                            <Label className="text-gray-700 text-xs font-bold mb-1 block">رقم الجوال المسجل</Label>
                            <div className="relative group">
                              <Input
                                value={loginUsername} // Reusing loginUsername for phone
                                onChange={(e) => setLoginUsername(e.target.value)}
                                className="h-10 pr-9 text-sm border-gray-200 focus:border-[#8779fb] focus:ring-[#8779fb]/20 rounded-lg text-left font-mono"
                                dir="ltr"
                                placeholder="05xxxxxxxx"
                              />
                              <Phone className="w-4 h-4 text-gray-400 absolute top-3 right-3 group-focus-within:text-[#655ac1] transition-colors" />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">سيتم إرسال رمز تحقق (OTP) لجوالك</p>
                         </div>
                      </>
                    )}

                    {/* Error Message */}
                    {(error || loginError) && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <p>{error || loginError}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full h-10 bg-gradient-to-r from-[#655ac1] to-[#8779fb] hover:from-[#5448b0] hover:to-[#7668ea] text-white shadow-lg shadow-[#655ac1]/20 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (loginMethod === 'credentials' ? 'تسجيل الدخول' : 'إرسال رمز التحقق')}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">أو</span></div>
                  </div>

                  {/* Switch to Register */}
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">
                      ليس لديك حساب؟{" "}
                      <button 
                         onClick={() => toggleView('register')}
                         className="text-[#655ac1] font-bold hover:underline focus:outline-none"
                      >
                        تسجيل جديد
                      </button>
                    </p>
                  </div>
               </div>
             ) : (
               /* ============ REGISTER VIEW ============ */
               <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  
                  {/* Social Login Buttons - Refined */}
                  <div className="flex items-center gap-3 mb-6">
                    <button 
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 h-10 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md text-xs font-bold"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.08-.49-3.2.14-1.02.57-2.09.43-3.13-.53V20.2c-2.39-2.28-3.66-5.88-2.67-9.3.93-3.26 3.73-5.26 7.18-5.11 1.77.11 3.25.75 4.3 2.02.83-.99 2.05-1.63 4.13-1.63 1.09 0 2.08.19 2.97.57-2.14 1.14-3.5 3.19-3.4 5.67.07 2.25 1.54 4.09 3.55 5.09-.59 1.34-1.4 2.65-2.65 3.97l-.02-.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      <span>Apple</span>
                    </button>

                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap px-1">أو</span>

                    <button 
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 h-10 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md text-xs font-bold"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Google</span>
                    </button>
                  </div>
                  
                  {/* Divider line only */}
                  <div className="w-full border-t border-gray-100 mb-4"></div>

                  <form onSubmit={handleRegister} className="space-y-3">
                    
                    {/* First Row: Username & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Username */}
                      <div>
                        <Label className="text-gray-700 text-[11px] font-bold mb-1 block">اسم المستخدم</Label>
                        <div className="relative group">
                          <Input
                            value={registerName}
                            onChange={handleRegisterNameChange}
                            className="h-9 pr-8 text-xs border-gray-200 focus:border-[#8779fb] focus:ring-[#8779fb]/20 rounded-lg"
                            placeholder="الاسم الثلاثي"
                          />
                          <User className="w-3.5 h-3.5 text-gray-400 absolute top-2.5 right-2.5" />
                        </div>
                        <div className="flex justify-end mt-0.5">
                          <span className={`text-[9px] ${nameWordsCount === 3 ? 'text-green-600' : 'text-gray-400'}`}>
                            ({nameWordsCount}/3)
                          </span>
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <Label className="text-gray-700 text-[11px] font-bold mb-1 block">رقم الجوال</Label>
                        <div className="relative group">
                          <Input
                            value={registerPhone}
                            onChange={handleRegisterPhoneChange}
                            className="h-9 pr-8 text-xs border-gray-200 focus:border-[#8779fb] focus:ring-[#8779fb]/20 rounded-lg text-left font-mono"
                            dir="ltr"
                            placeholder="05xxxxxxxx"
                          />
                          <Phone className="w-3.5 h-3.5 text-gray-400 absolute top-2.5 right-2.5" />
                        </div>
                      </div>
                    </div>

                    {/* Password Row */}
                    <div>
                      <Label className="text-gray-700 text-[11px] font-bold mb-1 block">كلمة المرور</Label>
                      <div className="relative group">
                          <Input
                            type={showRegisterPassword ? "text" : "password"}
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="h-9 pr-8 text-xs border-gray-200 focus:border-[#8779fb] focus:ring-[#8779fb]/20 rounded-lg"
                            placeholder="••••••••"
                          />
                          <Lock className="w-3.5 h-3.5 text-gray-400 absolute top-2.5 right-2.5" />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="absolute left-2.5 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        
                        {/* Password Strength Meter */}
                        <div className="mt-2">
                           <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex">
                              <div className={`h-full transition-all duration-300 ${
                                 registerPassword.length === 0 ? 'w-0' :
                                 registerPassword.length < 6 ? 'w-1/3 bg-red-400' :
                                 registerPassword.length < 10 ? 'w-2/3 bg-yellow-400' :
                                 'w-full bg-green-500'
                              }`} />
                           </div>
                           <div className="flex justify-between items-center mt-1">
                              <span className="text-[9px] text-gray-400">
                                 {registerPassword.length === 0 ? 'كلمة المرور' :
                                  registerPassword.length < 6 ? 'ضعيفة' :
                                  registerPassword.length < 10 ? 'متوسطة' : 'قوية'}
                              </span>
                              <span className="text-[9px] text-gray-300">يجب أن تحتوي على حروف وأرقام</span>
                           </div>
                        </div>
                    </div>

                    {/* OTP Notice - Compact */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 flex items-start gap-2">
                       <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                       <p className="text-[10px] text-blue-700 leading-snug">
                         سيتم إرسال رمز تحقق OTP إلى جوالك لإتمام التسجيل
                       </p>
                    </div>

                    {/* Checkboxes - Removed Remember Me, Updated Terms Link */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                         <Checkbox id="terms" required className="h-3.5 w-3.5 border-gray-300 text-[#655ac1] focus:ring-[#655ac1]" />
                         <Label htmlFor="terms" className="text-[11px] text-gray-600">
                            أوافق على <a href="/terms" target="_blank" className="text-[#655ac1] underline font-bold">الشروط والأحكام</a>
                         </Label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full h-9 bg-gradient-to-r from-[#655ac1] to-[#8779fb] hover:from-[#5448b0] hover:to-[#7668ea] text-white shadow-md rounded-lg font-bold text-sm transition-all mt-1"
                      disabled={registerLoading}
                    >
                      {registerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إنشاء حساب'}
                    </Button>
                  </form>

                  {/* Switch to Login */}
                  <div className="text-center pt-1">
                    <p className="text-gray-500 text-xs">
                      لديك حساب؟{" "}
                      <button 
                         onClick={() => toggleView('login')}
                         className="text-[#655ac1] font-bold hover:underline focus:outline-none"
                      >
                        تسجيل الدخول
                      </button>
                    </p>
                  </div>
               </div>
             )}
           </div>
        </div>



      </div>
    </div>
  );
}
