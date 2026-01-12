import React, { useRef, useState } from 'react';
import { X, Printer } from 'lucide-react';
import { DutyDayData, DutySettings } from '../../types/dailyDuty';

interface DailyDutyReportProps {
  isOpen: boolean;
  onClose: () => void;
  day: DutyDayData;
  settings: DutySettings;
  showGuardNames?: boolean;
}

const DailyDutyReport: React.FC<DailyDutyReportProps> = ({
  isOpen,
  onClose,
  day,
  settings,
  showGuardNames = true
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [hideGuardNames, setHideGuardNames] = useState(!showGuardNames);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>تقرير المناوبة اليومي - ${day.day} ${day.hijriDate}</title>
          <meta charset="utf-8">
          <style>
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              direction: rtl;
              text-align: right;
              padding: 15px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
              border-bottom: 2px solid #4f46e5;
              padding-bottom: 12px;
            }
            .header h1 {
              color: #4f46e5;
              font-size: 24px;
              margin: 0 0 10px 0;
              font-weight: bold;
            }
            .header-info {
              display: flex;
              justify-content: space-around;
              align-items: center;
              margin-top: 12px;
              font-size: 14px;
              flex-wrap: wrap;
            }
            .header-info-row {
              display: flex;
              justify-content: space-around;
              width: 100%;
              margin-top: 8px;
            }
            .header-info div {
              display: inline-block;
              margin: 0 15px;
            }
            .header-info strong {
              color: #4f46e5;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              font-size: 11px;
            }
            th {
              background-color: #4f46e5;
              color: white;
              padding: 8px;
              text-align: center;
              border: 1px solid #4f46e5;
              font-weight: bold;
            }
            td {
              padding: 6px;
              border: 1px solid #ddd;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .section-title {
              background-color: #818cf8;
              color: white;
              padding: 6px;
              margin-top: 10px;
              margin-bottom: 8px;
              font-weight: bold;
              font-size: 14px;
              border-radius: 5px;
            }
            .footer {
              margin-top: 15px;
              padding: 10px;
              background-color: #fef3c7;
              border: 2px solid #f59e0b;
              border-radius: 5px;
              text-align: center;
              font-weight: bold;
              font-size: 12px;
              color: #92400e;
            }
            .empty-row {
              height: 30px;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">تقرير المناوبة اليومي</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              title="طباعة"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* خيار إخفاء أسماء المناوبين */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hideGuardNames}
                onChange={(e) => setHideGuardNames(e.target.checked)}
                className="w-5 h-5 text-[#4f46e5] rounded focus:ring-[#4f46e5]"
              />
              <div>
                <span className="font-bold text-gray-800 text-sm">إخفاء أسماء المناوبين في التقرير المطبوع</span>
                <p className="text-xs text-gray-600 mt-1">
                  فعّل هذا الخيار لطباعة التقرير بدون أسماء المناوبين (لكتابتها يدوياً لاحقاً)
                </p>
              </div>
            </label>
          </div>

          <div ref={printRef} className="bg-white p-5 rounded-lg shadow-sm">
            {/* رأس التقرير */}
            <div className="header text-center mb-4 border-b-2 border-[#4f46e5] pb-3">
              <h1 className="text-2xl font-bold text-[#4f46e5] mb-2">تقرير المناوبة اليومي</h1>
              <div className="header-info flex justify-around text-sm mt-3">
                <div>
                  <strong className="text-[#4f46e5]">المدرسة:</strong> {localStorage.getItem('schoolName') || 'اسم المدرسة'}
                </div>
                <div>
                  <strong className="text-[#4f46e5]">الفصل الدراسي:</strong> {settings.semester}
                </div>
                <div>
                  <strong className="text-[#4f46e5]">العام الدراسي:</strong> {settings.academicYear}
                </div>
              </div>
              <div className="header-info-row flex justify-around text-sm mt-2">
                <div>
                  <strong className="text-[#4f46e5]">اليوم:</strong> {day.day}
                </div>
                <div>
                  <strong className="text-[#4f46e5]">التاريخ:</strong> {day.hijriDate} ({day.gregorianDate})
                </div>
              </div>
            </div>

            {/* الجدول 1: الموظف المناوب */}
            <div className="bg-[#818cf8] text-white py-2 px-3 mt-3 mb-2 rounded font-bold text-sm">الموظف المناوب</div>
            <table className="w-full border-collapse mb-4 text-xs">
              <thead>
                <tr className="bg-[#4f46e5] text-white">
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '10%' }}>م</th>
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '35%' }}>الاسم</th>
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '30%' }}>التوقيع</th>
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '25%' }}>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {day.dutyGuards.map((guard, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-2 text-center">{hideGuardNames ? '' : guard.name}</td>
                    <td className="border border-gray-300 p-2 text-center"></td>
                    <td className="border border-gray-300 p-2 text-center"></td>
                  </tr>
                ))}
                {/* إضافة صفوف فارغة إذا كان عدد المناوبين أقل من 3 */}
                {Array.from({ length: Math.max(0, 3 - day.dutyGuards.length) }).map((_, index) => (
                  <tr key={`empty-guard-${index}`} className={(day.dutyGuards.length + index) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 p-2 text-center">{day.dutyGuards.length + index + 1}</td>
                    <td className="border border-gray-300 p-2 text-center"></td>
                    <td className="border border-gray-300 p-2 text-center"></td>
                    <td className="border border-gray-300 p-2 text-center"></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* الجدول 2: الطلاب المتأخرون */}
            <div className="bg-[#818cf8] text-white py-2 px-3 mt-3 mb-2 rounded font-bold text-sm">الطلاب المتأخرون</div>
            <table className="w-full border-collapse mb-4 text-xs">
              <thead>
                <tr className="bg-[#4f46e5] text-white">
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '25%' }}>الاسم</th>
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '15%' }}>الصف</th>
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '15%' }}>وقت التأخر</th>
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '20%' }}>الإجراء</th>
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '25%' }}>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 p-2 h-8"></td>
                    <td className="border border-gray-300 p-2 h-8"></td>
                    <td className="border border-gray-300 p-2 h-8"></td>
                    <td className="border border-gray-300 p-2 h-8"></td>
                    <td className="border border-gray-300 p-2 h-8"></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* الجدول 3: الطلاب المخالفون */}
            <div className="bg-[#818cf8] text-white py-2 px-3 mt-3 mb-2 rounded font-bold text-sm">الطلاب المخالفون</div>
            <table className="w-full border-collapse mb-4 text-xs">
              <thead>
                <tr className="bg-[#4f46e5] text-white">
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '25%' }}>الاسم</th>
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '15%' }}>الصف</th>
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '25%' }}>المخالفة</th>
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '15%' }}>الإجراء</th>
                  <th className="border border-[#4f46e5] p-2 text-center" style={{ width: '20%' }}>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 p-2 h-8"></td>
                    <td className="border border-gray-300 p-2 h-8"></td>
                    <td className="border border-gray-300 p-2 h-8"></td>
                    <td className="border border-gray-300 p-2 h-8"></td>
                    <td className="border border-gray-300 p-2 h-8"></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* التذييل */}
            <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-center font-bold text-yellow-900 text-sm">
              📝 يُسلّم التقرير في اليوم التالي للمناوبة لوكيل الشؤون التعليمية
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-gray-100 px-6 py-4 rounded-b-xl flex gap-3 justify-start border-t-2 border-gray-300">
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white rounded-lg transition-all font-bold flex items-center gap-2 shadow-lg hover:shadow-xl text-sm"
          >
            <Printer className="w-4 h-4" />
            طباعة التقرير
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-bold text-sm"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyDutyReport;
