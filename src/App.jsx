import { useEffect, useState } from 'react'; 
import Conversation from './components/Conversation'; 
import AppointmentForm from './components/AppointmentForm'; 
import Login from './components/Login';
import { supabase } from './supabase';
import Inbox from './components/Inbox'; 
import { sendMessage } from './api'; 
import { useBusiness } from "./context/BusinessContext"; 
import AppointmentsTab from './components/AppointmentsTab'; 
import { Toaster } from 'react-hot-toast'; 
import { fetchCustomers, fetchMessages, fetchNextAppointment } from './api'; 
import { markConversationRead } from './api';

export default function App() { 
  const [activeTab, setActiveTab] = useState('inbox');
  const [session, setSession] = useState(null); 
  const [customers, setCustomers] = useState([]); 
  const [selectedCustomer, setSelectedCustomer] = useState(null); 
  const [messages, setMessages] = useState([]); 
  const { business, loading } = useBusiness(); 
  const [unreadCustomerIds, setUnreadCustomerIds] = useState(new Set()); 
  const [loadingCustomers, setLoadingCustomers] = useState(true); 

  function handleIncomingMessage(msg) {
  // Only incoming here now, so just add
  setMessages(prev => [...prev, msg]);

  // Also update customer last_message (though global realtime already does it)
  setCustomers(prev =>
    prev.map(c =>
      c.id === msg.customer_id
        ? { ...c, last_message: msg.content, last_message_time: msg.created_at }
        : c
    )
  );
} 
  function openConversationFromAppointment(customerId) {
     const customer = customers.find(c => c.id === customerId); 
     if (!customer) return; 
     setActiveTab('inbox'); 
     setSelectedCustomer(customer); 
     // 🔽 persist read state 
    } 

    function upsertMessages(incoming) {
  setMessages(prev => {
    const map = new Map();

    // Existing
    prev.forEach(m => map.set(m.id, m));

    // Incoming
    incoming.forEach(m => map.set(m.id, m));

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  });
}

     // Restore session on reload 
     useEffect(() => { 
      supabase.auth.getSession().then(({ data }) => {
         setSession(data.session);
         }); 
         supabase.auth.onAuthStateChange((_event, session) => {
           setSession(session); 
          }); 
        },[]); 
        // Load customers after login 
        useEffect(() => { 
          if (!session) return; 
          fetchCustomers().then(data => { 
            setCustomers(data); const unread = new Set();
             data.forEach(c => { 
              if ( c.last_message_time && 
                (!c.last_read_at || 
                  new Date(c.last_message_time) > new Date(c.last_read_at))
                 ) { 
                  unread.add(c.customer_id);
                  } 
                });
                setUnreadCustomerIds(unread);
               });}, [session]); 

            useEffect(() => {
                 if (!session) return; 
                 setLoadingCustomers(true); 
                 fetchCustomers() 
                 .then(setCustomers) 
                 .finally(() => setLoadingCustomers(false));
                 }, [session]); 

               useEffect(() => {
  if (!session) return;
  const channel = supabase
    .channel('realtime-inbox')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      payload => {
        const msg = payload.new;
        
        // Always update last_message and last_message_time for the customer
        setCustomers(prev => {
          const updated = prev.map(c =>
            c.id === msg.customer_id
              ? {
                  ...c,
                  last_message: msg.content,
                  last_message_time: msg.created_at,
                }
              : c
          );
          // Optional: Resort by last_message_time desc if fetchCustomers doesn't
          return updated.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
        });

        // Only handle unread for incoming
        if (msg.direction === 'in') {
          setUnreadCustomerIds(prev => {
            const next = new Set(prev);
            next.add(msg.customer_id);
            return next;
          });
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [session]); // Remove selectedCustomer from deps
                  // Load messages when customer changes 
                  // 🔑 CLEAR messages when switching customers
useEffect(() => {
  if (!selectedCustomer) return;
  setMessages([]);
}, [selectedCustomer?.id]);

                  useEffect(() => {
                     if (!selectedCustomer) return; 
                     fetchMessages(selectedCustomer.id).then(fetched => {
                     upsertMessages(fetched);
                      });
                     }, [selectedCustomer]);
                     useEffect(() => {
  if (!selectedCustomer) return;
  markConversationRead(selectedCustomer.id).catch(() => {});
}, [selectedCustomer?.id]);


                  useEffect(() => { 
                     if (activeTab !== 'inbox') {
                       setSelectedCustomer(null); 
                       setMessages([]); 
                      } 
                    }, [activeTab]); 

                    if (!session) { 
                      return <Login onLogin={setSession} />;
                     } 

                     return ( 
                     <><Toaster 
                     position="top-right"
                     toastOptions={{ 
                     duration:2500,
                      }} /> 
                      <div className="h-screen flex flex-col overflow-hidden">

                        {/* Tabs */} 
                        <div className="flex border-b bg-white"> 
                          <button 
                          className={`px-4 py-2 text-sm font-medium ${activeTab === 'inbox' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                          onClick={() => setActiveTab('inbox')} 
                          > 
                          Inbox 
                          </button> 
                          <button 
                          className={`px-4 py-2 text-sm font-medium ${activeTab === 'appointments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                          onClick={() => setActiveTab('appointments')} 
                          > 
                          Appointments 
                          </button> 
                          </div> 
                          {/* Main content */} 
                          <div className="flex flex-1 overflow-hidden"> 
                            {activeTab === 'inbox' && ( 
                              <> 
                            {/* Inbox */} 
                            <div 
                            className={`w-full md:w-80 h-full overflow-hidden ${selectedCustomer ? 'hidden md:block' : ''}`}
                            > 
                            <Inbox 
                            customers={customers} 
                            loading={loadingCustomers} 
                            selectedId={selectedCustomer?.id} 
                            unreadCustomerIds={unreadCustomerIds} 
                            onSelect={customer => { 
                              setSelectedCustomer(customer); 
                            }} 
                            /> 
                            </div> 
                            {/* Conversation pane */} 
                            <div className="flex-1 flex flex-col h-full overflow-hidden"> 
                              {!selectedCustomer ? ( <div className="flex-1 flex items-center justify-center text-gray-400"> 
                              Select a conversation 
                                </div> 
                                ) : ( 
                                <> 
                                <Conversation 
                                customer={selectedCustomer} 
                                messages={messages} 
                                onSend={async (text, existingMsgId = null) => {
  const tempId = existingMsgId || crypto.randomUUID();
  const tempTimestamp = new Date().toISOString();
  const optimisticMsg = {
    id: tempId,
    content: text,
    direction: 'out',
    created_at: tempTimestamp,
    status: 'sending',
  };

  // Optimistic messages update
  setMessages(prev =>
    prev
      .map(m => m.id === tempId ? { ...m, status: 'sending' } : m)
      .concat(existingMsgId ? [] : optimisticMsg)
  );

  // 🔑 Optimistic inbox preview update (instant)
  if (selectedCustomer) {
    setCustomers(prev => {
      const updated = prev.map(c =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              last_message: text,
              last_message_time: tempTimestamp,
            }
          : c
      );
      // Optional: Resort
      return updated.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
    });
  }

  try {
    const saved = await sendMessage(selectedCustomer.id, text);

    // Sync messages
    setMessages(prev =>
      prev.map(m =>
        m.id === tempId
          ? { ...m, id: saved.id, created_at: saved.created_at, status: 'sent' }
          : m
      )
    );

    // 🔑 Sync inbox preview with real DB values (realtime will also do this)
    setCustomers(prev => {
      const updated = prev.map(c =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              last_message: saved.content,
              last_message_time: saved.created_at,
            }
          : c
      );
      // Optional: Resort
      return updated.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
    });
  } catch (err) {
    console.error('Send failed', err);
    setMessages(prev =>
      prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m)
    );
    // Optional: Revert optimistic preview on fail, or leave as-is (shows failed send as last)
  }
}}
                      onIncomingMessage={handleIncomingMessage} 
                      onReachedBottom={customerId => { 
                        markConversationRead(customerId).catch(() => {}); 
                        setUnreadCustomerIds(prev => 
                          { const next = new Set(prev); 
                            next.delete(customerId); 
                            return next; 
                          }); 
                        }} 
                        /> 
                        {selectedCustomer && ( 
                          <AppointmentForm 
                          selectedCustomer={selectedCustomer} 
                          onClose={() => { } } /> 
                        )} 
                        </> 
                        )} 
                        </div> 
                        </> 
                        )} 
                        {activeTab === 'appointments' && ( 
                          <AppointmentsTab
                           onOpenConversation={openConversationFromAppointment} 
                           /> 
                          )} 
                </div> 
            </div>
         </> 
         ); 
        }