import { useState } from 'react';
import { createAppointment } from '../api';
import { convertToUTC } from '../utils/time';

export default function AppointmentForm({ selectedCustomer, onClose }) {
  const [service, setService] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const timezone = 'Asia/Kolkata';

  async function submit() {
    setError('');
    
    if (!service || !time) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const utcTime = convertToUTC(time, timezone);
      const payload = {
        customer_id: selectedCustomer.id,
        service,
        appointment_time: utcTime
      };
      await createAppointment(payload);
      alert('Appointment created');
      onClose();
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Submit error:', err);
    }
  }

  return (
    <div>
      <h4>Create Appointment</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        placeholder="Service"
        value={service}
        onChange={e => setService(e.target.value)}
      />
      <input
        type="datetime-local"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <button onClick={submit}>Save</button>
    </div>
  );
}