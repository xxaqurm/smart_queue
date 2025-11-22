export default function ChatSidebar({ events, activeEvent, onEventSelect }) {
  return (
    <div className="chat-sidebar">
      <h3>Мероприятия</h3>
      <div className="events-list">
        {events.map(event => (
          <div
            key={event.id}
            className={`chat-item ${activeEvent?.id === event.id ? 'active' : ''} ${event.unreadCount > 0 ? 'unread' : ''}`}
            onClick={() => onEventSelect(event)}
          >
            <div className="chat-item-header">
              <div className="chat-item-name">{event.name}</div>
              {event.unreadCount > 0 && (
                <div className="chat-item-unread">{event.unreadCount}</div>
              )}
            </div>
            <div className="chat-item-preview">
              {event.lastMessage || 'Нет сообщений'}
            </div>
          </div>
        ))}
      </div>
      
      {events.length === 0 && (
        <div className="no-events">
          <p>Нет активных мероприятий</p>
        </div>
      )}
    </div>
  );
}