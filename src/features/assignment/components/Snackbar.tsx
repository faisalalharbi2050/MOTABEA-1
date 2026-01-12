/**
 * شريط إشعارات Snackbar
 * Snackbar Notifications
 */

import React, { useEffect, useState } from 'react';
import { useAssignment } from '../store/assignmentStore';

const Snackbar: React.FC = () => {
  const { state } = useAssignment();
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>>([]);

  // مراقبة الأخطاء وإظهار إشعارات
  useEffect(() => {
    const errors = Object.values(state.errors).filter(Boolean);
    if (errors.length > 0) {
      errors.forEach(error => {
        if (error) {
          const notification = {
            id: Date.now().toString(),
            type: 'error' as const,
            message: error
          };
          setNotifications(prev => [...prev, notification]);
          
          // إزالة الإشعار بعد 5 ثوان
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          }, 5000);
        }
      });
    }
  }, [state.errors]);

  if (notifications.length === 0) return null;

  return (
    <div className="assignment-snackbar-container">
      {notifications.map(notification => (
        <div key={notification.id} className={`assignment-snackbar ${notification.type}`}>
          <i className={`fas fa-${
            notification.type === 'success' ? 'check-circle' :
            notification.type === 'error' ? 'exclamation-circle' :
            notification.type === 'warning' ? 'exclamation-triangle' :
            'info-circle'
          }`} aria-hidden="true"></i>
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            className="assignment-snackbar-close"
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Snackbar;