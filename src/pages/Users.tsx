import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AppLayout from "../layouts/AppLayout";
import UserList from "../components/ui/UserList";

export default function Users() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/profile");
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <AppLayout>
      <UserList />
    </AppLayout>
  );
}