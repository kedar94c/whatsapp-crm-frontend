const BASE_URL = 'http://localhost:3000';

export async function fetchCustomers() {
  const res = await fetch(`${BASE_URL}/customers`);
  return res.json();
}

export async function fetchMessages(customerId) {
  const res = await fetch(`${BASE_URL}/customers/${customerId}/messages`);
  return res.json();
}

export async function createAppointment(data) {
  const res = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function sendMessage(customerId, text) {
  const res = await fetch(`${BASE_URL}/messages/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: customerId,
      text
    })
  });
  return res.json();
}
