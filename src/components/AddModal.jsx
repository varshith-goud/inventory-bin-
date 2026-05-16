import { useState, useEffect } from "react";
import { getCategories, getSuppliers, createCategory, createSupplier, createItem, createStock } from "../services/api";
import toast from "react-hot-toast";

const AddModal = ({ isOpen, onClose, onAdded }) => {
  const [activeTab, setActiveTab] = useState("category");
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [supForm, setSupForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [itemForm, setItemForm] = useState({
    name: "", description: "", sku: "", categoryId: "", supplierId: "", qty: "", minQty: "",
  });

  useEffect(() => {
    if (isOpen) fetchDropdowns();
  }, [isOpen]);

  const fetchDropdowns = async () => {
    try {
      const [catRes, supRes] = await Promise.all([getCategories(), getSuppliers()]);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  // Category
  const handleCatSubmit = async () => {
    if (!catForm.name.trim()) { toast.error("Category name is required"); return; }
    if (catForm.name.length < 2) { toast.error("Name must be at least 2 characters"); return; }
    if (!/^[A-Za-z0-9 ]+$/.test(catForm.name)) { toast.error("Only letters, numbers, and spaces allowed"); return; }

    setLoading(true);
    try {
      await createCategory(catForm);
      toast.success(`Category "${catForm.name}" created`);
      setCatForm({ name: "", description: "" });
      fetchDropdowns();
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  // Supplier
  const handleSupSubmit = async () => {
    if (!supForm.name.trim()) { toast.error("Supplier name is required"); return; }
    if (!supForm.email.trim()) { toast.error("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supForm.email)) { toast.error("Enter a valid email"); return; }
    if (!supForm.phone.trim()) { toast.error("Phone is required"); return; }
    if (!/^[6-9][0-9]{9}$/.test(supForm.phone.replace(/\D/g, ""))) { toast.error("Phone must start with 6-9 and be 10 digits"); return; }

    setLoading(true);
    try {
      await createSupplier(supForm);
      toast.success(`Supplier "${supForm.name}" created`);
      setSupForm({ name: "", email: "", phone: "", address: "" });
      fetchDropdowns();
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create supplier");
    } finally {
      setLoading(false);
    }
  };

  // Item
  const handleItemSubmit = async () => {
    if (!itemForm.name.trim()) { toast.error("Item name is required"); return; }
    if (itemForm.name.length < 2) { toast.error("Name must be at least 2 characters"); return; }
    if (!/^[A-Za-z0-9 ]+$/.test(itemForm.name)) { toast.error("Only letters, numbers, and spaces allowed"); return; }
    if (!itemForm.sku.trim()) { toast.error("SKU is required"); return; }
    if (!/^[A-Za-z0-9-]+$/.test(itemForm.sku)) { toast.error("SKU: letters, numbers, hyphens only"); return; }
    if (itemForm.sku.length < 3) { toast.error("SKU must be at least 3 characters"); return; }
    if (!itemForm.categoryId) { toast.error("Select a category"); return; }
    if (!itemForm.supplierId) { toast.error("Select a supplier"); return; }
    if (!itemForm.qty || parseInt(itemForm.qty) < 1) { toast.error("Enter a valid quantity"); return; }
    if (!itemForm.minQty || parseInt(itemForm.minQty) < 1) { toast.error("Min quantity must be at least 1"); return; }

    setLoading(true);
    try {
      const itemRes = await createItem({
        name: itemForm.name, description: itemForm.description, sku: itemForm.sku,
        category: { id: parseInt(itemForm.categoryId) },
        supplier: { id: parseInt(itemForm.supplierId) },
      });
      await createStock({
        item: { id: itemRes.data.id },
        qty: parseInt(itemForm.qty),
        minQty: parseInt(itemForm.minQty),
      });
      toast.success(`${itemForm.name} added successfully`);
      setItemForm({ name: "", description: "", sku: "", categoryId: "", supplierId: "", qty: "", minQty: "" });
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create item. SKU might already exist.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-400 w-full";

  const tabs = [
    { id: "category", label: "Category", color: "from-purple-500 to-indigo-500" },
    { id: "supplier", label: "Supplier", color: "from-teal-500 to-emerald-500" },
    { id: "item", label: "Item", color: "from-indigo-500 to-cyan-500" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Add New</h2>
            <p className="text-xs text-gray-400 mt-1">Create categories, suppliers, or items</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-700/50">
          <div className="flex bg-gray-900/50 rounded-lg p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* Category Tab */}
          {activeTab === "category" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Category Name</label>
                <input
                  placeholder="e.g. Electronics"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Description (optional)</label>
                <input
                  placeholder="e.g. Electronic devices and accessories"
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleCatSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2.5 rounded-lg hover:from-purple-600 hover:to-indigo-600 text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
              >
                {loading ? "Saving..." : "Create Category"}
              </button>

              {/* Existing categories */}
              {categories.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-2">Existing categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <span key={cat.id} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Supplier Tab */}
          {activeTab === "supplier" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Supplier Name</label>
                  <input
                    placeholder="e.g. Tech World"
                    value={supForm.name}
                    onChange={(e) => setSupForm({ ...supForm, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. info@tech.com"
                    value={supForm.email}
                    onChange={(e) => setSupForm({ ...supForm, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Phone</label>
                  <input
                    placeholder="e.g. 9876543210"
                    value={supForm.phone}
                    onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Address (optional)</label>
                  <input
                    placeholder="e.g. Chennai"
                    value={supForm.address}
                    onChange={(e) => setSupForm({ ...supForm, address: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                onClick={handleSupSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-2.5 rounded-lg hover:from-teal-600 hover:to-emerald-600 text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20"
              >
                {loading ? "Saving..." : "Create Supplier"}
              </button>

              {suppliers.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-2">Existing suppliers:</p>
                  <div className="flex flex-wrap gap-2">
                    {suppliers.map((sup) => (
                      <span key={sup.id} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                        {sup.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Item Tab */}
          {activeTab === "item" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Item Name</label>
                  <input
                    placeholder="e.g. Keyboard"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">SKU</label>
                  <input
                    placeholder="e.g. KB-001"
                    value={itemForm.sku}
                    onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Description (optional)</label>
                <input
                  placeholder="e.g. Mechanical keyboard"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Category</label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Supplier</label>
                  <select
                    value={itemForm.supplierId}
                    onChange={(e) => setItemForm({ ...itemForm, supplierId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Current Qty</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={itemForm.qty}
                    onChange={(e) => setItemForm({ ...itemForm, qty: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Min Qty</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={itemForm.minQty}
                    onChange={(e) => setItemForm({ ...itemForm, minQty: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                onClick={handleItemSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-2.5 rounded-lg hover:from-indigo-600 hover:to-cyan-600 text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
              >
                {loading ? "Saving..." : "Create Item"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddModal;