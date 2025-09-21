import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { apiFetch } from "../lib/api";  

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Email is required.");
      return;
    }
    setMessage("");

    try {
      const data = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      // Always show a generic message
      let text =
        data.message ||
        "If this email is registered, a reset link has been created.";

      // For dev: if resetUrl is returned, show it
      if (data.resetUrl) {
        text += ` — Dev link: ${data.resetUrl}`;
      }

      setMessage(text);
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <AuthLayout title="Forgot Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="relative">
          <Mail
            className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 lg:p-4 pl-10 lg:pl-12 border rounded-lg bg-[var(--color-bg)] border-gray-300 text-[var(--color-text)] placeholder:text-gray-400 text-base lg:text-lg"
          />
        </div>

        {message && (
          <p className="text-sm lg:text-base text-[var(--color-accent2)]">
            {message}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-[var(--color-accent2)] text-[var(--color-bg)] p-3 lg:p-4 rounded-lg hover:bg-[var(--color-hover)] transition-colors text-base lg:text-lg font-medium"
        >
          Send Reset Link
        </button>
      </form>

      <p className="mt-6 text-center text-[var(--color-text)] text-sm lg:text-base">
        Remembered your password?{" "}
        <Link to="/" className="text-[var(--color-accent1)] hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
