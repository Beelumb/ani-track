import { queryOptions } from "@tanstack/react-query";
import type { AnimeApiResponse } from "../types/animeTypes";


export default function getAnimeOngoings() {
  return queryOptions({
    queryKey: ["animeOngoings"],
    queryFn: getAimeOngoings,
  });
}

const getAimeOngoings = async (): Promise<AnimeApiResponse> => {
  const response = await fetch(
    "https://api.jikan.moe/v4/anime?status=airing&type=tv&limit=8&page=8"
  );
  
  return await response.json();
};
