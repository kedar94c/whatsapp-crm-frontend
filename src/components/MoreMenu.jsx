import { useBusiness } from "../context/BusinessContext";
import { supabase } from "../supabase";

export default function MoreMenu({ onOpenProfile, onOpenBusinessSettings }) {
    const { user } = useBusiness();
    async function logout() {
        await supabase.auth.signOut();
        window.location.reload(); // simplest + safe
    }

    return (
        <div className="flex-1 bg-gray-50">
            <div className="p-4 border-b bg-white text-lg font-semibold">
                More
            </div>

            <div className="divide-y bg-white">
                <button
                    className="w-full px-4 py-3 text-left"
                    onClick={onOpenProfile}
                >
                    👤 My Profile
                </button>

                {user?.role === "owner" && (
                    <button
                        className="w-full px-4 py-3 text-left"
                        onClick={onOpenBusinessSettings}
                    >
                        🏢 Business Settings
                    </button>
                )}


                <button
                    className="w-full px-4 py-3 text-left text-red-600"
                    onClick={logout}
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
}
