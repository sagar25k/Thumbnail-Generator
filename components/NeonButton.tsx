import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

const NeonButton: React.FC<NeonButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  
  const baseStyles = "relative px-6 py-3 rounded-full font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  let colorStyles = "";
  
  if (variant === 'primary') {
    colorStyles = "bg-gradient-to-r from-neonPurple to-neonCyan text-white shadow-[0_0_15px_rgba(121,40,202,0.5)] hover:shadow-[0_0_25px_rgba(255,0,128,0.7)]";
  } else if (variant === 'secondary') {
    colorStyles = "bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40";
  } else if (variant === 'danger') {
    colorStyles = "bg-red-500/20 border border-red-500/50 text-red-200 hover:bg-red-500/40";
  }

  return (
    <button 
      className={`${baseStyles} ${colorStyles} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
         <span className="flex items-center justify-center gap-2">
           <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           PROCESSING...
         </span>
      ) : children}
    </button>
  );
};

export default NeonButton;