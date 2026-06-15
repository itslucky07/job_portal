import React from 'react';
import './DashboardPlaceholder.css';

const DashboardPlaceholder = ({ title, phase }) => {
  return (
    <div className="placeholder-container">
      <div className="placeholder-card">
        <div className="badge">Phase {phase}</div>
        <h2>{title}</h2>
        <p>This view will be fully migrated to React in Phase {phase} of the implementation plan.</p>
        <div className="pulse-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPlaceholder;
