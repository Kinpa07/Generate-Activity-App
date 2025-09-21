import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { apiFetch } from "../lib/api";  

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!name || !email || !password || !confirmPassword) {
      return setError("All fields are required.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setError("");
    setLoading(true);

    try {
     
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      // Show success message
      setSuccess("Successful registration! You will be redirected to login shortly.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Register">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="relative">
          <User
            className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 lg:p-4 pl-10 lg:pl-12 border rounded-lg bg-[var(--color-bg)] border-gray-300 text-[var(--color-text)] placeholder:text-gray-400 text-base lg:text-lg"
          />
        </div>

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

        {/* Confirm Password */}
        <div className="relative">
          <Lock
            className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 lg:p-4 pl-10 lg:pl-12 border rounded-lg bg-[var(--color-bg)] border-gray-300 text-[var(--color-text)] placeholder:text-gray-400 text-base lg:text-lg"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-accent2)] text-[var(--color-bg)] p-3 lg:p-4 rounded-lg hover:bg-[var(--color-hover)] transition-colors text-base lg:text-lg font-medium disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-[var(--color-text)] text-sm lg:text-base">
        Already have an account?{" "}
        <Link to="/" className="text-[var(--color-accent1)] hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
