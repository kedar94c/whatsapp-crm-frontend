import { formatInBusinessTime } from '../utils/time';

export default function Inbox({
  customers,
  loading,
  selectedId,
  unreadCustomerIds = new Set(),
  onSelect
}) {
  const timezone = 'Asia/Kolkata';

  function SkeletonRow() {
    return (
      <div className="px-4 py-3 border-b animate-pulse">
        <div className="flex justify-between">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-10 bg-gray-200 rounded" />
        </div>
        <div className="mt-2 h-3 w-48 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-r overflow-hidden">
      {/* Header (sticky) */}
      <div className="h-14 flex items-center px-4 border-b font-semibold shrink-0">
        Inbox
      </div>

      {/* Scrollable customer list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </>
        ) : customers.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">
            No conversations yet
          </div>
        ) : (
          customers.map(customer => {
            const isUnread = unreadCustomerIds.has(customer.id);

            return (
              <button
                key={customer.id}
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => onSelect(customer)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-100
                  ${selectedId === customer.id ? 'bg-gray-100' : ''}`}
              >
                {/* Top row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`truncate ${
                        isUnread
                          ? 'font-semibold text-gray-900'
                          : 'font-medium text-gray-900'
                      }`}
                    >
                      {customer.name || customer.phone}
                    </span>

                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>

                  <div
                    className={`text-xs whitespace-nowrap ${
                      isUnread ? 'text-gray-700' : 'text-gray-500'
                    }`}
                  >
                    {formatInBusinessTime(
                      customer.last_message_time,
                      timezone
                    )}
                  </div>
                </div>

                {/* Message preview */}
                <div
                  className={`text-sm truncate mt-1 ${
                    isUnread
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  {customer.last_message || ''}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
