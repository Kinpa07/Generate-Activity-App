import { useState, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { apiFetch } from "../lib/api"; 

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setError("Invalid reset link. Please request a new one.");
    if (!password || !confirm) return setError("All fields are required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setError("");
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });

      setSuccess("✅ Password updated! Redirecting to login…");
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthLayout title="Reset Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="relative">
          <Lock className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 lg:p-4 pl-10 lg:pl-12 border rounded-lg bg-[var(--color-bg)] border-gray-300 text-[var(--color-text)] placeholder:text-gray-400 text-base lg:text-lg"
          />
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Lock className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-3 lg:p-4 pl-10 lg:pl-12 border rounded-lg bg-[var(--color-bg)] border-gray-300 text-[var(--color-text)] placeholder:text-gray-400 text-base lg:text-lg"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <button
          type="submit"
          className="w-full bg-[var(--color-accent2)] text-[var(--color-bg)] p-3 lg:p-4 rounded-lg hover:bg-[var(--color-hover)] transition-colors text-base lg:text-lg font-medium"
        >
          Reset Password
        </button>
      </form>

      <p className="mt-6 text-center text-[var(--color-text)] text-sm lg:text-base">
        Back to{" "}
        <Link to="/" className="text-[var(--color-accent1)] hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
