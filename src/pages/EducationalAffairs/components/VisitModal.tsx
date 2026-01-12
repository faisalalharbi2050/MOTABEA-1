
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { mockTeachers } from '../mockData';
import { VisitType, VisitExecutionStatus, VisitNoteType } from '../../../types/educational-affairs';
import { Save, Check, Calendar as CalendarIcon, User, X } from 'lucide-react';

interface VisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTeacher?: any;
}

const VisitModal: React.FC<VisitModalProps> = ({ isOpen, onClose, initialTeacher }) => {
  const [teacherId, setTeacherId] = useState<string>('');
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [visitorRole, setVisitorRole] = useState<string>('');
  
  const [itemsType, setItemsType] = useState<VisitType>('STUDENT_BOOKS');
  const [status, setStatus] = useState<VisitExecutionStatus>('FULL');
  const [noteType, setNoteType] = useState<VisitNoteType>('DISTINCTION');
  const [note, setNote] = useState('');
  
  // Mapping Roles to Names as requested
  // "When choosing Principal (etc), his name appears directly"
  // Assuming we simulate this mapping here.
  const visitorMapping: Record<string, string> = {
    "مدير المدرسة": "أ. عبدالله محمد السلمي",
    "وكيل الشؤون التعليمية": "أ. أحمد سالم القحطاني",
    "وكيل شؤون الطلاب": "أ. فهد عبدالعزيز المطيري",
    "وكيل الشؤون المدرسية": "أ. محمد عبدالله الشهري"
  };

  const visitors = Object.keys(visitorMapping);

  useEffect(() => {
    if (isOpen) {
      if (initialTeacher) {
        setTeacherId(initialTeacher.id);
      } else {
        setTeacherId('');
      }
      setVisitDate(new Date().toISOString().split('T')[0]);
      setVisitorRole('');
      setItemsType('STUDENT_BOOKS');
      setStatus('FULL');
      setNoteType('DISTINCTION');
      setNote('');
    }
  }, [isOpen, initialTeacher]);

  const handleSubmit = () => {
    if (!teacherId || !visitorRole) {
      alert('الرجاء إكمال البيانات المطلوبة');
      return;
    }
    const visitorName = visitorMapping[visitorRole];
    console.log({ teacherId, visitDate, visitorName, itemsType, status, noteType, note });
    alert('تم حفظ الزيارة بنجاح');
    onClose();
  };

  const SelectionButton = ({ 
    active, 
    onClick, 
    children, 
    colorClass = "bg-[#4f46e5] text-white shadow-md transform scale-105",
    baseClass = "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
  }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 px-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${active ? colorClass : baseClass}`}
    >
      {active && <Check className="w-4 h-4" />}
      {children}
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-5 rounded-3xl" dir="rtl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <span className="bg-[#4f46e5]/10 p-2 rounded-lg text-[#4f46e5]">
              <Save className="w-4 h-4" />
            </span>
            تسجيل زيارة
          </DialogTitle>
        </DialogHeader>
        
        {/* Added padding wrapper to prevent clipping */}
        <div className="space-y-4 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Teacher Selection */}
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-bold text-sm">المعلم</Label>
              <Select value={teacherId} onValueChange={setTeacherId} disabled={!!initialTeacher}>
                <SelectTrigger className="bg-gray-50 border-gray-200 h-9 text-sm">
                  <SelectValue placeholder="اختر المعلم" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeachers.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-right text-sm">{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Visit Date */}
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-bold text-sm">تاريخ الزيارة</Label>
              <Input 
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="bg-gray-50 border-gray-200 h-9 text-right text-sm" 
              />
            </div>
          </div>

          {/* Visitor Name with Auto-Populate */}
          <div className="space-y-1.5">
            <Label className="text-gray-700 font-bold text-sm">اسم الزائر</Label>
            <div className="grid grid-cols-1 gap-2">
              <Select value={visitorRole} onValueChange={setVisitorRole}>
                <SelectTrigger className="bg-gray-50 border-gray-200 h-9 text-sm">
                  <SelectValue placeholder="اختر القائم بالزيارة" />
                </SelectTrigger>
                <SelectContent>
                  {visitors.map(v => (
                    <SelectItem key={v} value={v} className="text-right text-sm">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Show Name Directly */}
              {visitorRole && (
                <div className="bg-blue-50 text-blue-700 p-2 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-1 fade-in">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-bold text-sm">{visitorMapping[visitorRole]}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 my-2"></div>

          {/* Visit Type */}
          <div className="space-y-1.5">
            <Label className="text-gray-700 font-bold text-sm">نوع المتابعة</Label>
            <div className="flex flex-wrap gap-2">
               <SelectionButton 
                 active={itemsType === 'STUDENT_BOOKS'} 
                 onClick={() => setItemsType('STUDENT_BOOKS')}
               >
                 كتب الطلاب
               </SelectionButton>
               <SelectionButton 
                 active={itemsType === 'FOLLOWUP_RECORD'} 
                 onClick={() => setItemsType('FOLLOWUP_RECORD')}
               >
                 سجل المتابعة
               </SelectionButton>
               <SelectionButton 
                 active={itemsType === 'OTHER'} 
                 onClick={() => setItemsType('OTHER')}
               >
                 أخرى
               </SelectionButton>
            </div>
          </div>

          {/* Execution Status */}
          <div className="space-y-1.5">
            <Label className="text-gray-700 font-bold text-sm">حالة التنفيذ</Label>
            <div className="grid grid-cols-2 gap-2">
               <SelectionButton 
                 active={status === 'FULL'} 
                 onClick={() => setStatus('FULL')}
                 colorClass="bg-green-600 text-white shadow-md transform scale-105"
               >
                 مفعل بالكامل
               </SelectionButton>
               <SelectionButton 
                 active={status === 'PARTIAL'} 
                 onClick={() => setStatus('PARTIAL')}
                 colorClass="bg-yellow-500 text-white shadow-md transform scale-105"
               >
                 مفعل جزئياً
               </SelectionButton>
               <SelectionButton 
                 active={status === 'NONE'} 
                 onClick={() => setStatus('NONE')}
                 colorClass="bg-red-500 text-white shadow-md transform scale-105"
               >
                 غير مفعل
               </SelectionButton>
               <SelectionButton 
                 active={status === 'NOT_AVAILABLE'} 
                 onClick={() => setStatus('NOT_AVAILABLE')}
                 colorClass="bg-red-600 text-white shadow-md transform scale-105"
               >
                 غير متوفر
               </SelectionButton>
            </div>
          </div>

          {/* Note Type */}
          <div className="space-y-1.5">
            <Label className="text-gray-700 font-bold text-sm">نوع الملاحظة</Label>
            <div className="flex gap-2">
               <SelectionButton 
                 active={noteType === 'DISTINCTION'} 
                 onClick={() => setNoteType('DISTINCTION')}
                 colorClass="bg-[#6366f1] text-white shadow-md"
               >
                 تميز 🌟
               </SelectionButton>
               <SelectionButton 
                 active={noteType === 'IMPROVEMENT'} 
                 onClick={() => setNoteType('IMPROVEMENT')}
                 colorClass="bg-orange-500 text-white shadow-md"
               >
                 تحسين ⚠️
               </SelectionButton>
            </div>
          </div>

          {/* Note Text */}
          <div className="space-y-1.5">
            <Label className="text-gray-700 font-bold text-sm">تفاصيل الملاحظة</Label>
            <Textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب ملاحظاتك هنا..."
              className="resize-none h-20 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-sm"
            />
          </div>
        </div>

        {/* Footer Buttons - Moved to Right (Start of line in RTL) */}
        <DialogFooter className="gap-2 sm:gap-0 mt-4 pt-4 border-t border-gray-100 flex-row overflow-hidden justify-start sm:justify-start">
           {/* justify-start in RTL puts items on the Right side. */}
          <Button onClick={handleSubmit} className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 h-9 text-sm">
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
          <Button variant="outline" onClick={onClose} className="hover:bg-gray-100 border-gray-300 h-9 text-sm">
             <X className="w-4 h-4 ml-2" />
             إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VisitModal;
