import { useEffect, useState } from 'react';
import { fetchCustomers, fetchMessages, fetchNextAppointment } from './api';
import Conversation from './components/Conversation';
import AppointmentForm from './components/AppointmentForm';
import Login from './components/Login';
import { supabase } from './supabase';
import Inbox from './components/Inbox';
import { sendMessage } from './api';
import { useBusiness } from "./context/BusinessContext";
import AppointmentsTab from './components/AppointmentsTab';


export default function App() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [session, setSession] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const { business, loading } = useBusiness();

  // Restore session on reload
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Load customers after login
  useEffect(() => {
    if (!session) return;
    fetchCustomers().then(setCustomers);
  }, [session]);

   // Load messages when customer changes
  useEffect(() => {
    if (!selectedCustomer) return;
    fetchMessages(selectedCustomer.id).then(setMessages);
  }, [selectedCustomer]);

  if (!session) {
    return <Login onLogin={setSession} />;
  }

if (!session) {
  return <Login onLogin={setSession} />;
}

return (
  <div className="h-full flex flex-col">
    {/* Tabs */}
    <div className="flex border-b bg-white">
      <button
        className={`px-4 py-2 text-sm font-medium ${
          activeTab === 'inbox'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500'
        }`}
        onClick={() => setActiveTab('inbox')}
      >
        Inbox
      </button>

      <button
        className={`px-4 py-2 text-sm font-medium ${
          activeTab === 'appointments'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500'
        }`}
        onClick={() => setActiveTab('appointments')}
      >
        Appointments
      </button>
    </div>

    {/* Main content */}
    <div className="flex flex-1">
      {activeTab === 'inbox' && (
        <>
          {/* Inbox */}
          <div
            className={`w-full md:w-80 ${
              selectedCustomer ? 'hidden md:block' : ''
            }`}
          >
            <Inbox
              customers={customers}
              selectedId={selectedCustomer?.id}
              onSelect={setSelectedCustomer}
            />
          </div>

          {/* Conversation pane */}
          <div className="flex-1 flex flex-col">
            {!selectedCustomer ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a conversation
              </div>
            ) : (
              <>
                <Conversation
                  customer={selectedCustomer}
                  messages={messages}
                  onSend={async (text, existingMsgId = null) => {
                    const tempId =
                      existingMsgId || crypto.randomUUID();
                    const optimisticMsg = {
                      id: tempId,
                      content: text,
                      direction: 'out',
                      created_at: new Date().toISOString(),
                      status: 'sending',
                    };

                    // 1️⃣ Optimistic UI
                    setMessages(prev =>
                      prev
                        .map(m =>
                          m.id === tempId
                            ? { ...m, status: 'sending' }
                            : m
                        )
                        .concat(existingMsgId ? [] : optimisticMsg)
                    );

                    try {
                      // 2️⃣ Persist to backend
                      const saved = await sendMessage(
                        selectedCustomer.id,
                        text
                      );

                      // 3️⃣ Sync DB ID + mark sent
                      setMessages(prev =>
                        prev.map(m =>
                          m.id === tempId
                            ? {
                                ...m,
                                id: saved.id,
                                status: 'sent',
                              }
                            : m
                        )
                      );
                    } catch (err) {
                      console.error('Send failed', err);

                      // 4️⃣ Mark as failed
                      setMessages(prev =>
                        prev.map(m =>
                          m.id === tempId
                            ? { ...m, status: 'failed' }
                            : m
                        )
                      );
                    }
                  }}
                />

                {selectedCustomer && (
                  <AppointmentForm
                    selectedCustomer={selectedCustomer}
                    onClose={() => {}}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}
      {activeTab === 'appointments' && <AppointmentsTab />}

    </div>
  </div>
);

}