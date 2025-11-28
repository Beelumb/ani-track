// A minimal type for the pagination data
type Pagination = {
  has_next_page: boolean;
  current_page: number;
  last_visible_page: number;
};

// The final type for the entire API response object
export type AnimeApiResponse = {
  data: Anime[]; // This tells TypeScript to expect an array of our Anime type
  pagination: Pagination;
};

// Now, we create the main Anime type
export type Anime = {
  mal_id: number;
  title: string;
  title_english: string | null;
  synopsis: string;
  images: AnimeImages;
  score: number;
  episodes: number | null;
  status: string;
  type: string;
  genres: Genre[];
  year: number;
  season: string;
  rating: string;
  studios: Studio[]
};

export type  AnimeQueryArgs = {
  page: number;
  status: string | null;
  type: string | null;
  q: string | null;
  genres: string | null; // IDs comma separated
  rating: string | null;
  orderBy: string | null;
}

export type UserAnime = {
  mal_id: number;
  user_id: string;
  title: string;
  image_url: string;
  status: string;
  score: number;
  // These match the columns we added to Supabase
  episodes_watched: number; 
  episodes_total: number;
  type: string; // "TV", "Movie", etc.
  created_at?: string;
  updated_at?: string;
};

type AnimeImages = {
  jpg: {
    image_url: string;
  };
  webp: {
    image_url: string;
  };
};

export type Genre = {
  mal_id: number;
  name: string;
  count: number;
};

export type GenresResponse = {
  data: Genre[];
}

export type Studio = {
  name: string;
};

// type AnimeStatus = "watching" | "completed" | "plan_to_watch" | "dropped" | "on_hold" | "";
