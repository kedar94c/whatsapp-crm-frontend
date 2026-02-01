import { useState, useEffect } from "react";
import { fetchServices, createServiceCombo } from "../api";
import toast from "react-hot-toast";

export default function AddServiceComboModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [services, setServices] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    fetchServices().then(setServices);
  }, []);

  const toggle = id => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-t-xl p-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-medium mb-4">Add Service Combo</h3>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Combo name"
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <div className="space-y-2 mb-4">
          {services.map(s => (
            <label
              key={s.id}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(s.id)}
                onChange={() => toggle(s.id)}
              />
              <span>
                {s.name} ({s.duration_minutes} min)
              </span>
            </label>
          ))}
        </div>

        <button
          className="w-full bg-blue-600 text-white py-2 rounded"
          onClick={async () => {
            if (!name || selectedIds.size === 0) {
              toast.error("Select services and name the combo");
              return;
            }

            const combo = await createServiceCombo({
              name,
              service_ids: Array.from(selectedIds),
            });

            onCreated(combo);
            toast.success("Service combo created");
            onClose();
          }}
        >
          Save Combo
        </button>
      </div>
    </div>
  );
}
