import React, { useEffect, useState } from 'react';

interface RejectionOverlayProps {
  visible: boolean;
  onDone: () => void;
}

export const RejectionOverlay: React.FC<RejectionOverlayProps> = ({ visible, onDone }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setActive(true);
    const timer = setTimeout(() => {
      setActive(false);
      onDone();
    }, 1100);
    return () => clearTimeout(timer);
  }, [visible, onDone]);

  if (!active) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 9999,
      animation: 'sadPulse 1s ease-in-out forwards',
    }}>
      <style>{`
        @keyframes sadPulse {
          0%   { opacity: 0; transform: scale(0.6); }
          15%  { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(0.95); }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.3))' }}>
          😢
        </span>
        <span style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: '#fff',
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          letterSpacing: '-0.02em',
        }}>
          Better luck next time
        </span>
      </div>
    </div>
  );
};
