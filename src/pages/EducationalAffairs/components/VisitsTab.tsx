
import React, { useState } from 'react';
import { Plus, Eye, AlertTriangle, CheckCircle2, History } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { mockTeachers } from '../mockData';
import VisitModal from './VisitModal';

const VisitsTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  
  // History Modal State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyTeacher, setHistoryTeacher] = useState<any>(null);

  const getDaysSinceVisit = (lastVisit?: string) => {
    if (!lastVisit) return 999;
    return Math.floor((new Date().getTime() - new Date(lastVisit).getTime()) / (1000 * 3600 * 24));
  };

  const isVisitOverdue = (lastVisit?: string) => {
    return getDaysSinceVisit(lastVisit) > 30;
  };

  const handleOpenVisit = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleViewHistory = (teacher: any) => {
    setHistoryTeacher(teacher);
    setHistoryOpen(true);
  };

  const sortedTeachers = [...mockTeachers].sort((a, b) => {
     const daysA = getDaysSinceVisit(a.lastVisit);
     const daysB = getDaysSinceVisit(b.lastVisit);
     return daysB - daysA; // Show those with longest time since visit first (or never visited)
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
         <div>
            <h3 className="text-lg font-bold text-gray-800">أعمال المعلمين</h3>
            <p className="text-sm text-gray-500">متابعة الكتب والسجلات وتوثيق الملاحظات</p>
         </div>
         <Button 
           onClick={() => { setSelectedTeacher(null); setIsModalOpen(true); }}
           className="bg-[#4f46e5] hover:bg-[#4338ca] shadow-md shadow-indigo-100"
         >
            <Plus className="w-4 h-4 ml-2" />
            زيارة جديدة
         </Button>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-right font-bold text-gray-700">المعلم</th>
                <th className="px-6 py-4 text-right font-bold text-gray-700">التخصص</th>
                <th className="px-6 py-4 text-center font-bold text-gray-700">حالة الزيارات</th>
                <th className="px-6 py-4 text-center font-bold text-gray-700">تفاصيل الزيارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedTeachers.map((teacher) => {
                const daysSince = getDaysSinceVisit(teacher.lastVisit);
                const isOverdue = daysSince > 30;
                const neverVisited = daysSince === 999;
                
                return (
                  <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Teacher */}
                    <td className="px-6 py-4 font-medium text-gray-900 text-right">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                             {teacher.name.charAt(0)}
                          </div>
                          <span>{teacher.name}</span>
                       </div>
                    </td>
                    
                    {/* Subject */}
                    <td className="px-6 py-4 text-gray-600 text-right">{teacher.subject}</td>
                    
                    {/* Visit Status */}
                    <td className="px-6 py-4 text-center">
                       <div className="flex flex-col items-center gap-1">
                          {neverVisited ? (
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 flex items-center gap-1 px-3 py-1">
                              <AlertTriangle className="w-3 h-3" />
                              لم تتم زيارته
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-800">{teacher.visitCount || 0} زيارات</span>
                              {isOverdue && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs">
                                  منذ {daysSince} يوم
                                </Badge>
                              )}
                            </div>
                          )}
                       </div>
                    </td>
                    
                    {/* Details Action */}
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewHistory(teacher)}
                        className="text-[#4f46e5] hover:bg-indigo-50 hover:text-[#4338ca]"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        عرض التفاصيل
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Visit Modal */}
      <VisitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialTeacher={selectedTeacher}
      />

      {/* History Modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 mb-2">
              سجل زيارات المعلم: {historyTeacher?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="bg-white border rounded-lg overflow-hidden mt-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                   <th className="px-4 py-3 text-right font-bold text-gray-700">تاريخ الزيارة</th>
                   <th className="px-4 py-3 text-right font-bold text-gray-700">اليوم</th>
                   <th className="px-4 py-3 text-right font-bold text-gray-700">اسم الزائر</th>
                   <th className="px-4 py-3 text-right font-bold text-gray-700">نوع الزيارة</th>
                   <th className="px-4 py-3 text-right font-bold text-gray-700">التقييم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Mock Data for History */}
                {[1, 2].map((_, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">2024-12-{10 + idx}</td>
                    <td className="px-4 py-3 text-gray-700">{idx % 2 === 0 ? 'الثلاثاء' : 'الأربعاء'}</td>
                    <td className="px-4 py-3 text-gray-700">مدير المدرسة</td>
                    <td className="px-4 py-3 text-gray-700">كتب الطلاب</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">تميز</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(!historyTeacher?.visitCount && !historyTeacher?.lastVisit) && (
              <div className="p-8 text-center text-gray-400">
                 لا توجد زيارات سابقة لهذا المعلم
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
             <Button variant="outline" onClick={() => setHistoryOpen(false)}>إغلاق</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitsTab;
