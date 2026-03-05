import { queryOptions } from "@tanstack/react-query";
import type { AnimeApiResponse } from "../types/animeTypes";


export default function getAnimeOngoings() {
  return queryOptions({
    queryKey: ["animeOngoings"],
    queryFn: getAimeOngoings,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

const getAimeOngoings = async (): Promise<AnimeApiResponse> => {
  const response = await fetch(
    "https://api.jikan.moe/v4/anime?status=airing&type=tv&limit=8&page=8"
    // "https://api.jikan.moe/v4/anime?status=airing&type=tv&limit=8&page=8"
    // https://api.jikan.moe/v4/seasons/now?filter=tv&limit=8&page=1
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ongoing anime: ${response.status}`);
  }
  
  return await response.json();
};
