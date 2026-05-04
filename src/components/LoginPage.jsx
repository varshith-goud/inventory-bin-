import { useState } from "react";
import { login, register } from "../services/api";
import toast from "react-hot-toast";

const LoginPage = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (form.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (!form.password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (isRegister) {
      if (form.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      if (!/[A-Z]/.test(form.password)) {
        toast.error("Password must contain at least one uppercase letter");
        return;
      }

      if (!/[0-9]/.test(form.password)) {
        toast.error("Password must contain at least one number");
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
        toast.success("Account created! You can now log in.");
        setIsRegister(false);
        setForm({ username: form.username, password: "" });
      } else {
        const res = await login(form);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("role", res.data.role);
        console.log("Login response:", res.data);
        console.log("Role stored:", res.data.role);
        toast.success(`Welcome back, ${res.data.username}!`);
        onLogin();
      }
    } catch (err) {
      if (isRegister) {
        toast.error(err.response?.data?.message || "Registration failed");
      } else {
        toast.error("Wrong username or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Inventory Bin Monitor
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {isRegister ? "Create an account to get started" : "Sign in to your account"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isRegister ? "Register" : "Login"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Username</label>
              <input
                name="username"
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-sm transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-cyan-600 text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 mt-2"
            >
              {loading
                ? isRegister ? "Creating account..." : "Signing in..."
                : isRegister ? "Create Account" : "Sign In"
              }
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setForm({ username: "", password: "" });
                  setShowPassword(false);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                {isRegister ? "Sign In" : "Register"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;