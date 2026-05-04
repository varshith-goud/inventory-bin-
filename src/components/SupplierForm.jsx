import { useState } from "react";
import { createSupplier } from "../services/api";
import toast from "react-hot-toast";

const SupplierForm = ({ onAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name.trim()) return "Supplier name is required";
    if (form.name.length < 2) return "Supplier name must be at least 2 characters";
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address";
    if (!form.phone.trim()) return "Phone number is required";
    if (!/^[0-9+\-() ]+$/.test(form.phone)) return "Enter a valid phone number";
    if (form.phone.replace(/\D/g, "").length < 10) return "Phone number must be at least 10 digits";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) { toast.error(error); return; }

    setLoading(true);
    try {
      await createSupplier(form);
      toast.success(`Supplier "${form.name}" created`);
      setForm({ name: "", email: "", phone: "", address: "" });
      setIsOpen(false);
      onAdded();
    } catch (err) {
      toast.error("Failed to create supplier");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-400";

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isOpen
            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
            : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/20"
        }`}
      >
        {isOpen ? "✕ Close" : "+ Add Supplier"}
      </button>

      {isOpen && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 mt-4">
          <h2 className="text-lg font-semibold text-white mb-1">Add New Supplier</h2>
          <p className="text-xs text-gray-400 mb-4">Add a supplier to link with items</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Supplier Name</label>
              <input
                name="name"
                placeholder="e.g. Tech World"
                value={form.name}
                onChange={handleChange}
                className={inputClass + " w-full"}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input
                name="email"
                type="email"
                placeholder="e.g. contact@techworld.com"
                value={form.email}
                onChange={handleChange}
                className={inputClass + " w-full"}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Phone</label>
              <input
                name="phone"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={handleChange}
                className={inputClass + " w-full"}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Address (optional)</label>
              <input
                name="address"
                placeholder="e.g. Chennai"
                value={form.address}
                onChange={handleChange}
                className={inputClass + " w-full"}
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2.5 rounded-lg hover:from-teal-600 hover:to-emerald-600 text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20"
          >
            {loading ? "Saving..." : "Save Supplier"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SupplierForm;