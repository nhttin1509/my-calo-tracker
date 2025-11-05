
import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleSheetUrl: string;
  onSave: (url: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, googleSheetUrl, onSave }) => {
  const [url, setUrl] = useState(googleSheetUrl);

  const handleSave = () => {
    onSave(url);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Cài đặt</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="google-sheet-url" className="block text-sm font-medium text-slate-700">
              URL Web App Google Apps Script
            </label>
            <input
              type="url"
              id="google-sheet-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                         focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
             <p className="mt-2 text-xs text-slate-500">
              Để tự động lưu dữ liệu, hãy tạo một Web App trên Google Apps Script và dán URL vào đây.
              <a href="https://developers.google.com/apps-script/guides/web" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline ml-1">
                Xem hướng dẫn
              </a>
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
