import { supabase } from "./supabase";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * Central authenticated fetch helper
 * - Always hits backend (not Vite)
 * - Always returns parsed JSON
 * - Throws on non-2xx responses
 */
async function authFetch(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API ${res.status}: ${errorText}`);
  }

  return res.json();
}

/* =========================
   AUTH / CONTEXT
========================= */

export async function getMe() {
  return authFetch(`/me`);
}

/* =========================
   CUSTOMERS
========================= */

export async function fetchCustomers() {
  const json = await authFetch(`/customers`);

  return (json.data || json).map((c) => ({
    ...c,
    id: c.id || c.customer_id,
  }));
}

export async function fetchMessages(customerId) {
  return authFetch(`/customers/${customerId}/messages`);
}

/* =========================
   MESSAGES
========================= */

export async function sendMessage(customerId, text) {
  return authFetch(`/messages/send`, {
    method: "POST",
    body: JSON.stringify({
      customer_id: customerId,
      text,
    }),
  });
}

/* =========================
   APPOINTMENTS
========================= */

export async function createAppointment(payload) {
  return authFetch(`/appointments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchUpcomingAppointments() {
  return authFetch(`/appointments/upcoming`);
}

export async function fetchNextAppointment(customerId) {
  return authFetch(`/appointments/next?customerId=${customerId}`);
}

export async function fetchAppointments() {
  return authFetch('/appointments');
}

export async function updateAppointmentStatus(id, status) {
  return authFetch(`/appointments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
}

export async function markConversationRead(customerId) {
  const res = await authFetch('/conversations/read', {
    method: 'POST',
    body: JSON.stringify({ customer_id: customerId }),
  });

 if (!res.ok && res.status !== 204) {
  throw new Error('Failed to mark conversation read');
}

  return res.json();
}

export async function updateAppointmentSettings(settings) {
  return authFetch('/businesses/settings/appointments', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
}

export async function fetchAppointmentSettings() {
  return authFetch('/businesses/settings/appointments');
}

export async function fetchAvailability(date, excludeAppointmentId) {
  const params = new URLSearchParams({ date });

  if (excludeAppointmentId) {
    params.append("excludeAppointmentId", excludeAppointmentId);
  }

  return authFetch(`/appointments/availability?${params.toString()}`);
}

export async function rescheduleAppointmentSlot(id, payload) {
  return authFetch(`/appointments/${id}/reschedule-slot`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
