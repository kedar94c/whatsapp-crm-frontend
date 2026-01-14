import { useEffect, useState } from 'react';
import { fetchCustomers, fetchMessages } from './api';
import CustomerList from './components/CustomerList';
import Conversation from './components/Conversation';
import AppointmentForm from './components/AppointmentForm';

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchCustomers().then(setCustomers);
  }, []);

  async function selectCustomer(c) {
    setSelected(c);
    const msgs = await fetchMessages(c.customer_id);
    setMessages(msgs);
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

