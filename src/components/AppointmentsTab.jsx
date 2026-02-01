import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAppointments, updateAppointmentStatus } from '../api';
import { useBusiness } from '../context/BusinessContext';
import AppointmentModal from "./AppointmentModal";


export default function AppointmentsTab({ onOpenConversation, onNewAppointment }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { business } = useBusiness();
    const [recentlyUpdatedId, setRecentlyUpdatedId] = useState(null);
    const [appointmentModal, setAppointmentModal] = useState(null);



    /* ---------------- helpers ---------------- */

    function updateAppointmentLocally(id, updates) {
        setAppointments(prev =>
            prev.map(appt =>
                appt.id === id ? { ...appt, ...updates } : appt
            )
        );
    }

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

    function isUpcoming(appt) {
        return appt.status === 'scheduled' && !isPast(appt);
    }

    function getStatusBadge(status) {
        const base =
            'inline-block px-2 py-0.5 rounded text-xs font-medium transition-colors duration-200';

        switch (status) {
            case 'scheduled':
                return <span className={`${base} bg-blue-100 text-blue-700`}>Upcoming</span>;
            case 'completed':
                return <span className={`${base} bg-green-100 text-green-700`}>Completed</span>;
            case 'no_show':
                return <span className={`${base} bg-yellow-100 text-yellow-700`}>No show</span>;
            case 'cancelled':
                return <span className={`${base} bg-red-100 text-red-700`}>Cancelled</span>;
            default:
                return <span className={`${base} bg-gray-100 text-gray-500`}>{status}</span>;
        }
    }

function getServiceLabel(appt) {
  const items = appt.appointment_services || [];

  const combo =
    items
      .flatMap(i => i.services?.service_combo_items || [])
      .map(i => i.service_combos)
      .filter(Boolean)[0] || null;

 if (combo) {
  return `Combo: ${combo.name}`;
}

  return items
    .map(s => s.services?.name)
    .filter(Boolean)
    .join(' + ') || '—';
}

    function hasCombo(appt) {
  return Boolean(appt.combo_id);
}

    /* ---------------- data load ---------------- */

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

    /* ---------------- modal UX ---------------- */

    useEffect(() => {
        document.body.style.overflow = appointmentModal ? 'hidden' : 'auto';
        return () => (document.body.style.overflow = 'auto');
    }, [appointmentModal]);

    useEffect(() => {
        if (!appointmentModal) return;

        function handleEsc(e) {
            if (e.key === 'Escape') setAppointmentModal(null);
        }

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [appointmentModal]);

    /* ---------------- grouping + sorting ---------------- */

    const upcomingAppointments = appointments
        .filter(isUpcoming)
        .sort((a, b) => new Date(a.appointment_time) - new Date(b.appointment_time));

    const pastAppointments = appointments
        .filter(appt => !isUpcoming(appt))
        .sort((a, b) => new Date(b.appointment_time) - new Date(a.appointment_time));

    /* ---------------- card renderer ---------------- */

    function renderAppointmentCard(appt) {
        return (
            <div
                key={appt.id}
                className={`p-3 bg-white border rounded text-sm cursor-pointer hover:bg-gray-50
          transition-all duration-200 ease-in-out
          ${recentlyUpdatedId === appt.id ? 'ring-2 ring-blue-300 bg-blue-50' : ''}
        `}
                onClick={() => onOpenConversation(appt.customer_id)}
            >
                <div className="font-medium">
                    {appt.customers?.name || appt.customers?.phone}
                </div>
               {hasCombo(appt) && (
  <div className="inline-block mt-0.5 mb-0.5 px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700">
    {getServiceLabel(appt)}
  </div>
)}


                <div className="text-gray-600">
                    {getServiceLabel(appt)}
                </div>


                <div className="text-xs text-gray-500">
                    {formatInBusinessTimezone(appt.appointment_time)}
                </div>

                <div className="mt-1">
                    {getStatusBadge(appt.status)}
                </div>

                {/* actions */}
                <div
                    className="mt-2 flex flex-wrap gap-2"
                    onClick={e => e.stopPropagation()}
                >
                    {appt.status === 'scheduled' && (
                        <>
                            {isPast(appt) ? (
                                <>
                                    <button
                                        onClick={async () => {
                                            updateAppointmentLocally(appt.id, { status: 'completed' });
                                            setRecentlyUpdatedId(appt.id);
                                            setTimeout(() => setRecentlyUpdatedId(null), 1200);

                                            try {
                                                await updateAppointmentStatus(appt.id, 'completed');
                                                toast.success('Appointment marked completed');
                                            } catch {
                                                toast.error('Failed to update appointment');
                                                loadAppointments();
                                            }
                                        }}
                                    >
                                        Mark completed
                                    </button>

                                    <button
                                        className="text-xs text-yellow-600"
                                        onClick={async () => {
                                            updateAppointmentLocally(appt.id, { status: 'no_show' });
                                            setRecentlyUpdatedId(appt.id);
                                            setTimeout(() => setRecentlyUpdatedId(null), 1200);

                                            try {
                                                await updateAppointmentStatus(appt.id, 'no_show');
                                                toast.success('Marked as no show');
                                            } catch {
                                                toast.error('Failed to update appointment');
                                                loadAppointments();
                                            }
                                        }}
                                    >
                                        No show
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="text-xs text-red-600"
                                    onClick={async () => {
                                        updateAppointmentLocally(appt.id, { status: 'cancelled' });
                                        setRecentlyUpdatedId(appt.id);
                                        setTimeout(() => setRecentlyUpdatedId(null), 1200);

                                        try {
                                            await updateAppointmentStatus(appt.id, 'cancelled');
                                            toast.success('Appointment cancelled');
                                        } catch {
                                            toast.error('Failed to cancel appointment');
                                            loadAppointments();
                                        }
                                    }}
                                >
                                    Cancel
                                </button>
                            )}

                            <button
                                className="text-xs text-blue-600"
                                onClick={() =>
                                    setAppointmentModal({
                                        appointment: appt,
                                        customer: {
                                            phone: appt.customers?.phone,
                                            name: appt.customers?.name,
                                        },
                                        isReschedule: true,
                                    })
                                }
                            >
                                Reschedule
                            </button>
                        </>
                    )}

                    {(appt.status === 'completed' ||
                        appt.status === 'cancelled' ||
                        appt.status === 'no_show') && (
                            <button
                                className="text-xs text-blue-600"
                                onClick={() =>
                                    setAppointmentModal({
                                        appointment: appt,
                                        customer: {
                                            phone: appt.customers?.phone,
                                            name: appt.customers?.name,
                                        },
                                        isReschedule: true,
                                    })
                                }
                            >
                                Reschedule
                            </button>
                        )}

                </div>
            </div>
        );
    }

    /* ---------------- render ---------------- */

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4 border-b bg-white flex items-center justify-between">
                <h2 className="text-lg font-semibold">Appointments</h2>

                {/* Desktop + */}
                <button
                    onClick={onNewAppointment}
                    className="
      hidden md:flex
      items-center gap-1
      px-3 py-1.5
      rounded
      bg-blue-600
      text-white
      text-sm
      font-medium
    "
                >
                    + New
                </button>
            </div>


            <div className="p-4 text-sm text-gray-600">
                {loading && <div>Loading appointments…</div>}
                {error && <div className="text-red-500">{error}</div>}

                {!loading && !error && (
                    <>
                        {upcomingAppointments.length > 0 && (
                            <>
                                <h3 className="text-sm font-semibold mb-2">Upcoming</h3>
                                <div className="space-y-2">
                                    {upcomingAppointments.map(renderAppointmentCard)}
                                </div>
                            </>
                        )}

                        {pastAppointments.length > 0 && (
                            <>
                                <h3 className="text-sm font-semibold mt-6 mb-2">Past</h3>
                                <div className="space-y-2">
                                    {pastAppointments.map(renderAppointmentCard)}
                                </div>
                            </>
                        )}

                        {appointments.length === 0 && (
                            <div className="text-gray-400">No appointments</div>
                        )}
                    </>
                )}
            </div>

            {/* Floating + New Appointment button */}
            <button
                onClick={onNewAppointment}
                className="
    fixed bottom-20 right-4
    md:static md:mt-4
    w-14 h-14
    rounded-full
    bg-blue-600
    text-white
    text-3xl
    flex items-center justify-center
    shadow-lg
    md:hidden
    z-40
  "
                aria-label="New appointment"
            >
                +
            </button>
            {appointmentModal && (
                <AppointmentModal
                    customer={appointmentModal.customer}
                    appointment={appointmentModal.appointment}
                    isReschedule={appointmentModal.isReschedule}
                    onClose={() => {
                        setAppointmentModal(null);
                        loadAppointments();
                    }}
                />
            )}

        </div>
    );
}
