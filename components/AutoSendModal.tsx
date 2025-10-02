import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ActionButton } from './ActionButton';
import { Switch } from './Switch';
// FIX: Removed AutoSendConfig and Schedule from import as they are not exported from db.js
import { getAutoSendConfig, saveAutoSendConfig, saveSchedules, clearSchedules } from '../utils/db';

// FIX: Defined interfaces locally as they are not exported from db.js
interface AutoSendConfig {
    enabled: boolean;
    days: number[];
    startTime: string;
    endTime: string;
    count: number;
}
  
interface Schedule {
    id: number;
    text: string;
}

interface AutoSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  texts: string[];
}

const WEEK_DAYS = [
    { id: 6, name: 'ش' }, // Saturday
    { id: 0, name: 'ی' }, // Sunday
    { id: 1, name: 'د' }, // Monday
    { id: 2, name: 'س' }, // Tuesday
    { id: 3, name: 'چ' }, // Wednesday
    { id: 4, name: 'پ' }, // Thursday
    { id: 5, name: 'ج' }, // Friday
];

export const AutoSendModal: React.FC<AutoSendModalProps> = ({ isOpen, onClose, onSave, texts }) => {
  const [config, setConfig] = useState<AutoSendConfig>({
      enabled: false,
      days: [],
      startTime: '09:00',
      endTime: '17:00',
      count: 1,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadConfig = async () => {
        const savedConfig = await getAutoSendConfig();
        if (savedConfig) {
          setConfig(savedConfig);
        }
      };
      loadConfig();
      setError(null);
    }
  }, [isOpen]);

  const handleDayClick = (dayId: number) => {
    setConfig(prev => {
      const newDays = prev.days.includes(dayId)
        ? prev.days.filter(d => d !== dayId)
        : [...prev.days, dayId];
      return { ...prev, days: newDays };
    });
  };

  const validateConfig = () => {
      if (!config.enabled) return true;
      if (config.days.length === 0) {
          setError("لطفاً حداقل یک روز از هفته را انتخاب کنید.");
          return false;
      }
      if (!config.startTime || !config.endTime) {
          setError("لطفاً ساعت شروع و پایان را مشخص کنید.");
          return false;
      }
      if (config.startTime >= config.endTime) {
          setError("ساعت پایان باید بعد از ساعت شروع باشد.");
          return false;
      }
      if (config.count < 1) {
          setError("تعداد ارسال باید حداقل ۱ باشد.");
          return false;
      }
      if(texts.length < config.count * config.days.length) {
          setError("تعداد متون موجود برای برنامه‌ریزی کافی نیست.");
          return false;
      }
      setError(null);
      return true;
  }

  const generateSchedules = useCallback((): Schedule[] => {
      if (!config.enabled || !validateConfig()) {
          return [];
      }

      let availableTextsForScheduling = [...texts];
      const schedules: Schedule[] = [];
      const now = new Date();

      for (let i = 0; i < 7; i++) { // Schedule for the next 7 days
          const date = new Date(now);
          date.setDate(now.getDate() + i);
          const dayOfWeek = date.getDay();

          if (config.days.includes(dayOfWeek)) {
              const [startH, startM] = config.startTime.split(':').map(Number);
              const [endH, endM] = config.endTime.split(':').map(Number);
              
              const startDate = new Date(date);
              startDate.setHours(startH, startM, 0, 0);
              
              const endDate = new Date(date);
              endDate.setHours(endH, endM, 0, 0);

              const timeWindowMs = endDate.getTime() - startDate.getTime();

              for (let j = 0; j < config.count; j++) {
                  if (availableTextsForScheduling.length === 0) break;

                  const randomTime = startDate.getTime() + Math.random() * timeWindowMs;
                  
                  // Pick a random text and remove it so it's not scheduled twice
                  const textIndex = Math.floor(Math.random() * availableTextsForScheduling.length);
                  const selectedText = availableTextsForScheduling.splice(textIndex, 1)[0];
                  
                  // Only schedule if the time is in the future
                  if(randomTime > Date.now()) {
                    schedules.push({ id: randomTime, text: selectedText });
                  }
              }
          }
      }
      return schedules.sort((a,b) => a.id - b.id);
  }, [config, texts]);


  const handleSave = async () => {
    if (!validateConfig()) return;

    try {
        await saveAutoSendConfig(config);
        if(config.enabled) {
            const newSchedules = generateSchedules();
            await saveSchedules(newSchedules);
        } else {
            await clearSchedules();
        }
        onSave();
        onClose();
    } catch (err) {
        console.error("Failed to save auto-send config:", err);
        setError("خطا در ذخیره‌سازی تنظیمات.");
    }
  };
  
  const handleClear = async () => {
    const clearedConfig = { enabled: false, days: [], startTime: '09:00', endTime: '17:00', count: 1 };
    setConfig(clearedConfig);
    await saveAutoSendConfig(clearedConfig);
    await clearSchedules();
    onClose();
  }

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
  
  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6" id="modal-title">
            تنظیمات ارسال خودکار
        </h3>

        <div className="space-y-6">
            <Switch 
                label="فعال‌سازی ارسال خودکار"
                checked={config.enabled}
                onChange={(checked) => setConfig(prev => ({...prev, enabled: checked}))}
            />
        
            <div className={config.enabled ? '' : 'opacity-50 pointer-events-none'}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">روزهای هفته</label>
                        <div className="grid grid-cols-7 gap-2">
                            {WEEK_DAYS.map(day => (
                                <button key={day.id} onClick={() => handleDayClick(day.id)} className={`p-2 rounded-lg font-bold text-center transition-colors ${config.days.includes(day.id) ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                                    {day.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">از ساعت</label>
                            <input type="time" id="startTime" value={config.startTime} onChange={e => setConfig(prev => ({...prev, startTime: e.target.value}))} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">تا ساعت</label>
                            <input type="time" id="endTime" value={config.endTime} onChange={e => setConfig(prev => ({...prev, endTime: e.target.value}))} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="count" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">تعداد ارسال در هر روز</label>
                        <input type="number" id="count" min="1" value={config.count} onChange={e => setConfig(prev => ({...prev, count: parseInt(e.target.value, 10) || 1}))} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                    </div>
                </div>
            </div>

            {error && (
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">
                    <p>{error}</p>
                </div>
            )}
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
          <ActionButton
            onClick={handleClear}
            className="w-full sm:w-auto bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60 focus:ring-red-500"
          >
            حذف تنظیمات
          </ActionButton>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <ActionButton
                onClick={onClose}
                className="w-full sm:w-auto bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:border-slate-500 focus:ring-slate-400"
            >
                انصراف
            </ActionButton>
            <ActionButton
                onClick={handleSave}
                className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 focus:ring-sky-500"
            >
                ذخیره
            </ActionButton>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};