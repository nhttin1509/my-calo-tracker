
// Tất cả import từ thư viện bên ngoài được giữ lại và sẽ được xử lý bởi importmap
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

// --- START: Định nghĩa Types (từ types.ts) ---
interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
}

interface AnalyzedFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
// --- END: Định nghĩa Types ---

// --- START: Custom Hook (từ hooks/useLocalStorage.ts) ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore = storedValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
// --- END: Custom Hook ---

// --- START: Services (từ services/*.ts) ---
const geminiService = (() => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
      console.warn("API_KEY is not set. Gemini features will not work.");
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Tên của món ăn" },
        calories: { type: Type.NUMBER, description: "Lượng calo ước tính" },
        protein: { type: Type.NUMBER, description: "Lượng protein (gam)" },
        carbs: { type: Type.NUMBER, description: "Lượng carbohydrate (gam)" },
        fat: { type: Type.NUMBER, description: "Lượng chất béo (gam)" },
      },
      required: ["name", "calories", "protein", "carbs", "fat"],
    },
  };

  async function analyzeFood(description) {
    if (!API_KEY) {
        throw new Error("API Key chưa được cấu hình. Vui lòng kiểm tra lại.");
    }
    try {
      const prompt = `Phân tích mô tả bữa ăn sau đây và trả về một danh sách các món ăn cùng với thông tin dinh dưỡng ước tính của chúng. Mô tả: "${description}". Hãy ước tính cho từng món ăn một cách riêng biệt.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: responseSchema },
      });
      const data = JSON.parse(response.text.trim());
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error("Lỗi khi gọi Gemini API:", error);
      throw new Error("Không thể phân tích món ăn. Vui lòng thử lại.");
    }
  }

  return { analyzeFood };
})();


const googleSheetService = (() => {
  async function logToSheet(url, foodItem) {
    if (!url) return;
    const formData = new URLSearchParams();
    formData.append('action', 'add');
    formData.append('id', foodItem.id);
    formData.append('timestamp', foodItem.timestamp);
    formData.append('name', foodItem.name);
    formData.append('calories', String(foodItem.calories));
    formData.append('protein', String(foodItem.protein));
    formData.append('carbs', String(foodItem.carbs));
    formData.append('fat', String(foodItem.fat));
    try {
      await fetch(url, { method: 'POST', mode: 'no-cors', body: formData });
    } catch (error) {
      console.error("Lỗi khi thêm dữ liệu vào Google Sheet:", error);
    }
  }

  async function removeFromSheet(url, id) {
    if (!url) return;
    const formData = new URLSearchParams();
    formData.append('action', 'delete');
    formData.append('id', id);
    try {
      await fetch(url, { method: 'POST', mode: 'no-cors', body: formData });
    } catch (error) {
      console.error("Lỗi khi xóa dữ liệu khỏi Google Sheet:", error);
    }
  }
  
  return { logToSheet, removeFromSheet };
})();
// --- END: Services ---


// --- START: Icon Components (từ components/icons/*.tsx) ---
const SettingsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.73l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.73l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const TrashIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);
const LoaderIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);
// --- END: Icon Components ---


// --- START: Main Components (từ components/*.tsx) ---
const Header = ({ onSettingsClick }) => (
  <header className="bg-white shadow-sm sticky top-0 z-10">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <h1 className="text-xl font-bold text-slate-800">Calo<span className="text-emerald-500">Track</span></h1>
        <button onClick={onSettingsClick} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-emerald-500 focus:outline-none" aria-label="Cài đặt">
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  </header>
);

const DailySummary = ({ foods }) => {
  const totals = foods.reduce((acc, food) => {
    acc.calories += food.calories; acc.protein += food.protein; acc.carbs += food.carbs; acc.fat += food.fat;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const macroData = [
    { name: 'Protein', value: Math.round(totals.protein * 4) }, { name: 'Carbs', value: Math.round(totals.carbs * 4) }, { name: 'Fat', value: Math.round(totals.fat * 9) },
  ].filter(d => d.value > 0);
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  const SummaryCard = ({ title, value, unit, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
      <span className="text-sm text-slate-500">{title}</span>
      <span className={`text-2xl font-bold ${color}`}>{Math.round(value)}</span>
      <span className="text-xs text-slate-400">{unit}</span>
    </div>
  );
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-slate-700">Tổng kết hôm nay</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Tổng Calo" value={totals.calories} unit="kcal" color="text-slate-800" />
        <SummaryCard title="Protein" value={totals.protein} unit="g" color="text-emerald-500" />
        <SummaryCard title="Carbs" value={totals.carbs} unit="g" color="text-amber-500" />
        <SummaryCard title="Fat" value={totals.fat} unit="g" color="text-red-500" />
      </div>
      {macroData.length > 0 && (
         <div className="bg-white p-4 rounded-xl shadow-sm h-64">
           <h3 className="text-md font-semibold text-center text-slate-600 mb-2">Tỉ lệ Calo từ Macros</h3>
           <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={macroData} dataKey="value" nameKey="name" cx="50%" cy="40%" outerRadius={60} fill="#8884d8">{macroData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value) => `${value} kcal`} /><Legend iconType="circle" wrapperStyle={{bottom: 0, position: 'relative'}}/></PieChart>
           </ResponsiveContainer>
         </div>
      )}
    </div>
  );
};

const FoodLog = ({ foods, onRemove }) => {
  const sortedFoods = [...foods].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  if (sortedFoods.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500">
        <p>Chưa có món ăn nào được ghi lại hôm nay.</p>
        <p className="text-sm">Hãy nhập món ăn bạn đã dùng vào ô bên dưới.</p>
      </div>
    );
  }
  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold text-slate-700">Nhật ký hôm nay</h2>
      {sortedFoods.map(food => (
        <div key={food.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="flex-grow">
            <div className="flex justify-between items-baseline">
              <h3 className="font-semibold capitalize text-slate-800">{food.name}</h3>
              <p className="font-bold text-emerald-500">{Math.round(food.calories)} kcal</p>
            </div>
            <div className="text-xs text-slate-500 grid grid-cols-3 gap-2 mt-2">
              <span>P: {Math.round(food.protein)}g</span>
              <span>C: {Math.round(food.carbs)}g</span>
              <span>F: {Math.round(food.fat)}g</span>
            </div>
          </div>
          <button onClick={() => onRemove(food.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full" aria-label={`Xóa ${food.name}`}>
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose, googleSheetUrl, onSave }) => {
  const [url, setUrl] = useState(googleSheetUrl);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Cài đặt</h2>
        <div>
          <label htmlFor="google-sheet-url" className="block text-sm font-medium text-slate-700">URL Web App Google Apps Script</label>
          <input type="url" id="google-sheet-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/..."
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-emerald-500" />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Hủy</button>
          <button onClick={() => { onSave(url); onClose(); }} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md shadow-sm hover:bg-emerald-700">Lưu</button>
        </div>
      </div>
    </div>
  );
};

const FoodInputForm = ({ onAddFood }) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await onAddFood(description);
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-2">
        <div className="flex items-start space-x-3">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Hôm nay bạn ăn gì? Ví dụ: 2 trứng ốp la..."
            rows={2} className="flex-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-emerald-500"
            disabled={isLoading} />
          <button type="submit" disabled={isLoading || !description.trim()}
            className="inline-flex items-center justify-center px-4 py-2 h-[46px] border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300">
            {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Thêm'}
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>
    </div>
  );
};
// --- END: Main Components ---


// --- START: App Component (từ App.tsx) ---
function App() {
  const [foodLog, setFoodLog] = useLocalStorage('foodLog', []);
  const [googleSheetUrl, setGoogleSheetUrl] = useLocalStorage('googleSheetUrl', '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const addFoodItems = async (description) => {
    try {
      const analyzedFoods = await geminiService.analyzeFood(description);
      if (analyzedFoods.length === 0) {
        throw new Error("AI không nhận diện được món ăn nào từ mô tả của bạn.");
      }
      const newFoodItems = analyzedFoods.map(food => ({
        id: crypto.randomUUID(), ...food, timestamp: new Date().toISOString(),
      }));
      setFoodLog(prevLog => [...newFoodItems, ...prevLog]);
      if (googleSheetUrl) {
        Promise.all(newFoodItems.map(item => googleSheetService.logToSheet(googleSheetUrl, item)));
      }
    } catch (error) {
      console.error("Lỗi khi thêm món ăn:", error);
      throw error;
    }
  };

  const removeFoodItem = (id) => {
    setFoodLog(foodLog.filter(food => food.id !== id));
    if (googleSheetUrl) {
      googleSheetService.removeFromSheet(googleSheetUrl, id);
    }
  };

  const foodsForToday = useMemo(() => {
    const today = new Date();
    return foodLog.filter(food => {
        const foodDate = new Date(food.timestamp);
        return foodDate.getDate() === today.getDate() &&
               foodDate.getMonth() === today.getMonth() &&
               foodDate.getFullYear() === today.getFullYear();
    });
  }, [foodLog]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <main className="max-w-4xl mx-auto pb-28">
        <DailySummary foods={foodsForToday} />
        <FoodLog foods={foodsForToday} onRemove={removeFoodItem} />
      </main>
      <FoodInputForm onAddFood={addFoodItems} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        googleSheetUrl={googleSheetUrl}
        onSave={setGoogleSheetUrl}
      />
    </div>
  );
}
// --- END: App Component ---


// --- START: Render Root (từ index.tsx) ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Không tìm thấy root element để mount ứng dụng.");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// --- END: Render Root ---
