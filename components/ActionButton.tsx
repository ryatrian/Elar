
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ children, className, ...props }) => {
  const baseClasses = "flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 transition-all duration-200";
  return (
    <button
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
