import { useState, useEffect } from "react";
import { useBusiness } from "../context/BusinessContext";
import { updateAppointmentSettings } from "../api";
import { fetchServices } from "../api";
import AddServiceModal from './AddServiceModal';
import EditServiceModal from "./editServiceMOdal";
import { updateService } from "../api";

const TABS = {
    APPOINTMENTS: "appointments",
    AUTOMATIONS: "automations",
    SERVICES: "services",
    TEAM: "team",
};

export default function BusinessSettings({ onBack }) {
    const { business, user } = useBusiness();
    const [activeTab, setActiveTab] = useState(TABS.APPOINTMENTS);
    const { appointmentSettings, setAppointmentSettings } = useBusiness();
    const [settings, setSettings] = useState(appointmentSettings);
    const [maxAppointmentsPerSlot, setMaxAppointmentsPerSlot] = useState(
        business?.appointment_settings?.max_appointments_per_slot ?? 1
    );
    const [services, setServices] = useState([]);
    const [showAddService, setShowAddService] = useState(false); // ADD THIS LINE
    const [editingService, setEditingService] = useState(null);





    // Safety: owner-only guard
    if (!user || user.role !== "owner") {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500">
                Access denied
            </div>
        );
    }
    useEffect(() => {
        if (appointmentSettings) {
            setSettings(appointmentSettings);
        }
    }, [appointmentSettings]);

    useEffect(() => {
        if (!business?.appointment_settings) return;

        setMaxAppointmentsPerSlot(
            business.appointment_settings.max_appointments_per_slot ?? 1
        );
    }, [business]);

    useEffect(() => {
        if (activeTab !== TABS.SERVICES) return;

        fetchServices()
            .then(setServices)
            .catch(() => setServices([]));
    }, [activeTab]);


    return (
        <div className="flex flex-col h-full min-h-0 w-full max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-white">
                <button onClick={onBack}>←</button>
                <div className="font-semibold text-lg">Business Settings</div>
            </div>

            {/* Business info */}
            <div className="px-4 py-3 text-sm text-gray-600 border-b bg-white">
                {business?.name}
            </div>

            {/* Tabs */}
            <div className="flex bg-white border-b w-full max-w-full overflow-x-hidden">

                <TabButton
                    label="Appointments"
                    active={activeTab === TABS.APPOINTMENTS}
                    onClick={() => setActiveTab(TABS.APPOINTMENTS)}
                />
                <TabButton
                    label="Automations"
                    active={activeTab === TABS.AUTOMATIONS}
                    onClick={() => setActiveTab(TABS.AUTOMATIONS)}
                />
                <TabButton
                    label="Services"
                    active={activeTab === TABS.SERVICES}
                    onClick={() => setActiveTab(TABS.SERVICES)}
                />
                <TabButton
                    label="Team"
                    active={activeTab === TABS.TEAM}
                    onClick={() => setActiveTab(TABS.TEAM)}
                />

            </div>

            {/* Content */}
            <div className="flex flex-col h-full min-h-0 overflow-x-hidden max-w-full">
                {activeTab === TABS.APPOINTMENTS && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">

                        {/* Reminder timings */}
                        <div className="bg-white border rounded p-4">
                            <div className="font-medium">Reminder Timings</div>
                            <div className="text-sm text-gray-600 mb-3">
                                Automatically remind customers before appointments
                            </div>

                            <label className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    checked={settings.reminder_24h}
                                    onChange={e =>
                                        setSettings(s => ({ ...s, reminder_24h: e.target.checked }))
                                    }
                                />
                                <span>24 hours before</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={settings.reminder_2h}
                                    onChange={e =>
                                        setSettings(s => ({ ...s, reminder_2h: e.target.checked }))
                                    }
                                />
                                <span>2 hours before</span>
                            </label>
                        </div>

                        {/* No-show rule */}
                        <div className="bg-white border rounded p-4">
                            <div className="font-medium">No-show Handling</div>
                            <div className="text-sm text-gray-600 mb-3">
                                Automatically mark appointment as no-show if customer doesn’t arrive
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={5}
                                    step={5}
                                    value={settings.no_show_grace_minutes}
                                    onChange={e =>
                                        setSettings(s => ({
                                            ...s,
                                            no_show_grace_minutes: Number(e.target.value),
                                        }))
                                    }
                                    className="w-20 border rounded px-2 py-1"
                                />
                                <span className="text-sm">minutes after appointment time</span>
                            </div>
                        </div>
                        {/* Slot Setting */}
                        <div className="bg-white border rounded p-4">
                            <div className="font-medium">Appointment Slots</div>
                            <div className="text-sm text-gray-600 mb-3">
                                Max appointments per slot
                            </div>
                            <input
                                type="number"
                                min={1}
                                value={maxAppointmentsPerSlot}
                                onChange={e => setMaxAppointmentsPerSlot(Number(e.target.value))}
                                className="border rounded px-3 py-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Example: 1 = no overlap, 2 = allow 2 customers at same time
                            </p>
                        </div>

                        {/* Save */}
                        <button
                            className="w-full bg-blue-600 text-white py-3 rounded"
                            onClick={async () => {
                                try {
                                    const payload = {
                                        ...settings,
                                        max_appointments_per_slot: maxAppointmentsPerSlot,
                                    };

                                    const updated = await updateAppointmentSettings(payload);
                                    setAppointmentSettings(updated);
                                    alert('Settings saved');
                                } catch (err) {
                                    console.error('SAVE SETTINGS ERROR:', err);
                                    alert('Failed to save settings');
                                }
                            }}
                        >
                            Save Settings
                        </button>

                    </div>
                )}

                {activeTab === TABS.AUTOMATIONS && (
                    <Placeholder
                        title="Automation Rules"
                        text="Control reminder messages, follow-ups, and repeat visit logic."
                    />
                )}
                {activeTab === TABS.SERVICES && (
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 pb-24">

                        {/* Services card */}
                        <div className="bg-white border rounded p-4 w-full max-w-full overflow-hidden">
                            <div className="font-medium mb-3">Services</div>

                            {services.length === 0 ? (
                                <div className="text-sm text-gray-500">
                                    No services added yet
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {services.map(service => (
                                        <div
                                            key={service.id}
                                            className="py-3 flex items-start justify-between gap-3"
                                        >
                                            {/* Left: service info */}
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium truncate">
                                                    {service.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {service.duration_minutes} minutes
                                                </div>
                                            </div>

                                            {/* Right: actions */}
                                            <div className="flex shrink-0 gap-2">
                                                <button
                                                    className="text-xs text-blue-600"
                                                    onClick={() => setEditingService(service)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="text-xs text-red-600"
                                                    onClick={async () => {
                                                        await updateService(service.id, { is_active: false });
                                                        setServices(prev =>
                                                            prev.filter(s => s.id !== service.id)
                                                        );
                                                    }}
                                                >
                                                    Disable
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            )}
                        </div>

                        {/* Add service button — SAME AS SAVE BUTTON */}
                        <button
                            className="w-full bg-blue-600 text-white py-3 rounded"
                            onClick={() => setShowAddService(true)}
                        >
                            + Add Service
                        </button>

                    </div>
                )}

                {showAddService && (
                    <AddServiceModal
                        onClose={() => setShowAddService(false)}
                        onCreated={service =>
                            setServices(prev => [...prev, service])
                        }
                    />
                )}
                {editingService && (
                    <EditServiceModal
                        service={editingService}
                        onClose={() => setEditingService(null)}
                        onSaved={updated => {
                            setServices(prev =>
                                prev.map(s => (s.id === updated.id ? updated : s))
                            );
                        }}
                    />
                )}



                {activeTab === TABS.TEAM && (
                    <Placeholder
                        title="Team Members"
                        text="Manage who can access your business account."
                    />
                )}


            </div>
        </div>
    );
}

/* ---------------- helpers ---------------- */

function TabButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 text-sm transition-colors
        ${active
                    ? "text-blue-600 font-medium border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
        >
            {label}
        </button>
    );
}

function Placeholder({ title, text }) {
    return (
        <div className="bg-white border rounded p-4">
            <div className="font-medium">{title}</div>
            <div className="text-sm text-gray-600 mt-1">{text}</div>
            <div className="mt-3 text-xs text-gray-400">Coming soon</div>
        </div>
    );
}
