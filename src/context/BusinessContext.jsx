import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../api";

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusiness() {
      try {
        const res = await getMe();

        // EXPECTATION:
        // res.business = { id, name, timezone, ... }
        setBusiness(res?.business || null);
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
    <BusinessContext.Provider value={{ business, loading }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
