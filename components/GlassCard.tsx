import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-glass backdrop-blur-md border border-white/10 rounded-2xl shadow-xl ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;