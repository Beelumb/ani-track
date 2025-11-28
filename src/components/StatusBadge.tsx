import { type JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnimeStatus } from "../lib/api";

const statusConfig: Record<string, { icon: JSX.Element; color: string; bgColor: string; borderColor: string }> = {
  plan_to_watch: {
    color: "text-announced-foreground",
    bgColor: "bg-announced-background",
    borderColor: "border-announced-border",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    ),
  },
  watching: {
    color: "text-ongoing-foreground",
    bgColor: "bg-ongoing-background",
    borderColor: "border-ongoing-border",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
        <path fill="currentColor" d="M9.5 15.575v-7.15q0-.3.263-.45t.512.025l5.575 3.575q.225.15.225.425t-.225.425L10.275 16q-.25.175-.513.025t-.262-.45ZM3 18.3V20q0 .425-.288.713T2 21q-.425 0-.713-.288T1 20v-4q0-.425.288-.713T2 15h4q.425 0 .713.288T7 16q0 .425-.288.713T6 17H4.55q1.275 1.875 3.238 2.938T12 21q2.6 0 4.75-1.35t3.3-3.625q.225-.425.588-.675t.837-.15q.45.1.587.512t-.087.888q-1.35 2.9-4.025 4.65T12 23q-2.7 0-5.062-1.238T3 18.3ZM2.075 11q-.425 0-.688-.313T1.2 9.95q.25-1.175.65-2.162T2.925 5.8q.25-.375.65-.425t.725.275q.35.35.35.763t-.275.837q-.425.65-.675 1.3t-.45 1.425q-.1.45-.413.738T2.075 11ZM11 2.05q0 .475-.288.775t-.762.4q-.75.175-1.387.45t-1.288.7q-.4.275-.813.25T5.7 4.25q-.3-.3-.263-.688t.388-.662q.975-.65 1.938-1.062T9.9 1.2q.45-.075.775.175T11 2.05Zm7.35 2.2q-.35.35-.775.363t-.825-.263q-.65-.425-1.3-.675t-1.425-.45q-.45-.1-.738-.412T13 2.05q0-.425.313-.675t.737-.175q1.2.225 2.175.625T18.2 2.9q.35.25.4.65t-.25.7Zm3.6 6.75q-.475 0-.775-.288t-.4-.762q-.2-.775-.462-1.412t-.688-1.313q-.275-.4-.25-.812t.375-.763q.3-.3.688-.25t.662.4q.675 1 1.075 1.975T22.8 9.95q.075.425-.175.738T21.95 11Z"></path>
      </svg>
    ),
  },
  completed: {
    color: "text-finished-foreground",
    bgColor: "bg-finished-background",
    borderColor: "border-finished-border",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
  },
  dropped: {
    color: "text-discontinued-foreground",
    bgColor: "bg-discontinued-background",
    borderColor: "border-discontinued-border",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    ),
  },
};

// Default Icon (Plus) when not in list

export default function StatusBadge({ animeId }: { animeId: number }) {
  // Fetch status for this specific card
  const { data: statusData, isLoading } = useQuery({
    queryKey: ["animeStatus", animeId],
    queryFn: () => getAnimeStatus(String(animeId)),
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins to prevent spamming API on re-renders
  });

  // Handle click to prevent navigating to the anime page
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Logic to open a quick-add modal could go here in the future
    console.log("Quick add/edit for", animeId);
  };

  if (isLoading) return null; // Or a small spinner

  const status = statusData?.status;
  const config = status ? statusConfig[status] : null;

  if (!config) return null;
  
  // Visual classes based on state
  const containerClasses = config
    ? `${config.bgColor} ${config.borderColor} ${config.color} border` // Active Status Style
    : "bg-black/60 hover:bg-black/80 text-white border-transparent"; // Default "Add" Style
    
    

  return (
    <button
      onClick={handleClick}
      className={`absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-lg backdrop-blur-sm transition-all duration-200 ${containerClasses}`}
      title={status ? `Current status: ${status}` : "Add to list"}
    >
      {config.icon}
    </button>
  );
}