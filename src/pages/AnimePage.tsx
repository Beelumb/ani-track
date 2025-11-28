import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { updateAnimeStatus, getAnimeStatus } from "../lib/api";
import type { Anime } from "../types/animeTypes";
import type { Genre } from "../types/animeTypes";
import {
  StudioIcon,
  TypeIcon,
  SeasonIcon,
  HashtagIcon,
  RatingIcon,
  StatusIcon,
  StarIcon
} from "../icons/icons";
import { InfoRow } from "../components/InfoRow";
import { StatusSelector } from "../components/StatusSelector";

type JikanResponse<T> = { data: T };

export default function AnimePage() {
  const { animeID } = useParams<{ animeID: string; slug?: string }>();
  const [updating, setUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState("");

  

   const { data, error, isLoading } = useQuery({
    queryKey: ["animeDetails", animeID],
    queryFn: () => fetchAnimeDetails(animeID!),
  });

  // 2. Fetch User's Specific Status for this Anime
  const { data: userStatusData } = useQuery({
    queryKey: ["animeStatus", animeID],
    queryFn: () => getAnimeStatus(animeID!), 
    enabled: !!animeID, // Only run if we have an ID
    retry: false, // Don't retry if user is not logged in (401)
  });

  useEffect(() => {
    if (userStatusData) {
      setLocalStatus(userStatusData.status); // Assuming API returns { status: 'watching' }
    }
  }, [userStatusData]);
  
const handleStatusChange = async (newStatus: string) => {
    if (!data?.data) return;
    setUpdating(true);
    // Optimistically update local state
    setLocalStatus(newStatus); 
    
    try {
      await updateAnimeStatus(data.data, newStatus);
      // Note: You might want to use a Toast component instead of alert
      // alert("List updated!"); 
    } catch (err) {
      alert("Please login first");
      setLocalStatus(""); // Revert on error
    } finally {
      setUpdating(false);
    }
  };

 

  if (error) {
    return <div>Error loading anime details: </div>;
  }

  console.log(data);

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {data && (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-16">
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className=" flex items-center px-16 md:px-48 lg:px-0">
              <img
                src={data.data.images.webp.image_url}
                width={150}
                height={225}
                className=" rounded opacity-100 transition! size-full object-cover"
                alt=""
              />
            </div>
         <div className="mt-4 w-full">
              <StatusSelector 
                // Pass localStatus if you have it, otherwise you might need to fetch the user's current list status from Supabase
                currentStatus={localStatus} 
                isLoading={updating}
                onChange={handleStatusChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-12 lg:col-span-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                <div>
                  <h2 className="scroll-m-20 font-display text-2xl font-bold tracking-normal first:mt-0">
                    {data.data.title}{" "}
                    <span className="font-normal">({data.data.year})</span>
                  </h2>
                  <p className="wrap-break-word text-muted-foreground text-sm"></p>
                </div>
                <div className="bg-secondary/20 flex items-center gap-1 rounded-md border border-border px-2 backdrop-blur">
                  <span className=" text-xl font-bold"> {data.data.score}</span>
                 <StarIcon />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {data.data.genres?.map((g: Genre) => (
                    <span
                      key={g.mal_id ?? g.name}
                      className="inline-block rounded-full px-2 py-1 text-xs font-medium bg-secondary/20 border border-border text-white"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <section className="flex flex-col gap-8">
              <div className="flex items-center gap-2">
                <h3 className="scroll-m-20 font-display text-lg font-bold tracking-normal">
                  Description
                </h3>
              </div>
              <div className="relative transition-all duration-300 ease-in-out">
                <p className="wrap-break-word mb-4">{data.data.synopsis}</p>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-12 lg:col-span-1">
            <div className="relative flex-col gap-4 rounded-lg border border-border p-4 bg-secondary/20 backdrop-blur  lg:flex">
              <InfoRow
                icon={<TypeIcon />}
                label="Type"
                value={data.data.type}
              />

              <InfoRow
                icon={<StatusIcon />}
                label="Status"
                value={data.data.status}
              />

              <div className="h-px bg-border"></div>

              <InfoRow
                icon={<HashtagIcon />}
                label="Episodes"
                value={data.data.episodes}
              />

              <InfoRow
                icon={<SeasonIcon />}
                label="Season"
                value={data.data.season}
              />

              <div className="h-px bg-border"></div>

              <InfoRow
                icon={<RatingIcon />}
                label="Rating"
                value={data.data.rating}
              />

              <InfoRow
                icon={<StudioIcon />}
                label="Studio"
                value={data.data.studios[0].name}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const fetchAnimeDetails = async (
  animeID: string
): Promise<JikanResponse<Anime>> => {
  const response = await fetch(`https://api.jikan.moe/v4/anime/${animeID}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return (await response.json()) as JikanResponse<Anime>;
};
