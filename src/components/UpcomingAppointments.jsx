import { useEffect, useState } from 'react';
import { fetchUpcomingAppointments } from '../api';
import { formatLocalTime } from '../utils/time';

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchUpcomingAppointments().then(setAppointments);
  }, []);

  return (
    <div style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
      <h3>Upcoming Appointments</h3>

      {appointments.length === 0 && <p>No upcoming appointments</p>}

      {appointments.map(a => (
        <div key={a.id} style={{ marginBottom: 8 }}>
          <strong>{a.customers?.name || a.customers?.phone}</strong>
          <div>
            {a.service} — {formatLocalTime(a.appointment_time)}
          </div>
        </div>
      ))}
    </div>
  );
}
