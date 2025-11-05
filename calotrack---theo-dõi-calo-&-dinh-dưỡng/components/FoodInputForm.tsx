
import React, { useState } from 'react';
import LoaderIcon from './icons/LoaderIcon';

interface FoodInputFormProps {
  onAddFood: (description: string) => Promise<void>;
}

const FoodInputForm: React.FC<FoodInputFormProps> = ({ onAddFood }) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isLoading) {
      return;
    }

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
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Hôm nay bạn ăn gì? Ví dụ: 2 trứng ốp la và 100g ức gà..."
            rows={2}
            className="flex-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                       focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                       disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !description.trim()}
            className="inline-flex items-center justify-center px-4 py-2 h-[46px] border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
                       disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Thêm'}
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default FoodInputForm;
