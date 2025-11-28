import * as HoverCard from "@radix-ui/react-hover-card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Anime } from "../types/animeTypes";
import { StarIcon } from "../icons/icons";
import StatusBadge from "./StatusBadge";
import { StatusSelector } from "./StatusSelector"; 
import { getAnimeStatus, updateAnimeStatus } from "../lib/api";
import { supabase } from "../lib/supabase"; 

// --- Helpers ---
export function statusClasses(status?: string) {
  const s = (status || "").toLowerCase();
  if (s === "currently airing" || s === "ongoing") {
    return " rounded-default px-1 py-[1px] border bg-ongoing-background border-ongoing-border text-ongoing-foreground";
  }
  if (s === "finished airing" || s === "completed") {
    return " rounded-default px-1 py-[1px] border bg-finished-background border-finished-border text-finished-foreground";
  }
  if (s === "not yet aired" || s === "upcoming") {
    return "rounded-default px-1 py-[1px] border bg-announced-background border-announced-border text-announced-foreground";
  }
  return "bg-gray-600 text-white";
}

export function statusLabel(status?: string | number) {
  if (typeof status === "number") return String(status);
  const map: Record<string, string> = {
    "currently airing": "Ongoing",
    ongoing: "Ongoing",
    "finished airing": "Finished",
    completed: "Finished",
    "not yet aired": "Announced",
    upcoming: "Announced",
    "pg-13 - teens 13 or older": "Pg-13",
    "r - 17+ (violence & profanity)": "R-17+",
  };
  const s = (status || "").toLowerCase().trim();
  if (!s) return "Unknown";
  return map[s] ?? s[0].toUpperCase() + s.slice(1);
}

// --- Internal Component: Card Status Selector ---
// Checks auth, fetches status, and handles updates
const CardStatusSelector = ({ anime }: { anime: Anime }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  // 1. Check Auth on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setIsLoggedIn(true);
    });
  }, []);

  // 2. Fetch Status (Only if logged in)
  const { data: statusData } = useQuery({
    queryKey: ["animeStatus", anime.mal_id],
    queryFn: () => getAnimeStatus(String(anime.mal_id)),
    enabled: isLoggedIn,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (statusData) {
      setLocalStatus(statusData.status);
    }
  }, [statusData]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    const oldStatus = localStatus;
    setLocalStatus(newStatus); // Optimistic update

    try {
      await updateAnimeStatus(anime, newStatus);
      // Invalidate queries to update the Badge on the main card
      queryClient.invalidateQueries({ queryKey: ["animeStatus", anime.mal_id] });
    } catch (err) {
      setLocalStatus(oldStatus);
      console.error("Failed to update status", err);
    } finally {
      setUpdating(false);
    }
  };

  // 3. Return null if not logged in (hides the component)
  if (!isLoggedIn) return null;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <StatusSelector
        currentStatus={localStatus}
        isLoading={updating}
        onChange={handleStatusChange}
      />
    </div>
  );
};

// --- Hover Content (The Popover) ---
const AnimePreview = ({ anime }: { anime: Anime }) => {
  const badgeCls = statusClasses(anime.status);

  return (
    <div className="w-[340px] rounded-lg bg-card shadow-lg p-4 text-white border border-border">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-white mb-2 pr-4">{anime.title}</h3>
        {anime.score && (
          <span className="text-sm text-white bg-secondary pl-2 pr-1 py-0.5 rounded shrink-0 flex">
            {anime.score}
            <StarIcon />
          </span>
        )}
      </div>

      <p className="text-xs text-gray-300 mt-1 line-clamp-3">
        {anime.synopsis || "No synopsis available."}
      </p>

      <div className="mt-4 space-y-2 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-200">Type: </span>
          {anime.type}
          {anime.status && (
            <span className={`ml-2 text-xs px-2 py-0.5 rounded border ${badgeCls}`}>
              {statusLabel(anime.status)}
            </span>
          )}
        </div>
        <div>
          <span className="font-semibold text-gray-200">Episodes: </span>
          {anime.episodes || "N/A"}
        </div>
        <div>
          <span className="font-semibold text-gray-200">Genres: </span>
          {anime.genres?.map((g) => g.name).join(", ") || "N/A"}
        </div>
      </div>

     
      <CardStatusSelector anime={anime} />
      
    </div>
  );
};

// --- Main Card Display ---
const AnimeCardDisplay = ({ anime }: { anime: Anime }) => {
  return (
    <Link
      to={`/anime/${anime.mal_id}/${slugify(anime.title)}`}
      state={{ title: anime.title }}
      className="group relative flex w-full flex-col gap-2"
    >
      <div className="relative w-full aspect-2/3">
        <div className="absolute inset-0 overflow-hidden rounded-md bg-muted">
          {/* Visual Badge (Top Right) */}
          <StatusBadge animeId={anime.mal_id} />
          
          <div className="absolute left-0 top-0 flex size-full items-center justify-center bg-secondary/20">
            <img
              src={anime.images?.webp?.image_url || ""}
              className="opacity-100 transition w-full h-full object-cover"
              alt={anime.title}
            />
          </div>
        </div>
      </div>

      <div className="mt-1 truncate">
        <label className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer leading-5">
          {anime.title}
        </label>
        <div className="mt-1 flex cursor-pointer items-center gap-2">
          <label className="font-medium text-gray-text peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-xs text-muted-foreground">
            {anime.year}
          </label>
          <div className="size-1 rounded-full bg-gray-text"></div>
          <label className="font-medium text-gray-text peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-xs text-muted-foreground">
            {anime.type}
          </label>
        </div>
      </div>
    </Link>
  );
};

// --- Exported Component ---
export default function AnimeCard({ anime }: { anime: Anime }) {
  return (
    <HoverCard.Root openDelay={300} closeDelay={100}>
      <HoverCard.Trigger asChild>
        <div className="cursor-pointer">
          <AnimeCardDisplay anime={anime} />
        </div>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="right"
          align="start"
          sideOffset={16}
          className="z-50 data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
        >
          <AnimePreview anime={anime} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

function slugify(s?: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}