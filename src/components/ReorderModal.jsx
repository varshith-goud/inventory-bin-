import { useState, useEffect } from "react";
import { getReorders, suggestReorders, updateReorderStatus } from "../services/api";
import toast from "react-hot-toast";

const ReorderModal = ({ isOpen, onClose, onUpdate }) => {
  const [reorders, setReorders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (isOpen) fetchReorders();
  }, [isOpen]);

  const fetchReorders = async () => {
    try {
      const res = await getReorders();
      setReorders(res.data);
    } catch (err) {
      toast.error("Failed to fetch reorders");
    }
  };

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const res = await suggestReorders();
      if (res.data.length === 0) {
        toast("All low stock items already have pending Reorders and have Ordered already ", { icon: "ℹ️" });
      } else {
        toast.success(`${res.data.length} new reorder(s) created`);
      }
      fetchReorders();
      onUpdate();
    } catch (err) {
      toast.error("Failed to generate reorders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateReorderStatus(id, newStatus);
      fetchReorders();
      onUpdate();
      if (newStatus === "ORDERED") toast.success("Reorder marked as ordered");
      if (newStatus === "DELIVERED") toast.success("Reorder delivered — stock updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const activeReorders = reorders.filter((r) => r.status === "PENDING" || r.status === "ORDERED");
 // 1. Filter by DELIVERED status
// 2. Sort by ID (or date) in descending order
// 3. Slice the first 5 elements
const deliveredReorders = reorders
  .filter((r) => r.status === "DELIVERED")
  .sort((a, b) => b.id - a.id) // Sorting by ID descending (assuming higher ID = newer)
  .slice(0, 5);

  const statusStyle = (status) => {
    if (status === "PENDING") return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    if (status === "ORDERED") return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">

        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Reorder Management</h2>
            <p className="text-xs text-gray-400 mt-1">Auto-suggest or manage existing reorders</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs + Suggest Button */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex bg-gray-900/50 rounded-lg p-1 gap-1">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "active"
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Active
                {activeReorders.length > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === "active" ? "bg-white/20 text-white" : "bg-gray-700 text-gray-400"
                  }`}>
                    {activeReorders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "history"
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                History
                {deliveredReorders.length > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === "history" ? "bg-white/20 text-white" : "bg-gray-700 text-gray-400"
                  }`}>
                    {deliveredReorders.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "active" && (
              <span className="text-xs text-gray-500">Use the Auto-Suggest button on the dashboard</span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {activeTab === "active" && (
            <>
              {activeReorders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-gray-300 font-medium">All clear!</p>
                  <p className="text-gray-500 text-xs mt-1">No pending or ordered reorders right now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeReorders.map((r) => (
                    <div
                      key={r.id}
                      className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="text-white font-medium">{r.item?.name}</p>
                            <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${statusStyle(r.status)}`}>
                              {r.status}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-400">
                            <span>Supplier: <span className="text-gray-300">{r.supplier?.name}</span></span>
                            <span>Qty: <span className="text-white font-semibold">{r.qty}</span></span>
                          </div>
                        </div>
                        <div>
                          {localStorage.getItem("role") === "ROLE_ADMIN" && r.status === "PENDING" && (
                            <button
                              onClick={() => handleStatusChange(r.id, "ORDERED")}
                              className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-4 py-2 rounded-lg text-xs font-medium transition-colors border border-blue-500/20"
                            >
                              Mark Ordered
                            </button>
                          )}
                          {localStorage.getItem("role") === "ROLE_ADMIN" && r.status === "ORDERED" && (
                            <button
                              onClick={() => handleStatusChange(r.id, "DELIVERED")}
                              className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-lg text-xs font-medium transition-colors border border-emerald-500/20"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "history" && (
            <>
              {deliveredReorders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-gray-300 font-medium">No delivery history yet</p>
                  <p className="text-gray-500 text-xs mt-1">Delivered reorders will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliveredReorders.map((r) => (
                    <div
                      key={r.id}
                      className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <p className="text-white font-medium">{r.item?.name}</p>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md text-xs font-medium">
                              DELIVERED
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-400">
                            <span>Supplier: <span className="text-gray-300">{r.supplier?.name}</span></span>
                            <span>Qty: <span className="text-gray-300">{r.qty}</span></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>✓ Stock updated (+{r.qty})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReorderModal;