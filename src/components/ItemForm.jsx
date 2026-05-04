import { useState, useEffect } from "react";
import { getCategories, getSuppliers, createItem, createStock } from "../services/api";
import toast from "react-hot-toast";

const ItemForm = ({ onItemAdded, refresh }) => {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", sku: "", categoryId: "", supplierId: "", qty: "", minQty: "",
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [catRes, supRes] = await Promise.all([getCategories(), getSuppliers()]);
        setCategories(catRes.data);
        setSuppliers(supRes.data);
      } catch (err) {
        toast.error("Failed to load form data");
      }
    };
    fetchDropdowns();
  }, [refresh]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name.trim()) return "Item name is required";
    if (form.name.length < 2) return "Item name must be at least 2 characters";
    if (!/^[A-Za-z0-9 ]+$/.test(form.name)) return "Item name can only contain letters, numbers, and spaces";
    if (!form.sku.trim()) return "SKU is required";
    if (!/^[A-Za-z0-9-]+$/.test(form.sku)) return "SKU can only contain letters, numbers, and hyphens";
    if (form.sku.length < 3) return "SKU must be at least 3 characters (e.g. KB-001)";
    if (!form.categoryId) return "Select a category";
    if (!form.supplierId) return "Select a supplier";
    if (!form.qty || parseInt(form.qty) < 0) return "Enter a valid quantity";
    if (!form.minQty || parseInt(form.minQty) < 1) return "Minimum quantity must be at least 1";
    if (parseInt(form.qty) > 100000) return "Quantity cannot exceed 100,000";
    if (parseInt(form.minQty) > 100000) return "Minimum quantity cannot exceed 100,000";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) { toast.error(error); return; }

    setLoading(true);
    try {
      const itemRes = await createItem({
        name: form.name, description: form.description, sku: form.sku,
        category: { id: parseInt(form.categoryId) },
        supplier: { id: parseInt(form.supplierId) },
      });

      await createStock({
        item: { id: itemRes.data.id },
        qty: parseInt(form.qty),
        minQty: parseInt(form.minQty),
      });

      setForm({ name: "", description: "", sku: "", categoryId: "", supplierId: "", qty: "", minQty: "" });
      setIsOpen(false);
      toast.success(`${form.name} added successfully`);
      onItemAdded();
    } catch (err) {
      toast.error("Failed to create item. SKU might already exist.");
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
        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
          isOpen
            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
            : "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:from-indigo-600 hover:to-cyan-600 shadow-lg shadow-indigo-500/20"
        }`}
      >
        {isOpen ? "✕ Close Form" : "+ Add New Item"}
      </button>

      {isOpen && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 mt-4">
          <h2 className="text-lg font-semibold text-white mb-1">Add New Item</h2>
          <p className="text-xs text-gray-400 mb-5">Fill in all fields to create an item with its stock level</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Item Name</label>
              <input name="name" placeholder="e.g. Keyboard" value={form.name} onChange={handleChange} className={inputClass + " w-full"} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">SKU</label>
              <input name="sku" placeholder="e.g. KB-001" value={form.sku} onChange={handleChange} className={inputClass + " w-full"} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <input name="description" placeholder="Optional" value={form.description} onChange={handleChange} className={inputClass + " w-full"} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Category</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputClass + " w-full"}>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Supplier</label>
              <select name="supplierId" value={form.supplierId} onChange={handleChange} className={inputClass + " w-full"}>
                <option value="">Select Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Current Qty</label>
                <input name="qty" type="number" placeholder="0" value={form.qty} onChange={handleChange} className={inputClass + " w-full"} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Min Qty</label>
                <input name="minQty" type="number" placeholder="0" value={form.minQty} onChange={handleChange} className={inputClass + " w-full"} />
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-5 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-2.5 rounded-lg hover:from-emerald-600 hover:to-green-600 text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {loading ? "Saving..." : "Save Item"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemForm;