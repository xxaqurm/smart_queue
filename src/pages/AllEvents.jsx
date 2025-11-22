import { useState } from 'react';
import EventCard from '../components/EventCard';
import { useEvents } from '../hooks/useEvents';

export default function AllEvents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Расширенный список мероприятий
  const events = [
    {
      id: 1,
      title: "Хакатон по веб-разработке",
      date: "15 декабря 2024",
      time: "10:00 - 18:00",
      location: "Главный корпус, ауд. 301",
      organizer: "IT-клуб НГТУ",
      participants: 24,
      maxParticipants: 30,
      category: "Технологии"
    },
    {
      id: 2,
      title: "Мастер-класс по публичным выступлениям",
      date: "18 декабря 2024", 
      time: "15:00 - 17:00",
      location: "Библиотека, конференц-зал",
      organizer: "Клуб ораторского искусства",
      participants: 15,
      maxParticipants: 25,
      category: "Личностный рост"
    },
    {
      id: 3,
      title: "Турнир по настольным играм",
      date: "20 декабря 2024",
      time: "18:00 - 22:00",
      location: "Студенческий клуб",
      organizer: "Клуб настольных игр",
      participants: 40,
      maxParticipants: 50,
      category: "Развлечения"
    },
    {
      id: 4,
      title: "Воркшоп по машинному обучению",
      date: "22 декабря 2024",
      time: "14:00 - 16:00",
      location: "Корпус 2, ауд. 205",
      organizer: "AI Lab НГТУ",
      participants: 18,
      maxParticipants: 20,
      category: "Технологии"
    },
    {
      id: 5,
      title: "Фотовыставка 'Город в объективе'",
      date: "25 декабря 2024",
      time: "12:00 - 19:00",
      location: "Выставочный зал",
      organizer: "Фотоклуб НГТУ",
      participants: 35,
      maxParticipants: 100,
      category: "Искусство"
    },
    {
      id: 6,
      title: "Семинар по карьерному росту",
      date: "28 декабря 2024",
      time: "11:00 - 13:00",
      location: "Карьерный центр",
      organizer: "Центр развития карьеры",
      participants: 22,
      maxParticipants: 30,
      category: "Образование"
    }
  ];

  // Фильтрация мероприятий
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Уникальные категории для фильтра
  const categories = [...new Set(events.map(event => event.category))];

  const { event, loading } = useEvents();
  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-yellow-300 py-8">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Все мероприятия</h1>
          <p className="text-xl text-gray-600">Найдите мероприятие по интересам</p>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Поиск */}
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Поиск мероприятий или организаторов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Фильтр по категориям */}
            <div className="w-full md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Все категории</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Сброс фильтров */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition font-semibold outline-none"
            >
              Сбросить
            </button>
          </div>
        </div>

        {/* Счетчик найденных мероприятий */}
        <div className="mb-6">
          <p className="text-gray-600">
            Найдено мероприятий: <span className="font-semibold">{filteredEvents.length}</span>
          </p>
        </div>

        {/* Сетка мероприятий */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          // Сообщение если ничего не найдено
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Мероприятия не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
}