import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../../api/userService";
import type { User } from "../../types/user";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-md w-full max-w-sm p-6">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; userId: number | null }>({
    isOpen: false,
    userId: null,
  });
  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Estado de carga para el botón del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      toast.error("Error al cargar usuarios");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
    setEditingUser(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const validateForm = () => {
    if (!editingUser && !form.password) {
      toast.error("La contraseña es obligatoria");
      return false;
    }
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

    setIsSubmitting(true);
    try {
      if (editingUser) {
        const updateData: any = { name: form.name, email: form.email };
        if (form.password) updateData.password = form.password;
        await updateUser(editingUser.id, { ...updateData, id: editingUser.id } as User);
        toast.success("Usuario actualizado correctamente");
      } else {
        await createUser({ name: form.name, email: form.email, password: form.password });
        toast.success("Usuario creado correctamente");
      }
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch {
      toast.error("Error al guardar usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: "", confirmPassword: "" });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setConfirmDelete({ isOpen: true, userId: id });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.userId) return;
    try {
      await deleteUser(confirmDelete.userId);
      toast.success("Usuario eliminado correctamente");
      loadUsers();
    } catch {
      toast.error("Error al eliminar usuario");
    } finally {
      setConfirmDelete({ isOpen: false, userId: null });
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <Toaster position="bottom-right" reverseOrder={false} toastOptions={{ duration: 5000 }} />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => handleEdit(user)} className="text-blue-600">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(user.id)} className="text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-md w-full max-w-sm p-6">
            <h2 className="text-xl font-bold mb-4">{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nombre" name="name" value={form.name} onChange={handleChange} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {!editingUser && <span className="text-red-500">*</span>}
                  {editingUser && <span className="text-xs text-gray-500 ml-1">(dejar vacío para no cambiar)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required={!editingUser}
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

              {(form.password || editingUser) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar contraseña {form.password && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required={!!form.password}
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
              )}

              <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                {editingUser ? "Actualizar" : "Crear"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="mt-2 w-full text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, userId: null })}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
      />
    </div>
  );
}