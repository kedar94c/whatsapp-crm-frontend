export default function AppointmentBanner({
  appointment,
  onAdd,
  onReschedule,
  onCancel,
}) {
  if (!appointment) {
    return (
      <div className="mx-4 mt-2 p-3 rounded-lg bg-blue-50 border text-sm flex justify-between items-center">
        <span>No upcoming appointment</span>
        <button
          onClick={onAdd}
          className="text-blue-600 font-medium"
        >
          Add
        </button>
      </div>
    );
  }

  const time = new Date(appointment.appointment_time).toLocaleString([], {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mx-4 mt-2 p-3 rounded-lg bg-green-50 border text-sm">
      <div className="font-medium">
        Next appointment: {time}
      </div>

      <div className="mt-2 flex gap-4">
        <button
          onClick={onReschedule}
          className="text-blue-600"
        >
          Reschedule
        </button>

        <button
          onClick={onCancel}
          className="text-red-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
