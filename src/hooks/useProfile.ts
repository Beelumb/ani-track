import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface Profile {
  username: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery<Profile | null>({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    },
    enabled: !!user, // Only run query if user is logged in
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1,
  });
}
