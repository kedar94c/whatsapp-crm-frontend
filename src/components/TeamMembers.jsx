import { useBusiness } from "../context/BusinessContext";

export default function TeamMembers({ onBack }) {
  const { user, business } = useBusiness();

  // Owner-only guard
  if (!user || user.role !== "owner") {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Access denied
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <button onClick={onBack}>←</button>
        <div className="font-semibold text-lg">Team Members</div>
      </div>

      {/* Business */}
      <div className="px-4 py-3 text-sm text-gray-600 border-b bg-white">
        {business?.name}
      </div>

      {/* Members list */}
      <div className="p-4 space-y-3">
        {/* Current user */}
        <MemberCard
          email={user.email}
          role={user.role}
          isYou
        />

        {/* Placeholder */}
        <div className="mt-4 text-sm text-gray-400">
          More team members will appear here once invited.
        </div>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function MemberCard({ email, role, isYou = false }) {
  return (
    <div className="bg-white border rounded p-4 flex items-center justify-between">
      <div>
        <div className="font-medium">
          {email} {isYou && <span className="text-xs text-gray-400">(You)</span>}
        </div>
        <div className="text-sm text-gray-600 capitalize">
          {role}
        </div>
      </div>

      <div className="text-xs text-gray-400">
        Active
      </div>
    </div>
  );
}
