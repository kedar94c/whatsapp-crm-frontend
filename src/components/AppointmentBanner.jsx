import { useBusiness } from "../context/BusinessContext";


export default function AppointmentBanner({ appointment }) {
  const { business } = useBusiness();

  const serviceLabel =
  appointment.appointment_services
    ?.map(s => s.services?.name)
    .filter(Boolean)
    .join(' + ') || 'Service';

  if (!appointment || !business?.timezone) return null;

  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: business.timezone,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedTime = formatter.format(
    new Date(appointment.appointment_time)
  );

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm">
      <div className="font-medium">
        📅 Upcoming Appointment
      </div>

      <div className="text-gray-700">
        {serviceLabel} at{" "}
        <span className="font-medium">{formattedTime}</span>
      </div>
    </div>
  );
}
