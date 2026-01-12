/**
 * شريط التحميل العلوي
 * Top Loading Bar
 */

import React from 'react';
import { useAssignment } from '../store/assignmentStore';
import { selectIsLoading } from '../store/selectors';

const LoadBar: React.FC = () => {
  const { state } = useAssignment();
  const isLoading = selectIsLoading(state);

  if (!isLoading) return null;

  return (
    <div className="assignment-load-bar">
      <div className="assignment-load-bar-fill" style={{ width: '100%' }}></div>
    </div>
  );
};

export default LoadBar;