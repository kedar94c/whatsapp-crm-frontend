import { useState, useEffect } from 'react';
import { createAppointment, rescheduleAppointment } from '../api';
import { useBusiness } from '../context/BusinessContext';

export default function AppointmentForm({
  selectedCustomer,
  appointment = null,
  mode = 'create',
  onClose,
  onSuccess
}) {
  const { business } = useBusiness();

  const [service, setService] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);


  // Prefill when rescheduling
  useEffect(() => {
    if (mode === 'reschedule' && appointment) {
      const local = new Date(appointment.appointment_time);

      const yyyy = local.getFullYear();
      const mm = String(local.getMonth() + 1).padStart(2, '0');
      const dd = String(local.getDate()).padStart(2, '0');
      const hh = String(local.getHours()).padStart(2, '0');
      const min = String(local.getMinutes()).padStart(2, '0');

      setTime(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
      setService(appointment.service || '');
    }
  }, [mode, appointment]);
  useEffect(() => {
  setSuccess(false);
  setError('');
}, [appointment, mode]);

  async function submit() {
    setError('');

    if (!time) {
      setError('Please select date and time');
      return;
    }
     const selected = new Date(time);
       if (selected < new Date()) {
       setError('Appointment time cannot be in the past');
       return;
       }

    try {
      if (mode === 'reschedule' && appointment) {
        await rescheduleAppointment(appointment.id, time);
      } else {
        await createAppointment({
          customer_id: selectedCustomer.id,
          service,
          appointment_time: time
        });
      }

      setSuccess(true);
if (onSuccess) onSuccess();

// auto-close after 1.2s
setTimeout(() => {
  setSuccess(false);
  onClose();
}, 3000);

    } catch (err) {
      console.error(err);
      setError('Failed to save appointment');
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-medium mb-2">
        {mode === 'reschedule' ? 'Reschedule Appointment' : 'Create Appointment'}
      </h4>

      {error && (
        <p className="text-sm text-red-500 mb-2">{error}</p>
      )}

      {mode === 'create' && (
        <input
          placeholder="Service"
          value={service}
          onChange={e => setService(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2"
        />
      )}

      <input
       type="datetime-local"
       value={time}
       min={new Date().toISOString().slice(0, 16)}   // 👈 prevents past selection
       onChange={(e) => setTime(e.target.value)}
       className="w-full border rounded px-3 py-2"
      />

{success && (
  <p className="text-sm text-green-600 mb-2">
    Appointment {mode === 'reschedule' ? 'rescheduled' : 'created'} successfully
  </p>
)}

      <div className="flex gap-2">
        <button
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
          onClick={submit}
        >
          {mode === 'reschedule' ? 'Reschedule' : 'Create'}
        </button>

        <button
          className="px-3 py-1 text-sm text-gray-600"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
