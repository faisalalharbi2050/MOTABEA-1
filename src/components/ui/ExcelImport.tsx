import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from './progress';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { StudentExcelRow, StudentImportData, StudentImportResult, ImportValidationError } from '../../types/student';
import { Classroom } from '../../types/classroom';

interface ExcelImportProps {
  classrooms: Classroom[];
  schoolId: string;
  onImportComplete: (result: StudentImportResult) => void;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ classrooms, schoolId, onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<StudentExcelRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ImportValidationError[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // التحقق من نوع الملف
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      alert('يرجى اختيار ملف Excel صالح (.xlsx أو .xls)');
      return;
    }

    setFile(selectedFile);
    processExcelFile(selectedFile);
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(10);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      setProgress(30);

      // تحويل البيانات إلى JSON
      const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // تجاهل الصف الأول (العناوين) إذا كان موجوداً
      const dataRows = rawData.slice(1).filter(row => row.some(cell => cell));

      setProgress(50);

      // تحويل البيانات إلى تنسيق StudentExcelRow
      const studentData: StudentExcelRow[] = dataRows.map((row, index) => ({
        name: row[0]?.toString()?.trim() || '',
        grade_level: parseInt(row[1]?.toString()) || 0,
        section: row[2]?.toString()?.trim() || '',
        parent_phone: row[3]?.toString()?.trim() || ''
      }));

      setProgress(70);

      // التحقق من صحة البيانات
      const errors = validateStudentData(studentData);
      setValidationErrors(errors);
      setPreviewData(studentData.slice(0, 10)); // عرض أول 10 صفوف

      setProgress(100);
    } catch (error) {
      console.error('خطأ في معالجة الملف:', error);
      setValidationErrors([{
        row: 0,
        field: 'file',
        value: file.name,
        message: 'فشل في قراءة الملف. تأكد من أن الملف صالح وغير محمي.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateStudentData = (data: StudentExcelRow[]): ImportValidationError[] => {
    const errors: ImportValidationError[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 لأن المصفوفة تبدأ من 0 والصف الأول عناوين

      if (!row.name || row.name.length < 2) {
        errors.push({
          row: rowNumber,
          field: 'name',
          value: row.name,
          message: 'اسم الطالب مطلوب ويجب أن يحتوي على حرفين على الأقل'
        });
      }

      if (!row.grade_level || row.grade_level < 1 || row.grade_level > 12) {
        errors.push({
          row: rowNumber,
          field: 'grade_level',
          value: row.grade_level,
          message: 'رقم الصف يجب أن يكون بين 1 و 12'
        });
      }

      if (!row.section || row.section.length === 0) {
        errors.push({
          row: rowNumber,
          field: 'section',
          value: row.section,
          message: 'الفصل مطلوب'
        });
      }

      if (!row.parent_phone || !/^\d{10,15}$/.test(row.parent_phone.replace(/\s+/g, ''))) {
        errors.push({
          row: rowNumber,
          field: 'parent_phone',
          value: row.parent_phone,
          message: 'رقم الجوال يجب أن يحتوي على 10-15 رقم'
        });
      }

      // التحقق من وجود الفصل
      const className = `الصف ${row.grade_level} الفصل ${row.section}`;
      const matchingClass = classrooms.find(c => 
        c.name === className || 
        (c.gradeId && c.section === row.section)
      );

      if (!matchingClass) {
        errors.push({
          row: rowNumber,
          field: 'class_match',
          value: className,
          message: `لم يتم العثور على الفصل "${className}" في النظام`
        });
      }
    });

    return errors;
  };

  const handleImport = async () => {
    if (!file || validationErrors.length > 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // تحويل البيانات إلى StudentImportData
      const importData: StudentImportData[] = previewData.map(row => {
        const className = `الصف ${row.grade_level} الفصل ${row.section}`;
        const matchingClass = classrooms.find(c => c.name === className);
        
        return {
          ...row,
          class_id: matchingClass?.id,
          school_id: schoolId
        };
      });

      setProgress(25);

      // إرسال البيانات إلى الخادم
      const formData = new FormData();
      formData.append('students', JSON.stringify(importData));
      formData.append('school_id', schoolId);

      setProgress(50);

      const response = await fetch('/api/students/batch-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ students: importData })
      });

      setProgress(75);

      const result: StudentImportResult = await response.json();
      
      setProgress(100);
      onImportComplete(result);

    } catch (error) {
      console.error('خطأ في الاستيراد:', error);
      onImportComplete({
        success: false,
        imported_count: 0,
        failed_count: previewData.length,
        errors: [{
          row: 0,
          field: 'import',
          value: '',
          message: 'فشل في الاتصال بالخادم'
        }],
        needs_review: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    // إنشاء ملف Excel نموذجي
    const templateData = [
      ['اسم الطالب', 'رقم الصف', 'الفصل', 'الجوال'],
      ['أحمد محمد علي', '1', 'أ', '0501234567'],
      ['فاطمة أحمد سالم', '1', 'ب', '0507654321'],
      ['محمد عبدالله حسن', '2', 'أ', '0512345678']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الطلاب');
    
    XLSX.writeFile(wb, 'نموذج_استيراد_الطلاب.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* قسم تحميل الملف */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileSpreadsheet className="w-5 h-5 ml-2 text-green-600" />
              استيراد ملف Excel
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadTemplate}
              className="text-blue-600 hover:text-blue-700"
            >
              <Download className="w-4 h-4 ml-1" />
              تحميل نموذج
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>تعليمات مهمة:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• العمود الأول: اسم الطالب (مطلوب)</li>
                  <li>• العمود الثاني: رقم الصف (1-12)</li>
                  <li>• العمود الثالث: الفصل (أ، ب، ج...)</li>
                  <li>• العمود الرابع: رقم جوال ولي الأمر</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {file ? file.name : 'انقر لاختيار ملف Excel'}
              </p>
              <p className="text-gray-500">أو اسحب الملف إلى هنا</p>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>معالجة الملف...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* عرض الأخطاء */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <XCircle className="w-5 h-5 ml-2" />
              أخطاء في البيانات ({validationErrors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {validationErrors.slice(0, 10).map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                  <strong>الصف {error.row}:</strong> {error.message}
                  {error.value && <span className="text-gray-600"> (القيمة: {error.value})</span>}
                </div>
              ))}
              {validationErrors.length > 10 && (
                <p className="text-gray-500 text-sm">
                  ... و {validationErrors.length - 10} أخطاء أخرى
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* معاينة البيانات */}
      {previewData.length > 0 && validationErrors.length === 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-green-700">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 ml-2" />
                معاينة البيانات ({previewData.length} طلاب)
              </div>
              <Button 
                onClick={handleImport}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? 'جاري الاستيراد...' : 'بدء الاستيراد'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-right p-2 border">#</th>
                    <th className="text-right p-2 border">الاسم</th>
                    <th className="text-right p-2 border">الصف</th>
                    <th className="text-right p-2 border">الفصل</th>
                    <th className="text-right p-2 border">الجوال</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((student, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-2 border">{index + 1}</td>
                      <td className="p-2 border font-medium">{student.name}</td>
                      <td className="p-2 border">{student.grade_level}</td>
                      <td className="p-2 border">{student.section}</td>
                      <td className="p-2 border">{student.parent_phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.length > 10 && (
              <p className="text-gray-500 text-sm mt-2">
                يتم عرض أول 10 صفوف فقط من أصل {previewData.length} صفوف
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExcelImport;