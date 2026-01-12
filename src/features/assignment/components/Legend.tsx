/**
 * دليل الألوان والرموز
 * Colors and Icons Legend
 */

import React from 'react';

const Legend: React.FC = () => {
  return (
    <div className="assignment-legend">
      <h5>دليل الألوان:</h5>
      
      <div className="assignment-legend-item">
        <div className="assignment-legend-color" style={{ backgroundColor: '#059669' }}></div>
        <span>مكتمل الإسناد</span>
      </div>
      
      <div className="assignment-legend-item">
        <div className="assignment-legend-color" style={{ backgroundColor: '#d97706' }}></div>
        <span>إسناد جزئي</span>
      </div>
      
      <div className="assignment-legend-item">
        <div className="assignment-legend-color" style={{ backgroundColor: '#dc2626' }}></div>
        <span>غير مسند</span>
      </div>
      
      <div className="assignment-legend-item">
        <div className="assignment-legend-color" style={{ backgroundColor: '#64748b' }}></div>
        <span>غير نشط</span>
      </div>
    </div>
  );
};

export default Legend;