import React from 'react';

interface ExitCardProps {
  student: {
    name: string;
    studentId: string;
    classRoom: string;
  };
  destination: string;
  date: string;
  time: string;
  schoolInfo?: {
    name: string;
    logo?: string;
  };
}

const ExitCardPrint: React.FC<ExitCardProps> = ({
  student,
  destination,
  date,
  time,
  schoolInfo = { name: 'مدرسة متابع النموذجية' }
}) => {
  const arabicDate = new Date(date).toLocaleDateString('ar-SA', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="print-container-card">
      <style>{`
        @media screen {
          .print-container-card {
            display: none !important;
          }
        }
        
        @media print {
          @page {
            size: A5 landscape;
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
          
          .print-container-card,
          .print-container-card * {
            visibility: visible !important;
          }
          
          .print-container-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            page-break-after: always;
          }
          
          html, body {
            width: 210mm !important;
            height: 148mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* بطاقة خروج الطالب */}
      <div style={{ 
        fontFamily: "'Noto Kufi Arabic', Arial, sans-serif",
        direction: 'rtl',
        width: '210mm',
        height: '148mm',
        padding: '10mm',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box'
      }}>
        {/* الإطار الخارجي */}
        <div style={{
          border: '5px solid #4f46e5',
          borderRadius: '15px',
          padding: '20px',
          height: '100%',
          position: 'relative',
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
        }}>
          {/* الزخرفة الخلفية */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '80px',
            color: '#dbeafe',
            fontWeight: 'bold',
            opacity: 0.4,
            zIndex: 0
          }}>
            بطاقة خروج
          </div>

          {/* المحتوى */}
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ 
              textAlign: 'center',
              borderBottom: '3px solid #4f46e5',
              paddingBottom: '12px',
              marginBottom: '15px',
              backgroundColor: '#4f46e5',
              margin: '-20px -20px 15px -20px',
              padding: '15px 20px',
              borderRadius: '10px 10px 0 0'
            }}>
              <h1 style={{ 
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: '0 0 8px 0'
              }}>
                {schoolInfo.name}
              </h1>
              <div style={{
                backgroundColor: '#ffffff',
                color: '#4f46e5',
                padding: '8px 25px',
                borderRadius: '25px',
                display: 'inline-block',
                fontSize: '20px',
                fontWeight: 'bold',
                border: '2px solid #ffffff'
              }}>
                🎫 بطاقة خروج طالب
              </div>
            </div>

            {/* معلومات البطاقة */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '15px'
            }}>
              <div style={{
                backgroundColor: '#eff6ff',
                padding: '12px 15px',
                borderRadius: '10px',
                border: '2px solid #4f46e5',
                textAlign: 'center'
              }}>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#1e40af',
                  marginBottom: '5px',
                  fontWeight: 'bold'
                }}>
                  رقم البطاقة
                </p>
                <p style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  #{Date.now().toString().slice(-6)}
                </p>
              </div>
              <div style={{
                backgroundColor: '#eff6ff',
                padding: '12px 15px',
                borderRadius: '10px',
                border: '2px solid #4f46e5',
                textAlign: 'center'
              }}>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#1e40af',
                  marginBottom: '5px',
                  fontWeight: 'bold'
                }}>
                  الوقت
                </p>
                <p style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  {time}
                </p>
              </div>
            </div>

            {/* التاريخ */}
            <div style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '15px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📅 {arabicDate}
            </div>

            {/* بيانات الطالب */}
            <div style={{
              backgroundColor: '#fef3c7',
              border: '3px solid #f59e0b',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '12px',
              flex: '1'
            }}>
              <table style={{ 
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <tbody>
                  <tr>
                    <td style={{ 
                      padding: '10px 5px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#78350f',
                      width: '35%'
                    }}>
                      👤 اسم الطالب
                    </td>
                    <td style={{ 
                      padding: '10px 5px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#1f2937'
                    }}>
                      {student.name}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      padding: '10px 5px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#78350f'
                    }}>
                      🆔 رقم الطالب
                    </td>
                    <td style={{ 
                      padding: '10px 5px',
                      fontSize: '17px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      fontFamily: 'monospace'
                    }}>
                      {student.studentId}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      padding: '10px 5px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#78350f'
                    }}>
                      🏫 الصف والفصل
                    </td>
                    <td style={{ 
                      padding: '10px 5px',
                      fontSize: '17px',
                      fontWeight: 'bold',
                      color: '#1f2937'
                    }}>
                      {student.classRoom}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* رسالة السماح بالخروج */}
            <div style={{
              backgroundColor: '#dcfce7',
              border: '4px solid #22c55e',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(34, 197, 94, 0.2)'
            }}>
              <div style={{
                fontSize: '50px',
                marginBottom: '10px'
              }}>
                ✅
              </div>
              <p style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#166534',
                margin: '0 0 8px 0',
                lineHeight: '1.6'
              }}>
                يُسمح للطالب بالخروج من المدرسة
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#15803d',
                margin: 0
              }}>
                يرجى السماح للطالب بمغادرة المبنى المدرسي
              </p>
            </div>

            {/* الاعتماد والتوقيع */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '3px solid #4f46e5',
              borderRadius: '15px',
              padding: '20px',
              marginTop: 'auto'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '15px'
              }}>
                <p style={{ 
                  fontSize: '16px',
                  color: '#1e40af',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  ✍️ اعتماد وتوقيع وكيل شؤون الطلاب
                </p>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '15px',
                alignItems: 'end'
              }}>
                <div style={{
                  textAlign: 'center'
                }}>
                  <div style={{
                    height: '60px',
                    marginBottom: '8px'
                  }}></div>
                  <div style={{
                    borderTop: '3px solid #4f46e5',
                    paddingTop: '8px'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#1e40af',
                      margin: 0
                    }}>
                      التوقيع
                    </p>
                  </div>
                </div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  border: '4px solid #4f46e5',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#4f46e5',
                  fontWeight: 'bold',
                  backgroundColor: '#ffffff',
                  textAlign: 'center',
                  lineHeight: '1.3'
                }}>
                  ختم<br/>المدرسة
                </div>
                <div style={{
                  textAlign: 'center'
                }}>
                  <div style={{
                    height: '60px',
                    marginBottom: '8px'
                  }}></div>
                  <div style={{
                    borderTop: '3px solid #4f46e5',
                    paddingTop: '8px'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#1e40af',
                      margin: 0
                    }}>
                      التاريخ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ملاحظة مهمة */}
            <div style={{
              marginTop: '15px',
              textAlign: 'center',
              fontSize: '13px',
              color: '#dc2626',
              fontWeight: 'bold',
              backgroundColor: '#fee2e2',
              padding: '10px',
              borderRadius: '8px',
              border: '2px solid #dc2626'
            }}>
              ⚠️ يُرجى تسليم هذه البطاقة للحارس عند البوابة الرئيسية
            </div>
          </div>

          {/* QR Code */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            width: '55px',
            height: '55px',
            backgroundColor: '#ffffff',
            border: '3px solid #4f46e5',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#4f46e5',
            textAlign: 'center',
            fontWeight: 'bold',
            zIndex: 2,
            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)'
          }}>
            QR<br/>CODE
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitCardPrint;
