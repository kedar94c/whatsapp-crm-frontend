export default function BottomTabs({ activeTab, onChange }) {
  const tabs = [
    { id: 'appointments', label: 'Appointments', icon: '🗓️' },
    { id: 'inbox', label: 'Inbox', icon: '💬' },
    { id: 'more', label: 'More', icon: '⋮' },
  ];

  return (
    <div className="h-14 bg-white border-t flex">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 flex flex-col items-center justify-center
              transition-colors duration-200
              ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}
            `}
          >
            {/* Active indicator */}
            <div
              className={`
                h-0.5 w-6 mb-1 rounded
                ${isActive ? 'bg-blue-600' : 'bg-transparent'}
              `}
            />

            <div className="text-lg leading-none">{tab.icon}</div>
            <div className="text-xs">{tab.label}</div>
          </button>
        );
      })}
    </div>
  );
}
