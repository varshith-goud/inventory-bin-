import { useState } from "react";

const TopBar = ({ onLogout, onSuggest, suggesting, onOpenReorders, pendingReorders, onOpenAdd }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const isAdmin = role === "ROLE_ADMIN";

  return (
    <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left — Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IB</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Inventory Bin Monitor
              </span>
            </h1>
          </div>

          {/* Right — Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={onOpenAdd}
                className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white w-9 h-9 rounded-lg flex items-center justify-center hover:from-indigo-600 hover:to-cyan-600 transition-all shadow-lg shadow-indigo-500/20 text-lg font-bold"
              >
                +
              </button>
            )}

            <button
              onClick={onSuggest}
              disabled={suggesting}
              className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-lg hover:bg-amber-500/20 transition-all text-sm font-medium disabled:opacity-50"
            >
              {suggesting ? "Checking..." : "Auto-Suggest"}
            </button>

            <button
              onClick={onOpenReorders}
              className="relative bg-orange-500/10 text-orange-400 border border-orange-500/20 px-4 py-2 rounded-lg hover:bg-orange-500/20 transition-all text-sm font-medium"
            >
              Reorders
              {pendingReorders > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {pendingReorders}
                </span>
              )}
            </button>

            <div className="w-px h-8 bg-gray-700 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                <span className="text-indigo-400 text-sm font-bold">
                  {username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-300 text-sm">{username}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isAdmin
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}>
                {isAdmin ? "Admin" : "Employee"}
              </span>
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-red-400 text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Right — Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-gray-700/50 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                <span className="text-indigo-400 text-sm font-bold">
                  {username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-300 text-sm">{username}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isAdmin
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}>
                {isAdmin ? "Admin" : "Employee"}
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={() => { onOpenAdd(); setMenuOpen(false); }}
                className="w-full text-left bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-2.5 rounded-lg text-sm font-medium"
              >
                + Add New
              </button>
            )}
            <button
              onClick={() => { onSuggest(); setMenuOpen(false); }}
              disabled={suggesting}
              className="w-full text-left bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {suggesting ? "Checking..." : "Auto-Suggest Reorders"}
            </button>
            <button
              onClick={() => { onOpenReorders(); setMenuOpen(false); }}
              className="w-full text-left bg-orange-500/10 text-orange-400 border border-orange-500/20 px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              View Reorders {pendingReorders > 0 && `(${pendingReorders})`}
            </button>
            <button
              onClick={onLogout}
              className="w-full text-left text-red-400 px-4 py-2.5 rounded-lg text-sm hover:bg-red-500/10 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopBar;