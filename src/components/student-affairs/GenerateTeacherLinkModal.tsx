import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Send, Clock, Users, Check, AlertCircle, Ban, Play, Pause } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  classRoom: string;
  subject: string;
  isMainPeriod: boolean; // حصة أساسية أم انتظار
  phoneNumber: string;
  hasRecorded: boolean;
  recordedAt?: Date;
  isBlocked: boolean;
  linkId?: string;
}

interface GenerateTeacherLinkModalProps {
  onClose: () => void;
}

const GenerateTeacherLinkModal: React.FC<GenerateTeacherLinkModalProps> = ({ onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [linksGenerated, setLinksGenerated] = useState(false);
  const [linkExpiry, setLinkExpiry] = useState(45); // دقائق
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // ثواني
  const [isActive, setIsActive] = useState(true);

  const periods = [
    { value: '1', label: 'الحصة الأولى' },
    { value: '2', label: 'الحصة الثانية' },
    { value: '3', label: 'الحصة الثالثة' },
    { value: '4', label: 'الحصة الرابعة' },
    { value: '5', label: 'الحصة الخامسة' },
    { value: '6', label: 'الحصة السادسة' },
  ];

  // بيانات تجريبية للمعلمين
  const mockTeachers: Teacher[] = [
    {
      id: '1',
      name: 'أحمد محمد السالم',
      classRoom: 'الأول أ',
      subject: 'رياضيات',
      isMainPeriod: true,
      phoneNumber: '0501234567',
      hasRecorded: true,
      recordedAt: new Date(),
      isBlocked: false
    },
    {
      id: '2',
      name: 'محمد عبدالله الأحمد',
      classRoom: 'الثاني ب',
      subject: 'لغة عربية',
      isMainPeriod: true,
      phoneNumber: '0509876543',
      hasRecorded: false,
      isBlocked: false
    },
    {
      id: '3',
      name: 'خالد سعد العتيبي',
      classRoom: 'الثالث أ',
      subject: 'انتظار',
      isMainPeriod: false,
      phoneNumber: '0555555555',
      hasRecorded: true,
      recordedAt: new Date(),
      isBlocked: false
    },
    {
      id: '4',
      name: 'فهد ناصر القحطاني',
      classRoom: 'الرابع ج',
      subject: 'علوم',
      isMainPeriod: true,
      phoneNumber: '0544444444',
      hasRecorded: false,
      isBlocked: false
    },
    {
      id: '5',
      name: 'سلمان راشد المطيري',
      classRoom: 'الخامس أ',
      subject: 'انتظار',
      isMainPeriod: false,
      phoneNumber: '0533333333',
      hasRecorded: false,
      isBlocked: true
    }
  ];

  useEffect(() => {
    if (selectedPeriod) {
      // محاكاة جلب المعلمين من قاعدة البيانات
      setTeachers(mockTeachers);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    if (linksGenerated && isActive) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [linksGenerated, isActive]);

  const handleGenerateLinks = () => {
    const updatedTeachers = teachers.map(teacher => ({
      ...teacher,
      linkId: Math.random().toString(36).substring(7)
    }));
    setTeachers(updatedTeachers);
    setLinksGenerated(true);
    setTimeRemaining(linkExpiry * 60);
  };

  const handleSendAllLinks = () => {
    const activeTeachers = teachers.filter(t => !t.isBlocked);
    activeTeachers.forEach(teacher => {
      sendLinkViaWhatsApp(teacher);
    });
    alert(`تم إرسال ${activeTeachers.length} رابط عبر واتساب`);
  };

  const sendLinkViaWhatsApp = (teacher: Teacher) => {
    if (!teacher.linkId) return;
    
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/absence-link/${teacher.linkId}`;
    const message = `مرحباً الأستاذ ${teacher.name}\n\nرابط رصد الغياب للحصة ${selectedPeriod}\nالفصل: ${teacher.classRoom}\n\n${link}\n\nصالح لمدة ${linkExpiry} دقيقة\n\nمدرسة متابع النموذجية`;
    
    const whatsappUrl = `https://wa.me/${teacher.phoneNumber.replace(/^0/, '966')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleTeacherBlock = (teacherId: string) => {
    setTeachers(prev => prev.map(t => 
      t.id === teacherId ? { ...t, isBlocked: !t.isBlocked } : t
    ));
  };

  const toggleAllLinks = () => {
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const recordedCount = teachers.filter(t => t.hasRecorded).length;
  const totalCount = teachers.length;
  const recordedPercentage = totalCount > 0 ? (recordedCount / totalCount) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] p-6 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">إرسال روابط للمعلمين</h2>
                <p className="text-blue-100 text-sm">رصد الغياب حسب جدول الحصص والانتظار</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 font-kufi" style={{ direction: 'rtl' }}>
          {/* Period Selection */}
          {!linksGenerated && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر الحصة الدراسية
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all text-lg"
                >
                  <option value="">اختر الحصة</option>
                  {periods.map(period => (
                    <option key={period.value} value={period.value}>{period.label}</option>
                  ))}
                </select>
              </div>

              {selectedPeriod && teachers.length > 0 && (
                <>
                  {/* Link Expiry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 ml-1" />
                      مدة صلاحية الروابط (بالدقائق)
                    </label>
                    <select
                      value={linkExpiry}
                      onChange={(e) => setLinkExpiry(Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all"
                    >
                      <option value={15}>15 دقيقة</option>
                      <option value={30}>30 دقيقة</option>
                      <option value={45}>45 دقيقة</option>
                      <option value={60}>ساعة واحدة</option>
                    </select>
                  </div>

                  {/* Teachers Preview */}
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b-2 border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800">
                        المعلمون في الحصة {selectedPeriod} ({teachers.length})
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {teachers.map(teacher => (
                        <div
                          key={teacher.id}
                          className={`p-4 border-b border-gray-200 ${
                            teacher.isBlocked ? 'bg-red-50' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900">{teacher.name}</h4>
                              <p className="text-sm text-gray-600">
                                الفصل: {teacher.classRoom} | 
                                {teacher.isMainPeriod ? ` ${teacher.subject}` : ' انتظار'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                teacher.isMainPeriod
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {teacher.isMainPeriod ? 'حصة أساسية' : 'انتظار'}
                              </span>
                              <button
                                onClick={() => toggleTeacherBlock(teacher.id)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  teacher.isBlocked
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {teacher.isBlocked ? 'محظور' : 'فعّال'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateLinks}
                    className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-[#6366f1] to-[#818cf8] hover:from-[#4f46e5] hover:to-[#6366f1] shadow-lg hover:shadow-xl"
                  >
                    <LinkIcon className="h-6 w-6" />
                    توليد الروابط وإرسالها
                  </button>
                </>
              )}
            </div>
          )}

          {/* Links Generated - Tracking Table */}
          {linksGenerated && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-8 w-8 opacity-80" />
                    <span className="text-3xl font-bold">{totalCount}</span>
                  </div>
                  <p className="text-blue-100 text-sm">إجمالي المعلمين</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Check className="h-8 w-8 opacity-80" />
                    <span className="text-3xl font-bold">{recordedCount}</span>
                  </div>
                  <p className="text-green-100 text-sm">تم الرصد</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="h-8 w-8 opacity-80" />
                    <span className="text-3xl font-bold">{totalCount - recordedCount}</span>
                  </div>
                  <p className="text-orange-100 text-sm">لم يتم الرصد</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-8 w-8 opacity-80" />
                    <span className="text-3xl font-bold">{formatTime(timeRemaining)}</span>
                  </div>
                  <p className="text-purple-100 text-sm">الوقت المتبقي</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800">تقدم الرصد</h3>
                  <span className="text-2xl font-bold text-[#6366f1]">{recordedPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${recordedPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAllLinks}
                  className={`flex-1 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Pause className="h-5 w-5" />
                      إيقاف جميع الروابط
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      تفعيل جميع الروابط
                    </>
                  )}
                </button>

                <button
                  onClick={handleSendAllLinks}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  إعادة إرسال الروابط
                </button>
              </div>

              {/* Teachers Tracking Table */}
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">جدول متابعة المعلمين</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المعلم</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الفصل</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">النوع</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">حالة الرصد</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">وقت الرصد</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {teachers.map(teacher => (
                        <tr
                          key={teacher.id}
                          className={`transition-colors ${
                            teacher.isBlocked
                              ? 'bg-red-50'
                              : teacher.hasRecorded
                              ? 'bg-green-50'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-gray-900">{teacher.name}</p>
                              <p className="text-xs text-gray-500">{teacher.phoneNumber}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{teacher.classRoom}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              teacher.isMainPeriod
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {teacher.isMainPeriod ? 'أساسية' : 'انتظار'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {teacher.isBlocked ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                <Ban className="h-3 w-3 ml-1" />
                                محظور
                              </span>
                            ) : teacher.hasRecorded ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                <Check className="h-3 w-3 ml-1" />
                                تم الرصد
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                                <Clock className="h-3 w-3 ml-1" />
                                لم يتم الرصد
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {teacher.hasRecorded && teacher.recordedAt
                              ? teacher.recordedAt.toLocaleTimeString('ar-SA', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleTeacherBlock(teacher.id)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  teacher.isBlocked
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                              >
                                {teacher.isBlocked ? 'إلغاء الحظر' : 'حظر'}
                              </button>
                              {!teacher.isBlocked && (
                                <button
                                  onClick={() => sendLinkViaWhatsApp(teacher)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-xs font-bold"
                                  title="إرسال الرابط"
                                >
                                  <Send className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* New Link Button */}
              <button
                onClick={() => {
                  setLinksGenerated(false);
                  setSelectedPeriod('');
                  setTeachers([]);
                  setTimeRemaining(linkExpiry * 60);
                  setIsActive(true);
                }}
                className="w-full py-3 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f46e5] transition-all font-bold"
              >
                حصة جديدة
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateTeacherLinkModal;
