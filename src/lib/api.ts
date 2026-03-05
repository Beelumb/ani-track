import { supabase } from "./supabase";

export const updateAnimeStatus = async (
  anime: any, // Pass the full Jikan Anime object here
  status: string,
  score?: number
) => {
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in");

  const formattedStatus = status.toLowerCase().replace(/\s+/g, "_");

  const payload = {
    user_id: user.id,
    mal_id: anime.mal_id,
    title: anime.title,
    image_url: anime.images.webp.image_url,
    status: formattedStatus,
    score: score || 0,
    
    // 1. SAVE TYPE (TV, Movie, etc)
    type: anime.type, 

    // 2. SAVE TOTAL EPISODES
    // Jikan calls it 'episodes', we save it as 'episodes_total'
    episodes_total: anime.episodes || 0, 

    // 3. HANDLE WATCHED COUNT
    // If completed, set watched to total. Otherwise keep existing or 0.
    episodes_watched: formattedStatus === 'completed' ? (anime.episodes || 0) : 0,
    
    updated_at: new Date().toISOString(),
  };

  // 3. Update first. This works even when the DB table is missing a unique
  // constraint for (user_id, mal_id), which upsert requires.
  const { data: updatedRows, error: updateError } = await supabase
    .from("user_anime_list")
    .update(payload)
    .eq("user_id", user.id)
    .eq("mal_id", anime.mal_id)
    .select("mal_id")
    .limit(1);

  if (updateError) throw updateError;

  if ((updatedRows?.length ?? 0) > 0) {
    return;
  }

  // 4. Insert if no existing row was updated.
  const { error: insertError } = await supabase
    .from("user_anime_list")
    .insert(payload);

  if (insertError) throw insertError;
};

export const getAnimeStatus = async (animeId: string) => {
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // If not logged in, they can't have a status
  if (!user) return null;

  // 2. Fetch status using the user.id
  const { data, error } = await supabase
    .from('user_anime_list')
    .select('status')
    .eq('mal_id', animeId)
    .eq('user_id', user.id) 
    .maybeSingle(); // maybeSingle returns null if not found, instead of throwing an error

  if (error) {
    console.error("Error fetching status:", error);
    return null;
  }
  
  return data; // returns { status: "watching" } or null
};