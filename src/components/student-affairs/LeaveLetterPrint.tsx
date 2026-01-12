import React from 'react';

interface LeaveLetterProps {
  student: {
    name: string;
    studentId: string;
    classRoom: string;
  };
  guardian: {
    name: string;
    phone: string;
  };
  destination: string;
  reason: string;
  date: string;
  time: string;
  schoolInfo?: {
    name: string;
    logo?: string;
    phone?: string;
  };
}

const LeaveLetterPrint: React.FC<LeaveLetterProps> = ({
  student,
  guardian,
  destination,
  reason,
  date,
  time,
  schoolInfo = { name: 'مدرسة متابع النموذجية' }
}) => {
  const arabicDate = new Date(date).toLocaleDateString('ar-SA', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="print-container">
      <style>{`
        @media screen {
          .print-container {
            display: none !important;
          }
        }
        
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print-container,
          .print-container * {
            visibility: visible !important;
          }
          
          .print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            page-break-after: always;
          }
          
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* صفحة خطاب الاستئذان */}
      <div style={{ 
        fontFamily: "'Noto Kufi Arabic', Arial, sans-serif",
        direction: 'rtl',
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box'
      }}>
        {/* الإطار الخارجي */}
        <div style={{
          border: '4px solid #4f46e5',
          borderRadius: '15px',
          padding: '30px',
          minHeight: '250mm'
        }}>
          {/* Header */}
          <div style={{ 
            textAlign: 'center',
            borderBottom: '3px solid #4f46e5',
            paddingBottom: '20px',
            marginBottom: '30px',
            backgroundColor: '#eff6ff',
            padding: '20px',
            borderRadius: '10px'
          }}>
            <h1 style={{ 
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#4f46e5',
              margin: '0 0 10px 0',
              textTransform: 'uppercase'
            }}>
              {schoolInfo.name}
            </h1>
            <div style={{
              width: '150px',
              height: '3px',
              backgroundColor: '#4f46e5',
              margin: '10px auto'
            }}></div>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              margin: '5px 0'
            }}>
              نظام إدارة شؤون الطلاب
            </p>
          </div>

          {/* معلومات الخطاب */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '30px',
            padding: '15px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#374151' }}>
              رقم الخطاب: <span style={{ color: '#4f46e5', fontFamily: 'monospace' }}>{Date.now().toString().slice(-8)}</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#374151' }}>
              التاريخ: <span style={{ color: '#4f46e5' }}>{arabicDate}</span>
            </div>
          </div>

          {/* العنوان */}
          <div style={{ 
            textAlign: 'center',
            marginBottom: '30px',
            backgroundColor: '#4f46e5',
            padding: '15px',
            borderRadius: '10px'
          }}>
            <h2 style={{ 
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: '0'
            }}>
              📄 نموذج استئذان طالب
            </h2>
          </div>

          {/* بيانات الطالب */}
          <div style={{
            backgroundColor: '#fef3c7',
            border: '3px solid #f59e0b',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '25px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#78350f',
              marginBottom: '15px',
              borderBottom: '2px solid #f59e0b',
              paddingBottom: '10px'
            }}>
              👤 بيانات الطالب
            </h3>
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <tbody>
                <tr>
                  <td style={{ 
                    padding: '12px 10px',
                    fontSize: '17px',
                    fontWeight: 'bold',
                    color: '#78350f',
                    width: '35%'
                  }}>
                    اسم الطالب:
                  </td>
                  <td style={{ 
                    padding: '12px 10px',
                    fontSize: '19px',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    {student.name}
                  </td>
                </tr>
                <tr style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                  <td style={{ 
                    padding: '12px 10px',
                    fontSize: '17px',
                    fontWeight: 'bold',
                    color: '#78350f'
                  }}>
                    رقم الطالب:
                  </td>
                  <td style={{ 
                    padding: '12px 10px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    fontFamily: 'monospace'
                  }}>
                    {student.studentId}
                  </td>
                </tr>
                <tr>
                  <td style={{ 
                    padding: '12px 10px',
                    fontSize: '17px',
                    fontWeight: 'bold',
                    color: '#78350f'
                  }}>
                    الصف والفصل:
                  </td>
                  <td style={{ 
                    padding: '12px 10px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    {student.classRoom}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* تفاصيل الاستئذان */}
          <div style={{
            border: '3px solid #4f46e5',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '25px'
          }}>
            <div style={{
              backgroundColor: '#4f46e5',
              padding: '12px 20px'
            }}>
              <h3 style={{
                fontSize: '19px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: 0
              }}>
                📅 تفاصيل الاستئذان
              </h3>
            </div>
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <tbody>
                <tr style={{ backgroundColor: '#eff6ff' }}>
                  <td style={{ 
                    padding: '15px 20px',
                    fontSize: '17px',
                    fontWeight: 'bold',
                    color: '#1e40af',
                    width: '35%',
                    borderBottom: '1px solid #bfdbfe'
                  }}>
                    📅 يوم وتاريخ الاستئذان
                  </td>
                  <td style={{ 
                    padding: '15px 20px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    borderBottom: '1px solid #bfdbfe'
                  }}>
                    {arabicDate}
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <td style={{ 
                    padding: '15px 20px',
                    fontSize: '17px',
                    fontWeight: 'bold',
                    color: '#1e40af',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    ⏰ وقت الخروج
                  </td>
                  <td style={{ 
                    padding: '15px 20px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    fontFamily: 'monospace',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    {time}
                  </td>
                </tr>
                {reason && (
                  <tr style={{ backgroundColor: '#eff6ff' }}>
                    <td style={{ 
                      padding: '15px 20px',
                      fontSize: '17px',
                      fontWeight: 'bold',
                      color: '#1e40af'
                    }}>
                      📝 سبب الاستئذان
                    </td>
                    <td style={{ 
                      padding: '15px 20px',
                      fontSize: '17px',
                      fontWeight: '500',
                      color: '#1f2937'
                    }}>
                      {reason}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* بيانات ولي الأمر */}
          <div style={{
            backgroundColor: '#dbeafe',
            border: '3px solid #3b82f6',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1e40af',
              marginBottom: '15px',
              borderBottom: '2px solid #3b82f6',
              paddingBottom: '10px'
            }}>
              👨‍👦 بيانات ولي الأمر
            </h3>
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <tbody>
                <tr>
                  <td style={{ 
                    padding: '12px 10px',
                    fontSize: '17px',
                    fontWeight: 'bold',
                    color: '#1e40af',
                    width: '35%'
                  }}>
                    اسم ولي الأمر:
                  </td>
                  <td style={{ 
                    padding: '12px 10px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    {guardian.name}
                  </td>
                </tr>
                <tr style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <td style={{ 
                    padding: '12px 10px',
                    fontSize: '17px',
                    fontWeight: 'bold',
                    color: '#1e40af'
                  }}>
                    جوال ولي الأمر:
                  </td>
                  <td style={{ 
                    padding: '12px 10px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    fontFamily: 'monospace',
                    direction: 'ltr',
                    textAlign: 'right'
                  }}>
                    {guardian.phone}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* التوقيعات */}
          <div style={{
            marginTop: '60px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ 
                fontSize: '17px',
                marginBottom: '60px',
                fontWeight: 'bold',
                color: '#4f46e5'
              }}>
                توقيع وكيل شؤون الطلاب
              </p>
              <div style={{
                borderTop: '3px solid #4f46e5',
                width: '80%',
                margin: '0 auto'
              }}></div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ 
                fontSize: '17px',
                marginBottom: '60px',
                fontWeight: 'bold',
                color: '#4f46e5'
              }}>
                ختم المدرسة
              </p>
              <div style={{
                width: '100px',
                height: '100px',
                border: '3px solid #4f46e5',
                borderRadius: '50%',
                margin: '0 auto'
              }}></div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '50px',
            paddingTop: '20px',
            borderTop: '2px solid #e5e7eb',
            textAlign: 'center',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <p style={{ margin: '5px 0' }}>هذا الخطاب صادر من نظام متابع لإدارة المدارس</p>
            <p style={{ margin: '5px 0' }}>تاريخ الطباعة: {new Date().toLocaleString('ar-SA')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveLetterPrint;
