
import React from 'react';

interface FileInputProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileInput: React.FC<FileInputProps> = ({ onChange }) => {
  return (
    <label htmlFor="file-upload" className="relative cursor-pointer bg-sky-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200">
      <span>انتخاب فایل</span>
      <input 
        id="file-upload" 
        name="file-upload" 
        type="file" 
        className="sr-only" 
        onChange={onChange}
        accept=".xlsx, .xls"
      />
    </label>
  );
};
