import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Try to get user info from localStorage
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");

    if (!token) {
      // Not logged in → kick back to login
      navigate("/");
      return;
    }

    setUser({ name, email });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)]">
      {user ? (
        <>
          <h1 className="text-3xl font-heading font-bold mb-4">
            Welcome, {user.name || "User"} 👋
          </h1>
          <p className="mb-6 text-lg">Your email: {user.email}</p>
          <button
            onClick={handleLogout}
            className="bg-[var(--color-accent2)] text-[var(--color-bg)] px-6 py-3 rounded-lg hover:bg-[var(--color-hover)] transition-colors"
          >
            Logout
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
