import { useEffect, useState } from 'react';
import { fetchAppointments } from '../api';
import { useBusiness } from '../context/BusinessContext';
import AppointmentForm from './AppointmentForm';

import {
  updateAppointmentStatus,
  rescheduleAppointment
} from '../api';

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { business } = useBusiness();
  const [reschedulingAppt, setReschedulingAppt] = useState(null);


  function formatInBusinessTimezone(utcISOString) {
  if (!utcISOString || !business?.timezone) return '';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: business.timezone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(utcISOString));
}
function isPast(appt) {
  return new Date(appt.appointment_time) < new Date();
  }

 function getStatusBadge(status) {
  const base =
    'inline-block px-2 py-0.5 rounded text-xs font-medium';

  switch (status) {
    case 'scheduled':
      return (
        <span className={`${base} bg-blue-100 text-blue-700`}>
          Upcoming
        </span>
      );
    case 'completed':
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          Completed
        </span>
      );
    case 'no_show':
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>
          No show
        </span>
      );
    case 'cancelled':
      return (
        <span className={`${base} bg-red-100 text-red-700`}>
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`${base} bg-gray-100 text-gray-500`}>
          {status}
        </span>
      );
  }
}


async function loadAppointments() {
  try {
    setLoading(true);
    const data = await fetchAppointments();
    setAppointments(data);
    setError(null);
  } catch (err) {
    console.error(err);
    setError('Failed to load appointments');
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  loadAppointments();
}, []);
useEffect(() => {
  document.body.style.overflow = reschedulingAppt ? 'hidden' : 'auto';
  return () => (document.body.style.overflow = 'auto');
}, [reschedulingAppt]);

useEffect(() => {
  if (!reschedulingAppt) return;

  function handleEsc(e) {
    if (e.key === 'Escape') {
      setReschedulingAppt(null);
    }
  }

  window.addEventListener('keydown', handleEsc);
  return () => window.removeEventListener('keydown', handleEsc);
}, [reschedulingAppt]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold">Appointments</h2>
      </div>

      <div className="p-4 text-sm text-gray-600">
        {loading && <div>Loading appointments…</div>}
        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && (
  <div className="space-y-2">
    {appointments.length === 0 && (
      <div className="text-gray-400">No appointments</div>
    )}

    {appointments.map(appt => (
      <div
        key={appt.id}
        className="p-3 bg-white border rounded text-sm"
      >
        <div className="font-medium">
          {appt.customers?.name || appt.customers?.phone}
        </div>

        <div className="text-gray-600">
          {appt.service || '—'}
        </div>

        <div className="text-xs text-gray-500">
          {formatInBusinessTimezone(appt.appointment_time)}
        </div>

        <div className="mt-1 text-xs uppercase text-gray-400">
          {getStatusBadge(appt.status)}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
  {appt.status === 'scheduled' && isPast(appt) && (
    <>
      <button
        className="text-xs text-green-600"
        onClick={async() =>{
         await updateAppointmentStatus(appt.id, 'completed');
         loadAppointments();
        }}
      >
        Mark completed
      </button>

      <button
        className="text-xs text-yellow-600"
        onClick={async() =>{
          await updateAppointmentStatus(appt.id, 'no_show');
          loadAppointments();
        }}
      >
        No show
      </button>

      <button
        className="text-xs text-blue-600"
        onClick={() => {setReschedulingAppt(appt);
        }}
      >
        Reschedule
      </button>
    </>
  )}

  {appt.status === 'scheduled' && !isPast(appt) && (
    <>
      <button
        className="text-xs text-red-600"
        onClick={async() =>{
          await updateAppointmentStatus(appt.id, 'cancelled');
          loadAppointments();
        }}
      >
        Cancel
      </button>

      <button
        className="text-xs text-blue-600"
      onClick={() => {setReschedulingAppt(appt);
        }}
      >
        Reschedule
      </button>
    </>
  )}

  {appt.status === 'no_show' && (
    <>
      <button
        className="text-xs text-green-600"
        onClick={() =>
          updateAppointmentStatus(appt.id, 'completed')
        }
      >
        Mark completed
      </button>

      <button
        className="text-xs text-blue-600"
        onClick={() => {setReschedulingAppt(appt);
        }}
      >
        Reschedule
      </button>
    </>
  )}

  {(appt.status === 'completed' ||
    appt.status === 'cancelled') && (
    <button
      className="text-xs text-blue-600"
      onClick={() => {setReschedulingAppt(appt);
        }}
    >
      Reschedule
    </button>
  )}
</div>

      </div>
    ))}
    
  </div>
)}
{reschedulingAppt && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
      <AppointmentForm
        selectedCustomer={{
          id: reschedulingAppt.customer_id
        }}
        appointment={reschedulingAppt}
        mode="reschedule"
        onClose={() => setReschedulingAppt(null)}
        onSuccess={loadAppointments}
      />
    </div>
  </div>
)}
{reschedulingAppt && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
    onClick={() => setReschedulingAppt(null)}   // 👈 click outside closes
  >
    <div
      className="bg-white rounded-lg w-full max-w-md shadow-lg"
      onClick={e => e.stopPropagation()}        // 👈 prevent inside click
    >
      <AppointmentForm
        selectedCustomer={{ id: reschedulingAppt.customer_id }}
        appointment={reschedulingAppt}
        mode="reschedule"
        onClose={() => setReschedulingAppt(null)}
        onSuccess={loadAppointments}
      />
    </div>
  </div>
)}

      </div>
    </div>
    
  );
}
