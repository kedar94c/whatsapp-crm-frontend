import { useState, useEffect } from "react";
import { useBusiness } from "../context/BusinessContext";
import {
  createAppointment,
  rescheduleAppointmentSlot,
} from "../api";

import { fetchAvailability } from "../api";
import toast from "react-hot-toast";
import { fetchServices } from "../api";



export default function AppointmentModal({
  customer,
  appointment = null,
  isReschedule = false, //"create" | "reschedule",
  onClose,
}) {
  const [phone, setPhone] = useState(customer?.phone || "");
  const [name, setName] = useState(customer?.name || "");
  const isCustomerKnown = Boolean(customer);
  const canEditName = !customer?.name;
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { business } = useBusiness();
  const { appointmentSettings } = useBusiness();
  const [availability, setAvailability] = useState({});
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]); // array
  const totalDurationMinutes = selectedServices.reduce(
    (sum, s) => sum + s.duration_minutes,
    0
  );






  // Existing appointment slot (UTC minutes)
  const existingSlotMinutes = appointment
    ? new Date(appointment.appointment_time).getUTCHours() * 60 +
    new Date(appointment.appointment_time).getUTCMinutes()
    : null;



  const maxPerSlot =
    appointmentSettings?.max_appointments_per_slot ?? 1;

  const bookedCounts = availability

  const todayISO = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayISO);

  function formatMinutesToLocalTime(minutes, timezone) {
    const utcDate = new Date(Date.UTC(1970, 0, 1, 0, minutes));

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(utcDate);
  }

  function generateSlots(startHour, endHour, duration) {
    const slots = [];
    let minutes = localHourToUtcMinutes(
      startHour,
      0,
      business.timezone,
      selectedDate
    );

    const endMinutes = localHourToUtcMinutes(
      endHour,
      0,
      business.timezone,
      selectedDate
    );

    while (minutes + duration <= endMinutes) {
      const booked = bookedCounts[minutes] || 0;

      slots.push({
        startMinutes: minutes,
        label: formatMinutesToLocalTime(minutes, business.timezone),
        available: booked < maxPerSlot,
      });

      minutes += duration;
    }

    return slots;
  }

  function localHourToUtcMinutes(hour, minute, timezone, date) {
    const [y, m, d] = date.split("-").map(Number);

    // create local datetime
    const localDate = new Date(
      y,
      m - 1,
      d,
      hour,
      minute,
      0
    );

    // convert to UTC minutes since midnight
    return (
      localDate.getUTCHours() * 60 +
      localDate.getUTCMinutes()
    );
  }


  const slots =
    totalDurationMinutes > 0
      ? generateSlots(8, 20, totalDurationMinutes)
      : [];


  function buildUtcDateTime(date, startMinutes) {
    const [year, month, day] = date.split("-").map(Number);

    const hours = Math.floor(startMinutes / 60);
    const minutes = startMinutes % 60;

    // ✅ Explicit UTC construction — NO local timezone involved
    return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0))
      .toISOString();
  }
  useEffect(() => {
    fetchServices()
      .then(data => {
        setServices(data || []);
        if (data?.length) {
          setSelectedServices([data[0]]); // 👈 array
        }
      })
      .catch(() => {
        setServices([]);
        setSelectedServices([]);
      });
  }, []);


  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate, selectedServices]);

  useEffect(() => {
    if (!selectedDate) return;

    fetchAvailability(
      selectedDate,
      isReschedule ? appointment?.id : null
    )
      .then(res => {
        setAvailability(res.slots || {});
      })
      .catch(() => {
        setAvailability({});
      });
  }, [selectedDate, isReschedule, appointment?.id]);



  useEffect(() => {
    if (!isReschedule || !appointment) return;

    const localDate = new Date(appointment.appointment_time)
      .toISOString()
      .slice(0, 10);

    setSelectedDate(localDate);
  }, [isReschedule, appointment]);

  useEffect(() => {
    if (!isReschedule || !existingSlotMinutes) return;

    setSelectedSlot(existingSlotMinutes);
  }, [isReschedule, existingSlotMinutes]);

if (!selectedServices) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="bg-white w-full rounded-t-xl p-4">
        <div className="text-sm text-gray-500">
          No services configured. Please add services in Business Settings.
        </div>

        <button
          className="mt-4 w-full bg-gray-100 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}




  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-t-xl p-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">
          Create Appointment
        </h3>

        {/* Customer section */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1">
            Phone number
          </label>

          <input
            type="tel"
            disabled={isCustomerKnown || isReschedule}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Enter phone number"
            className="w-full border rounded px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium block mb-1">
            Name (optional)
          </label>

          <input
            type="text"
            // disabled={isReschedule || (isCustomerKnown && !canEditName)}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Customer name"
            className="w-full border rounded px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>

        {/* Date selection */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1">
            Appointment date
          </label>

          <input
            type="date"
            value={selectedDate}
            min={todayISO}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Service selection */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1">
            Service
          </label>

          <select
            value={selectedServices[0]?.id || ""}
            onChange={e => {
              const service = services.find(s => s.id === e.target.value);
              setSelectedServices(service ? [service] : []);
            }}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} ({service.duration_minutes} min)
              </option>
            ))}
          </select>


        </div>

        {/* Slot picker */}
        <div className="mb-6">
          <div className="text-sm font-medium mb-2">
            Select time slot
          </div>

          <div className="grid grid-cols-4 gap-1">
            {slots.map(slot => {
              const isSelected = selectedSlot === slot.startMinutes;

              return (
                <button
                  key={slot.startMinutes}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.startMinutes)}
                  className={`
            py-2 rounded text-sm border
            ${!slot.available
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white hover:bg-blue-50"
                    }
          `}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            disabled={!selectedSlot || selectedServices.length === 0}
            onClick={async () => {
              try {
                const appointmentUtcTime = buildUtcDateTime(
                  selectedDate,
                  selectedSlot
                );


                if (isReschedule && appointment) {
                  await rescheduleAppointmentSlot(appointment.id, {
                    appointment_utc_time: appointmentUtcTime,
                    duration_minutes: appointment.duration_minutes, // unchanged
                  }
                  );
                  toast.success("Appointment Rescheduled");
                } else {
                  await createAppointment({
                    phone,
                    name,
                    service: selectedServices[0].name, // BACKWARD COMPAT
                    duration_minutes: totalDurationMinutes,
                    appointment_utc_time: appointmentUtcTime,
                  });
                  toast.success("Appointment created");
                }


                onClose();
              } catch (err) {
                console.error(err);
                toast.error("Failed to save appointment");
              }
            }}
          >
            {isReschedule ? "Reschedule" : "Create"}
          </button>

          <button
            className="flex-1 bg-gray-100 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
