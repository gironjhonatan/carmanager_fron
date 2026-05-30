import { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { loginRequest } from "../auth/authService";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginRequest(form);
      const { token, user } = res.data;
      setTimeout(() => {
        login(token, user);
        navigate("/");
      }, 3000);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white items-center justify-center p-10">
        <div>
          <h1 className="text-4xl font-bold">CarManager</h1>
          <p className="mt-4 text-blue-100">Administra tus vehículos de forma inteligente</p>
        </div>
      </div>
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
        <Card>
          <h2 className="text-2xl font-bold mb-6">Iniciar Sesión</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 focus:ring-blue-500 focus:border-blue-500"
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

            <Button disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin mx-auto" size={20} />
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          <p className="text-sm mt-4 text-center text-gray-500">
            ¿No tienes cuenta? <Link className="text-blue-600" to="/register">Regístrate</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}