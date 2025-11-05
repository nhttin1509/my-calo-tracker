
import React from 'react';
import { FoodItem } from '../types';
import TrashIcon from './icons/TrashIcon';

interface FoodLogProps {
  foods: FoodItem[];
  onRemove: (id: string) => void;
}

const FoodLog: React.FC<FoodLogProps> = ({ foods, onRemove }) => {
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
                <button
                    onClick={() => onRemove(food.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    aria-label={`Xóa ${food.name}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        ))}
    </div>
  );
};

export default FoodLog;