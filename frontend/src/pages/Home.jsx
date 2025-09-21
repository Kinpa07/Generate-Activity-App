import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Heart, X } from "lucide-react";
import TinderCard from "react-tinder-card";
import { apiFetch } from "../lib/api";

export default function Home() {
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [filters, setFilters] = useState({
    groupSize: "",
    price: "",
    type: "",
  });
  const [swipeDir, setSwipeDir] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const childRefs = useRef([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");

    if (!token) {
      navigate("/");
      return;
    }
    setUser({ name, email });

    fetchNextActivity(filters);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const fetchNextActivity = async (filters) => {
    try {
      setLoading(true);
      const query = new URLSearchParams(filters).toString();
      const data = await apiFetch(`/api/activities?${query}`); 
      setCards((prev) => [...prev, data]);
    } catch (err) {
      console.error("Error fetching activity:", err);
    } finally {
      setLoading(false);
    }
  };

  const recordSwipe = async (direction, cardId) => {
    if (!cardId) return;

    try {
      if (direction === "right") {
        await apiFetch(`/api/activities/like/${cardId}`, { method: "PUT" });  
      } else {
        await apiFetch(`/api/activities/dislike/${cardId}`, { method: "PUT" }); 
      }
    } catch (err) {
      console.error("Error recording swipe:", err);
    }
  };

  const swiped = (direction, cardId) => {
    setSwipeDir(direction);
    recordSwipe(direction, cardId);

    setTimeout(() => {
      setCards((prev) => prev.filter((card) => card._id !== cardId));
      setSwipeDir(null);

      // Fetch the next activity once a card is gone
      const token = localStorage.getItem("token");
      if (token) fetchNextActivity(filters);
    }, 500);
  };

  const swipe = async (dir) => {
    if (cards.length && childRefs.current[0]) {
      setSwipeDir(dir);
      await childRefs.current[0].swipe(dir);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header user={user} onLogout={handleLogout} context="home" />

      <main className="flex-1 flex flex-col px-4 pt-8 pb-10 max-w-5xl mx-auto w-full">
        {/* CTA + Filters */}
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-3xl font-heading font-bold mb-2 text-center text-[var(--color-accent1)]">
            Find your next activity 
          </h1>
          <p className="text-[var(--color-text)]/70 text-center mb-6">
            Swipe to discover something new. Use filters to refine your matches.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 w-full">
            {/* Group Size Filter */}
            <div className="p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
              <select
                name="groupSize"
                value={filters.groupSize}
                onChange={handleFilterChange}
                className="px-4 py-2 rounded-full bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none"
              >
                <option value="">Group Size</option>
                <option value="1-2">1-2</option>
                <option value="3-5">3-5</option>
                <option value="6+">6+</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
              <select
                name="price"
                value={filters.price}
                onChange={handleFilterChange}
                className="px-4 py-2 rounded-full bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none"
              >
                <option value="">Price</option>
                <option value="$">$</option>
                <option value="$$">$$</option>
                <option value="$$$">$$$</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="px-4 py-2 rounded-full bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none"
              >
                <option value="">Type</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>
          </div>

          {/* How it works section */}
          <div className="mt-12 text-center max-w-lg">
            <h2 className="text-xl font-semibold text-[var(--color-accent1)] mb-3">
              How it works
            </h2>
            <p className="text-[var(--color-text)]/70 leading-relaxed">
              Swipe <span className="font-bold text-green-500">right</span> if
              you like an activity, or{" "}
              <span className="font-bold text-red-500">left</span> to pass. You
              can also use the buttons below the card.
            </p>
          </div>
        </div>

        {/* Tinder Card */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="relative w-[90%] sm:w-full max-w-md h-[480px] sm:h-[520px]">
            {cards.length > 0 ? (
              <TinderCard
                ref={(el) => (childRefs.current[0] = el)}
                className="absolute inset-0 select-none"
                key={cards[0]._id}
                onSwipe={(dir) => swiped(dir, cards[0]._id)}
                preventSwipe={["up", "down"]}
              >
                <div
                  className="
                    relative p-[3px] rounded-2xl sm:rounded-3xl
                    bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 h-full
                    animate-[fadeInScale_0.4s_ease-out]
                  "
                >
                  <div className="bg-[var(--color-bg)] rounded-2xl sm:rounded-3xl shadow-xl flex flex-col h-full overflow-hidden">
                    {cards[0].image ? (
                      <img
                        src={cards[0].image}
                        alt={cards[0].name}
                        draggable={false}
                        className="h-48 sm:h-56 w-full object-cover rounded-t-2xl sm:rounded-t-3xl pointer-events-none"
                      />
                    ) : (
                      <div className="h-48 sm:h-56 w-full bg-gray-700 flex items-center justify-center text-gray-300">
                        No image
                      </div>
                    )}

                    {swipeDir && (
                      <div
                        className={`absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl font-bold ${
                          swipeDir === "right"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {swipeDir === "right" ? "LIKE" : "NOPE"}
                      </div>
                    )}

                    <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-heading font-bold mb-2 text-[var(--color-accent1)]">
                          {cards[0].name}
                        </h2>
                        <p className="text-sm sm:text-base text-[var(--color-text)]/80">
                          {cards[0].description}
                        </p>
                      </div>

                      <div className="mt-4 flex justify-between text-xs sm:text-sm text-[var(--color-text)]/70">
                        {cards[0].price && <span>💲 {cards[0].price}</span>}
                        {cards[0].groupSize && (
                          <span>👥 {cards[0].groupSize}</span>
                        )}
                        {cards[0].type && <span>📍 {cards[0].type}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </TinderCard>
            ) : (
              loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--color-bg)] rounded-2xl sm:rounded-3xl shadow-xl">
                  {/* Spinner */}
                  <div className="w-12 h-12 border-4 border-[var(--color-accent1)] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[var(--color-accent1)] font-medium">
                    Fetching activity...
                  </p>
                </div>
              )
            )}
          </div>

          {/* Buttons */}
          {cards.length > 0 && (
            <div className="flex gap-6 sm:gap-8 mt-6 sm:mt-8 justify-center">
              <button
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-r from-red-500 to-pink-500 hover:scale-110 active:scale-90 transition-transform duration-200"
                onClick={() => swipe("left")}
              >
                <div className="w-full h-full flex items-center justify-center rounded-full bg-[var(--color-bg)] text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300">
                  <X className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
              </button>

              <button
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-r from-green-400 to-emerald-500 hover:scale-110 active:scale-90 transition-transform duration-200"
                onClick={() => swipe("right")}
              >
                <div className="w-full h-full flex items-center justify-center rounded-full bg-[var(--color-bg)] text-green-400 hover:bg-green-500 hover:text-white transition-all duration-300">
                  <Heart className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
