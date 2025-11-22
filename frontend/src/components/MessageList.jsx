export default function MessageList({ messages, currentUserType }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="messages-list">
      {messages.length === 0 ? (
        <div className="no-messages">
          <p>Пока нет сообщений. Начните общение!</p>
        </div>
      ) : (
        messages.map(message => (
          <div
            key={message.id}
            className={`message ${message.sender}`}
          >
            <p className="message-content">{message.text}</p>
            <div className="message-time">
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}