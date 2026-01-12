import React, { useState } from 'react';
import { X, Link as LinkIcon, Send, Copy, Check, Clock, Users, Filter, Search } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  studentId: string;
  classRoom: string;
  grade: string;
}

interface GenerateAbsenceLinkModalProps {
  onClose: () => void;
}

const GenerateAbsenceLinkModal: React.FC<GenerateAbsenceLinkModalProps> = ({ onClose }) => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkExpiry, setLinkExpiry] = useState(45); // دقائق
  const [searchMode, setSearchMode] = useState<'class' | 'name'>('class');
  const [studentNameSearch, setStudentNameSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const classes = ['أ', 'ب', 'ج'];

  // بيانات تجريبية
  const mockStudents: Student[] = [
    { id: '1', name: 'أحمد محمد علي', studentId: '2024001', classRoom: 'الأول أ', grade: 'الأول' },
    { id: '2', name: 'محمد عبدالله', studentId: '2024002', classRoom: 'الأول أ', grade: 'الأول' },
    { id: '3', name: 'خالد سعد', studentId: '2024003', classRoom: 'الأول أ', grade: 'الأول' },
    { id: '4', name: 'عبدالرحمن أحمد', studentId: '2024004', classRoom: 'الأول أ', grade: 'الأول' },
    { id: '5', name: 'سعد فهد', studentId: '2024005', classRoom: 'الثاني ب', grade: 'الثاني' },
    { id: '6', name: 'فهد سلمان', studentId: '2024006', classRoom: 'الثاني ب', grade: 'الثاني' },
    { id: '7', name: 'سلمان ناصر', studentId: '2024007', classRoom: 'الثالث أ', grade: 'الثالث' },
    { id: '8', name: 'ناصر راشد', studentId: '2024008', classRoom: 'الثالث أ', grade: 'الثالث' },
  ];

  const getFilteredStudents = () => {
    if (searchMode === 'name') {
      return mockStudents.filter(s => 
        s.name.includes(studentNameSearch) || s.studentId.includes(studentNameSearch)
      );
    }
    
    if (searchMode === 'class' && selectedGrade && selectedClass && showAllStudents) {
      return mockStudents.filter(s => 
        s.grade === selectedGrade && s.classRoom.includes(selectedClass)
      );
    }
    
    return [];
  };

  const handleGenerateLink = () => {
    const linkId = Math.random().toString(36).substring(7);
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/absence-link/${linkId}`;
    setGeneratedLink(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const message = `رابط رصد الغياب اليومي:\n${generatedLink}\n\nصالح لمدة ${linkExpiry} دقيقة\n\nمدرسة متابع النموذجية`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const filteredStudents = getFilteredStudents();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-6 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <LinkIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">توليد رابط رصد الغياب</h2>
                <p className="text-blue-100 text-sm">رابط مؤقت للموظفين لإدخال الغياب</p>
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
          {/* Search Mode Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 bg-gray-100 p-2 rounded-xl">
              <button
                onClick={() => {
                  setSearchMode('class');
                  setStudentNameSearch('');
                  setSelectedStudents([]);
                }}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  searchMode === 'class'
                    ? 'bg-white text-[#4f46e5] shadow-md'
                    : 'text-gray-600 hover:bg-white hover:bg-opacity-50'
                }`}
              >
                <Filter className="inline h-5 w-5 ml-2" />
                البحث بالصف والفصل
              </button>
              <button
                onClick={() => {
                  setSearchMode('name');
                  setSelectedGrade('');
                  setSelectedClass('');
                  setShowAllStudents(false);
                  setSelectedStudentId('');
                }}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  searchMode === 'name'
                    ? 'bg-white text-[#4f46e5] shadow-md'
                    : 'text-gray-600 hover:bg-white hover:bg-opacity-50'
                }`}
              >
                <Search className="inline h-5 w-5 ml-2" />
                البحث بالاسم
              </button>
            </div>
          </div>

          {/* Class-based Search */}
          {searchMode === 'class' && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الصف</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => {
                      setSelectedGrade(e.target.value);
                      setSelectedClass('');
                      setShowAllStudents(false);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
                  >
                    <option value="">اختر الصف</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الفصل</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setShowAllStudents(false);
                    }}
                    disabled={!selectedGrade}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">اختر الفصل</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedGrade && selectedClass && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAllStudents(!showAllStudents)}
                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                      showAllStudents
                        ? 'bg-[#4f46e5] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Users className="inline h-5 w-5 ml-2" />
                    عرض جميع طلاب الفصل
                  </button>

                  <button
                    onClick={() => {
                      setShowAllStudents(false);
                      setSelectedStudentId('');
                    }}
                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                      !showAllStudents && selectedStudentId
                        ? 'bg-[#4f46e5] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    اختيار طالب واحد
                  </button>
                </div>
              )}

              {selectedGrade && selectedClass && !showAllStudents && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اختر الطالب</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
                  >
                    <option value="">اختر الطالب</option>
                    {mockStudents
                      .filter(s => s.grade === selectedGrade && s.classRoom.includes(selectedClass))
                      .map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name} - {student.studentId}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Name-based Search */}
          {searchMode === 'name' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline h-4 w-4 ml-1" />
                البحث بالاسم أو رقم الطالب
              </label>
              <input
                type="text"
                placeholder="اكتب اسم الطالب أو رقمه..."
                value={studentNameSearch}
                onChange={(e) => {
                  setStudentNameSearch(e.target.value);
                  setSelectedStudents([]);
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              />

              {studentNameSearch && filteredStudents.length > 0 && (
                <div className="mt-4 border-2 border-gray-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b-2 border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">
                      نتائج البحث ({filteredStudents.length})
                    </h3>
                  </div>
                  {filteredStudents.map(student => (
                    <div
                      key={student.id}
                      className={`p-4 border-b border-gray-200 transition-all cursor-pointer ${
                        selectedStudents.includes(student.id)
                          ? 'bg-blue-50 border-r-4 border-r-[#4f46e5]'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => toggleStudentSelection(student.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.classRoom} | {student.studentId}</p>
                        </div>
                        {selectedStudents.includes(student.id) && (
                          <div className="bg-[#4f46e5] text-white rounded-full p-2">
                            <Check className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Link Expiry */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 ml-1" />
              مدة صلاحية الرابط (بالدقائق)
            </label>
            <select
              value={linkExpiry}
              onChange={(e) => setLinkExpiry(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
            >
              <option value={15}>15 دقيقة</option>
              <option value={30}>30 دقيقة</option>
              <option value={45}>45 دقيقة</option>
              <option value={60}>ساعة واحدة</option>
              <option value={120}>ساعتان</option>
              <option value={240}>4 ساعات</option>
            </select>
          </div>

          {/* Generate Button */}
          {!generatedLink && (
            <button
              onClick={handleGenerateLink}
              disabled={
                searchMode === 'class'
                  ? !selectedGrade || !selectedClass || (!showAllStudents && !selectedStudentId)
                  : selectedStudents.length === 0
              }
              className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 ${
                (searchMode === 'class'
                  ? !selectedGrade || !selectedClass || (!showAllStudents && !selectedStudentId)
                  : selectedStudents.length === 0)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] shadow-lg hover:shadow-xl'
              }`}
            >
              <LinkIcon className="h-6 w-6" />
              توليد الرابط
            </button>
          )}

          {/* Generated Link */}
          {generatedLink && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-500 rounded-full p-3">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 mb-2">تم توليد الرابط بنجاح!</h3>
                    <div className="bg-white p-4 rounded-lg border border-green-200 mb-4">
                      <p className="text-sm text-gray-600 mb-2 font-mono break-all">{generatedLink}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Clock className="h-4 w-4" />
                      <span>صالح لمدة {linkExpiry} دقيقة</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-bold flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      تم النسخ!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      نسخ الرابط
                    </>
                  )}
                </button>

                <button
                  onClick={handleSendWhatsApp}
                  className="py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  إرسال عبر واتساب
                </button>
              </div>

              <button
                onClick={() => {
                  setGeneratedLink('');
                  setSelectedGrade('');
                  setSelectedClass('');
                  setShowAllStudents(false);
                  setSelectedStudentId('');
                  setStudentNameSearch('');
                  setSelectedStudents([]);
                }}
                className="w-full py-3 bg-[#4f46e5] text-white rounded-lg hover:bg-[#6366f1] transition-all font-bold"
              >
                توليد رابط جديد
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateAbsenceLinkModal;
