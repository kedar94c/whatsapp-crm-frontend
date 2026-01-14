import { useState } from 'react';
import { sendMessage } from '../api';

export default function Conversation({ messages, customerId, onSend }) {
  const [text, setText] = useState('');

  async function handleSend() {
    if (!text.trim()) return;
    const msg = await sendMessage(customerId, text);
    onSend(msg);
    setText('');
  }

  return (
    <div style={{ padding: 10 }}>
      <h3>Conversation</h3>

      {messages.map(m => (
        <div
          key={m.id}
          style={{
            textAlign: m.direction === 'out' ? 'right' : 'left',
            margin: '6px 0'
          }}
        >
          <span
            style={{
              padding: 6,
              background: m.direction === 'out' ? '#dcf8c6' : '#eee'
            }}
          >
            {m.content}
          </span>
        </div>
      ))}

      <div style={{ marginTop: 10 }}>
        <input
          style={{ width: '80%' }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type reply..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
