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
  type: 'movies' | 'series' | 'anime' | string;
  release_date: string;
  runtime?: string;
  quality?: number[];
  years?: number[];
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
