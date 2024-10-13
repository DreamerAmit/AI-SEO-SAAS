import React from 'react';
import './LoadingSpinner.css'; // We'll create this CSS file next

const LoadingSpinner = () => (
  <div className="loading-spinner-overlay">
    <div className="loading-spinner"></div>
  </div>
);

export default LoadingSpinner;