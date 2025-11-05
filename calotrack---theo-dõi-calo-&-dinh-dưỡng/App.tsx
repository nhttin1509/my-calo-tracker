
import React, { useState, useMemo } from 'react';
import { FoodItem, AnalyzedFood } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { analyzeFood } from './services/geminiService';
import { logToSheet, removeFromSheet } from './services/googleSheetService';
import Header from './components/Header';
import DailySummary from './components/DailySummary';
import FoodLog from './components/FoodLog';
import FoodInputForm from './components/FoodInputForm';
import SettingsModal from './components/SettingsModal';

const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

function App() {
  const [foodLog, setFoodLog] = useLocalStorage<FoodItem[]>('foodLog', []);
  const [googleSheetUrl, setGoogleSheetUrl] = useLocalStorage<string>('googleSheetUrl', '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const addFoodItems = async (description: string) => {
    try {
      const analyzedFoods: AnalyzedFood[] = await analyzeFood(description);
      if (analyzedFoods.length === 0) {
          throw new Error("AI không nhận diện được món ăn nào từ mô tả của bạn.");
      }

      const newFoodItems: FoodItem[] = analyzedFoods.map(food => ({
        id: crypto.randomUUID(),
        ...food,
        timestamp: new Date().toISOString(),
      }));
      
      setFoodLog(prevLog => [...newFoodItems, ...prevLog]);

      // Gửi dữ liệu đến Google Sheet một cách bất đồng bộ
      if (googleSheetUrl) {
          Promise.all(newFoodItems.map(item => logToSheet(googleSheetUrl, item)))
              .catch(err => {
                  console.warn("Lỗi đồng bộ một phần với Google Sheet:", err);
              });
      }
    } catch (error) {
      console.error("Lỗi khi thêm món ăn:", error);
      throw error;
    }
  };

  const removeFoodItem = (id: string) => {
    setFoodLog(foodLog.filter(food => food.id !== id));
    if (googleSheetUrl) {
      removeFromSheet(googleSheetUrl, id).catch(err => {
          console.warn(`Không thể xóa món ăn có ID ${id} khỏi Google Sheet.`, err);
      });
    }
  };

  const foodsForToday = useMemo(() => {
    return foodLog.filter(food => isToday(new Date(food.timestamp)));
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

export default App;