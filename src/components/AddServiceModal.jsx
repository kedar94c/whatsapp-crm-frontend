import { useState } from 'react';
import { createService } from '../api';
import toast from 'react-hot-toast';

export default function AddServiceModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Service name required');
      return;
    }

    setLoading(true);
    try {
      const service = await createService({
        name: name.trim(),
        duration_minutes: duration,
      });

      toast.success('Service added');
      onCreated(service);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add service');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-t-xl p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="font-semibold text-lg mb-4">Add Service</div>

        <div className="mb-4">
          <label className="text-sm font-medium block mb-1">
            Service name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. Haircut"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
  {[15, 30, 45, 60, 75,90, 120].map(min => (
    <button
      key={min}
      onClick={() => setDuration(min)}
      className={`py-2 rounded border text-sm
        ${duration === min
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white"}
      `}
    >
      {min} min
    </button>
  ))}
</div>


        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          >
            Save
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
