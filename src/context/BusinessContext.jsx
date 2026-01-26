import { createContext, useContext, useEffect, useState } from "react";
import { getMe, fetchAppointmentSettings } from "../api";

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
    const [business, setBusiness] = useState(null);
    const [appointmentSettings, setAppointmentSettings] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    

    useEffect(() => {
        async function loadBusiness() {
            const settings = await fetchAppointmentSettings();
            setAppointmentSettings(settings);

            try {
                const res = await getMe();
                setBusiness(res?.business || null);
                setUser(res?.user || null);

                setAppointmentSettings(res?.business?.appointment_settings || null);
                setUser(res?.user || null);
            } catch (err) {
                console.error("Failed to load business", err);
                setBusiness(null);
            } finally {
                setLoading(false);
            }
        }

        loadBusiness();
    }, []);

    return (
        <BusinessContext.Provider
            value={{
                business,
                user,
                appointmentSettings,
                setAppointmentSettings,
                loading,
            }}
        >
            {children}
        </BusinessContext.Provider>
    );
}

export function useBusiness() {
    return useContext(BusinessContext);
}
