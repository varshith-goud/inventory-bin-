import { useState } from "react";
import { createCategory } from "../services/api";
import toast from "react-hot-toast";

const CategoryForm = ({ onAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name.trim()) return "Category name is required";
    if (form.name.length < 2) return "Category name must be at least 2 characters";
    if (!/^[A-Za-z0-9 ]+$/.test(form.name)) return "Category name can only contain letters, numbers, and spaces";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) { toast.error(error); return; }

    setLoading(true);
    try {
      await createCategory({ name: form.name, description: form.description });
      toast.success(`Category "${form.name}" created`);
      setForm({ name: "", description: "" });
      setIsOpen(false);
      onAdded();
    } catch (err) {
      toast.error("Failed to create category");
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
            : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/20"
        }`}
      >
        {isOpen ? "✕ Close" : "+ Add Category"}
      </button>

      {isOpen && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 mt-4">
          <h2 className="text-lg font-semibold text-white mb-1">Add New Category</h2>
          <p className="text-xs text-gray-400 mb-4">Create a new category to group items</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Category Name</label>
              <input
                name="name"
                placeholder="e.g. Electronics"
                value={form.name}
                onChange={handleChange}
                className={inputClass + " w-full"}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description (optional)</label>
              <input
                name="description"
                placeholder="e.g. Electronic devices and accessories"
                value={form.description}
                onChange={handleChange}
                className={inputClass + " w-full"}
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2.5 rounded-lg hover:from-purple-600 hover:to-indigo-600 text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
          >
            {loading ? "Saving..." : "Save Category"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryForm;