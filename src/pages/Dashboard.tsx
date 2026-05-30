import AppLayout from "../layouts/AppLayout";
import { useEffect, useState, useMemo } from "react";
import { getCarsByUserId, createCarForUser, updateCar, deleteCar } from "../api/carService";
import type { Car } from "../types/car";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../auth/AuthContext";
import { Pencil, Trash2, X, Search } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [carToDeleteId, setCarToDeleteId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    licensePlate: "",
    color: "",
    photoUrl: "",
  });

  const loadCars = async () => {
    if (!user?.id) return;
    try {
      const res = await getCarsByUserId(user.id);
      setCars(res.data);
    } catch (error) {
      toast.error("Error al cargar los autos");
    }
  };

  const uniqueYears = useMemo(() => {
    const years = cars.map(car => String(car.year));
    return [...new Set(years)].sort((a, b) => Number(b) - Number(a));
  }, [cars]);

  const uniqueBrands = useMemo(() => {
    const brands = cars.map(car => car.brand);
    return [...new Set(brands)].sort();
  }, [cars]);

  const filteredCars = useMemo(() => {
    let result = cars;

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (car) =>
          car.licensePlate.toLowerCase().includes(term) ||
          car.model.toLowerCase().includes(term)
      );
    }

    if (filterYear) {
      result = result.filter((car) => String(car.year) === filterYear);
    }

    if (filterBrand) {
      result = result.filter((car) => car.brand === filterBrand);
    }

    return result;
  }, [cars, searchTerm, filterYear, filterBrand]);

  // 🔁 Conversión a mayúsculas en tiempo real para la placa
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "licensePlate") {
      newValue = value.toUpperCase();
    }
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const resetForm = () => {
    setForm({
      brand: "",
      model: "",
      year: "",
      licensePlate: "",
      color: "",
      photoUrl: "",
    });
    setEditingCar(null);
  };

  const validateCarData = (data: typeof form): boolean => {
    const currentYear = new Date().getFullYear();
    const yearNum = Number(data.year);

    if (isNaN(yearNum) || data.year === "") {
      toast.error("El año es obligatorio y debe ser un número");
      return false;
    }

    if (yearNum > currentYear) {
      toast.error("El año del auto no puede ser futuro");
      return false;
    }

    if (yearNum < 1900) {
      toast.error("El año debe ser mayor o igual a 1900");
      return false;
    }

    const plateRegex = /^[A-Z]{3}\d{3}$/; // Ahora espera mayúsculas (por el live transform)
    if (!plateRegex.test(data.licensePlate)) {
      toast.error("Formato de placa inválido. Debe tener 3 letras seguidas de 3 números (ej. ABC123)");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCarData(form)) return;

    try {
      const carData = {
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        licensePlate: form.licensePlate, // Ya está en mayúsculas
        color: form.color,
        photoUrl: form.photoUrl.trim() ? form.photoUrl : "POR_CARGAR",
      };

      if (editingCar) {
        await updateCar(editingCar.id, { ...carData, id: editingCar.id });
        toast.success("Auto actualizado correctamente");
      } else {
        await createCarForUser(user!.id, carData);
        toast.success("Auto creado correctamente");
      }

      setShowModal(false);
      resetForm();
      loadCars();
    } catch (error: any) {
      const errorMsg = error?.response?.data || "Error al guardar el auto";
      toast.error(errorMsg);
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setForm({
      brand: car.brand,
      model: car.model,
      year: String(car.year),
      licensePlate: car.licensePlate,
      color: car.color,
      photoUrl: car.photoUrl || "",
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setCarToDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!carToDeleteId) return;
    try {
      await deleteCar(carToDeleteId);
      toast.success("Auto eliminado correctamente");
      loadCars();
    } catch (err) {
      toast.error("Error al eliminar el auto");
    } finally {
      setShowConfirmModal(false);
      setCarToDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setCarToDeleteId(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterYear("");
    setFilterBrand("");
  };

  useEffect(() => {
    loadCars();
  }, [user]);

  return (
    <>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
        }}
      />
      <AppLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mis Autos</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + Nuevo Auto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500">Total Autos</p>
            <h2 className="text-2xl font-bold">{filteredCars.length}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500">Marcas</p>
            <h2 className="text-2xl font-bold">
              {new Set(filteredCars.map((c) => c.brand)).size}
            </h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500">Último Registro</p>
            <h2 className="text-2xl font-bold">
              {filteredCars[filteredCars.length - 1]?.year || "-"}
            </h2>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por placa o modelo
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Placa o modelo..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por año</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los años</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por marca</label>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las marcas</option>
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={clearFilters}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Marca</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Placa</th>
                <th>Color</th>
                <th>Foto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    No se encontraron autos. ¡Agrega uno nuevo!
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => (
                  <tr key={car.id} className="border-t">
                    <td className="p-3">{car.brand}</td>
                    <td className="p-3">{car.model}</td>
                    <td className="p-3">{car.year}</td>
                    <td className="p-3">{car.licensePlate}</td>
                    <td className="p-3">{car.color}</td>
                    <td className="p-3">
                      <img
                        src={
                          car.photoUrl === "POR_CARGAR"
                            ? "https://thumbs.dreamstime.com/b/carro-de-dibujos-animados-azul-deportivo-con-caracter%C3%ADsticas-exageradas-incluyendo-un-gran-spoiler-trasero-y-neum%C3%A1ticos-carreras-389103704.jpg?w=992"
                            : car.photoUrl
                        }
                        alt={car.brand}
                        className="w-20 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="flex gap-2 items-center justify-center pt-4">
                      <button onClick={() => handleEdit(car)} className="text-blue-600">
                        <Pencil size={20} />
                      </button>
                      <button onClick={() => handleDeleteClick(car.id)} className="text-red-600">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold">
                  {editingCar ? "Editar Auto" : "Nuevo Auto"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Marca"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Modelo"
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Año"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    type="number"
                    required
                  />
                  <Input
                    label="Placa"
                    name="licensePlate"
                    value={form.licensePlate}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Color"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    required
                  />
                  <div className="col-span-1">
                    <Input
                      label="URL Foto (opcional)"
                      name="photoUrl"
                      value={form.photoUrl}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {form.photoUrl && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={form.photoUrl}
                      alt="preview"
                      className="max-w-full h-40 object-cover rounded-lg border shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400?text=Sin+Imagen";
                      }}
                    />
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="flex-1">
                    {editingCar ? "Actualizar" : "Crear"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Confirmar eliminación</h3>
                <button
                  onClick={cancelDelete}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar este auto? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Eliminar
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
}