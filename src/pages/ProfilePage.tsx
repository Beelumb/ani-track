import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Pagination from "../components/pagination";
import { ChevronDown, Check, MoreVertical } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { UserAnime } from "../types/animeTypes";
import EditAnimeDialog from "../components/dialogue/EditAnimeDialog";
import { STATUS_OPTIONS } from "../config/statusConfig";

// Definitions for the status options

export default function ProfilePage() {
  const [animes, setAnimes] = useState<UserAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [username, setUsername] = useState("");

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Hover and Editing State
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [editingAnime, setEditingAnime] = useState<UserAnime | null>(null);

  const pageSize = 10;

  useEffect(() => {
    fetchStatusCounts();
  }, []);

  useEffect(() => {
    fetchUserList();
  }, [page, filterStatus]);

  const fetchStatusCounts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("user_anime_list")
      .select("status")
      .eq("user_id", user.id);
    if (!data || error) return;
    const counts: Record<string, number> = {
      all: data.length,
      watching: 0,
      completed: 0,
      plan_to_watch: 0,
      dropped: 0,
      on_hold: 0,
    };
    data.forEach((item) => {
      if (counts[item.status] !== undefined) counts[item.status]++;
    });
    setStatusCounts(counts);
  };

useEffect(() => {
    async function getProfile() {
      if (!user) return;

      console.log("Fetching profile for user:", user.id); // Debugging line

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single(); // .single() throws an error if 0 or >1 rows are found

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        console.log("Profile found:", data); // Debugging line
        setUsername(data.username);
      }
    }

    getProfile();
  }, [user]); // Dependency array is correct

  const fetchUserList = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let query = supabase
      .from("user_anime_list")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);
    if (filterStatus !== "all") query = query.eq("status", filterStatus);

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to)
      .returns<UserAnime[]>();

    if (error) console.error("Supabase Error:", error.message);
    if (data) setAnimes(data);
    if (count !== null) setTotalCount(count);
    setLoading(false);
  };

  const handleFilterChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    setPage(1);
  };

  const handleUpdateEntry = async (
    mal_id: number,
    updates: Partial<UserAnime>
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_anime_list")
      .update(updates)
      .eq("user_id", user.id)
      .eq("mal_id", mal_id);

    if (error) {
      alert("Failed to update");
      return;
    }

    setAnimes((prev) =>
      prev.map((item) =>
        item.mal_id === mal_id ? { ...item, ...updates } : item
      )
    );

    setEditingAnime(null);
    fetchStatusCounts();
  };

  const handleDelete = async (mal_id: number) => {
    if (!window.confirm("Remove from list?")) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("user_anime_list")
      .delete()
      .eq("user_id", user.id)
      .eq("mal_id", mal_id);
    setAnimes((prev) => prev.filter((item) => item.mal_id !== mal_id));
    setTotalCount((prev) => prev - 1);
    fetchStatusCounts();
    setEditingAnime(null);
  };

  return (
    <div className="min-h-screen text-gray-200 font-sans relative">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-8">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-700">
            <img
              src="https://img.freepik.com/free-photo/festive-animal-portrait-christmas_23-2151895791.jpg?semt=ais_hybrid&w=740&q=80"
              className="w-full h-full object-cover"
              alt="avatar"
            />
          </div>
          <div className="mt-2">
            <h1 className="text-2xl font-bold text-white mb-2 capitalize">
              {username}
            </h1>
          </div>{" "}
        </div>
      </div>

      {/* Controls */}
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-white">Anime List</h2>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <StatusDropdown
            selectedStatus={filterStatus}
            counts={statusCounts}
            onChange={handleFilterChange}
          />
        </div>

        {/* List Table */}
        <div className="w-full overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                {/* 1. Widened the first column */}
                <th className="py-4 pl-4 w-16 min-w-16 text-center">#</th>

                <th className="py-4">Details</th>

                {/* 2. Hidden extra columns on Mobile to save space */}
                <th className="py-4 text-center ">Episodes</th>
                <th className="py-4 text-center ">Type</th>

                <th className="py-4 pr-4 text-right text-primary-foreground ">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    Loading...
                  </td>
                </tr>
              ) : animes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    No anime found.
                  </td>
                </tr>
              ) : (
                animes.map((item, index) => {
                  const listNumber = (page - 1) * pageSize + index + 1;
                  const isHovered = hoveredRow === item.mal_id;

                  return (
                    <tr
                      key={item.mal_id}
                      onMouseEnter={() => setHoveredRow(item.mal_id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className="border-b border-gray-800/50 hover:bg-[#131417] transition-colors group"
                    >
                      {/* Column 1: Number OR Edit Icon */}
                      <td className="py-4 pl-4 text-center font-medium w-16 min-w-16">
                        {isHovered ? (
                          <button
                            onClick={() => setEditingAnime(item)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-prim border border-primary-border text-primary-foreground hover:bg-primary-border transition mx-auto"
                          >
                            <MoreVertical size={18} />
                          </button>
                        ) : (
                          <span className="text-gray-500">{listNumber}</span>
                        )}
                      </td>

                      <td className="py-4 ">
                        <div className="flex items-center gap-4 ">
                          <Link
                            to={`/anime/${item.mal_id}/${slugify(item.title)}`}
                          >
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-12 h-16 object-cover rounded shadow-sm hover:opacity-80 transition-opacity hidden md:block"
                            />
                          </Link>
                          <div className="flex flex-col ">
                            <Link
                              to={`/anime/${item.mal_id}/${slugify(
                                item.title
                              )}`}
                              className="font-bold text-gray-200 text-base hover:text-white hover:underline transition-all line-clamp-2"
                            >
                              {item.title}
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* Episodes (Hidden on Mobile) */}
                      <td className="py-4 text-center text-gray-300 font-medium ">
                        {item.episodes_watched} / {item.episodes_total || "?"}
                      </td>

                      {/* Type (Hidden on Mobile) */}
                      <td className="py-4 text-center text-gray-400 ">
                        {item.type || "TV"}
                      </td>

                      {/* 3. Score Column with Pink Circle */}
                      <td className="py-4 pr-4 text-right">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary-foreground text-primary-foreground font-bold text-sm  ml-auto">
                          {item.score > 0 ? item.score : "-"}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalCount > 0 && (
          <div className="mt-8 flex justify-center pb-12">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalCount / pageSize)}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingAnime && (
        <EditAnimeDialog
          anime={editingAnime}
          onClose={() => setEditingAnime(null)}
          onSave={handleUpdateEntry}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// ... Slugify and StatusDropdown ...
function slugify(s?: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function StatusDropdown({
  selectedStatus,
  counts,
  onChange,
}: {
  selectedStatus: string;
  counts: Record<string, number>;
  onChange: (s: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeOption = STATUS_OPTIONS.find((o) => o.value === selectedStatus);
  const activeCount = counts[selectedStatus] || 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-64" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-secondary/20 text-gray-200 px-4 py-3 rounded-lg border border-border hover:border-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          {selectedStatus === "completed" && (
            <Check size={16} className="text-green-500" />
          )}
          <span className="font-medium">{activeOption?.label || "All"}</span>
          <span className="text-gray-500 text-sm">({activeCount})</span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-[#1A1C21] border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden py-2">
          {[{ value: "all", label: "All Anime" }, ...STATUS_OPTIONS].map(
            (option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#25272e] transition-colors text-left"
              >
                <span
                  className={`${
                    selectedStatus === option.value
                      ? "text-white font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {option.label}
                </span>
                <span className="text-gray-600 text-xs">
                  {counts[option.value] || 0}
                </span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
