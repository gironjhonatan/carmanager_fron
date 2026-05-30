import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { registerRequest } from "../auth/authService";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    if (form.password.length <= 5) {
      toast.error("La contraseña debe tener más de 5 caracteres");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = form;
      await registerRequest(registerData);
      toast.success("✅ Registro exitoso. Redirigiendo al login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error("Error en el registro. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="min-h-screen flex">
        <div className="hidden md:flex w-1/2 bg-gray-900 text-white items-center justify-center p-10">
          <div>
            <h1 className="text-4xl font-bold">Bienvenido</h1>
            <p className="mt-4 text-gray-300">
              Crea tu cuenta y gestiona tus autos fácilmente
            </p>
          </div>
        </div>

        <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
          <Card>
            <h2 className="text-2xl font-bold mb-6">Crear cuenta</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="•••••••••"
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
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="•••••••••"
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

              <Button loading={loading}>Registrarme</Button>
            </form>

            <p className="text-sm mt-4 text-center text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <Link className="text-blue-600" to="/login">
                Inicia sesión
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}