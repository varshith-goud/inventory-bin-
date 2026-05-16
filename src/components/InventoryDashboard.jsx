import { useState, useEffect } from "react";
import { getStock, getStockBelowMin, getReorders, suggestReorders } from "../services/api";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import StockTable from "./StockTable";
import ReorderModal from "./ReorderModal";
import AddModal from "./AddModal";
import TopBar from "./TopBar";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

const InventoryDashboard = ({ onLogout }) => {
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [pendingReorders, setPendingReorders] = useState(0);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    // Poll every 30 seconds to catch background changes (auto-suggest, etc.)
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refresh]);

  const fetchDashboardData = async () => {
    try {
      const [stockRes, lowRes, reorderRes] = await Promise.all([
        getStock(),
        getStockBelowMin(),
        getReorders(),
      ]);

      const stockData = stockRes.data;
      setTotalItems(stockData.length);
      setTotalStock(stockData.reduce((sum, s) => sum + s.qty, 0));
      setLowStockCount(lowRes.data.length);
      setLowStockItems(lowRes.data);
      setPendingReorders(reorderRes.data.filter((r) => r.status === "PENDING").length);

      // Bar chart: total stock qty per category
      const qtyMap = {};
      stockData.forEach((s) => {
        const cat = s.item?.category?.name || "Uncategorized";
        qtyMap[cat] = (qtyMap[cat] || 0) + s.qty;
      });
      setBarData(Object.entries(qtyMap).map(([name, qty]) => ({ category: name, stock: qty })));

      // Pie chart: item count per category
      const countMap = {};
      stockData.forEach((s) => {
        const cat = s.item?.category?.name || "Uncategorized";
        countMap[cat] = (countMap[cat] || 0) + 1;
      });
      setPieData(Object.entries(countMap).map(([name, count]) => ({ name, value: count })));
    } catch (err) {
      console.error("Failed to load dashboard", err);
    }
  };

  const triggerRefresh = () => setRefresh((prev) => prev + 1);

  const handleSuggestReorder = async () => {
    setSuggesting(true);
    try {
      const res = await suggestReorders();
      if (res.data.length === 0) {
        toast("All low stock items already have pending or ordered reorders", { icon: "ℹ️" });
      } else {
        toast.success(`${res.data.length} new reorder(s) created`);
      }
      triggerRefresh();
    } catch (err) {
      toast.error("Failed to generate reorders");
    } finally {
      setSuggesting(false);
    }
  };

  const CustomTooltipBar = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
          <p className="text-gray-300 text-xs mb-1">{label}</p>
          <p className="text-white font-bold text-sm">{payload[0].value} units</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipPie = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
          <p className="text-gray-300 text-xs mb-1">{payload[0].name}</p>
          <p className="text-white font-bold text-sm">{payload[0].value} items</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Top Bar */}
      <TopBar
        onLogout={onLogout}
        onSuggest={handleSuggestReorder}
        suggesting={suggesting}
        onOpenReorders={() => setReorderOpen(true)}
        pendingReorders={pendingReorders}
        onOpenAdd={() => setAddOpen(true)}
      />

      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Items</p>
                <p className="text-3xl font-bold mt-2 text-white">{totalItems}</p>
              </div>
              <div className="w-11 h-11 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Stock</p>
                <p className="text-3xl font-bold mt-2 text-cyan-400">{totalStock}</p>
              </div>
              <div className="w-11 h-11 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 hover:border-red-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Low Stock</p>
                <p className="text-3xl font-bold mt-2 text-red-400">{lowStockCount}</p>
              </div>
              <div className="w-11 h-11 bg-red-500/10 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Pending</p>
                <p className="text-3xl font-bold mt-2 text-amber-400">{pendingReorders}</p>
              </div>
              <div className="w-11 h-11 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔄</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Bar Chart */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-1">Stock by Category</h2>
            <p className="text-xs text-gray-400 mb-6">Total quantity per category</p>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} barSize={45}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={{ stroke: "#4b5563" }} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={{ stroke: "#4b5563" }} />
                  <Tooltip content={<CustomTooltipBar />} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
                  <Bar dataKey="stock" radius={[6, 6, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">No data</p>
            )}
          </div>

          {/* Donut Chart */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-1">Items per Category</h2>
            <p className="text-xs text-gray-400 mb-6">Distribution of items across categories</p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipPie />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-gray-300 text-xs ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">No data</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur border border-red-500/20 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              <h2 className="text-lg font-semibold text-red-400">Low Stock Alerts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockItems.map((stock) => {
                const percent = Math.round((stock.qty / stock.minQty) * 100);
                const barColor =
                  percent < 25 ? "bg-red-500" : percent < 50 ? "bg-orange-500" : "bg-yellow-500";
                return (
                  <div
                    key={stock.id}
                    className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 hover:border-red-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium text-sm">{stock.item?.name}</p>
                        <p className="text-gray-500 text-xs">{stock.item?.category?.name}</p>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">{stock.item?.sku}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                      <span>{stock.qty} / {stock.minQty} units</span>
                      <span className="text-red-400 font-medium">Need {stock.minQty - stock.qty}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`${barColor} h-2 rounded-full transition-all`}
                        style={{ width: `${Math.max(percent, 3)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock Table */}
        <StockTable refresh={refresh} onUpdate={triggerRefresh} />

        {/* Reorder Modal */}
        <ReorderModal
          isOpen={reorderOpen}
          onClose={() => setReorderOpen(false)}
          onUpdate={triggerRefresh}
        />

        {/* Add Modal — Admin only */}
        <AddModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onAdded={triggerRefresh}
        />
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;