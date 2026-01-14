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
  return res.json();
}

export async function fetchMessages(customerId) {
  const res = await authFetch(`${BASE_URL}/customers/${customerId}/messages`);
  return res.json();
}

export async function createAppointment(data) {
  const res = await authFetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function sendMessage(customerId, text) {
  const res = await authFetch(`${BASE_URL}/messages/send`, {
    method: 'POST',
    body: JSON.stringify({
      customer_id: customerId,
      text
    })
  });
  return res.json();
}
