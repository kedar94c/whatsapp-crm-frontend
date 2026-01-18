import { supabase } from './supabase';

const BASE_URL = 'http://localhost:3000';

async function authFetch(url, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
    return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
}

export async function fetchCustomers() {
  const res = await authFetch(`${BASE_URL}/customers`);
  const json = await res.json();

  return (json.data || json).map(c => ({
    ...c,
    id: c.id || c.customer_id
  }));
}

export async function fetchMessages(customerId) {
  const res = await authFetch(`${BASE_URL}/customers/${customerId}/messages`);
  return res.json();
}

export async function createAppointment(payload) {
  const res = await authFetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
  const errorText = await res.text();
  console.error('APPOINTMENT API ERROR:', errorText);
  throw new Error(errorText);
}
  return res.json();
}


export async function sendMessage(customerId, text) {
  const res = await authFetch(`${BASE_URL}/messages/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_id: customerId,
      text,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to send message');
  }

  return res.json();
} 

export async function fetchUpcomingAppointments() {
  const res = await authFetch(`${BASE_URL}/appointments/upcoming`);
  return res.json();
}
export async function fetchNextAppointment(customerId) {
  const res = await authFetch(
    `${BASE_URL}/appointments/upcoming?customer_id=${customerId}`
  );

  if (!res.ok) {
    return null;
  }

  const data = await res.json();

  // If backend returns array
  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }

  // If backend returns single object
  if (data && data.id) {
    return data;
  }

  return null;
}

