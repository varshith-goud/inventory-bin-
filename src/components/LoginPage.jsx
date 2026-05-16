import { useState, useEffect } from "react";
import { login, register } from "../services/api";
import toast from "react-hot-toast";

const LoginPage = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [touched, setTouched] = useState({});
  const [strength, setStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setTouched({ ...touched, [name]: true });
  };

  // Password strength calculator
  useEffect(() => {
    if (!isRegister) return;
    let score = 0;
    const p = form.password;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    setStrength(score);
  }, [form.password, isRegister]);

  // Real-time validation
  const getFieldError = (field) => {
    if (!touched[field]) return null;
    switch (field) {
      case "username":
        if (!form.username.trim()) return "Username is required";
        if (form.username.length < 3) return "At least 3 characters";
        if (!/^[A-Za-z0-9_ ]+$/.test(form.username)) return "Letters, numbers, underscore and spaces only";
        return null;
      case "password":
        if (!form.password) return "Password is required";
        if (isRegister) {
          if (form.password.length < 6) return "At least 6 characters";
          if (!/[A-Z]/.test(form.password)) return "Need one uppercase letter";
          if (!/[0-9]/.test(form.password)) return "Need one number";
        }
        return null;
      case "confirmPassword":
        if (!form.confirmPassword) return "Confirm your password";
        if (form.password !== form.confirmPassword) return "Passwords don't match";
        return null;
      default:
        return null;
    }
  };

  const isFieldValid = (field) => {
    if (!touched[field]) return null;
    return getFieldError(field) === null;
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-400"];
  const strengthTextColor = ["", "text-red-400", "text-orange-400", "text-yellow-400", "text-emerald-400", "text-emerald-300"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched (for UI indicators)
    const allTouched = { username: true, password: true };
    if (isRegister) allTouched.confirmPassword = true;
    setTouched(allTouched);


    // Username checks
    if (!form.username.trim()) { toast.error("Username is required"); return; }
    if (form.username.length < 3) { toast.error("Username must be at least 3 characters"); return; }
    if (!/^[A-Za-z0-9_ ]+$/.test(form.username)) { toast.error("Username: letters, numbers, underscore and spaces only"); return; }

    // Password checks
    if (!form.password) { toast.error("Password is required"); return; }
    if (isRegister) {
        if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
        if (!/[A-Z]/.test(form.password)) { toast.error("Password needs one uppercase letter"); return; }
        if (!/[0-9]/.test(form.password)) { toast.error("Password needs one number"); return; }
    }

    // Confirm password check
    if (isRegister) {
        if (!form.confirmPassword) { toast.error("Please confirm your password"); return; }
        if (form.password !== form.confirmPassword) { toast.error("Passwords don't match"); return; }
    }
    setLoading(true);
    try {
      if (isRegister) {
        await register({ username: form.username, password: form.password, role: "ROLE_EMPLOYEE" });
        toast.success("Account created! You can now log in.");
        setIsRegister(false);
        setForm({ username: form.username, password: "", confirmPassword: "" });
        setTouched({});
      } else {
        const res = await login({ username: form.username, password: form.password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("role", res.data.role);
        toast.success(`Welcome back, ${res.data.username}!`);
        onLogin();
      }
    } catch (err) {
      if (isRegister) {
        toast.error(err.response?.data?.message || "Registration failed");
      } else {
        const msg = err.response?.data?.message || "Wrong username or password";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputWrapperClass = (field) => {
    const valid = isFieldValid(field);
    if (valid === null) return "border-gray-600";
    return valid ? "border-emerald-500/50" : "border-red-500/50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">IB</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Inventory Bin Monitor
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {isRegister ? "Create an employee account" : "Sign in to your account"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isRegister ? "Register" : "Login"}
          </h2>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Username</label>
              <div className="relative">
                <input
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  className={`w-full bg-gray-700 border text-white rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none transition-colors placeholder-gray-400 ${inputWrapperClass("username")}`}
                />
                {touched.username && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                    {isFieldValid("username") ? "✅" : "❌"}
                  </span>
                )}
              </div>
              {getFieldError("username") && (
                <p className="text-red-400 text-xs mt-1.5">{getFieldError("username")}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === "Enter" && !isRegister && handleSubmit(e)}
                  className={`w-full bg-gray-700 border text-white rounded-lg px-4 py-3 pr-20 text-sm focus:outline-none transition-colors placeholder-gray-400 ${inputWrapperClass("password")}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {touched.password && (
                    <span className="text-sm">{isFieldValid("password") ? "✅" : "❌"}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-200 text-sm transition-colors"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              {getFieldError("password") && (
                <p className="text-red-400 text-xs mt-1.5">{getFieldError("password")}</p>
              )}

              {/* Password strength meter — registration only */}
              {isRegister && form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          strength >= level ? strengthColor[strength] : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs font-medium ${strengthTextColor[strength]}`}>
                      {strengthLabel[strength]}
                    </p>
                    <div className="flex gap-2 text-[10px] text-gray-500">
                      <span className={form.password.length >= 6 ? "text-emerald-400" : ""}>6+ chars</span>
                      <span className={/[A-Z]/.test(form.password) ? "text-emerald-400" : ""}>ABC</span>
                      <span className={/[0-9]/.test(form.password) ? "text-emerald-400" : ""}>123</span>
                      <span className={/[^A-Za-z0-9]/.test(form.password) ? "text-emerald-400" : ""}>@#$</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password — registration only */}
            {isRegister && (
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    className={`w-full bg-gray-700 border text-white rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none transition-colors placeholder-gray-400 ${inputWrapperClass("confirmPassword")}`}
                  />
                  {touched.confirmPassword && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                      {isFieldValid("confirmPassword") ? "✅" : "❌"}
                    </span>
                  )}
                </div>
                {getFieldError("confirmPassword") && (
                  <p className="text-red-400 text-xs mt-1.5">{getFieldError("confirmPassword")}</p>
                )}
              </div>
            )}

            {/* Role badge — registration only */}
            {isRegister && (
              <div className="flex items-center gap-2 bg-gray-700/30 rounded-lg px-4 py-2.5">
                <span className="text-xs text-gray-400">Role:</span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-0.5 rounded-full text-xs font-medium">
                  Employee
                </span>
                <span className="text-[10px] text-gray-500 ml-auto">Contact admin for elevated access</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-cyan-600 text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 mt-2"
            >
              {loading
                ? isRegister ? "Creating account..." : "Signing in..."
                : isRegister ? "Create Employee Account" : "Sign In"
              }
            </button>
          </div>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setForm({ username: "", password: "", confirmPassword: "" });
                  setShowPassword(false);
                  setTouched({});
                  setStrength(0);
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