import { useEffect, useState } from 'react';
import { fetchCustomers, fetchMessages } from './api';
import CustomerList from './components/CustomerList';
import Conversation from './components/Conversation';
import AppointmentForm from './components/AppointmentForm';
import Login from './components/Login';
import { supabase } from './supabase';

export default function App() {
  const [session, setSession] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);

   // Restore session on reload
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Load customers ONLY when logged in
  useEffect(() => {
    if (!session) return;
    fetchCustomers().then(setCustomers);
  }, [session]);

  async function selectCustomer(c) {
    setSelected(c);
    const msgs = await fetchMessages(c.customer_id);
    setMessages(msgs);
  }

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <CustomerList customers={customers} onSelect={selectCustomer} />
      <div style={{ width: '70%' }}>
        {selected && (
          <>
            <Conversation
              messages={messages}
              customerId={selected.customer_id}
              onSend={msg => setMessages([...messages, msg])}
            />

            <AppointmentForm customerId={selected.customer_id} />
          </>
        )}
      </div>
    </div>
  );
}

