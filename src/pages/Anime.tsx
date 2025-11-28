import { useState, useEffect, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import AnimeCard from "../components/AnimeCard";
import type {
  AnimeApiResponse,
  GenresResponse,
  AnimeQueryArgs,
} from "../types/animeTypes";
import { Link } from "react-router-dom";
import CollapsibleFilter from "../components/filters/CollapsibleFilter";
import {
  ActivityIcon,
  TypeIcon,
  SortByIcon,
  RatingIcon,
  GenresIcon,
  FilterIcon
} from "../icons/icons";
import Pagination from "../components/pagination";

// --- API Functions ---
const getGenres = async (): Promise<GenresResponse> => {
  const response = await fetch("https://api.jikan.moe/v4/genres/anime");
  if (!response.ok) throw new Error("Failed to fetch genres");
  return await response.json();
};

const getAllAnimes = async ({
  page,
  status,
  type,
  q,
  genres,
  rating,
  orderBy,
}: AnimeQueryArgs): Promise<AnimeApiResponse> => {
  const params = new URLSearchParams({
    limit: "25",
    page: page.toString(),
  });

  if (status) params.append("status", status);
  if (type) params.append("type", type);
  if (q) params.append("q", q);
  if (genres) params.append("genres", genres);
  if (rating) params.append("rating", rating);
  if (orderBy) {
    params.append("order_by", orderBy);
    params.append("sort", "desc");
  }

  const response = await fetch(
    `https://api.jikan.moe/v4/anime?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
};

export default function Anime() {
  // --- Static Options ---
  const statusOptions = ["Ongoing", "Finished", "Announced"];
  const typeOptions = ["TV", "Movie", "OVA", "ONA", "Special", "Music"];

  const ratingMap: Record<string, string> = {
    "All Ages": "g",
    Children: "pg",
    "Teens 13+": "pg13",
    "17+ (Violence/Profanity)": "r17",
    "Mild Nudity": "r",
    Hentai: "rx",
  };
  const ratingOptions = Object.keys(ratingMap);

  const sortMap: Record<string, string> = {
    Score: "score",
    Favorites: "favorites",
  };
  const sortOptions = Object.keys(sortMap);

  // --- State ---
  const [statusFilter, setStatusFilter] = useState<string | null>("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  const [sortFilter, setSortFilter] = useState<string | null>("Score");
  const [genreFilter, setGenreFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // --- Mobile Drawer State ---
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Lock body scroll when mobile filters are open
  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileFiltersOpen]);

  // --- Fetch Genres ---
  const { data: genresData } = useQuery<GenresResponse>({
    queryKey: ["genres"],
    queryFn: getGenres,
    staleTime: Infinity,
  });

  const genreOptions = useMemo(() => {
    return genresData?.data.map((g) => g.name) || [];
  }, [genresData]);

  // --- API Parameter Logic ---
  const getApiParams = () => {
    let apiStatus: string | null = null;
    if (statusFilter === "Ongoing") apiStatus = "airing";
    else if (statusFilter === "Finished") apiStatus = "complete";
    else if (statusFilter === "Announced") apiStatus = "upcoming";

    let apiType: string | null = null;
    if (typeFilter) apiType = typeFilter.toLowerCase();

    let apiRating: string | null = null;
    if (ratingFilter) apiRating = ratingMap[ratingFilter];

    let apiSort: string | null = null;
    if (sortFilter) apiSort = sortMap[sortFilter];

    let apiGenres: string | null = null;
    if (genreFilter.length > 0 && genresData?.data) {
      const selectedIds = genresData.data
        .filter((g) => genreFilter.includes(g.name))
        .map((g) => g.mal_id);
      apiGenres = selectedIds.join(",");
    }

    return {
      status: apiStatus,
      type: apiType,
      rating: apiRating,
      orderBy: apiSort,
      genres: apiGenres,
      q: searchQuery || null,
    };
  };

  const apiParams = getApiParams();

  // --- Main Query ---
  const { data, isLoading, isError, isPlaceholderData } =
    useQuery<AnimeApiResponse>({
      queryKey: [
        "anime",
        apiParams.status,
        apiParams.type,
        apiParams.rating,
        apiParams.orderBy,
        apiParams.genres,
        apiParams.q,
        page,
      ],
      queryFn: () => getAllAnimes({ page, ...apiParams }),
      placeholderData: keepPreviousData,
    });

  const filterKey = JSON.stringify({ ...apiParams, page: undefined });

  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [filterKey]);

  const clearFilters = (e: React.MouseEvent) => {
    e.preventDefault();
    setStatusFilter("");
    setTypeFilter(null);
    setRatingFilter(null);
    setSortFilter(null);
    setGenreFilter([]);
    setSearchQuery("");
    // Optional: Close mobile filters on clear
     setMobileFiltersOpen(false); 
  };

  // --- Reusable Filters Component ---
  // We extract this so we can render it in the Desktop Sidebar AND the Mobile Drawer
  const FiltersContent = (
    <div className="flex flex-col pb-20 lg:pb-0">
      <CollapsibleFilter
        label="Status"
        icon={<ActivityIcon />}
        options={statusOptions}
        selected={statusFilter}
        onSelect={setStatusFilter}
        multiSelect={false}
        defaultOpen={true}
        className="last:border-b-0!"
      />
      <CollapsibleFilter
        label="Format"
        icon={<TypeIcon />}
        options={typeOptions}
        selected={typeFilter}
        onSelect={setTypeFilter}
        multiSelect={false}
        defaultOpen={true}
        className="last:border-b-0!"
      />
      <CollapsibleFilter
        label="Genres"
        icon={<GenresIcon />}
        options={genreOptions}
        selected={genreFilter}
        onSelect={setGenreFilter}
        multiSelect={true}
        defaultOpen={false}
        className="last:border-b-0!"
      />
      <CollapsibleFilter
        label="Sort By"
        icon={<SortByIcon />}
        options={sortOptions}
        selected={sortFilter}
        onSelect={setSortFilter}
        multiSelect={false}
        defaultOpen={true}
        className="last:border-b-0!"
      />
      <CollapsibleFilter
        label="Age Rating"
        icon={<RatingIcon />}
        options={ratingOptions}
        selected={ratingFilter}
        onSelect={setRatingFilter}
        multiSelect={false}
        defaultOpen={false}
        className=""
      />
      <Link
        to="/anime"
        onClick={clearFilters}
        className="flex gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-12 px-4 py-2 my-4 w-full md:mt-4 "
      >
        Clear All
      </Link>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 justify-center lg:grid-cols-[1fr_25%] lg:items-start lg:justify-between lg:gap-16">
        <section className="flex flex-col gap-4 lg:gap-8">
          <div className="flex items-center justify-between gap-2">
            <h2 className="scroll-m-20 text-2xl font-bold tracking-normal first:mt-0">
              Anime Catalog
            </h2>
          </div>

          {/* Search Bar Container */}
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-2 border-b border-b-transparent bg-transparent transition md:gap-4">
              <div className="flex flex-1 flex-col gap-4">
                <input
                  type="text"
                  placeholder="Search Anime..."
                  className="flex h-12 w-full rounded-default border border-border bg-secondary/20 px-3 py-2 text-sm ring-offset-background file:border-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* --- Mobile Filter Button (Visible only on mobile/tablet) --- */}
            <div className="flex lg:hidden gap-2">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-border bg-secondary/20 px-4 py-2 text-sm font-medium hover:bg-secondary/40 transition-colors"
              >
                <FilterIcon />
                Filters
              </button>
            </div>
          </div>

          <section>
            {isLoading && <div className="text-center p-8">Loading...</div>}
            {isError && (
              <div className="text-center p-8 text-red-500">
                Error loading data.
              </div>
            )}

            <div className="relative grid -my-4 py-4 gap-4 lg:gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              {(data?.data ?? []).map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>

            {!isLoading && !isError && data?.data?.length === 0 && (
              <div className="text-center p-8 text-gray-400">
                No results found.
              </div>
            )}
          </section>

          {/* Pagination */}
          <div className="sticky bottom-4 z-10 mx-auto flex w-fit items-center">
            <div className="relative flex rounded-lg border border-border p-4 bg-secondary/60 flex-row gap-2 border-none px-3 py-2 backdrop-blur-xl">
              <div className="flex w-full justify-center gap-2">
                <Pagination
                  currentPage={data?.pagination.current_page ?? 1}
                  totalPages={data?.pagination.last_visible_page ?? 1}
                  onPageChange={setPage}
                  isLoading={isPlaceholderData}
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- Desktop Sidebar Filters (Hidden on Mobile) --- */}
        <div className="sticky top-20 order-1 hidden w-full opacity-60 transition-opacity hover:opacity-100 lg:order-2 lg:block">
          <div className="no-scrollbar h-full overflow-x-scroll lg:max-h-[calc(100vh-6rem)]">
            {FiltersContent}
          </div>
        </div>
      </div>

      {/* 1. Outer container: Fixed inset to cover screen, z-50 to be on top.
        2. Backdrop: Black overlay with opacity transition.
        3. Drawer: The actual content sliding up.
      */}
      <div
        className={`fixed inset-0 z-50 flex items-end justify-center lg:hidden transition-all duration-300 ${
          mobileFiltersOpen ? "visible" : "invisible pointer-events-none"
        }`}
      >
        {/* Backdrop (Darken the background) */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileFiltersOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileFiltersOpen(false)}
        />

        {/* Drawer Content */}
        <div
          className={`relative w-full h-[85vh] bg-background border-t border-border rounded-t-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
            mobileFiltersOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Drawer Handle / Header */}
          <div 
            className="flex items-center justify-center p-4 border-b border-border cursor-pointer"
            onClick={() => setMobileFiltersOpen(false)}
          >
             {/* Small handle bar for visual cue */}
            <div className="w-12 h-1.5 bg-secondary rounded-full" />
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Filters</h3>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="text-sm text-muted-foreground"
                >
                  Close
                </button>
             </div>
            {FiltersContent}
          </div>
        </div>
      </div>
    </>
  );
}