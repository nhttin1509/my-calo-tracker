import { FoodItem } from '../types';

export async function logToSheet(url: string, foodItem: FoodItem): Promise<void> {
  if (!url) {
    return;
  }

  const formData = new URLSearchParams();
  formData.append('action', 'add'); // Thêm hành động 'add'
  formData.append('id', foodItem.id); // Gửi ID của món ăn
  formData.append('timestamp', foodItem.timestamp);
  formData.append('name', foodItem.name);
  formData.append('calories', String(foodItem.calories));
  formData.append('protein', String(foodItem.protein));
  formData.append('carbs', String(foodItem.carbs));
  formData.append('fat', String(foodItem.fat));

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: formData,
    });
  } catch (error) {
    console.error("Lỗi khi thêm dữ liệu vào Google Sheet:", error);
    throw new Error("Không thể đồng bộ thêm mới với Google Sheet.");
  }
}

export async function removeFromSheet(url: string, id: string): Promise<void> {
  if (!url) {
    return;
  }

  const formData = new URLSearchParams();
  formData.append('action', 'delete'); // Thêm hành động 'delete'
  formData.append('id', id); // Chỉ cần gửi ID để xóa

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: formData,
    });
  } catch (error) {
    console.error("Lỗi khi xóa dữ liệu khỏi Google Sheet:", error);
    // Không ném lỗi ra ngoài để không chặn việc xóa trên UI
    // người dùng có thể thử lại sau nếu cần đồng bộ hoàn hảo.
  }
}
