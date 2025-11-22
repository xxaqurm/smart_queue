import { Link } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { useState } from 'react'; // ← Добавь этот импорт

export default function EventCard({ event }) {
  const participationPercent = (event.participants / event.maxParticipants) * 100;
  const [isLoading, setIsLoading] = useState(false); // ← Добавь состояние загрузки

  const handleRegister = async () => {
    if (isLoading) return; // ← Защита от повторного нажатия
    
    setIsLoading(true);
    try {
      await eventAPI.registerForEvent(event.id);
      alert('✅ Вы успешно записались на мероприятие!');
    } catch (error) {
      console.error('Ошибка записи:', error);
      alert('❌ Не удалось записаться. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer flex flex-col h-full">
      {/* Бейдж категории */}
      <div className="bg-stone-200 text-stone-700 text-sm font-semibold px-3 py-1">
        {event.category}
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        {/* Заголовок */}
        <h3 className="text-xl font-bold text-gray-800 mb-3">{event.title}</h3>
        
        {/* Информация о мероприятии */}
        <div className="space-y-2 text-gray-600 flex-1">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⏰</span>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👤</span>
            <span>{event.organizer}</span>
          </div>
        </div>

        {/* Прогресс-бар участников */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Участники:</span>
            <span>{event.participants}/{event.maxParticipants}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full" 
              style={{ width: `${participationPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Кнопка записи */}
        <button 
          onClick={handleRegister} // ← Добавь обработчик клика
          disabled={isLoading} // ← Блокировка при загрузке
          className={`w-full mt-4 py-3 rounded-lg transition-colors font-semibold focus:outline-none ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed text-white' 
              : 'bg-stone-500 hover:bg-stone-600 text-white'
          }`}
        >
          {isLoading ? 'Записываем...' : 'Записаться'} {/* ← Меняющийся текст */}
        </button>
      </div>
    </div>
  );
}