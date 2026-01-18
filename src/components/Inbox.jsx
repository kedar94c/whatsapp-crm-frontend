import { useEffect } from 'react';
import { formatInBusinessTime } from '../utils/time';

export default function Inbox({ customers, selectedId, onSelect }) {
  const timezone = 'Asia/Kolkata';

  return (
    <div className="h-full bg-white border-r overflow-y-auto">

      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b font-semibold">
        Inbox
      </div>

      {/* Customer list */}
      {customers.length === 0 && (
        <div className="p-4 text-sm text-gray-500">
          No conversations yet
        </div>
      )}

      {customers.map(customer => (
        <button
          key={customer.id}
          onClick={() => onSelect(customer)}

          className={`w-full text-left px-4 py-3 border-b hover:bg-gray-100
            ${selectedId === customer.id ? 'bg-gray-100' : ''}`}
        >
          <div className="flex justify-between items-center">
            <div className="font-medium text-gray-900">
              {customer.name || customer.phone}
            </div>
            <div className="text-xs text-gray-500">
              {formatInBusinessTime(customer.last_message_time, timezone)}
            </div>
          </div>

          <div className="text-sm text-gray-600 truncate">
            {customer.last_message || ''}
          </div>
        </button>
      ))}
    </div>
  );
}