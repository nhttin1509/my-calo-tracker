
import React from 'react';
import { FoodItem } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

interface DailySummaryProps {
  foods: FoodItem[];
}

const DailySummary: React.FC<DailySummaryProps> = ({ foods }) => {
  const totals = foods.reduce(
    (acc, food) => {
      acc.calories += food.calories;
      acc.protein += food.protein;
      acc.carbs += food.carbs;
      acc.fat += food.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const macroData = [
    { name: 'Protein', value: Math.round(totals.protein * 4) },
    { name: 'Carbs', value: Math.round(totals.carbs * 4) },
    { name: 'Fat', value: Math.round(totals.fat * 9) },
  ].filter(d => d.value > 0);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const SummaryCard: React.FC<{ title: string; value: number; unit: string; color: string }> = ({ title, value, unit, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
      <span className="text-sm text-slate-500">{title}</span>
      <span className={`text-2xl font-bold ${color}`}>
        {Math.round(value)}
      </span>
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
                <PieChart>
                    <Pie data={macroData} dataKey="value" nameKey="name" cx="50%" cy="40%" outerRadius={60} fill="#8884d8">
                        {macroData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} kcal`} />
                    <Legend iconType="circle" wrapperStyle={{bottom: 0, position: 'relative'}}/>
                </PieChart>
             </ResponsiveContainer>
         </div>
      )}
    </div>
  );
};

export default DailySummary;