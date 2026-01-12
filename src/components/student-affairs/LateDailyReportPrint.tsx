import React from 'react';
import { LateRecord } from '../../utils/studentAffairsUtils';

interface LateDailyReportPrintProps {
  records: LateRecord[];
  date: string;
  schoolInfo?: {
    name: string;
    logo?: string;
  };
}

const LateDailyReportPrint: React.FC<LateDailyReportPrintProps> = ({
  records,
  date,
  schoolInfo = { name: 'مدرسة متابع النموذجية' }
}) => {
  const totalLate = records.length;
  const averageLateMinutes = totalLate > 0
    ? Math.round(records.reduce((sum, r) => sum + r.lateMinutes, 0) / totalLate)
    : 0;

  // تجميع حسب الفصل
  const byClass = records.reduce((acc, record) => {
    if (!acc[record.classRoom]) {
      acc[record.classRoom] = [];
    }
    acc[record.classRoom].push(record);
    return acc;
  }, {} as Record<string, LateRecord[]>);

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
        padding: '20px',
        maxWidth: '210mm',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center',
          borderBottom: '3px solid #4f46e5',
          paddingBottom: '20px',
          marginBottom: '30px'
        }}>
          {schoolInfo.logo && (
            <img 
              src={schoolInfo.logo} 
              alt="شعار المدرسة" 
              style={{ 
                height: '80px',
                marginBottom: '10px'
              }}
            />
          )}
          <h1 style={{ 
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#4f46e5',
            margin: '10px 0'
          }}>
            {schoolInfo.name}
          </h1>
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '10px 0'
          }}>
            تقرير التأخر اليومي
          </h2>
          <p style={{ 
            fontSize: '16px',
            color: '#6b7280',
            margin: '5px 0'
          }}>
            التاريخ: {new Date(date).toLocaleDateString('ar-SA', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* إحصائيات عامة */}
        <div style={{ 
          backgroundColor: '#f3f4f6',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#1f2937'
          }}>
            الإحصائيات العامة
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '15px'
          }}>
            <div style={{ 
              backgroundColor: '#fff',
              padding: '15px',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '5px'
              }}>
                إجمالي المتأخرين
              </p>
              <p style={{ 
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#dc2626'
              }}>
                {totalLate}
              </p>
            </div>
            <div style={{ 
              backgroundColor: '#fff',
              padding: '15px',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '5px'
              }}>
                متوسط التأخير
              </p>
              <p style={{ 
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#f59e0b'
              }}>
                {averageLateMinutes} دقيقة
              </p>
            </div>
            <div style={{ 
              backgroundColor: '#fff',
              padding: '15px',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '5px'
              }}>
                عدد الفصول
              </p>
              <p style={{ 
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#4f46e5'
              }}>
                {Object.keys(byClass).length}
              </p>
            </div>
          </div>
        </div>

        {/* جدول التفصيلي */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#1f2937'
          }}>
            القائمة التفصيلية
          </h3>
          <table style={{ 
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #e5e7eb'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#4f46e5', color: '#fff' }}>
                <th style={{ 
                  padding: '12px',
                  textAlign: 'right',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  #
                </th>
                <th style={{ 
                  padding: '12px',
                  textAlign: 'right',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  اسم الطالب
                </th>
                <th style={{ 
                  padding: '12px',
                  textAlign: 'right',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  الفصل
                </th>
                <th style={{ 
                  padding: '12px',
                  textAlign: 'right',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  وقت الحضور
                </th>
                <th style={{ 
                  padding: '12px',
                  textAlign: 'right',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  مقدار التأخير
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr 
                  key={record.id}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb'
                  }}
                >
                  <td style={{ 
                    padding: '10px',
                    textAlign: 'right',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px'
                  }}>
                    {index + 1}
                  </td>
                  <td style={{ 
                    padding: '10px',
                    textAlign: 'right',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {record.studentName}
                  </td>
                  <td style={{ 
                    padding: '10px',
                    textAlign: 'right',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px'
                  }}>
                    {record.classRoom}
                  </td>
                  <td style={{ 
                    padding: '10px',
                    textAlign: 'right',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                    fontFamily: 'monospace'
                  }}>
                    {record.arrivalTime}
                  </td>
                  <td style={{ 
                    padding: '10px',
                    textAlign: 'right',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#dc2626'
                  }}>
                    {record.lateMinutes} دقيقة
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* إحصائيات حسب الفصل */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#1f2937'
          }}>
            الإحصائيات حسب الفصل
          </h3>
          <table style={{ 
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #e5e7eb'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#6366f1', color: '#fff' }}>
                <th style={{ 
                  padding: '12px',
                  textAlign: 'right',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  الفصل
                </th>
                <th style={{ 
                  padding: '12px',
                  textAlign: 'right',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  عدد المتأخرين
                </th>
                <th style={{ 
                  padding: '12px',
                  textAlign: 'right',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  متوسط التأخير
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byClass).map(([className, classRecords], index) => {
                const avgLate = Math.round(
                  classRecords.reduce((sum, r) => sum + r.lateMinutes, 0) / classRecords.length
                );
                return (
                  <tr 
                    key={className}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb'
                    }}
                  >
                    <td style={{ 
                      padding: '10px',
                      textAlign: 'right',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {className}
                    </td>
                    <td style={{ 
                      padding: '10px',
                      textAlign: 'right',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px'
                    }}>
                      {classRecords.length}
                    </td>
                    <td style={{ 
                      padding: '10px',
                      textAlign: 'right',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#f59e0b'
                    }}>
                      {avgLate} دقيقة
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '2px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px'
          }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
                مسؤول الرصد:
              </p>
              <p style={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                borderBottom: '1px solid #000',
                paddingBottom: '5px',
                display: 'inline-block',
                minWidth: '200px'
              }}>
                &nbsp;
              </p>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
                التوقيع:
              </p>
              <p style={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                borderBottom: '1px solid #000',
                paddingBottom: '5px',
                display: 'inline-block',
                minWidth: '200px'
              }}>
                &nbsp;
              </p>
            </div>
          </div>
          <div style={{ 
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            <p>تم الطباعة بتاريخ: {new Date().toLocaleDateString('ar-SA')} - {new Date().toLocaleTimeString('ar-SA')}</p>
            <p>نظام متابع لإدارة المدارس</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LateDailyReportPrint;
