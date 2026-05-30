import { NavLink } from "react-router-dom";
import { LayoutDashboard, User, Users } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <aside className="w-64 bg-white border-r h-screen p-5">
      <h1 className="text-xl font-bold mb-8">CarManager</h1>
      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded-lg ${
              isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to={isAdmin ? "/users" : "/profile"}
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded-lg ${
              isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`
          }
        >
          {isAdmin ? <Users size={18} /> : <User size={18} />}
          {isAdmin ? "Usuarios" : "Mi Usuario"}
        </NavLink>
      </nav>
    </aside>
  );
}