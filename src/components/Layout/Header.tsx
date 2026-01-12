import { useState, useEffect } from 'react';
import { Bell, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import UserProfileModal from '../Profile/UserProfileModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Timer for Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Dates
  const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  }).format(currentTime);

  const gregorianDate = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(currentTime);

  // Format Time (Custom for 'ص'/'م')
  const formatTimeCustom = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes}:${seconds} ${ampm}`;
  };

  // Existing formatTime helper for notifications
  const formatNotifTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'مساءً' : 'صباحاً';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${period}`;
  };

  // Existing getRelativeTime helper for notifications
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    if (hours > 0) return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    if (minutes > 0) return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
    return 'الآن';
  };

  // Existing getOperationIcon helper
  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'create': return '✨';
      case 'update': return '🔄';
      case 'delete': return '🗑️';
      case 'login': return '🔐';
      case 'logout': return '👋';
      default: return '📋';
    }
  };

  // Logout confirm handler
  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <header className="bg-white rounded-2xl p-4 px-6 shadow-sm border border-[#8779fb]/30 flex justify-between items-center mb-8 relative">
        {/* Right Section (Greeting) - In RTL this is Right */}
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-gray-500 text-xl" 
            onClick={onToggleSidebar}
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          <div className="flex flex-col gap-0.5">
            <h2 className="font-bold text-gray-800 text-lg md:text-xl flex items-center gap-2">
              <i className="fa-regular fa-user text-gray-500"></i>
              <span>مرحباً، {user?.name || 'مستخدم'} 👋</span>
            </h2>
          </div>
        </div>

        {/* Center Section (Date & Time) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-4 bg-gray-50 px-6 py-2 rounded-xl border border-gray-100">
           <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <i className="fa-regular fa-calendar text-gray-400"></i>
              <span>{gregorianDate}</span>
              <span className="text-gray-300 mx-1">|</span>
              <span>{hijriDate}</span>
           </div>
           <div className="h-4 w-px bg-gray-200"></div>
           <div className="flex items-center gap-2">
              <i className="fa-regular fa-clock text-[#655ac1]"></i>
              <span className="text-[#655ac1] font-bold font-mono text-sm tracking-widest" dir="ltr">
                {formatTimeCustom(currentTime)}
              </span>
           </div>
        </div>

        {/* Left Section (Actions) - In RTL this is Left */}
        <div className="flex items-center gap-4">
          {/* Notifications Trigger */}
          <div className="relative">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 hover:text-[#655ac1] hover:bg-[#e5e1fe] flex items-center justify-center transition relative"
            >
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                )}
                <i className="fa-regular fa-bell"></i>
            </button>

            {/* Notifications Dropdown (Re-integrated) */}
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] overflow-hidden" 
                   style={{top: '100%', left: '0', transform: 'translateX(-50%)', marginLeft: '20px'}}> 
                   {/* Adjust positioning for LTR/RTL or relative to button */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">سجل العمليات والإشعارات</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-brand-main hover:text-brand-dark font-medium"
                    >
                      تعليم الكل كمقروء
                    </button>
                  )}
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                          !notification.read ? 'bg-brand-light/30' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3 space-x-reverse">
                          <div className="text-2xl flex-shrink-0">
                            {getOperationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-brand-main rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-brand-main font-medium">
                                بواسطة: {notification.source}
                              </span>
                              <div className="flex items-center space-x-2 space-x-reverse text-gray-500">
                                <span>{formatNotifTime(notification.timestamp)}</span>
                                <span>•</span>
                                <span>{getRelativeTime(notification.timestamp)}</span>
                              </div>
                            </div>
                            {notification.module && (
                              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                                {notification.module}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">لا توجد إشعارات حالياً</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative mx-1"
            title="إعدادات الحساب"
          >
            <Settings className="h-6 w-6 text-gray-600" />
          </button>
          
          <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
          
          <button 
            className="hidden md:flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition font-bold text-sm"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <i className="fa-solid fa-arrow-right-from-bracket rotate-180"></i>
            <span>خروج</span>
          </button>
        </div>
      </header>

      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Logout Confirmation Dialog (Re-integrated) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">تأكيد تسجيل الخروج</h3>
              <p className="text-gray-600">هل أنت متأكد من رغبتك في تسجيل الخروج من النظام؟</p>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
              >
                نعم، تسجيل الخروج
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
