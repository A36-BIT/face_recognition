import React from 'react';

export const ScannerEffect: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(99,102,241,1)] animate-[scan_2s_linear_infinite]" 
           style={{ animationName: 'scanDown' }}>
      </div>
      <style>{`
        @keyframes scanDown {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
      <div className="absolute inset-0 bg-primary/10 animate-pulse-slow mix-blend-overlay"></div>
    </div>
  );
};
