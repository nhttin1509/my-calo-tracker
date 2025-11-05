
import React from 'react';
import { DayPicker } from 'react-day-picker';

interface CalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
  loggedDays: Date[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ selectedDate, onDateChange, loggedDays }) => {
  
  const loggedStyle = {
    fontWeight: 'bold',
    color: '#059669' // text-emerald-600
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-sm p-2 flex justify-center">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={onDateChange}
          modifiers={{ logged: loggedDays }}
          modifiersStyles={{ logged: loggedStyle }}
          showOutsideDays
          fixedWeeks
          weekStartsOn={1} // Bắt đầu tuần từ thứ 2
          className="text-sm"
        />
      </div>
    </div>
  );
};

export default CalendarView;
