
export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
}

export interface AnalyzedFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
