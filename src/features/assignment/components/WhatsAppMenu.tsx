/**
 * قائمة واتساب للمشاركة والإرسال
 * WhatsApp Menu for Sharing and Sending
 */

import React from 'react';
import { useAssignment, useAssignmentActions } from '../store/assignmentStore';

const WhatsAppMenu: React.FC = () => {
  const { state } = useAssignment();
  const actions = useAssignmentActions();

  if (!state.ui.whatsappMenuOpen) return null;

  const handleIndividualSend = () => {
    // سيتم تطبيقه في مرحلة لاحقة
    console.log('إرسال فردي');
  };

  const handleGroupSend = () => {
    // سيتم تطبيقه في مرحلة لاحقة
    console.log('إرسال جماعي');
  };

  return (
    <div className="assignment-whatsapp-menu">
      <h4>مشاركة عبر واتساب</h4>
      
      <div className="assignment-whatsapp-options">
        <div className="assignment-whatsapp-option" onClick={handleIndividualSend}>
          <i className="assignment-whatsapp-icon fab fa-whatsapp"></i>
          <div>
            <div>إرسال فردي</div>
            <small>إرسال لمعلم واحد محدد</small>
          </div>
        </div>
        
        <div className="assignment-whatsapp-option" onClick={handleGroupSend}>
          <i className="assignment-whatsapp-icon fab fa-whatsapp"></i>
          <div>
            <div>إرسال جماعي</div>
            <small>إرسال لجميع المعلمين المحددين</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppMenu;