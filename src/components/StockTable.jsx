import { useState, useEffect } from "react";
import { getStockPaginated, getCategories, updateStockQty, deleteItem } from "../services/api";
import toast from "react-hot-toast";

const StockTable = ({ refresh, onUpdate }) => {
  const [stockList, setStockList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const isAdmin = localStorage.getItem("role") === "ROLE_ADMIN";

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [refresh, currentPage, pageSize, searchTerm]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, searchTerm]);

  const fetchData = async () => {
    try {
      const [stockRes, catRes] = await Promise.all([
        getStockPaginated(currentPage, pageSize, searchTerm),
        getCategories(),
      ]);
      setStockList(stockRes.data.content || []);
      setTotalPages(stockRes.data.totalPages || 1);
      setTotalItems(stockRes.data.totalElements || 0);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch stock data");
    }
  };

  const handleUpdateQty = async (id) => {
    const oldList = [...stockList];
    const newQty = parseInt(editQty);

    if (isNaN(newQty) || newQty < 0) {
      toast.error("Enter a valid quantity");
      return;
    }

    setStockList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, qty: newQty } : s))
    );
    setEditingId(null);

    try {
      await updateStockQty(id, newQty);
      toast.success("Stock quantity updated");
      onUpdate();
    } catch (err) {
      setStockList(oldList);
      toast.error("Failed to update quantity");
    }
  };

  const handleDelete = async (itemId, itemName) => {
    try {
      await deleteItem(itemId);
      toast.success(`${itemName} deleted`);
      setDeleteConfirm(null);
      onUpdate();
      fetchData();
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  // Category filter is client-side on current page data
  const filtered = selectedCategory
    ? stockList.filter((s) => s.item?.category?.id === parseInt(selectedCategory))
    : stockList;

  const startItem = totalItems === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Stock Overview</h2>
          <p className="text-xs text-gray-400">
            {totalItems > 0 ? `Showing ${startItem}–${endItem} of ${totalItems} items` : "No items yet"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors w-full sm:w-56"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <select
            className="bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            className="bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              setCurrentPage(0);
            }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase tracking-wider">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Min Qty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((stock) => (
              <tr key={stock.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3.5 font-medium text-white">{stock.item?.name}</td>
                <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">{stock.item?.sku}</td>
                <td className="px-4 py-3.5">
                  <span className="bg-gray-700 text-gray-300 px-2.5 py-1 rounded-md text-xs">
                    {stock.item?.category?.name}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-gray-300">{stock.item?.supplier?.name}</td>
                <td className="px-4 py-3.5">
                  {editingId === stock.id ? (
                    <input
                      type="number"
                      className="bg-gray-700 border border-indigo-500 text-white rounded px-2 py-1 w-20 text-sm focus:outline-none"
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdateQty(stock.id)}
                      autoFocus
                    />
                  ) : (
                    <span className="text-white font-semibold">{stock.qty}</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-gray-400">{stock.minQty}</td>
                <td className="px-4 py-3.5">
                  {stock.qty < stock.minQty ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="text-red-400 text-xs font-medium">Low</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="text-emerald-400 text-xs font-medium">OK</span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-2">
                    {editingId === stock.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateQty(stock.id)}
                          className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-600/30 text-gray-400 hover:bg-gray-600/50 px-3 py-1 rounded-md text-xs transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(stock.id);
                            setEditQty(stock.qty);
                          }}
                          className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                        >
                          Edit Qty
                        </button>
                        {isAdmin && (
                          <>
                            {deleteConfirm === stock.item?.id ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDelete(stock.item.id, stock.item.name)}
                                  className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="bg-gray-600/30 text-gray-400 hover:bg-gray-600/50 px-3 py-1 rounded-md text-xs transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(stock.item?.id)}
                                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-3xl mb-2">🔍</p>
            <p className="text-gray-400">No items found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-indigo-400 text-xs mt-2 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
          <p className="text-xs text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 0}
              className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i)
              .filter((i) => i >= currentPage - 2 && i <= currentPage + 2)
              .map((i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    i === currentPage
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages - 1}
              className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTable;