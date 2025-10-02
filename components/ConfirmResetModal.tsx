import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ActionButton } from './ActionButton';
import { AlertTriangleIcon } from './Icons';

interface ConfirmResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CONFIRMATION_TEXT = 'بازنشانی';

export const ConfirmResetModal: React.FC<ConfirmResetModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue(''); // Reset input when modal opens
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isConfirmationTextMatched = inputValue.trim() === CONFIRMATION_TEXT;

  const handleConfirm = () => {
    if (isConfirmationTextMatched) {
      onConfirm();
    }
  };
  
  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
            <AlertTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white" id="modal-title">
            آیا از بازنشانی مطمئن هستید؟
          </h3>
          <div className="mt-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              با این کار، تمام متون دوباره در دسترس قرار می‌گیرند و پیشرفت شما از بین می‌رود. برای تأیید، لطفاً کلمه «<strong className="font-bold text-slate-700 dark:text-slate-200">{CONFIRMATION_TEXT}</strong>» را در کادر زیر وارد کنید.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-3 py-2 text-center bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder={`کلمه «${CONFIRMATION_TEXT}» را تایپ کنید`}
            autoFocus
          />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
          <ActionButton
            onClick={handleConfirm}
            disabled={!isConfirmationTextMatched}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed focus:ring-red-500"
          >
            بله، بازنشانی کن
          </ActionButton>
          <ActionButton
            onClick={onClose}
            className="w-full bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:border-slate-500 focus:ring-slate-400"
          >
            انصراف
          </ActionButton>
        </div>
      </div>
    </div>,
    document.body
  );
};