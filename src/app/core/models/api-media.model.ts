// src/app/core/models/api-media.model.ts

export interface ApiImages {
  poster: string;
  backdrop: string;
  logo: string;
}

export interface ApiMedia {
  _id: string | number;
  title: string;
  overview: string;
  slug: string;
  images: ApiImages;
  trailer?: string;
  rating?: string;
  community_rating?: string;
  vote_count?: string | number;
  type: 'movies' | 'series' | 'anime' | string;
  release_date: string;
  runtime?: string;
  quality?: number[];
  years?: number[];
  original_title?: string;
  tagline?: string;
}

export interface ApiMediaResponse {
  error: boolean;
  message: string;
  data: {
    posts: ApiMedia[];
    pagination?: {
      current_page: number;
      last_page: number;
      total?: number;
    }
  };
}

export interface ApiEmbed {
  url: string;
  server: string | null;
  lang: string;
  quality: string;
  size: string | null;
  subtitle: number;
  format: string | null;
  resolution: string | null;
}

export interface ApiDownload {
  url: string;
  server: string | null;
  lang: string;
  quality: string;
  size: string | null;
  subtitle: number;
  format: string | null;
  resolution: string | null;
}

export interface ApiPlayerResponse {
  error: boolean;
  message: string;
  data: {
    embeds: ApiEmbed[];
    downloads: ApiDownload[]; // It could be empty if they require specific payload
  };
}

export interface ApiRelatedResponse {
  error: boolean;
  message: string;
  data: {
    posts: ApiMedia[];
  };
}

export interface ApiCast {
  term_id: number;
  term_name: string;
  term_slug: string;
  object_id: number;
  meta?: {
    popularity?: string;
    profile_path?: string;
    order?: number;
    character?: string;
  };
  dep?: string; // e.g. director
}

export interface ApiCastResponse {
  error: boolean;
  message: string;
  data: ApiCast[];
}

// ---- TV SOWS & EPISODES ----

export interface ApiEpisode {
  _id: number | string;
  title: string;
  date: string;
  slug: string;
  type: string;
  episode_type: string;
  overview: string;
  runtime: string;
  show_id: string;
  still_path: string;
  vote_average: string;
  vote_count: string;
  season_number: number | string;
  episode_number: number | string;
}

export interface ApiEpisodeResponse {
  error: boolean;
  message: string;
  data: {
    posts: ApiEpisode[];
    seasons: string[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      next_page_url: string | null;
      prev_page_url: string | null;
    }
  };
}
