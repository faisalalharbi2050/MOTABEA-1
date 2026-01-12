import React from 'react';

interface AbsenceCommitmentFormProps {
  student: {
    name: string;
    studentId: string;
    classRoom: string;
    grade: string;
  };
  guardian: {
    name?: string;
    nationalId?: string;
    phone?: string;
  };
  absenceDays: number;
  date: string;
  schoolInfo?: {
    name: string;
    logo?: string;
    phone?: string;
  };
}

const AbsenceCommitmentForm: React.FC<AbsenceCommitmentFormProps> = ({
  student,
  guardian,
  absenceDays,
  date,
  schoolInfo = { 
    name: 'مدرسة متابع النموذجية'
  }
}) => {
  return (
    <div className="print-only" style={{ display: 'none' }}>
      <style>{`
        @media print {
          .print-only {
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
          body {
            font-family: 'Noto Kufi Arabic', 'Arial', sans-serif;
            direction: rtl;
            color: #000;
          }
          @page {
            size: A4;
            margin: 2cm;
          }
        }
      `}</style>

      <div style={{ 
        fontFamily: "'Noto Kufi Arabic', 'Arial', sans-serif",
        direction: 'rtl',
        padding: '40px',
        maxWidth: '210mm',
        margin: '0 auto',
        lineHeight: '1.8'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center',
          borderBottom: '3px solid #dc2626',
          paddingBottom: '20px',
          marginBottom: '40px'
        }}>
          {schoolInfo.logo && (
            <img 
              src={schoolInfo.logo} 
              alt="شعار المدرسة" 
              style={{ 
                height: '80px',
                marginBottom: '15px'
              }}
            />
          )}
          <h1 style={{ 
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#dc2626',
            margin: '10px 0'
          }}>
            {schoolInfo.name}
          </h1>
          {schoolInfo.phone && (
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '5px 0' }}>
              هاتف: {schoolInfo.phone}
            </p>
          )}
        </div>

        {/* رقم النموذج والتاريخ */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '30px',
          fontSize: '14px'
        }}>
          <div>
            <strong>رقم الخطاب:</strong> {Date.now().toString().slice(-6)}
          </div>
          <div>
            <strong>التاريخ:</strong> {new Date(date).toLocaleDateString('ar-SA', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* العنوان */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '40px',
          backgroundColor: '#fee2e2',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <h2 style={{ 
            fontSize: '26px',
            fontWeight: 'bold',
            color: '#991b1b',
            margin: '0'
          }}>
            خطاب تعهد ولي أمر طالب (الغياب)
          </h2>
        </div>

        {/* البيانات الأساسية */}
        <div style={{ 
          backgroundColor: '#f3f4f6',
          padding: '25px',
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#1f2937'
          }}>
            بيانات الطالب وولي الأمر:
          </h3>
          <table style={{ 
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <tbody>
              <tr>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderBottom: '1px solid #e5e7eb',
                  width: '40%'
                }}>
                  <strong>اسم الطالب:</strong>
                </td>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  {student.name}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <strong>رقم الطالب:</strong>
                </td>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  {student.studentId}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <strong>الصف والفصل:</strong>
                </td>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  {student.classRoom}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <strong>عدد أيام الغياب:</strong>
                </td>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#dc2626',
                  fontWeight: 'bold'
                }}>
                  {absenceDays} يوم
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <strong>اسم ولي الأمر:</strong>
                </td>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    borderBottom: '1px dotted #000',
                    minHeight: '25px',
                    paddingBottom: '5px'
                  }}>
                    {guardian.name || ''}
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <strong>رقم الهوية الوطنية:</strong>
                </td>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    borderBottom: '1px dotted #000',
                    minHeight: '25px',
                    paddingBottom: '5px'
                  }}>
                    {guardian.nationalId || ''}
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px'
                }}>
                  <strong>رقم الجوال:</strong>
                </td>
                <td style={{ 
                  padding: '12px',
                  fontSize: '16px'
                }}>
                  <div style={{ 
                    borderBottom: '1px dotted #000',
                    minHeight: '25px',
                    paddingBottom: '5px'
                  }}>
                    {guardian.phone || ''}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* نص التعهد */}
        <div style={{ 
          backgroundColor: '#fef3c7',
          padding: '30px',
          borderRadius: '10px',
          marginBottom: '30px',
          border: '3px solid #f59e0b'
        }}>
          <h3 style={{ 
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#92400e',
            textAlign: 'center'
          }}>
            نص التعهد
          </h3>
          <p style={{ 
            fontSize: '17px',
            lineHeight: '2.2',
            marginBottom: '20px',
            textAlign: 'justify'
          }}>
            أنا الموقع أدناه ولي أمر الطالب/ـة: <strong>{student.name}</strong> 
            بالصف: <strong>{student.classRoom}</strong>، أقر وأتعهد بما يلي:
          </p>
          <ol style={{ 
            fontSize: '17px',
            lineHeight: '2',
            paddingRight: '25px'
          }}>
            <li style={{ marginBottom: '15px' }}>
              بأن نجلي/نجلتي قد غاب/ـت عن المدرسة <strong style={{ color: '#dc2626' }}>({absenceDays})</strong> يوم دراسي.
            </li>
            <li style={{ marginBottom: '15px' }}>
              أتعهد بالحرص على انتظام نجلي/نجلتي في الدوام المدرسي وعدم تكرار الغياب.
            </li>
            <li style={{ marginBottom: '15px' }}>
              أتعهد بمتابعة نجلي/نجلتي يومياً والتأكد من حضوره/ـها للمدرسة في الموعد المحدد.
            </li>
            <li style={{ marginBottom: '15px' }}>
              أدرك أن تكرار الغياب قد يؤدي إلى اتخاذ إجراءات رسمية وفق اللوائح والأنظمة المعمول بها.
            </li>
            <li style={{ marginBottom: '15px' }}>
              أتعهد بالتواصل الفوري مع إدارة المدرسة في حال وجود أي ظروف طارئة.
            </li>
          </ol>
          <p style={{ 
            fontSize: '17px',
            lineHeight: '2',
            marginTop: '25px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#dc2626'
          }}>
            وأتحمل المسؤولية الكاملة عن ذلك أمام الله ثم أمام الجهات المختصة.
          </p>
        </div>

        {/* تحذير */}
        <div style={{ 
          backgroundColor: '#fee2e2',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          border: '2px solid #dc2626'
        }}>
          <p style={{ 
            fontSize: '16px',
            lineHeight: '1.8',
            margin: '0',
            color: '#991b1b',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            ⚠️ تنبيه: في حال تكرار الغياب بعد هذا التعهد، سيتم اتخاذ الإجراءات النظامية اللازمة
          </p>
        </div>

        {/* التوقيعات */}
        <div style={{ 
          marginTop: '50px'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '50px',
            marginBottom: '40px'
          }}>
            <div>
              <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                <strong>توقيع ولي الأمر:</strong>
              </p>
              <div style={{ 
                borderTop: '2px solid #000',
                paddingTop: '60px'
              }}></div>
            </div>
            <div>
              <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                <strong>التاريخ:</strong>
              </p>
              <div style={{ 
                borderTop: '2px solid #000',
                paddingTop: '60px'
              }}></div>
            </div>
          </div>

          <div style={{ 
            marginTop: '40px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
              <strong>اعتماد وكيل شؤون الطلاب</strong>
            </p>
            <div style={{ 
              borderTop: '2px solid #000',
              marginTop: '60px',
              width: '300px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}></div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '60px',
          paddingTop: '20px',
          borderTop: '2px solid #e5e7eb',
          textAlign: 'center',
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          <p>هذا الخطاب صادر من نظام متابع لإدارة المدارس</p>
          <p>تاريخ الطباعة: {new Date().toLocaleString('ar-SA')}</p>
          <p style={{ marginTop: '10px', fontSize: '11px' }}>
            ملاحظة: هذا الخطاب ساري المفعول ويحفظ في ملف الطالب
          </p>
        </div>
      </div>
    </div>
  );
};

export default AbsenceCommitmentForm;
