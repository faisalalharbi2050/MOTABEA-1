/**
 * قائمة تصدير PDF
 * PDF Export Menu
 */

import React from 'react';
import { useAssignment } from '../store/assignmentStore';

const PdfMenu: React.FC = () => {
  const { state } = useAssignment();

  if (!state.ui.exportMenuOpen) return null;

  return (
    <div className="assignment-export-menu">
      <h4>خيارات التصدير</h4>
      <div className="assignment-export-options">
        <button className="assignment-btn">تصدير PDF</button>
        <button className="assignment-btn">تصدير Excel</button>
        <button className="assignment-btn">تصدير HTML</button>
      </div>
    </div>
  );
};

export default PdfMenu;