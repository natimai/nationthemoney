import React from 'react';

function ProgressBar({ savings, savingGoal }) {
  const progress = Math.min((savings / savingGoal) * 100, 100);

  return (
    <div style={{ margin: '20px', textAlign: 'center' }}>
      <h3>Saving Progress</h3>
      <div style={{
        background: '#e0e0e0',
        borderRadius: '25px',
        height: '30px',
        width: '80%',
        margin: '0 auto',
        position: 'relative',
      }}>
        <div style={{
          background: '#4CAF50',
          height: '100%',
          borderRadius: '25px',
          width: `${progress}%`,
          transition: 'width 0.5s',
        }}></div>
      </div>
      <p>{`${progress.toFixed(1)}% of your saving goal`}</p>
    </div>
  );
}

export default ProgressBar;
