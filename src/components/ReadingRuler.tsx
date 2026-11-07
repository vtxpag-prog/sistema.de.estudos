import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export const ReadingRuler: React.FC = () => {
  const { accessibility } = useApp();
  const [mouseY, setMouseY] = useState(200);

  useEffect(() => {
    if (!accessibility.readingRuler) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [accessibility.readingRuler]);

  if (!accessibility.readingRuler) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-30 transition-all duration-75"
      style={{
        top: `${mouseY - 24}px`,
        height: '48px',
        backgroundColor: 'rgba(254, 240, 138, 0.22)',
        borderTop: '2px solid rgba(234, 179, 8, 0.45)',
        borderBottom: '2px solid rgba(234, 179, 8, 0.45)',
        backdropFilter: 'contrast(105%)',
      }}
    />
  );
};
