import { LogOut, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-dark.png"; // logo includes "Pickly"

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const firstName = user?.name ? user.name.split(" ")[0] : "";

  return (
    <header className="w-full bg-[var(--color-bg)] border-b border-[var(--color-hover)] text-[var(--color-text)] shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4">
        {/* Clickable Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center transition-transform duration-200 hover:scale-105 hover:opacity-90 cursor-pointer focus:outline-none"
        >
          <img
            src={logo}
            alt="Pickly Logo"
            className="h-14 sm:h-16 lg:h-24 xl:h-28 w-auto"
          />
        </button>

        {/* User actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {firstName && (
            <span className="hidden sm:inline text-sm lg:text-base text-[var(--color-text)]/80">
              Hi, <span className="font-semibold">{firstName}</span>
            </span>
          )}

          {/* Likes button with gradient border */}
          <div className="p-[2px] rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
            <button
              onClick={() => navigate("/likes")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white transition-all duration-300"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Likes</span>
            </button>
          </div>

          {/* Logout button with gradient border */}
          <div className="p-[2px] rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
