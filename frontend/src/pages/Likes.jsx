import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { X, CheckCircle } from "lucide-react";
import { apiFetch } from "../lib/api"; 

export default function Likes() {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    price: "",
    groupSize: "",
    type: "",
    completed: "",
    search: "",
    sort: "addedAt:desc",
  });

  // Planner modal state
  const [showPlanner, setShowPlanner] = useState(false);
  const [plannerActivity, setPlannerActivity] = useState(null);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerContent, setPlannerContent] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");

    if (!token) {
      navigate("/");
      return;
    }
    setUser({ name, email });
    fetchLikes(filters, page);
  }, [navigate, filters, page]);

 
  useEffect(() => {
    if (showPlanner) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPlanner]);

  const fetchLikes = async (filters, page) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        ...filters,
        page,
        limit: 6,
      }).toString();

      const data = await apiFetch(`/api/activities/liked?${query}`); 
      setActivities(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching likes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // reset to first page when filters change
  };

  const handleDislike = async (activityId) => {
    try {
      await apiFetch(`/api/activities/dislike/${activityId}`, { method: "PUT" }); 
      setActivities((prev) =>
        prev.filter((a) => a.activity._id !== activityId)
      );
    } catch (err) {
      console.error("Failed to dislike:", err);
    }
  };

  const handleCompleted = async (activityId) => {
    try {
      await apiFetch(`/api/activities/completed/${activityId}`, { method: "PUT" }); 
      setActivities((prev) =>
        prev.map((a) =>
          a.activity._id === activityId
            ? { ...a, completed: !a.completed }
            : a
        )
      );
    } catch (err) {
      console.error("Failed to toggle completed:", err);
    }
  };

  const handlePlannerOpen = async (activity) => {
    setPlannerActivity(activity);
    setShowPlanner(true);
    setPlannerLoading(true);
    setPlannerContent("");

    try {
      const data = await apiFetch(`/api/activities/planner/${activity._id}`, {
        method: "POST",
      }); // 👈 apiFetch
      setPlannerContent(data.plan);
    } catch (err) {
      setPlannerContent("Failed to generate plan. Try again.");
      console.error(err);
    } finally {
      setPlannerLoading(false);
    }
  };

  const handlePlannerClose = () => {
    setPlannerActivity(null);
    setShowPlanner(false);
    setPlannerContent("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header user={user} onLogout={() => navigate("/")} context='likes'/>

      <main className="flex-1 flex flex-col px-4 sm:px-6 pt-6 pb-10 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-8 text-center text-[var(--color-accent1)]">
          Your Liked Activities
        </h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4 mb-12 bg-[var(--color-bg-secondary)] p-3 sm:p-4 rounded-2xl shadow-sm">
          {/* Search */}
          <div className="p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 w-full sm:w-auto">
            <input
              type="text"
              name="search"
              placeholder="Search..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full sm:w-auto px-4 py-2 rounded-full bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none"
            />
          </div>

          {/* Select filters */}
          {["price", "groupSize", "type", "completed", "sort"].map((name) => (
            <div
              key={name}
              className="p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 w-full sm:w-auto"
            >
              <select
                name={name}
                value={filters[name]}
                onChange={handleFilterChange}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none"
              >
                {name === "price" && (
                  <>
                    <option value="">Price</option>
                    <option value="$">$</option>
                    <option value="$$">$$</option>
                    <option value="$$$">$$$</option>
                  </>
                )}
                {name === "groupSize" && (
                  <>
                    <option value="">Group Size</option>
                    <option value="1-2">1-2</option>
                    <option value="3-5">3-5</option>
                    <option value="6+">6+</option>
                  </>
                )}
                {name === "type" && (
                  <>
                    <option value="">Type</option>
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                  </>
                )}
                {name === "completed" && (
                  <>
                    <option value="">All</option>
                    <option value="true">Completed</option>
                    <option value="false">Not Completed</option>
                  </>
                )}
                {name === "sort" && (
                  <>
                    <option value="addedAt:desc">Newest First</option>
                    <option value="addedAt:asc">Oldest First</option>
                  </>
                )}
              </select>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[var(--color-accent1)] border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-4 text-[var(--color-accent1)] font-medium text-base sm:text-lg">
              Fetching activities...
            </span>
          </div>
        )}

        {/* No activities */}
        {!loading && activities.length === 0 && (
          <p className="text-center text-base sm:text-lg text-[var(--color-text)]/70">
            No liked activities found.
          </p>
        )}

        {/* Activities Grid */}
        <div className="mt-6 grid gap-7 sm:gap-9 md:gap-12 auto-rows-fr justify-items-center px-3 sm:px-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <div
              key={a.activity._id}
              className="w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto mb-6 sm:mb-0 p-[3px] rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-lg hover:shadow-2xl transition"
            >
              <div className="rounded-2xl bg-[var(--color-bg)] flex flex-col h-full overflow-hidden">
                {a.activity.image ? (
                  <img
                    src={a.activity.image}
                    alt={a.activity.name}
                    className="w-full h-28 sm:h-40 md:h-52 lg:h-60 object-cover"
                  />
                ) : (
                  <div className="h-28 sm:h-40 md:h-52 lg:h-60 w-full bg-gray-700 flex items-center justify-center text-gray-300">
                    No image
                  </div>
                )}

                <div className="p-3 sm:p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-[var(--color-accent1)] mb-2">
                      {a.activity.name}
                    </h2>
                    <p className="text-sm leading-relaxed text-[var(--color-text)]/80 line-clamp-4">
                      {a.activity.description}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 sm:gap-4 justify-between text-xs sm:text-sm text-[var(--color-text)]/70">
                    {a.activity.price && <span>💲 {a.activity.price}</span>}
                    {a.activity.groupSize && <span>👥 {a.activity.groupSize}</span>}
                    {a.activity.type && <span>📍 {a.activity.type}</span>}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={() => handleDislike(a.activity._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-[var(--color-bg)] text-red-500 border border-red-500 hover:bg-red-500 hover:text-white transition text-sm font-medium"
                    >
                      <X className="w-4 h-4" /> Dislike
                    </button>

                    <button
                      onClick={() => handleCompleted(a.activity._id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg border text-sm font-medium transition whitespace-nowrap min-w-[100px] ${
                        a.completed
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-[var(--color-bg)] text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {a.completed ? "Completed" : "Mark"}
                    </button>

                    <button
                      onClick={() => handlePlannerOpen(a.activity)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-[var(--color-bg)] text-pink-500 border border-pink-500 hover:bg-pink-500 hover:text-white transition text-sm font-medium"
                    >
                      📅 Planner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 sm:px-5 py-2 rounded-full bg-[var(--color-bg)] border border-[var(--color-accent1)] text-[var(--color-accent1)] hover:bg-[var(--color-accent1)] hover:text-white disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            <span className="text-sm sm:text-base font-medium text-[var(--color-text)]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 sm:px-5 py-2 rounded-full bg-[var(--color-bg)] border border-[var(--color-accent1)] text-[var(--color-accent1)] hover:bg-[var(--color-accent1)] hover:text-white disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* Planner Modal */}
      {showPlanner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className="
              relative bg-[var(--color-bg)] rounded-2xl shadow-xl p-4 sm:p-6 
              w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto
            "
          >
            {/* Close button */}
            <button
              onClick={handlePlannerClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100/20 transition"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            <h2 className="text-lg sm:text-xl font-bold text-[var(--color-accent1)] mb-4 text-center">
              Planner for {plannerActivity?.name}
            </h2>

            {plannerLoading ? (
              <div className="flex flex-col items-center mb-10">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-[var(--color-text)]/80">Generating plan...</p>
              </div>
            ) : (
              <>
                <div className="text-sm sm:text-base text-[var(--color-text)]/80 whitespace-pre-line mb-6 text-left">
                  {plannerContent}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handlePlannerClose}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                  >
                    Go Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
