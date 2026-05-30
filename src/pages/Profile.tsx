import { useState, useEffect } from "react";
import AppLayout from "../layouts/AppLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../auth/AuthContext";
import { updateUser } from "../api/userService";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Profile() {
  const { user, token, login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return false;
    }
    if (form.password && form.password.length <= 5) {
      toast.error("La contraseña debe tener más de 5 caracteres");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData: any = {
        name: form.name,
        email: form.email,
      };
      if (form.password) {
        updateData.password = form.password;
      }

      const res = await updateUser(user.id, updateData);
      const updatedUser = { ...user, name: res.data.name, email: res.data.email };
      login(token!, updatedUser);
      toast.success("Perfil actualizado correctamente");

      setForm(prev => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      toast.error("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} toastOptions={{ duration: 5000 }} />
      <AppLayout>
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nombre" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Correo electrónico" name="email" type="email" value={form.email} onChange={handleChange} required />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña (dejar vacío para no cambiar)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 pr-10 py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 pr-10 py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button loading={loading}>Actualizar Perfil</Button>
          </form>
        </div>
      </AppLayout>
    </>
  );
}