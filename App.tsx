import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileInput } from './components/FileInput';
import { ActionButton } from './components/ActionButton';
import { ClipboardIcon, CheckIcon, ResetIcon, UploadCloudIcon, WhatsAppIcon, CalendarClockIcon } from './components/Icons';
import { ConfirmResetModal } from './components/ConfirmResetModal';
import { AutoSendModal } from './components/AutoSendModal';
// FIX: Removed AppState from import as it is not exported from db.js
import { getAppState, saveAppState, clearAppState } from './utils/db';

// Make SheetJS library available from window object
declare const XLSX: any;

// FIX: Defined AppState interface locally
interface AppState {
  allTexts: string[];
  availableTexts: string[];
  currentText: string | null;
  fileName: string | null;
}

const App: React.FC = () => {
  const [allTexts, setAllTexts] = useState<string[]>([]);
  const [availableTexts, setAvailableTexts] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [isAutoSendModalOpen, setIsAutoSendModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isInitialized = useRef(false);

  // Load state from IndexedDB on initial render
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await getAppState();
        if (savedState) {
          setAllTexts(savedState.allTexts || []);
          setAvailableTexts(savedState.availableTexts || []);
          setCurrentText(savedState.currentText || null);
          setFileName(savedState.fileName || null);
        }
      } catch (err) {
        console.error("Could not load state from IndexedDB", err);
        setError("خطا در بارگذاری اطلاعات ذخیره شده.");
      } finally {
        setIsLoading(false);
        // Use a timeout to ensure state setters have finished
        setTimeout(() => {
            isInitialized.current = true;
        }, 100);
      }
    };
    loadState();
  }, []);

  // Save state to IndexedDB whenever it changes
  useEffect(() => {
    const saveState = async () => {
        if (!isInitialized.current || isLoading) {
            return;
        }
      try {
        if (allTexts.length > 0) {
          const stateToSave: AppState = {
            allTexts,
            availableTexts,
            currentText,
            fileName,
          };
          await saveAppState(stateToSave);
        } else {
          await clearAppState();
        }
      } catch (err) {
        console.error("Could not save state to IndexedDB", err);
      }
    };
    saveState();
  }, [allTexts, availableTexts, currentText, fileName, isLoading]);


  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const resetState = async () => {
      setFileName(null);
      setAllTexts([]);
      setAvailableTexts([]);
      setCurrentText(null);
      setError(null);
      setIsCopied(false);
      setNotification(null);
      await clearAppState();
  }

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setNotification(null);
    
    const isInitialLoad = allTexts.length === 0;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedTexts = jsonData
          .map(row => row[0]) // Only consider the first column
          .filter(cell => cell !== null && cell !== undefined)
          .map(cell => String(cell).trim())
          .filter(cell => cell.length > 0);

        if (parsedTexts.length === 0) {
            setError("فایل اکسل انتخاب شده خالی است یا هیچ متن معتبری در ستون اول آن یافت نشد.");
            if (isInitialLoad) resetState();
            return;
        }
        
        setFileName(file.name); // Update to last loaded file name

        if (isInitialLoad) {
            setAllTexts(parsedTexts);
            setAvailableTexts(parsedTexts);
            setCurrentText(null);
        } else {
            const existingTextsSet = new Set(allTexts);
            const uniqueNewTexts = parsedTexts.filter(text => !existingTextsSet.has(text));
            const duplicateCount = parsedTexts.length - uniqueNewTexts.length;

            let notificationMessage = '';
            if (uniqueNewTexts.length > 0) {
                notificationMessage += `${uniqueNewTexts.length} متن جدید با موفقیت اضافه شد. `;
                setAllTexts(prev => [...prev, ...uniqueNewTexts]);
                setAvailableTexts(prev => [...prev, ...uniqueNewTexts]);
            }
            if (duplicateCount > 0) {
                notificationMessage += `${duplicateCount} متن تکراری نادیده گرفته شد.`;
            }

            if(notificationMessage) {
                setNotification(notificationMessage.trim());
            } else {
                setError(`تمام متون موجود در فایل «${file.name}» قبلاً اضافه شده‌اند.`);
            }
        }

      } catch (err) {
        console.error("Error parsing Excel file:", err);
        setError("خطا در پردازش فایل اکسل. لطفاً از صحت فرمت فایل اطمینان حاصل کنید.");
        if (isInitialLoad) resetState();
      }
    };
    reader.onerror = () => {
        setError("خطا در خواندن فایل.");
        if (isInitialLoad) resetState();
    }
    reader.readAsArrayBuffer(file);
    if(event.target){
        event.target.value = '';
    }
  }, [allTexts]);
  
  const handleCopyRandomText = useCallback(() => {
    if (availableTexts.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableTexts.length);
    const selectedText = availableTexts[randomIndex];
    
    navigator.clipboard.writeText(selectedText).then(() => {
      setCurrentText(selectedText);
      setIsCopied(true);
      setAvailableTexts(prev => prev.filter((_, index) => index !== randomIndex));
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setError('خطا در کپی کردن متن در کلیپ‌بورد.');
    });
  }, [availableTexts]);

  const performReset = useCallback(() => {
    setAvailableTexts(allTexts);
    setCurrentText(null);
    setError(null);
    setNotification(null);
    setIsCopied(false);
  }, [allTexts]);
  
  const usedCount = allTexts.length - availableTexts.length;

  if (isLoading) {
      return (
          <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex items-center justify-center">
              <p className="text-slate-500 dark:text-slate-400">در حال بارگذاری...</p>
          </div>
      )
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 transition-all duration-300">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">انتخاب تصادفی متن از اکسل</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">یک متن تصادفی و غیرتکراری را از فایل اکسل خود کپی کنید.</p>
          </div>
          
          {notification && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded-md" role="status">
              <p>{notification}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
              <p className="font-bold">خطا</p>
              <p>{error}</p>
            </div>
          )}

          {allTexts.length === 0 ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center">
              <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
              <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">فایل اکسل خود را انتخاب کنید</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">فایل باید شامل یک ستون از متون باشد.</p>
              <div className="mt-6">
                <FileInput onChange={handleFileChange} />
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">آخرین فایل بارگذاری شده:</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{fileName}</p>
                 <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 my-3">
                    <div 
                        className="bg-sky-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${allTexts.length > 0 ? (usedCount / allTexts.length) * 100 : 0}%` }}>
                    </div>
                </div>
                <p className="text-sm font-medium text-sky-600 dark:text-sky-400">{`${usedCount} از ${allTexts.length} متن استفاده شده`}</p>
              </div>

              <div className="relative mb-6">
                <div className="bg-slate-100 dark:bg-slate-900/50 rounded-lg p-6 min-h-[100px] flex items-center justify-center text-center">
                  <p className={`text-lg transition-opacity duration-300 ${currentText ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {currentText || "برای نمایش متن، دکمه زیر را فشار دهید"}
                  </p>
                </div>
                {isCopied && currentText && (
                   <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900/80 text-green-700 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-fadeIn">
                      <CheckIcon className="h-4 w-4" />
                      <span>کپی شد!</span>
                  </div>
                )}
              </div>

              {currentText && (
                  <div className="mb-6 text-center">
                      <a
                          href={`https://wa.me/?text=${encodeURIComponent(currentText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                          aria-label="ارسال متن کپی شده در واتساپ"
                      >
                          <WhatsAppIcon className="h-6 w-6" />
                          <span>ارسال در واتساپ</span>
                      </a>
                  </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                <ActionButton 
                  onClick={handleCopyRandomText}
                  disabled={availableTexts.length === 0}
                  className="w-full sm:col-span-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  <ClipboardIcon className="h-5 w-5" />
                  <span>{availableTexts.length > 0 ? 'کپی متن بعدی' : 'تمام شد!'}</span>
                </ActionButton>
                
                <label htmlFor="add-file-upload" title="افزودن فایل جدید" className="w-full sm:col-span-1 flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-slate-100 dark:focus-within:ring-offset-slate-800 transition-all duration-200 cursor-pointer bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600">
                    <UploadCloudIcon className="h-5 w-5" />
                </label>
                <input 
                    id="add-file-upload" 
                    name="add-file-upload" 
                    type="file" 
                    className="sr-only" 
                    onChange={handleFileChange}
                    accept=".xlsx, .xls"
                />

                <ActionButton 
                  onClick={() => setIsAutoSendModalOpen(true)}
                  className="w-full sm:col-span-1 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  title="ارسال خودکار"
                >
                    <CalendarClockIcon className="h-5 w-5" />
                </ActionButton>

                <ActionButton 
                  onClick={() => setIsResetModalOpen(true)}
                  className="w-full sm:col-span-1 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  title="بازنشانی"
                >
                  <ResetIcon className="h-5 w-5" />
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => {
          performReset();
          setIsResetModalOpen(false);
        }}
      />
      <AutoSendModal 
        isOpen={isAutoSendModalOpen}
        onClose={() => setIsAutoSendModalOpen(false)}
        onSave={() => {
            setNotification("تنظیمات ارسال خودکار با موفقیت ذخیره شد. اعلان‌ها در زمان مقرر نمایش داده خواهند شد.");
        }}
        texts={availableTexts}
      />
    </div>
  );
};

export default App;