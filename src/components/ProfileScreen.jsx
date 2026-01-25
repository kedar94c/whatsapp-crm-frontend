import { useBusiness } from "../context/BusinessContext";
import { supabase } from "../supabase";

export default function ProfileScreen({ onBack }) {
    const { business, user } = useBusiness();
    async function logout() {
        await supabase.auth.signOut();
        window.location.reload();
    }

    return (
        <div className="flex-1 bg-gray-50">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-white">
                <button onClick={onBack}>←</button>
                <div className="font-semibold text-lg">My Profile</div>
            </div>

            <div className="p-4 space-y-6">
                {/* User */}
                <div className="bg-white rounded border p-4">
                    <div className="text-sm text-gray-500">Account</div>

                    <div className="mt-2 font-medium">
                        {user?.email || '—'}
                    </div>

                    <div className="text-sm text-gray-600">
                        Role: {user?.role === 'owner' ? 'Owner' : 'Employee'}
                    </div>
                </div>


                {/* Business */}
                {business && (
                    <div className="bg-white rounded border p-4">
                        <div className="text-sm text-gray-500">Business</div>
                        <div className="mt-2 font-medium">{business.name}</div>
                        <div className="text-sm text-gray-600">
                            Timezone: {business.timezone}
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button
                    className="w-full py-3 bg-red-600 text-white rounded"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
