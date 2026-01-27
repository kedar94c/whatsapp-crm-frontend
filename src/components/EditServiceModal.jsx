import { useState } from 'react';
import { createService } from '../api';
import toast from 'react-hot-toast';
import { updateService } from '../api';

export default function EditServiceModal({ service, onClose, onSaved }) {
    const [name, setName] = useState(service.name);
    const [duration, setDuration] = useState(service.duration_minutes);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-end"
            onClick={onClose}>
            <div className="bg-white w-full rounded-t-xl p-4">
                <h3 className="font-medium mb-4">Edit Service</h3>

                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-3"
                />

                <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60, 75, 90, 120].map(min => (
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


                <button
                    className="w-full bg-blue-600 text-white py-2 rounded"
                    onClick={async () => {
                        const updated = await updateService(service.id, {
                            name,
                            duration_minutes: duration,
                        });
                        onSaved(updated);
                        onClose();
                    }}
                >
                    Save
                </button>
            </div>
        </div>
    );
}
