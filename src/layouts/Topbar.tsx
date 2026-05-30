import { useAuth } from "../auth/AuthContext";
import { LogOut } from "lucide-react";

export default function Topbar() {
  const { logout, user } = useAuth();
  
  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h2 className="font-semibold text-gray-700">Dashboard</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user?.name || "Usuario"}</span>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </div>
  );
}