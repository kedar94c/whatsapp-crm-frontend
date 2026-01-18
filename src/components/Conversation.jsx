//import AppointmentBanner from './AppointmentBanner';
import { useBusiness } from "../context/BusinessContext";
export default function Conversation({ customer, messages,onSend }) {
  if (typeof onSend !== 'function') {
    console.error('onSend prop is missing or not a function');
    return null;
  }
  const { business } = useBusiness();

  const timeFormatter = business?.timezone
  ? new Intl.DateTimeFormat("en-IN", {
      timeZone: business.timezone,
      hour: "2-digit",
      minute: "2-digit",
    })
  : null;

function formatInBusinessTimezone(utcISOString) {
  if (!utcISOString || !timeFormatter) return "";
  return timeFormatter.format(new Date(utcISOString));
}


  return (
    <div className="flex-1 flex flex-col bg-gray-50">

      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b bg-white">
        <div className="font-semibold">
          {customer.name || customer.phone}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {(!messages || messages.length === 0) &&(
          <div className="text-center text-sm text-gray-400">
            No messages yet
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-3 py-2 rounded-lg text-sm leading-relaxed
                ${msg.direction === 'out'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 border rounded-bl-none'
                }`}
            >
              <div>{msg.content}</div>

              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                <span>
                  <span className="time">
                     {formatInBusinessTimezone(msg.created_at)}
                  </span>
                </span>

                {msg.direction === 'out' && (
                  <>
                    {msg.status === 'sending' && <span>⏳</span>}
                    {msg.status === 'sent' && <span>✓</span>}
                    {msg.status === 'failed' && <button
                      className="text-red-500"
                      onClick={() => {
                        if (!onSend) return;
                        onSend(msg.content, msg.id);
                      }}
                    >
                      ⚠ Retry
                    </button>
                    }
                  </>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="h-14 border-t bg-white flex items-center px-3 gap-2">
        <input
          id="chat-input"
          type="text"
          placeholder="Type a message"
          className="flex-1 text-sm border rounded-full px-4 py-2 focus:outline-none focus:ring"
          onKeyDown={e => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              onSend(e.target.value);
              e.target.value = '';
            }
          }}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 active:scale-95"
          onClick={() => {
            const input = document.getElementById('chat-input');
            if (!onSend) return;
            onSend(input.value);
            input.value = '';
          }}
        >
          Send
        </button>
      </div>


    </div>
  );
}
