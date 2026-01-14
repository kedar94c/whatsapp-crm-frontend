import { useState } from 'react';
import { createAppointment } from '../api';

export default function AppointmentForm({ customerId }) {
  const [service, setService] = useState('');
  const [time, setTime] = useState('');

  async function submit() {
    await createAppointment({
      customer_id: customerId,
      service,
      appointment_time: time
    });
    alert('Appointment created');
  }

  return (
    <div>
      <h4>Create Appointment</h4>
      <input
        placeholder="Service"
        value={service}
        onChange={e => setService(e.target.value)}
      />
      <input
        type="datetime-local"
        onChange={e => setTime(e.target.value)}
      />
      <button onClick={submit}>Save</button>
    </div>
  );
}
