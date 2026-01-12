
import React, { useState, useMemo } from 'react';
import { Search, Send, UserX, AlertTriangle, Check, Save } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { mockTeachers } from '../mockData';

type PreparationState = 'PREPARED' | 'NOT_PREPARED';
type ActionType = 'NONE' | 'ABSENT' | 'DEFECT' | 'ALERT_SENT';

interface TeacherState {
  preparation: PreparationState;
  action: ActionType;
}

const PreparationTab = () => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherStates, setTeacherStates] = useState<Record<string, TeacherState>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Initialize state helper
  const getTeacherState = (id: string): TeacherState => {
    return teacherStates[id] || { preparation: 'PREPARED', action: 'NONE' };
  };

  const updateTeacherState = (id: string, updates: Partial<TeacherState>) => {
    setTeacherStates(prev => ({
      ...prev,
      [id]: { ...getTeacherState(id), ...updates }
    }));
    setIsSaved(false);
  };

  // Dropdown Search Logic
  const filteredDropdownTeachers = mockTeachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = useMemo(() => {
    if (selectedTeacherId !== 'all') {
      return mockTeachers.filter(t => t.id === selectedTeacherId);
    }
    return mockTeachers;
  }, [selectedTeacherId]);

  const generateWhatsAppLink = (teacher: any) => {
    const today = new Date().toLocaleDateString('ar-SA');
    const message = `المعلم الفاضل ${teacher.name}،\nلديكم حصص لم يتم تحضيرها هذا اليوم ${today} في منصة مدرستي.\nنأمل الاهتمام بذلك وشكراً.`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const handleBulkAlert = () => {
    const nonPrepared = mockTeachers.filter(t => {
      const state = getTeacherState(t.id);
      return state.preparation === 'NOT_PREPARED' && state.action === 'NONE';
    });

    if (nonPrepared.length === 0) {
      alert('لا يوجد معلمين غير محضرين يحتاجون لتنبيه');
      return;
    }

    const confirmMsg = `سيتم إرسال تنبيه لـ ${nonPrepared.length} معلم غير محضر. هل أنت متأكد؟`;
    if (window.confirm(confirmMsg)) {
      // Simulation of bulk send
      alert(`تم إرسال التنبيهات بنجاح إلى: \n${nonPrepared.map(t => t.name).join('\n')}`);
      
      // Update states to ALERT_SENT
      const newStates = { ...teacherStates };
      nonPrepared.forEach(t => {
        newStates[t.id] = { ...getTeacherState(t.id), action: 'ALERT_SENT' };
      });
      setTeacherStates(newStates);
    }
  };

  const handleSave = () => {
    // Simulate API save
    setTimeout(() => {
      setIsSaved(true);
      alert('تم حفظ البيانات بنجاح');
    }, 500);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Controls Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">بحث عن معلم</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between text-right font-normal">
                  {selectedTeacherId === 'all' ? 'عرض الجميع' : mockTeachers.find(t => t.id === selectedTeacherId)?.name || 'اختر معلم'}
                  <Search className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px] max-h-[300px] overflow-y-auto" align="end">
                <div className="p-2 sticky top-0 bg-white border-b z-10">
                  <Input 
                    placeholder="بحث في القائمة..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8"
                  />
                </div>
                <DropdownMenuItem onClick={() => setSelectedTeacherId('all')} className="justify-end cursor-pointer font-bold">
                  عرض الجميع
                </DropdownMenuItem>
                {filteredDropdownTeachers.map(teacher => (
                  <DropdownMenuItem 
                    key={teacher.id} 
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    className="justify-end cursor-pointer"
                  >
                    {teacher.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-end self-end">
            <Button 
              onClick={handleBulkAlert}
              className="bg-[#4f46e5] text-white hover:bg-[#4338ca] shadow-md transition-all font-bold"
            >
              <Send className="w-4 h-4 ml-2" />
              إرسال تنبيه للغير محضرين
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-right font-bold text-gray-700">المعلم</th>
                <th className="px-6 py-4 text-right font-bold text-gray-700">التخصص</th>
                <th className="px-6 py-4 text-center font-bold text-gray-700">التحضير</th>
                <th className="px-6 py-4 text-center font-bold text-gray-700 w-1/3">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeachers.map((teacher) => {
                const state = getTeacherState(teacher.id);
                const isPrepared = state.preparation === 'PREPARED';

                return (
                  <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Teacher Info */}
                    <td className="px-6 py-4 font-medium text-gray-900 text-right">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-50">
                             {teacher.name.charAt(0)}
                          </div>
                          <span>{teacher.name}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-right">{teacher.subject}</td>
                    
                    {/* Preparation Toggle */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="bg-gray-100 p-1 rounded-lg flex items-center shadow-inner">
                          <button
                             onClick={() => updateTeacherState(teacher.id, { preparation: 'PREPARED', action: 'NONE' })}
                             className={`
                               px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200
                               ${isPrepared 
                                 ? 'bg-green-500 text-white shadow-sm' 
                                 : 'text-gray-500 hover:text-gray-700'}
                             `}
                          >
                            محضّر
                          </button>
                          <button
                             onClick={() => updateTeacherState(teacher.id, { preparation: 'NOT_PREPARED' })}
                             className={`
                               px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200
                               ${!isPrepared 
                                 ? 'bg-red-500 text-white shadow-sm' 
                                 : 'text-gray-500 hover:text-gray-700'}
                             `}
                          >
                            لم يحضّر
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      {!isPrepared ? (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(generateWhatsAppLink(teacher), '_blank')}
                            className="h-8 text-xs border-green-200 text-green-700 hover:bg-green-50"
                          >
                            <Send className="w-3 h-3 ml-1" />
                            تنبيه
                          </Button>
                          
                          <Button
                            size="sm"
                            variant={state.action === 'ABSENT' ? 'default' : 'outline'}
                            onClick={() => updateTeacherState(teacher.id, { action: state.action === 'ABSENT' ? 'NONE' : 'ABSENT' })}
                            className={`h-8 text-xs ${state.action === 'ABSENT' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 text-red-700 hover:bg-red-50'}`}
                          >
                            <UserX className="w-3 h-3 ml-1" />
                            غائب
                          </Button>

                          <Button
                            size="sm"
                            variant={state.action === 'DEFECT' ? 'default' : 'outline'}
                            onClick={() => updateTeacherState(teacher.id, { action: state.action === 'DEFECT' ? 'NONE' : 'DEFECT' })}
                            className={`h-8 text-xs ${state.action === 'DEFECT' ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-200 text-orange-700 hover:bg-orange-50'}`}
                          >
                            <AlertTriangle className="w-3 h-3 ml-1" />
                            خلل
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-300 text-xs">-</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Footer / Save - MOVED TO RIGHT (RTL: Flex Start or Justify Start? User said "Bottom Right". In RTL, right is "Start". Left is "End". So user probably means physically Right side.) 
           RTL layout:
           Start = Right. End = Left.
           "Bottom Right" visually (Arabic reading start) means Right.
           So `justify-start` in RTL flex container.
           Or user means "Bottom Left" (English Right)?
           Usually Arabic users mean "Right" as in "Start of line".
           Wait. The previous code was `justify-end` (Left in RTL).
           User said: "Change from bottom left to bottom right".
           In RTL, `justify-end` is Left. `justify-start` is Right.
           So I should use `justify-start`.
        */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-start">
          <Button 
            onClick={handleSave} 
            disabled={isSaved}
            className={`min-w-[150px] font-bold shadow-md transition-all ${
              isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-[#4f46e5] hover:bg-[#4338ca]'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-5 h-5 ml-2" />
                تم الحفظ
              </>
            ) : (
              <>
                <Save className="w-5 h-5 ml-2" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreparationTab;
