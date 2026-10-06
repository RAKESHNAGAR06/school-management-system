import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { School, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (data.success) {
      // ==========================================
      // SAVE LOGIN DATA
      // ==========================================

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // ==========================================
      // FORCE PASSWORD CHANGE
      // ==========================================

      if (
        data.user?.mustChangePassword === true
      ) {
        setMessage(
          "Temporary password detected. Please change your password."
        );

        setTimeout(() => {
          navigate(
            "/change-password",
            {
              replace: true,
            }
          );
        }, 500);

        return;
      }

      // ==========================================
      // NORMAL LOGIN
      // ==========================================

      setMessage(
        "Login successful! Redirecting..."
      );

      setTimeout(() => {
        const role = data.user.role;

        if (role === "admin") {
          navigate(
            "/admin/dashboard",
            {
              replace: true,
            }
          );
        } else if (role === "teacher") {
          navigate(
            "/teacher/dashboard",
            {
              replace: true,
            }
          );
        } else if (role === "student") {
          navigate(
            "/student/dashboard",
            {
              replace: true,
            }
          );
        } else if (role === "parent") {
          navigate(
            "/parent/dashboard",
            {
              replace: true,
            }
          );
        } else {
          navigate(
            "/unauthorized",
            {
              replace: true,
            }
          );
        }
      }, 500);
    } else {
      setMessage(
        data.message ||
          "Invalid credentials"
      );
    }
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    setMessage(
      "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-200">
            <School className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">EduManage</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Error / Success Message Alert */}
        {message && (
          <div
            className={`p-3.5 mb-6 rounded-lg text-sm font-medium text-center ${
              message.includes("successful")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                name="email"
                placeholder="admin@school.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md shadow-blue-100 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;