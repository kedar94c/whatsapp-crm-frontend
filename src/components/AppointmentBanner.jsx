import { useBusiness } from "../context/BusinessContext";


export default function AppointmentBanner({ appointment }) {
  const { business } = useBusiness();
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
const combo = appointment.service_combos || null;
const isCombo = Boolean(combo);

const serviceLabel =
  appointment.appointment_services
    ?.map(s => s.services?.name)
    .filter(Boolean)
    .join(' + ') || 'Service';




  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm">
      <div className="font-medium">📅 Upcoming Appointment</div>

      {isCombo && (
        <div className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700">
          Combo: {combo.name}
        </div>
      )}

      <div className="text-gray-700">
        {serviceLabel} at{" "}
        <span className="font-medium">{formattedTime}</span>
      </div>
    </div>
  );
}
