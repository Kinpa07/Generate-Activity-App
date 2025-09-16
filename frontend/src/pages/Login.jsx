import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return setError("Both fields are required.");
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save credentials to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.name);
      localStorage.setItem("email", data.email);

      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Login">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="relative">
          <Mail
            className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 lg:p-4 pl-10 lg:pl-12 border rounded-lg bg-[var(--color-bg)] border-gray-300 text-[var(--color-text)] placeholder:text-gray-400 text-base lg:text-lg"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock
            className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 lg:p-4 pl-10 lg:pl-12 border rounded-lg bg-[var(--color-bg)] border-gray-300 text-[var(--color-text)] placeholder:text-gray-400 text-base lg:text-lg"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Forgot Password link */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm lg:text-base text-[var(--color-accent2)] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-accent2)] text-[var(--color-bg)] p-3 lg:p-4 rounded-lg hover:bg-[var(--color-hover)] transition-colors text-base lg:text-lg font-medium disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-[var(--color-text)] text-sm lg:text-base">
        Don’t have an account?{" "}
        <Link
          to="/register"
          className="text-[var(--color-accent1)] hover:underline"
        >
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
